import OpenAI from "openai";

import type { ToolArgs } from "../utils/types";
import { listFilesTool } from "./tools/list-files";
import { readFileTool } from "./tools/read-file";

const openai = new OpenAI({
  apiKey: process.env.DEEPINFRA_TOKEN,
  baseURL: "https://api.deepinfra.com/v1/openai",
});

const ToolsRegistry = {
  read_file: readFileTool,
  list_files: listFilesTool,
};
type ToolName = keyof typeof ToolsRegistry;

async function calltool(toolname: ToolName, args: ToolArgs) {
  const tool = ToolsRegistry[toolname];
  if (!tool) {
    throw new Error(`Tool ${toolname} not found in registry`);
  }

  return await tool.execute(args);
}

// to avoid sending ToolsRegistry along with execute
// function, we only send the tool definiations to the LLM
function getToolDefinitions() {
  return Object.values(ToolsRegistry).map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

async function askLLM(message: OpenAI.ChatCompletionMessageParam[]) {
  const response = await openai.chat.completions.create({
    model: "deepseek-ai/DeepSeek-V4-Flash",
    messages: message,
    tools: getToolDefinitions(),
    tool_choice: "auto",
  });
  const responseMessage = response.choices[0]?.message;
  if (!responseMessage) {
    throw new Error("No response message from LLM");
  }
  return responseMessage;
}

async function main() {
  const message: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content:
        "list the files in directory /Users/puang/code-agent/ also can you tell me the content of the file /Users/puang/code-agent/src/index.ts - answer in short btw",
    },
  ];
  console.log(`[USER] \n${message[0]?.content} \n`);

  while (true) {
    const responseMessage = await askLLM(message);
    message.push(responseMessage);

    // no further tool calls
    if (!responseMessage.tool_calls?.length) {
      console.log("\n[DEEPSEEK] \n" + responseMessage.content);
      break;
    }

    // execute tool calls
    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall.type !== "function") {
        throw new Error(`Unexpected tool call type: ${toolCall.type}`);
      }

      const toolName = toolCall.function.name as ToolName;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      console.log(`---- calling tool: ${toolName} ----`);

      const toolResponse = await calltool(toolName, toolArgs);
      message.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResponse,
      });
    }
  }
}

main();

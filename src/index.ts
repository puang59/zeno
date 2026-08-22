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
    console.error(`tool ${toolname} not found!`);
    return;
  }

  const result = await tool.execute(args);
  console.log(result);
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

async function main() {
  const message: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content:
        "list the files in directory /Users/puang/code-agent/ also can you tell me the content of the file /Users/puang/code-agent/src/index.ts",
    },
  ];

  const response = await openai.chat.completions.create({
    model: "deepseek-ai/DeepSeek-V4-Flash",
    messages: message,
    tools: getToolDefinitions(),
    tool_choice: "auto",
  });
  // console.log(response.choices[0]?.message?.content);
  // console.dir(response.choices[0]?.message, { depth: null });

  const responseMessage = response.choices[0]?.message;
  if (!responseMessage) {
    throw new Error("No response message from LLM");
  }

  // extracting tool calls from the response message
  if (responseMessage.tool_calls) {
    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall.type !== "function") {
        throw new Error(`Unexpected tool call type: ${toolCall.type}`);
      }

      const toolName = toolCall.function.name as ToolName;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      await calltool(toolName, toolArgs);
    }
  }
}

main();

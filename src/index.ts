import OpenAI from "openai";
import pc from "picocolors";
import cliMD from "cli-markdown";
import { z } from "zod";

import { listFilesTool } from "./tools/filesystem/list-files";
import { readFileTool } from "./tools/filesystem/read-file";
import { searchFilesTool } from "./tools/filesystem/search-files";
import { fileExistsTool } from "./tools/filesystem/file-exists";
import { getFileInfoTool } from "./tools/filesystem/get-file-info";
import { writeFileTool } from "./tools/filesystem/write-file";
import { deleteFileTool } from "./tools/filesystem/delete-file";

const openai = new OpenAI({
  apiKey: process.env.DEEPINFRA_TOKEN,
  baseURL: "https://api.deepinfra.com/v1/openai",
});

const ToolsRegistry = {
  // read-only
  read_file: readFileTool,
  list_files: listFilesTool,
  search_files: searchFilesTool,
  file_exists: fileExistsTool,
  get_file_info: getFileInfoTool,

  // write-only
  write_file: writeFileTool,
  delete_file: deleteFileTool,
};
type ToolName = keyof typeof ToolsRegistry;

async function calltool(toolname: ToolName, args: unknown) {
  const tool = ToolsRegistry[toolname];
  if (!tool) {
    throw new Error(`Tool ${toolname} not found in registry`);
  }

  const parsedArgs = tool.inputSchema.parse(args);

  return await (tool.execute as (args: unknown) => Promise<string>)(parsedArgs);
}

// to avoid sending ToolsRegistry along with execute
// function, we only send the tool definiations to the LLM
function getToolDefinitions() {
  return Object.values(ToolsRegistry).map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: z.toJSONSchema(tool.inputSchema),
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
  const args = process.argv.slice(2);
  const prompt = args.join(" ");
  if (!prompt) {
    console.error("Please provide a prompt as a command line argument.");
    process.exit(1);
  }

  const message: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: prompt,
    },
  ];
  console.log(
    `${pc.bgBlue(pc.black(pc.bold("[USER]")))} \n${message[0]?.content}\n`,
  );

  while (true) {
    const responseMessage = await askLLM(message);

    message.push(responseMessage);

    // no further tool calls
    if (!responseMessage.tool_calls?.length) {
      console.log(
        `\n${pc.bgYellow(pc.black(pc.bold("[ZENO]")))}` +
          cliMD(responseMessage.content ?? ""),
      );
      break;
    }

    // execute tool calls
    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall.type !== "function") {
        throw new Error(`Unexpected tool call type: ${toolCall.type}`);
      }

      const toolName = toolCall.function.name as ToolName;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      console.log(`${pc.dim(`---- calling tool: ${pc.bold(toolName)} ----`)}`);

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

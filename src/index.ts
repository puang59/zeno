import OpenAI from "openai";
import pc from "picocolors";
import cliMD from "cli-markdown";
import { z } from "zod";

import { listFilesTool } from "./tools/filesystem/read/list-files";
import { readFileTool } from "./tools/filesystem/read/read-file";
import { searchFilesTool } from "./tools/filesystem/read/search-files";
import { fileExistsTool } from "./tools/filesystem/read/file-exists";
import { getFileInfoTool } from "./tools/filesystem/read/get-file-info";
import { writeFileTool } from "./tools/filesystem/write/write-file";
import { deleteFileTool } from "./tools/filesystem/write/delete-file";
import { moveFileTool } from "./tools/filesystem/write/move-file";
import { createDirectoryTool } from "./tools/filesystem/write/create-directory";
import { getCurrentDirectoryTool } from "./tools/filesystem/read/get-current-directory";
import { gitStatusTool } from "./tools/git/git-status";

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
  get_current_directory: getCurrentDirectoryTool,

  // write-only
  write_file: writeFileTool,
  delete_file: deleteFileTool,
  move_file: moveFileTool,
  create_directory: createDirectoryTool,

  // git
  git_status: gitStatusTool,
};
type ToolName = keyof typeof ToolsRegistry;

async function calltool(toolname: ToolName, args: unknown) {
  const tool = ToolsRegistry[toolname];
  if (!tool) {
    throw new Error(`Tool ${toolname} not found in registry`);
  }

  // so that zeno doesnt die if the tool fails, we catch the error and return it as a string
  try {
    const parsedArgs = tool.inputSchema.parse(args);
    return await (tool.execute as (args: unknown) => Promise<string>)(
      parsedArgs,
    );
  } catch (error) {
    if (error instanceof Error) {
      return `Tool "${toolname}" failed: ${error.message}`;
    }

    return `Tool "${toolname}" failed with an unknown error.`;
  }
}

// to avoid sending ToolsRegistry along with execute
// function, we only send the tool defininitions to the LLM
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
      role: "system",
      content: `
You are Zeno, a terminal-native coding agent.

You have access to tools that let you inspect and modify the user's local codebase.

Use tools whenever the user's question requires information about the current
filesystem, Git repository, source code, project configuration, or environment.

Do not assume information about the current codebase from your own knowledge.
Inspect the codebase when necessary.

When the user asks about changes, additions, modifications, or the current state
of the project, use the appropriate tools to investigate before answering.

If you are unsure whether information is available in the current project,
prefer inspecting the project with tools rather than saying you cannot know.

You may call multiple tools when necessary to answer a question accurately.
`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];
  console.log(`${pc.bgBlue(pc.black(pc.bold("[USER]")))} \n${prompt}\n`);

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

      if (
        toolName === "read_file" ||
        toolName === "write_file" ||
        toolName === "delete_file" ||
        toolName === "move_file" ||
        toolName === "get_file_info"
      ) {
        console.log(
          `${pc.dim(`---- calling tool: ${pc.bold(toolName)} [${toolArgs.filePath}] ----`)}`,
        );
      } else if (toolName === "list_files" || toolName === "search_files") {
        console.log(
          `${pc.dim(`---- calling tool: ${pc.bold(toolName)} [${toolArgs.directoryPath}] ----`)}`,
        );
      } else {
        console.log(
          `${pc.dim(`---- calling tool: ${pc.bold(toolName)} ----`)}`,
        );
      }

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

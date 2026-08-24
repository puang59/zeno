import { promisify } from "node:util";
import { execFile } from "node:child_process";
import type { Tool } from "../../../utils/types";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const gitBlameToolSchema = z.object({
  filePath: z
    .string()
    .describe("The path to the file for which to retrieve blame information."),
  startLine: z
    .number()
    .optional()
    .describe(
      "The starting line number for the blame information. If not provided, blame information for the entire file will be retrieved.",
    ),
  endLine: z
    .number()
    .optional()
    .describe(
      "The ending line number for the blame information. If not provided, blame information for the entire file will be retrieved.",
    ),
});

export const gitBlameTool: Tool<typeof gitBlameToolSchema> = {
  name: "git_blame",
  description:
    "Shows which commit and author last modified each line of a file. Use this when the user wants to know who changed specific lines or which commit introduced a change.",
  inputSchema: gitBlameToolSchema,

  async execute(args): Promise<string> {
    try {
      const gitArgs = ["blame"];

      if (args.startLine !== undefined && args.endLine !== undefined) {
        gitArgs.push("-L", `${args.startLine},${args.endLine}`);
      }

      gitArgs.push(args.filePath);

      const { stdout } = await execFileAsync("git", gitArgs);

      return (
        stdout.trim() ||
        `No blame information found for the specified file: ${args.filePath}.`
      );
    } catch (error) {
      if (error instanceof Error) {
        return `Error executing git blame for file ${args.filePath}: ${error.message}`;
      }
      return `An unknown error occurred while executing git blame for file ${args.filePath}.`;
    }
  },
};

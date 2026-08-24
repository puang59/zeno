import type { Tool } from "../../../utils/types";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const gitDiffToolSchema = z.object({
  staged: z
    .boolean()
    .optional()
    .describe(
      "Whether to show staged changes instead of unstaged changes. Defaults to false.",
    ),

  filePath: z
    .string()
    .describe(
      "The path of the file to show the diff for. If not provided, the diff for all files will be shown.",
    ),
});

export const gitDiffFileTool: Tool<typeof gitDiffToolSchema> = {
  name: "git_diff_file",
  description:
    "Shows the changes currently made in the working tree for a specific file that have not been staged. Use this when the user asks what changed in a specific file or wants to inspect current modifications for that file.",

  inputSchema: gitDiffToolSchema,
  async execute(args): Promise<string> {
    try {
      const gitArgs = args.staged
        ? ["diff", "--cached", args.filePath]
        : ["diff", args.filePath];
      const { stdout } = await execFileAsync("git", gitArgs);

      return (
        stdout.trim() ||
        `No differences found and no unstaged changes found for file: ${args.filePath}.`
      );
    } catch (error) {
      if (error instanceof Error) {
        return `Error executing git diff for file ${args.filePath}: ${error.message}`;
      }
      return `An unknown error occurred while executing git diff for file ${args.filePath}.`;
    }
  },
};

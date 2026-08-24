import type { Tool } from "../../../utils/types";
import { promisify } from "util";
import { execFile } from "child_process";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const gitDiffToolSchema = z.object({
  staged: z
    .boolean()
    .optional()
    .describe(
      "Whether to show staged changes instead of unstaged changes. Defaults to false.",
    ),
});

export const gitDiffTool: Tool<typeof gitDiffToolSchema> = {
  name: "git_diff",
  description:
    "Shows the changes currently made in the working tree that have not been staged. Use this when the user asks what changed in the code or wants to inspect current modifications.",

  inputSchema: gitDiffToolSchema,
  async execute(args): Promise<string> {
    try {
      const gitArgs = args.staged ? ["diff", "--cached"] : ["diff"];
      const { stdout } = await execFileAsync("git", gitArgs);

      return (
        stdout.trim() || "No differences found and no unstaged changes found."
      );
    } catch (error) {
      if (error instanceof Error) {
        return `Error executing git diff: ${error.message}`;
      }
      return "An unknown error occurred while executing git diff.";
    }
  },
};

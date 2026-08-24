import { promisify } from "node:util";
import { execFile } from "node:child_process";
import type { Tool } from "../../../utils/types";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const gitBranchToolSchema = z.object({
  all: z
    .boolean()
    .optional()
    .describe(
      "Whether to list all branches, including remote branches. Defaults to false.",
    ),
});

export const gitBranchTool: Tool<typeof gitBranchToolSchema> = {
  name: "git_branch",
  description:
    "Lists local Git branches and indicates the current branch. Use this when the user asks what branches exist or which branch is currently checked out.",

  inputSchema: gitBranchToolSchema,

  async execute(args): Promise<string> {
    try {
      const gitArgs = args.all ? ["branch", "-a"] : ["branch"];
      const { stdout } = await execFileAsync("git", gitArgs);

      return stdout.trim() || "No branches found in the repository.";
    } catch (error) {
      if (error instanceof Error) {
        return `Error executing git branch: ${error.message}`;
      }
      return "An unknown error occurred while executing git branch.";
    }
  },
};

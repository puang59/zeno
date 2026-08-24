import type { Tool } from "../../../utils/types";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const gitShowToolSchema = z.object({
  commitHash: z
    .string()
    .optional()
    .describe(
      "The hash of the commit to show details for. If not provided, the latest commit will be shown.",
    ),
});

export const gitShowTool: Tool<typeof gitShowToolSchema> = {
  name: "git_show",
  description:
    "Shows detailed information about a specific Git commit, including the commit message, author, date, and changes made. Use this when the user asks for details about a specific commit or wants to inspect a particular change.",
  inputSchema: gitShowToolSchema,

  async execute(args): Promise<string> {
    try {
      const gitArgs = args.commitHash
        ? ["show", "--stat", "--patch", args.commitHash]
        : ["show"];
      const { stdout } = await execFileAsync("git", gitArgs);

      return (
        stdout.trim() || "No details found for the specified commit  hash."
      );
    } catch (error) {
      if (error instanceof Error) {
        return `Error executing git show for commit ${args.commitHash}: ${error.message}`;
      }
      return `An unknown error occurred while executing git show for commit ${args.commitHash}.`;
    }
  },
};

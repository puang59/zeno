import type { Tool } from "../../../utils/types";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const gitLogToolSchema = z.object({
  maxEntries: z
    .number()
    .optional()
    .describe("The maximum number of log entries to retrieve. Defaults to 10."),
});

export const gitLogTool: Tool<typeof gitLogToolSchema> = {
  name: "git_log",
  description:
    "Retrieves the Git commit history, including commit hashes, authors, dates, and messages. Use this when the user asks for the commit history or wants to see recent changes.",

  inputSchema: gitLogToolSchema,

  async execute(args): Promise<string> {
    try {
      const maxEntries = args.maxEntries ?? 10;
      const { stdout } = await execFileAsync("git", [
        "log",
        `-n ${maxEntries}`,
        "--pretty=format:%h - %an, %ar : %s",
      ]);

      return stdout.trim() || "No commits found in the repository.";
    } catch (error) {
      if (error instanceof Error) {
        return `Error executing git log: ${error.message}`;
      }
      return "An unknown error occurred while executing git log.";
    }
  },
};

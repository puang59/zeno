import { promisify } from "node:util";
import type { Tool } from "../../../utils/types";
import { z } from "zod";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);

const gitStatusSchema = z.object({});

export const gitStatusTool: Tool<typeof gitStatusSchema> = {
  name: "git_status",
  description:
    "Gets the current Git working tree status, including modified, added, deleted, and untracked files.",

  inputSchema: gitStatusSchema,

  async execute(): Promise<string> {
    try {
      const { stdout } = await execFileAsync("git", ["status", "--short"]);

      return stdout.trim() || "No changes in the working tree.";
    } catch (error) {
      if (error instanceof Error) {
        return `Error executing git status: ${error.message}`;
      }
      return "An unknown error occurred while executing git status.";
    }
  },
};

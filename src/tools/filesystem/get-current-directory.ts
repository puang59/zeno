import type { Tool } from "../../../utils/types";
import { cwd } from "node:process";
import { z } from "zod";

const getCurrentDirectorySchema = z.object({});

export const getCurrentDirectoryTool: Tool<typeof getCurrentDirectorySchema> = {
  name: "get_current_directory",
  description: "Returns the current working directory of the process.",

  inputSchema: getCurrentDirectorySchema,
  async execute(): Promise<string> {
    return cwd();
  },
};

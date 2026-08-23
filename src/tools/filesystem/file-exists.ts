import type { Tool } from "../../../utils/types";
import { z } from "zod";

const fileExistsSchema = z.object({
  filePath: z.string().describe("The path to the file to check for existence."),
});

export const fileExistsTool: Tool<typeof fileExistsSchema> = {
  name: "file_exists",
  description:
    "Checks whether a file or directory exists at the specified path.",

  inputSchema: fileExistsSchema,

  async execute(args): Promise<string> {
    if (!args.filePath) {
      throw new Error("filePath argument is required.");
    }

    try {
      const fs = require("fs").promises;
      await fs.stat(args.filePath);
      return "true";
    } catch (error) {
      return "false";
    }
  },
};

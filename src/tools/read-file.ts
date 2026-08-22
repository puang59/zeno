import type { Tool } from "../../utils/types";

export const readFileTool: Tool = {
  name: "read_file",
  description: "Reads the content of a file and returns it as a string.",

  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "The path to the file to be read.",
      },
    },
    required: ["filePath"],
  },

  async execute(args): Promise<string> {
    if (!args.filePath) {
      throw new Error("filePath argument is required.");
    }

    const { filePath } = args;

    const fs = require("fs").promises;
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read file at ${filePath}: ${error.message}`);
      } else {
        throw new Error(`Failed to read file at ${filePath}: Unknown error`);
      }
    }
  },
};

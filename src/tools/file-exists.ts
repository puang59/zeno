import type { Tool } from "../../utils/types";

export const fileExistsTool: Tool = {
  name: "file_exists",
  description:
    "Checks whether a file or directory exists at the specified path.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "The path to the file to check for existence.",
      },
    },
    required: ["filePath"],
  },
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

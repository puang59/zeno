import type { Tool } from "../../utils/types";

export const listFilesTool: Tool = {
  name: "list_files",
  description:
    "Lists all files in a specified directory and returns their names as a string.",

  inputSchema: {
    type: "object",
    properties: {
      directoryPath: {
        type: "string",
        description: "The path to the directory whose files are to be listed.",
      },
    },
    required: ["directoryPath"],
  },

  async execute(args): Promise<string> {
    if (!args.directoryPath) {
      throw new Error("directoryPath argument is required.");
    }

    const { directoryPath } = args;
    const fs = require("fs").promises;

    try {
      const files = await fs.readdir(directoryPath);
      return files.join("\n");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to list files in directory ${directoryPath}: ${error.message}`,
        );
      } else {
        throw new Error(
          `Failed to list files in directory ${directoryPath}: Unknown error`,
        );
      }
    }
  },
};

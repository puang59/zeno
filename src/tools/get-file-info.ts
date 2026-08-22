import type { Tool } from "../../utils/types";

export const getFileInfoTool: Tool = {
  name: "get_file_info",
  description:
    "Retrieves information about a file, including its size, creation date, and last modified date.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "The path to the file to retrieve information about.",
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
      const stats = await fs.stat(args.filePath);
      const fileInfo = {
        type: stats.isFile()
          ? "file"
          : stats.isDirectory()
            ? "directory"
            : "other",
        path: args.filePath,
        size: stats.size,
        creationDate: stats.birthtime,
        lastModifiedDate: stats.mtime,
      };
      return JSON.stringify(fileInfo);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to retrieve file info for ${args.filePath}: ${error.message}`,
        );
      } else {
        throw new Error(
          `Failed to retrieve file info for ${args.filePath}: Unknown error`,
        );
      }
    }
  },
};

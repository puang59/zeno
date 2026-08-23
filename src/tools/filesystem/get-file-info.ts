import { z } from "zod";
import type { Tool } from "../../../utils/types";

const getFileInfoSchema = z.object({
  filePath: z
    .string()
    .describe("The path to the file to retrieve information about."),
});

export const getFileInfoTool: Tool<typeof getFileInfoSchema> = {
  name: "get_file_info",
  description:
    "Retrieves information about a file, including its size, creation date, and last modified date.",

  inputSchema: getFileInfoSchema,

  async execute(args): Promise<string> {
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

import { z } from "zod";
import type { Tool } from "../../../utils/types";

const listFilesSchema = z.object({
  directoryPath: z
    .string()
    .describe("The path to the directory whose files are to be listed."),
});

export const listFilesTool: Tool<typeof listFilesSchema> = {
  name: "list_files",
  description:
    "Lists all files in a specified directory and returns their names as a string.",

  inputSchema: listFilesSchema,

  async execute(args): Promise<string> {
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

import type { Tool } from "../../../../utils/types";
import { writeFile } from "node:fs/promises";
import { z } from "zod";

const writeFileSchema = z.object({
  filePath: z.string().describe("The path to the file to be written."),
  content: z.string().describe("The content to write to the file."),
});

export const writeFileTool: Tool<typeof writeFileSchema> = {
  name: "write_file",
  description:
    "Writes content to a specified file, creating the file if it does not exist.",

  inputSchema: writeFileSchema,

  async execute(args): Promise<string> {
    const { filePath, content } = args;

    try {
      await writeFile(filePath, content, "utf-8");
      return `Successfully wrote to file at ${filePath}.`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to write to file at ${filePath}: ${error.message}`,
        );
      } else {
        throw new Error(
          `Failed to write to file at ${filePath}: Unknown error`,
        );
      }
    }
  },
};

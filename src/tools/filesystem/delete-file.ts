import type { Tool } from "../../../utils/types";
import deleteFile from "node:fs/promises";
import { z } from "zod";

const deleteFileSchema = z.object({
  filePath: z.string().describe("The path to the file to be deleted."),
});

export const deleteFileTool: Tool<typeof deleteFileSchema> = {
  name: "delete_file",
  description: "Deletes a specified file from the filesystem.",

  inputSchema: deleteFileSchema,

  async execute(args): Promise<string> {
    const { filePath } = args;

    try {
      await deleteFile.unlink(filePath);
      return `Successfully deleted file at ${filePath}.`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to delete file at ${filePath}: ${error.message}`,
        );
      } else {
        throw new Error(`Failed to delete file at ${filePath}: Unknown error`);
      }
    }
  },
};

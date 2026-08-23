import type { Tool } from "../../../../utils/types";
import { rename } from "node:fs/promises";
import { z } from "zod";

const moveFileSchema = z.object({
  sourcePath: z.string().describe("The path to the file to be moved."),
  destinationPath: z.string().describe("The new path for the file."),
});
export const moveFileTool: Tool<typeof moveFileSchema> = {
  name: "move_file",
  description: "Moves a file from a source path to a destination path.",

  inputSchema: moveFileSchema,

  async execute(args): Promise<string> {
    const { sourcePath, destinationPath } = args;

    try {
      await rename(sourcePath, destinationPath);
      return `Successfully moved file from ${sourcePath} to ${destinationPath}.`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to move file from ${sourcePath} to ${destinationPath}: ${error.message}`,
        );
      } else {
        throw new Error(
          `Failed to move file from ${sourcePath} to ${destinationPath}: Unknown error`,
        );
      }
    }
  },
};

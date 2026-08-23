import type { Tool } from "../../../../utils/types";
import { mkdir } from "node:fs/promises";
import { z } from "zod";

const createDirectorySchema = z.object({
  directoryPath: z
    .string()
    .describe("The path where the new directory should be created."),
});

export const createDirectoryTool: Tool<typeof createDirectorySchema> = {
  name: "create_directory",
  description: "Creates a new directory at the specified path.",

  inputSchema: createDirectorySchema,

  async execute(args): Promise<string> {
    const { directoryPath } = args;

    try {
      await mkdir(directoryPath, { recursive: true });
      return `Successfully created directory at ${directoryPath}.`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to create directory at ${directoryPath}: ${error.message}`,
        );
      } else {
        throw new Error(
          `Failed to create directory at ${directoryPath}: Unknown error`,
        );
      }
    }
  },
};

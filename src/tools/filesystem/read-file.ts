import { z } from "zod";
import type { Tool } from "../../../utils/types";

const readFileSchema = z.object({
  filePath: z.string().describe("The path to the file to be read."),
});

export const readFileTool: Tool<typeof readFileSchema> = {
  name: "read_file",
  description: "Reads the content of a file and returns it as a string.",

  inputSchema: readFileSchema,

  async execute(args): Promise<string> {
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

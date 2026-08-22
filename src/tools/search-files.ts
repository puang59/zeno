import type { Tool } from "../../utils/types";
import { IGNORED_DIRECTORIES } from "../../utils/consts";
import { z } from "zod";

const searchFilesSchema = z.object({
  directoryPath: z
    .string()
    .describe("The path to the directory to search for files."),
  query: z.string().describe("The search query to filter files (optional)."),
});

export const searchFilesTool: Tool<typeof searchFilesSchema> = {
  name: "search_files",
  description:
    "Searches for files in a specified directory and returns a list of matching file paths based on the provided query.",

  inputSchema: searchFilesSchema,

  async execute(args): Promise<string> {
    if (!args.directoryPath) {
      throw new Error("directoryPath or query argument is required.");
    }
    if (!args.query) {
      throw new Error("query argument is required.");
    }

    const result: string[] = [];
    async function searchDirectory(directory: string) {
      const fs = require("fs").promises;
      const entries = await fs.readdir(directory, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          continue;
        }

        const fullPath = require("path").join(directory, entry.name);
        if (entry.isDirectory()) {
          await searchDirectory(fullPath);
          continue;
        }

        if (!entry.isFile()) {
          continue;
        }

        try {
          const content = await Bun.file(fullPath).text();
          const lines = content.split("\n");

          lines.forEach((line, index) => {
            if (line.includes(args.query!)) {
              result.push(`${fullPath}:${index + 1}: ${line}`);
            }
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error(
              `Failed to read file at ${fullPath}: ${error.message}`,
            );
          } else {
            console.error(`Failed to read file at ${fullPath}: Unknown error`);
          }
        }
      }
    }

    await searchDirectory(args.directoryPath);
    if (result.length > 0) return result.join("\n");

    return `No files found in directory ${args.directoryPath} containing the query "${args.query}".`;
  },
};

import type { z } from "zod";

export type Tool<TArgs extends z.ZodType> = {
  name: string;
  description: string;
  inputSchema: TArgs; // for LLM
  execute: (args: z.infer<TArgs>) => Promise<string>; // for program
};

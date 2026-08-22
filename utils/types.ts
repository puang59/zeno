export type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>; // for LLM
  execute: (args: ToolArgs) => Promise<string>; // for program
};

export type ToolArgs = {
  filePath?: string;
  directoryPath?: string;
};

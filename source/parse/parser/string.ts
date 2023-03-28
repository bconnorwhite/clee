import enquirer from "enquirer";
import { ParserOptions } from "./index.js";

/**
 * Pass through function that returns the input value.
 */
export function parseString(string: string | undefined): string | undefined {
  return string === undefined ? undefined : string;
}

/**
 * Prompt for a string if one is not provided.
 */
export async function promptString(string: string, options: ParserOptions): Promise<string | undefined> {
  if(string !== undefined) {
    return parseString(string);
  } else {
    const { input } = await enquirer.prompt<{ input: string; }>({ type: "input", name: "input", message: `${options.name}` });
    return input;
  }
}

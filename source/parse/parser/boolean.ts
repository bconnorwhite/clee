import enquirer from "enquirer";
import { readBoolean } from "read-boolean";
import { ParserOptions } from "./index.js";

/**
 * Parse a boolean from a string.
 * True values include:
 * ```
 * "true", "t", "yes", "y", "1"
 * ```
 * False values include:
 * ```
 * "false", "f", "no", "n", "0"
 * ```
 * Other values will throw an error.
 */
export function parseBoolean(string: string | undefined): boolean | undefined {
  const parsed = readBoolean(string, { extended: true });
  if(parsed !== undefined) {
    return parsed;
  } else {
    return undefined;
  }
}

/**
 * Prompt the user for a boolean if one is not provided.
 */
export async function promptBoolean(string: string | undefined, options: ParserOptions): Promise<boolean | undefined> {
  if(string !== undefined) {
    return parseBoolean(string);
  } else {
    const { input } = await enquirer.prompt<{ input: boolean; }>({ type: "toggle", name: "input", message: `${options.name}` });
    return input;
  }
}

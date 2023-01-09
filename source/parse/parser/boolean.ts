import enquirer from "enquirer";
import { ParserOptions } from "./index.js";

/**
 * Parse a boolean from a string.
 * True values include:
 * ```
 * true, "true", "t", "yes", "y", "1"
 * ```
 * False values include:
 * ```
 * false, "false", "f", "no", "n", "0"
 * ```
 * Other values will throw an error.
 */
export function parseBoolean(string: string | undefined): boolean | undefined {
  if(string === undefined) {
    return undefined;
  } else if(["true", "t", "yes", "y", "1"].includes(string.toLowerCase())) {
    return true;
  } else if(["false", "f", "no", "n", "0"].includes(string.toLowerCase())) {
    return false;
  } else {
    throw new Error("Unable to parse boolean.");
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

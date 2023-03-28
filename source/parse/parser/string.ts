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

/**
 * Parse a comma-separated list of strings.
 * If the input contains quotes, all commas within the quotes are preserved.
 * If the input starts and ends with a matching pair of quotes, the quotes are removed.
 */
export function parseCSV(string: string | undefined): string[] | undefined {
  if(string !== undefined) {
    const columns = [{ string: "", quotes: 0 }];
    string.split("").forEach((char) => {
      const last = columns[columns.length - 1] as typeof columns[number];
      const inQuotes = last.quotes % 2 === 1;
      if(char === "," && inQuotes === false) {
        // Add a new column
        columns.push({ string: "", quotes: 0 });
      } else {
        if(char === '"' && last?.string.endsWith("\\") === false) {
          last.quotes += 1;
        }
        last.string += char;
      }
    });
    return columns.map((column) => {
      // Strip quotes if the entire column is quoted
      if(column.string.startsWith('"') && column.string.endsWith('"') && column.quotes === 2) {
        return column.string.substring(1, column.string.length - 1);
      } else {
        return column.string;
      }
    });
  } else {
    return undefined;
  }
}

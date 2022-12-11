import { resolve, relative, parse, ParsedPath } from "node:path";
import { Dirent } from "node:fs";
import fs from "node:fs/promises";

/**
 * A function to parse argument values from an input string.
 */
export type Parser<V> = (...values: string[]) => V;

/**
 * An object that is parsable as an argument.
 */
export type Parsable<V=unknown> = {
  parser: Parser<V>;
};

/**
 * Pass through function that returns the input value.
 */
export function parseString(string: string): string {
  return string;
}

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
export function parseBoolean(input: string): boolean {
  if(["true", "t", "yes", "y", "1"].includes(input.toLowerCase())) {
    return true;
  } else if(["false", "f", "no", "n", "0"].includes(input.toLowerCase())) {
    return false;
  } else {
    throw new Error("Unable to parse boolean.");
  }
}

/**
 * Parse a number from a string.
 */
export function parseNumber(string: string): number {
  const number = Number(string);
  if(Number.isNaN(number)) {
    throw new Error("Unable to parse number.");
  } else {
    return number;
  }
}

/**
 * Parse an integer from a string.
 */
export function parseInt(string: string): number {
  const int = Number.parseInt(string);
  if(Number.isNaN(int)) {
    throw new Error("Unable to parse integer.");
  } else {
    return int;
  }
}

/**
 * Parse a float from a string.
 */
export function parseFloat(string: string): number {
  const float = Number.parseFloat(string);
  if(Number.isNaN(float)) {
    throw new Error("Unable to parse float.");
  } else {
    return float;
  }
}

/**
 * Parse a JSON value from a string.
 */
export function parseJSON(string: string): number {
  try {
    return JSON.parse(string);
  } catch(e) {
    throw new Error("Unable to parse JSON.");
  }
}

/**
 * Parse a date from a string.
 * Valid input formats include inputs that are valid for `new Date()`, or a Unix timestamp:
 * ```
 * Date:      "2023-01-01"
 * Timestamp: "2023-01-01T00:00:00.000Z"
 * Unix:      "1640995200000"
 * ```
 */
export function parseDate(string: string): Date {
  const date = !isNaN(Number(string)) ? new Date(Number(string)) : new Date(string);
  if(Number.isNaN(date.getTime())) {
    throw new Error("Unable to parse Date.");
  } else {
    return date;
  }
}

/**
 * Parse a URL from a string.
 * Valid input formats include any valid input to `new URL()`.
 */
export function parseURL(string: string): URL {
  try {
    return new URL(string);
  } catch(e) {
    throw new Error("Unable to parse URL.");
  }
}

export type Path = {
  [K in "absolute" | "relative" | keyof ParsedPath]: K extends keyof ParsedPath ? ParsedPath[K] : string;
};

/**
 * Parse a path from a string.
 * Valid input formats include:
 * ```
 * Absolute:  "/home/user/file.txt"
 * Relative:  "file.txt"
 * File URL:  "file:///home/user/file.txt"
 * ```
 */
export function parsePath(string: string): Path {
  const body = string.startsWith("file://") ? string.substring(7) : string;
  const absolute = resolve(body);
  return {
    absolute,
    relative: relative(process.cwd(), absolute),
    ...parse(absolute)
  };
}

/**
 * Parse a file from a path name.
 */
export function parseFile(path: string): Promise<Buffer> {
  const { absolute } = parsePath(path);
  return fs.readFile(absolute);
}

/**
 * Parse a directory's entries from a directory path.
 */
export function parseDirectory(path: string): Promise<Dirent[]> {
  const { absolute } = parsePath(path);
  return fs.readdir(absolute, { withFileTypes: true });
}

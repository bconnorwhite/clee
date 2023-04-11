import { resolve, relative, parse, ParsedPath } from "node:path";
import { Dirent } from "node:fs";
import fs from "node:fs/promises";
import { parseCSV } from "./string.js";

export type ParserOptions = {
  name: string;
  description?: string;
  variadic: boolean;
  required: boolean;
};

/**
 * A function to parse argument values from an input string.
 */
export type Parser<V> =
  | ((value: string | undefined) => V | undefined)
  | ((value: string | undefined, options: ParserOptions) => V | undefined);

/**
 * An object that is parsable as an argument.
 */
export type Parsable<V=unknown> = {
  parser: Parser<V>;
};

export { parseString, promptString, parseCSV } from "./string.js";
export { parseBoolean, promptBoolean } from "./boolean.js";
export { parseNumber, promptNumber, parseInt, promptInt, parseFloat, promptFloat } from "./number.js";

/**
 * Parse a JSON value from a string.
 */
export function parseJSON(string: string | undefined): string | undefined {
  if(string !== undefined) {
    try {
      return JSON.parse(string);
    } catch(e) {
      throw new Error("Unable to parse JSON.");
    }
  } else {
    return undefined;
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
export function parseDate(string: string | undefined): Date | undefined {
  if(string !== undefined) {
    const date = !isNaN(Number(string)) ? new Date(Number(string)) : new Date(string);
    if(Number.isNaN(date.getTime())) {
      throw new Error("Unable to parse Date.");
    } else {
      return date;
    }
  } else {
    return undefined;
  }
}

/**
 * Parse a URL from a string.
 * Valid input formats include any valid input to `new URL()`.
 */
export function parseURL(string: string | undefined): URL | undefined {
  if(string !== undefined) {
    try {
      return new URL(string);
    } catch(e) {
      throw new Error("Unable to parse URL.");
    }
  } else {
    return undefined;
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
export function parsePath(string: string | undefined): Path | undefined {
  if(string !== undefined) {
    const body = string.startsWith("file://") ? string.substring(7) : string;
    const absolute = resolve(body);
    return {
      absolute,
      relative: relative(process.cwd(), absolute),
      ...parse(absolute)
    };
  } else {
    return undefined;
  }
}

/**
 * Parse a list of paths from a CSV string.
 */
export function parsePathCSV(string: string | undefined): Path[] | undefined {
  if(string !== undefined) {
    const csv = parseCSV(string);
    return csv?.map((value) => parsePath(value)).filter((value): value is Path => value !== undefined);
  } else {
    return undefined;
  }
}

/**
 * Parse a file from a path name.
 */
export function parseFile(path: string | undefined): Promise<Buffer | undefined> {
  const parsedPath = parsePath(path);
  if(parsedPath?.absolute) {
    return fs.readFile(parsedPath.absolute);
  } else {
    return Promise.resolve(undefined);
  }
}

/**
 * Parse a directory's entries from a directory path.
 */
export function parseDirectory(path: string | undefined): Promise<Dirent[] | undefined> {
  const parsedPath = parsePath(path);
  if(parsedPath !== undefined) {
    return fs.readdir(parsedPath.absolute, { withFileTypes: true });
  } else {
    return Promise.resolve(undefined);
  }
}

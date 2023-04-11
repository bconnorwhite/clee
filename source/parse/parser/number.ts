import enquirer from "enquirer";
import { ParserOptions } from "./index.js";

// Returns true if value matches Int, Float or Dollars.
export function isNumeric(value: string): boolean {
  try {
    parseDollars(value);
    return true;
  } catch(e) {
    return false;
  }
}

/**
 * Parse a number from a string.
 */
export function parseNumber(string: string | undefined): number | undefined {
  if(string === undefined) {
    return undefined;
  } else {
    const number = Number(string);
    if(Number.isNaN(number)) {
      throw new Error("Unable to parse number.");
    } else {
      return number;
    }
  }
}

/**
 * Prompt for a number if one is not provided.
 */
export async function promptNumber(string: string | undefined, options: ParserOptions): Promise<number | undefined> {
  if(string !== undefined) {
    return parseNumber(string);
  } else {
    const { input } = await enquirer.prompt<{ input: number; }>({ type: "numeral", name: "input", message: `${options.name}` });
    return input;
  }
}

function validateInt(number: number): number {
  if(Number.isNaN(number)) {
    throw new Error("Unable to parse integer.");
  } else {
    return number;
  }
}

/**
 * Parse an integer from a string.
 */
export function parseInt(string: string | undefined): number | undefined {
  if(string === undefined) {
    return undefined;
  } else {
    const int = Number.parseInt(string);
    return validateInt(int);
  }
}

/**
 * Prompt for an integer if one is not provided.
 */
export async function promptInt(string: string | undefined, options: ParserOptions): Promise<number | undefined> {
  if(string !== undefined) {
    return parseInt(string);
  } else {
    const { input } = await enquirer.prompt<{ input: number; }>({ type: "numeral", name: "input", message: `${options.name}` });
    return validateInt(input);
  }
}

function validateFloat(number: number): number {
  if(Number.isNaN(number)) {
    throw new Error("Unable to parse float.");
  } else {
    return number;
  }
}

/**
 * Parse a float from a string.
 */
export function parseFloat(string: string | undefined): number | undefined {
  if(string === undefined) {
    return undefined;
  } else {
    const float = Number.parseFloat(string);
    return validateFloat(float);
  }
}

/**
 * Prompt for a float if one is not provided.
 */
export async function promptFloat(string: string | undefined, options: ParserOptions): Promise<number | undefined> {
  if(string !== undefined) {
    return parseFloat(string);
  } else {
    const { input } = await enquirer.prompt<{ input: number; }>({ type: "numeral", name: "input", message: `${options.name}` });
    return validateFloat(input);
  }
}

function validateDollars(number: number): number {
  if(Number.isNaN(number)) {
    throw new Error("Unable to parse dollar amount.");
  } else {
    return number;
  }
}

/**
 * Parse a dollar amount from a string.
 */
export function parseDollars(string: string | undefined): number | undefined {
  if(string === undefined) {
    return undefined;
  } else {
    const dollars = Number.parseFloat(string.replace(/[$,]/g, ""));
    return validateDollars(dollars);
  }
}

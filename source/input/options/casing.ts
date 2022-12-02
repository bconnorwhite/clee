import { CamelCase } from "type-fest";
import { LongFlag, getLongFlagName } from "../../parse/flags.js";

// Casing

export function toCamelCase<T extends string>(string: T): CamelCase<T> {
  return string.replace(/[-_]/g, " ").trim().replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if((/\s/).test(match)) {
      // If the match is whitespace, replace with an empty string
      return "";
    } else {
      // Otherwise, convert the first match to lowercase and the rest to uppercase
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    }
  }) as CamelCase<T>;
}

// Long Flags

export type LongFlagToCamelCase<L extends LongFlag> = L extends `--${infer F}` ? CamelCase<F> : never;

export function longFlagToCamelCase<L extends LongFlag>(longFlag: L): LongFlagToCamelCase<L> {
  return toCamelCase(getLongFlagName(longFlag)) as LongFlagToCamelCase<L>;
}


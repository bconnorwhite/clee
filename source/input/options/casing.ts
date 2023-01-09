import { CamelCase, KebabCase, toCamelCase } from "typed-case";
import { LongFlag, getLongFlagName } from "../../parse/flags.js";

// Long Flags

export type LongFlagToCamelCase<L extends LongFlag> = L extends `--${infer F}` ? CamelCase<F> : never;

export type CamelCaseToLongFlag<S extends string> = `--${KebabCase<S>}`;

export function longFlagToCamelCase<L extends LongFlag>(longFlag: L): LongFlagToCamelCase<L> {
  return toCamelCase(getLongFlagName(longFlag)) as LongFlagToCamelCase<L>;
}


import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Arguments } from "./input/index.js";
import { Options } from "./input/options/index.js";
import { isShortFlag } from "./parse/flags.js";
import { ShortFlag, LongFlag } from "./parse/index.js";

/**
 * Returns true if a cwd flag is present in the arguments.
 */
export function getCWD<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  properties: CommandProperties<N, A, O, R, S>,
  args: readonly string[]
): string | undefined {
  const cwdFlags = [properties.cwd?.shortFlag, properties.cwd?.longFlag].filter((flag) => flag !== undefined) as string[];
  const index = args.findIndex((flag) => flag !== undefined && cwdFlags.includes(flag));
  if(index >= 0) {
    return args[index + 1];
  } else {
    return undefined;
  }
}

export function getCWDFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  properties: CommandProperties<N, A, O, R, S>
) {
  function cwdFn(): Command<N, A, O, R, S>;
  function cwdFn(shortFlag: ShortFlag, longFlag?: LongFlag, description?: string): Command<N, A, O, R, S>;
  function cwdFn(longFlag: LongFlag, description?: string): Command<N, A, O, R, S>;
  function cwdFn(a?: ShortFlag | LongFlag, b?: LongFlag | string, c?: string) {
    if(a === undefined) {
      return getCommand({
        ...properties,
        cwd: undefined
      });
    } else {
      const shortFlag = isShortFlag(a) ? a : undefined;
      const longFlag = isShortFlag(a) ? b as LongFlag : a;
      const description = isShortFlag(a) ? c : b as string | undefined;
      return getCommand({
        ...properties,
        cwd: {
          shortFlag,
          longFlag,
          description
        }
      });
    }
  }
  return cwdFn;
}

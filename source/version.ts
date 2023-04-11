import path from "node:path";
import { getVersionSync } from "get-module-pkg";
import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Arguments } from "./input/index.js";
import { ShortFlag, LongFlag } from "./parse/index.js";
import { isShortFlag, isLongFlag } from "./parse/flags.js";
import { Options, OptionSkin } from "./input/options/index.js";

type AbsolutePath = `file://${string}` | `/${string}` | `${string}:\\${string}` | `\\${string}`;

export type UnsetVersionOption = Partial<OptionSkin>;

export type ExplicitVersionOption = UnsetVersionOption & {
  number: string;
};

export type RelativeVersionOption = UnsetVersionOption & {
  relativeTo: AbsolutePath;
};

export type VersionOption = ExplicitVersionOption | RelativeVersionOption | UnsetVersionOption;

function isExplicitVersionOption(version: VersionOption): version is ExplicitVersionOption {
  return (version as ExplicitVersionOption).number !== undefined;
}

function isRelativeVersionOption(version: VersionOption): version is RelativeVersionOption {
  return (version as RelativeVersionOption).relativeTo !== undefined;
}

export function isActiveVersionOption(version: VersionOption): version is ExplicitVersionOption | RelativeVersionOption {
  return Boolean((version.shortFlag || version.longFlag) && (isExplicitVersionOption(version) || isRelativeVersionOption(version)));
}

// Check if file path is absolute, on windows or mac.
function isAbsolutePath(string: string) {
  return string.startsWith("file://") || path.isAbsolute(string);
}

/**
 * Returns true if a help flag is present in the arguments.
 */
export function hasVersionFlag<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  properties: CommandProperties<N, A, O, R, S>,
  args: readonly string[]
): boolean {
  const versionFlags = [properties.version.shortFlag, properties.version.longFlag].filter((flag) => flag !== undefined);
  return versionFlags.some((flag) => flag !== undefined && args.includes(flag));
}

export function getVersion<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>): string | undefined {
  if(isExplicitVersionOption(properties.version)) {
    return properties.version.number;
  } else if(isRelativeVersionOption(properties.version)) {
    return getVersionSync(properties.version.relativeTo);
  } else {
    return undefined;
  }
}

export function getVersionFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  function versionFn(number: string, longFlag?: LongFlag, description?: string): Command<N, A, O, R, S>;
  function versionFn(number: string, shortFlag?: ShortFlag, longFlag?: LongFlag, description?: string): Command<N, A, O, R, S>;
  function versionFn(relativeTo: AbsolutePath, longFlag?: LongFlag, description?: string): Command<N, A, O, R, S>;
  function versionFn(relativeTo: AbsolutePath, shortFlag?: ShortFlag, longFlag?: LongFlag, description?: string): Command<N, A, O, R, S>;
  function versionFn(...args: (string | undefined)[]): Command<N, A, O, R, S> {
    const version = isAbsolutePath(args[0] as string) ? { relativeTo: args.shift() as AbsolutePath } : { number: args.shift() as string };
    return getCommand({
      ...properties,
      version: {
        ...version,
        shortFlag: args.length > 0 ? (isShortFlag(args[0]) || args[0] === undefined ? args.shift() as ShortFlag : properties.version.shortFlag) : properties.version.shortFlag,
        longFlag: args.length > 0 ? (isLongFlag(args[0]) || args[0] === undefined ? args.shift() as LongFlag : properties.version.longFlag) : properties.version.longFlag,
        description: args.length > 0 ? args.shift() : properties.version.description
      }
    });
  }
  return versionFn;
}

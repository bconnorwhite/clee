import path from "node:path";
import { getVersionSync } from "get-module-pkg";
import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";
import { ShortFlag, LongFlag } from "./parse/index.js";

// Check if file path is absolute, on windows or mac.
function isFilePath(string: string) {
  return string.startsWith("file://") || path.isAbsolute(string);
}

/**
 * Returns true if a help flag is present in the arguments.
 */
export function hasVersionFlag<N extends string, I extends Input, R, S extends Commands>(
  properties: CommandProperties<N, I, R, S>,
  args: readonly string[]
): boolean {
  const versionFlags = [properties.version.shortFlag, properties.version.longFlag].filter((flag) => flag !== undefined);
  return versionFlags.some((flag) => flag !== undefined && args.includes(flag));
}

export function getVersion<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>): string | undefined {
  if(properties.version.version && isFilePath(properties.version.version)) {
    return getVersionSync(properties.version.version);
  } else {
    return properties.version.version;
  }
}

export function getVersionFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  return (version: string, shortFlag?: ShortFlag, longFlag?: LongFlag, description?: string): Command<N, I, R, S> => {
    return getCommand({
      ...properties,
      version: {
        version,
        shortFlag: shortFlag ?? properties.version.shortFlag,
        longFlag: longFlag ?? properties.version.longFlag,
        description: description ?? properties.version.description
      }
    });
  };
}

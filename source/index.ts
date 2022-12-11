import { Command, getCommand } from "./command.js";
import { formatDefault } from "./format.js";

export default function clee<N extends string>(name: N): Command<N> {
  return getCommand({
    name,
    action: () => {},
    format: formatDefault,
    commands: undefined,
    arguments: [],
    options: undefined,
    help: {
      shortFlag: "-h",
      longFlag: "--help",
      description: "Display help for command"
    },
    version: {
      shortFlag: "-v",
      longFlag: "--version",
      description: "Display version"
    }
  });
}

export type {
  CommandName,
  CommandInput,
  CommandArguments,
  CommandOptions,
  CommandResult,
  CommandSubCommands
} from "./command";
export type { Option, Argument } from "./input";
export {
  parseString,
  parseStrings,
  parseBoolean,
  parseBooleans,
  parseNumber,
  parseNumbers,
  parseInt,
  parseInts,
  parseFloat,
  parseFloats,
  parseJSON,
  parseJSONs,
  parseDate,
  parseDates,
  parseURL,
  parseURLs,
  parsePath,
  parsePaths,
  parseFile,
  parseFiles,
  parseDirectory,
  parseDirectories
} from "./parse/index.js";
export {
  formatDefault,
  formatBuffer,
  formatJSON,
  formatJSONPretty,
  formatStringsToLines
} from "./format.js";
export { logger, log } from "./logger.js";
export type { LoggerOptions, Logger } from "./logger";

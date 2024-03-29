import { Command, getCommand } from "./command.js";
import { formatDefault } from "./format.js";

export default function clee<N extends string>(name: N): Command<N> {
  return getCommand({
    name,
    action: undefined,
    format: formatDefault,
    commands: undefined,
    arguments: [] as [],
    options: undefined,
    cwd: {
      shortFlag: undefined,
      longFlag: "--cwd",
      description: "A relative or absolute path to the working directory."
    },
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
  Command,
  CommandName,
  CommandInput,
  CommandArguments,
  CommandOptions,
  CommandResult,
  CommandSubCommands
} from "./command.js";

export type { Option, Argument } from "./input/index.js";

export {
  parseString,
  parseBoolean,
  parseNumber,
  parseInt,
  parseFloat,
  parseJSON,
  parseDate,
  parseURL,
  parsePath,
  parseFile,
  parseDirectory,
  parseCSV,
  parsePathCSV
} from "./parse/index.js";
export type { ParseResult, ParseError, ParseOutput, Path } from "./parse/index.js";

export {
  formatDefault,
  formatBuffer,
  formatJSON,
  formatJSONPretty,
  formatStringsToLines
} from "./format.js";

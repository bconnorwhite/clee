/* eslint-disable max-lines */
/* eslint-disable max-depth */
import { Arguments, Input, wrapParameter } from "../input/index.js";
import { Commands, CommandProperties, Command } from "../command.js";
import { Option, Options } from "../input/options/index.js";
import { Flag, isFlag, LongFlag, parseFlag, isCompoundFlag, getShortFlag, isLetter } from "./flags.js";
import { hasHelpFlag, getHelp } from "../help.js";
import { hasVersionFlag, getVersion, isActiveVersionOption } from "../version.js";
import { isDefined, mapAllSeries, reduceAllSeries } from "../utils/index.js";

/**
 * Program output in the case that the help or version flags are used.
 */
export type ParseOutput = {
  message: string | undefined;
};

export type ParseError = Error;

/**
 * If the command was run successfully, returns the resulting value.
 * If the command failed with an error, returns the error.
 * If the help or version flag was used, returns the help or version message.
 */
export type ParseResult = ParseOutput | ParseError;

export type ParseOptions = {
  /**
   * Silence output in the case that an error is thrown, or the help or version flags are used.
   */
  silent?: boolean;
};

export function getOptionEntries<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  return Object.entries<Option<LongFlag, unknown>>(properties.options ?? {});
}

function getOptionEntry<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(flag: Flag, properties: CommandProperties<N, A, O, R, S>) {
  return getOptionEntries(properties).find(([_, { shortFlag, longFlag }]) => {
    return longFlag === flag || shortFlag === flag;
  });
}

function collectArgs<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  input: readonly string[],
  properties: CommandProperties<N, A, O, R, S>
) {
  const args: string[] = [];
  const options: Record<string, string | string[]> = {};
  for(let index=0; index<input.length; index+=1) {
    const arg = input[index] as string;
    if(isFlag(arg)) {
      const flag = parseFlag(arg);
      if(isCompoundFlag(arg)) {
        let hasMatch = false;
        flag.name.split("").forEach((char) => {
          if(isLetter(char)) {
            const optionEntry = getOptionEntry(getShortFlag(char), properties);
            if(optionEntry !== undefined) {
              hasMatch = true;
              const [fieldName, option] = optionEntry;
              if(option.variadic) {
                if(options[fieldName] === undefined) {
                  options[fieldName] = [];
                }
                const array = options[fieldName] as string[];
                array.push(flag.body ?? "true");
              } else {
                options[fieldName] = "true";
              }
            }
          }
        });
        if(!hasMatch) {
          // Did not match any options, push as an argument instead.
          args.push(arg);
        }
      } else {
        const optionEntry = getOptionEntry(flag.staff, properties);
        if(optionEntry === undefined) {
          // Option does not exist, push as an argument instead.
          args.push(arg);
        } else {
          const [fieldName, option] = optionEntry;
          const array: string[] = [];
          if(flag.body !== undefined) {
            array.push(flag.body);
          } else {
            while(index < input.length-1 && input[index+1] !== undefined && !isFlag(input[index+1] as string) && (option.variadic || array.length === 0)) {
              array.push(input[index+1] as string);
              index+=1;
            }
            if(array.length === 0) {
              array.push("true");
            }
          }
          if(option.variadic) {
            if(options[fieldName] === undefined) {
              options[fieldName] = [];
            }
            options[fieldName] = (options[fieldName] as string[]).concat(array);
          } else {
            options[fieldName] = array[0] as string;
          }
        }
      }
    } else {
      // Args may be longer than the number of arguments defined in the command.
      args.push(arg);
    }
  }
  return {
    args,
    options
  };
}

async function parseArgs<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  input: readonly string[],
  properties: CommandProperties<N, A, O, R, S>
): Promise<Input<A, O, true>> {
  const { args, options } = collectArgs(input, properties);
  const parsedArgs = await mapAllSeries(properties.arguments, async (argument, index) => {
    const isLast: boolean = (index === properties.arguments.length-1);
    const isVariadic = isLast && argument.variadic;
    const rawValue = args.slice(index, isVariadic ? undefined : index + 1);
    const parserOptions = {
      name: argument.name,
      description: argument.description,
      variadic: argument.variadic,
      required: argument.required
    };
    const parsedValue = isVariadic ? (await mapAllSeries(rawValue, (item) => argument.parser(item, parserOptions))).filter(isDefined) : argument.parser(rawValue[0], parserOptions);
    if(parsedValue === undefined && argument.required) {
      throw new Error(`Argument "${wrapParameter(argument.name, true, argument.variadic)}" is required.`);
    } else {
      return parsedValue;
    }
  });
  const parsedOptions = await reduceAllSeries(getOptionEntries(properties), async (retval, [fieldName, option]) => {
    const rawValue = options[fieldName];
    const parserOptions = {
      name: option.name,
      description: option.description,
      variadic: option.variadic,
      required: option.required
    };
    if(Array.isArray(rawValue)) {
      retval[fieldName] = await mapAllSeries(rawValue, (item) => option.parser(item, parserOptions));
    } else {
      retval[fieldName] = await option.parser(rawValue, parserOptions);
    }
    if(retval[fieldName] === undefined && option.required) {
      throw new Error(`Option "${option.longFlag}" must specify a value.`);
    }
    return retval;
  }, {} as Record<string, unknown>);
  return [...parsedArgs, parsedOptions] as Input<A, O, true>;
}

/**
 * Generates the `.parse` function for a given Command.
 */
export function getParseFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  properties: CommandProperties<N, A, O, R, S>
) {
  async function parseFn<I extends readonly string[] | undefined>(input?: I, parseOptions?: ParseOptions): Promise<ParseResult> {
    const array = (input ?? process.argv.slice(2));
    const subcommand = array[0];
    if(subcommand && properties.commands?.[subcommand]) {
      // Run the subcommand
      return (properties.commands[subcommand] as Command).parse(array.slice(1));
    } else if(isActiveVersionOption(properties.version) && hasVersionFlag(properties, array)) {
      // Print the version message
      const version = getVersion(properties);
      if(version) {
        if(parseOptions?.silent !== true) {
          console.info(version);
        }
        return { message: version };
      } else {
        const error = new Error("Unknown version.");
        console.error(error);
        return error;
      }
    } else if(hasHelpFlag(properties, array) || properties.action === undefined) {
      // Print the help message
      const help = getHelp(properties);
      if(parseOptions?.silent !== true) {
        console.info(help);
      }
      return { message: help };
    } else {
      // Run the command
      try {
        // Parse
        const args = await parseArgs(array, properties);
        // Run the action
        const result = await Promise.resolve(properties.action(...args));
        if(result instanceof Error) {
          process.exitCode = 1;
        }
        // Format the result
        const string = properties.format(result, args[args.length-1] as O);
        if(string !== undefined) {
          console.info(string);
        }
        return { message: string };
      } catch(error) {
        if(error instanceof Error) {
          if(parseOptions?.silent !== true) {
            console.error(error);
          }
          return error;
        } else {
          throw error;
        }
      }
    }
  }
  return parseFn;
}

export * from "./parser/index.js";
export type { ShortFlag, LongFlag, Flag } from "./flags.js";

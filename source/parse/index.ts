/* eslint-disable max-depth */
import { Input, wrapParameter } from "../input/index.js";
import { Commands, CommandProperties, Command } from "../command.js";
import { Option, OptionsPropertyFromInput } from "../input/options/index.js";
import { toCamelCase } from "../input/options/casing.js";
import { Flag, isFlag, LongFlag, parseFlag, isCompoundFlag, getShortFlag, isLetter } from "./flags.js";
import { hasHelpFlag, getHelp } from "../help.js";
import { hasVersionFlag, getVersion, isActiveVersionOption } from "../version.js";

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

export function getOptionEntries<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  return Object.entries<Option<LongFlag, unknown>>(properties.options ?? {});
}

function getOptionEntry<N extends string, I extends Input, R, S extends Commands>(flag: Flag, properties: CommandProperties<N, I, R, S>) {
  return getOptionEntries(properties).find(([_, { shortFlag, longFlag }]) => {
    return longFlag === flag || shortFlag === flag;
  });
}

function collectArgs<N extends string, I extends Input, R, S extends Commands>(
  input: readonly string[],
  properties: CommandProperties<N, I, R, S>
) {
  const args: string[] = [];
  const options: Record<string, string | string[]> = {};
  for(let index=0; index<input.length; index+=1) {
    const arg = input[index] as string;
    if(isFlag(arg)) {
      const flag = parseFlag(arg);
      if(isCompoundFlag(arg)) {
        flag.name.split("").forEach((char) => {
          if(isLetter(char)) {
            const [fieldName, option] = getOptionEntry(getShortFlag(char), properties) ?? [toCamelCase(char), {}];
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
        });
      } else {
        const [fieldName, option] = getOptionEntry(flag.staff, properties) ?? [toCamelCase(flag.name), {}];
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

function parseArgs<N extends string, I extends Input, R, S extends Commands>(
  input: readonly string[],
  properties: CommandProperties<N, I, R, S>
): I {
  const { args, options } = collectArgs(input, properties);
  const parsedArgs = properties.arguments.map((argument, index) => {
    const isLast: boolean = (index === properties.arguments.length-1);
    const isVariadic = isLast && argument.variadic;
    const value = args.slice(index, isVariadic ? undefined : index + 1);
    if(value[0] !== undefined) {
      return isVariadic ? value.map((item) => argument.parser(item)) : argument.parser(value[0]);
    } else {
      if(argument.required) {
        throw new Error(`Argument "${wrapParameter(argument.name, true, argument.variadic)}" is required.`);
      }
      return undefined;
    }
  });
  const parsedOptions = getOptionEntries(properties).reduce((retval, [fieldName, option]) => {
    const value = options[fieldName];
    if(value !== undefined && (typeof value === "string" || value.length > 0)) {
      retval[fieldName] = Array.isArray(value) ? value.map((item) => option.parser(item)) : option.parser(value);
    } else if(option.required) {
      throw new Error(`Option "${option.longFlag}" must specify a value.`);
    }
    return retval;
  }, {} as Record<string, unknown>);
  return [...parsedArgs, parsedOptions] as I;
}

/**
 * Generates the `.parse` function for a given Command.
 */
export function getParseFn<N extends string, I extends Input, R, S extends Commands>(
  properties: CommandProperties<N, I, R, S>
) {
  async function parseFn<A extends readonly string[] | undefined>(input?: A, parseOptions?: ParseOptions): Promise<ParseResult> {
    const array = (input ?? process.argv.slice(2));
    const subcommand = array[0];
    if(subcommand && properties.commands?.[subcommand]) {
      return (properties.commands[subcommand] as Command).parse(array.slice(1));
    } else if(hasHelpFlag(properties, array)) {
      const help = getHelp(properties);
      if(parseOptions?.silent !== true) {
        console.info(help);
      }
      return { message: help };
    } else if(isActiveVersionOption(properties.version) && hasVersionFlag(properties, array)) {
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
    } else {
      try {
        const args = parseArgs(array, properties);
        const result = properties.action(...args as I);
        const string = await Promise.resolve(properties.format(result, args[args.length-1] as OptionsPropertyFromInput<I>));
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

export * from "./parser.js";
export type { ShortFlag, LongFlag, Flag } from "./flags.js";

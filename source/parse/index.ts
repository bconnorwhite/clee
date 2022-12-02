import { parseBoolean } from "../index.js";
import { Input } from "../input/index.js";
import { Commands, CommandProperties, Command } from "../command.js";
import { Option, OptionsPropertyFromInput } from "../input/options/index.js";
import { toCamelCase } from "../input/options/casing.js";
import { Flag, isFlag, LongFlag, isInverseFlag, parseFlag, isCompoundFlag, getShortFlag, isLetter } from "./flags.js";
import { hasHelpFlag, getHelp, wrapRequiredParameter } from "../help.js";
import { hasVersionFlag, getVersion } from "../version.js";

/**
 * Program output in the case that the help or version flags are used.
 */
type ParseOutput = {
  message: string | undefined;
};

type ParseError = Error;

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
  const options: Record<string, string[]> = {};
  for(let index=0; index<input.length; index+=1) {
    const arg = input[index] as string;
    if(isFlag(arg)) {
      const flag = parseFlag(arg);
      if(isCompoundFlag(arg)) {
        flag.name.split("").forEach((char) => {
          if(isLetter(char)) {
            const [fieldName] = getOptionEntry(getShortFlag(char), properties) ?? [toCamelCase(char), {}];
            if(options[fieldName] === undefined) {
              options[fieldName] = [];
            }
            const array = options[fieldName] as string[];
            array.push(flag.body ?? "true");
          }
        });
      } else {
        const [fieldName] = getOptionEntry(flag.staff, properties) ?? [toCamelCase(flag.name), {}];
        if(options[fieldName] === undefined) {
          options[fieldName] = [];
        }
        const array = options[fieldName] as string[];
        if(flag.body !== undefined) {
          array.push(flag.body);
        } else {
          // eslint-disable-next-line max-depth
          while(index < input.length-1 && input[index+1] !== undefined && !isFlag(input[index+1] as string)) {
            array.push(input[index+1] as string);
            index+=1;
          }
          // eslint-disable-next-line max-depth
          if(array.length === 0) {
            array.push("true");
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

function parseArgs<N extends string, I extends Input, R, S extends Commands>(
  input: readonly string[],
  properties: CommandProperties<N, I, R, S>
): I {
  const { args, options } = collectArgs(input, properties);
  const parsedArgs = properties.arguments.map((argument, index) => {
    const isLast: boolean = index === properties.arguments.length-1;
    const value = args.slice(index, isLast ? undefined : index + 1);
    if(value[0] !== undefined) {
      return argument.parser ? argument.parser(...value) : (isLast ? value : value[0]);
    } else {
      if(argument.required) {
        throw new Error(`Argument "${wrapRequiredParameter(argument.name)}" is required.`);
      }
      return undefined;
    }
  });
  const parsedOptions = getOptionEntries(properties).reduce((retval, [fieldName, option]) => {
    const array = options[fieldName];
    if(array !== undefined && array.length > 0) {
      if(option.parser === undefined) {
        // No parser, value should be returned as a boolean.
        const firstValue = array[0] as string;
        retval[fieldName] = isInverseFlag(option.longFlag) ? !parseBoolean(firstValue) : parseBoolean(firstValue);
      } else {
        // Parser exists, value should be returned as the result of the parser.
        retval[fieldName] = option.parser(...array);
      }
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
  return async <A extends readonly string[] | undefined>(input?: A, parseOptions?: ParseOptions): Promise<ParseResult> => {
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
    } else if(properties.version.version !== undefined && hasVersionFlag(properties, array)) {
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
  };
}

export * from "./parser.js";
export type { ShortFlag, LongFlag, Flag } from "./flags.js";

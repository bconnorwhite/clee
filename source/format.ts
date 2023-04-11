import { formatWithOptions } from "util";
import { JSONValue } from "types-json";
import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Arguments } from "./input/index.js";
import { Options } from "./input/options/index.js";

export type Formatter<R, O> = (result: Awaited<R>, options?: O) => string | undefined;

function silenceable<R, O>(formatter: Formatter<R, O>, option = "silent") {
  return function formatSilenceable(result: Awaited<R>, options?: O) {
    if(options && options[option as keyof O]) {
      return undefined;
    } else {
      return formatter(result, options);
    }
  };
}

/**
 * Formats a value as it would be formatted by `console.log`.
 */
export function formatDefault<R>(result: R) {
  if(typeof result === "string") {
    return result;
  } else if(result === undefined) {
    return undefined;
  } else if(result instanceof Error) {
    return result.message;
  } else {
    return formatWithOptions({ colors: true }, "%O", result);
  }
}

export function formatBuffer<R extends Buffer>(result: R) {
  return result.toString();
}

export function formatJSON<R extends JSONValue>(result: R) {
  return JSON.stringify(result);
}

export function formatJSONPretty<R extends JSONValue>(result: R) {
  return JSON.stringify(result, null, 2);
}

export function formatStringsToLines<R extends string[]>(result: R) {
  return result.join("\n");
}

/**
 * Generates a function for getting and setting a Command's formatter.
 */
export function getFormatFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  function formatFn<F extends Formatter<R, O> | undefined>(
    format?: F,
    silentFlag?: keyof O & string
  ): F extends undefined ? Formatter<R, O> : Command<N, A, O, R, S> {
    if(format === undefined) {
      return properties.format as F extends undefined ? Formatter<R, O> : Command<N, A, O, R, S>;
    } else {
      return getCommand<N, A, O, R, S>({
        ...properties,
        format: silentFlag ? silenceable(format, silentFlag) : format
      }) as F extends undefined ? Formatter<R, O> : Command<N, A, O, R, S>;
    }
  }
  return formatFn;
}

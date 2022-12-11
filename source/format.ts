import { formatWithOptions } from "util";
import { JSONValue } from "types-json";
import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input, OptionsPropertyFromInput } from "./input/index.js";
import { Options } from "./input/options/index.js";

type PromiseOrValue<T> = T | Promise<T>;

export type Formatter<R, O> = (result: R, options?: O) => PromiseOrValue<string | undefined>;

function silenceable<R, O>(formatter: Formatter<R, O>, option = "silent") {
  return async function formatSilenceable(result: R, options?: O) {
    if(options && (options as Options)[option]) {
      return undefined;
    } else {
      return formatter(result, options);
    }
  };
}

/**
 * Formats a value as it would be formatted by `console.log`.
 */
export async function formatDefault<R>(result: R) {
  const value = await Promise.resolve(result);
  if(typeof value === "string") {
    return value;
  } else if(value === undefined) {
    return undefined;
  } else {
    return formatWithOptions({ colors: true }, "%O", value);
  }
}

export async function formatBuffer<R extends PromiseOrValue<Buffer>>(result: R) {
  const value = await Promise.resolve(result);
  return value.toString();
}

export async function formatJSON<R extends PromiseOrValue<JSONValue>>(result: R) {
  const value = await Promise.resolve(result);
  return JSON.stringify(value);
}

export async function formatJSONPretty<R extends PromiseOrValue<JSONValue>>(result: R) {
  const value = await Promise.resolve(result);
  return JSON.stringify(value, null, 2);
}

export async function formatStringsToLines<R extends PromiseOrValue<string[]>>(result: R) {
  const value = await Promise.resolve(result);
  return value.join("\n");
}

/**
 * Generates a function for getting and setting a Command's formatter.
 */
export function getFormatFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  function formatFn<F extends Formatter<R, OptionsPropertyFromInput<I>> | undefined>(
    format?: F,
    silentFlag?: keyof OptionsPropertyFromInput<I> & string
  ): F extends undefined ? Formatter<R, OptionsPropertyFromInput<I>> : Command<N, I, R, S> {
    if(format === undefined) {
      return properties.format as F extends undefined ? Formatter<R, OptionsPropertyFromInput<I>> : Command<N, I, R, S>;
    } else {
      return getCommand<N, I, R, S>({
        ...properties,
        format: silentFlag ? silenceable(format, silentFlag) : format
      }) as F extends undefined ? Formatter<R, OptionsPropertyFromInput<I>> : Command<N, I, R, S>;
    }
  }
  return formatFn;
}

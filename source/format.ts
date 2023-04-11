import { formatWithOptions } from "util";
import { JSONValue } from "types-json";
import join from "join-newlines";
import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Arguments } from "./input/index.js";
import { Options } from "./input/options/index.js";
import { isNumeric } from "./parse/parser/number.js";

export type Formatter<R, O> = (result: Awaited<R>, options?: O) => any;

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

export function formatCapitalize<R extends string>(result: R) {
  return result
    .replaceAll("_", " ")
    .split(" ")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatTable<T extends Record<string, string>, R extends Array<Record<string, string>>>(result: R) {
  const headers = Array.from(result.reduce((acc, row) => {
    const columns = Object.keys(row);
    columns.forEach((column) => acc.add(column));
    return acc;
  }, new Set<string>()));
  const rows = result.map((row) => {
    return headers.map((header) => row[header] ?? "");
  });
  const widths = headers.map((header, index) => {
    return [header.length, ...rows.map((row) => row[index]?.length ?? 0)].reduce((acc, value) => Math.max(acc, value), 0);
  });
  const heading = headers.map((title, index) => {
    const capitalized = formatCapitalize(title);
    return capitalized.padEnd(widths[index] ?? capitalized.length);
  }).join(" ");
  const spacedRows = result.map((row) => {
    return headers.map((header, index) => {
      const value = row[header] ?? "";
      const width = widths[index] ?? value.length;
      if(isNumeric(value)) {
        return value.padStart(width);
      } else {
        return value.padEnd(width);
      }
    }).join(" ");
  });
  return join([heading, ...spacedRows]);
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

import { CommandProperties, getCommand, Command, Commands } from "../../command.js";
import { Action } from "../../action.js";
import { Formatter } from "../../format.js";
import { Parser, Parsable, ShortFlag, LongFlag, parseBoolean } from "../../parse/index.js";
import { Parameter, RequiredParameter, isParameter, isVariadic, isRequired, getParameterName, VariadicParameter } from "../index.js";
import { Arguments } from "../arguments.js";
import { LongFlagToCamelCase, CamelCaseToLongFlag, longFlagToCamelCase } from "./casing.js";
import { isShortFlag } from "../../parse/flags.js";
import { Defined } from "../../utils/index.js";

/**
 * The options portion of the input data.
 */
export type Options = object;

export type OptionSkin<L extends LongFlag = LongFlag> = {
  shortFlag: ShortFlag;
  longFlag: L;
  description?: string;
};

/**
 * The properties that define an option.
 */
export type Option<L extends LongFlag, V> = OptionSkin<L> & Parsable<V> & {
  required: boolean;
  variadic: boolean;
  name: string;
};

/**
 * Return a type a Command's `properties.options` field from a given Options type.
 */
export type OptionsProperty<O extends Options> = {
  [K in keyof O & string]: Option<CamelCaseToLongFlag<K>, O[K]>;
};

/**
 * Transform an Options property to an Options type.
 */
export type OptionsFromProperty<OP extends OptionsProperty<Options>> = {
  [K in keyof OP]: OP[K] extends Option<LongFlag, infer V> ? V : never;
};

/**
 * Returns an option's properties as a sub-field with a Record.
 * The sub-field is named as the camelcase transformation of the option's long flag, ex:
 * { fieldName: { longFlag: "--field-name", ... } }
 */
type OptionWithFieldName<L extends LongFlag, V> = {
   [FieldName in LongFlagToCamelCase<L>]: V;
 };

/**
 * Merge existing Options (A) with a new required Option (B).
 */
type MergeOptions<O extends Options | undefined, L extends LongFlag, V, Q extends boolean> = {
  [K in keyof (O extends undefined ? OptionWithFieldName<L, V> : O & OptionWithFieldName<L, V>)]: K extends keyof OptionWithFieldName<L, V>
    ? Q extends true
      ? Defined<OptionWithFieldName<L, V>[K]>
      : OptionWithFieldName<L, V>[K]
    : K extends keyof O ? O[K] : never;
};

function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === "function";
}

/**
 * Generates a function for creating a new option for a Command.
 */
export function getOptionFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  // Long Flag Only Signatures
  function optionFn<L extends LongFlag, V=boolean | undefined>(
    longFlag: L, parser?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, V, false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean | undefined>(
    longFlag: L, parameter: P, parser?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean | undefined>(
    longFlag: L, parameter: P, description: string | undefined, parser?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, V=boolean | undefined>(
    longFlag: L, description: string | undefined, parser?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, V, false>, R, S>;
  // Short Flag Signatures
  function optionFn<L extends LongFlag, V=boolean | undefined>(
    shortFlag: ShortFlag, longFlag: L, parser?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, V, false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean | undefined>(
    shortFlag: ShortFlag, longFlag: L, parameter: P, parser?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean | undefined>(
    shortFlag: ShortFlag, longFlag: L, parameter: P, description: string | undefined, parser?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, V=boolean | undefined>(
    shortFlag: ShortFlag, longFlag: L, description: string | undefined, parser?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, V, false>, R, S>;
  // Function Implementation
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean>(
    a: ShortFlag | L,
    b: L | P | string | undefined | Parser<V>,
    c?: P | string | undefined | Parser<V>,
    d?: string | undefined | Parser<V>,
    e?: Parser<V>
  ): Command<N, A, MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>, R, S> {
    const stack = [a, b, c, d, e];
    const shortFlag = (isShortFlag(stack[0]) ? stack.shift() : undefined) as ShortFlag | undefined;
    const longFlag = stack.shift() as L;
    const parameter = (isParameter(stack[0]) ? stack.shift() : undefined) as P | undefined;
    const description = (typeof stack[0] === "string" ? stack.shift() : undefined) as string | undefined;
    const parser = (isFunction(stack[0]) ? stack.shift() : parseBoolean) as Parser<V>;
    return getCommand<N, A, MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>, R, S>({
      ...properties,
      action: properties.action as unknown as Action<A, MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>, R>,
      format: properties.format as unknown as Formatter<
        R,
        MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>>,
      arguments: properties.arguments,
      options: {
        ...(properties.options ?? {}),
        [longFlagToCamelCase(longFlag)]: {
          shortFlag,
          longFlag,
          description,
          required: isRequired(parameter),
          variadic: isVariadic(parameter),
          name: parameter ? getParameterName(parameter) : undefined,
          parser
        }
      } as OptionsProperty<MergeOptions<O, L, P extends VariadicParameter ? Defined<V>[] | undefined : V, P extends RequiredParameter ? true : false>>,
      help: {
        shortFlag: properties.help.shortFlag === shortFlag ? undefined : properties.help.shortFlag,
        longFlag: properties.help.longFlag === longFlag ? undefined : properties.help.longFlag,
        description: properties.help.description
      },
      version: {
        ...properties.version,
        shortFlag: properties.version.shortFlag === shortFlag ? undefined : properties.version.shortFlag,
        longFlag: properties.version.longFlag === longFlag ? undefined : properties.version.longFlag,
        description: properties.version.description
      }
    });
  }
  return optionFn;
}

/**
 * Get or replace the options of a command.
 */
export function getOptionsFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  function getOptions<OP extends OptionsProperty<Options> | undefined = undefined>(
    options?: OP | undefined
  ): OP extends OptionsProperty<infer O2> ? Command<N, A, O2, R, S> : OptionsProperty<O> {
    if(options === undefined) {
      return properties.options as OP extends OptionsProperty<infer O2> ? Command<N, A, O2, R, S> : OptionsProperty<O>;
    } else {
      return getCommand<N, A, OptionsFromProperty<Defined<OP>>, R, S>({
        ...properties,
        action: properties.action as unknown as Action<A, OptionsFromProperty<Defined<OP>>, R>,
        format: properties.format as unknown as Formatter<R, OptionsFromProperty<Defined<OP>>>,
        arguments: properties.arguments,
        options: options as OptionsProperty<OptionsFromProperty<Defined<OP>>>
      }) as OP extends OptionsProperty<infer O2> ? Command<N, A, O2, R, S> : OptionsProperty<O>;
    }
  }
  return getOptions;
}

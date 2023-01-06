import { CommandProperties, getCommand, Command, Commands } from "../../command.js";
import { Action } from "../../action.js";
import { Formatter } from "../../format.js";
import { Parser, Parsable, ShortFlag, LongFlag, parseBoolean } from "../../parse/index.js";
import { Input, Parameter, RequiredParameter, isParameter, isVariadic, isRequired, getParameterName, VariadicParameter } from "../index.js";
import { ArgumentsFromInput, ArgumentsPropertyFromInput } from "../arguments.js";
import { LongFlagToCamelCase, CamelCaseToLongFlag, longFlagToCamelCase } from "./casing.js";
import { isShortFlag } from "../../parse/flags.js";

/**
 * The options portion of the input data.
 */
export type Options = Record<string, unknown>;

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
  name?: string;
};

/**
 * Extracts the Options from an Input type.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type OptionsFromInput<I extends Input> = I extends [...infer A, infer B]
  ? (B extends Options ? B : undefined)
  : undefined;

/**
 * Return a type a Command's `properties.options` field from a given Input type.
 */
export type OptionsPropertyFromInput<I extends Input> = I extends [...infer A, infer B]
  ? B extends Options ? { [K in keyof B & string]: Option<CamelCaseToLongFlag<K>, B[K]>; } : undefined
  : undefined;

/**
 * Transform an Options property to an Options Input type.
 */
export type OptionsInputFromProperty<O> = {
  [K in keyof O]: O[K] extends Option<LongFlag, infer V> ? V : never;
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
type MergeOptions<A extends Options | undefined, B extends Options, Q extends boolean> = {
  [K in keyof (A extends undefined ? B : A & B)]: K extends keyof B
    ? Q extends true ? B[K] : B[K] | undefined
    : K extends keyof A ? A[K] : never;
};

/**
 * Merge a new required option into the Input.
 */
type MergeOptionsToInput<I extends Input, L extends LongFlag, V, Q extends boolean> = [
  ...ArgumentsFromInput<I>, {
    [K in keyof MergeOptions<OptionsFromInput<I>, OptionWithFieldName<L, V>, Q>]: MergeOptions<OptionsFromInput<I>, OptionWithFieldName<L, V>, Q>[K];
  }
];

type ReplaceOptionsInInput<I extends Input, O> = I extends [...infer A, infer B]
  ? B extends Options ? [...A, O] : [...I, O]
  : [...I, O];

function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === "function";
}

/**
 * Generates a function for creating a new option for a Command.
 */
export function getOptionFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  // Long Flag Only Signatures
  function optionFn<L extends LongFlag, V=boolean>(
    longFlag: L, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean>(
    longFlag: L, parameter: P, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean>(
    longFlag: L, parameter: P, description: string | undefined, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, V=boolean>(
    longFlag: L, description: string | undefined, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, false>, R, S>;
  // Short Flag Signatures
  function optionFn<L extends LongFlag, V=boolean>(
    shortFlag: ShortFlag, longFlag: L, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean>(
    shortFlag: ShortFlag, longFlag: L, parameter: P, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean>(
    shortFlag: ShortFlag, longFlag: L, parameter: P, description: string | undefined, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, V=boolean>(
    shortFlag: ShortFlag, longFlag: L, description: string | undefined, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, false>, R, S>;
  // Function Implementation
  function optionFn<L extends LongFlag, P extends Parameter, V=boolean>(
    a: ShortFlag | L,
    b: L | P | string | undefined | Parser<V>,
    c?: P | string | undefined | Parser<V>,
    d?: string | undefined | Parser<V>,
    e?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S> {
    const stack = [a, b, c, d, e];
    const shortFlag = (isShortFlag(stack[0]) ? stack.shift() : undefined) as ShortFlag | undefined;
    const longFlag = stack.shift() as L;
    const parameter = (isParameter(stack[0]) ? stack.shift() : undefined) as P | undefined;
    const description = (typeof stack[0] === "string" ? stack.shift() : undefined) as string | undefined;
    const parser = (isFunction(stack[0]) ? stack.shift() : parseBoolean) as Parser<V>;
    return getCommand<N, MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S>({
      ...properties,
      action: properties.action as unknown as Action<MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R>,
      format: properties.format as unknown as Formatter<
        R,
        OptionsPropertyFromInput<MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>>>,
      arguments: properties.arguments as unknown as ArgumentsPropertyFromInput<
        MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>>,
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
      } as unknown as OptionsPropertyFromInput<
        MergeOptionsToInput<I, L, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>>,
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

export function getOptionsFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  function getOptions<O extends Options | undefined = undefined>(
    options?: O
  ): O extends Options ? Command<N, ReplaceOptionsInInput<I, OptionsInputFromProperty<O>>, R, S> : OptionsPropertyFromInput<I> {
    if(options === undefined) {
      return properties.options as O extends Options ? Command<N, ReplaceOptionsInInput<I, OptionsInputFromProperty<O>>, R, S> : OptionsPropertyFromInput<I>;
    } else {
      return getCommand<N, ReplaceOptionsInInput<I, OptionsInputFromProperty<O>>, R, S>({
        ...properties,
        action: properties.action as unknown as Action<ReplaceOptionsInInput<I, OptionsInputFromProperty<O>>, R>,
        format: properties.format as unknown as Formatter<R, OptionsPropertyFromInput<ReplaceOptionsInInput<I, OptionsInputFromProperty<O>>>>,
        arguments: properties.arguments as unknown as ArgumentsPropertyFromInput<ReplaceOptionsInInput<I, OptionsInputFromProperty<O>>>,
        options: options as unknown as OptionsPropertyFromInput<ReplaceOptionsInInput<I, OptionsInputFromProperty<O>>>
      }) as O extends Options ? Command<N, ReplaceOptionsInInput<I, OptionsInputFromProperty<O>>, R, S> : OptionsPropertyFromInput<I>;
    }
  }
  return getOptions;
}

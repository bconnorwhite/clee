import { CommandProperties, getCommand, Command, Commands } from "../../command.js";
import { Action } from "../../action.js";
import { Formatter } from "../../format";
import { Parser, Parsable, ShortFlag, LongFlag } from "../../parse/index.js";
import { Input, Parameter, RequiredParameter, isParameter, isVariadic, isRequired, getName, VariadicParameter } from "../index.js";
import { ArgumentsFromInput, ArgumentsPropertyFromInput } from "../arguments.js";
import { LongFlagToCamelCase, longFlagToCamelCase } from "./casing.js";
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
export type Option<L extends LongFlag, V> = OptionSkin<L> & Partial<Parsable<V>> & {
  required: boolean;
  variadic: boolean;
  parameter?: string;
};

/**
 * Extracts the Options from an Input type.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type OptionsFromInput<I extends Input> = I extends [...infer A, infer B]
  ? (B extends Options ? B : undefined)
  : undefined;

/**
 * Returns the type of a Command's `properties.options` field for a given Input type.
 */
export type OptionsPropertyFromInput<I extends Input> = I extends [...infer A, infer B]
  ? B extends Options ? { [K in keyof B]: Option<LongFlag, B[K]>; } : undefined
  : undefined;

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
  function optionFn<L extends LongFlag, P extends Parameter, V=P extends VariadicParameter ? boolean[] : boolean>(
    longFlag: L, parameter: P, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=P extends VariadicParameter ? boolean[] : boolean>(
    longFlag: L, parameter: P, description: string | undefined, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, V=boolean>(
    longFlag: L, description: string | undefined, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, false>, R, S>;
  // Short Flag Signatures
  function optionFn<L extends LongFlag, V=boolean>(
    shortFlag: ShortFlag, longFlag: L, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=P extends VariadicParameter ? boolean[] : boolean>(
    shortFlag: ShortFlag, longFlag: L, parameter: P, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, P extends Parameter, V=P extends VariadicParameter ? boolean[] : boolean>(
    shortFlag: ShortFlag, longFlag: L, parameter: P, description: string | undefined, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>, R, S>;
  function optionFn<L extends LongFlag, V=boolean>(
    shortFlag: ShortFlag, longFlag: L, description: string | undefined, parser?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, false>, R, S>;
  // Function Implementation
  function optionFn<L extends LongFlag, P extends Parameter, V=P extends VariadicParameter ? boolean[] : boolean>(
    a: ShortFlag | L,
    b: L | P | string | undefined | Parser<V>,
    c?: P | string | undefined | Parser<V>,
    d?: string | undefined | Parser<V>,
    e?: Parser<V>
  ): Command<N, MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>, R, S> {
    const stack = [a, b, c, d, e];
    const shortFlag = (isShortFlag(stack[0]) ? stack.shift() : undefined) as ShortFlag | undefined;
    const longFlag = stack.shift() as L;
    const parameter = (isParameter(stack[0]) ? stack.shift() : undefined) as P | undefined;
    const description = (typeof stack[0] === "string" ? stack.shift() : undefined) as string | undefined;
    const parser = (isFunction(stack[0]) ? stack.shift() : undefined) as Parser<V> | undefined;
    return getCommand<N, MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>, R, S>({
      ...properties,
      action: properties.action as unknown as Action<MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>, R>,
      format: properties.format as unknown as Formatter<R, OptionsPropertyFromInput<MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>>>,
      arguments: properties.arguments as unknown as ArgumentsPropertyFromInput<MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>>,
      options: {
        ...(properties.options ?? {}),
        [longFlagToCamelCase(longFlag)]: {
          shortFlag,
          longFlag,
          description,
          required: isRequired(parameter),
          variadic: isVariadic(parameter),
          parameter: parameter ? getName(parameter) : undefined,
          parser
        }
      } as unknown as OptionsPropertyFromInput<MergeOptionsToInput<I, L, V, P extends RequiredParameter ? true : false>>,
      help: {
        shortFlag: properties.help.shortFlag === shortFlag ? undefined : properties.help.shortFlag,
        longFlag: properties.help.longFlag === longFlag ? undefined : properties.help.longFlag,
        description: properties.help.description
      },
      version: {
        version: properties.version.version,
        shortFlag: properties.version.shortFlag === shortFlag ? undefined : properties.version.shortFlag,
        longFlag: properties.version.longFlag === longFlag ? undefined : properties.version.longFlag,
        description: properties.version.description
      }
    });
  }
  return optionFn;
}

import { CommandProperties, getCommand, Command, Commands } from "../command.js";
import { Action } from "../action.js";
import { Formatter } from "../format";
import { Parsable, Parser, parseString } from "../parse/index.js";
import { Input, Parameter, isRequired, isVariadic, getParameterName, RequiredParameter, VariadicParameter } from "./index.js";
import { Options, OptionsPropertyFromInput, OptionsFromInput } from "./options/index.js";

/**
 * The arguments portion of the input data.
 */
export type Arguments = Array<unknown>;

/**
 * The properties that define an argument.
 */
export interface Argument<V> extends Parsable<V> {
  name: string;
  description?: string;
  default?: V;
  required: boolean;
  variadic: boolean;
}

/**
 * Transforms an Input to extract Arguments.
 */
export type ArgumentsFromInput<I> = I extends [...infer A, infer B]
 ? B extends Options ? A : MergeArgs<A, B>
 : [];

type ArgumentsPropertyFromInputIfHasOptions<I> = I extends [...infer A, infer B]
  ? B extends Options
    ? { [K in keyof A]: Argument<A[K]>; }
    : never
  : { [K in keyof I]: Argument<I[K]>; };

/**
 * Return a type a Command's `properties.arguments` field from a given Input type.
 */
export type ArgumentsPropertyFromInput<I> = ArgumentsPropertyFromInputIfHasOptions<I> extends never ? {
  [K in keyof I]: Argument<I[K]>;
} : ArgumentsPropertyFromInputIfHasOptions<I>;

/**
 * `A` is an array of Arguments.
 */
export type ArgumentsInputFromProperty<A> = A extends Arguments ? {
  [K in keyof A]: A[K] extends Argument<infer V> ? V : never;
} : never;

/**
 * Returns true if the last argument in a set of Arguments is variadic.
 */
export type HasVariadicArgument<A extends Arguments> = A extends [...infer B, infer C]
  ? C extends string[] ? true : false
  : false;

/**
 * Merge existing Arguments (A) with a new Argument (B).
 */
type MergeArgs<A extends Arguments, B> = [...A, B];

/**
 * Merge a new argument into the Input.
 */
type MergeArgsToInput<I extends Input, V, Q extends boolean> = OptionsFromInput<I> extends undefined
  ? [...MergeArgs<ArgumentsFromInput<I>, Q extends true ? V : V | undefined>]
  : [...MergeArgs<ArgumentsFromInput<I>, Q extends true ? V : V | undefined>, OptionsFromInput<I>];

/**
 * Replace the arguments portion of an Input with a new set of Arguments.
 */
type ReplaceArgsInInput<I extends Input, A extends Arguments> = OptionsFromInput<I> extends undefined
  ? A
  : [...A, OptionsFromInput<I>];

export function getArgumentFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    parser?: Parser<V>
  ): Command<N, MergeArgsToInput<I, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S>;
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    description: string | undefined,
    parser?: Parser<V>
  ): Command<N, MergeArgsToInput<I, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S>;
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    b: string | undefined | Parser<V>,
    c?: Parser<V>
  ): Command<N, MergeArgsToInput<I, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S> {
    const variadic = isVariadic(parameter);
    const argument: Argument<V> = {
      name: getParameterName(parameter),
      required: isRequired(parameter),
      variadic,
      description: typeof b === "string" ? b : undefined,
      parser: (typeof b === "function" ? b : c) ?? parseString as Parser<V>
    };
    return getCommand<N, MergeArgsToInput<I, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>, R, S>({
      ...properties,
      action: properties.action as unknown as Action<
        MergeArgsToInput<I, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>,
        R>,
      format: properties.format as unknown as Formatter<
        R,
        OptionsPropertyFromInput<MergeArgsToInput<I, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>>>,
      arguments: [...properties.arguments, argument] as unknown as ArgumentsPropertyFromInput<
        MergeArgsToInput<I, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>>,
      options: properties.options as unknown as OptionsPropertyFromInput<
        MergeArgsToInput<I, P extends VariadicParameter ? V[] : V, P extends RequiredParameter ? true : false>>
    });
  }
  return argumentFn;
}

export function getArgumentsFn<N extends string, I extends Input, R, S extends Commands>(
  properties: CommandProperties<N, I, R, S>
) {
  function argumentsFn<A extends Argument<unknown>[] | undefined = undefined>(
    args?: A
  ): A extends undefined ? ArgumentsPropertyFromInput<I> : Command<N, ReplaceArgsInInput<I, ArgumentsInputFromProperty<A>>, R, S> {
    if(args === undefined) {
      return properties.arguments as A extends undefined ? ArgumentsPropertyFromInput<I> : Command<N, ReplaceArgsInInput<I, ArgumentsInputFromProperty<A>>, R, S>;
    } else {
      return getCommand<N, ReplaceArgsInInput<I, ArgumentsInputFromProperty<A>>, R, S>({
        ...properties,
        action: properties.action as unknown as Action<ReplaceArgsInInput<I, ArgumentsInputFromProperty<A>>, R>,
        format: properties.format as unknown as Formatter<R, OptionsPropertyFromInput<ReplaceArgsInInput<I, ArgumentsInputFromProperty<A>>>>,
        arguments: args as unknown as ArgumentsPropertyFromInput<ReplaceArgsInInput<I, ArgumentsInputFromProperty<A>>>,
        options: properties.options as unknown as OptionsPropertyFromInput<ReplaceArgsInInput<I, ArgumentsInputFromProperty<A>>>
      }) as A extends undefined ? ArgumentsPropertyFromInput<I> : Command<N, ReplaceArgsInInput<I, ArgumentsInputFromProperty<A>>, R, S>;
    }
  }
  return argumentsFn;
}

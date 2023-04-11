import { CommandProperties, getCommand, Command, Commands } from "../command.js";
import { Action } from "../action.js";
import { Parsable, Parser, parseString } from "../parse/index.js";
import { Parameter, isRequired, isVariadic, getParameterName, RequiredParameter, VariadicParameter } from "./index.js";
import { Options } from "./options/index.js";
import { Defined } from "../utils/index.js";

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
 * Return a type a Command's `properties.arguments` field from a given Arguments type.
 */
export type ArgumentsProperty<A> = {
  [K in keyof A]: Argument<A[K]>;
};

type ArgumentsFromProperty<AP extends ArgumentsProperty<Arguments>> = [
  ...{ [K in keyof AP]: AP[K] extends Argument<infer V> ? V : never; }
];

/**
 * Returns true if the last argument in a set of Arguments is variadic.
 */
export type HasVariadicArgument<A extends Arguments> = A extends [...infer B, infer C]
  ? C extends string[] ? true : false
  : false;

/**
 * Merge existing Arguments (A) with a new Argument (B).
 * A - The existing Arguments.
 * B - The new Argument.
 * Q - Whether the new Argument is required.
 */
type MergeArgs<A extends Arguments, B, Q extends boolean> = [...A, Q extends true ? Defined<B> : B | undefined];

export function getArgumentFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    parser?: Parser<V>
  ): Command<N, MergeArgs<A, P extends VariadicParameter ? Defined<V>[] : V, P extends RequiredParameter ? true : false>, O, R, S>;
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    description: string | undefined,
    parser?: Parser<V>
  ): Command<N, MergeArgs<A, P extends VariadicParameter ? Defined<V>[] : V, P extends RequiredParameter ? true : false>, O, R, S>;
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    b: string | undefined | Parser<V>,
    c?: Parser<V>
  ): Command<N, MergeArgs<A, P extends VariadicParameter ? Defined<V>[] : V, P extends RequiredParameter ? true : false>, O, R, S> {
    const variadic = isVariadic(parameter);
    const argument: Argument<V> = {
      name: getParameterName(parameter),
      required: isRequired(parameter),
      variadic,
      description: typeof b === "string" ? b : undefined,
      parser: (typeof b === "function" ? b : c) ?? parseString as Parser<V>
    };
    return getCommand<N, MergeArgs<A, P extends VariadicParameter ? Defined<V>[] : V, P extends RequiredParameter ? true : false>, O, R, S>({
      ...properties,
      action: properties.action as unknown as Action<MergeArgs<A, P extends VariadicParameter ? Defined<V>[] : V, P extends RequiredParameter ? true : false>, O, R>,
      format: properties.format,
      arguments: [...properties.arguments, argument] as ArgumentsProperty<MergeArgs<A, P extends VariadicParameter ? Defined<V>[] : V, P extends RequiredParameter ? true : false>>,
      options: properties.options
    });
  }
  return argumentFn;
}

/**
 * Get or replace the arguments of a command.
 */
export function getArgumentsFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  properties: CommandProperties<N, A, O, R, S>
) {
  function argumentsFn<AP extends ArgumentsProperty<Arguments> | undefined = undefined>(
    args?: AP | undefined
  ): AP extends ArgumentsProperty<infer A2 extends Arguments> ? Command<N, A2, O, R, S> : ArgumentsProperty<A> {
    if(args === undefined) {
      return properties.arguments as AP extends ArgumentsProperty<infer A2 extends Arguments> ? Command<N, A2, O, R, S> : ArgumentsProperty<A>;
    } else {
      return getCommand<N, ArgumentsFromProperty<Defined<AP>>, O, R, S>({
        ...properties,
        action: properties.action as unknown as Action<ArgumentsFromProperty<Defined<AP>>, O, R>,
        format: properties.format,
        arguments: args as unknown as ArgumentsProperty<ArgumentsFromProperty<Defined<AP>>>,
        options: properties.options
      }) as AP extends ArgumentsProperty<infer A2 extends Arguments> ? Command<N, A2, O, R, S> : ArgumentsProperty<A>;
    }
  }
  return argumentsFn;
}

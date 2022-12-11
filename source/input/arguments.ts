import { CommandProperties, getCommand, Command, Commands } from "../command.js";
import { Action } from "../action.js";
import { Formatter } from "../format";
import { Parsable, Parser, parseString } from "../parse/index.js";
import { Input, Parameter, isRequired, getName, RequiredParameter } from "./index.js";
import { Options, OptionsPropertyFromInput, OptionsFromInput } from "./options/index.js";

/**
 * The arguments portion of the input data.
 */
export type Arguments = Array<unknown>;

/**
 * The properties that define an argument.
 */
export interface Argument<V> extends Partial<Parsable<V>> {
  required: boolean;
  name: string;
  description?: string;
  default?: V;
}

export type ArgumentsPropertyFromInput<I extends Input> = {
  [K in keyof I]: Argument<I[K]>;
};

/**
 * Transforms an Input to extract Arguments.
 */
export type ArgumentsFromInput<I> = I extends [...infer A, infer B]
  ? B extends Options ? A : MergeArgs<A, B>
  : [];

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

function getArgument<V>(required: boolean, name: string, description?: string, parser?: Parser<V> | undefined): Argument<V> {
  return {
    required,
    name,
    description,
    parser: parser ?? parseString as unknown as Parser<V>
  } as Argument<V>;
}

export function getArgumentFn<N extends string, I extends Input, R, S extends Commands>(
  properties: CommandProperties<N, I, R, S>
) {
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    parser?: Parser<V>
  ): Command<N, MergeArgsToInput<I, V, P extends RequiredParameter ? true : false>, R, S>;
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    description: string | undefined,
    parser?: Parser<V>
  ): Command<N, MergeArgsToInput<I, V, P extends RequiredParameter ? true : false>, R, S>;
  function argumentFn<P extends Parameter, V=string>(
    parameter: P,
    b: string | undefined | Parser<V>,
    c?: Parser<V>
  ): Command<N, MergeArgsToInput<I, V, P extends RequiredParameter ? true : false>, R, S> {
    const required = isRequired(parameter);
    const description = typeof b === "string" ? b : undefined;
    const parser = typeof b === "function" ? b : c;
    const argument = getArgument(required, getName(parameter), description, parser);
    return getCommand<N, MergeArgsToInput<I, V, P extends RequiredParameter ? true : false>, R, S>({
      ...properties,
      action: properties.action as unknown as Action<MergeArgsToInput<I, V, P extends RequiredParameter ? true : false>, R>,
      format: properties.format as unknown as Formatter<R, OptionsPropertyFromInput<MergeArgsToInput<I, V, P extends RequiredParameter ? true : false>>>,
      arguments: [...properties.arguments, argument] as unknown as ArgumentsPropertyFromInput<MergeArgsToInput<I, V, P extends RequiredParameter ? true : false>>,
      options: properties.options as unknown as OptionsPropertyFromInput<MergeArgsToInput<I, V, P extends RequiredParameter ? true : false>>
    });
  }
  return argumentFn;
}

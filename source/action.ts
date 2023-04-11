import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";
import { Formatter } from "./format.js";
import { Arguments } from "./input/arguments.js";
import { Options } from "./input/options/index.js";

/**
 * A function that is called when a command is executed.
 */
export type Action<A extends Arguments=[], O extends Options=Options, R=void> = (...input: Input<A, O, true>) => R;

/**
 * Generates a function for getting and setting a Command's action.
 */
export function getActionFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  function actionFn<C extends [Action<A, O>] | []>(
    ...args: C
  ): C extends [Action<A, O, infer R2>] ? Command<N, A, O, R2, S> : Action<A, O, R> {
    const action = args[0];
    if(action === undefined) {
      return properties.action?.bind({}) as C extends [Action<A, O, infer R2>] ? Command<N, A, O, R2, S> : Action<A, O, R>;
    } else {
      return getCommand({
        ...properties,
        action: action.bind({}),
        format: properties.format as unknown as C extends Action<A, O, infer R2> ? Formatter<R2, O> : never
      }) as C extends [Action<A, O, infer R2>] ? Command<N, A, O, R2, S> : Action<A, O, R>;
    }
  }
  return actionFn;
}

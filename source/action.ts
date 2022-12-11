import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input, OptionsPropertyFromInput } from "./input/index.js";
import { Formatter } from "./format.js";

/**
 * A function that is called when a command is executed.
 */
export type Action<I extends Input=[], R=void> = (...input: I) => R;

/**
 * Generates a function for getting and setting a Command's action.
 */
export function getActionFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  function actionFn<A extends [Action<I>] | []>(
    ...args: A
  ): A extends [Action<I, infer R2>] ? Command<N, I, R2, S> : Action<I, R> {
    const action = args[0];
    if(action === undefined) {
      return properties.action.bind({}) as A extends [Action<I, infer R2>] ? Command<N, I, R2, S> : Action<I, R>;
    } else {
      return getCommand({
        ...properties,
        action: action.bind({}),
        format: properties.format as unknown as A extends Action<I, infer R2> ? Formatter<R2, OptionsPropertyFromInput<I>> : never
      }) as A extends [Action<I, infer R2>] ? Command<N, I, R2, S> : Action<I, R>;
    }
  }
  return actionFn;
}

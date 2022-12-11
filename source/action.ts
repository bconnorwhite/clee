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
  function actionFn<R2, A extends Action<I, R2> | undefined>(
    action?: A
  ): A extends undefined ? Action<I, R> : Command<N, I, R2, S> {
    if(action === undefined) {
      return properties.action.bind({}) as A extends undefined ? Action<I, R> : Command<N, I, R2, S>;
    } else {
      return getCommand({
        ...properties,
        action: action.bind({}),
        format: properties.format as unknown as Formatter<R2, OptionsPropertyFromInput<I>>
      }) as A extends undefined ? Action<I, R> : Command<N, I, R2, S>;
    }
  }
  return actionFn;
}

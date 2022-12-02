import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input, OptionsPropertyFromInput } from "./input/index.js";
import { Formatter } from "./format.js";

/**
 * A function that is called when a command is executed.
 */
export type Action<I extends Input=[], R=void> = (...input: I) => R;

export function getActionFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  return <R2>(action: Action<I, R2>): Command<N, I, R2, S> => {
    return getCommand({
      ...properties,
      action,
      format: properties.format as unknown as Formatter<R2, OptionsPropertyFromInput<I>>
    });
  };
}

import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";

/**
 * Generates a function for setting and getting a Command's name.
 */
export function getNameFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  function nameFn<N2 extends string | undefined = undefined>(name?: N2): N2 extends string ? Command<N2, I, R, S> : N {
    if(name === undefined) {
      return properties.name as N2 extends string ? Command<N2, I, R, S> : N;
    } else {
      return getCommand({
        ...properties,
        name
      }) as N2 extends string ? Command<N2, I, R, S> : N;
    }
  }
  return nameFn;
}

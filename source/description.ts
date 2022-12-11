import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";

/**
 * Generates a function for setting and getting a Command's description.
 */
export function getDescriptionFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  function descriptionFn<D extends string | undefined = undefined>(description?: D): D extends string ? Command<N, I, R, S> : string | undefined {
    if(description === undefined) {
      return properties.description as D extends string ? Command<N, I, R, S> : D;
    } else {
      return getCommand({
        ...properties,
        description
      }) as D extends string ? Command<N, I, R, S> : D;
    }
  }
  return descriptionFn;
}

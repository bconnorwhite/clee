import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Arguments, Options } from "./input/index.js";

/**
 * Generates a function for setting and getting a Command's description.
 */
export function getDescriptionFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  function descriptionFn<D extends string | undefined = undefined>(description?: D): D extends string ? Command<N, A, O, R, S> : string | undefined {
    if(description === undefined) {
      return properties.description as D extends string ? Command<N, A, O, R, S> : D;
    } else {
      return getCommand({
        ...properties,
        description
      }) as D extends string ? Command<N, A, O, R, S> : D;
    }
  }
  return descriptionFn;
}

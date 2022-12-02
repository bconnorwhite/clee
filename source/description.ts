import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";

export function getDescriptionFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  return <D extends string | undefined = undefined>(description?: D): D extends string ? Command<N, I, R, S> : D => {
    if(typeof description === "string") {
      return getCommand({
        ...properties,
        description
      }) as D extends string ? Command<N, I, R, S> : D;
    } else {
      return properties.description as D extends string ? Command<N, I, R, S> : D;
    }
  };
}

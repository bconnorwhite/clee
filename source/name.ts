import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";

export function getNameFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  return <N2 extends string | undefined = undefined>(name?: N2): N2 extends string ? Command<N2, I, R, S> : N => {
    if(typeof name === "string") {
      return getCommand({
        ...properties,
        name
      }) as N2 extends string ? Command<N2, I, R, S> : N;
    } else {
      return properties.name as N2 extends string ? Command<N2, I, R, S> : N;
    }
  };
}

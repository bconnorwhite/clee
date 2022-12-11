import figlet, { Options as FigletOptions } from "figlet";
import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";

export function getTitleFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  return (options: FigletOptions): Command<N, I, R, S> => {
    return getCommand({
      ...properties,
      title: figlet.textSync(properties.name, options)
    });
  };
}

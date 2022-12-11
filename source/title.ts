import figlet, { Options as FigletOptions } from "figlet";
import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";

/**
 * Generates a function for setting and getting a Command's title.
 */
export function getTitleFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  function titleFn(): string;
  function titleFn(title: string): Command<N, I, R, S>;
  function titleFn(options: FigletOptions): Command<N, I, R, S>;
  function titleFn(title: string, options: FigletOptions): Command<N, I, R, S>;
  function titleFn<T extends undefined | string | FigletOptions = undefined>(
    a?: T,
    b?: FigletOptions
  ): T extends string | FigletOptions ? Command<N, I, R, S> : string {
    if(a === undefined) {
      return properties.title as T extends string | FigletOptions ? Command<N, I, R, S> : string;
    } else {
      const text = typeof a === "string" ? a : properties.name;
      const options = typeof a === "object" ? a : b;
      return getCommand({
        ...properties,
        title: options ? figlet.textSync(text, options) : text
      }) as T extends string | FigletOptions ? Command<N, I, R, S> : string;
    }
  }
  return titleFn;
}

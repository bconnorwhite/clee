import figlet, { Options as FigletOptions } from "figlet";
import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Arguments, Options } from "./input/index.js";

/**
 * Generates a function for setting and getting a Command's title.
 */
export function getTitleFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  function titleFn(): string | undefined;
  function titleFn(title: string): Command<N, A, O, R, S>;
  function titleFn(options: FigletOptions): Command<N, A, O, R, S>;
  function titleFn(title: string, options: FigletOptions): Command<N, A, O, R, S>;
  function titleFn<T extends undefined | string | FigletOptions = undefined>(
    a?: T,
    b?: FigletOptions
  ): T extends string | FigletOptions ? Command<N, A, O, R, S> : string | undefined {
    if(a === undefined) {
      return properties.title as T extends string | FigletOptions ? Command<N, A, O, R, S> : string | undefined;
    } else {
      const text = typeof a === "string" ? a : properties.name;
      const options = typeof a === "object" ? a : b;
      return getCommand({
        ...properties,
        title: options ? figlet.textSync(text, options) : text
      }) as T extends string | FigletOptions ? Command<N, A, O, R, S> : string | undefined;
    }
  }
  return titleFn;
}

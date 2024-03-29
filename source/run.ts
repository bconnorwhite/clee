import { CommandProperties, Commands } from "./command.js";
import { Arguments, Options } from "./input/index.js";

type AnyFunction = (...args: any[]) => any;

/**
 * Generates a function for running a Command's subcommands.
 */
export function getRunFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  function runFn<SN extends keyof S & string>(
    subcommand: SN,
    ...args: S[SN] extends AnyFunction ? Parameters<S[SN]> : never
  ): Promise<R> {
    if(properties.commands !== undefined) {
      const fn = properties.commands[subcommand];
      if(typeof fn === "function") {
        return fn(...args);
      }
    }
    throw new Error(`Command ${subcommand} not found`);
  }
  return runFn;
}

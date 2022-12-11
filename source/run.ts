import { CommandProperties, Commands } from "./command.js";
import { Input } from "./input/index.js";

type AnyFunction = (...args: any[]) => any;

export function getRunFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  return <SN extends keyof S & string>(subcommand: SN, ...args: S[SN] extends AnyFunction ? Parameters<S[SN]> : never): R => {
    if(properties.commands !== undefined) {
      const fn = properties.commands[subcommand];
      if(typeof fn === "function") {
        return fn(...args);
      }
    }
    throw new Error(`Command ${subcommand} not found`);
  };
}

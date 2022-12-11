import {
  Input,
  getArgumentFn, getArgumentsFn, ArgumentsPropertyFromInput,
  getOptionFn, getOptionsFn, OptionsPropertyFromInput
} from "./input/index.js";
import { OptionSkin } from "./input/options/index.js";
import { HasVariadicArgument, ArgumentsFromInput } from "./input/arguments.js";
import { getNameFn } from "./name.js";
import { getTitleFn } from "./title.js";
import { getDescriptionFn } from "./description.js";
import { getActionFn, Action } from "./action.js";
import { Formatter, getFormatFn } from "./format.js";
import { getRunFn } from "./run.js";
import { getParseFn } from "./parse/index.js";
import { getHelpFn } from "./help.js";
import { getVersionFn, VersionOption } from "./version.js";

export type Commands = Record<string, unknown> | undefined;

export type CommandName<C> = C extends Command<infer N, infer I, infer R, infer S> ? N : never;
export type CommandInput<C> = C extends Command<infer N, infer I, infer R, infer S> ? I : never;
export type CommandArguments<C> = C extends Command<infer N, infer I, infer R, infer S> ? ArgumentsPropertyFromInput<I> : never;
export type CommandOptions<C> = C extends Command<infer N, infer I, infer R, infer S> ? OptionsPropertyFromInput<I> : never;
export type CommandResult<C> = C extends Command<infer N, infer I, infer R, infer S> ? R : never;
export type CommandSubCommands<C> = C extends Command<infer N, infer I, infer R, infer S> ? S : never;

/**
 * The base command object.
 * Each function returns `Command`, except for `parse` which returns `ParseResult`.
 * Calling the command itself returns `R | Error`.
 */
export interface Command<N extends string=string, I extends Input=[], R=void, S extends Commands=undefined> extends Action<I, R> {
  // Base Settings
  name: ReturnType<typeof getNameFn<N, I, R, S>>;
  title: ReturnType<typeof getTitleFn<N, I, R, S>>;
  description: ReturnType<typeof getDescriptionFn<N, I, R, S>>;
  // Input types
  command: ReturnType<typeof getCommandFn<N, I, R, S>>;
  /**
   * Create a new argument.  
   * Required - "\<parameter\>"  
   * Optional - "[parameter]"  
   */
  argument: HasVariadicArgument<ArgumentsFromInput<I>> extends true ? undefined : ReturnType<typeof getArgumentFn<N, I, R, S>>;
  arguments: ReturnType<typeof getArgumentsFn<N, I, R, S>>;
  option: ReturnType<typeof getOptionFn<N, I, R, S>>;
  options: ReturnType<typeof getOptionsFn<N, I, R, S>>;
  // Additional options
  help: ReturnType<typeof getHelpFn<N, I, R, S>>;
  version: ReturnType<typeof getVersionFn<N, I, R, S>>;
  // Calling the command
  action: ReturnType<typeof getActionFn<N, I, R, S>>;
  run: ReturnType<typeof getRunFn<N, I, R, S>>;
  format: ReturnType<typeof getFormatFn<N, I, R, S>>;
  parse: ReturnType<typeof getParseFn<N, I, R, S>>;
}

/**
 * Properties that define a command.
 */
export type CommandProperties<N extends string, I extends Input, R, S extends Commands> = {
  // Base Settings
  name: N;
  title?: string;
  description?: string;
  // Input types
  commands: S;
  arguments: ArgumentsPropertyFromInput<I>;
  options: OptionsPropertyFromInput<I>;
  // Additional options
  help: Partial<OptionSkin>;
  version: VersionOption;
  // The action and formatter
  action: Action<I, R>;
  format: Formatter<R, OptionsPropertyFromInput<I>>;
};

type MergeCommand<S extends Commands, N2 extends string, I2 extends Input, O2, S2 extends Commands> = {
  [K in (S extends undefined ? N2 : keyof S | N2)]: K extends N2
    ? Command<N2, I2, O2, S2>
    : (K extends keyof S ? S[K] : never);
};

export function getCommandFn<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>) {
  return <N2 extends string, I2 extends Input, R2, S2 extends Commands>(
    subcommand: Command<N2, I2, R2, S2>
  ): Command<N, I, R, MergeCommand<S, N2, I2, R2, S2>> => {
    return getCommand<N, I, R, MergeCommand<S, N2, I2, R2, S2>>({
      ...properties,
      commands: {
        ...(properties.commands ?? {}),
        [subcommand.name()]: subcommand
      } as MergeCommand<S, N2, I2, R2, S2>
    });
  };
}

export function getCommand<N extends string, I extends Input=[], R=void, S extends Commands=Record<string, never>>(
  properties: CommandProperties<N, I, R, S>
): Command<N, I, R, S> {
  const command = properties.action as Command<N, I, R, S>;
  // Base Settings
  Object.defineProperty(command, "name", { value: getNameFn(properties) }); // This is super hacky but I'm gonna leave it until something breaks
  command.title = getTitleFn(properties);
  command.description = getDescriptionFn(properties);
  // Input types
  command.command = getCommandFn(properties);
  command.argument = (
    properties.arguments[properties.arguments.length-1]?.variadic ? undefined : getArgumentFn(properties)
  ) as HasVariadicArgument<ArgumentsFromInput<I>> extends true ? undefined : ReturnType<typeof getArgumentFn<N, I, R, S>>;
  Object.defineProperty(command, "arguments", { value: getArgumentsFn(properties), writable: true }); // This is super hacky but I'm gonna leave it until something breaks
  command.option = getOptionFn(properties);
  command.options = getOptionsFn(properties);
  // Additional options
  command.help = getHelpFn(properties);
  command.version = getVersionFn(properties);
  // Calling the command
  command.action = getActionFn(properties);
  command.format = getFormatFn(properties);
  command.parse = getParseFn(properties);
  command.run = getRunFn(properties);
  return command;
}



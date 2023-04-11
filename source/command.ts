import {
  Input,
  getArgumentFn, getArgumentsFn, ArgumentsProperty,
  getOptionFn, getOptionsFn, OptionsProperty
} from "./input/index.js";
import { Options, OptionSkin } from "./input/options/index.js";
import { HasVariadicArgument, Arguments } from "./input/arguments.js";
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

export type CommandName<C> = C extends Command<infer N, infer A, infer O, infer R, infer S> ? N : never;
export type CommandInput<C> = C extends Command<infer N, infer A, infer O, infer R, infer S> ? Input<A, O> : never;
export type CommandArguments<C> = C extends Command<infer N, infer A, infer O, infer R, infer S> ? A : never;
export type CommandOptions<C> = C extends Command<infer N, infer A, infer O, infer R, infer S> ? O : never;
export type CommandResult<C> = C extends Command<infer N, infer A, infer O, infer R, infer S> ? R : never;
export type CommandSubCommands<C> = C extends Command<infer N, infer A, infer O, infer R, infer S> ? S : never;

/**
 * Signature of a command function.
 */
export type Call<A extends Arguments=[], O extends Options=Options, R=void> = (...input: Input<A, O, false>) => R;

/**
 * The base command object.
 * Each function returns `Command`, except for `parse` which returns `ParseResult`.
 * Calling the command itself returns `R | Error`.
 */
export interface Command<N extends string=string, A extends Arguments=[], O extends Options=Options, R=void, S extends Commands=undefined> extends Call<A, O, R> {
  // Base Settings
  name: ReturnType<typeof getNameFn<N, A, O, R, S>>;
  title: ReturnType<typeof getTitleFn<N, A, O, R, S>>;
  description: ReturnType<typeof getDescriptionFn<N, A, O, R, S>>;
  // Input types
  command: ReturnType<typeof getCommandFn<N, A, O, R, S>>;
  /**
   * Create a new argument.
   * Required - "\<parameter\>"
   * Optional - "[parameter]"
   */
  argument: HasVariadicArgument<A> extends true ? undefined : ReturnType<typeof getArgumentFn<N, A, O, R, S>>;
  arguments: ReturnType<typeof getArgumentsFn<N, A, O, R, S>>;
  option: ReturnType<typeof getOptionFn<N, A, O, R, S>>;
  options: ReturnType<typeof getOptionsFn<N, A, O, R, S>>;
  // Additional options
  help: ReturnType<typeof getHelpFn<N, A, O, R, S>>;
  version: ReturnType<typeof getVersionFn<N, A, O, R, S>>;
  // Calling the command
  action: ReturnType<typeof getActionFn<N, A, O, R, S>>;
  run: ReturnType<typeof getRunFn<N, A, O, R, S>>;
  format: ReturnType<typeof getFormatFn<N, A, O, R, S>>;
  parse: ReturnType<typeof getParseFn<N, A, O, R, S>>;
}

/**
 * Properties that define a command.
 */
export type CommandProperties<N extends string, A extends Arguments, O extends Options, R, S extends Commands> = {
  // Base Settings
  name: N;
  title?: string;
  description?: string;
  // Input types
  commands: S;
  arguments: ArgumentsProperty<A>;
  options: OptionsProperty<O> | undefined;
  // Additional options
  help: Partial<OptionSkin> | undefined;
  version: VersionOption;
  // The action and formatter
  action: Action<A, O, R> | undefined;
  format: Formatter<R, O>;
};

type MergeCommand<S extends Commands, N2 extends string, A2 extends Arguments, O2 extends Options, R2, S2 extends Commands> = {
  [K in (S extends undefined ? N2 : keyof S | N2)]: K extends N2
    ? Command<N2, A2, O2, R2, S2>
    : (K extends keyof S ? S[K] : never);
};

export function getCommandFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>) {
  return <N2 extends string, A2 extends Arguments, O2 extends Options, R2, S2 extends Commands>(
    subcommand: Command<N2, A2, O2, R2, S2>
  ): Command<N, A, O, R, {
    [K in (S extends undefined ? N2 : keyof S | N2)]: K extends N2
      ? Command<N2, A2, O2, R2, S2>
      : (K extends keyof S ? S[K] : never);
  }> => {
    return getCommand<N, A, O, R, MergeCommand<S, N2, A2, O2, R2, S2>>({
      ...properties,
      commands: {
        ...(properties.commands ?? {}),
        [subcommand.name()]: subcommand
      } as MergeCommand<S, N2, A2, O2, R2, S2>
    });
  };
}

export function getCommand<N extends string, A extends Arguments=[], O extends Options=Options, R=void, S extends Commands=Record<string, never>>(
  properties: CommandProperties<N, A, O, R, S>
): Command<N, A, O, R, S> {
  const command = ((...args: Input<A, O>) => {
    if(args[properties.arguments.length] === undefined) {
      args[properties.arguments.length] = {};
    }
    return (properties.action ?? (() => {}))(...(args as Input<A, O, true>));
  }) as unknown as Command<N, A, O, R, S>;
  // Base Settings
  Object.defineProperty(command, "name", { value: getNameFn(properties) }); // This is super hacky but I'm gonna leave it until something breaks
  command.title = getTitleFn(properties);
  command.description = getDescriptionFn(properties);
  // Input types
  command.command = getCommandFn(properties);
  command.argument = (
    properties.arguments[properties.arguments.length-1]?.variadic ? undefined : getArgumentFn(properties)
  ) as HasVariadicArgument<A> extends true ? undefined : ReturnType<typeof getArgumentFn<N, A, O, R, S>>;
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

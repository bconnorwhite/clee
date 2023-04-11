import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Arguments, wrapParameter } from "./input/index.js";
import { Option, Options } from "./input/options/index.js";
import { ShortFlag, LongFlag } from "./parse/index.js";
import { isActiveVersionOption } from "./version.js";

/**
 * Add right-side padding until string is `length` characters long.
 */
function rightPad(string = "", length: number) {
  return string.padEnd(length, " ");
}

/**
 * Use this specifically for avoiding left padding when string is undefined,
 * otherwise a template literal is easier.
 * `length` is the number of spaces, not the total length as with `rightPad`.
 */
function leftPad(string = "", length: number) {
  return string ? string.padStart(string.length + length, " ") : "";
}

/**
 * Return the title portion of the help screen.
 */
function getTitle<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>): string {
  return properties.title !== undefined ? `${properties.title}` : "";
}

/**
 * Return the description portion of the help screen.
 */
function getDescription<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>): string {
  return properties.description !== undefined ? `${properties.description}` : "";
}

/**
 * Return the usage portion of the help screen.
 */
function getUsage<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>): string {
  const optionParameter = properties.options ? ` ${wrapParameter("options", false, false)}` : "";
  const commandParameter = Object.keys(properties.commands ?? {}).length > 0 ? ` ${wrapParameter("command")}` : "";
  return properties.arguments.reduce((retval, { name, required, variadic }) => {
    return `${retval} ${wrapParameter(name, required, variadic)}`;
  }, `Usage: ${properties.name}${optionParameter}${commandParameter}`);
}

/**
 * Group arguments into an array of [prefix, description] pairs.
 */
function getArgumentParameters<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>): [string, string][] {
  const shouldDisplayArgs = properties.arguments.some(({ description }) => description !== undefined);
  return shouldDisplayArgs ? properties.arguments.map(({ name, required, variadic, description }) => {
    return [`  ${wrapParameter(name, required, variadic)}`, description ?? ""];
  }) : [];
}

/**
 * Group options into an array of [prefix, description] pairs.
 */
function getOptionParameters<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>): [string, string][] {
  const options = Object.values<Partial<Option<LongFlag, unknown>>>(properties.options ?? {});
  if(isActiveVersionOption(properties.version)) {
    options.push(properties.version);
  }
  if(properties.help?.shortFlag || properties.help?.longFlag) {
    options.push(properties.help as Option<LongFlag, unknown>);
  }
  return options.map((option) => {
    const shortFlag = rightPad(option.shortFlag, 2);
    const separator = option.shortFlag && option.longFlag ? "," : " ";
    const longFlag = leftPad(option.longFlag, 1);
    const parameter = option.name ? leftPad(wrapParameter(option.name, option.required, option.variadic), 1) : "";
    return [`  ${shortFlag}${separator}${longFlag}${parameter}`, option.description ?? ""];
  });
}

/**
 * Group commands into an array of [prefix, description] pairs.
 */
function getCommandParameters<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>): [string, string][] {
  return (Object.values(properties.commands ?? {}) as Command[]).map((command) => {
    const subOptionParameter = command.options() ? ` ${wrapParameter("options")}` : "";
    const subArgumentParameters = command.arguments().reduce((argRetval, { name, required, variadic }) => {
      return `${argRetval} ${wrapParameter(name, required, variadic)}`;
    }, "");
    return [`  ${command.name()}${subOptionParameter}${subArgumentParameters}`, command.description() ?? ""];
  });
}

/**
 * Join sections with one newline between lines, and two newlines between sections.
 * Filter out empty sections.
 */
function joinSections(sections: string[][]) {
  return sections.map((lines) => lines.join("\n")).filter((section) => section.length > 0).join("\n\n");
}

/**
 * This function combines the arguments, options, and commands portion of the help screen.
 * All three are related since they are aligned based on the longest prefix.
 */
function getParameters<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(properties: CommandProperties<N, A, O, R, S>): string {
  const argumentParameters = getArgumentParameters(properties);
  const optionParameters = getOptionParameters(properties);
  const commandParameters = getCommandParameters(properties);
  // Combine
  const maxLength = Math.max(
    ...argumentParameters.map(([prefix]) => prefix.length),
    ...optionParameters.map(([prefix]) => prefix.length),
    ...commandParameters.map(([prefix]) => prefix.length)
  );
  return joinSections([[
    ...(argumentParameters.length > 0 ? ["Arguments:"] : []),
    ...argumentParameters.map(([prefix, description]) => `${rightPad(prefix, maxLength)}${leftPad(description, 2)}`)
  ], [
    ...(optionParameters.length > 0 ? ["Options:"] : []),
    ...optionParameters.map(([prefix, description]) => `${rightPad(prefix, maxLength)}${leftPad(description, 2)}`)
  ], [
    ...(commandParameters.length > 0 ? ["Commands:"] : []),
    ...commandParameters.map(([prefix, description]) => `${rightPad(prefix, maxLength)}${leftPad(description, 2)}`)
  ]]);
}

/**
 * Return the help screen as a string.
 */
export function getHelp<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  properties: CommandProperties<N, A, O, R, S>
): string {
  return [
    getTitle(properties),
    getDescription(properties),
    getUsage(properties),
    getParameters(properties)
  ].filter(Boolean).join("\n\n");
}

/**
 * Returns true if a help flag is present in the arguments.
 */
export function hasHelpFlag<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  properties: CommandProperties<N, A, O, R, S>,
  args: readonly string[]
): boolean {
  const helpFlags = [properties.help?.shortFlag, properties.help?.longFlag].filter((flag) => flag !== undefined);
  return helpFlags.some((flag) => flag !== undefined && args.includes(flag));
}

export function getHelpFn<N extends string, A extends Arguments, O extends Options, R, S extends Commands>(
  properties: CommandProperties<N, A, O, R, S>
) {
  function helpFn(): Command<N, A, O, R, S>;
  function helpFn(shortFlag: ShortFlag, longFlag: LongFlag, description: string): Command<N, A, O, R, S>;
  function helpFn(shortFlag?: ShortFlag, longFlag?: LongFlag, description?: string): Command<N, A, O, R, S> {
    if(shortFlag !== undefined) {
      return getCommand({
        ...properties,
        help: {
          shortFlag,
          longFlag,
          description
        }
      });
    } else {
      return getCommand({
        ...properties,
        help: undefined
      });
    }
  }
  return helpFn;
}

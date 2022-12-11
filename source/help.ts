import { Command, CommandProperties, getCommand, Commands } from "./command.js";
import { Input } from "./input/index.js";
import { Option } from "./input/options/index.js";
import { ShortFlag, LongFlag } from "./parse/index.js";

function wrapOptionalParameter(parameter: string, variadic: boolean) {
  return `[${parameter}${variadic ? "..." : ""}]`;
}

export function wrapRequiredParameter(parameter: string, variadic: boolean) {
  return `<${parameter}${variadic ? "..." : ""}>`;
}

function rightPad(string = "", length: number) {
  return string.padEnd(length, " ");
}

function leftPad(string = "", length: number) {
  return string ? string.padStart(string.length + length, " ") : "";
}

function wrapParameter(parameter: string, required: boolean, variadic: boolean) {
  return required ? wrapRequiredParameter(parameter, variadic) : wrapOptionalParameter(parameter, variadic);
}

function getTitle<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>): string {
  return properties.title !== undefined ? `${properties.title}` : "";
}

function getDescription<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>): string {
  return properties.description !== undefined ? `${properties.description}` : "";
}

function getUsage<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>): string {
  const optionParameter = properties.options ? ` ${wrapOptionalParameter("options", false)}` : "";
  const commandParameter = Object.keys(properties.commands ?? {}).length > 0 ? ` ${wrapOptionalParameter("command", false)}` : "";
  return properties.arguments.reduce((retval, { name, required, variadic }) => {
    return `${retval} ${wrapParameter(name, required, variadic)}`;
  }, `Usage: ${properties.name}${optionParameter}${commandParameter}`);
}

function getParameters<N extends string, I extends Input, R, S extends Commands>(properties: CommandProperties<N, I, R, S>): string {
  const argsHaveDescription = properties.arguments.some(({ description }) => description !== undefined);
  const argumentParameters = argsHaveDescription ? properties.arguments.map(({ name, required, variadic, description }) => {
    return [leftPad(wrapParameter(name, required, variadic), 2), description ?? ""] as const;
  }) : [];
  const options = Object.values<Option<LongFlag, unknown>>(properties.options ?? {});
  if(properties.version.version !== undefined && (properties.version.shortFlag || properties.version.longFlag)) {
    options.push(properties.version as Option<LongFlag, unknown>);
  }
  if(properties.help.shortFlag || properties.help.longFlag) {
    options.push(properties.help as Option<LongFlag, unknown>);
  }
  const optionParameters = options.map((option) => {
    const shortFlag = rightPad(option.shortFlag, 2);
    const separator = option.shortFlag && option.longFlag ? "," : " ";
    const longFlag = leftPad(option.longFlag, 1);
    const parameter = option.parameter ? leftPad(wrapParameter(option.parameter, option.required, option.variadic), 1) : "";
    return [`  ${shortFlag}${separator}${longFlag}${parameter}`, option.description ?? ""] as const;
  });
  const commandParameters = (Object.values(properties.commands ?? {}) as Command[]).map((command) => {
    const subOptionParameter = command.options() ? ` ${wrapOptionalParameter("options", false)}` : "";
    const subArgumentParameters = command.arguments().reduce((argRetval, { name, required, variadic }) => {
      return `${argRetval} ${wrapParameter(name, required, variadic)}`;
    }, "");
    return [`  ${command.name()}${subOptionParameter}${subArgumentParameters}`, command.description() ?? ""] as const;
  });
  const maxLength = Math.max(
    ...argumentParameters.map(([prefix]) => prefix.length),
    ...optionParameters.map(([prefix]) => prefix.length),
    ...commandParameters.map(([prefix]) => prefix.length)
  );
  const argumentsSection = [
    ...(argumentParameters.filter((description) => description !== undefined).length > 0 ? ["Arguments:"] : []),
    ...argumentParameters.map(([prefix, description]) => `${rightPad(prefix, maxLength)}${leftPad(description, 2)}`)
  ].join("\n");
  const optionsSection = [
    ...(optionParameters.length > 0 ? ["Options:"] : []),
    ...optionParameters.map(([prefix, description]) => `${rightPad(prefix, maxLength)}${leftPad(description, 2)}`)
  ].join("\n");
  const commandsSection = [
    ...(commandParameters.length > 0 ? ["Commands:"] : []),
    ...commandParameters.map(([prefix, description]) => `${rightPad(prefix, maxLength)}${leftPad(description, 2)}`)
  ].join("\n");
  return [
    ...(argumentsSection.length > 0 ? [argumentsSection] : []),
    ...(optionsSection.length > 0 ? [optionsSection] : []),
    ...(commandsSection.length > 0 ? [commandsSection] : [])
  ].join("\n\n");
}

export function getHelp<N extends string, I extends Input, R, S extends Commands>(
  properties: CommandProperties<N, I, R, S>
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
export function hasHelpFlag<N extends string, I extends Input, R, S extends Commands>(
  properties: CommandProperties<N, I, R, S>,
  args: readonly string[]
): boolean {
  const helpFlags = [properties.help.shortFlag, properties.help.longFlag].filter((flag) => flag !== undefined);
  return helpFlags.some((flag) => flag !== undefined && args.includes(flag));
}

export function getHelpFn<N extends string, I extends Input, R, S extends Commands>(
  properties: CommandProperties<N, I, R, S>
) {
  return (shortFlag: ShortFlag, longFlag: LongFlag, description: string): Command<N, I, R, S> => {
    return getCommand({
      ...properties,
      help: {
        shortFlag,
        longFlag,
        description
      }
    });
  };
}

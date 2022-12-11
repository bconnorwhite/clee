
export type Input = Array<unknown>;

export { getArgumentFn } from "./arguments.js";
export { getOptionFn } from "./options/index.js";

export type { ArgumentsPropertyFromInput } from "./arguments.js";
export type { OptionsPropertyFromInput } from "./options/index.js";

export type RequiredParameter = `<${string}>`;
export type OptionalParameter = `[${string}]`;

export type RequiredVariadicParameter = `<${string}...>`;
export type OptionalVariadicParameter = `[${string}...]`;

export type VariadicParameter = RequiredVariadicParameter | OptionalVariadicParameter;

export type Parameter = RequiredParameter | OptionalParameter;

// Infer the name of a parameter.
export type ParameterName<P extends Parameter> = P extends RequiredParameter
  ? P extends `<${infer N}>` ? N : never
  : P extends OptionalParameter
    ? P extends `[${infer N}]` ? N : never
    : never;

export function isRequired<P extends Parameter>(parameter: P): P extends RequiredParameter ? true : false {
  return parameter.startsWith("<") as P extends RequiredParameter ? true : false;
}

export function isVariadic<P extends Parameter>(parameter: P): P extends VariadicParameter ? true : false {
  return parameter.slice(0, -1).endsWith("...") as P extends VariadicParameter ? true : false;
}

export function getName(parameter: Parameter): string {
  return isVariadic(parameter) ? parameter.slice(1, -4) : parameter.slice(1, -1);
}


export type Input = Array<unknown>;

export { getArgumentFn, getArgumentsFn } from "./arguments.js";
export { getOptionFn, getOptionsFn } from "./options/index.js";

export type { ArgumentsPropertyFromInput, Argument } from "./arguments.js";
export type { OptionsPropertyFromInput, Option } from "./options/index.js";

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

export function isRequired<P extends Parameter>(parameter?: P): P extends RequiredParameter ? true : false {
  return (typeof parameter === "string" && parameter.startsWith("<")) as P extends RequiredParameter ? true : false;
}

export function isVariadic<P extends Parameter>(parameter?: P): P extends VariadicParameter ? true : false {
  return (typeof parameter === "string" && parameter.slice(0, -1).endsWith("...")) as P extends VariadicParameter ? true : false;
}

export function getParameterName(parameter: Parameter): string {
  return isVariadic(parameter) ? parameter.slice(1, -4) : parameter.slice(1, -1);
}

export function isParameter(parameter: any): parameter is Parameter {
  return typeof parameter === "string" && ((parameter.startsWith("<") && parameter.endsWith(">")) || (parameter.startsWith("[") && parameter.endsWith("]")));
}

function wrapOptionalParameter(parameter: string, variadic = false) {
  return `[${parameter}${variadic ? "..." : ""}]`;
}

function wrapRequiredParameter(parameter: string, variadic = false) {
  return `<${parameter}${variadic ? "..." : ""}>`;
}

export function wrapParameter(parameter: string, required = false, variadic = false) {
  return required ? wrapRequiredParameter(parameter, variadic) : wrapOptionalParameter(parameter, variadic);
}

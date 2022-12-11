
export type Input = Array<unknown>;

export { getArgumentFn } from "./arguments.js";
export { getOptionFn } from "./options/index.js";

export type { ArgumentsPropertyFromInput } from "./arguments.js";
export type { OptionsPropertyFromInput } from "./options/index.js";

export type RequiredParameter = `<${string}>`;
export type OptionalParameter = `[${string}]`;

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

export function getName(parameter: Parameter): string {
  return parameter.slice(1, -1);
}

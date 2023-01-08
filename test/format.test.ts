import { describe, test, expect } from "@jest/globals";
import chalk from "chalk";
import { formatDefault } from "../source/format.js";

describe("formatDefault", () => {
  test("undefined", () => {
    const result = formatDefault(undefined);
    expect(result).toStrictEqual(undefined);
  });
  test("string", () => {
    const result = formatDefault("test");
    expect(result).toStrictEqual("test");
  });
  test("object", () => {
    const result = formatDefault({ test: true });
    expect(result).toStrictEqual(`{ test: ${chalk.yellow("true")} }`);
  });
  test("error", () => {
    const result = formatDefault(new Error("test"));
    expect(result).toStrictEqual("test");
  });
});

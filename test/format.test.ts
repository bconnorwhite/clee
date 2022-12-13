import { describe, test, expect } from "@jest/globals";
import chalk from "chalk";
import { formatDefault } from "../source/format.js";

describe("formatDefault", () => {
  test("undefined", async () => {
    const result = await formatDefault(undefined);
    expect(result).toStrictEqual(undefined);
  });
  test("string", async () => {
    const result = await formatDefault("test");
    expect(result).toStrictEqual("test");
  });
  test("object", async () => {
    const result = await formatDefault({ test: true });
    expect(result).toStrictEqual(`{ test: ${chalk.yellow("true")} }`);
  });
  test("error", async () => {
    const result = await formatDefault(new Error("test"));
    expect(result).toStrictEqual("test");
  });
});

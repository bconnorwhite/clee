import { describe, test, expect } from "@jest/globals";
import chalk from "chalk";
import clee from "../source";

describe("mixed", () => {
  const cmd = clee("clee")
    .requiredArgument("arg1", "Description")
    .argument("argument2", "Description")
    .requiredOption("-o", "--option1", "Description")
    .option("-p", "--opt2", "Description")
    .action((arg1, arg2, options) => {
      return { arg1, arg2, options };
    });
  test("usage", async () => {
    const result = await cmd.parse(["-h"]);
    expect(result).toStrictEqual({
      message: [
        "Usage: clee [options] <arg1> [argument2]",
        "Arguments:\n  <arg1>         Description\n  [argument2]    Description",
        "Options:\n  -o, --option1  Description\n  -p, --opt2     Description\n  -h, --help     Display help for command"
      ].join("\n\n")
    });
  });
  describe("action", () => {
    test("parse", async () => {
      const result = await cmd.parse(["arg1", "arg2", "-o", "true"]);
      expect(result).toStrictEqual({
        message: `{ arg1: ${chalk.green("'arg1'")}, arg2: ${chalk.green("'arg2'")}, options: { option1: ${chalk.yellow("true")} } }`
      });
    });
    test("call", () => {
      expect(cmd("arg1", "arg2", { option1: true, opt2: undefined })).toStrictEqual({
        arg1: "arg1",
        arg2: "arg2",
        options: { opt2: undefined, option1: true }
      });
    });
  });
});

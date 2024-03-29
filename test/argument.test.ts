import { describe, test, expect } from "@jest/globals";
import chalk from "chalk";
import clee, { parseString } from "../source/index.js";

describe("argument", () => {
  describe("default parser", () => {
    const cmd = clee("clee")
      .argument("[name]", "Name")
      .cwd()
      .action((name) => name);
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [name]\n\nArguments:\n  [name]      Name\n\nOptions:\n  -h, --help  Display help for command"
      });
    });
    test("is not required", async () => {
      const result = await cmd.parse([]);
      expect(result).toStrictEqual({ message: undefined });
    });
  });
  describe("string parser", () => {
    const cmd = clee("clee").argument("[name]", "Name", parseString).action((arg) => {
      return arg;
    });
    test("action", async () => {
      const result = await cmd.parse(["test"]);
      expect(result).toStrictEqual({ message: "test" });
    });
  });
  describe("string parser no description", () => {
    const cmd = clee("clee").argument("[name]", parseString).action((arg) => {
      return arg;
    });
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [name]\n\nOptions:\n      --cwd   A relative or absolute path to the working directory.\n  -h, --help  Display help for command"
      });
    });
    test("action", async () => {
      const result = await cmd.parse(["test"]);
      expect(result).toStrictEqual({ message: "test" });
    });
  });
  describe("not variadic", () => {
    const cmd = clee("clee")
      .argument("[first]")
      .argument("[list]")
      .action((first, list) => {
        return {
          first,
          list
        };
      });
    test("action", async () => {
      const result = await cmd.parse(["arg1", "arg2", "arg3"]);
      expect(result).toStrictEqual({
        message: `{ first: ${chalk.green("'arg1'")}, list: ${chalk.green("'arg2'")} }`
      });
    });
  });
  describe("variadic", () => {
    const cmd = clee("clee")
      .argument("[first]")
      .argument("[list...]", parseString)
      .action((first, list) => {
        return {
          first,
          list
        };
      });
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [first] [list...]\n\nOptions:\n      --cwd   A relative or absolute path to the working directory.\n  -h, --help  Display help for command"
      });
    });
    test("action", async () => {
      const result = await cmd.parse(["arg1", "arg2", "arg3"]);
      expect(result).toStrictEqual({
        message: `{ first: ${chalk.green("'arg1'")}, list: [ ${chalk.green("'arg2'")}, ${chalk.green("'arg3'")} ] }`
      });
    });
  });
});

describe("optionalArguments", () => {
  describe("double optional", () => {
    const cmd = clee("clee")
      .argument("[first]")
      .argument("[second]")
      .action((first, second) => {
        return {
          first,
          second
        };
      });
    test("action", async () => {
      const result = await cmd.parse(["arg1", "arg2"]);
      expect(result).toStrictEqual({
        message: `{ first: ${chalk.green("'arg1'")}, second: ${chalk.green("'arg2'")} }`
      });
    });
  });
  describe("variadic", () => {
    const cmd = clee("clee")
      .argument("[first]")
      .argument("[second...]")
      .action((first, second) => {
        return {
          first,
          second
        };
      });
    test("action", async () => {
      const result = await cmd.parse(["arg1", "arg2", "arg3"]);
      expect(result).toStrictEqual({
        message: `{ first: ${chalk.green("'arg1'")}, second: [ ${chalk.green("'arg2'")}, ${chalk.green("'arg3'")} ] }`
      });
    });
  });
  describe("with unused flags", () => {
    const cmd = clee("clee")
      .argument("[first]")
      .argument("[second...]")
      .action((first, second) => {
        return {
          first,
          second
        };
      });
    test("action", async () => {
      const result = await cmd.parse(["arg1", "arg2", "arg3", "--flag"]);
      expect(result).toStrictEqual({
        message: `{ first: ${chalk.green("'arg1'")}, second: [ ${chalk.green("'arg2'")}, ${chalk.green("'arg3'")}, ${chalk.green("'--flag'")} ] }`
      });
    });
  });
});

describe("requiredArgument", () => {
  describe("without description", () => {
    const cmd = clee("clee")
      .argument("<name>")
      .action((name) => name);
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee <name>\n\nOptions:\n      --cwd   A relative or absolute path to the working directory.\n  -h, --help  Display help for command"
      });
    });
    test("is required", async () => {
      const result = await cmd.parse([]);
      expect(result).toStrictEqual(new Error("Argument \"<name>\" is required."));
    });
  });
  describe("with description", () => {
    const cmd = clee("clee").argument("<name>", "Description").cwd();
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee <name>\n\nArguments:\n  <name>      Description\n\nOptions:\n  -h, --help  Display help for command"
      });
    });
  });
});

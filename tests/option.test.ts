import { describe, test, expect } from "@jest/globals";
import chalk from "chalk";
import clee, { parseBoolean } from "../source";
import { parseInt } from "../source/parse/parser";

describe("option", () => {
  describe("boolean", () => {
    const cmd = clee("clee").option("-f", "--flag", "Description");
    test("usage", async () => {
      expect(await cmd.parse(["-h"])).toStrictEqual({
        message: "Usage: clee [options]\n\nOptions:\n  -f, --flag  Description\n  -h, --help  Display help for command"
      });
    });
  });
  describe("no short flag", () => {
    const cmd = clee("clee").option("--flag", "Description");
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [options]\n\nOptions:\n      --flag  Description\n  -h, --help  Display help for command"
      });
    });
  });
  describe("variadic", () => {
    const cmd = clee("clee")
      .option("-f", "--flag", "Description", parseInt)
      .action((options) => {
        return options.flag;
      });
    test("action", async () => {
      const result = await cmd.parse(["-h", "1", "2", "3"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [options]\n\nOptions:\n  -f, --flag  Description\n  -h, --help  Display help for command"
      });
    });
  });
  describe("no description", () => {
    const cmd = clee("clee").option("-f", "--flag");
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [options]\n\nOptions:\n  -f, --flag\n  -h, --help  Display help for command"
      });
    });
  });
  describe("long flag only with custom parser", () => {
    const cmd = clee("clee")
      .option("--flag", parseBoolean)
      .action((options) => {
        return options.flag;
      });
    test("action", async () => {
      const result = await cmd.parse(["--flag=true"]);
      expect(result).toStrictEqual({
        message: chalk.yellow("true")
      });
    });
  });
  describe("custom parser", () => {
    const cmd = clee("clee")
      .option("-f", "--flag", "Description", parseBoolean)
      .action((options) => {
        return options.flag;
      });
    test("action", async () => {
      const result = await cmd.parse(["-f=yes"]);
      expect(result).toStrictEqual({
        message: chalk.yellow("true")
      });
    });
  });
});

describe("requiredOption", () => {
  describe("boolean", () => {
    const cmd = clee("clee").option("-f", "--flag", "<value>", "Description");
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [options]\n\nOptions:\n  -f, --flag <value>  Description\n  -h, --help          Display help for command"
      });
    });
    test("is required", async () => {
      const result = await cmd.parse([]);
      expect(result).toStrictEqual(new Error("Option \"--flag\" must specify a value."));
    });
  });
});

describe("compound option", () => {
  const cmd = clee("clee")
    .option("-a", "--optionA", "Description")
    .option("-b", "--optionB", "Description")
    .option("-c", "--optionC", "Description")
    .action((options) => {
      return options;
    });
  test("action", async () => {
    const result = await cmd.parse(["-abc"]);
    expect(result).toStrictEqual({
      message: `{ optionA: ${chalk.yellow("true")}, optionB: ${chalk.yellow("true")}, optionC: ${chalk.yellow("true")} }`
    });
  });
});

import { describe, test, expect } from "@jest/globals";
import chalk from "chalk";
import clee from "../source/index.js";

describe("name", () => {
  const cmd = clee("clee").cwd().action(() => {
    return true;
  });
  test("usage", async () => {
    const result = await cmd.parse(["-h"]);
    expect(result).toStrictEqual({
      message: "Usage: clee\n\nOptions:\n  -h, --help  Display help for command"
    });
  });
  test("silent", async () => {
    const result = await cmd.parse(["-h"], { silent: true });
    expect(result).toStrictEqual({
      message: "Usage: clee\n\nOptions:\n  -h, --help  Display help for command"
    });
  });
  describe("action", () => {
    test("parse", async () => {
      const result = await cmd.parse([]);
      expect(result).toEqual({ message: chalk.yellow("true") });
    });
    test("call", () => {
      expect(cmd()).toBe(true);
    });
  });
});

describe("title", () => {
  const cmd = clee("clee").cwd().title({ font: "Term" });
  test("usage", async () => {
    const result = await cmd.parse(["-h"]);
    expect(result).toStrictEqual({
      message: "clee\n\nUsage: clee\n\nOptions:\n  -h, --help  Display help for command"
    });
  });
});

describe("description", () => {
  const cmd = clee("clee")
    .cwd()
    .description("Test Description");
  test("usage", async () => {
    const result = await cmd.parse(["-h"]);
    expect(result).toStrictEqual({
      message: "Test Description\n\nUsage: clee\n\nOptions:\n  -h, --help  Display help for command"
    });
  });
});

describe("action", () => {
  const cmd = clee("clee").action(() => {
    // eslint-disable-next-line no-throw-literal
    throw "Test Error";
  });
  test("action", async () => {
    try {
      await cmd.parse([]);
    } catch(e) {
      expect(e).toBe("Test Error");
    }
  });
});

describe("format", () => {
  const cmd = clee("clee").action(() => {
    return [1, 2, 3];
  }).format((result) => {
    return result.join(", ");
  });
  test("action", async () => {
    const result = await cmd.parse([]);
    expect(result).toStrictEqual({ message: "1, 2, 3" });
  });
});

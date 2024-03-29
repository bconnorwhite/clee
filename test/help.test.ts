import { describe, test, expect } from "@jest/globals";
import clee from "../source/index.js";

describe("help", () => {
  test("clear", async () => {
    const cmd = clee("clee").help().cwd();
    const result = await cmd.parse(["-h"]);
    expect(result).toStrictEqual({
      message: "Usage: clee"
    });
  });
  test("usage", async () => {
    const cmd = clee("clee")
      .cwd()
      .help("-e", "--example", "Example Description");
    const result = await cmd.parse(["-e"]);
    expect(result).toStrictEqual({
      message: "Usage: clee\n\nOptions:\n  -e, --example  Example Description"
    });
  });
  describe("conflicting with help short flag", () => {
    const cmd = clee("clee")
      .option("-h", "--header", "Description")
      .cwd();
    test("usage", async () => {
      const result = await cmd.parse(["--help"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [options]\n\nOptions:\n  -h, --header  Description\n      --help    Display help for command"
      });
    });
  });
  describe("conflicting with help long flag", () => {
    const cmd = clee("clee")
      .option("-e", "--help", "Description")
      .cwd();
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [options]\n\nOptions:\n  -e, --help  Description\n  -h          Display help for command"
      });
    });
  });
  describe("conflicting with help both flags", () => {
    const cmd = clee("clee")
      .option("-h", "--help", "Description")
      .action(() => {});
    test("usage", async () => {
      const result = await cmd.parse(["--help"]);
      expect(result).toStrictEqual({
        message: undefined
      });
    });
  });
});

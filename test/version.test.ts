import { describe, test, expect } from "@jest/globals";
import { getVersionSync } from "get-module-pkg";
import clee from "../source/index.js";

describe("version", () => {
  describe("hardcoded", () => {
    const cmd = clee("clee")
      .cwd()
      .version("1.0.0");
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee\n\nOptions:\n  -v, --version  Display version\n  -h, --help     Display help for command"
      });
    });
    test("action", async () => {
      const result = await cmd.parse(["-v"]);
      expect(result).toStrictEqual({
        message: "1.0.0"
      });
    });
  });
  describe("load from pkg", () => {
    const version = getVersionSync(import.meta.url);
    const cmd = clee("clee")
      .cwd()
      .version(import.meta.url);
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee\n\nOptions:\n  -v, --version  Display version\n  -h, --help     Display help for command"
      });
    });
    test("action", async () => {
      const result = await cmd.parse(["-v"]);
      expect(result).toStrictEqual({
        message: version
      });
    });
  });
  describe("invalid", () => {
    const cmd = clee("clee").version("/");
    test("action", async () => {
      const result = await cmd.parse(["-v"]);
      expect(result).toStrictEqual(new Error("Unknown version."));
    });
  });
  describe("flag override", () => {
    const cmd = clee("clee")
      .version("1.0.0")
      .cwd()
      .option("-v", "--version", "Override version");
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee [options]\n\nOptions:\n  -v, --version  Override version\n  -h, --help     Display help for command"
      });
    });
  });
  describe("custom flags", () => {
    const cmd = clee("clee")
      .cwd()
      .version("1.0.0", "-g", "--get-version", "Get version");
    test("usage", async () => {
      const result = await cmd.parse(["-h"]);
      expect(result).toStrictEqual({
        message: "Usage: clee\n\nOptions:\n  -g, --get-version  Get version\n  -h, --help         Display help for command"
      });
    });
  });
});

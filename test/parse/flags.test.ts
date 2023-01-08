import { describe, test, expect } from "@jest/globals";
import {
  isFlag,
  isShortFlag,
  isLongFlag,
  isCompoundFlag,
  isInverseFlag,
  getLongFlagName,
  parseFlag,
  LongFlag,
  Flag,
  FlagParts
} from "../../source/parse/flags.js";

describe("isFlag", () => {
  const grid = test.each([
    ["-h", true],
    ["--help", true],
    ["-abc", true],
    ["--no-help", true],
    ["help", false]
  ]);
  grid("%s is %s", (flag, expected) => {
    expect(isFlag(flag)).toBe(expected);
  });
});

describe("isShortFlag", () => {
  const grid = test.each([
    ["-h", true],
    ["--help", false],
    ["-abc", true],
    ["--no-help", false],
    ["help", false]
  ]);
  grid("%s is %s", (flag, expected) => {
    expect(isShortFlag(flag)).toBe(expected);
  });
});

describe("isLongFlag", () => {
  const grid = test.each([
    ["-h", false],
    ["--help", true],
    ["-abc", false],
    ["--no-help", true],
    ["help", false]
  ]);
  grid("%s is %s", (flag, expected) => {
    expect(isLongFlag(flag)).toBe(expected);
  });
});

describe("isCompoundFlag", () => {
  const grid = test.each([
    ["-h", false],
    ["--help", false],
    ["-abc", true],
    ["--no-help", false],
    ["help", false]
  ]);
  grid("%s is %s", (flag, expected) => {
    expect(isCompoundFlag(flag)).toBe(expected);
  });
});

describe("isInverseFlag", () => {
  const grid = test.each<[LongFlag, boolean]>([
    ["--help", false],
    ["--no-help", true]
  ]);
  grid("%s is %s", (flag, expected) => {
    expect(isInverseFlag(flag)).toBe(expected);
  });
});

describe("getLongFlagName", () => {
  const grid = test.each<[LongFlag, string]>([
    ["--help", "help"],
    ["--no-help", "no-help"]
  ]);
  grid("%s is %s", (flag, expected) => {
    expect(getLongFlagName(flag)).toBe(expected);
  });
});

describe("parseFlag", () => {
  const grid = test.each<[Flag, FlagParts]>([
    ["-h", { staff: "-h", prefix: "-", name: "h", body: undefined }],
    ["--help", { staff: "--help", prefix: "--", name: "help", body: undefined }],
    ["-abc", { staff: "-abc", prefix: "-", name: "abc", body: undefined }],
    ["--no-help", { staff: "--no-help", prefix: "--", name: "no-help", body: undefined }],
    ["-h=true", { staff: "-h", prefix: "-", name: "h", body: "true" }],
    ["--help=true", { staff: "--help", prefix: "--", name: "help", body: "true" }],
    ["-abc=true", { staff: "-abc", prefix: "-", name: "abc", body: "true" }],
    ["--no-help=true", { staff: "--no-help", prefix: "--", name: "no-help", body: "true" }]
  ]);
  grid("%s is %s", (flag, expected) => {
    expect(parseFlag(flag)).toEqual(expected);
  });
  test("could not parse", () => {
    expect(() => parseFlag("--he lp")).toThrow();
  });
});

import { describe, test, expect } from "@jest/globals";
import { toCamelCase } from "../../../source/input/options/casing";

describe("toCamelCase", () => {
  const grid = test.each([
    ["nodash", "nodash"],
    ["with-dash", "withDash"],
    ["with_underscore", "withUnderscore"],
    ["with-dash-and_underscore", "withDashAndUnderscore"],
    ["-leading-dash", "leadingDash"],
    ["_leading-underscore", "leadingUnderscore"],
    ["with space", "withSpace"]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(toCamelCase(string)).toBe(expected);
  });
});

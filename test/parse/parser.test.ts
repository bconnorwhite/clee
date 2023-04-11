import { describe, test, expect } from "@jest/globals";
import path from "node:path";
import {
  parseString,
  parseCSV,
  parseBoolean,
  parseNumber,
  parseInt,
  parseFloat,
  parseJSON,
  parseURL,
  parsePath,
  parseDate,
  parseCWD
} from "../../source/parse/parser/index.js";

test("parseString", () => {
  expect(parseString("hello")).toBe("hello");
});

describe("parseCSV", () => {
  test("undefined", () => {
    expect(parseCSV(undefined)).toBe(undefined);
  });
  test("empty", () => {
    expect(parseCSV("")).toEqual([""]);
  });
  test("simple", () => {
    expect(parseCSV("hello,world")).toEqual(["hello", "world"]);
  });
  test("outer quoted", () => {
    expect(parseCSV("hello,\"w,o,r,l,d\"")).toEqual(["hello", "w,o,r,l,d"]);
  });
  test("inner quoted", () => {
    expect(parseCSV("hello,Here is an \"inner, example\"")).toEqual(["hello", "Here is an \"inner, example\""]);
  });
  test("nested quoted", () => {
    expect(parseCSV("hello,Here is a \"nested\\\", \\\"example\"")).toEqual(["hello", "Here is a \"nested\\\", \\\"example\""]);
  });
  test("outer quoted with single escape", () => {
    expect(parseCSV("hello,\"w,o,r\\\",l,d\"")).toEqual(["hello", "w,o,r\\\",l,d"]);
  });
});

describe("parseBoolean", () => {
  const grid = test.each([
    ["True", true],
    ["t", true],
    ["yes", true],
    ["Y", true],
    ["1", true],
    ["false", false],
    ["f", false],
    ["No", false],
    ["n", false],
    ["0", false]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(parseBoolean(string)).toBe(expected);
  });
  test("throws", () => {
    expect(parseBoolean("hello")).toBe(undefined);
  });
});

describe("parseNumber", () => {
  const grid = test.each([
    ["1", 1],
    ["1.5", 1.5],
    ["-1", -1],
    ["-1.5", -1.5]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(parseNumber(string)).toBe(expected);
  });
  test("throws", () => {
    expect(() => parseNumber("hello")).toThrow("Unable to parse number.");
  });
});

describe("parseInt", () => {
  const grid = test.each([
    ["1", 1],
    ["-1", -1],
    ["1.5", 1]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(parseInt(string)).toBe(expected);
  });
  test("throws", () => {
    expect(() => parseInt("hello")).toThrow("Unable to parse integer.");
  });
});

describe("parseFloat", () => {
  const grid = test.each([
    ["1", 1],
    ["-1", -1],
    ["1.5", 1.5]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(parseFloat(string)).toBe(expected);
  });
  test("throws", () => {
    expect(() => parseFloat("hello")).toThrow("Unable to parse float.");
  });
});

describe("parseJSON", () => {
  const grid = test.each([
    ["{}", {}],
    ["[]", []],
    ["1", 1],
    ["1.5", 1.5],
    ["true", true],
    ["false", false],
    ["\"hello\"", "hello"]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(parseJSON(string)).toEqual(expected);
  });
  test("throws", () => {
    expect(() => parseJSON("hello")).toThrow("Unable to parse JSON.");
  });
});

describe("parseDate", () => {
  const now = new Date();
  const grid = test.each([
    ["2023-01-01", new Date("2023-01-01")],
    ["2023-01-01T00:00:00.000Z", new Date("2023-01-01T00:00:00.000Z")],
    [now.getTime().toString(), now]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(parseDate(string)).toStrictEqual(expected);
  });
  test("throws", () => {
    expect(() => parseDate("hello")).toThrow("Unable to parse Date.");
  });
});

describe("parseURL", () => {
  const grid = test.each([
    ["file:///hello", new URL("file:///hello")],
    ["http://example.com", new URL("http://example.com")],
    ["https://example.com", new URL("https://example.com")],
    ["https://example.com/", new URL("https://example.com/")],
    ["https://example.com/hello", new URL("https://example.com/hello")],
    ["https://example.com/hello/", new URL("https://example.com/hello/")]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(parseURL(string)).toStrictEqual(expected);
  });
  test("throws", () => {
    expect(() => parseURL("hello")).toThrow("Unable to parse URL.");
  });
});

describe("parsePath", () => {
  const grid = test.each([
    ["file:///hello", {
      absolute: "/hello",
      base: "hello",
      dir: "/",
      ext: "",
      name: "hello",
      relative: path.relative(process.cwd(), "/hello"),
      root: "/"
    }],
    ["/test/file.txt", {
      absolute: "/test/file.txt",
      base: "file.txt",
      dir: "/test",
      ext: ".txt",
      name: "file",
      relative: path.relative(process.cwd(), "/test/file.txt"),
      root: "/"
    }]
  ]);
  grid("%s is %s", (string, expected) => {
    expect(parsePath(string)).toEqual(expected);
  });
});

describe("parseCWD", () => {
  test("cwd", () => {
    const cwd = process.cwd();
    expect(parseCWD("test").endsWith("/test")).toBe(true);
    process.chdir(cwd);
  });
});

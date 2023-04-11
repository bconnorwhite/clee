import { describe, test, expect } from "@jest/globals";
import chalk from "chalk";
import { formatTable } from "../source/format.js";
import clee, { formatDefault, parseBoolean } from "../source/index.js";

describe("formatDefault", () => {
  test("undefined", () => {
    const result = formatDefault(undefined);
    expect(result).toStrictEqual(undefined);
  });
  test("string", () => {
    const result = formatDefault("test");
    expect(result).toStrictEqual("test");
  });
  test("object", () => {
    const result = formatDefault({ test: true });
    expect(result).toStrictEqual(`{ test: ${chalk.yellow("true")} }`);
  });
  test("error", () => {
    const result = formatDefault(new Error("test"));
    expect(result).toStrictEqual("test");
  });
});

describe("format output sync", () => {
  const cmdSync = clee("clee")
    .option("-f", "--flag", "Description", parseBoolean)
    .action((options) => {
      return options.flag;
    })
    .format((result) => {
      return `Result: ${result}`;
    });
  test("action", async () => {
    const result = await cmdSync.parse(["--flag=true"]);
    expect(result).toStrictEqual({
      message: "Result: true"
    });
  });
});

describe("format output async", () => {
  const cmdAsync = clee("clee")
    .option("-f", "--flag", "Description", (flag: string | undefined) => Promise.resolve(parseBoolean(flag)))
    .action(async (options) => {
      const flag = await options.flag;
      return flag;
    })
    .format((result) => {
      return `Result: ${result}`;
    });
  test("action", async () => {
    const result = await cmdAsync.parse(["--flag=true"]);
    expect(result).toStrictEqual({
      message: "Result: true"
    });
  });
});

describe("format table", () => {
  test("basic", () => {
    const result = formatTable([
      { header_name: "test", int: "1", float: "1.1", dollar: "$12.12" },
      { header_name: "testing a longer string", int: "2", float: "1.0", dollar: "$1.10" }
    ]);
    expect(result).toBe([
      "Header Name             Int Float Dollar",
      "test                      1   1.1 $12.12",
      "testing a longer string   2   1.0  $1.10"
    ].join("\n"));
  });
});

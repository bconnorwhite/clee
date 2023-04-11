import { describe, test, expect } from "@jest/globals";
import clee, { parsePath } from "../source/index.js";

describe("cwd", () => {
  test("cwd", async () => {
    const cmd = clee("clee")
      .cwd("-c", "--cwd", "CWD");
    const result = await cmd.parse(["-h"]);
    expect(result).toStrictEqual({
      message: "Usage: clee\n\nOptions:\n  -c, --cwd   CWD\n  -h, --help  Display help for command"
    });
  });
  test("path parsing", async () => {
    const startCWD = process.cwd();
    const cmd = clee("clee")
      .option("--path", parsePath)
      .action((options) => {
        return options.path?.absolute;
      });
    const result = await cmd.parse(["--path", "test", "--cwd", "./test/parse"]);
    expect(process.cwd().endsWith("test/parse")).toBe(true);
    expect(result.message?.endsWith("test/parse/test")).toBe(true);
    process.chdir(startCWD);
  });
});

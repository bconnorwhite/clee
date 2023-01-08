import { describe, test, expect } from "@jest/globals";
import clee, { parseBoolean, parseString } from "../source/index.js";

describe("subcommand", () => {
  const sub = clee("sub")
    .argument("[arg1]", parseBoolean)
    .action((arg1) => {
      return arg1;
    })
    .format((result) => {
      return result ? "SubTrue" : "SubFalse";
    });
  const cmd = clee("clee")
    .argument("[arg1]", parseString)
    .command(sub)
    .action((arg1) => {
      return arg1;
    })
    .format((result) => {
      return result ? "ParentTrue" : "ParentFalse";
    });
  test("usage", async () => {
    const result = await cmd.parse(["-h"]);
    expect(result).toStrictEqual({
      message: "Usage: clee [command] [arg1]\n\nOptions:\n  -h, --help  Display help for command\n\nCommands:\n  sub [arg1]"
    });
  });
  test("sub action", async () => {
    const result = await cmd.parse(["sub", "true"]);
    expect(result).toStrictEqual({ message: "SubTrue" });
  });
  test("parent action", async () => {
    const result = await cmd.parse(["true"]);
    expect(result).toStrictEqual({ message: "ParentTrue" });
  });
});

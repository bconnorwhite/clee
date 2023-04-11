import { expectType } from "tsd";
import clee, { Option, parsePath, parseCWD } from "../source/index.js";
import { Path } from "../source/parse/index.js";

const cmd = clee("test")
  .option("-f", "--flag");

expectType<{ flag: Option<"--flag", boolean | undefined>; }>(cmd.options());

const cmd2 = clee("test")
  .options(cmd.options())
  .action((options) => options)({ flag: undefined });

expectType<{ flag: boolean | undefined; }>(cmd2);

const cmd3 = clee("test")
  .option("-o", "--other")
  .options(cmd.options())
  .action((options) => options)({ flag: undefined });

expectType<{ flag: boolean | undefined; }>(cmd3);

const cmd4 = clee("test")
  .description("Test")
  .option("--path", "Test", parsePath)
  .option("--boolean", "A boolean flag.")
  .action((options) => options);

expectType<{ path: Option<"--path", Path | undefined>; boolean: Option<"--boolean", boolean | undefined>; }>(cmd4.options());

const cmd5 = clee("test")
  .option("--cwd", parseCWD)
  .action((options) => options)({ cwd: "test" });

expectType<{ cwd: string; }>(cmd5);

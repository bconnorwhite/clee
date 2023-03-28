import { expectType } from "tsd";
import clee, { Option, parsePath } from "../source/index.js";
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
  .option("--path", parsePath)
  .option("--boolean", "A boolean flag.")
  .action((options) => options);

expectType<{ path: Option<"--path", Path | undefined>; boolean: Option<"--boolean", boolean | undefined>; }>(cmd4.options());

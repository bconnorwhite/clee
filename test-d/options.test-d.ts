import { expectType } from "tsd";
import clee, { Option } from "../source";

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

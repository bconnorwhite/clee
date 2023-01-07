import { expectType } from "tsd";
import clee, { Argument } from "../source/index.js";

const cmd = clee("test")
  .argument("[test]");

expectType<[Argument<string | undefined>]>(cmd.arguments());

const cmd2 = clee("test")
  .arguments(cmd.arguments())
  .action((test) => {
    return test;
  })(undefined);

expectType<string | undefined>(cmd2);

import { expectType } from "tsd";
import clee, { Command } from "../source/index.js";

const sub1 = clee("sub1");

const sub2 = clee("sub2");

const cmd = clee("cmd")
  .command(sub1)
  .command(sub2);

type Expected = Command<"cmd", [], object, void, {
  sub1: Command<"sub1", [], object, void, undefined>;
  sub2: Command<"sub2", [], object, void, undefined>;
}>;

expectType<Expected>(cmd);


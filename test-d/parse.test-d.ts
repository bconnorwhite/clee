import { expectType } from "tsd";
import clee, { ParseResult } from "../source/index.js";

// Parse

const parseResult = clee("test")
  .action(() => "test")
  .parse([]);

expectType<Promise<ParseResult>>(parseResult);

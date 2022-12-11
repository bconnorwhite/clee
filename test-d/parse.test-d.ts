import { expectType } from "tsd";
import clee, { ParseResult } from "../source";

// Parse

const parseResult = clee("test")
  .action(() => "test")
  .parse([]);

expectType<Promise<ParseResult>>(parseResult);

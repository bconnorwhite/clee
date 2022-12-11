import { expectType } from "tsd";
import clee, { ParseResult } from "../source";

expectType<string>(clee("ok").action(() => "ok")());

expectType<Promise<ParseResult>>(clee("ok").action(() => "ok").parse([]));

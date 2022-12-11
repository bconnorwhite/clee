import { expectType } from "tsd";
import clee, { Command } from "../source";

// Title

const commandResult = clee("test").title("Description");

expectType<Command<"test">>(commandResult);

const titleResult = clee("test").title();

expectType<string | undefined>(titleResult);


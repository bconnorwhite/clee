import { expectType } from "tsd";
import clee, { Command } from "../source";

// Name

const commandResult = clee("test").name("other");

expectType<Command<"other">>(commandResult);

const nameResult = clee("test").name();

expectType<"test">(nameResult);


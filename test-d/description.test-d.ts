import { expectType } from "tsd";
import clee, { Command } from "../source/index.js";

// Description

const commandResult = clee("test").description("Description");

expectType<Command<"test">>(commandResult);

const descriptionResult = clee("test").description();

expectType<string | undefined>(descriptionResult);


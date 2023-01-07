import { expectType } from "tsd";
import clee, { parseBoolean, parseString } from "../source/index.js";

// Call

const callResult = clee("test")
  .action(() => "test")();

expectType<string>(callResult);

// With Arguments

const callResultWithArg = clee("test")
  .argument("[arg]")
  .action((arg) => arg)(undefined);

expectType<string | undefined>(callResultWithArg);

const callResultWithArgCustomParser = clee("test")
  .argument("[arg]", parseBoolean)
  .action((arg) => arg)(undefined);

expectType<boolean | undefined>(callResultWithArgCustomParser);

const callResultWithVariadicArg = clee("test")
  .argument("[arg...]")
  .action((arg) => arg)(undefined);

expectType<string[] | undefined>(callResultWithVariadicArg);

const callResultWithVariadicArgCustomParser = clee("test")
  .argument("[arg...]", parseBoolean)
  .action((arg) => arg)(undefined);

expectType<boolean[] | undefined>(callResultWithVariadicArgCustomParser);

const callResultWithRequiredArg = clee("test")
  .argument("<arg>")
  .action((arg) => arg)("arg");

expectType<string>(callResultWithRequiredArg);

const callResultWithRequiredArgCustomParser = clee("test")
  .argument("<arg>", parseBoolean)
  .action((arg) => arg)(true);

expectType<boolean>(callResultWithRequiredArgCustomParser);

const callResultWithRequiredVariadicArg = clee("test")
  .argument("<arg...>")
  .action((arg) => arg)(["arg"]);

expectType<string[]>(callResultWithRequiredVariadicArg);

const callResultWithRequiredVariadicArgCustomParser = clee("test")
  .argument("<arg...>", parseBoolean)
  .action((arg) => arg)([true]);

expectType<boolean[]>(callResultWithRequiredVariadicArgCustomParser);

// With Options

const callResultWithOption = clee("test")
  .option("-f", "--flag")
  .action((options) => options)({ flag: undefined });

expectType<{ flag: boolean | undefined; }>(callResultWithOption);

const callResultWithOptionCustomParser = clee("test")
  .option("-f", "--flag", parseString)
  .action((options) => options)({ flag: "string" });

expectType<{ flag: string | undefined; }>(callResultWithOptionCustomParser);

const callResultWithOptionalOption = clee("test")
  .option("-f", "--flag", "[flag]")
  .action((options) => options)({ flag: undefined });

expectType<{ flag: boolean | undefined; }>(callResultWithOptionalOption);

const callResultWithOptionalOptionCustomParser = clee("test")
  .option("-f", "--flag", "[flag]", parseString)
  .action((options) => options)({ flag: "test" });

expectType<{ flag: string | undefined; }>(callResultWithOptionalOptionCustomParser);

const callResultWithOptionalVariadicOption = clee("test")
  .option("-f", "--flag", "[flag...]")
  .action((options) => options)({ flag: undefined });

expectType<{ flag: boolean[] | undefined; }>(callResultWithOptionalVariadicOption);

const callResultWithOptionalVariadicOptionCustomParser = clee("test")
  .option("-f", "--flag", "[flag...]", parseString)
  .action((options) => options)({ flag: ["test"] });

expectType<{ flag: string[] | undefined; }>(callResultWithOptionalVariadicOptionCustomParser);

const callResultWithRequiredOption = clee("test")
  .option("-f", "--flag", "<flag>")
  .action((options) => options)({ flag: true });

expectType<{ flag: boolean; }>(callResultWithRequiredOption);

const callResultWithRequiredOptionCustomParser = clee("test")
  .option("-f", "--flag", "<flag>", parseString)
  .action((options) => options)({ flag: "test" });

expectType<{ flag: string; }>(callResultWithRequiredOptionCustomParser);

const callResultWithRequiredVariadicOption = clee("test")
  .option("-f", "--flag", "<flag...>")
  .action((options) => options)({ flag: [true] });

expectType<{ flag: boolean[]; }>(callResultWithRequiredVariadicOption);

const callResultWithRequiredVariadicOptionCustomParser = clee("test")
  .option("-f", "--flag", "<flag...>", parseString)
  .action((options) => options)({ flag: ["test"] });

expectType<{ flag: string[]; }>(callResultWithRequiredVariadicOptionCustomParser);

import { expectType } from "tsd";
import clee, { parseBoolean, parsePath, Path } from "../source/index.js";

// This file tests returning an object from a parser.

// Options, then Arguments

const cmd1 = clee("test")
  .option("--flag1")
  .argument("[test]", "Description.", parsePath)
  .action((test, options) => {
    return {
      test,
      options
    };
  })(parsePath("."), { flag1: true });

expectType<{ test: Path | undefined, options: { flag1?: boolean | undefined; } | undefined }>(cmd1);

const cmd2 = clee("test")
  .option("--flag1")
  .argument("<test>", "Description.", parsePath)
  .action((test, options) => {
    return {
      test,
      options
    };
  })(parsePath(".") as Path, { flag1: true });

expectType<{ test: Path, options: { flag1?: boolean | undefined; } | undefined }>(cmd2);

// Arguments, then Options

const cmd3 = clee("test")
  .argument("<test>", "Description.", parsePath)
  .option("--flag1", parseBoolean)
  .action((test, options) => {
    return {
      test,
      options
    };
  })(parsePath(".") as Path, { flag1: true });

expectType<{ test: Path, options: { flag1?: boolean | undefined; } | undefined }>(cmd3);

const cmd4 = clee("test")
  .argument("[test]", "Description.", parsePath)
  .option("--flag1", parseBoolean)
  .action((test, options) => {
    return {
      test,
      options
    };
  })(parsePath("."), { flag1: true });

expectType<{ test: Path | undefined, options: { flag1?: boolean | undefined; } | undefined }>(cmd4);

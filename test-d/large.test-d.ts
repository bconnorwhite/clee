import { expectType } from "tsd";
import clee, { parseString } from "../source";

const subCmd1 = clee("subCmd1")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const subCmd2 = clee("subCmd2")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const subCmd3 = clee("subCmd3")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const subCmd4 = clee("subCmd3")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const subCmd5 = clee("subCmd5")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const subCmd6 = clee("subCmd6")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const subCmd7 = clee("subCmd7")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const subCmd8 = clee("subCmd8")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const cmd1 = clee("cmd1")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .command(subCmd1)
  .command(subCmd2)
  .command(subCmd3)
  .command(subCmd4)
  .command(subCmd5)
  .command(subCmd6)
  .command(subCmd7)
  .command(subCmd8)
  .action((options) => options);

const cmd2 = clee("cmd2")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .command(subCmd1)
  .command(subCmd2)
  .command(subCmd3)
  .command(subCmd4)
  .command(subCmd5)
  .command(subCmd6)
  .command(subCmd7)
  .command(subCmd8)
  .action((options) => options);

const cmd3 = clee("cmd3")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .command(subCmd1)
  .command(subCmd2)
  .command(subCmd3)
  .command(subCmd4)
  .command(subCmd5)
  .command(subCmd6)
  .command(subCmd7)
  .command(subCmd8)
  .action((options) => options);

const cmd4 = clee("cmd3")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .command(subCmd1)
  .command(subCmd2)
  .command(subCmd3)
  .command(subCmd4)
  .command(subCmd5)
  .command(subCmd6)
  .command(subCmd7)
  .command(subCmd8)
  .action((options) => options);

const cmd5 = clee("cmd5")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .command(subCmd1)
  .command(subCmd2)
  .command(subCmd3)
  .command(subCmd4)
  .command(subCmd5)
  .command(subCmd6)
  .command(subCmd7)
  .command(subCmd8)
  .action((options) => options);

const cmd6 = clee("cmd6")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .command(subCmd1)
  .command(subCmd2)
  .command(subCmd3)
  .command(subCmd4)
  .command(subCmd5)
  .command(subCmd6)
  .command(subCmd7)
  .command(subCmd8)
  .action((options) => options);

const cmd7 = clee("cmd7")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .command(subCmd1)
  .command(subCmd2)
  .command(subCmd3)
  .command(subCmd4)
  .command(subCmd5)
  .command(subCmd6)
  .command(subCmd7)
  .command(subCmd8)
  .action((options) => options);

const cmd8 = clee("cmd8")
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .command(subCmd1)
  .command(subCmd2)
  .command(subCmd3)
  .command(subCmd4)
  .command(subCmd5)
  .command(subCmd6)
  .command(subCmd7)
  .command(subCmd8)
  .action((options) => options);

const summary = clee("summary")
  .command(cmd1)
  .command(cmd2)
  .command(cmd3)
  .command(cmd4)
  .command(cmd5)
  .command(cmd6)
  .command(cmd7)
  .command(cmd8)
  .option("-f", "--flag1", "[value]", "description", parseString)
  .option("-g", "--flag2")
  .option("-b", "--boolean", "[value]", "description")
  .action((options) => options);

const summaryResult = summary({ flag1: undefined, flag2: undefined, boolean: undefined });

expectType<{ flag1: string | undefined; flag2: boolean | undefined; boolean: boolean | undefined; }>(summaryResult);


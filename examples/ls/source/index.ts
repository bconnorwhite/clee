import clee, { parseDirectory } from "clee";
import { Dirent } from "fs";

clee("ls")
  .title({ font: "Slant" })
  .description("List directory contents")
  .argument("[path]", "The path to the directory to list.", parseDirectory)
  .option("-a", "--all", "Include directory entries whose names begin with a dot.")
  .option("-l", "--long", "List files in the long format.")
  .option("-r", "--reverse", "Reverse the order of the sort.")
  .option("-s", "--silent", "Suppress normal output.")
  .version(import.meta.url)
  .action(async (path, options): Promise<Dirent[]> => {
    const directory = (path ? await path : await parseDirectory(process.cwd())) ?? [];
    if(options.reverse) {
      directory.reverse();
    }
    if(options.all) {
      return directory;
    } else {
      return directory.filter((item) => !item.name.startsWith("."));
    }
  })
  .format((entries: Dirent[], options) => {
    const maxLength = entries.reduce((retval, item) => {
      return Math.max(retval, item.name.length);
    }, 0);
    if(options?.long) {
      return entries.reduce((retval, item, index) => {
        return `${retval}${item.isDirectory() ? "d" : "-"} ${item.name}${index < entries.length-1 ? "\n" : ""}`;
      }, "");
    } else {
      return entries.reduce((retval, item) => {
        return `${retval}${item.name.padEnd(maxLength + 1)}`;
      }, "");
    }
  }, "silent")
  .parse();

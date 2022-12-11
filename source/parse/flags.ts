
type LowerCaseLetter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
type UpperCaseLetter = Uppercase<LowerCaseLetter>;

type Letter = LowerCaseLetter | UpperCaseLetter;

type ShortFlagPrefix = "-";
type LongFlagPrefix = "--";

type FlagPrefix = ShortFlagPrefix | LongFlagPrefix;

export type ShortFlag = `${ShortFlagPrefix}${Letter}`;
export type LongFlag = `${LongFlagPrefix}${Letter}${string}`;
export type CompoundFlag = `${ShortFlagPrefix}${Letter}${Letter}${string}`;

export type FlagWithBody = `${ShortFlag | CompoundFlag | LongFlag}=${string}`;

export type Flag = ShortFlag | CompoundFlag | LongFlag | FlagWithBody;


/**
 * A flag is made up of a few parts:
 * - staff: The name of the flag without a body, ex: "--help" for "--help=true"
 * - prefix: The prefix of the flag, either "-" or "--"
 * - name: The name of the flag without a prefix, e.g. "help" for "--help"
 * - body: The body of the flag, e.g. "true" for "--help=true"
 */
export type FlagParts = {
  staff: Flag;
  prefix: FlagPrefix;
  name: string;
  body: string | undefined;
};

export function isLetter(string: string): string is Letter {
  return (/^[a-zA-Z]$/).test(string);
}

export function getShortFlag(letter: Letter): ShortFlag {
  return `-${letter}` as ShortFlag;
}

/**
 * Returns true if `string` is a flag.
 */
export function isFlag(value: any): value is Flag {
  return typeof value === "string" && (/^--?[^-=\s]+/).test(value);
}

export function isShortFlag(value: any): value is ShortFlag {
  return typeof value === "string" && (/^-[^-=\s]+/).test(value);
}

export function isLongFlag(value: any): value is LongFlag {
  return typeof value === "string" && (/^--[^-=\s]+/).test(value);
}

export function isCompoundFlag(value: any): value is CompoundFlag {
  return typeof value === "string" && (/^-[^-=\s]{2,}/).test(value);
}

export function isInverseFlag(flag: LongFlag) {
  return flag.startsWith("--no-");
}

export function getLongFlagName(flag: LongFlag) {
  return flag.replace(/^--/, "");
}

export function parseFlag(fullFlag: Flag): FlagParts {
  const parts = new RegExp(/^((--?)([^=\s]+))(?:=(\S*))?$/g).exec(fullFlag);
  if(parts !== null) {
    const [, staff, prefix, name, body] = parts as unknown as [string, Flag, FlagPrefix, string, string | undefined];
    return {
      staff,
      prefix,
      name,
      body
    };
  } else {
    throw new Error(`Could not parse flag: ${fullFlag}`);
  }
}

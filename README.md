<div align="center">
  <h1>clee</h1>
  <a href="https://npmjs.com/package/clee">
    <img alt="npm" src="https://img.shields.io/npm/v/clee.svg">
  </a>
  <a href="https://github.com/bconnorwhite/clee">
    <img alt="typescript" src="https://img.shields.io/github/languages/top/bconnorwhite/clee.svg">
  </a>
</div>

<br />

<blockquote align="center">Create CLI applications with glee 🎉</blockquote>

<br />

_If I should maintain this repo, please ⭐️_
<a href="https://github.com/bconnorwhite/clee">
  <img align="right" alt="GitHub stars" src="https://img.shields.io/github/stars/bconnorwhite/clee?label=%E2%AD%90%EF%B8%8F&style=social">
</a>

_DM me on [Twitter](https://twitter.com/bconnorwhite) if you have questions or suggestions._
<a href="https://twitter.com/bconnorwhite">
  <img align="right" alt="Twitter Follow" src="https://img.shields.io/twitter/url?label=%40bconnorwhite&style=social&url=https%3A%2F%2Ftwitter.com%2Fbconnorwhite">
</a>

---

Clee is a library for creating CLI applications with TypeScript. It is designed to be easy to use, and easy to test. It is also easy to break commands into modules, for reuse as an API or CLI.

## Contents
- [Why Clee?](#why-clee)  
- [Installation](#installation)  
- [Structure](#structure)  
- [Usage](#usage)  
  - [Base Settings](#base-settings)
  - [Inputs](#inputs)
    - [Arguments](#arguments)
    - [Options](#options)
    - [Parsers](#parsers)
  - [Commands](#commands)
  - [Other Settings](#other-settings)
  - [Action](#action)
  - [Call](#call)
  - [Run](#run)
  - [Format](#format)
  - [Parse](#parse)
  - [Types](#types)
- [Examples](#examples)
  - [ls](/examples/ls/README.md)
- [Dependencies](#dependencies)
- [License](#license)



## Why Clee?

- TypeScript native
- Enables extreme modularity
- Easy to test
- Call as an API, or parse arguments as a CLI

### Additional Features

- Built-in parsers for 11 common types
- Built-in formatters in 5 common patterns
- Built-in support for [figlet](https://www.npmjs.com/package/figlet) titles
- Automatically load version from package.json

## Installation

```sh
npm install get-module-pkg
```

```sh
yarn add get-module-pkg
```

## Structure

Clee is heavily inspired by [commander](https://github.com/tj/commander.js). The base unit of Clee is a `Command`. A `Command` is a function that takes arguments and options, and returns a result.

### Data Flow

A `Command` can be either called directly, or parsed from the command line. When a `Command` is called directly, if follows the following stages:

<div align="center">
  <code>[function input]</code> -> <code>[parser]</code> -> <code>[action]</code> -> <code>[function return]</code>
</div>

<br />

When a command is parsed from the command line, the result is also formatted and then output to the console:

<div align="center">
  <code>[cli arguments]</code> -> <code>[parser]</code> -> <code>[action]</code> -> <code>[formatter]</code> -> <code>[cli output]</code>
</div>

#### Parser

Each argument and option has a parser, which takes a string an returns a value.

#### Action

An action takes parsed arguments and options, and returns a result.

#### Formatter

A formatter takes the result of an action, and formats it for output to the console.

## Usage

### Base Settings

Each command can have a name, title, and description. These are used when generating the help screen:

```ts
import clee, { pathParser } from "clee";

clee("my-program")
  .title({ font: "Slant" }) // Settings for creating a figlet title
  .description("Description") // Custom description to display on the help screen
```

Example help screen:
```
                                                                    
   ____ ___  __  __      ____  _________  ____ __________ _____ ___ 
  / __ `__ \/ / / /_____/ __ \/ ___/ __ \/ __ `/ ___/ __ `/ __ `__ \
 / / / / / / /_/ /_____/ /_/ / /  / /_/ / /_/ / /  / /_/ / / / / / /
/_/ /_/ /_/\__, /     / .___/_/   \____/\__, /_/   \__,_/_/ /_/ /_/ 
          /____/     /_/               /____/                       

Description

Usage: my-program

Options:
  -h, --help  Display help for command
```
### Inputs

Commands can have arguments and options. Either can be required or optional.

Required arguments are denoted using square brackets, while optional arguments are denoted using angle brackets.

```ts
"<required>"
"[optional]"
```

Additionally, three dots can be used to denote a variadic argument. However, only the last argument can be variadic:

```ts
"<required_variadic...>"
"[optional_variadic...]"
```

#### Arguments

Arguments can be required or optional, and can have a description and a custom parser.

```ts
import clee from "clee";

clee("my-program")
  .argument("<name>") // An required argument with no description, using the default string parser
  .argument("[path]", "Description", pathParser) // An optional argument using a custom parser
```

#### Options

Options can have both a short and long flag, or a long flag only. They can also have a description, and a custom parser.

```ts
import clee, { stringParser } from "clee";

clee("my-program")
  .option("--flag") // An option with no description, using the default boolean parser
  .option("--required", "<value>") // A required option
  .option("--header", "[value...]") // An optional variadic option
  .option("-o", "--other", "Description", stringParser) // An option using a custom parser
```

##### Option Values
Values can be provided to options with either a space or an equals sign.

```
--flag value
--flag=value
```
###### Compound Flags
Additionally, compound flags can be used to group multiple short flags together:
```
-abc
```
###### Variadic Options
Variadic options can be provided by listing multiple values, or by repeating the flag multiple times:
```
--header value1 value2
--header value1 --header value2
```

#### Parsers

Arguments and Options can both supply custom parsers. Several are provided with clee:

```ts
import {
  parseString,
  parseBoolean,
  parseNumber,
  parseInt,
  parseFloat,
  parseJSON,
  parseDate,
  parseURL,
  parsePath,
  parseFile,
  parseDirectory
} from "clee";
```

### Commands

Commands can also be nested, and have their own arguments, options, actions, and sub-commands.

```ts
import clee from "clee";

const sub = clee("sub")
  .action(() => {
    console.log("Hello from sub command");
  });

clee("my-program")
  .command(sub);
```

### Other Settings

#### Help

The help flag can be customized with a short flag, long flag, and description:
```ts
import clee from "clee";

clee("my-program")
  .help("-e", "--example", "Custom help description");
```

By default, `-h` and `--help` are used.

#### Version

A version flag can be added by either hardcoding the value, or by passing a path to a file in project with a package.json:

```ts
import clee from "clee";

clee("my-program")
  .version("1.0.0") // Hardcoded version

clee("my-program-2")
  .version(import.meta.url) // Version from package.json
```
If an absolute path is provided, the nearest package.json's version will be used.

Additionally, the version flags and description can also be customized:
```ts
import clee from "clee";

clee("my-program")
  .version("1.0.0", "-e", "--example", "Custom version description")
```

By default, `-v` and `--version` are used.

### Action

A command's action is called when the command is parsed from the command line. The action can be async, and can return a value, which will be passed to the formatter.

```ts
import clee from "clee";

clee("clee").action(() => {
  console.log("Hello from clee");
});
```

### Call

A command can be called directly as a function. The arguments should match the inputs to `action`:

```ts
import clee from "clee";

const cmd = clee("clee")
  .argument("<name>")
  .option("-e", "--exclaimation", "Include an exclaimation point")
  .action((name, options) => {
    return `Hello ${name}${options.exclaimation ? "!" : ""}`;
  });

cmd("World", { exclaimation: true }); // Hello World!
```

### Format

Commands can also have formatters. Formatters are bypassed if a command is called directly, but are used when the command is parsed from the command line:

```ts
import clee from "clee";

clee("clee")
  .action(() => {
    return ["line 1", "line 2"];
  })
  .format((result) => {
    return result.join("\n");
  });
```

Several built-in formatters are also included with clee:
```ts
import {
  formatDefault,
  formatBuffer,
  formatJSON,
  formatJSONPretty,
  formatStringsToLines
} from "clee";
```

### Run
Run allows you to run a subcommand from a parent command:

```ts
import clee from "clee";

const sub = clee("sub")
  .action(() => {
    console.log("Hello from sub command");
  });

const cmd = clee("my-program")
  .command(sub);

cmd.run("sub"); // Hello from sub command
```

### Parse
By default, parse will use `process.argv.slice(2)`, but a custom array can also be provided:

```ts
import clee from "clee";

const cmd = clee("clee")
  .argument("<lines...>")
  .action((lines) => {
    return lines.map((line) => `${line}.`)
  })
  .format((result) => {
    return result.join("\n");
  });

cmd.parse(["one", "two", "three"]);

// Output:
// one.
// two.
// three.

// To reads from process.argv.slice(2):
// cmd.parse(); 
```

### Types

Types are also provided for deriving various types from a `Command`:

```ts
import {
  CommandName,
  CommandInput,
  CommandArguments,
  CommandOptions,
  CommandResult,
  CommandSubCommands
} from "clee";

type Name = CommandName<typeof command>;
type Input = CommandInput<typeof command>;
type Arguments = CommandArguments<typeof command>;
type Options = CommandOptions<typeof command>;
type Result = CommandResult<typeof command>;
type SubCommands = CommandSubCommands<typeof command>;
```

## Examples

- [ls](/examples/ls/README.md)

<br />

<h2 id="dependencies">Dependencies<a href="https://www.npmjs.com/package/get-module-pkg?activeTab=dependencies"><img align="right" alt="dependencies" src="https://img.shields.io/hackage-deps/v/clee.svg"></a></h2>

- [figlet](https://www.npmjs.com/package/figlet): Creates ASCII Art from text. A full implementation of the FIGfont spec.
- [get-module-pkg](https://www.npmjs.com/package/get-module-pkg): Get your module's package.json without importing it
- [type-fest](https://www.npmjs.com/package/type-fest): A collection of essential TypeScript types
- [types-json](https://www.npmjs.com/package/types-json): Type checking for JSON objects

<h3 id="dev-dependencies">Dev Dependencies</h3>

- [@swc/core](https://www.npmjs.com/package/@swc/core): Super-fast alternative for babel
- [@swc/jest](https://www.npmjs.com/package/@swc/jest): Swc integration for jest
- [@types/figlet](https://www.npmjs.com/package/@types/figlet): TypeScript definitions for figlet
- [@types/node](https://www.npmjs.com/package/@types/node): TypeScript definitions for Node.js
- [chalk](https://www.npmjs.com/package/chalk): Terminal string styling done right
- [eslint](https://www.npmjs.com/package/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-bob](https://www.npmjs.com/package/eslint-config-bob): ESLint configuration for packages built with @bconnorwhite/bob
- [jest](https://www.npmjs.com/package/jest): Delightful JavaScript Testing.
- [ts-node](https://www.npmjs.com/package/ts-node): TypeScript execution environment and REPL for node.js, with source map support
- [tsd](https://www.npmjs.com/package/tsd): Check TypeScript type definitions
- [typescript](https://www.npmjs.com/package/typescript): TypeScript is a language for application scale JavaScript development

<br />


<h2 id="license">License <a href="https://opensource.org/licenses/MIT"><img align="right" alt="license" src="https://img.shields.io/npm/l/clee.svg"></a></h2>

[MIT](https://opensource.org/licenses/MIT)


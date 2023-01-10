<div align="center">
  <h1>clee</h1>
  <img alt="Platform: Node" src="https://img.shields.io/badge/Node-%23339933?logo=node.js&logoColor=white" />
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
- [Overview](#overview)
- [Usage](#usage)
  - [Base Settings](#base-settings)
  - [Inputs](#inputs)
    - [Arguments](#arguments)
    - [Options](#options)
  - [Parsers](#parsers)
  - [Action](#action)
  - [Format](#format)
  - [Parse](#parse)
  - [Subcommands](#subcommands)
  - [Other Settings](#other-settings)
  - [Types](#types)
- [Examples](#examples)
  - [ls](/examples/ls/README.md)
- [Dependencies](#dependencies)
- [License](#license)

## Why Clee?

- ✨ TypeScript native
- 📦 Enables extreme modularity
- 🧪 Easy to test
- 🔧 Reusable - call as an API, or parse arguments as a CLI
- 🤔 Optional user prompting for missing arguments

### Additional Features

- Includes parsers for 11 common types
- Includes formatters in 5 common patterns
- Includes configurable [figlet](https://www.npmjs.com/package/figlet) titles
- Automatically load version from package.json

## Installation

<details open>
  <summary>
    <a href="https://www.npmjs.com/package/clee">
      <img src="https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white" alt="NPM" />
    </a>
  </summary>

```sh
npm install clee
```

</details>
<details open>
  <summary>
    <a href="https://yarnpkg.com/package/clee">
      <img src="https://img.shields.io/badge/yarn-2C8EBB?logo=yarn&logoColor=white" alt="Yarn" />
    </a>
  </summary>

```sh
yarn add clee
```

</details>
<details open>
  <summary>
    <img src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white" alt="PNPM" />
  </summary>

```sh
pnpm add clee
```

</details>

## Overview

Clee is heavily inspired by [commander](https://github.com/tj/commander.js). The base unit of Clee is a Command. A Command is a function that takes arguments and options, and returns a result:

```ts
import clee from "clee";

const command = clee("my-command")
  .argument("[name]", "Your name")
  .action((name) => {
    return `Hello, ${name}!`;
  });
```

### Both a Program, and a Function

Commands are reusable as both programs that you can run from the command line, and as functions that you can call from anywhere in your code:

```ts
// Call as a function
command("Bob");

// Parse arguments from the command line
command.parse();
```

### Data Flow

Commands have several stages, and each stage can be customized:

- **Parser** - _Converts a raw string to a parsed value_
- **Action** - _Takes parsed arguments and options, and returns a result_
- **Formatter** - _Takes the result of an action, and formats it for output to the console_

When a Command is called as a function, if follows the following steps:

---

#### Function Data Flow

<br />

<div align="center">
  <code>[function input]</code> -> <code>[parser]</code> -> <code>[action]</code> -> <code>[function return]</code>
</div>

<br />

---

When a command is parsed from the command line, the result is also formatted and then output to the console:

---

#### CLI Program Data Flow

<br />

<div align="center">
  <code>[CLI input]</code> -> <code>[parser]</code> -> <code>[action]</code> -> <code>[formatter]</code> -> <code>[CLI output]</code>
</div>

<br />

---

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

### Parsers

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

Additionally, a few prompt parsers are provided. If no value is provided, these will prompt the user for input, using [Enquirer](https://www.npmjs.com/package/enquirer):
```ts
import {
  promptString,
  promptBoolean,
  promptNumber,
  promptInt,
  promptFloat
} from "clee";
```

### Action

A command's action is called when the command is parsed from the command line. The action can be async, and can return a value, which will be passed to the formatter.

```ts
import clee from "clee";

clee("clee").action(() => {
  console.log("Hello from clee");
});
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

### Parse

By default, parse will use `process.argv.slice(2)`, but a custom array can also be provided:

```ts
// Read from `process.argv.slice(2)`:
cmd.parse();

// Provide custom arguments:
cmd.parse(["one", "two", "three"]);
```

### Subcommands

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

#### Run
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

- [ls](/examples/ls/README.md) - A simple ls program

<br />

<h2 id="dependencies">Dependencies<a href="https://www.npmjs.com/package/clee?activeTab=dependencies"><img align="right" alt="dependencies" src="https://img.shields.io/librariesio/release/npm/clee.svg"></a></h2>

- [enquirer](https://www.npmjs.com/package/enquirer): Stylish, intuitive and user-friendly prompt system. Fast and lightweight enough for small projects, powerful and extensible enough for the most advanced use cases.
- [figlet](https://www.npmjs.com/package/figlet): Creates ASCII Art from text. A full implementation of the FIGfont spec.
- [get-module-pkg](https://www.npmjs.com/package/get-module-pkg): Get your module's package.json without importing it
- [read-boolean](https://www.npmjs.com/package/read-boolean): A simple utility for parsing boolean values from strings.
- [typed-case](https://www.npmjs.com/package/typed-case): Convert between typesafe string casings
- [types-json](https://www.npmjs.com/package/types-json): Type checking for JSON objects

<h3 id="dev-dependencies">Dev Dependencies</h3>

- [@types/figlet](https://www.npmjs.com/package/@types/figlet): TypeScript definitions for figlet
- [@types/node](https://www.npmjs.com/package/@types/node): TypeScript definitions for Node.js
- [autorepo](https://www.npmjs.com/package/autorepo): Autorepo abstracts away your dev dependencies, providing a single command to run all of your scripts.
- [chalk](https://www.npmjs.com/package/chalk): Terminal string styling done right

<br />

<h2 id="license">License <a href="https://opensource.org/licenses/MIT"><img align="right" alt="license" src="https://img.shields.io/npm/l/clee.svg"></a></h2>

[MIT](https://opensource.org/licenses/MIT) - _The MIT License_


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

## Why Clee?

- TypeScript native
- Extremely modular
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
  <code>[input]</code> -> <code>[parser]</code> -> <code>[action]</code> -> <code>[return]</code>
</div>

<br />

When a command is parsed from the command line, the result is also formatted and then output to the console:

<div align="center">
  <code>[arguments]</code> -> <code>[parser]</code> -> <code>[action]</code> -> <code>[formatter]</code> -> <code>[output]</code>
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

### Arguments

```ts
import clee from "clee";

clee("my-program")
  .argument("name") // An argument with no description, using the default string parser
  .argument("path", "Description", pathParser) // An argument using a custom parser
```

### Options

```ts
import clee, { stringParser } from "clee";

clee("my-program")
  .option("--flag") // An option with no description, using the default boolean parser
  .argument("-o", "--other", "Description", stringParser) // An option using a custom parser
```

### Commands

### Other Settings
#### Help
#### Version

### Action
### Call
### Format
### Parse

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

<br />

<h2>Dependencies<a href="https://www.npmjs.com/package/get-module-pkg?activeTab=dependencies"><img align="right" alt="dependencies" src="https://img.shields.io/hackage-deps/v/clee.svg"></a></h2>

- [figlet](https://www.npmjs.com/package/figlet): Creates ASCII Art from text. A full implementation of the FIGfont spec.
- [get-module-pkg](https://www.npmjs.com/package/get-module-pkg): Get your module's package.json without importing it
- [types-json](https://www.npmjs.com/package/types-json): Type checking for JSON objects

<br />

<h2>Dev Dependencies</h2>

- [@types/node](https://www.npmjs.com/package/@types/node): TypeScript definitions for Node.js
- [eslint](https://www.npmjs.com/package/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-bob](https://www.npmjs.com/package/eslint-config-bob): ESLint configuration for packages built with @bconnorwhite/bob
- [typescript](https://www.npmjs.com/package/typescript): TypeScript is a language for application scale JavaScript development

<br />


<h2>License <a href="https://opensource.org/licenses/MIT"><img align="right" alt="license" src="https://img.shields.io/npm/l/clee.svg"></a></h2>

[MIT](https://opensource.org/licenses/MIT)


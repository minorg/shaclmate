# @shaclmate/cli

> ⚠️ **Under active development.** SHACLmate is experimental — both the compiler and generated code should be considered unstable and subject to breaking changes.

Command line tool for generating [TypeScript](https://www.typescriptlang.org/) code from [SHACL](https://www.w3.org/TR/shacl/) shapes.

## Prerequisites

* [Node.js](https://nodejs.org/) 18+

## Usage

    npx -y "@shaclmate/cli@latest" generate ts your-shapes.shaclmate.ttl >generated.ts

The generated code is serialized with minimal indentation and newlines. You will probably want to format it using a tool like [Biome](https://biomejs.dev/) or [prettier](https://prettier.io/).

## Runtime dependencies

The generated TypeScript code relies on various third-party libraries. The exact set of dependencies will depend on the code generated. See the [GitHub repository](https://github.com/YOUR_ORG/shaclmate) for examples and full documentation.

## License

[Apache 2.0](https://github.com/YOUR_ORG/shaclmate/blob/main/LICENSE)

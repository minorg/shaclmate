#!/usr/bin/env node
import {
  AstJsonGenerator,
  TsGenerator,
  ZodGenerator,
} from "@shaclmate/compiler";
import {
  command,
  option,
  restPositionals,
  run,
  string,
  subcommands,
} from "cmd-ts";
import { ExistingPath } from "cmd-ts/dist/cjs/batteries/fs.js";
import { generate } from "./commands/generate.js";

const inputPaths = restPositionals({
  displayName: "inputPaths",
  description:
    "paths to RDF files or directories of RDF files containing SHACL shapes",
  type: ExistingPath,
});

const outputFilePath = option({
  defaultValue: () => "",
  description:
    "path to a file to write output to; if not specified, write to stdout",
  long: "output-path",
  short: "o",
  type: string,
});

run(
  subcommands({
    cmds: {
      generate: subcommands({
        cmds: {
          "ast-json": command({
            name: "ast-json",
            description: "generate AST JSON for the SHACL shapes graph",
            args: {
              inputPaths,
              outputFilePath,
            },
            handler: async ({ inputPaths, outputFilePath }) => {
              generate({
                generator: new AstJsonGenerator(),
                inputPaths,
                outputFilePath,
              });
            },
          }),
          ts: command({
            name: "ts",
            description: "generate TypeScript for the SHACL shapes graph",
            args: {
              inputPaths,
              outputFilePath,
            },
            handler: async ({ inputPaths, outputFilePath }) => {
              generate({
                generator: new TsGenerator(),
                inputPaths,
                outputFilePath,
              });
            },
          }),
          zod: command({
            name: "zod",
            description: "generate Zod schemas for the SHACL shapes graph",
            args: {
              inputPaths,
              outputFilePath,
            },
            handler: async ({ inputPaths, outputFilePath }) => {
              generate({
                generator: new ZodGenerator(),
                inputPaths,
                outputFilePath,
              });
            },
          }),
        },
        name: "generate",
      }),
    },
    description: "shaclmate command line interface",
    name: "shaclmate",
  }),
  process.argv.slice(2),
);

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
import { merge } from "./commands/merge.js";
import { validate } from "./commands/validate.js";

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
        name: "generate",
        cmds: {
          "ast-json": command({
            name: "ast-json",
            description: "generate AST JSON for the SHACL shapes graph",
            args: {
              inputPaths,
              outputFilePath,
            },
            handler: async ({ inputPaths, outputFilePath }) => {
              (
                await generate({
                  generator: new AstJsonGenerator(),
                  inputPaths,
                  outputFilePath,
                })
              ).unsafeCoerce();
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
              (
                await generate({
                  generator: new TsGenerator(),
                  inputPaths,
                  outputFilePath,
                })
              ).unsafeCoerce();
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
              (
                await generate({
                  generator: new ZodGenerator(),
                  inputPaths,
                  outputFilePath,
                })
              ).unsafeCoerce();
            },
          }),
        },
      }),
      merge: command({
        name: "merge",
        description: "merge one or more RDF files",
        args: {
          inputPaths,
          outputFilePath,
        },
        handler: async ({ inputPaths, outputFilePath }) => {
          (
            await merge({
              inputPaths,
              outputFilePath,
            })
          ).unsafeCoerce();
        },
      }),
      validate: command({
        name: "validate",
        description: "validate a data graph with a shapes graph",
        args: {
          dataGraphPaths: restPositionals({
            description: "path(s) to a file or directory of data graph files",
            type: ExistingPath,
          }),
          shapesGraphPath: option({
            description: "path to a file or directory of shapes graph files",
            short: "s",
            long: "--shapes-graph",
            type: ExistingPath,
          }),
        },
        handler: async ({ dataGraphPaths, shapesGraphPath }) => {
          (
            await validate({
              dataGraphPaths,
              shapesGraphPaths: [shapesGraphPath],
            })
          ).unsafeCoerce();
        },
      }),
    },
    description: "shaclmate command line interface",
    name: "shaclmate",
  }),
  process.argv.slice(2),
);

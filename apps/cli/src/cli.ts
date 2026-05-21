#!/usr/bin/env node
import fs from "node:fs";
import {
  AstJsonGenerator,
  Cx2Generator,
  TsGenerator,
  ZodGenerator,
} from "@shaclmate/compiler";
import { TS_FEATURES } from "@shaclmate/compiler/dist/generators/ts/TsFeature.js";
import {
  command,
  multioption,
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
import { logger } from "./logger.js";

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
          cx2: command({
            name: "cx2",
            description:
              "generate Cytoscape Exchange Format Specification (Version 2)",
            args: {
              inputPaths,
              outputFilePath,
              visualPropertiesJsonFilePath: option({
                description:
                  "path to a file containing the visualProperties JSON object to include in the CX2 file",
                long: "visual-properties-json-file-path",
                type: ExistingPath,
              }),
            },
            handler: async ({
              inputPaths,
              outputFilePath,
              visualPropertiesJsonFilePath,
            }) => {
              let visualProperties: Record<string, unknown> | undefined;
              if (visualPropertiesJsonFilePath) {
                visualProperties = JSON.parse(
                  (
                    await fs.promises.readFile(visualPropertiesJsonFilePath)
                  ).toString("utf-8"),
                );
              }

              (
                await generate({
                  generator: new Cx2Generator({ visualProperties }),
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
              features: multioption({
                defaultValue: () => [
                  ...TsGenerator.Configuration.default_.features,
                ],
                long: "feature",
                description: `features to generate: zero or more of [${TS_FEATURES.join(", ")}] (default: [${[...TsGenerator.Configuration.default_.features].join(", ")}])`,
                type: {
                  async from(strings: readonly string[]) {
                    return strings.map((string) => {
                      const stringLowerCase = string.toLowerCase();
                      for (const tsFeature of TS_FEATURES) {
                        if (tsFeature.toLowerCase() === stringLowerCase) {
                          return tsFeature;
                        }
                      }
                      throw new RangeError(`invalid feature: ${string}`);
                    });
                  },
                },
              }),
              inputPaths,
              outputFilePath,
              syntheticNamePrefix: option({
                defaultValue: () =>
                  TsGenerator.Configuration.default_.syntheticNamePrefix,
                description: `prefix to use for synthetic names in generated code (default: "${TsGenerator.Configuration.default_.syntheticNamePrefix}")`,
                long: "synthetic-name-prefix",
              }),
            },
            handler: async ({
              features,
              inputPaths,
              outputFilePath,
              syntheticNamePrefix,
            }) => {
              (
                await generate({
                  generator: new TsGenerator({
                    configuration: {
                      features: new Set(features),
                      syntheticNamePrefix,
                    },
                    logger,
                  }),
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
                  generator: new ZodGenerator({ logger }),
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

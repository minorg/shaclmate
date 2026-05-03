#!/usr/bin/env node
import * as fs from "node:fs";
import type { PrefixMapInit } from "@rdfjs/prefix-map/PrefixMap.js";
import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import { RdfDirectory, type RdfFile, RdfFileSystemEntry } from "@rdfx/fs";
import type { Generator } from "@shaclmate/compiler";
import {
  AstJsonGenerator,
  Compiler,
  ShapesGraph,
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
import { DataFactory, Parser, Store, Writer } from "n3";
import { pino } from "pino";
import { type Either, EitherAsync } from "purify-ts";
import SHACLValidator from "rdf-validate-shacl";
import { shaclShaclDataset } from "./shaclShaclDataset.js";

const inputPaths = restPositionals({
  displayName: "inputPaths",
  description:
    "paths to RDF files or directories of RDF files containing SHACL shapes",
  type: ExistingPath,
});

const logger = pino(
  {
    level:
      process.env["NODE_ENV"] === "development" ||
      process.env["NODE_ENV"] === "test"
        ? "debug"
        : "info",
  },
  (pino as any)["destination"] ? (pino as any).destination(2) : undefined,
);

const outputFilePath = option({
  defaultValue: () => "",
  description:
    "path to a file to write output to; if not specified, write to stdout",
  long: "output-path",
  short: "o",
  type: string,
});

function generate({
  generator,
  inputFiles,
  outputFilePath,
}: {
  generator: Generator;
  inputFiles: readonly RdfFile[];
  outputFilePath: string;
}): void {
  if (inputFiles.length === 0) {
    throw new Error("must specify at least one input shapes graph file path");
  }

  const inputParser = new Parser();
  const dataset = new Store();
  const iriPrefixes: PrefixMapInit = [];
  for (const inputFile of inputFiles) {
    dataset.addQuads(
      inputParser.parse(
        fs.readFileSync(inputFile.path).toString(),
        null,
        (prefix, prefixNode) => {
          const existingIriPrefix = iriPrefixes.find(
            (iriPrefix) =>
              iriPrefix[0] === prefix || iriPrefix[1].equals(prefixNode),
          );
          if (existingIriPrefix) {
            if (
              existingIriPrefix[0] !== prefix ||
              !existingIriPrefix[1].equals(prefixNode)
            ) {
              logger.warn(
                "conflicting prefix %s: %s",
                prefix,
                prefixNode.value,
              );
            }
            return;
          }

          iriPrefixes.push([prefix, prefixNode]);
        },
      ),
    );
  }

  const prefixMap = new PrefixMap(iriPrefixes, { factory: DataFactory });

  {
    const validationReport = new SHACLValidator(shaclShaclDataset, {}).validate(
      dataset,
    );
    if (!validationReport.conforms) {
      process.stderr.write("input is not valid SHACL:\n");
      const n3WriterPrefixes: Record<string, string> = {};
      for (const prefixEntry of prefixMap.entries()) {
        n3WriterPrefixes[prefixEntry[0]] = prefixEntry[1].value;
      }
      const n3Writer = new Writer({
        format: "text/turtle",
        prefixes: n3WriterPrefixes,
      });
      for (const quad of validationReport.dataset) {
        n3Writer.addQuad(quad);
      }
      n3Writer.end((_error, result) => process.stderr.write(result));
      return;
    }
  }

  ShapesGraph.builder()
    .parseDataset(dataset, { prefixMap })
    .map((_) => _.build())
    .chain((shapesGraph) => new Compiler({ generator }).compile(shapesGraph))
    .ifLeft((error) => {
      throw error;
    })
    .ifRight((output) => {
      if (outputFilePath.length === 0) {
        process.stdout.write(output);
      } else {
        fs.writeFileSync(outputFilePath, output);
      }
    });
}

async function resolveInputPaths(
  inputPaths: readonly string[],
): Promise<Either<Error, readonly RdfFile[]>> {
  return EitherAsync(async ({ liftEither }) => {
    const inputFiles: RdfFile[] = [];
    for (const inputPath of inputPaths) {
      const fileSystemEntry = await liftEither(
        await RdfFileSystemEntry.fromPath(inputPath),
      );
      if (fileSystemEntry instanceof RdfDirectory) {
        for await (const inputFile of fileSystemEntry.files({
          recursive: true,
        })) {
          inputFiles.push(inputFile);
        }
      } else {
        inputFiles.push(fileSystemEntry);
      }
    }
    return inputFiles;
  });
}

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
                inputFiles: (
                  await resolveInputPaths(inputPaths)
                ).unsafeCoerce(),
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
                inputFiles: (
                  await resolveInputPaths(inputPaths)
                ).unsafeCoerce(),
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
                inputFiles: (
                  await resolveInputPaths(inputPaths)
                ).unsafeCoerce(),
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

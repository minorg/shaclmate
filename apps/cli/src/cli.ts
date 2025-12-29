#!/usr/bin/env node
import * as fs from "node:fs";
import type { PrefixMapInit } from "@rdfjs/prefix-map/PrefixMap.js";
import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import type { Generator } from "@shaclmate/compiler";
import {
  AstJsonGenerator,
  Compiler,
  ShapesGraph,
  TsGenerator,
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
import * as N3 from "n3";
import { DataFactory, Parser, Store } from "n3";
import { pino } from "pino";
import SHACLValidator from "rdf-validate-shacl";
import { shaclShaclDataset } from "./shaclShaclDataset.js";

const inputFilePaths = restPositionals({
  displayName: "inputFilePaths",
  description: "paths to RDF files containing SHACL shapes",
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
  inputFilePaths,
  outputFilePath,
}: {
  generator: Generator;
  inputFilePaths: readonly string[];
  outputFilePath: string;
}): void {
  if (inputFilePaths.length === 0) {
    throw new Error("must specify at least one input shapes graph file path");
  }

  const inputParser = new Parser();
  const dataset = new Store();
  const iriPrefixes: PrefixMapInit = [];
  for (const inputFilePath of inputFilePaths) {
    dataset.addQuads(
      inputParser.parse(
        fs.readFileSync(inputFilePath).toString(),
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

  const iriPrefixMap = new PrefixMap(iriPrefixes, { factory: DataFactory });

  {
    const validationReport = new SHACLValidator(shaclShaclDataset, {}).validate(
      dataset,
    );
    if (!validationReport.conforms) {
      process.stderr.write("input is not valid SHACL:\n");
      const n3WriterPrefixes: Record<string, string> = {};
      for (const prefixEntry of iriPrefixMap.entries()) {
        n3WriterPrefixes[prefixEntry[0]] = prefixEntry[1].value;
      }
      const n3Writer = new N3.Writer({
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

  ShapesGraph.create({ dataset })
    .chain((shapesGraph) =>
      new Compiler({ generator, iriPrefixMap }).compile(shapesGraph),
    )
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

run(
  subcommands({
    cmds: {
      generate: command({
        name: "generate",
        description: "generate TypeScript for the SHACL Shapes Graph AST",
        args: {
          inputFilePaths,
          outputFilePath,
        },
        handler: async ({ inputFilePaths, outputFilePath }) => {
          generate({
            generator: new TsGenerator(),
            inputFilePaths,
            outputFilePath,
          });
        },
      }),
      "show-ast-json": command({
        name: "show-ast-json",
        description: "show AST JSON for the SHACL Shapes Graph AST",
        args: {
          inputFilePaths,
          outputFilePath,
        },
        handler: async ({ inputFilePaths, outputFilePath }) => {
          generate({
            generator: new AstJsonGenerator(),
            inputFilePaths,
            outputFilePath,
          });
        },
      }),
    },
    description: "shaclmate command line interface",
    name: "shaclmate",
  }),
  process.argv.slice(2),
);

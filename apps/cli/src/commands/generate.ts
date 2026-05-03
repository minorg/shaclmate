import * as fs from "node:fs";
import type { PrefixMapInit } from "@rdfjs/prefix-map/PrefixMap.js";
import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import { RdfDirectory, type RdfFile, RdfFileSystemEntry } from "@rdfx/fs";
import type { Generator } from "@shaclmate/compiler";
import { Compiler, ShapesGraph } from "@shaclmate/compiler";
import { DataFactory, Parser, Store, Writer } from "n3";
import { type Either, EitherAsync } from "purify-ts";
import SHACLValidator from "rdf-validate-shacl";
import { logger } from "../logger.js";
import { shaclShaclDataset } from "./shaclShaclDataset.js";

export async function generate({
  generator,
  inputPaths,
  outputFilePath,
}: {
  generator: Generator;
  inputPaths: readonly string[];
  outputFilePath: string;
}): Promise<Either<Error, void>> {
  return EitherAsync(async ({ liftEither }) => {
    if (inputPaths.length === 0) {
      throw new Error("must specify at least one input shapes graph file path");
    }

    const inputParser = new Parser();
    const dataset = new Store();
    const iriPrefixes: PrefixMapInit = [];

    const parseInputFile = (inputFile: RdfFile) =>
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

    for (const inputPath of inputPaths) {
      const fileSystemEntry = await liftEither(
        await RdfFileSystemEntry.fromPath(inputPath),
      );
      if (fileSystemEntry instanceof RdfDirectory) {
        for await (const inputFile of fileSystemEntry.files({
          recursive: true,
        })) {
          parseInputFile(inputFile);
        }
      } else {
        parseInputFile(fileSystemEntry);
      }
    }

    const prefixMap = new PrefixMap(iriPrefixes, { factory: DataFactory });

    {
      const validationReport = await new SHACLValidator(
        shaclShaclDataset,
        {},
      ).validate(dataset);
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
  });
}

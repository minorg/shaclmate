import * as fs from "node:fs";
import Serializer from "@rdfjs/serializer-turtle";
import type { Generator } from "@shaclmate/compiler";
import { Compiler, ShapesGraph } from "@shaclmate/compiler";
import { type Either, EitherAsync } from "purify-ts";
import SHACLValidator from "rdf-validate-shacl";
import { parseInputs } from "./parseInputs.js";
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

    const { dataset, prefixMap } = await liftEither(
      await parseInputs(inputPaths),
    );

    {
      const validationReport = await new SHACLValidator(
        shaclShaclDataset,
        {},
      ).validate(dataset);
      if (!validationReport.conforms) {
        process.stderr.write("input is not valid SHACL:\n");
        process.stderr.write(
          new Serializer({
            prefixes: prefixMap,
          }).transform(validationReport.dataset),
        );
        return;
      }
    }

    const output = await liftEither(
      ShapesGraph.builder()
        .parseDataset(dataset, { prefixMap })
        .map((_) => _.build())
        .chain((shapesGraph) =>
          new Compiler({ generator }).compile(shapesGraph),
        ),
    );

    if (outputFilePath.length === 0) {
      process.stdout.write(output);
    } else {
      await fs.promises.writeFile(outputFilePath, output);
    }
  });
}

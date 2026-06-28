import datasetFactory from "@rdfjs/dataset";
import { RdfFile } from "@rdfx/fs";
import { type Either, EitherAsync } from "purify-ts";
import { ShapesGraph } from "../src/ShapesGraph.js";

export async function parseTestShapesGraph(testShapesGraph: {
  filePaths: readonly string[];
}): Promise<Either<Error, ShapesGraph>> {
  return EitherAsync(async ({ liftEither }) => {
    const dataset = datasetFactory.dataset();
    for (const filePath of testShapesGraph.filePaths) {
      await RdfFile.fromPath(filePath).unsafeCoerce().parseInto(dataset);
    }
    return (
      await liftEither(ShapesGraph.builder().parseDataset(dataset))
    ).build();
  });
}

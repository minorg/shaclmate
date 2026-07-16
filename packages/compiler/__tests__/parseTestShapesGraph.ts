import { datasetFactory, PrefixMap } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { RdfFile } from "@rdfx/fs";
import { ShapesGraph } from "@shaclmate/compiler";
import { type Either, EitherAsync } from "purify-ts";

export async function parseTestShapesGraph(testShapesGraph: {
  filePaths: readonly string[];
}): Promise<Either<Error, ShapesGraph>> {
  return EitherAsync(async ({ liftEither }) => {
    const dataset = datasetFactory.dataset();
    const prefixMap = new PrefixMap(undefined, { factory: dataFactory });
    for (const filePath of testShapesGraph.filePaths) {
      await RdfFile.fromPath(filePath)
        .unsafeCoerce()
        .parseInto(dataset, { prefixMap });
    }
    if (dataset.size === 0) {
      throw new Error(
        `test shapes graph dataset is empty: ${JSON.stringify(testShapesGraph)}`,
      );
    }
    return await liftEither(ShapesGraph.fromDataset(dataset, { prefixMap }));
  });
}

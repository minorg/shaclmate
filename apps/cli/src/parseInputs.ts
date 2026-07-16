import type { DatasetCore } from "@rdfjs/types";
import { datasetFactory, PrefixMap } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { RdfFileSystemEntry } from "@rdfx/fs";
import { type Either, EitherAsync } from "purify-ts";
import { logger } from "./logger.js";

export async function parseInputs(inputPaths: readonly string[]): Promise<
  Either<
    Error,
    {
      dataset: DatasetCore;
      prefixMap: PrefixMap;
    }
  >
> {
  return EitherAsync(async ({ liftEither }) => {
    const dataset = datasetFactory.dataset();
    const prefixMap = new PrefixMap(undefined, { factory: dataFactory });
    for (const inputPath of inputPaths) {
      await liftEither(
        await (
          await liftEither(
            await RdfFileSystemEntry.fromPath(inputPath, { logger }),
          )
        ).parseInto(dataset, { prefixMap, recursive: true }),
      );
    }

    return {
      dataset,
      prefixMap,
    };
  });
}

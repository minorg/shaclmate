import type { PrefixMapInit } from "@rdfjs/prefix-map/PrefixMap.js";
import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import type { DatasetCore, NamedNode } from "@rdfjs/types";
import { RdfFileSystemEntry } from "@rdfx/fs";
import { DataFactory, Store } from "n3";
import { Either, EitherAsync, Left } from "purify-ts";
import { logger } from "../logger.js";

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
    const dataset = new Store();
    const prefixMapInit: PrefixMapInit = [];
    for (const inputPath of inputPaths) {
      const inputFileSystemEntry = await liftEither(
        await RdfFileSystemEntry.fromPath(inputPath),
      );
      await liftEither(
        await new Promise<Either<Error, null>>((resolve) => {
          const inputQuadStream = inputFileSystemEntry.parse({
            recursive: true,
          });
          inputQuadStream.on("data", (quad) => dataset.add(quad));
          inputQuadStream.on("end", () => resolve(Either.of(null)));
          inputQuadStream.on("error", (error) => resolve(Left(error)));
          inputQuadStream.on(
            "prefix",
            (prefix: string, prefixNode: NamedNode) => {
              const existingPrefixMapEntry = prefixMapInit.find(
                (prefixMapEntry) =>
                  prefixMapEntry[0] === prefix ||
                  prefixMapEntry[1].equals(prefixNode),
              );

              if (existingPrefixMapEntry) {
                if (
                  existingPrefixMapEntry[0] !== prefix ||
                  !existingPrefixMapEntry[1].equals(prefixNode)
                ) {
                  logger.warn(
                    "conflicting prefix %s: %s",
                    prefix,
                    prefixNode.value,
                  );
                }
                return;
              }

              prefixMapInit.push([prefix, prefixNode]);
            },
          );
        }),
      );
    }

    return {
      dataset,
      prefixMap: new PrefixMap(prefixMapInit, { factory: DataFactory }),
    };
  });
}

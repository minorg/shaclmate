import { Either, type Maybe } from "purify-ts";
import type { TsFeature } from "../enums/TsFeature.js";
import type * as input from "../input/index.js";

export function nodeShapeTsFeatures(
  nodeShape: input.NodeShape,
): Either<Error, Maybe<ReadonlySet<TsFeature>>> {
  return Either.of<Error, Maybe<ReadonlySet<TsFeature>>>(
    nodeShape.tsFeatures,
  ).altLazy(() =>
    nodeShape.isDefinedBy.map((ontology) =>
      ontology.chain((ontology) => ontology.tsFeatures),
    ),
  );
}

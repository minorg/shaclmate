import { Either, type Maybe } from "purify-ts";
import type { TsFeature } from "../enums/TsFeature.js";
import type * as input from "../input/index.js";

export function nodeShapeTsFeatures(
  nodeShape: input.NodeShape,
): Either<Error, Maybe<ReadonlySet<TsFeature>>> {
  if (nodeShape.tsFeatures.isJust()) {
    return Either.of(nodeShape.tsFeatures);
  }

  return nodeShape.isDefinedBy.map((ontology) =>
    ontology.chain((ontology) => ontology.tsFeatures),
  );
}

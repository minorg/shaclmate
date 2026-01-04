import { Either, Maybe } from "purify-ts";
import type { IdentifierMintingStrategy } from "../enums/IdentifierMintingStrategy.js";
import type * as input from "../input/index.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";

export function nodeShapeIdentifierMintingStrategy(
  nodeShape: input.NodeShape,
): Either<Error, Maybe<IdentifierMintingStrategy>> {
  if (nodeShape.identifierMintingStrategy.isJust()) {
    return Either.of(nodeShape.identifierMintingStrategy);
  }

  return nodeShape.ancestorNodeShapes.chain((ancestorNodeShapes) => {
    for (const ancestorNodeShape of ancestorNodeShapes) {
      if (ancestorNodeShape.identifierMintingStrategy.isJust()) {
        return Either.of(
          ancestorNodeShape.identifierMintingStrategy as Maybe<IdentifierMintingStrategy>,
        );
      }
    }

    return shapeNodeKinds(nodeShape).map((nodeKinds) => {
      if (nodeKinds.orDefault(new Set([])).has("BlankNode")) {
        return Maybe.of("blankNode");
      }
      return Maybe.empty();
    });
  });
}

import type { NodeKind } from "@shaclmate/shacl-ast";
import { Either, Left, Maybe } from "purify-ts";
import type { IdentifierMintingStrategy } from "../enums/IdentifierMintingStrategy.js";
import type * as input from "../input/index.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";

const defaultNodeShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "NamedNode",
]);

export function nodeShapeIdentifierMintingStrategy(
  nodeShape: input.NodeShape,
): Either<Error, Maybe<IdentifierMintingStrategy>> {
  if (nodeShape.identifierMintingStrategy.isJust()) {
    if (nodeShape.identifierIn.length > 0) {
      return Left(
        new Error(
          `${nodeShape} cannot have an identifier minting strategy and sh:in`,
        ),
      );
    }

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

    return shapeNodeKinds(nodeShape, { defaultNodeShapeNodeKinds }).map(
      (nodeKinds) => {
        if (nodeKinds.has("BlankNode")) {
          return Maybe.of("blankNode");
        }
        return Maybe.empty();
      },
    );
  });
}

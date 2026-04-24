import type { NodeKind } from "@shaclmate/shacl-ast";
import { Either, Left, Maybe } from "purify-ts";
import { IdentifierMintingStrategy } from "../enums/IdentifierMintingStrategy.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";

const defaultNodeShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "IRI",
]);

export function nodeShapeIdentifierMintingStrategy(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, Maybe<IdentifierMintingStrategy>> {
  if (nodeShape.identifierMintingStrategy.isJust()) {
    if (nodeShape.in_.filter((_) => _.length > 0).isJust()) {
      return Left(
        new Error(
          `${nodeShape} cannot have an identifier minting strategy and sh:in`,
        ),
      );
    }

    return Either.of(
      nodeShape.identifierMintingStrategy.map(
        IdentifierMintingStrategy.fromIri,
      ),
    );
  }

  return Either.sequence(
    nodeShape.ancestorClassIris.map((nodeShapeIdentifier) =>
      this.shapesGraph.nodeShape(nodeShapeIdentifier),
    ),
  ).chain((ancestorNodeShapes) => {
    for (const ancestorNodeShape of ancestorNodeShapes) {
      if (ancestorNodeShape.identifierMintingStrategy.isJust()) {
        return Either.of(
          ancestorNodeShape.identifierMintingStrategy.map(
            IdentifierMintingStrategy.fromIri,
          ) as Maybe<IdentifierMintingStrategy>,
        );
      }
    }

    return shapeNodeKinds
      .call(this, nodeShape, { defaultNodeShapeNodeKinds })
      .map((nodeKinds) => {
        if (nodeKinds.has("BlankNode")) {
          return Maybe.of("blankNode");
        }
        return Maybe.empty();
      });
  });
}

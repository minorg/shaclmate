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

  // Recurse into parents
  for (const parentNodeShape of this.relatedNodeShapesByIdentifier.get(
    nodeShape.$identifier,
  )!.parents) {
    const parentNodeShapeIdentifierMintingStrategy =
      nodeShapeIdentifierMintingStrategy.call(this, parentNodeShape);
    if (
      parentNodeShapeIdentifierMintingStrategy.isRight() &&
      parentNodeShapeIdentifierMintingStrategy.extract().isJust()
    ) {
      return parentNodeShapeIdentifierMintingStrategy;
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
}

import type { NodeKind } from "@shaclmate/shacl-ast";
import { Either, Left } from "purify-ts";
import * as input from "../input/index.js";

function nodeShapeNodeKinds(
  nodeShape: input.NodeShape,
): Either<Error, ReadonlySet<NodeKind>> {
  return nodeShape.parentNodeShapes
    .map((parentNodeShapes) =>
      parentNodeShapes.map((parentNodeShape) => [...parentNodeShape.nodeKinds]),
    )
    .map((_) => new Set(_.flat()))
    .chain((parentNodeKinds) => {
      if (parentNodeKinds.size > 0) {
        if (nodeShape.nodeKinds.size === 0) {
          return Either.of(parentNodeKinds);
        }

        // Check that thisNodeKinds doesn't conflict with parent node kinds
        for (const thisNodeKind of nodeShape.nodeKinds) {
          if (!parentNodeKinds.has(thisNodeKind)) {
            throw new Error(
              `${nodeShape} has a nodeKind ${thisNodeKind} that is not in its parent's node kinds`,
            );
          }
        }
      }

      return Either.of(nodeShape.nodeKinds);
    });
}

function propertyShapeNodeKinds(
  propertyShape: input.PropertyShape,
): Either<Error, ReadonlySet<NodeKind>> {
  return Either.of(propertyShape.constraints.nodeKinds.orDefault(new Set([])));
}

export function shapeNodeKinds(
  shape: input.Shape,
): Either<Error, ReadonlySet<NodeKind>> {
  return (
    shape instanceof input.NodeShape
      ? nodeShapeNodeKinds(shape)
      : propertyShapeNodeKinds(shape)
  ).chain((explicitNodeKinds) => {
    const implicitNodeKinds = new Set<NodeKind>();

    for (const [constraint, constraintNodeKinds] of Object.entries({
      "sh:in": shape.constraints.in_.map((in_) => in_.termType),
      "sh:hasValue": shape.constraints.hasValues.map((value) => value.termType),
      "sh:defaultValue":
        shape instanceof input.PropertyShape
          ? shape.defaultValue.map((value) => value.termType).toList()
          : [],
    })) {
      for (const constraintNodeKind of constraintNodeKinds) {
        // Check if the constraint's node kind conflicts with sh:nodeKind
        if (
          explicitNodeKinds.size > 0 &&
          !explicitNodeKinds.has(constraintNodeKind)
        ) {
          return Left(
            new Error(
              `${shape} has ${constraint} ${constraintNodeKind} term that conflicts with sh:nodeKind`,
            ),
          );
        }

        // Check if the constraint's node kind conflicts with a prior constraint's node kind(s)
        if (
          implicitNodeKinds.size > 0 &&
          !implicitNodeKinds.has(constraintNodeKind)
        ) {
          return Left(
            new Error(
              `${shape} has ${constraint} ${constraintNodeKind} term that conflicts with other constraint node kinds`,
            ),
          );
        }
      }

      // The constraint's node kinds didn't conflict with sh:nodeKind or prior constraint node kinds,
      // so make them the implicit node kinds.
      for (const constraintNodeKind of constraintNodeKinds) {
        implicitNodeKinds.add(constraintNodeKind);
      }
    }

    if (explicitNodeKinds.size > 0) {
      return Either.of(explicitNodeKinds);
    }
    if (implicitNodeKinds.size > 0) {
      return Either.of(implicitNodeKinds);
    }
    if (shape instanceof input.NodeShape) {
      return Either.of(new Set(["BlankNode", "NamedNode"]));
    }
    return Either.of(new Set(["BlankNode", "Literal", "NamedNode"]));
  });
}

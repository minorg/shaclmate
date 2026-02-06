import type { NodeKind } from "@shaclmate/shacl-ast";
import { Either, Left } from "purify-ts";
import type * as input from "../input/index.js";

const defaultNodeShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "Literal",
  "NamedNode",
]);

const defaultPropertyShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "Literal",
  "NamedNode",
]);

function nodeShapeNodeKinds(
  nodeShape: input.NodeShape,
): Either<Error, ReadonlySet<NodeKind>> {
  const thisNodeKinds = nodeShape.constraints.nodeKinds;

  return nodeShape.parentNodeShapes.chain((parentNodeShapes) => {
    const parentNodeKinds = new Set<NodeKind>();
    for (const parentNodeShape of parentNodeShapes) {
      for (const parentNodeKind of parentNodeShape.constraints.nodeKinds) {
        parentNodeKinds.add(parentNodeKind);
      }
    }

    if (parentNodeKinds.size > 0) {
      if (thisNodeKinds.size === 0) {
        return Either.of(parentNodeKinds);
      }

      // Check that thisNodeKinds doesn't conflict with parent node kinds
      for (const thisNodeKind of thisNodeKinds) {
        if (!parentNodeKinds.has(thisNodeKind)) {
          return Left(
            new Error(
              `${nodeShape} has a nodeKind ${thisNodeKind} that is not in its parent's node kinds`,
            ),
          );
        }
      }
    }

    return Either.of(thisNodeKinds);
  });
}

function propertyShapeNodeKinds(
  propertyShape: input.PropertyShape,
): Either<Error, ReadonlySet<NodeKind>> {
  return Either.of(propertyShape.constraints.nodeKinds);
}

export function shapeNodeKinds(
  shape: input.Shape,
  options?: {
    defaultNodeShapeNodeKinds: ReadonlySet<NodeKind>;
    defaultPropertyShapeNodeKinds?: ReadonlySet<NodeKind>;
  },
): Either<Error, ReadonlySet<NodeKind>> {
  return (
    shape.kind === "NodeShape"
      ? nodeShapeNodeKinds(shape)
      : propertyShapeNodeKinds(shape)
  ).chain((explicitNodeKinds) => {
    const implicitNodeKinds = new Set<NodeKind>();

    for (const [constraint, constraintNodeKinds] of [
      [
        "sh:datatype",
        shape.constraints.datatype
          .map(() => ["Literal"])
          .orDefault([]) as readonly NodeKind[],
      ],
      ["sh:in", shape.constraints.in_.map((in_) => in_.termType)],
      [
        "sh:languageIn",
        shape.constraints.languageIn.length > 0
          ? ["Literal" as const]
          : ([] as readonly NodeKind[]),
      ],
      [
        "sh:maxExclusive",
        shape.constraints.maxExclusive
          .map(() => ["Literal"])
          .orDefault([]) as readonly NodeKind[],
      ],
      [
        "sh:maxInclusive",
        shape.constraints.maxInclusive
          .map(() => ["Literal"])
          .orDefault([]) as readonly NodeKind[],
      ],
      [
        "sh:minExclusive",
        shape.constraints.minExclusive
          .map(() => ["Literal"])
          .orDefault([]) as readonly NodeKind[],
      ],
      [
        "sh:minInclusive",
        shape.constraints.minInclusive
          .map(() => ["Literal"])
          .orDefault([]) as readonly NodeKind[],
      ],
      // Order is important here
      // We don't want sh:defaultValue earlier because it should only determine the node kinds if nothing else did.
      [
        "sh:hasValue",
        shape.constraints.hasValues.map((value) => value.termType),
      ],
      [
        "sh:defaultValue",
        shape.kind === "PropertyShape"
          ? shape.defaultValue.map((value) => value.termType).toList()
          : [],
      ],
    ] as const) {
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
    if (shape.kind === "NodeShape") {
      return Either.of(
        options?.defaultNodeShapeNodeKinds ?? defaultNodeShapeNodeKinds,
      );
    }
    return Either.of(
      options?.defaultPropertyShapeNodeKinds ?? defaultPropertyShapeNodeKinds,
    );
  });
}

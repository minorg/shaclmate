import { NodeKind } from "@shaclmate/shacl-ast";
import { Either, Left } from "purify-ts";
import type * as input from "../input/index.js";

const defaultNodeShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "IRI",
  "Literal",
]);

const defaultPropertyShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "IRI",
  "Literal",
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
    // Consider constraints that dictate certain node kinds, like sh:datatype dictates a Literal nodeKind.
    const constraintExcludeNodeKinds = new Set<NodeKind>();
    const constraintIncludeNodeKinds = new Set<NodeKind>();
    for (const [constraint, { excludeNodeKinds, includeNodeKinds }] of [
      [
        "sh:class",
        shape.constraints.classes.length > 0
          ? { excludeNodeKinds: ["Literal" as const] }
          : {},
      ],
      [
        "sh:datatype",
        {
          includeNodeKinds: shape.constraints.datatype
            .map(() => ["Literal" as const])
            .orDefault([]) as readonly NodeKind[],
        },
      ],
      [
        "sh:defaultValue",
        {
          includeNodeKinds:
            shape.kind === "PropertyShape"
              ? shape.defaultValue
                  .map((value) => NodeKind.fromTermType(value.termType))
                  .toList()
              : [],
        },
      ],
      [
        "sh:hasValue",
        {
          includeNodeKinds: shape.constraints.hasValues.map((value) =>
            NodeKind.fromTermType(value.termType),
          ),
        },
      ],
      [
        "sh:in",
        {
          includeNodeKinds: shape.constraints.in_.map((in_) =>
            NodeKind.fromTermType(in_.termType),
          ),
        },
      ],
      [
        "sh:languageIn",
        shape.constraints.languageIn.length > 0
          ? { includeNodeKinds: ["Literal" as const] }
          : {},
      ],
      [
        "sh:maxExclusive",
        {
          includeNodeKinds: shape.constraints.maxExclusive
            .map(() => ["Literal" as const])
            .orDefault([]) as readonly NodeKind[],
        },
      ],
      [
        "sh:maxInclusive",
        {
          includeNodeKinds: shape.constraints.maxInclusive
            .map(() => ["Literal" as const])
            .orDefault([]) as readonly NodeKind[],
        },
      ],
      [
        "sh:minExclusive",
        {
          includeNodeKinds: shape.constraints.minExclusive
            .map(() => ["Literal"])
            .orDefault([]) as readonly NodeKind[],
        },
      ],
      [
        "sh:minInclusive",
        {
          includeNodeKinds: shape.constraints.minInclusive
            .map(() => ["Literal"])
            .orDefault([]) as readonly NodeKind[],
        },
      ],
    ] as const) {
      for (const excludeNodeKind of excludeNodeKinds ?? []) {
        if (
          explicitNodeKinds.size > 0 &&
          explicitNodeKinds.has(excludeNodeKind)
        ) {
          return Left(
            new Error(
              `${shape} has ${constraint} that conflicts with sh:nodeKind`,
            ),
          );
        }

        constraintExcludeNodeKinds.add(excludeNodeKind);
      }

      for (const includeNodeKind of includeNodeKinds ?? []) {
        if (
          explicitNodeKinds.size > 0 &&
          !explicitNodeKinds.has(includeNodeKind)
        ) {
          return Left(
            new Error(
              `${shape} has ${constraint} that conflicts with sh:nodeKind`,
            ),
          );
        }

        constraintIncludeNodeKinds.add(includeNodeKind);
      }
    }

    if (explicitNodeKinds.size > 0) {
      return Either.of(explicitNodeKinds);
    }

    // There were no explicit sh:nodeKind, try to infer the shape's node kind from the node kinds excluded and included by constraints
    const constraintNodeKinds = new Set<NodeKind>();
    if (constraintIncludeNodeKinds.size > 0) {
      // If constraints dictated/included certain node kinds be included. Add those to the set.
      for (const constraintIncludeNodeKind of constraintIncludeNodeKinds) {
        constraintNodeKinds.add(constraintIncludeNodeKind);
      }
      // Check whether other constraints' excluded node kinds conflict.
      if (constraintExcludeNodeKinds.size > 0) {
        for (const constraintExcludeNodeKind of constraintExcludeNodeKinds) {
          if (constraintIncludeNodeKinds.has(constraintExcludeNodeKind)) {
            return Left(
              new Error(
                `${shape} has constraints with conflicting exclude/include node kinds`,
              ),
            );
          }
        }
      }
    } else if (constraintExcludeNodeKinds.size > 0) {
      // No constraint dictated that certain node kinds be included, but some constraint dictated that certain node kinds be excluded.
      // Start with all node kinds and exclude.
      constraintNodeKinds.add("BlankNode");
      constraintNodeKinds.add("IRI");
      constraintNodeKinds.add("Literal");
      for (const constraintExcludeNodeKind of constraintExcludeNodeKinds) {
        constraintNodeKinds.delete(constraintExcludeNodeKind);
      }
    }
    if (constraintNodeKinds.size > 0) {
      return Either.of(constraintNodeKinds);
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

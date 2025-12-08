import type {} from "@shaclmate/shacl-ast";
import { owl, rdfs } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import { logger } from "../logger.js";
import type { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstAbstractTypeProperties } from "./transformShapeToAstAbstractTypeProperties.js";

/**
 * Try to convert a shape to a compound type (intersection or union) using some heuristics.
 */
export function transformShapeToAstCompoundType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, ast.Type> {
  shapeStack.push(shape);
  try {
    let memberTypeEithers: readonly Either<Error, ast.Type>[];
    let compoundTypeKind: "IntersectionType" | "UnionType";

    if (shape.constraints.and.length > 0) {
      memberTypeEithers = shape.constraints.and.map((memberShape) =>
        this.transformShapeToAstType(memberShape, shapeStack),
      );
      compoundTypeKind = "IntersectionType";
    } else if (shape.constraints.classes.length > 0) {
      memberTypeEithers = shape.constraints.classes.map((classIri) => {
        if (
          classIri.equals(owl.Class) ||
          classIri.equals(owl.Thing) ||
          classIri.equals(rdfs.Class)
        ) {
          return Left(
            new Error(`class ${classIri.value} is not transformable`),
          );
        }

        const classNodeShape = this.shapesGraph
          .nodeShapeByIdentifier(classIri)
          .extractNullable();
        if (classNodeShape === null) {
          return Left(
            new Error(
              `class ${classIri.value} did not resolve to a node shape`,
            ),
          );
        }

        return this.transformNodeShapeToAstType(classNodeShape);
      });
      compoundTypeKind = "IntersectionType";

      if (Either.rights(memberTypeEithers).length === 0) {
        // This frequently happens with e.g., sh:class skos:Concept
        logger.debug(
          "shape %s sh:class(es) did not map to any node shapes",
          shape,
        );
        return memberTypeEithers[0];
      }
    } else if (shape.constraints.nodes.length > 0) {
      memberTypeEithers = shape.constraints.nodes.map((nodeShape) =>
        this.transformNodeShapeToAstType(nodeShape),
      );
      compoundTypeKind = "IntersectionType";
    } else if (shape.constraints.xone.length > 0) {
      memberTypeEithers = shape.constraints.xone.map((memberShape) =>
        this.transformShapeToAstType(memberShape, shapeStack),
      );
      compoundTypeKind = "UnionType";
    } else {
      return Left(new Error(`unable to transform ${shape} into an AST type`));
    }
    invariant(memberTypeEithers.length > 0);

    const memberTypes: ast.Type[] = [];
    for (const memberTypeEither of memberTypeEithers) {
      if (memberTypeEither.isLeft()) {
        return memberTypeEither;
      }
      const memberType = memberTypeEither.unsafeCoerce();
      memberTypes.push(memberType);
    }

    if (memberTypes.length === 1) {
      return Either.of(memberTypes[0]);
    }

    if (
      memberTypes.every((memberType) => {
        switch (memberType.kind) {
          case "ObjectType":
          case "ObjectIntersectionType":
          case "ObjectUnionType":
            return true;
          default:
            return false;
        }
      })
    ) {
      const compoundType = new (
        compoundTypeKind === "IntersectionType"
          ? ast.ObjectIntersectionType
          : ast.ObjectUnionType
      )({
        ...transformShapeToAstAbstractTypeProperties(shape),
        export_: true,
        name: shape.shaclmateName,
        shapeIdentifier: this.shapeIdentifier(shape),
        tsFeatures: Maybe.empty(),
      });

      for (const memberType of memberTypes) {
        const addMemberTypeResult = compoundType.addMemberType(memberType);
        if (addMemberTypeResult.isLeft()) {
          return addMemberTypeResult;
        }
      }
    }

    // Compound type doesn't solely consist of ObjectTypes
    return Either.of(
      new (compoundTypeKind === "IntersectionType"
        ? ast.IntersectionType
        : ast.UnionType)({
        ...transformShapeToAstAbstractTypeProperties(shape),
        memberTypes,
      }),
    );
  } finally {
    shapeStack.pop(shape);
  }
}

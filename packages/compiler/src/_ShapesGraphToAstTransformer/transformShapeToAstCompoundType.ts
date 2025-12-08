import type {} from "@shaclmate/shacl-ast";
import { owl, rdfs } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as ast from "../ast/index.js";
import * as input from "../input/index.js";
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
    let compoundTypeKind: "IntersectionType" | "UnionType";
    // Distinguish constraints that take arbitrary shapes from those that only take node shapes
    // With the latter we'll do special transformations.
    let memberShapes: readonly input.Shape[] | undefined;
    let memberNodeShapes: readonly input.NodeShape[] | undefined;

    if (shape.constraints.and.length > 0) {
      memberShapes = shape.constraints.and;
      compoundTypeKind = "IntersectionType";
    } else if (shape.constraints.classes.length > 0) {
      const memberNodeShapesMutable: input.NodeShape[] = [];
      for (const classIri of shape.constraints.classes) {
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

        memberNodeShapesMutable.push(classNodeShape);
      }
      invariant(
        memberNodeShapesMutable.length === shape.constraints.classes.length,
      );
      memberNodeShapes = memberNodeShapesMutable;
      compoundTypeKind = "IntersectionType";
    } else if (shape.constraints.nodes.length > 0) {
      memberNodeShapes = shape.constraints.nodes;
      compoundTypeKind = "IntersectionType";
    } else if (shape.constraints.xone.length > 0) {
      memberShapes = shape.constraints.xone;
      compoundTypeKind = "UnionType";
    } else {
      return Left(new Error(`unable to transform ${shape} into an AST type`));
    }

    const memberDiscriminantValues: string[] = [];
    const memberTypes: ast.Type[] = [];
    if (memberNodeShapes) {
      invariant(memberNodeShapes.length > 0);
      invariant(!memberShapes);
      for (const memberNodeShape of memberNodeShapes) {
        const memberTypeEither =
          this.transformNodeShapeToAstType(memberNodeShape);
        if (memberTypeEither.isLeft()) {
          return memberTypeEither;
        }
        memberTypes.push(memberTypeEither.unsafeCoerce());

        if (compoundTypeKind === "UnionType") {
          const memberDiscriminantValue =
            memberNodeShape.discriminantValue.extract();
          if (memberDiscriminantValue) {
            memberDiscriminantValues.push(memberDiscriminantValue);
          } else if (memberDiscriminantValues.length > 0) {
            return Left(
              new Error(
                `${shape} does not have a discriminant value while the other members of the compound type do`,
              ),
            );
          }
        }
      }
    } else if (memberShapes) {
      invariant(memberShapes.length > 0);
      for (const memberShape of memberShapes) {
        const memberTypeEither = this.transformShapeToAstType(
          memberShape,
          shapeStack,
        );
        if (memberTypeEither.isLeft()) {
          return memberTypeEither;
        }
        memberTypes.push(memberTypeEither.unsafeCoerce());

        if (compoundTypeKind === "UnionType") {
          let memberDiscriminantValue: string | undefined;
          if (memberShape instanceof input.NodeShape) {
            memberDiscriminantValue = memberShape.discriminantValue.extract();
          }
          if (memberDiscriminantValue) {
            memberDiscriminantValues.push(memberDiscriminantValue);
          } else if (memberDiscriminantValues.length > 0) {
            return Left(
              new Error(
                `${memberShape} member of ${shape} does not have a discriminant value while the other members of the compound type do`,
              ),
            );
          }
        }
      }
    } else {
      invariant(false);
    }

    if (memberTypes.length === 1) {
      return Either.of(memberTypes[0]);
    }

    // If every member type is an ObjectType, ObjectIntersectionType, or ObjectUnionType (the latter of which can be flattened to ObjectTypes),
    // produce a different AST type (ObjectIntersectionType or ObjectUnionType).
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
    switch (compoundTypeKind) {
      case "IntersectionType":
        return Either.of(
          new ast.IntersectionType({
            ...transformShapeToAstAbstractTypeProperties(shape),
            memberTypes,
          }),
        );
      case "UnionType":
        if (
          memberDiscriminantValues.length > 0 &&
          memberDiscriminantValues.length !== memberTypes.length
        ) {
          return Left(
            new Error(`${shape} has members without discriminant values`),
          );
        }

        return Either.of(
          new ast.UnionType({
            ...transformShapeToAstAbstractTypeProperties(shape),
            memberDiscriminantValues,
            memberTypes,
          }),
        );
    }
  } finally {
    shapeStack.pop(shape);
  }
}

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
    let memberShapes: readonly input.Shape[];

    if (shape.constraints.and.length > 0) {
      memberShapes = shape.constraints.and;
      compoundTypeKind = "IntersectionType";
    } else if (shape.constraints.classes.length > 0) {
      const memberShapesMutable: input.NodeShape[] = [];
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

        memberShapesMutable.push(classNodeShape);
      }
      invariant(
        memberShapesMutable.length === shape.constraints.classes.length,
      );
      memberShapes = memberShapesMutable;
      compoundTypeKind = "IntersectionType";
    } else if (shape.constraints.nodes.length > 0) {
      memberShapes = shape.constraints.nodes;
      compoundTypeKind = "IntersectionType";
    } else if (shape.constraints.xone.length > 0) {
      memberShapes = shape.constraints.xone;
      compoundTypeKind = "UnionType";
    } else {
      return Left(new Error(`unable to transform ${shape} into an AST type`));
    }
    invariant(memberShapes.length > 0);

    const memberDiscriminantValues: string[] = [];
    const memberTypes: ast.Type[] = [];
    for (const memberShape of memberShapes) {
      let memberDiscriminantValue: string | undefined;
      let memberTypeEither: Either<Error, ast.Type>;
      if (memberShape instanceof input.NodeShape) {
        memberDiscriminantValue = memberShape.discriminantValue.extract();
        memberTypeEither = this.transformNodeShapeToAstType(memberShape);
      } else {
        memberTypeEither = this.transformShapeToAstType(
          memberShape,
          shapeStack,
        );
      }
      if (memberTypeEither.isLeft()) {
        return memberTypeEither;
      }
      memberTypes.push(memberTypeEither.unsafeCoerce());

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

    if (memberTypes.length === 1) {
      return Either.of(memberTypes[0]);
    }

    invariant(
      memberDiscriminantValues.length === 0 ||
        memberDiscriminantValues.length === memberTypes.length,
    );

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

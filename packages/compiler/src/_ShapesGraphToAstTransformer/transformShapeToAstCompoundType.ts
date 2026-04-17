import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstAbstractTypeProperties } from "./transformShapeToAstAbstractTypeProperties.js";

/**
 * Try to convert a shape to a compound type (intersection or union) using some heuristics.
 */
export function transformShapeToAstCompoundType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, Maybe<Exclude<ast.Type, ast.PlaceholderType>>> {
  shapeStack.push(shape);
  try {
    return Eithers.chain3(
      shape.constraints.and,
      shape.constraints.nodes,
      shape.constraints.xone,
    ).chain(
      ([andConstraintShapes, nodeConstraintShapes, xoneConstraintShapes]) => {
        let compoundTypeKind: "IntersectionType" | "UnionType";
        // Distinguish constraints that take arbitrary shapes from those that only take node shapes
        // With the latter we'll do special transformations.
        let memberShapes: readonly input.Shape[] | undefined;
        let memberNodeShapes: readonly input.NodeShape[] | undefined;

        if (andConstraintShapes.length > 0) {
          memberShapes = andConstraintShapes;
          compoundTypeKind = "IntersectionType";
        } else if (nodeConstraintShapes.length > 0) {
          memberNodeShapes = nodeConstraintShapes;
          compoundTypeKind = "IntersectionType";
        } else if (xoneConstraintShapes.length > 0) {
          memberShapes = xoneConstraintShapes;
          compoundTypeKind = "UnionType";
        } else {
          return Either.of(Maybe.empty());
        }

        const memberDiscriminantValues: string[] = [];
        const memberTypes: ast.IntersectionType.MemberType[] = [];
        if (memberNodeShapes) {
          invariant(memberNodeShapes.length > 0);
          invariant(!memberShapes);
          for (const memberNodeShape of memberNodeShapes) {
            const memberTypeEither =
              this.transformNodeShapeToAstType(memberNodeShape);
            if (memberTypeEither.isLeft()) {
              return memberTypeEither;
            }
            const memberType = memberTypeEither.unsafeCoerce();
            if (!ast.IntersectionType.isMemberType(memberType)) {
              return Left(
                new Error(
                  `${shape} has an invalid member type kind "${memberType.kind}"`,
                ),
              );
            }
            memberTypes.push(memberType);

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
            const memberType = memberTypeEither.unsafeCoerce();
            if (!ast.IntersectionType.isMemberType(memberType)) {
              return Left(
                new Error(
                  `${shape} has an invalid member type kind "${memberType.kind}"`,
                ),
              );
            }
            memberTypes.push(memberType);

            if (compoundTypeKind === "UnionType") {
              let memberDiscriminantValue: string | undefined;
              if (memberShape.kind === "NodeShape") {
                memberDiscriminantValue =
                  memberShape.discriminantValue.extract();
              }
              if (memberDiscriminantValue) {
                if (
                  memberDiscriminantValues.includes(memberDiscriminantValue)
                ) {
                  return Left(
                    new Error(
                      `${shape} member ${memberShape} has a duplicate discriminant value: ${memberDiscriminantValue}`,
                    ),
                  );
                }
                memberDiscriminantValues.push(memberDiscriminantValue);
              } else if (memberDiscriminantValues.length > 0) {
                return Left(
                  new Error(
                    `${shape} member ${memberShape} does not have a discriminant value while the other members of the compound type do`,
                  ),
                );
              }
            }
          }
        } else {
          invariant(false);
        }

        if (memberTypes.length === 1) {
          invariant(memberTypes[0].kind !== "PlaceholderType");
          return Either.of(Maybe.of(memberTypes[0]));
        }

        return transformShapeToAstAbstractTypeProperties(shape).chain(
          (astAbstractTypeProperties) => {
            const name =
              shape instanceof input.PropertyShape
                ? shape.name.alt(shape.shaclmateName)
                : shape.shaclmateName;

            // Compound type doesn't solely consist of ObjectTypes
            switch (compoundTypeKind) {
              case "IntersectionType":
                return Either.of(
                  Maybe.of(
                    new ast.IntersectionType({
                      ...astAbstractTypeProperties,
                      memberTypes,
                      name,
                      shapeIdentifier: shape.identifier,
                    }),
                  ),
                );
              case "UnionType":
                if (
                  memberDiscriminantValues.length > 0 &&
                  memberDiscriminantValues.length !== memberTypes.length
                ) {
                  return Left(
                    new Error(
                      `${shape} has members without discriminant values`,
                    ),
                  );
                }

                return Either.of(
                  Maybe.of(
                    new ast.UnionType({
                      ...astAbstractTypeProperties,
                      memberDiscriminantValues,
                      memberTypes,
                      name,
                      shapeIdentifier: shape.identifier,
                    }),
                  ),
                );
            }
          },
        );
      },
    );
  } finally {
    shapeStack.pop(shape);
  }
}

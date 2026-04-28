import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type { TsFeature } from "../enums/TsFeature.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { nodeShapeTsFeatures } from "./nodeShapeTsFeatures.js";
import type { ShapeStack } from "./ShapeStack.js";
import { shapeAstTypeName } from "./shapeAstTypeName.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

/**
 * Try to convert a shape to a compound type (intersection or union) using some heuristics.
 */
export function transformShapeToAstCompoundType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, Maybe<ast.Type>> {
  shapeStack.push(shape);
  try {
    return Eithers.chain4(
      Either.sequence(
        shape.and
          .orDefault([])
          .map((shapeIdentifier) => this.shapesGraph.shape(shapeIdentifier)),
      ),
      Either.sequence(
        shape.nodes.map((nodeShapeIdentifier) =>
          this.shapesGraph.nodeShape(nodeShapeIdentifier),
        ),
      ),
      shape.$type === "NodeShape"
        ? nodeShapeTsFeatures.call(this, shape)
        : Either.of(new Set<TsFeature>()),
      Either.sequence(
        shape.xone
          .orDefault([])
          .map((shapeIdentifier) => this.shapesGraph.shape(shapeIdentifier)),
      ),
    ).chain(
      ([
        andConstraintShapes,
        nodeConstraintShapes,
        tsFeatures,
        xoneConstraintShapes,
      ]) => {
        let compoundTypeKind: "IntersectionType" | "UnionType";
        // Distinguish constraints that take arbitrary shapes from those that only take node shapes
        // With the latter we'll do special transformations.
        let memberShapes: readonly input.Shape[];

        if (andConstraintShapes.length > 0) {
          memberShapes = andConstraintShapes;
          compoundTypeKind = "IntersectionType";
        } else if (nodeConstraintShapes.length > 0) {
          memberShapes = nodeConstraintShapes;
          compoundTypeKind = "IntersectionType";
        } else if (xoneConstraintShapes.length > 0) {
          memberShapes = xoneConstraintShapes;
          compoundTypeKind = "UnionType";
        } else {
          return Either.of(Maybe.empty());
        }

        invariant(memberShapes.length > 0);

        const memberDiscriminantValues = new Set<number | string>();
        const compoundType: ast.IntersectionType | ast.UnionType = new (
          compoundTypeKind === "IntersectionType"
            ? ast.IntersectionType
            : ast.UnionType
        )({
          comment: shape.comment,
          label: shape.label,
          name: shapeAstTypeName(shape),
          shapeIdentifier: shape.$identifier,
          tsFeatures,
        });

        if (memberShapes.length === 1) {
          return transformShapeToAstType
            .call(this, memberShapes[0], shapeStack)
            .map(Maybe.of);
        }

        // Put a placeholder in the cache to deal with cyclic references
        this.cachedAstTypesByShapeIdentifier.set(
          shape.$identifier,
          compoundType,
        );

        return Either.sequence(
          memberShapes.map((memberShape) =>
            transformShapeToAstType.call(this, memberShape, shapeStack),
          ),
        )
          .chain(
            (
              memberShapeTypes,
            ): Either<Error, Maybe<ast.IntersectionType | ast.UnionType>> => {
              for (let memberI = 0; memberI < memberShapes.length; memberI++) {
                const memberShape = memberShapes[memberI];
                const memberType = memberShapeTypes[memberI];

                if (!ast.IntersectionType.isMemberType(memberType)) {
                  return Left(
                    new Error(
                      `${shape} has an invalid member type kind "${memberType.kind}"`,
                    ),
                  );
                }

                if (
                  memberI > 0 &&
                  compoundType.members.some((existingMember) =>
                    ast.Type.equals(memberType, existingMember.type),
                  )
                ) {
                  return Left(
                    new Error(
                      `${shape} has duplicate ${compoundTypeKind} member type: ${memberType}`,
                    ),
                  );
                }

                let memberDiscriminantValue: number | string | undefined;
                if (compoundTypeKind === "UnionType") {
                  if (memberShape.$type === "NodeShape") {
                    memberDiscriminantValue =
                      memberShape.discriminantValue.extract();
                  }
                  if (memberDiscriminantValue) {
                    if (memberDiscriminantValues.has(memberDiscriminantValue)) {
                      return Left(
                        new Error(
                          `${shape} member ${memberShape} has a duplicate discriminant value: ${memberDiscriminantValue}`,
                        ),
                      );
                    }
                    memberDiscriminantValues.add(memberDiscriminantValue);
                  }
                }

                compoundType.addMember({
                  discriminantValue: Maybe.fromNullable(
                    memberDiscriminantValue,
                  ),
                  type: memberType,
                });
              }

              return Either.of(Maybe.of(compoundType));
            },
          )
          .ifLeft(() => {
            this.cachedAstTypesByShapeIdentifier.delete(shape.$identifier);
          });
      },
    );
  } finally {
    shapeStack.pop(shape);
  }
}

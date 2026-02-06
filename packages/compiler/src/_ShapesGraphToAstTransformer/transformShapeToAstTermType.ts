import { Either, Left } from "purify-ts";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type { ShapeStack } from "./ShapeStack.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";
import { transformShapeToAstAbstractTypeProperties } from "./transformShapeToAstAbstractTypeProperties.js";

/**
 * Try to convert a shape to an AST TermType using some heuristics.
 */
export function transformShapeToAstTermType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, ast.DefaultValueType<ast.TermType> | ast.TermType> {
  shapeStack.push(shape);
  try {
    return Eithers.chain2(
      transformShapeToAstAbstractTypeProperties(shape),
      shapeNodeKinds(shape),
    ).chain(([astAbstractTypeProperties, nodeKinds]) => {
      if (nodeKinds.size === 0) {
        return Left(new Error(`${shape} has no nodeKinds`));
      }

      const termType = new ast.TermType({
        ...astAbstractTypeProperties,
        hasValues: shapeStack.constraints.hasValues,
        in_: shapeStack.constraints.in_,
        nodeKinds,
      });

      return Either.of(
        shapeStack.defaultValue
          .map(
            (defaultValue) =>
              new ast.DefaultValueType({ defaultValue, itemType: termType }) as
                | ast.DefaultValueType<ast.TermType>
                | ast.TermType,
          )
          .orDefault(termType),
      );
    });
  } finally {
    shapeStack.pop(shape);
  }
}

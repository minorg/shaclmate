import { Either } from "purify-ts";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstCompoundType } from "./transformShapeToAstCompoundType.js";
import { transformShapeToAstTermType } from "./transformShapeToAstTermType.js";

/**
 * Try to convert a shape to a type using some heuristics.
 *
 * We don't try to handle exotic cases allowed by the SHACL spec, such as combinations of sh:in and sh:node. Instead we assume
 * a shape has one type.
 */
export function transformShapeToAstType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, Exclude<ast.Type, ast.PlaceholderType>> {
  // Try to transform the property shape into an AST type without cardinality constraints
  return transformShapeToAstCompoundType
    .bind(this)(shape, shapeStack)
    .chain((astType) =>
      astType
        .map((_) => Either.of<Error, Exclude<ast.Type, ast.PlaceholderType>>(_))
        .orDefaultLazy(() =>
          transformShapeToAstTermType.bind(this)(shape, shapeStack),
        ),
    );
}

import { Either, Maybe } from "purify-ts";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

export function transformShapeNodeConstraintToAstType(
  this: ShapesGraphToAstTransformer,
  shape: input.UndiscriminatedShape,
  shapeStack: ShapeStack,
): Either<Error, Maybe<ast.Type>> {
  // If the shape has an sh:node itself then transform that instead
  if (shape.node.isJust()) {
    return this.shapesGraph
      .nodeShape(shape.node.unsafeCoerce())
      .chain((nodeShape) =>
        transformShapeToAstType.call(this, nodeShape, shapeStack),
      )
      .map(Maybe.of);
  }
  return Either.of(Maybe.empty());
}

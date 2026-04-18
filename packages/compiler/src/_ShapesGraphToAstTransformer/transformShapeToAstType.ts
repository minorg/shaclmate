import { Either } from "purify-ts";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstCompoundType } from "./transformShapeToAstCompoundType.js";
import { transformShapeToAstListType } from "./transformShapeToAstListType.js";
import { transformShapeToAstObjectType } from "./transformShapeToAstObjectType.js";
import { transformShapeToAstTermType } from "./transformShapeToAstTermType.js";

const tryTransformShapeToAstTypeMethods = [
  transformShapeToAstCompoundType,
  transformShapeToAstListType,
  transformShapeToAstObjectType,
];

/**
 * Try to convert a shape to a type using some heuristics. All shape -> AST type transformation calls should go through this function,
 * not the other transformShapeToAst*Type functions directly.
 */
export function transformShapeToAstType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, ast.Type> {
  const astType = this.cachedAstTypesByShapeIdentifier.get(shape.identifier);
  if (astType) {
    return Either.of(astType);
  }

  // Every transformShapeToAst*Type returns Either<Error, Maybe<ast.Type>>:
  //   * Left/Error: the shape was the expected type but the transformation failed
  //   * Right+Nothing = the shape wasn't the expected type
  //   * Right+Some = the shape was the expected type and the transformation succeeded

  for (const tryTransformAstTypeToShapeMethod of tryTransformShapeToAstTypeMethods) {
    const either = tryTransformAstTypeToShapeMethod.call(
      this,
      shape,
      shapeStack,
    );
    if (either.isLeft()) {
      return either;
    }
    const astType = either.unsafeCoerce().extract();
    if (astType) {
      this.cachedAstTypesByShapeIdentifier.set(shape.identifier, astType);
      return Either.of(astType);
    }
  }

  return transformShapeToAstTermType
    .call(this, shape, shapeStack)
    .ifRight((astType) => {
      this.cachedAstTypesByShapeIdentifier.set(shape.identifier, astType);
    });
}

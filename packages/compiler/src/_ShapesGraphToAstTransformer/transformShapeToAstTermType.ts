import type {} from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";
import { Either } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapeStack } from "./ShapeStack.js";
import { propertyShapeNodeKinds } from "./propertyShapeNodeKinds.js";

/**
 * Try to convert a shape to an AST TermType using some heuristics.
 */
export function transformShapeToAstTermType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<
  Error,
  Omit<ast.TermType, "kind"> & {
    readonly kind: "TermType";
  }
> {
  shapeStack.push(shape);
  try {
    const nodeKinds = propertyShapeNodeKinds(shape);

    return Either.of({
      defaultValue: shapeStack.defaultValue,
      hasValues: shapeStack.constraints.hasValues,
      in_: shapeStack.constraints.in_,
      kind: "TermType",
      nodeKinds:
        nodeKinds.size > 0
          ? nodeKinds
          : new Set<NodeKind>(["BlankNode", "NamedNode", "Literal"]),
    });
  } finally {
    shapeStack.pop(shape);
  }
}

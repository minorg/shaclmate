import type { Literal } from "@rdfjs/types";
import { Either, Left } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapeStack } from "./ShapeStack.js";
import { propertyShapeNodeKinds } from "./propertyShapeNodeKinds.js";

/**
 * Try to convert a property shape to an AST LiteralType using some heuristics.
 */
export function transformShapeToAstLiteralType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, ast.LiteralType> {
  shapeStack.push(shape);
  try {
    const literalDefaultValue = shapeStack.defaultValue.filter(
      (term) => term.termType === "Literal",
    );
    const literalHasValues = shapeStack.constraints.hasValues.filter(
      (term) => term.termType === "Literal",
    ) as readonly Literal[];
    const literalIn = shapeStack.constraints.in_.filter(
      (term) => term.termType === "Literal",
    ) as readonly Literal[];
    const nodeKinds = propertyShapeNodeKinds(shape);

    if (
      [
        // Treat any shape with the constraints in the list as a literal type
        shape.constraints.datatype,
        shape.constraints.maxExclusive,
        shape.constraints.maxInclusive,
        shape.constraints.minExclusive,
        shape.constraints.minInclusive,
      ].some((constraint) => constraint.isJust()) ||
      shape.constraints.languageIn.length > 0 ||
      literalDefaultValue.isJust() ||
      literalHasValues.length > 0 ||
      literalIn.length > 0 ||
      // Treat any shape with a single sh:nodeKind of sh:Literal as a literal type
      (nodeKinds.size === 1 && nodeKinds.has("Literal"))
    )
      return Either.of({
        datatype: shape.constraints.datatype,
        defaultValue: literalDefaultValue,
        hasValues: literalHasValues,
        in_: literalIn,
        kind: "LiteralType",
        languageIn: shape.constraints.languageIn,
        maxExclusive: shape.constraints.maxExclusive,
        maxInclusive: shape.constraints.maxInclusive,
        minExclusive: shape.constraints.minExclusive,
        minInclusive: shape.constraints.minInclusive,
        nodeKinds: new Set<"Literal">(["Literal"]),
      });

    return Left(new Error(`unable to transform ${shape} into an AST type`));
  } finally {
    shapeStack.pop(shape);
  }
}

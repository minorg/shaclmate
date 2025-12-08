import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Either, Left } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapeStack } from "./ShapeStack.js";
import { propertyShapeNodeKinds } from "./propertyShapeNodeKinds.js";
import { transformShapeToAstAbstractTypeProperties } from "./transformShapeToAstAbstractTypeProperties.js";

/**
 * Try to convert a property shape to an AST IdentifierType using some heuristics.
 */
export function transformShapeToAstIdentifierType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, ast.IdentifierType> {
  shapeStack.push(shape);
  try {
    // defaultValue / hasValue / in only makes sense with IRIs
    const identifierDefaultValue = shapeStack.defaultValue.filter(
      (value) => value.termType === "NamedNode",
    );
    const identifierHasValues = shapeStack.constraints.hasValues.filter(
      (term) => term.termType === "NamedNode",
    ) as readonly NamedNode[];
    const identifierIn = shapeStack.constraints.in_.filter(
      (term) => term.termType === "NamedNode",
    );
    const nodeKinds = propertyShapeNodeKinds(shape);

    if (
      identifierHasValues.length > 0 ||
      identifierDefaultValue.isJust() ||
      identifierIn.length > 0 ||
      (nodeKinds.size > 0 && nodeKinds.size <= 2 && !nodeKinds.has("Literal"))
    ) {
      return Either.of(
        new ast.IdentifierType({
          ...transformShapeToAstAbstractTypeProperties(shape),
          defaultValue: identifierDefaultValue,
          hasValues: identifierHasValues,
          in_: identifierIn,
          nodeKinds: nodeKinds as ReadonlySet<IdentifierNodeKind>,
        }),
      );
    }

    return Left(new Error(`unable to transform ${shape} into an AST type`));
  } finally {
    shapeStack.pop(shape);
  }
}

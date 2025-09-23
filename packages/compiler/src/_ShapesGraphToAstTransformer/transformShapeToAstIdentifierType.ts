import type { Literal, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Either, Left, type Maybe } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import { propertyShapeNodeKinds } from "./propertyShapeNodeKinds.js";

/**
 * Try to convert a property shape to an AST IdentifierType using some heuristics.
 */
export function transformShapeToAstIdentifierType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  inherited: {
    defaultValue: Maybe<Literal | NamedNode>;
    hasValues: readonly (Literal | NamedNode)[];
    in_: readonly (Literal | NamedNode)[];
  },
): Either<Error, ast.IdentifierType> {
  // defaultValue / hasValue / in only makes sense with IRIs
  const identifierDefaultValue = inherited.defaultValue.filter(
    (value) => value.termType === "NamedNode",
  );
  const identifierHasValues = inherited.hasValues
    .concat(shape.constraints.hasValues)
    .filter((term) => term.termType === "NamedNode") as readonly NamedNode[];
  const identifierIn = inherited.in_
    .concat(shape.constraints.in_)
    .filter((term) => term.termType === "NamedNode");
  const nodeKinds = propertyShapeNodeKinds(shape);

  if (
    identifierHasValues.length > 0 ||
    identifierDefaultValue.isJust() ||
    identifierIn.length > 0 ||
    (nodeKinds.size > 0 && nodeKinds.size <= 2 && !nodeKinds.has("Literal"))
  ) {
    return Either.of({
      defaultValue: identifierDefaultValue,
      hasValues: identifierHasValues,
      in_: identifierIn,
      kind: "IdentifierType",
      nodeKinds: nodeKinds as Set<IdentifierNodeKind>,
    });
  }

  return Left(new Error(`unable to transform ${shape} into an AST type`));
}

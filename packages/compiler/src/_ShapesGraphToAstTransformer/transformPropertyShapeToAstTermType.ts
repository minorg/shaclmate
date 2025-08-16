import type { Literal, NamedNode } from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";
import { Either, Maybe } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import * as input from "../input/index.js";
import { propertyShapeNodeKinds } from "./propertyShapeNodeKinds.js";

/**
 * Try to convert a property shape to an AST TermType using some heuristics.
 */
export function transformPropertyShapeToAstTermType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  inherited: {
    defaultValue: Maybe<Literal | NamedNode>;
  } | null,
): Either<
  Error,
  Omit<ast.TermType, "kind"> & {
    readonly kind: "TermType";
  }
> {
  const nodeKinds = propertyShapeNodeKinds(shape);

  return Either.of({
    defaultValue: (shape instanceof input.PropertyShape
      ? shape.defaultValue
      : Maybe.empty()
    ).alt(inherited !== null ? inherited.defaultValue : Maybe.empty()),
    hasValues: shape.constraints.hasValues,
    in_: shape.constraints.in_,
    kind: "TermType",
    nodeKinds:
      nodeKinds.size > 0
        ? nodeKinds
        : new Set<NodeKind>(["BlankNode", "NamedNode", "Literal"]),
  });
}

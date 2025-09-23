import type { Literal, NamedNode } from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";
import { Either, type Maybe } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import { propertyShapeNodeKinds } from "./propertyShapeNodeKinds.js";

/**
 * Try to convert a shape to an AST TermType using some heuristics.
 */
export function transformShapeToAstTermType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  inherited: {
    defaultValue: Maybe<Literal | NamedNode>;
    hasValues: readonly (Literal | NamedNode)[];
    in_: readonly (Literal | NamedNode)[];
  },
): Either<
  Error,
  Omit<ast.TermType, "kind"> & {
    readonly kind: "TermType";
  }
> {
  const nodeKinds = propertyShapeNodeKinds(shape);

  return Either.of({
    defaultValue: inherited.defaultValue,
    hasValues: inherited.hasValues.concat(shape.constraints.hasValues),
    in_: inherited.in_.concat(shape.constraints.in_),
    kind: "TermType",
    nodeKinds:
      nodeKinds.size > 0
        ? nodeKinds
        : new Set<NodeKind>(["BlankNode", "NamedNode", "Literal"]),
  });
}

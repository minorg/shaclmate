import type { Literal, NamedNode } from "@rdfjs/types";
import type { Either, Maybe } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";

/**
 * Try to convert a shape to a type using some heuristics.
 *
 * We don't try to handle exotic cases allowed by the SHACL spec, such as combinations of sh:in and sh:node. Instead we assume
 * a shape has one type.
 */
export function transformShapeToAstType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  inherited: {
    defaultValue: Maybe<Literal | NamedNode>;
    hasValues: readonly (Literal | NamedNode)[];
    in_: readonly (Literal | NamedNode)[];
  },
): Either<Error, ast.CardinalityType.ItemType> {
  // Try to transform the property shape into an AST type without cardinality constraints
  return this.transformShapeToAstCompositeType(shape, inherited)
    .altLazy(() => this.transformShapeToAstIdentifierType(shape, inherited))
    .altLazy(() => this.transformShapeToAstLiteralType(shape, inherited))
    .altLazy(() => this.transformShapeToAstTermType(shape, inherited));
}

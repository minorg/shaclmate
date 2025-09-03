import type { Literal, NamedNode } from "@rdfjs/types";
import type { Either, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import * as input from "../input/index.js";

/**
 * Try to convert a property shape to a type using some heuristics.
 *
 * We don't try to handle exotic cases allowed by the SHACL spec, such as combinations of sh:in and sh:node. Instead we assume
 * a shape has one type.
 */
export function transformPropertyShapeToAstType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  inherited: {
    defaultValue: Maybe<Literal | NamedNode>;
  } | null,
): Either<Error, ast.Type> {
  // Try to transform the property shape into an AST type without cardinality constraints
  return this.transformPropertyShapeToAstCompositeType(shape, inherited)
    .altLazy(() =>
      this.transformPropertyShapeToAstIdentifierType(shape, inherited),
    )
    .altLazy(() =>
      this.transformPropertyShapeToAstLiteralType(shape, inherited),
    )
    .altLazy(() => this.transformPropertyShapeToAstTermType(shape, inherited))
    .map((itemType) => {
      // Handle cardinality constraints

      if (
        (shape instanceof input.PropertyShape && shape.defaultValue.isJust()) ||
        inherited?.defaultValue.isJust()
      ) {
        // Ignore other cardinality constraints if there's a default value and treat the type as minCount=maxCount=1
        return itemType;
      }

      const maxCount = shape.constraints.maxCount;
      const minCount = shape.constraints.minCount;

      if (maxCount.isNothing() && minCount.isNothing()) {
        // The shape has no cardinality constraints
        if (inherited === null) {
          // The shape is top-level (not an sh:xone/sh:and of a top-level shape)
          // Treat it as a Set, the default in RDF.
          // We want Set to be the outermost type unless it's explicitly requested with sh:minCount 0.
          return {
            itemType,
            kind: "SetType",
            mutable: shape.mutable,
            minCount: 0,
          };
        }
        // else the shape is not top-level
        // We want Set to be the outermost type, so just return the itemType here
        return itemType;
      }

      if (minCount.orDefault(0) === 0 && maxCount.extractNullable() === 1) {
        return {
          itemType,
          kind: "OptionType",
        };
      }

      if (minCount.orDefault(0) === 1 && maxCount.extractNullable() === 1) {
        return itemType;
      }

      invariant(minCount.isJust() || maxCount.isJust());
      // There are cardinality constraints for a Set. It may be an inner type.
      return {
        itemType,
        kind: "SetType",
        minCount: minCount.orDefault(0),
        mutable: shape.mutable,
      };
    });
}

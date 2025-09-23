import type { Literal, NamedNode } from "@rdfjs/types";
import type { Either, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as ast from "../ast/index.js";
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
    maxCount: Maybe<number>;
    minCount: Maybe<number>;
  },
): Either<Error, ast.CardinalityType<ast.CardinalityType.ItemType>> {
  const defaultValue =
    shape instanceof input.PropertyShape
      ? shape.defaultValue.alt(inherited.defaultValue)
      : inherited.defaultValue;
  const maxCount = shape.constraints.maxCount.alt(inherited.maxCount);
  const minCount = shape.constraints.minCount.alt(inherited.minCount);

  // Try to transform the property shape into an AST type without cardinality constraints
  return this.transformPropertyShapeToAstCompositeType(shape, inherited)
    .altLazy(() =>
      this.transformPropertyShapeToAstIdentifierType(shape, inherited),
    )
    .altLazy(() =>
      this.transformPropertyShapeToAstLiteralType(shape, inherited),
    )
    .altLazy(() => this.transformPropertyShapeToAstTermType(shape, inherited))
    .map((itemType): ast.CardinalityType<ast.CardinalityType.ItemType> => {
      // Handle cardinality constraints

      if (ast.CardinalityType.isCardinalityType(itemType)) {
        return itemType;
      }

      invariant(ast.CardinalityType.isItemType(itemType));

      if (defaultValue.isJust()) {
        return { itemType, kind: "PlainType" };
      }

      if (maxCount.isNothing() && minCount.isNothing()) {
        return {
          itemType,
          kind: "SetType",
          mutable: shape.mutable,
          minCount: 0,
        };
      }

      if (minCount.orDefault(0) === 0 && maxCount.extractNullable() === 1) {
        return {
          itemType,
          kind: "OptionType",
        };
      }

      if (minCount.orDefault(0) === 1 && maxCount.extractNullable() === 1) {
        return { itemType, kind: "PlainType" };
      }

      invariant(minCount.isJust() || maxCount.isJust());
      return {
        itemType,
        kind: "SetType",
        minCount: minCount.orDefault(0),
        mutable: shape.mutable,
      };
    });
}

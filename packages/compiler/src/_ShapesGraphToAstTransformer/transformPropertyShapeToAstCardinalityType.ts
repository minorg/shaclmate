import type { Literal, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type * as ast from "../ast/index.js";
import * as input from "../input/index.js";

export function transformPropertyShapeToAstCardinalityType<
  ItemTypeT extends ast.CardinalityType.ItemType,
>({
  inherited,
  itemType,
  shape,
}: {
  shape: input.Shape;
  inherited: {
    defaultValue: Maybe<Literal | NamedNode>;
    maxCount: Maybe<number>;
    minCount: Maybe<number>;
  };
  itemType: ItemTypeT;
}): ast.CardinalityType<ItemTypeT> {
  const defaultValue =
    shape instanceof input.PropertyShape
      ? shape.defaultValue.alt(inherited.defaultValue)
      : inherited.defaultValue;
  const maxCount = shape.constraints.maxCount.alt(inherited.maxCount);
  const minCount = shape.constraints.minCount.alt(inherited.minCount);

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
}

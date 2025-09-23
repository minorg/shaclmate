import { Maybe } from "purify-ts";
import type { BooleanType } from "./BooleanType.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntType } from "./IntType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { StringType } from "./StringType.js";
import type { TermType } from "./TermType.js";
import { Type } from "./Type.js";
import type { UnionType } from "./UnionType.js";

export abstract class CardinalityType<
  ItemTypeT extends CardinalityType.ItemType,
> extends Type {
  override readonly discriminatorProperty: Maybe<Type.DiscriminatorProperty> =
    Maybe.empty();
  readonly itemType: ItemTypeT;
  abstract readonly kind: "OptionType" | "PlainType" | "SetType";

  constructor({ itemType }: { itemType: ItemTypeT }) {
    super();
    this.itemType = itemType;
  }
}

export namespace CardinalityType {
  export function isCardinalityType(
    type: Type,
  ): type is CardinalityType<CardinalityType.ItemType> {
    return type instanceof CardinalityType;
  }

  export function isItemType(type: Type): type is ItemType {
    return !(type instanceof CardinalityType);
  }

  export type ItemType =
    | BooleanType
    | DateTimeType
    | DateType
    | FloatType
    | IdentifierType
    | IntType
    | ListType
    | LiteralType
    | ObjectType
    | ObjectUnionType
    | StringType
    | TermType
    | UnionType;
}

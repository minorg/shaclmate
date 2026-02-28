import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import type { BigIntType } from "./BigIntType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { BooleanType } from "./BooleanType.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntType } from "./IntType.js";
import type { IriType } from "./IriType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { removeUndefined } from "./removeUndefined.js";
import type { StringType } from "./StringType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { type Code, code } from "./ts-poet-wrapper.js";
import type { UnionType } from "./UnionType.js";

/**
 * Abstract base class for types that contain other types e.g., ListType, OptionType, SetType.
 */
export abstract class AbstractContainerType<
  ItemTypeT extends AbstractContainerType.ItemType,
> extends AbstractType {
  abstract override readonly kind:
    | "DefaultValueType"
    | "ListType"
    | "OptionType"
    | "SetType";

  /**
   * Container item type.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  itemType: ItemTypeT;

  constructor({
    itemType,
    ...superParameters
  }: {
    itemType: ItemTypeT;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.itemType = itemType;
  }

  @Memoize()
  get schema(): Code {
    return code`${removeUndefined(this.schemaObject)}`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      item: code`() => (${this.itemType.schema})`,
    };
  }
}

export namespace AbstractContainerType {
  export type Conversion = AbstractType.Conversion;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;

  export type ItemType =
    | BigIntType
    | BlankNodeType
    | BooleanType
    | DateTimeType
    | DateType
    | FloatType
    | IdentifierType
    | IntType
    | IriType
    | ListType<ListType.ItemType>
    | LiteralType
    | ObjectType
    | ObjectUnionType
    | StringType
    | TermType
    | UnionType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "BigIntType":
      case "BlankNodeType":
      case "BooleanType":
      case "DateTimeType":
      case "DateType":
      case "FloatType":
      case "IdentifierType":
      case "IntType":
      case "IriType":
      case "ListType":
      case "LiteralType":
      case "ObjectType":
      case "ObjectUnionType":
      case "StringType":
      case "TermType":
      case "UnionType":
        return true;
      case "DefaultValueType":
      case "LazyObjectOptionType":
      case "LazyObjectSetType":
      case "LazyObjectType":
      case "OptionType":
      case "SetType":
        return false;
    }
  }

  export const JsonType = AbstractType.JsonType;
  export type JsonType = AbstractType.JsonType;
}

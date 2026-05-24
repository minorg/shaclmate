import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { AnonymousUnionType } from "./AnonymousUnionType.js";
import type { BigDecimalType } from "./BigDecimalType.js";
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
import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { NamedUnionType } from "./NamedUnionType.js";
import { removeUndefined } from "./removeUndefined.js";
import type { StringType } from "./StringType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for types that contain other types e.g., ListType, OptionType, SetType.
 */
export abstract class AbstractContainerType<
  ItemTypeT extends AbstractContainerType.ItemType,
> extends AbstractType {
  override readonly declaration: Maybe<Code> = Maybe.empty();
  abstract override readonly kind: "DefaultValue" | "List" | "Option" | "Set";

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

  get recursive(): boolean {
    return this.itemType.recursive;
  }

  get referencesObjectType(): boolean {
    return this.itemType.referencesObjectType;
  }

  @Memoize()
  get schema(): Code {
    return code`${removeUndefined(this.schemaObject)}`;
  }

  override get toRdfResourceValueTypes(): AbstractType["toRdfResourceValueTypes"] {
    return this.itemType.toRdfResourceValueTypes;
  }

  @Memoize()
  protected get itemConversionFunctionDefault(): AbstractType.ConversionFunction {
    return {
      code: code`${this.reusables.snippets.identityConversionFunction}`,
      sourceTypes: [
        {
          name: this.itemType.name,
          typeof: this.itemType.typeofs[0],
        },
      ],
    };
  }

  @Memoize()
  protected get itemValidationFunctionDefault(): Code {
    return code`${this.reusables.snippets.identityValidationFunction}`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      item: code`() => (${this.itemType.schema})`,
    };
  }
}

export namespace AbstractContainerType {
  export type ConversionFunction = AbstractType.ConversionFunction;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;

  export type ItemType =
    | AnonymousUnionType
    | BigDecimalType
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
    | NamedObjectUnionType
    | NamedUnionType
    | NamedObjectType
    | StringType
    | TermType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "AnonymousUnion":
      case "BigDecimal":
      case "BigInt":
      case "BlankNode":
      case "Boolean":
      case "DateTime":
      case "Date":
      case "Float":
      case "Identifier":
      case "Int":
      case "Iri":
      case "List":
      case "Literal":
      case "NamedObjectUnion":
      case "NamedUnion":
      case "NamedObjectType":
      case "String":
      case "Term":
        return true;
      case "DefaultValue":
      case "LazyObjectOption":
      case "LazyObjectSet":
      case "LazyObject":
      case "Option":
      case "Set":
        return false;
    }
  }

  export const JsonType = AbstractType.JsonType;
  export type JsonType = AbstractType.JsonType;
}

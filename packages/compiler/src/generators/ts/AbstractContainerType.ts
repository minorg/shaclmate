import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractBuiltinType } from "./AbstractBuiltinType.js";
import type { BigDecimalType } from "./BigDecimalType.js";
import type { BigIntType } from "./BigIntType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { BooleanType } from "./BooleanType.js";
import type { Callable } from "./Callable.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntType } from "./IntType.js";
import type { IriType } from "./IriType.js";
import type { LangStringType } from "./LangStringType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { SchemaObject } from "./SchemaObject.js";
import type { StringType } from "./StringType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for types that contain other types e.g., ListType, OptionType, SetType.
 */
export abstract class AbstractContainerType<
  ItemTypeT extends AbstractContainerType.ItemType,
> extends AbstractBuiltinType {
  override readonly discriminatedType: Maybe<AbstractBuiltinType.DiscriminatedType> =
    Maybe.empty();
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
  } & ConstructorParameters<typeof AbstractBuiltinType>[0]) {
    super(superParameters);
    this.itemType = itemType;
  }

  get recursive(): boolean {
    return this.itemType.recursive;
  }

  get referencesNamedType(): boolean {
    return this.name.isJust() || this.itemType.referencesNamedType;
  }

  @Memoize()
  override get schema(): SchemaObject {
    return new SchemaObject({
      properties: super.schema.properties.concat(
        this.recursive || this.referencesNamedType
          ? code`get itemType() { return ${this.itemType.schema}; }`
          : code`itemType: ${this.itemType.schema}`,
      ),
      type: new SchemaObject.Type({
        members: super.schema.type.members.concat(
          code`itemType: ${this.itemType.schema.type.expression}`,
        ),
        name: super.schema.type.name,
      }),
      variable: super.schema.variable,
    });
  }

  @Memoize()
  protected get itemConversionFunctionDefault(): AbstractBuiltinType.ConversionFunction {
    return {
      code: code`${this.reusables.snippets.identityConversionFunction}`,
      sourceTypes: [
        {
          expression: this.itemType.expression,
          jsType: this.itemType.jsTypes[0],
        },
      ],
    };
  }

  @Memoize()
  protected get itemValidationFunctionDefault(): Callable {
    return new ReferenceCallable(
      this.reusables.snippets.identityValidationFunction,
    );
  }
}

export namespace AbstractContainerType {
  export type ConversionFunction = AbstractBuiltinType.ConversionFunction;
  export type DiscriminatedType = AbstractBuiltinType.DiscriminatedType;
  export const GraphqlType = AbstractBuiltinType.GraphqlType;
  export type GraphqlType = AbstractBuiltinType.GraphqlType;

  export type ItemType =
    | BigDecimalType
    | BigIntType
    | BlankNodeType
    | BooleanType
    | DateTimeType
    | DateType
    | DiscriminatedUnionType
    | FloatType
    | IdentifierType
    | IntType
    | IriType
    | LangStringType
    | ListType<ListType.ItemType>
    | LiteralType
    | ObjectDiscriminatedUnionType
    | ObjectIntersectionType
    | ObjectType
    | StringType
    | TermType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "BigDecimal":
      case "BigInt":
      case "BlankNode":
      case "Boolean":
      case "Date":
      case "DateTime":
      case "DiscriminatedUnion":
      case "Float":
      case "Identifier":
      case "Int":
      case "Iri":
      case "LangString":
      case "List":
      case "Literal":
      case "Object":
      case "ObjectDiscriminatedUnion":
      case "ObjectIntersection":
      case "String":
      case "Term":
        return true;
      case "DefaultValue":
      case "LazyOption":
      case "LazySet":
      case "Lazy":
      case "Option":
      case "Set":
        return false;
    }
  }

  export type JsonType = AbstractBuiltinType.JsonType;
}

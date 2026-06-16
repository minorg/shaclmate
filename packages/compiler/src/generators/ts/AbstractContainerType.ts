import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
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
import type { LangStringType } from "./LangStringType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
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

  get referencesNamedType(): boolean {
    return this.name.isJust() || this.itemType.referencesNamedType;
  }

  @Memoize()
  protected get itemConversionFunctionDefault(): AbstractType.ConversionFunction {
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
  protected get itemValidationFunctionDefault(): Code {
    return code`${this.reusables.snippets.identityValidationFunction}`;
  }

  protected override get schemaInitializers(): readonly Code[] {
    const initializers = super.schemaInitializers.concat();
    if (this.recursive || this.referencesNamedType) {
      initializers.push(
        code`get itemType() { return ${this.itemType.schema}; }`,
      );
    } else {
      initializers.push(code`itemType: ${this.itemType.schema}`);
    }
    return initializers;
  }
}

export namespace AbstractContainerType {
  export type ConversionFunction = AbstractType.ConversionFunction;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;

  export type ItemType =
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
    | LangStringType
    | ListType<ListType.ItemType>
    | LiteralType
    | ObjectUnionType
    | ObjectType
    | StringType
    | TermType
    | UnionType<Type>;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
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
      case "LangString":
      case "List":
      case "Literal":
      case "Object":
      case "ObjectUnion":
      case "String":
      case "Term":
      case "Union":
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

  export const JsonType = AbstractType.JsonType;
  export type JsonType = AbstractType.JsonType;
}

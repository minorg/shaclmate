import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import { InlineCallable } from "./InlineCallable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import type { Type } from "./Type.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DefaultValueType<
  ItemTypeT extends DefaultValueType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  readonly defaultValue: Literal | NamedNode;
  override readonly equalsFunction = this.itemType.equalsFunction;
  override readonly filterFunction = this.itemType.filterFunction;
  override readonly filterType = this.itemType.filterType;
  override readonly schemaType =
    code`${this.reusables.snippets.DefaultValueSchema}<${this.itemType.schemaType}>`;
  override readonly fromRdfResourceValuesFunction = new InlineCallable(
    code`${this.reusables.snippets.defaultValueFromRdfResourceValues}<${this.itemType.expression}, ${this.itemType.schemaType}>(${this.itemType.fromRdfResourceValuesFunction.unannotatedUsage})`,
  );
  override readonly graphqlArgs: AbstractContainerType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  override readonly graphqlType = this.itemType.graphqlType;
  override readonly hashFunction = this.itemType.hashFunction;
  override readonly inlineExpression = this.itemType.expression;
  override readonly jsTypes = this.itemType.jsTypes;
  override readonly jsonObjectType: AbstractContainerType<ItemTypeT>["jsonObjectType"] =
    this.itemType.jsonObjectType;
  override readonly jsonValueType: AbstractContainerType<ItemTypeT>["jsonValueType"] =
    this.itemType.jsonValueType;
  override readonly kind = "DefaultValue";
  override readonly mutable = this.itemType.mutable;
  override readonly toJsonObjectFunction = this.itemType.toJsonObjectFunction;
  override readonly toJsonValueFunction = this.itemType.toJsonValueFunction;
  override readonly toRdfResourceValueTypes =
    this.itemType.toRdfResourceValueTypes;
  override readonly validationFunction: AbstractContainerType<ItemTypeT>["validationFunction"] =
    this.itemType.validationFunction;
  override readonly valueSparqlConstructTriplesFunction =
    this.itemType.valueSparqlConstructTriplesFunction;
  override readonly valueSparqlWherePatternsFunction = new InlineCallable(
    code`${this.reusables.snippets.defaultValueSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction.unannotatedUsage})`,
  );

  constructor({
    defaultValue,
    ...superParameters
  }: {
    defaultValue: Literal | NamedNode;
  } & ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0]) {
    super(superParameters);
    this.defaultValue = defaultValue;
  }

  @Memoize()
  get conversionFunction(): Maybe<AbstractContainerType.ConversionFunction> {
    const itemConversionFunction = this.itemType.conversionFunction.orDefault(
      this.itemConversionFunctionDefault,
    );
    return Maybe.of({
      code: code`${this.reusables.snippets.convertWithDefaultValue}(${itemConversionFunction.code}, ${this.defaultValueExpression})`,
      sourceTypes: itemConversionFunction.sourceTypes
        .filter((sourceType) => sourceType.jsType.typeof !== "undefined")
        .concat({
          expression: code`undefined`,
          jsType: { typeof: "undefined" },
        }),
    });
  }

  @Memoize()
  override get fromJsonObjectFunction(): AbstractContainerType<ItemTypeT>["fromJsonObjectFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.defaultValueFromJsonObject}(${this.itemType.fromJsonObjectFunction.annotatedUsage})`,
    );
  }

  @Memoize()
  override get fromJsonValueFunction(): AbstractContainerType<ItemTypeT>["fromJsonValueFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.defaultValueFromJsonValue}(${this.itemType.fromJsonValueFunction.annotatedUsage})`,
    );
  }

  protected override get schemaInitializers() {
    return super.schemaInitializers.concat(
      code`defaultValue: ${this.rdfjsTermExpression(this.defaultValue)}`,
    );
  }

  @Memoize()
  private get defaultValueExpression() {
    switch (this.itemType.kind) {
      case "Identifier":
      case "Iri":
      case "Literal":
      case "Term":
        return this.rdfjsTermExpression(this.defaultValue);
      case "DiscriminatedUnion":
      case "List":
      case "Object":
      case "ObjectDiscriminatedUnion":
      case "ObjectIntersection":
        throw new RangeError(`not implemented ${this.itemType.kind}`);
    }

    invariant(this.defaultValue.termType === "Literal");
    return this.itemType.valueExpression(this.defaultValue);
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): Code {
    return this.itemType.graphqlResolveExpression(parameters);
  }

  override toLoggableExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["toLoggableExpression"]
    >[0],
  ): Code {
    return this.itemType.toLoggableExpression(parameters);
  }

  override toRdfResourceValuesExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["toRdfResourceValuesExpression"]
    >[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.itemType.equalsFunction.annotatedUsage}(${variables.value}, ${this.defaultValueExpression}).isLeft() ? ${this.itemType.toRdfResourceValuesExpression(parameters)} : []`;
  }

  override toStringExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["toStringExpression"]
    >[0],
  ): Code {
    return this.itemType.toStringExpression(parameters);
  }
}

export namespace DefaultValueType {
  export type ItemType = Exclude<AbstractContainerType.ItemType, BlankNodeType>;

  export function isItemType(type: Type): type is ItemType {
    if (type.kind === "BlankNode") {
      return false;
    }
    return AbstractContainerType.isItemType(type);
  }
}

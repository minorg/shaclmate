import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import type { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import { InlineCallable } from "./InlineCallable.js";
import type { Type } from "./Type.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DefaultValueType<
  ItemTypeT extends DefaultValueType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  override readonly compactedJsonType = this.itemType.compactedJsonType;
  readonly defaultValue: Literal | NamedNode;
  override readonly discriminantProperty: Maybe<AbstractType.DiscriminantProperty> =
    Maybe.empty();
  override readonly equalsFunction = this.itemType.equalsFunction;
  override readonly expandedJsonType: AbstractContainerType<ItemTypeT>["expandedJsonType"] =
    this.itemType.expandedJsonType;
  override readonly filterFunction = this.itemType.filterFunction;
  override readonly filterType = this.itemType.filterType;
  override readonly fromCompactedJsonFunction =
    this.itemType.fromCompactedJsonFunction;
  override readonly fromExpandedJsonFunction =
    this.itemType.fromExpandedJsonFunction;
  override readonly fromRdfResourceValuesFunction = new InlineCallable(
    code`${this.reusables.snippets.defaultValueFromRdfResourceValues}<${this.itemType.expression}, ${this.itemType.schemaType}>(${this.itemType.fromRdfResourceValuesFunction.unannotatedUsage})`,
  );
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  override readonly graphqlType = this.itemType.graphqlType;
  override readonly inlineExpression = this.itemType.expression;
  override readonly hashFunction = this.itemType.hashFunction;
  override readonly jsTypes = this.itemType.jsTypes;
  override readonly kind = "DefaultValue";
  override readonly mutable = this.itemType.mutable;
  override readonly schemaType =
    code`${this.reusables.snippets.DefaultValueSchema}<${this.itemType.schemaType}>`;
  override readonly toCompactedJsonFunction =
    this.itemType.toCompactedJsonFunction;
  override readonly toExpandedJsonFunction =
    this.itemType.toExpandedJsonFunction;
  override readonly toRdfResourceValueTypes =
    this.itemType.toRdfResourceValueTypes;
  override readonly validationFunction: AbstractType["validationFunction"] =
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
      case "Intersection":
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
    parameters: Parameters<AbstractType["toLoggableExpression"]>[0],
  ): Code {
    return this.itemType.toLoggableExpression(parameters);
  }

  override toRdfResourceValuesExpression(
    parameters: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.itemType.equalsFunction.annotatedUsage}(${variables.value}, ${this.defaultValueExpression}).isLeft() ? ${this.itemType.toRdfResourceValuesExpression(parameters)} : []`;
  }

  override toStringExpression(
    parameters: Parameters<AbstractType["toStringExpression"]>[0],
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

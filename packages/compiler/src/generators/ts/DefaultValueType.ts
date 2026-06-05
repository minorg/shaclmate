import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import type { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { Type } from "./Type.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DefaultValueType<
  ItemTypeT extends DefaultValueType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  readonly defaultValue: Literal | NamedNode;
  override readonly discriminantProperty: Maybe<AbstractType.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  override readonly jsTypes = this.itemType.jsTypes;
  override readonly kind = "DefaultValue";
  override readonly validationFunction: Maybe<Code> =
    this.itemType.validationFunction;

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

  override get equalsFunction(): Code {
    return this.itemType.equalsFunction;
  }

  override get expression(): Code {
    return this.itemType.expression;
  }

  override get filterFunction(): Code {
    return this.itemType.filterFunction;
  }

  override get filterType(): Code {
    return this.itemType.filterType;
  }

  // override fromRdfResourceValuesExpression({
  //   variables,
  // }: Parameters<
  //   AbstractContainerType<ItemTypeT>["fromRdfResourceValuesExpression"]
  // >[0]): Code {
  //   return this.itemType.fromRdfResourceValuesExpression({
  //     variables: {
  //       ...variables,
  //       resourceValues: code`${variables.resourceValues}.map(values => values.length > 0 ? values : new ${this.reusables.imports.Resource}.Value(${{ dataFactory: this.reusables.imports.dataFactory, focusResource: variables.resource, propertyPath: variables.propertyPath, term: this.rdfjsTermExpression(this.defaultValue) }}).toValues())`,
  //     },
  //   });
  // }
  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.defaultValueFromRdfResourceValues}<${this.itemType.expression}, ${this.itemType.schemaType}>(${this.itemType.fromRdfResourceValuesFunction})`;
  }

  override get graphqlType(): AbstractContainerType.GraphqlType {
    return this.itemType.graphqlType;
  }

  override get hashFunction(): Code {
    return this.itemType.hashFunction;
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.DefaultValueSchema}<${this.itemType.schemaType}>`;
  }

  override get toRdfResourceValueTypes(): AbstractContainerType<ItemTypeT>["toRdfResourceValueTypes"] {
    return this.itemType.toRdfResourceValueTypes;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return this.itemType.valueSparqlConstructTriplesFunction;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.reusables.snippets.defaultValueSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
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
      case "List":
      case "Object":
      case "ObjectUnion":
      case "Union":
        throw new RangeError(`not implemented ${this.itemType.kind}`);
    }

    invariant(this.defaultValue.termType === "Literal");
    return this.itemType.literalValueExpression(this.defaultValue);
  }

  override fromJsonExpression(
    parameters: Parameters<AbstractType["fromJsonExpression"]>[0],
  ): Code {
    return this.itemType.fromJsonExpression(parameters);
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): Code {
    return this.itemType.graphqlResolveExpression(parameters);
  }

  override jsonSchema(
    parameters: Parameters<AbstractContainerType<ItemTypeT>["jsonSchema"]>[0],
  ): Code {
    return this.itemType.jsonSchema(parameters);
  }

  override jsonType(
    parameters?: Parameters<AbstractContainerType<ItemTypeT>["jsonType"]>[0],
  ): AbstractType.JsonType {
    return this.itemType.jsonType(parameters);
  }

  override jsonUiSchemaElement(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["jsonUiSchemaElement"]
    >[0],
  ): Maybe<Code> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override toJsonExpression(
    parameters: Parameters<AbstractType["toJsonExpression"]>[0],
  ): Code {
    return this.itemType.toJsonExpression(parameters);
  }

  override toRdfResourceValuesExpression(
    parameters: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.itemType.equalsFunction}(${variables.value}, ${this.defaultValueExpression}).isLeft() ? ${this.itemType.toRdfResourceValuesExpression(parameters)} : []`;
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

import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe, NonEmptyList } from "purify-ts";
import { fromRdf } from "rdf-literal";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractContainerType } from "./AbstractContainerType.js";
import type { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";
import type { Type } from "./Type.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class DefaultValueType<
  ItemTypeT extends DefaultValueType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  readonly defaultValue: Literal | NamedNode;
  override readonly discriminantProperty: Maybe<AbstractType.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly kind = "DefaultValueType";
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    defaultValue,
    ...superParameters
  }: {
    defaultValue: Literal | NamedNode;
  } & ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0]) {
    super(superParameters);
    this.defaultValue = defaultValue;
  }

  get conversions(): readonly AbstractContainerType.Conversion[] {
    let conversions = this.itemType.conversions;
    this.defaultValuePrimitiveExpression.ifJust((defaultValue) => {
      conversions = conversions.concat({
        conversionExpression: () => code`${defaultValue}`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "undefined"`,
        sourceTypeName: code`undefined`,
        sourceTypeof: "undefined",
      });
    });
    return conversions;
  }

  override get equalsFunction(): Code {
    return this.itemType.equalsFunction;
  }

  override get filterFunction(): Code {
    return this.itemType.filterFunction;
  }

  override get filterType(): Code {
    return this.itemType.filterType;
  }

  override get graphqlType(): AbstractContainerType.GraphqlType {
    return this.itemType.graphqlType;
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  override get name(): Code | string {
    return this.itemType.name;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${snippets.DefaultValueSchema}`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${snippets.defaultValueSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      defaultValue: this.defaultValueTermExpression,
    };
  }

  @Memoize()
  private get defaultValuePrimitiveExpression(): Maybe<Code> {
    switch (this.itemType.kind) {
      case "DateTimeType":
      case "DateType":
        invariant(this.defaultValue.termType === "Literal");
        return Maybe.of(
          code`new Date("${fromRdf(this.defaultValue, true).toISOString()}")`,
        );
      case "BooleanType":
      case "FloatType":
      case "IntType":
        invariant(this.defaultValue.termType === "Literal");
        return Maybe.of(code`${fromRdf(this.defaultValue, true)}`);
      case "StringType":
        invariant(this.defaultValue.termType === "Literal");
        return Maybe.of(code`${literalOf(this.defaultValue.value)}`);
      case "IdentifierType":
      case "NamedNodeType":
        invariant(this.defaultValue.termType === "NamedNode");
        return Maybe.of(this.defaultValueTermExpression);
      case "LiteralType":
      case "TermType":
        invariant(this.defaultValue.termType === "Literal");
        return Maybe.of(this.defaultValueTermExpression);
      case "ListType":
      case "ObjectType":
      case "ObjectUnionType":
      case "UnionType":
        return Maybe.empty();
      default:
        this.itemType satisfies never;
        throw new Error("should never reach this point");
    }
  }

  @Memoize()
  private get defaultValueTermExpression(): Code {
    return rdfjsTermExpression(this.defaultValue);
  }

  override fromJsonExpression(
    parameters: Parameters<AbstractType["fromJsonExpression"]>[0],
  ): Code {
    return this.itemType.fromJsonExpression(parameters);
  }

  override fromRdfExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromRdfExpression"]
  >[0]): Code {
    return this.itemType.fromRdfExpression({
      variables: {
        ...variables,
        resourceValues: code`${variables.resourceValues}.map(values => values.length > 0 ? values : new ${imports.Resource}.TermValue(${{ focusResource: variables.resource, predicate: variables.predicate, term: this.defaultValueTermExpression }}).toValues())`,
      },
    });
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): Code {
    return this.itemType.graphqlResolveExpression(parameters);
  }

  override hashStatements(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["hashStatements"]
    >[0],
  ): readonly Code[] {
    return this.itemType.hashStatements(parameters);
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

  override jsonZodSchema(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["jsonZodSchema"]
    >[0],
  ): Code {
    return this.itemType.jsonZodSchema(parameters);
  }

  override sparqlConstructTriples(
    parameters: Parameters<AbstractType["sparqlConstructTriples"]>[0],
  ): Maybe<Code> {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  override toJsonExpression(
    parameters: Parameters<AbstractType["toJsonExpression"]>[0],
  ): Code {
    return this.itemType.toJsonExpression(parameters);
  }

  override toRdfExpression(
    parameters: Parameters<AbstractType["toRdfExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return this.defaultValuePrimitiveExpression
      .map(
        (defaultValuePrimitiveExpression) =>
          code`${this.itemType.equalsFunction}(${variables.value}, ${defaultValuePrimitiveExpression}).isLeft() ? ${this.itemType.toRdfExpression(parameters)} : []`,
      )
      .orDefault(
        code`${this.itemType.toRdfExpression(parameters)}.filter(value => !value.equals(${this.defaultValueTermExpression}))`,
      );
  }
}

export namespace DefaultValueType {
  export type ItemType = Exclude<AbstractContainerType.ItemType, BlankNodeType>;

  export function isItemType(type: Type): type is ItemType {
    if (type.kind === "BlankNodeType") {
      return false;
    }
    return AbstractContainerType.isItemType(type);
  }
}

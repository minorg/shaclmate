import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe, NonEmptyList } from "purify-ts";
import { fromRdf } from "rdf-literal";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import type { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";

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
        conversionExpression: () => `${defaultValue}`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    });
    return conversions;
  }

  override get equalsFunction(): string {
    return this.itemType.equalsFunction;
  }

  override get filterFunction(): string {
    return this.itemType.filterFunction;
  }

  override get filterType(): string {
    return this.itemType.filterType;
  }

  override get graphqlType(): AbstractContainerType.GraphqlType {
    return this.itemType.graphqlType;
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  override get name(): string {
    return this.itemType.name;
  }

  @Memoize()
  override get schemaType(): string {
    return `${syntheticNamePrefix}DefaultValueSchema<${this.itemType.schemaType}>`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): string {
    return `${syntheticNamePrefix}defaultValueSparqlWherePatterns<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      defaultValue: this.defaultValueTermExpression,
    };
  }

  @Memoize()
  private get defaultValuePrimitiveExpression(): Maybe<string> {
    switch (this.itemType.kind) {
      case "DateTimeType":
      case "DateType":
        invariant(this.defaultValue.termType === "Literal");
        return Maybe.of(`new Date("${fromRdf(this.defaultValue, true)}")`);
      case "BooleanType":
      case "FloatType":
      case "IntType":
        invariant(this.defaultValue.termType === "Literal");
        return Maybe.of(fromRdf(this.defaultValue, true));
      case "StringType":
        invariant(this.defaultValue.termType === "Literal");
        return Maybe.of(JSON.stringify(this.defaultValue.value));
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
  private get defaultValueTermExpression(): string {
    return rdfjsTermExpression(this.defaultValue);
  }

  override fromJsonExpression(
    parameters: Parameters<AbstractType["fromJsonExpression"]>[0],
  ): string {
    return this.itemType.fromJsonExpression(parameters);
  }

  override fromRdfExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromRdfExpression"]
  >[0]): string {
    return this.itemType.fromRdfExpression({
      variables: {
        ...variables,
        resourceValues: `${variables.resourceValues}.map(values => values.length > 0 ? values : new rdfjsResource.Resource.TermValue(${objectInitializer({ focusResource: variables.resource, predicate: variables.predicate, term: this.defaultValueTermExpression })}).toValues())`,
      },
    });
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): string {
    return this.itemType.graphqlResolveExpression(parameters);
  }

  override hashStatements(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["hashStatements"]
    >[0],
  ): readonly string[] {
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
  ): Maybe<string> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["jsonZodSchema"]
    >[0],
  ): string {
    return this.itemType.jsonZodSchema(parameters);
  }

  override snippetDeclarations(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["snippetDeclarations"]
    >[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      this.itemType.snippetDeclarations(parameters),

      singleEntryRecord(
        `${syntheticNamePrefix}DefaultValueSchema`,
        `type ${syntheticNamePrefix}DefaultValueSchema<ItemSchemaT> = { readonly defaultValue: rdfjs.Literal | rdfjs.NamedNode; readonly item: ItemSchemaT; }`,
      ),

      parameters.features.has("sparql")
        ? singleEntryRecord(
            `${syntheticNamePrefix}defaultValueSparqlWherePatterns`,
            {
              code: `\
function ${syntheticNamePrefix}defaultValueSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${syntheticNamePrefix}SparqlWherePatternsFunction<ItemFilterT, ItemSchemaT>): ${syntheticNamePrefix}SparqlWherePatternsFunction<ItemFilterT, ${syntheticNamePrefix}DefaultValueSchema<ItemSchemaT>> {  
  return ({ schema, ...otherParameters }) => {
    const [itemSparqlWherePatterns, liftSparqlPatterns] = ${syntheticNamePrefix}liftSparqlPatterns(itemSparqlWherePatternsFunction({ schema: schema.item, ...otherParameters }));
    return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
  }
}`,
              dependencies: {
                ...sharedSnippetDeclarations.liftSparqlPatterns,
                ...sharedSnippetDeclarations.SparqlWherePatternsFunction,
              },
            },
          )
        : {},
    );
  }

  override sparqlConstructTriples(
    parameters: Parameters<AbstractType["sparqlConstructTriples"]>[0],
  ): readonly (AbstractType.SparqlConstructTriple | string)[] {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  override toJsonExpression(
    parameters: Parameters<AbstractType["toJsonExpression"]>[0],
  ): string {
    return this.itemType.toJsonExpression(parameters);
  }

  override toRdfExpression(
    parameters: Parameters<AbstractType["toRdfExpression"]>[0],
  ): string {
    // Convert the item to an RDF/JS term (actually an array with one term) and then filter it out if it's the same as the default value,
    // so the default value is never serialized.
    return `${this.itemType.toRdfExpression(parameters)}.filter(value => !value.equals(${this.defaultValueTermExpression}))`;
  }

  override useImports(
    parameters: Parameters<AbstractType["useImports"]>[0],
  ): readonly Import[] {
    return this.itemType.useImports(parameters);
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

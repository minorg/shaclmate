import { CardinalityType } from "./CardinalityType.js";
import type { Import } from "./Import.js";
import type { Type } from "./Type.js";

export class PlainType<
  ItemTypeT extends CardinalityType.ItemType,
> extends CardinalityType<ItemTypeT> {
  readonly kind = "PlainType";

  override get conversions(): readonly Type.Conversion[] {
    return this.itemType.conversions;
  }

  override get equalsFunction(): string {
    return this.itemType.equalsFunction;
  }

  override get graphqlName(): Type.GraphqlName {
    return this.itemType.graphqlName;
  }

  override get jsonName(): Type.JsonName {
    return this.itemType.jsonName;
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  override get name(): string {
    return this.itemType.name;
  }

  override get typeof(): Type["typeof"] {
    return this.itemType.typeof;
  }

  override fromJsonExpression(
    parameters: Parameters<Type["fromJsonExpression"]>[0],
  ): string {
    return this.itemType.fromJsonExpression(parameters);
  }

  override fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
  ): string {
    return `${this.itemType.fromRdfExpression(parameters)}.chain(values => values.head())`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<Type["graphqlResolveExpression"]>[0],
  ): string {
    return this.itemType.graphqlResolveExpression(parameters);
  }

  override hashStatements(
    parameters: Parameters<Type["hashStatements"]>[0],
  ): readonly string[] {
    return this.itemType.hashStatements(parameters);
  }

  override jsonUiSchemaElement(
    parameters: Parameters<Type["jsonUiSchemaElement"]>[0],
  ) {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<Type["jsonZodSchema"]>[0],
  ): string {
    return this.itemType.jsonZodSchema(parameters);
  }

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): readonly string[] {
    return this.itemType.snippetDeclarations(parameters);
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<Type["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    return this.itemType.sparqlConstructTemplateTriples(parameters);
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    return this.itemType.sparqlWherePatterns(parameters);
  }

  override toJsonExpression(
    parameters: Parameters<Type["toJsonExpression"]>[0],
  ): string {
    return this.itemType.toJsonExpression(parameters);
  }

  override toRdfExpression(
    parameters: Parameters<Type["toRdfExpression"]>[0],
  ): string {
    return this.itemType.toRdfExpression(parameters);
  }

  override useImports(
    parameters: Parameters<Type["useImports"]>[0],
  ): readonly Import[] {
    return this.itemType.useImports(parameters);
  }
}

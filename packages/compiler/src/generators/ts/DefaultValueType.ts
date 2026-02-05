import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe, NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractContainerType } from "./AbstractContainerType.js";
import type { AbstractType } from "./AbstractType.js";
import type { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";

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
    return this.itemType.conversions.concat({
      conversionExpression: () => `"${defaultValue}"`,
      sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
      sourceTypeName: "undefined",
    });
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

  override snippetDeclarations(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["snippetDeclarations"]
    >[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      this.itemType.snippetDeclarations(parameters),
      sharedSnippetDeclarations.toLiteral,
    );
  }

  override toRdfExpression(
    parameters: Parameters<AbstractType["toRdfExpression"]>[0],
  ): string {
    // Convert the item to an RDF/JS term (actually an array with one term) and then filter it out if it's the same as the default value,
    // so the default value is never serialized.
    return `${this.itemType.toRdfExpression(parameters)}.filter(value => !value.equals(${this.defaultValueExpression}))`;
  }

  override useImports(
    parameters: Parameters<AbstractType["useImports"]>[0],
  ): readonly Import[] {
    return this.itemType.useImports(parameters);
  }

  @Memoize()
  private defaultValueExpression(): string {
    return rdfjsTermExpression(this.defaultValue);
  }
}

export namespace DefaultValueType {
  export type ItemType = AbstractContainerType.ItemType;
  export const isItemType = AbstractContainerType.isItemType;
}

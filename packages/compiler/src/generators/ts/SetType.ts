import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../enums/index.js";
import type { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class SetType extends Type {
  private readonly _mutable: boolean;
  private readonly minCount: number;

  readonly itemType: Type;
  readonly kind = "SetType";
  readonly typeof = "object";

  constructor({
    itemType,
    minCount,
    mutable,
    ...superParameters
  }: ConstructorParameters<typeof Type>[0] & {
    itemType: Type;
    mutable: boolean;
    minCount: number;
  }) {
    super(superParameters);
    this.itemType = itemType;
    this.minCount = minCount;
    invariant(this.minCount >= 0);
    this._mutable = mutable;
  }

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [];

    if (this.minCount === 0) {
      conversions.push({
        conversionExpression: () => "[]",
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
      conversions.push({
        // Defensive copy
        conversionExpression: (value) =>
          `${value}${this.mutable ? ".concat()" : ""}`,
        // Array.isArray doesn't narrow correctly
        // sourceTypeCheckExpression: (value) => `Array.isArray(${value})`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
        sourceTypeName: `readonly (${this.itemType.name})[]`,
      });
    } else {
      conversions.push({
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          `purify.NonEmptyList.isNonEmpty(${value})`,
        sourceTypeName: this.name,
      });
    }

    return conversions;
  }

  @Memoize()
  override get equalsFunction(): string {
    return `((left, right) => ${syntheticNamePrefix}arrayEquals(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  override get graphqlName(): string {
    return `new graphql.GraphQLList(new graphql.GraphQLNonNull(${this.itemType.graphqlName}))`;
  }

  @Memoize()
  override get jsonName(): string {
    return `readonly (${this.itemType.jsonName})[]`;
  }

  override get mutable(): boolean {
    return this._mutable || this.itemType.mutable;
  }

  @Memoize()
  override get name(): string {
    if (this._mutable) {
      return `(${this.itemType.name})[]`;
    }
    if (this.minCount === 0) {
      return `readonly (${this.itemType.name})[]`;
    }
    return `purify.NonEmptyList<${this.itemType.name}>`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    let expression = variables.value;
    if (!this._mutable && this.minCount > 0) {
      expression = `purify.NonEmptyList.fromArray(${expression}).unsafeCoerce()`;
    }
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: "_item" },
    });
    return itemFromJsonExpression === "_item"
      ? expression
      : `${expression}.map(_item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    const itemFromRdfExpression = this.itemType.fromRdfExpression({
      variables: { ...variables, resourceValues: "_item.toValues()" },
    });
    if (this._mutable || this.minCount === 0) {
      return `purify.Either.of([...${variables.resourceValues}.flatMap(_item => ${itemFromRdfExpression}.toMaybe().toList())])`;
    }
    return `purify.NonEmptyList.fromArray([...${variables.resourceValues}.flatMap(_item => ${itemFromRdfExpression}.toMaybe().toList())]).toEither(new rdfjsResource.Resource.ValueError(${objectInitializer({ focusResource: variables.resource, message: `\`\${rdfjsResource.Resource.Identifier.toString(${variables.resource}.identifier)} is empty\``, predicate: variables.predicate })}))`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [
      `for (const _item${depth} of ${variables.value}) { ${this.itemType
        .hashStatements({
          depth: depth + 1,
          variables: {
            hasher: variables.hasher,
            value: `_item${depth}`,
          },
        })
        .join("\n")} }`,
    ];
  }

  override jsonUiSchemaElement(
    parameters: Parameters<Type["jsonUiSchemaElement"]>[0],
  ): ReturnType<Type["jsonUiSchemaElement"]> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<Type["jsonZodSchema"]>[0],
  ): ReturnType<Type["jsonZodSchema"]> {
    let schema = `${this.itemType.jsonZodSchema(parameters)}.array()`;
    if (this.minCount > 0) {
      schema = `${schema}.nonempty().min(${this.minCount})`;
    } else {
      schema = `${schema}.default(() => [])`;
    }
    return schema;
  }

  override snippetDeclarations(features: Set<TsFeature>): readonly string[] {
    const snippetDeclarations: string[] = this.itemType
      .snippetDeclarations(features)
      .concat();
    if (features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.arrayEquals);
    }
    return snippetDeclarations;
  }

  override sparqlConstructTemplateTriples({
    context,
    variables,
  }: Parameters<Type["sparqlConstructTemplateTriples"]>[0]): readonly string[] {
    switch (context) {
      case "property":
        return super.sparqlConstructTemplateTriples({ context, variables });
      case "type":
        return this.itemType.sparqlConstructTemplateTriples({
          context,
          variables,
        });
    }
  }

  override sparqlWherePatterns({
    context,
    variables,
  }: Parameters<Type["sparqlWherePatterns"]>[0]): readonly string[] {
    switch (context) {
      case "property": {
        const patterns = super.sparqlWherePatterns({ context, variables });
        if (patterns.length === 0) {
          return [];
        }
        return this.minCount > 0
          ? patterns
          : [`{ patterns: [${patterns.join(", ")}], type: "optional" }`];
      }
      case "type": {
        return this.itemType.sparqlWherePatterns({ context, variables });
      }
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return `${variables.value}.map(_item => (${this.itemType.toJsonExpression({ variables: { value: "_item" } })}))`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    return `${variables.value}.map((_item) => ${this.itemType.toRdfExpression({
      variables: { ...variables, value: "_item" },
    })})`;
  }

  override useImports(features: Set<TsFeature>): readonly Import[] {
    return this.itemType.useImports(features);
  }
}

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import type { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class SetType extends Type {
  private readonly _mutable: boolean;
  private readonly minCount: number;

  override readonly discriminatorProperty: Maybe<Type.DiscriminatorProperty> =
    Maybe.empty();
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
    let name = `readonly (${this.itemType.jsonName})[]`;
    if (this.minCount === 0) {
      name = `${name} | undefined`;
    }
    return name;
  }

  @Memoize()
  override get jsonPropertySignature() {
    return {
      hasQuestionToken: this.minCount === 0,
      name: `readonly (${this.itemType.jsonName})[]`,
    };
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
      variables: { value: "item" },
    });
    return itemFromJsonExpression === "item"
      ? expression
      : `${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    const itemFromRdfExpression = this.itemType.fromRdfExpression({
      variables: { ...variables, resourceValues: "item.toValues()" },
    });
    const arrayFromRdfExpression = `purify.Either.sequence(${variables.resourceValues}.map(item => ${itemFromRdfExpression}))`;
    if (this._mutable || this.minCount === 0) {
      return arrayFromRdfExpression;
    }
    return `${arrayFromRdfExpression}.chain(array => purify.NonEmptyList.fromArray(array).toEither(new Error(\`\${rdfjsResource.Resource.Identifier.toString(${variables.resource}.identifier)} is an empty set\`)))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Type["graphqlResolveExpression"]>[0]): string {
    return variables.value;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [
      `for (const item${depth} of ${variables.value}) { ${this.itemType
        .hashStatements({
          depth: depth + 1,
          variables: {
            hasher: variables.hasher,
            value: `item${depth}`,
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

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): readonly string[] {
    const snippetDeclarations: string[] = this.itemType
      .snippetDeclarations(parameters)
      .concat();
    if (parameters.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.arrayEquals);
    }
    return snippetDeclarations;
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<Type["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlConstructTemplateTriples(parameters);
      case "subject":
        return this.itemType.sparqlConstructTemplateTriples(parameters);
    }
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object": {
        const patterns = super.sparqlWherePatterns(parameters);
        if (patterns.length === 0) {
          return [];
        }
        return this.minCount > 0
          ? patterns
          : [`{ patterns: [${patterns.join(", ")}], type: "optional" }`];
      }
      case "subject": {
        return this.itemType.sparqlWherePatterns(parameters);
      }
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return `${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: "item" } })}))`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    return `${variables.value}.map((item) => ${this.itemType.toRdfExpression({
      variables: { ...variables, value: "item" },
    })})`;
  }

  override useImports(
    parameters: Parameters<Type["useImports"]>[0],
  ): readonly Import[] {
    return this.itemType.useImports(parameters);
  }
}

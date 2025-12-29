import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { Type } from "./Type.js";

function isTypeofString(
  x: string,
): x is "boolean" | "object" | "number" | "string" {
  switch (x) {
    case "boolean":
    case "object":
    case "number":
    case "string":
      return true;
    default:
      return false;
  }
}

/**
 * Abstract base class for ListType and SetType.
 */
export abstract class AbstractCollectionType<
  ItemTypeT extends AbstractType,
> extends AbstractType {
  override readonly discriminantProperty: Maybe<Type.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly itemType: ItemTypeT;
  protected readonly minCount: number;
  protected readonly _mutable: boolean;
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    itemType,
    minCount,
    mutable,
    ...superParameters
  }: {
    itemType: ItemTypeT;
    minCount: number;
    mutable: boolean;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.itemType = itemType;
    this.minCount = minCount;
    invariant(this.minCount >= 0);
    this._mutable = mutable;
    if (mutable) {
      invariant(this.minCount === 0);
    }
  }

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [];

    // Try to do some conversions from types itemType can be converted to
    // For example, if itemType is a NamedNode, it can be converted from a string, so here we'd accept:
    // readonly NamedNode[] (no conversion)
    // readonly string[] (map to NamedNodes)

    // We only consider discriminating by (item) typeof. For example, the types above could be discriminated by the branches
    // array.every(item => typeof item === "object")
    // array.every(item => typeof item === "string")

    const itemTypeConversionsByTypeof = {} as Record<
      "boolean" | "object" | "number" | "string",
      Type.Conversion
    >;
    if (this.itemType.typeofs.length === 1) {
      itemTypeConversionsByTypeof[this.itemType.typeofs[0]] = {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          `typeof ${value} === ${this.itemType.typeofs[0]}`,
        sourceTypeName: this.itemType.name,
      };

      for (const itemTypeConversion of this.itemType.conversions) {
        if (isTypeofString(itemTypeConversion.sourceTypeName)) {
          if (!itemTypeConversionsByTypeof[itemTypeConversion.sourceTypeName]) {
            itemTypeConversionsByTypeof[itemTypeConversion.sourceTypeName] =
              itemTypeConversion;
          }
        }
      }
    }

    if (this.minCount === 0) {
      conversions.push({
        conversionExpression: () => "[]",
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });

      if (Object.keys(itemTypeConversionsByTypeof).length <= 1) {
        // There were no additional conversions with different item typeof's, so we don't need to check .every or do .map
        // Just check that the original value is an array with typeof "object". Array.isArray() doesn't narrow types for some reason.
        conversions.push({
          conversionExpression: (value) =>
            // Defensive copy
            `${value}${this.mutable ? ".concat()" : ""}`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
          sourceTypeName: `readonly (${this.itemType.name})[]`,
        });
      } else {
        // There were additional conversions with different item typeof's.
        // We do .every (per above) to discriminate array types with different item typeof's and .map to convert the array at runtime.
        for (const [itemTypeof, itemTypeofConversion] of Object.entries(
          itemTypeConversionsByTypeof,
        )) {
          conversions.push({
            conversionExpression: (value) => {
              const itemTypeConversionExpression =
                itemTypeofConversion.conversionExpression("item");
              return itemTypeConversionExpression !== "item"
                ? `${value}.map(item => ${itemTypeConversionExpression})`
                : // Defensive copy
                  `${value}${this.mutable ? ".concat()" : ""}`;
            },
            sourceTypeCheckExpression: (value) =>
              // Use the type guard functions to discriminate different array types.
              `${syntheticNamePrefix}isReadonly${itemTypeof[0].toUpperCase()}${itemTypeof.slice(1)}Array(${value})`,
            sourceTypeName: `readonly (${itemTypeofConversion.sourceTypeName})[]`,
          });
        }
      }
    } else {
      // minCount > 0
      // Don't try to do any item type conversions here (yet).
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
  override get graphqlName(): Type.GraphqlName {
    return new Type.GraphqlName(
      `new graphql.GraphQLList(${this.itemType.graphqlName})`,
    );
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
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): string {
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

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractType["graphqlResolveExpression"]>[0]): string {
    return variables.value;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly string[] {
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
    parameters: Parameters<AbstractType["jsonUiSchemaElement"]>[0],
  ): ReturnType<AbstractType["jsonUiSchemaElement"]> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<AbstractType["jsonZodSchema"]>[0],
  ): ReturnType<AbstractType["jsonZodSchema"]> {
    let schema = `${this.itemType.jsonZodSchema(parameters)}.array()`;
    if (this.minCount > 0) {
      schema = `${schema}.nonempty().min(${this.minCount})`;
    } else {
      schema = `${schema}.default(() => [])`;
    }
    return schema;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
  ): readonly string[] {
    const snippetDeclarations: string[] = this.itemType
      .snippetDeclarations(parameters)
      .concat();

    if (parameters.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.arrayEquals);
    }

    for (const conversion of this.conversions) {
      let sourceTypeCheckExpression =
        conversion.sourceTypeCheckExpression("ignore");
      if (!sourceTypeCheckExpression.startsWith(syntheticNamePrefix)) {
        continue;
      }
      sourceTypeCheckExpression = sourceTypeCheckExpression.substring(
        syntheticNamePrefix.length,
      );
      if (sourceTypeCheckExpression.startsWith("isReadonlyBooleanArray")) {
        snippetDeclarations.push(SnippetDeclarations.isReadonlyBooleanArray);
      } else if (
        sourceTypeCheckExpression.startsWith("isReadonlyNumberArray")
      ) {
        snippetDeclarations.push(SnippetDeclarations.isReadonlyNumberArray);
      } else if (
        sourceTypeCheckExpression.startsWith("isReadonlyObjectArray")
      ) {
        snippetDeclarations.push(SnippetDeclarations.isReadonlyObjectArray);
      } else if (
        sourceTypeCheckExpression.startsWith("isReadonlyStringArray")
      ) {
        snippetDeclarations.push(SnippetDeclarations.isReadonlyStringArray);
      }
    }

    return snippetDeclarations;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): string {
    return `${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: "item" } })}))`;
  }
}

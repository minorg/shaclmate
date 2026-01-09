import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { AbstractType } from "./AbstractType.js";
import { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { Type } from "./Type.js";

const allSnippetDeclarations = {
  filterMaybe: singleEntryRecord(
    `${syntheticNamePrefix}filterMaybe`,
    `\
function ${syntheticNamePrefix}filterMaybe<ItemT, ItemFilterT>(filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean) {
  return (filter: ${syntheticNamePrefix}MaybeFilter<ItemFilterT>, value: purify.Maybe<ItemT>): boolean => {
    if (typeof filter.item !== "undefined") {
      if (value.isNothing()) {
        return false;
      }

      if (!filterItem(filter.item, value.extract()!)) {
        return false;
      }
    }

    if (typeof filter.null !== "undefined" && filter.null !== value.isNothing()) {
      return false;
    }

    return true;
  }
}`,
  ),

  maybeEquals: singleEntryRecord(
    `${syntheticNamePrefix}maybeEquals`,
    `\
function ${syntheticNamePrefix}maybeEquals<T>(
  leftMaybe: purify.Maybe<T>,
  rightMaybe: purify.Maybe<T>,
  valueEquals: (left: T, right: T) => boolean | ${syntheticNamePrefix}EqualsResult,
): ${syntheticNamePrefix}EqualsResult {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(
        leftMaybe,
        rightMaybe,
        valueEquals(leftMaybe.unsafeCoerce(), rightMaybe.unsafeCoerce()),
      );
    }
    return purify.Left({
      left: leftMaybe.unsafeCoerce(),
      type: "RightNull",
    });
  }

  if (rightMaybe.isJust()) {
    return purify.Left({
      right: rightMaybe.unsafeCoerce(),
      type: "LeftNull",
    });
  }

  return ${syntheticNamePrefix}EqualsResult.Equal;
}`,
  ),

  MaybeFilter: singleEntryRecord(
    `${syntheticNamePrefix}MaybeFilter`,
    `\
interface ${syntheticNamePrefix}MaybeFilter<ItemFilterT> {
  readonly item?: ItemFilterT;
  readonly null?: boolean;
}`,
  ),
};

export class OptionType<ItemTypeT extends Type> extends AbstractType {
  override readonly discriminantProperty: Maybe<Type.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: Type["graphqlArgs"] = Maybe.empty();
  readonly itemType: ItemTypeT;
  readonly kind = "OptionType";
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    itemType,
    ...superParameters
  }: { itemType: ItemTypeT } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.itemType = itemType;
  }

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [];
    conversions.push({
      conversionExpression: (value) => value,
      sourceTypeCheckExpression: (value) => `purify.Maybe.isMaybe(${value})`,
      sourceTypeName: this.name,
    });
    for (const itemTypeConversion of this.itemType.conversions) {
      conversions.push({
        ...itemTypeConversion,
        conversionExpression: (value) =>
          `purify.Maybe.of(${itemTypeConversion.conversionExpression(value)})`,
      });
    }

    // Unless itemType is a list, it should only have a conversion from undefined if it has a
    // defaultValue. Per the CST->AST transformation logic, a type with a defaultValue
    // should never be wrapped in an OptionType.
    invariant(
      !conversions.some(
        (conversion) => conversion.sourceTypeName === "undefined",
      ) || this.itemType instanceof AbstractCollectionType,
    );
    if (
      !conversions.some(
        (conversion) => conversion.sourceTypeName === "undefined",
      )
    ) {
      conversions.push({
        conversionExpression: () => "purify.Maybe.empty()",
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    }

    return conversions;
  }

  @Memoize()
  override get equalsFunction(): string {
    return `((left, right) => ${syntheticNamePrefix}maybeEquals(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  get filterFunction(): string {
    return `${syntheticNamePrefix}filterMaybe<${this.itemType.name}, ${this.itemType.filterType.name}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get filterType(): Type.CompositeFilterTypeReference {
    return new Type.CompositeFilterTypeReference(
      `${syntheticNamePrefix}MaybeFilter<${this.itemType.filterType.name}>`,
    );
  }

  @Memoize()
  override get graphqlType(): Type.GraphqlType {
    invariant(!this.itemType.graphqlType.nullable);
    return new Type.GraphqlType(this.itemType.graphqlType.name, {
      nullable: true,
    });
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<Type["jsonType"]>[0],
  ): Type.JsonType {
    const itemTypeJsonType = this.itemType.jsonType(parameters);
    invariant(!itemTypeJsonType.optional);
    return new Type.JsonType(itemTypeJsonType.name, {
      optional: true,
    });
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get name(): string {
    return `purify.Maybe<${this.itemType.name}>`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    const expression = `purify.Maybe.fromNullable(${variables.value})`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: "item" },
    });
    return itemFromJsonExpression === "item"
      ? expression
      : `${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
  ): string {
    const { variables } = parameters;
    return `${this.itemType.fromRdfExpression(parameters)}.map(values => values.length > 0 ? values.map(value => purify.Maybe.of(value)) : rdfjsResource.Resource.Values.fromValue<purify.Maybe<${this.itemType.name}>>({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, value: purify.Maybe.empty() }))`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<Type["graphqlResolveExpression"]>[0],
  ): string {
    return `${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [
      `${variables.value}.ifJust((value${depth}) => { ${this.itemType
        .hashStatements({
          depth: depth + 1,
          variables: {
            hasher: variables.hasher,
            value: `value${depth}`,
          },
        })
        .join("\n")} })`,
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
    return `${this.itemType.jsonZodSchema(parameters)}.optional()`;
  }

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      this.itemType.snippetDeclarations(parameters),
      allSnippetDeclarations.filterMaybe,
      parameters.features.has("equals")
        ? allSnippetDeclarations.maybeEquals
        : {},
      allSnippetDeclarations.MaybeFilter,
    );
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
        const patterns = this.itemType.sparqlWherePatterns(parameters);
        if (patterns.length === 0) {
          return [];
        }
        return [`{ patterns: [${patterns.join(", ")}], type: "optional" }`];
      }
      case "subject": {
        throw new Error("should never be called");
        // return this.itemType.sparqlWherePatterns(parameters);
      }
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return `${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: "item" } })})).extract()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    const itemTypeToRdfExpression = this.itemType.toRdfExpression({
      variables: { ...variables, value: "value" },
    });
    let toRdfExpression = `${variables.value}.toList()`;
    if (itemTypeToRdfExpression !== "[value]") {
      toRdfExpression = `${toRdfExpression}.flatMap((value) => ${itemTypeToRdfExpression})`;
    }
    return toRdfExpression;
  }

  override useImports(
    parameters: Parameters<Type["useImports"]>[0],
  ): readonly Import[] {
    return [...this.itemType.useImports(parameters), Import.PURIFY];
  }
}

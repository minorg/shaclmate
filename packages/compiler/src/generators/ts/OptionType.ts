import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { type Code, code, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { AbstractContainerType } from "./AbstractContainerType.js";
import { codeEquals } from "./codeEquals.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";

export class OptionType<
  ItemTypeT extends OptionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  override readonly discriminantProperty: Maybe<AbstractContainerType.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractContainerType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  readonly kind = "OptionType";
  override readonly typeofs = NonEmptyList(["object" as const]);

  @Memoize()
  override get conversions(): readonly AbstractContainerType.Conversion[] {
    const conversions: AbstractContainerType.Conversion[] = [];
    conversions.push({
      conversionExpression: (value) => value,
      sourceTypeCheckExpression: (value) =>
        code`${imports.Maybe}.isMaybe(${value})`,
      sourceTypeName: this.name,
      sourceTypeof: "object",
    });
    for (const itemTypeConversion of this.itemType.conversions) {
      conversions.push({
        ...itemTypeConversion,
        conversionExpression: (value) =>
          code`${imports.Maybe}.of(${itemTypeConversion.conversionExpression(value)})`,
      });
    }

    // Unless itemType is a list, it should only have a conversion from undefined if it has a
    // defaultValue. Per the CST->AST transformation logic, a type with a defaultValue
    // should never be wrapped in an OptionType.
    invariant(
      !conversions.some(
        (conversion) => conversion.sourceTypeof === "undefined",
      ) || this.itemType instanceof AbstractCollectionType,
    );
    if (
      !conversions.some((conversion) => conversion.sourceTypeof === "undefined")
    ) {
      conversions.push({
        conversionExpression: () => code`${imports.Maybe}.empty()`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "undefined"`,
        sourceTypeName: code`undefined`,
        sourceTypeof: "undefined",
      });
    }

    return conversions;
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`((left, right) => ${snippets.maybeEquals}(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${snippets.filterMaybe}<${this.itemType.name}, ${this.itemType.filterType}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${snippets.MaybeFilter}<${this.itemType.filterType}>`;
  }

  @Memoize()
  override get graphqlType(): AbstractContainerType.GraphqlType {
    invariant(!this.itemType.graphqlType.nullable);
    return new AbstractContainerType.GraphqlType(
      this.itemType.graphqlType.name,
      {
        nullable: true,
      },
    );
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get name(): Code {
    return code`${imports.Maybe}<${this.itemType.name}>`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${snippets.MaybeSchema}<${this.itemType.schemaType}>`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${snippets.maybeSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromJsonExpression"]
  >[0]): Code {
    const expression = code`${imports.Maybe}.fromNullable(${variables.value})`;
    const valueVariable = code`item`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: valueVariable },
    });
    return codeEquals(itemFromJsonExpression, valueVariable)
      ? expression
      : code`${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["fromRdfExpression"]
    >[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.itemType.fromRdfExpression(parameters)}.map(values => values.length > 0 ? values.map(value => ${imports.Maybe}.of(value)) : ${imports.Resource}.Values.fromValue<${imports.Maybe}<${this.itemType.name}>>({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, value: ${imports.Maybe}.empty() }))`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): Code {
    return code`${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`${variables.value}.ifJust((value${depth}) => { ${joinCode(
        this.itemType
          .hashStatements({
            depth: depth + 1,
            variables: {
              hasher: variables.hasher,
              value: code`value${depth}`,
            },
          })
          .concat(),
      )} });`,
    ];
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractContainerType<ItemTypeT>["jsonType"]>[0],
  ): AbstractContainerType.JsonType {
    const itemTypeJsonType = this.itemType.jsonType(parameters);
    invariant(!itemTypeJsonType.optional);
    return new AbstractContainerType.JsonType(itemTypeJsonType.name, {
      optional: true,
    });
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
    return code`${this.itemType.jsonZodSchema(parameters)}.optional()`;
  }

  override sparqlConstructTriples(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["sparqlConstructTriples"]
    >[0],
  ): Maybe<Code> {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  override toJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toJsonExpression"]
  >[0]): Code {
    return code`${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: code`item` } })})).extract()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractContainerType<ItemTypeT>["toRdfExpression"]>[0]): Code {
    const itemTypeToRdfExpression = this.itemType.toRdfExpression({
      variables: { ...variables, value: code`value` },
    });
    let toRdfExpression = code`${variables.value}.toList()`;
    if (!codeEquals(itemTypeToRdfExpression, code`[value]`)) {
      toRdfExpression = code`${toRdfExpression}.flatMap((value) => ${itemTypeToRdfExpression})`;
    }
    return toRdfExpression;
  }
}

export namespace OptionType {
  export type ItemType = AbstractContainerType.ItemType;
  export const isItemType = AbstractContainerType.isItemType;
}

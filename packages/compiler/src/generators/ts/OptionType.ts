import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { AbstractContainerType } from "./AbstractContainerType.js";
import { codeEquals } from "./codeEquals.js";

import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class OptionType<
  ItemTypeT extends OptionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  override readonly discriminantProperty: Maybe<AbstractContainerType.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractContainerType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  override readonly kind = "OptionType";
  override readonly typeofs = ["object" as const];

  @Memoize()
  override get conversionFunction(): AbstractContainerType.ConversionFunction {
    const itemConversionFunction = this.itemType.conversionFunction;
    return {
      code: code`${this.reusables.snippets.convertToMaybe}(${itemConversionFunction.code})`,
      sourceTypes: (
        itemConversionFunction.sourceTypes as AbstractContainerType.ConversionFunction["sourceTypes"]
      ).concat(
        {
          name: this.name,
          typeof: "object",
        },
        {
          name: code`undefined`,
          typeof: "undefined",
        },
      ),
    };
  }

  @Memoize()
  override get conversions(): readonly AbstractContainerType.Conversion[] {
    const conversions: AbstractContainerType.Conversion[] = [];
    conversions.push({
      conversionExpression: (value) => value,
      sourceTypeCheckExpression: (value) =>
        code`${this.reusables.imports.Maybe}.isMaybe(${value})`,
      sourceTypeName: this.name,
      sourceTypeof: "object",
    });
    for (const itemTypeConversion of this.itemType.conversions) {
      conversions.push({
        ...itemTypeConversion,
        conversionExpression: (value) =>
          code`${this.reusables.imports.Maybe}.of(${itemTypeConversion.conversionExpression(value)})`,
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
        conversionExpression: () =>
          code`${this.reusables.imports.Maybe}.empty()`,
        sourceTypeCheckExpression: (value) => code`${value} === undefined`,
        sourceTypeName: code`undefined`,
        sourceTypeof: "undefined",
      });
    }

    return conversions;
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`((left, right) => ${this.reusables.snippets.maybeEquals}(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${this.reusables.snippets.filterMaybe}<${this.itemType.name}, ${this.itemType.filterType}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get hashFunction(): Code {
    return code`${this.reusables.snippets.hashMaybe}(${this.itemType.hashFunction})`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.reusables.snippets.MaybeFilter}<${this.itemType.filterType}>`;
  }

  @Memoize()
  override get graphqlType(): AbstractContainerType.GraphqlType {
    invariant(!this.itemType.graphqlType.nullable);
    return new AbstractContainerType.GraphqlType(
      this.itemType.graphqlType.name,
      this.reusables,
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
    return code`${this.reusables.imports.Maybe}<${this.itemType.name}>`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.MaybeSchema}<${this.itemType.schemaType}>`;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.reusables.snippets.maybeSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction})`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.reusables.snippets.maybeSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      kind: code`${literalOf("Maybe")} as const`,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromJsonExpression"]
  >[0]): Code {
    const expression = code`${this.reusables.imports.Maybe}.fromNullable(${variables.value})`;
    const valueVariable = code`item`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: valueVariable },
    });
    return codeEquals(itemFromJsonExpression, valueVariable)
      ? expression
      : code`${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override fromRdfResourceValuesExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["fromRdfResourceValuesExpression"]
    >[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.itemType.fromRdfResourceValuesExpression(parameters)}.map(values => values.length > 0 ? values.map(value => ${this.reusables.imports.Maybe}.of(value)) : ${this.reusables.imports.Resource}.Values.fromValue<${this.reusables.imports.Maybe}<${this.itemType.name}>>({ focusResource: ${variables.resource}, propertyPath: ${variables.propertyPath}, value: ${this.reusables.imports.Maybe}.empty() }))`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): Code {
    return code`${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
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

  override jsonSchema(
    parameters: Parameters<AbstractContainerType<ItemTypeT>["jsonSchema"]>[0],
  ): Code {
    return code`${this.itemType.jsonSchema(parameters)}.optional()`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toJsonExpression"]
  >[0]): Code {
    return code`${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: code`item` } })})).extract()`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toRdfResourceValuesExpression"]
  >[0]): Code {
    const itemTypeToRdfExpression = this.itemType.toRdfResourceValuesExpression(
      {
        variables: { ...variables, value: code`value` },
      },
    );
    let toRdfExpression = code`${variables.value}.toList()`;
    if (!codeEquals(itemTypeToRdfExpression, code`[value]`)) {
      toRdfExpression = code`${toRdfExpression}.flatMap((value) => ${itemTypeToRdfExpression})`;
    }
    return toRdfExpression;
  }

  override toStringExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toStringExpression"]
  >[0]): Code {
    return code`${variables.value}.map(item => (${this.itemType.toStringExpression({ variables: { value: code`item` } })})).extract()`;
  }
}

export namespace OptionType {
  export type ItemType = AbstractContainerType.ItemType;
  export const isItemType = AbstractContainerType.isItemType;
}

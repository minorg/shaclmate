import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import { codeEquals } from "./codeEquals.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class OptionType<
  ItemTypeT extends OptionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  override readonly discriminantProperty: Maybe<AbstractContainerType.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractContainerType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  override readonly jsTypes = [
    { instanceof: "Maybe", typeof: "object" },
  ] as const;
  override readonly kind = "Option";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractContainerType.ConversionFunction> {
    const itemConversionFunction = this.itemType.conversionFunction.orDefault(
      this.itemConversionFunctionDefault,
    );
    return Maybe.of({
      code: code`${this.reusables.snippets.convertToMaybe}(${itemConversionFunction.code})`,
      sourceTypes: (
        itemConversionFunction.sourceTypes as AbstractContainerType.ConversionFunction["sourceTypes"]
      ).concat(
        {
          expression: this.expression,
          jsType: { instanceof: "Maybe", typeof: "object" },
        },
        {
          expression: code`undefined`,
          jsType: { typeof: "undefined" },
        },
      ),
    });
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`((left, right) => ${this.reusables.snippets.maybeEquals}(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  override get expression(): Code {
    return code`${this.reusables.imports.Maybe}<${this.itemType.expression}>`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${this.reusables.snippets.filterMaybe}<${this.itemType.expression}, ${this.itemType.filterType}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.reusables.snippets.MaybeFilter}<${this.itemType.filterType}>`;
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.maybeFromRdfResourceValues}<${this.itemType.expression}, ${this.itemType.schemaType}>(${this.itemType.fromRdfResourceValuesFunction})`;
  }

  @Memoize()
  override get graphqlType(): AbstractContainerType.GraphqlType {
    invariant(!this.itemType.graphqlType.nullable);
    return new AbstractContainerType.GraphqlType(
      this.itemType.graphqlType.expression,
      this.reusables,
      {
        nullable: true,
      },
    );
  }

  @Memoize()
  get hashFunction(): Code {
    return code`${this.reusables.snippets.hashMaybe}(${this.itemType.hashFunction})`;
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.MaybeSchema}<${this.itemType.schemaType}>`;
  }

  override get toRdfResourceValueTypes(): AbstractContainerType<ItemTypeT>["toRdfResourceValueTypes"] {
    return this.itemType.toRdfResourceValueTypes;
  }

  @Memoize()
  override get validationFunction(): Maybe<Code> {
    return Maybe.of(
      code`${this.reusables.snippets.validateMaybe}(${this.itemType.validationFunction.orDefault(
        this.itemValidationFunctionDefault,
      )})`,
    );
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.reusables.snippets.maybeSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction})`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.reusables.snippets.maybeSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromJsonExpression"]
  >[0]): Code {
    const expression = code`${this.reusables.imports.Maybe}.fromNullable(${variables.value})`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: code`item` },
    });
    return code`${expression}.map(item => (${itemFromJsonExpression}).map(${this.reusables.imports.Maybe}.of)).orDefault(${this.reusables.imports.Either}.of(${this.reusables.imports.Maybe}.empty()))`;
  }

  // override fromRdfResourceValuesExpression(
  //   parameters: Parameters<
  //     AbstractContainerType<ItemTypeT>["fromRdfResourceValuesExpression"]
  //   >[0],
  // ): Code {
  //   const { variables } = parameters;
  //   return code`${this.itemType.fromRdfResourceValuesExpression(parameters)}.map(values => values.length > 0 ? values.map(value => ${this.reusables.imports.Maybe}.of(value)) : ${this.reusables.imports.Resource}.Values.fromValue<${this.reusables.imports.Maybe}<${this.itemType.expression}>>({ focusResource: ${variables.resource}, propertyPath: ${variables.propertyPath}, value: ${this.reusables.imports.Maybe}.empty() }))`;
  // }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): Code {
    return code`${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
  }

  override jsonSchema(
    parameters: Parameters<AbstractContainerType<ItemTypeT>["jsonSchema"]>[0],
  ): Code {
    return code`${this.itemType.jsonSchema(parameters)}.optional()`;
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractContainerType<ItemTypeT>["jsonType"]>[0],
  ): AbstractContainerType.JsonType {
    const itemTypeJsonType = this.itemType.jsonType(parameters);
    invariant(!itemTypeJsonType.optional);
    return new AbstractContainerType.JsonType(itemTypeJsonType.expression, {
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

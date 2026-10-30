import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import type { Callable } from "./Callable.js";
import { codeEquals } from "./codeEquals.js";
import { InlineCallable } from "./InlineCallable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
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

  override get jsonValueType(): AbstractContainerType<ItemTypeT>["jsonValueType"] {
    return this.itemType.jsonValueType;
  }

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
  override get equalsFunction(): Callable {
    return new InlineCallable(
      code`((left, right) => ${this.reusables.snippets.maybeEquals}(left, right, ${this.itemType.equalsFunction.annotatedUsage}))`,
    );
  }

  override get jsonObjectType(): AbstractContainerType<ItemTypeT>["jsonObjectType"] {
    return this.itemType.jsonObjectType;
  }

  @Memoize()
  override get filterFunction(): Callable {
    return new InlineCallable(
      code`${this.reusables.snippets.filterMaybe}<${this.itemType.expression}, ${this.itemType.filterType}>(${this.itemType.filterFunction.unannotatedUsage})`,
    );
  }

  @Memoize()
  override get filterType(): Code {
    return code`${this.reusables.snippets.MaybeFilter}<${this.itemType.filterType}>`;
  }

  @Memoize()
  override get fromJsonValueFunction(): AbstractContainerType<ItemTypeT>["fromJsonValueFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.maybeFromJsonValue}(${this.itemType.fromJsonValueFunction})`,
    );
  }

  @Memoize()
  override get fromJsonObjectFunction(): AbstractContainerType<ItemTypeT>["fromJsonObjectFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.maybeFromJsonObject}(${this.itemType.fromJsonObjectFunction})`,
    );
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    return new InlineCallable(
      code`${this.reusables.snippets.maybeFromRdfResourceValues}<${this.itemType.expression}, ${this.itemType.schemaType}>(${this.itemType.fromRdfResourceValuesFunction.unannotatedUsage})`,
    );
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
  override get hashFunction(): Callable {
    return new InlineCallable(
      code`${this.reusables.snippets.hashMaybe}(${this.itemType.hashFunction.annotatedUsage})`,
    );
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.MaybeSchema}<${this.itemType.schemaType}>`;
  }

  @Memoize()
  override get toJsonValueFunction(): AbstractContainerType<ItemTypeT>["toJsonValueFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.maybeToJsonValue}(${this.itemType.toJsonValueFunction})`,
    );
  }

  @Memoize()
  override get toJsonObjectFunction(): AbstractContainerType<ItemTypeT>["toJsonObjectFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.maybeToJsonObject}(${this.itemType.toJsonObjectFunction})`,
    );
  }

  override get toRdfResourceValueTypes(): AbstractContainerType<ItemTypeT>["toRdfResourceValueTypes"] {
    return this.itemType.toRdfResourceValueTypes;
  }

  @Memoize()
  override get validationFunction(): Maybe<Callable> {
    return Maybe.of(
      new InlineCallable(
        code`${this.reusables.snippets.validateMaybe}(${this.itemType.validationFunction
          .map((_) => _.annotatedUsage)
          .orDefault(this.itemValidationFunctionDefault.annotatedUsage)})`,
      ),
    );
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Callable {
    return new InlineCallable(
      code`${this.reusables.snippets.maybeSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction.unannotatedUsage})`,
    );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Callable {
    return new InlineCallable(
      code`${this.reusables.snippets.maybeSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction.unannotatedUsage})`,
    );
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    return code`${this.reusables.imports.Maybe}<${this.itemType.expression}>`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): Code {
    return code`${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toLoggableExpression"]
  >[0]): Code {
    return code`${variables.value}.map(item => (${this.itemType.toLoggableExpression({ variables: { value: code`item` } })})).extract()`;
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

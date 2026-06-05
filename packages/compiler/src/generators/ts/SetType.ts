import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { AbstractContainerType } from "./AbstractContainerType.js";
import type { Snippet } from "./Snippet.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class SetType<
  ItemTypeT extends SetType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly graphqlArgs: AbstractCollectionType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  override readonly jsTypes = [
    { instanceof: "Array", typeof: "object" },
  ] as const;
  override readonly kind = "Set";
  readonly minCount: bigint;

  constructor({
    minCount,
    ...superParameters
  }: {
    minCount: bigint;
  } & ConstructorParameters<typeof AbstractCollectionType<ItemTypeT>>[0]) {
    super(superParameters);
    this.minCount = minCount;
    invariant(this.minCount >= 0n);
    if (this._mutable) {
      invariant(this.minCount === 0n);
    }
  }

  @Memoize()
  override get conversionFunction(): Maybe<AbstractCollectionType.ConversionFunction> {
    const itemConversionFunction = this.itemType.conversionFunction.orDefault(
      this.itemConversionFunctionDefault,
    );

    let conversionFunction: Snippet;
    const sourceTypes: AbstractContainerType.ConversionFunction["sourceTypes"] =
      [];

    if (
      itemConversionFunction.sourceTypes.some(
        (sourceType) =>
          sourceType.jsType.typeof === "object" &&
          sourceType.jsType.instanceof === "Array",
      )
    ) {
      conversionFunction = this.reusables.snippets.convertToArraySet;
    } else {
      conversionFunction = this.reusables.snippets.convertToScalarSet;
      // Convert from a single item
      sourceTypes.push(...itemConversionFunction.sourceTypes);
    }

    // Convert from an array of items
    sourceTypes.push({
      expression: code`readonly (${joinCode(
        itemConversionFunction.sourceTypes.map(
          (itemSourceType) => code`${itemSourceType.expression}`,
        ),
        { on: " | " },
      )})[]`,
      jsType: { instanceof: "Array", typeof: "object" },
    });

    // Convert from undefined to an empty array
    if (this.minCount === 0n) {
      sourceTypes.push({
        expression: code`undefined`,
        jsType: { typeof: "undefined" },
      });
    }

    return Maybe.of({
      code: code`${conversionFunction}(${itemConversionFunction.code}, ${literalOf(!this._mutable)})`,
      sourceTypes,
    });
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return code`${this._mutable ? this.reusables.snippets.mutableSetFromRdfResourceValues : this.reusables.snippets.setFromRdfResourceValues}<${this.itemType.expression}, ${this.itemType.schemaType}>(${this.itemType.fromRdfResourceValuesFunction})`;
  }

  override get toRdfResourceValueTypes(): AbstractCollectionType<ItemTypeT>["toRdfResourceValueTypes"] {
    return this.itemType.toRdfResourceValueTypes;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.reusables.snippets.setSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction})`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.reusables.snippets.setSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
  }

  protected override get schemaInitializers() {
    let schemaInitializers = super.schemaInitializers;
    if (this.minCount > 0n) {
      schemaInitializers = schemaInitializers.concat(
        code`minCount: ${Number(this.minCount)}`,
      );
    }
    return schemaInitializers;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromJsonExpression"]
  >[0]): Code {
    let expression = variables.value;
    if (this.minCount === 0n) {
      expression = code`(${expression} ?? [])`;
    }
    return code`${this.reusables.imports.Either}.sequence<Error, ${this.itemType.expression}>(${expression}.map(item => (${this.itemType.fromJsonExpression(
      {
        variables: { value: code`item` },
      },
    )})))`;
  }

  // override fromRdfResourceValuesExpression(
  //   parameters: Parameters<
  //     AbstractCollectionType<ItemTypeT>["fromRdfResourceValuesExpression"]
  //   >[0],
  // ): Code {
  //   const { variables } = parameters;
  //   return joinCode(
  //     [
  //       this.itemType.fromRdfResourceValuesExpression(parameters),
  //       code`map(values => values.toArray()${this._mutable ? ".concat()" : ""})`,
  //       code`map(valuesArray => ${this.reusables.imports.Resource}.Values.fromValue({ focusResource: ${variables.resource}, propertyPath: ${variables.propertyPath}, value: valuesArray }))`,
  //     ],
  //     { on: "." },
  //   );
  // }

  override jsonSchema(
    parameters: Parameters<AbstractContainerType<ItemTypeT>["jsonSchema"]>[0],
  ): Code {
    let schema = code`${this.itemType.jsonSchema(parameters)}.array()`;
    if (this.minCount > 0n) {
      schema = code`${schema}.nonempty().min(${this.minCount})`;
    } else {
      schema = code`${schema}.optional()`;
    }
    if (!this._mutable) {
      schema = code`${schema}.readonly()`;
    }
    return schema;
  }

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    const name = code`${!this.mutable ? "readonly " : ""}(${this.itemType.jsonType().expression})[]`;
    if (this.minCount === 0n) {
      return new AbstractCollectionType.JsonType(name, { optional: true });
    }
    return new AbstractCollectionType.JsonType(name);
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`${variables.value}.flatMap((item) => ${this.itemType.toRdfResourceValuesExpression(
      {
        variables: { ...variables, value: code`item` },
      },
    )})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toStringExpression"]
  >[0]): Code {
    return code`(${variables.value}.length > 0 ? \`[\${${variables.value}.map(item => (${this.itemType.toStringExpression({ variables: { value: code`item` } })}))}]\` : undefined)`;
  }
}

export namespace SetType {
  export type ItemType = AbstractCollectionType.ItemType;
  export const isItemType = AbstractCollectionType.isItemType;
}

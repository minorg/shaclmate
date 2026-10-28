import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { Callable } from "./Callable.js";
import { InlineCallable } from "./InlineCallable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import type { Snippet } from "./Snippet.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

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
  override get compactedJsonType(): AbstractCollectionType<ItemTypeT>["compactedJsonType"] {
    return this.jsonTypeFactory.createJsonArrayType(
      this.itemType.compactedJsonType,
      {
        minCount: this.minCount,
        name: this.name.map((name) => [name, "Json"]).extract(),
      },
    );
  }

  @Memoize()
  override get conversionFunction(): Maybe<AbstractCollectionType.ConversionFunction> {
    const itemConversionFunction = this.itemType.conversionFunction.orDefault(
      this.itemConversionFunctionDefault,
    );

    let conversionFunction: Snippet;
    const sourceTypes: AbstractCollectionType.ConversionFunction["sourceTypes"] =
      [];

    if (
      itemConversionFunction.sourceTypes.some(
        (sourceType) =>
          sourceType.jsType.typeof === "object" &&
          sourceType.jsType.instanceof === "Array",
      )
    ) {
      conversionFunction = this._mutable
        ? this.reusables.snippets.convertToMutableArraySet
        : this.reusables.snippets.convertToArraySet;
    } else {
      conversionFunction = this._mutable
        ? this.reusables.snippets.convertToMutableScalarSet
        : this.reusables.snippets.convertToScalarSet;
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
      code: code`${conversionFunction}(${itemConversionFunction.code})`,
      sourceTypes,
    });
  }

  override get expandedJsonType(): AbstractCollectionType<ItemTypeT>["expandedJsonType"] {
    throw new Error("should never be called");
  }

  @Memoize()
  override get fromCompactedJsonFunction(): AbstractCollectionType<ItemTypeT>["fromCompactedJsonFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.arrayFromCompactedJson}(${this.itemType.fromCompactedJsonFunction})`,
    );
  }

  override get fromExpandedJsonFunction(): AbstractCollectionType<ItemTypeT>["fromExpandedJsonFunction"] {
    throw new Error("should never be called");
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    return new InlineCallable(
      code`${this._mutable ? this.reusables.snippets.mutableSetFromRdfResourceValues : this.reusables.snippets.setFromRdfResourceValues}<${this.itemType.expression}, ${this.itemType.schemaType}>(${this.itemType.fromRdfResourceValuesFunction.unannotatedUsage})`,
    );
  }

  @Memoize()
  override get toCompactedJsonFunction(): AbstractCollectionType<ItemTypeT>["toCompactedJsonFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.arrayToCompactedJson}(${this.itemType.toCompactedJsonFunction})`,
    );
  }

  override get toExpandedJsonFunction(): AbstractCollectionType<ItemTypeT>["toExpandedJsonFunction"] {
    throw new Error("should never be called");
  }

  override get toRdfResourceValueTypes(): AbstractCollectionType<ItemTypeT>["toRdfResourceValueTypes"] {
    return this.itemType.toRdfResourceValueTypes;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Callable {
    return new InlineCallable(
      code`${this.reusables.snippets.setSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction.unannotatedUsage})`,
    );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Callable {
    return new InlineCallable(
      code`${this.reusables.snippets.setSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction.unannotatedUsage})`,
    );
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

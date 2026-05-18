import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";

import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class SetType<
  ItemTypeT extends SetType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly graphqlArgs: AbstractCollectionType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  override readonly kind = "SetType";

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.reusables.snippets.setSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction})`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.reusables.snippets.setSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
  }

  override fromRdfResourceValuesExpression(
    parameters: Parameters<
      AbstractCollectionType<ItemTypeT>["fromRdfResourceValuesExpression"]
    >[0],
  ): Code {
    const { variables } = parameters;
    return joinCode(
      [
        this.itemType.fromRdfResourceValuesExpression(parameters),
        code`map(values => values.toArray()${this._mutable ? ".concat()" : ""})`,
        code`map(valuesArray => ${this.reusables.imports.Resource}.Values.fromValue({ focusResource: ${variables.resource}, propertyPath: ${variables.propertyPath}, value: valuesArray }))`,
      ],
      { on: "." },
    );
  }

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    const name = code`${!this.mutable ? "readonly " : ""}(${this.itemType.jsonType().name})[]`;
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

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class SetType<
  ItemTypeT extends SetType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly graphqlArgs: AbstractCollectionType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  override readonly kind = "SetType";

  override get conversions(): readonly AbstractCollectionType.Conversion[] {
    const conversions: AbstractCollectionType.Conversion[] = [];
    if (this.minCount === 0) {
      conversions.push({
        conversionExpression: () => code`[]`,
        sourceTypeCheckExpression: (value) => code`${value} === undefined`,
        sourceTypeName: code`undefined`,
        sourceTypeof: "undefined",
      });
    }

    return conversions.concat(super.conversions);
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${snippets.setSparqlConstructTriples}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlConstructTriplesFunction})`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${snippets.setSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.valueSparqlWherePatternsFunction})`;
  }

  override fromRdfResourceValuesExpression(
    parameters: Parameters<
      AbstractCollectionType<ItemTypeT>["fromRdfResourceValuesExpression"]
    >[0],
  ): Code {
    const { variables } = parameters;
    const chain: Code[] = [
      this.itemType.fromRdfResourceValuesExpression(parameters),
    ];
    if (this.minCount === 0 || this._mutable) {
      chain.push(
        code`map(values => values.toArray()${this._mutable ? ".concat()" : ""})`,
      );
    } else {
      chain.push(
        code`chain(values => ${imports.NonEmptyList}.fromArray(values.toArray()).toEither(new Error(\`\${${imports.Resource}.Identifier.toString(${variables.resource}.identifier)} is an empty set\`)))`,
      );
    }
    chain.push(
      code`map(valuesArray => ${imports.Resource}.Values.fromValue({ focusResource: ${variables.resource}, propertyPath: ${variables.propertyPath}, value: valuesArray }))`,
    );
    return joinCode(chain, { on: "." });
  }

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    const name = code`${!this.mutable ? "readonly " : ""}(${this.itemType.jsonType().name})[]`;
    if (this.minCount === 0) {
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
}

export namespace SetType {
  export type ItemType = AbstractCollectionType.ItemType;
  export const isItemType = AbstractCollectionType.isItemType;
}

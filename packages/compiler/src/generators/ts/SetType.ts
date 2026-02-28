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

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${snippets.setSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
  }

  override fromRdfExpression(
    parameters: Parameters<
      AbstractCollectionType<ItemTypeT>["fromRdfExpression"]
    >[0],
  ): Code {
    const { variables } = parameters;
    const chain: Code[] = [this.itemType.fromRdfExpression(parameters)];
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
      code`map(valuesArray => ${imports.Resource}.Values.fromValue({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, value: valuesArray }))`,
    );
    return joinCode(chain, { on: "." });
  }

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    const name = code`readonly (${this.itemType.jsonType().name})[]`;
    if (this.minCount === 0) {
      return new AbstractCollectionType.JsonType(name, { optional: true });
    }
    return new AbstractCollectionType.JsonType(name);
  }

  override sparqlConstructTriples(
    parameters: Parameters<
      AbstractCollectionType<ItemTypeT>["sparqlConstructTriples"]
    >[0],
  ): Maybe<Code> {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  override toRdfExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toRdfExpression"]
  >[0]): Code {
    return code`${variables.value}.flatMap((item) => ${this.itemType.toRdfExpression(
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

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { Import } from "./Import.js";
import type { Sparql } from "./Sparql.js";
import type { Type } from "./Type.js";

export class SetType<
  ItemTypeT extends Type,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly graphqlArgs: AbstractCollectionType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  readonly kind = "SetType";

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    const name = `readonly (${this.itemType.jsonType().name})[]`;
    if (this.minCount === 0) {
      return new AbstractCollectionType.JsonType(name, { optional: true });
    }
    return new AbstractCollectionType.JsonType(name);
  }

  override fromRdfExpression(
    parameters: Parameters<
      AbstractCollectionType<ItemTypeT>["fromRdfExpression"]
    >[0],
  ): string {
    const { variables } = parameters;
    const chain = [this.itemType.fromRdfExpression(parameters)];
    if (this.minCount === 0 || this._mutable) {
      chain.push(
        `map(values => values.toArray()${this._mutable ? ".concat()" : ""})`,
      );
    } else {
      chain.push(
        `chain(values => purify.NonEmptyList.fromArray(values.toArray()).toEither(new Error(\`\${rdfjsResource.Resource.Identifier.toString(${variables.resource}.identifier)} is an empty set\`)))`,
      );
    }
    chain.push(
      `map(valuesArray => rdfjsResource.Resource.Values.fromValue({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, value: valuesArray }))`,
    );
    return chain.join(".");
  }

  override sparqlConstructTriples(
    parameters: Parameters<
      AbstractCollectionType<ItemTypeT>["sparqlConstructTriples"]
    >[0],
  ): readonly (AbstractCollectionType.SparqlConstructTriple | string)[] {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  override sparqlWherePatterns({
    variables,
    ...otherParameters
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["sparqlWherePatterns"]
  >[0]): readonly Sparql.Pattern[] {
    const itemPatterns = this.itemType.sparqlWherePatterns({
      ...otherParameters,
      variables,
    });

    if (itemPatterns.length === 0) {
      return itemPatterns;
    }

    if (this.minCount > 0) {
      return itemPatterns; // Treat them as required
    }

    if (itemPatterns.length === 1 && itemPatterns[0].type === "optional") {
      return itemPatterns; // Item patterns are already optional, so no need to wrap them with another optional block
    }

    // minCount === 0 and itemPatterns are required, wrap them in an optional block
    return [{ patterns: itemPatterns, type: "optional" }];
  }

  override toRdfExpression({
    variables,
  }: Parameters<
    AbstractCollectionType<ItemTypeT>["toRdfExpression"]
  >[0]): string {
    return `${variables.value}.flatMap((item) => ${this.itemType.toRdfExpression(
      {
        variables: { ...variables, value: "item" },
      },
    )})`;
  }

  override useImports(
    parameters: Parameters<AbstractCollectionType<ItemTypeT>["useImports"]>[0],
  ): readonly Import[] {
    return this.itemType.useImports(parameters);
  }
}

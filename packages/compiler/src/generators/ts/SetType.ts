import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { Import } from "./Import.js";
import { Type } from "./Type.js";

export class SetType<
  ItemTypeT extends Type,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly graphqlArgs: Type["graphqlArgs"] = Maybe.empty();
  readonly kind = "SetType";

  @Memoize()
  override jsonType(): Type.JsonType {
    const name = `readonly (${this.itemType.jsonType().name})[]`;
    if (this.minCount === 0) {
      return new Type.JsonType(name, { optional: true });
    }
    return new Type.JsonType(name);
  }

  override fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
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
    parameters: Parameters<Type["sparqlConstructTriples"]>[0],
  ): readonly string[] {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  override sparqlWherePatterns({
    variables,
    ...otherParameters
  }: Parameters<Type["sparqlWherePatterns"]>[0]): Type.SparqlWherePatterns {
    const itemPatterns = this.itemType.sparqlWherePatterns({
      ...otherParameters,
      variables: {
        ...variables,
        filter: variables.filter.map(
          (filterVariable) => `${filterVariable}?.items`,
        ),
      },
    });
    return this.minCount > 0 ||
      itemPatterns.patterns.length === 0 ||
      itemPatterns.type === "optional"
      ? itemPatterns
      : new Type.SparqlWherePatterns(itemPatterns.toArray(), {
          type: "optional",
        });
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    return `${variables.value}.flatMap((item) => ${this.itemType.toRdfExpression(
      {
        variables: { ...variables, value: "item" },
      },
    )})`;
  }

  override useImports(
    parameters: Parameters<Type["useImports"]>[0],
  ): readonly Import[] {
    return this.itemType.useImports(parameters);
  }
}

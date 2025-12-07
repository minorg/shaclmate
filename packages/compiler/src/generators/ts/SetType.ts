import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { AbstractType } from "./AbstractType.js";
import type { Import } from "./Import.js";

export class SetType<
  ItemTypeT extends AbstractType,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly kind = "SetType";

  @Memoize()
  override jsonName(): AbstractType.JsonName {
    const name = `readonly (${this.itemType.jsonName()})[]`;
    if (this.minCount === 0) {
      return new AbstractType.JsonName(name, { optional: true });
    }
    return new AbstractType.JsonName(name);
  }

  override fromRdfExpression(
    parameters: Parameters<AbstractType["fromRdfExpression"]>[0],
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

  override sparqlConstructTemplateTriples(
    parameters: Parameters<AbstractType["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlConstructTemplateTriples(parameters);
      case "subject":
        return this.itemType.sparqlConstructTemplateTriples(parameters);
    }
  }

  override sparqlWherePatterns(
    parameters: Parameters<AbstractType["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object": {
        const patterns = this.itemType.sparqlWherePatterns(parameters);
        if (patterns.length === 0) {
          return [];
        }
        return this.minCount > 0
          ? patterns
          : [`{ patterns: [${patterns.join(", ")}], type: "optional" }`];
      }
      case "subject": {
        throw new Error("should never be called");
        // return this.itemType.sparqlWherePatterns(parameters);
      }
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): string {
    return `${variables.value}.flatMap((item) => ${this.itemType.toRdfExpression(
      {
        variables: { ...variables, value: "item" },
      },
    )})`;
  }

  override useImports(
    parameters: Parameters<AbstractType["useImports"]>[0],
  ): readonly Import[] {
    return this.itemType.useImports(parameters);
  }
}

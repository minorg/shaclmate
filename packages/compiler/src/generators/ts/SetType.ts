import { Memoize } from "typescript-memoize";
import { CollectionType } from "./CollectionType.js";
import type { Import } from "./Import.js";
import { Type } from "./Type.js";

export class SetType<ItemTypeT extends Type> extends CollectionType<ItemTypeT> {
  readonly kind = "SetType";

  @Memoize()
  override get jsonName(): Type.JsonName {
    const name = `readonly (${this.itemType.jsonName})[]`;
    if (this.minCount === 0) {
      return new Type.JsonName(name, { optional: true });
    }
    return new Type.JsonName(name);
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
      `map(valuesArray => rdfjsResource.Resource.Values.fromValue({ object: valuesArray , predicate: ${variables.predicate}, subject: ${variables.resource} }))`,
    );
    return chain.join(".");
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<Type["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlConstructTemplateTriples(parameters);
      case "subject":
        return this.itemType.sparqlConstructTemplateTriples(parameters);
    }
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
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

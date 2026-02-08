import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { AbstractType } from "./AbstractType.js";
import type { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class SetType<
  ItemTypeT extends SetType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly graphqlArgs: AbstractCollectionType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  readonly kind = "SetType";

  @Memoize()
  override get sparqlWherePatternsFunction(): string {
    return `${syntheticNamePrefix}setSparqlWherePatterns<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
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

  @Memoize()
  override jsonType(): AbstractCollectionType.JsonType {
    const name = `readonly (${this.itemType.jsonType().name})[]`;
    if (this.minCount === 0) {
      return new AbstractCollectionType.JsonType(name, { optional: true });
    }
    return new AbstractCollectionType.JsonType(name);
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    const { features } = parameters;

    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      features.has("sparql")
        ? singleEntryRecord(`${syntheticNamePrefix}setSparqlWherePatterns`, {
            code: `\
function ${syntheticNamePrefix}setSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${syntheticNamePrefix}SparqlWherePatternsFunction<ItemFilterT, ItemSchemaT>): ${syntheticNamePrefix}SparqlWherePatternsFunction<${syntheticNamePrefix}CollectionFilter<ItemFilterT>, ${syntheticNamePrefix}CollectionSchema<ItemSchemaT>> {
  return ({ filter, schema, ...otherParameters }) => {
    const itemSparqlWherePatterns = itemSparqlWherePatternsFunction({ filter, schema: schema.item, ...otherParameters });

    const minCount = filter?.${syntheticNamePrefix}minCount ?? schema.minCount;
    if (minCount > 0) {
      // Required
      return itemSparqlWherePatterns;
    }
    
    const [optionalSparqlWherePatterns, liftSparqlPatterns] = ${syntheticNamePrefix}liftSparqlPatterns(itemSparqlWherePatterns);
    return [{ patterns: optionalSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
  }
}`,
            dependencies: {
              ...sharedSnippetDeclarations.liftSparqlPatterns,
              ...sharedSnippetDeclarations.SparqlWherePatternsFunction,
            },
          })
        : {},
    );
  }

  override sparqlConstructTriples(
    parameters: Parameters<
      AbstractCollectionType<ItemTypeT>["sparqlConstructTriples"]
    >[0],
  ): readonly (AbstractCollectionType.SparqlConstructTriple | string)[] {
    return this.itemType.sparqlConstructTriples(parameters);
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

export namespace SetType {
  export type ItemType = AbstractCollectionType.ItemType;
  export const isItemType = AbstractCollectionType.isItemType;
}

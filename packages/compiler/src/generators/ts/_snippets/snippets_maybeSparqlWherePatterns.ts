import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeSparqlWherePatterns`,
    code`\
function ${syntheticNamePrefix}maybeSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${this.snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.MaybeFilter}<ItemFilterT>, ${this.snippets.MaybeSchema}<ItemSchemaT>> {  
  return ({ filter, schema, ...otherParameters }) => {
    if (filter === undefined) {
      // Treat the item's patterns as optional
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${this.snippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ ...otherParameters, filter, schema: schema.item() }));
      return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
    }
      
    if (filter === null) {
      // Use FILTER NOT EXISTS around the item's patterns
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${this.snippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ ...otherParameters, filter: undefined, schema: schema.item() }));
      return [{ expression: { args: itemSparqlWherePatterns.concat(), operator: "notexists", type: "operation" }, lift: true, type: "filter" }, ...liftSparqlPatterns]
    }

    // Treat the item as required.
    return itemSparqlWherePatternsFunction({ ...otherParameters, filter, schema: schema.item() });
  }
}`,
  );

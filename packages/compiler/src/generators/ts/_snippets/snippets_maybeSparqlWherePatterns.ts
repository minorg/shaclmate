import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_liftSparqlPatterns } from "./snippets_liftSparqlPatterns.js";
import { snippets_MaybeFilter } from "./snippets_MaybeFilter.js";
import { snippets_MaybeSchema } from "./snippets_MaybeSchema.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_maybeSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}maybeSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}maybeSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlWherePatternsFunction}<${snippets.MaybeFilter}<ItemFilterT>, ${snippets.MaybeSchema}<ItemSchemaT>> {  
  return ({ filter, schema, ...otherParameters }) => {
    if (filter === undefined) {
      // Treat the item's patterns as optional
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${snippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ ...otherParameters, filter, schema: schema.item() }));
      return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
    }
      
    if (filter === null) {
      // Use FILTER NOT EXISTS around the item's patterns
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${snippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ ...otherParameters, filter: undefined, schema: schema.item() }));
      return [{ expression: { args: itemSparqlWherePatterns.concat(), operator: "notexists", type: "operation" }, lift: true, type: "filter" }, ...liftSparqlPatterns]
    }

    // Treat the item as required.
    return itemSparqlWherePatternsFunction({ ...otherParameters, filter, schema: schema.item() });
  }
}`,
);

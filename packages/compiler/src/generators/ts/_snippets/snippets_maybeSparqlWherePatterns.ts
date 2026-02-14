import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_liftSparqlPatterns } from "./snippets_liftSparqlPatterns.js";
import { snippets_MaybeFilter } from "./snippets_MaybeFilter.js";
import { snippets_MaybeSchema } from "./snippets_MaybeSchema.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";

export const snippets_maybeSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}maybeSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}maybeSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${snippets_SparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${snippets_SparqlWherePatternsFunction}<${snippets_MaybeFilter}<ItemFilterT>, ${snippets_MaybeSchema}<ItemSchemaT>> {  
  return ({ filter, schema, ...otherParameters }) => {
    if (typeof filter === "undefined") {
      // Treat the item's patterns as optional
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${snippets_liftSparqlPatterns}(itemSparqlWherePatternsFunction({ filter, schema: schema.item, ...otherParameters }));
      return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
    }
      
    if (filter === null) {
      // Use FILTER NOT EXISTS around the item's patterns
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${snippets_liftSparqlPatterns}(itemSparqlWherePatternsFunction({ schema: schema.item, ...otherParameters }));
      return [{ expression: { args: itemSparqlWherePatterns.concat(), operator: "notexists", type: "operation" }, lift: true, type: "filter" }, ...liftSparqlPatterns]
    }

    // Treat the item as required.
    return itemSparqlWherePatternsFunction({ filter, schema: schema.item, ...otherParameters });
  }
}`,
);

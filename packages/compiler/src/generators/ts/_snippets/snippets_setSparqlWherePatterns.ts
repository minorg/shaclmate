import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_CollectionFilter } from "./snippets_CollectionFilter.js";
import { snippets_CollectionSchema } from "./snippets_CollectionSchema.js";
import { snippets_liftSparqlPatterns } from "./snippets_liftSparqlPatterns.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";

export const snippets_setSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}setSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}setSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${snippets_SparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${snippets_SparqlWherePatternsFunction}<${snippets_CollectionFilter}<ItemFilterT>, ${snippets_CollectionSchema}<ItemSchemaT>> {
  return ({ filter, schema, ...otherParameters }) => {
    const itemSparqlWherePatterns = itemSparqlWherePatternsFunction({ filter, schema: schema.item(), ...otherParameters });

    const minCount = filter?.${syntheticNamePrefix}minCount ?? schema.minCount;
    if (minCount > 0) {
      // Required
      return itemSparqlWherePatterns;
    }
    
    const [optionalSparqlWherePatterns, liftSparqlPatterns] = ${snippets_liftSparqlPatterns}(itemSparqlWherePatterns);
    return [{ patterns: optionalSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
  }
}`,
);

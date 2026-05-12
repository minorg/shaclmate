import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_CollectionFilter } from "./snippets_CollectionFilter.js";
import { snippets_CollectionSchema } from "./snippets_CollectionSchema.js";
import { snippets_liftSparqlPatterns } from "./snippets_liftSparqlPatterns.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_setSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}setSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}setSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlWherePatternsFunction}<${snippets.CollectionFilter}<ItemFilterT>, ${snippets.CollectionSchema}<ItemSchemaT>> {
  return ({ filter, schema, ...otherParameters }) => {
    const itemSparqlWherePatterns = itemSparqlWherePatternsFunction({ ...otherParameters, filter, schema: schema.item() });

    const minCount = filter?.${syntheticNamePrefix}minCount ?? schema.minCount ?? 0;
    if (minCount > 0) {
      // Required
      return itemSparqlWherePatterns;
    }
    
    const [optionalSparqlWherePatterns, liftSparqlPatterns] = ${snippets.liftSparqlPatterns}(itemSparqlWherePatterns);
    return [{ patterns: optionalSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
  }
}`,
);

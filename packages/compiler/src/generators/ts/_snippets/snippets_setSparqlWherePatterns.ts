import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_setSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
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

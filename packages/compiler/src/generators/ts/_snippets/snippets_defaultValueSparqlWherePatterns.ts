import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_defaultValueSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}defaultValueSparqlWherePatterns`,
    code`\
function ${syntheticNamePrefix}defaultValueSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ${snippets.DefaultValueSchema}<unknown, ItemSchemaT>> {  
  return ({ schema, ...otherParameters }) => {
    const [itemSparqlWherePatterns, liftSparqlPatterns] = ${snippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ ...otherParameters, schema: schema.item() }));
    return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
  }
}`,
  );

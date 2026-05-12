import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_defaultValueSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}defaultValueSparqlWherePatterns`,
    code`\
function ${syntheticNamePrefix}defaultValueSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${this.snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${this.snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ${this.snippets.DefaultValueSchema}<ItemSchemaT>> {  
  return ({ schema, ...otherParameters }) => {
    const [itemSparqlWherePatterns, liftSparqlPatterns] = ${this.snippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ ...otherParameters, schema: schema.item() }));
    return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
  }
}`,
  );

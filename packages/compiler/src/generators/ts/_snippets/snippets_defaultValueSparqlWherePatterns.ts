import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_DefaultValueSchema } from "./snippets_DefaultValueSchema.js";
import { snippets_liftSparqlPatterns } from "./snippets_liftSparqlPatterns.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_defaultValueSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}defaultValueSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}defaultValueSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ${snippets.DefaultValueSchema}<ItemSchemaT>> {  
  return ({ schema, ...otherParameters }) => {
    const [itemSparqlWherePatterns, liftSparqlPatterns] = ${snippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ ...otherParameters, schema: schema.item() }));
    return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
  }
}`,
);

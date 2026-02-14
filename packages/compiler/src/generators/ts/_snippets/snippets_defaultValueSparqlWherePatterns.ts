import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_DefaultValueSchema } from "./snippets_DefaultValueSchema.js";
import { snippets_liftSparqlPatterns } from "./snippets_liftSparqlPatterns.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";

export const snippets_defaultValueSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}defaultValueSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}defaultValueSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${snippets_SparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${snippets_SparqlWherePatternsFunction}<ItemFilterT, ${snippets_DefaultValueSchema}<ItemSchemaT>> {  
  return ({ schema, ...otherParameters }) => {
    const [itemSparqlWherePatterns, liftSparqlPatterns] = ${snippets_liftSparqlPatterns}(itemSparqlWherePatternsFunction({ schema: schema.item, ...otherParameters }));
    return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
  }
}`,
);

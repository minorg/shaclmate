import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_SparqlWherePatternsFunctionParameters } from "./snippets_SparqlWherePatternsFunctionParameters.js";

export const snippets_SparqlWherePatternsFunction = conditionalOutput(
  `${syntheticNamePrefix}SparqlWherePatternsFunction`,
  code`type ${syntheticNamePrefix}SparqlWherePatternsFunction<FilterT, SchemaT> = (parameters: ${snippets_SparqlWherePatternsFunctionParameters}<FilterT, SchemaT>) => readonly ${snippets_SparqlPattern}[];`,
);

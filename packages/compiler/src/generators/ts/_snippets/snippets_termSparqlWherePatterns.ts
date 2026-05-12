import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_TermFilter } from "./snippets_TermFilter.js";
import { snippets_TermSchema } from "./snippets_TermSchema.js";
import { snippets_termFilterSparqlPatterns } from "./snippets_termFilterSparqlPatterns.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_termSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}termSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}termSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.TermFilter}, ${snippets.TermSchema}> =
  (parameters) => ${snippets.termSchemaSparqlPatterns}({ filterPatterns: ${snippets.termFilterSparqlPatterns}(parameters), ...parameters })`,
);

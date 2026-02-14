import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_TermFilter } from "./snippets_TermFilter.js";
import { snippets_TermSchema } from "./snippets_TermSchema.js";
import { snippets_termFilterSparqlPatterns } from "./snippets_termFilterSparqlPatterns.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";

export const snippets_termSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}termSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}termSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_TermFilter}, ${snippets_TermSchema}> =
  (parameters) => ${snippets_termSchemaSparqlPatterns}({ filterPatterns: ${snippets_termFilterSparqlPatterns}(parameters), ...parameters })`,
);

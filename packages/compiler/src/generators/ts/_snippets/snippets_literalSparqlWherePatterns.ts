import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_LiteralFilter } from "./snippets_LiteralFilter.js";
import { snippets_LiteralSchema } from "./snippets_LiteralSchema.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_termFilterSparqlPatterns } from "./snippets_termFilterSparqlPatterns.js";

export const snippets_literalSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}literalSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}literalSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_LiteralFilter}, ${snippets_LiteralSchema}> =
  (parameters) => ${syntheticNamePrefix}literalSchemaSparqlPatterns({ filterPatterns: ${snippets_termFilterSparqlPatterns}(parameters), ...parameters });`,
);

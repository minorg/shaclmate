import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_NamedNodeFilter } from "./snippets_NamedNodeFilter.js";
import { snippets_NamedNodeSchema } from "./snippets_NamedNodeSchema.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";

export const snippets_namedNodeSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}namedNodeSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}namedNodeSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_NamedNodeFilter}, ${snippets_NamedNodeSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets_SparqlFilterPattern}[] = [];

    if (typeof filter?.in !== "undefined" && filter.in.length > 0) {
      filterPatterns.push(${snippets_sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
    }

    return ${snippets_termSchemaSparqlPatterns}({ filterPatterns, valueVariable, ...otherParameters });
  };`,
);

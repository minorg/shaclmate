import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_NamedNodeFilter } from "./snippets_NamedNodeFilter.js";
import { snippets_NamedNodeSchema } from "./snippets_NamedNodeSchema.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";

export const snippets_namedNodeSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}namedNodeSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}namedNodeSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_NamedNodeFilter}, ${snippets_NamedNodeSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${syntheticNamePrefix}SparqlFilterPattern[] = [];

    if (typeof filter?.in !== "undefined" && filter.in.length > 0) {
      filterPatterns.push(${syntheticNamePrefix}sparqlValueInPattern({ lift: true, valueVariable, valueIn: filter.in }));
    }

    return ${snippets_termSchemaSparqlPatterns}({ filterPatterns, valueVariable, ...otherParameters });
  };`,
);

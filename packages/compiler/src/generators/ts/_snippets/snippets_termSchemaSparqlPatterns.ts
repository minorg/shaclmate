import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";

export const snippets_termSchemaSparqlPatterns = conditionalOutput(
  `${syntheticNamePrefix}termSchemaSparqlPatterns`,
  code`\
function ${syntheticNamePrefix}termSchemaSparqlPatterns({
  filterPatterns,
  propertyPatterns,
  schema,
  valueVariable
}: {
  filterPatterns: readonly ${snippets_SparqlFilterPattern}[],
  propertyPatterns: readonly ${imports.sparqljs}.BgpPattern[];
  schema: Readonly<{
    in?: readonly (boolean | Date | string | number | ${imports.Literal} | ${imports.NamedNode})[];
  }>,
  valueVariable: ${imports.Variable};
}): readonly ${snippets_SparqlPattern}[] {
  let patterns: ${snippets_SparqlPattern}[] = propertyPatterns.concat();

  if (schema.in && schema.in.length > 0) {
    patterns.push(${snippets_sparqlValueInPattern}({ valueVariable, valueIn: schema.in }));
  }

  return patterns.concat(filterPatterns);
}`,
);

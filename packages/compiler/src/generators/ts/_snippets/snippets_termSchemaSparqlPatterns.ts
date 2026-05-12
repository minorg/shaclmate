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
  filterPatterns: readonly ${snippets.SparqlFilterPattern}[],
  propertyPatterns: readonly ${snippets.SparqlPattern}[];
  schema: Readonly<{
    in?: readonly (bigint | boolean | Date | string | number | ${imports.Literal} | ${imports.NamedNode})[];
  }>,
  valueVariable: ${imports.Variable};
}): readonly ${snippets.SparqlPattern}[] {
  let patterns: ${snippets.SparqlPattern}[] = propertyPatterns.concat();

  if (schema.in && schema.in.length > 0) {
    patterns.push(${snippets.sparqlValueInPattern}({ valueVariable, valueIn: schema.in }));
  }

  return patterns.concat(filterPatterns);
}`,
);

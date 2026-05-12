import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termSchemaSparqlPatterns: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
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

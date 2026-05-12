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
  filterPatterns: readonly ${this.snippets.SparqlFilterPattern}[],
  propertyPatterns: readonly ${this.snippets.SparqlPattern}[];
  schema: Readonly<{
    in?: readonly (bigint | boolean | Date | string | number | ${this.imports.Literal} | ${this.imports.NamedNode})[];
  }>,
  valueVariable: ${this.imports.Variable};
}): readonly ${this.snippets.SparqlPattern}[] {
  let patterns: ${this.snippets.SparqlPattern}[] = propertyPatterns.concat();

  if (schema.in && schema.in.length > 0) {
    patterns.push(${this.snippets.sparqlValueInPattern}({ valueVariable, valueIn: schema.in }));
  }

  return patterns.concat(filterPatterns);
}`,
  );

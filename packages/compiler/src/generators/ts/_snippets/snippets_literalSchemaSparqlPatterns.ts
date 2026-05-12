import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalSchemaSparqlPatterns: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalSchemaSparqlPatterns`,
    code`\
function ${syntheticNamePrefix}literalSchemaSparqlPatterns({
  filterPatterns,
  preferredLanguages,
  propertyPatterns,
  schema,
  valueVariable
}: {
  filterPatterns: readonly ${this.snippets.SparqlFilterPattern}[],
  preferredLanguages?: readonly string[];
  propertyPatterns: readonly ${this.snippets.SparqlPattern}[];
  schema: Readonly<{
    languageIn?: readonly string[];
    in?: readonly (bigint | boolean | Date | string | number | ${this.imports.Literal} | ${this.imports.NamedNode})[];
  }>,
  valueVariable: ${this.imports.Variable};
}): readonly ${this.snippets.SparqlPattern}[] {
  let patterns: ${this.snippets.SparqlPattern}[] = propertyPatterns.concat();

  if (schema.in && schema.in.length > 0) {
    patterns.push(${this.snippets.sparqlValueInPattern}({ valueVariable, valueIn: schema.in }));
  }

  const languageIn = ${this.snippets.arrayIntersection}(schema.languageIn ?? [], preferredLanguages ?? []);
  if (languageIn.length > 0) {
    patterns.push({
      expression: {
        args: [{ args: [valueVariable], operator: "lang", type: "operation" }, languageIn.map(_ => ${this.imports.dataFactory}.literal(_))],
        operator: "in",
        type: "operation"
      },
      type: "filter",
    });
  }

  return patterns.concat(filterPatterns);
}`,
  );

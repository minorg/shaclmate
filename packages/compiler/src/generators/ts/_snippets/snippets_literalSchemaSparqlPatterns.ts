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
  filterPatterns: readonly ${snippets.SparqlFilterPattern}[],
  preferredLanguages?: readonly string[];
  propertyPatterns: readonly ${snippets.SparqlPattern}[];
  schema: Readonly<{
    languageIn?: readonly string[];
    in?: readonly (bigint | boolean | Date | string | number | ${imports.Literal} | ${imports.NamedNode})[];
  }>,
  valueVariable: ${imports.Variable};
}): readonly ${snippets.SparqlPattern}[] {
  let patterns: ${snippets.SparqlPattern}[] = propertyPatterns.concat();

  if (schema.in && schema.in.length > 0) {
    patterns.push(${snippets.sparqlValueInPattern}({ valueVariable, valueIn: schema.in }));
  }

  const languageIn = ${snippets.arrayIntersection}(schema.languageIn ?? [], preferredLanguages ?? []);
  if (languageIn.length > 0) {
    patterns.push({
      expression: {
        args: [{ args: [valueVariable], operator: "lang", type: "operation" }, languageIn.map(_ => ${imports.dataFactory}.literal(_))],
        operator: "in",
        type: "operation"
      },
      type: "filter",
    });
  }

  return patterns.concat(filterPatterns);
}`,
  );

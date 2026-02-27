import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_arrayIntersection } from "./snippets_arrayIntersection.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";

export const snippets_literalSchemaSparqlPatterns = conditionalOutput(
  `${syntheticNamePrefix}literalSchemaSparqlPatterns`,
  code`\
function ${syntheticNamePrefix}literalSchemaSparqlPatterns({
  filterPatterns,
  preferredLanguages,
  propertyPatterns,
  schema,
  valueVariable
}: {
  filterPatterns: readonly ${snippets_SparqlFilterPattern}[],
  preferredLanguages?: readonly string[];
  propertyPatterns: readonly ${imports.sparqljs}.BgpPattern[];
  schema: Readonly<{
    languageIn?: readonly string[];
    in?: readonly (bigint | boolean | Date | string | number | ${imports.Literal} | ${imports.NamedNode})[];
  }>,
  valueVariable: ${imports.Variable};
}): readonly ${snippets_SparqlPattern}[] {
  let patterns: ${snippets_SparqlPattern}[] = propertyPatterns.concat();

  if (schema.in && schema.in.length > 0) {
    patterns.push(${snippets_sparqlValueInPattern}({ valueVariable, valueIn: schema.in }));
  }

  const languageIn = ${snippets_arrayIntersection}(schema.languageIn ?? [], preferredLanguages ?? []);
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

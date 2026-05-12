import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ValueSparqlWherePatternsFunction: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ValueSparqlWherePatternsFunction`,
    code`\
type ${syntheticNamePrefix}ValueSparqlWherePatternsFunction<FilterT, SchemaT> =
  (parameters: {
    filter: FilterT | undefined;
    ignoreRdfType: boolean;
    preferredLanguages: readonly string[] | undefined;
    propertyPatterns: readonly ${this.snippets.SparqlPattern}[];
    schema: SchemaT;
    valueVariable: ${this.imports.Variable};
    variablePrefix: string;
  }) => readonly ${this.snippets.SparqlPattern}[];`,
  );

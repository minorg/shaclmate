import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FocusSparqlWherePatternsFunction: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FocusSparqlWherePatternsFunction`,
    code`\
type ${syntheticNamePrefix}FocusSparqlWherePatternsFunction<FilterT> =
  (parameters: {
    filter: FilterT | undefined;
    focusIdentifier: ${this.imports.NamedNode} | ${this.imports.Variable};
    ignoreRdfType: boolean;
    preferredLanguages: readonly string[] | undefined;
    variablePrefix: string;
  }) => readonly ${this.snippets.SparqlPattern}[];`,
  );

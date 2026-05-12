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
    focusIdentifier: ${imports.NamedNode} | ${imports.Variable};
    ignoreRdfType: boolean;
    preferredLanguages: readonly string[] | undefined;
    variablePrefix: string;
  }) => readonly ${snippets.SparqlPattern}[];`,
  );

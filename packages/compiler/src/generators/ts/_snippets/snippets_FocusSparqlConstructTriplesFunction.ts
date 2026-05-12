import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FocusSparqlConstructTriplesFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FocusSparqlConstructTriplesFunction`,
    code`\
type ${syntheticNamePrefix}FocusSparqlConstructTriplesFunction<FilterT> = 
  (parameters: {
    filter: FilterT | undefined;
    focusIdentifier: ${imports.NamedNode} | ${imports.Variable};
    ignoreRdfType: boolean;
    variablePrefix: string;
  }) => readonly ${imports.sparqljs}.Triple[];`,
  );

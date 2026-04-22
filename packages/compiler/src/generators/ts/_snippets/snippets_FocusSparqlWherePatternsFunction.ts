import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";

export const snippets_FocusSparqlWherePatternsFunction = conditionalOutput(
  `${syntheticNamePrefix}FocusSparqlWherePatternsFunction`,
  code`\
type ${syntheticNamePrefix}FocusSparqlWherePatternsFunction<FilterT> =
  (parameters: {
    filter: FilterT | undefined;
    focusIdentifier: ${imports.NamedNode} | ${imports.Variable};
    ignoreRdfType: boolean;
    preferredLanguages: readonly string[] | undefined;
    variablePrefix: string;
  }) => readonly ${snippets_SparqlPattern}[];`,
);

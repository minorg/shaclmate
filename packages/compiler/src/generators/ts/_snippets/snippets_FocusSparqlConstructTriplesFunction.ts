import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FocusSparqlConstructTriplesFunction = conditionalOutput(
  `${syntheticNamePrefix}FocusSparqlConstructTriplesFunction`,
  code`\
type ${syntheticNamePrefix}FocusSparqlConstructTriplesFunction<FilterT, SchemaT> = 
  (parameters: {
    filter: FilterT | undefined;
    focusIdentifier: ${imports.NamedNode} | ${imports.Variable};
    ignoreRdfType: boolean;
    variablePrefix: string;
  }) => readonly ${imports.sparqljs}.Triple[];`,
);

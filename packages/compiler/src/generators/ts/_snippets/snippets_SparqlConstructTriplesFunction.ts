import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_SparqlConstructTriplesFunctionParameters } from "./snippets_SparqlConstructTriplesFunctionParameters.js";

export const snippets_SparqlConstructTriplesFunction = conditionalOutput(
  `${syntheticNamePrefix}SparqlConstructTriplesFunction`,
  code`type ${syntheticNamePrefix}SparqlConstructTriplesFunction<FilterT, SchemaT> = (parameters: ${snippets_SparqlConstructTriplesFunctionParameters}<FilterT, SchemaT>) => readonly ${imports.sparqljs}.Triple[];`,
);

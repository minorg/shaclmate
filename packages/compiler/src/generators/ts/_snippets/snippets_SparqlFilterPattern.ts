import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_SparqlFilterPattern = conditionalOutput(
  `${syntheticNamePrefix}SparqlFilterPattern`,
  code`type ${syntheticNamePrefix}SparqlFilterPattern = ${imports.sparqljs}.FilterPattern & { lift?: boolean };`,
);

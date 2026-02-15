import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";

export const snippets_SparqlPattern = conditionalOutput(
  `${syntheticNamePrefix}SparqlPattern`,
  code`type ${syntheticNamePrefix}SparqlPattern = Exclude<${imports.sparqljs}.Pattern, ${imports.sparqljs}.FilterPattern> | ${snippets_SparqlFilterPattern};`,
);

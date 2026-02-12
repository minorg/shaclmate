import { type Code, code } from "ts-poet";
import { sharedImports } from "../sharedImports.js";
import { sharedSnippets } from "../sharedSnippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function sparqlConstructQueryFunctionDeclaration(this: {
  readonly filterType: Code;
  readonly staticModuleName: string;
}): Code {
  return code`\
export function ${syntheticNamePrefix}sparqlConstructQuery(parameters?: { filter?: ${this.filterType}; ignoreRdfType?: boolean; prefixes?: { [prefix: string]: string }; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"]; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">): ${sharedImports.sparqljs}.ConstructQuery {
  const { filter, ignoreRdfType, preferredLanguages, subject, ...queryParameters } = parameters ?? {};
  return { ...queryParameters, prefixes: parameters?.prefixes ?? {}, queryType: "CONSTRUCT", template: (queryParameters.template ?? []).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ ignoreRdfType, subject })), type: "query", where: (queryParameters.where ?? []).concat(${sharedSnippets.normalizeSparqlWherePatterns}(${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ filter, ignoreRdfType, preferredLanguages, subject }))) };
}`;
}

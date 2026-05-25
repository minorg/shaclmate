import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import type { Reusables } from "../Reusables.js";
import type { TsGenerator } from "../TsGenerator.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_sparqlConstructQueryFunctionDeclaration(this: {
  readonly alias: string;
  readonly configuration: TsGenerator.Configuration;
  readonly filterType: Code;
  readonly reusables: Reusables;
}): Maybe<Code> {
  if (!this.configuration.features.has("Object.SPARQL")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function sparqlConstructQuery({ filter, ignoreRdfType, preferredLanguages, prefixes, subject, ...queryParameters }: { filter?: ${this.filterType}; ignoreRdfType?: boolean; prefixes?: { [prefix: string]: string }; preferredLanguages?: readonly string[]; subject: ${this.reusables.imports.NamedNode} | ${this.reusables.imports.Variable} } & Omit<${this.reusables.imports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type">): ${this.reusables.imports.sparqljs}.ConstructQuery {
  const variablePrefix = subject.termType === "Variable" ? subject.value : "${camelCase(this.alias)}";

  return {
    ...queryParameters,
    prefixes: prefixes ?? {},
    queryType: "CONSTRUCT",
    template: (queryParameters.template ?? []).concat(
      ${this.alias}.focusSparqlConstructTriples({
        filter,
        focusIdentifier: subject,
        ignoreRdfType: !!ignoreRdfType,
        variablePrefix
      })
    ),
    type: "query",
    where: (queryParameters.where ?? []).concat(
      ${this.reusables.snippets.normalizeSparqlWherePatterns}(
        ${this.alias}.focusSparqlWherePatterns({
          filter,
          focusIdentifier: subject,
          ignoreRdfType: !!ignoreRdfType,
          preferredLanguages,
          variablePrefix
        })
      )
    )
  };
}`);
}

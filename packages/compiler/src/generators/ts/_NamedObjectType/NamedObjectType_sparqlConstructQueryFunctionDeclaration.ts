import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import type { TsFeature } from "../TsFeature.js";
import { imports } from "../this.imports.js";
import { snippets } from "../this.snippets.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_sparqlConstructQueryFunctionDeclaration(this: {
  readonly features: ReadonlySet<TsFeature>;
  readonly filterType: Code;
  readonly name: string;
}): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}sparqlConstructQuery({ filter, ignoreRdfType, preferredLanguages, prefixes, subject, ...queryParameters }: { filter?: ${this.filterType}; ignoreRdfType?: boolean; prefixes?: { [prefix: string]: string }; preferredLanguages?: readonly string[]; subject: ${this.imports.NamedNode} | ${this.imports.Variable} } & Omit<${this.imports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type">): ${this.imports.sparqljs}.ConstructQuery {
  const variablePrefix = subject.termType === "Variable" ? subject.value : "${camelCase(this.name)}";

  return {
    ...queryParameters,
    prefixes: prefixes ?? {},
    queryType: "CONSTRUCT",
    template: (queryParameters.template ?? []).concat(
      ${this.name}.${syntheticNamePrefix}focusSparqlConstructTriples({
        filter,
        focusIdentifier: subject,
        ignoreRdfType: !!ignoreRdfType,
        variablePrefix
      })
    ),
    type: "query",
    where: (queryParameters.where ?? []).concat(
      ${this.snippets.normalizeSparqlWherePatterns}(
        ${this.name}.${syntheticNamePrefix}focusSparqlWherePatterns({
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

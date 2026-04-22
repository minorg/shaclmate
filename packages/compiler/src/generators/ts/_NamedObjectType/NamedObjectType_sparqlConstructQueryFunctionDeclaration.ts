import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import type { TsFeature } from "../../../enums/TsFeature.js";
import { imports } from "../imports.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_sparqlConstructQueryFunctionDeclaration(this: {
  readonly features: ReadonlySet<TsFeature>;
  readonly filterType: Code;
  readonly name: string;
  readonly staticModuleName: string;
}): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}sparqlConstructQuery({ filter, ignoreRdfType, preferredLanguages, prefixes, subject, ...queryParameters }: { filter?: ${this.filterType}; ignoreRdfType?: boolean; prefixes?: { [prefix: string]: string }; preferredLanguages?: readonly string[]; subject: ${imports.NamedNode} | ${imports.Variable} } & Omit<${imports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type">): ${imports.sparqljs}.ConstructQuery {
  const variablePrefix = subject.termType === "Variable" ? subject.value : "${camelCase(this.name)}";

  return {
    ...queryParameters,
    prefixes: prefixes ?? {},
    queryType: "CONSTRUCT",
    template: (queryParameters.template ?? []).concat(
      ${this.staticModuleName}.${syntheticNamePrefix}focusSparqlConstructTriples({
        filter,
        focusIdentifier: subject,
        ignoreRdfType: !!ignoreRdfType,
        variablePrefix
      })
    ),
    type: "query",
    where: (queryParameters.where ?? []).concat(
      ${snippets.normalizeSparqlWherePatterns}(
        ${this.staticModuleName}.${syntheticNamePrefix}focusSparqlWherePatterns({
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

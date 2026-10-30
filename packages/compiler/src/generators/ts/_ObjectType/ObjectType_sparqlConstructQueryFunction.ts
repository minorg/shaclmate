import { camelCase } from "change-case";
import type { Maybe } from "purify-ts";
import type { Callable } from "../Callable.js";
import type { CodeThunk } from "../CodeThunk.js";
import type { Reusables } from "../Reusables.js";
import type { TsGenerator } from "../TsGenerator.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_sparqlConstructQueryFunction(this: {
  readonly configuration: TsGenerator.Configuration;
  readonly filterType: Code;
  _function(parameters: {
    type: CodeThunk;
    unannotatedExpression: CodeThunk;
    unqualifiedName: string;
  }): Callable;
  readonly focusSparqlConstructTriplesFunction: Callable;
  readonly focusSparqlWherePatternsFunction: Callable;
  readonly name: Maybe<string>;
  readonly reusables: Reusables;
}): Callable {
  return this._function({
    type: code`${this.reusables.snippets.SparqlConstructQueryFunction}<${this.filterType}>`,
    unannotatedExpression: code`\
({ filter, ignoreRdfType, preferredLanguages, prefixes, subject, ...queryParameters }) => {
  const variablePrefix = subject.termType === "Variable" ? subject.value : "${camelCase(this.name.unsafeCoerce())}";

  return {
    ...queryParameters,
    prefixes: prefixes ?? {},
    queryType: "CONSTRUCT",
    template: (queryParameters.template ?? []).concat(
      ${this.focusSparqlConstructTriplesFunction.annotatedUsage}({
        filter,
        focusIdentifier: subject,
        ignoreRdfType: !!ignoreRdfType,
        variablePrefix
      })
    ),
    type: "query",
    where: (queryParameters.where ?? []).concat(
      ${this.reusables.snippets.normalizeSparqlWherePatterns}(
        ${this.focusSparqlWherePatternsFunction.annotatedUsage}({
          filter,
          focusIdentifier: subject,
          ignoreRdfType: !!ignoreRdfType,
          preferredLanguages,
          variablePrefix
        })
      )
    )
  };
}`,
    unqualifiedName: "sparqlConstructQuery",
  });
}

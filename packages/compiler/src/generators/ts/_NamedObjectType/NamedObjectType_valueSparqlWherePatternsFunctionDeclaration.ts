import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_valueSparqlWherePatternsFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.SPARQL")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ({ filter, ignoreRdfType, preferredLanguages, propertyPatterns, valueVariable, variablePrefix }) =>
  (propertyPatterns as readonly ${this.reusables.snippets.SparqlPattern}[]).concat(
    ${this.name}.focusSparqlWherePatterns({ filter, focusIdentifier: valueVariable, ignoreRdfType, preferredLanguages, variablePrefix })
  );`);
}

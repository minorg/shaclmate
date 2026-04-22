import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_valueSparqlWherePatternsFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const ${syntheticNamePrefix}valueSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ({ filter, ignoreRdfType, preferredLanguages, propertyPatterns, valueVariable, variablePrefix }) =>
  (propertyPatterns as readonly ${snippets.SparqlPattern}[]).concat(
    ${this.staticModuleName}.${syntheticNamePrefix}focusSparqlWherePatterns({ filter, focusIdentifier: valueVariable, ignoreRdfType, preferredLanguages, variablePrefix })
  );`);
}

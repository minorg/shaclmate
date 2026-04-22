import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_valueSparqlConstructTriplesFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const ${syntheticNamePrefix}valueSparqlConstructTriples: ${snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ({ filter, ignoreRdfType, valueVariable, variablePrefix }) =>
  ${this.staticModuleName}.${syntheticNamePrefix}focusSparqlConstructTriples({ filter, focusIdentifier: valueVariable, ignoreRdfType, variablePrefix });`);
}

import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_valueSparqlConstructTriplesFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ({ filter, ignoreRdfType, valueVariable, variablePrefix }) =>
  ${this.name}.focusSparqlConstructTriples({ filter, focusIdentifier: valueVariable, ignoreRdfType, variablePrefix });`);
}

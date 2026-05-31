import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_valueSparqlConstructTriplesFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.SPARQL")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ({ filter, ignoreRdfType, valueVariable, variablePrefix }) =>
  ${this.name.unsafeCoerce()}.focusSparqlConstructTriples({ filter, focusIdentifier: valueVariable, ignoreRdfType, variablePrefix });`);
}

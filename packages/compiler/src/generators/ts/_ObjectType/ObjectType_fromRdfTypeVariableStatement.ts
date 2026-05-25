import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_fromRdfTypeVariableStatement(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.fromRdf")) {
    return Maybe.empty();
  }

  return this.fromRdfType.map(
    (fromRdfType) => code`\
export const fromRdfType: ${this.reusables.imports.NamedNode}<string> = ${this.rdfjsTermExpression(fromRdfType)};`,
  );
}

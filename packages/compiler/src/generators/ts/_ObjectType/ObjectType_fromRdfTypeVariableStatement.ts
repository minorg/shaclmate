import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_fromRdfTypeVariableStatement(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.fromRdf")) {
    return Maybe.empty();
  }

  return this.fromRdfType.map(
    (fromRdfType) => code`\
export const fromRdfType: ${this.reusables.imports.NamedNode}<string> = ${this.rdfjsTermExpression(fromRdfType)};`,
  );
}

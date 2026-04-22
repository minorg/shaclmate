import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { NamedObjectType } from "../NamedObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_fromRdfTypeVariableStatement(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  return this.fromRdfType.map(
    (fromRdfType) => code`\
export const ${syntheticNamePrefix}fromRdfType: ${imports.NamedNode}<string> = ${rdfjsTermExpression(fromRdfType)};`,
  );
}

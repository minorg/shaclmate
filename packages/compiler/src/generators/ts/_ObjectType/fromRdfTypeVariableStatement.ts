import { Maybe } from "purify-ts";
import { type Code, code } from "ts-poet";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { sharedImports } from "../sharedImports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function fromRdfTypeVariableStatement(this: ObjectType): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  return this.fromRdfType.map(
    (fromRdfType) => code`\
export const ${syntheticNamePrefix}fromRdfType: ${sharedImports.NamedNode}<string> = ${rdfjsTermExpression(fromRdfType)};`,
  );
}

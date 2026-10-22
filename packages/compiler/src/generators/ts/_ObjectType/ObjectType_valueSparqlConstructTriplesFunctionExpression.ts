import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_valueSparqlConstructTriplesFunctionExpression(
  this: ObjectType,
): Code {
  return code`\
({ filter, ignoreRdfType, valueVariable, variablePrefix }) =>
  ${this.focusSparqlConstructTriplesFunction.unannotatedUsage}({ filter, focusIdentifier: valueVariable, ignoreRdfType, variablePrefix })`;
}

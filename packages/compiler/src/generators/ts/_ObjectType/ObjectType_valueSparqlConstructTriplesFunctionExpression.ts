import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";
import { ObjectType_focusSparqlConstructTriplesFunctionExpression } from "./ObjectType_focusSparqlConstructTriplesFunctionExpression.js";

export function ObjectType_valueSparqlConstructTriplesFunctionExpression(
  this: ObjectType,
): Code {
  return code`\
(({ filter, ignoreRdfType, valueVariable, variablePrefix }) =>
  ${this.name.map(name => code`${name}.focusSparqlConstructTriples`).orDefault(ObjectType_focusSparqlConstructTriplesFunctionExpression.call(this))}({ filter, focusIdentifier: valueVariable, ignoreRdfType, variablePrefix }))`;
}

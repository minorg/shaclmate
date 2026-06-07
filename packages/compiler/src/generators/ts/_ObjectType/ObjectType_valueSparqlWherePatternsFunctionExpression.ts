import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";
import { ObjectType_focusSparqlWherePatternsFunctionExpression } from "./ObjectType_focusSparqlWherePatternsFunctionExpression.js";

export function ObjectType_valueSparqlWherePatternsFunctionExpression(
  this: ObjectType,
): Code {
  return code`\
(({ filter, ignoreRdfType, preferredLanguages, propertyPatterns, valueVariable, variablePrefix }) =>
  (propertyPatterns as readonly ${this.reusables.snippets.SparqlPattern}[]).concat(
    ${this.name.map((name) => code`${name}.focusSparqlWherePatterns`).orDefaultLazy(() => ObjectType_focusSparqlWherePatternsFunctionExpression.call(this))}({ filter, focusIdentifier: valueVariable, ignoreRdfType, preferredLanguages, variablePrefix })
))`;
}

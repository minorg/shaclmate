import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_valueSparqlWherePatternsFunctionExpression(
  this: ObjectType,
): Code {
  return code`\
({ filter, ignoreRdfType, preferredLanguages, propertyPatterns, valueVariable, variablePrefix }) =>
  (propertyPatterns as readonly ${this.reusables.snippets.SparqlPattern}[]).concat(
    ${this.focusSparqlWherePatternsFunction.usage}({ filter, focusIdentifier: valueVariable, ignoreRdfType, preferredLanguages, variablePrefix })
  )`;
}

import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectIntersectionType_focusSparqlWherePatternsFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(parameters) => {
${joinCode([
  code`let patterns: ${this.reusables.snippets.SparqlPattern}[] = [];`,
  ...this.members.map(
    (member) =>
      code`patterns = patterns.concat((${member.type.focusSparqlWherePatternsFunction.unannotatedUsage})(parameters));`,
  ),
  code`return patterns;`,
])}
}`;
}

export function ObjectIntersectionType_focusSparqlWherePatternsFunction(
  this: ObjectIntersectionType,
): Callable {
  return this._function({
    type: code`${this.reusables.snippets.FocusSparqlWherePatternsFunction}<${this.filterType}>`,
    unannotatedExpression: () =>
      ObjectIntersectionType_focusSparqlWherePatternsFunctionExpression.call(
        this,
      ),
    unqualifiedName: "focusSparqlWherePatterns",
  });
}

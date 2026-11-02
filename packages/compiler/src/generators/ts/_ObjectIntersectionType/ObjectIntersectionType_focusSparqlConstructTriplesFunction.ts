import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectIntersectionType_focusSparqlConstructTriplesFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(parameters) => {
${joinCode([
  code`let triples: ${this.reusables.imports.sparqljs}.Triple[] = [];`,
  ...this.members.map(
    (member) =>
      code`triples = triples.concat((${member.type.focusSparqlConstructTriplesFunction.unannotatedUsage})(parameters));`,
  ),
  code`return triples;`,
])}
}`;
}

export function ObjectIntersectionType_focusSparqlConstructTriplesFunction(
  this: ObjectIntersectionType,
): Callable {
  return this._function({
    type: code`${this.reusables.snippets.FocusSparqlConstructTriplesFunction}<${this.filterType}>`,
    unannotatedExpression: () =>
      ObjectIntersectionType_focusSparqlConstructTriplesFunctionExpression.call(
        this,
      ),
    unqualifiedName: "focusSparqlConstructTriples",
  });
}

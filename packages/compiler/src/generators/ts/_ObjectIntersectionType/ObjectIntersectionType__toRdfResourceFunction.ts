import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectIntersectionType__toRdfResourceFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(parameters) => {
  ${joinCode(this.members.map((member) => code`${member.type._toRdfResourceFunction.unannotatedUsage}(parameters);`))}
}`;
}

export function ObjectIntersectionType__toRdfResourceFunction(
  this: ObjectIntersectionType,
): Callable {
  const identifierTypeExpression = this.name
    .map(() => this.identifierTypeAlias)
    .orDefault(this.identifierType.expression);

  return this._function({
    type: code`${this.reusables.snippets._ToRdfResourceFunction}<${identifierTypeExpression}, ${this.expression}>`,
    unannotatedExpression: () =>
      ObjectIntersectionType__toRdfResourceFunctionExpression.call(this),
    unqualifiedName: "_toRdfResource",
  });
}

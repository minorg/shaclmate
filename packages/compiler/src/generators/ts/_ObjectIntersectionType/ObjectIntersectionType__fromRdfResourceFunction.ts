import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectIntersectionType__fromRdfResourceFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`(resource, options) => ${joinCode(
    this.members.map(
      (member, memberI) =>
        code`(${member.type.fromRdfResourceFunction.unannotatedUsage})(resource, options).${memberI + 1 < this.members.length ? "chain" : "map"}(member${memberI} =>`,
    ),
  )} ({ ${joinCode(
    this.members.map((_, memberI) => code`...member${memberI}`),
    { on: "," },
  )} }) ${")".repeat(this.members.length)}`;
}

export function ObjectIntersectionType__fromRdfResourceFunction(
  this: ObjectIntersectionType,
): Callable {
  return this._function({
    type: code`${this.reusables.snippets._FromRdfResourceFunction}<${this.expression}>`,
    unannotatedExpression: () =>
      ObjectIntersectionType__fromRdfResourceFunctionExpression.call(this),
    unqualifiedName: "_fromRdfResource",
  });
}

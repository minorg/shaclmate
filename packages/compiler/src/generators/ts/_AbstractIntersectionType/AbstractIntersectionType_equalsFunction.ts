import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractIntersectionType_equalsFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractIntersectionType<MemberTypeT>): Code {
  return code`\
(left, right) =>
${joinCode(
  this.members.map(
    ({ type }) => code`${type.equalsFunction.annotatedUsage}(left, right)`,
  ),
  { on: " && " },
)}`;
}

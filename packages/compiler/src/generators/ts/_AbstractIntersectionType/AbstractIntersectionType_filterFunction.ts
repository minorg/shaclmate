import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractIntersectionType_filterFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractIntersectionType<MemberTypeT>): Code {
  return code`\
(filter, value) =>
  ${joinCode(
    this.members.map(
      ({ type }) => code`${type.filterFunction.annotatedUsage}(filter, value)`,
    ),
    { on: " && " },
  )}`;
}

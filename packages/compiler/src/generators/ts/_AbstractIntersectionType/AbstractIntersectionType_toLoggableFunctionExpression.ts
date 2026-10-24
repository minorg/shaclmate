import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import { codeEquals } from "../codeEquals.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractIntersectionType_toLoggableFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractIntersectionType<MemberTypeT>): Code {
  const memberToLoggableExpressions = this.members.map(({ type }) =>
    type.toLoggableExpression({
      variables: { value: code`value` },
    }),
  );

  // If every toLoggable expression is the same, use that expression and don't bother discriminating the member type.
  if (
    memberToLoggableExpressions.every(
      (memberToLoggableExpression, memberI) =>
        memberI === 0 ||
        codeEquals(memberToLoggableExpression, memberToLoggableExpressions[0]),
    )
  ) {
    return code`(value) => ${memberToLoggableExpressions[0]}`;
  }

  return code`(value) => [${joinCode(memberToLoggableExpressions, { on: "," })}]`;
}

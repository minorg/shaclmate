import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import { codeEquals } from "../codeEquals.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractIntersectionType_toStringFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractIntersectionType<MemberTypeT>): Code {
  const memberToStringExpressions = this.members.map(({ type }) =>
    type.toStringExpression({
      variables: { value: code`value` },
    }),
  );

  // If every toString expression is the same, use that expression and don't bother discriminating the member type.
  if (
    memberToStringExpressions.every(
      (memberToStringExpression, memberI) =>
        memberI === 0 ||
        codeEquals(memberToStringExpression, memberToStringExpressions[0]),
    )
  ) {
    return code`(value) => ${memberToStringExpressions[0]}`;
  }

  return code`\
(value) => JSON.stringify([${joinCode(
    this.members.map(({ type }) =>
      type.toStringExpression({
        variables: { value: code`value` },
      }),
    ),
    { on: ", " },
  )}])`;
}

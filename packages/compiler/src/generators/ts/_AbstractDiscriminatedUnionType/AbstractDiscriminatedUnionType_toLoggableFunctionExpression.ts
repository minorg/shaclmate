import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import { codeEquals } from "../codeEquals.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_toLoggableFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  const memberToLoggableExpressions = this.members.map(({ type, unwrap }) =>
    type.toLoggableExpression({
      variables: { value: unwrap(code`value`) },
    }),
  );

  const returnTypeAnnotation = this.recursive ? code`: any` : code``;

  // If every toLoggable expression is the same, use that expression and don't bother discriminating the member type.
  if (
    memberToLoggableExpressions.every(
      (memberToLoggableExpression, memberI) =>
        memberI === 0 ||
        codeEquals(memberToLoggableExpression, memberToLoggableExpressions[0]),
    )
  ) {
    return code`((value: ${this.expression})${returnTypeAnnotation} => ${memberToLoggableExpressions[0]})`;
  }

  // Otherwise have to discriminate the member type.
  return code`\
((value: ${this.expression})${returnTypeAnnotation} => {
${joinCode(
  this.members.map(
    ({ typeCheck }, memberI) =>
      code`if (${typeCheck(code`value`)}) { return ${memberToLoggableExpressions[memberI]}; }`,
  ),
)}

  throw new Error("unable to serialize to loggable");
})`;
}

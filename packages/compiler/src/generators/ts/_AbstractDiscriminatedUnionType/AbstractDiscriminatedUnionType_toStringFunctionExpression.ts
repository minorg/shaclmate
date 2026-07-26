import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_toStringFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
((value: ${this.expression}): string => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${type.toStringExpression({
        variables: { value: unwrap(code`value`) },
      })}; }`,
  ),
)}

  throw new Error("unable to serialize to string");
})`;
}

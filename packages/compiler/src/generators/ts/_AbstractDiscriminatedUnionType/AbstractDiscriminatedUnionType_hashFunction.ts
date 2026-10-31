import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_hashFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
(hasher, value) => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`value`)}) { ${type.hashFunction.annotatedUsage}(hasher, ${unwrap(code`value`)}); return; }`,
  ),
)}
}`;
}

import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_hashFunctionExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
(<HasherT extends ${this.reusables.snippets.Hasher}>(hasher: HasherT, value: ${this.expression}): HasherT => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${type.hashFunction}(hasher, ${unwrap(code`value`)}); }`,
  ),
)}
  return hasher;
})`;
}

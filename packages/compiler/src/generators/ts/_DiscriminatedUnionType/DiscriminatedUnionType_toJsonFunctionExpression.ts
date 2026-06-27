import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_toJsonFunctionExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
((value: ${this.expression}): ${this.jsonType().expression} => {
${joinCode(
  this.members.map(
    ({ typeCheck, typeToJsonExpression, unwrap, wrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${wrap(
        typeToJsonExpression(unwrap(code`value`)),
      )}; }`,
  ),
)}

  throw new Error("unable to serialize to JSON");
})`;
}

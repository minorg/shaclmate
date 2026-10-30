import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_toJsonFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
(value) => {
${joinCode(
  this.members.map(
    ({ primaryDiscriminantValue, type, typeCheck, unwrap }) =>
      code`\
if (${typeCheck(code`value`)}) {
  return {
    ...(${type.toExpandedJsonFunction})(${unwrap(code`value`)}),
    ${literalOf(this.configuration.objectDiscriminantProperty.jsonName)}: ${literalOf(primaryDiscriminantValue)}
  }
}`,
  ),
)}

  throw new Error("unable to serialize to JSON");
}`;
}

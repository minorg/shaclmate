import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_equalsFunctionExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
((left: ${this.expression}, right: ${this.expression}) => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`left`)} && ${typeCheck(code`right`)}) {
  return ${type.equalsFunction}(${unwrap(code`left`)} as ${type.expression}, ${unwrap(code`right`)} as ${type.expression});
}`,
  ),
)}

  return ${this.reusables.imports.Left}({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "boolean" as const }, type: "property" as const });
})`;
}

import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_fromJsonFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(value) =>
    ${joinCode(
      this.members.map(
        (member, memberI) => code`
${member.type.fromJsonExpression({
  form: "compact",
  variables: {
    value: code`value`,
  },
})}.${memberI + 1 < this.members.length ? "chain" : "map"}(member${memberI} =>`,
      ),
    )} ({ ${joinCode(
      this.members.map((_, memberI) => code`...member${memberI}`),
      { on: "," },
    )} }) ${")".repeat(this.members.length)}`;
}

import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_fromJsonObjectFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(jsonObject) =>
    ${joinCode(
      this.members.map(
        (member, memberI) => code`
${member.type.fromJsonObjectFunction.unannotatedUsage}(jsonObject).${memberI + 1 < this.members.length ? "chain" : "map"}(member${memberI} =>`,
      ),
    )} ({ ${joinCode(
      this.members
        .map((_, memberI) => code`...member${memberI}`)
        .concat(
          this.discriminatedType
            .map(
              ({ discriminantProperty }) =>
                code`${discriminantProperty.name}: ${literalOf(discriminantProperty.values[0])} as const`,
            )
            .toList(),
        ),
      { on: "," },
    )} }) ${")".repeat(this.members.length)}`;
}

export function ObjectIntersectionType_fromJsonObjectFunctionType(
  this: ObjectIntersectionType,
): Code {
  return code`${this.reusables.snippets.FromJsonFunction}<${this.jsonObjectType.expression}, ${this.discriminatedType.map((discriminatedType) => discriminatedType.expression).orDefault(this.expression)}, undefined>`;
}

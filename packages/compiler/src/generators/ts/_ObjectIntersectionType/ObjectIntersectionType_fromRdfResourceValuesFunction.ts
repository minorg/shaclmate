import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_fromRdfResourceValuesFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(inputValues, options) =>
    ${joinCode(
      this.members.map(
        (member, memberI) => code`\
      ${member.type.fromRdfResourceValuesFunction.annotatedUsage}(inputValues, { ...options, ignoreRdfType: true, schema: options.schema.members[${literalOf(memberI)}] }).chain(member${memberI}Values =>`,
      ),
    )} {
      ${joinCode(
        this.members.map(
          (member, memberI) =>
            code`\
const member${memberI}ValuesArray = member${memberI}Values.toArray(); ${
              memberI > 0
                ? code`
if (member${memberI}ValuesArray.length !== member0Values.length) {
  return ${this.reusables.imports.Left}(new Error(\`${this.name.orDefault("(anonymous intersection)")} member ${memberI} (${member.type.name.orDefault("(anonymous object)")}) has \${member${memberI}Values.length} values, expected \${member0Values.length}\`));
}`
                : code``
            }`,
        ),
      )}

      return ${this.reusables.imports.Right}(member0Values.map((_, valueI) => ({ ${joinCode(
        this.members.map(
          (_, memberI) => code`...member${memberI}ValuesArray[valueI]`,
        ),
        { on: "," },
      )} })));
    } ${")".repeat(this.members.length)}`;
}

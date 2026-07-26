import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_fromJsonFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
((value: ${this.jsonType().expression}): ${this.reusables.imports.Either}<Error, ${this.expression}> => {
${joinCode(
  this.members.map(
    ({ jsonType, jsonTypeCheck, type, unwrap, wrap }) =>
      code`if (${jsonTypeCheck(code`value`)}) { return ${type.fromJsonExpression(
        {
          variables: {
            value: code`(${unwrap(code`value`)} as ${jsonType})`,
          },
        },
      )}.map(value => (${wrap(code`value`)})); }`,
  ),
)}

  throw new Error("unable to deserialize JSON");
})`;
}

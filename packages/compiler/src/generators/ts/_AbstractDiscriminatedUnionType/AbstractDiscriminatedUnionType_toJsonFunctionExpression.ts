import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_toJsonFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
((value: ${this.expression}): ${this.jsonType().expression} => {
${joinCode(
  this.members.map(
    ({ primaryDiscriminantValue, type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${type.toJsonExpression({
        discriminantProperty: singleEntryRecord(
          this.configuration.objectDiscriminantProperty.jsonName,
          code`${literalOf(primaryDiscriminantValue)}`,
        ),
        form: "expanded",
        variables: { value: unwrap(code`value`) },
      })}; }`,
  ),
)}

  throw new Error("unable to serialize to JSON");
})`;
}

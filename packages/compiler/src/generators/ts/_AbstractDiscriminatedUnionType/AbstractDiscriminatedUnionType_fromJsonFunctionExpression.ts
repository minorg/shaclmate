import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_fromJsonFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
((value: ${this.jsonType().expression}): ${this.reusables.imports.Either}<Error, ${this.expression}> => {
${joinCode(
  this.members.map(
    ({ primaryDiscriminantValue, type, wrap }) =>
      code`if (value.${this.configuration.objectDiscriminantProperty.jsonName} === ${literalOf(primaryDiscriminantValue)}) { return ${type.fromJsonExpression(
        {
          form: "expanded",
          variables: {
            value: code`value`,
          },
        },
      )}.map(value => (${wrap(code`value`)})); }`,
  ),
)}

  throw new Error("unable to deserialize JSON");
})`;
}

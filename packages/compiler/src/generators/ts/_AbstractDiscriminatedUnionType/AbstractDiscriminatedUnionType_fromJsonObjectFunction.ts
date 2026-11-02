import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import { codeEquals } from "../codeEquals.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_fromJsonObjectFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
(value, options) => {
${joinCode(
  this.members.map(({ primaryDiscriminantValue, type, wrap }) => {
    const valueVariable = code`value`;
    const wrappedValue = wrap(valueVariable);
    const mapAndWrapValue = codeEquals(wrappedValue, valueVariable)
      ? ""
      : code`.map(${valueVariable} => (${wrappedValue}))`;
    return code`if (value.${this.configuration.objectDiscriminantProperty.jsonName} === ${literalOf(primaryDiscriminantValue)}) { return ${type.fromJsonObjectFunction.unannotatedUsage}(value, { ...options, schema: ${this.schema}.members[${literalOf(primaryDiscriminantValue)}].type })${mapAndWrapValue} as ${this.reusables.imports.Either}<Error, ${this.expression}>; }`;
  }),
)}

  throw new Error("unable to deserialize JSON");
}`;
}

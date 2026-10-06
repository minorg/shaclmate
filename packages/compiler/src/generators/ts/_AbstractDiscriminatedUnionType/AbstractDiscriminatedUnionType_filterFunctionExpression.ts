import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_filterFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return code`\
((filter: ${this.filterType}, value: ${this.expression}) => {
${joinCode([
  ...this.identifierProperty
    .map(
      (identifierProperty) => code`\
if (filter.${syntheticNamePrefix}identifier !== undefined && !${identifierProperty.type.filterFunction}(filter.${identifierProperty.name}, value.${identifierProperty.name})) {
  return false;
}`,
    )
    .toList(),
  ...this.members.map(
    ({ primaryDiscriminantValue, type, typeCheck, unwrap }) => code`\
if (filter.on?.[${literalOf(primaryDiscriminantValue)}] !== undefined && ${typeCheck(code`value`)}) {
  if (!${type.filterFunction}(filter.on[${literalOf(primaryDiscriminantValue)}], ${unwrap(code`value`)})) {
    return false;
  }
}`,
  ),
])}

  return true;
})`;
}

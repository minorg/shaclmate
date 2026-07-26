import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_filterFunctionExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return code`\
((filter: ${this.filterType}, value: ${this.expression}) => {
${joinCode([
  ...this.identifierType
    .map(
      (identifierType) => code`\
if (filter.${syntheticNamePrefix}identifier !== undefined && !${identifierType.filterFunction}(filter.${syntheticNamePrefix}identifier, value.${syntheticNamePrefix}identifier())) {
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

import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_filterTypeExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return code`\
  {
   ${this.identifierType.map((identifierType) => code`readonly ${syntheticNamePrefix}identifier?: ${identifierType.filterType};`).orDefault(code``)}
   readonly on?: { ${joinCode(
     this.members.map(
       ({ type, primaryDiscriminantValue }) =>
         code`readonly ${literalOf(primaryDiscriminantValue)}?: ${type.filterType}`,
     ),
     { on: ";" },
   )} }
  }`;
}

import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_filterTypeExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
  {
   ${this.identifierProperty.map((identifierProperty) => code`readonly ${identifierProperty.name}?: ${identifierProperty.type.filterType};`).orDefault(code``)}
   readonly on?: { ${joinCode(
     this.members.map(
       ({ type, primaryDiscriminantValue }) =>
         code`readonly ${literalOf(primaryDiscriminantValue)}?: ${type.filterType}`,
     ),
     { on: ";" },
   )} }
  }`;
}

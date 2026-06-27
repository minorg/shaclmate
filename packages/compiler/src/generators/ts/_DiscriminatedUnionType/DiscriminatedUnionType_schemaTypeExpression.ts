import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_schemaTypeExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  return code`${{
    kind: this.kind,
    members: code`{ ${joinCode(
      this.members.map(
        ({ type, primaryDiscriminantValue }) =>
          code`readonly ${literalOf(primaryDiscriminantValue)}: ${{
            discriminantValues: code`readonly (number | string)[]`,
            type: type.schemaType,
          }}`,
      ),
      { on: ";" },
    )} }`,
  }}`;
}

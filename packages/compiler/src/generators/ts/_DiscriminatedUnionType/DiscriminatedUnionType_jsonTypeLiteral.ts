import { AbstractType } from "../AbstractType.js";
import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_jsonTypeLiteral<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): AbstractType.JsonType {
  const discriminant = this.discriminant; // To get type narrowing to work
  switch (discriminant.kind) {
    case "Extrinsic":
      return new AbstractType.JsonType(
        code`(${joinCode(
          this.members.map(
            ({ jsonType, primaryDiscriminantValue }) =>
              code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${jsonType} }`,
          ),
          { on: "|" },
        )})`,
      );

    case "Hybrid":
      return new AbstractType.JsonType(
        code`(${joinCode(
          this.members.map(
            ({ jsonType, primaryDiscriminantValue }, memberI) => {
              switch (discriminant.memberValues[memberI].kind) {
                case "Extrinsic":
                  return code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${jsonType} }`;
                case "Intrinsic":
                  return code`${jsonType}`;
                default:
                  throw new Error();
              }
            },
          ),
          { on: "|" },
        )})`,
      );

    case "Intrinsic":
    case "Typeof":
      return new AbstractType.JsonType(
        joinCode(
          this.members.map(({ jsonType }) => code`${jsonType}`),
          { on: "|" },
        ),
      );
    default:
      throw discriminant satisfies never;
  }
}

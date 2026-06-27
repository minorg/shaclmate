import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_inlineExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  const discriminant = this.discriminant; // To get type narrowing to work
  switch (discriminant.kind) {
    case "Extrinsic":
      return code`(${joinCode(
        this.members.map(
          ({ type, primaryDiscriminantValue }) =>
            code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${type.expression} }`,
        ),
        { on: "|" },
      )})`;
    case "Hybrid":
      return code`(${joinCode(
        this.members.map(({ primaryDiscriminantValue, type }, memberI) => {
          switch (discriminant.memberValues[memberI].kind) {
            case "Extrinsic":
              return code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${type.expression} }`;
            case "Intrinsic":
              return code`${type.expression}`;
            default:
              throw new Error();
          }
        }),
        { on: "|" },
      )})`;
    case "Intrinsic":
      // If every type shares a discriminant (e.g., RDF/JS "termType" or generated ObjectType "type"),
      // just join their names with "|"
      return code`(${joinCode(
        this.members.map(({ type }) => code`${type.expression}`),
        { on: "|" },
      )})`;
    case "Typeof":
      // The type.name may include literal values, but they should still be unambiguous with other member types since the typeofs
      // of the different member types are known to be different.
      return code`(${joinCode(
        this.members.map(({ type }) => code`${type.expression}`),
        { on: "|" },
      )})`;
    default:
      discriminant satisfies never;
      throw new Error("should never reach this point");
  }
}

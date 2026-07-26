import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_jsonSchemaExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  const discriminant = this.discriminant; // To get type narrowing to work
  switch (discriminant.kind) {
    case "Extrinsic":
      return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
        this.members.map(
          ({ type, primaryDiscriminantValue }) =>
            code`${this.reusables.imports.z}.object({ ${discriminant.name}: ${this.reusables.imports.z}.literal(${literalOf(primaryDiscriminantValue)}), value: ${type.jsonSchema({ context: "type" })} })`,
        ),
        { on: "," },
      )}]).readonly()`;

    case "Hybrid":
      return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
        this.members.map(({ primaryDiscriminantValue, type }, memberI) => {
          switch (discriminant.memberValues[memberI].kind) {
            case "Extrinsic":
              return code`${this.reusables.imports.z}.object({ ${discriminant.name}: ${this.reusables.imports.z}.literal(${literalOf(primaryDiscriminantValue)}), value: ${type.jsonSchema({ context: "type" })} })`;
            case "Intrinsic":
              return type.jsonSchema({
                includeDiscriminantProperty: true,
                context: "type",
              });
            default:
              throw new Error();
          }
        }),
        { on: "," },
      )}]).readonly()`;

    case "Intrinsic":
      return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
        this.members.map(({ type }) =>
          type.jsonSchema({
            includeDiscriminantProperty: true,
            context: "type",
          }),
        ),
        { on: "," },
      )}]).readonly()`;

    case "Typeof":
      return code`${this.reusables.imports.z}.union([${joinCode(
        this.members.map(({ type }) => type.jsonSchema({ context: "type" })),
        { on: "," },
      )}]).readonly()`;

    default:
      throw discriminant satisfies never;
  }
}

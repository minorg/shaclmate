import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_fromRdfResourceValuesFunctionExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
(((values, options) =>
  values.chainMap(value => {
    const valueAsValues = value.toValues();
    return ${this.members.reduce(
      (expression, { type, primaryDiscriminantValue }, memberI) => {
        let typeExpression: Code = code`${type.fromRdfResourceValuesFunction}(valueAsValues, { ...options, schema: options.schema.members[${literalOf(primaryDiscriminantValue)}].type })`;
        if (
          this.discriminant.kind === "Extrinsic" ||
          (this.discriminant.kind === "Hybrid" &&
            this.discriminant.memberValues[memberI].kind === "Extrinsic")
        ) {
          typeExpression = code`${typeExpression}.map(values => values.map(value => ({ ${this.discriminant.name}: ${literalOf(primaryDiscriminantValue)} as const, value }) as (${this.expression})))`;
        }
        typeExpression = code`(${typeExpression} as ${this.reusables.imports.Either}<Error, ${this.reusables.imports.Resource}.Values<${this.expression}>>)`;
        return expression !== null
          ? code`${expression}.altLazy(() => ${typeExpression})`
          : typeExpression;
      },
      null as Code | null,
    )!}.chain(values => values.head());
  })
) satisfies ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>)`;
}

import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { imports } from "./imports.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  override readonly graphqlType = new AbstractNumericType.GraphqlType(
    code`${imports.GraphQLBigInt}`,
  );
  override readonly kind = "BigIntType";
  override readonly typeofs = NonEmptyList(["bigint" as const]);

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["fromJsonExpression"]>[0]): Code {
    let expression = code`BigInt(${variables.value})`;
    if (this.primitiveIn.length > 0) {
      expression = code`${expression} as ${this.name}`;
    }
    return expression;
  }

  override jsonZodSchema(
    _parameters: Parameters<AbstractNumericType<bigint>["jsonZodSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${imports.z}.bigint().transform(_ => _.toString())`;
      case 1:
        return code`${imports.z}.literal(${this.literalOf(this.primitiveIn[0])}).transform(() => "${this.primitiveIn[0].toString()}" as const)`;
      default:
        return code`${imports.z}.union([${joinCode(
          this.primitiveIn.map(
            (value) =>
              code`${imports.z}.literal(${this.literalOf(value)}).transform(() => "${value.toString()}" as const)`,
          ),
          { on: "," },
        )}])`;
    }
  }

  @Memoize()
  override jsonType(): AbstractNumericType.JsonType {
    return new AbstractNumericType.JsonType(code`string`);
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toString()`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    AbstractNumericType<bigint>["fromRdfResourceValueExpression"]
  >[0]): Code {
    return code`${variables.value}.toBigInt()`;
  }

  protected override literalOf(value: bigint): string {
    return `${value.toString()}n`;
  }
}

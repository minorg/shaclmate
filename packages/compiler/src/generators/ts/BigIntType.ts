import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  override readonly kind = "BigIntType";
  override readonly typeofs = ["bigint" as const];

  @Memoize()
  override get graphqlType() {
    return new AbstractNumericType.GraphqlType(
      code`${this.reusables.imports.GraphQLBigInt}`,
      this.reusables,
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["fromJsonExpression"]>[0]): Code {
    let expression = code`BigInt(${variables.value})`;
    if (this.primitiveIn.length > 0) {
      expression = code`${expression} as ${this.name}`;
    }
    return code`${this.reusables.imports.Either}.encase(() => ${expression})`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractNumericType<bigint>["jsonSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${this.reusables.imports.z}.string()`;
      case 1:
        return code`${this.reusables.imports.z}.literal(${literalOf(this.primitiveIn[0].toString())})`;
      default:
        return code`${this.reusables.imports.z}.enum([${joinCode(
          this.primitiveIn.map((value) => code`${literalOf(value.toString())}`),
          { on: "," },
        )}])`;
    }
  }

  @Memoize()
  override jsonType(): AbstractNumericType.JsonType {
    return new AbstractNumericType.JsonType(code`string`);
  }

  override literalExpression(literal: bigint | Literal): Code {
    return code`${typeof literal === "bigint" ? literal : LiteralDecoder.decodeBigIntLiteral(literal).unsafeCoerce()}n`;
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
    return code`${variables.value}.toBigInt(${this.primitiveIn.length > 0 ? `[${this.primitiveIn.map((_) => `${_}n`).join(", ")}] as const` : ""})`;
  }
}

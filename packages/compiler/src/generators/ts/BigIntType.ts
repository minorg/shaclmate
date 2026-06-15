import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { arrayOf, type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  override readonly jsTypes = [{ typeof: "bigint" } as const];
  override readonly kind = "BigInt";

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.bigIntFromRdfResourceValues}<${this.expression}>`;
  }

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
    if (this.decodedIn.length > 0) {
      expression = code`${expression} as ${this.expression}`;
    }
    return code`${this.reusables.imports.Either}.encase<Error, ${this.expression}>(() => ${expression})`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractNumericType<bigint>["jsonSchema"]>[0],
  ): Code {
    switch (this.decodedIn.length) {
      case 0:
        return code`${this.reusables.imports.z}.string()`;
      case 1:
        return code`${this.reusables.imports.z}.literal(${literalOf(this.decodedIn[0].toString())})`;
      default:
        return code`${this.reusables.imports.z}.enum(${arrayOf(
          ...this.decodedIn.map(
            (value) => code`${literalOf(value.toString())}`,
          ),
        )})`;
    }
  }

  @Memoize()
  override jsonType(): AbstractNumericType.JsonType {
    return new AbstractNumericType.JsonType(code`string`);
  }

  override literalValueExpression(literal: bigint | Literal): Code {
    return code`${typeof literal === "bigint" ? literal : LiteralDecoder.decodeBigIntLiteral(literal).unsafeCoerce()}n`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toString()`;
  }
}

import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  protected override readonly decodedIn = this.in_.map((in_) =>
    LiteralDecoder.decodeBigIntLiteral(in_).unsafeCoerce(),
  );
  protected override readonly compactJsonType: AbstractNumericType.JsonType =
    this.jsonTypeFactory.createJsonStringType({
      in_: this.decodedIn.map((in_) => in_.toString()),
    });

  override readonly jsTypes = [{ typeof: "bigint" } as const];
  readonly conversionFunction: Maybe<AbstractNumericType.ConversionFunction> =
    this.in_.length > 0
      ? Maybe.empty()
      : Maybe.of({
          code: code`${this.reusables.snippets.convertToBigInt}`,
          sourceTypes: [
            {
              expression: code`bigint`,
              jsType: this.jsTypes[0],
            },
            {
              expression: code`number`,
              jsType: { typeof: "number" },
            },
            {
              expression: code`string`,
              jsType: { typeof: "string" },
            },
          ],
        });
  override readonly graphqlType = new AbstractNumericType.GraphqlType(
    code`${this.reusables.imports.GraphQLBigInt}`,
    this.reusables,
  );
  override readonly kind = "BigInt";

  @Memoize()
  override get fromRdfResourceValuesFunction(): FunctionLike {
    return code`${this.reusables.snippets.bigIntFromRdfResourceValues}<${this.expression}>`;
  }

  override valueExpression(literal: bigint | Literal): Code {
    return code`${typeof literal === "bigint" ? literal : LiteralDecoder.decodeBigIntLiteral(literal).unsafeCoerce()}n`;
  }

  protected override fromCompactJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["fromJsonExpression"]>[0]): Code {
    let fromCompactJsonExpression = code`BigInt(${variables.value})`;
    if (this.in_.length > 0) {
      fromCompactJsonExpression = code`(${fromCompactJsonExpression} as ${this.expression})`;
    }
    return fromCompactJsonExpression;
  }

  protected override toCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractNumericType<bigint>["toCompactJsonExpression"]
  >[0]): Code {
    let toCompactJsonExpression = code`${variables.value}.toString()`;
    if (this.in_.length > 0) {
      toCompactJsonExpression = code`(${toCompactJsonExpression} as ${joinCode(
        this.decodedIn.map((in_) => code`${literalOf(in_.toString())}`),
        { on: " | " },
      )})`;
    }
    return toCompactJsonExpression;
  }
}

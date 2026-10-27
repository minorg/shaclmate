import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import type { Callable } from "./Callable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  protected override readonly decodedIn = this.in_.map((in_) =>
    LiteralDecoder.decodeBigIntLiteral(in_).unsafeCoerce(),
  );
  protected override readonly compactedJsonType: AbstractNumericType.JsonType =
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
  override get fromRdfResourceValuesFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.bigIntFromRdfResourceValues}<${this.expression}>`,
    );
  }

  override valueExpression(literal: bigint | Literal): Code {
    return code`${typeof literal === "bigint" ? literal : LiteralDecoder.decodeBigIntLiteral(literal).unsafeCoerce()}n`;
  }

  protected override fromCompactedJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["fromJsonExpression"]>[0]): Code {
    let fromCompactedJsonExpression = code`BigInt(${variables.value})`;
    if (this.in_.length > 0) {
      fromCompactedJsonExpression = code`(${fromCompactedJsonExpression} as ${this.expression})`;
    }
    return fromCompactedJsonExpression;
  }

  protected override toCompactedJsonExpression({
    variables,
  }: Parameters<
    AbstractNumericType<bigint>["toCompactedJsonExpression"]
  >[0]): Code {
    let toCompactedJsonExpression = code`${variables.value}.toString()`;
    if (this.in_.length > 0) {
      toCompactedJsonExpression = code`(${toCompactedJsonExpression} as ${joinCode(
        this.decodedIn.map((in_) => code`${literalOf(in_.toString())}`),
        { on: " | " },
      )})`;
    }
    return toCompactedJsonExpression;
  }
}

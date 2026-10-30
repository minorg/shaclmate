import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import type { Callable } from "./Callable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  protected override readonly decodedIn = this.in_.map((in_) =>
    LiteralDecoder.decodeBigIntLiteral(in_).unsafeCoerce(),
  );

  override readonly jsonValueType: AbstractNumericType.JsonType =
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
  override get fromJsonValueFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.bigIntFromJsonString}<${this.jsonValueType.expression}, ${this.expression}>`,
    );
  }

  @Memoize()
  override get fromJsonObjectFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.bigIntFromJsonObject}<${this.expression}>`,
    );
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.bigIntFromRdfResourceValues}<${this.expression}>`,
    );
  }

  override valueExpression(literal: bigint | Literal): Code {
    return code`${typeof literal === "bigint" ? literal : LiteralDecoder.decodeBigIntLiteral(literal).unsafeCoerce()}n`;
  }
}

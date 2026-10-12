import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class IntType extends AbstractNumericType<number> {
  private readonly decodedIn = this.in_.map((in_) =>
    LiteralDecoder.decodeFloatLiteral(in_).unsafeCoerce(),
  );
  override readonly compactJsonType: AbstractNumericType.JsonType =
    this.jsonTypeFactory.createJsonNumberType({ in_: this.decodedIn });
  override readonly conversionFunction: Maybe<AbstractNumericType.ConversionFunction> =
    Maybe.empty();
  override readonly jsTypes = [{ typeof: "number" }] as const;
  override readonly kind = "Int";

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.intFromRdfResourceValues}<${this.expression}>`;
  }

  @Memoize()
  override get graphqlType() {
    return new AbstractNumericType.GraphqlType(
      code`${this.reusables.imports.GraphQLInt}`,
      this.reusables,
    );
  }

  override valueExpression(literal: Literal | number): Code {
    return code`${typeof literal === "number" ? literal : LiteralDecoder.decodeIntLiteral(literal).unsafeCoerce()}`;
  }
}

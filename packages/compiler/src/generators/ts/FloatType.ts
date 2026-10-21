import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractNumericType } from "./AbstractNumericType.js";
import type { FunctionLike } from "./FunctionLike.js";
import { FunctionReference } from "./FunctionReference.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class FloatType extends AbstractNumericType<number> {
  protected override readonly decodedIn = this.in_.map((in_) =>
    LiteralDecoder.decodeFloatLiteral(in_).unsafeCoerce(),
  );
  override readonly compactJsonType: AbstractNumericType.JsonType =
    this.jsonTypeFactory.createJsonNumberType({ in_: this.decodedIn });
  override readonly conversionFunction: Maybe<AbstractNumericType.ConversionFunction> =
    Maybe.empty();
  override readonly graphqlType = new AbstractNumericType.GraphqlType(
    code`${this.reusables.imports.GraphQLFloat}`,
    this.reusables,
  );
  override readonly jsTypes = [{ typeof: "number" }] as const;
  override readonly kind = "Float";

  @Memoize()
  get fromRdfResourceValuesFunction(): FunctionLike {
    return new FunctionReference(
      code`${this.reusables.snippets.floatFromRdfResourceValues}<${this.expression}>`,
    );
  }

  override valueExpression(literal: Literal | number): Code {
    return code`${typeof literal === "number" ? literal : LiteralDecoder.decodeFloatLiteral(literal).unsafeCoerce()}`;
  }
}

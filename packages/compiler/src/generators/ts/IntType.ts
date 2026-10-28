import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import type { Callable } from "./Callable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class IntType extends AbstractNumericType<number> {
  protected override readonly decodedIn = this.in_.map((in_) =>
    LiteralDecoder.decodeFloatLiteral(in_).unsafeCoerce(),
  );

  override readonly compactedJsonType: AbstractNumericType.JsonType =
    this.jsonTypeFactory.createJsonNumberType({ in_: this.decodedIn });
  override readonly conversionFunction: Maybe<AbstractNumericType.ConversionFunction> =
    Maybe.empty();
  override readonly jsTypes = [{ typeof: "number" }] as const;
  override readonly kind = "Int";

  @Memoize()
  get fromExpandedJsonFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.intFromExpandedJson}<${this.expression}>`,
    );
  }

  @Memoize()
  get fromRdfResourceValuesFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.intFromRdfResourceValues}<${this.expression}>`,
    );
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

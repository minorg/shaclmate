import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class FloatType extends AbstractNumericType<number> {
  override readonly jsTypes = [{ typeof: "number" }] as const;
  override readonly kind = "Float";

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.floatFromRdfResourceValues}<${this.expression}>`;
  }

  @Memoize()
  override get graphqlType() {
    return new AbstractNumericType.GraphqlType(
      code`${this.reusables.imports.GraphQLFloat}`,
      this.reusables,
    );
  }

  override literalValueExpression(literal: Literal | number): Code {
    return code`${typeof literal === "number" ? literal : LiteralDecoder.decodeFloatLiteral(literal).unsafeCoerce()}`;
  }

  // protected override fromRdfResourceValueExpression({
  //   variables,
  // }: Parameters<
  //   AbstractNumericType<number>["fromRdfResourceValueExpression"]
  // >[0]): Code {
  //   return code`${variables.value}.toFloat(${this.primitiveIn.length > 0 ? `${JSON.stringify(this.primitiveIn)} as const` : ""})`;
  // }
}

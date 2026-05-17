import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class FloatType extends AbstractNumericType<number> {
  override readonly kind = "FloatType";
  override readonly typeofs = ["number" as const];

  @Memoize()
  override get graphqlType() {
    return new AbstractNumericType.GraphqlType(
      code`${this.reusables.imports.GraphQLFloat}`,
      this.reusables,
    );
  }

  override literalExpression(literal: Literal): Code {
    return code`${LiteralDecoder.decodeFloatLiteral(literal).unsafeCoerce()}`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    AbstractNumericType<number>["fromRdfResourceValueExpression"]
  >[0]): Code {
    return code`${variables.value}.toFloat(${this.primitiveIn.length > 0 ? `${JSON.stringify(this.primitiveIn)} as const` : ""})`;
  }

  protected override literalOf(value: number): string {
    return value.toString();
  }
}

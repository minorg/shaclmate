import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";
import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractNumericType } from "./AbstractNumericType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class IntType extends AbstractNumericType<number> {
  override readonly kind = "IntType";
  override readonly typeofs = NonEmptyList(["number" as const]);

  @Memoize()
  override get graphqlType() {
    return new AbstractNumericType.GraphqlType(
      code`${this.reusables.imports.GraphQLInt}`,
      this.reusables,
    );
  }

  override literalExpression(literal: Literal): Code {
    return code`${LiteralDecoder.decodeIntLiteral(literal).unsafeCoerce()}`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    AbstractNumericType<number>["fromRdfResourceValueExpression"]
  >[0]): Code {
    return code`${variables.value}.toInt(${this.primitiveIn.length > 0 ? `${JSON.stringify(this.primitiveIn)} as const` : ""})`;
  }

  protected override literalOf(value: number): string {
    return value.toString();
  }
}

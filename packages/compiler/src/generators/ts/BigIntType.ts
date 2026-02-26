import { NonEmptyList } from "purify-ts";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { imports } from "./imports.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  override readonly graphqlType = new AbstractNumericType.GraphqlType(
    code`${imports.GraphQLBigInt}`,
  );
  override readonly kind = "BigIntType";
  override readonly typeofs = NonEmptyList(["bigint" as const]);

  override toJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toString()`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    AbstractNumericType<bigint>["fromRdfResourceValueExpression"]
  >[0]): Code {
    return code`${variables.value}.toBigInt()`;
  }

  protected override literalOf(value: bigint): string {
    return `${value.toString()}n`;
  }
}

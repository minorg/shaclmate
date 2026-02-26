import { NonEmptyList } from "purify-ts";
import { AbstractNumericType } from "./AbstractNumericType.js";
import { imports } from "./imports.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  override readonly kind = "BigIntType";
  override readonly graphqlType = new AbstractNumericType.GraphqlType(
    code`${imports.GraphQLBigInt}`,
  );
  override readonly typeofs = NonEmptyList(["bigint" as const]);

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    AbstractNumericType<bigint>["fromRdfResourceValueExpression"]
  >[0]): Code {
    return code`${variables.value}.toBigInt()`;
  }

  protected override literalName(value: bigint): string {
    return `${value.toString()}n`;
  }
}

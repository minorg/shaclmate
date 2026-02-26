import { NonEmptyList } from "purify-ts";
import { AbstractNumericType } from "./AbstractNumericType.js";
import { imports } from "./imports.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class IntType extends AbstractNumericType<number> {
  override readonly graphqlType = new AbstractNumericType.GraphqlType(
    code`${imports.GraphQLInt}`,
  );
  override readonly kind = "IntType";
  override readonly typeofs = NonEmptyList(["number" as const]);

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    AbstractNumericType<number>["fromRdfResourceValueExpression"]
  >[0]): Code {
    return code`${variables.value}.toNumber()`;
  }

  protected override valueToString(value: number): string {
    return value.toString();
  }
}

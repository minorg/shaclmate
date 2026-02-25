import { AbstractDateType } from "./AbstractDateType.js";
import { imports } from "./imports.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DateTimeType extends AbstractDateType {
  override readonly graphqlType = new AbstractDateType.GraphqlType(
    code`${imports.GraphQLDateTime}`,
  );
  override readonly kind = "DateTimeType";

  override jsonZodSchema(
    _parameters: Parameters<AbstractDateType["jsonZodSchema"]>[0],
  ): Code {
    return code`${imports.z}.iso.datetime()`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDateType["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toISOString()`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<AbstractDateType["fromRdfResourceValueExpression"]>[0]): Code {
    return code`${variables.value}.toDateTime()`;
  }
}

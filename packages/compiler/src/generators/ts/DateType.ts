import { AbstractDateType } from "./AbstractDateType.js";
import { DateTimeType } from "./DateTimeType.js";
import { imports } from "./imports.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DateType extends AbstractDateType {
  override readonly graphqlType = new DateTimeType.GraphqlType(
    code`${imports.GraphQLDate}`,
  );
  override readonly kind = "DateType";

  override jsonSchema(
    _parameters: Parameters<DateTimeType["jsonSchema"]>[0],
  ): Code {
    return code`${imports.z}.iso.date()`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDateType["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toISOString().replace(/T.*$/, '')`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<AbstractDateType["fromRdfResourceValueExpression"]>[0]): Code {
    return code`${variables.value}.toDate(${this.primitiveIn.length > 0 ? `[${this.primitiveIn.map((_) => `new Date(${_.getTime()})`).join(", ")}]` : ""})`;
  }
}

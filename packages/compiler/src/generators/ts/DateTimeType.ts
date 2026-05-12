import { Memoize } from "typescript-memoize";
import { AbstractDateType } from "./AbstractDateType.js";

import { type Code, code } from "./ts-poet-wrapper.js";

export class DateTimeType extends AbstractDateType {
  override readonly kind = "DateTimeType";

  @Memoize()
  override get graphqlType() {
    return new DateTimeType.GraphqlType(
      code`${this.reusables.imports.GraphQLDateTime}`,
      this.reusables,
    );
  }

  override jsonSchema(
    _parameters: Parameters<AbstractDateType["jsonSchema"]>[0],
  ): Code {
    return code`${this.reusables.imports.z}.iso.datetime()`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDateType["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toISOString()`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<AbstractDateType["fromRdfResourceValueExpression"]>[0]): Code {
    return code`${variables.value}.toDateTime(${this.primitiveIn.length > 0 ? `[${this.primitiveIn.map((_) => `new Date(${_.getTime()})`).join(", ")}]` : ""})`;
  }
}

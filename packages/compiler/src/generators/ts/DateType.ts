import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractDateType } from "./AbstractDateType.js";
import { DateTimeType } from "./DateTimeType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DateType extends AbstractDateType {
  override readonly graphqlType = new DateTimeType.GraphqlType(
    code`${this.reusables.imports.GraphQLDate}`,
    this.reusables,
  );
  override readonly hashFunction = code`${this.reusables.snippets.hashDate}`;
  override readonly kind = "Date";

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.dateFromRdfResourceValues}`;
  }

  override jsonSchema(
    _parameters: Parameters<DateTimeType["jsonSchema"]>[0],
  ): Code {
    return code`${this.reusables.imports.z}.iso.date()`;
  }

  override literalValueExpression(literal: Date | Literal): Code {
    return code`new Date("${(literal instanceof Date ? literal : LiteralDecoder.decodeDateLiteral(literal).unsafeCoerce()).toISOString()}")`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDateType["toJsonExpression"]>[0]): Code {
    return code`${this.reusables.snippets.toIsoDateString}(${variables.value})`;
  }
}

import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { AbstractDateType } from "./AbstractDateType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DateTimeType extends AbstractDateType {
  override readonly fromJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.dateTimeFromJsonObject,
  );
  override readonly fromRdfResourceValuesFunction = new BuiltinCallable(
    this.reusables.snippets.dateTimeFromRdfResourceValues,
  );
  override readonly graphqlType = new DateTimeType.GraphqlType(
    code`${this.reusables.imports.GraphQLDateTime}`,
    this.reusables,
  );
  protected override readonly jsonStringFormat = "datetime";
  override readonly hashFunction = new BuiltinCallable(
    this.reusables.snippets.hashDateTime,
  );
  override readonly kind = "DateTime";
  override readonly toJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.dateTimeToJsonString,
  );
  override readonly toJsonObjectFunction = new BuiltinCallable(
    code`${this.reusables.snippets.dateToJsonObject}(${this.rdfjsTermExpression(this.datatype)})`,
  );

  override valueExpression(literal: Date | Literal): Code {
    return code`new Date("${(literal instanceof Date ? literal : LiteralDecoder.decodeDateTimeLiteral(literal).unsafeCoerce()).toISOString()}")`;
  }
}

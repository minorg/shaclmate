import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { AbstractDateType } from "./AbstractDateType.js";
import { FunctionReference } from "./FunctionReference.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DateTimeType extends AbstractDateType {
  override readonly fromRdfResourceValuesFunction = new FunctionReference(
    this.reusables.snippets.dateTimeFromRdfResourceValues,
  );
  override readonly graphqlType = new DateTimeType.GraphqlType(
    code`${this.reusables.imports.GraphQLDateTime}`,
    this.reusables,
  );
  protected override readonly jsonStringFormat = "datetime";
  override readonly hashFunction = new FunctionReference(
    this.reusables.snippets.hashDateTime,
  );
  override readonly kind = "DateTime";

  override valueExpression(literal: Date | Literal): Code {
    return code`new Date("${(literal instanceof Date ? literal : LiteralDecoder.decodeDateTimeLiteral(literal).unsafeCoerce()).toISOString()}")`;
  }
}

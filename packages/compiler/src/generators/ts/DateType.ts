import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { AbstractDateType } from "./AbstractDateType.js";
import { DateTimeType } from "./DateTimeType.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DateType extends AbstractDateType {
  override readonly fromExpandedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.dateFromExpandedJson,
  );
  override readonly fromRdfResourceValuesFunction = new ReferenceCallable(
    this.reusables.snippets.dateFromRdfResourceValues,
  );
  override readonly graphqlType = new DateTimeType.GraphqlType(
    code`${this.reusables.imports.GraphQLDate}`,
    this.reusables,
  );
  override readonly hashFunction = new ReferenceCallable(
    this.reusables.snippets.hashDate,
  );
  override readonly kind = "Date";
  protected override readonly jsonStringFormat = "date";
  override readonly toCompactedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.dateToCompactedJson,
  );
  override readonly toExpandedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.dateToExpandedJson,
  );

  override valueExpression(literal: Date | Literal): Code {
    return code`new Date("${(literal instanceof Date ? literal : LiteralDecoder.decodeDateLiteral(literal).unsafeCoerce()).toISOString()}")`;
  }
}

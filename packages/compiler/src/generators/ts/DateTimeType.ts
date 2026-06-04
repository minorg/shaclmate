import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractDateType } from "./AbstractDateType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DateTimeType extends AbstractDateType {
  override readonly graphqlType = new DateTimeType.GraphqlType(
    code`${this.reusables.imports.GraphQLDateTime}`,
    this.reusables,
  );
  override readonly hashFunction =
    code`${this.reusables.snippets.hashDateTime}`;
  override readonly kind = "DateTime";

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.dateTimeFromRdfResourceValues}<${this.expression}>`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractDateType["jsonSchema"]>[0],
  ): Code {
    return code`${this.reusables.imports.z}.iso.datetime()`;
  }

  override literalValueExpression(literal: Date | Literal): Code {
    return code`new Date("${(literal instanceof Date ? literal : LiteralDecoder.decodeDateTimeLiteral(literal).unsafeCoerce()).toISOString()}")`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDateType["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toISOString()`;
  }
}

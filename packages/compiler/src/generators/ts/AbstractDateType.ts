import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractTypedLiteralType } from "./AbstractTypedLiteralType.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractDateType extends AbstractTypedLiteralType<Date> {
  protected override readonly inlineExpression = code`Date`;
  protected abstract readonly jsonStringFormat: "date" | "datetime";

  /**
   * Date has no conversion function to avoid source type overlap with other types (e.g., string).
   */
  override readonly conversionFunction: Maybe<AbstractTypedLiteralType.ConversionFunction> =
    Maybe.empty();
  override readonly equalsFunction = new ReferenceCallable(
    this.reusables.snippets.dateEquals,
  );
  override readonly filterFunction = new ReferenceCallable(
    this.reusables.snippets.filterDate,
  );
  override readonly filterType = code`${this.reusables.snippets.DateFilter}`;
  override readonly fromCompactedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.dateFromCompactedJson,
  );
  override readonly jsTypes = [
    {
      instanceof: "Date",
      typeof: "object",
    },
  ] as const;
  override readonly schemaType = code`${this.reusables.snippets.DateSchema}`;
  override readonly valueSparqlWherePatternsFunction = new ReferenceCallable(
    this.reusables.snippets.dateSparqlWherePatterns,
  );

  @Memoize()
  override get compactedJsonType(): AbstractTypedLiteralType.JsonType {
    return this.jsonTypeFactory.createJsonStringType({
      format: this.jsonStringFormat,
    });
  }

  override toLoggableExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Date>["toLoggableExpression"]
  >[0]): Code {
    return code`${variables.value}.toISOString()`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Date>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.date(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }

  protected override fromCompactedJsonExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Date>["fromJsonExpression"]
  >[0]): Code {
    return code`new Date(${variables.value})`;
  }

  protected override toCompactedJsonExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Date>["toCompactedJsonExpression"]
  >[0]): Code {
    return this.jsonStringFormat === "datetime"
      ? code`${variables.value}.toISOString()`
      : code`${this.reusables.snippets.toIsoDateString}(${variables.value})`;
  }
}

export namespace AbstractDateType {
  export type ConversionFunction = AbstractTypedLiteralType.ConversionFunction;
}

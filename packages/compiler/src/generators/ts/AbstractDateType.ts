import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractDateType extends AbstractPrimitiveType<Date> {
  protected override readonly inlineExpression = code`Date`;

  override readonly equalsFunction =
    code`${this.reusables.snippets.dateEquals}`;
  override readonly filterFunction =
    code`${this.reusables.snippets.filterDate}`;
  override readonly filterType = code`${this.reusables.snippets.DateFilter}`;
  override readonly jsTypes = [
    {
      instanceof: "Date",
      typeof: "object",
    },
  ] as const;
  abstract override readonly kind: "DateTime" | "Date";
  override readonly mutable = false;
  override readonly schemaType = code`${this.reusables.snippets.DateSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.dateSparqlWherePatterns}`;

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<Date>["fromJsonExpression"]>[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, Date>(new Date(${variables.value}))`;
  }

  @Memoize()
  override jsonType(): AbstractPrimitiveType.JsonType {
    return new AbstractPrimitiveType.JsonType(code`string`);
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<Date>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.date(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }
}

export namespace AbstractDateType {
  export type ConversionFunction = AbstractPrimitiveType.ConversionFunction;
}

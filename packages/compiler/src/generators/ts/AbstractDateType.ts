import { Maybe } from "purify-ts";

import { AbstractTypedLiteralType } from "./AbstractTypedLiteralType.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractDateType extends AbstractTypedLiteralType<Date> {
  protected override readonly inlineExpression = code`Date`;

  override readonly conversionFunction: Maybe<AbstractTypedLiteralType.ConversionFunction> =
    Maybe.empty();
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
  override readonly schemaType = code`${this.reusables.snippets.DateSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.dateSparqlWherePatterns}`;

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Date>["fromJsonExpression"]
  >[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, Date>(new Date(${variables.value}["@value"]))`;
  }

  override jsonType(): AbstractTypedLiteralType.JsonType {
    return new AbstractTypedLiteralType.JsonType(
      code`{ readonly "@type": ${literalOf(this.datatype.value)}, readonly "@value": string }`,
    );
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Date>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.date(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }
}

export namespace AbstractDateType {
  export type ConversionFunction = AbstractTypedLiteralType.ConversionFunction;
}

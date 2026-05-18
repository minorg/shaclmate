import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";

import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractDateType extends AbstractPrimitiveType<Date> {
  override readonly equalsFunction =
    code`${this.reusables.snippets.dateEquals}`;
  override readonly filterFunction =
    code`${this.reusables.snippets.filterDate}`;
  override readonly filterType = code`${this.reusables.snippets.DateFilter}`;
  abstract override readonly kind: "DateTimeType" | "DateType";
  override readonly mutable = false;
  override readonly name = "Date";
  override readonly schemaType = code`${this.reusables.snippets.DateSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.dateSparqlWherePatterns}`;
  override readonly typeofs = ["object" as const];

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

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<Date>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<Date>["fromRdfExpressionChain"]> {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${this.fromRdfResourceValueExpression(
        {
          variables: { value: code`value` },
        },
      )}))`,
    };
  }

  protected abstract fromRdfResourceValueExpression(variables: {
    variables: {
      value: Code;
    };
  }): Code;
}

export namespace AbstractDateType {
  export type ConversionFunction = AbstractPrimitiveType.ConversionFunction;
}

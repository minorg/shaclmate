import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractDateType extends AbstractPrimitiveType<Date> {
  override readonly equalsFunction = code`${snippets.dateEquals}`;
  override readonly filterFunction = code`${snippets.filterDate}`;
  override readonly filterType = code`${snippets.DateFilter}`;
  abstract override readonly kind: "DateTimeType" | "DateType";
  override readonly mutable = false;
  override readonly name = "Date";
  override readonly schemaType = code`${snippets.DateSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${snippets.dateSparqlWherePatterns}`;
  override readonly typeofs = NonEmptyList(["object" as const]);

  @Memoize()
  override get conversions(): readonly AbstractPrimitiveType.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object" && ${value} instanceof Date`,
        sourceTypeName: this.name,
        sourceTypeof: "object",
      },
    ];
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in:
        this.primitiveIn.length > 0
          ? this.primitiveIn.map(
              (inValue) => code`new Date(${literalOf(inValue.toISOString())})`,
            )
          : undefined,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<Date>["fromJsonExpression"]>[0]): Code {
    return code`new Date(${variables.value})`;
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractPrimitiveType<Date>["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`${variables.hasher}.update(${variables.value}.toISOString());`,
    ];
  }

  @Memoize()
  override jsonType(): AbstractPrimitiveType.JsonType {
    return new AbstractPrimitiveType.JsonType(code`string`);
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<Date>["toRdfExpression"]>[0]): Code {
    return code`[${snippets.literalFactory}.date(${variables.value}, ${rdfjsTermExpression(this.datatype)})]`;
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

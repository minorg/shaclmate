import type { NamedNode } from "@rdfjs/types";

import { NonEmptyList } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";

export abstract class AbstractDateType extends AbstractPrimitiveType<Date> {
  protected abstract readonly xsdDatatype: NamedNode;

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
              (inValue) => `new Date("${inValue.toISOString()}")`,
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

  override toJsonExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<Date>["toJsonExpression"]>[0]): Code {
    return this.toIsoStringExpression(variables);
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<Date>["toRdfExpression"]>[0]): Code {
    return code`[${imports.dataFactory}.literal(${this.toIsoStringExpression(variables)}, ${rdfjsTermExpression(this.xsdDatatype)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<Date>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<Date>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = code`value.toDate()`;
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = code`<Error, ${this.name}>`;
      fromRdfResourceValueExpression = code`${fromRdfResourceValueExpression}.chain(primitiveValue => { ${joinCode(
        this.primitiveIn.map(
          (value) =>
            code`if (primitiveValue.getTime() === ${value.getTime()}) { return ${imports.Either}.of${eitherTypeParameters}(primitiveValue); }`,
        ),
        { on: " " },
      )} return ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: code`value.toTerm()`, expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); })`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }

  protected abstract toIsoStringExpression(variables: { value: Code }): Code;
}

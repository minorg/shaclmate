import type { NamedNode } from "@rdfjs/types";

import { NonEmptyList } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export abstract class AbstractDateType extends AbstractPrimitiveType<Date> {
  protected abstract readonly xsdDatatype: NamedNode;

  override readonly equalsFunction = code`${localSnippets.dateEquals}`;
  override readonly filterFunction = code`${localSnippets.filterDate}`;
  override readonly filterType = code`${localSnippets.DateFilter}`;
  abstract override readonly kind: "DateTimeType" | "DateType";
  override readonly mutable = false;
  override readonly name = "Date";
  override readonly schemaType = code`${localSnippets.DateSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${localSnippets.dateSparqlWherePatterns}`;
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
    let fromRdfResourceValueExpression = "value.toDate()";
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => { ${this.primitiveIn.map((value) => `if (primitiveValue.getTime() === ${value.getTime()}) { return ${imports.Either}.of${eitherTypeParameters}(primitiveValue); }`).join(" ")} return ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: "value.toTerm()", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); })`;
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

namespace localSnippets {
  export const dateEquals = conditionalOutput(
    `${syntheticNamePrefix}dateEquals`,
    code`\
/**
 * Compare two Dates and return an ${sharedSnippets.EqualsResult}.
 */
function ${syntheticNamePrefix}dateEquals(left: Date, right: Date): ${sharedSnippets.EqualsResult} {
  return ${sharedSnippets.EqualsResult}.fromBooleanEqualsResult(
    left,
    right,
    left.getTime() === right.getTime(),
  );
}`,
  );

  export const DateFilter = conditionalOutput(
    `${syntheticNamePrefix}DateFilter`,
    code`\
interface ${syntheticNamePrefix}DateFilter {
  readonly in?: readonly Date[];
  readonly maxExclusive?: Date;
  readonly maxInclusive?: Date;
  readonly minExclusive?: Date;
  readonly minInclusive?: Date;
}`,
  );

  export const DateSchema = conditionalOutput(
    `${syntheticNamePrefix}DateSchema`,
    code`\
interface ${syntheticNamePrefix}DateSchema {
  in?: readonly Date[];
  kind: "DateTimeType" | "DateType",
}`,
  );

  export const dateSparqlWherePatterns = conditionalOutput(
    `${syntheticNamePrefix}dateSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}dateSparqlWherePatterns: ${sharedSnippets.SparqlWherePatternsFunction}<${DateFilter}, ${DateSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${sharedSnippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined" && filter.in.length > 0) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "in",
            args: [valueVariable, filter.in.map(inValue => ${sharedSnippets.toLiteral}(inValue))],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.maxExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<",
            args: [valueVariable, ${sharedSnippets.toLiteral}(filter.maxExclusive)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (typeof filter.maxInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [valueVariable, ${sharedSnippets.toLiteral}(filter.maxInclusive)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (typeof filter.minExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">",
            args: [valueVariable, ${sharedSnippets.toLiteral}(filter.minExclusive)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (typeof filter.minInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [valueVariable, ${sharedSnippets.toLiteral}(filter.minInclusive)],
          },
          lift: true,
          type: "filter"
        });
      }
    }

    return ${sharedSnippets.termSchemaSparqlWherePatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
  );

  export const filterDate = conditionalOutput(
    `${syntheticNamePrefix}filterDate`,
    code`\
function ${syntheticNamePrefix}filterDate(filter: ${localSnippets.DateFilter}, value: Date) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.getTime() === value.getTime())) {
    return false;
  }

  if (typeof filter.maxExclusive !== "undefined" && value.getTime() >= filter.maxExclusive.getTime()) {
    return false;
  }

  if (typeof filter.maxInclusive !== "undefined" && value.getTime() > filter.maxInclusive.getTime()) {
    return false;
  }

  if (typeof filter.minExclusive !== "undefined" && value.getTime() <= filter.minExclusive.getTime()) {
    return false;
  }

  if (typeof filter.minInclusive !== "undefined" && value.getTime() < filter.minInclusive.getTime()) {
    return false;
  }

  return true;
}`,
  );
}

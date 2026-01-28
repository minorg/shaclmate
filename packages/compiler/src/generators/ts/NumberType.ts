import type { NamedNode } from "@rdfjs/types";
import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { Sparql } from "./Sparql.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export abstract class NumberType extends AbstractPrimitiveType<number> {
  private readonly datatype: NamedNode;
  override readonly filterFunction = `${syntheticNamePrefix}filterNumber`;
  override readonly filterType = `${syntheticNamePrefix}NumberFilter`;
  readonly kind = "NumberType";
  override readonly typeofs = NonEmptyList(["number" as const]);

  constructor({
    datatype,
    ...superParameters
  }: {
    datatype: NamedNode;
  } & ConstructorParameters<typeof AbstractPrimitiveType<number>>[0]) {
    super(superParameters);
    this.datatype = datatype;
  }

  @Memoize()
  override get conversions(): readonly AbstractPrimitiveType.Conversion[] {
    const conversions: AbstractPrimitiveType.Conversion[] = [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "number"`,
        sourceTypeName: this.name,
      },
    ];
    this.primitiveDefaultValue.ifJust((defaultValue) => {
      conversions.push({
        conversionExpression: () => defaultValue.toString(),
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    });
    return conversions;
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return this.primitiveIn.map((value) => value.toString()).join(" | ");
    }
    return "number";
  }

  @Memoize()
  override get schema(): string {
    return "{}";
  }

  protected override filterSparqlWherePatterns({
    variables,
  }: Parameters<
    AbstractPrimitiveType<number>["filterSparqlWherePatterns"]
  >[0]): readonly Sparql.Pattern[] {
    return [
      {
        patterns: `${syntheticNamePrefix}NumberFilter.${syntheticNamePrefix}sparqlWherePatterns(${variables.filter}, ${variables.valueVariable})`,
        type: "opaque-block" as const,
      },
    ];
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractPrimitiveType<number>["jsonZodSchema"]>[0]): ReturnType<
    AbstractPrimitiveType<number>["jsonZodSchema"]
  > {
    switch (this.primitiveIn.length) {
      case 0:
        return `${variables.zod}.number()`;
      case 1:
        return `${variables.zod}.literal(${this.primitiveIn[0]})`;
      default:
        return `${variables.zod}.union([${this.primitiveIn.map((value) => `${variables.zod}.literal(${value})`).join(", ")}])`;
    }
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<number>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<number>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = "value.toNumber()";
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => { switch (primitiveValue) { ${this.primitiveIn.map((value) => `case ${value}:`).join(" ")} return purify.Either.of${eitherTypeParameters}(primitiveValue); default: return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedTermValueError(${objectInitializer({ actualValue: "value.toTerm()", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); } })`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: `chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }

  override snippetDeclarations(
    parameters: Parameters<
      AbstractPrimitiveType<number>["snippetDeclarations"]
    >[0],
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
      singleEntryRecord(
        `${syntheticNamePrefix}NumberFilter`,
        `\
interface ${syntheticNamePrefix}NumberFilter {
  readonly in?: readonly number[];
  readonly maxExclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly minInclusive?: number;
}`,
      ),
      singleEntryRecord(
        `${syntheticNamePrefix}filterNumber`,
        `\
function ${syntheticNamePrefix}filterNumber(filter: ${syntheticNamePrefix}NumberFilter, value: number) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (typeof filter.maxExclusive !== "undefined" && value >= filter.maxExclusive) {
    return false;
  }

  if (typeof filter.maxInclusive !== "undefined" && value > filter.maxInclusive) {
    return false;
  }

  if (typeof filter.minExclusive !== "undefined" && value <= filter.minExclusive) {
    return false;
  }

  if (typeof filter.minInclusive !== "undefined" && value < filter.minInclusive) {
    return false;
  }

  return true;
}`,
      ),
      parameters.features.has("sparql")
        ? {
            ...sharedSnippetDeclarations.toLiteral,
            ...singleEntryRecord(
              `${syntheticNamePrefix}NumberFilter.${syntheticNamePrefix}sparqlWherePatterns`,
              `\
namespace ${syntheticNamePrefix}NumberFilter {
  export function ${syntheticNamePrefix}sparqlWherePatterns(filter: ${syntheticNamePrefix}NumberFilter | undefined, value: rdfjs.Variable): readonly sparqljs.FilterPattern[] {
    const patterns: sparqljs.FilterPattern[] = [];

    if (!filter) {
      return patterns;
    }

    if (typeof filter.in !== "undefined") {
      patterns.push({
        type: "filter",
        expression: {
          type: "operation",
          operator: "in",
          args: [value, filter.in.map(inValue => ${syntheticNamePrefix}toLiteral(inValue))],
        }
      });
    }

    if (typeof filter.maxExclusive !== "undefined") {
      patterns.push({
        type: "filter",
        expression: {
          type: "operation",
          operator: "<",
          args: [value, ${syntheticNamePrefix}toLiteral(filter.maxExclusive)],
        }
      });
    }

    if (typeof filter.maxInclusive !== "undefined") {
      patterns.push({
        type: "filter",
        expression: {
          type: "operation",
          operator: "<=",
          args: [value, ${syntheticNamePrefix}toLiteral(filter.maxInclusive)],
        }
      });
    }

    if (typeof filter.minExclusive !== "undefined") {
      patterns.push({
        type: "filter",
        expression: {
          type: "operation",
          operator: ">",
          args: [value, ${syntheticNamePrefix}toLiteral(filter.minExclusive)],
        }
      });
    }

    if (typeof filter.minInclusive !== "undefined") {
      patterns.push({
        type: "filter",
        expression: {
          type: "operation",
          operator: ">=",
          args: [value, ${syntheticNamePrefix}toLiteral(filter.minInclusive)],
        }
      });
    }

    return patterns;
  }
}`,
            ),
          }
        : {},
    );
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): string {
    const valueToRdf = `dataFactory.literal(${variables.value}.toString(10), ${rdfjsTermExpression(this.datatype)})`;
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `(${variables.value} !== ${defaultValue} ? [${valueToRdf}] : [])`,
      )
      .orDefault(`[${valueToRdf}]`);
  }
}

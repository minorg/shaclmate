import type { NamedNode } from "@rdfjs/types";
import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export abstract class AbstractNumberType extends AbstractPrimitiveType<number> {
  private readonly datatype: NamedNode;
  override readonly filterFunction = `${syntheticNamePrefix}filterNumber`;
  override readonly filterType = `${syntheticNamePrefix}NumberFilter`;
  abstract override readonly kind: "FloatType" | "IntType";
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

  @Memoize()
  override get schemaType(): string {
    return `${syntheticNamePrefix}NumberSchema`;
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
  ): Readonly<Record<string, SnippetDeclaration>> {
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
              `${syntheticNamePrefix}numberSparqlWherePatterns`,
              {
                code: `\
const ${syntheticNamePrefix}numberSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${this.filterType}, ${this.schemaType}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${syntheticNamePrefix}SparqlWhereFilterPattern[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined") {
        filterPatterns.push(${syntheticNamePrefix}sparqlValueInPattern({ lift: true, valueVariable, valueIn: filter.in }));
      }

      if (typeof filter.maxExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<",
            args: [valueVariable, ${syntheticNamePrefix}toLiteral(filter.maxExclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.maxInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [valueVariable, ${syntheticNamePrefix}toLiteral(filter.maxInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.minExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">",
            args: [valueVariable, ${syntheticNamePrefix}toLiteral(filter.minExclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.minInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [valueVariable, ${syntheticNamePrefix}toLiteral(filter.minInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${syntheticNamePrefix}termLikeSparqlWherePatterns({ filterPatterns, valueVariable, ...otherParameters });
  }`,
                dependencies: {
                  ...sharedSnippetDeclarations.sparqlValueInPattern,
                  ...sharedSnippetDeclarations.termLikeSparqlWherePatterns,
                  ...sharedSnippetDeclarations.toLiteral,
                  ...sharedSnippetDeclarations.SparqlWherePatternTypes,
                },
              },
            ),
          }
        : {},
    );
  }

  protected override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      kind: '"FloatType" | "IntType"',
    };
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

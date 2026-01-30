import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class StringType extends AbstractPrimitiveType<string> {
  override readonly filterFunction = `${syntheticNamePrefix}filterString`;
  override readonly filterType = `${syntheticNamePrefix}StringFilter`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    "graphql.GraphQLString",
  );
  readonly kind = "StringType";
  override readonly typeofs = NonEmptyList(["string" as const]);

  @Memoize()
  override get conversions(): readonly AbstractPrimitiveType.Conversion[] {
    const conversions: AbstractPrimitiveType.Conversion[] = [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "string"`,
        sourceTypeName: this.name,
      },
    ];
    this.primitiveDefaultValue.ifJust((defaultValue) => {
      conversions.push({
        conversionExpression: () => `"${defaultValue}"`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    });
    return conversions;
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return this.primitiveIn.map((value) => `"${value}"`).join(" | ");
    }
    return "string";
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["hashStatements"]
  >[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value});`];
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["jsonZodSchema"]>[0]): ReturnType<
    AbstractPrimitiveType<string>["jsonZodSchema"]
  > {
    switch (this.primitiveIn.length) {
      case 0:
        return `${variables.zod}.string()`;
      case 1:
        return `${variables.zod}.literal(${this.primitiveIn[0]})`;
      default:
        return `${variables.zod}.enum(${JSON.stringify(this.primitiveIn)})`;
    }
  }

  override snippetDeclarations(
    parameters: Parameters<
      AbstractPrimitiveType<string>["snippetDeclarations"]
    >[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      !this.constrained
        ? singleEntryRecord(
            `${syntheticNamePrefix}stringTypeSchema`,
            `const ${syntheticNamePrefix}stringTypeSchema = ${objectInitializer(this.schemaObject)};`,
          )
        : {},

      singleEntryRecord(
        `${syntheticNamePrefix}StringFilter`,
        `\
interface ${syntheticNamePrefix}StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}`,
      ),

      singleEntryRecord(
        `${syntheticNamePrefix}filterString`,
        `\
function ${syntheticNamePrefix}filterString(filter: ${syntheticNamePrefix}StringFilter, value: string) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (typeof filter.maxLength !== "undefined" && value.length > filter.maxLength) {
    return false;
  }

  if (typeof filter.minLength !== "undefined" && value.length < filter.minLength) {
    return false;
  }

  return true;
}`,
      ),

      parameters.features.has("sparql")
        ? singleEntryRecord(
            `${syntheticNamePrefix}StringFilter.sparqlWherePatterns`,
            {
              code: `\
const ${syntheticNamePrefix}stringSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${syntheticNamePrefix}StringFilter> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${syntheticNamePrefix}SparqlWhereFilterPattern[] = [];

    if (typeof filter.in !== "undefined") {
      filterPatterns.push(${syntheticNamePrefix}sparqlValueInPattern(valueVariable, filter.in);
    }

    if (typeof filter.maxLength !== "undefined") {
      filterPatterns.push({
        expression: {
          type: "operation",
          operator: "<=",
          args: [{ args: [valueVariable], operator: "strlen", type: "operation" }, ${syntheticNamePrefix}toLiteral(filter.maxLength)],
        },
        lift: true,
        type: "filter",
      });
    }

    if (typeof filter.minLength !== "undefined") {
      filterPatterns.push({
        expression: {
          type: "operation",
          operator: ">=",
          args: [{ args: [valueVariable], operator: "strlen", type: "operation" }, ${syntheticNamePrefix}toLiteral(filter.minLength)],
        },
        lift: true,
        type: "filter",
      });
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
          )
        : {},
    );
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): string {
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `(${variables.value} !== "${defaultValue}" ? [${variables.value}] : [])`,
      )
      .orDefault(`[${variables.value}]`);
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<string>["fromRdfExpressionChain"]> {
    const inChain =
      this.primitiveIn.length > 0
        ? `.chain(string_ => { switch (string_) { ${this.primitiveIn.map((value) => `case "${value}":`).join(" ")} return purify.Either.of<Error, ${this.name}>(string_); default: return purify.Left<Error, ${this.name}>(new rdfjsResource.Resource.MistypedTermValueError(${objectInitializer({ actualValue: "value.toTerm()", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); } })`
        : "";

    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: `chain(values => values.chainMap(value => value.toString()${inChain}))`,
    };
  }
}

import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class BooleanType extends AbstractPrimitiveType<boolean> {
  override readonly filterFunction = `${syntheticNamePrefix}filterBoolean`;
  override readonly filterType = `${syntheticNamePrefix}BooleanFilter`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    "graphql.GraphQLBoolean",
  );
  readonly kind = "BooleanType";
  override readonly typeofs = NonEmptyList(["boolean" as const]);

  @Memoize()
  override get conversions(): readonly AbstractPrimitiveType.Conversion[] {
    const conversions: AbstractPrimitiveType.Conversion[] = [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "boolean"`,
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
    return "boolean";
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      defaultValue: this.primitiveDefaultValue.extract(),
      in: this.primitiveIn.length > 0 ? this.primitiveIn.concat() : undefined,
    };
  }

  protected override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "defaultValue?": "boolean",
      "in?": `readonly boolean[]`,
    };
  }

  override jsonZodSchema({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["jsonZodSchema"]
  >[0]): ReturnType<AbstractPrimitiveType<boolean>["jsonZodSchema"]> {
    if (this.primitiveIn.length === 1) {
      return `${variables.zod}.literal(${this.primitiveIn[0]})`;
    }
    return `${variables.zod}.boolean()`;
  }

  override snippetDeclarations(
    parameters: Parameters<
      AbstractPrimitiveType<boolean>["snippetDeclarations"]
    >[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      singleEntryRecord(
        `${syntheticNamePrefix}BooleanFilter`,
        `\
interface ${syntheticNamePrefix}BooleanFilter {
  readonly value?: boolean;
}`,
      ),
      singleEntryRecord(
        `${syntheticNamePrefix}filterBoolean`,
        `\
function ${syntheticNamePrefix}filterBoolean(filter: ${syntheticNamePrefix}BooleanFilter, value: boolean) {
  if (typeof filter.value !== "undefined" && value !== filter.value) {
    return false;
  }

  return true;
}`,
      ),

      parameters.features.has("sparql")
        ? singleEntryRecord(
            `${syntheticNamePrefix}booleanSparqlWherePatterns`,
            {
              code: `\
const ${syntheticNamePrefix}booleanSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${this.filterType}, ${this.schemaType}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${syntheticNamePrefix}SparqlFilterPattern[] = [];

    if (filter) {
      if (typeof filter.value !== "undefined") {
        filterPatterns.push(${syntheticNamePrefix}sparqlValueInPattern({ lift: true, valueVariable, valueIn: [filter.value] }));
      }
    }

    return ${syntheticNamePrefix}termLikeSparqlWherePatterns({ filterPatterns, valueVariable, ...otherParameters });
  }`,
              dependencies: {
                ...sharedSnippetDeclarations.sparqlValueInPattern,
                ...sharedSnippetDeclarations.SparqlWherePatternsFunction,
              },
            },
          )
        : {},
    );
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<boolean>["toRdfExpression"]>[0]): string {
    return this.primitiveDefaultValue
      .map((defaultValue) => {
        if (defaultValue) {
          // If the default is true, only serialize the value if it's false
          return `(!${variables.value} ? [false] : [])`;
        }
        // If the default is false, only serialize the value if it's true
        return `(${variables.value} ? [true] : [])`;
      })
      .orDefault(`[${variables.value}]`);
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = "value.toBoolean()";
    if (this.primitiveIn.length === 1) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => primitiveValue === ${this.primitiveIn[0]} ? purify.Either.of${eitherTypeParameters}(primitiveValue) : purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedTermValueError(${objectInitializer({ actualValue: "value.toTerm()", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})))`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: `chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }
}

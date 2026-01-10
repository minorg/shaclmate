import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { TermType } from "./TermType.js";
import { Type } from "./Type.js";

export class BooleanType extends AbstractPrimitiveType<boolean> {
  readonly kind = "BooleanType";
  override readonly filterFunction = `${syntheticNamePrefix}filterBoolean`;
  override readonly filterType = new Type.CompositeFilterTypeReference(
    `${syntheticNamePrefix}BooleanFilter`,
  );
  override readonly graphqlType = new Type.GraphqlType(
    "graphql.GraphQLBoolean",
  );
  override readonly typeofs = NonEmptyList(["boolean" as const]);

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [
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

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    if (this.primitiveIn.length === 1) {
      return `${variables.zod}.literal(${this.primitiveIn[0]})`;
    }
    return `${variables.zod}.boolean()`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<TermType["fromRdfExpressionChain"]>[0]): ReturnType<
    TermType["fromRdfExpressionChain"]
  > {
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

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
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
    );
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): string {
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
}

import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { Type } from "./Type.js";

export class StringType extends AbstractPrimitiveType<string> {
  readonly kind = "StringType";
  override readonly filterFunction = `${syntheticNamePrefix}filterString`;
  override readonly filterType = new Type.CompositeFilterTypeReference(
    `${syntheticNamePrefix}StringFilter`,
  );
  override readonly graphqlType = new Type.GraphqlType("graphql.GraphQLString");
  override readonly typeofs = NonEmptyList(["string" as const]);

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [
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

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value});`];
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
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
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
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
    );
  }

  override sparqlWherePatterns(
    parameters: Parameters<
      AbstractPrimitiveType<string>["sparqlWherePatterns"]
    >[0],
  ): readonly string[] {
    return super.sparqlWherePatterns({
      ...parameters,
      ignoreLiteralLanguage: false,
    });
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
}

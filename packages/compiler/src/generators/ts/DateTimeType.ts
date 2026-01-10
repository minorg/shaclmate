import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import type { TsFeature } from "enums/TsFeature.js";
import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { TermType } from "./TermType.js";
import { Type } from "./Type.js";

export class DateTimeType extends AbstractPrimitiveType<Date> {
  protected readonly xsdDatatype: NamedNode = xsd.dateTime;
  override readonly equalsFunction = `${syntheticNamePrefix}dateEquals`;
  override readonly filterFunction = `${syntheticNamePrefix}filterDate`;
  override readonly filterType = new Type.CompositeFilterTypeReference(
    `${syntheticNamePrefix}DateFilter`,
  );
  override readonly graphqlType = new Type.GraphqlType(
    "graphqlScalars.DateTime",
  );
  readonly kind: "DateTimeType" | "DateType" = "DateTimeType";
  override readonly mutable = true;
  override readonly typeofs = NonEmptyList(["object" as const]);

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          `typeof ${value} === "object" && ${value} instanceof Date`,
        sourceTypeName: this.name,
      },
    ];

    this.primitiveDefaultValue.ifJust((defaultValue) => {
      conversions.push({
        conversionExpression: () => `new Date("${defaultValue.toISOString()}")`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    });

    return conversions;
  }

  @Memoize()
  override jsonType(): Type.JsonType {
    return new Type.JsonType("string");
  }

  override get name(): string {
    return "Date";
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    return `new Date(${variables.value})`;
  }

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.toISOString());`];
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    return `${variables.zod}.iso.datetime()`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<TermType["fromRdfExpressionChain"]>[0]): ReturnType<
    TermType["fromRdfExpressionChain"]
  > {
    let fromRdfResourceValueExpression = "value.toDate()";
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => { ${this.primitiveIn.map((value) => `if (primitiveValue.getTime() === ${value.getTime()}) { return purify.Either.of${eitherTypeParameters}(primitiveValue); }`).join(" ")} return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedTermValueError(${objectInitializer({ actualValue: "value.toTerm()", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); })`;
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
      AbstractPrimitiveType<Date>["snippetDeclarations"]
    >[0],
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      parameters.features.has("equals")
        ? singleEntryRecord(
            `${syntheticNamePrefix}dateEquals`,
            `\
/**
 * Compare two Dates and return an ${syntheticNamePrefix}EqualsResult.
 */
function ${syntheticNamePrefix}dateEquals(left: Date, right: Date): ${syntheticNamePrefix}EqualsResult {
  return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(
    left,
    right,
    left.getTime() === right.getTime(),
  );
}`,
          )
        : {},

      singleEntryRecord(
        `${syntheticNamePrefix}DateFilter`,
        `\
interface ${syntheticNamePrefix}DateFilter {
  readonly maxExclusive?: Date;
  readonly maxInclusive?: Date;
  readonly minExclusive?: Date;
  readonly minInclusive?: Date;
  readonly value?: Date;
}`,
      ),

      singleEntryRecord(
        `${syntheticNamePrefix}filterDate`,
        `\
function ${syntheticNamePrefix}filterDate(filter: ${syntheticNamePrefix}DateFilter, value: Date) {
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

  if (typeof filter.value !== "undefined" && value.getTime() !== filter.value.getTime()) {
    return false;
  }

  return true;
}`,
      ),
    );
  }

  protected toIsoStringExpression(variables: { value: string }) {
    return `${variables.value}.toISOString()`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<Date>["toJsonExpression"]>[0]): string {
    return this.toIsoStringExpression(variables);
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<Date>["toRdfExpression"]>[0]): string {
    const valueToRdf = `dataFactory.literal(${this.toIsoStringExpression(variables)}, ${rdfjsTermExpression(this.xsdDatatype)})`;
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `(${variables.value}.getTime() !== ${defaultValue.getTime()} ? [${valueToRdf}] : [])`,
      )
      .orDefault(`[${valueToRdf}]`);
  }

  override useImports({
    features,
  }: {
    features: ReadonlySet<TsFeature>;
  }): readonly Import[] {
    const imports = super.useImports({ features }).concat();
    if (features.has("graphql")) {
      imports.push(Import.GRAPHQL_SCALARS);
    }
    return imports;
  }
}

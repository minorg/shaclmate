import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import type { TsFeature } from "enums/TsFeature.js";
import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import type { AbstractType } from "./AbstractType.js";
import { Import } from "./Import.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { TermType } from "./TermType.js";
import { Type } from "./Type.js";

export class DateTimeType extends AbstractPrimitiveType<Date> {
  protected readonly xsdDatatype: NamedNode = xsd.dateTime;

  override readonly equalsFunction = `${syntheticNamePrefix}dateEquals`;
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
  override get graphqlName(): Type.GraphqlName {
    return new Type.GraphqlName("graphqlScalars.DateTime");
  }

  @Memoize()
  override jsonName(): Type.JsonName {
    return new Type.JsonName("string");
  }

  override get name(): string {
    return "Date";
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): string {
    return `new Date(${variables.value})`;
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.toISOString());`];
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractType["jsonZodSchema"]>[0]): ReturnType<
    AbstractType["jsonZodSchema"]
  > {
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

  override snippetDeclarations({
    features,
  }: Parameters<
    AbstractPrimitiveType<Date>["snippetDeclarations"]
  >[0]): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.dateEquals);
    }
    return snippetDeclarations;
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

import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Memoize } from "typescript-memoize";
import { PrimitiveType } from "./PrimitiveType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import type { TermType } from "./TermType.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class DateTimeType extends PrimitiveType<Date> {
  protected readonly xsdDatatype: NamedNode = xsd.dateTime;
  protected readonly zodDatatype: string = "datetime";

  override readonly equalsFunction = `${syntheticNamePrefix}dateEquals`;
  readonly kind: "DateTimeType" | "DateType" = "DateTimeType";
  override readonly mutable = true;
  override readonly typeof = "object";

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
  override get jsonName(): Type.JsonName {
    return new Type.JsonName("string");
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
    return `${variables.zod}.string().${this.zodDatatype}()`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<TermType["fromRdfExpressionChain"]>[0]): ReturnType<
    TermType["fromRdfExpressionChain"]
  > {
    let fromRdfResourceValueExpression = "value.toDate()";
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(value => { ${this.primitiveIn.map((value) => `if (value.getTime() === ${value.getTime()}) { return purify.Either.of${eitherTypeParameters}(value); }`).join(" ")} return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedValueError(${objectInitializer({ actualValue: `rdfLiteral.toRdf(value, ${objectInitializer({ dataFactory: "dataFactory", datatype: rdfjsTermExpression(this.xsdDatatype) })})`, expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); })`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      valueTo: `chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }

  override snippetDeclarations({
    features,
  }: Parameters<
    PrimitiveType<Date>["snippetDeclarations"]
  >[0]): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.dateEquals);
    }
    return snippetDeclarations;
  }

  override toJsonExpression({
    variables,
  }: Parameters<PrimitiveType<Date>["toJsonExpression"]>[0]): string {
    return `${variables.value}.toISOString()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<PrimitiveType<Date>["toRdfExpression"]>[0]): string {
    const valueToRdf = `rdfLiteral.toRdf(${variables.value}, ${objectInitializer({ dataFactory: "dataFactory", datatype: rdfjsTermExpression(this.xsdDatatype) })})`;
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `${variables.value}.getTime() !== ${defaultValue.getTime()} ? ${valueToRdf} : undefined`,
      )
      .orDefault(valueToRdf);
  }
}

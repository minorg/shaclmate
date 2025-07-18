import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import type { TsFeature } from "../../enums/index.js";
import { PrimitiveType } from "./PrimitiveType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import type { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

export class DateTimeType extends PrimitiveType<Date> {
  protected readonly xsdDatatype: NamedNode = xsd.dateTime;
  protected readonly zodDatatype: string = "datetime";

  override readonly equalsFunction = "$dateEquals";
  readonly kind: "DateTimeType" | "DateType" = "DateTimeType";
  override readonly mutable = true;
  override readonly typeof = "object";

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

  override get jsonName(): string {
    return "string";
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

  override propertyFromRdfResourceValueExpression({
    variables,
  }: Parameters<
    PrimitiveType<number>["propertyFromRdfResourceValueExpression"]
  >[0]): string {
    let expression = `${variables.resourceValue}.toDate()`;
    if (this.primitiveIn.length > 0) {
      expression = `${expression}.chain(value => { ${this.primitiveIn.map((value) => `if (value.getTime() === ${value.getTime()}) { return purify.Either.of(value); }`).join(" ")} return purify.Left(new rdfjsResource.Resource.MistypedValueError(${objectInitializer({ actualValue: `rdfLiteral.toRdf(value, ${objectInitializer({ dataFactory: this.dataFactoryVariable, datatype: this.rdfjsTermExpression(this.xsdDatatype) })})`, expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); })`;
    }
    return expression;
  }

  override snippetDeclarations(features: Set<TsFeature>): readonly string[] {
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
    const valueToRdf = `rdfLiteral.toRdf(${variables.value}, ${objectInitializer({ dataFactory: this.dataFactoryVariable, datatype: this.rdfjsTermExpression(this.xsdDatatype) })})`;
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `${variables.value}.getTime() !== ${defaultValue.getTime()} ? ${valueToRdf} : undefined`,
      )
      .orDefault(valueToRdf);
  }
}

import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Memoize } from "typescript-memoize";
import type { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import type { AbstractType } from "./AbstractType.js";
import { DateTimeType } from "./DateTimeType.js";
import { Type } from "./Type.js";

export class DateType extends DateTimeType {
  protected override readonly xsdDatatype: NamedNode = xsd.date;

  override readonly kind = "DateType";

  @Memoize()
  override get graphqlName(): Type.GraphqlName {
    return new Type.GraphqlName("graphqlScalars.Date");
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractType["jsonZodSchema"]>[0]): ReturnType<
    AbstractType["jsonZodSchema"]
  > {
    return `${variables.zod}.iso.date()`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<Date>["toJsonExpression"]>[0]): string {
    return `${variables.value}.toISOString().replace(/T.*$/, '')`;
  }
}

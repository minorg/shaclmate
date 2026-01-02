import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Memoize } from "typescript-memoize";
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
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    return `${variables.zod}.iso.date()`;
  }

  protected override toIsoStringExpression(variables: { value: string }) {
    return `${variables.value}.toISOString().replace(/T.*$/, '')`;
  }
}

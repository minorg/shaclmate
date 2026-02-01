import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { AbstractDateType } from "./AbstractDateType.js";
import { DateTimeType } from "./DateTimeType.js";

export class DateType extends AbstractDateType {
  protected override readonly xsdDatatype: NamedNode = xsd.date;

  override readonly graphqlType = new DateTimeType.GraphqlType(
    "graphqlScalars.Date",
  );
  override readonly kind = "DateType";

  override jsonZodSchema({
    variables,
  }: Parameters<DateTimeType["jsonZodSchema"]>[0]): ReturnType<
    DateTimeType["jsonZodSchema"]
  > {
    return `${variables.zod}.iso.date()`;
  }

  protected override toIsoStringExpression(variables: { value: string }) {
    return `${variables.value}.toISOString().replace(/T.*$/, '')`;
  }
}

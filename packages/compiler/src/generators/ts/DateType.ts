import { xsd } from "@tpluscode/rdf-ns-builders";

import { DateTimeType } from "./DateTimeType.js";
import type { PrimitiveType } from "./PrimitiveType.js";

export class DateType extends DateTimeType {
  protected override readonly xsdDatatype = xsd.date;
  protected override readonly zodDatatype = "date";

  override readonly kind = "DateType";

  override toJsonExpression({
    variables,
  }: Parameters<PrimitiveType<Date>["toJsonExpression"]>[0]): string {
    return `${variables.value}.toISOString().replace(/T.*$/, '')`;
  }
}

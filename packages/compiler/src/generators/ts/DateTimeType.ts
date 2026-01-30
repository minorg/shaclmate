import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { AbstractDateType } from "./AbstractDateType.js";

export class DateTimeType extends AbstractDateType {
  protected readonly xsdDatatype: NamedNode = xsd.dateTime;

  override readonly graphqlType = new AbstractDateType.GraphqlType(
    "graphqlScalars.DateTime",
  );
  override readonly kind = "DateTimeType";

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractDateType["jsonZodSchema"]>[0]): ReturnType<
    AbstractDateType["jsonZodSchema"]
  > {
    return `${variables.zod}.iso.datetime()`;
  }

  protected toIsoStringExpression(variables: { value: string }) {
    return `${variables.value}.toISOString()`;
  }
}

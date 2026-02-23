import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { AbstractDateType } from "./AbstractDateType.js";
import { DateTimeType } from "./DateTimeType.js";
import { imports } from "./imports.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class DateType extends AbstractDateType {
  protected override readonly xsdDatatype: NamedNode = xsd.date;

  override readonly graphqlType = new DateTimeType.GraphqlType(
    code`${imports.GraphQLDate}`,
  );
  override readonly kind = "DateType";

  override jsonZodSchema(
    _parameters: Parameters<DateTimeType["jsonZodSchema"]>[0],
  ): Code {
    return code`${imports.z}.iso.date()`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDateType["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toISOString().replace(/T.*$/, '')`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<AbstractDateType["fromRdfResourceValueExpression"]>[0]): Code {
    return code`${variables.value}.toDate()`;
  }
}

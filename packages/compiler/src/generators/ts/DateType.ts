import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { type Code, code } from "ts-poet";
import { AbstractDateType } from "./AbstractDateType.js";
import { DateTimeType } from "./DateTimeType.js";
import { sharedImports } from "./sharedImports.js";

export class DateType extends AbstractDateType {
  protected override readonly xsdDatatype: NamedNode = xsd.date;

  override readonly graphqlType = new DateTimeType.GraphqlType(
    code`${sharedImports.GraphQLDate}`,
  );
  override readonly kind = "DateType";

  override jsonZodSchema({
    variables,
  }: Parameters<DateTimeType["jsonZodSchema"]>[0]): Code {
    return code`${variables.zod}.iso.date()`;
  }

  protected override toIsoStringExpression(variables: { value: Code }): Code {
    return code`${variables.value}.toISOString().replace(/T.*$/, '')`;
  }
}

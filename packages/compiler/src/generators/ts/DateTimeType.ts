import type { NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { type Code, code } from "ts-poet";

import { AbstractDateType } from "./AbstractDateType.js";
import { sharedImports } from "./sharedImports.js";

export class DateTimeType extends AbstractDateType {
  protected readonly xsdDatatype: NamedNode = xsd.dateTime;

  override readonly graphqlType = new AbstractDateType.GraphqlType(
    code`${sharedImports.GraphQLDateTime}`,
  );
  override readonly kind = "DateTimeType";

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractDateType["jsonZodSchema"]>[0]): Code {
    return code`${variables.zod}.iso.datetime()`;
  }

  protected toIsoStringExpression(variables: { value: Code }): Code {
    return code`${variables.value}.toISOString()`;
  }
}

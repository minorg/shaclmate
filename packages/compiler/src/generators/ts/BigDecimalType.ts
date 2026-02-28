import { type Code, code } from "ts-poet";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import type { AbstractType } from "./AbstractType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";

export class BigDecimalType extends AbstractLiteralType {
  override readonly filterFunction = code`${snippets.filterBigDecimal}`;
  override readonly filterType =
    code`${snippets.NumericFilter}<${imports.BigDecimal}>`;
  override readonly graphqlType = new AbstractLiteralType.GraphqlType(
    code`${imports.GraphQLString}`,
  );
  override readonly kind = "BigDecimalType";
  override readonly name = code`${imports.BigDecimal}`;
  override readonly schemaType =
    code`${snippets.NumericSchema}<${imports.BigDecimal}>`;
  override readonly sparqlWherePatternsFunction =
    code`${snippets.bigDecimalSparqlWherePatterns}`;

  override fromJsonExpression(parameters: {
    variables: { value: Code };
  }): Code {
    throw new Error("Method not implemented.");
  }

  override jsonType(
    parameters?: { includeDiscriminantProperty?: boolean } | undefined,
  ): AbstractType.JsonType {
    throw new Error("Method not implemented.");
  }

  override jsonZodSchema(parameters: {
    includeDiscriminantProperty?: boolean;
    context: "property" | "type";
  }): Code {
    throw new Error("Method not implemented.");
  }

  override toJsonExpression(parameters: {
    includeDiscriminantProperty?: boolean;
    variables: { value: Code };
  }): Code {
    throw new Error("Method not implemented.");
  }
}

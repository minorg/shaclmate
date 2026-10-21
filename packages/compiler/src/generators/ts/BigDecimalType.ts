import type { Literal } from "@rdfjs/types";

import type { Decimal } from "decimal.js";
import { Maybe } from "purify-ts";

import { AbstractTypedLiteralType } from "./AbstractTypedLiteralType.js";
import { FunctionReference } from "./FunctionReference.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class BigDecimalType extends AbstractTypedLiteralType<Decimal> {
  protected override readonly compactJsonType: AbstractTypedLiteralType.JsonType =
    this.jsonTypeFactory.createJsonStringType();
  protected override readonly inlineExpression =
    code`${this.reusables.imports.BigDecimal}`;

  override readonly jsTypes = [
    {
      className: code`${this.reusables.imports.BigDecimal}`,
      instanceof: "class",
      typeof: "object",
    },
  ] as const;
  override readonly conversionFunction: Maybe<AbstractTypedLiteralType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToBigDecimal}`,
      sourceTypes: [
        {
          expression: code`${this.reusables.imports.BigDecimal}`,
          jsType: this.jsTypes[0],
        },
        {
          expression: code`number`,
          jsType: { typeof: "number" },
        },
        {
          expression: code`string`,
          jsType: { typeof: "string" },
        },
      ],
    });
  override readonly filterFunction = new FunctionReference(
    this.reusables.snippets.filterBigDecimal,
  );
  override readonly filterType =
    code`${this.reusables.snippets.NumericFilter}<${this.reusables.imports.BigDecimal}>`;
  override readonly fromRdfResourceValuesFunction = new FunctionReference(
    this.reusables.snippets.bigDecimalFromRdfResourceValues,
  );
  override readonly graphqlType = new AbstractTypedLiteralType.GraphqlType(
    code`${this.reusables.imports.GraphQLString}`,
    this.reusables,
  );
  override readonly hashFunction = new FunctionReference(
    this.reusables.snippets.hashBigDecimal,
  );
  override readonly kind = "BigDecimal";
  override readonly schemaType =
    code`${this.reusables.snippets.NumericSchema}<${this.reusables.imports.BigDecimal}>`;
  override readonly valueSparqlWherePatternsFunction = new FunctionReference(
    this.reusables.snippets.bigDecimalSparqlWherePatterns,
  );

  override graphqlResolveExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Decimal>["graphqlResolveExpression"]
  >[0]): Code {
    return code`${variables.value}.toFixed()`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Decimal>["toLoggableExpression"]
  >[0]): Code {
    return code`${variables.value}.toFixed()`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Decimal>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.bigDecimalLiteral}(${variables.value})]`;
  }

  override valueExpression(literal: Literal): Code {
    return code`new ${this.reusables.imports.BigDecimal}(${literalOf(literal.value)})`;
  }

  protected override fromCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Decimal>["fromCompactJsonExpression"]
  >[0]): Code {
    return code`new ${this.expression}(${variables.value})`;
  }

  protected override toCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Decimal>["toCompactJsonExpression"]
  >[0]): Code {
    return code`${variables.value}.toFixed()`;
  }
}

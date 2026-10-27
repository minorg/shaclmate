import type { Literal } from "@rdfjs/types";

import type { Decimal } from "decimal.js";
import { Maybe } from "purify-ts";

import { AbstractTypedLiteralType } from "./AbstractTypedLiteralType.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class BigDecimalType extends AbstractTypedLiteralType<Decimal> {
  protected override readonly inlineExpression =
    code`${this.reusables.imports.BigDecimal}`;

  override readonly compactedJsonType: AbstractTypedLiteralType.JsonType =
    this.jsonTypeFactory.createJsonStringType();
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
  override readonly filterFunction = new ReferenceCallable(
    this.reusables.snippets.filterBigDecimal,
  );
  override readonly filterType =
    code`${this.reusables.snippets.NumericFilter}<${this.reusables.imports.BigDecimal}>`;
  override readonly fromCompactedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.bigDecimalFromCompactedJson,
  );
  override readonly fromExpandedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.bigDecimalFromExpandedJson,
  );
  override readonly fromRdfResourceValuesFunction = new ReferenceCallable(
    this.reusables.snippets.bigDecimalFromRdfResourceValues,
  );
  override readonly graphqlType = new AbstractTypedLiteralType.GraphqlType(
    code`${this.reusables.imports.GraphQLString}`,
    this.reusables,
  );
  override readonly hashFunction = new ReferenceCallable(
    this.reusables.snippets.hashBigDecimal,
  );
  override readonly kind = "BigDecimal";
  override readonly schemaType =
    code`${this.reusables.snippets.NumericSchema}<${this.reusables.imports.BigDecimal}>`;
  override readonly toCompactedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.bigDecimalToCompactedJson,
  );
  override readonly toExpandedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.bigDecimalToExpandedJson,
  );
  override readonly valueSparqlWherePatternsFunction = new ReferenceCallable(
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
}

import type { Literal } from "@rdfjs/types";

import type { Decimal } from "decimal.js";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractTypedLiteralType } from "./AbstractTypedLiteralType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import { SchemaObject } from "./SchemaObject.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class BigDecimalType extends AbstractTypedLiteralType<Decimal> {
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
  override readonly filterFunction = new BuiltinCallable(
    this.reusables.snippets.filterBigDecimal,
  );
  override readonly filterType =
    code`${this.reusables.snippets.NumericFilter}<${this.reusables.imports.BigDecimal}>`;
  override readonly fromJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.bigDecimalFromJsonObject,
  );
  override readonly fromJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.bigDecimalFromJsonString,
  );
  override readonly fromRdfResourceValuesFunction = new BuiltinCallable(
    this.reusables.snippets.bigDecimalFromRdfResourceValues,
  );
  override readonly graphqlType = new AbstractTypedLiteralType.GraphqlType(
    code`${this.reusables.imports.GraphQLString}`,
    this.reusables,
  );
  override readonly hashFunction = new BuiltinCallable(
    this.reusables.snippets.hashBigDecimal,
  );
  override readonly jsonValueType: AbstractTypedLiteralType.JsonType =
    this.jsonTypeFactory.createJsonUnionType([
      this.jsonTypeFactory.createJsonNumberType(),
      this.jsonTypeFactory.createJsonStringType(),
    ]);
  override readonly kind = "BigDecimal";
  override readonly toJsonObjectFunction = new BuiltinCallable(
    code`${this.reusables.snippets.bigDecimalToJsonObject}(${this.rdfjsTermExpression(this.datatype)})`,
  );
  override readonly toJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.bigDecimalToJsonString,
  );
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
    this.reusables.snippets.bigDecimalSparqlWherePatterns,
  );

  @Memoize()
  override get schema(): SchemaObject<SchemaObject.BuiltinType> {
    return new SchemaObject({
      properties: super.schema.properties,
      type: new SchemaObject.BuiltinType(
        code`${this.reusables.snippets.NumericSchema}<${this.reusables.imports.BigDecimal}>`,
      ),
      variable: super.schema.variable,
    });
  }

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

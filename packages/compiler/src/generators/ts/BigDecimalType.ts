import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BigDecimalType extends AbstractLiteralType {
  override readonly conversionFunction: AbstractLiteralType.ConversionFunction =
    {
      code: code`${this.reusables.snippets.convertToBigDecimal}`,
      sourceTypes: [
        {
          name: code`${this.reusables.imports.BigDecimal}`,
          typeof: "object",
        },
      ],
    };
  override readonly filterFunction =
    code`${this.reusables.snippets.filterBigDecimal}`;
  override readonly filterType =
    code`${this.reusables.snippets.NumericFilter}<${this.reusables.imports.BigDecimal}>`;
  override readonly hashFunction =
    code`${this.reusables.snippets.hashBigDecimal}`;
  override readonly kind = "BigDecimalType";
  override readonly name = code`${this.reusables.imports.BigDecimal}`;
  override readonly schemaType =
    code`${this.reusables.snippets.NumericSchema}<${this.reusables.imports.BigDecimal}>`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.bigDecimalSparqlWherePatterns}`;

  @Memoize()
  override get conversions(): readonly AbstractLiteralType.Conversion[] {
    return [
      // {
      //   conversionExpression: (value) =>
      //     code`new ${this.reusables.imports.BigDecimal}(${value}.toString())`,
      //   sourceTypeCheckExpression: (value) =>
      //     code`typeof ${value} === "bigint"`,
      //   sourceTypeName: code`bigint`,
      //   sourceTypeof: "bigint",
      // },
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: code`${this.reusables.imports.BigDecimal}`,
        sourceTypeof: "object",
      },
      // {
      //   conversionExpression: (value) =>
      //     code`new ${this.reusables.imports.BigDecimal}(${value})`,
      //   sourceTypeCheckExpression: (value) =>
      //     code`typeof ${value} === "number"`,
      //   sourceTypeName: code`number`,
      //   sourceTypeof: "number",
      // },
      // {
      //   conversionExpression: (value) =>
      //     code`new ${this.reusables.imports.BigDecimal}(${value})`,
      //   sourceTypeCheckExpression: (value) =>
      //     code`typeof ${value} === "string"`,
      //   sourceTypeName: code`string`,
      //   sourceTypeof: "string",
      // },
    ];
  }

  @Memoize()
  override get graphqlType() {
    return new AbstractLiteralType.GraphqlType(
      code`${this.reusables.imports.GraphQLString}`,
      this.reusables,
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`new ${this.reusables.imports.BigDecimal}(${variables.value})`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.toFixed()`;
  }

  @Memoize()
  override jsonSchema(): Code {
    return code`${this.reusables.imports.z}.string()`;
  }

  @Memoize()
  override jsonType(): AbstractLiteralType.JsonType {
    return new AbstractLiteralType.JsonType("string");
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toFixed()`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractLiteralType["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.bigDecimalLiteral}(${variables.value})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractLiteralType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractLiteralType["fromRdfExpressionChain"]
  > {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toLiteral().chain(${this.reusables.snippets.decodeBigDecimalLiteral})))`,
    };
  }
}

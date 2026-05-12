import { Memoize } from "typescript-memoize";
import { AbstractLiteralType } from "./AbstractLiteralType.js";

import { type Code, code } from "./ts-poet-wrapper.js";

export class BigDecimalType extends AbstractLiteralType {
  override readonly filterFunction = code`${this.snippets.filterBigDecimal}`;
  override readonly filterType =
    code`${this.snippets.NumericFilter}<${this.imports.BigDecimal}>`;
  override readonly graphqlType = new AbstractLiteralType.GraphqlType(
    code`${this.imports.GraphQLString}`,
  );
  override readonly kind = "BigDecimalType";
  override readonly name = code`${this.imports.BigDecimal}`;
  override readonly schemaType =
    code`${this.snippets.NumericSchema}<${this.imports.BigDecimal}>`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.snippets.bigDecimalSparqlWherePatterns}`;

  @Memoize()
  override get conversions(): readonly AbstractLiteralType.Conversion[] {
    return [
      // {
      //   conversionExpression: (value) =>
      //     code`new ${this.imports.BigDecimal}(${value}.toString())`,
      //   sourceTypeCheckExpression: (value) =>
      //     code`typeof ${value} === "bigint"`,
      //   sourceTypeName: code`bigint`,
      //   sourceTypeof: "bigint",
      // },
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: code`${this.imports.BigDecimal}`,
        sourceTypeof: "object",
      },
      // {
      //   conversionExpression: (value) =>
      //     code`new ${this.imports.BigDecimal}(${value})`,
      //   sourceTypeCheckExpression: (value) =>
      //     code`typeof ${value} === "number"`,
      //   sourceTypeName: code`number`,
      //   sourceTypeof: "number",
      // },
      // {
      //   conversionExpression: (value) =>
      //     code`new ${this.imports.BigDecimal}(${value})`,
      //   sourceTypeCheckExpression: (value) =>
      //     code`typeof ${value} === "string"`,
      //   sourceTypeName: code`string`,
      //   sourceTypeof: "string",
      // },
    ];
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`new ${this.imports.BigDecimal}(${variables.value})`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.toFixed()`;
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractLiteralType["hashStatements"]>[0]): readonly Code[] {
    return [code`${variables.hasher}.update(${variables.value}.toFixed());`];
  }

  @Memoize()
  override jsonType(): AbstractLiteralType.JsonType {
    return new AbstractLiteralType.JsonType("string");
  }

  @Memoize()
  override jsonSchema(): Code {
    return code`${this.imports.z}.string()`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`${variables.value}.toFixed()`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractLiteralType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractLiteralType["fromRdfExpressionChain"]
  > {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toLiteral().chain(${this.snippets.decodeBigDecimalLiteral})))`,
    };
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractLiteralType["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.snippets.bigDecimalLiteral}(${variables.value})]`;
  }
}

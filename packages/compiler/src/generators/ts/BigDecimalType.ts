import { type Code, code } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
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

  @Memoize()
  override get conversions(): readonly AbstractLiteralType.Conversion[] {
    return [
      // {
      //   conversionExpression: (value) =>
      //     code`new ${imports.BigDecimal}(${value}.toString())`,
      //   sourceTypeCheckExpression: (value) =>
      //     code`typeof ${value} === "bigint"`,
      //   sourceTypeName: code`bigint`,
      //   sourceTypeof: "bigint",
      // },
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: code`${imports.BigDecimal}`,
        sourceTypeof: "object",
      },
      // {
      //   conversionExpression: (value) =>
      //     code`new ${imports.BigDecimal}(${value})`,
      //   sourceTypeCheckExpression: (value) =>
      //     code`typeof ${value} === "number"`,
      //   sourceTypeName: code`number`,
      //   sourceTypeof: "number",
      // },
      // {
      //   conversionExpression: (value) =>
      //     code`new ${imports.BigDecimal}(${value})`,
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
    return code`new ${imports.BigDecimal}(${variables.value})`;
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
  override jsonZodSchema(): Code {
    return code`${imports.z}.string()`;
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
      valueTo: code`chain(values => values.chainMap(value => value.toLiteral().chain(${snippets.decodeBigDecimalLiteral})))`,
    };
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractLiteralType["toRdfExpression"]>[0]): Code {
    return code`[${snippets.bigDecimalLiteral}(${variables.value})]`;
  }
}

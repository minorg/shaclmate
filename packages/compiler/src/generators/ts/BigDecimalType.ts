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

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`new ${imports.BigDecimal}(${variables.value})`;
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
      valueTo: code`chain(values => values.chainMap(value => ${snippets.decodeBigDecimalLiteral}(value)))`,
    };
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractLiteralType["toRdfExpression"]>[0]): Code {
    return code`[${snippets.bigDecimalLiteral}(${variables.value})]`;
  }
}

import type { Literal } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class BigDecimalType extends AbstractLiteralType {
  override readonly conversionFunction: Maybe<AbstractLiteralType.ConversionFunction> =
    Maybe.empty();
  override readonly expression = code`${this.reusables.imports.BigDecimal}`;
  override readonly filterFunction =
    code`${this.reusables.snippets.filterBigDecimal}`;
  override readonly filterType =
    code`${this.reusables.snippets.NumericFilter}<${this.reusables.imports.BigDecimal}>`;
  override readonly hashFunction =
    code`${this.reusables.snippets.hashBigDecimal}`;
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "BigDecimal";
  override readonly schemaType =
    code`${this.reusables.snippets.NumericSchema}<${this.reusables.imports.BigDecimal}>`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.bigDecimalSparqlWherePatterns}`;

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
    return code`${this.reusables.imports.Either}.encase<Error, ${this.expression}>(() => new ${this.expression}(${variables.value}))`;
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
    return new AbstractLiteralType.JsonType(code`string`);
  }

  override literalValueExpression(literal: Literal): Code {
    return code`new ${this.reusables.imports.BigDecimal}(${literalOf(literal.value)})`;
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

  protected override fromRdfResourceValuesExpressionChain({
    variables,
  }: Parameters<
    AbstractLiteralType["fromRdfResourceValuesExpressionChain"]
  >[0]): ReturnType<
    AbstractLiteralType["fromRdfResourceValuesExpressionChain"]
  > {
    return {
      ...super.fromRdfResourceValuesExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toLiteral().chain(${this.reusables.snippets.decodeBigDecimalLiteral})))`,
    };
  }
}

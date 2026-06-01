import type { Literal } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { arrayOf, type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class StringType extends AbstractPrimitiveType<string> {
  override readonly filterFunction =
    code`${this.reusables.snippets.filterString}`;
  override readonly filterType = code`${this.reusables.snippets.StringFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${this.reusables.imports.GraphQLString}`,
    this.reusables,
  );
  override readonly hashFunction = code`${this.reusables.snippets.hashString}`;
  override readonly jsTypes = [
    {
      typeof: "string",
    },
  ] as const;
  override readonly kind = "String";
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.stringSparqlWherePatterns}`;

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.StringSchema}<${this.expression}>`;
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    if (this.primitiveIn.length > 0) {
      return code`${this.primitiveIn.map((value) => `"${value}"`).join(" | ")}`;
    }
    return code`string`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractPrimitiveType<string>["jsonSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${this.reusables.imports.z}.string()`;
      case 1:
        return code`${this.reusables.imports.z}.literal(${this.primitiveIn[0]})`;
      default:
        return code`${this.reusables.imports.z}.enum(${arrayOf(...this.primitiveIn)})`;
    }
  }

  override literalValueExpression(literal: Literal | string): Code {
    return code`${literalOf(typeof literal === "string" ? literal : literal.value)}`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.string(${variables.value}${!this.datatype.equals(xsd.string) ? `, ${this.rdfjsTermExpression(this.datatype)}` : ""})]`;
  }

  protected override fromRdfResourceValuesExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["fromRdfResourceValuesExpressionChain"]
  >[0]): ReturnType<
    AbstractPrimitiveType<string>["fromRdfResourceValuesExpressionChain"]
  > {
    return {
      ...super.fromRdfResourceValuesExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toString(${this.primitiveIn.length > 0 ? `${JSON.stringify(this.primitiveIn)} as const` : ""})))`,
    };
  }
}

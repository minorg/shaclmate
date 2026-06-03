import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BooleanType extends AbstractPrimitiveType<boolean> {
  override readonly filterFunction =
    code`${this.reusables.snippets.filterBoolean}`;
  override readonly filterType = code`${this.reusables.snippets.BooleanFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${this.reusables.imports.GraphQLBoolean}`,
    this.reusables,
  );
  override readonly hashFunction = code`${this.reusables.snippets.hashBoolean}`;
  override readonly jsTypes = [{ typeof: "boolean" }] as const;
  override readonly kind = "Boolean";
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.booleanSparqlWherePatterns}`;

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.BooleanSchema}<${this.expression}>`;
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    if (this.primitiveIn.length > 0) {
      return code`${this.primitiveIn.map((value) => value.toString()).join(" | ")}`;
    }
    return code`boolean`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractPrimitiveType<number>["jsonSchema"]>[0],
  ): Code {
    if (this.primitiveIn.length === 1) {
      return code`${this.reusables.imports.z}.literal(${this.primitiveIn[0]})`;
    }
    return code`${this.reusables.imports.z}.boolean()`;
  }

  override literalValueExpression(literal: boolean | Literal): Code {
    return code`${typeof literal === "boolean" ? literal : LiteralDecoder.decodeBooleanLiteral(literal).unsafeCoerce()}`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.boolean(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }

  // protected override fromRdfResourceValuesExpressionChain({
  //   variables,
  // }: Parameters<
  //   AbstractPrimitiveType<boolean>["fromRdfResourceValuesExpressionChain"]
  // >[0]): ReturnType<
  //   AbstractPrimitiveType<boolean>["fromRdfResourceValuesExpressionChain"]
  // > {
  //   return {
  //     ...super.fromRdfResourceValuesExpressionChain({ variables }),
  //     languageIn: undefined,
  //     preferredLanguages: undefined,
  //     valueTo: code`chain(values => values.chainMap(value => value.toBoolean(${this.primitiveIn.length === 1 ? `[${this.primitiveIn[0]}] as const` : ""})))`,
  //   };
  // }
}

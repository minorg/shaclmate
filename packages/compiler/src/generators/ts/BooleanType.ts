import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";

import { type Code, code } from "./ts-poet-wrapper.js";

export class BooleanType extends AbstractPrimitiveType<boolean> {
  override readonly filterFunction =
    code`${this.reusables.snippets.filterBoolean}`;
  override readonly filterType = code`${this.reusables.snippets.BooleanFilter}`;
  override readonly kind = "BooleanType";
  override readonly schemaType = code`${this.reusables.snippets.BooleanSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.booleanSparqlWherePatterns}`;
  override readonly typeofs = NonEmptyList(["boolean" as const]);

  @Memoize()
  override get graphqlType() {
    return new AbstractPrimitiveType.GraphqlType(
      code`${this.reusables.imports.GraphQLBoolean}`,
      this.reusables,
    );
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return `${this.primitiveIn.map((value) => value.toString()).join(" | ")}`;
    }
    return `boolean`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in: this.primitiveIn.length > 0 ? this.primitiveIn.concat() : undefined,
    };
  }

  override jsonSchema(
    _parameters: Parameters<AbstractPrimitiveType<number>["jsonSchema"]>[0],
  ): Code {
    if (this.primitiveIn.length === 1) {
      return code`${this.reusables.imports.z}.literal(${this.primitiveIn[0]})`;
    }
    return code`${this.reusables.imports.z}.boolean()`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.boolean(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]> {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => value.toBoolean(${this.primitiveIn.length === 1 ? `[${this.primitiveIn[0]}] as const` : ""})))`,
    };
  }
}

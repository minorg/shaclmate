import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BooleanType extends AbstractPrimitiveType<boolean> {
  override readonly filterFunction = code`${snippets.filterBoolean}`;
  override readonly filterType = code`${snippets.BooleanFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${imports.GraphQLBoolean}`,
  );
  override readonly kind = "BooleanType";
  override readonly schemaType = code`${snippets.BooleanSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${snippets.booleanSparqlWherePatterns}`;
  override readonly typeofs = NonEmptyList(["boolean" as const]);

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

  override jsonZodSchema(
    _parameters: Parameters<AbstractPrimitiveType<number>["jsonZodSchema"]>[0],
  ): Code {
    if (this.primitiveIn.length === 1) {
      return code`${imports.z}.literal(${this.primitiveIn[0]})`;
    }
    return code`${imports.z}.boolean()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<boolean>["toRdfExpression"]>[0]): Code {
    return code`[${snippets.literalFactory}.boolean(${variables.value}, ${rdfjsTermExpression(this.datatype)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = code`value.toBoolean()`;
    if (this.primitiveIn.length === 1) {
      const eitherTypeParameters = code`<Error, ${this.name}>`;
      fromRdfResourceValueExpression = code`${fromRdfResourceValueExpression}.chain(primitiveValue => primitiveValue === ${this.primitiveIn[0]} ? ${imports.Either}.of${eitherTypeParameters}(primitiveValue) : ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: code`value.toTerm()`, expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})))`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }
}

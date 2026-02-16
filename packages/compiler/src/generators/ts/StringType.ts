import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class StringType extends AbstractPrimitiveType<string> {
  override readonly filterFunction = code`${snippets.filterString}`;
  override readonly filterType = code`${snippets.StringFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${imports.GraphQLString}`,
  );
  readonly kind = "StringType";
  override readonly schemaType = code`${snippets.StringSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${snippets.stringSparqlWherePatterns}`;
  override readonly typeofs = NonEmptyList(["string" as const]);

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return `${this.primitiveIn.map((value) => `"${value}"`).join(" | ")}`;
    }
    return `string`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in:
        this.primitiveIn.length > 0
          ? this.primitiveIn.map((_) => JSON.stringify(_)).concat()
          : undefined,
    };
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["hashStatements"]
  >[0]): readonly Code[] {
    return [code`${variables.hasher}.update(${variables.value});`];
  }

  override jsonZodSchema(
    _parameters: Parameters<AbstractPrimitiveType<string>["jsonZodSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${imports.z}.string()`;
      case 1:
        return code`${imports.z}.literal(${this.primitiveIn[0]})`;
      default:
        return code`${imports.z}.enum(${JSON.stringify(this.primitiveIn)})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): Code {
    return code`[${imports.dataFactory}.literal(${variables.value})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<string>["fromRdfExpressionChain"]> {
    const inChain =
      this.primitiveIn.length > 0
        ? code`.chain(string_ => { switch (string_) { ${this.primitiveIn.map((value) => `case "${value}":`).join(" ")} return ${imports.Either}.of<Error, ${this.name}>(string_); default: return ${imports.Left}<Error, ${this.name}>(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: "value.toTerm()", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); } })`
        : "";

    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toString()${inChain}))`,
    };
  }
}

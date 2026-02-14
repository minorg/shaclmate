import type { NamedNode } from "@rdfjs/types";

import { NonEmptyList } from "purify-ts";
import { type Code, code } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";

export abstract class AbstractNumberType extends AbstractPrimitiveType<number> {
  private readonly datatype: NamedNode;

  override readonly filterFunction = code`${snippets.filterNumber}`;
  override readonly filterType = code`${snippets.NumberFilter}`;
  abstract override readonly kind: "FloatType" | "IntType";
  override readonly schemaType = code`${snippets.NumberSchema}`;
  override readonly typeofs = NonEmptyList(["number" as const]);

  constructor({
    datatype,
    ...superParameters
  }: {
    datatype: NamedNode;
  } & ConstructorParameters<typeof AbstractPrimitiveType<number>>[0]) {
    super(superParameters);
    this.datatype = datatype;
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return `${this.primitiveIn.map((value) => value.toString()).join(" | ")}`;
    }
    return "number";
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${snippets.numberSparqlWherePatterns}`;
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
    switch (this.primitiveIn.length) {
      case 0:
        return code`${imports.z}.number()`;
      case 1:
        return code`${imports.z}.literal(${this.primitiveIn[0]})`;
      default:
        return code`${imports.z}.union([${this.primitiveIn.map((value) => `${imports.z}.literal(${value})`).join(", ")}])`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): Code {
    return code`[${imports.dataFactory}.literal(${variables.value}.toString(10), ${rdfjsTermExpression(this.datatype)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<number>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<number>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = "value.toNumber()";
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => { switch (primitiveValue) { ${this.primitiveIn.map((value) => `case ${value}:`).join(" ")} return ${imports.Either}.of${eitherTypeParameters}(primitiveValue); default: return ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: "value.toTerm()", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); } })`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }
}

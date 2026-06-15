import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractDateType extends AbstractLiteralType {
  protected readonly datatype: NamedNode;
  protected readonly dateIn: readonly Date[];
  protected override readonly inlineExpression = code`Date`;

  override readonly conversionFunction: Maybe<AbstractLiteralType.ConversionFunction> =
    Maybe.empty();
  override readonly equalsFunction =
    code`${this.reusables.snippets.dateEquals}`;
  override readonly filterFunction =
    code`${this.reusables.snippets.filterDate}`;
  override readonly filterType = code`${this.reusables.snippets.DateFilter}`;
  override readonly jsTypes = [
    {
      instanceof: "Date",
      typeof: "object",
    },
  ] as const;
  abstract override readonly kind: "DateTime" | "Date";
  override readonly mutable = false;
  override readonly schemaType = code`${this.reusables.snippets.DateSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.dateSparqlWherePatterns}`;

  constructor({
    datatype,
    dateIn,
    ...superParameters
  }: {
    datatype: NamedNode;
    dateIn: readonly Date[];
  } & ConstructorParameters<typeof AbstractLiteralType>[0]) {
    super(superParameters);
    this.datatype = datatype;
    this.dateIn = dateIn;
  }

  override get discriminantProperty(): Maybe<AbstractLiteralType.DiscriminantProperty> {
    return Maybe.empty();
  }

  protected override get schemaInitializers() {
    let initializers = super.schemaInitializers;
    if (this.dateIn.length > 0) {
      initializers = initializers.concat(
        code`in: ${arrayOf(...this.dateIn.map((in_) => this.literalValueExpression(in_)))} as const`,
      );
    }
    return initializers;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, Date>(new Date(${variables.value}))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0]): Code {
    return variables.value;
  }

  @Memoize()
  override jsonType(): AbstractPrimitiveType.JsonType {
    return new AbstractPrimitiveType.JsonType(code`string`);
  }

  abstract override literalValueExpression(literal: Date | Literal): Code;

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractLiteralType["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.date(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }
}

export namespace AbstractDateType {
  export type ConversionFunction = AbstractPrimitiveType.ConversionFunction;
}

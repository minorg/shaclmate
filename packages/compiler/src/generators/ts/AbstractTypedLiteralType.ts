import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class of all types that are typed literals in RDF. In RDF every literal is either
 *  - a language-tagged string literal (datatype = rdf:langString, language = not empty)
 *  - a typed literal (datatype = anything else, language = empty)
 */
export abstract class AbstractTypedLiteralType<
  ValueT,
> extends AbstractLiteralType {
  readonly datatype: NamedNode;
  readonly decodedIn: readonly ValueT[];

  constructor({
    datatype,
    decodedIn,
    ...superParameters
  }: {
    datatype: NamedNode;
    readonly decodedIn: readonly ValueT[];
  } & ConstructorParameters<typeof AbstractLiteralType>[0]) {
    super(superParameters);
    this.datatype = datatype;
    this.decodedIn = decodedIn;
  }

  override get discriminantProperty(): Maybe<AbstractLiteralType.DiscriminantProperty> {
    return Maybe.empty();
  }

  protected override get schemaInitializers() {
    let initializers = super.schemaInitializers;
    if (this.decodedIn.length > 0) {
      initializers = initializers.concat(
        code`in: ${arrayOf(...this.decodedIn.map((in_) => this.valueExpression(in_)))} as const`,
      );
    }
    return initializers;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0]): Code {
    return variables.value;
  }

  abstract override valueExpression(literal: Literal | ValueT): Code;
}

export namespace AbstractTypedLiteralType {
  export type ConversionFunction = AbstractTermType.ConversionFunction;
  export type DiscriminantProperty = AbstractTermType.DiscriminantProperty;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export type JsType = AbstractTermType.JsType;
  export const JsonType = AbstractTermType.JsonType;
  export type JsonType = AbstractTermType.JsonType;
}

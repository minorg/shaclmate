import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { codeEquals } from "./codeEquals.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class of all types that are typed literals in RDF. In RDF every literal is either
 *  - a language-tagged string literal (datatype = rdf:langString, language = not empty)
 *  - a typed literal (datatype = anything else, language = empty)
 */
export abstract class AbstractTypedLiteralType<
  ValueT,
> extends AbstractLiteralType {
  protected abstract readonly compactJsonType: AbstractLiteralType.JsonType;

  readonly datatype: NamedNode;

  constructor({
    datatype,
    ...superParameters
  }: {
    datatype: NamedNode;
  } & ConstructorParameters<typeof AbstractLiteralType>[0]) {
    super(superParameters);
    this.datatype = datatype;
  }

  override get discriminantProperty(): Maybe<AbstractLiteralType.DiscriminantProperty> {
    return Maybe.empty();
  }

  override fromJsonExpression({
    form,
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    const valueVariable =
      form === "compact" ? variables.value : code`${variables.value}["@value"]`;
    const fromCompactJsonExpression = this.fromCompactJsonExpression({
      variables: { value: valueVariable },
    });
    if (codeEquals(fromCompactJsonExpression, valueVariable)) {
      return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${fromCompactJsonExpression})`;
    }
    return code`${this.reusables.imports.Either}.encase<Error, ${this.expression}>(() => ${fromCompactJsonExpression})`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0]): Code {
    return variables.value;
  }

  override jsonType({
    form,
  }: Parameters<
    AbstractLiteralType["jsonType"]
  >[0]): AbstractTypedLiteralType.JsonType {
    switch (form) {
      case "compact":
        return this.compactJsonType;
      case "expanded":
        return this.jsonTypeFactory.createJsonValueObjectType({
          "@type": this.datatype,
          "@value": this.compactJsonType,
        });
    }
  }

  override toJsonExpression({
    form,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    switch (form) {
      case "compact":
        return this.toCompactJsonExpression({ variables });
      case "expanded":
        return code`${{
          "@type": this.rdfjsTermExpression(this.datatype),
          "@value": this.toCompactJsonExpression({ variables }),
        }}`;
    }
  }

  abstract override valueExpression(literal: Literal | ValueT): Code;

  protected abstract fromCompactJsonExpression(parameters: {
    variables: { value: Code };
  }): Code;

  protected abstract toCompactJsonExpression(parameters: {
    variables: { value: Code };
  }): Code;
}

export namespace AbstractTypedLiteralType {
  export type ConversionFunction = AbstractTermType.ConversionFunction;
  export type DiscriminantProperty = AbstractTermType.DiscriminantProperty;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export type JsType = AbstractTermType.JsType;
  export type JsonType = AbstractTermType.JsonType;
}

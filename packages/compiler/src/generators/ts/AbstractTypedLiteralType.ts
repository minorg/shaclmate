import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { SchemaObject } from "./SchemaObject.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class of all types that are typed literals in RDF. In RDF every literal is either
 *  - a language-tagged string literal (datatype = rdf:langString, language = not empty)
 *  - a typed literal (datatype = anything else, language = empty)
 */
export abstract class AbstractTypedLiteralType<
  ValueT,
> extends AbstractLiteralType {
  readonly datatype: NamedNode;
  override readonly discriminatedType: Maybe<AbstractTypedLiteralType.DiscriminatedType> =
    Maybe.empty();
  override readonly jsonObjectType: AbstractTermType<
    Literal,
    Literal
  >["jsonObjectType"] = this.jsonTypeFactory.createJsonObjectType(
    {
      "@type": {
        type: this.jsonTypeFactory.createJsonStringType(),
      },
      "@value": {
        type: this.jsonTypeFactory.createJsonStringType(),
      },
    },
    {
      snippet: this.reusables.snippets.TypedLiteralJsonObject,
    },
  );

  constructor({
    datatype,
    ...superParameters
  }: {
    datatype: NamedNode;
  } & ConstructorParameters<typeof AbstractLiteralType>[0]) {
    super(superParameters);
    this.datatype = datatype;
  }

  @Memoize()
  override get schema(): SchemaObject<
    SchemaObject.AbstractType | SchemaObject.BuiltinType
  > {
    return new SchemaObject({
      properties: {
        ...super.schema.properties,
        datatype: code`datatype: ${this.rdfjsTermExpression(this.datatype)}`,
      },
      type: new SchemaObject.AbstractType("AbstractTypedLiteralType"),
      variable: super.schema.variable,
    });
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
  export type DiscriminatedType = AbstractTermType.DiscriminatedType;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export type JsType = AbstractTermType.JsType;
  export type JsonType = AbstractTermType.JsonType;
}

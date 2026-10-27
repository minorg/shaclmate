import type { Literal } from "@rdfjs/types";

import { AbstractTermType } from "./AbstractTermType.js";

/**
 * Abstract base class of all types that are literals in RDF.
 */
export abstract class AbstractLiteralType extends AbstractTermType<
  Literal,
  Literal
> {
  override readonly expandedJsonType: AbstractTermType<
    Literal,
    Literal
  >["expandedJsonType"] = this.jsonTypeFactory.createJsonObjectType(
    {
      "@language": {
        optional: true,
        type: this.jsonTypeFactory.createJsonStringType(),
      },
      "@type": {
        optional: true,
        type: this.jsonTypeFactory.createJsonStringType(),
      },
      "@value": {
        type: this.jsonTypeFactory.createJsonStringType(),
      },
    },
    {
      snippet: this.reusables.snippets.LiteralExpandedJson,
    },
  );

  override readonly nodeKinds = nodeKinds;
}

export namespace AbstractLiteralType {
  export type ConversionFunction = AbstractTermType.ConversionFunction;
  export type DiscriminantProperty = AbstractTermType.DiscriminantProperty;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export type JsType = AbstractTermType.JsType;
  export type JsonType = AbstractTermType.JsonType;
}

const nodeKinds: ReadonlySet<"Literal"> = new Set(["Literal"]);

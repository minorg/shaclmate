import type { Literal } from "@rdfjs/types";
import { Memoize } from "typescript-memoize";
import { AbstractTermType } from "./AbstractTermType.js";
import { SchemaObject } from "./SchemaObject.js";

/**
 * Abstract base class of all types that are literals in RDF.
 */
export abstract class AbstractLiteralType extends AbstractTermType<
  Literal,
  Literal
> {
  override readonly jsonObjectType: AbstractTermType<
    Literal,
    Literal
  >["jsonObjectType"] = this.jsonTypeFactory.createJsonObjectType(
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
      snippet: this.reusables.snippets.LiteralJsonObject,
    },
  );

  @Memoize()
  override get schema(): SchemaObject<SchemaObject.BuiltinType> {
    return new SchemaObject({
      ...super.schema,
      type: new SchemaObject.BuiltinType(this.reusables.snippets.LiteralSchema),
    });
  }

  override readonly nodeKinds = nodeKinds;
}

export namespace AbstractLiteralType {
  export type ConversionFunction = AbstractTermType.ConversionFunction;
  export type DiscriminatedType = AbstractTermType.DiscriminatedType;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export type JsType = AbstractTermType.JsType;
  export type JsonType = AbstractTermType.JsonType;
}

const nodeKinds: ReadonlySet<"Literal"> = new Set(["Literal"]);

import type { Literal } from "@rdfjs/types";

import { AbstractTermType } from "./AbstractTermType.js";

/**
 * Abstract base class of all types that are literals in RDF.
 */
export abstract class AbstractLiteralType extends AbstractTermType<
  Literal,
  Literal
> {
  override readonly nodeKinds = nodeKinds;
}

export namespace AbstractLiteralType {
  export type ConversionFunction = AbstractTermType.ConversionFunction;
  export type DiscriminantProperty = AbstractTermType.DiscriminantProperty;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export type JsType = AbstractTermType.JsType;
  export const JsonType = AbstractTermType.JsonType;
  export type JsonType = AbstractTermType.JsonType;
}

const nodeKinds: ReadonlySet<"Literal"> = new Set(["Literal"]);

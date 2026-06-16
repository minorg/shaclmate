import type { Literal } from "@rdfjs/types";

import { AbstractTermType } from "./AbstractTermType.js";
import type { Code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class of all types that are literals in RDF.
 */
export abstract class AbstractLiteralType extends AbstractTermType<
  Literal,
  Literal
> {
  override readonly nodeKinds = nodeKinds;

  /**
   * An expression that converts a compile-time RDF/JS Literal into a runtime TypeScript literal.
   *
   * For example, a string would be converted to "thestring".
   */
  abstract literalValueExpression(literal: Literal): Code;
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

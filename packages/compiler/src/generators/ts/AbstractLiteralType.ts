import type { Literal } from "@rdfjs/types";

import { AbstractTermType } from "./AbstractTermType.js";
import type { Code } from "./ts-poet-wrapper.js";

export abstract class AbstractLiteralType extends AbstractTermType<
  Literal,
  Literal
> {
  protected readonly languageIn: readonly string[];

  override readonly nodeKinds = nodeKinds;

  constructor({
    languageIn,
    ...superParameters
  }: { languageIn: readonly string[] } & ConstructorParameters<
    typeof AbstractTermType<Literal, Literal>
  >[0]) {
    super(superParameters);
    this.languageIn = languageIn;
  }

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

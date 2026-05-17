import type { Literal } from "@rdfjs/types";

import { AbstractTermType } from "./AbstractTermType.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

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

  override get constrained(): boolean {
    return super.constrained || this.languageIn.length > 0;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      languageIn:
        this.languageIn.length > 0 ? this.languageIn.map(literalOf) : undefined,
    };
  }

  /**
   * An expression that converts a compile-time RDF/JS Literal into a runtime TypeScript literal.
   *
   * For example, a string would be converted to "thestring".
   */
  abstract literalExpression(literal: Literal): Code;

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractTermType<Literal, Literal>["fromRdfExpressionChain"]
  >[0]): ReturnType<
    AbstractTermType<Literal, Literal>["fromRdfExpressionChain"]
  > {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn:
        this.languageIn.length > 0
          ? code`chain(values => ${this.reusables.snippets.fromRdfLanguageIn}(values, ${JSON.stringify(this.languageIn)}))`
          : undefined,
      preferredLanguages: code`chain(values => ${this.reusables.snippets.fromRdfPreferredLanguages}(values, ${variables.preferredLanguages}))`,
      valueTo: code`chain(values => values.chainMap(value => value.toLiteral()))`,
    };
  }
}

export namespace AbstractLiteralType {
  export type Conversion = AbstractTermType.Conversion;
  export type ConversionFunction = AbstractTermType.ConversionFunction;
  export type DiscriminantProperty = AbstractTermType.DiscriminantProperty;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export const JsonType = AbstractTermType.JsonType;
  export type JsonType = AbstractTermType.JsonType;
}

const nodeKinds: ReadonlySet<"Literal"> = new Set(["Literal"]);

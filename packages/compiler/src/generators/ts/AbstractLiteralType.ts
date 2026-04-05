import type { Literal } from "@rdfjs/types";
import { AbstractTermType } from "./AbstractTermType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { code, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractLiteralType extends AbstractTermType<
  Literal,
  Literal
> {
  override readonly nodeKinds = nodeKinds;
  protected readonly languageIn: readonly string[];

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
          ? code`chain(values => ${snippets.fromRdfLanguageIn}({ focusResource: ${variables.resource}, languageIn: ${JSON.stringify(this.languageIn)}, predicate: ${variables.predicate}, values }))`
          : undefined,
      preferredLanguages: code`chain(values => ${snippets.fromRdfPreferredLanguages}({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, preferredLanguages: ${variables.preferredLanguages}, values }))`,
      valueTo: code`chain(values => values.chainMap(value => value.toLiteral()))`,
    };
  }
}

export namespace AbstractLiteralType {
  export type Conversion = AbstractTermType.Conversion;
  export type DiscriminantProperty = AbstractTermType.DiscriminantProperty;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export const JsonType = AbstractTermType.JsonType;
  export type JsonType = AbstractTermType.JsonType;
}

const nodeKinds: ReadonlySet<"Literal"> = new Set(["Literal"]);

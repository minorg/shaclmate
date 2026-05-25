import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";

import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractIdentifierType<
  IdentifierT extends BlankNode | NamedNode,
> extends AbstractTermType<NamedNode, IdentifierT> {
  abstract override readonly kind: "BlankNode" | "Identifier" | "Iri";
  abstract override readonly nodeKinds: ReadonlySet<IdentifierNodeKind>;
  abstract readonly parseFunction: Code;
  readonly stringifyFunction =
    code`${this.reusables.imports.NTriplesTerm}.stringify`;

  @Memoize()
  override get graphqlType() {
    return new AbstractTermType.GraphqlType(
      code`${this.reusables.imports.GraphQLString}`,
      this.reusables,
    );
  }

  override graphqlResolveExpression({
    variables: { value },
  }: Parameters<AbstractTermType["graphqlResolveExpression"]>[0]): Code {
    return code`${this.reusables.imports.NTriplesTerm}.stringify(${value})`;
  }
}

export namespace AbstractIdentifierType {
  export type ConversionFunction = AbstractTermType.ConversionFunction;
  export type JsonType = AbstractTermType.JsonType;
}

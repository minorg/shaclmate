import type { BlankNode, NamedNode } from "@rdfjs/types";

import { invariant } from "ts-invariant";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import { sharedImports } from "./sharedImports.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export abstract class AbstractIdentifierType<
  IdentifierT extends BlankNode | NamedNode,
> extends AbstractTermType<NamedNode, IdentifierT> {
  abstract readonly fromStringFunction: Code;
  override readonly graphqlType = new AbstractTermType.GraphqlType(
    code`${sharedImports.GraphQLString}`,
  );
  abstract override readonly kind:
    | "BlankNodeType"
    | "IdentifierType"
    | "NamedNodeType";

  @Memoize()
  override get conversions(): readonly AbstractTermType.Conversion[] {
    const conversions = super.conversions.concat();
    if (this.nodeKinds.has("NamedNode")) {
      conversions.push({
        conversionExpression: (value) =>
          code`${sharedImports.dataFactory}.namedNode(${value})`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "string"`,
        sourceTypeName:
          this.in_.length > 0
            ? code`${this.in_.map((iri) => `"${iri.value}"`).join(" | ")}`
            : code`string`,
        sourceTypeof: "string",
      });
    }
    return conversions;
  }

  @Memoize()
  override get schema(): Code {
    if (this.constrained) {
      return code`${this.schemaObject}`;
    }

    invariant(this.kind.endsWith("Type"));
    return code`${conditionalOutput(`${syntheticNamePrefix}unconstrained${this.kind.substring(0, this.kind.length - "Type".length)}Schema`, code`const ${this.kind.substring(0, this.kind.length - "Type".length)}Schema = ${this.schemaObject};`)}`;
  }

  @Memoize()
  get toStringFunction(): Code {
    // Re-export rdfjsResource.Resource.Identifier.toString
    return code`\
// biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
export const toString = ${sharedImports.Resource}.Identifier.toString`;
  }

  override graphqlResolveExpression({
    variables: { value },
  }: Parameters<AbstractTermType["graphqlResolveExpression"]>[0]): Code {
    return code`${sharedImports.Resource}.Identifier.toString(${value})`;
  }
}

import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { type Code, code } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractTermType } from "./AbstractTermType.js";
import { imports } from "./imports.js";

export abstract class AbstractIdentifierType<
  IdentifierT extends BlankNode | NamedNode,
> extends AbstractTermType<NamedNode, IdentifierT> {
  abstract readonly fromStringFunction: Code;
  override readonly graphqlType = new AbstractTermType.GraphqlType(
    code`${imports.GraphQLString}`,
  );
  abstract override readonly kind:
    | "BlankNodeType"
    | "IdentifierType"
    | "IriType";
  abstract override readonly nodeKinds: ReadonlySet<IdentifierNodeKind>;
  readonly toStringFunction = // Re-export rdfjsResource.Resource.Identifier.toString
    code`\
// biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
export const toString = ${imports.Resource}.Identifier.toString`;

  @Memoize()
  override get conversions(): readonly AbstractTermType.Conversion[] {
    const conversions = super.conversions.concat();
    if (this.nodeKinds.has("IRI")) {
      conversions.push({
        conversionExpression: (value) =>
          code`${imports.dataFactory}.namedNode(${value})`,
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

  override graphqlResolveExpression({
    variables: { value },
  }: Parameters<AbstractTermType["graphqlResolveExpression"]>[0]): Code {
    return code`${imports.Resource}.Identifier.toString(${value})`;
  }
}

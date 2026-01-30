import type { BlankNode, NamedNode } from "@rdfjs/types";

import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";

export abstract class AbstractIdentifierType<
  IdentifierT extends BlankNode | NamedNode,
> extends AbstractTermType<NamedNode, IdentifierT> {
  override readonly graphqlType = new AbstractTermType.GraphqlType(
    "graphql.GraphQLString",
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
        conversionExpression: (value) => `dataFactory.namedNode(${value})`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "string"`,
        sourceTypeName:
          this.in_.length > 0
            ? this.in_.map((iri) => `"${iri.value}"`).join(" | ")
            : "string",
      });
    }
    return conversions;
  }

  @Memoize()
  get toStringFunctionDeclaration(): VariableStatementStructure {
    // Re-export rdfjsResource.Resource.Identifier.toString
    return {
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      kind: StructureKind.VariableStatement,
      declarations: [
        {
          initializer: "rdfjsResource.Resource.Identifier.toString",
          leadingTrivia:
            "// biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString",
          name: "toString",
        },
      ],
    };
  }

  override graphqlResolveExpression({
    variables: { value },
  }: Parameters<AbstractTermType["graphqlResolveExpression"]>[0]): string {
    return `rdfjsResource.Resource.Identifier.toString(${value})`;
  }
}

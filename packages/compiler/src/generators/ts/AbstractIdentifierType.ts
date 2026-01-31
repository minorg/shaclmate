import type { BlankNode, NamedNode } from "@rdfjs/types";

import { invariant } from "ts-invariant";
import {
  type FunctionDeclarationStructure,
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import type { AbstractType } from "./AbstractType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export abstract class AbstractIdentifierType<
  IdentifierT extends BlankNode | NamedNode,
> extends AbstractTermType<NamedNode, IdentifierT> {
  abstract readonly fromStringFunctionDeclaration: FunctionDeclarationStructure;
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
  override get schema(): string {
    invariant(this.kind.endsWith("Type"));
    return this.constrained
      ? objectInitializer(this.schemaObject)
      : `${syntheticNamePrefix}unconstrained${this.kind.substring(0, this.kind.length - "Type".length)}Schema`;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      !this.constrained
        ? singleEntryRecord(
            this.schema,
            `const ${this.schema} = ${objectInitializer(this.schemaObject)};`,
          )
        : {},
    );
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

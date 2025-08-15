import type { BlankNode, NamedNode } from "@rdfjs/types";

import {
  type FunctionDeclarationStructure,
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import { TermType } from "./TermType.js";
import type { Type } from "./Type.js";

export class IdentifierType extends TermType<NamedNode, BlankNode | NamedNode> {
  readonly kind = "IdentifierType";

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    return super.conversions.concat([
      {
        conversionExpression: (value) =>
          `${this.dataFactoryVariable}.namedNode(${value})`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "string"`,
        sourceTypeName:
          this.in_.length > 0
            ? this.in_.map((iri) => `"${iri.value}"`).join(" | ")
            : "string",
      },
    ]);
  }

  @Memoize()
  get fromStringFunctionDeclaration(): FunctionDeclarationStructure {
    if (
      this.nodeKinds.has("BlankNode") &&
      this.nodeKinds.has("NamedNode") &&
      this.in_.length === 0
    ) {
      // Wrap rdfjsResource.Resource.Identifier.fromString
      return {
        isExported: true,
        kind: StructureKind.Function,
        name: "fromString",
        parameters: [
          {
            name: "identifier",
            type: "string",
          },
        ],
        returnType: "purify.Either<Error, rdfjsResource.Resource.Identifier>",
        statements: [
          `return purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory: ${this.dataFactoryVariable}, identifier }));`,
        ],
      };
    }

    const expressions: string[] = [
      `purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory: ${this.dataFactoryVariable}, identifier }))`,
    ];

    if (this.isNamedNodeKind) {
      expressions.push(
        `chain((identifier) => (identifier.termType === "NamedNode") ? purify.Either.of(identifier) : purify.Left(new Error("expected identifier to be NamedNode")))`,
      );

      if (this.in_.length > 0) {
        expressions.push(
          `chain((identifier) => { switch (identifier.value) { ${this.in_.map((iri) => `case "${iri.value}": return purify.Either.of(identifier as rdfjs.NamedNode<"${iri.value}">);`).join(" ")} default: return purify.Left(new Error("expected NamedNode identifier to be one of ${this.in_.map((iri) => iri.value).join(" ")}")); } })`,
        );
      }
    }

    return {
      isExported: true,
      kind: StructureKind.Function,
      name: "fromString",
      parameters: [
        {
          name: "identifier",
          type: "string",
        },
      ],
      returnType: "purify.Either<Error, Identifier>",
      statements: [
        `return ${expressions.join(".")} as purify.Either<Error, Identifier>;`,
      ],
    };
  }

  override get graphqlName(): string {
    return "graphql.GraphQLString";
  }

  @Memoize()
  get isNamedNodeKind(): boolean {
    return this.nodeKinds.size === 1 && this.nodeKinds.has("NamedNode");
  }

  @Memoize()
  override get jsonName(): string {
    if (this.in_.length > 0 && this.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return `{ readonly "@id": ${this.in_.map((iri) => `"${iri.value}"`).join(" | ")} }`;
    }

    return `{ readonly "@id": string }`;
  }

  @Memoize()
  override get name(): string {
    if (this.in_.length > 0 && this.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return `rdfjs.NamedNode<${this.in_
        .map((iri) => `"${iri.value}"`)
        .join(" | ")}>`;
    }

    return `(${[...this.nodeKinds]
      .map((nodeKind) => `rdfjs.${nodeKind}`)
      .join(" | ")})`;
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
            "// biome-ignore lint/suspicious/noShadowRestrictedNames:",
          name: "toString",
        },
      ],
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    TermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): string {
    const valueToBlankNode = `${this.dataFactoryVariable}.blankNode(${variables.value}["@id"].substring(2))`;
    const valueToNamedNode = `${this.dataFactoryVariable}.namedNode(${variables.value}["@id"])`;

    if (this.nodeKinds.size === 2) {
      return `(${variables.value}["@id"].startsWith("_:") ? ${valueToBlankNode} : ${valueToNamedNode})`;
    }
    switch ([...this.nodeKinds][0]) {
      case "BlankNode":
        return valueToBlankNode;
      case "NamedNode":
        return valueToNamedNode;
    }
  }

  override graphqlResolveExpression({
    variables: { value },
  }: Parameters<Type["graphqlResolveExpression"]>[0]): string {
    return `rdfjsResource.Resource.Identifier.toString(${value})`;
  }

  override jsonZodSchema({
    variables,
  }: Parameters<
    TermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  >[0]): ReturnType<
    TermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  > {
    let idSchema: string;
    if (this.in_.length > 0 && this.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      idSchema = `${variables.zod}.enum(${JSON.stringify(this.in_.map((iri) => iri.value))})`;
    } else {
      idSchema = `${variables.zod}.string().min(1)`;
    }

    return `${variables.zod}.object({ "@id": ${idSchema} })`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<
    TermType<NamedNode, BlankNode | NamedNode>["toJsonExpression"]
  >[0]): string {
    const valueToBlankNode = `{ "@id": \`_:\${${variables.value}.value}\` }`;
    const valueToNamedNode = `{ "@id": ${variables.value}.value }`;
    if (this.nodeKinds.size === 2) {
      return `(${variables.value}.termType === "BlankNode" ? ${valueToBlankNode} : ${valueToNamedNode})`;
    }
    switch ([...this.nodeKinds][0]) {
      case "BlankNode":
        return valueToBlankNode;
      case "NamedNode":
        return valueToNamedNode;
    }
  }

  protected override propertyFromRdfResourceValueExpression({
    variables,
  }: Parameters<
    TermType<
      NamedNode,
      BlankNode | NamedNode
    >["propertyFromRdfResourceValueExpression"]
  >[0]): string {
    if (this.nodeKinds.size === 2) {
      return `${variables.resourceValue}.toIdentifier()`;
    }

    if (this.isNamedNodeKind) {
      let expression = `${variables.resourceValue}.toIri()`;
      if (this.in_.length > 0) {
        expression = `${expression}.chain(iri => { switch (iri.value) { ${this.in_.map((iri) => `case "${iri.value}": return purify.Either.of<rdfjsResource.Resource.ValueError, ${this.name}>(iri as rdfjs.NamedNode<"${iri.value}">);`).join(" ")} default: return purify.Left(new rdfjsResource.Resource.MistypedValueError({ actualValue: iri, expectedValueType: ${JSON.stringify(this.name)}, focusResource: ${variables.resource}, predicate: ${variables.predicate} })); } } )`;
      }
      return expression;
    }

    throw new Error(`not implemented: ${this.name}`);
  }
}

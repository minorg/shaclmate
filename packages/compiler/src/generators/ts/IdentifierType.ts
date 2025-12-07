import type { BlankNode, NamedNode } from "@rdfjs/types";

import {
  type FunctionDeclarationStructure,
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import type { AbstractType } from "./AbstractType.js";
import { Type } from "./Type.js";

export class IdentifierType extends AbstractTermType<
  NamedNode,
  BlankNode | NamedNode
> {
  readonly kind = "IdentifierType";

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    return super.conversions.concat([
      {
        conversionExpression: (value) => `dataFactory.namedNode(${value})`,
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
          "return purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory, identifier }));",
        ],
      };
    }

    const expressions: string[] = [
      "purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory, identifier }))",
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
      returnType: `purify.Either<Error, ${this.name}>`,
      statements: [
        `return ${expressions.join(".")} as purify.Either<Error, ${this.name}>;`,
      ],
    };
  }

  @Memoize()
  override get graphqlName(): Type.GraphqlName {
    return new Type.GraphqlName("graphql.GraphQLString");
  }

  @Memoize()
  get isNamedNodeKind(): boolean {
    return this.nodeKinds.size === 1 && this.nodeKinds.has("NamedNode");
  }

  @Memoize()
  override jsonName(
    parameters?: Parameters<AbstractType["jsonName"]>[0],
  ): Type.JsonName {
    const discriminatorProperty = parameters?.includeDiscriminatorProperty
      ? `, readonly termType: "BlankNode" | "NamedNode"`
      : "";

    if (this.in_.length > 0 && this.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return new Type.JsonName(
        `{ readonly "@id": ${this.in_.map((iri) => `"${iri.value}"`).join(" | ")}${discriminatorProperty} }`,
      );
    }

    return new Type.JsonName(
      `{ readonly "@id": string${discriminatorProperty} }`,
    );
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
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): string {
    const valueToBlankNode = `dataFactory.blankNode(${variables.value}["@id"].substring(2))`;
    const valueToNamedNode = `dataFactory.namedNode(${variables.value}["@id"])`;

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

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractTermType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractTermType["fromRdfExpressionChain"]
  > {
    let valueToExpression: string;
    if (this.nodeKinds.size === 2) {
      valueToExpression = "value.toIdentifier()";
    } else if (this.isNamedNodeKind) {
      valueToExpression = "value.toIri()";
      if (this.in_.length > 0) {
        const eitherTypeParameters = `<Error, ${this.name}>`;
        valueToExpression = `${valueToExpression}.chain(iri => { switch (iri.value) { ${this.in_.map((iri) => `case "${iri.value}": return purify.Either.of${eitherTypeParameters}(iri as rdfjs.NamedNode<"${iri.value}">);`).join(" ")} default: return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedTermValueError({ actualValue: iri, expectedValueType: ${JSON.stringify(this.name)}, focusResource: ${variables.resource}, predicate: ${variables.predicate} })); } } )`;
      }
    } else {
      throw new Error("not implemented");
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: `chain(values => values.chainMap(value => ${valueToExpression}))`,
    };
  }

  override graphqlResolveExpression({
    variables: { value },
  }: Parameters<AbstractType["graphqlResolveExpression"]>[0]): string {
    return `rdfjsResource.Resource.Identifier.toString(${value})`;
  }

  override jsonZodSchema({
    includeDiscriminatorProperty,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  >[0]): ReturnType<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  > {
    let idSchema: string;
    if (this.in_.length > 0 && this.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      idSchema = `${variables.zod}.enum(${JSON.stringify(this.in_.map((iri) => iri.value))})`;
    } else {
      idSchema = `${variables.zod}.string().min(1)`;
    }

    const discriminatorProperty = includeDiscriminatorProperty
      ? `, termType: ${this.nodeKinds.size === 1 ? `${variables.zod}.literal("${[...this.nodeKinds][0]}")` : `${variables.zod}.enum(${JSON.stringify([...this.nodeKinds])})`}`
      : "";

    return `${variables.zod}.object({ "@id": ${idSchema}${discriminatorProperty} })`;
  }

  override toJsonExpression({
    includeDiscriminatorProperty,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["toJsonExpression"]
  >[0]): string {
    const discriminatorProperty = includeDiscriminatorProperty
      ? `, termType: ${variables.value}.termType as ${[...this.nodeKinds].map((nodeKind) => `"${nodeKind}"`).join(" | ")}`
      : "";
    const valueToBlankNode = `{ "@id": \`_:\${${variables.value}.value}\`${discriminatorProperty} }`;
    const valueToNamedNode = `{ "@id": ${variables.value}.value${discriminatorProperty} }`;
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
}

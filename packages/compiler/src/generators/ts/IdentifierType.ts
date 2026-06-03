import type { BlankNode, NamedNode } from "@rdfjs/types";
import { type IdentifierNodeKind, NodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class IdentifierType extends AbstractIdentifierType<
  BlankNode | NamedNode
> {
  protected override readonly inlineExpression =
    code`(${this.reusables.imports.BlankNode} | ${this.reusables.imports.NamedNode})`;

  override readonly conversionFunction: Maybe<AbstractIdentifierType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToIdentifier}`,
      sourceTypes: [
        {
          expression: code`${this.reusables.imports.BlankNode}`,
          jsType: this.jsTypes[0],
        },
        {
          expression: code`${this.reusables.imports.NamedNode}`,
          jsType: this.jsTypes[0],
        },
        {
          // To NamedNode
          expression: code`string`,
          jsType: { typeof: "string" },
        },
        {
          // To BlankNode
          expression: code`undefined`,
          jsType: { typeof: "undefined" },
        },
      ],
    });
  override readonly filterFunction =
    code`${this.reusables.snippets.filterIdentifier}`;
  override readonly filterType =
    code`${this.reusables.snippets.IdentifierFilter}`;
  override readonly kind = "Identifier";
  override readonly nodeKinds = nodeKinds;
  override readonly parseFunction =
    code`${this.reusables.snippets.parseIdentifier};`;
  override readonly schemaType =
    code`${this.reusables.snippets.IdentifierSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.identifierSparqlWherePatterns}`;

  constructor(
    parameters: Omit<
      ConstructorParameters<
        typeof AbstractIdentifierType<BlankNode | NamedNode>
      >[0],
      "hasValues" | "in_"
    >,
  ) {
    super({
      ...parameters,
      hasValues: [],
      in_: [],
    });
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>((${variables.value}["@id"].startsWith("_:") ? ${this.reusables.imports.dataFactory}.blankNode(${variables.value}["@id"].substring(2)) : ${this.reusables.imports.dataFactory}.namedNode(${variables.value}["@id"])))`;
  }

  override jsonSchema({
    includeDiscriminantProperty,
  }: Parameters<
    AbstractIdentifierType<BlankNode | NamedNode>["jsonSchema"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${this.reusables.imports.z}.enum(${arrayOf(...this.nodeKinds)})`
      : "";

    return code`${this.reusables.imports.z}.object({ "@id": ${this.reusables.imports.z}.string().min(1)${discriminantProperty} })`;
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<
      AbstractIdentifierType<BlankNode | NamedNode>["jsonType"]
    >[0],
  ): AbstractIdentifierType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "BlankNode" | "NamedNode"`
      : "";

    return new AbstractIdentifierType.JsonType(
      code`{ readonly "@id": string${discriminantProperty} }`,
    );
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode | NamedNode>["toJsonExpression"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${variables.value}.termType as ${[...this.nodeKinds].map((nodeKind) => `"${NodeKind.toTermType(nodeKind)}"`).join(" | ")}`
      : "";
    const valueToBlankNode = code`{ "@id": \`_:\${${variables.value}.value}\`${discriminantProperty} }`;
    const valueToNamedNode = code`{ "@id": ${variables.value}.value${discriminantProperty} }`;
    return code`(${variables.value}.termType === "BlankNode" ? ${valueToBlankNode} : ${valueToNamedNode})`;
  }

  // protected override fromRdfResourceValuesExpressionChain({
  //   variables,
  // }: Parameters<
  //   AbstractIdentifierType<
  //     BlankNode | NamedNode
  //   >["fromRdfResourceValuesExpressionChain"]
  // >[0]): ReturnType<
  //   AbstractIdentifierType<
  //     BlankNode | NamedNode
  //   >["fromRdfResourceValuesExpressionChain"]
  // > {
  //   return {
  //     ...super.fromRdfResourceValuesExpressionChain({ variables }),
  //     valueTo: code`chain(values => values.chainMap(value => value.toIdentifier()))`,
  //   };
  // }
}

const nodeKinds: ReadonlySet<IdentifierNodeKind> = new Set([
  "BlankNode",
  "IRI",
]);

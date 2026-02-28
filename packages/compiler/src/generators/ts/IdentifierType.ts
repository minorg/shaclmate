import type { BlankNode, NamedNode } from "@rdfjs/types";
import { type IdentifierNodeKind, NodeKind } from "@shaclmate/shacl-ast";
import { Memoize } from "typescript-memoize";
import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class IdentifierType extends AbstractIdentifierType<
  BlankNode | NamedNode
> {
  override readonly filterFunction = code`${snippets.filterIdentifier}`;
  override readonly filterType = code`${snippets.IdentifierFilter}`;
  override readonly fromStringFunction =
    code`export const fromString = ${snippets.identifierFromString};`;
  override readonly kind = "IdentifierType";
  override readonly name = code`(${imports.BlankNode} | ${imports.NamedNode})`;
  override readonly nodeKinds = nodeKinds;
  override readonly schemaType = code`${snippets.IdentifierSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${snippets.identifierSparqlWherePatterns}`;

  constructor(
    parameters: Pick<
      ConstructorParameters<
        typeof AbstractIdentifierType<BlankNode | NamedNode>
      >[0],
      "comment" | "label"
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
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): Code {
    return code`(${variables.value}["@id"].startsWith("_:") ? ${imports.dataFactory}.blankNode(${variables.value}["@id"].substring(2)) : ${imports.dataFactory}.namedNode(${variables.value}["@id"]))`;
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractTermType["jsonType"]>[0],
  ): AbstractTermType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "BlankNode" | "NamedNode"`
      : "";

    return new AbstractTermType.JsonType(
      code`{ readonly "@id": string${discriminantProperty} }`,
    );
  }

  override jsonZodSchema({
    includeDiscriminantProperty,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${imports.z}.enum(${arrayOf(...this.nodeKinds)})`
      : "";

    return code`${imports.z}.object({ "@id": ${imports.z}.string().min(1)${discriminantProperty} })`;
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["toJsonExpression"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${variables.value}.termType as ${[...this.nodeKinds].map((nodeKind) => `"${NodeKind.toTermType(nodeKind)}"`).join(" | ")}`
      : "";
    const valueToBlankNode = code`{ "@id": \`_:\${${variables.value}.value}\`${discriminantProperty} }`;
    const valueToNamedNode = code`{ "@id": ${variables.value}.value${discriminantProperty} }`;
    return code`(${variables.value}.termType === "BlankNode" ? ${valueToBlankNode} : ${valueToNamedNode})`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractTermType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractTermType["fromRdfExpressionChain"]
  > {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toIdentifier()))`,
    };
  }
}

const nodeKinds: ReadonlySet<IdentifierNodeKind> = new Set([
  "BlankNode",
  "IRI",
]);

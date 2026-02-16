import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Memoize } from "typescript-memoize";
import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BlankNodeType extends AbstractIdentifierType<BlankNode> {
  readonly filterFunction = code`${snippets.filterBlankNode}`;
  readonly filterType = code`${snippets.BlankNodeFilter}`;
  readonly fromStringFunction =
    code`export const fromString = ${snippets.blankNodeFromString};`;
  readonly kind = "BlankNodeType";
  readonly name = code`${imports.BlankNode}`;
  readonly schemaType = code`${snippets.BlankNodeSchema}`;
  readonly sparqlWherePatternsFunction =
    code`${snippets.blankNodeSparqlWherePatterns}`;

  constructor(
    superParameters: Pick<
      ConstructorParameters<typeof AbstractIdentifierType<BlankNode>>[0],
      "comment" | "label"
    >,
  ) {
    super({
      ...superParameters,
      hasValues: [],
      in_: [],
      nodeKinds,
    });
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): Code {
    return code`${imports.dataFactory}.blankNode(${variables.value}["@id"].substring(2))`;
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractTermType["jsonType"]>[0],
  ): AbstractTermType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "BlankNode"`
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
      ? code`, termType: ${imports.z}.literal("BlankNode")`
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
      ? code`, termType: ${variables.value}.termType`
      : "";
    return code`{ "@id": \`_:\${${variables.value}.value}\`${discriminantProperty} }`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractTermType["fromRdfExpressionChain"]>[0]) {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toBlankNode()))`,
    };
  }
}

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

import type { BlankNode, NamedNode } from "@rdfjs/types";

import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { imports } from "./imports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class BlankNodeType extends AbstractIdentifierType<BlankNode> {
  readonly filterFunction = code`${localSnippets.filterBlankNode}`;
  readonly filterType = code`${localSnippets.BlankNodeFilter}`;
  readonly fromStringFunction = code`${localSnippets.blankNodeFromString}`;
  readonly kind = "BlankNodeType";
  readonly name = code`${imports.BlankNode}`;
  readonly schemaType = code`${localSnippets.BlankNodeSchema}`;
  readonly sparqlWherePatternsFunction =
    code`${localSnippets.blankNodeSparqlWherePatterns}`;

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
      ? `, termType: ${imports.z}.literal("BlankNode")`
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
      ? `, termType: ${variables.value}.termType`
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

namespace localSnippets {
  export const BlankNodeFilter = conditionalOutput(
    `${syntheticNamePrefix}BlankNodeFilter`,
    code`\
interface ${syntheticNamePrefix}BlankNodeFilter {
}`,
  );

  export const blankNodeFromString = conditionalOutput(
    `${syntheticNamePrefix}blankNodeFromString`,
    code`\
export function ${syntheticNamePrefix}blankNodeFromString(identifier: string): ${imports.Either}<Error, ${imports.BlankNode}> {
    return \
      ${imports.Either}.encase(() => ${imports.Resource}.Identifier.fromString({ ${imports.dataFactory}, identifier }))
      .chain((identifier) => (identifier.termType === "BlankNode") ? ${imports.Either}.of(identifier) : ${imports.Left}(new Error("expected identifier to be BlankNode")))
      as ${imports.Either}<Error, ${imports.BlankNode}>;
}`,
  );

  export const BlankNodeSchema = conditionalOutput(
    `${syntheticNamePrefix}BlankNodeSchema`,
    code`\
interface ${syntheticNamePrefix}BlankNodeSchema {
}`,
  );

  export const blankNodeSparqlWherePatterns = conditionalOutput(
    `${syntheticNamePrefix}blankNodeSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}blankNodeSparqlWherePatterns: ${sharedSnippets.SparqlWherePatternsFunction}<${BlankNodeFilter}, ${BlankNodeSchema}> =
  ({ propertyPatterns }) => propertyPatterns;`,
  );

  export const filterBlankNode = conditionalOutput(
    `${syntheticNamePrefix}filterBlankNode`,
    code`\
function ${syntheticNamePrefix}filterBlankNode(_filter: ${localSnippets.BlankNodeFilter}, _value: ${imports.BlankNode}) {
  return true;
}`,
  );
}

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

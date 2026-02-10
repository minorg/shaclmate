import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";

import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class IdentifierType extends AbstractIdentifierType<
  BlankNode | NamedNode
> {
  override readonly filterFunction = code`${localSnippets.filterIdentifier}`;
  override readonly filterType = code`${localSnippets.IdentifierFilter}`;
  override readonly fromStringFunction =
    code`${localSnippets.identifierFromString}`;
  override readonly kind = "IdentifierType";
  override readonly name =
    code`(${sharedImports.BlankNode} | ${sharedImports.NamedNode})`;
  override readonly schemaType = code`${localSnippets.IdentifierSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${localSnippets.identifierSparqlWherePatterns}`;

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
      nodeKinds,
    });
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): Code {
    return code`(${variables.value}["@id"].startsWith("_:") ? ${sharedImports.dataFactory}.blankNode(${variables.value}["@id"].substring(2)) : ${sharedImports.dataFactory}.namedNode(${variables.value}["@id"]))`;
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
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.zod}.enum(${JSON.stringify([...this.nodeKinds])})`
      : "";

    return code`${variables.zod}.object({ "@id": ${variables.zod}.string().min(1)${discriminantProperty} })`;
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["toJsonExpression"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.value}.termType as ${[...this.nodeKinds].map((nodeKind) => `"${nodeKind}"`).join(" | ")}`
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

namespace localSnippets {
  export const IdentifierFilter = conditionalOutput(
    `${syntheticNamePrefix}IdentifierFilter`,
    code`\
interface ${syntheticNamePrefix}IdentifierFilter {
  readonly in?: readonly (${sharedImports.BlankNode} | ${sharedImports.NamedNode})[];
  readonly type?: "BlankNode" | "NamedNode";
}`,
  );

  export const IdentifierSchema = conditionalOutput(
    `${syntheticNamePrefix}IdentifierSchema`,
    code`\
interface ${syntheticNamePrefix}IdentifierSchema {
  readonly kind: "IdentifierType";
}`,
  );

  export const filterIdentifier = conditionalOutput(
    `${syntheticNamePrefix}filterIdentifier`,
    code`\
function ${syntheticNamePrefix}filterIdentifier(filter: ${localSnippets.IdentifierFilter}, value: ${sharedImports.BlankNode} | ${sharedImports.NamedNode}) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  if (typeof filter.type !== "undefined" && value.termType !== filter.type) {
    return false;
  }

  return true;
}`,
  );

  export const identifierFromString = conditionalOutput(
    `${syntheticNamePrefix}identifierFromString`,
    code`\
function ${syntheticNamePrefix}identifierFromString(identifier: string): ${sharedImports.Either}<Error, ${sharedImports.BlankNode} | ${sharedImports.NamedNode}> {
  return ${sharedImports.Either}.encase(() => ${sharedImports.Resource}.Identifier.fromString({ ${sharedImports.dataFactory}, identifier }));
}`,
  );

  export const identifierSparqlWherePatterns = conditionalOutput(
    `${syntheticNamePrefix}identifierSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}identifierSparqlWherePatterns: ${sharedSnippets.SparqlWherePatternsFunction}<${IdentifierFilter}, ${IdentifierSchema}> =
  ({ filter, propertyPatterns, valueVariable }) => {
    const patterns: ${sharedSnippets.SparqlPattern}[] = propertyPatterns.concat();

    if (filter) {
      if (typeof filter.in !== "undefined") {
        const valueIn = filter.in.filter(identifier => identifier.termType === "NamedNode");
        if (valueIn.length > 0) {
          patterns.push(${sharedSnippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn }));
        }
      }

      if (typeof filter.type !== "undefined") {
        patterns.push({
          expression: {
            type: "operation",
            operator: filter.type === "BlankNode" ? "isBlank" : "isIRI",
            args: [valueVariable],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return patterns;
  }`,
  );
}

const nodeKinds: ReadonlySet<IdentifierNodeKind> = new Set([
  "BlankNode",
  "NamedNode",
]);

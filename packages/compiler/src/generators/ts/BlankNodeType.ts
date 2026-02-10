import type { BlankNode, NamedNode } from "@rdfjs/types";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

const localSnippets = {
  BlankNodeFilter: conditionalOutput(
    `${syntheticNamePrefix}BlankNodeFilter`,
    code`\
interface ${syntheticNamePrefix}BlankNodeFilter {
}`,
  ),
};

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

export class BlankNodeType extends AbstractIdentifierType<BlankNode> {
  readonly kind = "BlankNodeType";

  readonly filterFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}filterBlankNode`,
    code`\
function ${syntheticNamePrefix}filterBlankNode(_filter: ${localSnippets.BlankNodeFilter}, _value: ${sharedImports.BlankNode}) {
  return true;
}`,
  )}`;

  readonly filterType = code`${localSnippets.BlankNodeFilter}`;

  readonly name = code`${sharedImports.BlankNode}`;

  readonly sparqlWherePatternsFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}blankNodeSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}blankNodeSparqlWherePatterns: ${sharedSnippets.SparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> =
  ({ propertyPatterns }) => propertyPatterns;`,
  )}`;

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
    return code`${sharedImports.dataFactory}.blankNode(${variables.value}["@id"].substring(2))`;
  }

  @Memoize()
  get fromStringFunctionDeclaration(): Code {
    return code`\
export function fromString(identifier: string): ${sharedImports.Either}<Error, ${this.name}> {
    return \
      ${sharedImports.Either}.encase(() => ${sharedImports.Resource}.Identifier.fromString({ ${sharedImports.dataFactory}, identifier }))
      .chain((identifier) => (identifier.termType === "BlankNode") ? ${sharedImports.Either}.of(identifier) : ${sharedImports.Left}(new Error("expected identifier to be BlankNode")))
      as ${sharedImports.Either}<Error, ${this.name}>;
}`;
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
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.zod}.literal("BlankNode")`
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

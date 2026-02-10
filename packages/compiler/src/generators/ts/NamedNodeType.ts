import type { BlankNode, NamedNode } from "@rdfjs/types";

import { type Code, code, conditionalOutput, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { sharedImports } from "./sharedImports.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class NamedNodeType extends AbstractIdentifierType<NamedNode> {
  override readonly filterFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}filterNamedNode`,
    code`\
function ${syntheticNamePrefix}filterNamedNode(filter: ${localSnippets.NamedNodeFilter}, value: ${sharedImports.NamedNode}) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  return true;
}`,
  )}`;
  override readonly filterType = code`${localSnippets.NamedNodeFilter}`;
  readonly kind = "NamedNodeType";
  override readonly sparqlWherePatternsFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}namedNodeSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}namedNodeSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${this.filterType}, ${this.schemaType}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${syntheticNamePrefix}SparqlFilterPattern[] = [];

    if (typeof filter?.in !== "undefined" && filter.in.length > 0) {
      filterPatterns.push(${syntheticNamePrefix}sparqlValueInPattern({ lift: true, valueVariable, valueIn: filter.in }));
    }

    return ${syntheticNamePrefix}termSchemaSparqlWherePatterns({ filterPatterns, valueVariable, ...otherParameters });
  }`,
  )}`;

  constructor(
    parameters: Omit<
      ConstructorParameters<typeof AbstractIdentifierType<NamedNode>>[0],
      "nodeKinds"
    >,
  ) {
    super({ ...parameters, nodeKinds });
  }

  @Memoize()
  get fromStringFunctionDeclaration(): Code {
    const expressions: Code[] = [
      code`${sharedImports.Either}.encase(() => ${sharedImports.Resource}.Identifier.fromString({ ${sharedImports.dataFactory}, identifier }))`,
      code`chain((identifier) => (identifier.termType === "NamedNode") ? ${sharedImports.Either}.of(identifier) : ${sharedImports.Left}(new Error("expected identifier to be NamedNode")))`,
    ];

    if (this.in_.length > 0) {
      expressions.push(
        code`chain((identifier) => { switch (identifier.value) { ${joinCode(this.in_.map((iri) => code`case "${iri.value}": return ${sharedImports.Either}.of(identifier as ${sharedImports.NamedNode}<"${iri.value}">);`))} default: return ${sharedImports.Left}(new Error("expected NamedNode identifier to be one of ${this.in_.map((iri) => iri.value).join(" ")}")); } })`,
      );
    }

    return code`\
export function fromString(identifier: string): ${sharedImports.Either}<Error, ${this.name}> {
  return ${joinCode(expressions, { on: "." })} as ${sharedImports.Either}<Error, ${this.name}>;
}`;
  }

  @Memoize()
  override get name(): Code {
    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return code`${sharedImports.NamedNode}<${this.in_
        .map((iri) => `"${iri.value}"`)
        .join(" | ")}>`;
    }

    return code`${sharedImports.NamedNode}`;
  }

  override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "in?": "readonly rdfjs.NamedNode[]",
    };
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in:
        this.in_.length > 0
          ? this.in_.map(rdfjsTermExpression).concat()
          : undefined,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): Code {
    return code`${sharedImports.dataFactory}.namedNode(${variables.value}["@id"])`;
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractTermType["jsonType"]>[0],
  ): AbstractTermType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "NamedNode"`
      : "";

    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return new AbstractTermType.JsonType(
        code`{ readonly "@id": ${this.in_.map((iri) => `"${iri.value}"`).join(" | ")}${discriminantProperty} }`,
      );
    }

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
    let idSchema: string;
    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      idSchema = `${variables.zod}.enum(${JSON.stringify(this.in_.map((iri) => iri.value))})`;
    } else {
      idSchema = `${variables.zod}.string().min(1)`;
    }

    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.zod}.literal("NamedNode")`
      : "";

    return code`${variables.zod}.object({ "@id": ${idSchema}${discriminantProperty} })`;
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
    return code`{ "@id": ${variables.value}.value${discriminantProperty} }`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractTermType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractTermType["fromRdfExpressionChain"]
  > {
    let valueToExpression = "value.toIri()";
    if (this.in_.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      valueToExpression = `${valueToExpression}.chain(iri => { switch (iri.value) { ${this.in_.map((iri) => `case "${iri.value}": return purify.Either.of${eitherTypeParameters}(iri as rdfjs.NamedNode<"${iri.value}">);`).join(" ")} default: return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedTermValueError({ actualValue: iri, expectedValueType: ${JSON.stringify(this.name)}, focusResource: ${variables.resource}, predicate: ${variables.predicate} })); } } )`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => ${valueToExpression}))`,
    };
  }
}

const localSnippets = {
  NamedNodeFilter: conditionalOutput(
    `${syntheticNamePrefix}NamedNodeFilter`,
    code`\
interface ${syntheticNamePrefix}NamedNodeFilter {
  readonly in?: readonly ${sharedImports.NamedNode}[];
}`,
  ),
};
const nodeKinds: ReadonlySet<"NamedNode"> = new Set(["NamedNode"]);

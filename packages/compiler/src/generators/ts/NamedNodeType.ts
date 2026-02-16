import type { BlankNode, NamedNode } from "@rdfjs/types";

import { type Code, code, joinCode, literalOf } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";

export class NamedNodeType extends AbstractIdentifierType<NamedNode> {
  override readonly filterFunction = code`${snippets.filterNamedNode}`;
  override readonly filterType = code`${snippets.NamedNodeFilter}`;
  readonly kind = "NamedNodeType";
  override readonly schemaType = code`${snippets.NamedNodeSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${snippets.namedNodeSparqlWherePatterns}`;

  constructor(
    parameters: Omit<
      ConstructorParameters<typeof AbstractIdentifierType<NamedNode>>[0],
      "nodeKinds"
    >,
  ) {
    super({ ...parameters, nodeKinds });
  }

  @Memoize()
  get fromStringFunction(): Code {
    const expressions: Code[] = [
      code`${imports.Either}.encase(() => ${imports.Resource}.Identifier.fromString({ ${imports.dataFactory}, identifier }))`,
      code`chain((identifier) => (identifier.termType === "NamedNode") ? ${imports.Either}.of(identifier) : ${imports.Left}(new Error("expected identifier to be NamedNode")))`,
    ];

    if (this.in_.length > 0) {
      expressions.push(
        code`chain((identifier) => { switch (identifier.value) { ${joinCode(this.in_.map((iri) => code`case "${iri.value}": return ${imports.Either}.of(identifier as ${imports.NamedNode}<"${iri.value}">);`))} default: return ${imports.Left}(new Error("expected NamedNode identifier to be one of ${this.in_.map((iri) => iri.value).join(" ")}")); } })`,
      );
    }

    return code`\
export function fromString(identifier: string): ${imports.Either}<Error, ${this.name}> {
  return ${joinCode(expressions, { on: "." })} as ${imports.Either}<Error, ${this.name}>;
}`;
  }

  @Memoize()
  override get name(): Code {
    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return code`${imports.NamedNode}<${this.in_
        .map((iri) => `"${iri.value}"`)
        .join(" | ")}>`;
    }

    return code`${imports.NamedNode}`;
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
    return code`${imports.dataFactory}.namedNode(${variables.value}["@id"])`;
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
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  >[0]): Code {
    let idSchema: Code;
    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      idSchema = code`${imports.z}.enum(${JSON.stringify(this.in_.map((iri) => iri.value))})`;
    } else {
      idSchema = code`${imports.z}.string().min(1)`;
    }

    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${imports.z}.literal("NamedNode")`
      : "";

    return code`${imports.z}.object({ "@id": ${idSchema}${discriminantProperty} })`;
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
    return code`{ "@id": ${variables.value}.value${discriminantProperty} }`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractTermType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractTermType["fromRdfExpressionChain"]
  > {
    let valueToExpression = code`value.toIri()`;
    if (this.in_.length > 0) {
      const eitherTypeParameters = code`<Error, ${this.name}>`;
      valueToExpression = code`${valueToExpression}.chain(iri => { switch (iri.value) { ${joinCode(
        this.in_.map(
          (iri) =>
            code`case "${iri.value}": return ${imports.Either}.of${eitherTypeParameters}(iri as ${imports.NamedNode}<"${iri.value}">);`,
        ),
        { on: " " },
      )} default: return ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError({ actualValue: iri, expectedValueType: ${literalOf(this.name)}, focusResource: ${variables.resource}, predicate: ${variables.predicate} })); } } )`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => ${valueToExpression}))`,
    };
  }
}

const nodeKinds: ReadonlySet<"NamedNode"> = new Set(["NamedNode"]);

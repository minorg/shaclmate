import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Memoize } from "typescript-memoize";
import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";

import { arrayOf, type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class IriType extends AbstractIdentifierType<NamedNode> {
  override readonly filterFunction = code`${this.reusables.snippets.filterIri}`;
  override readonly filterType = code`${this.reusables.snippets.IriFilter}`;
  override readonly kind = "IriType";
  override readonly nodeKinds = nodeKinds;
  override readonly schemaType = code`${this.reusables.snippets.IriSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.iriSparqlWherePatterns}`;

  @Memoize()
  get parseFunction(): Code {
    if (this.in_.length > 0) {
      return code`(identifier: string) => ${this.reusables.snippets.parseIri}(identifier).chain((identifier) => { switch (identifier.value) { ${joinCode(this.in_.map((iri) => code`case "${iri.value}": return ${this.reusables.imports.Right}(identifier as ${this.name});`))} default: return ${this.reusables.imports.Left}(new Error("expected NamedNode identifier to be one of ${this.in_.map((iri) => iri.value).join(" ")}")); } })`;
    }
    return code`${this.reusables.snippets.parseIri}`;
  }

  @Memoize()
  override get name(): Code {
    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return code`${this.reusables.imports.NamedNode}<${this.in_
        .map((iri) => `"${iri.value}"`)
        .join(" | ")}>`;
    }

    return code`${this.reusables.imports.NamedNode}`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in:
        this.in_.length > 0
          ? this.in_.map((in_) => this.rdfjsTermExpression(in_)).concat()
          : undefined,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): Code {
    return code`${this.reusables.imports.dataFactory}.namedNode(${variables.value}["@id"])`;
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

  override jsonSchema({
    includeDiscriminantProperty,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonSchema"]
  >[0]): Code {
    let idSchema: Code;
    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      idSchema = code`${this.reusables.imports.z}.enum(${arrayOf(...this.in_.map((iri) => iri.value))})`;
    } else {
      idSchema = code`${this.reusables.imports.z}.string().min(1)`;
    }

    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${this.reusables.imports.z}.literal("NamedNode")`
      : "";

    return code`${this.reusables.imports.z}.object({ "@id": ${idSchema}${discriminantProperty} })`;
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
    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toIri(${
        this.in_.length > 0
          ? code`[${joinCode(
              this.in_.map((in_) => this.rdfjsTermExpression(in_)),
              { on: ", " },
            )}]`
          : ""
      })))`,
    };
  }
}

const nodeKinds: ReadonlySet<"IRI"> = new Set(["IRI"]);

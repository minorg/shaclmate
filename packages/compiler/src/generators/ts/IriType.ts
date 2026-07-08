import type { NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { arrayOf, type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class IriType extends AbstractIdentifierType<NamedNode> {
  override readonly filterFunction = code`${this.reusables.snippets.filterIri}`;
  override readonly filterType = code`${this.reusables.snippets.IriFilter}`;
  override readonly kind = "Iri";
  override readonly nodeKinds = nodeKinds;
  override readonly schemaType =
    code`${this.reusables.snippets.IriSchema}<${this.valueTypeExpression}>`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.iriSparqlWherePatterns}`;

  @Memoize()
  override get conversionFunction(): Maybe<AbstractIdentifierType.ConversionFunction> {
    invariant(this.jsTypes.length === 1);
    return Maybe.of({
      code: code`${this.reusables.snippets.convertToIri}<${this.valueTypeExpression}>`,
      sourceTypes: [
        {
          expression: this.valueTypeExpression,
          jsType: { typeof: "string" },
        },
        {
          expression: this.expression,
          jsType: this.jsTypes[0],
        },
      ],
    });
  }

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.iriFromRdfResourceValues}<${this.valueTypeExpression}>`;
  }

  @Memoize()
  get parseFunction(): Code {
    if (this.in_.length > 0) {
      return code`(identifier: string) => ${this.reusables.snippets.parseIri}(identifier).chain((identifier) => { switch (identifier.value) { ${joinCode(this.in_.map((iri) => code`case "${iri.value}": return ${this.reusables.imports.Right}(identifier as ${this.expression});`))} default: return ${this.reusables.imports.Left}(new Error("expected NamedNode identifier to be one of ${this.in_.map((iri) => iri.value).join(" ")}")); } })`;
    }
    return code`${this.reusables.snippets.parseIri}`;
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    if (this.in_.length > 0) {
      return code`${this.reusables.imports.NamedNode}<${this.inlineValueTypeExpression}>`;
    }

    return code`${this.reusables.imports.NamedNode}`;
  }

  @Memoize()
  protected get inlineValueTypeExpression(): Code {
    return this.in_.length > 0
      ? code`(${this.in_.map((in_) => `"${in_.value}"`).join(" | ")})`
      : code`string`;
  }

  protected override get schemaInitializers() {
    let initializers = super.schemaInitializers;
    if (this.in_.length > 0) {
      initializers = initializers.concat(
        code`in: ${arrayOf(...this.in_.map((in_) => this.rdfjsTermExpression(in_)))}`,
      );
    }
    return initializers;
  }

  @Memoize()
  private get valueTypeExpression(): Code {
    return this.name
      .map((name) => code`${name}["value"]`)
      .orDefaultLazy(() => this.inlineValueTypeExpression);
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractIdentifierType<NamedNode>["fromJsonExpression"]
  >[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${this.reusables.imports.dataFactory}.namedNode(${variables.value}["@id"]))`;
  }

  override jsonSchema({
    includeDiscriminantProperty,
  }: Parameters<AbstractIdentifierType<NamedNode>["jsonSchema"]>[0]): Code {
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

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractIdentifierType<NamedNode>["jsonType"]>[0],
  ): AbstractIdentifierType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "NamedNode"`
      : "";

    return new AbstractIdentifierType.JsonType(
      code`{ readonly "@id": ${this.valueTypeExpression}${discriminantProperty} }`,
    );
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<
    AbstractIdentifierType<NamedNode>["toJsonExpression"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${variables.value}.termType`
      : "";
    return code`{ "@id": ${variables.value}.value${discriminantProperty} }`;
  }
}

const nodeKinds: ReadonlySet<"IRI"> = new Set(["IRI"]);

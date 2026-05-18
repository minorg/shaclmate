import type { BlankNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BlankNodeType extends AbstractIdentifierType<BlankNode> {
  override readonly conversionFunction: Maybe<AbstractIdentifierType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToBlankNode}`,
      sourceTypes: [
        {
          name: code`${this.reusables.imports.BlankNode}`,
          typeof: "object",
        },
        {
          name: "undefined",
          typeof: "undefined",
        },
      ],
    });
  override readonly filterFunction =
    code`${this.reusables.snippets.filterBlankNode}`;
  override readonly filterType =
    code`${this.reusables.snippets.BlankNodeFilter}`;
  override readonly parseFunction =
    code`${this.reusables.snippets.parseBlankNode};`;
  override readonly kind = "BlankNodeType";
  override readonly name = code`${this.reusables.imports.BlankNode}`;
  override readonly nodeKinds = nodeKinds;
  override readonly schemaType =
    code`${this.reusables.snippets.BlankNodeSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.blankNodeSparqlWherePatterns}`;

  constructor(
    superParameters: Omit<
      ConstructorParameters<typeof AbstractIdentifierType<BlankNode>>[0],
      "hasValues" | "in_"
    >,
  ) {
    super({
      ...superParameters,
      hasValues: [],
      in_: [],
    });
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode>["fromJsonExpression"]
  >[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.name}>(${this.reusables.imports.dataFactory}.blankNode(${variables.value}["@id"].substring(2)))`;
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractIdentifierType<BlankNode>["jsonType"]>[0],
  ): AbstractIdentifierType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "BlankNode"`
      : "";

    return new AbstractIdentifierType.JsonType(
      code`{ readonly "@id": string${discriminantProperty} }`,
    );
  }

  override jsonSchema({
    includeDiscriminantProperty,
  }: Parameters<AbstractIdentifierType<BlankNode>["jsonSchema"]>[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${this.reusables.imports.z}.literal("BlankNode")`
      : "";

    return code`${this.reusables.imports.z}.object({ "@id": ${this.reusables.imports.z}.string().min(1)${discriminantProperty} })`;
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode>["toJsonExpression"]
  >[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${variables.value}.termType`
      : "";
    return code`{ "@id": \`_:\${${variables.value}.value}\`${discriminantProperty} }`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode>["fromRdfExpressionChain"]
  >[0]) {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toBlankNode()))`,
    };
  }
}

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

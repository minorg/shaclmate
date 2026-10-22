import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class IdentifierType extends AbstractIdentifierType<
  BlankNode | NamedNode
> {
  protected override readonly inlineExpression =
    code`(${this.reusables.imports.BlankNode} | ${this.reusables.imports.NamedNode})`;

  override readonly conversionFunction: Maybe<AbstractIdentifierType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToIdentifier}`,
      sourceTypes: [
        {
          expression: code`${this.reusables.imports.BlankNode}`,
          jsType: this.jsTypes[0],
        },
        {
          expression: code`${this.reusables.imports.NamedNode}`,
          jsType: this.jsTypes[0],
        },
        {
          // To NamedNode
          expression: code`(keyof ${this.configuration.syntheticNamePrefix}DefaultNamespaceT & string)`,
          jsType: { typeof: "string" },
        },
        {
          // To BlankNode
          expression: code`undefined`,
          jsType: { typeof: "undefined" },
        },
      ],
    });
  override readonly filterFunction = new ReferenceCallable(
    this.reusables.snippets.filterIdentifier,
  );
  override readonly filterType =
    code`${this.reusables.snippets.IdentifierFilter}`;
  override readonly fromRdfResourceValuesFunction = new ReferenceCallable(
    this.reusables.snippets.identifierFromRdfResourceValues,
  );
  override readonly kind = "Identifier";
  override readonly nodeKinds = nodeKinds;
  override readonly parseFunction = new ReferenceCallable(
    this.reusables.snippets.parseIdentifier,
  );
  override readonly schemaType =
    code`${this.reusables.snippets.IdentifierSchema}`;
  override readonly valueSparqlWherePatternsFunction = new ReferenceCallable(
    this.reusables.snippets.identifierSparqlWherePatterns,
  );

  constructor(
    parameters: Omit<
      ConstructorParameters<
        typeof AbstractIdentifierType<BlankNode | NamedNode>
      >[0],
      "hasValues" | "in_"
    >,
  ) {
    super({
      ...parameters,
      hasValues: [],
      in_: [],
    });
  }

  protected override fromCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode | NamedNode>["fromCompactJsonExpression"]
  >[0]): Code {
    return code`(${variables.value}.startsWith("_:") ? ${this.reusables.imports.dataFactory}.blankNode(${variables.value}.substring(2)) : ${this.reusables.imports.dataFactory}.namedNode(${variables.value}))`;
  }

  protected override toCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode | NamedNode>["toCompactJsonExpression"]
  >[0]): Code {
    return code`(${variables.value}.termType === "BlankNode" ? \`_:\${${variables.value}.value}\` : ${variables.value}.value)`;
  }
}

const nodeKinds: ReadonlySet<IdentifierNodeKind> = new Set([
  "BlankNode",
  "IRI",
]);

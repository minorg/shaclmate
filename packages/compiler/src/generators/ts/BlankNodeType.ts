import type { BlankNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { FunctionReference } from "./FunctionReference.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BlankNodeType extends AbstractIdentifierType<BlankNode> {
  protected override readonly inlineExpression =
    code`${this.reusables.imports.BlankNode}`;

  override readonly conversionFunction: Maybe<AbstractIdentifierType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToBlankNode}`,
      sourceTypes: [
        {
          expression: code`${this.reusables.imports.BlankNode}`,
          jsType: this.jsTypes[0],
        },
        {
          expression: code`undefined`,
          jsType: { typeof: "undefined" },
        },
      ],
    });
  override readonly filterFunction = new FunctionReference(
    this.reusables.snippets.filterBlankNode,
  );
  override readonly filterType =
    code`${this.reusables.snippets.BlankNodeFilter}`;
  override readonly fromRdfResourceValuesFunction = new FunctionReference(
    this.reusables.snippets.blankNodeFromRdfResourceValues,
  );
  override readonly kind = "BlankNode";
  override readonly nodeKinds = nodeKinds;
  override readonly parseFunction = new FunctionReference(
    this.reusables.snippets.parseBlankNode,
  );
  override readonly schemaType =
    code`${this.reusables.snippets.BlankNodeSchema}`;
  override readonly valueSparqlWherePatternsFunction = new FunctionReference(
    this.reusables.snippets.blankNodeSparqlWherePatterns,
  );

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

  protected override fromCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode>["fromCompactJsonExpression"]
  >[0]): Code {
    return code`${this.reusables.imports.dataFactory}.blankNode(${variables.value}.substring(2))`;
  }

  protected override toCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractIdentifierType<BlankNode>["toCompactJsonExpression"]
  >[0]): Code {
    return code`\`_:\${${variables.value}.value}\``;
  }
}

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

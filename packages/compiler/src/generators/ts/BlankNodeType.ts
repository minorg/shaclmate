import type { BlankNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { code } from "./ts-poet-wrapper.js";

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
  override readonly filterFunction = new ReferenceCallable(
    this.reusables.snippets.filterBlankNode,
  );
  override readonly filterType =
    code`${this.reusables.snippets.BlankNodeFilter}`;
  override readonly fromCompactedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.blankNodeFromCompactedJson,
  );
  override readonly fromExpandedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.blankNodeFromExpandedJson,
  );
  override readonly fromRdfResourceValuesFunction = new ReferenceCallable(
    this.reusables.snippets.blankNodeFromRdfResourceValues,
  );
  override readonly kind = "BlankNode";
  override readonly nodeKinds = nodeKinds;
  override readonly parseFunction = new ReferenceCallable(
    this.reusables.snippets.parseBlankNode,
  );
  override readonly schemaType =
    code`${this.reusables.snippets.BlankNodeSchema}`;
  override readonly toCompactedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.blankNodeToCompactedJson,
  );
  override readonly toExpandedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.blankNodeToExpandedJson,
  );
  override readonly valueSparqlWherePatternsFunction = new ReferenceCallable(
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
}

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

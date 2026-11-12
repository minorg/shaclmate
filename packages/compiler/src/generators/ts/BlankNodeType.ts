import type { BlankNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import { SchemaObject } from "./SchemaObject.js";
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
  override readonly filterFunction = new BuiltinCallable(
    this.reusables.snippets.filterBlankNode,
  );
  override readonly filterType =
    code`${this.reusables.snippets.BlankNodeFilter}`;
  override readonly fromJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.blankNodeFromJsonObject,
  );
  override readonly fromJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.blankNodeFromJsonString,
  );
  override readonly fromRdfResourceValuesFunction = new BuiltinCallable(
    this.reusables.snippets.blankNodeFromRdfResourceValues,
  );
  override readonly kind = "BlankNode";
  override readonly nodeKinds = nodeKinds;
  override readonly parseFunction = new BuiltinCallable(
    this.reusables.snippets.parseBlankNode,
  );
  override readonly toJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.blankNodeToJsonObject,
  );
  override readonly toJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.blankNodeToJsonString,
  );
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
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

  @Memoize()
  override get schema(): SchemaObject<SchemaObject.BuiltinType> {
    return new SchemaObject({
      properties: super.schema.properties,
      type: new SchemaObject.BuiltinType(
        this.reusables.snippets.BlankNodeSchema,
      ),
      variable: super.schema.variable,
    });
  }
}

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

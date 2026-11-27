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
      code: code`${this.reusables.snippets.BlankNode_convert}`,
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
    this.reusables.snippets.BlankNode_filter_,
  );
  override readonly filterType =
    code`${this.reusables.snippets.BlankNode_Filter}`;
  override readonly fromJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.BlankNode_fromJsonObject,
  );
  override readonly fromJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.BlankNode_fromJsonString,
  );
  override readonly fromRdfResourceValuesFunction = new BuiltinCallable(
    this.reusables.snippets.BlankNode_fromRdfResourceValues,
  );
  override readonly kind = "BlankNode";
  override readonly nodeKinds = nodeKinds;
  override readonly parseFunction = new BuiltinCallable(
    this.reusables.snippets.BlankNode_parse,
  );
  override readonly toJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.BlankNode_toJsonObject,
  );
  override readonly toJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.BlankNode_toJsonString,
  );
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
    this.reusables.snippets.BlankNode_sparqlWherePatterns,
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
        this.reusables.snippets.BlankNode_Schema,
      ),
      variable: super.schema.variable,
    });
  }
}

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

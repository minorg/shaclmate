import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import { SchemaObject } from "./SchemaObject.js";
import { code } from "./ts-poet-wrapper.js";

export class IdentifierType extends AbstractIdentifierType<
  BlankNode | NamedNode
> {
  protected override readonly inlineExpression =
    code`${this.reusables.snippets.Identifier}`;

  override readonly conversionFunction: Maybe<AbstractIdentifierType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.Identifier_convert}`,
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
  override readonly filterFunction = new BuiltinCallable(
    this.reusables.snippets.Identifier_filter_,
  );
  override readonly fromJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.Identifier_fromJsonString,
  );
  override readonly fromJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.Identifier_fromJsonObject,
  );
  override readonly filterType =
    code`${this.reusables.snippets.Identifier_Filter}`;
  override readonly fromRdfResourceValuesFunction = new BuiltinCallable(
    this.reusables.snippets.Identifier_fromRdfResourceValues,
  );
  override readonly kind = "Identifier";
  override readonly nodeKinds = nodeKinds;
  override readonly parseFunction = new BuiltinCallable(
    this.reusables.snippets.Identifier_parse,
  );
  override readonly toJsonValueFunction = new BuiltinCallable(
    this.reusables.snippets.Identifier_toJsonString,
  );
  override readonly toJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.Identifier_toJsonObject,
  );
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
    this.reusables.snippets.Identifier_sparqlWherePatterns,
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

  @Memoize()
  override get schema(): SchemaObject<SchemaObject.BuiltinType> {
    return new SchemaObject({
      properties: super.schema.properties,
      type: new SchemaObject.BuiltinType(
        this.reusables.snippets.Identifier_Schema,
      ),
      variable: super.schema.variable,
    });
  }
}

const nodeKinds: ReadonlySet<IdentifierNodeKind> = new Set([
  "BlankNode",
  "IRI",
]);

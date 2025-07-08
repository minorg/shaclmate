import pothosSchemaBuilder from "@pothos/core";
import type * as rdfjs from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
export const graphqlSchemaBuilder = new pothosSchemaBuilder<{
  DefaultFieldNullability: false;
  DefaultInputFieldRequiredness: true;
}>({ defaultFieldNullability: false, defaultInputFieldRequiredness: true });
/**
 * Node shape
 */
export class NodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "NodeShape";
  readonly stringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier satisfies never;
    }

    this.stringProperty = parameters.stringProperty;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }
}

export namespace NodeShape {
  export const graphqlObjectRef =
    graphqlSchemaBuilder.objectRef<object>("NodeShape");
  graphqlObjectRef.implement({
    description: "Node shape",
    fields: (fieldBuilder) => ({}),
  });
}

export const $ObjectTypes = { NodeShape },
  $ObjectUnionTypes = {},
  $Types = { ...$ObjectTypes, ...$ObjectUnionTypes };

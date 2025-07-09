import type * as rdfjs from "@rdfjs/types";
import * as graphql from "graphql";
import { DataFactory as dataFactory } from "n3";
/**
 * Node shape
 */
export class NodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "NodeShape";
  /**
   * String property
   */
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
  export const GraphQL = new graphql.GraphQLObjectType<NodeShape>({
    description: "Node shape",
    fields: () => ({
      identifier: { type: graphql.GraphQLString },
      stringProperty: {
        description: "String property",
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    }),
    name: "NodeShape",
  });
}

export const $ObjectTypes = { NodeShape },
  $ObjectUnionTypes = {},
  $Types = { ...$ObjectTypes, ...$ObjectUnionTypes };

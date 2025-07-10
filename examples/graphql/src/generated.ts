import type * as rdfjs from "@rdfjs/types";
import * as graphql from "graphql";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
/**
 * Node shape
 */
export class NodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "NodeShape";
  /**
   * Optional string property
   */
  readonly optionalStringProperty: purify.Maybe<string>;
  /**
   * Required string property
   */
  readonly requiredStringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly optionalStringProperty?: purify.Maybe<string> | string;
    readonly requiredStringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.optionalStringProperty)) {
      this.optionalStringProperty = parameters.optionalStringProperty;
    } else if (typeof parameters.optionalStringProperty === "string") {
      this.optionalStringProperty = purify.Maybe.of(
        parameters.optionalStringProperty,
      );
    } else if (typeof parameters.optionalStringProperty === "undefined") {
      this.optionalStringProperty = purify.Maybe.empty();
    } else {
      this.optionalStringProperty =
        parameters.optionalStringProperty satisfies never;
    }

    this.requiredStringProperty = parameters.requiredStringProperty;
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
      optionalStringProperty: {
        description: "Optional string property",
        resolve: (source) => source.optionalStringProperty.extractNullable(),
        type: graphql.GraphQLString,
      },
      requiredStringProperty: {
        description: "Required string property",
        resolve: (source) => source.requiredStringProperty,
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    }),
    name: "NodeShape",
  });
}

export const $ObjectTypes = { NodeShape },
  $ObjectUnionTypes = {},
  $Types = { ...$ObjectTypes, ...$ObjectUnionTypes };

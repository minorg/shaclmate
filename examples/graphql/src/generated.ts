import type * as rdfjs from "@rdfjs/types";
import * as graphql from "graphql";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
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

  toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode("http://example.com/NodeShape"),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/optionalStringProperty"),
      this.optionalStringProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/requiredStringProperty"),
      this.requiredStringProperty,
    );
    return _resource;
  }
}

export namespace NodeShape {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/NodeShape",
  );
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

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/NodeShape"),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/NodeShape)`,
          predicate: dataFactory.namedNode("http://example.com/NodeShape"),
        }),
      );
    }

    const identifier = _resource.identifier;
    const _optionalStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/optionalStringProperty"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    const _requiredStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(
        dataFactory.namedNode("http://example.com/requiredStringProperty"),
        { unique: true },
      )
      .head()
      .chain((_value) => _value.toString());
    if (_requiredStringPropertyEither.isLeft()) {
      return _requiredStringPropertyEither;
    }

    const requiredStringProperty = _requiredStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof NodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, NodeShape> {
    return NodeShape.propertiesFromRdf(parameters).map(
      (properties) => new NodeShape(properties),
    );
  }

  export const rdfProperties = [
    {
      path: dataFactory.namedNode("http://example.com/optionalStringProperty"),
    },
    {
      path: dataFactory.namedNode("http://example.com/requiredStringProperty"),
    },
  ];
}

export const $ObjectTypes = { NodeShape },
  $ObjectUnionTypes = {},
  $Types = { ...$ObjectTypes, ...$ObjectUnionTypes };
export interface $ObjectSet {
  objectByIdentifier<ObjectT>(
    identifier: rdfjs.NamedNode,
    type: "NodeShape",
  ): Promise<purify.Either<Error, ObjectT>>;
  objectIdentifiers(
    type: "NodeShape",
    options?: { limit?: number; offset?: number },
  ): Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>>;
  objectsByIdentifiers<ObjectT>(
    identifiers: readonly rdfjs.NamedNode[],
    type: "NodeShape",
  ): Promise<readonly purify.Either<Error, ObjectT>[]>;
  objectsCount(type: "NodeShape"): Promise<purify.Either<Error, number>>;
}

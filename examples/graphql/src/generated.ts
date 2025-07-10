import type * as rdfjs from "@rdfjs/types";
import * as graphql from "graphql";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
/**
 * Nested
 */
export class Nested {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "Nested";
  /**
   * Optional number property
   */
  readonly optionalNumberProperty: purify.NonEmptyList<number>;
  /**
   * Optional string property
   */
  readonly optionalStringProperty: purify.NonEmptyList<string>;
  /**
   * Required string property
   */
  readonly requiredStringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly optionalNumberProperty: purify.NonEmptyList<number>;
    readonly optionalStringProperty: purify.NonEmptyList<string>;
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

    this.optionalNumberProperty = parameters.optionalNumberProperty;
    this.optionalStringProperty = parameters.optionalStringProperty;
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
        _resource.dataFactory.namedNode("http://example.com/Nested"),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/optionalNumberProperty"),
      this.optionalNumberProperty.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/optionalStringProperty"),
      this.optionalStringProperty.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/requiredStringProperty"),
      this.requiredStringProperty,
    );
    return _resource;
  }
}

export namespace Nested {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/Nested",
  );
  export const GraphQL = new graphql.GraphQLObjectType<Nested>({
    description: "Nested",
    fields: () => ({
      identifier: { type: graphql.GraphQLString },
      optionalNumberProperty: {
        description: "Optional number property",
        resolve: (source) => source.optionalNumberProperty,
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(
            new graphql.GraphQLNonNull(graphql.GraphQLFloat),
          ),
        ),
      },
      optionalStringProperty: {
        description: "Optional string property",
        resolve: (source) => source.optionalStringProperty,
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(
            new graphql.GraphQLNonNull(graphql.GraphQLString),
          ),
        ),
      },
      requiredStringProperty: {
        description: "Required string property",
        resolve: (source) => source.requiredStringProperty,
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    }),
    name: "Nested",
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
      optionalNumberProperty: purify.NonEmptyList<number>;
      optionalStringProperty: purify.NonEmptyList<string>;
      requiredStringProperty: string;
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/Nested"),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/Nested)`,
          predicate: dataFactory.namedNode("http://example.com/Nested"),
        }),
      );
    }

    const identifier = _resource.identifier;
    const _optionalNumberPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.NonEmptyList<number>
    > = purify.NonEmptyList.fromArray([
      ..._resource
        .values(
          dataFactory.namedNode("http://example.com/optionalNumberProperty"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toNumber())
            .toMaybe()
            .toList(),
        ),
    ]).toEither(
      new rdfjsResource.Resource.ValueError({
        focusResource: _resource,
        message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} is empty`,
        predicate: dataFactory.namedNode(
          "http://example.com/optionalNumberProperty",
        ),
      }),
    );
    if (_optionalNumberPropertyEither.isLeft()) {
      return _optionalNumberPropertyEither;
    }

    const optionalNumberProperty = _optionalNumberPropertyEither.unsafeCoerce();
    const _optionalStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.NonEmptyList<string>
    > = purify.NonEmptyList.fromArray([
      ..._resource
        .values(
          dataFactory.namedNode("http://example.com/optionalStringProperty"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]).toEither(
      new rdfjsResource.Resource.ValueError({
        focusResource: _resource,
        message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} is empty`,
        predicate: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
      }),
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
      optionalNumberProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof Nested.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, Nested> {
    return Nested.propertiesFromRdf(parameters).map(
      (properties) => new Nested(properties),
    );
  }

  export const rdfProperties = [
    {
      path: dataFactory.namedNode("http://example.com/optionalNumberProperty"),
    },
    {
      path: dataFactory.namedNode("http://example.com/optionalStringProperty"),
    },
    {
      path: dataFactory.namedNode("http://example.com/requiredStringProperty"),
    },
  ];
}
/**
 * Concrete parent
 */
export class ConcreteParent {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "ConcreteParent";
  /**
   * Parent string property
   */
  readonly parentStringProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly parentStringProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.parentStringProperty)) {
      this.parentStringProperty = parameters.parentStringProperty;
    } else if (typeof parameters.parentStringProperty === "string") {
      this.parentStringProperty = purify.Maybe.of(
        parameters.parentStringProperty,
      );
    } else if (typeof parameters.parentStringProperty === "undefined") {
      this.parentStringProperty = purify.Maybe.empty();
    } else {
      this.parentStringProperty =
        parameters.parentStringProperty satisfies never;
    }
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
        _resource.dataFactory.namedNode("http://example.com/ConcreteParent"),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/parentStringProperty"),
      this.parentStringProperty,
    );
    return _resource;
  }
}

export namespace ConcreteParent {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteParent",
  );
  export const GraphQL = new graphql.GraphQLObjectType<ConcreteParent>({
    description: "Concrete parent",
    fields: () => ({
      identifier: { type: graphql.GraphQLString },
      parentStringProperty: {
        description: "Parent string property",
        resolve: (source) => source.parentStringProperty.extractNullable(),
        type: graphql.GraphQLString,
      },
    }),
    name: "ConcreteParent",
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
      parentStringProperty: purify.Maybe<string>;
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/ConcreteParent"),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/ConcreteParent)`,
          predicate: dataFactory.namedNode("http://example.com/ConcreteParent"),
        }),
      );
    }

    const identifier = _resource.identifier;
    const _parentStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/parentStringProperty"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_parentStringPropertyEither.isLeft()) {
      return _parentStringPropertyEither;
    }

    const parentStringProperty = _parentStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, parentStringProperty });
  }

  export function fromRdf(
    parameters: Parameters<typeof ConcreteParent.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ConcreteParent> {
    return ConcreteParent.propertiesFromRdf(parameters).map(
      (properties) => new ConcreteParent(properties),
    );
  }

  export const rdfProperties = [
    { path: dataFactory.namedNode("http://example.com/parentStringProperty") },
  ];
}
/**
 * Concrete child
 */
export class ConcreteChild {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "ConcreteChild";
  /**
   * Child string property
   */
  readonly childStringProperty: purify.Maybe<string>;
  /**
   * Optional nested object property
   */
  readonly optionalNestedObjectProperty: purify.NonEmptyList<Nested>;
  /**
   * Optional string property
   */
  readonly optionalStringProperty: purify.NonEmptyList<string>;
  /**
   * Required string property
   */
  readonly requiredStringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly childStringProperty?: purify.Maybe<string> | string;
    readonly optionalNestedObjectProperty: purify.NonEmptyList<Nested>;
    readonly optionalStringProperty: purify.NonEmptyList<string>;
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

    if (purify.Maybe.isMaybe(parameters.childStringProperty)) {
      this.childStringProperty = parameters.childStringProperty;
    } else if (typeof parameters.childStringProperty === "string") {
      this.childStringProperty = purify.Maybe.of(
        parameters.childStringProperty,
      );
    } else if (typeof parameters.childStringProperty === "undefined") {
      this.childStringProperty = purify.Maybe.empty();
    } else {
      this.childStringProperty = parameters.childStringProperty satisfies never;
    }

    this.optionalNestedObjectProperty = parameters.optionalNestedObjectProperty;
    this.optionalStringProperty = parameters.optionalStringProperty;
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
        _resource.dataFactory.namedNode("http://example.com/ConcreteChild"),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/childStringProperty"),
      this.childStringProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/optionalNestedObjectProperty"),
      this.optionalNestedObjectProperty.map((_item) =>
        _item.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/optionalStringProperty"),
      this.optionalStringProperty.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/requiredStringProperty"),
      this.requiredStringProperty,
    );
    return _resource;
  }
}

export namespace ConcreteChild {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteChild",
  );
  export const GraphQL = new graphql.GraphQLObjectType<ConcreteChild>({
    description: "Concrete child",
    fields: () => ({
      identifier: { type: graphql.GraphQLString },
      childStringProperty: {
        description: "Child string property",
        resolve: (source) => source.childStringProperty.extractNullable(),
        type: graphql.GraphQLString,
      },
      optionalNestedObjectProperty: {
        description: "Optional nested object property",
        resolve: (source) => source.optionalNestedObjectProperty,
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(new graphql.GraphQLNonNull(Nested.GraphQL)),
        ),
      },
      optionalStringProperty: {
        description: "Optional string property",
        resolve: (source) => source.optionalStringProperty,
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(
            new graphql.GraphQLNonNull(graphql.GraphQLString),
          ),
        ),
      },
      requiredStringProperty: {
        description: "Required string property",
        resolve: (source) => source.requiredStringProperty,
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    }),
    name: "ConcreteChild",
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
      childStringProperty: purify.Maybe<string>;
      optionalNestedObjectProperty: purify.NonEmptyList<Nested>;
      optionalStringProperty: purify.NonEmptyList<string>;
      requiredStringProperty: string;
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/ConcreteChild"),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/ConcreteChild)`,
          predicate: dataFactory.namedNode("http://example.com/ConcreteChild"),
        }),
      );
    }

    const identifier = _resource.identifier;
    const _childStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/childStringProperty"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_childStringPropertyEither.isLeft()) {
      return _childStringPropertyEither;
    }

    const childStringProperty = _childStringPropertyEither.unsafeCoerce();
    const _optionalNestedObjectPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.NonEmptyList<Nested>
    > = purify.NonEmptyList.fromArray([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://example.com/optionalNestedObjectProperty",
          ),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((value) => value.toResource())
            .chain((_resource) =>
              Nested.fromRdf({
                ..._context,
                ignoreRdfType: true,
                languageIn: _languageIn,
                resource: _resource,
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]).toEither(
      new rdfjsResource.Resource.ValueError({
        focusResource: _resource,
        message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} is empty`,
        predicate: dataFactory.namedNode(
          "http://example.com/optionalNestedObjectProperty",
        ),
      }),
    );
    if (_optionalNestedObjectPropertyEither.isLeft()) {
      return _optionalNestedObjectPropertyEither;
    }

    const optionalNestedObjectProperty =
      _optionalNestedObjectPropertyEither.unsafeCoerce();
    const _optionalStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.NonEmptyList<string>
    > = purify.NonEmptyList.fromArray([
      ..._resource
        .values(
          dataFactory.namedNode("http://example.com/optionalStringProperty"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]).toEither(
      new rdfjsResource.Resource.ValueError({
        focusResource: _resource,
        message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} is empty`,
        predicate: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
      }),
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
      childStringProperty,
      optionalNestedObjectProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof ConcreteChild.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ConcreteChild> {
    return ConcreteChild.propertiesFromRdf(parameters).map(
      (properties) => new ConcreteChild(properties),
    );
  }

  export const rdfProperties = [
    { path: dataFactory.namedNode("http://example.com/childStringProperty") },
    {
      path: dataFactory.namedNode(
        "http://example.com/optionalNestedObjectProperty",
      ),
    },
    {
      path: dataFactory.namedNode("http://example.com/optionalStringProperty"),
    },
    {
      path: dataFactory.namedNode("http://example.com/requiredStringProperty"),
    },
  ];
}

export const $ObjectTypes = { ConcreteChild, ConcreteParent, Nested },
  $ObjectUnionTypes = {},
  $Types = { ...$ObjectTypes, ...$ObjectUnionTypes };

export interface $ObjectSet {
  object<ObjectT extends { type: keyof typeof $ObjectTypes }>(
    identifier: rdfjs.NamedNode,
    type: ObjectT["type"],
  ): Promise<purify.Either<Error, ObjectT>>;

  // objectCount(
  //   type: keyof typeof $ObjectTypes,
  // ): Promise<purify.Either<Error, number>>;

  // objectIdentifiers(
  //   type: keyof typeof $ObjectTypes,
  //   options?: { limit?: number; offset?: number },
  // ): Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>>;

  // objects<ObjectT>(
  //   identifiers: readonly rdfjs.NamedNode[],
  //   type: keyof typeof $ObjectTypes,
  // ): Promise<readonly purify.Either<Error, ObjectT>[]>;
}

export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly resourceSet: rdfjsResource.ResourceSet;

  constructor({
    dataset,
  }: {
    dataset: rdfjs.DatasetCore;
  }) {
    this.resourceSet = new rdfjsResource.ResourceSet({
      dataset,
    });
  }

  async object<ObjectT extends { type: keyof typeof $ObjectTypes }>(
    identifier: rdfjs.NamedNode,
    type: ObjectT["type"],
  ): Promise<purify.Either<Error, ObjectT>> {
    return this.objectSync<ObjectT>(identifier, type);
  }

  objectSync<ObjectT extends { type: keyof typeof $ObjectTypes }>(
    identifier: rdfjs.NamedNode,
    type: ObjectT["type"],
  ): purify.Either<Error, ObjectT> {
    const fromRdf = $ObjectTypes[type].fromRdf;
    const resource = this.resourceSet.resource(identifier);
    return fromRdf({ resource }) as unknown as purify.Either<Error, ObjectT>;
  }

  // async objects<ObjectT extends Object>(
  //   type: ObjectT["type"],
  // ): Promise<Either<Error, readonly ObjectT[]>> {
  //   return this.objectsSync(type);
  // }

  // objectsSync<ObjectT extends Object>(
  //   type: ObjectT["type"],
  // ): Either<Error, readonly ObjectT[]> {
  //   const fromRdf = $ObjectTypes[type].fromRdf;
  //   const objects: ObjectT[] = [];
  //   for (const resource of this.resourceSet.instancesOf(
  //     $ObjectTypes[type].fromRdfType,
  //   )) {
  //     const objectEither = fromRdf({ resource }) as unknown as Either<
  //       Error,
  //       ObjectT
  //     >;
  //     if (objectEither.isLeft()) {
  //       return objectEither;
  //     }
  //     objects.push(objectEither.unsafeCoerce());
  //   }
  //   return Either.of(objects);
  // }

  // async objectCount(type: Object["type"]): Promise<Either<Error, number>> {
  //   return this.objectCountSync(type);
  // }

  // objectCountSync(type: Object["type"]): Either<Error, number> {
  //   const fromRdf = $ObjectTypes[type].fromRdf;
  //   let count = 0;
  //   for (const resource of this.resourceSet.instancesOf(
  //     $ObjectTypes[type].fromRdfType,
  //   )) {
  //     const objectEither = fromRdf({ resource });
  //     if (objectEither.isRight()) {
  //       count++;
  //     }
  //   }
  //   return Either.of(count);
  // }
}

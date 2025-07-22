import type * as rdfjs from "@rdfjs/types";
import * as graphql from "graphql";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
/**
 * Nested
 */
export class Nested {
  private _identifier: Nested.Identifier | undefined;
  readonly type = "Nested";
  /**
   * Optional number property
   */
  readonly optionalNumberProperty: purify.Maybe<number>;
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
    readonly optionalNumberProperty?: number | purify.Maybe<number>;
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

    if (purify.Maybe.isMaybe(parameters.optionalNumberProperty)) {
      this.optionalNumberProperty = parameters.optionalNumberProperty;
    } else if (typeof parameters.optionalNumberProperty === "number") {
      this.optionalNumberProperty = purify.Maybe.of(
        parameters.optionalNumberProperty,
      );
    } else if (typeof parameters.optionalNumberProperty === "undefined") {
      this.optionalNumberProperty = purify.Maybe.empty();
    } else {
      this.optionalNumberProperty =
        parameters.optionalNumberProperty satisfies never;
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

  get identifier(): Nested.Identifier {
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
      this.optionalNumberProperty,
    );
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

export namespace Nested {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/Nested",
  );
  export const GraphQL = new graphql.GraphQLObjectType<
    Nested,
    { objectSet: $ObjectSet }
  >({
    description: "Nested",
    fields: () => ({
      identifier: {
        resolve: (source) => Nested.Identifier.toString(source.identifier),
        type: graphql.GraphQLString,
      },
      optionalNumberProperty: {
        description: "Optional number property",
        resolve: (source) => source.optionalNumberProperty.extractNullable(),
        type: graphql.GraphQLFloat,
      },
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
    name: "Nested",
  });
  export type Identifier = rdfjsResource.Resource.Identifier;

  export namespace Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

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
      optionalNumberProperty: purify.Maybe<number>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/Nested"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/Nested)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    const identifier: Nested.Identifier = _resource.identifier;
    const _optionalNumberPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/optionalNumberProperty"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toNumber())
        .toMaybe(),
    );
    if (_optionalNumberPropertyEither.isLeft()) {
      return _optionalNumberPropertyEither;
    }

    const optionalNumberProperty = _optionalNumberPropertyEither.unsafeCoerce();
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
  readonly identifier: ConcreteParentStatic.Identifier;
  readonly type: "ConcreteParent" | "ConcreteChild" = "ConcreteParent";
  /**
   * Parent string property
   */
  readonly parentStringProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly identifier: rdfjs.NamedNode | string;
    readonly parentStringProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.identifier === "object") {
      this.identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this.identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      this.identifier = parameters.identifier satisfies never;
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

  toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.identifier, {
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

export namespace ConcreteParentStatic {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteParent",
  );
  export const GraphQL = new graphql.GraphQLObjectType<
    ConcreteParent,
    { objectSet: $ObjectSet }
  >({
    description: "Concrete parent",
    fields: () => ({
      identifier: {
        resolve: (source) =>
          ConcreteParentStatic.Identifier.toString(source.identifier),
        type: graphql.GraphQLString,
      },
      parentStringProperty: {
        description: "Parent string property",
        resolve: (source) => source.parentStringProperty.extractNullable(),
        type: graphql.GraphQLString,
      },
    }),
    name: "ConcreteParent",
  });
  export type Identifier = rdfjs.NamedNode;

  export namespace Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      ).chain((identifier) =>
        identifier.termType === "NamedNode"
          ? purify.Either.of(identifier)
          : purify.Left(new Error("expected identifier to be NamedNode")),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

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
    { identifier: rdfjs.NamedNode; parentStringProperty: purify.Maybe<string> }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/ConcreteParent"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ConcreteParent)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    if (_resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: _resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: _resource,
          predicate: dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
          ),
        }),
      );
    }

    const identifier: ConcreteParentStatic.Identifier = _resource.identifier;
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
    parameters: Parameters<typeof ConcreteParentStatic.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ConcreteParent> {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ConcreteChild.fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ConcreteParent
      >
    ).altLazy(() =>
      ConcreteParentStatic.propertiesFromRdf(parameters).map(
        (properties) => new ConcreteParent(properties),
      ),
    );
  }

  export const rdfProperties = [
    { path: dataFactory.namedNode("http://example.com/parentStringProperty") },
  ];
}
/**
 * Concrete child
 */
export class ConcreteChild extends ConcreteParent {
  override readonly type = "ConcreteChild";
  /**
   * Child string property
   */
  readonly childStringProperty: purify.Maybe<string>;
  /**
   * Optional nested object property
   */
  readonly optionalNestedObjectProperty: purify.Maybe<Nested>;
  /**
   * Optional string property
   */
  readonly optionalStringProperty: purify.Maybe<string>;
  /**
   * Required string property
   */
  readonly requiredStringProperty: string;

  constructor(
    parameters: {
      readonly identifier: rdfjs.NamedNode | string;
      readonly childStringProperty?: purify.Maybe<string> | string;
      readonly optionalNestedObjectProperty?: Nested | purify.Maybe<Nested>;
      readonly optionalStringProperty?: purify.Maybe<string> | string;
      readonly requiredStringProperty: string;
    } & ConstructorParameters<typeof ConcreteParent>[0],
  ) {
    super(parameters);
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

    if (purify.Maybe.isMaybe(parameters.optionalNestedObjectProperty)) {
      this.optionalNestedObjectProperty =
        parameters.optionalNestedObjectProperty;
    } else if (
      typeof parameters.optionalNestedObjectProperty === "object" &&
      parameters.optionalNestedObjectProperty instanceof Nested
    ) {
      this.optionalNestedObjectProperty = purify.Maybe.of(
        parameters.optionalNestedObjectProperty,
      );
    } else if (typeof parameters.optionalNestedObjectProperty === "undefined") {
      this.optionalNestedObjectProperty = purify.Maybe.empty();
    } else {
      this.optionalNestedObjectProperty =
        parameters.optionalNestedObjectProperty satisfies never;
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

  override toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = super.toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
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
      this.optionalNestedObjectProperty.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
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

export namespace ConcreteChild {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteChild",
  );
  export const GraphQL = new graphql.GraphQLObjectType<
    ConcreteChild,
    { objectSet: $ObjectSet }
  >({
    description: "Concrete child",
    fields: () => ({
      identifier: {
        resolve: (source) =>
          ConcreteChild.Identifier.toString(source.identifier),
        type: graphql.GraphQLString,
      },
      childStringProperty: {
        description: "Child string property",
        resolve: (source) => source.childStringProperty.extractNullable(),
        type: graphql.GraphQLString,
      },
      optionalNestedObjectProperty: {
        description: "Optional nested object property",
        resolve: (source) =>
          source.optionalNestedObjectProperty.extractNullable(),
        type: Nested.GraphQL,
      },
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
    name: "ConcreteChild",
  });
  export type Identifier = ConcreteParentStatic.Identifier;
  export const Identifier = ConcreteParentStatic.Identifier;

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
      identifier: rdfjs.NamedNode;
      childStringProperty: purify.Maybe<string>;
      optionalNestedObjectProperty: purify.Maybe<Nested>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    } & $UnwrapR<ReturnType<typeof ConcreteParentStatic.propertiesFromRdf>>
  > {
    const _super0Either = ConcreteParentStatic.propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/ConcreteChild"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ConcreteChild)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    if (_resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: _resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: _resource,
          predicate: dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
          ),
        }),
      );
    }

    const identifier: ConcreteChild.Identifier = _resource.identifier;
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
      purify.Maybe<Nested>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://example.com/optionalNestedObjectProperty",
          ),
          { unique: true },
        )
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
        .toMaybe(),
    );
    if (_optionalNestedObjectPropertyEither.isLeft()) {
      return _optionalNestedObjectPropertyEither;
    }

    const optionalNestedObjectProperty =
      _optionalNestedObjectPropertyEither.unsafeCoerce();
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
      ..._super0,
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
    ...ConcreteParentStatic.rdfProperties,
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
export interface $ObjectSet {
  concreteChild(
    identifier: rdfjs.NamedNode,
  ): Promise<purify.Either<Error, ConcreteChild>>;
  concreteChildIdentifiers(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>>;
  concreteChilds(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): Promise<readonly purify.Either<Error, ConcreteChild>[]>;
  concreteChildsCount(
    query?: Pick<$ObjectSet.Query<rdfjs.NamedNode>, "where">,
  ): Promise<purify.Either<Error, number>>;
  concreteParent(
    identifier: rdfjs.NamedNode,
  ): Promise<purify.Either<Error, ConcreteParent>>;
  concreteParentIdentifiers(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>>;
  concreteParents(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): Promise<readonly purify.Either<Error, ConcreteParent>[]>;
  concreteParentsCount(
    query?: Pick<$ObjectSet.Query<rdfjs.NamedNode>, "where">,
  ): Promise<purify.Either<Error, number>>;
  nested(
    identifier: rdfjs.BlankNode | rdfjs.NamedNode,
  ): Promise<purify.Either<Error, Nested>>;
  nestedIdentifiers(
    query?: $ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>,
  ): Promise<
    purify.Either<Error, readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]>
  >;
  nesteds(
    query?: $ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>,
  ): Promise<readonly purify.Either<Error, Nested>[]>;
  nestedsCount(
    query?: Pick<$ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>, "where">,
  ): Promise<purify.Either<Error, number>>;
}

export namespace $ObjectSet {
  export type Query<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  > = {
    readonly limit?: number;
    readonly offset?: number;
    readonly where?: Where<ObjectIdentifierT>;
  };
  export type Where<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  > = {
    readonly identifiers: readonly ObjectIdentifierT[];
    readonly type: "identifiers";
  };
}

export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly resourceSet: rdfjsResource.ResourceSet;

  constructor({ dataset }: { dataset: rdfjs.DatasetCore }) {
    this.resourceSet = new rdfjsResource.ResourceSet({ dataset });
  }

  async concreteChild(
    identifier: rdfjs.NamedNode,
  ): Promise<purify.Either<Error, ConcreteChild>> {
    return this.concreteChildSync(identifier);
  }

  concreteChildSync(
    identifier: rdfjs.NamedNode,
  ): purify.Either<Error, ConcreteChild> {
    return this.concreteChildsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async concreteChildIdentifiers(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>> {
    return this.concreteChildIdentifiersSync(query);
  }

  concreteChildIdentifiersSync(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): purify.Either<Error, readonly rdfjs.NamedNode[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<ConcreteChild, rdfjs.NamedNode>(
        ConcreteChild,
        query,
      ),
    ]);
  }

  async concreteChilds(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): Promise<readonly purify.Either<Error, ConcreteChild>[]> {
    return this.concreteChildsSync(query);
  }

  concreteChildsSync(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): readonly purify.Either<Error, ConcreteChild>[] {
    return [
      ...this.$objectsSync<ConcreteChild, rdfjs.NamedNode>(
        ConcreteChild,
        query,
      ),
    ];
  }

  async concreteChildsCount(
    query?: Pick<$ObjectSet.Query<rdfjs.NamedNode>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.concreteChildsCountSync(query);
  }

  concreteChildsCountSync(
    query?: Pick<$ObjectSet.Query<rdfjs.NamedNode>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<ConcreteChild, rdfjs.NamedNode>(
      ConcreteChild,
      query,
    );
  }

  async concreteParent(
    identifier: rdfjs.NamedNode,
  ): Promise<purify.Either<Error, ConcreteParent>> {
    return this.concreteParentSync(identifier);
  }

  concreteParentSync(
    identifier: rdfjs.NamedNode,
  ): purify.Either<Error, ConcreteParent> {
    return this.concreteParentsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async concreteParentIdentifiers(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>> {
    return this.concreteParentIdentifiersSync(query);
  }

  concreteParentIdentifiersSync(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): purify.Either<Error, readonly rdfjs.NamedNode[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<ConcreteParent, rdfjs.NamedNode>(
        ConcreteParentStatic,
        query,
      ),
    ]);
  }

  async concreteParents(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): Promise<readonly purify.Either<Error, ConcreteParent>[]> {
    return this.concreteParentsSync(query);
  }

  concreteParentsSync(
    query?: $ObjectSet.Query<rdfjs.NamedNode>,
  ): readonly purify.Either<Error, ConcreteParent>[] {
    return [
      ...this.$objectsSync<ConcreteParent, rdfjs.NamedNode>(
        ConcreteParentStatic,
        query,
      ),
    ];
  }

  async concreteParentsCount(
    query?: Pick<$ObjectSet.Query<rdfjs.NamedNode>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.concreteParentsCountSync(query);
  }

  concreteParentsCountSync(
    query?: Pick<$ObjectSet.Query<rdfjs.NamedNode>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<ConcreteParent, rdfjs.NamedNode>(
      ConcreteParentStatic,
      query,
    );
  }

  async nested(
    identifier: rdfjs.BlankNode | rdfjs.NamedNode,
  ): Promise<purify.Either<Error, Nested>> {
    return this.nestedSync(identifier);
  }

  nestedSync(
    identifier: rdfjs.BlankNode | rdfjs.NamedNode,
  ): purify.Either<Error, Nested> {
    return this.nestedsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async nestedIdentifiers(
    query?: $ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>,
  ): Promise<
    purify.Either<Error, readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]>
  > {
    return this.nestedIdentifiersSync(query);
  }

  nestedIdentifiersSync(
    query?: $ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>,
  ): purify.Either<Error, readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<Nested, rdfjs.BlankNode | rdfjs.NamedNode>(
        Nested,
        query,
      ),
    ]);
  }

  async nesteds(
    query?: $ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>,
  ): Promise<readonly purify.Either<Error, Nested>[]> {
    return this.nestedsSync(query);
  }

  nestedsSync(
    query?: $ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>,
  ): readonly purify.Either<Error, Nested>[] {
    return [
      ...this.$objectsSync<Nested, rdfjs.BlankNode | rdfjs.NamedNode>(
        Nested,
        query,
      ),
    ];
  }

  async nestedsCount(
    query?: Pick<$ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.nestedsCountSync(query);
  }

  nestedsCountSync(
    query?: Pick<$ObjectSet.Query<rdfjs.BlankNode | rdfjs.NamedNode>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<Nested, rdfjs.BlankNode | rdfjs.NamedNode>(
      Nested,
      query,
    );
  }

  *$objectIdentifiersSync<
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<ObjectIdentifierT> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return;
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      yield* query.where.identifiers.slice(offset, offset + limit);
      return;
    }

    if (!objectType.fromRdfType) {
      return;
    }

    let identifierCount = 0;
    let identifierI = 0;
    for (const resource of this.resourceSet.instancesOf(
      objectType.fromRdfType,
    )) {
      if (identifierI++ >= offset) {
        yield resource.identifier as ObjectIdentifierT;
        if (++identifierCount === limit) {
          break;
        }
      }
    }
  }

  *$objectsSync<
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<purify.Either<Error, ObjectT>> {
    for (const identifier of this.$objectIdentifiersSync<
      ObjectT,
      ObjectIdentifierT
    >(objectType, query)) {
      yield objectType.fromRdf({
        resource: this.resourceSet.resource(identifier),
      });
    }
  }

  protected $objectsCountSync<
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    let count = 0;
    for (const _ of this.$objectIdentifiersSync<ObjectT, ObjectIdentifierT>(
      objectType,
      query,
    )) {
      count++;
    }

    return purify.Either.of(count);
  }
}

export const graphqlSchema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType<null, { objectSet: $ObjectSet }>({
    name: "Query",
    fields: {
      concreteChild: {
        args: { id: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) } },
        resolve: async (
          _,
          { id }: { id: string },
          { objectSet },
        ): Promise<ConcreteChild> =>
          (
            await purify.EitherAsync<Error, ConcreteChild>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.concreteChild(
                    await liftEither(ConcreteChild.Identifier.fromString(id)),
                  ),
                ),
            )
          )
            .mapLeft(
              (error) =>
                new graphql.GraphQLError(error.message, {
                  originalError: error,
                }),
            )
            .unsafeCoerce(),
        type: ConcreteChild.GraphQL,
      },
      concreteParent: {
        args: { id: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) } },
        resolve: async (
          _,
          { id }: { id: string },
          { objectSet },
        ): Promise<ConcreteParent> =>
          (
            await purify.EitherAsync<Error, ConcreteParent>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.concreteParent(
                    await liftEither(
                      ConcreteParentStatic.Identifier.fromString(id),
                    ),
                  ),
                ),
            )
          )
            .mapLeft(
              (error) =>
                new graphql.GraphQLError(error.message, {
                  originalError: error,
                }),
            )
            .unsafeCoerce(),
        type: ConcreteParentStatic.GraphQL,
      },
      nested: {
        args: { id: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) } },
        resolve: async (
          _,
          { id }: { id: string },
          { objectSet },
        ): Promise<Nested> =>
          (
            await purify.EitherAsync<Error, Nested>(async ({ liftEither }) =>
              liftEither(
                await objectSet.nested(
                  await liftEither(Nested.Identifier.fromString(id)),
                ),
              ),
            )
          )
            .mapLeft(
              (error) =>
                new graphql.GraphQLError(error.message, {
                  originalError: error,
                }),
            )
            .unsafeCoerce(),
        type: Nested.GraphQL,
      },
    },
  }),
});

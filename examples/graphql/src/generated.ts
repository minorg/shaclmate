import type * as rdfjs from "@rdfjs/types";
import * as graphql from "graphql";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
export namespace $RdfVocabularies {
  export namespace rdf {
    export const first = dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    );
    export const nil = dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    );
    export const rest = dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    );
    export const subject = dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
    );
    export const type = dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    );
  }

  export namespace rdfs {
    export const subClassOf = dataFactory.namedNode(
      "http://www.w3.org/2000/01/rdf-schema#subClassOf",
    );
  }

  export namespace xsd {
    export const boolean = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#boolean",
    );
    export const date = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#date",
    );
    export const dateTime = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#dateTime",
    );
    export const integer = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#integer",
    );
  }
}
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
/**
 * UnionMember1
 */
export class UnionMember2 {
  private _$identifier: UnionMember2.$Identifier | undefined;
  readonly $type = "UnionMember2";
  /**
   * Optional string property
   */
  readonly optionalStringProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly optionalStringProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
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
  }

  get $identifier(): UnionMember2.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/UnionMember2"),
      );
    }

    _resource.add(
      UnionMember2.$properties.optionalStringProperty["identifier"],
      this.optionalStringProperty,
    );
    return _resource;
  }
}

export namespace UnionMember2 {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/UnionMember2",
  );
  export const $GraphQL = new graphql.GraphQLObjectType<
    UnionMember2,
    { objectSet: $ObjectSet }
  >({
    description: "UnionMember1",
    fields: () => ({
      _identifier: {
        resolve: (source) =>
          UnionMember2.$Identifier.toString(source.$identifier),
        type: graphql.GraphQLString,
      },
      optionalStringProperty: {
        description: "Optional string property",
        resolve: (source) => source.optionalStringProperty.extractNullable(),
        type: graphql.GraphQLString,
      },
    }),
    name: "UnionMember2",
  });
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
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

  export function $propertiesFromRdf({
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
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      optionalStringProperty: purify.Maybe<string>;
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/UnionMember2)`,
            ),
          ),
        );
    }

    const $identifier: UnionMember2.$Identifier = _resource.identifier;
    const _optionalStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = _resource
      .values($properties.optionalStringProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) => value.toString())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, optionalStringProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof UnionMember2.$propertiesFromRdf>[0],
  ): purify.Either<Error, UnionMember2> {
    return UnionMember2.$propertiesFromRdf(parameters).map(
      (properties) => new UnionMember2(properties),
    );
  }

  export const $properties = {
    optionalStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalStringProperty",
      ),
    },
  };
}
/**
 * UnionMember1
 */
export class UnionMember1 {
  private _$identifier: UnionMember1.$Identifier | undefined;
  readonly $type = "UnionMember1";
  /**
   * Optional number property
   */
  readonly optionalNumberProperty: purify.Maybe<number>;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly optionalNumberProperty?: number | purify.Maybe<number>;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
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
  }

  get $identifier(): UnionMember1.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/UnionMember1"),
      );
    }

    _resource.add(
      UnionMember1.$properties.optionalNumberProperty["identifier"],
      this.optionalNumberProperty,
    );
    return _resource;
  }
}

export namespace UnionMember1 {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/UnionMember1",
  );
  export const $GraphQL = new graphql.GraphQLObjectType<
    UnionMember1,
    { objectSet: $ObjectSet }
  >({
    description: "UnionMember1",
    fields: () => ({
      _identifier: {
        resolve: (source) =>
          UnionMember1.$Identifier.toString(source.$identifier),
        type: graphql.GraphQLString,
      },
      optionalNumberProperty: {
        description: "Optional number property",
        resolve: (source) => source.optionalNumberProperty.extractNullable(),
        type: graphql.GraphQLFloat,
      },
    }),
    name: "UnionMember1",
  });
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
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

  export function $propertiesFromRdf({
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
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      optionalNumberProperty: purify.Maybe<number>;
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/UnionMember1)`,
            ),
          ),
        );
    }

    const $identifier: UnionMember1.$Identifier = _resource.identifier;
    const _optionalNumberPropertyEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = _resource
      .values($properties.optionalNumberProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_optionalNumberPropertyEither.isLeft()) {
      return _optionalNumberPropertyEither;
    }

    const optionalNumberProperty = _optionalNumberPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, optionalNumberProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof UnionMember1.$propertiesFromRdf>[0],
  ): purify.Either<Error, UnionMember1> {
    return UnionMember1.$propertiesFromRdf(parameters).map(
      (properties) => new UnionMember1(properties),
    );
  }

  export const $properties = {
    optionalNumberProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalNumberProperty",
      ),
    },
  };
}
/**
 * Nested
 */
export class Nested {
  private _$identifier: Nested.$Identifier | undefined;
  readonly $type = "Nested";
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
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly optionalNumberProperty?: number | purify.Maybe<number>;
    readonly optionalStringProperty?: purify.Maybe<string> | string;
    readonly requiredStringProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
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

  get $identifier(): Nested.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/Nested"),
      );
    }

    _resource.add(
      UnionMember1.$properties.optionalNumberProperty["identifier"],
      this.optionalNumberProperty,
    );
    _resource.add(
      UnionMember2.$properties.optionalStringProperty["identifier"],
      this.optionalStringProperty,
    );
    _resource.add(
      Nested.$properties.requiredStringProperty["identifier"],
      this.requiredStringProperty,
    );
    return _resource;
  }
}

export namespace Nested {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/Nested",
  );
  export const $GraphQL = new graphql.GraphQLObjectType<
    Nested,
    { objectSet: $ObjectSet }
  >({
    description: "Nested",
    fields: () => ({
      _identifier: {
        resolve: (source) => Nested.$Identifier.toString(source.$identifier),
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
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
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

  export function $propertiesFromRdf({
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
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      optionalNumberProperty: purify.Maybe<number>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/Nested)`,
            ),
          ),
        );
    }

    const $identifier: Nested.$Identifier = _resource.identifier;
    const _optionalNumberPropertyEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = _resource
      .values($properties.optionalNumberProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_optionalNumberPropertyEither.isLeft()) {
      return _optionalNumberPropertyEither;
    }

    const optionalNumberProperty = _optionalNumberPropertyEither.unsafeCoerce();
    const _optionalStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = _resource
      .values($properties.optionalStringProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) => value.toString())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    const _requiredStringPropertyEither: purify.Either<Error, string> =
      _resource
        .values($properties.requiredStringProperty["identifier"], {
          unique: true,
        })
        .head()
        .chain((value) => value.toString());
    if (_requiredStringPropertyEither.isLeft()) {
      return _requiredStringPropertyEither;
    }

    const requiredStringProperty = _requiredStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      optionalNumberProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof Nested.$propertiesFromRdf>[0],
  ): purify.Either<Error, Nested> {
    return Nested.$propertiesFromRdf(parameters).map(
      (properties) => new Nested(properties),
    );
  }

  export const $properties = {
    optionalNumberProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalNumberProperty",
      ),
    },
    optionalStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalStringProperty",
      ),
    },
    requiredStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/requiredStringProperty",
      ),
    },
  };
}
/**
 * Concrete parent
 */
export class ConcreteParent {
  readonly $identifier: ConcreteParentStatic.$Identifier;
  readonly $type: "ConcreteParent" | "ConcreteChild" = "ConcreteParent";
  /**
   * Parent string property
   */
  readonly parentStringProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly $identifier: rdfjs.NamedNode | string;
    readonly parentStringProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this.$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this.$identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      this.$identifier = parameters.$identifier satisfies never;
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

  $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/ConcreteParent"),
      );
    }

    _resource.add(
      ConcreteParentStatic.$properties.parentStringProperty["identifier"],
      this.parentStringProperty,
    );
    return _resource;
  }
}

export namespace ConcreteParentStatic {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteParent",
  );
  export const $GraphQL = new graphql.GraphQLObjectType<
    ConcreteParent,
    { objectSet: $ObjectSet }
  >({
    description: "Concrete parent",
    fields: () => ({
      _identifier: {
        resolve: (source) =>
          ConcreteParentStatic.$Identifier.toString(source.$identifier),
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
  export type $Identifier = rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjs.NamedNode> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      ).chain((identifier) =>
        identifier.termType === "NamedNode"
          ? purify.Either.of(identifier)
          : purify.Left(new Error("expected identifier to be NamedNode")),
      ) as purify.Either<Error, rdfjs.NamedNode>;
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf({
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
    Error,
    { $identifier: rdfjs.NamedNode; parentStringProperty: purify.Maybe<string> }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ConcreteParent)`,
            ),
          ),
        );
    }

    if (_resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: _resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: _resource,
          predicate: $RdfVocabularies.rdf.subject,
        }),
      );
    }

    const $identifier: ConcreteParentStatic.$Identifier = _resource.identifier;
    const _parentStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = _resource
      .values($properties.parentStringProperty["identifier"], { unique: true })
      .head()
      .chain((value) => value.toString())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_parentStringPropertyEither.isLeft()) {
      return _parentStringPropertyEither;
    }

    const parentStringProperty = _parentStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, parentStringProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ConcreteParentStatic.$propertiesFromRdf>[0],
  ): purify.Either<Error, ConcreteParent> {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ConcreteChild.$fromRdf(otherParameters) as purify.Either<
        Error,
        ConcreteParent
      >
    ).altLazy(() =>
      ConcreteParentStatic.$propertiesFromRdf(parameters).map(
        (properties) => new ConcreteParent(properties),
      ),
    );
  }

  export const $properties = {
    parentStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/parentStringProperty",
      ),
    },
  };
}
/**
 * Concrete child
 */
export class ConcreteChild extends ConcreteParent {
  override readonly $type = "ConcreteChild";
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
      readonly $identifier: rdfjs.NamedNode | string;
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

  override $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = super.$toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/ConcreteChild"),
      );
    }

    _resource.add(
      ConcreteChild.$properties.childStringProperty["identifier"],
      this.childStringProperty,
    );
    _resource.add(
      ConcreteChild.$properties.optionalNestedObjectProperty["identifier"],
      this.optionalNestedObjectProperty.map((value) =>
        value.$toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      UnionMember2.$properties.optionalStringProperty["identifier"],
      this.optionalStringProperty,
    );
    _resource.add(
      Nested.$properties.requiredStringProperty["identifier"],
      this.requiredStringProperty,
    );
    return _resource;
  }
}

export namespace ConcreteChild {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteChild",
  );
  export const $GraphQL = new graphql.GraphQLObjectType<
    ConcreteChild,
    { objectSet: $ObjectSet }
  >({
    description: "Concrete child",
    fields: () => ({
      _identifier: {
        resolve: (source) =>
          ConcreteChild.$Identifier.toString(source.$identifier),
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
        type: Nested.$GraphQL,
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
  export type $Identifier = ConcreteParentStatic.$Identifier;
  export const $Identifier = ConcreteParentStatic.$Identifier;

  export function $propertiesFromRdf({
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
    Error,
    {
      $identifier: rdfjs.NamedNode;
      childStringProperty: purify.Maybe<string>;
      optionalNestedObjectProperty: purify.Maybe<Nested>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    } & $UnwrapR<ReturnType<typeof ConcreteParentStatic.$propertiesFromRdf>>
  > {
    const $super0Either = ConcreteParentStatic.$propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ConcreteChild)`,
            ),
          ),
        );
    }

    if (_resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: _resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: _resource,
          predicate: $RdfVocabularies.rdf.subject,
        }),
      );
    }

    const $identifier: ConcreteChild.$Identifier = _resource.identifier;
    const _childStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = _resource
      .values($properties.childStringProperty["identifier"], { unique: true })
      .head()
      .chain((value) => value.toString())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_childStringPropertyEither.isLeft()) {
      return _childStringPropertyEither;
    }

    const childStringProperty = _childStringPropertyEither.unsafeCoerce();
    const _optionalNestedObjectPropertyEither: purify.Either<
      Error,
      purify.Maybe<Nested>
    > = _resource
      .values($properties.optionalNestedObjectProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) => value.toResource())
      .chain((_resource) =>
        Nested.$fromRdf({
          ..._context,
          ignoreRdfType: true,
          languageIn: _languageIn,
          resource: _resource,
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_optionalNestedObjectPropertyEither.isLeft()) {
      return _optionalNestedObjectPropertyEither;
    }

    const optionalNestedObjectProperty =
      _optionalNestedObjectPropertyEither.unsafeCoerce();
    const _optionalStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = _resource
      .values($properties.optionalStringProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) => value.toString())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    const _requiredStringPropertyEither: purify.Either<Error, string> =
      _resource
        .values($properties.requiredStringProperty["identifier"], {
          unique: true,
        })
        .head()
        .chain((value) => value.toString());
    if (_requiredStringPropertyEither.isLeft()) {
      return _requiredStringPropertyEither;
    }

    const requiredStringProperty = _requiredStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      childStringProperty,
      optionalNestedObjectProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ConcreteChild.$propertiesFromRdf>[0],
  ): purify.Either<Error, ConcreteChild> {
    return ConcreteChild.$propertiesFromRdf(parameters).map(
      (properties) => new ConcreteChild(properties),
    );
  }

  export const $properties = {
    ...ConcreteParentStatic.$properties,
    childStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/childStringProperty",
      ),
    },
    optionalNestedObjectProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalNestedObjectProperty",
      ),
    },
    optionalStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalStringProperty",
      ),
    },
    requiredStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/requiredStringProperty",
      ),
    },
  };
}
/**
 * Union
 */
export type Union = UnionMember1 | UnionMember2;

export namespace Union {
  export function $fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<Error, Union> {
    return (
      UnionMember1.$fromRdf({ ...context, resource }) as purify.Either<
        Error,
        Union
      >
    ).altLazy(
      () =>
        UnionMember2.$fromRdf({ ...context, resource }) as purify.Either<
          Error,
          Union
        >,
    );
  }

  export const $GraphQL = new graphql.GraphQLUnionType({
    description: "Union",
    name: "Union",
    resolveType: (value: Union) => value.$type,
    types: [UnionMember1.$GraphQL, UnionMember2.$GraphQL],
  });
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
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

  export function $toRdf(
    _union: Union,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_union.$type) {
      case "UnionMember1":
        return _union.$toRdf(_parameters);
      case "UnionMember2":
        return _union.$toRdf(_parameters);
      default:
        _union satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
export interface $ObjectSet {
  concreteChild(
    identifier: ConcreteChild.$Identifier,
  ): Promise<purify.Either<Error, ConcreteChild>>;
  concreteChildIdentifiers(
    query?: $ObjectSet.Query<ConcreteChild.$Identifier>,
  ): Promise<purify.Either<Error, readonly ConcreteChild.$Identifier[]>>;
  concreteChildren(
    query?: $ObjectSet.Query<ConcreteChild.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteChild>[]>;
  concreteChildrenCount(
    query?: Pick<$ObjectSet.Query<ConcreteChild.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  concreteParent(
    identifier: ConcreteParentStatic.$Identifier,
  ): Promise<purify.Either<Error, ConcreteParent>>;
  concreteParentIdentifiers(
    query?: $ObjectSet.Query<ConcreteParentStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly ConcreteParentStatic.$Identifier[]>>;
  concreteParents(
    query?: $ObjectSet.Query<ConcreteParentStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteParent>[]>;
  concreteParentsCount(
    query?: Pick<$ObjectSet.Query<ConcreteParentStatic.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  nested(identifier: Nested.$Identifier): Promise<purify.Either<Error, Nested>>;
  nestedIdentifiers(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<purify.Either<Error, readonly Nested.$Identifier[]>>;
  nesteds(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<readonly purify.Either<Error, Nested>[]>;
  nestedsCount(
    query?: Pick<$ObjectSet.Query<Nested.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  unionMember1(
    identifier: UnionMember1.$Identifier,
  ): Promise<purify.Either<Error, UnionMember1>>;
  unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember1.$Identifier[]>>;
  unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<readonly purify.Either<Error, UnionMember1>[]>;
  unionMember1sCount(
    query?: Pick<$ObjectSet.Query<UnionMember1.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  unionMember2(
    identifier: UnionMember2.$Identifier,
  ): Promise<purify.Either<Error, UnionMember2>>;
  unionMember2Identifiers(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember2.$Identifier[]>>;
  unionMember2s(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): Promise<readonly purify.Either<Error, UnionMember2>[]>;
  unionMember2sCount(
    query?: Pick<$ObjectSet.Query<UnionMember2.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  union(identifier: Union.$Identifier): Promise<purify.Either<Error, Union>>;
  unionIdentifiers(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<purify.Either<Error, readonly Union.$Identifier[]>>;
  unions(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<readonly purify.Either<Error, Union>[]>;
  unionsCount(
    query?: Pick<$ObjectSet.Query<Union.$Identifier>, "where">,
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
    identifier: ConcreteChild.$Identifier,
  ): Promise<purify.Either<Error, ConcreteChild>> {
    return this.concreteChildSync(identifier);
  }

  concreteChildSync(
    identifier: ConcreteChild.$Identifier,
  ): purify.Either<Error, ConcreteChild> {
    return this.concreteChildrenSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async concreteChildIdentifiers(
    query?: $ObjectSet.Query<ConcreteChild.$Identifier>,
  ): Promise<purify.Either<Error, readonly ConcreteChild.$Identifier[]>> {
    return this.concreteChildIdentifiersSync(query);
  }

  concreteChildIdentifiersSync(
    query?: $ObjectSet.Query<ConcreteChild.$Identifier>,
  ): purify.Either<Error, readonly ConcreteChild.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<ConcreteChild, ConcreteChild.$Identifier>(
        ConcreteChild,
        query,
      ),
    ]);
  }

  async concreteChildren(
    query?: $ObjectSet.Query<ConcreteChild.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteChild>[]> {
    return this.concreteChildrenSync(query);
  }

  concreteChildrenSync(
    query?: $ObjectSet.Query<ConcreteChild.$Identifier>,
  ): readonly purify.Either<Error, ConcreteChild>[] {
    return [
      ...this.$objectsSync<ConcreteChild, ConcreteChild.$Identifier>(
        ConcreteChild,
        query,
      ),
    ];
  }

  async concreteChildrenCount(
    query?: Pick<$ObjectSet.Query<ConcreteChild.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.concreteChildrenCountSync(query);
  }

  concreteChildrenCountSync(
    query?: Pick<$ObjectSet.Query<ConcreteChild.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<ConcreteChild, ConcreteChild.$Identifier>(
      ConcreteChild,
      query,
    );
  }

  async concreteParent(
    identifier: ConcreteParentStatic.$Identifier,
  ): Promise<purify.Either<Error, ConcreteParent>> {
    return this.concreteParentSync(identifier);
  }

  concreteParentSync(
    identifier: ConcreteParentStatic.$Identifier,
  ): purify.Either<Error, ConcreteParent> {
    return this.concreteParentsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async concreteParentIdentifiers(
    query?: $ObjectSet.Query<ConcreteParentStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteParentStatic.$Identifier[]>
  > {
    return this.concreteParentIdentifiersSync(query);
  }

  concreteParentIdentifiersSync(
    query?: $ObjectSet.Query<ConcreteParentStatic.$Identifier>,
  ): purify.Either<Error, readonly ConcreteParentStatic.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ConcreteParent,
        ConcreteParentStatic.$Identifier
      >(ConcreteParentStatic, query),
    ]);
  }

  async concreteParents(
    query?: $ObjectSet.Query<ConcreteParentStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteParent>[]> {
    return this.concreteParentsSync(query);
  }

  concreteParentsSync(
    query?: $ObjectSet.Query<ConcreteParentStatic.$Identifier>,
  ): readonly purify.Either<Error, ConcreteParent>[] {
    return [
      ...this.$objectsSync<ConcreteParent, ConcreteParentStatic.$Identifier>(
        ConcreteParentStatic,
        query,
      ),
    ];
  }

  async concreteParentsCount(
    query?: Pick<$ObjectSet.Query<ConcreteParentStatic.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.concreteParentsCountSync(query);
  }

  concreteParentsCountSync(
    query?: Pick<$ObjectSet.Query<ConcreteParentStatic.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ConcreteParent,
      ConcreteParentStatic.$Identifier
    >(ConcreteParentStatic, query);
  }

  async nested(
    identifier: Nested.$Identifier,
  ): Promise<purify.Either<Error, Nested>> {
    return this.nestedSync(identifier);
  }

  nestedSync(identifier: Nested.$Identifier): purify.Either<Error, Nested> {
    return this.nestedsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async nestedIdentifiers(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<purify.Either<Error, readonly Nested.$Identifier[]>> {
    return this.nestedIdentifiersSync(query);
  }

  nestedIdentifiersSync(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): purify.Either<Error, readonly Nested.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<Nested, Nested.$Identifier>(Nested, query),
    ]);
  }

  async nesteds(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<readonly purify.Either<Error, Nested>[]> {
    return this.nestedsSync(query);
  }

  nestedsSync(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): readonly purify.Either<Error, Nested>[] {
    return [...this.$objectsSync<Nested, Nested.$Identifier>(Nested, query)];
  }

  async nestedsCount(
    query?: Pick<$ObjectSet.Query<Nested.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.nestedsCountSync(query);
  }

  nestedsCountSync(
    query?: Pick<$ObjectSet.Query<Nested.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<Nested, Nested.$Identifier>(Nested, query);
  }

  async unionMember1(
    identifier: UnionMember1.$Identifier,
  ): Promise<purify.Either<Error, UnionMember1>> {
    return this.unionMember1Sync(identifier);
  }

  unionMember1Sync(
    identifier: UnionMember1.$Identifier,
  ): purify.Either<Error, UnionMember1> {
    return this.unionMember1sSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember1.$Identifier[]>> {
    return this.unionMember1IdentifiersSync(query);
  }

  unionMember1IdentifiersSync(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): purify.Either<Error, readonly UnionMember1.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<UnionMember1, UnionMember1.$Identifier>(
        UnionMember1,
        query,
      ),
    ]);
  }

  async unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<readonly purify.Either<Error, UnionMember1>[]> {
    return this.unionMember1sSync(query);
  }

  unionMember1sSync(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): readonly purify.Either<Error, UnionMember1>[] {
    return [
      ...this.$objectsSync<UnionMember1, UnionMember1.$Identifier>(
        UnionMember1,
        query,
      ),
    ];
  }

  async unionMember1sCount(
    query?: Pick<$ObjectSet.Query<UnionMember1.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.unionMember1sCountSync(query);
  }

  unionMember1sCountSync(
    query?: Pick<$ObjectSet.Query<UnionMember1.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<UnionMember1, UnionMember1.$Identifier>(
      UnionMember1,
      query,
    );
  }

  async unionMember2(
    identifier: UnionMember2.$Identifier,
  ): Promise<purify.Either<Error, UnionMember2>> {
    return this.unionMember2Sync(identifier);
  }

  unionMember2Sync(
    identifier: UnionMember2.$Identifier,
  ): purify.Either<Error, UnionMember2> {
    return this.unionMember2sSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async unionMember2Identifiers(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember2.$Identifier[]>> {
    return this.unionMember2IdentifiersSync(query);
  }

  unionMember2IdentifiersSync(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): purify.Either<Error, readonly UnionMember2.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<UnionMember2, UnionMember2.$Identifier>(
        UnionMember2,
        query,
      ),
    ]);
  }

  async unionMember2s(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): Promise<readonly purify.Either<Error, UnionMember2>[]> {
    return this.unionMember2sSync(query);
  }

  unionMember2sSync(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): readonly purify.Either<Error, UnionMember2>[] {
    return [
      ...this.$objectsSync<UnionMember2, UnionMember2.$Identifier>(
        UnionMember2,
        query,
      ),
    ];
  }

  async unionMember2sCount(
    query?: Pick<$ObjectSet.Query<UnionMember2.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.unionMember2sCountSync(query);
  }

  unionMember2sCountSync(
    query?: Pick<$ObjectSet.Query<UnionMember2.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<UnionMember2, UnionMember2.$Identifier>(
      UnionMember2,
      query,
    );
  }

  async union(
    identifier: Union.$Identifier,
  ): Promise<purify.Either<Error, Union>> {
    return this.unionSync(identifier);
  }

  unionSync(identifier: Union.$Identifier): purify.Either<Error, Union> {
    return this.unionsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async unionIdentifiers(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<purify.Either<Error, readonly Union.$Identifier[]>> {
    return this.unionIdentifiersSync(query);
  }

  unionIdentifiersSync(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): purify.Either<Error, readonly Union.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectUnionIdentifiersSync<Union, Union.$Identifier>(
        [UnionMember1, UnionMember2],
        query,
      ),
    ]);
  }

  async unions(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<readonly purify.Either<Error, Union>[]> {
    return this.unionsSync(query);
  }

  unionsSync(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): readonly purify.Either<Error, Union>[] {
    return [
      ...this.$objectUnionsSync<Union, Union.$Identifier>(
        [UnionMember1, UnionMember2],
        query,
      ),
    ];
  }

  async unionsCount(
    query?: Pick<$ObjectSet.Query<Union.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.unionsCountSync(query);
  }

  unionsCountSync(
    query?: Pick<$ObjectSet.Query<Union.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectUnionsCountSync<Union, Union.$Identifier>(
      [UnionMember1, UnionMember2],
      query,
    );
  }

  protected *$objectIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<ObjectIdentifierT> {
    for (const object of this.$objectsSync<ObjectT, ObjectIdentifierT>(
      objectType,
      query,
    )) {
      if (object.isRight()) {
        yield object.unsafeCoerce().$identifier;
      }
    }
  }

  protected *$objectsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<purify.Either<Error, ObjectT>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return;
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      for (const identifier of query.where.identifiers.slice(
        offset,
        offset + limit,
      )) {
        yield objectType.$fromRdf({
          resource: this.resourceSet.resource(identifier),
        });
      }
      return;
    }

    if (!objectType.$fromRdfType) {
      return;
    }

    const resources = [
      ...this.resourceSet.instancesOf(objectType.$fromRdfType),
    ];
    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.identifier.value.localeCompare(right.identifier.value),
    );

    let objectCount = 0;
    let objectI = 0;
    for (const resource of resources) {
      const object = objectType.$fromRdf({ resource });
      if (object.isLeft()) {
        continue;
      }
      if (objectI++ >= offset) {
        yield object;
        if (++objectCount === limit) {
          return;
        }
      }
    }
  }

  protected $objectsCountSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
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

  protected *$objectUnionIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<ObjectIdentifierT> {
    for (const object of this.$objectUnionsSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    )) {
      if (object.isRight()) {
        yield object.unsafeCoerce().$identifier;
      }
    }
  }

  protected *$objectUnionsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<purify.Either<Error, ObjectT>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return;
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      // Figure out which object type the identifiers belong to
      for (const identifier of query.where.identifiers.slice(
        offset,
        offset + limit,
      )) {
        const resource = this.resourceSet.resource(identifier);
        const lefts: purify.Either<Error, ObjectT>[] = [];
        for (const objectType of objectTypes) {
          const object = objectType.$fromRdf({ resource });
          if (object.isRight()) {
            yield object;
            break;
          }
          lefts.push(object);
        }
        // Doesn't appear to belong to any of the known object types, just assume the first
        if (lefts.length === objectTypes.length) {
          yield lefts[0];
        }
      }

      return;
    }

    let objectCount = 0;
    let objectI = 0;

    const resources: {
      objectType: {
        $fromRdf: (parameters: {
          resource: rdfjsResource.Resource;
        }) => purify.Either<Error, ObjectT>;
        $fromRdfType?: rdfjs.NamedNode;
      };
      resource: rdfjsResource.Resource;
    }[] = [];
    for (const objectType of objectTypes) {
      if (!objectType.$fromRdfType) {
        continue;
      }

      for (const resource of this.resourceSet.instancesOf(
        objectType.$fromRdfType,
      )) {
        resources.push({ objectType, resource });
      }
    }

    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.resource.identifier.value.localeCompare(
        right.resource.identifier.value,
      ),
    );

    for (const { objectType, resource } of resources) {
      const object = objectType.$fromRdf({ resource });
      if (object.isLeft()) {
        continue;
      }
      if (objectI++ >= offset) {
        yield object;
        if (++objectCount === limit) {
          return;
        }
      }
    }
  }

  protected $objectUnionsCountSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    let count = 0;
    for (const _ of this.$objectUnionIdentifiersSync<
      ObjectT,
      ObjectIdentifierT
    >(objectTypes, query)) {
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
        args: {
          identifier: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<ConcreteChild> =>
          (
            await purify.EitherAsync<Error, ConcreteChild>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.concreteChild(
                    await liftEither(
                      ConcreteChild.$Identifier.fromString(args.identifier),
                    ),
                  ),
                ),
            )
          ).unsafeCoerce(),
        type: ConcreteChild.$GraphQL,
      },
      concreteChildIdentifiers: {
        args: {
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.concreteChildIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(ConcreteChild.$Identifier.toString),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(graphql.GraphQLString),
        ),
      },
      concreteChildren: {
        args: {
          identifiers: {
            type: new graphql.GraphQLList(
              new graphql.GraphQLNonNull(graphql.GraphQLID),
            ),
          },
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: {
            identifiers: readonly string[] | null;
            limit: number | null;
            offset: number | null;
          },
          { objectSet },
        ): Promise<readonly ConcreteChild[]> =>
          (
            await purify.EitherAsync<Error, readonly ConcreteChild[]>(
              async ({ liftEither }) => {
                let where:
                  | $ObjectSet.Where<ConcreteChild.$Identifier>
                  | undefined;
                if (args.identifiers) {
                  const identifiers: ConcreteChild.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        ConcreteChild.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  where = { identifiers, type: "identifiers" };
                }
                const objects: ConcreteChild[] = [];
                for (const objectEither of await objectSet.concreteChildren({
                  limit: args.limit !== null ? args.limit : undefined,
                  offset: args.offset !== null ? args.offset : undefined,
                  where,
                })) {
                  objects.push(await liftEither(objectEither));
                }
                return objects;
              },
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(
            new graphql.GraphQLNonNull(ConcreteChild.$GraphQL),
          ),
        ),
      },
      concreteChildrenCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.concreteChildrenCount()).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
      },
      concreteParent: {
        args: {
          identifier: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<ConcreteParent> =>
          (
            await purify.EitherAsync<Error, ConcreteParent>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.concreteParent(
                    await liftEither(
                      ConcreteParentStatic.$Identifier.fromString(
                        args.identifier,
                      ),
                    ),
                  ),
                ),
            )
          ).unsafeCoerce(),
        type: ConcreteParentStatic.$GraphQL,
      },
      concreteParentIdentifiers: {
        args: {
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.concreteParentIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(ConcreteParentStatic.$Identifier.toString),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(graphql.GraphQLString),
        ),
      },
      concreteParents: {
        args: {
          identifiers: {
            type: new graphql.GraphQLList(
              new graphql.GraphQLNonNull(graphql.GraphQLID),
            ),
          },
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: {
            identifiers: readonly string[] | null;
            limit: number | null;
            offset: number | null;
          },
          { objectSet },
        ): Promise<readonly ConcreteParent[]> =>
          (
            await purify.EitherAsync<Error, readonly ConcreteParent[]>(
              async ({ liftEither }) => {
                let where:
                  | $ObjectSet.Where<ConcreteParentStatic.$Identifier>
                  | undefined;
                if (args.identifiers) {
                  const identifiers: ConcreteParentStatic.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        ConcreteParentStatic.$Identifier.fromString(
                          identifierArg,
                        ),
                      ),
                    );
                  }
                  where = { identifiers, type: "identifiers" };
                }
                const objects: ConcreteParent[] = [];
                for (const objectEither of await objectSet.concreteParents({
                  limit: args.limit !== null ? args.limit : undefined,
                  offset: args.offset !== null ? args.offset : undefined,
                  where,
                })) {
                  objects.push(await liftEither(objectEither));
                }
                return objects;
              },
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(
            new graphql.GraphQLNonNull(ConcreteParentStatic.$GraphQL),
          ),
        ),
      },
      concreteParentsCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.concreteParentsCount()).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
      },
      nested: {
        args: {
          identifier: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<Nested> =>
          (
            await purify.EitherAsync<Error, Nested>(async ({ liftEither }) =>
              liftEither(
                await objectSet.nested(
                  await liftEither(
                    Nested.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: Nested.$GraphQL,
      },
      nestedIdentifiers: {
        args: {
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.nestedIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(Nested.$Identifier.toString),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(graphql.GraphQLString),
        ),
      },
      nesteds: {
        args: {
          identifiers: {
            type: new graphql.GraphQLList(
              new graphql.GraphQLNonNull(graphql.GraphQLID),
            ),
          },
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: {
            identifiers: readonly string[] | null;
            limit: number | null;
            offset: number | null;
          },
          { objectSet },
        ): Promise<readonly Nested[]> =>
          (
            await purify.EitherAsync<Error, readonly Nested[]>(
              async ({ liftEither }) => {
                let where: $ObjectSet.Where<Nested.$Identifier> | undefined;
                if (args.identifiers) {
                  const identifiers: Nested.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        Nested.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  where = { identifiers, type: "identifiers" };
                }
                const objects: Nested[] = [];
                for (const objectEither of await objectSet.nesteds({
                  limit: args.limit !== null ? args.limit : undefined,
                  offset: args.offset !== null ? args.offset : undefined,
                  where,
                })) {
                  objects.push(await liftEither(objectEither));
                }
                return objects;
              },
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(new graphql.GraphQLNonNull(Nested.$GraphQL)),
        ),
      },
      nestedsCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.nestedsCount()).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
      },
      unionMember1: {
        args: {
          identifier: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<UnionMember1> =>
          (
            await purify.EitherAsync<Error, UnionMember1>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.unionMember1(
                    await liftEither(
                      UnionMember1.$Identifier.fromString(args.identifier),
                    ),
                  ),
                ),
            )
          ).unsafeCoerce(),
        type: UnionMember1.$GraphQL,
      },
      unionMember1Identifiers: {
        args: {
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.unionMember1Identifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(UnionMember1.$Identifier.toString),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(graphql.GraphQLString),
        ),
      },
      unionMember1s: {
        args: {
          identifiers: {
            type: new graphql.GraphQLList(
              new graphql.GraphQLNonNull(graphql.GraphQLID),
            ),
          },
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: {
            identifiers: readonly string[] | null;
            limit: number | null;
            offset: number | null;
          },
          { objectSet },
        ): Promise<readonly UnionMember1[]> =>
          (
            await purify.EitherAsync<Error, readonly UnionMember1[]>(
              async ({ liftEither }) => {
                let where:
                  | $ObjectSet.Where<UnionMember1.$Identifier>
                  | undefined;
                if (args.identifiers) {
                  const identifiers: UnionMember1.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        UnionMember1.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  where = { identifiers, type: "identifiers" };
                }
                const objects: UnionMember1[] = [];
                for (const objectEither of await objectSet.unionMember1s({
                  limit: args.limit !== null ? args.limit : undefined,
                  offset: args.offset !== null ? args.offset : undefined,
                  where,
                })) {
                  objects.push(await liftEither(objectEither));
                }
                return objects;
              },
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(
            new graphql.GraphQLNonNull(UnionMember1.$GraphQL),
          ),
        ),
      },
      unionMember1sCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionMember1sCount()).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
      },
      unionMember2: {
        args: {
          identifier: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<UnionMember2> =>
          (
            await purify.EitherAsync<Error, UnionMember2>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.unionMember2(
                    await liftEither(
                      UnionMember2.$Identifier.fromString(args.identifier),
                    ),
                  ),
                ),
            )
          ).unsafeCoerce(),
        type: UnionMember2.$GraphQL,
      },
      unionMember2Identifiers: {
        args: {
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.unionMember2Identifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(UnionMember2.$Identifier.toString),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(graphql.GraphQLString),
        ),
      },
      unionMember2s: {
        args: {
          identifiers: {
            type: new graphql.GraphQLList(
              new graphql.GraphQLNonNull(graphql.GraphQLID),
            ),
          },
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: {
            identifiers: readonly string[] | null;
            limit: number | null;
            offset: number | null;
          },
          { objectSet },
        ): Promise<readonly UnionMember2[]> =>
          (
            await purify.EitherAsync<Error, readonly UnionMember2[]>(
              async ({ liftEither }) => {
                let where:
                  | $ObjectSet.Where<UnionMember2.$Identifier>
                  | undefined;
                if (args.identifiers) {
                  const identifiers: UnionMember2.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        UnionMember2.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  where = { identifiers, type: "identifiers" };
                }
                const objects: UnionMember2[] = [];
                for (const objectEither of await objectSet.unionMember2s({
                  limit: args.limit !== null ? args.limit : undefined,
                  offset: args.offset !== null ? args.offset : undefined,
                  where,
                })) {
                  objects.push(await liftEither(objectEither));
                }
                return objects;
              },
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(
            new graphql.GraphQLNonNull(UnionMember2.$GraphQL),
          ),
        ),
      },
      unionMember2sCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionMember2sCount()).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
      },
      union: {
        args: {
          identifier: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<Union> =>
          (
            await purify.EitherAsync<Error, Union>(async ({ liftEither }) =>
              liftEither(
                await objectSet.union(
                  await liftEither(
                    Union.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: Union.$GraphQL,
      },
      unionIdentifiers: {
        args: {
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.unionIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(Union.$Identifier.toString),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(graphql.GraphQLString),
        ),
      },
      unions: {
        args: {
          identifiers: {
            type: new graphql.GraphQLList(
              new graphql.GraphQLNonNull(graphql.GraphQLID),
            ),
          },
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        resolve: async (
          _source,
          args: {
            identifiers: readonly string[] | null;
            limit: number | null;
            offset: number | null;
          },
          { objectSet },
        ): Promise<readonly Union[]> =>
          (
            await purify.EitherAsync<Error, readonly Union[]>(
              async ({ liftEither }) => {
                let where: $ObjectSet.Where<Union.$Identifier> | undefined;
                if (args.identifiers) {
                  const identifiers: Union.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        Union.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  where = { identifiers, type: "identifiers" };
                }
                const objects: Union[] = [];
                for (const objectEither of await objectSet.unions({
                  limit: args.limit !== null ? args.limit : undefined,
                  offset: args.offset !== null ? args.offset : undefined,
                  where,
                })) {
                  objects.push(await liftEither(objectEither));
                }
                return objects;
              },
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(new graphql.GraphQLNonNull(Union.$GraphQL)),
        ),
      },
      unionsCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionsCount()).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
      },
    },
  }),
});

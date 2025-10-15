import {
  StoreFactory as _DatasetFactory,
  DataFactory as dataFactory,
} from "n3";
const datasetFactory: rdfjs.DatasetCoreFactory = new _DatasetFactory();
import type * as rdfjs from "@rdfjs/types";
import * as graphql from "graphql";
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
 * Type of lazy properties that return a set of objects. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class $LazyObjectSet<
  ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  StubObjectT extends { $identifier: ObjectIdentifierT },
> {
  private readonly resolver: (
    identifiers: readonly ObjectIdentifierT[],
  ) => Promise<purify.Either<Error, readonly ResolvedObjectT[]>>;
  readonly stubs: readonly StubObjectT[];

  constructor({
    resolver,
    stubs,
  }: {
    resolver: (
      identifiers: readonly ObjectIdentifierT[],
    ) => Promise<purify.Either<Error, readonly ResolvedObjectT[]>>;
    stubs: readonly StubObjectT[];
  }) {
    this.resolver = resolver;
    this.stubs = stubs;
  }

  async resolve(options?: { limit?: number; offset?: number }): Promise<
    purify.Either<Error, readonly ResolvedObjectT[]>
  > {
    if (this.stubs.length === 0) {
      return purify.Either.of([]);
    }

    const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
    }

    let offset = options?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    return await this.resolver(
      this.stubs.slice(offset, offset + limit).map((stub) => stub.$identifier),
    );
  }
}
/**
 * Type of lazy properties that return a single optional object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class $LazyOptionalObject<
  ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  StubObjectT extends { $identifier: ObjectIdentifierT },
> {
  private readonly resolver: (
    identifier: ObjectIdentifierT,
  ) => Promise<purify.Either<Error, ResolvedObjectT>>;
  readonly stub: purify.Maybe<StubObjectT>;

  constructor({
    resolver,
    stub,
  }: {
    resolver: (
      identifier: ObjectIdentifierT,
    ) => Promise<purify.Either<Error, ResolvedObjectT>>;
    stub: purify.Maybe<StubObjectT>;
  }) {
    this.resolver = resolver;
    this.stub = stub;
  }

  async resolve(): Promise<
    purify.Either<Error, purify.Maybe<ResolvedObjectT>>
  > {
    if (this.stub.isNothing()) {
      return purify.Either.of(purify.Maybe.empty());
    }
    return (await this.resolver(this.stub.unsafeCoerce().$identifier)).map(
      purify.Maybe.of,
    );
  }
}
export class $DefaultStub {
  readonly $identifier: $DefaultStub.$Identifier;
  readonly $type = "$DefaultStub";

  constructor(parameters: {
    readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this.$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this.$identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      this.$identifier = parameters.$identifier satisfies never;
    }
  }

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet?: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    return resource;
  }
}

export namespace $DefaultStub {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, $DefaultStub> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return $DefaultStub
      .$propertiesFromRdf({
        ...context,
        ignoreRdfType,
        objectSet,
        preferredLanguages,
        resource,
      })
      .map((properties) => new $DefaultStub(properties));
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<Error, { $identifier: rdfjs.BlankNode | rdfjs.NamedNode }> {
    const $identifier: $DefaultStub.$Identifier = $resource.identifier;
    return purify.Either.of({ $identifier });
  }

  export const $properties = {};
}
/**
 * UnionMember1
 */
export class UnionMember2 {
  private _$identifier?: UnionMember2.$Identifier;
  readonly $type = "UnionMember2";
  /**
   * Optional string property
   */
  readonly optionalStringProperty: purify.Maybe<string>;

  constructor(parameters?: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly optionalStringProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters?.$identifier === "object") {
      this._$identifier = parameters?.$identifier;
    } else if (typeof parameters?.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters?.$identifier);
    } else if (typeof parameters?.$identifier === "undefined") {
    } else {
      this._$identifier = parameters?.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters?.optionalStringProperty)) {
      this.optionalStringProperty = parameters?.optionalStringProperty;
    } else if (typeof parameters?.optionalStringProperty === "string") {
      this.optionalStringProperty = purify.Maybe.of(
        parameters?.optionalStringProperty,
      );
    } else if (typeof parameters?.optionalStringProperty === "undefined") {
      this.optionalStringProperty = purify.Maybe.empty();
    } else {
      this.optionalStringProperty =
        parameters?.optionalStringProperty satisfies never;
    }
  }

  get $identifier(): UnionMember2.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet?: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode("http://example.com/UnionMember2"),
      );
    }

    resource.add(
      UnionMember2.$properties.optionalStringProperty["identifier"],
      this.optionalStringProperty,
    );
    return resource;
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
        name: "_identifier",
        resolve: (source) =>
          UnionMember2.$Identifier.toString(source.$identifier),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      optionalStringProperty: {
        description: '"Optional string property"',
        name: "optionalStringProperty",
        resolve: (source, _args) =>
          source.optionalStringProperty.extractNullable(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
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
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, UnionMember2> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return UnionMember2.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new UnionMember2(properties));
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      optionalStringProperty: purify.Maybe<string>;
    }
  > {
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://example.com/UnionMember2":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(UnionMember2.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/UnionMember2)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    const $identifier: UnionMember2.$Identifier = $resource.identifier;
    const _optionalStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.optionalStringProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
          if (!filteredLiteralValues) {
            filteredLiteralValues = literalValues.filter(
              (value) => value.language === preferredLanguage,
            );
          } else {
            filteredLiteralValues = filteredLiteralValues.concat(
              ...literalValues
                .filter((value) => value.language === preferredLanguage)
                .toArray(),
            );
          }
        }

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate:
                  UnionMember2.$properties.optionalStringProperty["identifier"],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toString()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<string>>({
              object: purify.Maybe.empty(),
              predicate:
                UnionMember2.$properties.optionalStringProperty["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, optionalStringProperty });
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
  private _$identifier?: UnionMember1.$Identifier;
  readonly $type = "UnionMember1";
  /**
   * Optional number property
   */
  readonly optionalNumberProperty: purify.Maybe<number>;

  constructor(parameters?: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly optionalNumberProperty?: number | purify.Maybe<number>;
  }) {
    if (typeof parameters?.$identifier === "object") {
      this._$identifier = parameters?.$identifier;
    } else if (typeof parameters?.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters?.$identifier);
    } else if (typeof parameters?.$identifier === "undefined") {
    } else {
      this._$identifier = parameters?.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters?.optionalNumberProperty)) {
      this.optionalNumberProperty = parameters?.optionalNumberProperty;
    } else if (typeof parameters?.optionalNumberProperty === "number") {
      this.optionalNumberProperty = purify.Maybe.of(
        parameters?.optionalNumberProperty,
      );
    } else if (typeof parameters?.optionalNumberProperty === "undefined") {
      this.optionalNumberProperty = purify.Maybe.empty();
    } else {
      this.optionalNumberProperty =
        parameters?.optionalNumberProperty satisfies never;
    }
  }

  get $identifier(): UnionMember1.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet?: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode("http://example.com/UnionMember1"),
      );
    }

    resource.add(
      UnionMember1.$properties.optionalNumberProperty["identifier"],
      this.optionalNumberProperty,
    );
    return resource;
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
        name: "_identifier",
        resolve: (source) =>
          UnionMember1.$Identifier.toString(source.$identifier),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      optionalNumberProperty: {
        description: '"Optional number property"',
        name: "optionalNumberProperty",
        resolve: (source, _args) =>
          source.optionalNumberProperty.extractNullable(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLFloat),
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
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, UnionMember1> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return UnionMember1.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new UnionMember1(properties));
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      optionalNumberProperty: purify.Maybe<number>;
    }
  > {
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://example.com/UnionMember1":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(UnionMember1.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/UnionMember1)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    const $identifier: UnionMember1.$Identifier = $resource.identifier;
    const _optionalNumberPropertyEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.optionalNumberProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => values.chainMap((value) => value.toNumber()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<number>>({
              object: purify.Maybe.empty(),
              predicate:
                UnionMember1.$properties.optionalNumberProperty["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_optionalNumberPropertyEither.isLeft()) {
      return _optionalNumberPropertyEither;
    }

    const optionalNumberProperty = _optionalNumberPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, optionalNumberProperty });
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
  private _$identifier?: Nested.$Identifier;
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

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet?: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode("http://example.com/Nested"),
      );
    }

    resource.add(
      UnionMember1.$properties.optionalNumberProperty["identifier"],
      this.optionalNumberProperty,
    );
    resource.add(
      UnionMember2.$properties.optionalStringProperty["identifier"],
      this.optionalStringProperty,
    );
    resource.add(
      Nested.$properties.requiredStringProperty["identifier"],
      this.requiredStringProperty,
    );
    return resource;
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
        name: "_identifier",
        resolve: (source) => Nested.$Identifier.toString(source.$identifier),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      optionalNumberProperty: {
        description: '"Optional number property"',
        name: "optionalNumberProperty",
        resolve: (source, _args) =>
          source.optionalNumberProperty.extractNullable(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLFloat),
      },
      optionalStringProperty: {
        description: '"Optional string property"',
        name: "optionalStringProperty",
        resolve: (source, _args) =>
          source.optionalStringProperty.extractNullable(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      requiredStringProperty: {
        description: '"Required string property"',
        name: "requiredStringProperty",
        resolve: (source, _args) => source.requiredStringProperty,
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
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, Nested> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return Nested.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new Nested(properties));
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
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
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://example.com/Nested":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(Nested.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/Nested)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    const $identifier: Nested.$Identifier = $resource.identifier;
    const _optionalNumberPropertyEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.optionalNumberProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => values.chainMap((value) => value.toNumber()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<number>>({
              object: purify.Maybe.empty(),
              predicate:
                UnionMember1.$properties.optionalNumberProperty["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_optionalNumberPropertyEither.isLeft()) {
      return _optionalNumberPropertyEither;
    }

    const optionalNumberProperty = _optionalNumberPropertyEither.unsafeCoerce();
    const _optionalStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.optionalStringProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
          if (!filteredLiteralValues) {
            filteredLiteralValues = literalValues.filter(
              (value) => value.language === preferredLanguage,
            );
          } else {
            filteredLiteralValues = filteredLiteralValues.concat(
              ...literalValues
                .filter((value) => value.language === preferredLanguage)
                .toArray(),
            );
          }
        }

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate:
                  UnionMember2.$properties.optionalStringProperty["identifier"],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toString()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<string>>({
              object: purify.Maybe.empty(),
              predicate:
                UnionMember2.$properties.optionalStringProperty["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    const _requiredStringPropertyEither: purify.Either<Error, string> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >(
        $resource.values($properties.requiredStringProperty["identifier"], {
          unique: true,
        }),
      )
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
            if (!filteredLiteralValues) {
              filteredLiteralValues = literalValues.filter(
                (value) => value.language === preferredLanguage,
              );
            } else {
              filteredLiteralValues = filteredLiteralValues.concat(
                ...literalValues
                  .filter((value) => value.language === preferredLanguage)
                  .toArray(),
              );
            }
          }

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    Nested.$properties.requiredStringProperty["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toString()))
        .chain((values) => values.head());
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
 * Parent
 */
export class Parent {
  readonly $identifier: ParentStatic.$Identifier;
  readonly $type: "Parent" | "Child" = "Parent";
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

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet?: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableNamedResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode("http://example.com/Parent"),
      );
    }

    resource.add(
      ParentStatic.$properties.parentStringProperty["identifier"],
      this.parentStringProperty,
    );
    return resource;
  }
}

export namespace ParentStatic {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/Parent",
  );
  export const $GraphQL = new graphql.GraphQLObjectType<
    Parent,
    { objectSet: $ObjectSet }
  >({
    description: "Parent",
    fields: () => ({
      _identifier: {
        name: "_identifier",
        resolve: (source) =>
          ParentStatic.$Identifier.toString(source.$identifier),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      parentStringProperty: {
        description: '"Parent string property"',
        name: "parentStringProperty",
        resolve: (source, _args) =>
          source.parentStringProperty.extractNullable(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    }),
    name: "Parent",
  });
  export type $Identifier = rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjs.NamedNode> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory,
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

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, Parent> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return (
      Child.$fromRdf(resource, {
        ...context,
        ignoreRdfType: false,
        objectSet,
      }) as purify.Either<Error, Parent>
    ).altLazy(() =>
      ParentStatic.$propertiesFromRdf({
        ...context,
        ignoreRdfType,
        objectSet,
        preferredLanguages,
        resource,
      }).map((properties) => new Parent(properties)),
    );
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    { $identifier: rdfjs.NamedNode; parentStringProperty: purify.Maybe<string> }
  > {
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://example.com/Parent":
            case "http://example.com/Child":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(ParentStatic.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/Parent)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    if ($resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: $resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: $resource,
          predicate: $RdfVocabularies.rdf.subject,
        }),
      );
    }

    const $identifier: ParentStatic.$Identifier = $resource.identifier;
    const _parentStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.parentStringProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
          if (!filteredLiteralValues) {
            filteredLiteralValues = literalValues.filter(
              (value) => value.language === preferredLanguage,
            );
          } else {
            filteredLiteralValues = filteredLiteralValues.concat(
              ...literalValues
                .filter((value) => value.language === preferredLanguage)
                .toArray(),
            );
          }
        }

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate:
                  ParentStatic.$properties.parentStringProperty["identifier"],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toString()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<string>>({
              object: purify.Maybe.empty(),
              predicate:
                ParentStatic.$properties.parentStringProperty["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_parentStringPropertyEither.isLeft()) {
      return _parentStringPropertyEither;
    }

    const parentStringProperty = _parentStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, parentStringProperty });
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
 * Child
 */
export class Child extends Parent {
  override readonly $type = "Child";
  /**
   * Child string property
   */
  readonly childStringProperty: purify.Maybe<string>;
  /**
   * Lazy object set property
   */
  readonly lazyObjectSetProperty: $LazyObjectSet<
    Nested.$Identifier,
    Nested,
    $DefaultStub
  >;
  /**
   * Optional lazy object property
   */
  readonly optionalLazyObjectProperty: $LazyOptionalObject<
    Nested.$Identifier,
    Nested,
    $DefaultStub
  >;
  /**
   * Optional object property
   */
  readonly optionalObjectProperty: purify.Maybe<Nested>;
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
      readonly lazyObjectSetProperty?:
        | $LazyObjectSet<Nested.$Identifier, Nested, $DefaultStub>
        | readonly Nested[];
      readonly optionalLazyObjectProperty?:
        | $LazyOptionalObject<Nested.$Identifier, Nested, $DefaultStub>
        | Nested
        | purify.Maybe<Nested>;
      readonly optionalObjectProperty?: Nested | purify.Maybe<Nested>;
      readonly optionalStringProperty?: purify.Maybe<string> | string;
      readonly requiredStringProperty: string;
    } & ConstructorParameters<typeof Parent>[0],
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

    if (
      typeof parameters.lazyObjectSetProperty === "object" &&
      parameters.lazyObjectSetProperty instanceof $LazyObjectSet
    ) {
      this.lazyObjectSetProperty = parameters.lazyObjectSetProperty;
    } else if (typeof parameters.lazyObjectSetProperty === "object") {
      this.lazyObjectSetProperty = new $LazyObjectSet<
        Nested.$Identifier,
        Nested,
        $DefaultStub
      >({
        stubs: parameters.lazyObjectSetProperty.map(
          (object) => new $DefaultStub(object),
        ),
        resolver: async () =>
          purify.Either.of(
            parameters.lazyObjectSetProperty as readonly Nested[],
          ),
      });
    } else if (typeof parameters.lazyObjectSetProperty === "undefined") {
      this.lazyObjectSetProperty = new $LazyObjectSet<
        Nested.$Identifier,
        Nested,
        $DefaultStub
      >({
        stubs: [],
        resolver: async () => {
          throw new Error("should never be called");
        },
      });
    } else {
      this.lazyObjectSetProperty =
        parameters.lazyObjectSetProperty satisfies never;
    }

    if (
      typeof parameters.optionalLazyObjectProperty === "object" &&
      parameters.optionalLazyObjectProperty instanceof $LazyOptionalObject
    ) {
      this.optionalLazyObjectProperty = parameters.optionalLazyObjectProperty;
    } else if (purify.Maybe.isMaybe(parameters.optionalLazyObjectProperty)) {
      this.optionalLazyObjectProperty = new $LazyOptionalObject<
        Nested.$Identifier,
        Nested,
        $DefaultStub
      >({
        stub: parameters.optionalLazyObjectProperty.map(
          (object) => new $DefaultStub(object),
        ),
        resolver: async () =>
          purify.Either.of(
            (
              parameters.optionalLazyObjectProperty as purify.Maybe<Nested>
            ).unsafeCoerce(),
          ),
      });
    } else if (typeof parameters.optionalLazyObjectProperty === "object") {
      this.optionalLazyObjectProperty = new $LazyOptionalObject<
        Nested.$Identifier,
        Nested,
        $DefaultStub
      >({
        stub: purify.Maybe.of(
          new $DefaultStub(parameters.optionalLazyObjectProperty),
        ),
        resolver: async () =>
          purify.Either.of(parameters.optionalLazyObjectProperty as Nested),
      });
    } else if (typeof parameters.optionalLazyObjectProperty === "undefined") {
      this.optionalLazyObjectProperty = new $LazyOptionalObject<
        Nested.$Identifier,
        Nested,
        $DefaultStub
      >({
        stub: purify.Maybe.empty(),
        resolver: async () => {
          throw new Error("should never be called");
        },
      });
    } else {
      this.optionalLazyObjectProperty =
        parameters.optionalLazyObjectProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.optionalObjectProperty)) {
      this.optionalObjectProperty = parameters.optionalObjectProperty;
    } else if (
      typeof parameters.optionalObjectProperty === "object" &&
      parameters.optionalObjectProperty instanceof Nested
    ) {
      this.optionalObjectProperty = purify.Maybe.of(
        parameters.optionalObjectProperty,
      );
    } else if (typeof parameters.optionalObjectProperty === "undefined") {
      this.optionalObjectProperty = purify.Maybe.empty();
    } else {
      this.optionalObjectProperty =
        parameters.optionalObjectProperty satisfies never;
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

  override $toRdf(options?: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet?: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = super.$toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode("http://example.com/Child"),
      );
    }

    resource.add(
      Child.$properties.childStringProperty["identifier"],
      this.childStringProperty,
    );
    resource.add(
      Child.$properties.lazyObjectSetProperty["identifier"],
      this.lazyObjectSetProperty.stubs.map((item) =>
        item.$toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    resource.add(
      Child.$properties.optionalLazyObjectProperty["identifier"],
      this.optionalLazyObjectProperty.stub.map((value) =>
        value.$toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    resource.add(
      Child.$properties.optionalObjectProperty["identifier"],
      this.optionalObjectProperty.map((value) =>
        value.$toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    resource.add(
      UnionMember2.$properties.optionalStringProperty["identifier"],
      this.optionalStringProperty,
    );
    resource.add(
      Nested.$properties.requiredStringProperty["identifier"],
      this.requiredStringProperty,
    );
    return resource;
  }
}

export namespace Child {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/Child",
  );
  export const $GraphQL = new graphql.GraphQLObjectType<
    Child,
    { objectSet: $ObjectSet }
  >({
    description: "Child",
    fields: () => ({
      _identifier: {
        name: "_identifier",
        resolve: (source) => Child.$Identifier.toString(source.$identifier),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      childStringProperty: {
        description: '"Child string property"',
        name: "childStringProperty",
        resolve: (source, _args) =>
          source.childStringProperty.extractNullable(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      lazyObjectSetProperty: {
        args: {
          limit: { type: graphql.GraphQLInt },
          offset: { type: graphql.GraphQLInt },
        },
        description: '"Lazy object set property"',
        name: "lazyObjectSetProperty",
        resolve: async (source, args) =>
          (
            await source.lazyObjectSetProperty.resolve({
              limit: args.limit,
              offset: args.offset,
            })
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(new graphql.GraphQLNonNull(Nested.$GraphQL)),
        ),
      },
      optionalLazyObjectProperty: {
        description: '"Optional lazy object property"',
        name: "optionalLazyObjectProperty",
        resolve: async (source, _args) =>
          (await source.optionalLazyObjectProperty.resolve())
            .unsafeCoerce()
            .extractNullable(),
        type: new graphql.GraphQLNonNull(Nested.$GraphQL),
      },
      optionalObjectProperty: {
        description: '"Optional object property"',
        name: "optionalObjectProperty",
        resolve: (source, _args) =>
          source.optionalObjectProperty.extractNullable(),
        type: new graphql.GraphQLNonNull(Nested.$GraphQL),
      },
      optionalStringProperty: {
        description: '"Optional string property"',
        name: "optionalStringProperty",
        resolve: (source, _args) =>
          source.optionalStringProperty.extractNullable(),
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      requiredStringProperty: {
        description: '"Required string property"',
        name: "requiredStringProperty",
        resolve: (source, _args) => source.requiredStringProperty,
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    }),
    name: "Child",
  });
  export type $Identifier = ParentStatic.$Identifier;
  export const $Identifier = ParentStatic.$Identifier;

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, Child> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return Child.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new Child(properties));
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.NamedNode;
      childStringProperty: purify.Maybe<string>;
      lazyObjectSetProperty: $LazyObjectSet<
        Nested.$Identifier,
        Nested,
        $DefaultStub
      >;
      optionalLazyObjectProperty: $LazyOptionalObject<
        Nested.$Identifier,
        Nested,
        $DefaultStub
      >;
      optionalObjectProperty: purify.Maybe<Nested>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    } & $UnwrapR<ReturnType<typeof ParentStatic.$propertiesFromRdf>>
  > {
    const $super0Either = ParentStatic.$propertiesFromRdf({
      ...$context,
      ignoreRdfType: true,
      objectSet: $objectSet,
      preferredLanguages: $preferredLanguages,
      resource: $resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://example.com/Child":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(Child.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/Child)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    if ($resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: $resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: $resource,
          predicate: $RdfVocabularies.rdf.subject,
        }),
      );
    }

    const $identifier: Child.$Identifier = $resource.identifier;
    const _childStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.childStringProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
          if (!filteredLiteralValues) {
            filteredLiteralValues = literalValues.filter(
              (value) => value.language === preferredLanguage,
            );
          } else {
            filteredLiteralValues = filteredLiteralValues.concat(
              ...literalValues
                .filter((value) => value.language === preferredLanguage)
                .toArray(),
            );
          }
        }

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate: Child.$properties.childStringProperty["identifier"],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toString()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<string>>({
              object: purify.Maybe.empty(),
              predicate: Child.$properties.childStringProperty["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_childStringPropertyEither.isLeft()) {
      return _childStringPropertyEither;
    }

    const childStringProperty = _childStringPropertyEither.unsafeCoerce();
    const _lazyObjectSetPropertyEither: purify.Either<
      Error,
      $LazyObjectSet<Nested.$Identifier, Nested, $DefaultStub>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.lazyObjectSetProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) =>
        values.chainMap((value) =>
          value.toResource().chain((resource) =>
            $DefaultStub.$fromRdf(resource, {
              ...$context,
              ignoreRdfType: true,
              objectSet: $objectSet,
              preferredLanguages: $preferredLanguages,
            }),
          ),
        ),
      )
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate: Child.$properties.lazyObjectSetProperty["identifier"],
          subject: $resource,
        }),
      )
      .map((values) =>
        values.map(
          (stubs) =>
            new $LazyObjectSet<Nested.$Identifier, Nested, $DefaultStub>({
              stubs,
              resolver: (identifiers) =>
                $objectSet.nesteds({
                  where: { identifiers, type: "identifiers" },
                }),
            }),
        ),
      )
      .chain((values) => values.head());
    if (_lazyObjectSetPropertyEither.isLeft()) {
      return _lazyObjectSetPropertyEither;
    }

    const lazyObjectSetProperty = _lazyObjectSetPropertyEither.unsafeCoerce();
    const _optionalLazyObjectPropertyEither: purify.Either<
      Error,
      $LazyOptionalObject<Nested.$Identifier, Nested, $DefaultStub>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.optionalLazyObjectProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) =>
        values.chainMap((value) =>
          value.toResource().chain((resource) =>
            $DefaultStub.$fromRdf(resource, {
              ...$context,
              ignoreRdfType: true,
              objectSet: $objectSet,
              preferredLanguages: $preferredLanguages,
            }),
          ),
        ),
      )
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<$DefaultStub>>(
              {
                object: purify.Maybe.empty(),
                predicate:
                  Child.$properties.optionalLazyObjectProperty["identifier"],
                subject: $resource,
              },
            ),
      )
      .map((values) =>
        values.map(
          (stub) =>
            new $LazyOptionalObject<Nested.$Identifier, Nested, $DefaultStub>({
              stub,
              resolver: (identifier) => $objectSet.nested(identifier),
            }),
        ),
      )
      .chain((values) => values.head());
    if (_optionalLazyObjectPropertyEither.isLeft()) {
      return _optionalLazyObjectPropertyEither;
    }

    const optionalLazyObjectProperty =
      _optionalLazyObjectPropertyEither.unsafeCoerce();
    const _optionalObjectPropertyEither: purify.Either<
      Error,
      purify.Maybe<Nested>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.optionalObjectProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) =>
        values.chainMap((value) =>
          value.toResource().chain((resource) =>
            Nested.$fromRdf(resource, {
              ...$context,
              ignoreRdfType: true,
              objectSet: $objectSet,
              preferredLanguages: $preferredLanguages,
            }),
          ),
        ),
      )
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<Nested>>({
              object: purify.Maybe.empty(),
              predicate: Child.$properties.optionalObjectProperty["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_optionalObjectPropertyEither.isLeft()) {
      return _optionalObjectPropertyEither;
    }

    const optionalObjectProperty = _optionalObjectPropertyEither.unsafeCoerce();
    const _optionalStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.optionalStringProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
          if (!filteredLiteralValues) {
            filteredLiteralValues = literalValues.filter(
              (value) => value.language === preferredLanguage,
            );
          } else {
            filteredLiteralValues = filteredLiteralValues.concat(
              ...literalValues
                .filter((value) => value.language === preferredLanguage)
                .toArray(),
            );
          }
        }

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate:
                  UnionMember2.$properties.optionalStringProperty["identifier"],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toString()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<string>>({
              object: purify.Maybe.empty(),
              predicate:
                UnionMember2.$properties.optionalStringProperty["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    const _requiredStringPropertyEither: purify.Either<Error, string> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >(
        $resource.values($properties.requiredStringProperty["identifier"], {
          unique: true,
        }),
      )
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
            if (!filteredLiteralValues) {
              filteredLiteralValues = literalValues.filter(
                (value) => value.language === preferredLanguage,
              );
            } else {
              filteredLiteralValues = filteredLiteralValues.concat(
                ...literalValues
                  .filter((value) => value.language === preferredLanguage)
                  .toArray(),
              );
            }
          }

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    Nested.$properties.requiredStringProperty["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toString()))
        .chain((values) => values.head());
    if (_requiredStringPropertyEither.isLeft()) {
      return _requiredStringPropertyEither;
    }

    const requiredStringProperty = _requiredStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      childStringProperty,
      lazyObjectSetProperty,
      optionalLazyObjectProperty,
      optionalObjectProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export const $properties = {
    ...ParentStatic.$properties,
    childStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/childStringProperty",
      ),
    },
    lazyObjectSetProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/lazyObjectSetProperty",
      ),
    },
    optionalLazyObjectProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalLazyObjectProperty",
      ),
    },
    optionalObjectProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalObjectProperty",
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
  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, Union> {
    return (
      UnionMember1.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as purify.Either<Error, Union>
    ).altLazy(
      () =>
        UnionMember2.$fromRdf(resource, {
          ...options,
          ignoreRdfType: false,
        }) as purify.Either<Error, Union>,
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
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $toRdf(
    _union: Union,
    _parameters?: {
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
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
  child(identifier: Child.$Identifier): Promise<purify.Either<Error, Child>>;
  childIdentifiers(
    query?: $ObjectSet.Query<Child.$Identifier>,
  ): Promise<purify.Either<Error, readonly Child.$Identifier[]>>;
  children(
    query?: $ObjectSet.Query<Child.$Identifier>,
  ): Promise<purify.Either<Error, readonly Child[]>>;
  childrenCount(
    query?: Pick<$ObjectSet.Query<Child.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  nested(identifier: Nested.$Identifier): Promise<purify.Either<Error, Nested>>;
  nestedIdentifiers(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<purify.Either<Error, readonly Nested.$Identifier[]>>;
  nesteds(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<purify.Either<Error, readonly Nested[]>>;
  nestedsCount(
    query?: Pick<$ObjectSet.Query<Nested.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  parent(
    identifier: ParentStatic.$Identifier,
  ): Promise<purify.Either<Error, Parent>>;
  parentIdentifiers(
    query?: $ObjectSet.Query<ParentStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly ParentStatic.$Identifier[]>>;
  parents(
    query?: $ObjectSet.Query<ParentStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly Parent[]>>;
  parentsCount(
    query?: Pick<$ObjectSet.Query<ParentStatic.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  unionMember1(
    identifier: UnionMember1.$Identifier,
  ): Promise<purify.Either<Error, UnionMember1>>;
  unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember1.$Identifier[]>>;
  unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember1[]>>;
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
  ): Promise<purify.Either<Error, readonly UnionMember2[]>>;
  unionMember2sCount(
    query?: Pick<$ObjectSet.Query<UnionMember2.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  union(identifier: Union.$Identifier): Promise<purify.Either<Error, Union>>;
  unionIdentifiers(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<purify.Either<Error, readonly Union.$Identifier[]>>;
  unions(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<purify.Either<Error, readonly Union[]>>;
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
  > =
    | {
        readonly identifiers: readonly ObjectIdentifierT[];
        readonly type: "identifiers";
      }
    | {
        readonly predicate: rdfjs.NamedNode;
        readonly subject: rdfjs.BlankNode | rdfjs.NamedNode;
        readonly type: "triple-objects";
      };
}

export abstract class $ForwardingObjectSet implements $ObjectSet {
  protected abstract get $delegate(): $ObjectSet;

  child(identifier: Child.$Identifier): Promise<purify.Either<Error, Child>> {
    return this.$delegate.child(identifier);
  }

  childIdentifiers(
    query?: $ObjectSet.Query<Child.$Identifier>,
  ): Promise<purify.Either<Error, readonly Child.$Identifier[]>> {
    return this.$delegate.childIdentifiers(query);
  }

  children(
    query?: $ObjectSet.Query<Child.$Identifier>,
  ): Promise<purify.Either<Error, readonly Child[]>> {
    return this.$delegate.children(query);
  }

  childrenCount(
    query?: Pick<$ObjectSet.Query<Child.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.childrenCount(query);
  }

  nested(
    identifier: Nested.$Identifier,
  ): Promise<purify.Either<Error, Nested>> {
    return this.$delegate.nested(identifier);
  }

  nestedIdentifiers(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<purify.Either<Error, readonly Nested.$Identifier[]>> {
    return this.$delegate.nestedIdentifiers(query);
  }

  nesteds(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<purify.Either<Error, readonly Nested[]>> {
    return this.$delegate.nesteds(query);
  }

  nestedsCount(
    query?: Pick<$ObjectSet.Query<Nested.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.nestedsCount(query);
  }

  parent(
    identifier: ParentStatic.$Identifier,
  ): Promise<purify.Either<Error, Parent>> {
    return this.$delegate.parent(identifier);
  }

  parentIdentifiers(
    query?: $ObjectSet.Query<ParentStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly ParentStatic.$Identifier[]>> {
    return this.$delegate.parentIdentifiers(query);
  }

  parents(
    query?: $ObjectSet.Query<ParentStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly Parent[]>> {
    return this.$delegate.parents(query);
  }

  parentsCount(
    query?: Pick<$ObjectSet.Query<ParentStatic.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.parentsCount(query);
  }

  unionMember1(
    identifier: UnionMember1.$Identifier,
  ): Promise<purify.Either<Error, UnionMember1>> {
    return this.$delegate.unionMember1(identifier);
  }

  unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember1.$Identifier[]>> {
    return this.$delegate.unionMember1Identifiers(query);
  }

  unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember1[]>> {
    return this.$delegate.unionMember1s(query);
  }

  unionMember1sCount(
    query?: Pick<$ObjectSet.Query<UnionMember1.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.unionMember1sCount(query);
  }

  unionMember2(
    identifier: UnionMember2.$Identifier,
  ): Promise<purify.Either<Error, UnionMember2>> {
    return this.$delegate.unionMember2(identifier);
  }

  unionMember2Identifiers(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember2.$Identifier[]>> {
    return this.$delegate.unionMember2Identifiers(query);
  }

  unionMember2s(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember2[]>> {
    return this.$delegate.unionMember2s(query);
  }

  unionMember2sCount(
    query?: Pick<$ObjectSet.Query<UnionMember2.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.unionMember2sCount(query);
  }

  union(identifier: Union.$Identifier): Promise<purify.Either<Error, Union>> {
    return this.$delegate.union(identifier);
  }

  unionIdentifiers(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<purify.Either<Error, readonly Union.$Identifier[]>> {
    return this.$delegate.unionIdentifiers(query);
  }

  unions(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<purify.Either<Error, readonly Union[]>> {
    return this.$delegate.unions(query);
  }

  unionsCount(
    query?: Pick<$ObjectSet.Query<Union.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.unionsCount(query);
  }
}

export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly resourceSet: rdfjsResource.ResourceSet;

  constructor({ dataset }: { dataset: rdfjs.DatasetCore }) {
    this.resourceSet = new rdfjsResource.ResourceSet({ dataset });
  }

  async child(
    identifier: Child.$Identifier,
  ): Promise<purify.Either<Error, Child>> {
    return this.childSync(identifier);
  }

  childSync(identifier: Child.$Identifier): purify.Either<Error, Child> {
    return this.childrenSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async childIdentifiers(
    query?: $ObjectSet.Query<Child.$Identifier>,
  ): Promise<purify.Either<Error, readonly Child.$Identifier[]>> {
    return this.childIdentifiersSync(query);
  }

  childIdentifiersSync(
    query?: $ObjectSet.Query<Child.$Identifier>,
  ): purify.Either<Error, readonly Child.$Identifier[]> {
    return this.$objectIdentifiersSync<Child, Child.$Identifier>(
      { $fromRdf: Child.$fromRdf, $fromRdfTypes: [Child.$fromRdfType] },
      query,
    );
  }

  async children(
    query?: $ObjectSet.Query<Child.$Identifier>,
  ): Promise<purify.Either<Error, readonly Child[]>> {
    return this.childrenSync(query);
  }

  childrenSync(
    query?: $ObjectSet.Query<Child.$Identifier>,
  ): purify.Either<Error, readonly Child[]> {
    return this.$objectsSync<Child, Child.$Identifier>(
      { $fromRdf: Child.$fromRdf, $fromRdfTypes: [Child.$fromRdfType] },
      query,
    );
  }

  async childrenCount(
    query?: Pick<$ObjectSet.Query<Child.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.childrenCountSync(query);
  }

  childrenCountSync(
    query?: Pick<$ObjectSet.Query<Child.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<Child, Child.$Identifier>(
      { $fromRdf: Child.$fromRdf, $fromRdfTypes: [Child.$fromRdfType] },
      query,
    );
  }

  async nested(
    identifier: Nested.$Identifier,
  ): Promise<purify.Either<Error, Nested>> {
    return this.nestedSync(identifier);
  }

  nestedSync(identifier: Nested.$Identifier): purify.Either<Error, Nested> {
    return this.nestedsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async nestedIdentifiers(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<purify.Either<Error, readonly Nested.$Identifier[]>> {
    return this.nestedIdentifiersSync(query);
  }

  nestedIdentifiersSync(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): purify.Either<Error, readonly Nested.$Identifier[]> {
    return this.$objectIdentifiersSync<Nested, Nested.$Identifier>(
      { $fromRdf: Nested.$fromRdf, $fromRdfTypes: [Nested.$fromRdfType] },
      query,
    );
  }

  async nesteds(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): Promise<purify.Either<Error, readonly Nested[]>> {
    return this.nestedsSync(query);
  }

  nestedsSync(
    query?: $ObjectSet.Query<Nested.$Identifier>,
  ): purify.Either<Error, readonly Nested[]> {
    return this.$objectsSync<Nested, Nested.$Identifier>(
      { $fromRdf: Nested.$fromRdf, $fromRdfTypes: [Nested.$fromRdfType] },
      query,
    );
  }

  async nestedsCount(
    query?: Pick<$ObjectSet.Query<Nested.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.nestedsCountSync(query);
  }

  nestedsCountSync(
    query?: Pick<$ObjectSet.Query<Nested.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<Nested, Nested.$Identifier>(
      { $fromRdf: Nested.$fromRdf, $fromRdfTypes: [Nested.$fromRdfType] },
      query,
    );
  }

  async parent(
    identifier: ParentStatic.$Identifier,
  ): Promise<purify.Either<Error, Parent>> {
    return this.parentSync(identifier);
  }

  parentSync(
    identifier: ParentStatic.$Identifier,
  ): purify.Either<Error, Parent> {
    return this.parentsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async parentIdentifiers(
    query?: $ObjectSet.Query<ParentStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly ParentStatic.$Identifier[]>> {
    return this.parentIdentifiersSync(query);
  }

  parentIdentifiersSync(
    query?: $ObjectSet.Query<ParentStatic.$Identifier>,
  ): purify.Either<Error, readonly ParentStatic.$Identifier[]> {
    return this.$objectIdentifiersSync<Parent, ParentStatic.$Identifier>(
      {
        $fromRdf: ParentStatic.$fromRdf,
        $fromRdfTypes: [ParentStatic.$fromRdfType, Child.$fromRdfType],
      },
      query,
    );
  }

  async parents(
    query?: $ObjectSet.Query<ParentStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly Parent[]>> {
    return this.parentsSync(query);
  }

  parentsSync(
    query?: $ObjectSet.Query<ParentStatic.$Identifier>,
  ): purify.Either<Error, readonly Parent[]> {
    return this.$objectsSync<Parent, ParentStatic.$Identifier>(
      {
        $fromRdf: ParentStatic.$fromRdf,
        $fromRdfTypes: [ParentStatic.$fromRdfType, Child.$fromRdfType],
      },
      query,
    );
  }

  async parentsCount(
    query?: Pick<$ObjectSet.Query<ParentStatic.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.parentsCountSync(query);
  }

  parentsCountSync(
    query?: Pick<$ObjectSet.Query<ParentStatic.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<Parent, ParentStatic.$Identifier>(
      {
        $fromRdf: ParentStatic.$fromRdf,
        $fromRdfTypes: [ParentStatic.$fromRdfType, Child.$fromRdfType],
      },
      query,
    );
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
    }).map((objects) => objects[0]);
  }

  async unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember1.$Identifier[]>> {
    return this.unionMember1IdentifiersSync(query);
  }

  unionMember1IdentifiersSync(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): purify.Either<Error, readonly UnionMember1.$Identifier[]> {
    return this.$objectIdentifiersSync<UnionMember1, UnionMember1.$Identifier>(
      {
        $fromRdf: UnionMember1.$fromRdf,
        $fromRdfTypes: [UnionMember1.$fromRdfType],
      },
      query,
    );
  }

  async unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember1[]>> {
    return this.unionMember1sSync(query);
  }

  unionMember1sSync(
    query?: $ObjectSet.Query<UnionMember1.$Identifier>,
  ): purify.Either<Error, readonly UnionMember1[]> {
    return this.$objectsSync<UnionMember1, UnionMember1.$Identifier>(
      {
        $fromRdf: UnionMember1.$fromRdf,
        $fromRdfTypes: [UnionMember1.$fromRdfType],
      },
      query,
    );
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
      {
        $fromRdf: UnionMember1.$fromRdf,
        $fromRdfTypes: [UnionMember1.$fromRdfType],
      },
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
    }).map((objects) => objects[0]);
  }

  async unionMember2Identifiers(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember2.$Identifier[]>> {
    return this.unionMember2IdentifiersSync(query);
  }

  unionMember2IdentifiersSync(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): purify.Either<Error, readonly UnionMember2.$Identifier[]> {
    return this.$objectIdentifiersSync<UnionMember2, UnionMember2.$Identifier>(
      {
        $fromRdf: UnionMember2.$fromRdf,
        $fromRdfTypes: [UnionMember2.$fromRdfType],
      },
      query,
    );
  }

  async unionMember2s(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionMember2[]>> {
    return this.unionMember2sSync(query);
  }

  unionMember2sSync(
    query?: $ObjectSet.Query<UnionMember2.$Identifier>,
  ): purify.Either<Error, readonly UnionMember2[]> {
    return this.$objectsSync<UnionMember2, UnionMember2.$Identifier>(
      {
        $fromRdf: UnionMember2.$fromRdf,
        $fromRdfTypes: [UnionMember2.$fromRdfType],
      },
      query,
    );
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
      {
        $fromRdf: UnionMember2.$fromRdf,
        $fromRdfTypes: [UnionMember2.$fromRdfType],
      },
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
    }).map((objects) => objects[0]);
  }

  async unionIdentifiers(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<purify.Either<Error, readonly Union.$Identifier[]>> {
    return this.unionIdentifiersSync(query);
  }

  unionIdentifiersSync(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): purify.Either<Error, readonly Union.$Identifier[]> {
    return this.$objectUnionIdentifiersSync<Union, Union.$Identifier>(
      [
        {
          $fromRdf: UnionMember1.$fromRdf,
          $fromRdfTypes: [UnionMember1.$fromRdfType],
        },
        {
          $fromRdf: UnionMember2.$fromRdf,
          $fromRdfTypes: [UnionMember2.$fromRdfType],
        },
      ],
      query,
    );
  }

  async unions(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): Promise<purify.Either<Error, readonly Union[]>> {
    return this.unionsSync(query);
  }

  unionsSync(
    query?: $ObjectSet.Query<Union.$Identifier>,
  ): purify.Either<Error, readonly Union[]> {
    return this.$objectUnionsSync<Union, Union.$Identifier>(
      [
        {
          $fromRdf: UnionMember1.$fromRdf,
          $fromRdfTypes: [UnionMember1.$fromRdfType],
        },
        {
          $fromRdf: UnionMember2.$fromRdf,
          $fromRdfTypes: [UnionMember2.$fromRdfType],
        },
      ],
      query,
    );
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
      [
        {
          $fromRdf: UnionMember1.$fromRdf,
          $fromRdfTypes: [UnionMember1.$fromRdfType],
        },
        {
          $fromRdf: UnionMember2.$fromRdf,
          $fromRdfTypes: [UnionMember2.$fromRdfType],
        },
      ],
      query,
    );
  }

  protected $objectIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, readonly ObjectIdentifierT[]> {
    return this.$objectsSync<ObjectT, ObjectIdentifierT>(objectType, query).map(
      (objects) => objects.map((object) => object.$identifier),
    );
  }

  protected $objectsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      // Assign identifiers in each case block so the compiler will catch missing cases.
      let identifiers: rdfjsResource.Resource.Identifier[];
      switch (query.where.type) {
        case "identifiers": {
          identifiers = query.where.identifiers.slice(offset, offset + limit);
          break;
        }
        case "triple-objects": {
          let identifierI = 0;
          identifiers = [];
          for (const quad of this.resourceSet.dataset.match(
            query.where.subject,
            query.where.predicate,
            null,
          )) {
            if (
              quad.object.termType === "BlankNode" ||
              quad.object.termType === "NamedNode"
            ) {
              if (++identifierI >= offset) {
                identifiers.push(quad.object);
                if (identifiers.length === limit) {
                  break;
                }
              }
            } else {
              return purify.Left(
                new Error(
                  `subject=${query.where.subject.value} predicate=${query.where.predicate.value} pattern matches non-identifier (${quad.object.termType}) triple`,
                ),
              );
            }
          }
          break;
        }
      }

      const objects: ObjectT[] = [];
      for (const identifier of identifiers) {
        const either = objectType.$fromRdf(
          this.resourceSet.resource(identifier),
          { objectSet: this },
        );
        if (either.isLeft()) {
          return either;
        }
        objects.push(either.unsafeCoerce());
      }
      return purify.Either.of(objects);
    }

    if (objectType.$fromRdfTypes.length === 0) {
      return purify.Either.of([]);
    }

    const resources: rdfjsResource.Resource[] = [];
    for (const fromRdfType of objectType.$fromRdfTypes) {
      for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
        if (
          !resources.some((existingResource) =>
            existingResource.identifier.equals(resource.identifier),
          )
        ) {
          resources.push(resource);
        }
      }
    }
    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.identifier.value.localeCompare(right.identifier.value),
    );

    const objects: ObjectT[] = [];
    let objectI = 0;
    for (const resource of resources) {
      const either = objectType.$fromRdf(resource, { objectSet: this });
      if (either.isLeft()) {
        return either;
      }
      if (objectI++ >= offset) {
        objects.push(either.unsafeCoerce());
        if (objects.length === limit) {
          return purify.Either.of(objects);
        }
      }
    }
    return purify.Either.of(objects);
  }

  protected $objectsCountSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    return this.$objectsSync<ObjectT, ObjectIdentifierT>(objectType, query).map(
      (objects) => objects.length,
    );
  }

  protected $objectUnionIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, readonly ObjectIdentifierT[]> {
    return this.$objectUnionsSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    ).map((objects) => objects.map((object) => object.$identifier));
  }

  protected $objectUnionsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      // Assign identifiers in each case block so the compiler will catch missing cases.
      let identifiers: rdfjsResource.Resource.Identifier[];
      switch (query.where.type) {
        case "identifiers": {
          identifiers = query.where.identifiers.slice(offset, offset + limit);
          break;
        }
        case "triple-objects": {
          let identifierI = 0;
          identifiers = [];
          for (const quad of this.resourceSet.dataset.match(
            query.where.subject,
            query.where.predicate,
            null,
          )) {
            if (
              quad.object.termType === "BlankNode" ||
              quad.object.termType === "NamedNode"
            ) {
              if (++identifierI >= offset) {
                identifiers.push(quad.object);
                if (identifiers.length === limit) {
                  break;
                }
              }
            } else {
              return purify.Left(
                new Error(
                  `subject=${query.where.subject.value} predicate=${query.where.predicate.value} pattern matches non-identifier (${quad.object.termType}) triple`,
                ),
              );
            }
          }
          break;
        }
      }

      const objects: ObjectT[] = [];
      for (const identifier of identifiers) {
        const resource = this.resourceSet.resource(identifier);
        const lefts: purify.Either<Error, ObjectT>[] = [];
        for (const objectType of objectTypes) {
          const either = objectType.$fromRdf(resource, { objectSet: this });
          if (either.isRight()) {
            objects.push(either.unsafeCoerce());
            break;
          }
          lefts.push(either);
        }
        // Doesn't appear to belong to any of the known object types, just assume the first
        if (lefts.length === objectTypes.length) {
          return lefts[0] as unknown as purify.Either<
            Error,
            readonly ObjectT[]
          >;
        }
      }
      return purify.Either.of(objects);
    }

    const resources: {
      objectType: {
        $fromRdf: (
          resource: rdfjsResource.Resource,
          options: { objectSet: $ObjectSet },
        ) => purify.Either<Error, ObjectT>;
        $fromRdfTypes: readonly rdfjs.NamedNode[];
      };
      resource: rdfjsResource.Resource;
    }[] = [];
    for (const objectType of objectTypes) {
      if (objectType.$fromRdfTypes.length === 0) {
        continue;
      }

      for (const fromRdfType of objectType.$fromRdfTypes) {
        for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
          if (
            !resources.some(({ resource: existingResource }) =>
              existingResource.identifier.equals(resource.identifier),
            )
          ) {
            resources.push({ objectType, resource });
          }
        }
      }
    }
    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.resource.identifier.value.localeCompare(
        right.resource.identifier.value,
      ),
    );

    let objectI = 0;
    const objects: ObjectT[] = [];
    for (const { objectType, resource } of resources) {
      const either = objectType.$fromRdf(resource, { objectSet: this });
      if (either.isLeft()) {
        return either;
      }
      if (objectI++ >= offset) {
        objects.push(either.unsafeCoerce());
        if (objects.length === limit) {
          return purify.Either.of(objects);
        }
      }
    }
    return purify.Either.of(objects);
  }

  protected $objectUnionsCountSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    return this.$objectUnionIdentifiersSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    ).map((objects) => objects.length);
  }
}

export const graphqlSchema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType<null, { objectSet: $ObjectSet }>({
    name: "Query",
    fields: {
      child: {
        args: {
          identifier: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<Child> =>
          (
            await purify.EitherAsync<Error, Child>(async ({ liftEither }) =>
              liftEither(
                await objectSet.child(
                  await liftEither(
                    Child.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(Child.$GraphQL),
      },
      childIdentifiers: {
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
            await objectSet.childIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(Child.$Identifier.toString),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(graphql.GraphQLString),
        ),
      },
      children: {
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
        ): Promise<readonly Child[]> =>
          (
            await purify.EitherAsync<Error, readonly Child[]>(
              async ({ liftEither }) => {
                let where: $ObjectSet.Where<Child.$Identifier> | undefined;
                if (args.identifiers) {
                  const identifiers: Child.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        Child.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  where = { identifiers, type: "identifiers" };
                }
                return await liftEither(
                  await objectSet.children({
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                    where,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(new graphql.GraphQLNonNull(Child.$GraphQL)),
        ),
      },
      childrenCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.childrenCount()).unsafeCoerce(),
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
        type: new graphql.GraphQLNonNull(Nested.$GraphQL),
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
                return await liftEither(
                  await objectSet.nesteds({
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                    where,
                  }),
                );
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
      parent: {
        args: {
          identifier: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<Parent> =>
          (
            await purify.EitherAsync<Error, Parent>(async ({ liftEither }) =>
              liftEither(
                await objectSet.parent(
                  await liftEither(
                    ParentStatic.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(ParentStatic.$GraphQL),
      },
      parentIdentifiers: {
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
            await objectSet.parentIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(ParentStatic.$Identifier.toString),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(graphql.GraphQLString),
        ),
      },
      parents: {
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
        ): Promise<readonly Parent[]> =>
          (
            await purify.EitherAsync<Error, readonly Parent[]>(
              async ({ liftEither }) => {
                let where:
                  | $ObjectSet.Where<ParentStatic.$Identifier>
                  | undefined;
                if (args.identifiers) {
                  const identifiers: ParentStatic.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        ParentStatic.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  where = { identifiers, type: "identifiers" };
                }
                return await liftEither(
                  await objectSet.parents({
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                    where,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new graphql.GraphQLNonNull(
          new graphql.GraphQLList(
            new graphql.GraphQLNonNull(ParentStatic.$GraphQL),
          ),
        ),
      },
      parentsCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.parentsCount()).unsafeCoerce(),
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
        type: new graphql.GraphQLNonNull(UnionMember1.$GraphQL),
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
                return await liftEither(
                  await objectSet.unionMember1s({
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                    where,
                  }),
                );
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
        type: new graphql.GraphQLNonNull(UnionMember2.$GraphQL),
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
                return await liftEither(
                  await objectSet.unionMember2s({
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                    where,
                  }),
                );
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
        type: new graphql.GraphQLNonNull(Union.$GraphQL),
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
                return await liftEither(
                  await objectSet.unions({
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                    where,
                  }),
                );
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

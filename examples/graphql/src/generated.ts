import type {
  BlankNode,
  DatasetCore,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from "graphql";
import { StoreFactory as DatasetFactory, DataFactory as dataFactory } from "n3";
import { Either, EitherAsync, Left, Maybe } from "purify-ts";
import { LiteralFactory, Resource, ResourceSet } from "rdfjs-resource";

type $CollectionFilter<ItemFilterT> = ItemFilterT & {
  readonly $maxCount?: number;
  readonly $minCount?: number;
};

const $datasetFactory = new DatasetFactory();

function $filterArray<ItemT, ItemFilterT>(
  filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean,
) {
  return (
    filter: $CollectionFilter<ItemFilterT>,
    values: readonly ItemT[],
  ): boolean => {
    for (const value of values) {
      if (!filterItem(filter, value)) {
        return false;
      }
    }

    if (
      typeof filter.$maxCount !== "undefined" &&
      values.length > filter.$maxCount
    ) {
      return false;
    }

    if (
      typeof filter.$minCount !== "undefined" &&
      values.length < filter.$minCount
    ) {
      return false;
    }

    return true;
  };
}

function $filterIdentifier(
  filter: $IdentifierFilter,
  value: BlankNode | NamedNode,
) {
  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
    return false;
  }

  if (typeof filter.type !== "undefined" && value.termType !== filter.type) {
    return false;
  }

  return true;
}

function $filterMaybe<ItemT, ItemFilterT>(
  filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean,
) {
  return (filter: $MaybeFilter<ItemFilterT>, value: Maybe<ItemT>): boolean => {
    if (filter !== null) {
      if (value.isNothing()) {
        return false;
      }

      if (!filterItem(filter, value.extract()!)) {
        return false;
      }
    } else {
      if (value.isJust()) {
        return false;
      }
    }

    return true;
  };
}

function $filterNamedNode(filter: $NamedNodeFilter, value: NamedNode) {
  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
    return false;
  }

  return true;
}

function $filterNumeric<T extends bigint | number>(
  filter: $NumericFilter<T>,
  value: T,
) {
  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inValue) => inValue === value)
  ) {
    return false;
  }

  if (
    typeof filter.maxExclusive !== "undefined" &&
    value >= filter.maxExclusive
  ) {
    return false;
  }

  if (
    typeof filter.maxInclusive !== "undefined" &&
    value > filter.maxInclusive
  ) {
    return false;
  }

  if (
    typeof filter.minExclusive !== "undefined" &&
    value <= filter.minExclusive
  ) {
    return false;
  }

  if (
    typeof filter.minInclusive !== "undefined" &&
    value < filter.minInclusive
  ) {
    return false;
  }

  return true;
}

function $filterString(filter: $StringFilter, value: string) {
  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inValue) => inValue === value)
  ) {
    return false;
  }

  if (
    typeof filter.maxLength !== "undefined" &&
    value.length > filter.maxLength
  ) {
    return false;
  }

  if (
    typeof filter.minLength !== "undefined" &&
    value.length < filter.minLength
  ) {
    return false;
  }

  return true;
}

type $FromRdfOptions = {
  context?: any;
  ignoreRdfType?: boolean;
  objectSet?: $ObjectSet;
  preferredLanguages?: readonly string[];
};

function $fromRdfPreferredLanguages({
  focusResource,
  predicate,
  preferredLanguages,
  values,
}: {
  focusResource: Resource;
  predicate: NamedNode;
  preferredLanguages?: readonly string[];
  values: Resource.Values<Resource.TermValue>;
}): Either<Error, Resource.Values<Resource.TermValue>> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return Either.of<Error, Resource.Values<Resource.TermValue>>(values);
  }

  return values
    .chainMap((value) => value.toLiteral())
    .map((literalValues) => {
      // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
      // Within a preferredLanguage the literals may be in any order.
      let filteredLiteralValues: Resource.Values<Literal> | undefined;
      for (const preferredLanguage of preferredLanguages) {
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

      return filteredLiteralValues!.map(
        (literalValue) =>
          new Resource.TermValue({
            focusResource,
            predicate,
            term: literalValue,
          }),
      );
    });
}

interface $IdentifierFilter {
  readonly in?: readonly (BlankNode | NamedNode)[];
  readonly type?: "BlankNode" | "NamedNode";
}

function $identifierFromString(
  identifier: string,
): Either<Error, BlankNode | NamedNode> {
  return Either.encase(() =>
    Resource.Identifier.fromString({ dataFactory, identifier }),
  );
}

class $IdentifierSet {
  private readonly blankNodeValues = new Set<string>();
  private readonly namedNodeValues = new Set<string>();

  add(identifier: BlankNode | NamedNode): this {
    switch (identifier.termType) {
      case "BlankNode":
        this.blankNodeValues.add(identifier.value);
        return this;
      case "NamedNode":
        this.namedNodeValues.add(identifier.value);
        return this;
    }
  }

  has(identifier: BlankNode | NamedNode): boolean {
    switch (identifier.termType) {
      case "BlankNode":
        return this.blankNodeValues.has(identifier.value);
      case "NamedNode":
        return this.namedNodeValues.has(identifier.value);
    }
  }
}

/**
 * Type of lazy properties that return a single optional object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class $LazyObjectOption<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
> {
  readonly partial: Maybe<PartialObjectT>;
  private readonly resolver: (
    identifier: ObjectIdentifierT,
  ) => Promise<Either<Error, ResolvedObjectT>>;

  constructor({
    partial,
    resolver,
  }: {
    partial: Maybe<PartialObjectT>;
    resolver: (
      identifier: ObjectIdentifierT,
    ) => Promise<Either<Error, ResolvedObjectT>>;
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  async resolve(): Promise<Either<Error, Maybe<ResolvedObjectT>>> {
    if (this.partial.isNothing()) {
      return Either.of(Maybe.empty());
    }
    return (await this.resolver(this.partial.unsafeCoerce().$identifier)).map(
      Maybe.of,
    );
  }
}

/**
 * Type of lazy properties that return a set of objects. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class $LazyObjectSet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
> {
  readonly partials: readonly PartialObjectT[];
  private readonly resolver: (
    identifiers: readonly ObjectIdentifierT[],
  ) => Promise<Either<Error, readonly ResolvedObjectT[]>>;

  constructor({
    partials,
    resolver,
  }: {
    partials: readonly PartialObjectT[];
    resolver: (
      identifiers: readonly ObjectIdentifierT[],
    ) => Promise<Either<Error, readonly ResolvedObjectT[]>>;
  }) {
    this.partials = partials;
    this.resolver = resolver;
  }

  get length(): number {
    return this.partials.length;
  }

  async resolve(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Either<Error, readonly ResolvedObjectT[]>> {
    if (this.partials.length === 0) {
      return Either.of([]);
    }

    const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Either.of([]);
    }

    let offset = options?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    return await this.resolver(
      this.partials
        .slice(offset, offset + limit)
        .map((partial) => partial.$identifier),
    );
  }
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

interface $NamedNodeFilter {
  readonly in?: readonly NamedNode[];
}

interface $NumericFilter<T extends bigint | number> {
  readonly in?: readonly T[];
  readonly maxExclusive?: T;
  readonly maxInclusive?: T;
  readonly minExclusive?: T;
  readonly minInclusive?: T;
}

type $PropertiesFromRdfParameters = {
  context?: any;
  ignoreRdfType: boolean;
  objectSet: $ObjectSet;
  preferredLanguages?: readonly string[];
  resource: Resource;
};

namespace $RdfVocabularies {
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
    export const byte = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#byte",
    );
    export const date = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#date",
    );
    export const dateTime = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#dateTime",
    );
    export const decimal = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#decimal",
    );
    export const double = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#double",
    );
    export const float = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#float",
    );
    export const int = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#int",
    );
    export const integer = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#integer",
    );
    export const long = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#long",
    );
    export const negativeInteger = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#negativeInteger",
    );
    export const nonNegativeInteger = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
    );
    export const nonPositiveInteger = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
    );
    export const positiveInteger = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#positiveInteger",
    );
    export const short = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#short",
    );
    export const string = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#string",
    );
    export const unsignedByte = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedByte",
    );
    export const unsignedInt = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedInt",
    );
    export const unsignedLong = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedLong",
    );
    export const unsignedShort = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedShort",
    );
  }
}

interface $StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}

type $UnwrapR<T> = T extends Either<any, infer R> ? R : never;
export class $DefaultPartial {
  readonly $identifier: $DefaultPartial.$Identifier;

  readonly $type: "$DefaultPartial" = "$DefaultPartial" as const;

  constructor(parameters: {
    readonly $identifier: (BlankNode | NamedNode) | string;
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
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(this.$identifier);
    return resource;
  }
}

export namespace $DefaultPartial {
  export function $filter(
    filter: $DefaultPartial.$Filter,
    value: $DefaultPartial,
  ): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = { readonly $identifier?: $IdentifierFilter };

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function is$DefaultPartial(
    object: $Object,
  ): object is $DefaultPartial {
    switch (object.$type) {
      case "$DefaultPartial":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, $DefaultPartial> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return $DefaultPartial
      .$propertiesFromRdf({
        context,
        ignoreRdfType,
        objectSet,
        preferredLanguages,
        resource,
      })
      .map((properties) => new $DefaultPartial(properties));
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<Error, { $identifier: BlankNode | NamedNode }> {
    return Either.of<Error, $DefaultPartial.$Identifier>(
      $parameters.resource.identifier as $DefaultPartial.$Identifier,
    ).map(($identifier) => ({ $identifier }));
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "TypeDiscriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["$DefaultPartial"],
        }),
      },
    },
  } as const;
} /**
 * UnionMember1
 */

export class UnionMember2 {
  private _$identifier?: UnionMember2.$Identifier;

  readonly $type: "UnionMember2" = "UnionMember2" as const;

  /**
   * Optional string property
   */
  readonly optionalStringProperty: Maybe<string>;

  constructor(parameters?: {
    readonly $identifier?: (BlankNode | NamedNode) | string;
    readonly optionalStringProperty?: Maybe<string> | string;
  }) {
    if (typeof parameters?.$identifier === "object") {
      this._$identifier = parameters?.$identifier;
    } else if (typeof parameters?.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters?.$identifier);
    } else if (parameters?.$identifier === undefined) {
    } else {
      this._$identifier = parameters?.$identifier satisfies never;
    }
    if (Maybe.isMaybe(parameters?.optionalStringProperty)) {
      this.optionalStringProperty = parameters?.optionalStringProperty;
    } else if (typeof parameters?.optionalStringProperty === "string") {
      this.optionalStringProperty = Maybe.of(
        parameters?.optionalStringProperty,
      );
    } else if (parameters?.optionalStringProperty === undefined) {
      this.optionalStringProperty = Maybe.empty();
    } else {
      this.optionalStringProperty =
        parameters?.optionalStringProperty satisfies never;
    }
  }

  get $identifier(): UnionMember2.$Identifier {
    if (this._$identifier === undefined) {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(this.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/UnionMember2"),
        options?.graph,
      );
    }
    resource.add(
      UnionMember2.$schema.properties.optionalStringProperty.identifier,
      this.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    return resource;
  }
}

export namespace UnionMember2 {
  export function $filter(
    filter: UnionMember2.$Filter,
    value: UnionMember2,
  ): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      typeof filter.optionalStringProperty !== "undefined" &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.optionalStringProperty,
        value.optionalStringProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
  };

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/UnionMember2",
  );

  export const $GraphQL = new GraphQLObjectType<
    UnionMember2,
    { objectSet: $ObjectSet }
  >({
    description: "UnionMember1",
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) =>
          UnionMember2.$Identifier.toString(source.$identifier),
        type: new GraphQLNonNull(GraphQLString),
      },
      optionalStringProperty: {
        args: undefined,
        description: '"Optional string property"',
        name: "optionalStringProperty",
        resolve: (source, _args) =>
          source.optionalStringProperty.extractNullable(),
        type: new GraphQLNonNull(GraphQLString),
      },
    }),
    name: "UnionMember2",
  });

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isUnionMember2(object: $Object): object is UnionMember2 {
    switch (object.$type) {
      case "UnionMember2":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, UnionMember2> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return UnionMember2.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new UnionMember2(properties));
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      optionalStringProperty: Maybe<string>;
    }
  > {
    return (
      !$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://example.com/UnionMember2":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(UnionMember2.$fromRdfType)
              ) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/UnionMember2)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
    ).chain((_rdfTypeCheck) =>
      Either.of<Error, UnionMember2.$Identifier>(
        $parameters.resource.identifier as UnionMember2.$Identifier,
      ).chain(($identifier) =>
        Either.of<Error, Resource.Values<Resource.TermValue>>(
          $parameters.resource.values(
            $schema.properties.optionalStringProperty.identifier,
            { unique: true },
          ),
        )
          .chain((values) =>
            $fromRdfPreferredLanguages({
              focusResource: $parameters.resource,
              predicate:
                UnionMember2.$schema.properties.optionalStringProperty
                  .identifier,
              preferredLanguages: $parameters.preferredLanguages,
              values,
            }),
          )
          .chain((values) => values.chainMap((value) => value.toString()))
          .map((values) =>
            values.length > 0
              ? values.map((value) => Maybe.of(value))
              : Resource.Values.fromValue<Maybe<string>>({
                  focusResource: $parameters.resource,
                  predicate:
                    UnionMember2.$schema.properties.optionalStringProperty
                      .identifier,
                  value: Maybe.empty(),
                }),
          )
          .chain((values) => values.head())
          .map((optionalStringProperty) => ({
            $identifier,
            optionalStringProperty,
          })),
      ),
    );
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "TypeDiscriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["UnionMember2"],
        }),
      },
      optionalStringProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
      },
    },
  } as const;
} /**
 * UnionMember1
 */

export class UnionMember1 {
  private _$identifier?: UnionMember1.$Identifier;

  readonly $type: "UnionMember1" = "UnionMember1" as const;

  /**
   * Optional number property
   */
  readonly optionalNumberProperty: Maybe<number>;

  constructor(parameters?: {
    readonly $identifier?: (BlankNode | NamedNode) | string;
    readonly optionalNumberProperty?: Maybe<number> | number;
  }) {
    if (typeof parameters?.$identifier === "object") {
      this._$identifier = parameters?.$identifier;
    } else if (typeof parameters?.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters?.$identifier);
    } else if (parameters?.$identifier === undefined) {
    } else {
      this._$identifier = parameters?.$identifier satisfies never;
    }
    if (Maybe.isMaybe(parameters?.optionalNumberProperty)) {
      this.optionalNumberProperty = parameters?.optionalNumberProperty;
    } else if (typeof parameters?.optionalNumberProperty === "number") {
      this.optionalNumberProperty = Maybe.of(
        parameters?.optionalNumberProperty,
      );
    } else if (parameters?.optionalNumberProperty === undefined) {
      this.optionalNumberProperty = Maybe.empty();
    } else {
      this.optionalNumberProperty =
        parameters?.optionalNumberProperty satisfies never;
    }
  }

  get $identifier(): UnionMember1.$Identifier {
    if (this._$identifier === undefined) {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(this.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/UnionMember1"),
        options?.graph,
      );
    }
    resource.add(
      UnionMember1.$schema.properties.optionalNumberProperty.identifier,
      this.optionalNumberProperty
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      options?.graph,
    );
    return resource;
  }
}

export namespace UnionMember1 {
  export function $filter(
    filter: UnionMember1.$Filter,
    value: UnionMember1,
  ): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      typeof filter.optionalNumberProperty !== "undefined" &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.optionalNumberProperty,
        value.optionalNumberProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalNumberProperty?: $MaybeFilter<$NumericFilter<number>>;
  };

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/UnionMember1",
  );

  export const $GraphQL = new GraphQLObjectType<
    UnionMember1,
    { objectSet: $ObjectSet }
  >({
    description: "UnionMember1",
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) =>
          UnionMember1.$Identifier.toString(source.$identifier),
        type: new GraphQLNonNull(GraphQLString),
      },
      optionalNumberProperty: {
        args: undefined,
        description: '"Optional number property"',
        name: "optionalNumberProperty",
        resolve: (source, _args) =>
          source.optionalNumberProperty.extractNullable(),
        type: new GraphQLNonNull(GraphQLFloat),
      },
    }),
    name: "UnionMember1",
  });

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isUnionMember1(object: $Object): object is UnionMember1 {
    switch (object.$type) {
      case "UnionMember1":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, UnionMember1> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return UnionMember1.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new UnionMember1(properties));
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      optionalNumberProperty: Maybe<number>;
    }
  > {
    return (
      !$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://example.com/UnionMember1":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(UnionMember1.$fromRdfType)
              ) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/UnionMember1)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
    ).chain((_rdfTypeCheck) =>
      Either.of<Error, UnionMember1.$Identifier>(
        $parameters.resource.identifier as UnionMember1.$Identifier,
      ).chain(($identifier) =>
        Either.of<Error, Resource.Values<Resource.TermValue>>(
          $parameters.resource.values(
            $schema.properties.optionalNumberProperty.identifier,
            { unique: true },
          ),
        )
          .chain((values) => values.chainMap((value) => value.toNumber()))
          .map((values) =>
            values.length > 0
              ? values.map((value) => Maybe.of(value))
              : Resource.Values.fromValue<Maybe<number>>({
                  focusResource: $parameters.resource,
                  predicate:
                    UnionMember1.$schema.properties.optionalNumberProperty
                      .identifier,
                  value: Maybe.empty(),
                }),
          )
          .chain((values) => values.head())
          .map((optionalNumberProperty) => ({
            $identifier,
            optionalNumberProperty,
          })),
      ),
    );
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "TypeDiscriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["UnionMember1"],
        }),
      },
      optionalNumberProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Float" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/optionalNumberProperty",
        ),
      },
    },
  } as const;
} /**
 * Nested
 */

export class Nested {
  private _$identifier?: Nested.$Identifier;

  readonly $type: "Nested" = "Nested" as const;

  /**
   * Optional number property
   */
  readonly optionalNumberProperty: Maybe<number>;

  /**
   * Optional string property
   */
  readonly optionalStringProperty: Maybe<string>;

  /**
   * Required string property
   */
  readonly requiredStringProperty: string;

  constructor(parameters: {
    readonly $identifier?: (BlankNode | NamedNode) | string;
    readonly optionalNumberProperty?: Maybe<number> | number;
    readonly optionalStringProperty?: Maybe<string> | string;
    readonly requiredStringProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (parameters.$identifier === undefined) {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }
    if (Maybe.isMaybe(parameters.optionalNumberProperty)) {
      this.optionalNumberProperty = parameters.optionalNumberProperty;
    } else if (typeof parameters.optionalNumberProperty === "number") {
      this.optionalNumberProperty = Maybe.of(parameters.optionalNumberProperty);
    } else if (parameters.optionalNumberProperty === undefined) {
      this.optionalNumberProperty = Maybe.empty();
    } else {
      this.optionalNumberProperty =
        parameters.optionalNumberProperty satisfies never;
    }
    if (Maybe.isMaybe(parameters.optionalStringProperty)) {
      this.optionalStringProperty = parameters.optionalStringProperty;
    } else if (typeof parameters.optionalStringProperty === "string") {
      this.optionalStringProperty = Maybe.of(parameters.optionalStringProperty);
    } else if (parameters.optionalStringProperty === undefined) {
      this.optionalStringProperty = Maybe.empty();
    } else {
      this.optionalStringProperty =
        parameters.optionalStringProperty satisfies never;
    }
    this.requiredStringProperty = parameters.requiredStringProperty;
  }

  get $identifier(): Nested.$Identifier {
    if (this._$identifier === undefined) {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(this.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/Nested"),
        options?.graph,
      );
    }
    resource.add(
      UnionMember1.$schema.properties.optionalNumberProperty.identifier,
      this.optionalNumberProperty
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      options?.graph,
    );
    resource.add(
      UnionMember2.$schema.properties.optionalStringProperty.identifier,
      this.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      Nested.$schema.properties.requiredStringProperty.identifier,
      [$literalFactory.string(this.requiredStringProperty)],
      options?.graph,
    );
    return resource;
  }
}

export namespace Nested {
  export function $filter(filter: Nested.$Filter, value: Nested): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      typeof filter.optionalNumberProperty !== "undefined" &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.optionalNumberProperty,
        value.optionalNumberProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.optionalStringProperty !== "undefined" &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.optionalStringProperty,
        value.optionalStringProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.requiredStringProperty !== "undefined" &&
      !$filterString(
        filter.requiredStringProperty,
        value.requiredStringProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalNumberProperty?: $MaybeFilter<$NumericFilter<number>>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredStringProperty?: $StringFilter;
  };

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/Nested",
  );

  export const $GraphQL = new GraphQLObjectType<
    Nested,
    { objectSet: $ObjectSet }
  >({
    description: "Nested",
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) => Nested.$Identifier.toString(source.$identifier),
        type: new GraphQLNonNull(GraphQLString),
      },
      optionalNumberProperty: {
        args: undefined,
        description: '"Optional number property"',
        name: "optionalNumberProperty",
        resolve: (source, _args) =>
          source.optionalNumberProperty.extractNullable(),
        type: new GraphQLNonNull(GraphQLFloat),
      },
      optionalStringProperty: {
        args: undefined,
        description: '"Optional string property"',
        name: "optionalStringProperty",
        resolve: (source, _args) =>
          source.optionalStringProperty.extractNullable(),
        type: new GraphQLNonNull(GraphQLString),
      },
      requiredStringProperty: {
        args: undefined,
        description: '"Required string property"',
        name: "requiredStringProperty",
        resolve: (source, _args) => source.requiredStringProperty,
        type: new GraphQLNonNull(GraphQLString),
      },
    }),
    name: "Nested",
  });

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isNested(object: $Object): object is Nested {
    switch (object.$type) {
      case "Nested":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, Nested> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return Nested.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new Nested(properties));
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      optionalNumberProperty: Maybe<number>;
      optionalStringProperty: Maybe<string>;
      requiredStringProperty: string;
    }
  > {
    return (
      !$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://example.com/Nested":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if ($parameters.resource.isInstanceOf(Nested.$fromRdfType)) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/Nested)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
    ).chain((_rdfTypeCheck) =>
      Either.of<Error, Nested.$Identifier>(
        $parameters.resource.identifier as Nested.$Identifier,
      ).chain(($identifier) =>
        Either.of<Error, Resource.Values<Resource.TermValue>>(
          $parameters.resource.values(
            $schema.properties.optionalNumberProperty.identifier,
            { unique: true },
          ),
        )
          .chain((values) => values.chainMap((value) => value.toNumber()))
          .map((values) =>
            values.length > 0
              ? values.map((value) => Maybe.of(value))
              : Resource.Values.fromValue<Maybe<number>>({
                  focusResource: $parameters.resource,
                  predicate:
                    UnionMember1.$schema.properties.optionalNumberProperty
                      .identifier,
                  value: Maybe.empty(),
                }),
          )
          .chain((values) => values.head())
          .chain((optionalNumberProperty) =>
            Either.of<Error, Resource.Values<Resource.TermValue>>(
              $parameters.resource.values(
                $schema.properties.optionalStringProperty.identifier,
                { unique: true },
              ),
            )
              .chain((values) =>
                $fromRdfPreferredLanguages({
                  focusResource: $parameters.resource,
                  predicate:
                    UnionMember2.$schema.properties.optionalStringProperty
                      .identifier,
                  preferredLanguages: $parameters.preferredLanguages,
                  values,
                }),
              )
              .chain((values) => values.chainMap((value) => value.toString()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<string>>({
                      focusResource: $parameters.resource,
                      predicate:
                        UnionMember2.$schema.properties.optionalStringProperty
                          .identifier,
                      value: Maybe.empty(),
                    }),
              )
              .chain((values) => values.head())
              .chain((optionalStringProperty) =>
                Either.of<Error, Resource.Values<Resource.TermValue>>(
                  $parameters.resource.values(
                    $schema.properties.requiredStringProperty.identifier,
                    { unique: true },
                  ),
                )
                  .chain((values) =>
                    $fromRdfPreferredLanguages({
                      focusResource: $parameters.resource,
                      predicate:
                        Nested.$schema.properties.requiredStringProperty
                          .identifier,
                      preferredLanguages: $parameters.preferredLanguages,
                      values,
                    }),
                  )
                  .chain((values) =>
                    values.chainMap((value) => value.toString()),
                  )
                  .chain((values) => values.head())
                  .map((requiredStringProperty) => ({
                    $identifier,
                    optionalNumberProperty,
                    optionalStringProperty,
                    requiredStringProperty,
                  })),
              ),
          ),
      ),
    );
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "TypeDiscriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["Nested"],
        }),
      },
      optionalNumberProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Float" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/optionalNumberProperty",
        ),
      },
      optionalStringProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
      },
      requiredStringProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "String" as const }),
        identifier: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
      },
    },
  } as const;
} /**
 * Parent
 */

export class Parent {
  readonly $identifier: ParentStatic.$Identifier;

  readonly $type: "Parent" | "Child" = "Parent" as const;

  /**
   * Parent string property
   */
  readonly parentStringProperty: Maybe<string>;

  constructor(parameters: {
    readonly $identifier: NamedNode | string;
    readonly parentStringProperty?: Maybe<string> | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this.$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this.$identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      this.$identifier = parameters.$identifier satisfies never;
    }
    if (Maybe.isMaybe(parameters.parentStringProperty)) {
      this.parentStringProperty = parameters.parentStringProperty;
    } else if (typeof parameters.parentStringProperty === "string") {
      this.parentStringProperty = Maybe.of(parameters.parentStringProperty);
    } else if (parameters.parentStringProperty === undefined) {
      this.parentStringProperty = Maybe.empty();
    } else {
      this.parentStringProperty =
        parameters.parentStringProperty satisfies never;
    }
  }

  $toRdf(options?: {
    ignoreRdfType?: boolean;
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource<NamedNode> {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(this.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/Parent"),
        options?.graph,
      );
    }
    resource.add(
      ParentStatic.$schema.properties.parentStringProperty.identifier,
      this.parentStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    return resource;
  }
}

export namespace ParentStatic {
  export function $filter(
    filter: ParentStatic.$Filter,
    value: Parent,
  ): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterNamedNode(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      typeof filter.parentStringProperty !== "undefined" &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.parentStringProperty,
        value.parentStringProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $NamedNodeFilter;
    readonly parentStringProperty?: $MaybeFilter<$StringFilter>;
  };

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/Parent",
  );

  export const $GraphQL = new GraphQLObjectType<
    Parent,
    { objectSet: $ObjectSet }
  >({
    description: "Parent",
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) =>
          ParentStatic.$Identifier.toString(source.$identifier),
        type: new GraphQLNonNull(GraphQLString),
      },
      parentStringProperty: {
        args: undefined,
        description: '"Parent string property"',
        name: "parentStringProperty",
        resolve: (source, _args) =>
          source.parentStringProperty.extractNullable(),
        type: new GraphQLNonNull(GraphQLString),
      },
    }),
    name: "Parent",
  });

  export type $Identifier = NamedNode;

  export namespace $Identifier {
    export function fromString(identifier: string): Either<Error, NamedNode> {
      return Either.encase(() =>
        Resource.Identifier.fromString({ dataFactory, identifier }),
      ).chain((identifier) =>
        identifier.termType === "NamedNode"
          ? Either.of(identifier)
          : Left(new Error("expected identifier to be NamedNode")),
      ) as Either<Error, NamedNode>;
    } // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isParent(object: $Object): object is Parent {
    switch (object.$type) {
      case "Child":
      case "Parent":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, Parent> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return ParentStatic.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new Parent(properties));
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    { $identifier: NamedNode; parentStringProperty: Maybe<string> }
  > {
    return (
      !$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://example.com/Parent":
                case "http://example.com/Child":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(ParentStatic.$fromRdfType)
              ) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/Parent)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
    ).chain((_rdfTypeCheck) =>
      ($parameters.resource.identifier.termType === "NamedNode"
        ? Either.of<Error, ParentStatic.$Identifier>(
            $parameters.resource.identifier,
          )
        : Left(
            new Resource.MistypedTermValueError({
              actualValue: $parameters.resource.identifier,
              expectedValueType: "NamedNode",
              focusResource: $parameters.resource,
              predicate: $RdfVocabularies.rdf.subject,
            }),
          )
      ).chain(($identifier) =>
        Either.of<Error, Resource.Values<Resource.TermValue>>(
          $parameters.resource.values(
            $schema.properties.parentStringProperty.identifier,
            { unique: true },
          ),
        )
          .chain((values) =>
            $fromRdfPreferredLanguages({
              focusResource: $parameters.resource,
              predicate:
                ParentStatic.$schema.properties.parentStringProperty.identifier,
              preferredLanguages: $parameters.preferredLanguages,
              values,
            }),
          )
          .chain((values) => values.chainMap((value) => value.toString()))
          .map((values) =>
            values.length > 0
              ? values.map((value) => Maybe.of(value))
              : Resource.Values.fromValue<Maybe<string>>({
                  focusResource: $parameters.resource,
                  predicate:
                    ParentStatic.$schema.properties.parentStringProperty
                      .identifier,
                  value: Maybe.empty(),
                }),
          )
          .chain((values) => values.head())
          .map((parentStringProperty) => ({
            $identifier,
            parentStringProperty,
          })),
      ),
    );
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "NamedNode" as const }),
      },
      $type: {
        kind: "TypeDiscriminant" as const,
        type: () => ({
          descendantValues: ["Child"],
          kind: "TypeDiscriminant" as const,
          ownValues: ["Parent"],
        }),
      },
      parentStringProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/parentStringProperty",
        ),
      },
    },
  } as const;
} /**
 * Child
 */

export class Child extends Parent {
  override readonly $type: "Child" = "Child" as const;

  /**
   * Child string property
   */
  readonly childStringProperty: Maybe<string>;

  /**
   * Lazy object set property
   */
  readonly lazyObjectSetProperty: $LazyObjectSet<
    Nested.$Identifier,
    $DefaultPartial,
    Nested
  >;

  /**
   * Optional lazy object property
   */
  readonly optionalLazyObjectProperty: $LazyObjectOption<
    Nested.$Identifier,
    $DefaultPartial,
    Nested
  >;

  /**
   * Optional object property
   */
  readonly optionalObjectProperty: Maybe<Nested>;

  /**
   * Optional string property
   */
  readonly optionalStringProperty: Maybe<string>;

  /**
   * Required string property
   */
  readonly requiredStringProperty: string;

  constructor(
    parameters: {
      readonly $identifier: NamedNode | string;
      readonly childStringProperty?: Maybe<string> | string;
      readonly lazyObjectSetProperty?:
        | $LazyObjectSet<Nested.$Identifier, $DefaultPartial, Nested>
        | readonly Nested[];
      readonly optionalLazyObjectProperty?:
        | $LazyObjectOption<Nested.$Identifier, $DefaultPartial, Nested>
        | Maybe<Nested>
        | Nested;
      readonly optionalObjectProperty?: Maybe<Nested> | Nested;
      readonly optionalStringProperty?: Maybe<string> | string;
      readonly requiredStringProperty: string;
    } & ConstructorParameters<typeof Parent>[0],
  ) {
    super(parameters);
    if (Maybe.isMaybe(parameters.childStringProperty)) {
      this.childStringProperty = parameters.childStringProperty;
    } else if (typeof parameters.childStringProperty === "string") {
      this.childStringProperty = Maybe.of(parameters.childStringProperty);
    } else if (parameters.childStringProperty === undefined) {
      this.childStringProperty = Maybe.empty();
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
        $DefaultPartial,
        Nested
      >({
        partials: parameters.lazyObjectSetProperty.map(
          (object) => new $DefaultPartial(object),
        ),
        resolver: async () =>
          Either.of(parameters.lazyObjectSetProperty as readonly Nested[]),
      });
    } else if (parameters.lazyObjectSetProperty === undefined) {
      this.lazyObjectSetProperty = new $LazyObjectSet<
        Nested.$Identifier,
        $DefaultPartial,
        Nested
      >({
        partials: [],
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
      parameters.optionalLazyObjectProperty instanceof $LazyObjectOption
    ) {
      this.optionalLazyObjectProperty = parameters.optionalLazyObjectProperty;
    } else if (Maybe.isMaybe(parameters.optionalLazyObjectProperty)) {
      this.optionalLazyObjectProperty = new $LazyObjectOption<
        Nested.$Identifier,
        $DefaultPartial,
        Nested
      >({
        partial: parameters.optionalLazyObjectProperty.map(
          (object) => new $DefaultPartial(object),
        ),
        resolver: async () =>
          Either.of(
            (
              parameters.optionalLazyObjectProperty as Maybe<Nested>
            ).unsafeCoerce(),
          ),
      });
    } else if (typeof parameters.optionalLazyObjectProperty === "object") {
      this.optionalLazyObjectProperty = new $LazyObjectOption<
        Nested.$Identifier,
        $DefaultPartial,
        Nested
      >({
        partial: Maybe.of(
          new $DefaultPartial(parameters.optionalLazyObjectProperty),
        ),
        resolver: async () =>
          Either.of(parameters.optionalLazyObjectProperty as Nested),
      });
    } else if (parameters.optionalLazyObjectProperty === undefined) {
      this.optionalLazyObjectProperty = new $LazyObjectOption<
        Nested.$Identifier,
        $DefaultPartial,
        Nested
      >({
        partial: Maybe.empty(),
        resolver: async () => {
          throw new Error("should never be called");
        },
      });
    } else {
      this.optionalLazyObjectProperty =
        parameters.optionalLazyObjectProperty satisfies never;
    }
    if (Maybe.isMaybe(parameters.optionalObjectProperty)) {
      this.optionalObjectProperty = parameters.optionalObjectProperty;
    } else if (
      typeof parameters.optionalObjectProperty === "object" &&
      parameters.optionalObjectProperty instanceof Nested
    ) {
      this.optionalObjectProperty = Maybe.of(parameters.optionalObjectProperty);
    } else if (parameters.optionalObjectProperty === undefined) {
      this.optionalObjectProperty = Maybe.empty();
    } else {
      this.optionalObjectProperty =
        parameters.optionalObjectProperty satisfies never;
    }
    if (Maybe.isMaybe(parameters.optionalStringProperty)) {
      this.optionalStringProperty = parameters.optionalStringProperty;
    } else if (typeof parameters.optionalStringProperty === "string") {
      this.optionalStringProperty = Maybe.of(parameters.optionalStringProperty);
    } else if (parameters.optionalStringProperty === undefined) {
      this.optionalStringProperty = Maybe.empty();
    } else {
      this.optionalStringProperty =
        parameters.optionalStringProperty satisfies never;
    }
    this.requiredStringProperty = parameters.requiredStringProperty;
  }

  override $toRdf(options?: {
    ignoreRdfType?: boolean;
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource<NamedNode> {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = super.$toRdf({
      ignoreRdfType: true,
      graph: options?.graph,
      resourceSet,
    });
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/Child"),
        options?.graph,
      );
    }
    resource.add(
      Child.$schema.properties.childStringProperty.identifier,
      this.childStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      Child.$schema.properties.lazyObjectSetProperty.identifier,
      this.lazyObjectSetProperty.partials.flatMap((item) => [
        item.$toRdf({ graph: options?.graph, resourceSet: resourceSet })
          .identifier,
      ]),
      options?.graph,
    );
    resource.add(
      Child.$schema.properties.optionalLazyObjectProperty.identifier,
      this.optionalLazyObjectProperty.partial
        .toList()
        .flatMap((value) => [
          value.$toRdf({ graph: options?.graph, resourceSet: resourceSet })
            .identifier,
        ]),
      options?.graph,
    );
    resource.add(
      Child.$schema.properties.optionalObjectProperty.identifier,
      this.optionalObjectProperty
        .toList()
        .flatMap((value) => [
          value.$toRdf({ graph: options?.graph, resourceSet: resourceSet })
            .identifier,
        ]),
      options?.graph,
    );
    resource.add(
      UnionMember2.$schema.properties.optionalStringProperty.identifier,
      this.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      Nested.$schema.properties.requiredStringProperty.identifier,
      [$literalFactory.string(this.requiredStringProperty)],
      options?.graph,
    );
    return resource;
  }
}

export namespace Child {
  export function $filter(filter: Child.$Filter, value: Child): boolean {
    if (!ParentStatic.$filter(filter, value)) {
      return false;
    }
    if (
      typeof filter.childStringProperty !== "undefined" &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.childStringProperty,
        value.childStringProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.lazyObjectSetProperty !== "undefined" &&
      !((
        filter: $CollectionFilter<$DefaultPartial.$Filter>,
        value: $LazyObjectSet<Nested.$Identifier, $DefaultPartial, Nested>,
      ) =>
        $filterArray<$DefaultPartial, $DefaultPartial.$Filter>(
          $DefaultPartial.$filter,
        )(filter, value.partials))(
        filter.lazyObjectSetProperty,
        value.lazyObjectSetProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.optionalLazyObjectProperty !== "undefined" &&
      !((
        filter: $MaybeFilter<$DefaultPartial.$Filter>,
        value: $LazyObjectOption<Nested.$Identifier, $DefaultPartial, Nested>,
      ) =>
        $filterMaybe<$DefaultPartial, $DefaultPartial.$Filter>(
          $DefaultPartial.$filter,
        )(filter, value.partial))(
        filter.optionalLazyObjectProperty,
        value.optionalLazyObjectProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.optionalObjectProperty !== "undefined" &&
      !$filterMaybe<Nested, Nested.$Filter>(Nested.$filter)(
        filter.optionalObjectProperty,
        value.optionalObjectProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.optionalStringProperty !== "undefined" &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.optionalStringProperty,
        value.optionalStringProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.requiredStringProperty !== "undefined" &&
      !$filterString(
        filter.requiredStringProperty,
        value.requiredStringProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $NamedNodeFilter;
    readonly childStringProperty?: $MaybeFilter<$StringFilter>;
    readonly lazyObjectSetProperty?: $CollectionFilter<$DefaultPartial.$Filter>;
    readonly optionalLazyObjectProperty?: $MaybeFilter<$DefaultPartial.$Filter>;
    readonly optionalObjectProperty?: $MaybeFilter<Nested.$Filter>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredStringProperty?: $StringFilter;
  } & ParentStatic.$Filter;

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/Child",
  );

  export const $GraphQL = new GraphQLObjectType<
    Child,
    { objectSet: $ObjectSet }
  >({
    description: "Child",
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) => Child.$Identifier.toString(source.$identifier),
        type: new GraphQLNonNull(GraphQLString),
      },
      childStringProperty: {
        args: undefined,
        description: '"Child string property"',
        name: "childStringProperty",
        resolve: (source, _args) =>
          source.childStringProperty.extractNullable(),
        type: new GraphQLNonNull(GraphQLString),
      },
      lazyObjectSetProperty: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
        description: '"Lazy object set property"',
        name: "lazyObjectSetProperty",
        resolve: (source, args) =>
          source.lazyObjectSetProperty
            .resolve({ limit: args.limit, offset: args.offset })
            .then((either) => either.unsafeCoerce()),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(Nested.$GraphQL)),
        ),
      },
      optionalLazyObjectProperty: {
        args: undefined,
        description: '"Optional lazy object property"',
        name: "optionalLazyObjectProperty",
        resolve: (source, _args) =>
          source.optionalLazyObjectProperty
            .resolve()
            .then((either) => either.unsafeCoerce().extractNullable()),
        type: new GraphQLNonNull(Nested.$GraphQL),
      },
      optionalObjectProperty: {
        args: undefined,
        description: '"Optional object property"',
        name: "optionalObjectProperty",
        resolve: (source, _args) =>
          source.optionalObjectProperty.extractNullable(),
        type: new GraphQLNonNull(Nested.$GraphQL),
      },
      optionalStringProperty: {
        args: undefined,
        description: '"Optional string property"',
        name: "optionalStringProperty",
        resolve: (source, _args) =>
          source.optionalStringProperty.extractNullable(),
        type: new GraphQLNonNull(GraphQLString),
      },
      requiredStringProperty: {
        args: undefined,
        description: '"Required string property"',
        name: "requiredStringProperty",
        resolve: (source, _args) => source.requiredStringProperty,
        type: new GraphQLNonNull(GraphQLString),
      },
    }),
    name: "Child",
  });

  export type $Identifier = NamedNode;

  export namespace $Identifier {
    export function fromString(identifier: string): Either<Error, NamedNode> {
      return Either.encase(() =>
        Resource.Identifier.fromString({ dataFactory, identifier }),
      ).chain((identifier) =>
        identifier.termType === "NamedNode"
          ? Either.of(identifier)
          : Left(new Error("expected identifier to be NamedNode")),
      ) as Either<Error, NamedNode>;
    } // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isChild(object: $Object): object is Child {
    switch (object.$type) {
      case "Child":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, Child> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return Child.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    }).map((properties) => new Child(properties));
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: NamedNode;
      childStringProperty: Maybe<string>;
      lazyObjectSetProperty: $LazyObjectSet<
        Nested.$Identifier,
        $DefaultPartial,
        Nested
      >;
      optionalLazyObjectProperty: $LazyObjectOption<
        Nested.$Identifier,
        $DefaultPartial,
        Nested
      >;
      optionalObjectProperty: Maybe<Nested>;
      optionalStringProperty: Maybe<string>;
      requiredStringProperty: string;
    } & $UnwrapR<ReturnType<typeof ParentStatic.$propertiesFromRdf>>
  > {
    return ParentStatic.$propertiesFromRdf({
      ...$parameters,
      ignoreRdfType: true,
    }).chain(($super0) =>
      (!$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://example.com/Child":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if ($parameters.resource.isInstanceOf(Child.$fromRdfType)) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/Child)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
      ).chain((_rdfTypeCheck) =>
        ($parameters.resource.identifier.termType === "NamedNode"
          ? Either.of<Error, Child.$Identifier>($parameters.resource.identifier)
          : Left(
              new Resource.MistypedTermValueError({
                actualValue: $parameters.resource.identifier,
                expectedValueType: "NamedNode",
                focusResource: $parameters.resource,
                predicate: $RdfVocabularies.rdf.subject,
              }),
            )
        ).chain(($identifier) =>
          Either.of<Error, Resource.Values<Resource.TermValue>>(
            $parameters.resource.values(
              $schema.properties.childStringProperty.identifier,
              { unique: true },
            ),
          )
            .chain((values) =>
              $fromRdfPreferredLanguages({
                focusResource: $parameters.resource,
                predicate:
                  Child.$schema.properties.childStringProperty.identifier,
                preferredLanguages: $parameters.preferredLanguages,
                values,
              }),
            )
            .chain((values) => values.chainMap((value) => value.toString()))
            .map((values) =>
              values.length > 0
                ? values.map((value) => Maybe.of(value))
                : Resource.Values.fromValue<Maybe<string>>({
                    focusResource: $parameters.resource,
                    predicate:
                      Child.$schema.properties.childStringProperty.identifier,
                    value: Maybe.empty(),
                  }),
            )
            .chain((values) => values.head())
            .chain((childStringProperty) =>
              Either.of<Error, Resource.Values<Resource.TermValue>>(
                $parameters.resource.values(
                  $schema.properties.lazyObjectSetProperty.identifier,
                  { unique: true },
                ),
              )
                .chain((values) =>
                  values.chainMap((value) =>
                    value.toResource().chain((resource) =>
                      $DefaultPartial.$fromRdf(resource, {
                        context: $parameters.context,
                        ignoreRdfType: true,
                        objectSet: $parameters.objectSet,
                        preferredLanguages: $parameters.preferredLanguages,
                      }),
                    ),
                  ),
                )
                .map((values) => values.toArray())
                .map((valuesArray) =>
                  Resource.Values.fromValue({
                    focusResource: $parameters.resource,
                    predicate:
                      Child.$schema.properties.lazyObjectSetProperty.identifier,
                    value: valuesArray,
                  }),
                )
                .map((values) =>
                  values.map(
                    (partials) =>
                      new $LazyObjectSet<
                        Nested.$Identifier,
                        $DefaultPartial,
                        Nested
                      >({
                        partials,
                        resolver: (identifiers) =>
                          $parameters.objectSet.nesteds({ identifiers }),
                      }),
                  ),
                )
                .chain((values) => values.head())
                .chain((lazyObjectSetProperty) =>
                  Either.of<Error, Resource.Values<Resource.TermValue>>(
                    $parameters.resource.values(
                      $schema.properties.optionalLazyObjectProperty.identifier,
                      {
                        unique: true,
                      },
                    ),
                  )
                    .chain((values) =>
                      values.chainMap((value) =>
                        value.toResource().chain((resource) =>
                          $DefaultPartial.$fromRdf(resource, {
                            context: $parameters.context,
                            ignoreRdfType: true,
                            objectSet: $parameters.objectSet,
                            preferredLanguages: $parameters.preferredLanguages,
                          }),
                        ),
                      ),
                    )
                    .map((values) =>
                      values.length > 0
                        ? values.map((value) => Maybe.of(value))
                        : Resource.Values.fromValue<Maybe<$DefaultPartial>>({
                            focusResource: $parameters.resource,
                            predicate:
                              Child.$schema.properties
                                .optionalLazyObjectProperty.identifier,
                            value: Maybe.empty(),
                          }),
                    )
                    .map((values) =>
                      values.map(
                        (partial) =>
                          new $LazyObjectOption<
                            Nested.$Identifier,
                            $DefaultPartial,
                            Nested
                          >({
                            partial,
                            resolver: (identifier) =>
                              $parameters.objectSet.nested(identifier),
                          }),
                      ),
                    )
                    .chain((values) => values.head())
                    .chain((optionalLazyObjectProperty) =>
                      Either.of<Error, Resource.Values<Resource.TermValue>>(
                        $parameters.resource.values(
                          $schema.properties.optionalObjectProperty.identifier,
                          {
                            unique: true,
                          },
                        ),
                      )
                        .chain((values) =>
                          values.chainMap((value) =>
                            value.toResource().chain((resource) =>
                              Nested.$fromRdf(resource, {
                                context: $parameters.context,
                                ignoreRdfType: true,
                                objectSet: $parameters.objectSet,
                                preferredLanguages:
                                  $parameters.preferredLanguages,
                              }),
                            ),
                          ),
                        )
                        .map((values) =>
                          values.length > 0
                            ? values.map((value) => Maybe.of(value))
                            : Resource.Values.fromValue<Maybe<Nested>>({
                                focusResource: $parameters.resource,
                                predicate:
                                  Child.$schema.properties
                                    .optionalObjectProperty.identifier,
                                value: Maybe.empty(),
                              }),
                        )
                        .chain((values) => values.head())
                        .chain((optionalObjectProperty) =>
                          Either.of<Error, Resource.Values<Resource.TermValue>>(
                            $parameters.resource.values(
                              $schema.properties.optionalStringProperty
                                .identifier,
                              {
                                unique: true,
                              },
                            ),
                          )
                            .chain((values) =>
                              $fromRdfPreferredLanguages({
                                focusResource: $parameters.resource,
                                predicate:
                                  UnionMember2.$schema.properties
                                    .optionalStringProperty.identifier,
                                preferredLanguages:
                                  $parameters.preferredLanguages,
                                values,
                              }),
                            )
                            .chain((values) =>
                              values.chainMap((value) => value.toString()),
                            )
                            .map((values) =>
                              values.length > 0
                                ? values.map((value) => Maybe.of(value))
                                : Resource.Values.fromValue<Maybe<string>>({
                                    focusResource: $parameters.resource,
                                    predicate:
                                      UnionMember2.$schema.properties
                                        .optionalStringProperty.identifier,
                                    value: Maybe.empty(),
                                  }),
                            )
                            .chain((values) => values.head())
                            .chain((optionalStringProperty) =>
                              Either.of<
                                Error,
                                Resource.Values<Resource.TermValue>
                              >(
                                $parameters.resource.values(
                                  $schema.properties.requiredStringProperty
                                    .identifier,
                                  {
                                    unique: true,
                                  },
                                ),
                              )
                                .chain((values) =>
                                  $fromRdfPreferredLanguages({
                                    focusResource: $parameters.resource,
                                    predicate:
                                      Nested.$schema.properties
                                        .requiredStringProperty.identifier,
                                    preferredLanguages:
                                      $parameters.preferredLanguages,
                                    values,
                                  }),
                                )
                                .chain((values) =>
                                  values.chainMap((value) => value.toString()),
                                )
                                .chain((values) => values.head())
                                .map((requiredStringProperty) => ({
                                  ...$super0,
                                  $identifier,
                                  childStringProperty,
                                  lazyObjectSetProperty,
                                  optionalLazyObjectProperty,
                                  optionalObjectProperty,
                                  optionalStringProperty,
                                  requiredStringProperty,
                                })),
                            ),
                        ),
                    ),
                ),
            ),
        ),
      ),
    );
  }

  export const $schema = {
    properties: {
      ...ParentStatic.$schema.properties,
      childStringProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/childStringProperty",
        ),
      },
      lazyObjectSetProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "LazyObjectSet" as const,
          partial: () => ({
            kind: "Set" as const,
            item: () => $DefaultPartial.$schema,
          }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/lazyObjectSetProperty",
        ),
      },
      optionalLazyObjectProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "LazyObjectOption" as const,
          partial: () => ({
            kind: "Maybe" as const,
            item: () => $DefaultPartial.$schema,
          }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/optionalLazyObjectProperty",
        ),
      },
      optionalObjectProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "Maybe" as const, item: () => Nested.$schema }),
        identifier: dataFactory.namedNode(
          "http://example.com/optionalObjectProperty",
        ),
      },
      optionalStringProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
      },
      requiredStringProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "String" as const }),
        identifier: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
      },
    },
  } as const;
} /**
 * Union
 */

export type Union = UnionMember1 | UnionMember2;

export namespace Union {
  export function $filter(filter: Union.$Filter, value: Union): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      UnionMember1.isUnionMember1(value) &&
      filter.on?.UnionMember1 &&
      !UnionMember1.$filter(filter.on.UnionMember1, value as UnionMember1)
    ) {
      return false;
    }
    if (
      UnionMember2.isUnionMember2(value) &&
      filter.on?.UnionMember2 &&
      !UnionMember2.$filter(filter.on.UnionMember2, value as UnionMember2)
    ) {
      return false;
    }
    return true;
  }

  export interface $Filter {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly UnionMember1?: Omit<UnionMember1.$Filter, "$identifier">;
      readonly UnionMember2?: Omit<UnionMember2.$Filter, "$identifier">;
    };
  }

  export const $GraphQL = new GraphQLUnionType({
    description: '"Union"',
    name: "Union",
    resolveType: (value: Union) => value.$type,
    types: [UnionMember1.$GraphQL, UnionMember2.$GraphQL],
  });

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isUnion(object: $Object): object is Union {
    return (
      UnionMember1.isUnionMember1(object) || UnionMember2.isUnionMember2(object)
    );
  }

  export const $schema = { properties: {} } as const;

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, Union> {
    return (
      UnionMember1.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, Union>
    ).altLazy(
      () =>
        UnionMember2.$fromRdf(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, Union>,
    );
  }

  export function $toRdf(
    _union: Union,
    _parameters?: {
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    if (UnionMember1.isUnionMember1(_union)) {
      return _union.$toRdf(_parameters);
    }
    if (UnionMember2.isUnionMember2(_union)) {
      return _union.$toRdf(_parameters);
    }
    throw new Error("unrecognized type");
  }
}
export type $Object =
  | Child
  | Parent
  | Nested
  | UnionMember1
  | UnionMember2
  | $DefaultPartial;

export namespace $Object {
  export function $filter(filter: $Object.$Filter, value: $Object): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      Child.isChild(value) &&
      filter.on?.Child &&
      !Child.$filter(filter.on.Child, value as Child)
    ) {
      return false;
    }
    if (
      ParentStatic.isParent(value) &&
      filter.on?.Parent &&
      !ParentStatic.$filter(filter.on.Parent, value as Parent)
    ) {
      return false;
    }
    if (
      Nested.isNested(value) &&
      filter.on?.Nested &&
      !Nested.$filter(filter.on.Nested, value as Nested)
    ) {
      return false;
    }
    if (
      UnionMember1.isUnionMember1(value) &&
      filter.on?.UnionMember1 &&
      !UnionMember1.$filter(filter.on.UnionMember1, value as UnionMember1)
    ) {
      return false;
    }
    if (
      UnionMember2.isUnionMember2(value) &&
      filter.on?.UnionMember2 &&
      !UnionMember2.$filter(filter.on.UnionMember2, value as UnionMember2)
    ) {
      return false;
    }
    if (
      $DefaultPartial.is$DefaultPartial(value) &&
      filter.on?.$DefaultPartial &&
      !$DefaultPartial.$filter(
        filter.on.$DefaultPartial,
        value as $DefaultPartial,
      )
    ) {
      return false;
    }
    return true;
  }

  export interface $Filter {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly Child?: Omit<Child.$Filter, "$identifier">;
      readonly Parent?: Omit<ParentStatic.$Filter, "$identifier">;
      readonly Nested?: Omit<Nested.$Filter, "$identifier">;
      readonly UnionMember1?: Omit<UnionMember1.$Filter, "$identifier">;
      readonly UnionMember2?: Omit<UnionMember2.$Filter, "$identifier">;
      readonly $DefaultPartial?: Omit<$DefaultPartial.$Filter, "$identifier">;
    };
  }

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export const $schema = { properties: {} } as const;

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, $Object> {
    return (
      Child.$fromRdf(resource, { ...options, ignoreRdfType: false }) as Either<
        Error,
        $Object
      >
    )
      .altLazy(
        () =>
          ParentStatic.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          Nested.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          UnionMember1.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          UnionMember2.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          $DefaultPartial.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      );
  }

  export function $toRdf(
    _object: $Object,
    _parameters?: {
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    if (Child.isChild(_object)) {
      return _object.$toRdf(_parameters);
    }
    if (ParentStatic.isParent(_object)) {
      return _object.$toRdf(_parameters);
    }
    if (Nested.isNested(_object)) {
      return _object.$toRdf(_parameters);
    }
    if (UnionMember1.isUnionMember1(_object)) {
      return _object.$toRdf(_parameters);
    }
    if (UnionMember2.isUnionMember2(_object)) {
      return _object.$toRdf(_parameters);
    }
    if ($DefaultPartial.is$DefaultPartial(_object)) {
      return _object.$toRdf(_parameters);
    }
    throw new Error("unrecognized type");
  }
}
export interface $ObjectSet {
  child(identifier: Child.$Identifier): Promise<Either<Error, Child>>;

  childIdentifiers(
    query?: $ObjectSet.Query<Child.$Filter, Child.$Identifier>,
  ): Promise<Either<Error, readonly Child.$Identifier[]>>;

  children(
    query?: $ObjectSet.Query<Child.$Filter, Child.$Identifier>,
  ): Promise<Either<Error, readonly Child[]>>;

  childrenCount(
    query?: Pick<$ObjectSet.Query<Child.$Filter, Child.$Identifier>, "filter">,
  ): Promise<Either<Error, number>>;

  nested(identifier: Nested.$Identifier): Promise<Either<Error, Nested>>;

  nestedIdentifiers(
    query?: $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
  ): Promise<Either<Error, readonly Nested.$Identifier[]>>;

  nesteds(
    query?: $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
  ): Promise<Either<Error, readonly Nested[]>>;

  nestedsCount(
    query?: Pick<
      $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  parent(identifier: ParentStatic.$Identifier): Promise<Either<Error, Parent>>;

  parentIdentifiers(
    query?: $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
  ): Promise<Either<Error, readonly ParentStatic.$Identifier[]>>;

  parents(
    query?: $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
  ): Promise<Either<Error, readonly Parent[]>>;

  parentsCount(
    query?: Pick<
      $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  unionMember1(
    identifier: UnionMember1.$Identifier,
  ): Promise<Either<Error, UnionMember1>>;

  unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
  ): Promise<Either<Error, readonly UnionMember1.$Identifier[]>>;

  unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
  ): Promise<Either<Error, readonly UnionMember1[]>>;

  unionMember1sCount(
    query?: Pick<
      $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  unionMember2(
    identifier: UnionMember2.$Identifier,
  ): Promise<Either<Error, UnionMember2>>;

  unionMember2Identifiers(
    query?: $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
  ): Promise<Either<Error, readonly UnionMember2.$Identifier[]>>;

  unionMember2s(
    query?: $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
  ): Promise<Either<Error, readonly UnionMember2[]>>;

  unionMember2sCount(
    query?: Pick<
      $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  union(identifier: Union.$Identifier): Promise<Either<Error, Union>>;

  unionIdentifiers(
    query?: $ObjectSet.Query<Union.$Filter, Union.$Identifier>,
  ): Promise<Either<Error, readonly Union.$Identifier[]>>;

  unions(
    query?: $ObjectSet.Query<Union.$Filter, Union.$Identifier>,
  ): Promise<Either<Error, readonly Union[]>>;

  unionsCount(
    query?: Pick<$ObjectSet.Query<Union.$Filter, Union.$Identifier>, "filter">,
  ): Promise<Either<Error, number>>;

  object(identifier: $Object.$Identifier): Promise<Either<Error, $Object>>;

  objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object.$Identifier[]>>;

  objects(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object[]>>;

  objectsCount(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;
}

export namespace $ObjectSet {
  export interface Query<
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  > {
    readonly filter?: ObjectFilterT;
    readonly identifiers?: readonly ObjectIdentifierT[];
    readonly limit?: number;
    readonly offset?: number;
  }
}
export class $RdfjsDatasetObjectSet implements $ObjectSet {
  protected readonly resourceSet: ResourceSet;

  constructor(dataset: DatasetCore) {
    this.resourceSet = new ResourceSet(dataset, { dataFactory: dataFactory });
  }

  async child(identifier: Child.$Identifier): Promise<Either<Error, Child>> {
    return this.childSync(identifier);
  }

  childSync(identifier: Child.$Identifier): Either<Error, Child> {
    return this.childrenSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async childIdentifiers(
    query?: $ObjectSet.Query<Child.$Filter, Child.$Identifier>,
  ): Promise<Either<Error, readonly Child.$Identifier[]>> {
    return this.childIdentifiersSync(query);
  }

  childIdentifiersSync(
    query?: $ObjectSet.Query<Child.$Filter, Child.$Identifier>,
  ): Either<Error, readonly Child.$Identifier[]> {
    return this.childrenSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async children(
    query?: $ObjectSet.Query<Child.$Filter, Child.$Identifier>,
  ): Promise<Either<Error, readonly Child[]>> {
    return this.childrenSync(query);
  }

  async childrenCount(
    query?: Pick<$ObjectSet.Query<Child.$Filter, Child.$Identifier>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.childrenCountSync(query);
  }

  childrenCountSync(
    query?: Pick<$ObjectSet.Query<Child.$Filter, Child.$Identifier>, "filter">,
  ): Either<Error, number> {
    return this.childrenSync(query).map((objects) => objects.length);
  }

  childrenSync(
    query?: $ObjectSet.Query<Child.$Filter, Child.$Identifier>,
  ): Either<Error, readonly Child[]> {
    return this.$objectsSync<Child, Child.$Filter, Child.$Identifier>(
      {
        $filter: Child.$filter,
        $fromRdf: Child.$fromRdf,
        $fromRdfTypes: [Child.$fromRdfType],
      },
      query,
    );
  }

  async nested(identifier: Nested.$Identifier): Promise<Either<Error, Nested>> {
    return this.nestedSync(identifier);
  }

  nestedSync(identifier: Nested.$Identifier): Either<Error, Nested> {
    return this.nestedsSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async nestedIdentifiers(
    query?: $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
  ): Promise<Either<Error, readonly Nested.$Identifier[]>> {
    return this.nestedIdentifiersSync(query);
  }

  nestedIdentifiersSync(
    query?: $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
  ): Either<Error, readonly Nested.$Identifier[]> {
    return this.nestedsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async nesteds(
    query?: $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
  ): Promise<Either<Error, readonly Nested[]>> {
    return this.nestedsSync(query);
  }

  async nestedsCount(
    query?: Pick<
      $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.nestedsCountSync(query);
  }

  nestedsCountSync(
    query?: Pick<
      $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.nestedsSync(query).map((objects) => objects.length);
  }

  nestedsSync(
    query?: $ObjectSet.Query<Nested.$Filter, Nested.$Identifier>,
  ): Either<Error, readonly Nested[]> {
    return this.$objectsSync<Nested, Nested.$Filter, Nested.$Identifier>(
      {
        $filter: Nested.$filter,
        $fromRdf: Nested.$fromRdf,
        $fromRdfTypes: [Nested.$fromRdfType],
      },
      query,
    );
  }

  async parent(
    identifier: ParentStatic.$Identifier,
  ): Promise<Either<Error, Parent>> {
    return this.parentSync(identifier);
  }

  parentSync(identifier: ParentStatic.$Identifier): Either<Error, Parent> {
    return this.parentsSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async parentIdentifiers(
    query?: $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
  ): Promise<Either<Error, readonly ParentStatic.$Identifier[]>> {
    return this.parentIdentifiersSync(query);
  }

  parentIdentifiersSync(
    query?: $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
  ): Either<Error, readonly ParentStatic.$Identifier[]> {
    return this.parentsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async parents(
    query?: $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
  ): Promise<Either<Error, readonly Parent[]>> {
    return this.parentsSync(query);
  }

  async parentsCount(
    query?: Pick<
      $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.parentsCountSync(query);
  }

  parentsCountSync(
    query?: Pick<
      $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.parentsSync(query).map((objects) => objects.length);
  }

  parentsSync(
    query?: $ObjectSet.Query<ParentStatic.$Filter, ParentStatic.$Identifier>,
  ): Either<Error, readonly Parent[]> {
    return this.$objectsSync<
      Parent,
      ParentStatic.$Filter,
      ParentStatic.$Identifier
    >(
      {
        $filter: ParentStatic.$filter,
        $fromRdf: ParentStatic.$fromRdf,
        $fromRdfTypes: [ParentStatic.$fromRdfType, Child.$fromRdfType],
      },
      query,
    );
  }

  async unionMember1(
    identifier: UnionMember1.$Identifier,
  ): Promise<Either<Error, UnionMember1>> {
    return this.unionMember1Sync(identifier);
  }

  unionMember1Sync(
    identifier: UnionMember1.$Identifier,
  ): Either<Error, UnionMember1> {
    return this.unionMember1sSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
  ): Promise<Either<Error, readonly UnionMember1.$Identifier[]>> {
    return this.unionMember1IdentifiersSync(query);
  }

  unionMember1IdentifiersSync(
    query?: $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
  ): Either<Error, readonly UnionMember1.$Identifier[]> {
    return this.unionMember1sSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
  ): Promise<Either<Error, readonly UnionMember1[]>> {
    return this.unionMember1sSync(query);
  }

  async unionMember1sCount(
    query?: Pick<
      $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.unionMember1sCountSync(query);
  }

  unionMember1sCountSync(
    query?: Pick<
      $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.unionMember1sSync(query).map((objects) => objects.length);
  }

  unionMember1sSync(
    query?: $ObjectSet.Query<UnionMember1.$Filter, UnionMember1.$Identifier>,
  ): Either<Error, readonly UnionMember1[]> {
    return this.$objectsSync<
      UnionMember1,
      UnionMember1.$Filter,
      UnionMember1.$Identifier
    >(
      {
        $filter: UnionMember1.$filter,
        $fromRdf: UnionMember1.$fromRdf,
        $fromRdfTypes: [UnionMember1.$fromRdfType],
      },
      query,
    );
  }

  async unionMember2(
    identifier: UnionMember2.$Identifier,
  ): Promise<Either<Error, UnionMember2>> {
    return this.unionMember2Sync(identifier);
  }

  unionMember2Sync(
    identifier: UnionMember2.$Identifier,
  ): Either<Error, UnionMember2> {
    return this.unionMember2sSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async unionMember2Identifiers(
    query?: $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
  ): Promise<Either<Error, readonly UnionMember2.$Identifier[]>> {
    return this.unionMember2IdentifiersSync(query);
  }

  unionMember2IdentifiersSync(
    query?: $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
  ): Either<Error, readonly UnionMember2.$Identifier[]> {
    return this.unionMember2sSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async unionMember2s(
    query?: $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
  ): Promise<Either<Error, readonly UnionMember2[]>> {
    return this.unionMember2sSync(query);
  }

  async unionMember2sCount(
    query?: Pick<
      $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.unionMember2sCountSync(query);
  }

  unionMember2sCountSync(
    query?: Pick<
      $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.unionMember2sSync(query).map((objects) => objects.length);
  }

  unionMember2sSync(
    query?: $ObjectSet.Query<UnionMember2.$Filter, UnionMember2.$Identifier>,
  ): Either<Error, readonly UnionMember2[]> {
    return this.$objectsSync<
      UnionMember2,
      UnionMember2.$Filter,
      UnionMember2.$Identifier
    >(
      {
        $filter: UnionMember2.$filter,
        $fromRdf: UnionMember2.$fromRdf,
        $fromRdfTypes: [UnionMember2.$fromRdfType],
      },
      query,
    );
  }

  async union(identifier: Union.$Identifier): Promise<Either<Error, Union>> {
    return this.unionSync(identifier);
  }

  unionSync(identifier: Union.$Identifier): Either<Error, Union> {
    return this.unionsSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async unionIdentifiers(
    query?: $ObjectSet.Query<Union.$Filter, Union.$Identifier>,
  ): Promise<Either<Error, readonly Union.$Identifier[]>> {
    return this.unionIdentifiersSync(query);
  }

  unionIdentifiersSync(
    query?: $ObjectSet.Query<Union.$Filter, Union.$Identifier>,
  ): Either<Error, readonly Union.$Identifier[]> {
    return this.unionsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async unions(
    query?: $ObjectSet.Query<Union.$Filter, Union.$Identifier>,
  ): Promise<Either<Error, readonly Union[]>> {
    return this.unionsSync(query);
  }

  async unionsCount(
    query?: Pick<$ObjectSet.Query<Union.$Filter, Union.$Identifier>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.unionsCountSync(query);
  }

  unionsCountSync(
    query?: Pick<$ObjectSet.Query<Union.$Filter, Union.$Identifier>, "filter">,
  ): Either<Error, number> {
    return this.unionsSync(query).map((objects) => objects.length);
  }

  unionsSync(
    query?: $ObjectSet.Query<Union.$Filter, Union.$Identifier>,
  ): Either<Error, readonly Union[]> {
    return this.$objectUnionsSync<Union, Union.$Filter, Union.$Identifier>(
      [
        {
          $filter: Union.$filter,
          $fromRdf: UnionMember1.$fromRdf,
          $fromRdfTypes: [UnionMember1.$fromRdfType],
        },
        {
          $filter: Union.$filter,
          $fromRdf: UnionMember2.$fromRdf,
          $fromRdfTypes: [UnionMember2.$fromRdfType],
        },
      ],
      query,
    );
  }

  async object(
    identifier: $Object.$Identifier,
  ): Promise<Either<Error, $Object>> {
    return this.objectSync(identifier);
  }

  objectSync(identifier: $Object.$Identifier): Either<Error, $Object> {
    return this.objectsSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object.$Identifier[]>> {
    return this.objectIdentifiersSync(query);
  }

  objectIdentifiersSync(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Either<Error, readonly $Object.$Identifier[]> {
    return this.objectsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async objects(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object[]>> {
    return this.objectsSync(query);
  }

  async objectsCount(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.objectsCountSync(query);
  }

  objectsCountSync(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.objectsSync(query).map((objects) => objects.length);
  }

  objectsSync(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Either<Error, readonly $Object[]> {
    return this.$objectUnionsSync<
      $Object,
      $Object.$Filter,
      $Object.$Identifier
    >(
      [
        {
          $filter: $Object.$filter,
          $fromRdf: Child.$fromRdf,
          $fromRdfTypes: [Child.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ParentStatic.$fromRdf,
          $fromRdfTypes: [ParentStatic.$fromRdfType, Child.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: Nested.$fromRdf,
          $fromRdfTypes: [Nested.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: UnionMember1.$fromRdf,
          $fromRdfTypes: [UnionMember1.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: UnionMember2.$fromRdf,
          $fromRdfTypes: [UnionMember2.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: $DefaultPartial.$fromRdf,
          $fromRdfTypes: [],
        },
      ],
      query,
    );
  }

  protected $objectsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  >(
    objectType: {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdf: (
        resource: Resource,
        options: { objectSet: $ObjectSet },
      ) => Either<Error, ObjectT>;
      $fromRdfTypes: readonly NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    let resources: { object?: ObjectT; resource: Resource }[];
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: this.resourceSet.resource(identifier),
      }));
      sortResources = false;
    } else if (objectType.$fromRdfTypes.length > 0) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const fromRdfType of objectType.$fromRdfTypes) {
        for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
          if (!identifierSet.has(resource.identifier)) {
            identifierSet.add(resource.identifier);
            resources.push({ resource });
          }
        }
      }
    } else {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const quad of this.resourceSet.dataset) {
        switch (quad.subject.termType) {
          case "BlankNode":
          case "NamedNode":
            break;
          default:
            continue;
        }

        if (identifierSet.has(quad.subject)) {
          continue;
        }
        identifierSet.add(quad.subject);
        const resource = this.resourceSet.resource(quad.subject);
        // Eagerly eliminate the majority of resources that won't match the object type
        objectType.$fromRdf(resource, { objectSet: this }).ifRight((object) => {
          resources.push({ object, resource });
        });
      }
    }

    if (sortResources) {
      // Sort resources by identifier so limit and offset are deterministic
      resources.sort((left, right) =>
        left.resource.identifier.value.localeCompare(
          right.resource.identifier.value,
        ),
      );
    }

    let objectI = 0;
    const objects: ObjectT[] = [];
    for (let { object, resource } of resources) {
      if (!object) {
        const objectEither = objectType.$fromRdf(resource, { objectSet: this });
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }

      if (query?.filter && !objectType.$filter(query.filter, object)) {
        continue;
      }

      if (objectI++ >= offset) {
        objects.push(object);
        if (objects.length === limit) {
          return Either.of(objects);
        }
      }
    }
    return Either.of(objects);
  }

  protected $objectUnionsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  >(
    objectTypes: readonly {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdf: (
        resource: Resource,
        options: { objectSet: $ObjectSet },
      ) => Either<Error, ObjectT>;
      $fromRdfTypes: readonly NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    let resources: {
      object?: ObjectT;
      objectType?: {
        $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
        $fromRdf: (
          resource: Resource,
          options: { objectSet: $ObjectSet },
        ) => Either<Error, ObjectT>;
        $fromRdfTypes: readonly NamedNode[];
      };
      resource: Resource;
    }[];
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: this.resourceSet.resource(identifier),
      }));
      sortResources = false;
    } else if (
      objectTypes.every((objectType) => objectType.$fromRdfTypes.length > 0)
    ) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const objectType of objectTypes) {
        for (const fromRdfType of objectType.$fromRdfTypes) {
          for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
            if (!identifierSet.has(resource.identifier)) {
              identifierSet.add(resource.identifier);
              resources.push({ objectType, resource });
            }
          }
        }
      }
    } else {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const quad of this.resourceSet.dataset) {
        switch (quad.subject.termType) {
          case "BlankNode":
          case "NamedNode":
            break;
          default:
            continue;
        }

        if (identifierSet.has(quad.subject)) {
          continue;
        }
        identifierSet.add(quad.subject);
        // Eagerly eliminate the majority of resources that won't match the object types
        const resource = this.resourceSet.resource(quad.subject);
        for (const objectType of objectTypes) {
          if (
            objectType
              .$fromRdf(resource, { objectSet: this })
              .ifRight((object) => {
                resources.push({ object, objectType, resource });
              })
              .isRight()
          ) {
            break;
          }
        }
      }
    }

    if (sortResources) {
      // Sort resources by identifier so limit and offset are deterministic
      resources.sort((left, right) =>
        left.resource.identifier.value.localeCompare(
          right.resource.identifier.value,
        ),
      );
    }

    let objectI = 0;
    const objects: ObjectT[] = [];
    for (let { object, objectType, resource } of resources) {
      if (!object) {
        let objectEither: Either<Error, ObjectT>;
        if (objectType) {
          objectEither = objectType.$fromRdf(resource, { objectSet: this });
        } else {
          objectEither = Left(new Error("no object types"));
          for (const tryObjectType of objectTypes) {
            objectEither = tryObjectType.$fromRdf(resource, {
              objectSet: this,
            });
            if (objectEither.isRight()) {
              objectType = tryObjectType;
              break;
            }
          }
        }
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }
      if (!objectType) {
        throw new Error("objectType should be set here");
      }

      if (query?.filter && !objectType.$filter(query.filter, object)) {
        continue;
      }

      if (objectI++ >= offset) {
        objects.push(object);
        if (objects.length === limit) {
          return Either.of(objects);
        }
      }
    }
    return Either.of(objects);
  }
}
export const graphqlSchema = new GraphQLSchema({
  query: new GraphQLObjectType<null, { objectSet: $ObjectSet }>({
    name: "Query",
    fields: {
      child: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<Child> =>
          (
            await EitherAsync<Error, Child>(async ({ liftEither }) =>
              liftEither(
                await objectSet.child(
                  await liftEither(
                    Child.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(Child.$GraphQL),
      },
      childIdentifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
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
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      children: {
        args: {
          identifiers: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt },
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
            await EitherAsync<Error, readonly Child[]>(
              async ({ liftEither }) => {
                let filter: Child.$Filter | undefined;
                if (args.identifiers) {
                  const identifiers: Child.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        Child.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.children({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(Child.$GraphQL)),
        ),
      },
      childrenCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.childrenCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
      nested: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<Nested> =>
          (
            await EitherAsync<Error, Nested>(async ({ liftEither }) =>
              liftEither(
                await objectSet.nested(
                  await liftEither(
                    Nested.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(Nested.$GraphQL),
      },
      nestedIdentifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
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
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      nesteds: {
        args: {
          identifiers: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt },
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
            await EitherAsync<Error, readonly Nested[]>(
              async ({ liftEither }) => {
                let filter: Nested.$Filter | undefined;
                if (args.identifiers) {
                  const identifiers: Nested.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        Nested.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.nesteds({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(Nested.$GraphQL)),
        ),
      },
      nestedsCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.nestedsCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
      parent: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<Parent> =>
          (
            await EitherAsync<Error, Parent>(async ({ liftEither }) =>
              liftEither(
                await objectSet.parent(
                  await liftEither(
                    ParentStatic.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(ParentStatic.$GraphQL),
      },
      parentIdentifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
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
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      parents: {
        args: {
          identifiers: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt },
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
            await EitherAsync<Error, readonly Parent[]>(
              async ({ liftEither }) => {
                let filter: ParentStatic.$Filter | undefined;
                if (args.identifiers) {
                  const identifiers: ParentStatic.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        ParentStatic.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.parents({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(ParentStatic.$GraphQL)),
        ),
      },
      parentsCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.parentsCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
      unionMember1: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<UnionMember1> =>
          (
            await EitherAsync<Error, UnionMember1>(async ({ liftEither }) =>
              liftEither(
                await objectSet.unionMember1(
                  await liftEither(
                    UnionMember1.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(UnionMember1.$GraphQL),
      },
      unionMember1Identifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
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
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      unionMember1s: {
        args: {
          identifiers: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt },
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
            await EitherAsync<Error, readonly UnionMember1[]>(
              async ({ liftEither }) => {
                let filter: UnionMember1.$Filter | undefined;
                if (args.identifiers) {
                  const identifiers: UnionMember1.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        UnionMember1.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.unionMember1s({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(UnionMember1.$GraphQL)),
        ),
      },
      unionMember1sCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionMember1sCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
      unionMember2: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<UnionMember2> =>
          (
            await EitherAsync<Error, UnionMember2>(async ({ liftEither }) =>
              liftEither(
                await objectSet.unionMember2(
                  await liftEither(
                    UnionMember2.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(UnionMember2.$GraphQL),
      },
      unionMember2Identifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
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
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      unionMember2s: {
        args: {
          identifiers: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt },
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
            await EitherAsync<Error, readonly UnionMember2[]>(
              async ({ liftEither }) => {
                let filter: UnionMember2.$Filter | undefined;
                if (args.identifiers) {
                  const identifiers: UnionMember2.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        UnionMember2.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.unionMember2s({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(UnionMember2.$GraphQL)),
        ),
      },
      unionMember2sCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionMember2sCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
      union: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<Union> =>
          (
            await EitherAsync<Error, Union>(async ({ liftEither }) =>
              liftEither(
                await objectSet.union(
                  await liftEither(
                    Union.$Identifier.fromString(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(Union.$GraphQL),
      },
      unionIdentifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
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
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      unions: {
        args: {
          identifiers: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
          limit: { type: GraphQLInt },
          offset: { type: GraphQLInt },
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
            await EitherAsync<Error, readonly Union[]>(
              async ({ liftEither }) => {
                let filter: Union.$Filter | undefined;
                if (args.identifiers) {
                  const identifiers: Union.$Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        Union.$Identifier.fromString(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.unions({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(Union.$GraphQL)),
        ),
      },
      unionsCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionsCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
    },
  }),
});

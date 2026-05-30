import datasetFactory from "@rdfjs/dataset";
import type {
  BlankNode,
  DatasetCore,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import {
  PropertyPath as RdfxResourcePropertyPath,
  Resource,
  ResourceSet,
} from "@rdfx/resource";
import { NTriplesIdentifier, NTriplesTerm } from "@rdfx/string";
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
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

type $_FromRdfResourceFunction<T> = (
  resource: Resource,
  options: {
    context: undefined | unknown;
    graph: Exclude<Quad_Graph, Variable> | undefined;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages: readonly string[] | undefined;
  },
) => Either<Error, T>;

export type $_ToRdfResourceFunction<
  IdentifierT extends Resource.Identifier,
  ObjectT extends { $identifier: () => IdentifierT },
> = (parameters: {
  graph: Exclude<Quad_Graph, Variable> | undefined;
  ignoreRdfType: boolean;
  object: ObjectT;
  resource: Resource<IdentifierT>;
  resourceSet: ResourceSet;
}) => void;

type $CollectionFilter<ItemFilterT> = ItemFilterT & {
  readonly $maxCount?: number;
  readonly $minCount?: number;
};

/**
 * Remove undefined values from a record.
 */
function $compactRecord<KeyT extends string, ValueT extends {}>(
  record: Record<KeyT, ValueT | undefined>,
): Record<KeyT, ValueT> {
  return globalThis.Object.entries(record).reduce(
    (definedProperties, [propertyName, propertyValue]) => {
      if (propertyValue !== undefined) {
        definedProperties[propertyName as KeyT] = propertyValue as ValueT;
      }
      return definedProperties;
    },
    {} as Record<KeyT, ValueT>,
  );
}

type $ConversionFunction<SourceT, TargetT> = (
  source: SourceT,
) => Either<Error, TargetT>;

function $convertToIdentifierProperty(
  identifier:
    | (() => BlankNode | NamedNode)
    | BlankNode
    | NamedNode
    | string
    | undefined,
): Either<Error, () => BlankNode | NamedNode> {
  switch (typeof identifier) {
    case "function":
      return Either.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return Either.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = dataFactory.namedNode(identifier);
      return Either.of(() => captureIdentifier);
    }
    case "undefined": {
      const captureIdentifier = dataFactory.blankNode();
      return Either.of(() => captureIdentifier);
    }
  }
}

function $convertToIriIdentifierProperty<IriT extends string = string>(
  identifier: (() => NamedNode<IriT>) | NamedNode<IriT> | IriT,
): Either<Error, () => NamedNode<IriT>> {
  switch (typeof identifier) {
    case "function":
      return Either.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return Either.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = dataFactory.namedNode<IriT>(identifier);
      return Either.of(() => captureIdentifier);
    }
  }
}

function $convertToLazyObjectOption<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: () => ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: () => ObjectIdentifierT },
>(resolvedToPartial: (resolved: ResolvedObjectT) => PartialObjectT) {
  return (
    value:
      | $LazyObjectOption<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>
      | Maybe<ResolvedObjectT>
      | ResolvedObjectT
      | undefined,
  ): Either<
    Error,
    $LazyObjectOption<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>
  > => {
    switch (typeof value) {
      case "object": {
        if (value instanceof $LazyObjectOption) {
          return Either.of(value);
        }

        if (Maybe.isMaybe(value)) {
          return Either.of(
            new $LazyObjectOption<
              ObjectIdentifierT,
              PartialObjectT,
              ResolvedObjectT
            >({
              partial: value.map(resolvedToPartial),
              resolver: async () => Right(value.unsafeCoerce()),
            }),
          );
        }

        return Either.of(
          new $LazyObjectOption<
            ObjectIdentifierT,
            PartialObjectT,
            ResolvedObjectT
          >({
            partial: Maybe.of(resolvedToPartial(value)),
            resolver: async () => Right(value),
          }),
        );
      }
      case "undefined":
        return Either.of(
          new $LazyObjectOption<
            ObjectIdentifierT,
            PartialObjectT,
            ResolvedObjectT
          >({
            partial: Maybe.empty(),
            resolver: async () => {
              throw new Error("should never be called");
            },
          }),
        );
    }
  };
}

function $convertToLazyObjectSet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: () => ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: () => ObjectIdentifierT },
>(resolvedToPartial: (resolved: ResolvedObjectT) => PartialObjectT) {
  return (
    value:
      | $LazyObjectSet<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>
      | readonly ResolvedObjectT[]
      | undefined,
  ): Either<
    Error,
    $LazyObjectSet<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>
  > => {
    switch (typeof value) {
      case "object": {
        if (value instanceof $LazyObjectSet) {
          return Either.of(value);
        }

        const captureValue = value;
        return Either.of(
          new $LazyObjectSet<
            ObjectIdentifierT,
            PartialObjectT,
            ResolvedObjectT
          >({
            partials: value.map(resolvedToPartial),
            resolver: async () => Right(captureValue),
          }),
        );
      }
      case "undefined":
        return Either.of(
          new $LazyObjectSet<
            ObjectIdentifierT,
            PartialObjectT,
            ResolvedObjectT
          >({
            partials: [],
            resolver: async () => Right([]),
          }),
        );
    }
  };
}

function $convertToMaybe<ItemSourceT, ItemTargetT>(
  convertToItem: $ConversionFunction<ItemSourceT, ItemTargetT>,
) {
  return (
    value: ItemSourceT | Maybe<ItemTargetT> | undefined,
  ): Either<Error, Maybe<ItemTargetT>> => {
    switch (typeof value) {
      case "object": {
        if (Maybe.isMaybe(value)) {
          return Either.of(value as Maybe<ItemTargetT>);
        }
        break;
      }
      case "undefined":
        return Either.of(Maybe.empty());
    }

    return convertToItem(value).map(Maybe.of);
  };
}

function $ensureRdfResourceType(
  resource: Resource,
  types: readonly NamedNode[],
  options: { graph: Exclude<Quad_Graph, Variable> | undefined },
): Either<Error, undefined> {
  return resource
    .value($RdfVocabularies.rdf.type, options)
    .chain((actualRdfTypeValue) => actualRdfTypeValue.toIri())
    .chain((actualRdfType) => {
      // Check the expected type and its known subtypes
      for (const type of types) {
        if (resource.isInstanceOf(type, options)) {
          return Right(undefined);
        }
      }

      return Left(
        new Error(
          `${resource.identifier} has unexpected RDF type (actual: ${actualRdfType}, expected one of ${types})`,
        ),
      );
    });
}

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

    if (filter.$maxCount !== undefined && values.length > filter.$maxCount) {
      return false;
    }

    if (filter.$minCount !== undefined && values.length < filter.$minCount) {
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
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
    return false;
  }

  if (filter.type !== undefined && value.termType !== filter.type) {
    return false;
  }

  return true;
}

function $filterIri(filter: $IriFilter, value: NamedNode) {
  if (
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
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

function $filterNumeric<T extends bigint | number>(
  filter: $NumericFilter<T>,
  value: T,
) {
  if (
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue === value)
  ) {
    return false;
  }

  if (filter.maxExclusive !== undefined && value >= filter.maxExclusive) {
    return false;
  }

  if (filter.maxInclusive !== undefined && value > filter.maxInclusive) {
    return false;
  }

  if (filter.minExclusive !== undefined && value <= filter.minExclusive) {
    return false;
  }

  if (filter.minInclusive !== undefined && value < filter.minInclusive) {
    return false;
  }

  return true;
}

function $filterString(filter: $StringFilter, value: string) {
  if (
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue === value)
  ) {
    return false;
  }

  if (filter.maxLength !== undefined && value.length > filter.maxLength) {
    return false;
  }

  if (filter.minLength !== undefined && value.length < filter.minLength) {
    return false;
  }

  return true;
}

function $fromRdfPreferredLanguages(
  values: Resource.Values,
  preferredLanguages?: readonly string[],
): Either<Error, Resource.Values> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return Right(values);
  }

  // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
  // Within a preferredLanguage the literals may be in any order.
  const filteredValues: Resource.Value[] = [];
  for (const preferredLanguage of preferredLanguages) {
    for (const value of values) {
      value.toLiteral().ifRight((literal) => {
        if (literal.language === preferredLanguage) {
          filteredValues.push(value);
        }
      });
    }
  }

  return Right(
    Resource.Values.fromArray({
      focusResource: values.focusResource,
      propertyPath: values.propertyPath,
      values: filteredValues,
    }),
  );
}

export type $FromRdfResourceFunction<T> = (
  resource: Resource,
  options?: {
    context?: unknown;
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    objectSet?: $ObjectSet;
    preferredLanguages?: readonly string[];
  },
) => Either<Error, T>;

export type $FromRdfResourceValuesFunction<T> = (
  resourceValues: Either<Error, Resource.Values>,
  options: {
    context?: unknown;
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    objectSet?: $ObjectSet;
    preferredLanguages?: readonly string[];
    propertyPath: $PropertyPath;
    resource: Resource;
  },
) => Either<Error, Resource.Values<T>>;

interface $IdentifierFilter {
  readonly in?: readonly (BlankNode | NamedNode)[];
  readonly type?: "BlankNode" | "NamedNode";
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

function $identityConversionFunction<T>(value: T): Either<Error, T> {
  return Either.of(value);
}

function $identityValidationFunction<T>(
  _schema: unknown,
  value: T,
): Either<Error, T> {
  return Either.of(value);
}

interface $IriFilter {
  readonly in?: readonly NamedNode[];
}

/**
 * Type of lazy properties that return a single optional object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class $LazyObjectOption<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: () => ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: () => ObjectIdentifierT },
> {
  readonly partial: Maybe<PartialObjectT>;
  private readonly resolver: (
    identifier: ObjectIdentifierT,
    options?: { preferredLanguages?: readonly string[] },
  ) => Promise<Either<Error, ResolvedObjectT>>;

  constructor({
    partial,
    resolver,
  }: {
    partial: Maybe<PartialObjectT>;
    resolver: (
      identifier: ObjectIdentifierT,
      options?: { preferredLanguages?: readonly string[] },
    ) => Promise<Either<Error, ResolvedObjectT>>;
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  async resolve(options?: {
    preferredLanguages?: readonly string[];
  }): Promise<Either<Error, Maybe<ResolvedObjectT>>> {
    if (this.partial.isNothing()) {
      return Right(Maybe.empty());
    }
    return (
      await this.resolver(this.partial.unsafeCoerce().$identifier(), options)
    ).map(Maybe.of);
  }
}

/**
 * Type of lazy properties that return a set of objects. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class $LazyObjectSet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: () => ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: () => ObjectIdentifierT },
> {
  readonly partials: readonly PartialObjectT[];
  private readonly resolver: (
    identifiers: readonly ObjectIdentifierT[],
    options?: { preferredLanguages?: readonly string[] },
  ) => Promise<Either<Error, readonly ResolvedObjectT[]>>;

  constructor({
    partials,
    resolver,
  }: {
    partials: readonly PartialObjectT[];
    resolver: (
      identifiers: readonly ObjectIdentifierT[],
      options?: { preferredLanguages?: readonly string[] },
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
    preferredLanguages?: readonly string[];
  }): Promise<Either<Error, readonly ResolvedObjectT[]>> {
    if (this.partials.length === 0) {
      return Right([]);
    }

    const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Right([]);
    }

    let offset = options?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    return await this.resolver(
      this.partials
        .slice(offset, offset + limit)
        .map((partial) => partial.$identifier()),
      {
        preferredLanguages: options?.preferredLanguages,
      },
    );
  }
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

interface $MaybeSchema<ItemSchemaT> {
  readonly itemType: ItemSchemaT;
  readonly kind: "Option";
}

function $monkeyPatchObject<T extends object>(
  obj: T,
  methods: { toJson?: (obj: T) => object; $toString?: (obj: T) => string },
): T {
  if (
    methods.toJson &&
    (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toJSON") ||
      typeof (obj as any).toJSON === "function")
  ) {
    const toJsonMethod = methods.toJson;
    (obj as any).toJSON = function (this: T, _key: string) {
      return toJsonMethod(this);
    };
  }

  if (
    methods.$toString &&
    (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toString") ||
      typeof (obj as any).toJSON === "function")
  ) {
    const toStringMethod = methods.$toString;
    (obj as any).toString = function (this: T) {
      return toStringMethod(this);
    };
  }

  return obj;
}

interface $NumericFilter<T> {
  readonly in?: readonly T[];
  readonly maxExclusive?: T;
  readonly maxInclusive?: T;
  readonly minExclusive?: T;
  readonly minInclusive?: T;
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

export function $parseIri(identifier: string): Either<Error, NamedNode> {
  return $parseIdentifier(identifier).chain((identifier) =>
    identifier.termType === "NamedNode"
      ? Right(identifier)
      : Left(new Error("expected identifier to be NamedNode")),
  ) as Either<Error, NamedNode>;
}

export type $PropertyPath = RdfxResourcePropertyPath;

export namespace $PropertyPath {
  export type Filter = object;

  export function filter(_filter: Filter, _value: $PropertyPath): boolean {
    return true;
  }

  export const fromRdfResource: $FromRdfResourceFunction<$PropertyPath> =
    RdfxResourcePropertyPath.fromResource;

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    $PropertyPath
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => fromRdfResource(resource, options)),
      ),
    );

  export const schema: Readonly<object> = {};

  export const toRdfResource: $ToRdfResourceFunction<$PropertyPath> =
    RdfxResourcePropertyPath.toResource;

  export const $toString = RdfxResourcePropertyPath.toString;
}

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

function $sequenceRecord<T extends Record<string, unknown>>(
  record: { [K in keyof T]: Either<Error, T[K]> },
): Either<Error, T> {
  const result: { [K in keyof T]?: T[K] } = {};

  for (const key of globalThis.Object.keys(record) as Array<keyof T>) {
    const either = record[key];
    if (either.isLeft()) {
      return either as unknown as Either<Error, T>;
    }
    result[key] = either.extract() as T[typeof key];
  }

  return Right(result as T);
}

function $shaclPropertyFromRdf<T>({
  graph,
  propertySchema,
  resource,
  typeFromRdf,
}: {
  graph?: Exclude<Quad_Graph, Variable>;
  propertySchema: $ShaclPropertySchema;
  resource: Resource;
  typeFromRdf: (
    resourceValues: Either<Error, Resource.Values>,
  ) => Either<Error, Resource.Values<T>>;
}): Either<Error, T> {
  return typeFromRdf(
    Right(resource.values(propertySchema.path, { graph, unique: true })),
  ).chain((values) => values.head());
}

export interface $ShaclPropertySchema<TypeSchemaT = object> {
  readonly kind: "Shacl";
  readonly path: $PropertyPath;
  readonly type: TypeSchemaT;
}

interface $StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}

export type $ToRdfResourceFunction<
  ObjectT,
  IdentifierT extends Resource.Identifier = Resource.Identifier,
> = (
  object: ObjectT,
  options?: {
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    resourceSet?: ResourceSet;
  },
) => Resource<IdentifierT>;

export type $ToRdfResourceValuesFunction<
  ValueT,
  ReturnT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> = (
  value: ValueT,
  options: {
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    propertyPath: $PropertyPath;
    resource: Resource;
    resourceSet: ResourceSet;
  },
) => ReturnT[];

function $validateMaybe<ItemSchemaT, ItemValueT>(
  validateItem: $ValidationFunction<ItemSchemaT, ItemValueT>,
) {
  return (
    schema: $MaybeSchema<ItemSchemaT>,
    valueMaybe: Maybe<ItemValueT>,
  ): Either<Error, Maybe<ItemValueT>> =>
    valueMaybe
      .map((value) =>
        validateItem(schema.itemType, value).map(() => valueMaybe),
      )
      .orDefault(Either.of(valueMaybe));
}

type $ValidationFunction<SchemaT, ValueT> = (
  schema: SchemaT,
  value: ValueT,
) => Either<Error, ValueT>;

function $wrap_FromRdfResourceFunction<T>(
  _fromRdfResourceFunction: $_FromRdfResourceFunction<T>,
): $FromRdfResourceFunction<T> {
  return (resource, options) => {
    const {
      context,
      graph,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    return _fromRdfResourceFunction(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet: objectSet ?? new $RdfjsDatasetObjectSet(resource.dataset),
      preferredLanguages,
    });
  };
}

function $wrap_ToRdfResourceFunction<
  IdentifierT extends Resource.Identifier,
  ObjectT extends { $identifier: () => IdentifierT },
>(
  _toRdfResourceFunction: $_ToRdfResourceFunction<IdentifierT, ObjectT>,
): $ToRdfResourceFunction<ObjectT, IdentifierT> {
  return (object, options) => {
    let { graph, ignoreRdfType = false, resourceSet } = options ?? {};
    if (!resourceSet) {
      resourceSet = new ResourceSet({
        dataFactory: dataFactory,
        dataset: datasetFactory.dataset(),
      });
    }
    const resource = resourceSet.resource(object.$identifier());
    _toRdfResourceFunction({
      graph,
      ignoreRdfType,
      object,
      resource,
      resourceSet,
    });
    return resource;
  };
}
export interface $DefaultPartial {
  readonly $identifier: () => $DefaultPartial.Identifier;

  readonly $type: "DefaultPartial";
}

export namespace $DefaultPartial {
  export function create(parameters?: {
    readonly $identifier?:
      | (() => $DefaultPartial.Identifier)
      | BlankNode
      | NamedNode
      | string;
  }): Either<Error, $DefaultPartial> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
    })
      .map((properties) => ({
        ...properties,
        $type: "DefaultPartial" as const,
      }))
      .map((object) => $monkeyPatchObject(object, { $toString }));
  }

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => $DefaultPartial.Identifier)
      | BlankNode
      | NamedNode
      | string;
  }): $DefaultPartial {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(
    filter: $DefaultPartial.Filter,
    value: $DefaultPartial,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    return true;
  }

  export type Filter = { readonly $identifier?: $IdentifierFilter };

  export const _fromRdfResource: $_FromRdfResourceFunction<$DefaultPartial> = (
    $resource,
    _$options,
  ) => {
    return $sequenceRecord({
      $identifier: Right(
        new Resource.Value({
          dataFactory: dataFactory,
          focusResource: $resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          term: $resource.identifier,
        }).toValues(),
      )
        .chain((values) => values.chainMap((value) => value.toIdentifier()))
        .chain((values) => values.head()),
    }).chain((properties) => create(properties));
  };

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    $DefaultPartial
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) =>
            $DefaultPartial.fromRdfResource(resource, options),
          ),
      ),
    );

  export function is$DefaultPartial(
    object: $Object,
  ): object is $DefaultPartial {
    return object.$type === "DefaultPartial";
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    $DefaultPartial.Identifier,
    $DefaultPartial
  > = (parameters) => {
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _defaultPartial: $DefaultPartial,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _defaultPartial.$identifier().toString(),
    });
  }

  export function $toString(_defaultPartial: $DefaultPartial): string {
    return `$DefaultPartial(${JSON.stringify(_propertiesToStrings(_defaultPartial))})`;
  }
}
export interface NestedObject {
  readonly $identifier: () => NestedObject.Identifier;

  readonly $type: "NestedObject";

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
}

export namespace NestedObject {
  export function create(parameters: {
    readonly $identifier?:
      | (() => NestedObject.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalNumberProperty?: number | Maybe<number>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  }): Either<Error, NestedObject> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters.$identifier),
      optionalNumberProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalNumberProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NestedObject.schema.properties.optionalNumberProperty.type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NestedObject.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    })
      .map((properties) => ({ ...properties, $type: "NestedObject" as const }))
      .map((object) => $monkeyPatchObject(object, { $toString }));
  }

  export function createUnsafe(parameters: {
    readonly $identifier?:
      | (() => NestedObject.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalNumberProperty?: number | Maybe<number>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  }): NestedObject {
    return create(parameters).unsafeCoerce();
  }

  export const GraphQL = new GraphQLObjectType<
    NestedObject,
    { objectSet: $ObjectSet }
  >({
    description: undefined,
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) =>
          NestedObject.Identifier.stringify(source.$identifier()),
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
    name: "NestedObject",
  });

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(
    filter: NestedObject.Filter,
    value: NestedObject,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.optionalNumberProperty !== undefined &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.optionalNumberProperty,
        value.optionalNumberProperty,
      )
    ) {
      return false;
    }
    if (
      filter.optionalStringProperty !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.optionalStringProperty,
        value.optionalStringProperty,
      )
    ) {
      return false;
    }
    if (
      filter.requiredStringProperty !== undefined &&
      !$filterString(
        filter.requiredStringProperty,
        value.requiredStringProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalNumberProperty?: $MaybeFilter<$NumericFilter<number>>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredStringProperty?: $StringFilter;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<NestedObject> = (
    $resource,
    _$options,
  ) => {
    return (
      !_$options.ignoreRdfType
        ? $ensureRdfResourceType($resource, [NestedObject.fromRdfType], {
            graph: _$options.graph,
          })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      $sequenceRecord({
        $identifier: Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIdentifier()))
          .chain((values) => values.head()),
        optionalNumberProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.optionalNumberProperty,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toFloat()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<number>>({
                      focusResource: $resource,
                      propertyPath:
                        NestedObject.schema.properties.optionalNumberProperty
                          .path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        optionalStringProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.optionalStringProperty,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<string>>({
                      focusResource: $resource,
                      propertyPath:
                        NestedObject.schema.properties.optionalStringProperty
                          .path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        requiredStringProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.requiredStringProperty,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString())),
        }),
      }).chain((properties) => create(properties)),
    );
  };

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    NestedObject
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => NestedObject.fromRdfResource(resource, options)),
      ),
    );

  export const fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/NestedObject",
  );

  export function isNestedObject(object: $Object): object is NestedObject {
    return object.$type === "NestedObject";
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
      optionalNumberProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/optionalNumberProperty",
        ),
        type: { kind: "Option" as const, itemType: { kind: "Float" as const } },
      },
      optionalStringProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
        type: {
          kind: "Option" as const,
          itemType: { kind: "String" as const },
        },
      },
      requiredStringProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
        type: { kind: "String" as const },
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    NestedObject.Identifier,
    NestedObject
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/NestedObject"),
        parameters.graph,
      );
    }
    parameters.resource.add(
      NestedObject.schema.properties.optionalNumberProperty.path,
      parameters.object.optionalNumberProperty
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      NestedObject.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      NestedObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _nestedObject: NestedObject,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _nestedObject.$identifier().toString(),
    });
  }

  export function $toString(_nestedObject: NestedObject): string {
    return `NestedObject(${JSON.stringify(_propertiesToStrings(_nestedObject))})`;
  }
}
export interface RootObject {
  readonly $identifier: () => RootObject.Identifier;

  readonly $type: "RootObject";

  /**
   * Lazy object set property
   */
  readonly lazyObjectSetProperty: $LazyObjectSet<
    NestedObject.Identifier,
    $DefaultPartial,
    NestedObject
  >;

  /**
   * Optional lazy object property
   */
  readonly optionalLazyObjectProperty: $LazyObjectOption<
    NestedObject.Identifier,
    $DefaultPartial,
    NestedObject
  >;

  /**
   * Optional object property
   */
  readonly optionalObjectProperty: Maybe<NestedObject>;

  /**
   * Optional string property
   */
  readonly optionalStringProperty: Maybe<string>;

  /**
   * Required string property
   */
  readonly requiredStringProperty: string;
}

export namespace RootObject {
  export function create(parameters: {
    readonly $identifier: (() => RootObject.Identifier) | string | NamedNode;
    readonly lazyObjectSetProperty?:
      | $LazyObjectSet<NestedObject.Identifier, $DefaultPartial, NestedObject>
      | readonly NestedObject[];
    readonly optionalLazyObjectProperty?:
      | $LazyObjectOption<
          NestedObject.Identifier,
          $DefaultPartial,
          NestedObject
        >
      | Maybe<NestedObject>
      | NestedObject;
    readonly optionalObjectProperty?: NestedObject | Maybe<NestedObject>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  }): Either<Error, RootObject> {
    return $sequenceRecord({
      $identifier: $convertToIriIdentifierProperty<string>(
        parameters.$identifier,
      ),
      lazyObjectSetProperty: $convertToLazyObjectSet<
        NestedObject.Identifier,
        $DefaultPartial,
        NestedObject
      >($DefaultPartial.createUnsafe)(parameters.lazyObjectSetProperty),
      optionalLazyObjectProperty: $convertToLazyObjectOption<
        NestedObject.Identifier,
        $DefaultPartial,
        NestedObject
      >($DefaultPartial.createUnsafe)(parameters.optionalLazyObjectProperty),
      optionalObjectProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalObjectProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          RootObject.schema.properties.optionalObjectProperty.type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NestedObject.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    })
      .map((properties) => ({ ...properties, $type: "RootObject" as const }))
      .map((object) => $monkeyPatchObject(object, { $toString }));
  }

  export function createUnsafe(parameters: {
    readonly $identifier: (() => RootObject.Identifier) | string | NamedNode;
    readonly lazyObjectSetProperty?:
      | $LazyObjectSet<NestedObject.Identifier, $DefaultPartial, NestedObject>
      | readonly NestedObject[];
    readonly optionalLazyObjectProperty?:
      | $LazyObjectOption<
          NestedObject.Identifier,
          $DefaultPartial,
          NestedObject
        >
      | Maybe<NestedObject>
      | NestedObject;
    readonly optionalObjectProperty?: NestedObject | Maybe<NestedObject>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  }): RootObject {
    return create(parameters).unsafeCoerce();
  }

  export const GraphQL = new GraphQLObjectType<
    RootObject,
    { objectSet: $ObjectSet }
  >({
    description: undefined,
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) =>
          RootObject.Identifier.stringify(source.$identifier()),
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
          new GraphQLList(new GraphQLNonNull(NestedObject.GraphQL)),
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
        type: new GraphQLNonNull(NestedObject.GraphQL),
      },
      optionalObjectProperty: {
        args: undefined,
        description: '"Optional object property"',
        name: "optionalObjectProperty",
        resolve: (source, _args) =>
          source.optionalObjectProperty.extractNullable(),
        type: new GraphQLNonNull(NestedObject.GraphQL),
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
    name: "RootObject",
  });

  export type Identifier = NamedNode;

  export namespace Identifier {
    export const parse = $parseIri;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(
    filter: RootObject.Filter,
    value: RootObject,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIri(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.lazyObjectSetProperty !== undefined &&
      !((
        filter: $CollectionFilter<$DefaultPartial.Filter>,
        value: $LazyObjectSet<
          NestedObject.Identifier,
          $DefaultPartial,
          NestedObject
        >,
      ) =>
        $filterArray<$DefaultPartial, $DefaultPartial.Filter>(
          $DefaultPartial.filter,
        )(filter, value.partials))(
        filter.lazyObjectSetProperty,
        value.lazyObjectSetProperty,
      )
    ) {
      return false;
    }
    if (
      filter.optionalLazyObjectProperty !== undefined &&
      !((
        filter: $MaybeFilter<$DefaultPartial.Filter>,
        value: $LazyObjectOption<
          NestedObject.Identifier,
          $DefaultPartial,
          NestedObject
        >,
      ) =>
        $filterMaybe<$DefaultPartial, $DefaultPartial.Filter>(
          $DefaultPartial.filter,
        )(filter, value.partial))(
        filter.optionalLazyObjectProperty,
        value.optionalLazyObjectProperty,
      )
    ) {
      return false;
    }
    if (
      filter.optionalObjectProperty !== undefined &&
      !$filterMaybe<NestedObject, NestedObject.Filter>(NestedObject.filter)(
        filter.optionalObjectProperty,
        value.optionalObjectProperty,
      )
    ) {
      return false;
    }
    if (
      filter.optionalStringProperty !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.optionalStringProperty,
        value.optionalStringProperty,
      )
    ) {
      return false;
    }
    if (
      filter.requiredStringProperty !== undefined &&
      !$filterString(
        filter.requiredStringProperty,
        value.requiredStringProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type Filter = {
    readonly $identifier?: $IriFilter;
    readonly lazyObjectSetProperty?: $CollectionFilter<$DefaultPartial.Filter>;
    readonly optionalLazyObjectProperty?: $MaybeFilter<$DefaultPartial.Filter>;
    readonly optionalObjectProperty?: $MaybeFilter<NestedObject.Filter>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredStringProperty?: $StringFilter;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<RootObject> = (
    $resource,
    _$options,
  ) => {
    return (
      !_$options.ignoreRdfType
        ? $ensureRdfResourceType($resource, [RootObject.fromRdfType], {
            graph: _$options.graph,
          })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      $sequenceRecord({
        $identifier: Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIri()))
          .chain((values) => values.head()),
        lazyObjectSetProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.lazyObjectSetProperty,
          typeFromRdf: (resourceValues) =>
            $DefaultPartial
              .fromRdfResourceValues(resourceValues, {
                context: _$options.context,
                graph: _$options.graph,
                objectSet: _$options.objectSet,
                preferredLanguages: _$options.preferredLanguages,
                resource: $resource,
                ignoreRdfType: true,
                propertyPath:
                  RootObject.schema.properties.lazyObjectSetProperty.path,
              })
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath:
                    RootObject.schema.properties.lazyObjectSetProperty.path,
                  value: valuesArray,
                }),
              )
              .map((values) =>
                values.map(
                  (partials) =>
                    new $LazyObjectSet<
                      NestedObject.Identifier,
                      $DefaultPartial,
                      NestedObject
                    >({
                      partials,
                      resolver: (identifiers, options) =>
                        _$options.objectSet.nestedObjects({
                          identifiers,
                          ...options,
                        }),
                    }),
                ),
              ),
        }),
        optionalLazyObjectProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.optionalLazyObjectProperty,
          typeFromRdf: (resourceValues) =>
            $DefaultPartial
              .fromRdfResourceValues(resourceValues, {
                context: _$options.context,
                graph: _$options.graph,
                objectSet: _$options.objectSet,
                preferredLanguages: _$options.preferredLanguages,
                resource: $resource,
                ignoreRdfType: true,
                propertyPath:
                  RootObject.schema.properties.optionalLazyObjectProperty.path,
              })
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<$DefaultPartial>>({
                      focusResource: $resource,
                      propertyPath:
                        RootObject.schema.properties.optionalLazyObjectProperty
                          .path,
                      value: Maybe.empty(),
                    }),
              )
              .map((values) =>
                values.map(
                  (partial) =>
                    new $LazyObjectOption<
                      NestedObject.Identifier,
                      $DefaultPartial,
                      NestedObject
                    >({
                      partial,
                      resolver: (identifier, options) =>
                        _$options.objectSet.nestedObject(identifier, options),
                    }),
                ),
              ),
        }),
        optionalObjectProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.optionalObjectProperty,
          typeFromRdf: (resourceValues) =>
            NestedObject.fromRdfResourceValues(resourceValues, {
              context: _$options.context,
              graph: _$options.graph,
              objectSet: _$options.objectSet,
              preferredLanguages: _$options.preferredLanguages,
              resource: $resource,
              ignoreRdfType: true,
              propertyPath:
                RootObject.schema.properties.optionalObjectProperty.path,
            }).map((values) =>
              values.length > 0
                ? values.map((value) => Maybe.of(value))
                : Resource.Values.fromValue<Maybe<NestedObject>>({
                    focusResource: $resource,
                    propertyPath:
                      RootObject.schema.properties.optionalObjectProperty.path,
                    value: Maybe.empty(),
                  }),
            ),
        }),
        optionalStringProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.optionalStringProperty,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<string>>({
                      focusResource: $resource,
                      propertyPath:
                        NestedObject.schema.properties.optionalStringProperty
                          .path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        requiredStringProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.requiredStringProperty,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString())),
        }),
      }).chain((properties) => create(properties)),
    );
  };

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    RootObject
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => RootObject.fromRdfResource(resource, options)),
      ),
    );

  export const fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/RootObject",
  );

  export function isRootObject(object: $Object): object is RootObject {
    return object.$type === "RootObject";
  }

  export const schema = {
    properties: {
      $identifier: { kind: "Identifier", type: { kind: "Iri" as const } },
      lazyObjectSetProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://example.com/lazyObjectSetProperty"),
        get type() {
          return {
            kind: "LazyObjectSet" as const,
            get partialType() {
              return {
                kind: "Set" as const,
                get itemType() {
                  return $DefaultPartial.schema;
                },
              };
            },
          };
        },
      },
      optionalLazyObjectProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/optionalLazyObjectProperty",
        ),
        get type() {
          return {
            kind: "LazyObjectOption" as const,
            get partialType() {
              return {
                kind: "Option" as const,
                get itemType() {
                  return $DefaultPartial.schema;
                },
              };
            },
          };
        },
      },
      optionalObjectProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/optionalObjectProperty",
        ),
        get type() {
          return {
            kind: "Option" as const,
            get itemType() {
              return NestedObject.schema;
            },
          };
        },
      },
      optionalStringProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
        type: {
          kind: "Option" as const,
          itemType: { kind: "String" as const },
        },
      },
      requiredStringProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
        type: { kind: "String" as const },
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    RootObject.Identifier,
    RootObject
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/RootObject"),
        parameters.graph,
      );
    }
    parameters.resource.add(
      RootObject.schema.properties.lazyObjectSetProperty.path,
      parameters.object.lazyObjectSetProperty.partials.flatMap((item) => [
        $DefaultPartial.toRdfResource(item, {
          graph: parameters.graph,
          resourceSet: parameters.resourceSet,
        }).identifier,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      RootObject.schema.properties.optionalLazyObjectProperty.path,
      parameters.object.optionalLazyObjectProperty.partial
        .toList()
        .flatMap((value) => [
          $DefaultPartial.toRdfResource(value, {
            graph: parameters.graph,
            resourceSet: parameters.resourceSet,
          }).identifier,
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      RootObject.schema.properties.optionalObjectProperty.path,
      parameters.object.optionalObjectProperty.toList().flatMap((value) => [
        NestedObject.toRdfResource(value, {
          graph: parameters.graph,
          resourceSet: parameters.resourceSet,
        }).identifier,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      NestedObject.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      NestedObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _rootObject: RootObject,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _rootObject.$identifier().toString(),
    });
  }

  export function $toString(_rootObject: RootObject): string {
    return `RootObject(${JSON.stringify(_propertiesToStrings(_rootObject))})`;
  }
}
export interface UnionMember1 {
  readonly $identifier: () => UnionMember1.Identifier;

  readonly $type: "UnionMember1";

  /**
   * Optional number property
   */
  readonly optionalNumberProperty: Maybe<number>;
}

export namespace UnionMember1 {
  export function create(parameters?: {
    readonly $identifier?:
      | (() => UnionMember1.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalNumberProperty?: number | Maybe<number>;
  }): Either<Error, UnionMember1> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
      optionalNumberProperty: $convertToMaybe($identityConversionFunction)(
        parameters?.optionalNumberProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NestedObject.schema.properties.optionalNumberProperty.type,
          value,
        ),
      ),
    })
      .map((properties) => ({ ...properties, $type: "UnionMember1" as const }))
      .map((object) => $monkeyPatchObject(object, { $toString }));
  }

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => UnionMember1.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalNumberProperty?: number | Maybe<number>;
  }): UnionMember1 {
    return create(parameters).unsafeCoerce();
  }

  export const GraphQL = new GraphQLObjectType<
    UnionMember1,
    { objectSet: $ObjectSet }
  >({
    description: undefined,
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) =>
          UnionMember1.Identifier.stringify(source.$identifier()),
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

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(
    filter: UnionMember1.Filter,
    value: UnionMember1,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.optionalNumberProperty !== undefined &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.optionalNumberProperty,
        value.optionalNumberProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalNumberProperty?: $MaybeFilter<$NumericFilter<number>>;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<UnionMember1> = (
    $resource,
    _$options,
  ) => {
    return (
      !_$options.ignoreRdfType
        ? $ensureRdfResourceType($resource, [UnionMember1.fromRdfType], {
            graph: _$options.graph,
          })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      $sequenceRecord({
        $identifier: Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIdentifier()))
          .chain((values) => values.head()),
        optionalNumberProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.optionalNumberProperty,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toFloat()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<number>>({
                      focusResource: $resource,
                      propertyPath:
                        NestedObject.schema.properties.optionalNumberProperty
                          .path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
      }).chain((properties) => create(properties)),
    );
  };

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    UnionMember1
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => UnionMember1.fromRdfResource(resource, options)),
      ),
    );

  export const fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/UnionMember1",
  );

  export function isUnionMember1(object: $Object): object is UnionMember1 {
    return object.$type === "UnionMember1";
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
      optionalNumberProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/optionalNumberProperty",
        ),
        type: { kind: "Option" as const, itemType: { kind: "Float" as const } },
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    UnionMember1.Identifier,
    UnionMember1
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/UnionMember1"),
        parameters.graph,
      );
    }
    parameters.resource.add(
      NestedObject.schema.properties.optionalNumberProperty.path,
      parameters.object.optionalNumberProperty
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _unionMember1: UnionMember1,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _unionMember1.$identifier().toString(),
    });
  }

  export function $toString(_unionMember1: UnionMember1): string {
    return `UnionMember1(${JSON.stringify(_propertiesToStrings(_unionMember1))})`;
  }
}
export interface UnionMember2 {
  readonly $identifier: () => UnionMember2.Identifier;

  readonly $type: "UnionMember2";

  /**
   * Optional string property
   */
  readonly optionalStringProperty: Maybe<string>;
}

export namespace UnionMember2 {
  export function create(parameters?: {
    readonly $identifier?:
      | (() => UnionMember2.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalStringProperty?: string | Maybe<string>;
  }): Either<Error, UnionMember2> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters?.optionalStringProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NestedObject.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
    })
      .map((properties) => ({ ...properties, $type: "UnionMember2" as const }))
      .map((object) => $monkeyPatchObject(object, { $toString }));
  }

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => UnionMember2.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalStringProperty?: string | Maybe<string>;
  }): UnionMember2 {
    return create(parameters).unsafeCoerce();
  }

  export const GraphQL = new GraphQLObjectType<
    UnionMember2,
    { objectSet: $ObjectSet }
  >({
    description: undefined,
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) =>
          UnionMember2.Identifier.stringify(source.$identifier()),
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

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(
    filter: UnionMember2.Filter,
    value: UnionMember2,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.optionalStringProperty !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.optionalStringProperty,
        value.optionalStringProperty,
      )
    ) {
      return false;
    }
    return true;
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<UnionMember2> = (
    $resource,
    _$options,
  ) => {
    return (
      !_$options.ignoreRdfType
        ? $ensureRdfResourceType($resource, [UnionMember2.fromRdfType], {
            graph: _$options.graph,
          })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      $sequenceRecord({
        $identifier: Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIdentifier()))
          .chain((values) => values.head()),
        optionalStringProperty: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.optionalStringProperty,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<string>>({
                      focusResource: $resource,
                      propertyPath:
                        NestedObject.schema.properties.optionalStringProperty
                          .path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
      }).chain((properties) => create(properties)),
    );
  };

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    UnionMember2
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => UnionMember2.fromRdfResource(resource, options)),
      ),
    );

  export const fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://example.com/UnionMember2",
  );

  export function isUnionMember2(object: $Object): object is UnionMember2 {
    return object.$type === "UnionMember2";
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
      optionalStringProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
        type: {
          kind: "Option" as const,
          itemType: { kind: "String" as const },
        },
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    UnionMember2.Identifier,
    UnionMember2
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://example.com/UnionMember2"),
        parameters.graph,
      );
    }
    parameters.resource.add(
      NestedObject.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _unionMember2: UnionMember2,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _unionMember2.$identifier().toString(),
    });
  }

  export function $toString(_unionMember2: UnionMember2): string {
    return `UnionMember2(${JSON.stringify(_propertiesToStrings(_unionMember2))})`;
  }
}
export type Union = UnionMember1 | UnionMember2;

export namespace Union {
  export const $toString = (value: Union): string => {
    if (UnionMember1.isUnionMember1(value)) {
      return UnionMember1.$toString(value);
    }
    if (UnionMember2.isUnionMember2(value)) {
      return UnionMember2.$toString(value);
    }

    throw new Error("unable to serialize to string");
  };

  export const filter = (filter: Union.Filter, value: Union) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.on?.["UnionMember1"] !== undefined &&
      UnionMember1.isUnionMember1(value)
    ) {
      if (!UnionMember1.filter(filter.on["UnionMember1"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["UnionMember2"] !== undefined &&
      UnionMember2.isUnionMember2(value)
    ) {
      if (!UnionMember2.filter(filter.on["UnionMember2"], value)) {
        return false;
      }
    }

    return true;
  };

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly UnionMember1?: UnionMember1.Filter;
      readonly UnionMember2?: UnionMember2.Filter;
    };
  };

  export const fromRdfResource: $FromRdfResourceFunction<Union> = (
    resource,
    options,
  ) =>
    (
      UnionMember1.fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, Union>
    ).altLazy(
      () =>
        UnionMember2.fromRdfResource(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, Union>,
    );

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<Union> = ((
    values,
    _options,
  ) =>
    values.chain((values) =>
      values.chainMap((value) => {
        const valueAsValues = Right(value.toValues());
        return (
          UnionMember1.fromRdfResourceValues(valueAsValues, {
            context: _options.context,
            graph: _options.graph,
            ignoreRdfType: false,
            objectSet: _options.objectSet,
            preferredLanguages: _options.preferredLanguages,
            propertyPath: _options.propertyPath,
            resource: _options.resource,
          }) as Either<Error, Resource.Values<Union>>
        )
          .altLazy(
            () =>
              UnionMember2.fromRdfResourceValues(valueAsValues, {
                context: _options.context,
                graph: _options.graph,
                ignoreRdfType: false,
                objectSet: _options.objectSet,
                preferredLanguages: _options.preferredLanguages,
                propertyPath: _options.propertyPath,
                resource: _options.resource,
              }) as Either<Error, Resource.Values<Union>>,
          )
          .chain((values) => values.head());
      }),
    )) satisfies $FromRdfResourceValuesFunction<Union>;

  export const GraphQL = new GraphQLUnionType({
    description: undefined,
    name: "Union",
    resolveType: (value: Union) => value.$type,
    types: [UnionMember1.GraphQL, UnionMember2.GraphQL],
  });

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function isUnion(object: $Object): object is Union {
    return (
      UnionMember1.isUnionMember1(object) || UnionMember2.isUnionMember2(object)
    );
  }

  export const schema = {
    kind: "ObjectUnion" as const,
    members: {
      UnionMember1: {
        discriminantValues: ["UnionMember1"],
        type: UnionMember1.schema,
      },
      UnionMember2: {
        discriminantValues: ["UnionMember2"],
        type: UnionMember2.schema,
      },
    },
    properties: {},
  } as const;

  export const toRdfResource: $ToRdfResourceFunction<Union> = (
    object,
    options,
  ) => {
    if (UnionMember1.isUnionMember1(object)) {
      return UnionMember1.toRdfResource(object, options);
    }
    if (UnionMember2.isUnionMember2(object)) {
      return UnionMember2.toRdfResource(object, options);
    }
    throw new Error("unrecognized type");
  };

  export const toRdfResourceValues = ((
    value,
    _options,
  ): (BlankNode | NamedNode)[] => {
    if (UnionMember1.isUnionMember1(value)) {
      return [
        UnionMember1.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (UnionMember2.isUnionMember2(value)) {
      return [
        UnionMember2.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) satisfies $ToRdfResourceValuesFunction<Union>;
}
export type $Object =
  | $DefaultPartial
  | NestedObject
  | RootObject
  | UnionMember1
  | UnionMember2;

export namespace $Object {
  export const $toString = (value: $Object): string => {
    if ($DefaultPartial.is$DefaultPartial(value)) {
      return $DefaultPartial.$toString(value);
    }
    if (NestedObject.isNestedObject(value)) {
      return NestedObject.$toString(value);
    }
    if (RootObject.isRootObject(value)) {
      return RootObject.$toString(value);
    }
    if (UnionMember1.isUnionMember1(value)) {
      return UnionMember1.$toString(value);
    }
    if (UnionMember2.isUnionMember2(value)) {
      return UnionMember2.$toString(value);
    }

    throw new Error("unable to serialize to string");
  };

  export const filter = (filter: $Object.Filter, value: $Object) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.on?.["DefaultPartial"] !== undefined &&
      $DefaultPartial.is$DefaultPartial(value)
    ) {
      if (!$DefaultPartial.filter(filter.on["DefaultPartial"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["NestedObject"] !== undefined &&
      NestedObject.isNestedObject(value)
    ) {
      if (!NestedObject.filter(filter.on["NestedObject"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["RootObject"] !== undefined &&
      RootObject.isRootObject(value)
    ) {
      if (!RootObject.filter(filter.on["RootObject"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["UnionMember1"] !== undefined &&
      UnionMember1.isUnionMember1(value)
    ) {
      if (!UnionMember1.filter(filter.on["UnionMember1"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["UnionMember2"] !== undefined &&
      UnionMember2.isUnionMember2(value)
    ) {
      if (!UnionMember2.filter(filter.on["UnionMember2"], value)) {
        return false;
      }
    }

    return true;
  };

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly DefaultPartial?: $DefaultPartial.Filter;
      readonly NestedObject?: NestedObject.Filter;
      readonly RootObject?: RootObject.Filter;
      readonly UnionMember1?: UnionMember1.Filter;
      readonly UnionMember2?: UnionMember2.Filter;
    };
  };

  export const fromRdfResource: $FromRdfResourceFunction<$Object> = (
    resource,
    options,
  ) =>
    (
      $DefaultPartial.fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, $Object>
    )
      .altLazy(
        () =>
          NestedObject.fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          RootObject.fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          UnionMember1.fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          UnionMember2.fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      );

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<$Object> =
    ((values, _options) =>
      values.chain((values) =>
        values.chainMap((value) => {
          const valueAsValues = Right(value.toValues());
          return (
            $DefaultPartial.fromRdfResourceValues(valueAsValues, {
              context: _options.context,
              graph: _options.graph,
              ignoreRdfType: false,
              objectSet: _options.objectSet,
              preferredLanguages: _options.preferredLanguages,
              propertyPath: _options.propertyPath,
              resource: _options.resource,
            }) as Either<Error, Resource.Values<$Object>>
          )
            .altLazy(
              () =>
                NestedObject.fromRdfResourceValues(valueAsValues, {
                  context: _options.context,
                  graph: _options.graph,
                  ignoreRdfType: false,
                  objectSet: _options.objectSet,
                  preferredLanguages: _options.preferredLanguages,
                  propertyPath: _options.propertyPath,
                  resource: _options.resource,
                }) as Either<Error, Resource.Values<$Object>>,
            )
            .altLazy(
              () =>
                RootObject.fromRdfResourceValues(valueAsValues, {
                  context: _options.context,
                  graph: _options.graph,
                  ignoreRdfType: false,
                  objectSet: _options.objectSet,
                  preferredLanguages: _options.preferredLanguages,
                  propertyPath: _options.propertyPath,
                  resource: _options.resource,
                }) as Either<Error, Resource.Values<$Object>>,
            )
            .altLazy(
              () =>
                UnionMember1.fromRdfResourceValues(valueAsValues, {
                  context: _options.context,
                  graph: _options.graph,
                  ignoreRdfType: false,
                  objectSet: _options.objectSet,
                  preferredLanguages: _options.preferredLanguages,
                  propertyPath: _options.propertyPath,
                  resource: _options.resource,
                }) as Either<Error, Resource.Values<$Object>>,
            )
            .altLazy(
              () =>
                UnionMember2.fromRdfResourceValues(valueAsValues, {
                  context: _options.context,
                  graph: _options.graph,
                  ignoreRdfType: false,
                  objectSet: _options.objectSet,
                  preferredLanguages: _options.preferredLanguages,
                  propertyPath: _options.propertyPath,
                  resource: _options.resource,
                }) as Either<Error, Resource.Values<$Object>>,
            )
            .chain((values) => values.head());
        }),
      )) satisfies $FromRdfResourceValuesFunction<$Object>;

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export const schema = {
    kind: "ObjectUnion" as const,
    members: {
      DefaultPartial: {
        discriminantValues: ["DefaultPartial"],
        type: $DefaultPartial.schema,
      },
      NestedObject: {
        discriminantValues: ["NestedObject"],
        type: NestedObject.schema,
      },
      RootObject: {
        discriminantValues: ["RootObject"],
        type: RootObject.schema,
      },
      UnionMember1: {
        discriminantValues: ["UnionMember1"],
        type: UnionMember1.schema,
      },
      UnionMember2: {
        discriminantValues: ["UnionMember2"],
        type: UnionMember2.schema,
      },
    },
    properties: {},
  } as const;

  export const toRdfResource: $ToRdfResourceFunction<$Object> = (
    object,
    options,
  ) => {
    if ($DefaultPartial.is$DefaultPartial(object)) {
      return $DefaultPartial.toRdfResource(object, options);
    }
    if (NestedObject.isNestedObject(object)) {
      return NestedObject.toRdfResource(object, options);
    }
    if (RootObject.isRootObject(object)) {
      return RootObject.toRdfResource(object, options);
    }
    if (UnionMember1.isUnionMember1(object)) {
      return UnionMember1.toRdfResource(object, options);
    }
    if (UnionMember2.isUnionMember2(object)) {
      return UnionMember2.toRdfResource(object, options);
    }
    throw new Error("unrecognized type");
  };

  export const toRdfResourceValues = ((
    value,
    _options,
  ): (BlankNode | NamedNode)[] => {
    if ($DefaultPartial.is$DefaultPartial(value)) {
      return [
        $DefaultPartial.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (NestedObject.isNestedObject(value)) {
      return [
        NestedObject.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (RootObject.isRootObject(value)) {
      return [
        RootObject.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (UnionMember1.isUnionMember1(value)) {
      return [
        UnionMember1.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (UnionMember2.isUnionMember2(value)) {
      return [
        UnionMember2.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) satisfies $ToRdfResourceValuesFunction<$Object>;
}
export interface $ObjectSet {
  nestedObject(
    identifier: NestedObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, NestedObject>>;

  nestedObjectCount(
    query?: Pick<
      $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  nestedObjectIdentifiers(
    query?: $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
  ): Promise<Either<Error, readonly NestedObject.Identifier[]>>;

  nestedObjects(
    query?: $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
  ): Promise<Either<Error, readonly NestedObject[]>>;

  rootObject(
    identifier: RootObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, RootObject>>;

  rootObjectCount(
    query?: Pick<
      $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  rootObjectIdentifiers(
    query?: $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
  ): Promise<Either<Error, readonly RootObject.Identifier[]>>;

  rootObjects(
    query?: $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
  ): Promise<Either<Error, readonly RootObject[]>>;

  unionMember1(
    identifier: UnionMember1.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, UnionMember1>>;

  unionMember1Count(
    query?: Pick<
      $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
  ): Promise<Either<Error, readonly UnionMember1.Identifier[]>>;

  unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
  ): Promise<Either<Error, readonly UnionMember1[]>>;

  unionMember2(
    identifier: UnionMember2.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, UnionMember2>>;

  unionMember2Count(
    query?: Pick<
      $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  unionMember2Identifiers(
    query?: $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
  ): Promise<Either<Error, readonly UnionMember2.Identifier[]>>;

  unionMember2s(
    query?: $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
  ): Promise<Either<Error, readonly UnionMember2[]>>;

  union(
    identifier: Union.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Union>>;

  unionCount(
    query?: Pick<$ObjectSet.Query<Union.Filter, Union.Identifier>, "filter">,
  ): Promise<Either<Error, number>>;

  unionIdentifiers(
    query?: $ObjectSet.Query<Union.Filter, Union.Identifier>,
  ): Promise<Either<Error, readonly Union.Identifier[]>>;

  unions(
    query?: $ObjectSet.Query<Union.Filter, Union.Identifier>,
  ): Promise<Either<Error, readonly Union[]>>;

  $object(
    identifier: $Object.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, $Object>>;

  $objectCount(
    query?: Pick<
      $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  $objectIdentifiers(
    query?: $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
  ): Promise<Either<Error, readonly $Object.Identifier[]>>;

  $objects(
    query?: $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
  ): Promise<Either<Error, readonly $Object[]>>;
}

export namespace $ObjectSet {
  export interface Query<
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  > {
    readonly filter?: ObjectFilterT;
    readonly graph?: Exclude<Quad_Graph, Variable>;
    readonly identifiers?: readonly ObjectIdentifierT[];
    readonly limit?: number;
    readonly offset?: number;
    readonly preferredLanguages?: readonly string[];
  }
}
export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly #dataset: DatasetCore | (() => DatasetCore);
  readonly #graph?: Exclude<Quad_Graph, Variable>;

  constructor(
    dataset: DatasetCore | (() => DatasetCore),
    options?: { graph?: Exclude<Quad_Graph, Variable> },
  ) {
    this.#dataset = dataset;
    this.#graph = options?.graph;
  }

  protected $dataset(): DatasetCore {
    if (typeof this.#dataset === "object") {
      return this.#dataset;
    }
    return this.#dataset();
  }

  protected $resourceSet(): ResourceSet {
    return new ResourceSet({
      dataFactory: dataFactory,
      dataset: this.$dataset(),
    });
  }

  async nestedObject(
    identifier: NestedObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, NestedObject>> {
    return this.nestedObjectSync(identifier, options);
  }

  nestedObjectSync(
    identifier: NestedObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, NestedObject> {
    return this.nestedObjectsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async nestedObjectCount(
    query?: Pick<
      $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.nestedObjectCountSync(query);
  }

  nestedObjectCountSync(
    query?: Pick<
      $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.nestedObjectsSync(query).map((objects) => objects.length);
  }

  async nestedObjectIdentifiers(
    query?: $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
  ): Promise<Either<Error, readonly NestedObject.Identifier[]>> {
    return this.nestedObjectIdentifiersSync(query);
  }

  nestedObjectIdentifiersSync(
    query?: $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
  ): Either<Error, readonly NestedObject.Identifier[]> {
    return this.nestedObjectsSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async nestedObjects(
    query?: $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
  ): Promise<Either<Error, readonly NestedObject[]>> {
    return this.nestedObjectsSync(query);
  }

  nestedObjectsSync(
    query?: $ObjectSet.Query<NestedObject.Filter, NestedObject.Identifier>,
  ): Either<Error, readonly NestedObject[]> {
    return this.#objectsSync<
      NestedObject,
      NestedObject.Filter,
      NestedObject.Identifier
    >(
      {
        filter: NestedObject.filter,
        fromRdfResource: NestedObject.fromRdfResource,
        fromRdfTypes: [NestedObject.fromRdfType],
      },
      query,
    );
  }

  async rootObject(
    identifier: RootObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, RootObject>> {
    return this.rootObjectSync(identifier, options);
  }

  rootObjectSync(
    identifier: RootObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, RootObject> {
    return this.rootObjectsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async rootObjectCount(
    query?: Pick<
      $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.rootObjectCountSync(query);
  }

  rootObjectCountSync(
    query?: Pick<
      $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.rootObjectsSync(query).map((objects) => objects.length);
  }

  async rootObjectIdentifiers(
    query?: $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
  ): Promise<Either<Error, readonly RootObject.Identifier[]>> {
    return this.rootObjectIdentifiersSync(query);
  }

  rootObjectIdentifiersSync(
    query?: $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
  ): Either<Error, readonly RootObject.Identifier[]> {
    return this.rootObjectsSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async rootObjects(
    query?: $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
  ): Promise<Either<Error, readonly RootObject[]>> {
    return this.rootObjectsSync(query);
  }

  rootObjectsSync(
    query?: $ObjectSet.Query<RootObject.Filter, RootObject.Identifier>,
  ): Either<Error, readonly RootObject[]> {
    return this.#objectsSync<
      RootObject,
      RootObject.Filter,
      RootObject.Identifier
    >(
      {
        filter: RootObject.filter,
        fromRdfResource: RootObject.fromRdfResource,
        fromRdfTypes: [RootObject.fromRdfType],
      },
      query,
    );
  }

  async unionMember1(
    identifier: UnionMember1.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, UnionMember1>> {
    return this.unionMember1Sync(identifier, options);
  }

  unionMember1Sync(
    identifier: UnionMember1.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, UnionMember1> {
    return this.unionMember1sSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async unionMember1Count(
    query?: Pick<
      $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.unionMember1CountSync(query);
  }

  unionMember1CountSync(
    query?: Pick<
      $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.unionMember1sSync(query).map((objects) => objects.length);
  }

  async unionMember1Identifiers(
    query?: $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
  ): Promise<Either<Error, readonly UnionMember1.Identifier[]>> {
    return this.unionMember1IdentifiersSync(query);
  }

  unionMember1IdentifiersSync(
    query?: $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
  ): Either<Error, readonly UnionMember1.Identifier[]> {
    return this.unionMember1sSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async unionMember1s(
    query?: $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
  ): Promise<Either<Error, readonly UnionMember1[]>> {
    return this.unionMember1sSync(query);
  }

  unionMember1sSync(
    query?: $ObjectSet.Query<UnionMember1.Filter, UnionMember1.Identifier>,
  ): Either<Error, readonly UnionMember1[]> {
    return this.#objectsSync<
      UnionMember1,
      UnionMember1.Filter,
      UnionMember1.Identifier
    >(
      {
        filter: UnionMember1.filter,
        fromRdfResource: UnionMember1.fromRdfResource,
        fromRdfTypes: [UnionMember1.fromRdfType],
      },
      query,
    );
  }

  async unionMember2(
    identifier: UnionMember2.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, UnionMember2>> {
    return this.unionMember2Sync(identifier, options);
  }

  unionMember2Sync(
    identifier: UnionMember2.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, UnionMember2> {
    return this.unionMember2sSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async unionMember2Count(
    query?: Pick<
      $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.unionMember2CountSync(query);
  }

  unionMember2CountSync(
    query?: Pick<
      $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.unionMember2sSync(query).map((objects) => objects.length);
  }

  async unionMember2Identifiers(
    query?: $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
  ): Promise<Either<Error, readonly UnionMember2.Identifier[]>> {
    return this.unionMember2IdentifiersSync(query);
  }

  unionMember2IdentifiersSync(
    query?: $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
  ): Either<Error, readonly UnionMember2.Identifier[]> {
    return this.unionMember2sSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async unionMember2s(
    query?: $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
  ): Promise<Either<Error, readonly UnionMember2[]>> {
    return this.unionMember2sSync(query);
  }

  unionMember2sSync(
    query?: $ObjectSet.Query<UnionMember2.Filter, UnionMember2.Identifier>,
  ): Either<Error, readonly UnionMember2[]> {
    return this.#objectsSync<
      UnionMember2,
      UnionMember2.Filter,
      UnionMember2.Identifier
    >(
      {
        filter: UnionMember2.filter,
        fromRdfResource: UnionMember2.fromRdfResource,
        fromRdfTypes: [UnionMember2.fromRdfType],
      },
      query,
    );
  }

  async union(
    identifier: Union.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Union>> {
    return this.unionSync(identifier, options);
  }

  unionSync(
    identifier: Union.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, Union> {
    return this.unionsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async unionCount(
    query?: Pick<$ObjectSet.Query<Union.Filter, Union.Identifier>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.unionCountSync(query);
  }

  unionCountSync(
    query?: Pick<$ObjectSet.Query<Union.Filter, Union.Identifier>, "filter">,
  ): Either<Error, number> {
    return this.unionsSync(query).map((objects) => objects.length);
  }

  async unionIdentifiers(
    query?: $ObjectSet.Query<Union.Filter, Union.Identifier>,
  ): Promise<Either<Error, readonly Union.Identifier[]>> {
    return this.unionIdentifiersSync(query);
  }

  unionIdentifiersSync(
    query?: $ObjectSet.Query<Union.Filter, Union.Identifier>,
  ): Either<Error, readonly Union.Identifier[]> {
    return this.unionsSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async unions(
    query?: $ObjectSet.Query<Union.Filter, Union.Identifier>,
  ): Promise<Either<Error, readonly Union[]>> {
    return this.unionsSync(query);
  }

  unionsSync(
    query?: $ObjectSet.Query<Union.Filter, Union.Identifier>,
  ): Either<Error, readonly Union[]> {
    return this.#objectUnionsSync<Union, Union.Filter, Union.Identifier>(
      [
        {
          filter: Union.filter,
          fromRdfResource: UnionMember1.fromRdfResource,
          fromRdfTypes: [UnionMember1.fromRdfType],
        },
        {
          filter: Union.filter,
          fromRdfResource: UnionMember2.fromRdfResource,
          fromRdfTypes: [UnionMember2.fromRdfType],
        },
      ],
      query,
    );
  }

  async $object(
    identifier: $Object.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, $Object>> {
    return this.$objectSync(identifier, options);
  }

  $objectSync(
    identifier: $Object.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, $Object> {
    return this.$objectsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async $objectCount(
    query?: Pick<
      $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.$objectCountSync(query);
  }

  $objectCountSync(
    query?: Pick<
      $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.$objectsSync(query).map((objects) => objects.length);
  }

  async $objectIdentifiers(
    query?: $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
  ): Promise<Either<Error, readonly $Object.Identifier[]>> {
    return this.$objectIdentifiersSync(query);
  }

  $objectIdentifiersSync(
    query?: $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
  ): Either<Error, readonly $Object.Identifier[]> {
    return this.$objectsSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async $objects(
    query?: $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
  ): Promise<Either<Error, readonly $Object[]>> {
    return this.$objectsSync(query);
  }

  $objectsSync(
    query?: $ObjectSet.Query<$Object.Filter, $Object.Identifier>,
  ): Either<Error, readonly $Object[]> {
    return this.#objectUnionsSync<$Object, $Object.Filter, $Object.Identifier>(
      [
        {
          filter: $Object.filter,
          fromRdfResource: $DefaultPartial.fromRdfResource,
          fromRdfTypes: [],
        },
        {
          filter: $Object.filter,
          fromRdfResource: NestedObject.fromRdfResource,
          fromRdfTypes: [NestedObject.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: RootObject.fromRdfResource,
          fromRdfTypes: [RootObject.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: UnionMember1.fromRdfResource,
          fromRdfTypes: [UnionMember1.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: UnionMember2.fromRdfResource,
          fromRdfTypes: [UnionMember2.fromRdfType],
        },
      ],
      query,
    );
  }

  #objectsSync<
    ObjectT extends { readonly $identifier: () => ObjectIdentifierT },
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  >(
    namedObjectType: {
      filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      fromRdfResource: $FromRdfResourceFunction<ObjectT>;
      fromRdfTypes: readonly NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const graph = query?.graph ?? this.#graph;

    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Right([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    const fromRdfResourceOptions: Parameters<
      $FromRdfResourceFunction<ObjectT>
    >[1] = {
      graph,
      objectSet: this,
      preferredLanguages: query?.preferredLanguages,
    };

    let resources: { object?: ObjectT; resource: Resource }[];
    const resourceSet = this.$resourceSet(); // Access once, in case it's instantiated lazily
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: resourceSet.resource(identifier),
      }));
      sortResources = false;
    } else if (namedObjectType.fromRdfTypes.length > 0) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const fromRdfType of namedObjectType.fromRdfTypes) {
        for (const resource of resourceSet.instancesOf(fromRdfType, {
          graph,
        })) {
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
      for (const quad of resourceSet.dataset) {
        if (graph && !quad.graph.equals(graph)) {
          continue;
        }

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
        const resource = resourceSet.resource(quad.subject);
        // Eagerly eliminate the majority of resources that won't match the object type
        namedObjectType
          .fromRdfResource(resource, fromRdfResourceOptions)
          .ifRight((object) => {
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
        const objectEither = namedObjectType.fromRdfResource(
          resource,
          fromRdfResourceOptions,
        );
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }

      if (query?.filter && !namedObjectType.filter(query.filter, object)) {
        continue;
      }

      if (objectI++ >= offset) {
        objects.push(object);
        if (objects.length === limit) {
          return Right(objects);
        }
      }
    }
    return Right(objects);
  }

  #objectUnionsSync<
    ObjectT extends { readonly $identifier: () => ObjectIdentifierT },
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  >(
    namedObjectTypes: readonly {
      filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      fromRdfResource: $FromRdfResourceFunction<ObjectT>;
      fromRdfTypes: readonly NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const graph = query?.graph ?? this.#graph;

    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Right([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    const fromRdfResourceOptions: Parameters<
      $FromRdfResourceFunction<ObjectT>
    >[1] = {
      graph,
      objectSet: this,
      preferredLanguages: query?.preferredLanguages,
    };

    let resources: {
      object?: ObjectT;
      namedObjectType?: {
        filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
        fromRdfResource: $FromRdfResourceFunction<ObjectT>;
        fromRdfTypes: readonly NamedNode[];
      };
      resource: Resource;
    }[];
    const resourceSet = this.$resourceSet(); // Access once, in case it's instantiated lazily
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: resourceSet.resource(identifier),
      }));
      sortResources = false;
    } else if (
      namedObjectTypes.every(
        (namedObjectType) => namedObjectType.fromRdfTypes.length > 0,
      )
    ) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const namedObjectType of namedObjectTypes) {
        for (const fromRdfType of namedObjectType.fromRdfTypes) {
          for (const resource of resourceSet.instancesOf(fromRdfType, {
            graph,
          })) {
            if (!identifierSet.has(resource.identifier)) {
              identifierSet.add(resource.identifier);
              resources.push({ namedObjectType, resource });
            }
          }
        }
      }
    } else {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const quad of resourceSet.dataset) {
        if (graph && !quad.graph.equals(graph)) {
          continue;
        }

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
        const resource = resourceSet.resource(quad.subject);
        for (const namedObjectType of namedObjectTypes) {
          if (
            namedObjectType
              .fromRdfResource(resource, fromRdfResourceOptions)
              .ifRight((object) => {
                resources.push({ object, namedObjectType, resource });
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
    for (let { object, namedObjectType, resource } of resources) {
      if (!object) {
        let objectEither: Either<Error, ObjectT>;
        if (namedObjectType) {
          objectEither = namedObjectType.fromRdfResource(
            resource,
            fromRdfResourceOptions,
          );
        } else {
          objectEither = Left(new Error("no object types"));
          for (const tryObjectType of namedObjectTypes) {
            objectEither = tryObjectType.fromRdfResource(
              resource,
              fromRdfResourceOptions,
            );
            if (objectEither.isRight()) {
              namedObjectType = tryObjectType;
              break;
            }
          }
        }
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }
      if (!namedObjectType) {
        throw new Error("namedObjectType should be set here");
      }

      if (query?.filter && !namedObjectType.filter(query.filter, object)) {
        continue;
      }

      if (objectI++ >= offset) {
        objects.push(object);
        if (objects.length === limit) {
          return Right(objects);
        }
      }
    }
    return Right(objects);
  }
}
export const graphqlSchema = new GraphQLSchema({
  query: new GraphQLObjectType<null, { objectSet: $ObjectSet }>({
    name: "Query",
    fields: {
      nestedObject: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<NestedObject> =>
          (
            await EitherAsync<Error, NestedObject>(async ({ liftEither }) =>
              liftEither(
                await objectSet.nestedObject(
                  await liftEither(
                    NestedObject.Identifier.parse(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(NestedObject.GraphQL),
      },
      nestedObjectIdentifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.nestedObjectIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(NestedObject.Identifier.stringify),
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      nestedObjects: {
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
        ): Promise<readonly NestedObject[]> =>
          (
            await EitherAsync<Error, readonly NestedObject[]>(
              async ({ liftEither }) => {
                let filter: NestedObject.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: NestedObject.Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        NestedObject.Identifier.parse(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.nestedObjects({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(NestedObject.GraphQL)),
        ),
      },
      nestedObjectCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.nestedObjectCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
      rootObject: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<RootObject> =>
          (
            await EitherAsync<Error, RootObject>(async ({ liftEither }) =>
              liftEither(
                await objectSet.rootObject(
                  await liftEither(
                    RootObject.Identifier.parse(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(RootObject.GraphQL),
      },
      rootObjectIdentifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.rootObjectIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(RootObject.Identifier.stringify),
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      rootObjects: {
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
        ): Promise<readonly RootObject[]> =>
          (
            await EitherAsync<Error, readonly RootObject[]>(
              async ({ liftEither }) => {
                let filter: RootObject.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: RootObject.Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        RootObject.Identifier.parse(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.rootObjects({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(RootObject.GraphQL)),
        ),
      },
      rootObjectCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.rootObjectCount()).unsafeCoerce(),
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
                    UnionMember1.Identifier.parse(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(UnionMember1.GraphQL),
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
            .map(UnionMember1.Identifier.stringify),
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
                let filter: UnionMember1.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: UnionMember1.Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        UnionMember1.Identifier.parse(identifierArg),
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
          new GraphQLList(new GraphQLNonNull(UnionMember1.GraphQL)),
        ),
      },
      unionMember1Count: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionMember1Count()).unsafeCoerce(),
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
                    UnionMember2.Identifier.parse(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(UnionMember2.GraphQL),
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
            .map(UnionMember2.Identifier.stringify),
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
                let filter: UnionMember2.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: UnionMember2.Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        UnionMember2.Identifier.parse(identifierArg),
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
          new GraphQLList(new GraphQLNonNull(UnionMember2.GraphQL)),
        ),
      },
      unionMember2Count: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionMember2Count()).unsafeCoerce(),
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
                  await liftEither(Union.Identifier.parse(args.identifier)),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(Union.GraphQL),
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
            .map(Union.Identifier.stringify),
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
                let filter: Union.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: Union.Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(Union.Identifier.parse(identifierArg)),
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
          new GraphQLList(new GraphQLNonNull(Union.GraphQL)),
        ),
      },
      unionCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.unionCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
    },
  }),
});

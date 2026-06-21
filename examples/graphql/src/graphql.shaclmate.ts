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

interface $CollectionSchema<ItemSchemaT> {
  readonly itemType: ItemSchemaT;
  readonly kind: "List" | "Set";
  readonly minCount?: number;
}

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

function $convertToLazyOption<PartialT, ResolvedT>(
  resolvedToPartial: (resolved: ResolvedT) => PartialT,
) {
  return (
    value:
      | $LazyOption<PartialT, ResolvedT>
      | Maybe<ResolvedT>
      | ResolvedT
      | undefined,
  ): Either<Error, $LazyOption<PartialT, ResolvedT>> => {
    switch (typeof value) {
      case "object": {
        if (value instanceof $LazyOption) {
          return Either.of(value);
        }

        if (Maybe.isMaybe(value)) {
          return Either.of(
            new $LazyOption<PartialT, ResolvedT>({
              partial: value.map(resolvedToPartial),
              resolver: async () => Right(value.unsafeCoerce()),
            }),
          );
        }

        break;
      }
      case "undefined":
        return Either.of(
          new $LazyOption<PartialT, ResolvedT>({
            partial: Maybe.empty(),
            resolver: async () => {
              throw new Error("should never be called");
            },
          }),
        );
    }

    return Either.of(
      new $LazyOption<PartialT, ResolvedT>({
        partial: Maybe.of(resolvedToPartial(value)),
        resolver: async () => Right(value),
      }),
    );
  };
}

function $convertToLazySet<PartialT, ResolvedT>(
  resolvedToPartial: (resolved: ResolvedT) => PartialT,
) {
  return (
    value: $LazySet<PartialT, ResolvedT> | readonly ResolvedT[] | undefined,
  ): Either<Error, $LazySet<PartialT, ResolvedT>> => {
    switch (typeof value) {
      case "object": {
        if (value instanceof $LazySet) {
          return Either.of(value);
        }

        break;
      }
      case "undefined":
        return Either.of(
          new $LazySet<PartialT, ResolvedT>({
            partials: [],
            resolver: async () => Right([]),
          }),
        );
    }

    const captureValue = value;
    return Either.of(
      new $LazySet<PartialT, ResolvedT>({
        partials: value.map(resolvedToPartial),
        resolver: async () => Right(captureValue),
      }),
    );
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

function $filterNumeric<NumericT extends bigint | number>(
  filter: $NumericFilter<NumericT>,
  value: NumericT,
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

function $floatFromRdfResourceValues<FloatT extends number>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<FloatT, $NumericSchema<FloatT>>
  >[1],
): Either<Error, Resource.Values<FloatT>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toFloat(options.schema.in)
        : (value.toFloat() as Either<Error, FloatT>),
    ),
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

export type $FromRdfResourceValuesFunction<ValueT, ValueSchemaT> = (
  resourceValues: Resource.Values,
  options: {
    context?: unknown;
    graph?: Exclude<Quad_Graph, Variable>;
    focusResource: Resource;
    ignoreRdfType?: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    propertyPath: $PropertyPath;
    schema: ValueSchemaT;
  },
) => Either<Error, Resource.Values<ValueT>>;

interface $IdentifierFilter {
  readonly in?: readonly (BlankNode | NamedNode)[];
  readonly type?: "BlankNode" | "NamedNode";
}

function $identifierFromRdfResourceValues(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<BlankNode | NamedNode, $IdentifierSchema>
  >[1],
): Either<Error, Resource.Values<BlankNode | NamedNode>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) => value.toIdentifier()),
  );
}

interface $IdentifierSchema {
  readonly hasValues?: readonly NamedNode[];
  readonly kind: "Identifier";
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

function $iriFromRdfResourceValues<IriT extends string = string>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<NamedNode<IriT>, $IriSchema<IriT>>
  >[1],
): Either<Error, Resource.Values<NamedNode<IriT>>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toIri(options.schema.in)
        : (value.toIri() as Either<Error, NamedNode<IriT>>),
    ),
  );
}

interface $IriSchema<IriT extends string = string> {
  readonly hasValues?: readonly NamedNode[];
  readonly in?: readonly NamedNode<IriT>[];
  readonly kind: "Iri";
}

/**
 * Type of lazy properties that return a single optional value. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class $LazyOption<PartialT, ResolvedT> {
  readonly partial: Maybe<PartialT>;
  private readonly resolver: (
    partial: PartialT,
    options?: { preferredLanguages?: readonly string[] },
  ) => Promise<Either<Error, ResolvedT>>;

  constructor({
    partial,
    resolver,
  }: {
    partial: Maybe<PartialT>;
    resolver: (
      partial: PartialT,
      options?: { preferredLanguages?: readonly string[] },
    ) => Promise<Either<Error, ResolvedT>>;
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  async resolve(options?: {
    preferredLanguages?: readonly string[];
  }): Promise<Either<Error, Maybe<ResolvedT>>> {
    if (this.partial.isNothing()) {
      return Right(Maybe.empty());
    }
    return (await this.resolver(this.partial.unsafeCoerce(), options)).map(
      Maybe.of,
    );
  }
}

/**
 * Type of lazy properties that return a set of values. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class $LazySet<PartialT, ResolvedT> {
  readonly partials: readonly PartialT[];
  private readonly resolver: (
    partials: readonly PartialT[],
    options?: { preferredLanguages?: readonly string[] },
  ) => Promise<Either<Error, readonly ResolvedT[]>>;

  constructor({
    partials,
    resolver,
  }: {
    partials: readonly PartialT[];
    resolver: (
      partials: readonly PartialT[],
      options?: { preferredLanguages?: readonly string[] },
    ) => Promise<Either<Error, readonly ResolvedT[]>>;
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
  }): Promise<Either<Error, readonly ResolvedT[]>> {
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

    return await this.resolver(this.partials.slice(offset, offset + limit), {
      preferredLanguages: options?.preferredLanguages,
    });
  }
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

function $maybeFromRdfResourceValues<ItemT, ItemSchemaT>(
  itemFromRdfResourceValues: $FromRdfResourceValuesFunction<ItemT, ItemSchemaT>,
): $FromRdfResourceValuesFunction<Maybe<ItemT>, $MaybeSchema<ItemSchemaT>> {
  return (values, options) =>
    itemFromRdfResourceValues(values, {
      ...options,
      schema: options.schema.itemType,
    }).map((values) =>
      values.length > 0
        ? values.map((value) => Maybe.of(value))
        : Resource.Values.fromValue<Maybe<ItemT>>({
            focusResource: options.focusResource,
            propertyPath: options.propertyPath,
            value: Maybe.empty(),
          }),
    );
}

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

interface $NumericSchema<T> {
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly T[];
  readonly kind: "BigDecimal" | "BigInt" | "Float" | "Int";
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
    $PropertyPath,
    object
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

  export const schema: Readonly<object> = {};

  export type Schema = typeof schema;

  export const toRdfResource: $ToRdfResourceFunction<$PropertyPath> =
    RdfxResourcePropertyPath.toResource;

  export const $toString = RdfxResourcePropertyPath.toString;
}

function $rdfResourceIdentifierValues(resource: Resource): Resource.Values {
  return new Resource.Value({
    dataFactory: dataFactory,
    focusResource: resource,
    propertyPath: $RdfVocabularies.rdf.subject,
    term: resource.identifier,
  }).toValues();
}

namespace $RdfVocabularies {
  export const rdf = {
    first: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    ),
    langString: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
    ),
    nil: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    ),
    rest: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    ),
    subject: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
    ),
    type: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    ),
  };

  export const rdfs = {
    subClassOf: dataFactory.namedNode(
      "http://www.w3.org/2000/01/rdf-schema#subClassOf",
    ),
  };

  export const xsd = {
    boolean: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean"),
    byte: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#byte"),
    date: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#date"),
    dateTime: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#dateTime",
    ),
    decimal: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#decimal"),
    double: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#double"),
    float: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#float"),
    int: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#int"),
    integer: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer"),
    long: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#long"),
    negativeInteger: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#negativeInteger",
    ),
    nonNegativeInteger: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
    ),
    nonPositiveInteger: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
    ),
    positiveInteger: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#positiveInteger",
    ),
    short: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#short"),
    string: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#string"),
    unsignedByte: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedByte",
    ),
    unsignedInt: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedInt",
    ),
    unsignedLong: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedLong",
    ),
    unsignedShort: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedShort",
    ),
  };
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

function $setFromRdfResourceValues<ItemT, ItemSchemaT>(
  itemFromRdfResourceValues: $FromRdfResourceValuesFunction<ItemT, ItemSchemaT>,
): $FromRdfResourceValuesFunction<
  readonly ItemT[],
  $CollectionSchema<ItemSchemaT>
> {
  return (values, options) =>
    itemFromRdfResourceValues(values, {
      ...options,
      schema: options.schema.itemType,
    })
      .map((values) => values.toArray())
      .map((valuesArray) =>
        Resource.Values.fromValue({
          focusResource: options.focusResource,
          propertyPath: options.propertyPath,
          value: valuesArray,
        }),
      );
}

function $shaclPropertyFromRdf<TypeT, TypeSchemaT>({
  focusResource,
  graph,
  propertySchema,
  typeFromRdfResourceValues,
  ...otherParameters
}: {
  propertySchema: $ShaclPropertySchema<TypeSchemaT>;
  typeFromRdfResourceValues: $FromRdfResourceValuesFunction<TypeT, TypeSchemaT>;
} & Omit<
  Parameters<$FromRdfResourceValuesFunction<TypeT, TypeSchemaT>>[1],
  "propertyPath" | "schema"
>): Either<Error, TypeT> {
  return typeFromRdfResourceValues(
    focusResource.values(propertySchema.path, { graph, unique: true }),
    {
      ...otherParameters,
      focusResource,
      graph,
      propertyPath: propertySchema.path,
      schema: propertySchema.type,
    },
  ).chain((values) => values.head());
}

export interface $ShaclPropertySchema<TypeSchemaT> {
  readonly kind: "Shacl";
  readonly path: $PropertyPath;
  readonly type: TypeSchemaT;
}

interface $StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}

function $stringFromRdfResourceValues<StringT extends string>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<StringT, $StringSchema<StringT>>
  >[1],
): Either<Error, Resource.Values<StringT>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toString(options.schema.in)
        : (value.toString() as Either<Error, StringT>),
    ),
  );
}

interface $StringSchema<StringT extends string> {
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly StringT[];
  readonly languageIn?: readonly string[];
  readonly kind: "String";
}

const $termLikeFromRdfResourceValues: $FromRdfResourceValuesFunction<
  Resource.Value,
  {
    readonly hasValues?: readonly (Literal | NamedNode)[];
    readonly languageIn?: readonly string[];
  }
> = (values, { preferredLanguages, schema: { hasValues, languageIn } }) => {
  let chain = Either.of<Error, Resource.Values>(values);

  if (hasValues && hasValues.length > 0) {
    chain = chain.chain((values) =>
      Either.sequence(
        hasValues.map((hasValue) =>
          values.find((value) => value.term.equals(hasValue)),
        ),
      ).map(() => values),
    );
  }

  if (languageIn && languageIn.length > 0) {
    chain = chain.chain((values) =>
      values.chainMap((value) =>
        value.toLiteral().chain((literal) =>
          languageIn.includes(literal.language)
            ? Right(value)
            : Left(
                new Resource.MistypedValueError({
                  actualValue: literal,
                  expectedValueType: "Literal",
                  focusResource: value.focusResource,
                  propertyPath: value.propertyPath,
                }),
              ),
        ),
      ),
    );
  }

  if (preferredLanguages && preferredLanguages.length > 0) {
    chain = chain.chain((values) => {
      const literals: Literal[] = [];
      const literalValues: Resource.Value[] = [];
      const nonLiteralValues: Resource.Value[] = [];

      for (const value of values) {
        const term = value.toTerm().unsafeCoerce();
        if (term.termType === "Literal") {
          literals.push(term);
          literalValues.push(value);
        } else {
          nonLiteralValues.push(value);
        }
      }

      // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
      // Within a preferredLanguage the literals may be in any order.
      const preferredLanguageLiteralValues: Resource.Value[] = [];
      for (const preferredLanguage of preferredLanguages) {
        for (let literalI = 0; literalI < literals.length; literalI++) {
          if (literals[literalI].language === preferredLanguage) {
            preferredLanguageLiteralValues.push(literalValues[literalI]);
          }
        }
      }

      return Right(
        Resource.Values.fromArray({
          focusResource: values.focusResource,
          propertyPath: values.propertyPath,
          values: nonLiteralValues.concat(preferredLanguageLiteralValues),
        }),
      );
    });
  }

  return chain;
};

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
export type $DefaultPartial = {
  readonly $identifier: () => $DefaultPartial.Identifier;

  readonly $type: "DefaultPartial";
};

export namespace $DefaultPartial {
  export const create: (parameters?: {
    readonly $identifier?:
      | (() => $DefaultPartial.Identifier)
      | BlankNode
      | NamedNode
      | string;
  }) => Either<Error, $DefaultPartial> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
    })
      .map((properties) => ({
        ...properties,
        $type: "DefaultPartial" as const,
      }))
      .map((object) =>
        $monkeyPatchObject(object, { $toString: $DefaultPartial.$toString }),
      );

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => $DefaultPartial.Identifier)
      | BlankNode
      | NamedNode
      | string;
  }): $DefaultPartial {
    return create(parameters).unsafeCoerce();
  }

  export type Filter = { readonly $identifier?: $IdentifierFilter };

  export const filter: (
    filter: $DefaultPartial.Filter,
    value: $DefaultPartial,
  ) => boolean = (filter, value) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    return true;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<$DefaultPartial> = (
    resource,
    options,
  ) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          schema: $DefaultPartial.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
    }).chain((properties) => $DefaultPartial.create(properties));

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    $DefaultPartial,
    $DefaultPartial.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
    },
  } as const;

  export type Schema = typeof schema;

  export const _toRdfResource: $_ToRdfResourceFunction<
    $DefaultPartial.Identifier,
    $DefaultPartial
  > = (parameters) => {
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export const $toString: (_defaultPartial: $DefaultPartial) => string = (
    _defaultPartial,
  ) => `$DefaultPartial(${JSON.stringify(toStringRecord(_defaultPartial))})`;

  export const toStringRecord: (
    _defaultPartial: $DefaultPartial,
  ) => Record<string, string> = (_defaultPartial) =>
    $compactRecord({ $identifier: _defaultPartial.$identifier().toString() });
}
export type DiscriminatedUnionMember1 = {
  readonly $identifier: () => DiscriminatedUnionMember1.Identifier;

  readonly $type: "DiscriminatedUnionMember1";

  /**
   * Optional number property
   */
  readonly optionalNumberProperty: Maybe<number>;
};

export namespace DiscriminatedUnionMember1 {
  export const create: (parameters?: {
    readonly $identifier?:
      | (() => DiscriminatedUnionMember1.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalNumberProperty?: number | Maybe<number>;
  }) => Either<Error, DiscriminatedUnionMember1> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
      optionalNumberProperty: $convertToMaybe($identityConversionFunction)(
        parameters?.optionalNumberProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          DiscriminatedUnionMember1.schema.properties.optionalNumberProperty
            .type,
          value,
        ),
      ),
    })
      .map((properties) => ({
        ...properties,
        $type: "DiscriminatedUnionMember1" as const,
      }))
      .map((object) =>
        $monkeyPatchObject(object, {
          $toString: DiscriminatedUnionMember1.$toString,
        }),
      );

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => DiscriminatedUnionMember1.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalNumberProperty?: number | Maybe<number>;
  }): DiscriminatedUnionMember1 {
    return create(parameters).unsafeCoerce();
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalNumberProperty?: $MaybeFilter<$NumericFilter<number>>;
  };

  export const filter: (
    filter: DiscriminatedUnionMember1.Filter,
    value: DiscriminatedUnionMember1,
  ) => boolean = (filter, value) => {
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
  };

  export const GraphQL = new GraphQLObjectType<
    DiscriminatedUnionMember1,
    { objectSet: $ObjectSet }
  >({
    description: undefined,
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) => NTriplesTerm.stringify(source.$identifier()),
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
    name: "DiscriminatedUnionMember1",
  });

  export const _fromRdfResource: $_FromRdfResourceFunction<
    DiscriminatedUnionMember1
  > = (resource, options) =>
    (!options.ignoreRdfType
      ? $ensureRdfResourceType(
          resource,
          [DiscriminatedUnionMember1.schema.fromRdfType],
          { graph: options.graph },
        )
      : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      $sequenceRecord({
        $identifier: $identifierFromRdfResourceValues(
          $rdfResourceIdentifierValues(resource),
          {
            ...options,
            focusResource: resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            schema:
              DiscriminatedUnionMember1.schema.properties.$identifier.type,
          },
        ).chain((values) => values.head()),
        optionalNumberProperty: $shaclPropertyFromRdf<
          Maybe<number>,
          $MaybeSchema<$NumericSchema<number>>
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema:
            DiscriminatedUnionMember1.schema.properties.optionalNumberProperty,
          typeFromRdfResourceValues: $maybeFromRdfResourceValues<
            number,
            $NumericSchema<number>
          >($floatFromRdfResourceValues<number>),
        }),
      }).chain((properties) => DiscriminatedUnionMember1.create(properties)),
    );

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    DiscriminatedUnionMember1,
    DiscriminatedUnionMember1.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function isDiscriminatedUnionMember1(
    object: $Object,
  ): object is DiscriminatedUnionMember1 {
    return object.$type === "DiscriminatedUnionMember1";
  }

  export const schema = {
    fromRdfType: dataFactory.namedNode(
      "http://example.com/DiscriminatedUnionMember1",
    ),
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
    toRdfTypes: [
      dataFactory.namedNode("http://example.com/DiscriminatedUnionMember1"),
    ],
  } as const;

  export type Schema = typeof schema;

  export const _toRdfResource: $_ToRdfResourceFunction<
    DiscriminatedUnionMember1.Identifier,
    DiscriminatedUnionMember1
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        DiscriminatedUnionMember1.schema.toRdfTypes,
        parameters.graph,
      );
    }
    parameters.resource.add(
      DiscriminatedUnionMember1.schema.properties.optionalNumberProperty.path,
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

  export const $toString: (
    _discriminatedUnionMember1: DiscriminatedUnionMember1,
  ) => string = (_discriminatedUnionMember1) =>
    `DiscriminatedUnionMember1(${JSON.stringify(toStringRecord(_discriminatedUnionMember1))})`;

  export const toStringRecord: (
    _discriminatedUnionMember1: DiscriminatedUnionMember1,
  ) => Record<string, string> = (_discriminatedUnionMember1) =>
    $compactRecord({
      $identifier: _discriminatedUnionMember1.$identifier().toString(),
    });
}
export type DiscriminatedUnionMember2 = {
  readonly $identifier: () => DiscriminatedUnionMember2.Identifier;

  readonly $type: "DiscriminatedUnionMember2";

  /**
   * Optional string property
   */
  readonly optionalStringProperty: Maybe<string>;
};

export namespace DiscriminatedUnionMember2 {
  export const create: (parameters?: {
    readonly $identifier?:
      | (() => DiscriminatedUnionMember2.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalStringProperty?: string | Maybe<string>;
  }) => Either<Error, DiscriminatedUnionMember2> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters?.optionalStringProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          DiscriminatedUnionMember2.schema.properties.optionalStringProperty
            .type,
          value,
        ),
      ),
    })
      .map((properties) => ({
        ...properties,
        $type: "DiscriminatedUnionMember2" as const,
      }))
      .map((object) =>
        $monkeyPatchObject(object, {
          $toString: DiscriminatedUnionMember2.$toString,
        }),
      );

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => DiscriminatedUnionMember2.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalStringProperty?: string | Maybe<string>;
  }): DiscriminatedUnionMember2 {
    return create(parameters).unsafeCoerce();
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
  };

  export const filter: (
    filter: DiscriminatedUnionMember2.Filter,
    value: DiscriminatedUnionMember2,
  ) => boolean = (filter, value) => {
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
  };

  export const GraphQL = new GraphQLObjectType<
    DiscriminatedUnionMember2,
    { objectSet: $ObjectSet }
  >({
    description: undefined,
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) => NTriplesTerm.stringify(source.$identifier()),
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
    name: "DiscriminatedUnionMember2",
  });

  export const _fromRdfResource: $_FromRdfResourceFunction<
    DiscriminatedUnionMember2
  > = (resource, options) =>
    (!options.ignoreRdfType
      ? $ensureRdfResourceType(
          resource,
          [DiscriminatedUnionMember2.schema.fromRdfType],
          { graph: options.graph },
        )
      : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      $sequenceRecord({
        $identifier: $identifierFromRdfResourceValues(
          $rdfResourceIdentifierValues(resource),
          {
            ...options,
            focusResource: resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            schema:
              DiscriminatedUnionMember2.schema.properties.$identifier.type,
          },
        ).chain((values) => values.head()),
        optionalStringProperty: $shaclPropertyFromRdf<
          Maybe<string>,
          $MaybeSchema<$StringSchema<string>>
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema:
            DiscriminatedUnionMember2.schema.properties.optionalStringProperty,
          typeFromRdfResourceValues: $maybeFromRdfResourceValues<
            string,
            $StringSchema<string>
          >($stringFromRdfResourceValues<string>),
        }),
      }).chain((properties) => DiscriminatedUnionMember2.create(properties)),
    );

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    DiscriminatedUnionMember2,
    DiscriminatedUnionMember2.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function isDiscriminatedUnionMember2(
    object: $Object,
  ): object is DiscriminatedUnionMember2 {
    return object.$type === "DiscriminatedUnionMember2";
  }

  export const schema = {
    fromRdfType: dataFactory.namedNode(
      "http://example.com/DiscriminatedUnionMember2",
    ),
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
    toRdfTypes: [
      dataFactory.namedNode("http://example.com/DiscriminatedUnionMember2"),
    ],
  } as const;

  export type Schema = typeof schema;

  export const _toRdfResource: $_ToRdfResourceFunction<
    DiscriminatedUnionMember2.Identifier,
    DiscriminatedUnionMember2
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        DiscriminatedUnionMember2.schema.toRdfTypes,
        parameters.graph,
      );
    }
    parameters.resource.add(
      DiscriminatedUnionMember2.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export const $toString: (
    _discriminatedUnionMember2: DiscriminatedUnionMember2,
  ) => string = (_discriminatedUnionMember2) =>
    `DiscriminatedUnionMember2(${JSON.stringify(toStringRecord(_discriminatedUnionMember2))})`;

  export const toStringRecord: (
    _discriminatedUnionMember2: DiscriminatedUnionMember2,
  ) => Record<string, string> = (_discriminatedUnionMember2) =>
    $compactRecord({
      $identifier: _discriminatedUnionMember2.$identifier().toString(),
    });
}
export type LazyObject = {
  readonly $identifier: () => LazyObject.Identifier;

  readonly $type: "LazyObject";

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
};

export namespace LazyObject {
  export const create: (parameters: {
    readonly $identifier?:
      | (() => LazyObject.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalNumberProperty?: number | Maybe<number>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  }) => Either<Error, LazyObject> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters.$identifier),
      optionalNumberProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalNumberProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          DiscriminatedUnionMember1.schema.properties.optionalNumberProperty
            .type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          DiscriminatedUnionMember2.schema.properties.optionalStringProperty
            .type,
          value,
        ),
      ),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    })
      .map((properties) => ({ ...properties, $type: "LazyObject" as const }))
      .map((object) =>
        $monkeyPatchObject(object, { $toString: LazyObject.$toString }),
      );

  export function createUnsafe(parameters: {
    readonly $identifier?:
      | (() => LazyObject.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly optionalNumberProperty?: number | Maybe<number>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  }): LazyObject {
    return create(parameters).unsafeCoerce();
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalNumberProperty?: $MaybeFilter<$NumericFilter<number>>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredStringProperty?: $StringFilter;
  };

  export const filter: (
    filter: LazyObject.Filter,
    value: LazyObject,
  ) => boolean = (filter, value) => {
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
  };

  export const GraphQL = new GraphQLObjectType<
    LazyObject,
    { objectSet: $ObjectSet }
  >({
    description: undefined,
    fields: () => ({
      _identifier: {
        args: undefined,
        description: undefined,
        name: "_identifier",
        resolve: (source) => NTriplesTerm.stringify(source.$identifier()),
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
    name: "LazyObject",
  });

  export const _fromRdfResource: $_FromRdfResourceFunction<LazyObject> = (
    resource,
    options,
  ) =>
    (!options.ignoreRdfType
      ? $ensureRdfResourceType(resource, [LazyObject.schema.fromRdfType], {
          graph: options.graph,
        })
      : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      $sequenceRecord({
        $identifier: $identifierFromRdfResourceValues(
          $rdfResourceIdentifierValues(resource),
          {
            ...options,
            focusResource: resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            schema: LazyObject.schema.properties.$identifier.type,
          },
        ).chain((values) => values.head()),
        optionalNumberProperty: $shaclPropertyFromRdf<
          Maybe<number>,
          $MaybeSchema<$NumericSchema<number>>
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema:
            DiscriminatedUnionMember1.schema.properties.optionalNumberProperty,
          typeFromRdfResourceValues: $maybeFromRdfResourceValues<
            number,
            $NumericSchema<number>
          >($floatFromRdfResourceValues<number>),
        }),
        optionalStringProperty: $shaclPropertyFromRdf<
          Maybe<string>,
          $MaybeSchema<$StringSchema<string>>
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema:
            DiscriminatedUnionMember2.schema.properties.optionalStringProperty,
          typeFromRdfResourceValues: $maybeFromRdfResourceValues<
            string,
            $StringSchema<string>
          >($stringFromRdfResourceValues<string>),
        }),
        requiredStringProperty: $shaclPropertyFromRdf<
          string,
          $StringSchema<string>
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema: LazyObject.schema.properties.requiredStringProperty,
          typeFromRdfResourceValues: $stringFromRdfResourceValues<string>,
        }),
      }).chain((properties) => LazyObject.create(properties)),
    );

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    LazyObject,
    LazyObject.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function isLazyObject(object: $Object): object is LazyObject {
    return object.$type === "LazyObject";
  }

  export const schema = {
    fromRdfType: dataFactory.namedNode("http://example.com/LazyObject"),
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
    toRdfTypes: [dataFactory.namedNode("http://example.com/LazyObject")],
  } as const;

  export type Schema = typeof schema;

  export const _toRdfResource: $_ToRdfResourceFunction<
    LazyObject.Identifier,
    LazyObject
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        LazyObject.schema.toRdfTypes,
        parameters.graph,
      );
    }
    parameters.resource.add(
      DiscriminatedUnionMember1.schema.properties.optionalNumberProperty.path,
      parameters.object.optionalNumberProperty
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      DiscriminatedUnionMember2.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      LazyObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export const $toString: (_lazyObject: LazyObject) => string = (_lazyObject) =>
    `LazyObject(${JSON.stringify(toStringRecord(_lazyObject))})`;

  export const toStringRecord: (
    _lazyObject: LazyObject,
  ) => Record<string, string> = (_lazyObject) =>
    $compactRecord({ $identifier: _lazyObject.$identifier().toString() });
}
export type RootObject = {
  readonly $identifier: () => RootObject.Identifier;

  readonly $type: "RootObject";

  /**
   * Lazy object set property
   */
  readonly lazyObjectSetProperty: $LazySet<$DefaultPartial, LazyObject>;

  /**
   * Optional lazy object property
   */
  readonly optionalLazyProperty: $LazyOption<$DefaultPartial, LazyObject>;

  /**
   * Optional object property with 'anonymous' object
   */
  readonly optionalObjectProperty: Maybe<{
    readonly $identifier: () => BlankNode | NamedNode;

    /**
     * Required string property
     */
    readonly requiredStringProperty: string;
  }>;

  /**
   * Optional string property
   */
  readonly optionalStringProperty: Maybe<string>;

  /**
   * Required string property
   */
  readonly requiredStringProperty: string;
};

export namespace RootObject {
  export const create: (parameters: {
    readonly $identifier: (() => RootObject.Identifier) | string | NamedNode;
    readonly lazyObjectSetProperty?:
      | $LazySet<$DefaultPartial, LazyObject>
      | readonly LazyObject[];
    readonly optionalLazyProperty?:
      | $LazyOption<$DefaultPartial, LazyObject>
      | Maybe<LazyObject>
      | LazyObject;
    readonly optionalObjectProperty?:
      | {
          readonly $identifier?:
            | (() => BlankNode | NamedNode)
            | BlankNode
            | NamedNode
            | string;
          readonly requiredStringProperty: string;
        }
      | Maybe<{
          readonly $identifier: () => BlankNode | NamedNode;

          /**
           * Required string property
           */
          readonly requiredStringProperty: string;
        }>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  }) => Either<Error, RootObject> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIriIdentifierProperty<string>(
        parameters.$identifier,
      ),
      lazyObjectSetProperty: $convertToLazySet<$DefaultPartial, LazyObject>(
        $DefaultPartial.createUnsafe,
      )(parameters.lazyObjectSetProperty),
      optionalLazyProperty: $convertToLazyOption<$DefaultPartial, LazyObject>(
        $DefaultPartial.createUnsafe,
      )(parameters.optionalLazyProperty),
      optionalObjectProperty: $convertToMaybe(
        (parameters: {
          readonly $identifier?:
            | (() => BlankNode | NamedNode)
            | BlankNode
            | NamedNode
            | string;
          readonly requiredStringProperty: string;
        }) =>
          $sequenceRecord({
            $identifier: $convertToIdentifierProperty(parameters.$identifier),
            requiredStringProperty: Either.of(
              parameters.requiredStringProperty,
            ),
          }).map((object) =>
            $monkeyPatchObject(object, {
              $toString: (_object) =>
                JSON.stringify(
                  $compactRecord({
                    $identifier: _object.$identifier().toString(),
                  }),
                ),
            }),
          ),
      )(parameters.optionalObjectProperty).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          RootObject.schema.properties.optionalObjectProperty.type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          DiscriminatedUnionMember2.schema.properties.optionalStringProperty
            .type,
          value,
        ),
      ),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    })
      .map((properties) => ({ ...properties, $type: "RootObject" as const }))
      .map((object) =>
        $monkeyPatchObject(object, { $toString: RootObject.$toString }),
      );

  export function createUnsafe(parameters: {
    readonly $identifier: (() => RootObject.Identifier) | string | NamedNode;
    readonly lazyObjectSetProperty?:
      | $LazySet<$DefaultPartial, LazyObject>
      | readonly LazyObject[];
    readonly optionalLazyProperty?:
      | $LazyOption<$DefaultPartial, LazyObject>
      | Maybe<LazyObject>
      | LazyObject;
    readonly optionalObjectProperty?:
      | {
          readonly $identifier?:
            | (() => BlankNode | NamedNode)
            | BlankNode
            | NamedNode
            | string;
          readonly requiredStringProperty: string;
        }
      | Maybe<{
          readonly $identifier: () => BlankNode | NamedNode;

          /**
           * Required string property
           */
          readonly requiredStringProperty: string;
        }>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  }): RootObject {
    return create(parameters).unsafeCoerce();
  }

  export type Filter = {
    readonly $identifier?: $IriFilter;
    readonly lazyObjectSetProperty?: $CollectionFilter<$DefaultPartial.Filter>;
    readonly optionalLazyProperty?: $MaybeFilter<$DefaultPartial.Filter>;
    readonly optionalObjectProperty?: $MaybeFilter<{
      readonly $identifier?: $IdentifierFilter;
      readonly requiredStringProperty?: $StringFilter;
    }>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredStringProperty?: $StringFilter;
  };

  export const filter: (
    filter: RootObject.Filter,
    value: RootObject,
  ) => boolean = (filter, value) => {
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
        value: $LazySet<$DefaultPartial, LazyObject>,
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
      filter.optionalLazyProperty !== undefined &&
      !((
        filter: $MaybeFilter<$DefaultPartial.Filter>,
        value: $LazyOption<$DefaultPartial, LazyObject>,
      ) =>
        $filterMaybe<$DefaultPartial, $DefaultPartial.Filter>(
          $DefaultPartial.filter,
        )(filter, value.partial))(
        filter.optionalLazyProperty,
        value.optionalLazyProperty,
      )
    ) {
      return false;
    }
    if (
      filter.optionalObjectProperty !== undefined &&
      !$filterMaybe<
        {
          readonly $identifier: () => BlankNode | NamedNode;

          /**
           * Required string property
           */
          readonly requiredStringProperty: string;
        },
        {
          readonly $identifier?: $IdentifierFilter;
          readonly requiredStringProperty?: $StringFilter;
        }
      >((filter, value) => {
        if (
          filter.$identifier !== undefined &&
          !$filterIdentifier(filter.$identifier, value.$identifier())
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
      })(filter.optionalObjectProperty, value.optionalObjectProperty)
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
  };

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
        resolve: (source) => NTriplesTerm.stringify(source.$identifier()),
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
          new GraphQLList(new GraphQLNonNull(LazyObject.GraphQL)),
        ),
      },
      optionalLazyProperty: {
        args: undefined,
        description: '"Optional lazy object property"',
        name: "optionalLazyProperty",
        resolve: (source, _args) =>
          source.optionalLazyProperty
            .resolve()
            .then((either) => either.unsafeCoerce().extractNullable()),
        type: new GraphQLNonNull(LazyObject.GraphQL),
      },
      optionalObjectProperty: {
        args: undefined,
        description: "\"Optional object property with 'anonymous' object\"",
        name: "optionalObjectProperty",
        resolve: (source, _args) =>
          source.optionalObjectProperty.extractNullable(),
        type: new GraphQLNonNull(
          new GraphQLObjectType<
            {
              readonly $identifier: () => BlankNode | NamedNode;

              /**
               * Required string property
               */
              readonly requiredStringProperty: string;
            },
            { objectSet: $ObjectSet }
          >({
            description: undefined,
            fields: () => ({
              _identifier: {
                args: undefined,
                description: undefined,
                name: "_identifier",
                resolve: (source) =>
                  NTriplesTerm.stringify(source.$identifier()),
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
            name: "df_0_5",
          }),
        ),
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

  export const _fromRdfResource: $_FromRdfResourceFunction<RootObject> = (
    resource,
    options,
  ) =>
    (!options.ignoreRdfType
      ? $ensureRdfResourceType(resource, [RootObject.schema.fromRdfType], {
          graph: options.graph,
        })
      : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      $sequenceRecord({
        $identifier: $iriFromRdfResourceValues<string>(
          $rdfResourceIdentifierValues(resource),
          {
            ...options,
            focusResource: resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            schema: RootObject.schema.properties.$identifier.type,
          },
        ).chain((values) => values.head()),
        lazyObjectSetProperty: $shaclPropertyFromRdf<
          $LazySet<$DefaultPartial, LazyObject>,
          {
            kind: "LazySet";
            partialType: $CollectionSchema<$DefaultPartial.Schema>;
          }
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema: RootObject.schema.properties.lazyObjectSetProperty,
          typeFromRdfResourceValues: ((
            values,
            { objectSet, schema, ...otherOptions },
          ) =>
            $setFromRdfResourceValues<$DefaultPartial, $DefaultPartial.Schema>(
              $DefaultPartial.fromRdfResourceValues,
            )(values, {
              ...otherOptions,
              objectSet,
              schema: schema.partialType,
            }).map((values) =>
              values.map(
                (partials) =>
                  new $LazySet<$DefaultPartial, LazyObject>({
                    partials,
                    resolver: (partials, options) =>
                      objectSet.lazyObjects({
                        identifiers: partials.map((partial) =>
                          partial.$identifier(),
                        ),
                        ...options,
                      }),
                  }),
              ),
            )) satisfies $FromRdfResourceValuesFunction<
            $LazySet<$DefaultPartial, LazyObject>,
            {
              kind: "LazySet";
              partialType: $CollectionSchema<$DefaultPartial.Schema>;
            }
          >,
        }),
        optionalLazyProperty: $shaclPropertyFromRdf<
          $LazyOption<$DefaultPartial, LazyObject>,
          {
            kind: "LazyOption";
            partialType: $MaybeSchema<$DefaultPartial.Schema>;
          }
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema: RootObject.schema.properties.optionalLazyProperty,
          typeFromRdfResourceValues: ((
            values,
            { objectSet, schema, ...otherOptions },
          ) =>
            $maybeFromRdfResourceValues<
              $DefaultPartial,
              $DefaultPartial.Schema
            >($DefaultPartial.fromRdfResourceValues)(values, {
              ...otherOptions,
              objectSet,
              schema: schema.partialType,
            }).map((values) =>
              values.map(
                (partial) =>
                  new $LazyOption<$DefaultPartial, LazyObject>({
                    partial,
                    resolver: (partial, options) =>
                      objectSet.lazyObject(partial.$identifier(), options),
                  }),
              ),
            )) satisfies $FromRdfResourceValuesFunction<
            $LazyOption<$DefaultPartial, LazyObject>,
            {
              kind: "LazyOption";
              partialType: $MaybeSchema<$DefaultPartial.Schema>;
            }
          >,
        }),
        optionalObjectProperty: $shaclPropertyFromRdf<
          Maybe<{
            readonly $identifier: () => BlankNode | NamedNode;

            /**
             * Required string property
             */
            readonly requiredStringProperty: string;
          }>,
          $MaybeSchema<{
            properties: {
              $identifier: {
                readonly kind: "Identifier";
                readonly type: $IdentifierSchema;
              };
              requiredStringProperty: {
                readonly kind: "Shacl";
                readonly path: $PropertyPath;
                readonly type: $StringSchema<string>;
              };
            };
          }>
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema: RootObject.schema.properties.optionalObjectProperty,
          typeFromRdfResourceValues: $maybeFromRdfResourceValues<
            {
              readonly $identifier: () => BlankNode | NamedNode;

              /**
               * Required string property
               */
              readonly requiredStringProperty: string;
            },
            {
              properties: {
                $identifier: {
                  readonly kind: "Identifier";
                  readonly type: $IdentifierSchema;
                };
                requiredStringProperty: {
                  readonly kind: "Shacl";
                  readonly path: $PropertyPath;
                  readonly type: $StringSchema<string>;
                };
              };
            }
          >((values, options) =>
            values.chainMap((value) =>
              value.toResource().chain((resource) =>
                ((resource, options) =>
                  $sequenceRecord({
                    $identifier: $identifierFromRdfResourceValues(
                      $rdfResourceIdentifierValues(resource),
                      {
                        ...options,
                        focusResource: resource,
                        propertyPath: $RdfVocabularies.rdf.subject,
                        schema: { kind: "Identifier" as const },
                      },
                    ).chain((values) => values.head()),
                    requiredStringProperty: $shaclPropertyFromRdf<
                      string,
                      $StringSchema<string>
                    >({
                      ...options,
                      focusResource: resource,
                      ignoreRdfType: true,
                      propertySchema:
                        LazyObject.schema.properties.requiredStringProperty,
                      typeFromRdfResourceValues:
                        $stringFromRdfResourceValues<string>,
                    }),
                  }).chain((properties) =>
                    ((parameters: {
                      readonly $identifier?:
                        | (() => BlankNode | NamedNode)
                        | BlankNode
                        | NamedNode
                        | string;
                      readonly requiredStringProperty: string;
                    }) =>
                      $sequenceRecord({
                        $identifier: $convertToIdentifierProperty(
                          parameters.$identifier,
                        ),
                        requiredStringProperty: Either.of(
                          parameters.requiredStringProperty,
                        ),
                      }).map((object) =>
                        $monkeyPatchObject(object, {
                          $toString: (_object) =>
                            JSON.stringify(
                              $compactRecord({
                                $identifier: _object.$identifier().toString(),
                              }),
                            ),
                        }),
                      ))(properties),
                  ))(resource, options),
              ),
            ),
          ),
        }),
        optionalStringProperty: $shaclPropertyFromRdf<
          Maybe<string>,
          $MaybeSchema<$StringSchema<string>>
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema:
            DiscriminatedUnionMember2.schema.properties.optionalStringProperty,
          typeFromRdfResourceValues: $maybeFromRdfResourceValues<
            string,
            $StringSchema<string>
          >($stringFromRdfResourceValues<string>),
        }),
        requiredStringProperty: $shaclPropertyFromRdf<
          string,
          $StringSchema<string>
        >({
          ...options,
          focusResource: resource,
          ignoreRdfType: true,
          propertySchema: LazyObject.schema.properties.requiredStringProperty,
          typeFromRdfResourceValues: $stringFromRdfResourceValues<string>,
        }),
      }).chain((properties) => RootObject.create(properties)),
    );

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    RootObject,
    RootObject.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

  export type Identifier = NamedNode;

  export namespace Identifier {
    export const parse = $parseIri;
    export const stringify = NTriplesTerm.stringify;
  }

  export function isRootObject(object: $Object): object is RootObject {
    return object.$type === "RootObject";
  }

  export const schema = {
    fromRdfType: dataFactory.namedNode("http://example.com/RootObject"),
    properties: {
      $identifier: { kind: "Identifier", type: { kind: "Iri" as const } },
      lazyObjectSetProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://example.com/lazyObjectSetProperty"),
        get type() {
          return {
            kind: "LazySet" as const,
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
      optionalLazyProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://example.com/optionalLazyProperty"),
        get type() {
          return {
            kind: "LazyOption" as const,
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
        type: {
          kind: "Option" as const,
          itemType: {
            properties: {
              $identifier: {
                kind: "Identifier",
                type: { kind: "Identifier" as const },
              },
              requiredStringProperty: {
                kind: "Shacl",
                path: dataFactory.namedNode(
                  "http://example.com/requiredStringProperty",
                ),
                type: { kind: "String" as const },
              },
            },
          } as const,
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
    toRdfTypes: [dataFactory.namedNode("http://example.com/RootObject")],
  } as const;

  export type Schema = typeof schema;

  export const _toRdfResource: $_ToRdfResourceFunction<
    RootObject.Identifier,
    RootObject
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        RootObject.schema.toRdfTypes,
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
      RootObject.schema.properties.optionalLazyProperty.path,
      parameters.object.optionalLazyProperty.partial
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
        $wrap_ToRdfResourceFunction<
          BlankNode | NamedNode,
          {
            readonly $identifier: () => BlankNode | NamedNode;

            /**
             * Required string property
             */
            readonly requiredStringProperty: string;
          }
        >((parameters) => {
          parameters.resource.add(
            LazyObject.schema.properties.requiredStringProperty.path,
            [$literalFactory.string(parameters.object.requiredStringProperty)],
            parameters.graph,
          );
          return parameters.resource;
        })(value, {
          graph: parameters.graph,
          resourceSet: parameters.resourceSet,
        }).identifier,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      DiscriminatedUnionMember2.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      LazyObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export const $toString: (_rootObject: RootObject) => string = (_rootObject) =>
    `RootObject(${JSON.stringify(toStringRecord(_rootObject))})`;

  export const toStringRecord: (
    _rootObject: RootObject,
  ) => Record<string, string> = (_rootObject) =>
    $compactRecord({ $identifier: _rootObject.$identifier().toString() });
}
export type DiscriminatedUnion =
  | DiscriminatedUnionMember1
  | DiscriminatedUnionMember2;

export namespace DiscriminatedUnion {
  export const $toString = (value: DiscriminatedUnion): string => {
    if (DiscriminatedUnionMember1.isDiscriminatedUnionMember1(value)) {
      return DiscriminatedUnionMember1.$toString(value);
    }
    if (DiscriminatedUnionMember2.isDiscriminatedUnionMember2(value)) {
      return DiscriminatedUnionMember2.$toString(value);
    }

    throw new Error("unable to serialize to string");
  };

  export const filter = (
    filter: DiscriminatedUnion.Filter,
    value: DiscriminatedUnion,
  ) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.on?.["DiscriminatedUnionMember1"] !== undefined &&
      DiscriminatedUnionMember1.isDiscriminatedUnionMember1(value)
    ) {
      if (
        !DiscriminatedUnionMember1.filter(
          filter.on["DiscriminatedUnionMember1"],
          value,
        )
      ) {
        return false;
      }
    }
    if (
      filter.on?.["DiscriminatedUnionMember2"] !== undefined &&
      DiscriminatedUnionMember2.isDiscriminatedUnionMember2(value)
    ) {
      if (
        !DiscriminatedUnionMember2.filter(
          filter.on["DiscriminatedUnionMember2"],
          value,
        )
      ) {
        return false;
      }
    }

    return true;
  };

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly DiscriminatedUnionMember1?: DiscriminatedUnionMember1.Filter;
      readonly DiscriminatedUnionMember2?: DiscriminatedUnionMember2.Filter;
    };
  };

  export const fromRdfResource: $FromRdfResourceFunction<DiscriminatedUnion> = (
    resource,
    options,
  ) =>
    (
      DiscriminatedUnionMember1.fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, DiscriminatedUnion>
    ).altLazy(
      () =>
        DiscriminatedUnionMember2.fromRdfResource(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, DiscriminatedUnion>,
    );

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    DiscriminatedUnion,
    typeof DiscriminatedUnion.schema
  > = ((values, options) =>
    values.chainMap((value) => {
      const valueAsValues = value.toValues();
      return (
        DiscriminatedUnionMember1.fromRdfResourceValues(valueAsValues, {
          ...options,
          schema: options.schema.members["DiscriminatedUnionMember1"].type,
        }) as Either<Error, Resource.Values<DiscriminatedUnion>>
      )
        .altLazy(
          () =>
            DiscriminatedUnionMember2.fromRdfResourceValues(valueAsValues, {
              ...options,
              schema: options.schema.members["DiscriminatedUnionMember2"].type,
            }) as Either<Error, Resource.Values<DiscriminatedUnion>>,
        )
        .chain((values) => values.head());
    })) satisfies $FromRdfResourceValuesFunction<
    DiscriminatedUnion,
    typeof DiscriminatedUnion.schema
  >;

  export const GraphQL = new GraphQLUnionType({
    description: undefined,
    name: "DiscriminatedUnion",
    resolveType: (value: DiscriminatedUnion) => value.$type,
    types: [
      DiscriminatedUnionMember1.GraphQL,
      DiscriminatedUnionMember2.GraphQL,
    ],
  });

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function isDiscriminatedUnion(
    object: $Object,
  ): object is DiscriminatedUnion {
    return (
      DiscriminatedUnionMember1.isDiscriminatedUnionMember1(object) ||
      DiscriminatedUnionMember2.isDiscriminatedUnionMember2(object)
    );
  }

  export const schema = {
    kind: "ObjectDiscriminatedUnion" as const,
    members: {
      DiscriminatedUnionMember1: {
        discriminantValues: ["DiscriminatedUnionMember1"],
        type: DiscriminatedUnionMember1.schema,
      },
      DiscriminatedUnionMember2: {
        discriminantValues: ["DiscriminatedUnionMember2"],
        type: DiscriminatedUnionMember2.schema,
      },
    },
    properties: {},
  } as const;

  export const toRdfResource: $ToRdfResourceFunction<DiscriminatedUnion> = (
    object,
    options,
  ) => {
    if (DiscriminatedUnionMember1.isDiscriminatedUnionMember1(object)) {
      return DiscriminatedUnionMember1.toRdfResource(object, options);
    }
    if (DiscriminatedUnionMember2.isDiscriminatedUnionMember2(object)) {
      return DiscriminatedUnionMember2.toRdfResource(object, options);
    }
    throw new Error("unrecognized type");
  };

  export const toRdfResourceValues = ((
    value,
    _options,
  ): (BlankNode | NamedNode)[] => {
    if (DiscriminatedUnionMember1.isDiscriminatedUnionMember1(value)) {
      return [
        DiscriminatedUnionMember1.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (DiscriminatedUnionMember2.isDiscriminatedUnionMember2(value)) {
      return [
        DiscriminatedUnionMember2.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) satisfies $ToRdfResourceValuesFunction<DiscriminatedUnion>;
}
export type $Object =
  | DiscriminatedUnionMember1
  | DiscriminatedUnionMember2
  | LazyObject
  | RootObject;

export namespace $Object {
  export const $toString = (value: $Object): string => {
    if (DiscriminatedUnionMember1.isDiscriminatedUnionMember1(value)) {
      return DiscriminatedUnionMember1.$toString(value);
    }
    if (DiscriminatedUnionMember2.isDiscriminatedUnionMember2(value)) {
      return DiscriminatedUnionMember2.$toString(value);
    }
    if (LazyObject.isLazyObject(value)) {
      return LazyObject.$toString(value);
    }
    if (RootObject.isRootObject(value)) {
      return RootObject.$toString(value);
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
      filter.on?.["DiscriminatedUnionMember1"] !== undefined &&
      DiscriminatedUnionMember1.isDiscriminatedUnionMember1(value)
    ) {
      if (
        !DiscriminatedUnionMember1.filter(
          filter.on["DiscriminatedUnionMember1"],
          value,
        )
      ) {
        return false;
      }
    }
    if (
      filter.on?.["DiscriminatedUnionMember2"] !== undefined &&
      DiscriminatedUnionMember2.isDiscriminatedUnionMember2(value)
    ) {
      if (
        !DiscriminatedUnionMember2.filter(
          filter.on["DiscriminatedUnionMember2"],
          value,
        )
      ) {
        return false;
      }
    }
    if (
      filter.on?.["LazyObject"] !== undefined &&
      LazyObject.isLazyObject(value)
    ) {
      if (!LazyObject.filter(filter.on["LazyObject"], value)) {
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

    return true;
  };

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly DiscriminatedUnionMember1?: DiscriminatedUnionMember1.Filter;
      readonly DiscriminatedUnionMember2?: DiscriminatedUnionMember2.Filter;
      readonly LazyObject?: LazyObject.Filter;
      readonly RootObject?: RootObject.Filter;
    };
  };

  export const fromRdfResource: $FromRdfResourceFunction<$Object> = (
    resource,
    options,
  ) =>
    (
      DiscriminatedUnionMember1.fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, $Object>
    )
      .altLazy(
        () =>
          DiscriminatedUnionMember2.fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          LazyObject.fromRdfResource(resource, {
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
      );

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    $Object,
    typeof $Object.schema
  > = ((values, options) =>
    values.chainMap((value) => {
      const valueAsValues = value.toValues();
      return (
        DiscriminatedUnionMember1.fromRdfResourceValues(valueAsValues, {
          ...options,
          schema: options.schema.members["DiscriminatedUnionMember1"].type,
        }) as Either<Error, Resource.Values<$Object>>
      )
        .altLazy(
          () =>
            DiscriminatedUnionMember2.fromRdfResourceValues(valueAsValues, {
              ...options,
              schema: options.schema.members["DiscriminatedUnionMember2"].type,
            }) as Either<Error, Resource.Values<$Object>>,
        )
        .altLazy(
          () =>
            LazyObject.fromRdfResourceValues(valueAsValues, {
              ...options,
              schema: options.schema.members["LazyObject"].type,
            }) as Either<Error, Resource.Values<$Object>>,
        )
        .altLazy(
          () =>
            RootObject.fromRdfResourceValues(valueAsValues, {
              ...options,
              schema: options.schema.members["RootObject"].type,
            }) as Either<Error, Resource.Values<$Object>>,
        )
        .chain((values) => values.head());
    })) satisfies $FromRdfResourceValuesFunction<
    $Object,
    typeof $Object.schema
  >;

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export const schema = {
    kind: "ObjectDiscriminatedUnion" as const,
    members: {
      DiscriminatedUnionMember1: {
        discriminantValues: ["DiscriminatedUnionMember1"],
        type: DiscriminatedUnionMember1.schema,
      },
      DiscriminatedUnionMember2: {
        discriminantValues: ["DiscriminatedUnionMember2"],
        type: DiscriminatedUnionMember2.schema,
      },
      LazyObject: {
        discriminantValues: ["LazyObject"],
        type: LazyObject.schema,
      },
      RootObject: {
        discriminantValues: ["RootObject"],
        type: RootObject.schema,
      },
    },
    properties: {},
  } as const;

  export const toRdfResource: $ToRdfResourceFunction<$Object> = (
    object,
    options,
  ) => {
    if (DiscriminatedUnionMember1.isDiscriminatedUnionMember1(object)) {
      return DiscriminatedUnionMember1.toRdfResource(object, options);
    }
    if (DiscriminatedUnionMember2.isDiscriminatedUnionMember2(object)) {
      return DiscriminatedUnionMember2.toRdfResource(object, options);
    }
    if (LazyObject.isLazyObject(object)) {
      return LazyObject.toRdfResource(object, options);
    }
    if (RootObject.isRootObject(object)) {
      return RootObject.toRdfResource(object, options);
    }
    throw new Error("unrecognized type");
  };

  export const toRdfResourceValues = ((
    value,
    _options,
  ): (BlankNode | NamedNode)[] => {
    if (DiscriminatedUnionMember1.isDiscriminatedUnionMember1(value)) {
      return [
        DiscriminatedUnionMember1.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (DiscriminatedUnionMember2.isDiscriminatedUnionMember2(value)) {
      return [
        DiscriminatedUnionMember2.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (LazyObject.isLazyObject(value)) {
      return [
        LazyObject.toRdfResource(value, {
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

    throw new Error("unable to serialize to RDF");
  }) satisfies $ToRdfResourceValuesFunction<$Object>;
}
export interface $ObjectSet {
  discriminatedUnionMember1(
    identifier: DiscriminatedUnionMember1.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, DiscriminatedUnionMember1>>;

  discriminatedUnionMember1Count(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnionMember1.Filter,
        DiscriminatedUnionMember1.Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  discriminatedUnionMember1Identifiers(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember1.Filter,
      DiscriminatedUnionMember1.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnionMember1.Identifier[]>>;

  discriminatedUnionMember1s(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember1.Filter,
      DiscriminatedUnionMember1.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnionMember1[]>>;

  discriminatedUnionMember2(
    identifier: DiscriminatedUnionMember2.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, DiscriminatedUnionMember2>>;

  discriminatedUnionMember2Count(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnionMember2.Filter,
        DiscriminatedUnionMember2.Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  discriminatedUnionMember2Identifiers(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember2.Filter,
      DiscriminatedUnionMember2.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnionMember2.Identifier[]>>;

  discriminatedUnionMember2s(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember2.Filter,
      DiscriminatedUnionMember2.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnionMember2[]>>;

  lazyObject(
    identifier: LazyObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, LazyObject>>;

  lazyObjectCount(
    query?: Pick<
      $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  lazyObjectIdentifiers(
    query?: $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
  ): Promise<Either<Error, readonly LazyObject.Identifier[]>>;

  lazyObjects(
    query?: $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
  ): Promise<Either<Error, readonly LazyObject[]>>;

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

  discriminatedUnion(
    identifier: DiscriminatedUnion.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, DiscriminatedUnion>>;

  discriminatedUnionCount(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnion.Filter,
        DiscriminatedUnion.Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  discriminatedUnionIdentifiers(
    query?: $ObjectSet.Query<
      DiscriminatedUnion.Filter,
      DiscriminatedUnion.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnion.Identifier[]>>;

  discriminatedUnions(
    query?: $ObjectSet.Query<
      DiscriminatedUnion.Filter,
      DiscriminatedUnion.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnion[]>>;

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

  async discriminatedUnionMember1(
    identifier: DiscriminatedUnionMember1.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, DiscriminatedUnionMember1>> {
    return this.discriminatedUnionMember1Sync(identifier, options);
  }

  discriminatedUnionMember1Sync(
    identifier: DiscriminatedUnionMember1.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, DiscriminatedUnionMember1> {
    return this.discriminatedUnionMember1sSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async discriminatedUnionMember1Count(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnionMember1.Filter,
        DiscriminatedUnionMember1.Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.discriminatedUnionMember1CountSync(query);
  }

  discriminatedUnionMember1CountSync(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnionMember1.Filter,
        DiscriminatedUnionMember1.Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.discriminatedUnionMember1sSync(query).map(
      (objects) => objects.length,
    );
  }

  async discriminatedUnionMember1Identifiers(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember1.Filter,
      DiscriminatedUnionMember1.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnionMember1.Identifier[]>> {
    return this.discriminatedUnionMember1IdentifiersSync(query);
  }

  discriminatedUnionMember1IdentifiersSync(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember1.Filter,
      DiscriminatedUnionMember1.Identifier
    >,
  ): Either<Error, readonly DiscriminatedUnionMember1.Identifier[]> {
    return this.discriminatedUnionMember1sSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async discriminatedUnionMember1s(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember1.Filter,
      DiscriminatedUnionMember1.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnionMember1[]>> {
    return this.discriminatedUnionMember1sSync(query);
  }

  discriminatedUnionMember1sSync(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember1.Filter,
      DiscriminatedUnionMember1.Identifier
    >,
  ): Either<Error, readonly DiscriminatedUnionMember1[]> {
    return this.#objectsSync<
      DiscriminatedUnionMember1,
      DiscriminatedUnionMember1.Filter,
      DiscriminatedUnionMember1.Identifier
    >(
      {
        filter: DiscriminatedUnionMember1.filter,
        fromRdfResource: DiscriminatedUnionMember1.fromRdfResource,
        fromRdfTypes: [DiscriminatedUnionMember1.schema.fromRdfType],
      },
      query,
    );
  }

  async discriminatedUnionMember2(
    identifier: DiscriminatedUnionMember2.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, DiscriminatedUnionMember2>> {
    return this.discriminatedUnionMember2Sync(identifier, options);
  }

  discriminatedUnionMember2Sync(
    identifier: DiscriminatedUnionMember2.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, DiscriminatedUnionMember2> {
    return this.discriminatedUnionMember2sSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async discriminatedUnionMember2Count(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnionMember2.Filter,
        DiscriminatedUnionMember2.Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.discriminatedUnionMember2CountSync(query);
  }

  discriminatedUnionMember2CountSync(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnionMember2.Filter,
        DiscriminatedUnionMember2.Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.discriminatedUnionMember2sSync(query).map(
      (objects) => objects.length,
    );
  }

  async discriminatedUnionMember2Identifiers(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember2.Filter,
      DiscriminatedUnionMember2.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnionMember2.Identifier[]>> {
    return this.discriminatedUnionMember2IdentifiersSync(query);
  }

  discriminatedUnionMember2IdentifiersSync(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember2.Filter,
      DiscriminatedUnionMember2.Identifier
    >,
  ): Either<Error, readonly DiscriminatedUnionMember2.Identifier[]> {
    return this.discriminatedUnionMember2sSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async discriminatedUnionMember2s(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember2.Filter,
      DiscriminatedUnionMember2.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnionMember2[]>> {
    return this.discriminatedUnionMember2sSync(query);
  }

  discriminatedUnionMember2sSync(
    query?: $ObjectSet.Query<
      DiscriminatedUnionMember2.Filter,
      DiscriminatedUnionMember2.Identifier
    >,
  ): Either<Error, readonly DiscriminatedUnionMember2[]> {
    return this.#objectsSync<
      DiscriminatedUnionMember2,
      DiscriminatedUnionMember2.Filter,
      DiscriminatedUnionMember2.Identifier
    >(
      {
        filter: DiscriminatedUnionMember2.filter,
        fromRdfResource: DiscriminatedUnionMember2.fromRdfResource,
        fromRdfTypes: [DiscriminatedUnionMember2.schema.fromRdfType],
      },
      query,
    );
  }

  async lazyObject(
    identifier: LazyObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, LazyObject>> {
    return this.lazyObjectSync(identifier, options);
  }

  lazyObjectSync(
    identifier: LazyObject.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, LazyObject> {
    return this.lazyObjectsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async lazyObjectCount(
    query?: Pick<
      $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.lazyObjectCountSync(query);
  }

  lazyObjectCountSync(
    query?: Pick<
      $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.lazyObjectsSync(query).map((objects) => objects.length);
  }

  async lazyObjectIdentifiers(
    query?: $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
  ): Promise<Either<Error, readonly LazyObject.Identifier[]>> {
    return this.lazyObjectIdentifiersSync(query);
  }

  lazyObjectIdentifiersSync(
    query?: $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
  ): Either<Error, readonly LazyObject.Identifier[]> {
    return this.lazyObjectsSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async lazyObjects(
    query?: $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
  ): Promise<Either<Error, readonly LazyObject[]>> {
    return this.lazyObjectsSync(query);
  }

  lazyObjectsSync(
    query?: $ObjectSet.Query<LazyObject.Filter, LazyObject.Identifier>,
  ): Either<Error, readonly LazyObject[]> {
    return this.#objectsSync<
      LazyObject,
      LazyObject.Filter,
      LazyObject.Identifier
    >(
      {
        filter: LazyObject.filter,
        fromRdfResource: LazyObject.fromRdfResource,
        fromRdfTypes: [LazyObject.schema.fromRdfType],
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
        fromRdfTypes: [RootObject.schema.fromRdfType],
      },
      query,
    );
  }

  async discriminatedUnion(
    identifier: DiscriminatedUnion.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, DiscriminatedUnion>> {
    return this.discriminatedUnionSync(identifier, options);
  }

  discriminatedUnionSync(
    identifier: DiscriminatedUnion.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, DiscriminatedUnion> {
    return this.discriminatedUnionsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async discriminatedUnionCount(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnion.Filter,
        DiscriminatedUnion.Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.discriminatedUnionCountSync(query);
  }

  discriminatedUnionCountSync(
    query?: Pick<
      $ObjectSet.Query<
        DiscriminatedUnion.Filter,
        DiscriminatedUnion.Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.discriminatedUnionsSync(query).map((objects) => objects.length);
  }

  async discriminatedUnionIdentifiers(
    query?: $ObjectSet.Query<
      DiscriminatedUnion.Filter,
      DiscriminatedUnion.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnion.Identifier[]>> {
    return this.discriminatedUnionIdentifiersSync(query);
  }

  discriminatedUnionIdentifiersSync(
    query?: $ObjectSet.Query<
      DiscriminatedUnion.Filter,
      DiscriminatedUnion.Identifier
    >,
  ): Either<Error, readonly DiscriminatedUnion.Identifier[]> {
    return this.discriminatedUnionsSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async discriminatedUnions(
    query?: $ObjectSet.Query<
      DiscriminatedUnion.Filter,
      DiscriminatedUnion.Identifier
    >,
  ): Promise<Either<Error, readonly DiscriminatedUnion[]>> {
    return this.discriminatedUnionsSync(query);
  }

  discriminatedUnionsSync(
    query?: $ObjectSet.Query<
      DiscriminatedUnion.Filter,
      DiscriminatedUnion.Identifier
    >,
  ): Either<Error, readonly DiscriminatedUnion[]> {
    return this.#objectDiscriminatedUnionsSync<
      DiscriminatedUnion,
      DiscriminatedUnion.Filter,
      DiscriminatedUnion.Identifier
    >(
      [
        {
          filter: DiscriminatedUnion.filter,
          fromRdfResource: DiscriminatedUnionMember1.fromRdfResource,
          fromRdfTypes: [DiscriminatedUnionMember1.schema.fromRdfType],
        },
        {
          filter: DiscriminatedUnion.filter,
          fromRdfResource: DiscriminatedUnionMember2.fromRdfResource,
          fromRdfTypes: [DiscriminatedUnionMember2.schema.fromRdfType],
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
    return this.#objectDiscriminatedUnionsSync<
      $Object,
      $Object.Filter,
      $Object.Identifier
    >(
      [
        {
          filter: $Object.filter,
          fromRdfResource: DiscriminatedUnionMember1.fromRdfResource,
          fromRdfTypes: [DiscriminatedUnionMember1.schema.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: DiscriminatedUnionMember2.fromRdfResource,
          fromRdfTypes: [DiscriminatedUnionMember2.schema.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: LazyObject.fromRdfResource,
          fromRdfTypes: [LazyObject.schema.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: RootObject.fromRdfResource,
          fromRdfTypes: [RootObject.schema.fromRdfType],
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

  #objectDiscriminatedUnionsSync<
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
      discriminatedUnionMember1: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<DiscriminatedUnionMember1> =>
          (
            await EitherAsync<Error, DiscriminatedUnionMember1>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.discriminatedUnionMember1(
                    await liftEither(
                      DiscriminatedUnionMember1.Identifier.parse(
                        args.identifier,
                      ),
                    ),
                  ),
                ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(DiscriminatedUnionMember1.GraphQL),
      },
      discriminatedUnionMember1Identifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.discriminatedUnionMember1Identifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(DiscriminatedUnionMember1.Identifier.stringify),
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      discriminatedUnionMember1s: {
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
        ): Promise<readonly DiscriminatedUnionMember1[]> =>
          (
            await EitherAsync<Error, readonly DiscriminatedUnionMember1[]>(
              async ({ liftEither }) => {
                let filter: DiscriminatedUnionMember1.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: DiscriminatedUnionMember1.Identifier[] =
                    [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        DiscriminatedUnionMember1.Identifier.parse(
                          identifierArg,
                        ),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.discriminatedUnionMember1s({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(
            new GraphQLNonNull(DiscriminatedUnionMember1.GraphQL),
          ),
        ),
      },
      discriminatedUnionMember1Count: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.discriminatedUnionMember1Count()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
      discriminatedUnionMember2: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<DiscriminatedUnionMember2> =>
          (
            await EitherAsync<Error, DiscriminatedUnionMember2>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.discriminatedUnionMember2(
                    await liftEither(
                      DiscriminatedUnionMember2.Identifier.parse(
                        args.identifier,
                      ),
                    ),
                  ),
                ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(DiscriminatedUnionMember2.GraphQL),
      },
      discriminatedUnionMember2Identifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.discriminatedUnionMember2Identifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(DiscriminatedUnionMember2.Identifier.stringify),
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      discriminatedUnionMember2s: {
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
        ): Promise<readonly DiscriminatedUnionMember2[]> =>
          (
            await EitherAsync<Error, readonly DiscriminatedUnionMember2[]>(
              async ({ liftEither }) => {
                let filter: DiscriminatedUnionMember2.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: DiscriminatedUnionMember2.Identifier[] =
                    [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        DiscriminatedUnionMember2.Identifier.parse(
                          identifierArg,
                        ),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.discriminatedUnionMember2s({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(
            new GraphQLNonNull(DiscriminatedUnionMember2.GraphQL),
          ),
        ),
      },
      discriminatedUnionMember2Count: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.discriminatedUnionMember2Count()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
      lazyObject: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<LazyObject> =>
          (
            await EitherAsync<Error, LazyObject>(async ({ liftEither }) =>
              liftEither(
                await objectSet.lazyObject(
                  await liftEither(
                    LazyObject.Identifier.parse(args.identifier),
                  ),
                ),
              ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(LazyObject.GraphQL),
      },
      lazyObjectIdentifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.lazyObjectIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(LazyObject.Identifier.stringify),
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      lazyObjects: {
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
        ): Promise<readonly LazyObject[]> =>
          (
            await EitherAsync<Error, readonly LazyObject[]>(
              async ({ liftEither }) => {
                let filter: LazyObject.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: LazyObject.Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        LazyObject.Identifier.parse(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.lazyObjects({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(LazyObject.GraphQL)),
        ),
      },
      lazyObjectCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.lazyObjectCount()).unsafeCoerce(),
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
      discriminatedUnion: {
        args: { identifier: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (
          _source,
          args: { identifier: string },
          { objectSet },
        ): Promise<DiscriminatedUnion> =>
          (
            await EitherAsync<Error, DiscriminatedUnion>(
              async ({ liftEither }) =>
                liftEither(
                  await objectSet.discriminatedUnion(
                    await liftEither(
                      DiscriminatedUnion.Identifier.parse(args.identifier),
                    ),
                  ),
                ),
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(DiscriminatedUnion.GraphQL),
      },
      discriminatedUnionIdentifiers: {
        args: { limit: { type: GraphQLInt }, offset: { type: GraphQLInt } },
        resolve: async (
          _source,
          args: { limit: number | null; offset: number | null },
          { objectSet },
        ): Promise<readonly string[]> =>
          (
            await objectSet.discriminatedUnionIdentifiers({
              limit: args.limit !== null ? args.limit : undefined,
              offset: args.offset !== null ? args.offset : undefined,
            })
          )
            .unsafeCoerce()
            .map(DiscriminatedUnion.Identifier.stringify),
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      discriminatedUnions: {
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
        ): Promise<readonly DiscriminatedUnion[]> =>
          (
            await EitherAsync<Error, readonly DiscriminatedUnion[]>(
              async ({ liftEither }) => {
                let filter: DiscriminatedUnion.Filter | undefined;
                if (args.identifiers) {
                  const identifiers: DiscriminatedUnion.Identifier[] = [];
                  for (const identifierArg of args.identifiers) {
                    identifiers.push(
                      await liftEither(
                        DiscriminatedUnion.Identifier.parse(identifierArg),
                      ),
                    );
                  }
                  filter = { $identifier: { in: identifiers } };
                }
                return await liftEither(
                  await objectSet.discriminatedUnions({
                    filter,
                    limit: args.limit !== null ? args.limit : undefined,
                    offset: args.offset !== null ? args.offset : undefined,
                  }),
                );
              },
            )
          ).unsafeCoerce(),
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(DiscriminatedUnion.GraphQL)),
        ),
      },
      discriminatedUnionCount: {
        resolve: async (_source, _args, { objectSet }): Promise<number> =>
          (await objectSet.discriminatedUnionCount()).unsafeCoerce(),
        type: new GraphQLNonNull(GraphQLInt),
      },
    },
  }),
});

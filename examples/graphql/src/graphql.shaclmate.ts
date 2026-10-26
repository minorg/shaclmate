import type {
  BlankNode,
  DatasetCore,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import { datasetFactory } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import {
  PropertyPath as RdfxResourcePropertyPath,
  Resource,
  ResourceSet,
} from "@rdfx/resource";
import { NTriplesIdentifier } from "@rdfx/string";
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
  ObjectT extends object,
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

type $ConversionFunction<
  SourceT,
  TargetT,
  DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
> = (
  source: SourceT,
  defaultNamespace?: DefaultNamespaceT,
) => Either<Error, TargetT>;

function $convertToIdentifierProperty<
  DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
>(
  identifier:
    | (() => BlankNode | NamedNode)
    | BlankNode
    | NamedNode
    | (keyof DefaultNamespaceT & string)
    | undefined,
  defaultNamespace?: DefaultNamespaceT,
): Either<Error, () => BlankNode | NamedNode> {
  switch (typeof identifier) {
    case "function":
      return Either.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return Either.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = defaultNamespace
        ? defaultNamespace(identifier)
        : dataFactory.namedNode(identifier);
      return Either.of(() => captureIdentifier);
    }
    case "undefined": {
      const captureIdentifier = dataFactory.blankNode();
      return Either.of(() => captureIdentifier);
    }
  }
}

function $convertToIriIdentifierProperty<
  DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
>(
  identifier:
    | (() => NamedNode)
    | NamedNode
    | (keyof DefaultNamespaceT & string),
  defaultNamespace?: DefaultNamespaceT,
): Either<Error, () => NamedNode> {
  switch (typeof identifier) {
    case "function":
      return Either.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return Either.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = defaultNamespace
        ? defaultNamespace(identifier)
        : dataFactory.namedNode(identifier);
      return Either.of(() => captureIdentifier);
    }
  }
}

function $convertToLazyOption<PartialT, ResolvedT>(
  resolvedToPartial: (resolved: ResolvedT) => PartialT,
): $ConversionFunction<
  $LazyOption<PartialT, ResolvedT> | Maybe<ResolvedT> | ResolvedT | undefined,
  $LazyOption<PartialT, ResolvedT>
> {
  return (value) => {
    if (value instanceof $LazyOption) {
      return Either.of(value);
    }

    let extractedValue: PartialT | ResolvedT | undefined;
    if (typeof value === "undefined") {
      extractedValue = value;
    } else if (Maybe.isMaybe(value)) {
      extractedValue = value.extract();
    } else {
      extractedValue = value;
    }

    if (typeof extractedValue === "undefined") {
      return Either.of(
        new $LazyOption<PartialT, ResolvedT>({
          partial: Maybe.empty(),
          resolver: async () => {
            throw new Error("should never be called");
          },
        }),
      );
    }

    const resolved = extractedValue as ResolvedT;
    return Either.of(
      new $LazyOption({
        partial: Maybe.of(resolvedToPartial(resolved)),
        resolver: async () => Right(resolved),
      }),
    );
  };
}

function $convertToLazySet<PartialT, ResolvedT>(
  resolvedToPartial: (resolved: ResolvedT) => PartialT,
): $ConversionFunction<
  $LazySet<PartialT, ResolvedT> | readonly ResolvedT[] | ResolvedT | undefined,
  $LazySet<PartialT, ResolvedT>
> {
  return (value) => {
    if (typeof value === "undefined") {
      return Either.of(
        new $LazySet<PartialT, ResolvedT>({
          partials: [],
          resolver: async () => Right([]),
        }),
      );
    }

    if (value instanceof $LazySet) {
      return Either.of(value);
    }

    const resolved = (
      Array.isArray(value) ? value : [value]
    ) as readonly ResolvedT[];
    return Either.of(
      new $LazySet<PartialT, ResolvedT>({
        partials: resolved.map(resolvedToPartial),
        resolver: async () => Right(resolved),
      }),
    );
  };
}

function $convertToMaybe<
  DefaultNamespaceT extends $NamespaceBuilder,
  ItemSourceT,
  ItemTargetT,
>(
  convertToItem: $ConversionFunction<
    ItemSourceT,
    ItemTargetT,
    DefaultNamespaceT
  >,
): $ConversionFunction<
  ItemSourceT | Maybe<ItemTargetT> | undefined,
  Maybe<ItemTargetT>,
  DefaultNamespaceT
> {
  return (value, defaultNamespace) => {
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

    return convertToItem(value, defaultNamespace).map(Maybe.of);
  };
}

function $ensureRdfResourceType(
  resource: Resource,
  types: readonly NamedNode[],
  options: { graph: Exclude<Quad_Graph, Variable> | undefined },
): Either<Error, undefined> {
  return resource
    .value($rdf_type, options)
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

export type $FilterFunction<FilterT, ValueT> = (
  filter: FilterT,
  value: ValueT,
) => boolean;

const $filterIdentifier: $FilterFunction<
  $IdentifierFilter,
  BlankNode | NamedNode
> = (filter, value) => {
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
};

const $filterIri: $FilterFunction<$IriFilter, NamedNode> = (filter, value) => {
  if (
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
    return false;
  }

  return true;
};

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

const $filterString: $FilterFunction<$StringFilter, string> = (
  filter,
  value,
) => {
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
};

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

function $identityConversionFunction<T>(
  value: T,
  _defaultNamespace?: $NamespaceBuilder,
): Either<Error, T> {
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

  static fromPartial<PartialT, ResolvedT>(
    partial: PartialT | Maybe<PartialT> | undefined,
  ): $LazyOption<PartialT, ResolvedT> {
    let partialMaybe: Maybe<PartialT>;
    if (typeof partial === "undefined") {
      partialMaybe = Maybe.empty();
    } else if (Maybe.isMaybe(partial)) {
      partialMaybe = partial;
    } else {
      partialMaybe = Maybe.of(partial);
    }

    return new $LazyOption({
      partial: partialMaybe,
      resolver: async () => Left(new Error("unable to resolve partial")),
    });
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

  static fromPartials<PartialT, ResolvedT>(
    partials: readonly PartialT[],
  ): $LazySet<PartialT, ResolvedT> {
    return new $LazySet({
      partials,
      resolver: async () => Left(new Error("unable to resolve partials")),
    });
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

/**
 * NamespaceBuilder type excerpted from @rdfjs/namespace (MIT license) in lieu of a type import.
 */
export type $NamespaceBuilder<TermNames extends string = any> = Record<
  TermNames,
  NamedNode
> &
  ((property?: TemplateStringsArray | TermNames) => NamedNode);

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

export function $parseBlankNode(identifier: string): Either<Error, BlankNode> {
  return $parseIdentifier(identifier).chain((identifier) =>
    identifier.termType === "BlankNode"
      ? Right(identifier)
      : Left(new Error("expected identifier to be BlankNode")),
  ) as Either<Error, BlankNode>;
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

  export const toRdfResource: $ToRdfResourceFunction<
    Resource.Identifier,
    $PropertyPath
  > = RdfxResourcePropertyPath.toResource;

  export const $toString = RdfxResourcePropertyPath.toString;
}

const $rdf_subject = dataFactory.namedNode(
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
);

const $rdf_type = dataFactory.namedNode(
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
);

function $rdfResourceIdentifierValues(resource: Resource): Resource.Values {
  return new Resource.Value({
    dataFactory: dataFactory,
    focusResource: resource,
    propertyPath: $rdf_subject,
    term: resource.identifier,
  }).toValues();
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
  IdentifierT extends Resource.Identifier,
  ObjectT extends object,
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

export type $ToStringFunction<T> = (value: T) => string;

export type $ToStringRecordFunction<T> = (value: T) => Record<string, string>;

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
): $ToRdfResourceFunction<IdentifierT, ObjectT>;
function $wrap_ToRdfResourceFunction<
  _IdentifierT extends BlankNode,
  ObjectT extends object,
>(
  _toRdfResourceFunction: $_ToRdfResourceFunction<BlankNode, ObjectT>,
): $ToRdfResourceFunction<BlankNode, ObjectT>;
function $wrap_ToRdfResourceFunction<
  IdentifierT extends Resource.Identifier,
  ObjectT extends object & { $identifier?: () => IdentifierT },
>(
  _toRdfResourceFunction: $_ToRdfResourceFunction<IdentifierT, ObjectT>,
): $ToRdfResourceFunction<IdentifierT, ObjectT> {
  return (object, options) => {
    let { graph, ignoreRdfType = false, resourceSet } = options ?? {};
    if (!resourceSet) {
      resourceSet = new ResourceSet({
        dataFactory: dataFactory,
        dataset: datasetFactory.dataset(),
      });
    }
    const resource = (
      object.$identifier
        ? resourceSet.resource(object.$identifier())
        : resourceSet.resource(dataFactory.blankNode())
    ) as Resource<IdentifierT>;
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

const $xsd_double = dataFactory.namedNode(
  "http://www.w3.org/2001/XMLSchema#double",
);

export type $DefaultPartial = {
  readonly $identifier: () => $DefaultPartial.Identifier;
};

export namespace $DefaultPartial {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    $DefaultPartial.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: $DefaultPartial.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
    }).chain((properties) => $DefaultPartial.create(properties));

  export const _toRdfResource: $_ToRdfResourceFunction<
    $DefaultPartial.Identifier,
    $DefaultPartial
  > = (parameters) => {
    return parameters.resource;
  };

  export const $toString: $ToStringFunction<$DefaultPartial> = (
    _defaultPartial,
  ) =>
    `$DefaultPartial(${JSON.stringify($DefaultPartial.toStringRecord(_defaultPartial))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: $DefaultPartial.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, $DefaultPartial.Discriminated> = (parameters?) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters?.$identifier,
        parameters?.$defaultNamespace,
      ),
      $type: Right("DefaultPartial" as const),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: $DefaultPartial.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => $DefaultPartial.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: $DefaultPartial.CreateParameters<$DefaultNamespaceT>,
  ) => $DefaultPartial.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = $DefaultPartial & {
    readonly $type: "DefaultPartial";
  };

  export const filter: $FilterFunction<
    $DefaultPartial.Filter,
    $DefaultPartial
  > = (filter, value) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    return true;
  };

  export type Filter = { readonly $identifier?: $IdentifierFilter };

  export const fromRdfResource: $FromRdfResourceFunction<$DefaultPartial.Discriminated> =
    $wrap_FromRdfResourceFunction($DefaultPartial._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    $DefaultPartial.Discriminated,
    typeof $DefaultPartial.schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) =>
          $DefaultPartial.fromRdfResource(resource, options),
        ),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const is$DefaultPartial = (
    object: $Object,
  ): object is $DefaultPartial.Discriminated =>
    object.$type === "DefaultPartial";

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
    },
  } as const;

  export type Schema = typeof schema;

  export const toRdfResource: $ToRdfResourceFunction<
    $DefaultPartial.Identifier,
    $DefaultPartial
  > = $wrap_ToRdfResourceFunction<$DefaultPartial.Identifier, $DefaultPartial>(
    $DefaultPartial._toRdfResource,
  );

  export const toRdfResourceValues: $ToRdfResourceValuesFunction<
    $DefaultPartial,
    BlankNode | NamedNode
  > = (value, options) => [
    $DefaultPartial.toRdfResource(value, {
      graph: options.graph,
      resourceSet: options.resourceSet,
    }).identifier,
  ];

  export const toStringRecord: $ToStringRecordFunction<$DefaultPartial> = (
    _defaultPartial,
  ) =>
    $compactRecord({ $identifier: _defaultPartial.$identifier().toString() });
}

export type AnonymousObject = {
  /**
   * Required string property
   */
  readonly requiredStringProperty: string;
};

export namespace AnonymousObject {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    AnonymousObject.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      requiredStringProperty: $shaclPropertyFromRdf<
        string,
        $StringSchema<string>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          AnonymousObject.schema.properties.requiredStringProperty,
        typeFromRdfResourceValues: $stringFromRdfResourceValues<string>,
      }),
    }).chain((properties) => AnonymousObject.create(properties));

  export const _toRdfResource: $_ToRdfResourceFunction<
    AnonymousObject.Identifier,
    AnonymousObject
  > = (parameters) => {
    parameters.resource.add(
      AnonymousObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const $toString: $ToStringFunction<object> = (_anonymousObject) =>
    `AnonymousObject(${JSON.stringify(AnonymousObject.toStringRecord(_anonymousObject))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: AnonymousObject.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, AnonymousObject.Discriminated> = (parameters) =>
    $sequenceRecord({
      $type: Right("AnonymousObject" as const),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: AnonymousObject.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly requiredStringProperty: string;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: AnonymousObject.CreateParameters<$DefaultNamespaceT>,
  ) => AnonymousObject.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = AnonymousObject & {
    readonly $type: "AnonymousObject";
  };

  export const filter: $FilterFunction<
    AnonymousObject.Filter,
    AnonymousObject
  > = (filter, value) => {
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

  export type Filter = { readonly requiredStringProperty?: $StringFilter };

  export const fromRdfResource: $FromRdfResourceFunction<AnonymousObject.Discriminated> =
    $wrap_FromRdfResourceFunction(AnonymousObject._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    AnonymousObject.Discriminated,
    typeof AnonymousObject.schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) =>
          AnonymousObject.fromRdfResource(resource, options),
        ),
    );

  export const GraphQL = new GraphQLObjectType<
    AnonymousObject,
    { objectSet: $ObjectSet }
  >({
    description: undefined,
    fields: () => ({
      requiredStringProperty: {
        args: undefined,
        description: '"Required string property"',
        name: "requiredStringProperty",
        resolve: (source, _args) => source.requiredStringProperty,
        type: new GraphQLNonNull(GraphQLString),
      },
    }),
    name: "AnonymousObject",
  });

  export type Identifier = BlankNode;
  export namespace Identifier {
    export const parse = $parseBlankNode;
  }

  export const isAnonymousObject = (
    object: $Object,
  ): object is AnonymousObject.Discriminated =>
    object.$type === "AnonymousObject";

  export const schema = {
    properties: {
      requiredStringProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
        type: { kind: "String" as const },
      },
    },
  } as const;

  export type Schema = typeof schema;

  export const toRdfResource: $ToRdfResourceFunction<
    AnonymousObject.Identifier,
    AnonymousObject
  > = $wrap_ToRdfResourceFunction<AnonymousObject.Identifier, AnonymousObject>(
    AnonymousObject._toRdfResource,
  );

  export const toRdfResourceValues: $ToRdfResourceValuesFunction<
    AnonymousObject,
    BlankNode
  > = (value, options) => [
    AnonymousObject.toRdfResource(value, {
      graph: options.graph,
      resourceSet: options.resourceSet,
    }).identifier,
  ];

  export const toStringRecord: $ToStringRecordFunction<object> = (
    _anonymousObject,
  ) => $compactRecord({});
}

export type LazyObject = {
  readonly $identifier: () => LazyObject.Identifier;

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
  export const _fromRdfResource: $_FromRdfResourceFunction<
    LazyObject.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: LazyObject.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      $rdfType: !options.ignoreRdfType
        ? $ensureRdfResourceType(
            resource,
            [LazyObject.schema.properties.$rdfType.fromRdfType],
            {
              graph: options.graph,
            },
          )
        : Right(true as const),
      optionalNumberProperty: $shaclPropertyFromRdf<
        Maybe<number>,
        $MaybeSchema<$NumericSchema<number>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: LazyObject.schema.properties.optionalNumberProperty,
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
        propertySchema: LazyObject.schema.properties.optionalStringProperty,
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
        propertySchema:
          AnonymousObject.schema.properties.requiredStringProperty,
        typeFromRdfResourceValues: $stringFromRdfResourceValues<string>,
      }),
    }).chain((properties) => LazyObject.create(properties));

  export const _toRdfResource: $_ToRdfResourceFunction<
    LazyObject.Identifier,
    LazyObject
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $rdf_type,
        LazyObject.schema.properties.$rdfType.toRdfTypes,
        parameters.graph,
      );
    }
    parameters.resource.add(
      LazyObject.schema.properties.optionalNumberProperty.path,
      parameters.object.optionalNumberProperty
        .toList()
        .flatMap((value) => [$literalFactory.number(value, $xsd_double)]),
      parameters.graph,
    );
    parameters.resource.add(
      LazyObject.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      AnonymousObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const $toString: $ToStringFunction<Pick<LazyObject, "$identifier">> = (
    _lazyObject,
  ) => `LazyObject(${JSON.stringify(LazyObject.toStringRecord(_lazyObject))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: LazyObject.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, LazyObject.Discriminated> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("LazyObject" as const),
      optionalNumberProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalNumberProperty,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          LazyObject.schema.properties.optionalNumberProperty.type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          LazyObject.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: LazyObject.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => LazyObject.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly optionalNumberProperty?: number | Maybe<number>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: LazyObject.CreateParameters<$DefaultNamespaceT>,
  ) => LazyObject.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = LazyObject & { readonly $type: "LazyObject" };

  export const filter: $FilterFunction<LazyObject.Filter, LazyObject> = (
    filter,
    value,
  ) => {
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

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalNumberProperty?: $MaybeFilter<$NumericFilter<number>>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredStringProperty?: $StringFilter;
  };

  export const fromRdfResource: $FromRdfResourceFunction<LazyObject.Discriminated> =
    $wrap_FromRdfResourceFunction(LazyObject._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    LazyObject.Discriminated,
    typeof LazyObject.schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => LazyObject.fromRdfResource(resource, options)),
    );

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
        resolve: (source) => NTriplesIdentifier.stringify(source.$identifier()),
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

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isLazyObject = (
    object: $Object,
  ): object is LazyObject.Discriminated => object.$type === "LazyObject";

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
      $rdfType: {
        fromRdfType: dataFactory.namedNode("http://example.com/LazyObject"),
        kind: "RdfType",
        toRdfTypes: [dataFactory.namedNode("http://example.com/LazyObject")],
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

  export type Schema = typeof schema;

  export const toRdfResource: $ToRdfResourceFunction<
    LazyObject.Identifier,
    LazyObject
  > = $wrap_ToRdfResourceFunction<LazyObject.Identifier, LazyObject>(
    LazyObject._toRdfResource,
  );

  export const toRdfResourceValues: $ToRdfResourceValuesFunction<
    LazyObject,
    BlankNode | NamedNode
  > = (value, options) => [
    LazyObject.toRdfResource(value, {
      graph: options.graph,
      resourceSet: options.resourceSet,
    }).identifier,
  ];

  export const toStringRecord: $ToStringRecordFunction<
    Pick<LazyObject, "$identifier">
  > = (_lazyObject) =>
    $compactRecord({ $identifier: _lazyObject.$identifier().toString() });
}

export type RootObject = {
  readonly $identifier: () => RootObject.Identifier;

  /**
   * Lazy object set property
   */
  readonly lazyObjectSetProperty: $LazySet<$DefaultPartial, LazyObject>;

  /**
   * Optional lazy object property
   */
  readonly optionalLazyProperty: $LazyOption<$DefaultPartial, LazyObject>;

  /**
   * Optional object property with anonymous object
   */
  readonly optionalObjectProperty: Maybe<AnonymousObject>;

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
  export const _fromRdfResource: $_FromRdfResourceFunction<
    RootObject.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $iriFromRdfResourceValues<string>(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: RootObject.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      $rdfType: !options.ignoreRdfType
        ? $ensureRdfResourceType(
            resource,
            [RootObject.schema.properties.$rdfType.fromRdfType],
            {
              graph: options.graph,
            },
          )
        : Right(true as const),
      lazyObjectSetProperty: $shaclPropertyFromRdf<
        $LazySet<$DefaultPartial, LazyObject>,
        {
          kind: "LazySet";
          partialType: $CollectionSchema<typeof $DefaultPartial.schema>;
        }
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: RootObject.schema.properties.lazyObjectSetProperty,
        typeFromRdfResourceValues: (
          values,
          { objectSet, schema, ...otherOptions },
        ) =>
          $setFromRdfResourceValues<
            $DefaultPartial,
            typeof $DefaultPartial.schema
          >($DefaultPartial.fromRdfResourceValues)(values, {
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
          ),
      }),
      optionalLazyProperty: $shaclPropertyFromRdf<
        $LazyOption<$DefaultPartial, LazyObject>,
        {
          kind: "LazyOption";
          partialType: $MaybeSchema<typeof $DefaultPartial.schema>;
        }
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: RootObject.schema.properties.optionalLazyProperty,
        typeFromRdfResourceValues: (
          values,
          { objectSet, schema, ...otherOptions },
        ) =>
          $maybeFromRdfResourceValues<
            $DefaultPartial,
            typeof $DefaultPartial.schema
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
          ),
      }),
      optionalObjectProperty: $shaclPropertyFromRdf<
        Maybe<AnonymousObject>,
        $MaybeSchema<typeof AnonymousObject.schema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: RootObject.schema.properties.optionalObjectProperty,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          AnonymousObject,
          typeof AnonymousObject.schema
        >(AnonymousObject.fromRdfResourceValues),
      }),
      optionalStringProperty: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: LazyObject.schema.properties.optionalStringProperty,
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
        propertySchema:
          AnonymousObject.schema.properties.requiredStringProperty,
        typeFromRdfResourceValues: $stringFromRdfResourceValues<string>,
      }),
    }).chain((properties) => RootObject.create(properties));

  export const _toRdfResource: $_ToRdfResourceFunction<
    RootObject.Identifier,
    RootObject
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $rdf_type,
        RootObject.schema.properties.$rdfType.toRdfTypes,
        parameters.graph,
      );
    }
    parameters.resource.add(
      RootObject.schema.properties.lazyObjectSetProperty.path,
      parameters.object.lazyObjectSetProperty.partials.flatMap((item) =>
        $DefaultPartial.toRdfResourceValues(item, {
          ignoreRdfType: parameters.ignoreRdfType,
          graph: parameters.graph,
          resource: parameters.resource,
          resourceSet: parameters.resourceSet,
          propertyPath: RootObject.schema.properties.lazyObjectSetProperty.path,
        }),
      ),
      parameters.graph,
    );
    parameters.resource.add(
      RootObject.schema.properties.optionalLazyProperty.path,
      parameters.object.optionalLazyProperty.partial.toList().flatMap((value) =>
        $DefaultPartial.toRdfResourceValues(value, {
          ignoreRdfType: parameters.ignoreRdfType,
          graph: parameters.graph,
          resource: parameters.resource,
          resourceSet: parameters.resourceSet,
          propertyPath: RootObject.schema.properties.optionalLazyProperty.path,
        }),
      ),
      parameters.graph,
    );
    parameters.resource.add(
      RootObject.schema.properties.optionalObjectProperty.path,
      parameters.object.optionalObjectProperty.toList().flatMap((value) =>
        AnonymousObject.toRdfResourceValues(value, {
          ignoreRdfType: parameters.ignoreRdfType,
          graph: parameters.graph,
          resource: parameters.resource,
          resourceSet: parameters.resourceSet,
          propertyPath:
            RootObject.schema.properties.optionalObjectProperty.path,
        }),
      ),
      parameters.graph,
    );
    parameters.resource.add(
      LazyObject.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      AnonymousObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const $toString: $ToStringFunction<Pick<RootObject, "$identifier">> = (
    _rootObject,
  ) => `RootObject(${JSON.stringify(RootObject.toStringRecord(_rootObject))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: RootObject.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, RootObject.Discriminated> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIriIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("RootObject" as const),
      lazyObjectSetProperty: $convertToLazySet<$DefaultPartial, LazyObject>(
        $DefaultPartial.createUnsafe,
      )(parameters.lazyObjectSetProperty, parameters.$defaultNamespace),
      optionalLazyProperty: $convertToLazyOption<$DefaultPartial, LazyObject>(
        $DefaultPartial.createUnsafe,
      )(parameters.optionalLazyProperty, parameters.$defaultNamespace),
      optionalObjectProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalObjectProperty,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          RootObject.schema.properties.optionalObjectProperty.type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          LazyObject.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: RootObject.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier:
      | (() => RootObject.Identifier)
      | (keyof $DefaultNamespaceT & string)
      | NamedNode;
    readonly lazyObjectSetProperty?:
      | $LazySet<$DefaultPartial, LazyObject>
      | readonly LazyObject[]
      | LazyObject;
    readonly optionalLazyProperty?:
      | $LazyOption<$DefaultPartial, LazyObject>
      | Maybe<LazyObject>
      | LazyObject;
    readonly optionalObjectProperty?: AnonymousObject | Maybe<AnonymousObject>;
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredStringProperty: string;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: RootObject.CreateParameters<$DefaultNamespaceT>,
  ) => RootObject.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = RootObject & { readonly $type: "RootObject" };

  export const filter: $FilterFunction<RootObject.Filter, RootObject> = (
    filter,
    value,
  ) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIri(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.lazyObjectSetProperty !== undefined &&
      !((filter, value) =>
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
      !((filter, value) =>
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
      !$filterMaybe<AnonymousObject, AnonymousObject.Filter>(
        AnonymousObject.filter,
      )(filter.optionalObjectProperty, value.optionalObjectProperty)
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

  export type Filter = {
    readonly $identifier?: $IriFilter;
    readonly lazyObjectSetProperty?: $CollectionFilter<$DefaultPartial.Filter>;
    readonly optionalLazyProperty?: $MaybeFilter<$DefaultPartial.Filter>;
    readonly optionalObjectProperty?: $MaybeFilter<AnonymousObject.Filter>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredStringProperty?: $StringFilter;
  };

  export const fromRdfResource: $FromRdfResourceFunction<RootObject.Discriminated> =
    $wrap_FromRdfResourceFunction(RootObject._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    RootObject.Discriminated,
    typeof RootObject.schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => RootObject.fromRdfResource(resource, options)),
    );

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
        resolve: (source) => NTriplesIdentifier.stringify(source.$identifier()),
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
        description: '"Optional object property with anonymous object"',
        name: "optionalObjectProperty",
        resolve: (source, _args) =>
          source.optionalObjectProperty.extractNullable(),
        type: new GraphQLNonNull(AnonymousObject.GraphQL),
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
  }

  export const isRootObject = (
    object: $Object,
  ): object is RootObject.Discriminated => object.$type === "RootObject";

  export const schema = {
    properties: {
      $identifier: { kind: "Identifier", type: { kind: "Iri" as const } },
      $rdfType: {
        fromRdfType: dataFactory.namedNode("http://example.com/RootObject"),
        kind: "RdfType",
        toRdfTypes: [dataFactory.namedNode("http://example.com/RootObject")],
      },
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
        get type() {
          return {
            kind: "Option" as const,
            get itemType() {
              return AnonymousObject.schema;
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

  export type Schema = typeof schema;

  export const toRdfResource: $ToRdfResourceFunction<
    RootObject.Identifier,
    RootObject
  > = $wrap_ToRdfResourceFunction<RootObject.Identifier, RootObject>(
    RootObject._toRdfResource,
  );

  export const toRdfResourceValues: $ToRdfResourceValuesFunction<
    RootObject,
    NamedNode
  > = (value, options) => [
    RootObject.toRdfResource(value, {
      graph: options.graph,
      resourceSet: options.resourceSet,
    }).identifier,
  ];

  export const toStringRecord: $ToStringRecordFunction<
    Pick<RootObject, "$identifier">
  > = (_rootObject) =>
    $compactRecord({ $identifier: _rootObject.$identifier().toString() });
}

export type UnionMember1 = {
  readonly $identifier: () => UnionMember1.Identifier;

  /**
   * Optional number property
   */
  readonly optionalNumberProperty: Maybe<number>;
};

export namespace UnionMember1 {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    UnionMember1.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: UnionMember1.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      $rdfType: !options.ignoreRdfType
        ? $ensureRdfResourceType(
            resource,
            [UnionMember1.schema.properties.$rdfType.fromRdfType],
            {
              graph: options.graph,
            },
          )
        : Right(true as const),
      optionalNumberProperty: $shaclPropertyFromRdf<
        Maybe<number>,
        $MaybeSchema<$NumericSchema<number>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: LazyObject.schema.properties.optionalNumberProperty,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          number,
          $NumericSchema<number>
        >($floatFromRdfResourceValues<number>),
      }),
    }).chain((properties) => UnionMember1.create(properties));

  export const _toRdfResource: $_ToRdfResourceFunction<
    UnionMember1.Identifier,
    UnionMember1
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $rdf_type,
        UnionMember1.schema.properties.$rdfType.toRdfTypes,
        parameters.graph,
      );
    }
    parameters.resource.add(
      LazyObject.schema.properties.optionalNumberProperty.path,
      parameters.object.optionalNumberProperty
        .toList()
        .flatMap((value) => [$literalFactory.number(value, $xsd_double)]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const $toString: $ToStringFunction<
    Pick<UnionMember1, "$identifier">
  > = (_unionMember1) =>
    `UnionMember1(${JSON.stringify(UnionMember1.toStringRecord(_unionMember1))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: UnionMember1.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, UnionMember1.Discriminated> = (parameters?) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters?.$identifier,
        parameters?.$defaultNamespace,
      ),
      $type: Right("UnionMember1" as const),
      optionalNumberProperty: $convertToMaybe($identityConversionFunction)(
        parameters?.optionalNumberProperty,
        parameters?.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          LazyObject.schema.properties.optionalNumberProperty.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: UnionMember1.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => UnionMember1.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly optionalNumberProperty?: number | Maybe<number>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: UnionMember1.CreateParameters<$DefaultNamespaceT>,
  ) => UnionMember1.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = UnionMember1 & { readonly $type: "UnionMember1" };

  export const filter: $FilterFunction<UnionMember1.Filter, UnionMember1> = (
    filter,
    value,
  ) => {
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

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalNumberProperty?: $MaybeFilter<$NumericFilter<number>>;
  };

  export const fromRdfResource: $FromRdfResourceFunction<UnionMember1.Discriminated> =
    $wrap_FromRdfResourceFunction(UnionMember1._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    UnionMember1.Discriminated,
    typeof UnionMember1.schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => UnionMember1.fromRdfResource(resource, options)),
    );

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
        resolve: (source) => NTriplesIdentifier.stringify(source.$identifier()),
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
  }

  export const isUnionMember1 = (
    object: $Object,
  ): object is UnionMember1.Discriminated => object.$type === "UnionMember1";

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
      $rdfType: {
        fromRdfType: dataFactory.namedNode("http://example.com/UnionMember1"),
        kind: "RdfType",
        toRdfTypes: [dataFactory.namedNode("http://example.com/UnionMember1")],
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

  export type Schema = typeof schema;

  export const toRdfResource: $ToRdfResourceFunction<
    UnionMember1.Identifier,
    UnionMember1
  > = $wrap_ToRdfResourceFunction<UnionMember1.Identifier, UnionMember1>(
    UnionMember1._toRdfResource,
  );

  export const toRdfResourceValues: $ToRdfResourceValuesFunction<
    UnionMember1,
    BlankNode | NamedNode
  > = (value, options) => [
    UnionMember1.toRdfResource(value, {
      graph: options.graph,
      resourceSet: options.resourceSet,
    }).identifier,
  ];

  export const toStringRecord: $ToStringRecordFunction<
    Pick<UnionMember1, "$identifier">
  > = (_unionMember1) =>
    $compactRecord({ $identifier: _unionMember1.$identifier().toString() });
}

export type UnionMember2 = {
  readonly $identifier: () => UnionMember2.Identifier;

  /**
   * Optional string property
   */
  readonly optionalStringProperty: Maybe<string>;
};

export namespace UnionMember2 {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    UnionMember2.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: UnionMember2.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      $rdfType: !options.ignoreRdfType
        ? $ensureRdfResourceType(
            resource,
            [UnionMember2.schema.properties.$rdfType.fromRdfType],
            {
              graph: options.graph,
            },
          )
        : Right(true as const),
      optionalStringProperty: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: LazyObject.schema.properties.optionalStringProperty,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
    }).chain((properties) => UnionMember2.create(properties));

  export const _toRdfResource: $_ToRdfResourceFunction<
    UnionMember2.Identifier,
    UnionMember2
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $rdf_type,
        UnionMember2.schema.properties.$rdfType.toRdfTypes,
        parameters.graph,
      );
    }
    parameters.resource.add(
      LazyObject.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const $toString: $ToStringFunction<
    Pick<UnionMember2, "$identifier">
  > = (_unionMember2) =>
    `UnionMember2(${JSON.stringify(UnionMember2.toStringRecord(_unionMember2))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: UnionMember2.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, UnionMember2.Discriminated> = (parameters?) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters?.$identifier,
        parameters?.$defaultNamespace,
      ),
      $type: Right("UnionMember2" as const),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters?.optionalStringProperty,
        parameters?.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          LazyObject.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: UnionMember2.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => UnionMember2.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly optionalStringProperty?: string | Maybe<string>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: UnionMember2.CreateParameters<$DefaultNamespaceT>,
  ) => UnionMember2.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = UnionMember2 & { readonly $type: "UnionMember2" };

  export const filter: $FilterFunction<UnionMember2.Filter, UnionMember2> = (
    filter,
    value,
  ) => {
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

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
  };

  export const fromRdfResource: $FromRdfResourceFunction<UnionMember2.Discriminated> =
    $wrap_FromRdfResourceFunction(UnionMember2._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    UnionMember2.Discriminated,
    typeof UnionMember2.schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => UnionMember2.fromRdfResource(resource, options)),
    );

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
        resolve: (source) => NTriplesIdentifier.stringify(source.$identifier()),
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
  }

  export const isUnionMember2 = (
    object: $Object,
  ): object is UnionMember2.Discriminated => object.$type === "UnionMember2";

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
      $rdfType: {
        fromRdfType: dataFactory.namedNode("http://example.com/UnionMember2"),
        kind: "RdfType",
        toRdfTypes: [dataFactory.namedNode("http://example.com/UnionMember2")],
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

  export type Schema = typeof schema;

  export const toRdfResource: $ToRdfResourceFunction<
    UnionMember2.Identifier,
    UnionMember2
  > = $wrap_ToRdfResourceFunction<UnionMember2.Identifier, UnionMember2>(
    UnionMember2._toRdfResource,
  );

  export const toRdfResourceValues: $ToRdfResourceValuesFunction<
    UnionMember2,
    BlankNode | NamedNode
  > = (value, options) => [
    UnionMember2.toRdfResource(value, {
      graph: options.graph,
      resourceSet: options.resourceSet,
    }).identifier,
  ];

  export const toStringRecord: $ToStringRecordFunction<
    Pick<UnionMember2, "$identifier">
  > = (_unionMember2) =>
    $compactRecord({ $identifier: _unionMember2.$identifier().toString() });
}

export type Union = UnionMember1.Discriminated | UnionMember2.Discriminated;

export namespace Union {
  export const $toString: $ToStringFunction<Union> = (value) => {
    if (value["$type"] === "UnionMember1") {
      return UnionMember1.$toString(value);
    }
    if (value["$type"] === "UnionMember2") {
      return UnionMember2.$toString(value);
    }

    throw new Error("unable to serialize to string");
  };

  export const filter: $FilterFunction<Union.Filter, Union> = (
    filter,
    value,
  ) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.on?.["UnionMember1"] !== undefined &&
      value["$type"] === "UnionMember1"
    ) {
      if (!UnionMember1.filter(filter.on["UnionMember1"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["UnionMember2"] !== undefined &&
      value["$type"] === "UnionMember2"
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

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    Union,
    typeof Union.schema
  > = (inputValues, options) => {
    const memberInputValues: Resource.Values[] = Array.from({ length: 2 }).map(
      () =>
        Resource.Values.empty({
          focusResource: inputValues.focusResource,
          propertyPath: inputValues.propertyPath,
        }),
    );
    for (const inputValue of inputValues) {
      const inputValueAsValues = inputValue.toValues();
      let memberOutputValuesEither: Either<Error, unknown> | undefined;
      for (let memberI = 0; memberI < 2; memberI++) {
        if (memberI === 0) {
          memberOutputValuesEither = UnionMember1.fromRdfResourceValues(
            inputValueAsValues,
            {
              ...options,
              ignoreRdfType: false,
              schema: options.schema.members["UnionMember1"].type,
            },
          );
          if (memberOutputValuesEither.isRight()) {
            memberInputValues[memberI] =
              memberInputValues[memberI].concat(inputValue);
            break;
          }
        } else if (memberI === 1) {
          memberOutputValuesEither = UnionMember2.fromRdfResourceValues(
            inputValueAsValues,
            {
              ...options,
              ignoreRdfType: false,
              schema: options.schema.members["UnionMember2"].type,
            },
          );
          if (memberOutputValuesEither.isRight()) {
            memberInputValues[memberI] =
              memberInputValues[memberI].concat(inputValue);
            break;
          }
        }
      }
      if (memberOutputValuesEither!.isLeft()) {
        return memberOutputValuesEither;
      }
    }

    let collectedOutputValues: Resource.Values<Union> = Resource.Values.empty({
      focusResource: inputValues.focusResource,
      propertyPath: inputValues.propertyPath,
    });
    for (let memberI = 0; memberI < 2; memberI++) {
      if (memberInputValues[memberI].length === 0) {
        continue;
      }
      switch (memberI) {
        case 0:
          collectedOutputValues = collectedOutputValues.concat(
            ...UnionMember1.fromRdfResourceValues(memberInputValues[memberI], {
              ...options,
              ignoreRdfType: false,
              schema: options.schema.members["UnionMember1"].type,
            }).unsafeCoerce(),
          );
          break;
        case 1:
          collectedOutputValues = collectedOutputValues.concat(
            ...UnionMember2.fromRdfResourceValues(memberInputValues[memberI], {
              ...options,
              ignoreRdfType: false,
              schema: options.schema.members["UnionMember2"].type,
            }).unsafeCoerce(),
          );
          break;
      }
    }
    return Right(collectedOutputValues);
  };

  export const GraphQL = new GraphQLUnionType({
    description: undefined,
    name: "Union",
    resolveType: (value: Union) => value.$type,
    types: [UnionMember1.GraphQL, UnionMember2.GraphQL],
  });

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export function isUnion(object: $Object): object is Union {
    return (
      UnionMember1.isUnionMember1(object) || UnionMember2.isUnionMember2(object)
    );
  }

  export const schema = {
    kind: "ObjectDiscriminatedUnion" as const,
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

  export const toRdfResource: $ToRdfResourceFunction<
    Union.Identifier,
    Union
  > = (object, options) => {
    if (UnionMember1.isUnionMember1(object)) {
      return UnionMember1.toRdfResource(object, options);
    }
    if (UnionMember2.isUnionMember2(object)) {
      return UnionMember2.toRdfResource(object, options);
    }
    throw new Error("unrecognized type");
  };

  export const toRdfResourceValues: $ToRdfResourceValuesFunction<
    Union,
    BlankNode | NamedNode
  > = (value, _options): (BlankNode | NamedNode)[] => {
    if (value["$type"] === "UnionMember1") {
      return UnionMember1.toRdfResourceValues(value, {
        graph: _options.graph,
        propertyPath: _options.propertyPath,
        resource: _options.resource,
        resourceSet: _options.resourceSet,
      });
    }
    if (value["$type"] === "UnionMember2") {
      return UnionMember2.toRdfResourceValues(value, {
        graph: _options.graph,
        propertyPath: _options.propertyPath,
        resource: _options.resource,
        resourceSet: _options.resourceSet,
      });
    }

    throw new Error("unable to serialize to RDF");
  };
}

export type $Object =
  | $DefaultPartial.Discriminated
  | AnonymousObject.Discriminated
  | LazyObject.Discriminated
  | RootObject.Discriminated
  | UnionMember1.Discriminated
  | UnionMember2.Discriminated;

export namespace $Object {
  export const toRdfResource: $ToRdfResourceFunction<
    Resource.Identifier,
    $Object
  > = (object, options) => {
    switch (object.$type) {
      case "DefaultPartial":
        return $DefaultPartial.toRdfResource(object, options);
      case "AnonymousObject":
        return AnonymousObject.toRdfResource(object, options);
      case "LazyObject":
        return LazyObject.toRdfResource(object, options);
      case "RootObject":
        return RootObject.toRdfResource(object, options);
      case "UnionMember1":
        return UnionMember1.toRdfResource(object, options);
      case "UnionMember2":
        return UnionMember2.toRdfResource(object, options);
      default:
        object satisfies never;
        throw new Error("should never reach this point");
    }
  };

  export function $toString(object: $Object) {
    switch (object.$type) {
      case "DefaultPartial":
        return $DefaultPartial.$toString(object);
      case "AnonymousObject":
        return AnonymousObject.$toString(object);
      case "LazyObject":
        return LazyObject.$toString(object);
      case "RootObject":
        return RootObject.$toString(object);
      case "UnionMember1":
        return UnionMember1.$toString(object);
      case "UnionMember2":
        return UnionMember2.$toString(object);
      default:
        object satisfies never;
        throw new Error("should never reach this point");
    }
  }
}

export interface $ObjectSet {
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
    return this.#objectDiscriminatedUnionsSync<
      Union,
      Union.Filter,
      Union.Identifier
    >(
      [
        {
          filter: Union.filter,
          fromRdfResource: UnionMember1.fromRdfResource,
          fromRdfTypes: [UnionMember1.schema.properties.$rdfType.fromRdfType],
        },
        {
          filter: Union.filter,
          fromRdfResource: UnionMember2.fromRdfResource,
          fromRdfTypes: [UnionMember2.schema.properties.$rdfType.fromRdfType],
        },
      ],
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
        fromRdfTypes: [LazyObject.schema.properties.$rdfType.fromRdfType],
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
        fromRdfTypes: [RootObject.schema.properties.$rdfType.fromRdfType],
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
        fromRdfTypes: [UnionMember1.schema.properties.$rdfType.fromRdfType],
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
        fromRdfTypes: [UnionMember2.schema.properties.$rdfType.fromRdfType],
      },
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
            .map(NTriplesIdentifier.stringify),
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
            .map(NTriplesIdentifier.stringify),
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
            .map(NTriplesIdentifier.stringify),
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
            .map(NTriplesIdentifier.stringify),
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
            .map(NTriplesIdentifier.stringify),
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

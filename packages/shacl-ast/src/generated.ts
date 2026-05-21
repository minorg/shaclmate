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
import { Either, Left, Maybe, Right } from "purify-ts";

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

interface $BooleanFilter {
  readonly value?: boolean;
}

type $CollectionFilter<ItemFilterT> = ItemFilterT & {
  readonly $maxCount?: number;
  readonly $minCount?: number;
};

interface $CollectionSchema<ItemSchemaT> {
  readonly item: () => ItemSchemaT;
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

function $convertToArray<ItemSourceT, ItemTargetT, Readonly extends boolean>(
  convertToItem: $ConversionFunction<ItemSourceT, ItemTargetT>,
  _readonly: Readonly,
) {
  type EitherR = Readonly extends true
    ? ReadonlyArray<ItemTargetT>
    : Array<ItemTargetT>;
  return (value: readonly ItemSourceT[] | undefined): Either<Error, EitherR> =>
    (typeof value === "undefined"
      ? Either.of([])
      : Either.sequence(value.map(convertToItem))) as Either<Error, EitherR>;
}

function $convertToIdentifier(
  value: BlankNode | NamedNode | string | undefined,
): Either<Error, BlankNode | NamedNode> {
  switch (typeof value) {
    case "object":
      return Either.of(value);
    case "string":
      return Either.of(dataFactory.namedNode(value));
    case "undefined":
      return Either.of(dataFactory.blankNode());
  }
}

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

function $convertToIri<IriT extends string = string>(
  value: IriT | NamedNode<IriT>,
): Either<Error, NamedNode<IriT>> {
  switch (typeof value) {
    case "object":
      return Either.of(value);
    case "string":
      return Either.of(dataFactory.namedNode<IriT>(value));
  }
}

function $convertToLiteral(
  value: bigint | boolean | Date | number | string | Literal,
): Either<Error, Literal> {
  if (typeof value === "object") {
    if (value instanceof Date) {
      return Either.of($literalFactory.date(value));
    }
    return Either.of(value);
  }

  return Either.of($literalFactory.primitive(value));
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

function $filterBoolean(filter: $BooleanFilter, value: boolean) {
  if (filter.value !== undefined && value !== filter.value) {
    return false;
  }

  return true;
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

function $filterLiteral(filter: $LiteralFilter, value: Literal): boolean {
  return $filterTerm(filter, value);
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

function $filterTerm(
  filter: $TermFilter,
  value: BlankNode | Literal | NamedNode,
): boolean {
  if (
    filter.datatypeIn !== undefined &&
    (value.termType !== "Literal" ||
      !filter.datatypeIn.some((inDatatype) =>
        inDatatype.equals(value.datatype),
      ))
  ) {
    return false;
  }

  if (
    filter.in !== undefined &&
    !filter.in.some((inTerm) => inTerm.equals(value))
  ) {
    return false;
  }

  if (
    filter.languageIn !== undefined &&
    (value.termType !== "Literal" ||
      !filter.languageIn.some((inLanguage) => inLanguage === value.language))
  ) {
    return false;
  }

  if (
    filter.typeIn !== undefined &&
    !filter.typeIn.some((inType) => inType === value.termType)
  ) {
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

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

interface $LiteralFilter extends Omit<$TermFilter, "in" | "type"> {
  readonly in?: readonly Literal[];
}

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

interface $MaybeSchema<ItemSchemaT> {
  readonly item: () => ItemSchemaT;
  readonly kind: "Maybe";
}

interface $NumericFilter<T> {
  readonly in?: readonly T[];
  readonly maxExclusive?: T;
  readonly maxInclusive?: T;
  readonly minExclusive?: T;
  readonly minInclusive?: T;
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

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
  readonly type: () => TypeSchemaT;
}

interface $StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}

interface $TermFilter {
  readonly datatypeIn?: readonly NamedNode[];
  readonly in?: readonly (Literal | NamedNode)[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
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

function $validateArray<ItemSchemaT, ItemValueT, Readonly extends boolean>(
  validateItem: $ValidationFunction<ItemSchemaT, ItemValueT>,
  _readonly: Readonly,
) {
  type EitherR = Readonly extends true
    ? ReadonlyArray<ItemValueT>
    : Array<ItemValueT>;
  return (
    schema: $CollectionSchema<ItemSchemaT>,
    valueArray: readonly ItemValueT[],
  ): Either<Error, EitherR> => {
    if (schema.minCount !== undefined && valueArray.length < schema.minCount) {
      return Left(
        new Error(
          `value array has length (${valueArray.length}) less than minCount (${schema.minCount})`,
        ),
      ) as Either<Error, EitherR>;
    }

    return Either.sequence(
      valueArray.map((value) => validateItem(schema.item(), value)),
    ) as Either<Error, EitherR>;
  };
}

function $validateMaybe<ItemSchemaT, ItemValueT>(
  validateItem: $ValidationFunction<ItemSchemaT, ItemValueT>,
) {
  return (
    schema: $MaybeSchema<ItemSchemaT>,
    valueMaybe: Maybe<ItemValueT>,
  ): Either<Error, Maybe<ItemValueT>> =>
    valueMaybe
      .map((value) => validateItem(schema.item(), value).map(() => valueMaybe))
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
    let {
      context,
      graph,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return _fromRdfResourceFunction(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
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
export interface PropertyShape {
  readonly $identifier: () => PropertyShape.Identifier;
  readonly $type: "PropertyShape";
  readonly and: Maybe<readonly (BlankNode | NamedNode)[]>;
  readonly classes: readonly NamedNode[];
  readonly comment: Maybe<string>;
  readonly datatype: Maybe<NamedNode>;
  readonly deactivated: Maybe<boolean>;
  readonly defaultValue: Maybe<NamedNode | Literal>;
  readonly description: Maybe<string>;
  readonly flags: readonly string[];
  readonly groups: readonly (BlankNode | NamedNode)[];
  readonly hasValues: readonly (NamedNode | Literal)[];
  readonly in_: Maybe<readonly (NamedNode | Literal)[]>;
  readonly isDefinedBy: Maybe<BlankNode | NamedNode>;
  readonly label: Maybe<string>;
  readonly languageIn: Maybe<readonly string[]>;
  readonly maxCount: Maybe<bigint>;
  readonly maxExclusive: Maybe<Literal>;
  readonly maxInclusive: Maybe<Literal>;
  readonly maxLength: Maybe<bigint>;
  readonly minCount: Maybe<bigint>;
  readonly minExclusive: Maybe<Literal>;
  readonly minInclusive: Maybe<Literal>;
  readonly minLength: Maybe<bigint>;
  readonly name: Maybe<string>;
  readonly node: Maybe<BlankNode | NamedNode>;
  readonly nodeKind: Maybe<
    NamedNode<
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
    >
  >;
  readonly not: readonly (BlankNode | NamedNode)[];
  readonly or: Maybe<readonly (BlankNode | NamedNode)[]>;
  readonly order: Maybe<number>;
  readonly path: $PropertyPath;
  readonly patterns: readonly string[];
  readonly uniqueLang: Maybe<boolean>;
  readonly xone: Maybe<readonly (BlankNode | NamedNode)[]>;
}

export namespace PropertyShape {
  export function create(parameters: {
    readonly $identifier?:
      | (() => PropertyShape.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly and?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly classes?: readonly (string | NamedNode)[];
    readonly comment?: string | Maybe<string>;
    readonly datatype?: string | NamedNode | Maybe<NamedNode>;
    readonly deactivated?: boolean | Maybe<boolean>;
    readonly defaultValue?: (NamedNode | Literal) | Maybe<NamedNode | Literal>;
    readonly description?: string | Maybe<string>;
    readonly flags?: readonly string[];
    readonly groups?: readonly (BlankNode | NamedNode | string | undefined)[];
    readonly hasValues?: readonly (NamedNode | Literal)[];
    readonly in_?:
      | readonly (NamedNode | Literal)[]
      | Maybe<readonly (NamedNode | Literal)[]>;
    readonly isDefinedBy?:
      | BlankNode
      | NamedNode
      | string
      | Maybe<BlankNode | NamedNode>;
    readonly label?: string | Maybe<string>;
    readonly languageIn?: readonly string[] | Maybe<readonly string[]>;
    readonly maxCount?: bigint | Maybe<bigint>;
    readonly maxExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxLength?: bigint | Maybe<bigint>;
    readonly minCount?: bigint | Maybe<bigint>;
    readonly minExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minLength?: bigint | Maybe<bigint>;
    readonly name?: string | Maybe<string>;
    readonly node?:
      | BlankNode
      | NamedNode
      | string
      | Maybe<BlankNode | NamedNode>;
    readonly nodeKind?:
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
      | NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      | Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >;
    readonly not?: readonly (BlankNode | NamedNode | string | undefined)[];
    readonly or?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly order?: number | Maybe<number>;
    readonly path: $PropertyPath;
    readonly patterns?: readonly string[];
    readonly uniqueLang?: boolean | Maybe<boolean>;
    readonly xone?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
  }): Either<Error, PropertyShape> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters.$identifier),
      and: $convertToMaybe($convertToArray($convertToIdentifier, true))(
        parameters.and,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.and.type(),
          value,
        ),
      ),
      classes: $convertToArray(
        $convertToIri<string>,
        true,
      )(parameters.classes).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.classes.type(),
          value,
        ),
      ),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters.comment,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.comment.type(),
          value,
        ),
      ),
      datatype: $convertToMaybe($convertToIri<string>)(
        parameters.datatype,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.datatype.type(),
          value,
        ),
      ),
      deactivated: $convertToMaybe($identityConversionFunction)(
        parameters.deactivated,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.deactivated.type(),
          value,
        ),
      ),
      defaultValue: $convertToMaybe($identityConversionFunction)(
        parameters.defaultValue,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.defaultValue.type(),
          value,
        ),
      ),
      description: $convertToMaybe($identityConversionFunction)(
        parameters.description,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.description.type(),
          value,
        ),
      ),
      flags: $convertToArray(
        $identityConversionFunction,
        true,
      )(parameters.flags).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.flags.type(),
          value,
        ),
      ),
      groups: $convertToArray(
        $convertToIdentifier,
        true,
      )(parameters.groups).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.groups.type(),
          value,
        ),
      ),
      hasValues: $convertToArray(
        $identityConversionFunction,
        true,
      )(parameters.hasValues).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.hasValues.type(),
          value,
        ),
      ),
      in_: $convertToMaybe($convertToArray($identityConversionFunction, true))(
        parameters.in_,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.in_.type(),
          value,
        ),
      ),
      isDefinedBy: $convertToMaybe($convertToIdentifier)(
        parameters.isDefinedBy,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.isDefinedBy.type(),
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters.label,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.label.type(),
          value,
        ),
      ),
      languageIn: $convertToMaybe(
        $convertToArray($identityConversionFunction, true),
      )(parameters.languageIn).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.languageIn.type(),
          value,
        ),
      ),
      maxCount: $convertToMaybe($identityConversionFunction)(
        parameters.maxCount,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.maxCount.type(),
          value,
        ),
      ),
      maxExclusive: $convertToMaybe($convertToLiteral)(
        parameters.maxExclusive,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.maxExclusive.type(),
          value,
        ),
      ),
      maxInclusive: $convertToMaybe($convertToLiteral)(
        parameters.maxInclusive,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.maxInclusive.type(),
          value,
        ),
      ),
      maxLength: $convertToMaybe($identityConversionFunction)(
        parameters.maxLength,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.maxLength.type(),
          value,
        ),
      ),
      minCount: $convertToMaybe($identityConversionFunction)(
        parameters.minCount,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.minCount.type(),
          value,
        ),
      ),
      minExclusive: $convertToMaybe($convertToLiteral)(
        parameters.minExclusive,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.minExclusive.type(),
          value,
        ),
      ),
      minInclusive: $convertToMaybe($convertToLiteral)(
        parameters.minInclusive,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.minInclusive.type(),
          value,
        ),
      ),
      minLength: $convertToMaybe($identityConversionFunction)(
        parameters.minLength,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.minLength.type(),
          value,
        ),
      ),
      name: $convertToMaybe($identityConversionFunction)(parameters.name).chain(
        (value) =>
          $validateMaybe($identityValidationFunction)(
            PropertyShape.schema.properties.name.type(),
            value,
          ),
      ),
      node: $convertToMaybe($convertToIdentifier)(parameters.node).chain(
        (value) =>
          $validateMaybe($identityValidationFunction)(
            PropertyShape.schema.properties.node.type(),
            value,
          ),
      ),
      nodeKind: $convertToMaybe(
        $convertToIri<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >,
      )(parameters.nodeKind).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.nodeKind.type(),
          value,
        ),
      ),
      not: $convertToArray(
        $convertToIdentifier,
        true,
      )(parameters.not).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.not.type(),
          value,
        ),
      ),
      or: $convertToMaybe($convertToArray($convertToIdentifier, true))(
        parameters.or,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.or.type(),
          value,
        ),
      ),
      order: $convertToMaybe($identityConversionFunction)(
        parameters.order,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.order.type(),
          value,
        ),
      ),
      path: Either.of(parameters.path),
      patterns: $convertToArray(
        $identityConversionFunction,
        true,
      )(parameters.patterns).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.patterns.type(),
          value,
        ),
      ),
      uniqueLang: $convertToMaybe($identityConversionFunction)(
        parameters.uniqueLang,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.uniqueLang.type(),
          value,
        ),
      ),
      xone: $convertToMaybe($convertToArray($convertToIdentifier, true))(
        parameters.xone,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.xone.type(),
          value,
        ),
      ),
    }).map((properties) => {
      const finalObject = { ...properties, $type: "PropertyShape" as const };
      if (
        !globalThis.Object.prototype.hasOwnProperty.call(
          finalObject,
          "toString",
        )
      ) {
        (finalObject as any).toString = $toString;
      }
      return finalObject;
    });
  }

  export function createUnsafe(parameters: {
    readonly $identifier?:
      | (() => PropertyShape.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly and?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly classes?: readonly (string | NamedNode)[];
    readonly comment?: string | Maybe<string>;
    readonly datatype?: string | NamedNode | Maybe<NamedNode>;
    readonly deactivated?: boolean | Maybe<boolean>;
    readonly defaultValue?: (NamedNode | Literal) | Maybe<NamedNode | Literal>;
    readonly description?: string | Maybe<string>;
    readonly flags?: readonly string[];
    readonly groups?: readonly (BlankNode | NamedNode | string | undefined)[];
    readonly hasValues?: readonly (NamedNode | Literal)[];
    readonly in_?:
      | readonly (NamedNode | Literal)[]
      | Maybe<readonly (NamedNode | Literal)[]>;
    readonly isDefinedBy?:
      | BlankNode
      | NamedNode
      | string
      | Maybe<BlankNode | NamedNode>;
    readonly label?: string | Maybe<string>;
    readonly languageIn?: readonly string[] | Maybe<readonly string[]>;
    readonly maxCount?: bigint | Maybe<bigint>;
    readonly maxExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxLength?: bigint | Maybe<bigint>;
    readonly minCount?: bigint | Maybe<bigint>;
    readonly minExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minLength?: bigint | Maybe<bigint>;
    readonly name?: string | Maybe<string>;
    readonly node?:
      | BlankNode
      | NamedNode
      | string
      | Maybe<BlankNode | NamedNode>;
    readonly nodeKind?:
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
      | NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      | Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >;
    readonly not?: readonly (BlankNode | NamedNode | string | undefined)[];
    readonly or?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly order?: number | Maybe<number>;
    readonly path: $PropertyPath;
    readonly patterns?: readonly string[];
    readonly uniqueLang?: boolean | Maybe<boolean>;
    readonly xone?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
  }): PropertyShape {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(
    filter: PropertyShape.Filter,
    value: PropertyShape,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.and !== undefined &&
      !$filterMaybe<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.and, value.and)
    ) {
      return false;
    }
    if (
      filter.classes !== undefined &&
      !$filterArray<NamedNode, $IriFilter>($filterIri)(
        filter.classes,
        value.classes,
      )
    ) {
      return false;
    }
    if (
      filter.comment !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.comment,
        value.comment,
      )
    ) {
      return false;
    }
    if (
      filter.datatype !== undefined &&
      !$filterMaybe<NamedNode, $IriFilter>($filterIri)(
        filter.datatype,
        value.datatype,
      )
    ) {
      return false;
    }
    if (
      filter.deactivated !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.deactivated,
        value.deactivated,
      )
    ) {
      return false;
    }
    if (
      filter.defaultValue !== undefined &&
      !$filterMaybe<NamedNode | Literal, $TermFilter>($filterTerm)(
        filter.defaultValue,
        value.defaultValue,
      )
    ) {
      return false;
    }
    if (
      filter.description !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.description,
        value.description,
      )
    ) {
      return false;
    }
    if (
      filter.flags !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.flags,
        value.flags,
      )
    ) {
      return false;
    }
    if (
      filter.groups !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.groups, value.groups)
    ) {
      return false;
    }
    if (
      filter.hasValues !== undefined &&
      !$filterArray<NamedNode | Literal, $TermFilter>($filterTerm)(
        filter.hasValues,
        value.hasValues,
      )
    ) {
      return false;
    }
    if (
      filter.in_ !== undefined &&
      !$filterMaybe<
        readonly (NamedNode | Literal)[],
        $CollectionFilter<$TermFilter>
      >($filterArray<NamedNode | Literal, $TermFilter>($filterTerm))(
        filter.in_,
        value.in_,
      )
    ) {
      return false;
    }
    if (
      filter.isDefinedBy !== undefined &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.isDefinedBy, value.isDefinedBy)
    ) {
      return false;
    }
    if (
      filter.label !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.label,
        value.label,
      )
    ) {
      return false;
    }
    if (
      filter.languageIn !== undefined &&
      !$filterMaybe<readonly string[], $CollectionFilter<$StringFilter>>(
        $filterArray<string, $StringFilter>($filterString),
      )(filter.languageIn, value.languageIn)
    ) {
      return false;
    }
    if (
      filter.maxCount !== undefined &&
      !$filterMaybe<bigint, $NumericFilter<bigint>>($filterNumeric<bigint>)(
        filter.maxCount,
        value.maxCount,
      )
    ) {
      return false;
    }
    if (
      filter.maxExclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.maxExclusive,
        value.maxExclusive,
      )
    ) {
      return false;
    }
    if (
      filter.maxInclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.maxInclusive,
        value.maxInclusive,
      )
    ) {
      return false;
    }
    if (
      filter.maxLength !== undefined &&
      !$filterMaybe<bigint, $NumericFilter<bigint>>($filterNumeric<bigint>)(
        filter.maxLength,
        value.maxLength,
      )
    ) {
      return false;
    }
    if (
      filter.minCount !== undefined &&
      !$filterMaybe<bigint, $NumericFilter<bigint>>($filterNumeric<bigint>)(
        filter.minCount,
        value.minCount,
      )
    ) {
      return false;
    }
    if (
      filter.minExclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.minExclusive,
        value.minExclusive,
      )
    ) {
      return false;
    }
    if (
      filter.minInclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.minInclusive,
        value.minInclusive,
      )
    ) {
      return false;
    }
    if (
      filter.minLength !== undefined &&
      !$filterMaybe<bigint, $NumericFilter<bigint>>($filterNumeric<bigint>)(
        filter.minLength,
        value.minLength,
      )
    ) {
      return false;
    }
    if (
      filter.name !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.name,
        value.name,
      )
    ) {
      return false;
    }
    if (
      filter.node !== undefined &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.node, value.node)
    ) {
      return false;
    }
    if (
      filter.nodeKind !== undefined &&
      !$filterMaybe<
        NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >,
        $IriFilter
      >($filterIri)(filter.nodeKind, value.nodeKind)
    ) {
      return false;
    }
    if (
      filter.not !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.not, value.not)
    ) {
      return false;
    }
    if (
      filter.or !== undefined &&
      !$filterMaybe<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.or, value.or)
    ) {
      return false;
    }
    if (
      filter.order !== undefined &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.order,
        value.order,
      )
    ) {
      return false;
    }
    if (
      filter.path !== undefined &&
      !$PropertyPath.filter(filter.path, value.path)
    ) {
      return false;
    }
    if (
      filter.patterns !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.patterns,
        value.patterns,
      )
    ) {
      return false;
    }
    if (
      filter.uniqueLang !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.uniqueLang,
        value.uniqueLang,
      )
    ) {
      return false;
    }
    if (
      filter.xone !== undefined &&
      !$filterMaybe<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.xone, value.xone)
    ) {
      return false;
    }
    return true;
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly and?: $MaybeFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly classes?: $CollectionFilter<$IriFilter>;
    readonly comment?: $MaybeFilter<$StringFilter>;
    readonly datatype?: $MaybeFilter<$IriFilter>;
    readonly deactivated?: $MaybeFilter<$BooleanFilter>;
    readonly defaultValue?: $MaybeFilter<$TermFilter>;
    readonly description?: $MaybeFilter<$StringFilter>;
    readonly flags?: $CollectionFilter<$StringFilter>;
    readonly groups?: $CollectionFilter<$IdentifierFilter>;
    readonly hasValues?: $CollectionFilter<$TermFilter>;
    readonly in_?: $MaybeFilter<$CollectionFilter<$TermFilter>>;
    readonly isDefinedBy?: $MaybeFilter<$IdentifierFilter>;
    readonly label?: $MaybeFilter<$StringFilter>;
    readonly languageIn?: $MaybeFilter<$CollectionFilter<$StringFilter>>;
    readonly maxCount?: $MaybeFilter<$NumericFilter<bigint>>;
    readonly maxExclusive?: $MaybeFilter<$LiteralFilter>;
    readonly maxInclusive?: $MaybeFilter<$LiteralFilter>;
    readonly maxLength?: $MaybeFilter<$NumericFilter<bigint>>;
    readonly minCount?: $MaybeFilter<$NumericFilter<bigint>>;
    readonly minExclusive?: $MaybeFilter<$LiteralFilter>;
    readonly minInclusive?: $MaybeFilter<$LiteralFilter>;
    readonly minLength?: $MaybeFilter<$NumericFilter<bigint>>;
    readonly name?: $MaybeFilter<$StringFilter>;
    readonly node?: $MaybeFilter<$IdentifierFilter>;
    readonly nodeKind?: $MaybeFilter<$IriFilter>;
    readonly not?: $CollectionFilter<$IdentifierFilter>;
    readonly or?: $MaybeFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly order?: $MaybeFilter<$NumericFilter<number>>;
    readonly path?: $PropertyPath.Filter;
    readonly patterns?: $CollectionFilter<$StringFilter>;
    readonly uniqueLang?: $MaybeFilter<$BooleanFilter>;
    readonly xone?: $MaybeFilter<$CollectionFilter<$IdentifierFilter>>;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<PropertyShape> = (
    $resource,
    _$options,
  ) => {
    return (
      !_$options.ignoreRdfType
        ? $resource
            .value($RdfVocabularies.rdf.type, { graph: _$options.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyShape":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $resource.isInstanceOf(PropertyShape.fromRdfType, {
                  graph: _$options.graph,
                })
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${$resource.identifier} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
                ),
              );
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
        and: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.and,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.and.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) => value.toIdentifier()),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<readonly (BlankNode | NamedNode)[]>
                    >({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.and.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        classes: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.classes,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.classes.path,
                  value: valuesArray,
                }),
              ),
        }),
        comment: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.comment,
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
                        PropertyShape.schema.properties.comment.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        datatype: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.datatype,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<NamedNode>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.datatype.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        deactivated: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.deactivated,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.deactivated.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        defaultValue: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.defaultValue,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toTerm().chain((term) => {
                    switch (term.termType) {
                      case "NamedNode":
                      case "Literal":
                        return Either.of<Error, NamedNode | Literal>(term);
                      default:
                        return Left<Error, NamedNode | Literal>(
                          new Resource.MistypedTermValueError({
                            actualValue: term,
                            expectedValueType: "(NamedNode | Literal)",
                            focusResource: $resource,
                            propertyPath:
                              PropertyShape.schema.properties.defaultValue.path,
                          }),
                        );
                    }
                  }),
                ),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<NamedNode | Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.defaultValue.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        description: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.description,
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
                        PropertyShape.schema.properties.description.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        flags: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.flags,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.flags.path,
                  value: valuesArray,
                }),
              ),
        }),
        groups: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.groups,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) => value.toIdentifier()),
              )
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.groups.path,
                  value: valuesArray,
                }),
              ),
        }),
        hasValues: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.hasValues,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toTerm().chain((term) => {
                    switch (term.termType) {
                      case "NamedNode":
                      case "Literal":
                        return Either.of<Error, NamedNode | Literal>(term);
                      default:
                        return Left<Error, NamedNode | Literal>(
                          new Resource.MistypedTermValueError({
                            actualValue: term,
                            expectedValueType: "(NamedNode | Literal)",
                            focusResource: $resource,
                            propertyPath:
                              PropertyShape.schema.properties.hasValues.path,
                          }),
                        );
                    }
                  }),
                ),
              )
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.hasValues.path,
                  value: valuesArray,
                }),
              ),
        }),
        in_: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.in_,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.in_.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) =>
                      value.toTerm().chain((term) => {
                        switch (term.termType) {
                          case "NamedNode":
                          case "Literal":
                            return Either.of<Error, NamedNode | Literal>(term);
                          default:
                            return Left<Error, NamedNode | Literal>(
                              new Resource.MistypedTermValueError({
                                actualValue: term,
                                expectedValueType: "(NamedNode | Literal)",
                                focusResource: $resource,
                                propertyPath:
                                  PropertyShape.schema.properties.in_.path,
                              }),
                            );
                        }
                      }),
                    ),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<readonly (NamedNode | Literal)[]>
                    >({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.in_.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        isDefinedBy: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.isDefinedBy,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) => value.toIdentifier()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<BlankNode | NamedNode>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.isDefinedBy.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        label: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.label,
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
                      propertyPath: PropertyShape.schema.properties.label.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        languageIn: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.languageIn,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.languageIn.path,
                      values: valueList.toArray(),
                    }),
                  )
                    .chain((values) =>
                      $fromRdfPreferredLanguages(
                        values,
                        _$options.preferredLanguages,
                      ),
                    )
                    .chain((values) =>
                      values.chainMap((value) => value.toString()),
                    ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<readonly string[]>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.languageIn.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        maxCount: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.maxCount,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBigInt()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<bigint>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.maxCount.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        maxExclusive: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.maxExclusive,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toLiteral()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.maxExclusive.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        maxInclusive: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.maxInclusive,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toLiteral()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.maxInclusive.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        maxLength: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.maxLength,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBigInt()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<bigint>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.maxLength.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        minCount: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.minCount,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBigInt()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<bigint>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.minCount.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        minExclusive: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.minExclusive,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toLiteral()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.minExclusive.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        minInclusive: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.minInclusive,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toLiteral()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.minInclusive.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        minLength: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.minLength,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBigInt()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<bigint>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.minLength.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        name: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.name,
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
                      propertyPath: PropertyShape.schema.properties.name.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        node: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.node,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) => value.toIdentifier()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<BlankNode | NamedNode>>({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.node.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        nodeKind: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.nodeKind,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toIri([
                    dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#BlankNode",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#BlankNodeOrIRI",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#BlankNodeOrLiteral",
                    ),
                    dataFactory.namedNode("http://www.w3.org/ns/shacl#IRI"),
                    dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#IRIOrLiteral",
                    ),
                    dataFactory.namedNode("http://www.w3.org/ns/shacl#Literal"),
                  ]),
                ),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<
                        NamedNode<
                          | "http://www.w3.org/ns/shacl#BlankNode"
                          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                          | "http://www.w3.org/ns/shacl#IRI"
                          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                          | "http://www.w3.org/ns/shacl#Literal"
                        >
                      >
                    >({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.nodeKind.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        not: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.not,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) => value.toIdentifier()),
              )
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.not.path,
                  value: valuesArray,
                }),
              ),
        }),
        or: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.or,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.or.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) => value.toIdentifier()),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<readonly (BlankNode | NamedNode)[]>
                    >({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.or.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        order: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.order,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toFloat()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<number>>({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.order.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        path: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.path,
          typeFromRdf: (resourceValues) =>
            $PropertyPath.fromRdfResourceValues(resourceValues, {
              context: _$options.context,
              graph: _$options.graph,
              objectSet: _$options.objectSet,
              preferredLanguages: _$options.preferredLanguages,
              resource: $resource,
              ignoreRdfType: true,
              propertyPath: PropertyShape.schema.properties.path.path,
            }),
        }),
        patterns: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.patterns,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.patterns.path,
                  value: valuesArray,
                }),
              ),
        }),
        uniqueLang: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.uniqueLang,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.uniqueLang.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        xone: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.xone,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.xone.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) => value.toIdentifier()),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<readonly (BlankNode | NamedNode)[]>
                    >({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.xone.path,
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
    PropertyShape
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) =>
            PropertyShape.fromRdfResource(resource, options),
          ),
      ),
    );

  export const fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );

  export function isPropertyShape(object: $Object): object is PropertyShape {
    switch (object.$type) {
      case "PropertyShape":
        return true;
      default:
        return false;
    }
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["PropertyShape"],
        }),
      },
      and: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comment: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      },
      deactivated: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      },
      defaultValue: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
      },
      description: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      groups: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
      },
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      },
      in_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Term" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      label: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "String" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      },
      maxCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      },
      maxExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      },
      maxInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      },
      maxLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      },
      minCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      },
      minExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      },
      minInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      },
      minLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      },
      name: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
      },
      node: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      nodeKind: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode("http://www.w3.org/ns/shacl#BlankNode"),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrIRI",
              ),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrLiteral",
              ),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRI"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRIOrLiteral"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#Literal"),
            ] as const,
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      },
      not: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      order: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Float" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
      },
      path: {
        kind: "Shacl" as const,
        type: () => $PropertyPath.schema,
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      uniqueLang: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
      },
      xone: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    PropertyShape.Identifier,
    PropertyShape
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyShape"),
        parameters.graph,
      );
    }
    parameters.resource.add(
      PropertyShape.schema.properties.and.path,
      parameters.object.and.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.classes.path,
      parameters.object.classes.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.comment.path,
      parameters.object.comment
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.datatype.path,
      parameters.object.datatype.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.deactivated.path,
      parameters.object.deactivated
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.defaultValue.path,
      parameters.object.defaultValue.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.description.path,
      parameters.object.description
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.flags.path,
      parameters.object.flags.flatMap((item) => [$literalFactory.string(item)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.groups.path,
      parameters.object.groups.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.hasValues.path,
      parameters.object.hasValues.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.in_.path,
      parameters.object.in_.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.isDefinedBy.path,
      parameters.object.isDefinedBy.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.label.path,
      parameters.object.label
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.languageIn.path,
      parameters.object.languageIn.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [$literalFactory.string(item)],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.maxCount.path,
      parameters.object.maxCount
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.maxExclusive.path,
      parameters.object.maxExclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.maxInclusive.path,
      parameters.object.maxInclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.maxLength.path,
      parameters.object.maxLength
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.minCount.path,
      parameters.object.minCount
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.minExclusive.path,
      parameters.object.minExclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.minInclusive.path,
      parameters.object.minInclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.minLength.path,
      parameters.object.minLength
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.name.path,
      parameters.object.name
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.node.path,
      parameters.object.node.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.nodeKind.path,
      parameters.object.nodeKind.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.not.path,
      parameters.object.not.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.or.path,
      parameters.object.or.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.order.path,
      parameters.object.order
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.path.path,
      [
        $PropertyPath.toRdfResource(parameters.object.path, {
          graph: parameters.graph,
          resourceSet: parameters.resourceSet,
        }).identifier,
      ],
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.patterns.path,
      parameters.object.patterns.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.uniqueLang.path,
      parameters.object.uniqueLang
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.xone.path,
      parameters.object.xone.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _propertyShape: PropertyShape,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _propertyShape.$identifier().toString(),
      label: _propertyShape.label.map((item) => item.toString()).extract(),
      name: _propertyShape.name.map((item) => item.toString()).extract(),
      path: $PropertyPath.$toString(_propertyShape.path),
    });
  }

  export function $toString(this: PropertyShape): string;
  export function $toString(_propertyShape: PropertyShape): string;
  export function $toString(
    this: PropertyShape | undefined,
    _propertyShape?: PropertyShape,
  ): string {
    return `PropertyShape(${JSON.stringify(_propertiesToStrings((_propertyShape ?? this)!))})`;
  }
}
export interface PropertyGroup {
  readonly $identifier: () => PropertyGroup.Identifier;
  readonly $type: "PropertyGroup";
  readonly comment: Maybe<string>;
  readonly label: Maybe<string>;
}

export namespace PropertyGroup {
  export function create(parameters?: {
    readonly $identifier?:
      | (() => PropertyGroup.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly comment?: string | Maybe<string>;
    readonly label?: string | Maybe<string>;
  }): Either<Error, PropertyGroup> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters?.comment,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.comment.type(),
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters?.label,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.label.type(),
          value,
        ),
      ),
    }).map((properties) => {
      const finalObject = { ...properties, $type: "PropertyGroup" as const };
      if (
        !globalThis.Object.prototype.hasOwnProperty.call(
          finalObject,
          "toString",
        )
      ) {
        (finalObject as any).toString = $toString;
      }
      return finalObject;
    });
  }

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => PropertyGroup.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly comment?: string | Maybe<string>;
    readonly label?: string | Maybe<string>;
  }): PropertyGroup {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(
    filter: PropertyGroup.Filter,
    value: PropertyGroup,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.comment !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.comment,
        value.comment,
      )
    ) {
      return false;
    }
    if (
      filter.label !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.label,
        value.label,
      )
    ) {
      return false;
    }
    return true;
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly comment?: $MaybeFilter<$StringFilter>;
    readonly label?: $MaybeFilter<$StringFilter>;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<PropertyGroup> = (
    $resource,
    _$options,
  ) => {
    return (
      !_$options.ignoreRdfType
        ? $resource
            .value($RdfVocabularies.rdf.type, { graph: _$options.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyGroup":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $resource.isInstanceOf(PropertyGroup.fromRdfType, {
                  graph: _$options.graph,
                })
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${$resource.identifier} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
                ),
              );
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
        comment: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.comment,
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
                        PropertyShape.schema.properties.comment.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        label: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.label,
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
                      propertyPath: PropertyShape.schema.properties.label.path,
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
    PropertyGroup
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) =>
            PropertyGroup.fromRdfResource(resource, options),
          ),
      ),
    );

  export const fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyGroup",
  );

  export function isPropertyGroup(object: $Object): object is PropertyGroup {
    switch (object.$type) {
      case "PropertyGroup":
        return true;
      default:
        return false;
    }
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["PropertyGroup"],
        }),
      },
      comment: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      label: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    PropertyGroup.Identifier,
    PropertyGroup
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyGroup"),
        parameters.graph,
      );
    }
    parameters.resource.add(
      PropertyShape.schema.properties.comment.path,
      parameters.object.comment
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.label.path,
      parameters.object.label
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _propertyGroup: PropertyGroup,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _propertyGroup.$identifier().toString(),
      label: _propertyGroup.label.map((item) => item.toString()).extract(),
    });
  }

  export function $toString(this: PropertyGroup): string;
  export function $toString(_propertyGroup: PropertyGroup): string;
  export function $toString(
    this: PropertyGroup | undefined,
    _propertyGroup?: PropertyGroup,
  ): string {
    return `PropertyGroup(${JSON.stringify(_propertiesToStrings((_propertyGroup ?? this)!))})`;
  }
}
export interface Ontology {
  readonly $identifier: () => Ontology.Identifier;
  readonly $type: "Ontology";
  readonly comment: Maybe<string>;
  readonly label: Maybe<string>;
}

export namespace Ontology {
  export function create(parameters?: {
    readonly $identifier?:
      | (() => Ontology.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly comment?: string | Maybe<string>;
    readonly label?: string | Maybe<string>;
  }): Either<Error, Ontology> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters?.comment,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.comment.type(),
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters?.label,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.label.type(),
          value,
        ),
      ),
    }).map((properties) => {
      const finalObject = { ...properties, $type: "Ontology" as const };
      if (
        !globalThis.Object.prototype.hasOwnProperty.call(
          finalObject,
          "toString",
        )
      ) {
        (finalObject as any).toString = $toString;
      }
      return finalObject;
    });
  }

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => Ontology.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly comment?: string | Maybe<string>;
    readonly label?: string | Maybe<string>;
  }): Ontology {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(filter: Ontology.Filter, value: Ontology): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.comment !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.comment,
        value.comment,
      )
    ) {
      return false;
    }
    if (
      filter.label !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.label,
        value.label,
      )
    ) {
      return false;
    }
    return true;
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly comment?: $MaybeFilter<$StringFilter>;
    readonly label?: $MaybeFilter<$StringFilter>;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<Ontology> = (
    $resource,
    _$options,
  ) => {
    return (
      !_$options.ignoreRdfType
        ? $resource
            .value($RdfVocabularies.rdf.type, { graph: _$options.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/2002/07/owl#Ontology":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $resource.isInstanceOf(Ontology.fromRdfType, {
                  graph: _$options.graph,
                })
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${$resource.identifier} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
                ),
              );
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
        comment: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.comment,
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
                        PropertyShape.schema.properties.comment.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        label: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.label,
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
                      propertyPath: PropertyShape.schema.properties.label.path,
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
    Ontology
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => Ontology.fromRdfResource(resource, options)),
      ),
    );

  export const fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );

  export function isOntology(object: $Object): object is Ontology {
    switch (object.$type) {
      case "Ontology":
        return true;
      default:
        return false;
    }
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["Ontology"],
        }),
      },
      comment: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      label: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    Ontology.Identifier,
    Ontology
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
        parameters.graph,
      );
    }
    parameters.resource.add(
      PropertyShape.schema.properties.comment.path,
      parameters.object.comment
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.label.path,
      parameters.object.label
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _ontology: Ontology,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _ontology.$identifier().toString(),
      label: _ontology.label.map((item) => item.toString()).extract(),
    });
  }

  export function $toString(this: Ontology): string;
  export function $toString(_ontology: Ontology): string;
  export function $toString(
    this: Ontology | undefined,
    _ontology?: Ontology,
  ): string {
    return `Ontology(${JSON.stringify(_propertiesToStrings((_ontology ?? this)!))})`;
  }
}
export interface NodeShape {
  readonly $identifier: () => NodeShape.Identifier;
  readonly $type: "NodeShape";
  readonly and: Maybe<readonly (BlankNode | NamedNode)[]>;
  readonly classes: readonly NamedNode[];
  readonly closed: Maybe<boolean>;
  readonly comment: Maybe<string>;
  readonly datatype: Maybe<NamedNode>;
  readonly deactivated: Maybe<boolean>;
  readonly flags: readonly string[];
  readonly hasValues: readonly (NamedNode | Literal)[];
  readonly ignoredProperties: Maybe<readonly NamedNode[]>;
  readonly in_: Maybe<readonly (NamedNode | Literal)[]>;
  readonly isDefinedBy: Maybe<BlankNode | NamedNode>;
  readonly label: Maybe<string>;
  readonly languageIn: Maybe<readonly string[]>;
  readonly maxCount: Maybe<bigint>;
  readonly maxExclusive: Maybe<Literal>;
  readonly maxInclusive: Maybe<Literal>;
  readonly maxLength: Maybe<bigint>;
  readonly minCount: Maybe<bigint>;
  readonly minExclusive: Maybe<Literal>;
  readonly minInclusive: Maybe<Literal>;
  readonly minLength: Maybe<bigint>;
  readonly node: Maybe<BlankNode | NamedNode>;
  readonly nodeKind: Maybe<
    NamedNode<
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
    >
  >;
  readonly not: readonly (BlankNode | NamedNode)[];
  readonly or: Maybe<readonly (BlankNode | NamedNode)[]>;
  readonly patterns: readonly string[];
  readonly properties: readonly (BlankNode | NamedNode)[];
  readonly subClassOf: readonly NamedNode[];
  readonly types: readonly NamedNode[];
  readonly xone: Maybe<readonly (BlankNode | NamedNode)[]>;
}

export namespace NodeShape {
  export function create(parameters?: {
    readonly $identifier?:
      | (() => NodeShape.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly and?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly classes?: readonly (string | NamedNode)[];
    readonly closed?: boolean | Maybe<boolean>;
    readonly comment?: string | Maybe<string>;
    readonly datatype?: string | NamedNode | Maybe<NamedNode>;
    readonly deactivated?: boolean | Maybe<boolean>;
    readonly flags?: readonly string[];
    readonly hasValues?: readonly (NamedNode | Literal)[];
    readonly ignoredProperties?:
      | readonly (string | NamedNode)[]
      | Maybe<readonly NamedNode[]>;
    readonly in_?:
      | readonly (NamedNode | Literal)[]
      | Maybe<readonly (NamedNode | Literal)[]>;
    readonly isDefinedBy?:
      | BlankNode
      | NamedNode
      | string
      | Maybe<BlankNode | NamedNode>;
    readonly label?: string | Maybe<string>;
    readonly languageIn?: readonly string[] | Maybe<readonly string[]>;
    readonly maxCount?: bigint | Maybe<bigint>;
    readonly maxExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxLength?: bigint | Maybe<bigint>;
    readonly minCount?: bigint | Maybe<bigint>;
    readonly minExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minLength?: bigint | Maybe<bigint>;
    readonly node?:
      | BlankNode
      | NamedNode
      | string
      | Maybe<BlankNode | NamedNode>;
    readonly nodeKind?:
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
      | NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      | Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >;
    readonly not?: readonly (BlankNode | NamedNode | string | undefined)[];
    readonly or?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly patterns?: readonly string[];
    readonly properties?: readonly (
      | BlankNode
      | NamedNode
      | string
      | undefined
    )[];
    readonly subClassOf?: readonly (string | NamedNode)[];
    readonly types?: readonly (string | NamedNode)[];
    readonly xone?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
  }): Either<Error, NodeShape> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters?.$identifier),
      and: $convertToMaybe($convertToArray($convertToIdentifier, true))(
        parameters?.and,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.and.type(),
          value,
        ),
      ),
      classes: $convertToArray(
        $convertToIri<string>,
        true,
      )(parameters?.classes).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.classes.type(),
          value,
        ),
      ),
      closed: $convertToMaybe($identityConversionFunction)(
        parameters?.closed,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShape.schema.properties.closed.type(),
          value,
        ),
      ),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters?.comment,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.comment.type(),
          value,
        ),
      ),
      datatype: $convertToMaybe($convertToIri<string>)(
        parameters?.datatype,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.datatype.type(),
          value,
        ),
      ),
      deactivated: $convertToMaybe($identityConversionFunction)(
        parameters?.deactivated,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.deactivated.type(),
          value,
        ),
      ),
      flags: $convertToArray(
        $identityConversionFunction,
        true,
      )(parameters?.flags).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.flags.type(),
          value,
        ),
      ),
      hasValues: $convertToArray(
        $identityConversionFunction,
        true,
      )(parameters?.hasValues).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.hasValues.type(),
          value,
        ),
      ),
      ignoredProperties: $convertToMaybe(
        $convertToArray($convertToIri<string>, true),
      )(parameters?.ignoredProperties).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          NodeShape.schema.properties.ignoredProperties.type(),
          value,
        ),
      ),
      in_: $convertToMaybe($convertToArray($identityConversionFunction, true))(
        parameters?.in_,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.in_.type(),
          value,
        ),
      ),
      isDefinedBy: $convertToMaybe($convertToIdentifier)(
        parameters?.isDefinedBy,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.isDefinedBy.type(),
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters?.label,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.label.type(),
          value,
        ),
      ),
      languageIn: $convertToMaybe(
        $convertToArray($identityConversionFunction, true),
      )(parameters?.languageIn).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.languageIn.type(),
          value,
        ),
      ),
      maxCount: $convertToMaybe($identityConversionFunction)(
        parameters?.maxCount,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.maxCount.type(),
          value,
        ),
      ),
      maxExclusive: $convertToMaybe($convertToLiteral)(
        parameters?.maxExclusive,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.maxExclusive.type(),
          value,
        ),
      ),
      maxInclusive: $convertToMaybe($convertToLiteral)(
        parameters?.maxInclusive,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.maxInclusive.type(),
          value,
        ),
      ),
      maxLength: $convertToMaybe($identityConversionFunction)(
        parameters?.maxLength,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.maxLength.type(),
          value,
        ),
      ),
      minCount: $convertToMaybe($identityConversionFunction)(
        parameters?.minCount,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.minCount.type(),
          value,
        ),
      ),
      minExclusive: $convertToMaybe($convertToLiteral)(
        parameters?.minExclusive,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.minExclusive.type(),
          value,
        ),
      ),
      minInclusive: $convertToMaybe($convertToLiteral)(
        parameters?.minInclusive,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.minInclusive.type(),
          value,
        ),
      ),
      minLength: $convertToMaybe($identityConversionFunction)(
        parameters?.minLength,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.minLength.type(),
          value,
        ),
      ),
      node: $convertToMaybe($convertToIdentifier)(parameters?.node).chain(
        (value) =>
          $validateMaybe($identityValidationFunction)(
            PropertyShape.schema.properties.node.type(),
            value,
          ),
      ),
      nodeKind: $convertToMaybe(
        $convertToIri<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >,
      )(parameters?.nodeKind).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShape.schema.properties.nodeKind.type(),
          value,
        ),
      ),
      not: $convertToArray(
        $convertToIdentifier,
        true,
      )(parameters?.not).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.not.type(),
          value,
        ),
      ),
      or: $convertToMaybe($convertToArray($convertToIdentifier, true))(
        parameters?.or,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.or.type(),
          value,
        ),
      ),
      patterns: $convertToArray(
        $identityConversionFunction,
        true,
      )(parameters?.patterns).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          PropertyShape.schema.properties.patterns.type(),
          value,
        ),
      ),
      properties: $convertToArray(
        $convertToIdentifier,
        true,
      )(parameters?.properties).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          NodeShape.schema.properties.properties.type(),
          value,
        ),
      ),
      subClassOf: $convertToArray(
        $convertToIri<string>,
        true,
      )(parameters?.subClassOf).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          NodeShape.schema.properties.subClassOf.type(),
          value,
        ),
      ),
      types: $convertToArray(
        $convertToIri<string>,
        true,
      )(parameters?.types).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          NodeShape.schema.properties.types.type(),
          value,
        ),
      ),
      xone: $convertToMaybe($convertToArray($convertToIdentifier, true))(
        parameters?.xone,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction, true))(
          PropertyShape.schema.properties.xone.type(),
          value,
        ),
      ),
    }).map((properties) => {
      const finalObject = { ...properties, $type: "NodeShape" as const };
      if (
        !globalThis.Object.prototype.hasOwnProperty.call(
          finalObject,
          "toString",
        )
      ) {
        (finalObject as any).toString = $toString;
      }
      return finalObject;
    });
  }

  export function createUnsafe(parameters?: {
    readonly $identifier?:
      | (() => NodeShape.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly and?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly classes?: readonly (string | NamedNode)[];
    readonly closed?: boolean | Maybe<boolean>;
    readonly comment?: string | Maybe<string>;
    readonly datatype?: string | NamedNode | Maybe<NamedNode>;
    readonly deactivated?: boolean | Maybe<boolean>;
    readonly flags?: readonly string[];
    readonly hasValues?: readonly (NamedNode | Literal)[];
    readonly ignoredProperties?:
      | readonly (string | NamedNode)[]
      | Maybe<readonly NamedNode[]>;
    readonly in_?:
      | readonly (NamedNode | Literal)[]
      | Maybe<readonly (NamedNode | Literal)[]>;
    readonly isDefinedBy?:
      | BlankNode
      | NamedNode
      | string
      | Maybe<BlankNode | NamedNode>;
    readonly label?: string | Maybe<string>;
    readonly languageIn?: readonly string[] | Maybe<readonly string[]>;
    readonly maxCount?: bigint | Maybe<bigint>;
    readonly maxExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxLength?: bigint | Maybe<bigint>;
    readonly minCount?: bigint | Maybe<bigint>;
    readonly minExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minLength?: bigint | Maybe<bigint>;
    readonly node?:
      | BlankNode
      | NamedNode
      | string
      | Maybe<BlankNode | NamedNode>;
    readonly nodeKind?:
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
      | NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      | Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >;
    readonly not?: readonly (BlankNode | NamedNode | string | undefined)[];
    readonly or?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly patterns?: readonly string[];
    readonly properties?: readonly (
      | BlankNode
      | NamedNode
      | string
      | undefined
    )[];
    readonly subClassOf?: readonly (string | NamedNode)[];
    readonly types?: readonly (string | NamedNode)[];
    readonly xone?:
      | readonly (BlankNode | NamedNode | string | undefined)[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
  }): NodeShape {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function filter(filter: NodeShape.Filter, value: NodeShape): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.and !== undefined &&
      !$filterMaybe<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.and, value.and)
    ) {
      return false;
    }
    if (
      filter.classes !== undefined &&
      !$filterArray<NamedNode, $IriFilter>($filterIri)(
        filter.classes,
        value.classes,
      )
    ) {
      return false;
    }
    if (
      filter.closed !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.closed,
        value.closed,
      )
    ) {
      return false;
    }
    if (
      filter.comment !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.comment,
        value.comment,
      )
    ) {
      return false;
    }
    if (
      filter.datatype !== undefined &&
      !$filterMaybe<NamedNode, $IriFilter>($filterIri)(
        filter.datatype,
        value.datatype,
      )
    ) {
      return false;
    }
    if (
      filter.deactivated !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.deactivated,
        value.deactivated,
      )
    ) {
      return false;
    }
    if (
      filter.flags !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.flags,
        value.flags,
      )
    ) {
      return false;
    }
    if (
      filter.hasValues !== undefined &&
      !$filterArray<NamedNode | Literal, $TermFilter>($filterTerm)(
        filter.hasValues,
        value.hasValues,
      )
    ) {
      return false;
    }
    if (
      filter.ignoredProperties !== undefined &&
      !$filterMaybe<readonly NamedNode[], $CollectionFilter<$IriFilter>>(
        $filterArray<NamedNode, $IriFilter>($filterIri),
      )(filter.ignoredProperties, value.ignoredProperties)
    ) {
      return false;
    }
    if (
      filter.in_ !== undefined &&
      !$filterMaybe<
        readonly (NamedNode | Literal)[],
        $CollectionFilter<$TermFilter>
      >($filterArray<NamedNode | Literal, $TermFilter>($filterTerm))(
        filter.in_,
        value.in_,
      )
    ) {
      return false;
    }
    if (
      filter.isDefinedBy !== undefined &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.isDefinedBy, value.isDefinedBy)
    ) {
      return false;
    }
    if (
      filter.label !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.label,
        value.label,
      )
    ) {
      return false;
    }
    if (
      filter.languageIn !== undefined &&
      !$filterMaybe<readonly string[], $CollectionFilter<$StringFilter>>(
        $filterArray<string, $StringFilter>($filterString),
      )(filter.languageIn, value.languageIn)
    ) {
      return false;
    }
    if (
      filter.maxCount !== undefined &&
      !$filterMaybe<bigint, $NumericFilter<bigint>>($filterNumeric<bigint>)(
        filter.maxCount,
        value.maxCount,
      )
    ) {
      return false;
    }
    if (
      filter.maxExclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.maxExclusive,
        value.maxExclusive,
      )
    ) {
      return false;
    }
    if (
      filter.maxInclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.maxInclusive,
        value.maxInclusive,
      )
    ) {
      return false;
    }
    if (
      filter.maxLength !== undefined &&
      !$filterMaybe<bigint, $NumericFilter<bigint>>($filterNumeric<bigint>)(
        filter.maxLength,
        value.maxLength,
      )
    ) {
      return false;
    }
    if (
      filter.minCount !== undefined &&
      !$filterMaybe<bigint, $NumericFilter<bigint>>($filterNumeric<bigint>)(
        filter.minCount,
        value.minCount,
      )
    ) {
      return false;
    }
    if (
      filter.minExclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.minExclusive,
        value.minExclusive,
      )
    ) {
      return false;
    }
    if (
      filter.minInclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.minInclusive,
        value.minInclusive,
      )
    ) {
      return false;
    }
    if (
      filter.minLength !== undefined &&
      !$filterMaybe<bigint, $NumericFilter<bigint>>($filterNumeric<bigint>)(
        filter.minLength,
        value.minLength,
      )
    ) {
      return false;
    }
    if (
      filter.node !== undefined &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.node, value.node)
    ) {
      return false;
    }
    if (
      filter.nodeKind !== undefined &&
      !$filterMaybe<
        NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >,
        $IriFilter
      >($filterIri)(filter.nodeKind, value.nodeKind)
    ) {
      return false;
    }
    if (
      filter.not !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.not, value.not)
    ) {
      return false;
    }
    if (
      filter.or !== undefined &&
      !$filterMaybe<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.or, value.or)
    ) {
      return false;
    }
    if (
      filter.patterns !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.patterns,
        value.patterns,
      )
    ) {
      return false;
    }
    if (
      filter.properties !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.properties, value.properties)
    ) {
      return false;
    }
    if (
      filter.subClassOf !== undefined &&
      !$filterArray<NamedNode, $IriFilter>($filterIri)(
        filter.subClassOf,
        value.subClassOf,
      )
    ) {
      return false;
    }
    if (
      filter.types !== undefined &&
      !$filterArray<NamedNode, $IriFilter>($filterIri)(
        filter.types,
        value.types,
      )
    ) {
      return false;
    }
    if (
      filter.xone !== undefined &&
      !$filterMaybe<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.xone, value.xone)
    ) {
      return false;
    }
    return true;
  }

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly and?: $MaybeFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly classes?: $CollectionFilter<$IriFilter>;
    readonly closed?: $MaybeFilter<$BooleanFilter>;
    readonly comment?: $MaybeFilter<$StringFilter>;
    readonly datatype?: $MaybeFilter<$IriFilter>;
    readonly deactivated?: $MaybeFilter<$BooleanFilter>;
    readonly flags?: $CollectionFilter<$StringFilter>;
    readonly hasValues?: $CollectionFilter<$TermFilter>;
    readonly ignoredProperties?: $MaybeFilter<$CollectionFilter<$IriFilter>>;
    readonly in_?: $MaybeFilter<$CollectionFilter<$TermFilter>>;
    readonly isDefinedBy?: $MaybeFilter<$IdentifierFilter>;
    readonly label?: $MaybeFilter<$StringFilter>;
    readonly languageIn?: $MaybeFilter<$CollectionFilter<$StringFilter>>;
    readonly maxCount?: $MaybeFilter<$NumericFilter<bigint>>;
    readonly maxExclusive?: $MaybeFilter<$LiteralFilter>;
    readonly maxInclusive?: $MaybeFilter<$LiteralFilter>;
    readonly maxLength?: $MaybeFilter<$NumericFilter<bigint>>;
    readonly minCount?: $MaybeFilter<$NumericFilter<bigint>>;
    readonly minExclusive?: $MaybeFilter<$LiteralFilter>;
    readonly minInclusive?: $MaybeFilter<$LiteralFilter>;
    readonly minLength?: $MaybeFilter<$NumericFilter<bigint>>;
    readonly node?: $MaybeFilter<$IdentifierFilter>;
    readonly nodeKind?: $MaybeFilter<$IriFilter>;
    readonly not?: $CollectionFilter<$IdentifierFilter>;
    readonly or?: $MaybeFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly patterns?: $CollectionFilter<$StringFilter>;
    readonly properties?: $CollectionFilter<$IdentifierFilter>;
    readonly subClassOf?: $CollectionFilter<$IriFilter>;
    readonly types?: $CollectionFilter<$IriFilter>;
    readonly xone?: $MaybeFilter<$CollectionFilter<$IdentifierFilter>>;
  };

  export const _fromRdfResource: $_FromRdfResourceFunction<NodeShape> = (
    $resource,
    _$options,
  ) => {
    return (
      !_$options.ignoreRdfType
        ? $resource
            .value($RdfVocabularies.rdf.type, { graph: _$options.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#NodeShape":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $resource.isInstanceOf(NodeShape.fromRdfType, {
                  graph: _$options.graph,
                })
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${$resource.identifier} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
                ),
              );
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
        and: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.and,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.and.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) => value.toIdentifier()),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<readonly (BlankNode | NamedNode)[]>
                    >({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.and.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        classes: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.classes,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.classes.path,
                  value: valuesArray,
                }),
              ),
        }),
        closed: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.closed,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $resource,
                      propertyPath: NodeShape.schema.properties.closed.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        comment: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.comment,
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
                        PropertyShape.schema.properties.comment.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        datatype: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.datatype,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<NamedNode>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.datatype.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        deactivated: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.deactivated,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.deactivated.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        flags: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.flags,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.flags.path,
                  value: valuesArray,
                }),
              ),
        }),
        hasValues: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.hasValues,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toTerm().chain((term) => {
                    switch (term.termType) {
                      case "NamedNode":
                      case "Literal":
                        return Either.of<Error, NamedNode | Literal>(term);
                      default:
                        return Left<Error, NamedNode | Literal>(
                          new Resource.MistypedTermValueError({
                            actualValue: term,
                            expectedValueType: "(NamedNode | Literal)",
                            focusResource: $resource,
                            propertyPath:
                              PropertyShape.schema.properties.hasValues.path,
                          }),
                        );
                    }
                  }),
                ),
              )
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.hasValues.path,
                  value: valuesArray,
                }),
              ),
        }),
        ignoredProperties: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.ignoredProperties,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath:
                        NodeShape.schema.properties.ignoredProperties.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) => value.toIri()),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<readonly NamedNode[]>>({
                      focusResource: $resource,
                      propertyPath:
                        NodeShape.schema.properties.ignoredProperties.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        in_: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.in_,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.in_.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) =>
                      value.toTerm().chain((term) => {
                        switch (term.termType) {
                          case "NamedNode":
                          case "Literal":
                            return Either.of<Error, NamedNode | Literal>(term);
                          default:
                            return Left<Error, NamedNode | Literal>(
                              new Resource.MistypedTermValueError({
                                actualValue: term,
                                expectedValueType: "(NamedNode | Literal)",
                                focusResource: $resource,
                                propertyPath:
                                  PropertyShape.schema.properties.in_.path,
                              }),
                            );
                        }
                      }),
                    ),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<readonly (NamedNode | Literal)[]>
                    >({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.in_.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        isDefinedBy: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.isDefinedBy,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) => value.toIdentifier()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<BlankNode | NamedNode>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.isDefinedBy.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        label: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.label,
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
                      propertyPath: PropertyShape.schema.properties.label.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        languageIn: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.languageIn,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.languageIn.path,
                      values: valueList.toArray(),
                    }),
                  )
                    .chain((values) =>
                      $fromRdfPreferredLanguages(
                        values,
                        _$options.preferredLanguages,
                      ),
                    )
                    .chain((values) =>
                      values.chainMap((value) => value.toString()),
                    ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<readonly string[]>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.languageIn.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        maxCount: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.maxCount,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBigInt()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<bigint>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.maxCount.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        maxExclusive: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.maxExclusive,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toLiteral()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.maxExclusive.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        maxInclusive: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.maxInclusive,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toLiteral()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.maxInclusive.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        maxLength: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.maxLength,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBigInt()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<bigint>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.maxLength.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        minCount: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.minCount,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBigInt()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<bigint>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.minCount.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        minExclusive: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.minExclusive,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toLiteral()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.minExclusive.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        minInclusive: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.minInclusive,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toLiteral()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.minInclusive.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        minLength: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.minLength,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBigInt()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<bigint>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.minLength.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        node: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.node,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) => value.toIdentifier()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<BlankNode | NamedNode>>({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.node.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        nodeKind: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.nodeKind,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toIri([
                    dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#BlankNode",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#BlankNodeOrIRI",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#BlankNodeOrLiteral",
                    ),
                    dataFactory.namedNode("http://www.w3.org/ns/shacl#IRI"),
                    dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#IRIOrLiteral",
                    ),
                    dataFactory.namedNode("http://www.w3.org/ns/shacl#Literal"),
                  ]),
                ),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<
                        NamedNode<
                          | "http://www.w3.org/ns/shacl#BlankNode"
                          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                          | "http://www.w3.org/ns/shacl#IRI"
                          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                          | "http://www.w3.org/ns/shacl#Literal"
                        >
                      >
                    >({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.nodeKind.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        not: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.not,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) => value.toIdentifier()),
              )
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.not.path,
                  value: valuesArray,
                }),
              ),
        }),
        or: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.or,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.or.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) => value.toIdentifier()),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<readonly (BlankNode | NamedNode)[]>
                    >({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.or.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        patterns: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.patterns,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                $fromRdfPreferredLanguages(
                  values,
                  _$options.preferredLanguages,
                ),
              )
              .chain((values) => values.chainMap((value) => value.toString()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: PropertyShape.schema.properties.patterns.path,
                  value: valuesArray,
                }),
              ),
        }),
        properties: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.properties,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) => value.toIdentifier()),
              )
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: NodeShape.schema.properties.properties.path,
                  value: valuesArray,
                }),
              ),
        }),
        subClassOf: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.subClassOf,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: NodeShape.schema.properties.subClassOf.path,
                  value: valuesArray,
                }),
              ),
        }),
        types: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.types,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: NodeShape.schema.properties.types.path,
                  value: valuesArray,
                }),
              ),
        }),
        xone: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.xone,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: _$options.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.xone.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) => value.toIdentifier()),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<
                      Maybe<readonly (BlankNode | NamedNode)[]>
                    >({
                      focusResource: $resource,
                      propertyPath: PropertyShape.schema.properties.xone.path,
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
    NodeShape
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => NodeShape.fromRdfResource(resource, options)),
      ),
    );

  export const fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );

  export function isNodeShape(object: $Object): object is NodeShape {
    switch (object.$type) {
      case "NodeShape":
        return true;
      default:
        return false;
    }
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["NodeShape"],
        }),
      },
      and: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      closed: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
      },
      comment: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      },
      deactivated: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      },
      ignoredProperties: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Iri" as const }),
          }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ignoredProperties",
        ),
      },
      in_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Term" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      label: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "String" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      },
      maxCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      },
      maxExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      },
      maxInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      },
      maxLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      },
      minCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      },
      minExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      },
      minInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      },
      minLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      },
      node: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      nodeKind: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode("http://www.w3.org/ns/shacl#BlankNode"),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrIRI",
              ),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrLiteral",
              ),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRI"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRIOrLiteral"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#Literal"),
            ] as const,
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      },
      not: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      properties: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
      },
      subClassOf: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: $RdfVocabularies.rdfs.subClassOf,
      },
      types: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: $RdfVocabularies.rdf.type,
      },
      xone: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;

  export const _toRdfResource: $_ToRdfResourceFunction<
    NodeShape.Identifier,
    NodeShape
  > = (parameters) => {
    if (!parameters.ignoreRdfType) {
      parameters.resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
        parameters.graph,
      );
    }
    parameters.resource.add(
      PropertyShape.schema.properties.and.path,
      parameters.object.and.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.classes.path,
      parameters.object.classes.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      NodeShape.schema.properties.closed.path,
      parameters.object.closed
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.comment.path,
      parameters.object.comment
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.datatype.path,
      parameters.object.datatype.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.deactivated.path,
      parameters.object.deactivated
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.flags.path,
      parameters.object.flags.flatMap((item) => [$literalFactory.string(item)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.hasValues.path,
      parameters.object.hasValues.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      NodeShape.schema.properties.ignoredProperties.path,
      parameters.object.ignoredProperties.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.in_.path,
      parameters.object.in_.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.isDefinedBy.path,
      parameters.object.isDefinedBy.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.label.path,
      parameters.object.label
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.languageIn.path,
      parameters.object.languageIn.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [$literalFactory.string(item)],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.maxCount.path,
      parameters.object.maxCount
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.maxExclusive.path,
      parameters.object.maxExclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.maxInclusive.path,
      parameters.object.maxInclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.maxLength.path,
      parameters.object.maxLength
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.minCount.path,
      parameters.object.minCount
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.minExclusive.path,
      parameters.object.minExclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.minInclusive.path,
      parameters.object.minInclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.minLength.path,
      parameters.object.minLength
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.node.path,
      parameters.object.node.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.nodeKind.path,
      parameters.object.nodeKind.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.not.path,
      parameters.object.not.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.or.path,
      parameters.object.or.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.patterns.path,
      parameters.object.patterns.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      NodeShape.schema.properties.properties.path,
      parameters.object.properties.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      NodeShape.schema.properties.subClassOf.path,
      parameters.object.subClassOf.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      NodeShape.schema.properties.types.path,
      parameters.object.types.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      PropertyShape.schema.properties.xone.path,
      parameters.object.xone.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = parameters.resourceSet.resource(
                    (() => dataFactory.blankNode())(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    parameters.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  parameters.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    parameters.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: parameters.resourceSet.resource(
                  (() => dataFactory.blankNode())(),
                ),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _nodeShape: NodeShape,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _nodeShape.$identifier().toString(),
      label: _nodeShape.label.map((item) => item.toString()).extract(),
    });
  }

  export function $toString(this: NodeShape): string;
  export function $toString(_nodeShape: NodeShape): string;
  export function $toString(
    this: NodeShape | undefined,
    _nodeShape?: NodeShape,
  ): string {
    return `NodeShape(${JSON.stringify(_propertiesToStrings((_nodeShape ?? this)!))})`;
  }
}
export type Shape = NodeShape | PropertyShape;

export namespace Shape {
  export const $toString = (value: Shape): string => {
    if (NodeShape.isNodeShape(value)) {
      return NodeShape.$toString(value);
    }
    if (PropertyShape.isPropertyShape(value)) {
      return PropertyShape.$toString(value);
    }

    throw new Error("unable to serialize to string");
  };

  export const filter = (filter: Shape.Filter, value: Shape) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.on?.["NodeShape"] !== undefined &&
      NodeShape.isNodeShape(value)
    ) {
      if (!NodeShape.filter(filter.on["NodeShape"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["PropertyShape"] !== undefined &&
      PropertyShape.isPropertyShape(value)
    ) {
      if (!PropertyShape.filter(filter.on["PropertyShape"], value)) {
        return false;
      }
    }

    return true;
  };

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly NodeShape?: NodeShape.Filter;
      readonly PropertyShape?: PropertyShape.Filter;
    };
  };

  export const fromRdfResource: $FromRdfResourceFunction<Shape> = (
    resource,
    options,
  ) =>
    (
      NodeShape.fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, Shape>
    ).altLazy(
      () =>
        PropertyShape.fromRdfResource(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, Shape>,
    );

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<Shape> = ((
    values,
    _options,
  ) =>
    values.chain((values) =>
      values.chainMap((value) => {
        const valueAsValues = Right(value.toValues());
        return (
          NodeShape.fromRdfResourceValues(valueAsValues, {
            context: _options.context,
            graph: _options.graph,
            ignoreRdfType: false,
            objectSet: _options.objectSet,
            preferredLanguages: _options.preferredLanguages,
            propertyPath: _options.propertyPath,
            resource: _options.resource,
          }) as Either<Error, Resource.Values<Shape>>
        )
          .altLazy(
            () =>
              PropertyShape.fromRdfResourceValues(valueAsValues, {
                context: _options.context,
                graph: _options.graph,
                ignoreRdfType: false,
                objectSet: _options.objectSet,
                preferredLanguages: _options.preferredLanguages,
                propertyPath: _options.propertyPath,
                resource: _options.resource,
              }) as Either<Error, Resource.Values<Shape>>,
          )
          .chain((values) => values.head());
      }),
    )) satisfies $FromRdfResourceValuesFunction<Shape>;

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function isShape(object: $Object): object is Shape {
    return (
      NodeShape.isNodeShape(object) || PropertyShape.isPropertyShape(object)
    );
  }

  export const schema = {
    kind: "NamedObjectUnion" as const,
    members: {
      NodeShape: { discriminantValues: ["NodeShape"], type: NodeShape.schema },
      PropertyShape: {
        discriminantValues: ["PropertyShape"],
        type: PropertyShape.schema,
      },
    },
    properties: {
      and: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comment: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      },
      deactivated: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      },
      in_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Term" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      label: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "String" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      },
      maxCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      },
      maxExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      },
      maxInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      },
      maxLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      },
      minCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      },
      minExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      },
      minInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      },
      minLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "BigInt" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      },
      node: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      nodeKind: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode("http://www.w3.org/ns/shacl#BlankNode"),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrIRI",
              ),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrLiteral",
              ),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRI"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRIOrLiteral"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#Literal"),
            ] as const,
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      },
      not: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      xone: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;

  export const toRdfResource: $ToRdfResourceFunction<Shape> = (
    object,
    options,
  ) => {
    if (NodeShape.isNodeShape(object)) {
      return NodeShape.toRdfResource(object, options);
    }
    if (PropertyShape.isPropertyShape(object)) {
      return PropertyShape.toRdfResource(object, options);
    }
    throw new Error("unrecognized type");
  };

  export const toRdfResourceValues = ((
    value,
    _options,
  ): (BlankNode | NamedNode)[] => {
    if (NodeShape.isNodeShape(value)) {
      return [
        NodeShape.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (PropertyShape.isPropertyShape(value)) {
      return [
        PropertyShape.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) satisfies $ToRdfResourceValuesFunction<Shape>;
}
export type $Object = NodeShape | Ontology | PropertyGroup | PropertyShape;

export namespace $Object {
  export const $toString = (value: $Object): string => {
    if (NodeShape.isNodeShape(value)) {
      return NodeShape.$toString(value);
    }
    if (Ontology.isOntology(value)) {
      return Ontology.$toString(value);
    }
    if (PropertyGroup.isPropertyGroup(value)) {
      return PropertyGroup.$toString(value);
    }
    if (PropertyShape.isPropertyShape(value)) {
      return PropertyShape.$toString(value);
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
      filter.on?.["NodeShape"] !== undefined &&
      NodeShape.isNodeShape(value)
    ) {
      if (!NodeShape.filter(filter.on["NodeShape"], value)) {
        return false;
      }
    }
    if (filter.on?.["Ontology"] !== undefined && Ontology.isOntology(value)) {
      if (!Ontology.filter(filter.on["Ontology"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["PropertyGroup"] !== undefined &&
      PropertyGroup.isPropertyGroup(value)
    ) {
      if (!PropertyGroup.filter(filter.on["PropertyGroup"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["PropertyShape"] !== undefined &&
      PropertyShape.isPropertyShape(value)
    ) {
      if (!PropertyShape.filter(filter.on["PropertyShape"], value)) {
        return false;
      }
    }

    return true;
  };

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly NodeShape?: NodeShape.Filter;
      readonly Ontology?: Ontology.Filter;
      readonly PropertyGroup?: PropertyGroup.Filter;
      readonly PropertyShape?: PropertyShape.Filter;
    };
  };

  export const fromRdfResource: $FromRdfResourceFunction<$Object> = (
    resource,
    options,
  ) =>
    (
      NodeShape.fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, $Object>
    )
      .altLazy(
        () =>
          Ontology.fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          PropertyGroup.fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          PropertyShape.fromRdfResource(resource, {
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
            NodeShape.fromRdfResourceValues(valueAsValues, {
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
                Ontology.fromRdfResourceValues(valueAsValues, {
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
                PropertyGroup.fromRdfResourceValues(valueAsValues, {
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
                PropertyShape.fromRdfResourceValues(valueAsValues, {
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
    kind: "NamedObjectUnion" as const,
    members: {
      NodeShape: { discriminantValues: ["NodeShape"], type: NodeShape.schema },
      Ontology: { discriminantValues: ["Ontology"], type: Ontology.schema },
      PropertyGroup: {
        discriminantValues: ["PropertyGroup"],
        type: PropertyGroup.schema,
      },
      PropertyShape: {
        discriminantValues: ["PropertyShape"],
        type: PropertyShape.schema,
      },
    },
    properties: {
      comment: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      label: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
    },
  } as const;

  export const toRdfResource: $ToRdfResourceFunction<$Object> = (
    object,
    options,
  ) => {
    if (NodeShape.isNodeShape(object)) {
      return NodeShape.toRdfResource(object, options);
    }
    if (Ontology.isOntology(object)) {
      return Ontology.toRdfResource(object, options);
    }
    if (PropertyGroup.isPropertyGroup(object)) {
      return PropertyGroup.toRdfResource(object, options);
    }
    if (PropertyShape.isPropertyShape(object)) {
      return PropertyShape.toRdfResource(object, options);
    }
    throw new Error("unrecognized type");
  };

  export const toRdfResourceValues = ((
    value,
    _options,
  ): (BlankNode | NamedNode)[] => {
    if (NodeShape.isNodeShape(value)) {
      return [
        NodeShape.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (Ontology.isOntology(value)) {
      return [
        Ontology.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (PropertyGroup.isPropertyGroup(value)) {
      return [
        PropertyGroup.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (PropertyShape.isPropertyShape(value)) {
      return [
        PropertyShape.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) satisfies $ToRdfResourceValuesFunction<$Object>;
}
export interface $ObjectSet {
  nodeShape(
    identifier: NodeShape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, NodeShape>>;

  nodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  nodeShapeIdentifiers(
    query?: $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
  ): Promise<Either<Error, readonly NodeShape.Identifier[]>>;

  nodeShapes(
    query?: $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
  ): Promise<Either<Error, readonly NodeShape[]>>;

  ontology(
    identifier: Ontology.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Ontology>>;

  ontologyCount(
    query?: Pick<
      $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  ontologyIdentifiers(
    query?: $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
  ): Promise<Either<Error, readonly Ontology.Identifier[]>>;

  ontologies(
    query?: $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
  ): Promise<Either<Error, readonly Ontology[]>>;

  propertyGroup(
    identifier: PropertyGroup.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, PropertyGroup>>;

  propertyGroupCount(
    query?: Pick<
      $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  propertyGroupIdentifiers(
    query?: $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
  ): Promise<Either<Error, readonly PropertyGroup.Identifier[]>>;

  propertyGroups(
    query?: $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
  ): Promise<Either<Error, readonly PropertyGroup[]>>;

  propertyShape(
    identifier: PropertyShape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, PropertyShape>>;

  propertyShapeCount(
    query?: Pick<
      $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  propertyShapeIdentifiers(
    query?: $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
  ): Promise<Either<Error, readonly PropertyShape.Identifier[]>>;

  propertyShapes(
    query?: $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
  ): Promise<Either<Error, readonly PropertyShape[]>>;

  shape(
    identifier: Shape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Shape>>;

  shapeCount(
    query?: Pick<$ObjectSet.Query<Shape.Filter, Shape.Identifier>, "filter">,
  ): Promise<Either<Error, number>>;

  shapeIdentifiers(
    query?: $ObjectSet.Query<Shape.Filter, Shape.Identifier>,
  ): Promise<Either<Error, readonly Shape.Identifier[]>>;

  shapes(
    query?: $ObjectSet.Query<Shape.Filter, Shape.Identifier>,
  ): Promise<Either<Error, readonly Shape[]>>;

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

  async nodeShape(
    identifier: NodeShape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, NodeShape>> {
    return this.nodeShapeSync(identifier, options);
  }

  nodeShapeSync(
    identifier: NodeShape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, NodeShape> {
    return this.nodeShapesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async nodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.nodeShapeCountSync(query);
  }

  nodeShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.nodeShapesSync(query).map((objects) => objects.length);
  }

  async nodeShapeIdentifiers(
    query?: $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
  ): Promise<Either<Error, readonly NodeShape.Identifier[]>> {
    return this.nodeShapeIdentifiersSync(query);
  }

  nodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
  ): Either<Error, readonly NodeShape.Identifier[]> {
    return this.nodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async nodeShapes(
    query?: $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
  ): Promise<Either<Error, readonly NodeShape[]>> {
    return this.nodeShapesSync(query);
  }

  nodeShapesSync(
    query?: $ObjectSet.Query<NodeShape.Filter, NodeShape.Identifier>,
  ): Either<Error, readonly NodeShape[]> {
    return this.#objectsSync<NodeShape, NodeShape.Filter, NodeShape.Identifier>(
      {
        filter: NodeShape.filter,
        fromRdfResource: NodeShape.fromRdfResource,
        fromRdfTypes: [NodeShape.fromRdfType],
      },
      query,
    );
  }

  async ontology(
    identifier: Ontology.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Ontology>> {
    return this.ontologySync(identifier, options);
  }

  ontologySync(
    identifier: Ontology.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, Ontology> {
    return this.ontologiesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async ontologyCount(
    query?: Pick<
      $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.ontologyCountSync(query);
  }

  ontologyCountSync(
    query?: Pick<
      $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.ontologiesSync(query).map((objects) => objects.length);
  }

  async ontologyIdentifiers(
    query?: $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
  ): Promise<Either<Error, readonly Ontology.Identifier[]>> {
    return this.ontologyIdentifiersSync(query);
  }

  ontologyIdentifiersSync(
    query?: $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
  ): Either<Error, readonly Ontology.Identifier[]> {
    return this.ontologiesSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async ontologies(
    query?: $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
  ): Promise<Either<Error, readonly Ontology[]>> {
    return this.ontologiesSync(query);
  }

  ontologiesSync(
    query?: $ObjectSet.Query<Ontology.Filter, Ontology.Identifier>,
  ): Either<Error, readonly Ontology[]> {
    return this.#objectsSync<Ontology, Ontology.Filter, Ontology.Identifier>(
      {
        filter: Ontology.filter,
        fromRdfResource: Ontology.fromRdfResource,
        fromRdfTypes: [Ontology.fromRdfType],
      },
      query,
    );
  }

  async propertyGroup(
    identifier: PropertyGroup.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, PropertyGroup>> {
    return this.propertyGroupSync(identifier, options);
  }

  propertyGroupSync(
    identifier: PropertyGroup.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, PropertyGroup> {
    return this.propertyGroupsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async propertyGroupCount(
    query?: Pick<
      $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.propertyGroupCountSync(query);
  }

  propertyGroupCountSync(
    query?: Pick<
      $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.propertyGroupsSync(query).map((objects) => objects.length);
  }

  async propertyGroupIdentifiers(
    query?: $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
  ): Promise<Either<Error, readonly PropertyGroup.Identifier[]>> {
    return this.propertyGroupIdentifiersSync(query);
  }

  propertyGroupIdentifiersSync(
    query?: $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
  ): Either<Error, readonly PropertyGroup.Identifier[]> {
    return this.propertyGroupsSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async propertyGroups(
    query?: $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
  ): Promise<Either<Error, readonly PropertyGroup[]>> {
    return this.propertyGroupsSync(query);
  }

  propertyGroupsSync(
    query?: $ObjectSet.Query<PropertyGroup.Filter, PropertyGroup.Identifier>,
  ): Either<Error, readonly PropertyGroup[]> {
    return this.#objectsSync<
      PropertyGroup,
      PropertyGroup.Filter,
      PropertyGroup.Identifier
    >(
      {
        filter: PropertyGroup.filter,
        fromRdfResource: PropertyGroup.fromRdfResource,
        fromRdfTypes: [PropertyGroup.fromRdfType],
      },
      query,
    );
  }

  async propertyShape(
    identifier: PropertyShape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, PropertyShape>> {
    return this.propertyShapeSync(identifier, options);
  }

  propertyShapeSync(
    identifier: PropertyShape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, PropertyShape> {
    return this.propertyShapesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async propertyShapeCount(
    query?: Pick<
      $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.propertyShapeCountSync(query);
  }

  propertyShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.propertyShapesSync(query).map((objects) => objects.length);
  }

  async propertyShapeIdentifiers(
    query?: $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
  ): Promise<Either<Error, readonly PropertyShape.Identifier[]>> {
    return this.propertyShapeIdentifiersSync(query);
  }

  propertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
  ): Either<Error, readonly PropertyShape.Identifier[]> {
    return this.propertyShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async propertyShapes(
    query?: $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
  ): Promise<Either<Error, readonly PropertyShape[]>> {
    return this.propertyShapesSync(query);
  }

  propertyShapesSync(
    query?: $ObjectSet.Query<PropertyShape.Filter, PropertyShape.Identifier>,
  ): Either<Error, readonly PropertyShape[]> {
    return this.#objectsSync<
      PropertyShape,
      PropertyShape.Filter,
      PropertyShape.Identifier
    >(
      {
        filter: PropertyShape.filter,
        fromRdfResource: PropertyShape.fromRdfResource,
        fromRdfTypes: [PropertyShape.fromRdfType],
      },
      query,
    );
  }

  async shape(
    identifier: Shape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Shape>> {
    return this.shapeSync(identifier, options);
  }

  shapeSync(
    identifier: Shape.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, Shape> {
    return this.shapesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async shapeCount(
    query?: Pick<$ObjectSet.Query<Shape.Filter, Shape.Identifier>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shapeCountSync(query);
  }

  shapeCountSync(
    query?: Pick<$ObjectSet.Query<Shape.Filter, Shape.Identifier>, "filter">,
  ): Either<Error, number> {
    return this.shapesSync(query).map((objects) => objects.length);
  }

  async shapeIdentifiers(
    query?: $ObjectSet.Query<Shape.Filter, Shape.Identifier>,
  ): Promise<Either<Error, readonly Shape.Identifier[]>> {
    return this.shapeIdentifiersSync(query);
  }

  shapeIdentifiersSync(
    query?: $ObjectSet.Query<Shape.Filter, Shape.Identifier>,
  ): Either<Error, readonly Shape.Identifier[]> {
    return this.shapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async shapes(
    query?: $ObjectSet.Query<Shape.Filter, Shape.Identifier>,
  ): Promise<Either<Error, readonly Shape[]>> {
    return this.shapesSync(query);
  }

  shapesSync(
    query?: $ObjectSet.Query<Shape.Filter, Shape.Identifier>,
  ): Either<Error, readonly Shape[]> {
    return this.#objectUnionsSync<Shape, Shape.Filter, Shape.Identifier>(
      [
        {
          filter: Shape.filter,
          fromRdfResource: NodeShape.fromRdfResource,
          fromRdfTypes: [NodeShape.fromRdfType],
        },
        {
          filter: Shape.filter,
          fromRdfResource: PropertyShape.fromRdfResource,
          fromRdfTypes: [PropertyShape.fromRdfType],
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
          fromRdfResource: NodeShape.fromRdfResource,
          fromRdfTypes: [NodeShape.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: Ontology.fromRdfResource,
          fromRdfTypes: [Ontology.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: PropertyGroup.fromRdfResource,
          fromRdfTypes: [PropertyGroup.fromRdfType],
        },
        {
          filter: $Object.filter,
          fromRdfResource: PropertyShape.fromRdfResource,
          fromRdfTypes: [PropertyShape.fromRdfType],
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

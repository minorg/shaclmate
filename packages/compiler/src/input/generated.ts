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

export type $EqualsResult = Either<$EqualsResult.Unequal, true>;

export namespace $EqualsResult {
  export const Equal: $EqualsResult = Right(true);

  export function fromBooleanEqualsResult(
    left: any,
    right: any,
    equalsResult: boolean | $EqualsResult,
  ): $EqualsResult {
    if (typeof equalsResult !== "boolean") {
      return equalsResult;
    }

    if (equalsResult) {
      return Equal;
    }

    return Left({ left, right, type: "boolean" });
  }

  export type Unequal =
    | {
        readonly left: {
          readonly array: readonly any[];
          readonly element: any;
          readonly elementIndex: number;
        };
        readonly right: {
          readonly array: readonly any[];
          readonly unequals: readonly Unequal[];
        };
        readonly type: "array-element";
      }
    | {
        readonly left: readonly any[];
        readonly right: readonly any[];
        readonly type: "array-length";
      }
    | { readonly left: any; readonly right: any; readonly type: "boolean" }
    | { readonly right: any; readonly type: "left-null" }
    | {
        readonly left: any;
        readonly right: any;
        readonly propertyName: string;
        readonly propertyValuesUnequal: Unequal;
        readonly type: "property";
      }
    | { readonly left: any; readonly type: "right-null" };
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

interface $IriFilter {
  readonly in?: readonly NamedNode[];
}

function $isReadonlyBigIntArray(x: unknown): x is readonly bigint[] {
  return Array.isArray(x) && x.every((z) => typeof z === "bigint");
}

function $isReadonlyBooleanArray(x: unknown): x is readonly boolean[] {
  return Array.isArray(x) && x.every((z) => typeof z === "boolean");
}

function $isReadonlyNumberArray(x: unknown): x is readonly number[] {
  return Array.isArray(x) && x.every((z) => typeof z === "number");
}

function $isReadonlyObjectArray(x: unknown): x is readonly object[] {
  return Array.isArray(x) && x.every((z) => typeof z === "object");
}

function $isReadonlyStringArray(x: unknown): x is readonly string[] {
  return Array.isArray(x) && x.every((z) => typeof z === "string");
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

interface $LiteralFilter extends Omit<$TermFilter, "in" | "type"> {
  readonly in?: readonly Literal[];
}

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

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

/**
 * Compare two values for strict equality (===), returning an $EqualsResult rather than a boolean.
 */
function $strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left === right);
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
  readonly description: Maybe<string> /**
   * Whether to include this property in a toString()-type display, defaults to false
   */;

  readonly display: boolean;
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
  readonly mutable: Maybe<boolean>;
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
  readonly resolve: Maybe<BlankNode | NamedNode>;
  readonly shaclmateName: Maybe<string>;
  readonly uniqueLang: Maybe<boolean>;
  readonly xone: Maybe<readonly (BlankNode | NamedNode)[]>;
}

export namespace PropertyShape {
  export function create(parameters: {
    readonly $identifier?:
      | (() => PropertyShape.Identifier)
      | (BlankNode | NamedNode)
      | string;
    readonly and?:
      | Maybe<readonly (BlankNode | NamedNode)[]>
      | readonly (BlankNode | NamedNode)[]
      | readonly string[];
    readonly classes?: readonly NamedNode[] | readonly string[];
    readonly comment?: Maybe<string> | string;
    readonly datatype?: Maybe<NamedNode> | NamedNode | string;
    readonly deactivated?: Maybe<boolean> | boolean;
    readonly defaultValue?:
      | Maybe<NamedNode | Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | (NamedNode | Literal);
    readonly description?: Maybe<string> | string;
    readonly display?: boolean;
    readonly flags?: readonly string[];
    readonly groups?: readonly (BlankNode | NamedNode)[] | readonly string[];
    readonly hasValues?:
      | readonly (NamedNode | Literal)[]
      | readonly bigint[]
      | readonly boolean[]
      | readonly number[]
      | readonly string[];
    readonly in_?:
      | Maybe<readonly (NamedNode | Literal)[]>
      | readonly (NamedNode | Literal)[]
      | readonly bigint[]
      | readonly boolean[]
      | readonly number[]
      | readonly string[];
    readonly isDefinedBy?:
      | Maybe<BlankNode | NamedNode>
      | (BlankNode | NamedNode)
      | string;
    readonly label?: Maybe<string> | string;
    readonly languageIn?: Maybe<readonly string[]> | readonly string[];
    readonly maxCount?: Maybe<bigint> | bigint | number;
    readonly maxExclusive?:
      | Maybe<Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | Literal;
    readonly maxInclusive?:
      | Maybe<Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | Literal;
    readonly maxLength?: Maybe<bigint> | bigint | number;
    readonly minCount?: Maybe<bigint> | bigint | number;
    readonly minExclusive?:
      | Maybe<Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | Literal;
    readonly minInclusive?:
      | Maybe<Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | Literal;
    readonly minLength?: Maybe<bigint> | bigint | number;
    readonly mutable?: Maybe<boolean> | boolean;
    readonly name?: Maybe<string> | string;
    readonly node?:
      | Maybe<BlankNode | NamedNode>
      | (BlankNode | NamedNode)
      | string;
    readonly nodeKind?:
      | Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >
      | NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal";
    readonly not?: readonly (BlankNode | NamedNode)[] | readonly string[];
    readonly or?:
      | Maybe<readonly (BlankNode | NamedNode)[]>
      | readonly (BlankNode | NamedNode)[]
      | readonly string[];
    readonly order?: Maybe<number> | number;
    readonly path: $PropertyPath;
    readonly patterns?: readonly string[];
    readonly resolve?:
      | Maybe<BlankNode | NamedNode>
      | (BlankNode | NamedNode)
      | string;
    readonly shaclmateName?: Maybe<string> | string;
    readonly uniqueLang?: Maybe<boolean> | boolean;
    readonly xone?:
      | Maybe<readonly (BlankNode | NamedNode)[]>
      | readonly (BlankNode | NamedNode)[]
      | readonly string[];
  }): PropertyShape {
    const $identifierParameter = parameters.$identifier;
    let $identifier: () => PropertyShape.Identifier;
    if (typeof $identifierParameter === "function") {
      $identifier = $identifierParameter;
    } else if (typeof $identifierParameter === "object") {
      $identifier = () => $identifierParameter;
    } else if (typeof $identifierParameter === "string") {
      $identifier = () => dataFactory.namedNode($identifierParameter);
    } else if ($identifierParameter === undefined) {
      const $eagerIdentifier = dataFactory.blankNode();
      $identifier = () => $eagerIdentifier;
    } else {
      $identifier = $identifierParameter satisfies never;
    }
    const $type = "PropertyShape" as const;
    let and: Maybe<readonly (BlankNode | NamedNode)[]>;
    if (Maybe.isMaybe(parameters.and)) {
      and = parameters.and;
    } else if ($isReadonlyObjectArray(parameters.and)) {
      and = Maybe.of(parameters.and);
    } else if ($isReadonlyStringArray(parameters.and)) {
      and = Maybe.of(parameters.and.map((item) => dataFactory.namedNode(item)));
    } else if (parameters.and === undefined) {
      and = Maybe.empty();
    } else {
      and = parameters.and satisfies never;
    }
    let classes: readonly NamedNode[];
    if (parameters.classes === undefined) {
      classes = [];
    } else if ($isReadonlyObjectArray(parameters.classes)) {
      classes = parameters.classes;
    } else if ($isReadonlyStringArray(parameters.classes)) {
      classes = parameters.classes.map((item) => dataFactory.namedNode(item));
    } else {
      classes = parameters.classes satisfies never;
    }
    let comment: Maybe<string>;
    if (Maybe.isMaybe(parameters.comment)) {
      comment = parameters.comment;
    } else if (typeof parameters.comment === "string") {
      comment = Maybe.of(parameters.comment);
    } else if (parameters.comment === undefined) {
      comment = Maybe.empty();
    } else {
      comment = parameters.comment satisfies never;
    }
    let datatype: Maybe<NamedNode>;
    if (Maybe.isMaybe(parameters.datatype)) {
      datatype = parameters.datatype;
    } else if (typeof parameters.datatype === "object") {
      datatype = Maybe.of(parameters.datatype);
    } else if (typeof parameters.datatype === "string") {
      datatype = Maybe.of(dataFactory.namedNode(parameters.datatype));
    } else if (parameters.datatype === undefined) {
      datatype = Maybe.empty();
    } else {
      datatype = parameters.datatype satisfies never;
    }
    let deactivated: Maybe<boolean>;
    if (Maybe.isMaybe(parameters.deactivated)) {
      deactivated = parameters.deactivated;
    } else if (typeof parameters.deactivated === "boolean") {
      deactivated = Maybe.of(parameters.deactivated);
    } else if (parameters.deactivated === undefined) {
      deactivated = Maybe.empty();
    } else {
      deactivated = parameters.deactivated satisfies never;
    }
    let defaultValue: Maybe<NamedNode | Literal>;
    if (Maybe.isMaybe(parameters.defaultValue)) {
      defaultValue = parameters.defaultValue;
    } else if (typeof parameters.defaultValue === "bigint") {
      defaultValue = Maybe.of($literalFactory.bigint(parameters.defaultValue));
    } else if (typeof parameters.defaultValue === "boolean") {
      defaultValue = Maybe.of($literalFactory.boolean(parameters.defaultValue));
    } else if (
      typeof parameters.defaultValue === "object" &&
      parameters.defaultValue instanceof Date
    ) {
      defaultValue = Maybe.of($literalFactory.date(parameters.defaultValue));
    } else if (typeof parameters.defaultValue === "number") {
      defaultValue = Maybe.of($literalFactory.number(parameters.defaultValue));
    } else if (typeof parameters.defaultValue === "string") {
      defaultValue = Maybe.of($literalFactory.string(parameters.defaultValue));
    } else if (typeof parameters.defaultValue === "object") {
      defaultValue = Maybe.of(parameters.defaultValue);
    } else if (parameters.defaultValue === undefined) {
      defaultValue = Maybe.empty();
    } else {
      defaultValue = parameters.defaultValue satisfies never;
    }
    let description: Maybe<string>;
    if (Maybe.isMaybe(parameters.description)) {
      description = parameters.description;
    } else if (typeof parameters.description === "string") {
      description = Maybe.of(parameters.description);
    } else if (parameters.description === undefined) {
      description = Maybe.empty();
    } else {
      description = parameters.description satisfies never;
    }
    let display: boolean;
    if (typeof parameters.display === "boolean") {
      display = parameters.display;
    } else if (parameters.display === undefined) {
      display = false;
    } else {
      display = parameters.display satisfies never;
    }
    let flags: readonly string[];
    if (parameters.flags === undefined) {
      flags = [];
    } else if (typeof parameters.flags === "object") {
      flags = parameters.flags;
    } else {
      flags = parameters.flags satisfies never;
    }
    let groups: readonly (BlankNode | NamedNode)[];
    if (parameters.groups === undefined) {
      groups = [];
    } else if ($isReadonlyObjectArray(parameters.groups)) {
      groups = parameters.groups;
    } else if ($isReadonlyStringArray(parameters.groups)) {
      groups = parameters.groups.map((item) => dataFactory.namedNode(item));
    } else {
      groups = parameters.groups satisfies never;
    }
    let hasValues: readonly (NamedNode | Literal)[];
    if (parameters.hasValues === undefined) {
      hasValues = [];
    } else if ($isReadonlyObjectArray(parameters.hasValues)) {
      hasValues = parameters.hasValues;
    } else if ($isReadonlyBigIntArray(parameters.hasValues)) {
      hasValues = parameters.hasValues.map((item) =>
        $literalFactory.bigint(item),
      );
    } else if ($isReadonlyBooleanArray(parameters.hasValues)) {
      hasValues = parameters.hasValues.map((item) =>
        $literalFactory.boolean(item),
      );
    } else if ($isReadonlyNumberArray(parameters.hasValues)) {
      hasValues = parameters.hasValues.map((item) =>
        $literalFactory.number(item),
      );
    } else if ($isReadonlyStringArray(parameters.hasValues)) {
      hasValues = parameters.hasValues.map((item) =>
        $literalFactory.string(item),
      );
    } else {
      hasValues = parameters.hasValues satisfies never;
    }
    let in_: Maybe<readonly (NamedNode | Literal)[]>;
    if (Maybe.isMaybe(parameters.in_)) {
      in_ = parameters.in_;
    } else if ($isReadonlyObjectArray(parameters.in_)) {
      in_ = Maybe.of(parameters.in_);
    } else if ($isReadonlyBigIntArray(parameters.in_)) {
      in_ = Maybe.of(
        parameters.in_.map((item) => $literalFactory.bigint(item)),
      );
    } else if ($isReadonlyBooleanArray(parameters.in_)) {
      in_ = Maybe.of(
        parameters.in_.map((item) => $literalFactory.boolean(item)),
      );
    } else if ($isReadonlyNumberArray(parameters.in_)) {
      in_ = Maybe.of(
        parameters.in_.map((item) => $literalFactory.number(item)),
      );
    } else if ($isReadonlyStringArray(parameters.in_)) {
      in_ = Maybe.of(
        parameters.in_.map((item) => $literalFactory.string(item)),
      );
    } else if (parameters.in_ === undefined) {
      in_ = Maybe.empty();
    } else {
      in_ = parameters.in_ satisfies never;
    }
    let isDefinedBy: Maybe<BlankNode | NamedNode>;
    if (Maybe.isMaybe(parameters.isDefinedBy)) {
      isDefinedBy = parameters.isDefinedBy;
    } else if (typeof parameters.isDefinedBy === "object") {
      isDefinedBy = Maybe.of(parameters.isDefinedBy);
    } else if (typeof parameters.isDefinedBy === "string") {
      isDefinedBy = Maybe.of(dataFactory.namedNode(parameters.isDefinedBy));
    } else if (parameters.isDefinedBy === undefined) {
      isDefinedBy = Maybe.empty();
    } else {
      isDefinedBy = parameters.isDefinedBy satisfies never;
    }
    let label: Maybe<string>;
    if (Maybe.isMaybe(parameters.label)) {
      label = parameters.label;
    } else if (typeof parameters.label === "string") {
      label = Maybe.of(parameters.label);
    } else if (parameters.label === undefined) {
      label = Maybe.empty();
    } else {
      label = parameters.label satisfies never;
    }
    let languageIn: Maybe<readonly string[]>;
    if (Maybe.isMaybe(parameters.languageIn)) {
      languageIn = parameters.languageIn;
    } else if (typeof parameters.languageIn === "object") {
      languageIn = Maybe.of(parameters.languageIn);
    } else if (parameters.languageIn === undefined) {
      languageIn = Maybe.empty();
    } else {
      languageIn = parameters.languageIn satisfies never;
    }
    let maxCount: Maybe<bigint>;
    if (Maybe.isMaybe(parameters.maxCount)) {
      maxCount = parameters.maxCount;
    } else if (typeof parameters.maxCount === "bigint") {
      maxCount = Maybe.of(parameters.maxCount);
    } else if (typeof parameters.maxCount === "number") {
      maxCount = Maybe.of(BigInt(parameters.maxCount));
    } else if (parameters.maxCount === undefined) {
      maxCount = Maybe.empty();
    } else {
      maxCount = parameters.maxCount satisfies never;
    }
    let maxExclusive: Maybe<Literal>;
    if (Maybe.isMaybe(parameters.maxExclusive)) {
      maxExclusive = parameters.maxExclusive;
    } else if (typeof parameters.maxExclusive === "bigint") {
      maxExclusive = Maybe.of($literalFactory.bigint(parameters.maxExclusive));
    } else if (typeof parameters.maxExclusive === "boolean") {
      maxExclusive = Maybe.of($literalFactory.boolean(parameters.maxExclusive));
    } else if (
      typeof parameters.maxExclusive === "object" &&
      parameters.maxExclusive instanceof Date
    ) {
      maxExclusive = Maybe.of($literalFactory.date(parameters.maxExclusive));
    } else if (typeof parameters.maxExclusive === "number") {
      maxExclusive = Maybe.of($literalFactory.number(parameters.maxExclusive));
    } else if (typeof parameters.maxExclusive === "string") {
      maxExclusive = Maybe.of($literalFactory.string(parameters.maxExclusive));
    } else if (typeof parameters.maxExclusive === "object") {
      maxExclusive = Maybe.of(parameters.maxExclusive);
    } else if (parameters.maxExclusive === undefined) {
      maxExclusive = Maybe.empty();
    } else {
      maxExclusive = parameters.maxExclusive satisfies never;
    }
    let maxInclusive: Maybe<Literal>;
    if (Maybe.isMaybe(parameters.maxInclusive)) {
      maxInclusive = parameters.maxInclusive;
    } else if (typeof parameters.maxInclusive === "bigint") {
      maxInclusive = Maybe.of($literalFactory.bigint(parameters.maxInclusive));
    } else if (typeof parameters.maxInclusive === "boolean") {
      maxInclusive = Maybe.of($literalFactory.boolean(parameters.maxInclusive));
    } else if (
      typeof parameters.maxInclusive === "object" &&
      parameters.maxInclusive instanceof Date
    ) {
      maxInclusive = Maybe.of($literalFactory.date(parameters.maxInclusive));
    } else if (typeof parameters.maxInclusive === "number") {
      maxInclusive = Maybe.of($literalFactory.number(parameters.maxInclusive));
    } else if (typeof parameters.maxInclusive === "string") {
      maxInclusive = Maybe.of($literalFactory.string(parameters.maxInclusive));
    } else if (typeof parameters.maxInclusive === "object") {
      maxInclusive = Maybe.of(parameters.maxInclusive);
    } else if (parameters.maxInclusive === undefined) {
      maxInclusive = Maybe.empty();
    } else {
      maxInclusive = parameters.maxInclusive satisfies never;
    }
    let maxLength: Maybe<bigint>;
    if (Maybe.isMaybe(parameters.maxLength)) {
      maxLength = parameters.maxLength;
    } else if (typeof parameters.maxLength === "bigint") {
      maxLength = Maybe.of(parameters.maxLength);
    } else if (typeof parameters.maxLength === "number") {
      maxLength = Maybe.of(BigInt(parameters.maxLength));
    } else if (parameters.maxLength === undefined) {
      maxLength = Maybe.empty();
    } else {
      maxLength = parameters.maxLength satisfies never;
    }
    let minCount: Maybe<bigint>;
    if (Maybe.isMaybe(parameters.minCount)) {
      minCount = parameters.minCount;
    } else if (typeof parameters.minCount === "bigint") {
      minCount = Maybe.of(parameters.minCount);
    } else if (typeof parameters.minCount === "number") {
      minCount = Maybe.of(BigInt(parameters.minCount));
    } else if (parameters.minCount === undefined) {
      minCount = Maybe.empty();
    } else {
      minCount = parameters.minCount satisfies never;
    }
    let minExclusive: Maybe<Literal>;
    if (Maybe.isMaybe(parameters.minExclusive)) {
      minExclusive = parameters.minExclusive;
    } else if (typeof parameters.minExclusive === "bigint") {
      minExclusive = Maybe.of($literalFactory.bigint(parameters.minExclusive));
    } else if (typeof parameters.minExclusive === "boolean") {
      minExclusive = Maybe.of($literalFactory.boolean(parameters.minExclusive));
    } else if (
      typeof parameters.minExclusive === "object" &&
      parameters.minExclusive instanceof Date
    ) {
      minExclusive = Maybe.of($literalFactory.date(parameters.minExclusive));
    } else if (typeof parameters.minExclusive === "number") {
      minExclusive = Maybe.of($literalFactory.number(parameters.minExclusive));
    } else if (typeof parameters.minExclusive === "string") {
      minExclusive = Maybe.of($literalFactory.string(parameters.minExclusive));
    } else if (typeof parameters.minExclusive === "object") {
      minExclusive = Maybe.of(parameters.minExclusive);
    } else if (parameters.minExclusive === undefined) {
      minExclusive = Maybe.empty();
    } else {
      minExclusive = parameters.minExclusive satisfies never;
    }
    let minInclusive: Maybe<Literal>;
    if (Maybe.isMaybe(parameters.minInclusive)) {
      minInclusive = parameters.minInclusive;
    } else if (typeof parameters.minInclusive === "bigint") {
      minInclusive = Maybe.of($literalFactory.bigint(parameters.minInclusive));
    } else if (typeof parameters.minInclusive === "boolean") {
      minInclusive = Maybe.of($literalFactory.boolean(parameters.minInclusive));
    } else if (
      typeof parameters.minInclusive === "object" &&
      parameters.minInclusive instanceof Date
    ) {
      minInclusive = Maybe.of($literalFactory.date(parameters.minInclusive));
    } else if (typeof parameters.minInclusive === "number") {
      minInclusive = Maybe.of($literalFactory.number(parameters.minInclusive));
    } else if (typeof parameters.minInclusive === "string") {
      minInclusive = Maybe.of($literalFactory.string(parameters.minInclusive));
    } else if (typeof parameters.minInclusive === "object") {
      minInclusive = Maybe.of(parameters.minInclusive);
    } else if (parameters.minInclusive === undefined) {
      minInclusive = Maybe.empty();
    } else {
      minInclusive = parameters.minInclusive satisfies never;
    }
    let minLength: Maybe<bigint>;
    if (Maybe.isMaybe(parameters.minLength)) {
      minLength = parameters.minLength;
    } else if (typeof parameters.minLength === "bigint") {
      minLength = Maybe.of(parameters.minLength);
    } else if (typeof parameters.minLength === "number") {
      minLength = Maybe.of(BigInt(parameters.minLength));
    } else if (parameters.minLength === undefined) {
      minLength = Maybe.empty();
    } else {
      minLength = parameters.minLength satisfies never;
    }
    let mutable: Maybe<boolean>;
    if (Maybe.isMaybe(parameters.mutable)) {
      mutable = parameters.mutable;
    } else if (typeof parameters.mutable === "boolean") {
      mutable = Maybe.of(parameters.mutable);
    } else if (parameters.mutable === undefined) {
      mutable = Maybe.empty();
    } else {
      mutable = parameters.mutable satisfies never;
    }
    let name: Maybe<string>;
    if (Maybe.isMaybe(parameters.name)) {
      name = parameters.name;
    } else if (typeof parameters.name === "string") {
      name = Maybe.of(parameters.name);
    } else if (parameters.name === undefined) {
      name = Maybe.empty();
    } else {
      name = parameters.name satisfies never;
    }
    let node: Maybe<BlankNode | NamedNode>;
    if (Maybe.isMaybe(parameters.node)) {
      node = parameters.node;
    } else if (typeof parameters.node === "object") {
      node = Maybe.of(parameters.node);
    } else if (typeof parameters.node === "string") {
      node = Maybe.of(dataFactory.namedNode(parameters.node));
    } else if (parameters.node === undefined) {
      node = Maybe.empty();
    } else {
      node = parameters.node satisfies never;
    }
    let nodeKind: Maybe<
      NamedNode<
        | "http://www.w3.org/ns/shacl#BlankNode"
        | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
        | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
        | "http://www.w3.org/ns/shacl#IRI"
        | "http://www.w3.org/ns/shacl#IRIOrLiteral"
        | "http://www.w3.org/ns/shacl#Literal"
      >
    >;
    if (Maybe.isMaybe(parameters.nodeKind)) {
      nodeKind = parameters.nodeKind;
    } else if (typeof parameters.nodeKind === "object") {
      nodeKind = Maybe.of(parameters.nodeKind);
    } else if (typeof parameters.nodeKind === "string") {
      nodeKind = Maybe.of(dataFactory.namedNode(parameters.nodeKind));
    } else if (parameters.nodeKind === undefined) {
      nodeKind = Maybe.empty();
    } else {
      nodeKind = parameters.nodeKind satisfies never;
    }
    let not: readonly (BlankNode | NamedNode)[];
    if (parameters.not === undefined) {
      not = [];
    } else if ($isReadonlyObjectArray(parameters.not)) {
      not = parameters.not;
    } else if ($isReadonlyStringArray(parameters.not)) {
      not = parameters.not.map((item) => dataFactory.namedNode(item));
    } else {
      not = parameters.not satisfies never;
    }
    let or: Maybe<readonly (BlankNode | NamedNode)[]>;
    if (Maybe.isMaybe(parameters.or)) {
      or = parameters.or;
    } else if ($isReadonlyObjectArray(parameters.or)) {
      or = Maybe.of(parameters.or);
    } else if ($isReadonlyStringArray(parameters.or)) {
      or = Maybe.of(parameters.or.map((item) => dataFactory.namedNode(item)));
    } else if (parameters.or === undefined) {
      or = Maybe.empty();
    } else {
      or = parameters.or satisfies never;
    }
    let order: Maybe<number>;
    if (Maybe.isMaybe(parameters.order)) {
      order = parameters.order;
    } else if (typeof parameters.order === "number") {
      order = Maybe.of(parameters.order);
    } else if (parameters.order === undefined) {
      order = Maybe.empty();
    } else {
      order = parameters.order satisfies never;
    }
    const path = parameters.path;
    let patterns: readonly string[];
    if (parameters.patterns === undefined) {
      patterns = [];
    } else if (typeof parameters.patterns === "object") {
      patterns = parameters.patterns;
    } else {
      patterns = parameters.patterns satisfies never;
    }
    let resolve: Maybe<BlankNode | NamedNode>;
    if (Maybe.isMaybe(parameters.resolve)) {
      resolve = parameters.resolve;
    } else if (typeof parameters.resolve === "object") {
      resolve = Maybe.of(parameters.resolve);
    } else if (typeof parameters.resolve === "string") {
      resolve = Maybe.of(dataFactory.namedNode(parameters.resolve));
    } else if (parameters.resolve === undefined) {
      resolve = Maybe.empty();
    } else {
      resolve = parameters.resolve satisfies never;
    }
    let shaclmateName: Maybe<string>;
    if (Maybe.isMaybe(parameters.shaclmateName)) {
      shaclmateName = parameters.shaclmateName;
    } else if (typeof parameters.shaclmateName === "string") {
      shaclmateName = Maybe.of(parameters.shaclmateName);
    } else if (parameters.shaclmateName === undefined) {
      shaclmateName = Maybe.empty();
    } else {
      shaclmateName = parameters.shaclmateName satisfies never;
    }
    let uniqueLang: Maybe<boolean>;
    if (Maybe.isMaybe(parameters.uniqueLang)) {
      uniqueLang = parameters.uniqueLang;
    } else if (typeof parameters.uniqueLang === "boolean") {
      uniqueLang = Maybe.of(parameters.uniqueLang);
    } else if (parameters.uniqueLang === undefined) {
      uniqueLang = Maybe.empty();
    } else {
      uniqueLang = parameters.uniqueLang satisfies never;
    }
    let xone: Maybe<readonly (BlankNode | NamedNode)[]>;
    if (Maybe.isMaybe(parameters.xone)) {
      xone = parameters.xone;
    } else if ($isReadonlyObjectArray(parameters.xone)) {
      xone = Maybe.of(parameters.xone);
    } else if ($isReadonlyStringArray(parameters.xone)) {
      xone = Maybe.of(
        parameters.xone.map((item) => dataFactory.namedNode(item)),
      );
    } else if (parameters.xone === undefined) {
      xone = Maybe.empty();
    } else {
      xone = parameters.xone satisfies never;
    }
    const $object = {
      $identifier,
      $type,
      and,
      classes,
      comment,
      datatype,
      deactivated,
      defaultValue,
      description,
      display,
      flags,
      groups,
      hasValues,
      in_,
      isDefinedBy,
      label,
      languageIn,
      maxCount,
      maxExclusive,
      maxInclusive,
      maxLength,
      minCount,
      minExclusive,
      minInclusive,
      minLength,
      mutable,
      name,
      node,
      nodeKind,
      not,
      or,
      order,
      path,
      patterns,
      resolve,
      shaclmateName,
      uniqueLang,
      xone,
    };
    if (!globalThis.Object.prototype.hasOwnProperty.call($object, "toString")) {
      ($object as any).toString = $toString;
    }
    return $object;
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
      filter.display !== undefined &&
      !$filterBoolean(filter.display, value.display)
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
      filter.mutable !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.mutable,
        value.mutable,
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
      filter.resolve !== undefined &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.resolve, value.resolve)
    ) {
      return false;
    }
    if (
      filter.shaclmateName !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.shaclmateName,
        value.shaclmateName,
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
    readonly display?: $BooleanFilter;
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
    readonly mutable?: $MaybeFilter<$BooleanFilter>;
    readonly name?: $MaybeFilter<$StringFilter>;
    readonly node?: $MaybeFilter<$IdentifierFilter>;
    readonly nodeKind?: $MaybeFilter<$IriFilter>;
    readonly not?: $CollectionFilter<$IdentifierFilter>;
    readonly or?: $MaybeFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly order?: $MaybeFilter<$NumericFilter<number>>;
    readonly path?: $PropertyPath.Filter;
    readonly patterns?: $CollectionFilter<$StringFilter>;
    readonly resolve?: $MaybeFilter<$IdentifierFilter>;
    readonly shaclmateName?: $MaybeFilter<$StringFilter>;
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
        display: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.display,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .map((values) =>
                values.length > 0
                  ? values
                  : new Resource.Value({
                      dataFactory: dataFactory,
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.display.path,
                      term: dataFactory.literal(
                        "false",
                        $RdfVocabularies.xsd.boolean,
                      ),
                    }).toValues(),
              )
              .chain((values) => values.chainMap((value) => value.toBoolean())),
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
        mutable: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.mutable,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.mutable.path,
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
        resolve: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.resolve,
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
                        PropertyShape.schema.properties.resolve.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        shaclmateName: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.shaclmateName,
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
                        PropertyShape.schema.properties.shaclmateName.path,
                      value: Maybe.empty(),
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
      }).map((properties) => create(properties)),
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
      display: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "DefaultValue" as const,
          item: () => ({ kind: "Boolean" as const }),
          defaultValue: dataFactory.literal(
            "false",
            $RdfVocabularies.xsd.boolean,
          ),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#display",
        ),
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
      mutable: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#mutable",
        ),
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
            ],
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
      resolve: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#resolve",
        ),
      },
      shaclmateName: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      parameters.object.classes.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      parameters.object.comment
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      parameters.object.datatype.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      parameters.object.deactivated
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
      parameters.object.defaultValue.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
      parameters.object.description
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#display"),
      $strictEquals(parameters.object.display, false).isLeft()
        ? [
            $literalFactory.boolean(
              parameters.object.display,
              $RdfVocabularies.xsd.boolean,
            ),
          ]
        : [],
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      parameters.object.flags.flatMap((item) => [$literalFactory.string(item)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
      parameters.object.groups.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      parameters.object.hasValues.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
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
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#isDefinedBy"),
      parameters.object.isDefinedBy.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      parameters.object.label
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      parameters.object.maxCount
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      parameters.object.maxExclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      parameters.object.maxInclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      parameters.object.maxLength
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      parameters.object.minCount
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      parameters.object.minExclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      parameters.object.minInclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      parameters.object.minLength
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
      parameters.object.mutable
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
      parameters.object.name
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      parameters.object.node.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      parameters.object.nodeKind.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      parameters.object.not.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
      parameters.object.order
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      [
        $PropertyPath.toRdfResource(parameters.object.path, {
          graph: parameters.graph,
          resourceSet: parameters.resourceSet,
        }).identifier,
      ],
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      parameters.object.patterns.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#resolve"),
      parameters.object.resolve.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      parameters.object.shaclmateName
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
      parameters.object.uniqueLang
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
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
      shaclmateName: _propertyShape.shaclmateName
        .map((item) => item.toString())
        .extract(),
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
      | (BlankNode | NamedNode)
      | string;
    readonly comment?: Maybe<string> | string;
    readonly label?: Maybe<string> | string;
  }): PropertyGroup {
    const $identifierParameter = parameters?.$identifier;
    let $identifier: () => PropertyGroup.Identifier;
    if (typeof $identifierParameter === "function") {
      $identifier = $identifierParameter;
    } else if (typeof $identifierParameter === "object") {
      $identifier = () => $identifierParameter;
    } else if (typeof $identifierParameter === "string") {
      $identifier = () => dataFactory.namedNode($identifierParameter);
    } else if ($identifierParameter === undefined) {
      const $eagerIdentifier = dataFactory.blankNode();
      $identifier = () => $eagerIdentifier;
    } else {
      $identifier = $identifierParameter satisfies never;
    }
    const $type = "PropertyGroup" as const;
    let comment: Maybe<string>;
    if (Maybe.isMaybe(parameters?.comment)) {
      comment = parameters?.comment;
    } else if (typeof parameters?.comment === "string") {
      comment = Maybe.of(parameters?.comment);
    } else if (parameters?.comment === undefined) {
      comment = Maybe.empty();
    } else {
      comment = parameters?.comment satisfies never;
    }
    let label: Maybe<string>;
    if (Maybe.isMaybe(parameters?.label)) {
      label = parameters?.label;
    } else if (typeof parameters?.label === "string") {
      label = Maybe.of(parameters?.label);
    } else if (parameters?.label === undefined) {
      label = Maybe.empty();
    } else {
      label = parameters?.label satisfies never;
    }
    const $object = { $identifier, $type, comment, label };
    if (!globalThis.Object.prototype.hasOwnProperty.call($object, "toString")) {
      ($object as any).toString = $toString;
    }
    return $object;
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
      }).map((properties) => create(properties)),
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
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      parameters.object.comment
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
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
      | (BlankNode | NamedNode)
      | string;
    readonly comment?: Maybe<string> | string;
    readonly label?: Maybe<string> | string;
  }): Ontology {
    const $identifierParameter = parameters?.$identifier;
    let $identifier: () => Ontology.Identifier;
    if (typeof $identifierParameter === "function") {
      $identifier = $identifierParameter;
    } else if (typeof $identifierParameter === "object") {
      $identifier = () => $identifierParameter;
    } else if (typeof $identifierParameter === "string") {
      $identifier = () => dataFactory.namedNode($identifierParameter);
    } else if ($identifierParameter === undefined) {
      const $eagerIdentifier = dataFactory.blankNode();
      $identifier = () => $eagerIdentifier;
    } else {
      $identifier = $identifierParameter satisfies never;
    }
    const $type = "Ontology" as const;
    let comment: Maybe<string>;
    if (Maybe.isMaybe(parameters?.comment)) {
      comment = parameters?.comment;
    } else if (typeof parameters?.comment === "string") {
      comment = Maybe.of(parameters?.comment);
    } else if (parameters?.comment === undefined) {
      comment = Maybe.empty();
    } else {
      comment = parameters?.comment satisfies never;
    }
    let label: Maybe<string>;
    if (Maybe.isMaybe(parameters?.label)) {
      label = parameters?.label;
    } else if (typeof parameters?.label === "string") {
      label = Maybe.of(parameters?.label);
    } else if (parameters?.label === undefined) {
      label = Maybe.empty();
    } else {
      label = parameters?.label satisfies never;
    }
    const $object = { $identifier, $type, comment, label };
    if (!globalThis.Object.prototype.hasOwnProperty.call($object, "toString")) {
      ($object as any).toString = $toString;
    }
    return $object;
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
      }).map((properties) => create(properties)),
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
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      parameters.object.comment
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
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
  readonly discriminantValue: Maybe<string>;
  readonly extern: Maybe<boolean>;
  readonly flags: readonly string[];
  readonly fromRdfType: Maybe<NamedNode>;
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
  readonly mutable: Maybe<boolean>;
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
  readonly rdfType: Maybe<NamedNode>;
  readonly shaclmateName: Maybe<string>;
  readonly subClassOf: readonly NamedNode[];
  readonly toRdfTypes: readonly NamedNode[];
  readonly tsImports: readonly string[];
  readonly types: readonly NamedNode[];
  readonly xone: Maybe<readonly (BlankNode | NamedNode)[]>;
}

export namespace NodeShape {
  export function create(parameters?: {
    readonly $identifier?:
      | (() => NodeShape.Identifier)
      | (BlankNode | NamedNode)
      | string;
    readonly and?:
      | Maybe<readonly (BlankNode | NamedNode)[]>
      | readonly (BlankNode | NamedNode)[]
      | readonly string[];
    readonly classes?: readonly NamedNode[] | readonly string[];
    readonly closed?: Maybe<boolean> | boolean;
    readonly comment?: Maybe<string> | string;
    readonly datatype?: Maybe<NamedNode> | NamedNode | string;
    readonly deactivated?: Maybe<boolean> | boolean;
    readonly discriminantValue?: Maybe<string> | string;
    readonly extern?: Maybe<boolean> | boolean;
    readonly flags?: readonly string[];
    readonly fromRdfType?: Maybe<NamedNode> | NamedNode | string;
    readonly hasValues?:
      | readonly (NamedNode | Literal)[]
      | readonly bigint[]
      | readonly boolean[]
      | readonly number[]
      | readonly string[];
    readonly ignoredProperties?:
      | Maybe<readonly NamedNode[]>
      | readonly NamedNode[]
      | readonly string[];
    readonly in_?:
      | Maybe<readonly (NamedNode | Literal)[]>
      | readonly (NamedNode | Literal)[]
      | readonly bigint[]
      | readonly boolean[]
      | readonly number[]
      | readonly string[];
    readonly isDefinedBy?:
      | Maybe<BlankNode | NamedNode>
      | (BlankNode | NamedNode)
      | string;
    readonly label?: Maybe<string> | string;
    readonly languageIn?: Maybe<readonly string[]> | readonly string[];
    readonly maxCount?: Maybe<bigint> | bigint | number;
    readonly maxExclusive?:
      | Maybe<Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | Literal;
    readonly maxInclusive?:
      | Maybe<Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | Literal;
    readonly maxLength?: Maybe<bigint> | bigint | number;
    readonly minCount?: Maybe<bigint> | bigint | number;
    readonly minExclusive?:
      | Maybe<Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | Literal;
    readonly minInclusive?:
      | Maybe<Literal>
      | bigint
      | boolean
      | Date
      | number
      | string
      | Literal;
    readonly minLength?: Maybe<bigint> | bigint | number;
    readonly mutable?: Maybe<boolean> | boolean;
    readonly node?:
      | Maybe<BlankNode | NamedNode>
      | (BlankNode | NamedNode)
      | string;
    readonly nodeKind?:
      | Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >
      | NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal";
    readonly not?: readonly (BlankNode | NamedNode)[] | readonly string[];
    readonly or?:
      | Maybe<readonly (BlankNode | NamedNode)[]>
      | readonly (BlankNode | NamedNode)[]
      | readonly string[];
    readonly patterns?: readonly string[];
    readonly properties?:
      | readonly (BlankNode | NamedNode)[]
      | readonly string[];
    readonly rdfType?: Maybe<NamedNode> | NamedNode | string;
    readonly shaclmateName?: Maybe<string> | string;
    readonly subClassOf?: readonly NamedNode[] | readonly string[];
    readonly toRdfTypes?: readonly NamedNode[] | readonly string[];
    readonly tsImports?: readonly string[];
    readonly types?: readonly NamedNode[] | readonly string[];
    readonly xone?:
      | Maybe<readonly (BlankNode | NamedNode)[]>
      | readonly (BlankNode | NamedNode)[]
      | readonly string[];
  }): NodeShape {
    const $identifierParameter = parameters?.$identifier;
    let $identifier: () => NodeShape.Identifier;
    if (typeof $identifierParameter === "function") {
      $identifier = $identifierParameter;
    } else if (typeof $identifierParameter === "object") {
      $identifier = () => $identifierParameter;
    } else if (typeof $identifierParameter === "string") {
      $identifier = () => dataFactory.namedNode($identifierParameter);
    } else if ($identifierParameter === undefined) {
      const $eagerIdentifier = dataFactory.blankNode();
      $identifier = () => $eagerIdentifier;
    } else {
      $identifier = $identifierParameter satisfies never;
    }
    const $type = "NodeShape" as const;
    let and: Maybe<readonly (BlankNode | NamedNode)[]>;
    if (Maybe.isMaybe(parameters?.and)) {
      and = parameters?.and;
    } else if ($isReadonlyObjectArray(parameters?.and)) {
      and = Maybe.of(parameters?.and);
    } else if ($isReadonlyStringArray(parameters?.and)) {
      and = Maybe.of(
        parameters?.and.map((item) => dataFactory.namedNode(item)),
      );
    } else if (parameters?.and === undefined) {
      and = Maybe.empty();
    } else {
      and = parameters?.and satisfies never;
    }
    let classes: readonly NamedNode[];
    if (parameters?.classes === undefined) {
      classes = [];
    } else if ($isReadonlyObjectArray(parameters?.classes)) {
      classes = parameters?.classes;
    } else if ($isReadonlyStringArray(parameters?.classes)) {
      classes = parameters?.classes.map((item) => dataFactory.namedNode(item));
    } else {
      classes = parameters?.classes satisfies never;
    }
    let closed: Maybe<boolean>;
    if (Maybe.isMaybe(parameters?.closed)) {
      closed = parameters?.closed;
    } else if (typeof parameters?.closed === "boolean") {
      closed = Maybe.of(parameters?.closed);
    } else if (parameters?.closed === undefined) {
      closed = Maybe.empty();
    } else {
      closed = parameters?.closed satisfies never;
    }
    let comment: Maybe<string>;
    if (Maybe.isMaybe(parameters?.comment)) {
      comment = parameters?.comment;
    } else if (typeof parameters?.comment === "string") {
      comment = Maybe.of(parameters?.comment);
    } else if (parameters?.comment === undefined) {
      comment = Maybe.empty();
    } else {
      comment = parameters?.comment satisfies never;
    }
    let datatype: Maybe<NamedNode>;
    if (Maybe.isMaybe(parameters?.datatype)) {
      datatype = parameters?.datatype;
    } else if (typeof parameters?.datatype === "object") {
      datatype = Maybe.of(parameters?.datatype);
    } else if (typeof parameters?.datatype === "string") {
      datatype = Maybe.of(dataFactory.namedNode(parameters?.datatype));
    } else if (parameters?.datatype === undefined) {
      datatype = Maybe.empty();
    } else {
      datatype = parameters?.datatype satisfies never;
    }
    let deactivated: Maybe<boolean>;
    if (Maybe.isMaybe(parameters?.deactivated)) {
      deactivated = parameters?.deactivated;
    } else if (typeof parameters?.deactivated === "boolean") {
      deactivated = Maybe.of(parameters?.deactivated);
    } else if (parameters?.deactivated === undefined) {
      deactivated = Maybe.empty();
    } else {
      deactivated = parameters?.deactivated satisfies never;
    }
    let discriminantValue: Maybe<string>;
    if (Maybe.isMaybe(parameters?.discriminantValue)) {
      discriminantValue = parameters?.discriminantValue;
    } else if (typeof parameters?.discriminantValue === "string") {
      discriminantValue = Maybe.of(parameters?.discriminantValue);
    } else if (parameters?.discriminantValue === undefined) {
      discriminantValue = Maybe.empty();
    } else {
      discriminantValue = parameters?.discriminantValue satisfies never;
    }
    let extern: Maybe<boolean>;
    if (Maybe.isMaybe(parameters?.extern)) {
      extern = parameters?.extern;
    } else if (typeof parameters?.extern === "boolean") {
      extern = Maybe.of(parameters?.extern);
    } else if (parameters?.extern === undefined) {
      extern = Maybe.empty();
    } else {
      extern = parameters?.extern satisfies never;
    }
    let flags: readonly string[];
    if (parameters?.flags === undefined) {
      flags = [];
    } else if (typeof parameters?.flags === "object") {
      flags = parameters?.flags;
    } else {
      flags = parameters?.flags satisfies never;
    }
    let fromRdfType: Maybe<NamedNode>;
    if (Maybe.isMaybe(parameters?.fromRdfType)) {
      fromRdfType = parameters?.fromRdfType;
    } else if (typeof parameters?.fromRdfType === "object") {
      fromRdfType = Maybe.of(parameters?.fromRdfType);
    } else if (typeof parameters?.fromRdfType === "string") {
      fromRdfType = Maybe.of(dataFactory.namedNode(parameters?.fromRdfType));
    } else if (parameters?.fromRdfType === undefined) {
      fromRdfType = Maybe.empty();
    } else {
      fromRdfType = parameters?.fromRdfType satisfies never;
    }
    let hasValues: readonly (NamedNode | Literal)[];
    if (parameters?.hasValues === undefined) {
      hasValues = [];
    } else if ($isReadonlyObjectArray(parameters?.hasValues)) {
      hasValues = parameters?.hasValues;
    } else if ($isReadonlyBigIntArray(parameters?.hasValues)) {
      hasValues = parameters?.hasValues.map((item) =>
        $literalFactory.bigint(item),
      );
    } else if ($isReadonlyBooleanArray(parameters?.hasValues)) {
      hasValues = parameters?.hasValues.map((item) =>
        $literalFactory.boolean(item),
      );
    } else if ($isReadonlyNumberArray(parameters?.hasValues)) {
      hasValues = parameters?.hasValues.map((item) =>
        $literalFactory.number(item),
      );
    } else if ($isReadonlyStringArray(parameters?.hasValues)) {
      hasValues = parameters?.hasValues.map((item) =>
        $literalFactory.string(item),
      );
    } else {
      hasValues = parameters?.hasValues satisfies never;
    }
    let ignoredProperties: Maybe<readonly NamedNode[]>;
    if (Maybe.isMaybe(parameters?.ignoredProperties)) {
      ignoredProperties = parameters?.ignoredProperties;
    } else if ($isReadonlyObjectArray(parameters?.ignoredProperties)) {
      ignoredProperties = Maybe.of(parameters?.ignoredProperties);
    } else if ($isReadonlyStringArray(parameters?.ignoredProperties)) {
      ignoredProperties = Maybe.of(
        parameters?.ignoredProperties.map((item) =>
          dataFactory.namedNode(item),
        ),
      );
    } else if (parameters?.ignoredProperties === undefined) {
      ignoredProperties = Maybe.empty();
    } else {
      ignoredProperties = parameters?.ignoredProperties satisfies never;
    }
    let in_: Maybe<readonly (NamedNode | Literal)[]>;
    if (Maybe.isMaybe(parameters?.in_)) {
      in_ = parameters?.in_;
    } else if ($isReadonlyObjectArray(parameters?.in_)) {
      in_ = Maybe.of(parameters?.in_);
    } else if ($isReadonlyBigIntArray(parameters?.in_)) {
      in_ = Maybe.of(
        parameters?.in_.map((item) => $literalFactory.bigint(item)),
      );
    } else if ($isReadonlyBooleanArray(parameters?.in_)) {
      in_ = Maybe.of(
        parameters?.in_.map((item) => $literalFactory.boolean(item)),
      );
    } else if ($isReadonlyNumberArray(parameters?.in_)) {
      in_ = Maybe.of(
        parameters?.in_.map((item) => $literalFactory.number(item)),
      );
    } else if ($isReadonlyStringArray(parameters?.in_)) {
      in_ = Maybe.of(
        parameters?.in_.map((item) => $literalFactory.string(item)),
      );
    } else if (parameters?.in_ === undefined) {
      in_ = Maybe.empty();
    } else {
      in_ = parameters?.in_ satisfies never;
    }
    let isDefinedBy: Maybe<BlankNode | NamedNode>;
    if (Maybe.isMaybe(parameters?.isDefinedBy)) {
      isDefinedBy = parameters?.isDefinedBy;
    } else if (typeof parameters?.isDefinedBy === "object") {
      isDefinedBy = Maybe.of(parameters?.isDefinedBy);
    } else if (typeof parameters?.isDefinedBy === "string") {
      isDefinedBy = Maybe.of(dataFactory.namedNode(parameters?.isDefinedBy));
    } else if (parameters?.isDefinedBy === undefined) {
      isDefinedBy = Maybe.empty();
    } else {
      isDefinedBy = parameters?.isDefinedBy satisfies never;
    }
    let label: Maybe<string>;
    if (Maybe.isMaybe(parameters?.label)) {
      label = parameters?.label;
    } else if (typeof parameters?.label === "string") {
      label = Maybe.of(parameters?.label);
    } else if (parameters?.label === undefined) {
      label = Maybe.empty();
    } else {
      label = parameters?.label satisfies never;
    }
    let languageIn: Maybe<readonly string[]>;
    if (Maybe.isMaybe(parameters?.languageIn)) {
      languageIn = parameters?.languageIn;
    } else if (typeof parameters?.languageIn === "object") {
      languageIn = Maybe.of(parameters?.languageIn);
    } else if (parameters?.languageIn === undefined) {
      languageIn = Maybe.empty();
    } else {
      languageIn = parameters?.languageIn satisfies never;
    }
    let maxCount: Maybe<bigint>;
    if (Maybe.isMaybe(parameters?.maxCount)) {
      maxCount = parameters?.maxCount;
    } else if (typeof parameters?.maxCount === "bigint") {
      maxCount = Maybe.of(parameters?.maxCount);
    } else if (typeof parameters?.maxCount === "number") {
      maxCount = Maybe.of(BigInt(parameters?.maxCount));
    } else if (parameters?.maxCount === undefined) {
      maxCount = Maybe.empty();
    } else {
      maxCount = parameters?.maxCount satisfies never;
    }
    let maxExclusive: Maybe<Literal>;
    if (Maybe.isMaybe(parameters?.maxExclusive)) {
      maxExclusive = parameters?.maxExclusive;
    } else if (typeof parameters?.maxExclusive === "bigint") {
      maxExclusive = Maybe.of($literalFactory.bigint(parameters?.maxExclusive));
    } else if (typeof parameters?.maxExclusive === "boolean") {
      maxExclusive = Maybe.of(
        $literalFactory.boolean(parameters?.maxExclusive),
      );
    } else if (
      typeof parameters?.maxExclusive === "object" &&
      parameters?.maxExclusive instanceof Date
    ) {
      maxExclusive = Maybe.of($literalFactory.date(parameters?.maxExclusive));
    } else if (typeof parameters?.maxExclusive === "number") {
      maxExclusive = Maybe.of($literalFactory.number(parameters?.maxExclusive));
    } else if (typeof parameters?.maxExclusive === "string") {
      maxExclusive = Maybe.of($literalFactory.string(parameters?.maxExclusive));
    } else if (typeof parameters?.maxExclusive === "object") {
      maxExclusive = Maybe.of(parameters?.maxExclusive);
    } else if (parameters?.maxExclusive === undefined) {
      maxExclusive = Maybe.empty();
    } else {
      maxExclusive = parameters?.maxExclusive satisfies never;
    }
    let maxInclusive: Maybe<Literal>;
    if (Maybe.isMaybe(parameters?.maxInclusive)) {
      maxInclusive = parameters?.maxInclusive;
    } else if (typeof parameters?.maxInclusive === "bigint") {
      maxInclusive = Maybe.of($literalFactory.bigint(parameters?.maxInclusive));
    } else if (typeof parameters?.maxInclusive === "boolean") {
      maxInclusive = Maybe.of(
        $literalFactory.boolean(parameters?.maxInclusive),
      );
    } else if (
      typeof parameters?.maxInclusive === "object" &&
      parameters?.maxInclusive instanceof Date
    ) {
      maxInclusive = Maybe.of($literalFactory.date(parameters?.maxInclusive));
    } else if (typeof parameters?.maxInclusive === "number") {
      maxInclusive = Maybe.of($literalFactory.number(parameters?.maxInclusive));
    } else if (typeof parameters?.maxInclusive === "string") {
      maxInclusive = Maybe.of($literalFactory.string(parameters?.maxInclusive));
    } else if (typeof parameters?.maxInclusive === "object") {
      maxInclusive = Maybe.of(parameters?.maxInclusive);
    } else if (parameters?.maxInclusive === undefined) {
      maxInclusive = Maybe.empty();
    } else {
      maxInclusive = parameters?.maxInclusive satisfies never;
    }
    let maxLength: Maybe<bigint>;
    if (Maybe.isMaybe(parameters?.maxLength)) {
      maxLength = parameters?.maxLength;
    } else if (typeof parameters?.maxLength === "bigint") {
      maxLength = Maybe.of(parameters?.maxLength);
    } else if (typeof parameters?.maxLength === "number") {
      maxLength = Maybe.of(BigInt(parameters?.maxLength));
    } else if (parameters?.maxLength === undefined) {
      maxLength = Maybe.empty();
    } else {
      maxLength = parameters?.maxLength satisfies never;
    }
    let minCount: Maybe<bigint>;
    if (Maybe.isMaybe(parameters?.minCount)) {
      minCount = parameters?.minCount;
    } else if (typeof parameters?.minCount === "bigint") {
      minCount = Maybe.of(parameters?.minCount);
    } else if (typeof parameters?.minCount === "number") {
      minCount = Maybe.of(BigInt(parameters?.minCount));
    } else if (parameters?.minCount === undefined) {
      minCount = Maybe.empty();
    } else {
      minCount = parameters?.minCount satisfies never;
    }
    let minExclusive: Maybe<Literal>;
    if (Maybe.isMaybe(parameters?.minExclusive)) {
      minExclusive = parameters?.minExclusive;
    } else if (typeof parameters?.minExclusive === "bigint") {
      minExclusive = Maybe.of($literalFactory.bigint(parameters?.minExclusive));
    } else if (typeof parameters?.minExclusive === "boolean") {
      minExclusive = Maybe.of(
        $literalFactory.boolean(parameters?.minExclusive),
      );
    } else if (
      typeof parameters?.minExclusive === "object" &&
      parameters?.minExclusive instanceof Date
    ) {
      minExclusive = Maybe.of($literalFactory.date(parameters?.minExclusive));
    } else if (typeof parameters?.minExclusive === "number") {
      minExclusive = Maybe.of($literalFactory.number(parameters?.minExclusive));
    } else if (typeof parameters?.minExclusive === "string") {
      minExclusive = Maybe.of($literalFactory.string(parameters?.minExclusive));
    } else if (typeof parameters?.minExclusive === "object") {
      minExclusive = Maybe.of(parameters?.minExclusive);
    } else if (parameters?.minExclusive === undefined) {
      minExclusive = Maybe.empty();
    } else {
      minExclusive = parameters?.minExclusive satisfies never;
    }
    let minInclusive: Maybe<Literal>;
    if (Maybe.isMaybe(parameters?.minInclusive)) {
      minInclusive = parameters?.minInclusive;
    } else if (typeof parameters?.minInclusive === "bigint") {
      minInclusive = Maybe.of($literalFactory.bigint(parameters?.minInclusive));
    } else if (typeof parameters?.minInclusive === "boolean") {
      minInclusive = Maybe.of(
        $literalFactory.boolean(parameters?.minInclusive),
      );
    } else if (
      typeof parameters?.minInclusive === "object" &&
      parameters?.minInclusive instanceof Date
    ) {
      minInclusive = Maybe.of($literalFactory.date(parameters?.minInclusive));
    } else if (typeof parameters?.minInclusive === "number") {
      minInclusive = Maybe.of($literalFactory.number(parameters?.minInclusive));
    } else if (typeof parameters?.minInclusive === "string") {
      minInclusive = Maybe.of($literalFactory.string(parameters?.minInclusive));
    } else if (typeof parameters?.minInclusive === "object") {
      minInclusive = Maybe.of(parameters?.minInclusive);
    } else if (parameters?.minInclusive === undefined) {
      minInclusive = Maybe.empty();
    } else {
      minInclusive = parameters?.minInclusive satisfies never;
    }
    let minLength: Maybe<bigint>;
    if (Maybe.isMaybe(parameters?.minLength)) {
      minLength = parameters?.minLength;
    } else if (typeof parameters?.minLength === "bigint") {
      minLength = Maybe.of(parameters?.minLength);
    } else if (typeof parameters?.minLength === "number") {
      minLength = Maybe.of(BigInt(parameters?.minLength));
    } else if (parameters?.minLength === undefined) {
      minLength = Maybe.empty();
    } else {
      minLength = parameters?.minLength satisfies never;
    }
    let mutable: Maybe<boolean>;
    if (Maybe.isMaybe(parameters?.mutable)) {
      mutable = parameters?.mutable;
    } else if (typeof parameters?.mutable === "boolean") {
      mutable = Maybe.of(parameters?.mutable);
    } else if (parameters?.mutable === undefined) {
      mutable = Maybe.empty();
    } else {
      mutable = parameters?.mutable satisfies never;
    }
    let node: Maybe<BlankNode | NamedNode>;
    if (Maybe.isMaybe(parameters?.node)) {
      node = parameters?.node;
    } else if (typeof parameters?.node === "object") {
      node = Maybe.of(parameters?.node);
    } else if (typeof parameters?.node === "string") {
      node = Maybe.of(dataFactory.namedNode(parameters?.node));
    } else if (parameters?.node === undefined) {
      node = Maybe.empty();
    } else {
      node = parameters?.node satisfies never;
    }
    let nodeKind: Maybe<
      NamedNode<
        | "http://www.w3.org/ns/shacl#BlankNode"
        | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
        | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
        | "http://www.w3.org/ns/shacl#IRI"
        | "http://www.w3.org/ns/shacl#IRIOrLiteral"
        | "http://www.w3.org/ns/shacl#Literal"
      >
    >;
    if (Maybe.isMaybe(parameters?.nodeKind)) {
      nodeKind = parameters?.nodeKind;
    } else if (typeof parameters?.nodeKind === "object") {
      nodeKind = Maybe.of(parameters?.nodeKind);
    } else if (typeof parameters?.nodeKind === "string") {
      nodeKind = Maybe.of(dataFactory.namedNode(parameters?.nodeKind));
    } else if (parameters?.nodeKind === undefined) {
      nodeKind = Maybe.empty();
    } else {
      nodeKind = parameters?.nodeKind satisfies never;
    }
    let not: readonly (BlankNode | NamedNode)[];
    if (parameters?.not === undefined) {
      not = [];
    } else if ($isReadonlyObjectArray(parameters?.not)) {
      not = parameters?.not;
    } else if ($isReadonlyStringArray(parameters?.not)) {
      not = parameters?.not.map((item) => dataFactory.namedNode(item));
    } else {
      not = parameters?.not satisfies never;
    }
    let or: Maybe<readonly (BlankNode | NamedNode)[]>;
    if (Maybe.isMaybe(parameters?.or)) {
      or = parameters?.or;
    } else if ($isReadonlyObjectArray(parameters?.or)) {
      or = Maybe.of(parameters?.or);
    } else if ($isReadonlyStringArray(parameters?.or)) {
      or = Maybe.of(parameters?.or.map((item) => dataFactory.namedNode(item)));
    } else if (parameters?.or === undefined) {
      or = Maybe.empty();
    } else {
      or = parameters?.or satisfies never;
    }
    let patterns: readonly string[];
    if (parameters?.patterns === undefined) {
      patterns = [];
    } else if (typeof parameters?.patterns === "object") {
      patterns = parameters?.patterns;
    } else {
      patterns = parameters?.patterns satisfies never;
    }
    let properties: readonly (BlankNode | NamedNode)[];
    if (parameters?.properties === undefined) {
      properties = [];
    } else if ($isReadonlyObjectArray(parameters?.properties)) {
      properties = parameters?.properties;
    } else if ($isReadonlyStringArray(parameters?.properties)) {
      properties = parameters?.properties.map((item) =>
        dataFactory.namedNode(item),
      );
    } else {
      properties = parameters?.properties satisfies never;
    }
    let rdfType: Maybe<NamedNode>;
    if (Maybe.isMaybe(parameters?.rdfType)) {
      rdfType = parameters?.rdfType;
    } else if (typeof parameters?.rdfType === "object") {
      rdfType = Maybe.of(parameters?.rdfType);
    } else if (typeof parameters?.rdfType === "string") {
      rdfType = Maybe.of(dataFactory.namedNode(parameters?.rdfType));
    } else if (parameters?.rdfType === undefined) {
      rdfType = Maybe.empty();
    } else {
      rdfType = parameters?.rdfType satisfies never;
    }
    let shaclmateName: Maybe<string>;
    if (Maybe.isMaybe(parameters?.shaclmateName)) {
      shaclmateName = parameters?.shaclmateName;
    } else if (typeof parameters?.shaclmateName === "string") {
      shaclmateName = Maybe.of(parameters?.shaclmateName);
    } else if (parameters?.shaclmateName === undefined) {
      shaclmateName = Maybe.empty();
    } else {
      shaclmateName = parameters?.shaclmateName satisfies never;
    }
    let subClassOf: readonly NamedNode[];
    if (parameters?.subClassOf === undefined) {
      subClassOf = [];
    } else if ($isReadonlyObjectArray(parameters?.subClassOf)) {
      subClassOf = parameters?.subClassOf;
    } else if ($isReadonlyStringArray(parameters?.subClassOf)) {
      subClassOf = parameters?.subClassOf.map((item) =>
        dataFactory.namedNode(item),
      );
    } else {
      subClassOf = parameters?.subClassOf satisfies never;
    }
    let toRdfTypes: readonly NamedNode[];
    if (parameters?.toRdfTypes === undefined) {
      toRdfTypes = [];
    } else if ($isReadonlyObjectArray(parameters?.toRdfTypes)) {
      toRdfTypes = parameters?.toRdfTypes;
    } else if ($isReadonlyStringArray(parameters?.toRdfTypes)) {
      toRdfTypes = parameters?.toRdfTypes.map((item) =>
        dataFactory.namedNode(item),
      );
    } else {
      toRdfTypes = parameters?.toRdfTypes satisfies never;
    }
    let tsImports: readonly string[];
    if (parameters?.tsImports === undefined) {
      tsImports = [];
    } else if (typeof parameters?.tsImports === "object") {
      tsImports = parameters?.tsImports;
    } else {
      tsImports = parameters?.tsImports satisfies never;
    }
    let types: readonly NamedNode[];
    if (parameters?.types === undefined) {
      types = [];
    } else if ($isReadonlyObjectArray(parameters?.types)) {
      types = parameters?.types;
    } else if ($isReadonlyStringArray(parameters?.types)) {
      types = parameters?.types.map((item) => dataFactory.namedNode(item));
    } else {
      types = parameters?.types satisfies never;
    }
    let xone: Maybe<readonly (BlankNode | NamedNode)[]>;
    if (Maybe.isMaybe(parameters?.xone)) {
      xone = parameters?.xone;
    } else if ($isReadonlyObjectArray(parameters?.xone)) {
      xone = Maybe.of(parameters?.xone);
    } else if ($isReadonlyStringArray(parameters?.xone)) {
      xone = Maybe.of(
        parameters?.xone.map((item) => dataFactory.namedNode(item)),
      );
    } else if (parameters?.xone === undefined) {
      xone = Maybe.empty();
    } else {
      xone = parameters?.xone satisfies never;
    }
    const $object = {
      $identifier,
      $type,
      and,
      classes,
      closed,
      comment,
      datatype,
      deactivated,
      discriminantValue,
      extern,
      flags,
      fromRdfType,
      hasValues,
      ignoredProperties,
      in_,
      isDefinedBy,
      label,
      languageIn,
      maxCount,
      maxExclusive,
      maxInclusive,
      maxLength,
      minCount,
      minExclusive,
      minInclusive,
      minLength,
      mutable,
      node,
      nodeKind,
      not,
      or,
      patterns,
      properties,
      rdfType,
      shaclmateName,
      subClassOf,
      toRdfTypes,
      tsImports,
      types,
      xone,
    };
    if (!globalThis.Object.prototype.hasOwnProperty.call($object, "toString")) {
      ($object as any).toString = $toString;
    }
    return $object;
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
      filter.discriminantValue !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.discriminantValue,
        value.discriminantValue,
      )
    ) {
      return false;
    }
    if (
      filter.extern !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.extern,
        value.extern,
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
      filter.fromRdfType !== undefined &&
      !$filterMaybe<NamedNode, $IriFilter>($filterIri)(
        filter.fromRdfType,
        value.fromRdfType,
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
      filter.mutable !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.mutable,
        value.mutable,
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
      filter.rdfType !== undefined &&
      !$filterMaybe<NamedNode, $IriFilter>($filterIri)(
        filter.rdfType,
        value.rdfType,
      )
    ) {
      return false;
    }
    if (
      filter.shaclmateName !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.shaclmateName,
        value.shaclmateName,
      )
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
      filter.toRdfTypes !== undefined &&
      !$filterArray<NamedNode, $IriFilter>($filterIri)(
        filter.toRdfTypes,
        value.toRdfTypes,
      )
    ) {
      return false;
    }
    if (
      filter.tsImports !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.tsImports,
        value.tsImports,
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
    readonly discriminantValue?: $MaybeFilter<$StringFilter>;
    readonly extern?: $MaybeFilter<$BooleanFilter>;
    readonly flags?: $CollectionFilter<$StringFilter>;
    readonly fromRdfType?: $MaybeFilter<$IriFilter>;
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
    readonly mutable?: $MaybeFilter<$BooleanFilter>;
    readonly node?: $MaybeFilter<$IdentifierFilter>;
    readonly nodeKind?: $MaybeFilter<$IriFilter>;
    readonly not?: $CollectionFilter<$IdentifierFilter>;
    readonly or?: $MaybeFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly patterns?: $CollectionFilter<$StringFilter>;
    readonly properties?: $CollectionFilter<$IdentifierFilter>;
    readonly rdfType?: $MaybeFilter<$IriFilter>;
    readonly shaclmateName?: $MaybeFilter<$StringFilter>;
    readonly subClassOf?: $CollectionFilter<$IriFilter>;
    readonly toRdfTypes?: $CollectionFilter<$IriFilter>;
    readonly tsImports?: $CollectionFilter<$StringFilter>;
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
        discriminantValue: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.discriminantValue,
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
                        NodeShape.schema.properties.discriminantValue.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        extern: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.extern,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $resource,
                      propertyPath: NodeShape.schema.properties.extern.path,
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
        fromRdfType: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.fromRdfType,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<NamedNode>>({
                      focusResource: $resource,
                      propertyPath:
                        NodeShape.schema.properties.fromRdfType.path,
                      value: Maybe.empty(),
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
        mutable: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.mutable,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $resource,
                      propertyPath:
                        PropertyShape.schema.properties.mutable.path,
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
        rdfType: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.rdfType,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<NamedNode>>({
                      focusResource: $resource,
                      propertyPath: NodeShape.schema.properties.rdfType.path,
                      value: Maybe.empty(),
                    }),
              ),
        }),
        shaclmateName: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.shaclmateName,
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
                        PropertyShape.schema.properties.shaclmateName.path,
                      value: Maybe.empty(),
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
        toRdfTypes: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.toRdfTypes,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) => values.chainMap((value) => value.toIri()))
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $resource,
                  propertyPath: NodeShape.schema.properties.toRdfTypes.path,
                  value: valuesArray,
                }),
              ),
        }),
        tsImports: $shaclPropertyFromRdf({
          graph: _$options.graph,
          resource: $resource,
          propertySchema: schema.properties.tsImports,
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
                  propertyPath: NodeShape.schema.properties.tsImports.path,
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
      }).map((properties) => create(properties)),
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
      discriminantValue: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#discriminantValue",
        ),
      },
      extern: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#extern",
        ),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      fromRdfType: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#fromRdfType",
        ),
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
      mutable: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#mutable",
        ),
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
            ],
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
      rdfType: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#rdfType",
        ),
      },
      shaclmateName: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      },
      subClassOf: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: $RdfVocabularies.rdfs.subClassOf,
      },
      toRdfTypes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#toRdfType",
        ),
      },
      tsImports: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsImport",
        ),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      parameters.object.classes.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
      parameters.object.closed
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      parameters.object.comment
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      parameters.object.datatype.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      parameters.object.deactivated
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#discriminantValue",
      ),
      parameters.object.discriminantValue
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
      parameters.object.extern
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      parameters.object.flags.flatMap((item) => [$literalFactory.string(item)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#fromRdfType"),
      parameters.object.fromRdfType.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      parameters.object.hasValues.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#ignoredProperties"),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
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
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#isDefinedBy"),
      parameters.object.isDefinedBy.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      parameters.object.label
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      parameters.object.maxCount
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      parameters.object.maxExclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      parameters.object.maxInclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      parameters.object.maxLength
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      parameters.object.minCount
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      parameters.object.minExclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      parameters.object.minInclusive.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      parameters.object.minLength
        .toList()
        .flatMap((value) => [
          $literalFactory.bigint(value, $RdfVocabularies.xsd.integer),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
      parameters.object.mutable
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      parameters.object.node.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      parameters.object.nodeKind.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      parameters.object.not.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      parameters.object.patterns.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
      parameters.object.properties.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#rdfType"),
      parameters.object.rdfType.toList(),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      parameters.object.shaclmateName
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      $RdfVocabularies.rdfs.subClassOf,
      parameters.object.subClassOf.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#toRdfType"),
      parameters.object.toRdfTypes.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
      parameters.object.tsImports.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      $RdfVocabularies.rdf.type,
      parameters.object.types.flatMap((item) => [item]),
      parameters.graph,
    );
    parameters.resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
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
      shaclmateName: _nodeShape.shaclmateName
        .map((item) => item.toString())
        .extract(),
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
      mutable: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#mutable",
        ),
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
            ],
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
      shaclmateName: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
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

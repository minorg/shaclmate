import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import type {
  BlankNode,
  DatasetCore,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import { Either, Left, Maybe, NonEmptyList, Right } from "purify-ts";
import {
  LiteralFactory,
  PropertyPath as RdfjsResourcePropertyPath,
  Resource,
  ResourceSet,
} from "rdfjs-resource";
import { z } from "zod";

/**
 * Compare two arrays element-wise with the provided elementEquals function.
 */
function $arrayEquals<T>(
  leftArray: readonly T[],
  rightArray: readonly T[],
  elementEquals: (left: T, right: T) => boolean | $EqualsResult,
): $EqualsResult {
  if (leftArray.length !== rightArray.length) {
    return Left({ left: leftArray, right: rightArray, type: "array-length" });
  }

  for (
    let leftElementIndex = 0;
    leftElementIndex < leftArray.length;
    leftElementIndex++
  ) {
    const leftElement = leftArray[leftElementIndex];

    const rightUnequals: $EqualsResult.Unequal[] = [];
    for (
      let rightElementIndex = 0;
      rightElementIndex < rightArray.length;
      rightElementIndex++
    ) {
      const rightElement = rightArray[rightElementIndex];

      const leftElementEqualsRightElement =
        $EqualsResult.fromBooleanEqualsResult(
          leftElement,
          rightElement,
          elementEquals(leftElement, rightElement),
        );
      if (leftElementEqualsRightElement.isRight()) {
        break; // left element === right element, break out of the right iteration
      }
      rightUnequals.push(
        leftElementEqualsRightElement.extract() as $EqualsResult.Unequal,
      );
    }

    if (rightUnequals.length === rightArray.length) {
      // All right elements were unequal to the left element
      return Left({
        left: {
          array: leftArray,
          element: leftElement,
          elementIndex: leftElementIndex,
        },
        right: { array: rightArray, unequals: rightUnequals },
        type: "array-element",
      });
    }
    // Else there was a right element equal to the left element, continue to the next left element
  }

  return $EqualsResult.Equal;
}

/**
 * Compare two objects with equals(other: T): boolean methods and return an $EqualsResult.
 */
function $booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left.equals(right));
}

type $CollectionFilter<ItemFilterT> = ItemFilterT & {
  readonly $maxCount?: number;
  readonly $minCount?: number;
};

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

type $Hasher = {
  update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
};

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

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

function $maybeEquals<T>(
  leftMaybe: Maybe<T>,
  rightMaybe: Maybe<T>,
  valueEquals: (left: T, right: T) => boolean | $EqualsResult,
): $EqualsResult {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return $EqualsResult.fromBooleanEqualsResult(
        leftMaybe,
        rightMaybe,
        valueEquals(leftMaybe.unsafeCoerce(), rightMaybe.unsafeCoerce()),
      );
    }
    return Left({ left: leftMaybe.unsafeCoerce(), type: "right-null" });
  }

  if (rightMaybe.isJust()) {
    return Left({ right: rightMaybe.unsafeCoerce(), type: "left-null" });
  }

  return $EqualsResult.Equal;
}

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

interface $NumericFilter<T> {
  readonly in?: readonly T[];
  readonly maxExclusive?: T;
  readonly maxInclusive?: T;
  readonly minExclusive?: T;
  readonly minInclusive?: T;
}

type $PropertiesFromRdfResourceFunction<T> = (
  resource: Resource,
  options: {
    context: undefined | unknown;
    graph: Exclude<Quad_Graph, Variable> | undefined;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
  },
) => Either<Error, T>;

export type $PropertyPath = RdfjsResourcePropertyPath;

export namespace $PropertyPath {
  export type $Filter = object;

  export function $filter(_filter: $Filter, _value: $PropertyPath): boolean {
    return true;
  }

  export const $fromRdfResource: $FromRdfResourceFunction<$PropertyPath> =
    RdfjsResourcePropertyPath.fromResource;

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    $PropertyPath
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => $fromRdfResource(resource, options)),
      ),
    );

  export const $schema: Readonly<object> = {};

  export const $toRdfResource: $ToRdfResourceFunction<$PropertyPath> =
    RdfjsResourcePropertyPath.toResource;
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

export type $ToRdfResourceFunction<T> = (
  value: T,
  options?: {
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    resourceSet?: ResourceSet;
  },
) => Resource;

export type $ToRdfResourceValuesFunction<T> = (
  value: T,
  options: {
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    propertyPath: $PropertyPath;
    resource: Resource;
    resourceSet: ResourceSet;
  },
) => (bigint | boolean | number | string | BlankNode | Literal | NamedNode)[];
export interface NestedNodeShape {
  readonly $identifier: NestedNodeShape.$Identifier;
  readonly $type: "NestedNodeShape" /**
   * Required string
   */;

  readonly requiredStringProperty: string;
}

export namespace NestedNodeShape {
  export function $create(parameters: {
    readonly $identifier?: (BlankNode | NamedNode) | string;
    readonly requiredStringProperty: string;
  }): NestedNodeShape {
    let $identifier: NestedNodeShape.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (parameters.$identifier === undefined) {
      $identifier = dataFactory.blankNode();
    } else {
      $identifier = parameters.$identifier satisfies never;
    }
    const $type = "NestedNodeShape" as const;
    const requiredStringProperty = parameters.requiredStringProperty;
    return { $identifier, $type, requiredStringProperty };
  }

  export function $equals(
    left: NestedNodeShape,
    right: NestedNodeShape,
  ): $EqualsResult {
    return $booleanEquals(left.$identifier, right.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "property" as const,
      }))
      .chain(() =>
        $strictEquals(left.$type, right.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          left.requiredStringProperty,
          right.requiredStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "requiredStringProperty",
          propertyValuesUnequal,
          type: "property" as const,
        })),
      );
  }

  export function $hash<HasherT extends $Hasher>(
    _nestedNodeShape: NestedNodeShape,
    _hasher: HasherT,
  ): HasherT {
    NestedNodeShape.$hashShaclProperties(_nestedNodeShape, _hasher);
    _hasher.update(_nestedNodeShape.$identifier.value);
    _hasher.update(_nestedNodeShape.$type);
    return _hasher;
  }

  export function $hashShaclProperties<HasherT extends $Hasher>(
    _nestedNodeShape: NestedNodeShape,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_nestedNodeShape.requiredStringProperty);
    return _hasher;
  }

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "NestedNodeShape";
    readonly requiredStringProperty: string;
  };

  export function $filter(
    filter: NestedNodeShape.$Filter,
    value: NestedNodeShape,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
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

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly requiredStringProperty?: $StringFilter;
  };

  export function $fromJson(json: NestedNodeShape.$Json): NestedNodeShape {
    return $propertiesFromJson(json);
  }

  export const $fromRdfResource: $FromRdfResourceFunction<NestedNodeShape> = (
    resource,
    options,
  ) => {
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
    return NestedNodeShape.$propertiesFromRdfResource(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
    });
  };

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    NestedNodeShape
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) =>
            NestedNodeShape.$fromRdfResource(resource, options),
          ),
      ),
    );

  export function isNestedNodeShape(
    object: $Object,
  ): object is NestedNodeShape {
    switch (object.$type) {
      case "NestedNodeShape":
        return true;
      default:
        return false;
    }
  }

  export function $jsonSchema() {
    return z.toJSONSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }): any {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        {
          label: "Identifier",
          scope: `${scopePrefix}/properties/@id`,
          type: "Control",
        },
        {
          rule: {
            condition: {
              schema: { const: "NestedNodeShape" as const },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          label: "Required string",
          scope: `${scopePrefix}/properties/requiredStringProperty`,
          type: "Control",
        },
      ],
      label: "NestedNodeShape",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return z.object({
      "@id": z.string().min(1),
      $type: z.literal("NestedNodeShape"),
      requiredStringProperty: z.string(),
    }) satisfies z.ZodType<$Json>;
  }

  export function $parseJson(json: unknown): Either<Error, NestedNodeShape> {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(json);
    if (!$jsonSafeParseResult.success) {
      return Left($jsonSafeParseResult.error);
    }
    return Right($fromJson($jsonSafeParseResult.data));
  }

  export function $propertiesFromJson($json: NestedNodeShape.$Json): {
    $identifier: BlankNode | NamedNode;
    $type: "NestedNodeShape";
    requiredStringProperty: string;
  } {
    const $identifier = $json["@id"].startsWith("_:")
      ? dataFactory.blankNode($json["@id"].substring(2))
      : dataFactory.namedNode($json["@id"]);
    const $type = "NestedNodeShape" as const;
    const requiredStringProperty = $json["requiredStringProperty"];
    return { $identifier, $type, requiredStringProperty };
  }

  export const $propertiesFromRdfResource: $PropertiesFromRdfResourceFunction<{
    $identifier: BlankNode | NamedNode;
    $type: "NestedNodeShape";
    requiredStringProperty: string;
  }> = ($resource, _$options) => {
    return Right(
      new Resource.Value({
        dataFactory: dataFactory,
        focusResource: $resource,
        propertyPath: $RdfVocabularies.rdf.subject,
        term: $resource.identifier,
      }).toValues(),
    )
      .chain((values) => values.chainMap((value) => value.toIdentifier()))
      .chain((values) => values.head())
      .chain(($identifier) =>
        Right<"NestedNodeShape">("NestedNodeShape" as const).chain(($type) =>
          $shaclPropertyFromRdf({
            graph: _$options.graph,
            resource: $resource,
            propertySchema: $schema.properties.requiredStringProperty,
            typeFromRdf: (resourceValues) =>
              resourceValues
                .chain((values) =>
                  $fromRdfPreferredLanguages(
                    values,
                    _$options.preferredLanguages,
                  ),
                )
                .chain((values) =>
                  values.chainMap((value) => value.toString()),
                ),
          }).map((requiredStringProperty) => ({
            $identifier,
            $type,
            requiredStringProperty,
          })),
        ),
      );
  };

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["NestedNodeShape"],
        }),
      },
      requiredStringProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "String" as const }),
        path: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
      },
    },
  } as const;

  export function $toJson(
    _nestedNodeShape: NestedNodeShape,
  ): NestedNodeShape.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _nestedNodeShape.$identifier.termType === "BlankNode"
            ? `_:${_nestedNodeShape.$identifier.value}`
            : _nestedNodeShape.$identifier.value,
        $type: _nestedNodeShape.$type,
        requiredStringProperty: _nestedNodeShape.requiredStringProperty,
      } satisfies NestedNodeShape.$Json),
    );
  }

  export function $toRdfResource(
    _nestedNodeShape: NestedNodeShape,
    options?: Parameters<$ToRdfResourceFunction<NestedNodeShape>>[1],
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_nestedNodeShape.$identifier);
    resource.add(
      dataFactory.namedNode("http://example.com/requiredStringProperty"),
      [$literalFactory.string(_nestedNodeShape.requiredStringProperty)],
      options?.graph,
    );
    return resource;
  }
} /**
 * Form
 */

export interface FormNodeShape {
  readonly $identifier: FormNodeShape.$Identifier;
  readonly $type: "FormNodeShape" /**
   * Empty string set
   */;

  readonly emptyStringSetProperty: readonly string[] /**
   * Nested object
   */;

  readonly nestedObjectProperty: NestedNodeShape /**
   * Non-empty string set
   */;

  readonly nonEmptyStringSetProperty: NonEmptyList<string> /**
   * Optional string
   */;

  readonly optionalStringProperty: Maybe<string> /**
   * Required integer
   */;

  readonly requiredIntegerProperty: number /**
   * Required string
   */;

  readonly requiredStringProperty: string;
}

export namespace FormNodeShape {
  export function $create(parameters: {
    readonly $identifier?: (BlankNode | NamedNode) | string;
    readonly emptyStringSetProperty?: readonly string[];
    readonly nestedObjectProperty: NestedNodeShape;
    readonly nonEmptyStringSetProperty: NonEmptyList<string>;
    readonly optionalStringProperty?: Maybe<string> | string;
    readonly requiredIntegerProperty: number;
    readonly requiredStringProperty: string;
  }): FormNodeShape {
    let $identifier: FormNodeShape.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (parameters.$identifier === undefined) {
      $identifier = dataFactory.blankNode();
    } else {
      $identifier = parameters.$identifier satisfies never;
    }
    const $type = "FormNodeShape" as const;
    let emptyStringSetProperty: readonly string[];
    if (parameters.emptyStringSetProperty === undefined) {
      emptyStringSetProperty = [];
    } else if (typeof parameters.emptyStringSetProperty === "object") {
      emptyStringSetProperty = parameters.emptyStringSetProperty;
    } else {
      emptyStringSetProperty =
        parameters.emptyStringSetProperty satisfies never;
    }
    const nestedObjectProperty = parameters.nestedObjectProperty;
    const nonEmptyStringSetProperty = parameters.nonEmptyStringSetProperty;
    let optionalStringProperty: Maybe<string>;
    if (Maybe.isMaybe(parameters.optionalStringProperty)) {
      optionalStringProperty = parameters.optionalStringProperty;
    } else if (typeof parameters.optionalStringProperty === "string") {
      optionalStringProperty = Maybe.of(parameters.optionalStringProperty);
    } else if (parameters.optionalStringProperty === undefined) {
      optionalStringProperty = Maybe.empty();
    } else {
      optionalStringProperty =
        parameters.optionalStringProperty satisfies never;
    }
    const requiredIntegerProperty = parameters.requiredIntegerProperty;
    const requiredStringProperty = parameters.requiredStringProperty;
    return {
      $identifier,
      $type,
      emptyStringSetProperty,
      nestedObjectProperty,
      nonEmptyStringSetProperty,
      optionalStringProperty,
      requiredIntegerProperty,
      requiredStringProperty,
    };
  }

  export function $equals(
    left: FormNodeShape,
    right: FormNodeShape,
  ): $EqualsResult {
    return $booleanEquals(left.$identifier, right.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "property" as const,
      }))
      .chain(() =>
        $strictEquals(left.$type, right.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $arrayEquals(left, right, $strictEquals))(
          left.emptyStringSetProperty,
          right.emptyStringSetProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "emptyStringSetProperty",
          propertyValuesUnequal,
          type: "property" as const,
        })),
      )
      .chain(() =>
        NestedNodeShape.$equals(
          left.nestedObjectProperty,
          right.nestedObjectProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "nestedObjectProperty",
          propertyValuesUnequal,
          type: "property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $arrayEquals(left, right, $strictEquals))(
          left.nonEmptyStringSetProperty,
          right.nonEmptyStringSetProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "nonEmptyStringSetProperty",
          propertyValuesUnequal,
          type: "property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          left.optionalStringProperty,
          right.optionalStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "optionalStringProperty",
          propertyValuesUnequal,
          type: "property" as const,
        })),
      )
      .chain(() =>
        $strictEquals(
          left.requiredIntegerProperty,
          right.requiredIntegerProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "requiredIntegerProperty",
          propertyValuesUnequal,
          type: "property" as const,
        })),
      )
      .chain(() =>
        $strictEquals(
          left.requiredStringProperty,
          right.requiredStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "requiredStringProperty",
          propertyValuesUnequal,
          type: "property" as const,
        })),
      );
  }

  export function $hash<HasherT extends $Hasher>(
    _formNodeShape: FormNodeShape,
    _hasher: HasherT,
  ): HasherT {
    FormNodeShape.$hashShaclProperties(_formNodeShape, _hasher);
    _hasher.update(_formNodeShape.$identifier.value);
    _hasher.update(_formNodeShape.$type);
    return _hasher;
  }

  export function $hashShaclProperties<HasherT extends $Hasher>(
    _formNodeShape: FormNodeShape,
    _hasher: HasherT,
  ): HasherT {
    for (const item0 of _formNodeShape.emptyStringSetProperty) {
      _hasher.update(item0);
    }
    NestedNodeShape.$hash(_formNodeShape.nestedObjectProperty, _hasher);
    for (const item0 of _formNodeShape.nonEmptyStringSetProperty) {
      _hasher.update(item0);
    }
    _formNodeShape.optionalStringProperty.ifJust((value0) => {
      _hasher.update(value0);
    });
    _hasher.update(_formNodeShape.requiredIntegerProperty.toString());
    _hasher.update(_formNodeShape.requiredStringProperty);
    return _hasher;
  }

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "FormNodeShape";
    readonly emptyStringSetProperty?: readonly string[];
    readonly nestedObjectProperty: NestedNodeShape.$Json;
    readonly nonEmptyStringSetProperty: readonly string[];
    readonly optionalStringProperty?: string;
    readonly requiredIntegerProperty: number;
    readonly requiredStringProperty: string;
  };

  export function $filter(
    filter: FormNodeShape.$Filter,
    value: FormNodeShape,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      filter.emptyStringSetProperty !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.emptyStringSetProperty,
        value.emptyStringSetProperty,
      )
    ) {
      return false;
    }
    if (
      filter.nestedObjectProperty !== undefined &&
      !NestedNodeShape.$filter(
        filter.nestedObjectProperty,
        value.nestedObjectProperty,
      )
    ) {
      return false;
    }
    if (
      filter.nonEmptyStringSetProperty !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.nonEmptyStringSetProperty,
        value.nonEmptyStringSetProperty,
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
      filter.requiredIntegerProperty !== undefined &&
      !$filterNumeric<number>(
        filter.requiredIntegerProperty,
        value.requiredIntegerProperty,
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

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly emptyStringSetProperty?: $CollectionFilter<$StringFilter>;
    readonly nestedObjectProperty?: NestedNodeShape.$Filter;
    readonly nonEmptyStringSetProperty?: $CollectionFilter<$StringFilter>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredIntegerProperty?: $NumericFilter<number>;
    readonly requiredStringProperty?: $StringFilter;
  };

  export function $fromJson(json: FormNodeShape.$Json): FormNodeShape {
    return $propertiesFromJson(json);
  }

  export const $fromRdfResource: $FromRdfResourceFunction<FormNodeShape> = (
    resource,
    options,
  ) => {
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
    return FormNodeShape.$propertiesFromRdfResource(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
    });
  };

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    FormNodeShape
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) =>
            FormNodeShape.$fromRdfResource(resource, options),
          ),
      ),
    );

  export function isFormNodeShape(object: $Object): object is FormNodeShape {
    switch (object.$type) {
      case "FormNodeShape":
        return true;
      default:
        return false;
    }
  }

  export function $jsonSchema() {
    return z.toJSONSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }): any {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        {
          label: "Identifier",
          scope: `${scopePrefix}/properties/@id`,
          type: "Control",
        },
        {
          rule: {
            condition: {
              schema: { const: "FormNodeShape" as const },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          label: "Empty string set",
          scope: `${scopePrefix}/properties/emptyStringSetProperty`,
          type: "Control",
        },
        NestedNodeShape.$jsonUiSchema({
          scopePrefix: `${scopePrefix}/properties/nestedObjectProperty`,
        }),
        {
          label: "Non-empty string set",
          scope: `${scopePrefix}/properties/nonEmptyStringSetProperty`,
          type: "Control",
        },
        {
          label: "Optional string",
          scope: `${scopePrefix}/properties/optionalStringProperty`,
          type: "Control",
        },
        {
          label: "Required integer",
          scope: `${scopePrefix}/properties/requiredIntegerProperty`,
          type: "Control",
        },
        {
          label: "Required string",
          scope: `${scopePrefix}/properties/requiredStringProperty`,
          type: "Control",
        },
      ],
      label: "Form",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return z.object({
      "@id": z.string().min(1),
      $type: z.literal("FormNodeShape"),
      emptyStringSetProperty: z
        .string()
        .array()
        .default(() => []),
      nestedObjectProperty: NestedNodeShape.$jsonZodSchema(),
      nonEmptyStringSetProperty: z.string().array().nonempty().min(1),
      optionalStringProperty: z.string().optional(),
      requiredIntegerProperty: z.number(),
      requiredStringProperty: z.string(),
    }) satisfies z.ZodType<$Json>;
  }

  export function $parseJson(json: unknown): Either<Error, FormNodeShape> {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(json);
    if (!$jsonSafeParseResult.success) {
      return Left($jsonSafeParseResult.error);
    }
    return Right($fromJson($jsonSafeParseResult.data));
  }

  export function $propertiesFromJson($json: FormNodeShape.$Json): {
    $identifier: BlankNode | NamedNode;
    $type: "FormNodeShape";
    emptyStringSetProperty: readonly string[];
    nestedObjectProperty: NestedNodeShape;
    nonEmptyStringSetProperty: NonEmptyList<string>;
    optionalStringProperty: Maybe<string>;
    requiredIntegerProperty: number;
    requiredStringProperty: string;
  } {
    const $identifier = $json["@id"].startsWith("_:")
      ? dataFactory.blankNode($json["@id"].substring(2))
      : dataFactory.namedNode($json["@id"]);
    const $type = "FormNodeShape" as const;
    const emptyStringSetProperty = $json["emptyStringSetProperty"] ?? [];
    const nestedObjectProperty = NestedNodeShape.$fromJson(
      $json["nestedObjectProperty"],
    );
    const nonEmptyStringSetProperty = NonEmptyList.fromArray(
      $json["nonEmptyStringSetProperty"],
    ).unsafeCoerce();
    const optionalStringProperty = Maybe.fromNullable(
      $json["optionalStringProperty"],
    );
    const requiredIntegerProperty = $json["requiredIntegerProperty"];
    const requiredStringProperty = $json["requiredStringProperty"];
    return {
      $identifier,
      $type,
      emptyStringSetProperty,
      nestedObjectProperty,
      nonEmptyStringSetProperty,
      optionalStringProperty,
      requiredIntegerProperty,
      requiredStringProperty,
    };
  }

  export const $propertiesFromRdfResource: $PropertiesFromRdfResourceFunction<{
    $identifier: BlankNode | NamedNode;
    $type: "FormNodeShape";
    emptyStringSetProperty: readonly string[];
    nestedObjectProperty: NestedNodeShape;
    nonEmptyStringSetProperty: NonEmptyList<string>;
    optionalStringProperty: Maybe<string>;
    requiredIntegerProperty: number;
    requiredStringProperty: string;
  }> = ($resource, _$options) => {
    return Right(
      new Resource.Value({
        dataFactory: dataFactory,
        focusResource: $resource,
        propertyPath: $RdfVocabularies.rdf.subject,
        term: $resource.identifier,
      }).toValues(),
    )
      .chain((values) => values.chainMap((value) => value.toIdentifier()))
      .chain((values) => values.head())
      .chain(($identifier) =>
        Right<"FormNodeShape">("FormNodeShape" as const).chain(($type) =>
          $shaclPropertyFromRdf({
            graph: _$options.graph,
            resource: $resource,
            propertySchema: $schema.properties.emptyStringSetProperty,
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
                    propertyPath:
                      FormNodeShape.$schema.properties.emptyStringSetProperty
                        .path,
                    value: valuesArray,
                  }),
                ),
          }).chain((emptyStringSetProperty) =>
            $shaclPropertyFromRdf({
              graph: _$options.graph,
              resource: $resource,
              propertySchema: $schema.properties.nestedObjectProperty,
              typeFromRdf: (resourceValues) =>
                NestedNodeShape.$fromRdfResourceValues(resourceValues, {
                  context: _$options.context,
                  graph: _$options.graph,
                  preferredLanguages: _$options.preferredLanguages,
                  objectSet: _$options.objectSet,
                  resource: $resource,
                  ignoreRdfType: true,
                  propertyPath:
                    FormNodeShape.$schema.properties.nestedObjectProperty.path,
                }),
            }).chain((nestedObjectProperty) =>
              $shaclPropertyFromRdf({
                graph: _$options.graph,
                resource: $resource,
                propertySchema: $schema.properties.nonEmptyStringSetProperty,
                typeFromRdf: (resourceValues) =>
                  resourceValues
                    .chain((values) =>
                      $fromRdfPreferredLanguages(
                        values,
                        _$options.preferredLanguages,
                      ),
                    )
                    .chain((values) =>
                      values.chainMap((value) => value.toString()),
                    )
                    .chain((values) =>
                      NonEmptyList.fromArray(values.toArray()).toEither(
                        new Error(
                          `${Resource.Identifier.toString($resource.identifier)} is an empty set`,
                        ),
                      ),
                    )
                    .map((valuesArray) =>
                      Resource.Values.fromValue({
                        focusResource: $resource,
                        propertyPath:
                          FormNodeShape.$schema.properties
                            .nonEmptyStringSetProperty.path,
                        value: valuesArray,
                      }),
                    ),
              }).chain((nonEmptyStringSetProperty) =>
                $shaclPropertyFromRdf({
                  graph: _$options.graph,
                  resource: $resource,
                  propertySchema: $schema.properties.optionalStringProperty,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        $fromRdfPreferredLanguages(
                          values,
                          _$options.preferredLanguages,
                        ),
                      )
                      .chain((values) =>
                        values.chainMap((value) => value.toString()),
                      )
                      .map((values) =>
                        values.length > 0
                          ? values.map((value) => Maybe.of(value))
                          : Resource.Values.fromValue<Maybe<string>>({
                              focusResource: $resource,
                              propertyPath:
                                FormNodeShape.$schema.properties
                                  .optionalStringProperty.path,
                              value: Maybe.empty(),
                            }),
                      ),
                }).chain((optionalStringProperty) =>
                  $shaclPropertyFromRdf({
                    graph: _$options.graph,
                    resource: $resource,
                    propertySchema: $schema.properties.requiredIntegerProperty,
                    typeFromRdf: (resourceValues) =>
                      resourceValues.chain((values) =>
                        values.chainMap((value) => value.toInt()),
                      ),
                  }).chain((requiredIntegerProperty) =>
                    $shaclPropertyFromRdf({
                      graph: _$options.graph,
                      resource: $resource,
                      propertySchema: $schema.properties.requiredStringProperty,
                      typeFromRdf: (resourceValues) =>
                        resourceValues
                          .chain((values) =>
                            $fromRdfPreferredLanguages(
                              values,
                              _$options.preferredLanguages,
                            ),
                          )
                          .chain((values) =>
                            values.chainMap((value) => value.toString()),
                          ),
                    }).map((requiredStringProperty) => ({
                      $identifier,
                      $type,
                      emptyStringSetProperty,
                      nestedObjectProperty,
                      nonEmptyStringSetProperty,
                      optionalStringProperty,
                      requiredIntegerProperty,
                      requiredStringProperty,
                    })),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
  };

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["FormNodeShape"],
        }),
      },
      emptyStringSetProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://example.com/emptyStringSetProperty",
        ),
      },
      nestedObjectProperty: {
        kind: "Shacl" as const,
        type: () => NestedNodeShape.$schema,
        path: dataFactory.namedNode("http://example.com/nestedObjectProperty"),
      },
      nonEmptyStringSetProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
          minCount: 1,
        }),
        path: dataFactory.namedNode(
          "http://example.com/nonEmptyStringSetProperty",
        ),
      },
      optionalStringProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
      },
      requiredIntegerProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "Int" as const }),
        path: dataFactory.namedNode(
          "http://example.com/requiredIntegerProperty",
        ),
      },
      requiredStringProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "String" as const }),
        path: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
      },
    },
  } as const;

  export function $toJson(_formNodeShape: FormNodeShape): FormNodeShape.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _formNodeShape.$identifier.termType === "BlankNode"
            ? `_:${_formNodeShape.$identifier.value}`
            : _formNodeShape.$identifier.value,
        $type: _formNodeShape.$type,
        emptyStringSetProperty: _formNodeShape.emptyStringSetProperty.map(
          (item) => item,
        ),
        nestedObjectProperty: NestedNodeShape.$toJson(
          _formNodeShape.nestedObjectProperty,
        ),
        nonEmptyStringSetProperty: _formNodeShape.nonEmptyStringSetProperty.map(
          (item) => item,
        ),
        optionalStringProperty: _formNodeShape.optionalStringProperty
          .map((item) => item)
          .extract(),
        requiredIntegerProperty: _formNodeShape.requiredIntegerProperty,
        requiredStringProperty: _formNodeShape.requiredStringProperty,
      } satisfies FormNodeShape.$Json),
    );
  }

  export function $toRdfResource(
    _formNodeShape: FormNodeShape,
    options?: Parameters<$ToRdfResourceFunction<FormNodeShape>>[1],
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_formNodeShape.$identifier);
    resource.add(
      dataFactory.namedNode("http://example.com/emptyStringSetProperty"),
      _formNodeShape.emptyStringSetProperty.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://example.com/nestedObjectProperty"),
      [
        NestedNodeShape.$toRdfResource(_formNodeShape.nestedObjectProperty, {
          graph: options?.graph,
          resourceSet: resourceSet,
        }).identifier,
      ],
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://example.com/nonEmptyStringSetProperty"),
      _formNodeShape.nonEmptyStringSetProperty.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://example.com/optionalStringProperty"),
      _formNodeShape.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://example.com/requiredIntegerProperty"),
      [
        $literalFactory.number(
          _formNodeShape.requiredIntegerProperty,
          $RdfVocabularies.xsd.int,
        ),
      ],
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://example.com/requiredStringProperty"),
      [$literalFactory.string(_formNodeShape.requiredStringProperty)],
      options?.graph,
    );
    return resource;
  }
}
export type $Object = FormNodeShape | NestedNodeShape;

export namespace $Object {
  export const $equals = (left: $Object, right: $Object) => {
    if (
      FormNodeShape.isFormNodeShape(left) &&
      FormNodeShape.isFormNodeShape(right)
    ) {
      return FormNodeShape.$equals(
        left as FormNodeShape,
        right as FormNodeShape,
      );
    }
    if (
      NestedNodeShape.isNestedNodeShape(left) &&
      NestedNodeShape.isNestedNodeShape(right)
    ) {
      return NestedNodeShape.$equals(
        left as NestedNodeShape,
        right as NestedNodeShape,
      );
    }

    return Left({
      left,
      right,
      propertyName: "type",
      propertyValuesUnequal: {
        left: typeof left,
        right: typeof right,
        type: "boolean" as const,
      },
      type: "property" as const,
    });
  };

  export const $filter = (filter: $Object.$Filter, value: $Object) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      filter.on?.["FormNodeShape"] !== undefined &&
      FormNodeShape.isFormNodeShape(value)
    ) {
      if (!FormNodeShape.$filter(filter.on["FormNodeShape"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["NestedNodeShape"] !== undefined &&
      NestedNodeShape.isNestedNodeShape(value)
    ) {
      if (!NestedNodeShape.$filter(filter.on["NestedNodeShape"], value)) {
        return false;
      }
    }

    return true;
  };

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly FormNodeShape?: FormNodeShape.$Filter;
      readonly NestedNodeShape?: NestedNodeShape.$Filter;
    };
  };

  export const $fromJson = (value: $Object.$Json): $Object => {
    if (value.$type === "FormNodeShape") {
      return FormNodeShape.$fromJson(value as FormNodeShape.$Json);
    }
    if (value.$type === "NestedNodeShape") {
      return NestedNodeShape.$fromJson(value as NestedNodeShape.$Json);
    }

    throw new Error("unable to deserialize JSON");
  };

  export const $fromRdfResource: $FromRdfResourceFunction<$Object> = (
    resource,
    options,
  ) =>
    (
      FormNodeShape.$fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, $Object>
    ).altLazy(
      () =>
        NestedNodeShape.$fromRdfResource(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, $Object>,
    );

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<$Object> =
    ((values, _options) =>
      values.chain((values) =>
        values.chainMap((value) => {
          const valueAsValues = Right(value.toValues());
          return (
            FormNodeShape.$fromRdfResourceValues(valueAsValues, {
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
                NestedNodeShape.$fromRdfResourceValues(valueAsValues, {
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

  export function $hash<HasherT extends $Hasher>(
    value: $Object,
    hasher: HasherT,
  ): HasherT {
    if (FormNodeShape.isFormNodeShape(value)) {
      FormNodeShape.$hash(value, hasher);
    }
    if (NestedNodeShape.isNestedNodeShape(value)) {
      NestedNodeShape.$hash(value, hasher);
    }
    return hasher;
  }

  export type $Identifier = BlankNode | NamedNode;
  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export type $Json = FormNodeShape.$Json | NestedNodeShape.$Json;

  export const $jsonZodSchema = () =>
    z.discriminatedUnion("$type", [
      FormNodeShape.$jsonZodSchema(),
      NestedNodeShape.$jsonZodSchema(),
    ]);

  export function $parseJson(json: unknown): Either<Error, $Object> {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(json);
    if (!$jsonSafeParseResult.success) {
      return Left($jsonSafeParseResult.error);
    }
    return Right($fromJson($jsonSafeParseResult.data));
  }

  export const $schema = {
    kind: "NamedObjectUnion" as const,
    members: {
      FormNodeShape: {
        discriminantValues: ["FormNodeShape"],
        type: FormNodeShape.$schema,
      },
      NestedNodeShape: {
        discriminantValues: ["NestedNodeShape"],
        type: NestedNodeShape.$schema,
      },
    },
    properties: {
      requiredStringProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "String" as const }),
        path: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
      },
    },
  } as const;

  export const $toJson = (value: $Object): $Object.$Json => {
    if (FormNodeShape.isFormNodeShape(value)) {
      return FormNodeShape.$toJson(value);
    }
    if (NestedNodeShape.isNestedNodeShape(value)) {
      return NestedNodeShape.$toJson(value);
    }

    throw new Error("unable to serialize to JSON");
  };

  export const $toRdfResource: $ToRdfResourceFunction<$Object> = (
    value,
    options,
  ) => {
    if (FormNodeShape.isFormNodeShape(value)) {
      return FormNodeShape.$toRdfResource(value, options);
    }
    if (NestedNodeShape.isNestedNodeShape(value)) {
      return NestedNodeShape.$toRdfResource(value, options);
    }
    throw new Error("unrecognized type");
  };

  export const $toRdfResourceValues: $ToRdfResourceValuesFunction<$Object> = ((
    value,
    _options,
  ) => {
    if (FormNodeShape.isFormNodeShape(value)) {
      return [
        FormNodeShape.$toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (NestedNodeShape.isNestedNodeShape(value)) {
      return [
        NestedNodeShape.$toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) as $ToRdfResourceValuesFunction<$Object>;
}
export interface $ObjectSet {
  formNodeShape(
    identifier: FormNodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, FormNodeShape>>;

  formNodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  formNodeShapeIdentifiers(
    query?: $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
  ): Promise<Either<Error, readonly FormNodeShape.$Identifier[]>>;

  formNodeShapes(
    query?: $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
  ): Promise<Either<Error, readonly FormNodeShape[]>>;

  nestedNodeShape(
    identifier: NestedNodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, NestedNodeShape>>;

  nestedNodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<NestedNodeShape.$Filter, NestedNodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  nestedNodeShapeIdentifiers(
    query?: $ObjectSet.Query<
      NestedNodeShape.$Filter,
      NestedNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly NestedNodeShape.$Identifier[]>>;

  nestedNodeShapes(
    query?: $ObjectSet.Query<
      NestedNodeShape.$Filter,
      NestedNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly NestedNodeShape[]>>;

  object(
    identifier: $Object.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, $Object>>;

  objectCount(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object.$Identifier[]>>;

  objects(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
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
  protected readonly $graph?: Exclude<Quad_Graph, Variable>;
  readonly #dataset: DatasetCore | (() => DatasetCore);

  constructor(
    dataset: DatasetCore | (() => DatasetCore),
    options?: { graph?: Exclude<Quad_Graph, Variable> },
  ) {
    this.#dataset = dataset;
    this.$graph = options?.graph;
  }

  protected $dataset(): DatasetCore {
    if (typeof this.#dataset === "object") {
      return this.#dataset;
    }
    return this.#dataset();
  }

  protected $resourceSet(): ResourceSet {
    return new ResourceSet(this.$dataset(), { dataFactory: dataFactory });
  }

  async formNodeShape(
    identifier: FormNodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, FormNodeShape>> {
    return this.formNodeShapeSync(identifier, options);
  }

  formNodeShapeSync(
    identifier: FormNodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, FormNodeShape> {
    return this.formNodeShapesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async formNodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.formNodeShapeCountSync(query);
  }

  formNodeShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.formNodeShapesSync(query).map((objects) => objects.length);
  }

  async formNodeShapeIdentifiers(
    query?: $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
  ): Promise<Either<Error, readonly FormNodeShape.$Identifier[]>> {
    return this.formNodeShapeIdentifiersSync(query);
  }

  formNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
  ): Either<Error, readonly FormNodeShape.$Identifier[]> {
    return this.formNodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async formNodeShapes(
    query?: $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
  ): Promise<Either<Error, readonly FormNodeShape[]>> {
    return this.formNodeShapesSync(query);
  }

  formNodeShapesSync(
    query?: $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
  ): Either<Error, readonly FormNodeShape[]> {
    return this.$objectsSync<
      FormNodeShape,
      FormNodeShape.$Filter,
      FormNodeShape.$Identifier
    >(
      {
        $filter: FormNodeShape.$filter,
        $fromRdfResource: FormNodeShape.$fromRdfResource,
        $fromRdfTypes: [],
      },
      query,
    );
  }

  async nestedNodeShape(
    identifier: NestedNodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, NestedNodeShape>> {
    return this.nestedNodeShapeSync(identifier, options);
  }

  nestedNodeShapeSync(
    identifier: NestedNodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, NestedNodeShape> {
    return this.nestedNodeShapesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async nestedNodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<NestedNodeShape.$Filter, NestedNodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.nestedNodeShapeCountSync(query);
  }

  nestedNodeShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<NestedNodeShape.$Filter, NestedNodeShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.nestedNodeShapesSync(query).map((objects) => objects.length);
  }

  async nestedNodeShapeIdentifiers(
    query?: $ObjectSet.Query<
      NestedNodeShape.$Filter,
      NestedNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly NestedNodeShape.$Identifier[]>> {
    return this.nestedNodeShapeIdentifiersSync(query);
  }

  nestedNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      NestedNodeShape.$Filter,
      NestedNodeShape.$Identifier
    >,
  ): Either<Error, readonly NestedNodeShape.$Identifier[]> {
    return this.nestedNodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async nestedNodeShapes(
    query?: $ObjectSet.Query<
      NestedNodeShape.$Filter,
      NestedNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly NestedNodeShape[]>> {
    return this.nestedNodeShapesSync(query);
  }

  nestedNodeShapesSync(
    query?: $ObjectSet.Query<
      NestedNodeShape.$Filter,
      NestedNodeShape.$Identifier
    >,
  ): Either<Error, readonly NestedNodeShape[]> {
    return this.$objectsSync<
      NestedNodeShape,
      NestedNodeShape.$Filter,
      NestedNodeShape.$Identifier
    >(
      {
        $filter: NestedNodeShape.$filter,
        $fromRdfResource: NestedNodeShape.$fromRdfResource,
        $fromRdfTypes: [],
      },
      query,
    );
  }

  async object(
    identifier: $Object.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, $Object>> {
    return this.objectSync(identifier, options);
  }

  objectSync(
    identifier: $Object.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, $Object> {
    return this.objectsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async objectCount(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.objectCountSync(query);
  }

  objectCountSync(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.objectsSync(query).map((objects) => objects.length);
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
          $fromRdfResource: FormNodeShape.$fromRdfResource,
          $fromRdfTypes: [],
        },
        {
          $filter: $Object.$filter,
          $fromRdfResource: NestedNodeShape.$fromRdfResource,
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
      $fromRdfResource: $FromRdfResourceFunction<ObjectT>;
      $fromRdfTypes: readonly NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const graph = query?.graph ?? this.$graph;

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
    } else if (objectType.$fromRdfTypes.length > 0) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const fromRdfType of objectType.$fromRdfTypes) {
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
        objectType
          .$fromRdfResource(resource, fromRdfResourceOptions)
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
        const objectEither = objectType.$fromRdfResource(
          resource,
          fromRdfResourceOptions,
        );
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
          return Right(objects);
        }
      }
    }
    return Right(objects);
  }

  protected $objectUnionsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  >(
    objectTypes: readonly {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdfResource: $FromRdfResourceFunction<ObjectT>;
      $fromRdfTypes: readonly NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const graph = query?.graph ?? this.$graph;

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
      objectType?: {
        $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
        $fromRdfResource: $FromRdfResourceFunction<ObjectT>;
        $fromRdfTypes: readonly NamedNode[];
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
      objectTypes.every((objectType) => objectType.$fromRdfTypes.length > 0)
    ) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const objectType of objectTypes) {
        for (const fromRdfType of objectType.$fromRdfTypes) {
          for (const resource of resourceSet.instancesOf(fromRdfType, {
            graph,
          })) {
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
        for (const objectType of objectTypes) {
          if (
            objectType
              .$fromRdfResource(resource, fromRdfResourceOptions)
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
          objectEither = objectType.$fromRdfResource(
            resource,
            fromRdfResourceOptions,
          );
        } else {
          objectEither = Left(new Error("no object types"));
          for (const tryObjectType of objectTypes) {
            objectEither = tryObjectType.$fromRdfResource(
              resource,
              fromRdfResourceOptions,
            );
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
          return Right(objects);
        }
      }
    }
    return Right(objects);
  }
}

import type {
  BlankNode,
  DatasetCore,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import { StoreFactory as DatasetFactory, DataFactory as dataFactory } from "n3";
import { Either, Left, Maybe, NonEmptyList } from "purify-ts";
import { LiteralFactory, Resource, ResourceSet } from "rdfjs-resource";
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

const $datasetFactory = new DatasetFactory();

export type $EqualsResult = Either<$EqualsResult.Unequal, true>;

export namespace $EqualsResult {
  export const Equal: $EqualsResult = Either.of<Unequal, true>(true);

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

function $filterNumber(filter: $NumberFilter, value: number) {
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

interface $NumberFilter {
  readonly in?: readonly number[];
  readonly maxExclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly minInclusive?: number;
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
    export const integer = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#integer",
    );
  }
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
    } else if (typeof parameters.$identifier === "undefined") {
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

  export function $filter(
    filter: NestedNodeShape.$Filter,
    value: NestedNodeShape,
  ): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
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
    readonly requiredStringProperty?: $StringFilter;
  };

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function $propertiesFromJson(_json: unknown): Either<
    z.ZodError,
    {
      $identifier: BlankNode | NamedNode;
      $type: "NestedNodeShape";
      requiredStringProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return Left($jsonSafeParseResult.error);
    }
    const $jsonObject = $jsonSafeParseResult.data;
    const $identifier = $jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode($jsonObject["@id"].substring(2))
      : dataFactory.namedNode($jsonObject["@id"]);
    const $type = "NestedNodeShape" as const;
    const requiredStringProperty = $jsonObject["requiredStringProperty"];
    return Either.of({ $identifier, $type, requiredStringProperty });
  }

  export function $fromJson(
    json: unknown,
  ): Either<z.ZodError, NestedNodeShape> {
    return $propertiesFromJson(json);
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

  export function $jsonZodSchema() {
    return z.object({
      "@id": z.string().min(1),
      $type: z.literal("NestedNodeShape"),
      requiredStringProperty: z.string(),
    }) satisfies z.ZodType<$Json>;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "NestedNodeShape";
    readonly requiredStringProperty: string;
  };

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

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, NestedNodeShape> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return NestedNodeShape.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "NestedNodeShape";
      requiredStringProperty: string;
    }
  > {
    return Either.of<Error, NestedNodeShape.$Identifier>(
      $parameters.resource.identifier as NestedNodeShape.$Identifier,
    ).chain(($identifier) =>
      Either.of<Error, "NestedNodeShape">("NestedNodeShape" as const).chain(
        ($type) =>
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
                  NestedNodeShape.$schema.properties.requiredStringProperty
                    .identifier,
                preferredLanguages: $parameters.preferredLanguages,
                values,
              }),
            )
            .chain((values) => values.chainMap((value) => value.toString()))
            .chain((values) => values.head())
            .map((requiredStringProperty) => ({
              $identifier,
              $type,
              requiredStringProperty,
            })),
      ),
    );
  }

  export function $toRdf(
    _nestedNodeShape: NestedNodeShape,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_nestedNodeShape.$identifier);
    resource.add(
      NestedNodeShape.$schema.properties.requiredStringProperty.identifier,
      [$literalFactory.string(_nestedNodeShape.requiredStringProperty)],
      options?.graph,
    );
    return resource;
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
          ownValues: ["NestedNodeShape"],
        }),
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
    } else if (typeof parameters.$identifier === "undefined") {
      $identifier = dataFactory.blankNode();
    } else {
      $identifier = parameters.$identifier satisfies never;
    }
    const $type = "FormNodeShape" as const;
    let emptyStringSetProperty: readonly string[];
    if (typeof parameters.emptyStringSetProperty === "undefined") {
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
    } else if (typeof parameters.optionalStringProperty === "undefined") {
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

  export function $filter(
    filter: FormNodeShape.$Filter,
    value: FormNodeShape,
  ): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      typeof filter.emptyStringSetProperty !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.emptyStringSetProperty,
        value.emptyStringSetProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.nestedObjectProperty !== "undefined" &&
      !NestedNodeShape.$filter(
        filter.nestedObjectProperty,
        value.nestedObjectProperty,
      )
    ) {
      return false;
    }
    if (
      typeof filter.nonEmptyStringSetProperty !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.nonEmptyStringSetProperty,
        value.nonEmptyStringSetProperty,
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
      typeof filter.requiredIntegerProperty !== "undefined" &&
      !$filterNumber(
        filter.requiredIntegerProperty,
        value.requiredIntegerProperty,
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
    readonly emptyStringSetProperty?: $CollectionFilter<$StringFilter>;
    readonly nestedObjectProperty?: NestedNodeShape.$Filter;
    readonly nonEmptyStringSetProperty?: $CollectionFilter<$StringFilter>;
    readonly optionalStringProperty?: $MaybeFilter<$StringFilter>;
    readonly requiredIntegerProperty?: $NumberFilter;
    readonly requiredStringProperty?: $StringFilter;
  };

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function $propertiesFromJson(_json: unknown): Either<
    z.ZodError,
    {
      $identifier: BlankNode | NamedNode;
      $type: "FormNodeShape";
      emptyStringSetProperty: readonly string[];
      nestedObjectProperty: NestedNodeShape;
      nonEmptyStringSetProperty: NonEmptyList<string>;
      optionalStringProperty: Maybe<string>;
      requiredIntegerProperty: number;
      requiredStringProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return Left($jsonSafeParseResult.error);
    }
    const $jsonObject = $jsonSafeParseResult.data;
    const $identifier = $jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode($jsonObject["@id"].substring(2))
      : dataFactory.namedNode($jsonObject["@id"]);
    const $type = "FormNodeShape" as const;
    const emptyStringSetProperty = $jsonObject["emptyStringSetProperty"];
    const nestedObjectProperty = NestedNodeShape.$fromJson(
      $jsonObject["nestedObjectProperty"],
    ).unsafeCoerce();
    const nonEmptyStringSetProperty = NonEmptyList.fromArray(
      $jsonObject["nonEmptyStringSetProperty"],
    ).unsafeCoerce();
    const optionalStringProperty = Maybe.fromNullable(
      $jsonObject["optionalStringProperty"],
    );
    const requiredIntegerProperty = $jsonObject["requiredIntegerProperty"];
    const requiredStringProperty = $jsonObject["requiredStringProperty"];
    return Either.of({
      $identifier,
      $type,
      emptyStringSetProperty,
      nestedObjectProperty,
      nonEmptyStringSetProperty,
      optionalStringProperty,
      requiredIntegerProperty,
      requiredStringProperty,
    });
  }

  export function $fromJson(json: unknown): Either<z.ZodError, FormNodeShape> {
    return $propertiesFromJson(json);
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

  export function isFormNodeShape(object: $Object): object is FormNodeShape {
    switch (object.$type) {
      case "FormNodeShape":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, FormNodeShape> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return FormNodeShape.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "FormNodeShape";
      emptyStringSetProperty: readonly string[];
      nestedObjectProperty: NestedNodeShape;
      nonEmptyStringSetProperty: NonEmptyList<string>;
      optionalStringProperty: Maybe<string>;
      requiredIntegerProperty: number;
      requiredStringProperty: string;
    }
  > {
    return Either.of<Error, FormNodeShape.$Identifier>(
      $parameters.resource.identifier as FormNodeShape.$Identifier,
    ).chain(($identifier) =>
      Either.of<Error, "FormNodeShape">("FormNodeShape" as const).chain(
        ($type) =>
          Either.of<Error, Resource.Values<Resource.TermValue>>(
            $parameters.resource.values(
              $schema.properties.emptyStringSetProperty.identifier,
              { unique: true },
            ),
          )
            .chain((values) =>
              $fromRdfPreferredLanguages({
                focusResource: $parameters.resource,
                predicate:
                  FormNodeShape.$schema.properties.emptyStringSetProperty
                    .identifier,
                preferredLanguages: $parameters.preferredLanguages,
                values,
              }),
            )
            .chain((values) => values.chainMap((value) => value.toString()))
            .map((values) => values.toArray())
            .map((valuesArray) =>
              Resource.Values.fromValue({
                focusResource: $parameters.resource,
                predicate:
                  FormNodeShape.$schema.properties.emptyStringSetProperty
                    .identifier,
                value: valuesArray,
              }),
            )
            .chain((values) => values.head())
            .chain((emptyStringSetProperty) =>
              Either.of<Error, Resource.Values<Resource.TermValue>>(
                $parameters.resource.values(
                  $schema.properties.nestedObjectProperty.identifier,
                  { unique: true },
                ),
              )
                .chain((values) =>
                  values.chainMap((value) =>
                    value.toResource().chain((resource) =>
                      NestedNodeShape.$fromRdf(resource, {
                        context: $parameters.context,
                        ignoreRdfType: true,
                        objectSet: $parameters.objectSet,
                        preferredLanguages: $parameters.preferredLanguages,
                      }),
                    ),
                  ),
                )
                .chain((values) => values.head())
                .chain((nestedObjectProperty) =>
                  Either.of<Error, Resource.Values<Resource.TermValue>>(
                    $parameters.resource.values(
                      $schema.properties.nonEmptyStringSetProperty.identifier,
                      { unique: true },
                    ),
                  )
                    .chain((values) =>
                      $fromRdfPreferredLanguages({
                        focusResource: $parameters.resource,
                        predicate:
                          FormNodeShape.$schema.properties
                            .nonEmptyStringSetProperty.identifier,
                        preferredLanguages: $parameters.preferredLanguages,
                        values,
                      }),
                    )
                    .chain((values) =>
                      values.chainMap((value) => value.toString()),
                    )
                    .chain((values) =>
                      NonEmptyList.fromArray(values.toArray()).toEither(
                        new Error(
                          `${Resource.Identifier.toString($parameters.resource.identifier)} is an empty set`,
                        ),
                      ),
                    )
                    .map((valuesArray) =>
                      Resource.Values.fromValue({
                        focusResource: $parameters.resource,
                        predicate:
                          FormNodeShape.$schema.properties
                            .nonEmptyStringSetProperty.identifier,
                        value: valuesArray,
                      }),
                    )
                    .chain((values) => values.head())
                    .chain((nonEmptyStringSetProperty) =>
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
                              FormNodeShape.$schema.properties
                                .optionalStringProperty.identifier,
                            preferredLanguages: $parameters.preferredLanguages,
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
                                  FormNodeShape.$schema.properties
                                    .optionalStringProperty.identifier,
                                value: Maybe.empty(),
                              }),
                        )
                        .chain((values) => values.head())
                        .chain((optionalStringProperty) =>
                          Either.of<Error, Resource.Values<Resource.TermValue>>(
                            $parameters.resource.values(
                              $schema.properties.requiredIntegerProperty
                                .identifier,
                              {
                                unique: true,
                              },
                            ),
                          )
                            .chain((values) =>
                              values.chainMap((value) => value.toNumber()),
                            )
                            .chain((values) => values.head())
                            .chain((requiredIntegerProperty) =>
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
                                      FormNodeShape.$schema.properties
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
  }

  export function $toRdf(
    _formNodeShape: FormNodeShape,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_formNodeShape.$identifier);
    resource.add(
      FormNodeShape.$schema.properties.emptyStringSetProperty.identifier,
      _formNodeShape.emptyStringSetProperty.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      FormNodeShape.$schema.properties.nestedObjectProperty.identifier,
      [
        NestedNodeShape.$toRdf(_formNodeShape.nestedObjectProperty, {
          graph: options?.graph,
          resourceSet: resourceSet,
        }).identifier,
      ],
      options?.graph,
    );
    resource.add(
      FormNodeShape.$schema.properties.nonEmptyStringSetProperty.identifier,
      _formNodeShape.nonEmptyStringSetProperty.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      FormNodeShape.$schema.properties.optionalStringProperty.identifier,
      _formNodeShape.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      FormNodeShape.$schema.properties.requiredIntegerProperty.identifier,
      [
        $literalFactory.number(
          _formNodeShape.requiredIntegerProperty,
          $RdfVocabularies.xsd.integer,
        ),
      ],
      options?.graph,
    );
    resource.add(
      FormNodeShape.$schema.properties.requiredStringProperty.identifier,
      [$literalFactory.string(_formNodeShape.requiredStringProperty)],
      options?.graph,
    );
    return resource;
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
          ownValues: ["FormNodeShape"],
        }),
      },
      emptyStringSetProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/emptyStringSetProperty",
        ),
      },
      nestedObjectProperty: {
        kind: "Shacl" as const,
        type: () => NestedNodeShape.$schema,
        identifier: dataFactory.namedNode(
          "http://example.com/nestedObjectProperty",
        ),
      },
      nonEmptyStringSetProperty: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
          minCount: 1,
        }),
        identifier: dataFactory.namedNode(
          "http://example.com/nonEmptyStringSetProperty",
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
      requiredIntegerProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "Int" as const }),
        identifier: dataFactory.namedNode(
          "http://example.com/requiredIntegerProperty",
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
}
export type $Object = FormNodeShape | NestedNodeShape;

export namespace $Object {
  export function $equals(left: $Object, right: $Object): $EqualsResult {
    return $strictEquals(left.$type, right.$type).chain(() => {
      if (FormNodeShape.isFormNodeShape(left)) {
        return FormNodeShape.$equals(left, right as unknown as FormNodeShape);
      }
      if (NestedNodeShape.isNestedNodeShape(left)) {
        return NestedNodeShape.$equals(
          left,
          right as unknown as NestedNodeShape,
        );
      }
      return $EqualsResult.Equal;
    });
  }

  export function $filter(filter: $Object.$Filter, value: $Object): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      FormNodeShape.isFormNodeShape(value) &&
      filter.on?.FormNodeShape &&
      !FormNodeShape.$filter(filter.on.FormNodeShape, value as FormNodeShape)
    ) {
      return false;
    }
    if (
      NestedNodeShape.isNestedNodeShape(value) &&
      filter.on?.NestedNodeShape &&
      !NestedNodeShape.$filter(
        filter.on.NestedNodeShape,
        value as NestedNodeShape,
      )
    ) {
      return false;
    }
    return true;
  }

  export interface $Filter {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly FormNodeShape?: Omit<FormNodeShape.$Filter, "$identifier">;
      readonly NestedNodeShape?: Omit<NestedNodeShape.$Filter, "$identifier">;
    };
  }

  export function $hash<HasherT extends $Hasher>(
    _object: $Object,
    _hasher: HasherT,
  ): HasherT {
    if (FormNodeShape.isFormNodeShape(_object)) {
      return FormNodeShape.$hash(_object, _hasher);
    }
    if (NestedNodeShape.isNestedNodeShape(_object)) {
      return NestedNodeShape.$hash(_object, _hasher);
    }
    throw new Error("unrecognized type");
  }

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function $fromJson(json: unknown): Either<z.ZodError, $Object> {
    return (
      FormNodeShape.$fromJson(json) as Either<z.ZodError, $Object>
    ).altLazy(
      () => NestedNodeShape.$fromJson(json) as Either<z.ZodError, $Object>,
    );
  }

  export function $jsonZodSchema() {
    return z.discriminatedUnion("$type", [
      FormNodeShape.$jsonZodSchema(),
      NestedNodeShape.$jsonZodSchema(),
    ]);
  }

  export function $toJson(
    _object: $Object,
  ): FormNodeShape.$Json | NestedNodeShape.$Json {
    if (FormNodeShape.isFormNodeShape(_object)) {
      return FormNodeShape.$toJson(_object);
    }
    if (NestedNodeShape.isNestedNodeShape(_object)) {
      return NestedNodeShape.$toJson(_object);
    }
    throw new Error("unrecognized type");
  }

  export type $Json = FormNodeShape.$Json | NestedNodeShape.$Json;

  export const $schema = {
    properties: {
      requiredStringProperty: {
        kind: "Shacl" as const,
        type: () => ({ kind: "String" as const }),
        identifier: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
      },
    },
  } as const;

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, $Object> {
    return (
      FormNodeShape.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, $Object>
    ).altLazy(
      () =>
        NestedNodeShape.$fromRdf(resource, {
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
    if (FormNodeShape.isFormNodeShape(_object)) {
      return FormNodeShape.$toRdf(_object, _parameters);
    }
    if (NestedNodeShape.isNestedNodeShape(_object)) {
      return NestedNodeShape.$toRdf(_object, _parameters);
    }
    throw new Error("unrecognized type");
  }
}
export interface $ObjectSet {
  formNodeShape(
    identifier: FormNodeShape.$Identifier,
  ): Promise<Either<Error, FormNodeShape>>;

  formNodeShapeIdentifiers(
    query?: $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
  ): Promise<Either<Error, readonly FormNodeShape.$Identifier[]>>;

  formNodeShapes(
    query?: $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
  ): Promise<Either<Error, readonly FormNodeShape[]>>;

  formNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  nestedNodeShape(
    identifier: NestedNodeShape.$Identifier,
  ): Promise<Either<Error, NestedNodeShape>>;

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

  nestedNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<NestedNodeShape.$Filter, NestedNodeShape.$Identifier>,
      "filter"
    >,
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

  async formNodeShape(
    identifier: FormNodeShape.$Identifier,
  ): Promise<Either<Error, FormNodeShape>> {
    return this.formNodeShapeSync(identifier);
  }

  formNodeShapeSync(
    identifier: FormNodeShape.$Identifier,
  ): Either<Error, FormNodeShape> {
    return this.formNodeShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
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

  async formNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.formNodeShapesCountSync(query);
  }

  formNodeShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<FormNodeShape.$Filter, FormNodeShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.formNodeShapesSync(query).map((objects) => objects.length);
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
        $fromRdf: FormNodeShape.$fromRdf,
        $fromRdfTypes: [],
      },
      query,
    );
  }

  async nestedNodeShape(
    identifier: NestedNodeShape.$Identifier,
  ): Promise<Either<Error, NestedNodeShape>> {
    return this.nestedNodeShapeSync(identifier);
  }

  nestedNodeShapeSync(
    identifier: NestedNodeShape.$Identifier,
  ): Either<Error, NestedNodeShape> {
    return this.nestedNodeShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
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

  async nestedNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<NestedNodeShape.$Filter, NestedNodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.nestedNodeShapesCountSync(query);
  }

  nestedNodeShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<NestedNodeShape.$Filter, NestedNodeShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.nestedNodeShapesSync(query).map((objects) => objects.length);
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
        $fromRdf: NestedNodeShape.$fromRdf,
        $fromRdfTypes: [],
      },
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
          $fromRdf: FormNodeShape.$fromRdf,
          $fromRdfTypes: [],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: NestedNodeShape.$fromRdf,
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

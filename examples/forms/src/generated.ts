import { StoreFactory as _DatasetFactory } from "n3";
const datasetFactory = new _DatasetFactory();
import type * as rdfjs from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
import { z as zod } from "zod";
export type $EqualsResult = purify.Either<$EqualsResult.Unequal, true>;

export namespace $EqualsResult {
  export const Equal: $EqualsResult = purify.Either.of<Unequal, true>(true);

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

    return purify.Left({ left, right, type: "BooleanEquals" });
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
        readonly type: "ArrayElement";
      }
    | {
        readonly left: readonly any[];
        readonly right: readonly any[];
        readonly type: "ArrayLength";
      }
    | {
        readonly left: any;
        readonly right: any;
        readonly type: "BooleanEquals";
      }
    | {
        readonly left: any;
        readonly right: any;
        readonly type: "LeftError";
      }
    | {
        readonly right: any;
        readonly type: "LeftNull";
      }
    | {
        readonly left: bigint | boolean | number | string;
        readonly right: bigint | boolean | number | string;
        readonly type: "Primitive";
      }
    | {
        readonly left: any;
        readonly right: any;
        readonly propertyName: string;
        readonly propertyValuesUnequal: Unequal;
        readonly type: "Property";
      }
    | {
        readonly left: any;
        readonly right: any;
        readonly type: "RightError";
      }
    | {
        readonly left: any;
        readonly type: "RightNull";
      };
}
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
/**
 * Compare two objects with equals(other: T): boolean methods and return an $EqualsResult.
 */
export function $booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left.equals(right));
}
/**
 * Compare two values for strict equality (===), returning an $EqualsResult rather than a boolean.
 */
export function $strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left === right);
}
/**
 * Compare two arrays element-wise with the provided elementEquals function.
 */
export function $arrayEquals<T>(
  leftArray: readonly T[],
  rightArray: readonly T[],
  elementEquals: (left: T, right: T) => boolean | $EqualsResult,
): $EqualsResult {
  if (leftArray.length !== rightArray.length) {
    return purify.Left({
      left: leftArray,
      right: rightArray,
      type: "ArrayLength",
    });
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
      return purify.Left({
        left: {
          array: leftArray,
          element: leftElement,
          elementIndex: leftElementIndex,
        },
        right: {
          array: rightArray,
          unequals: rightUnequals,
        },
        type: "ArrayElement",
      });
    }
    // Else there was a right element equal to the left element, continue to the next left element
  }

  return $EqualsResult.Equal;
}
export function $maybeEquals<T>(
  leftMaybe: purify.Maybe<T>,
  rightMaybe: purify.Maybe<T>,
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
    return purify.Left({
      left: leftMaybe.unsafeCoerce(),
      type: "RightNull",
    });
  }

  if (rightMaybe.isJust()) {
    return purify.Left({
      right: rightMaybe.unsafeCoerce(),
      type: "LeftNull",
    });
  }

  return $EqualsResult.Equal;
}
export interface NestedNodeShape {
  readonly $identifier: NestedNodeShape.$Identifier;
  readonly $type: "NestedNodeShape";
  /**
   * Required string
   */
  readonly requiredStringProperty: string;
}

export namespace NestedNodeShape {
  export function $create(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
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
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(left.$type, right.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
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
          type: "Property" as const,
        })),
      );
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, NestedNodeShape> {
    return $propertiesFromJson(json);
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, NestedNodeShape> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return NestedNodeShape.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_nestedNodeShape: NestedNodeShape, _hasher: HasherT): HasherT {
    _hasher.update(_nestedNodeShape.$identifier.value);
    _hasher.update(_nestedNodeShape.$type);
    NestedNodeShape.$hashShaclProperties(_nestedNodeShape, _hasher);
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_nestedNodeShape: NestedNodeShape, _hasher: HasherT): HasherT {
    _hasher.update(_nestedNodeShape.requiredStringProperty);
    return _hasher;
  }

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

  export type $Json = {
    readonly "@id": string;
    readonly $type: "NestedNodeShape";
    readonly requiredStringProperty: string;
  };

  export function $jsonSchema() {
    return zod.toJSONSchema($jsonZodSchema());
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
              schema: { const: "NestedNodeShape" },
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
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("NestedNodeShape"),
      requiredStringProperty: zod.string(),
    }) satisfies zod.ZodType<$Json>;
  }

  export const $properties = {
    requiredStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/requiredStringProperty",
      ),
    },
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "NestedNodeShape";
      requiredStringProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const $jsonObject = $jsonSafeParseResult.data;
    const $identifier = $jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode($jsonObject["@id"].substring(2))
      : dataFactory.namedNode($jsonObject["@id"]);
    const $type = "NestedNodeShape" as const;
    const requiredStringProperty = $jsonObject["requiredStringProperty"];
    return purify.Either.of({ $identifier, $type, requiredStringProperty });
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
      $type: "NestedNodeShape";
      requiredStringProperty: string;
    }
  > {
    const $identifier: NestedNodeShape.$Identifier = $resource.identifier;
    const $type = "NestedNodeShape" as const;
    const _requiredStringPropertyEither: purify.Either<Error, string> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
      >(
        $resource.values($properties.requiredStringProperty["identifier"], {
          unique: true,
        }),
      )
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.TermValue({
                  focusResource: $resource,
                  predicate:
                    NestedNodeShape.$properties.requiredStringProperty[
                      "identifier"
                    ],
                  term: literalValue,
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
    return purify.Either.of({ $identifier, $type, requiredStringProperty });
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

  export function $toRdf(
    _nestedNodeShape: NestedNodeShape,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(_nestedNodeShape.$identifier, {
      mutateGraph,
    });
    resource.add(
      NestedNodeShape.$properties.requiredStringProperty["identifier"],
      ...[_nestedNodeShape.requiredStringProperty],
    );
    return resource;
  }
}
/**
 * Form
 */
export interface FormNodeShape {
  readonly $identifier: FormNodeShape.$Identifier;
  readonly $type: "FormNodeShape";
  /**
   * Empty string set
   */
  readonly emptyStringSetProperty: readonly string[];
  /**
   * Nested object
   */
  readonly nestedObjectProperty: NestedNodeShape;
  /**
   * Non-empty string set
   */
  readonly nonEmptyStringSetProperty: purify.NonEmptyList<string>;
  /**
   * Optional string
   */
  readonly optionalStringProperty: purify.Maybe<string>;
  /**
   * Required integer
   */
  readonly requiredIntegerProperty: number;
  /**
   * Required string
   */
  readonly requiredStringProperty: string;
}

export namespace FormNodeShape {
  export function $create(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly emptyStringSetProperty?: readonly string[];
    readonly nestedObjectProperty: NestedNodeShape;
    readonly nonEmptyStringSetProperty: purify.NonEmptyList<string>;
    readonly optionalStringProperty?: purify.Maybe<string> | string;
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
    let optionalStringProperty: purify.Maybe<string>;
    if (purify.Maybe.isMaybe(parameters.optionalStringProperty)) {
      optionalStringProperty = parameters.optionalStringProperty;
    } else if (typeof parameters.optionalStringProperty === "string") {
      optionalStringProperty = purify.Maybe.of(
        parameters.optionalStringProperty,
      );
    } else if (typeof parameters.optionalStringProperty === "undefined") {
      optionalStringProperty = purify.Maybe.empty();
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
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(left.$type, right.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
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
          type: "Property" as const,
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
          type: "Property" as const,
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
          type: "Property" as const,
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
          type: "Property" as const,
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
          type: "Property" as const,
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
          type: "Property" as const,
        })),
      );
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, FormNodeShape> {
    return $propertiesFromJson(json);
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, FormNodeShape> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return FormNodeShape.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_formNodeShape: FormNodeShape, _hasher: HasherT): HasherT {
    _hasher.update(_formNodeShape.$identifier.value);
    _hasher.update(_formNodeShape.$type);
    FormNodeShape.$hashShaclProperties(_formNodeShape, _hasher);
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_formNodeShape: FormNodeShape, _hasher: HasherT): HasherT {
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

  export function $jsonSchema() {
    return zod.toJSONSchema($jsonZodSchema());
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
              schema: { const: "FormNodeShape" },
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
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("FormNodeShape"),
      emptyStringSetProperty: zod
        .string()
        .array()
        .default(() => []),
      nestedObjectProperty: NestedNodeShape.$jsonZodSchema(),
      nonEmptyStringSetProperty: zod.string().array().nonempty().min(1),
      optionalStringProperty: zod.string().optional(),
      requiredIntegerProperty: zod.number(),
      requiredStringProperty: zod.string(),
    }) satisfies zod.ZodType<$Json>;
  }

  export const $properties = {
    emptyStringSetProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/emptyStringSetProperty",
      ),
    },
    nestedObjectProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/nestedObjectProperty",
      ),
    },
    nonEmptyStringSetProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/nonEmptyStringSetProperty",
      ),
    },
    optionalStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/optionalStringProperty",
      ),
    },
    requiredIntegerProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/requiredIntegerProperty",
      ),
    },
    requiredStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/requiredStringProperty",
      ),
    },
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "FormNodeShape";
      emptyStringSetProperty: readonly string[];
      nestedObjectProperty: NestedNodeShape;
      nonEmptyStringSetProperty: purify.NonEmptyList<string>;
      optionalStringProperty: purify.Maybe<string>;
      requiredIntegerProperty: number;
      requiredStringProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
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
    const nonEmptyStringSetProperty = purify.NonEmptyList.fromArray(
      $jsonObject["nonEmptyStringSetProperty"],
    ).unsafeCoerce();
    const optionalStringProperty = purify.Maybe.fromNullable(
      $jsonObject["optionalStringProperty"],
    );
    const requiredIntegerProperty = $jsonObject["requiredIntegerProperty"];
    const requiredStringProperty = $jsonObject["requiredStringProperty"];
    return purify.Either.of({
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
      $type: "FormNodeShape";
      emptyStringSetProperty: readonly string[];
      nestedObjectProperty: NestedNodeShape;
      nonEmptyStringSetProperty: purify.NonEmptyList<string>;
      optionalStringProperty: purify.Maybe<string>;
      requiredIntegerProperty: number;
      requiredStringProperty: string;
    }
  > {
    const $identifier: FormNodeShape.$Identifier = $resource.identifier;
    const $type = "FormNodeShape" as const;
    const _emptyStringSetPropertyEither: purify.Either<
      Error,
      readonly string[]
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
    >(
      $resource.values($properties.emptyStringSetProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
          rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.TermValue({
                focusResource: $resource,
                predicate:
                  FormNodeShape.$properties.emptyStringSetProperty[
                    "identifier"
                  ],
                term: literalValue,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toString()))
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          focusResource: $resource,
          predicate:
            FormNodeShape.$properties.emptyStringSetProperty["identifier"],
          value: valuesArray,
        }),
      )
      .chain((values) => values.head());
    if (_emptyStringSetPropertyEither.isLeft()) {
      return _emptyStringSetPropertyEither;
    }

    const emptyStringSetProperty = _emptyStringSetPropertyEither.unsafeCoerce();
    const _nestedObjectPropertyEither: purify.Either<Error, NestedNodeShape> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
      >(
        $resource.values($properties.nestedObjectProperty["identifier"], {
          unique: true,
        }),
      )
        .chain((values) =>
          values.chainMap((value) =>
            value.toResource().chain((resource) =>
              NestedNodeShape.$fromRdf(resource, {
                ...$context,
                ignoreRdfType: true,
                objectSet: $objectSet,
                preferredLanguages: $preferredLanguages,
              }),
            ),
          ),
        )
        .chain((values) => values.head());
    if (_nestedObjectPropertyEither.isLeft()) {
      return _nestedObjectPropertyEither;
    }

    const nestedObjectProperty = _nestedObjectPropertyEither.unsafeCoerce();
    const _nonEmptyStringSetPropertyEither: purify.Either<
      Error,
      purify.NonEmptyList<string>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
    >(
      $resource.values($properties.nonEmptyStringSetProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
          rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.TermValue({
                focusResource: $resource,
                predicate:
                  FormNodeShape.$properties.nonEmptyStringSetProperty[
                    "identifier"
                  ],
                term: literalValue,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toString()))
      .chain((values) =>
        purify.NonEmptyList.fromArray(values.toArray()).toEither(
          new Error(
            `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} is an empty set`,
          ),
        ),
      )
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          focusResource: $resource,
          predicate:
            FormNodeShape.$properties.nonEmptyStringSetProperty["identifier"],
          value: valuesArray,
        }),
      )
      .chain((values) => values.head());
    if (_nonEmptyStringSetPropertyEither.isLeft()) {
      return _nonEmptyStringSetPropertyEither;
    }

    const nonEmptyStringSetProperty =
      _nonEmptyStringSetPropertyEither.unsafeCoerce();
    const _optionalStringPropertyEither: purify.Either<
      Error,
      purify.Maybe<string>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
    >(
      $resource.values($properties.optionalStringProperty["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
          rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.TermValue({
                focusResource: $resource,
                predicate:
                  FormNodeShape.$properties.optionalStringProperty[
                    "identifier"
                  ],
                term: literalValue,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toString()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<string>>({
              focusResource: $resource,
              predicate:
                FormNodeShape.$properties.optionalStringProperty["identifier"],
              value: purify.Maybe.empty(),
            }),
      )
      .chain((values) => values.head());
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    const _requiredIntegerPropertyEither: purify.Either<Error, number> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
      >(
        $resource.values($properties.requiredIntegerProperty["identifier"], {
          unique: true,
        }),
      )
        .chain((values) => values.chainMap((value) => value.toNumber()))
        .chain((values) => values.head());
    if (_requiredIntegerPropertyEither.isLeft()) {
      return _requiredIntegerPropertyEither;
    }

    const requiredIntegerProperty =
      _requiredIntegerPropertyEither.unsafeCoerce();
    const _requiredStringPropertyEither: purify.Either<Error, string> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
      >(
        $resource.values($properties.requiredStringProperty["identifier"], {
          unique: true,
        }),
      )
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.TermValue({
                  focusResource: $resource,
                  predicate:
                    FormNodeShape.$properties.requiredStringProperty[
                      "identifier"
                    ],
                  term: literalValue,
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
      $type,
      emptyStringSetProperty,
      nestedObjectProperty,
      nonEmptyStringSetProperty,
      optionalStringProperty,
      requiredIntegerProperty,
      requiredStringProperty,
    });
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

  export function $toRdf(
    _formNodeShape: FormNodeShape,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(_formNodeShape.$identifier, {
      mutateGraph,
    });
    resource.add(
      FormNodeShape.$properties.emptyStringSetProperty["identifier"],
      ..._formNodeShape.emptyStringSetProperty.flatMap((item) => [item]),
    );
    resource.add(
      FormNodeShape.$properties.nestedObjectProperty["identifier"],
      ...[
        NestedNodeShape.$toRdf(_formNodeShape.nestedObjectProperty, {
          mutateGraph: mutateGraph,
          resourceSet: resourceSet,
        }).identifier,
      ],
    );
    resource.add(
      FormNodeShape.$properties.nonEmptyStringSetProperty["identifier"],
      ..._formNodeShape.nonEmptyStringSetProperty.flatMap((item) => [item]),
    );
    resource.add(
      FormNodeShape.$properties.optionalStringProperty["identifier"],
      ..._formNodeShape.optionalStringProperty.toList(),
    );
    resource.add(
      FormNodeShape.$properties.requiredIntegerProperty["identifier"],
      ...[_formNodeShape.requiredIntegerProperty],
    );
    resource.add(
      FormNodeShape.$properties.requiredStringProperty["identifier"],
      ...[_formNodeShape.requiredStringProperty],
    );
    return resource;
  }
}
export interface $ObjectSet {
  formNodeShape(
    identifier: FormNodeShape.$Identifier,
  ): Promise<purify.Either<Error, FormNodeShape>>;
  formNodeShapeIdentifiers(
    query?: $ObjectSet.Query<FormNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly FormNodeShape.$Identifier[]>>;
  formNodeShapes(
    query?: $ObjectSet.Query<FormNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly FormNodeShape[]>>;
  formNodeShapesCount(
    query?: Pick<$ObjectSet.Query<FormNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  nestedNodeShape(
    identifier: NestedNodeShape.$Identifier,
  ): Promise<purify.Either<Error, NestedNodeShape>>;
  nestedNodeShapeIdentifiers(
    query?: $ObjectSet.Query<NestedNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly NestedNodeShape.$Identifier[]>>;
  nestedNodeShapes(
    query?: $ObjectSet.Query<NestedNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly NestedNodeShape[]>>;
  nestedNodeShapesCount(
    query?: Pick<$ObjectSet.Query<NestedNodeShape.$Identifier>, "where">,
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
        readonly objectTermType?: "NamedNode";
        readonly predicate: rdfjs.NamedNode;
        readonly subject?: rdfjs.BlankNode | rdfjs.NamedNode;
        readonly type: "triple-objects";
      }
    | {
        readonly object?: rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode;
        readonly predicate: rdfjs.NamedNode;
        readonly subjectTermType?: "NamedNode";
        readonly type: "triple-subjects";
      }
    | { readonly identifierType?: "NamedNode"; readonly type: "type" };
}

export abstract class $ForwardingObjectSet implements $ObjectSet {
  protected abstract get $delegate(): $ObjectSet;

  formNodeShape(
    identifier: FormNodeShape.$Identifier,
  ): Promise<purify.Either<Error, FormNodeShape>> {
    return this.$delegate.formNodeShape(identifier);
  }

  formNodeShapeIdentifiers(
    query?: $ObjectSet.Query<FormNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly FormNodeShape.$Identifier[]>> {
    return this.$delegate.formNodeShapeIdentifiers(query);
  }

  formNodeShapes(
    query?: $ObjectSet.Query<FormNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly FormNodeShape[]>> {
    return this.$delegate.formNodeShapes(query);
  }

  formNodeShapesCount(
    query?: Pick<$ObjectSet.Query<FormNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.formNodeShapesCount(query);
  }

  nestedNodeShape(
    identifier: NestedNodeShape.$Identifier,
  ): Promise<purify.Either<Error, NestedNodeShape>> {
    return this.$delegate.nestedNodeShape(identifier);
  }

  nestedNodeShapeIdentifiers(
    query?: $ObjectSet.Query<NestedNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly NestedNodeShape.$Identifier[]>> {
    return this.$delegate.nestedNodeShapeIdentifiers(query);
  }

  nestedNodeShapes(
    query?: $ObjectSet.Query<NestedNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly NestedNodeShape[]>> {
    return this.$delegate.nestedNodeShapes(query);
  }

  nestedNodeShapesCount(
    query?: Pick<$ObjectSet.Query<NestedNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.nestedNodeShapesCount(query);
  }
}

export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly resourceSet: rdfjsResource.ResourceSet;

  constructor({ dataset }: { dataset: rdfjs.DatasetCore }) {
    this.resourceSet = new rdfjsResource.ResourceSet({ dataset });
  }

  async formNodeShape(
    identifier: FormNodeShape.$Identifier,
  ): Promise<purify.Either<Error, FormNodeShape>> {
    return this.formNodeShapeSync(identifier);
  }

  formNodeShapeSync(
    identifier: FormNodeShape.$Identifier,
  ): purify.Either<Error, FormNodeShape> {
    return this.formNodeShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async formNodeShapeIdentifiers(
    query?: $ObjectSet.Query<FormNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly FormNodeShape.$Identifier[]>> {
    return this.formNodeShapeIdentifiersSync(query);
  }

  formNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<FormNodeShape.$Identifier>,
  ): purify.Either<Error, readonly FormNodeShape.$Identifier[]> {
    return this.$objectIdentifiersSync<
      FormNodeShape,
      FormNodeShape.$Identifier
    >([{ $fromRdf: FormNodeShape.$fromRdf, $fromRdfTypes: [] }], query);
  }

  async formNodeShapes(
    query?: $ObjectSet.Query<FormNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly FormNodeShape[]>> {
    return this.formNodeShapesSync(query);
  }

  formNodeShapesSync(
    query?: $ObjectSet.Query<FormNodeShape.$Identifier>,
  ): purify.Either<Error, readonly FormNodeShape[]> {
    return this.$objectsSync<FormNodeShape, FormNodeShape.$Identifier>(
      [{ $fromRdf: FormNodeShape.$fromRdf, $fromRdfTypes: [] }],
      query,
    );
  }

  async formNodeShapesCount(
    query?: Pick<$ObjectSet.Query<FormNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.formNodeShapesCountSync(query);
  }

  formNodeShapesCountSync(
    query?: Pick<$ObjectSet.Query<FormNodeShape.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<FormNodeShape, FormNodeShape.$Identifier>(
      [{ $fromRdf: FormNodeShape.$fromRdf, $fromRdfTypes: [] }],
      query,
    );
  }

  async nestedNodeShape(
    identifier: NestedNodeShape.$Identifier,
  ): Promise<purify.Either<Error, NestedNodeShape>> {
    return this.nestedNodeShapeSync(identifier);
  }

  nestedNodeShapeSync(
    identifier: NestedNodeShape.$Identifier,
  ): purify.Either<Error, NestedNodeShape> {
    return this.nestedNodeShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async nestedNodeShapeIdentifiers(
    query?: $ObjectSet.Query<NestedNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly NestedNodeShape.$Identifier[]>> {
    return this.nestedNodeShapeIdentifiersSync(query);
  }

  nestedNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<NestedNodeShape.$Identifier>,
  ): purify.Either<Error, readonly NestedNodeShape.$Identifier[]> {
    return this.$objectIdentifiersSync<
      NestedNodeShape,
      NestedNodeShape.$Identifier
    >([{ $fromRdf: NestedNodeShape.$fromRdf, $fromRdfTypes: [] }], query);
  }

  async nestedNodeShapes(
    query?: $ObjectSet.Query<NestedNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly NestedNodeShape[]>> {
    return this.nestedNodeShapesSync(query);
  }

  nestedNodeShapesSync(
    query?: $ObjectSet.Query<NestedNodeShape.$Identifier>,
  ): purify.Either<Error, readonly NestedNodeShape[]> {
    return this.$objectsSync<NestedNodeShape, NestedNodeShape.$Identifier>(
      [{ $fromRdf: NestedNodeShape.$fromRdf, $fromRdfTypes: [] }],
      query,
    );
  }

  async nestedNodeShapesCount(
    query?: Pick<$ObjectSet.Query<NestedNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.nestedNodeShapesCountSync(query);
  }

  nestedNodeShapesCountSync(
    query?: Pick<$ObjectSet.Query<NestedNodeShape.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<NestedNodeShape, NestedNodeShape.$Identifier>(
      [{ $fromRdf: NestedNodeShape.$fromRdf, $fromRdfTypes: [] }],
      query,
    );
  }

  protected $objectIdentifiersSync<
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
    return this.$objectsSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    ).map((objects) => objects.map((object) => object.$identifier));
  }

  protected $objectsSync<
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

    // First pass: gather all resources that meet the where filters.
    // We don't limit + offset here because the resources aren't sorted and limit + offset should be deterministic.
    const resources: {
      objectType?: {
        $fromRdf: (
          resource: rdfjsResource.Resource,
          options: { objectSet: $ObjectSet },
        ) => purify.Either<Error, ObjectT>;
        $fromRdfTypes: readonly rdfjs.NamedNode[];
      };
      resource: rdfjsResource.Resource;
    }[] = [];
    const where = query?.where ?? { type: "type" };
    switch (where.type) {
      case "identifiers": {
        for (const identifier of where.identifiers) {
          // Don't deduplicate
          resources.push({ resource: this.resourceSet.resource(identifier) });
        }
        break;
      }

      case "triple-objects": {
        for (const quad of this.resourceSet.dataset.match(
          where.subject,
          where.predicate,
          null,
        )) {
          if (
            where.objectTermType &&
            quad.object.termType !== where.objectTermType
          ) {
            continue;
          }

          switch (quad.object.termType) {
            case "BlankNode":
            case "NamedNode":
              break;
            default:
              return purify.Left(
                new Error(
                  `subject=${where.subject?.value} predicate=${where.predicate.value} pattern matches non-identifier (${quad.object.termType}) object`,
                ),
              );
          }

          const resource = this.resourceSet.resource(quad.object);
          if (
            !resources.some(({ resource: existingResource }) =>
              existingResource.identifier.equals(resource.identifier),
            )
          ) {
            resources.push({ resource });
          }
        }
        break;
      }

      case "triple-subjects": {
        for (const quad of this.resourceSet.dataset.match(
          null,
          where.predicate,
          where.object,
        )) {
          if (
            where.subjectTermType &&
            quad.subject.termType !== where.subjectTermType
          ) {
            continue;
          }

          switch (quad.subject.termType) {
            case "BlankNode":
            case "NamedNode":
              break;
            default:
              return purify.Left(
                new Error(
                  `predicate=${where.predicate.value} object=${where.object?.value} pattern matches non-identifier (${quad.subject.termType}) subject`,
                ),
              );
          }

          const resource = this.resourceSet.resource(quad.subject);
          if (
            !resources.some(({ resource: existingResource }) =>
              existingResource.identifier.equals(resource.identifier),
            )
          ) {
            resources.push({ resource });
          }
        }
        break;
      }

      case "type": {
        for (const objectType of objectTypes) {
          if (objectType.$fromRdfTypes.length === 0) {
            continue;
          }

          for (const fromRdfType of objectType.$fromRdfTypes) {
            for (const resource of where.identifierType === "NamedNode"
              ? this.resourceSet.namedInstancesOf(fromRdfType)
              : this.resourceSet.instancesOf(fromRdfType)) {
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

        break;
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
    for (let { objectType, resource } of resources) {
      let objectEither: purify.Either<Error, ObjectT>;
      if (objectType) {
        objectEither = objectType.$fromRdf(resource, { objectSet: this });
      } else {
        for (const tryObjectType of objectTypes) {
          objectEither = tryObjectType.$fromRdf(resource, { objectSet: this });
          if (objectEither.isRight()) {
            objectType = tryObjectType;
            break;
          }
        }
      }

      if (objectEither!.isLeft()) {
        // Doesn't appear to belong to any of the known object types, just assume the first
        return objectEither as unknown as purify.Either<
          Error,
          readonly ObjectT[]
        >;
      }
      const object = objectEither!.unsafeCoerce();
      if (objectI++ >= offset) {
        objects.push(object);
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
    objectTypes: readonly {
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    return this.$objectsSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    ).map((objects) => objects.length);
  }
}

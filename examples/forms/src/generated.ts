import N3, { DataFactory as dataFactory } from "n3"
import type * as rdfjs from "@rdfjs/types";
import * as rdfLiteral from "rdf-literal";
import { z as zod } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
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
    export const first = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first");
    export const nil = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil");
    export const rest = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest");
    export const subject = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#subject");
    export const type = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  }

  export namespace rdfs {
    export const subClassOf = dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
  }

  export namespace xsd {
    export const boolean = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean");
    export const date = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#date");
    export const dateTime = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime");
    export const integer = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer");
  }
}
/**
 * Compare two objects with equals(other: T): boolean methods and return an $EqualsResult.
 */
export function $booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(
    left,
    right,
    left.equals(right),
  );
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
    export function $create(parameters: { readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string, readonly requiredStringProperty: string }): NestedNodeShape {
        let $identifier: NestedNodeShape.$Identifier;
        if (typeof parameters.$identifier === "object") { $identifier = parameters.$identifier; } else if (typeof parameters.$identifier === "string") { $identifier = dataFactory.namedNode(parameters.$identifier); } else { $identifier =( parameters.$identifier) satisfies never;
         }

        const $type = "NestedNodeShape" as const
        const requiredStringProperty = parameters.requiredStringProperty;
        return { $identifier, $type, requiredStringProperty }
    }

    export function $equals(left: NestedNodeShape, right: NestedNodeShape): $EqualsResult {
        return ($booleanEquals)(left.$identifier, right.$identifier).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "$identifier", propertyValuesUnequal, type: "Property" as const })).chain(() => ($strictEquals)(left.$type, right.$type).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "$type", propertyValuesUnequal, type: "Property" as const }))).chain(() => ($strictEquals)(left.requiredStringProperty, right.requiredStringProperty).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "requiredStringProperty", propertyValuesUnequal, type: "Property" as const })));
    }

    export type $Identifier = (rdfjs.BlankNode | rdfjs.NamedNode);

    export namespace $Identifier {
        export function fromString(identifier: string): purify.Either<Error, rdfjsResource.Resource.Identifier> {
            return purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory: dataFactory, identifier }));
        }

        export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
            toString = rdfjsResource.Resource.Identifier.toString;
    }

    export type $Json = { readonly "@id": string; readonly "$type": "NestedNodeShape"; readonly "requiredStringProperty": string };

    export function $propertiesFromJson(_json: unknown): purify.Either<zod.ZodError, { $identifier: (rdfjs.BlankNode | rdfjs.NamedNode); $type: "NestedNodeShape"; requiredStringProperty: string; }> {
        const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
        if (!$jsonSafeParseResult.success) { return purify.Left($jsonSafeParseResult.error); }

        const _jsonObject = $jsonSafeParseResult.data;
        const $identifier = (_jsonObject["@id"].startsWith("_:") ? dataFactory.blankNode(_jsonObject["@id"].substring(2)) : dataFactory.namedNode(_jsonObject["@id"]));
        const $type = "NestedNodeShape" as const
        const requiredStringProperty = _jsonObject["requiredStringProperty"];
        return purify.Either.of({ $identifier, $type, requiredStringProperty })
    }

    export function $fromJson(json: unknown): purify.Either<zod.ZodError, NestedNodeShape> {
        return $propertiesFromJson(json);
    }

    export function $jsonSchema() {
        return zodToJsonSchema($jsonZodSchema());
    }

    export function $jsonUiSchema(parameters?: { scopePrefix?: string }): any {
        const scopePrefix = parameters?.scopePrefix ?? "#";
        return { "elements": [ { label: "Identifier", scope: `${scopePrefix}/properties/@id`, type: "Control" }, { rule: { condition: { schema: { const: "NestedNodeShape" }, scope: `${scopePrefix}/properties/$type` }, effect: "HIDE" }, scope: `${scopePrefix}/properties/$type`, type: "Control" }, { label: "Required string", scope: `${scopePrefix}/properties/requiredStringProperty`, type: "Control" } ], label: "NestedNodeShape", type: "Group" }
    }

    export function $toJson(_nestedNodeShape: NestedNodeShape): NestedNodeShape.$Json {
        return JSON.parse(JSON.stringify({ "@id": _nestedNodeShape.$identifier.termType === "BlankNode" ? `_:${_nestedNodeShape.$identifier.value}` : _nestedNodeShape.$identifier.value,$type: _nestedNodeShape.$type,requiredStringProperty: _nestedNodeShape.requiredStringProperty } satisfies NestedNodeShape.$Json));
    }

    export function $jsonZodSchema() {
        return zod.object({ "@id": zod.string().min(1),"$type": zod.literal("NestedNodeShape"),"requiredStringProperty": zod.string() }) satisfies zod.ZodType<$Json>;
    }

    export function $hash<HasherT extends { update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; }>(_nestedNodeShape: NestedNodeShape, _hasher: HasherT): HasherT {
        _hasher.update(_nestedNodeShape.$identifier.value);
        _hasher.update(_nestedNodeShape.$type);
        NestedNodeShape.$hashShaclProperties(_nestedNodeShape, _hasher);
        return _hasher;
    }

    export function $hashShaclProperties<HasherT extends { update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; }>(_nestedNodeShape: NestedNodeShape, _hasher: HasherT): HasherT {
        _hasher.update(_nestedNodeShape.requiredStringProperty);
        return _hasher;
    }

    export function $propertiesFromRdf({ ignoreRdfType: _ignoreRdfType, languageIn: _languageIn, resource: _resource,
        // @ts-ignore
        ..._context }: { [_index: string]: any; ignoreRdfType?: boolean; languageIn?: readonly string[]; resource: rdfjsResource.Resource; }): purify.Either<Error, { $identifier: (rdfjs.BlankNode | rdfjs.NamedNode); $type: "NestedNodeShape"; requiredStringProperty: string; }> {
        const $identifier: NestedNodeShape.$Identifier = _resource.identifier;
        const $type = "NestedNodeShape" as const
        const _requiredStringPropertyEither: purify.Either<Error, string> = _resource.values($properties.requiredStringProperty["identifier"], { unique: true }).head().chain(value => value.toString());
        if (_requiredStringPropertyEither.isLeft()) { return _requiredStringPropertyEither; }

        const requiredStringProperty = _requiredStringPropertyEither.unsafeCoerce();
        return purify.Either.of({ $identifier, $type, requiredStringProperty })
    }

    export function $fromRdf(parameters: Parameters<typeof NestedNodeShape.$propertiesFromRdf>[0]): purify.Either<Error, NestedNodeShape> {
        return NestedNodeShape.$propertiesFromRdf(parameters);
    }

    export function $toRdf(_nestedNodeShape: NestedNodeShape, { mutateGraph, resourceSet }: { ignoreRdfType?: boolean; mutateGraph?: rdfjsResource.MutableResource.MutateGraph, resourceSet: rdfjsResource.MutableResourceSet }): rdfjsResource.MutableResource {
        const _resource = resourceSet.mutableResource(_nestedNodeShape.$identifier, { mutateGraph });
        _resource.add(NestedNodeShape.$properties.requiredStringProperty["identifier"], _nestedNodeShape.requiredStringProperty);
        return _resource;
    }

    export const $properties = {requiredStringProperty: { identifier: dataFactory.namedNode("http://example.com/requiredStringProperty") }};
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
    readonly emptyStringSetProperty: readonly (string)[];
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
    export function $create(parameters: { readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string, readonly emptyStringSetProperty?: readonly (string)[], readonly nestedObjectProperty: NestedNodeShape, readonly nonEmptyStringSetProperty: purify.NonEmptyList<string>, readonly optionalStringProperty?: purify.Maybe<string> | string, readonly requiredIntegerProperty: number, readonly requiredStringProperty: string }): FormNodeShape {
        let $identifier: FormNodeShape.$Identifier;
        if (typeof parameters.$identifier === "object") { $identifier = parameters.$identifier; } else if (typeof parameters.$identifier === "string") { $identifier = dataFactory.namedNode(parameters.$identifier); } else { $identifier =( parameters.$identifier) satisfies never;
         }

        const $type = "FormNodeShape" as const
        let emptyStringSetProperty: readonly (string)[];
        if (typeof parameters.emptyStringSetProperty === "undefined") { emptyStringSetProperty = []; } else if (typeof parameters.emptyStringSetProperty === "object") { emptyStringSetProperty = parameters.emptyStringSetProperty; } else { emptyStringSetProperty =( parameters.emptyStringSetProperty) satisfies never;
         }

        const nestedObjectProperty = parameters.nestedObjectProperty;
        const nonEmptyStringSetProperty = parameters.nonEmptyStringSetProperty;
        let optionalStringProperty: purify.Maybe<string>;
        if (purify.Maybe.isMaybe(parameters.optionalStringProperty)) { optionalStringProperty = parameters.optionalStringProperty; } else if (typeof parameters.optionalStringProperty === "string") { optionalStringProperty = purify.Maybe.of(parameters.optionalStringProperty); } else if (typeof parameters.optionalStringProperty === "undefined") { optionalStringProperty = purify.Maybe.empty(); } else { optionalStringProperty =( parameters.optionalStringProperty) satisfies never;
         }

        const requiredIntegerProperty = parameters.requiredIntegerProperty;
        const requiredStringProperty = parameters.requiredStringProperty;
        return { $identifier, $type, emptyStringSetProperty, nestedObjectProperty, nonEmptyStringSetProperty, optionalStringProperty, requiredIntegerProperty, requiredStringProperty }
    }

    export function $equals(left: FormNodeShape, right: FormNodeShape): $EqualsResult {
        return ($booleanEquals)(left.$identifier, right.$identifier).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "$identifier", propertyValuesUnequal, type: "Property" as const })).chain(() => ($strictEquals)(left.$type, right.$type).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "$type", propertyValuesUnequal, type: "Property" as const }))).chain(() => (((left, right) => $arrayEquals(left, right, $strictEquals)))(left.emptyStringSetProperty, right.emptyStringSetProperty).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "emptyStringSetProperty", propertyValuesUnequal, type: "Property" as const }))).chain(() => (NestedNodeShape.$equals)(left.nestedObjectProperty, right.nestedObjectProperty).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "nestedObjectProperty", propertyValuesUnequal, type: "Property" as const }))).chain(() => (((left, right) => $arrayEquals(left, right, $strictEquals)))(left.nonEmptyStringSetProperty, right.nonEmptyStringSetProperty).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "nonEmptyStringSetProperty", propertyValuesUnequal, type: "Property" as const }))).chain(() => (((left, right) => $maybeEquals(left, right, $strictEquals)))(left.optionalStringProperty, right.optionalStringProperty).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "optionalStringProperty", propertyValuesUnequal, type: "Property" as const }))).chain(() => ($strictEquals)(left.requiredIntegerProperty, right.requiredIntegerProperty).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "requiredIntegerProperty", propertyValuesUnequal, type: "Property" as const }))).chain(() => ($strictEquals)(left.requiredStringProperty, right.requiredStringProperty).mapLeft(propertyValuesUnequal => ({ left: left, right: right, propertyName: "requiredStringProperty", propertyValuesUnequal, type: "Property" as const })));
    }

    export type $Identifier = (rdfjs.BlankNode | rdfjs.NamedNode);

    export namespace $Identifier {
        export function fromString(identifier: string): purify.Either<Error, rdfjsResource.Resource.Identifier> {
            return purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory: dataFactory, identifier }));
        }

        export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
            toString = rdfjsResource.Resource.Identifier.toString;
    }

    export type $Json = { readonly "@id": string; readonly "$type": "FormNodeShape"; readonly "emptyStringSetProperty"?: readonly (string)[]; readonly "nestedObjectProperty": NestedNodeShape.$Json; readonly "nonEmptyStringSetProperty": readonly (string)[]; readonly "optionalStringProperty"?: string; readonly "requiredIntegerProperty": number; readonly "requiredStringProperty": string };

    export function $propertiesFromJson(_json: unknown): purify.Either<zod.ZodError, { $identifier: (rdfjs.BlankNode | rdfjs.NamedNode); $type: "FormNodeShape"; emptyStringSetProperty: readonly (string)[]; nestedObjectProperty: NestedNodeShape; nonEmptyStringSetProperty: purify.NonEmptyList<string>; optionalStringProperty: purify.Maybe<string>; requiredIntegerProperty: number; requiredStringProperty: string; }> {
        const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
        if (!$jsonSafeParseResult.success) { return purify.Left($jsonSafeParseResult.error); }

        const _jsonObject = $jsonSafeParseResult.data;
        const $identifier = (_jsonObject["@id"].startsWith("_:") ? dataFactory.blankNode(_jsonObject["@id"].substring(2)) : dataFactory.namedNode(_jsonObject["@id"]));
        const $type = "FormNodeShape" as const
        const emptyStringSetProperty = _jsonObject["emptyStringSetProperty"];
        const nestedObjectProperty = NestedNodeShape.$fromJson(_jsonObject["nestedObjectProperty"]).unsafeCoerce();
        const nonEmptyStringSetProperty = purify.NonEmptyList.fromArray(_jsonObject["nonEmptyStringSetProperty"]).unsafeCoerce();
        const optionalStringProperty = purify.Maybe.fromNullable(_jsonObject["optionalStringProperty"]);
        const requiredIntegerProperty = _jsonObject["requiredIntegerProperty"];
        const requiredStringProperty = _jsonObject["requiredStringProperty"];
        return purify.Either.of({ $identifier, $type, emptyStringSetProperty, nestedObjectProperty, nonEmptyStringSetProperty, optionalStringProperty, requiredIntegerProperty, requiredStringProperty })
    }

    export function $fromJson(json: unknown): purify.Either<zod.ZodError, FormNodeShape> {
        return $propertiesFromJson(json);
    }

    export function $jsonSchema() {
        return zodToJsonSchema($jsonZodSchema());
    }

    export function $jsonUiSchema(parameters?: { scopePrefix?: string }): any {
        const scopePrefix = parameters?.scopePrefix ?? "#";
        return { "elements": [ { label: "Identifier", scope: `${scopePrefix}/properties/@id`, type: "Control" }, { rule: { condition: { schema: { const: "FormNodeShape" }, scope: `${scopePrefix}/properties/$type` }, effect: "HIDE" }, scope: `${scopePrefix}/properties/$type`, type: "Control" }, { label: "Empty string set", scope: `${scopePrefix}/properties/emptyStringSetProperty`, type: "Control" }, NestedNodeShape.$jsonUiSchema({ scopePrefix: `${scopePrefix}/properties/nestedObjectProperty` }), { label: "Non-empty string set", scope: `${scopePrefix}/properties/nonEmptyStringSetProperty`, type: "Control" }, { label: "Optional string", scope: `${scopePrefix}/properties/optionalStringProperty`, type: "Control" }, { label: "Required integer", scope: `${scopePrefix}/properties/requiredIntegerProperty`, type: "Control" }, { label: "Required string", scope: `${scopePrefix}/properties/requiredStringProperty`, type: "Control" } ], label: "Form", type: "Group" }
    }

    export function $toJson(_formNodeShape: FormNodeShape): FormNodeShape.$Json {
        return JSON.parse(JSON.stringify({ "@id": _formNodeShape.$identifier.termType === "BlankNode" ? `_:${_formNodeShape.$identifier.value}` : _formNodeShape.$identifier.value,$type: _formNodeShape.$type,emptyStringSetProperty: _formNodeShape.emptyStringSetProperty.map(item => (item)),nestedObjectProperty: NestedNodeShape.$toJson(_formNodeShape.nestedObjectProperty),nonEmptyStringSetProperty: _formNodeShape.nonEmptyStringSetProperty.map(item => (item)),optionalStringProperty: _formNodeShape.optionalStringProperty.map(item => (item)).extract(),requiredIntegerProperty: _formNodeShape.requiredIntegerProperty,requiredStringProperty: _formNodeShape.requiredStringProperty } satisfies FormNodeShape.$Json));
    }

    export function $jsonZodSchema() {
        return zod.object({ "@id": zod.string().min(1),"$type": zod.literal("FormNodeShape"),"emptyStringSetProperty": zod.string().array().default(() => []),"nestedObjectProperty": NestedNodeShape.$jsonZodSchema(),"nonEmptyStringSetProperty": zod.string().array().nonempty().min(1),"optionalStringProperty": zod.string().optional(),"requiredIntegerProperty": zod.number(),"requiredStringProperty": zod.string() }) satisfies zod.ZodType<$Json>;
    }

    export function $hash<HasherT extends { update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; }>(_formNodeShape: FormNodeShape, _hasher: HasherT): HasherT {
        _hasher.update(_formNodeShape.$identifier.value);
        _hasher.update(_formNodeShape.$type);
        FormNodeShape.$hashShaclProperties(_formNodeShape, _hasher);
        return _hasher;
    }

    export function $hashShaclProperties<HasherT extends { update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; }>(_formNodeShape: FormNodeShape, _hasher: HasherT): HasherT {
        for (const item0 of _formNodeShape.emptyStringSetProperty) { _hasher.update(item0); }

        NestedNodeShape.$hash(_formNodeShape.nestedObjectProperty, _hasher);
        for (const item0 of _formNodeShape.nonEmptyStringSetProperty) { _hasher.update(item0); }

        _formNodeShape.optionalStringProperty.ifJust((value0) => { _hasher.update(value0); })
        _hasher.update(_formNodeShape.requiredIntegerProperty.toString());
        _hasher.update(_formNodeShape.requiredStringProperty);
        return _hasher;
    }

    export function $propertiesFromRdf({ ignoreRdfType: _ignoreRdfType, languageIn: _languageIn, resource: _resource,
        // @ts-ignore
        ..._context }: { [_index: string]: any; ignoreRdfType?: boolean; languageIn?: readonly string[]; resource: rdfjsResource.Resource; }): purify.Either<Error, { $identifier: (rdfjs.BlankNode | rdfjs.NamedNode); $type: "FormNodeShape"; emptyStringSetProperty: readonly (string)[]; nestedObjectProperty: NestedNodeShape; nonEmptyStringSetProperty: purify.NonEmptyList<string>; optionalStringProperty: purify.Maybe<string>; requiredIntegerProperty: number; requiredStringProperty: string; }> {
        const $identifier: FormNodeShape.$Identifier = _resource.identifier;
        const $type = "FormNodeShape" as const
        const _emptyStringSetPropertyEither: purify.Either<Error, readonly (string)[]> = purify.Either.sequence(_resource.values($properties.emptyStringSetProperty["identifier"], { unique: true }).map(item => item.toValues().head().chain(value => value.toString())));
        if (_emptyStringSetPropertyEither.isLeft()) { return _emptyStringSetPropertyEither; }

        const emptyStringSetProperty = _emptyStringSetPropertyEither.unsafeCoerce();
        const _nestedObjectPropertyEither: purify.Either<Error, NestedNodeShape> = _resource.values($properties.nestedObjectProperty["identifier"], { unique: true }).head().chain(value => value.toResource()).chain(_resource => NestedNodeShape.$fromRdf({ ..._context, ignoreRdfType: true, languageIn: _languageIn, resource: _resource }));
        if (_nestedObjectPropertyEither.isLeft()) { return _nestedObjectPropertyEither; }

        const nestedObjectProperty = _nestedObjectPropertyEither.unsafeCoerce();
        const _nonEmptyStringSetPropertyEither: purify.Either<Error, purify.NonEmptyList<string>> = purify.Either.sequence(_resource.values($properties.nonEmptyStringSetProperty["identifier"], { unique: true }).map(item => item.toValues().head().chain(value => value.toString()))).chain(array => purify.NonEmptyList.fromArray(array).toEither(new Error(`${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} is an empty set`)));
        if (_nonEmptyStringSetPropertyEither.isLeft()) { return _nonEmptyStringSetPropertyEither; }

        const nonEmptyStringSetProperty = _nonEmptyStringSetPropertyEither.unsafeCoerce();
        const _optionalStringPropertyEither: purify.Either<Error, purify.Maybe<string>> = _resource.values($properties.optionalStringProperty["identifier"], { unique: true }).head().chain(value => value.toString()).map(value => purify.Maybe.of(value)).chainLeft(error => error instanceof rdfjsResource.Resource.MissingValueError ? purify.Right(purify.Maybe.empty()) : purify.Left(error));
        if (_optionalStringPropertyEither.isLeft()) { return _optionalStringPropertyEither; }

        const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
        const _requiredIntegerPropertyEither: purify.Either<Error, number> = _resource.values($properties.requiredIntegerProperty["identifier"], { unique: true }).head().chain(value => value.toNumber());
        if (_requiredIntegerPropertyEither.isLeft()) { return _requiredIntegerPropertyEither; }

        const requiredIntegerProperty = _requiredIntegerPropertyEither.unsafeCoerce();
        const _requiredStringPropertyEither: purify.Either<Error, string> = _resource.values($properties.requiredStringProperty["identifier"], { unique: true }).head().chain(value => value.toString());
        if (_requiredStringPropertyEither.isLeft()) { return _requiredStringPropertyEither; }

        const requiredStringProperty = _requiredStringPropertyEither.unsafeCoerce();
        return purify.Either.of({ $identifier, $type, emptyStringSetProperty, nestedObjectProperty, nonEmptyStringSetProperty, optionalStringProperty, requiredIntegerProperty, requiredStringProperty })
    }

    export function $fromRdf(parameters: Parameters<typeof FormNodeShape.$propertiesFromRdf>[0]): purify.Either<Error, FormNodeShape> {
        return FormNodeShape.$propertiesFromRdf(parameters);
    }

    export function $toRdf(_formNodeShape: FormNodeShape, { mutateGraph, resourceSet }: { ignoreRdfType?: boolean; mutateGraph?: rdfjsResource.MutableResource.MutateGraph, resourceSet: rdfjsResource.MutableResourceSet }): rdfjsResource.MutableResource {
        const _resource = resourceSet.mutableResource(_formNodeShape.$identifier, { mutateGraph });
        _resource.add(FormNodeShape.$properties.emptyStringSetProperty["identifier"], _formNodeShape.emptyStringSetProperty.map((item) => item));
        _resource.add(FormNodeShape.$properties.nestedObjectProperty["identifier"], NestedNodeShape.$toRdf(_formNodeShape.nestedObjectProperty, { mutateGraph: mutateGraph, resourceSet: resourceSet }));
        _resource.add(FormNodeShape.$properties.nonEmptyStringSetProperty["identifier"], _formNodeShape.nonEmptyStringSetProperty.map((item) => item));
        _resource.add(FormNodeShape.$properties.optionalStringProperty["identifier"], _formNodeShape.optionalStringProperty);
        _resource.add(FormNodeShape.$properties.requiredIntegerProperty["identifier"], _formNodeShape.requiredIntegerProperty);
        _resource.add(FormNodeShape.$properties.requiredStringProperty["identifier"], _formNodeShape.requiredStringProperty);
        return _resource;
    }

    export const $properties = {emptyStringSetProperty: { identifier: dataFactory.namedNode("http://example.com/emptyStringSetProperty") }, nestedObjectProperty: { identifier: dataFactory.namedNode("http://example.com/nestedObjectProperty") }, nonEmptyStringSetProperty: { identifier: dataFactory.namedNode("http://example.com/nonEmptyStringSetProperty") }, optionalStringProperty: { identifier: dataFactory.namedNode("http://example.com/optionalStringProperty") }, requiredIntegerProperty: { identifier: dataFactory.namedNode("http://example.com/requiredIntegerProperty") }, requiredStringProperty: { identifier: dataFactory.namedNode("http://example.com/requiredStringProperty") }};
}
export interface $ObjectSet {
    formNodeShape(identifier: FormNodeShape.$Identifier): Promise<purify.Either<Error, FormNodeShape>>;
    formNodeShapeIdentifiers(query?: $ObjectSet.Query<FormNodeShape.$Identifier>): Promise<purify.Either<Error, readonly FormNodeShape.$Identifier[]>>;
    formNodeShapes(query?: $ObjectSet.Query<FormNodeShape.$Identifier>): Promise<purify.Either<Error, readonly FormNodeShape[]>>;
    formNodeShapesCount(query?: Pick<$ObjectSet.Query<FormNodeShape.$Identifier>, "where">): Promise<purify.Either<Error, number>>;
    nestedNodeShape(identifier: NestedNodeShape.$Identifier): Promise<purify.Either<Error, NestedNodeShape>>;
    nestedNodeShapeIdentifiers(query?: $ObjectSet.Query<NestedNodeShape.$Identifier>): Promise<purify.Either<Error, readonly NestedNodeShape.$Identifier[]>>;
    nestedNodeShapes(query?: $ObjectSet.Query<NestedNodeShape.$Identifier>): Promise<purify.Either<Error, readonly NestedNodeShape[]>>;
    nestedNodeShapesCount(query?: Pick<$ObjectSet.Query<NestedNodeShape.$Identifier>, "where">): Promise<purify.Either<Error, number>>;
}

export namespace $ObjectSet {
    export type Query<ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode> = { readonly limit?: number; readonly offset?: number; readonly where?: Where<ObjectIdentifierT> };
    export type Where<ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode> = { readonly identifiers: readonly ObjectIdentifierT[]; readonly type: "identifiers" }  | { readonly predicate: rdfjs.NamedNode; readonly subject: rdfjs.BlankNode | rdfjs.NamedNode; readonly type: "triple-objects" } ;
}

export class $RdfjsDatasetObjectSet implements $ObjectSet {
    readonly resourceSet: rdfjsResource.ResourceSet;

    constructor({ dataset }: { dataset: rdfjs.DatasetCore }) {
        this.resourceSet = new rdfjsResource.ResourceSet({ dataset })
    }

    async formNodeShape(identifier: FormNodeShape.$Identifier): Promise<purify.Either<Error, FormNodeShape>> {
        return this.formNodeShapeSync(identifier);
    }

    formNodeShapeSync(identifier: FormNodeShape.$Identifier): purify.Either<Error, FormNodeShape> {
        return this.formNodeShapesSync({ where: { identifiers: [identifier], type: "identifiers" } }).map(objects => objects[0]);
    }

    async formNodeShapeIdentifiers(query?: $ObjectSet.Query<FormNodeShape.$Identifier>): Promise<purify.Either<Error, readonly FormNodeShape.$Identifier[]>> {
        return this.formNodeShapeIdentifiersSync(query);
    }

    formNodeShapeIdentifiersSync(query?: $ObjectSet.Query<FormNodeShape.$Identifier>): purify.Either<Error, readonly FormNodeShape.$Identifier[]> {
        return this.$objectIdentifiersSync<FormNodeShape, FormNodeShape.$Identifier>({ ...FormNodeShape, $fromRdfType: undefined }, query);
    }

    async formNodeShapes(query?: $ObjectSet.Query<FormNodeShape.$Identifier>): Promise<purify.Either<Error, readonly FormNodeShape[]>> {
        return this.formNodeShapesSync(query);
    }

    formNodeShapesSync(query?: $ObjectSet.Query<FormNodeShape.$Identifier>): purify.Either<Error, readonly FormNodeShape[]> {
        return this.$objectsSync<FormNodeShape, FormNodeShape.$Identifier>({ ...FormNodeShape, $fromRdfType: undefined }, query);
    }

    async formNodeShapesCount(query?: Pick<$ObjectSet.Query<FormNodeShape.$Identifier>, "where">): Promise<purify.Either<Error, number>> {
        return this.formNodeShapesCountSync(query);
    }

    formNodeShapesCountSync(query?: Pick<$ObjectSet.Query<FormNodeShape.$Identifier>, "where">): purify.Either<Error, number> {
        return this.$objectsCountSync<FormNodeShape, FormNodeShape.$Identifier>({ ...FormNodeShape, $fromRdfType: undefined }, query);
    }

    async nestedNodeShape(identifier: NestedNodeShape.$Identifier): Promise<purify.Either<Error, NestedNodeShape>> {
        return this.nestedNodeShapeSync(identifier);
    }

    nestedNodeShapeSync(identifier: NestedNodeShape.$Identifier): purify.Either<Error, NestedNodeShape> {
        return this.nestedNodeShapesSync({ where: { identifiers: [identifier], type: "identifiers" } }).map(objects => objects[0]);
    }

    async nestedNodeShapeIdentifiers(query?: $ObjectSet.Query<NestedNodeShape.$Identifier>): Promise<purify.Either<Error, readonly NestedNodeShape.$Identifier[]>> {
        return this.nestedNodeShapeIdentifiersSync(query);
    }

    nestedNodeShapeIdentifiersSync(query?: $ObjectSet.Query<NestedNodeShape.$Identifier>): purify.Either<Error, readonly NestedNodeShape.$Identifier[]> {
        return this.$objectIdentifiersSync<NestedNodeShape, NestedNodeShape.$Identifier>({ ...NestedNodeShape, $fromRdfType: undefined }, query);
    }

    async nestedNodeShapes(query?: $ObjectSet.Query<NestedNodeShape.$Identifier>): Promise<purify.Either<Error, readonly NestedNodeShape[]>> {
        return this.nestedNodeShapesSync(query);
    }

    nestedNodeShapesSync(query?: $ObjectSet.Query<NestedNodeShape.$Identifier>): purify.Either<Error, readonly NestedNodeShape[]> {
        return this.$objectsSync<NestedNodeShape, NestedNodeShape.$Identifier>({ ...NestedNodeShape, $fromRdfType: undefined }, query);
    }

    async nestedNodeShapesCount(query?: Pick<$ObjectSet.Query<NestedNodeShape.$Identifier>, "where">): Promise<purify.Either<Error, number>> {
        return this.nestedNodeShapesCountSync(query);
    }

    nestedNodeShapesCountSync(query?: Pick<$ObjectSet.Query<NestedNodeShape.$Identifier>, "where">): purify.Either<Error, number> {
        return this.$objectsCountSync<NestedNodeShape, NestedNodeShape.$Identifier>({ ...NestedNodeShape, $fromRdfType: undefined }, query);
    }

    protected $objectIdentifiersSync<ObjectT extends { readonly $identifier: ObjectIdentifierT }, ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode>(objectType: { $fromRdf: (parameters: { resource: rdfjsResource.Resource }) => purify.Either<Error, ObjectT>; $fromRdfType?: rdfjs.NamedNode }, query?: $ObjectSet.Query<ObjectIdentifierT>): purify.Either<Error, readonly ObjectIdentifierT[]> {
        return this.$objectsSync<ObjectT, ObjectIdentifierT>(objectType, query).map(objects => objects.map(object => object.$identifier));
    }

    protected $objectsSync<ObjectT extends { readonly $identifier: ObjectIdentifierT }, ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode>(objectType: { $fromRdf: (parameters: { resource: rdfjsResource.Resource }) => purify.Either<Error, ObjectT>; $fromRdfType?: rdfjs.NamedNode }, query?: $ObjectSet.Query<ObjectIdentifierT>): purify.Either<Error, readonly ObjectT[]> {
        const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
        if (limit <= 0) { return purify.Either.of([]); }

        let offset = query?.offset ?? 0;
        if (offset < 0) { offset = 0; }

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
              for (const quad of this.resourceSet.dataset.match(query.where.subject, query.where.predicate, null)) {
                if (quad.object.termType === "BlankNode" || quad.object.termType === "NamedNode") {
                  if (++identifierI >= offset) {
                    identifiers.push(quad.object);
                    if (identifiers.length === limit) {
                      break;
                    }
                  }
                } else {
                  return purify.Left(new Error(`subject=${query.where.subject.value} predicate=${query.where.predicate.value} pattern matches non-identifier (${quad.object.termType}) triple`));
                }
              }
              break;
            }
          }

          const objects: ObjectT[] = [];
          for (const identifier of identifiers) {
            const either = objectType.$fromRdf({ resource: this.resourceSet.resource(identifier) });
            if (either.isLeft()) {
              return either;
            }
            objects.push(either.unsafeCoerce());
          }
          return purify.Either.of(objects);
        }

        if (!objectType.$fromRdfType) {
          return purify.Either.of([]);
        }

        const resources = [...this.resourceSet.instancesOf(objectType.$fromRdfType)];
        // Sort resources by identifier so limit and offset are deterministic
        resources.sort((left, right) => left.identifier.value.localeCompare(right.identifier.value));

        const objects: ObjectT[] = [];
        let objectI = 0;
        for (const resource of resources) {
          const either = objectType.$fromRdf({ resource });
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

    protected $objectsCountSync<ObjectT extends { readonly $identifier: ObjectIdentifierT }, ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode>(objectType: { $fromRdf: (parameters: { resource: rdfjsResource.Resource }) => purify.Either<Error, ObjectT>; $fromRdfType?: rdfjs.NamedNode }, query?: $ObjectSet.Query<ObjectIdentifierT>): purify.Either<Error, number> {
        return this.$objectsSync<ObjectT, ObjectIdentifierT>(objectType, query).map(objects => objects.length);
    }
}

    


import type * as rdfjs from "@rdfjs/types";
import { sha256 } from "js-sha256";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfLiteral from "rdf-literal";
import * as rdfjsResource from "rdfjs-resource";
import * as sparqljs from "sparqljs";
import * as uuid from "uuid";
import { z as zod } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ExternObjectType } from "./ExternObjectType.js";
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
        readonly left: object;
        readonly right: object;
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
/**
 * Compare two Dates and return an $EqualsResult.
 */
export function $dateEquals(left: Date, right: Date): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(
    left,
    right,
    left.getTime() === right.getTime(),
  );
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
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
/**
 * A node shape that mints its identifier by generating a v4 UUID, if no identifier is supplied.
 */
export class UuidV4IriNodeShape {
  private _identifier: rdfjs.NamedNode | undefined;
  protected readonly _identifierPrefix?: string;
  readonly type = "UuidV4IriNodeShape";
  readonly stringProperty: string;

  constructor(parameters: {
    readonly identifier?: rdfjs.NamedNode | string;
    readonly identifierPrefix?: string;
    readonly stringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this._identifierPrefix = parameters.identifierPrefix;
    this.stringProperty = parameters.stringProperty;
  }

  get identifier(): rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.namedNode(
        `${this.identifierPrefix}${uuid.v4()}`,
      );
    }
    return this._identifier;
  }

  protected get identifierPrefix(): string {
    return typeof this._identifierPrefix !== "undefined"
      ? this._identifierPrefix
      : `urn:shaclmate:${this.type}:`;
  }

  equals(other: UuidV4IriNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.identifierPrefix, other.identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty, other.stringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.stringProperty);
    return _hasher;
  }

  toJson(): UuidV4IriNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.identifier.value,
        type: this.type,
        stringProperty: this.stringProperty,
      } satisfies UuidV4IriNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace UuidV4IriNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "UuidV4IriNodeShape";
    readonly stringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.NamedNode; stringProperty: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty = _jsonObject["stringProperty"];
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, UuidV4IriNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new UuidV4IriNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "UuidV4IriNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
      ],
      label: "UuidV4IriNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("UuidV4IriNodeShape"),
      stringProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.NamedNode; stringProperty: string }
  > {
    const identifier = _resource.identifier;
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromRdf(
    parameters: Parameters<typeof UuidV4IriNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, UuidV4IriNodeShape> {
    return UuidV4IriNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new UuidV4IriNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        UuidV4IriNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        UuidV4IriNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      UuidV4IriNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("uuidV4IriNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "uuidV4IriNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("uuidV4IriNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "uuidV4IriNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape with sh:xone properties.
 */
export class UnionPropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "UnionPropertiesNodeShape";
  readonly orLiteralsProperty: purify.Maybe<rdfjs.Literal>;
  readonly orTermsProperty: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
  readonly orUnrelatedProperty: purify.Maybe<
    | { type: "0-number"; value: number }
    | { type: "1-NonClassNodeShape"; value: NonClassNodeShape }
  >;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly orLiteralsProperty?:
      | rdfjs.Literal
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal>
      | string;
    readonly orTermsProperty?:
      | (rdfjs.Literal | rdfjs.NamedNode)
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
      | string;
    readonly orUnrelatedProperty?:
      | (
          | { type: "0-number"; value: number }
          | { type: "1-NonClassNodeShape"; value: NonClassNodeShape }
        )
      | purify.Maybe<
          | { type: "0-number"; value: number }
          | { type: "1-NonClassNodeShape"; value: NonClassNodeShape }
        >;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    if (purify.Maybe.isMaybe(parameters.orLiteralsProperty)) {
      this.orLiteralsProperty = parameters.orLiteralsProperty;
    } else if (typeof parameters.orLiteralsProperty === "boolean") {
      this.orLiteralsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.orLiteralsProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.orLiteralsProperty === "object" &&
      parameters.orLiteralsProperty instanceof Date
    ) {
      this.orLiteralsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.orLiteralsProperty, { dataFactory }),
      );
    } else if (typeof parameters.orLiteralsProperty === "number") {
      this.orLiteralsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.orLiteralsProperty, { dataFactory }),
      );
    } else if (typeof parameters.orLiteralsProperty === "string") {
      this.orLiteralsProperty = purify.Maybe.of(
        dataFactory.literal(parameters.orLiteralsProperty),
      );
    } else if (typeof parameters.orLiteralsProperty === "object") {
      this.orLiteralsProperty = purify.Maybe.of(parameters.orLiteralsProperty);
    } else if (typeof parameters.orLiteralsProperty === "undefined") {
      this.orLiteralsProperty = purify.Maybe.empty();
    } else {
      this.orLiteralsProperty = parameters.orLiteralsProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.orTermsProperty)) {
      this.orTermsProperty = parameters.orTermsProperty;
    } else if (typeof parameters.orTermsProperty === "boolean") {
      this.orTermsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.orTermsProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.orTermsProperty === "object" &&
      parameters.orTermsProperty instanceof Date
    ) {
      this.orTermsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.orTermsProperty, { dataFactory }),
      );
    } else if (typeof parameters.orTermsProperty === "number") {
      this.orTermsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.orTermsProperty, { dataFactory }),
      );
    } else if (typeof parameters.orTermsProperty === "string") {
      this.orTermsProperty = purify.Maybe.of(
        dataFactory.literal(parameters.orTermsProperty),
      );
    } else if (typeof parameters.orTermsProperty === "object") {
      this.orTermsProperty = purify.Maybe.of(parameters.orTermsProperty);
    } else if (typeof parameters.orTermsProperty === "undefined") {
      this.orTermsProperty = purify.Maybe.empty();
    } else {
      this.orTermsProperty = parameters.orTermsProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.orUnrelatedProperty)) {
      this.orUnrelatedProperty = parameters.orUnrelatedProperty;
    } else if (typeof parameters.orUnrelatedProperty === "object") {
      this.orUnrelatedProperty = purify.Maybe.of(
        parameters.orUnrelatedProperty,
      );
    } else if (typeof parameters.orUnrelatedProperty === "undefined") {
      this.orUnrelatedProperty = purify.Maybe.empty();
    } else {
      this.orUnrelatedProperty = parameters.orUnrelatedProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: UnionPropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.orLiteralsProperty,
          other.orLiteralsProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "orLiteralsProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.orTermsProperty,
          other.orTermsProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "orTermsProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(
            left,
            right,
            (
              left:
                | { type: "0-number"; value: number }
                | { type: "1-NonClassNodeShape"; value: NonClassNodeShape },
              right:
                | { type: "0-number"; value: number }
                | { type: "1-NonClassNodeShape"; value: NonClassNodeShape },
            ) => {
              if (left.type === "0-number" && right.type === "0-number") {
                return $strictEquals(left.value, right.value);
              }
              if (
                left.type === "1-NonClassNodeShape" &&
                right.type === "1-NonClassNodeShape"
              ) {
                return ((left, right) => left.equals(right))(
                  left.value,
                  right.value,
                );
              }

              return purify.Left({
                left,
                right,
                propertyName: "type",
                propertyValuesUnequal: {
                  left: typeof left,
                  right: typeof right,
                  type: "BooleanEquals" as const,
                },
                type: "Property" as const,
              });
            },
          ))(this.orUnrelatedProperty, other.orUnrelatedProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "orUnrelatedProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.orLiteralsProperty.ifJust((_value0) => {
      _hasher.update(_value0.datatype.value);
      _hasher.update(_value0.language);
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.orTermsProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.orUnrelatedProperty.ifJust((_value0) => {
      switch (_value0.type) {
        case "0-number": {
          _hasher.update(_value0.value.toString());
          break;
        }
        case "1-NonClassNodeShape": {
          _value0.value.hash(_hasher);
          break;
        }
      }
    });
    return _hasher;
  }

  toJson(): UnionPropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        orLiteralsProperty: this.orLiteralsProperty
          .map((_item) => ({
            "@language": _item.language.length > 0 ? _item.language : undefined,
            "@type":
              _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
                ? _item.datatype.value
                : undefined,
            "@value": _item.value,
          }))
          .extract(),
        orTermsProperty: this.orTermsProperty
          .map((_item) =>
            _item.termType === "NamedNode"
              ? { "@id": _item.value, termType: "NamedNode" as const }
              : {
                  "@language":
                    _item.language.length > 0 ? _item.language : undefined,
                  "@type":
                    _item.datatype.value !==
                    "http://www.w3.org/2001/XMLSchema#string"
                      ? _item.datatype.value
                      : undefined,
                  "@value": _item.value,
                  termType: "Literal" as const,
                },
          )
          .extract(),
        orUnrelatedProperty: this.orUnrelatedProperty
          .map((_item) =>
            _item.type === "1-NonClassNodeShape"
              ? {
                  type: "1-NonClassNodeShape" as const,
                  value: _item.value.toJson(),
                }
              : { type: "0-number" as const, value: _item.value },
          )
          .extract(),
      } satisfies UnionPropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/orLiteralsProperty"),
      this.orLiteralsProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/orTermsProperty"),
      this.orTermsProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/orUnrelatedProperty"),
      this.orUnrelatedProperty.map((_value) =>
        _value.type === "1-NonClassNodeShape"
          ? _value.value.toRdf({
              mutateGraph: mutateGraph,
              resourceSet: resourceSet,
            })
          : _value.value,
      ),
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace UnionPropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "UnionPropertiesNodeShape";
    readonly orLiteralsProperty:
      | {
          readonly "@language": string | undefined;
          readonly "@type": string | undefined;
          readonly "@value": string;
        }
      | undefined;
    readonly orTermsProperty:
      | (
          | { readonly "@id": string; readonly termType: "NamedNode" }
          | {
              readonly "@language": string | undefined;
              readonly "@type": string | undefined;
              readonly "@value": string;
              readonly termType: "Literal";
            }
        )
      | undefined;
    readonly orUnrelatedProperty:
      | (
          | { type: "0-number"; value: number }
          | { type: "1-NonClassNodeShape"; value: NonClassNodeShape.Json }
        )
      | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      orLiteralsProperty: purify.Maybe<rdfjs.Literal>;
      orTermsProperty: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
      orUnrelatedProperty: purify.Maybe<
        | { type: "0-number"; value: number }
        | { type: "1-NonClassNodeShape"; value: NonClassNodeShape }
      >;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const orLiteralsProperty = purify.Maybe.fromNullable(
      _jsonObject["orLiteralsProperty"],
    ).map((_item) =>
      dataFactory.literal(
        _item["@value"],
        typeof _item["@language"] !== "undefined"
          ? _item["@language"]
          : typeof _item["@type"] !== "undefined"
            ? dataFactory.namedNode(_item["@type"])
            : undefined,
      ),
    );
    const orTermsProperty = purify.Maybe.fromNullable(
      _jsonObject["orTermsProperty"],
    ).map((_item) =>
      _item.termType === "NamedNode"
        ? dataFactory.namedNode(_item["@id"])
        : dataFactory.literal(
            _item["@value"],
            typeof _item["@language"] !== "undefined"
              ? _item["@language"]
              : typeof _item["@type"] !== "undefined"
                ? dataFactory.namedNode(_item["@type"])
                : undefined,
          ),
    );
    const orUnrelatedProperty = purify.Maybe.fromNullable(
      _jsonObject["orUnrelatedProperty"],
    ).map((_item) =>
      _item.type === "1-NonClassNodeShape"
        ? {
            type: "1-NonClassNodeShape" as const,
            value: NonClassNodeShape.fromJson(_item.value).unsafeCoerce(),
          }
        : { type: "0-number" as const, value: _item.value },
    );
    return purify.Either.of({
      identifier,
      orLiteralsProperty,
      orTermsProperty,
      orUnrelatedProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, UnionPropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new UnionPropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "UnionPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/orLiteralsProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/orTermsProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/orUnrelatedProperty`,
          type: "Control",
        },
      ],
      label: "UnionPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("UnionPropertiesNodeShape"),
      orLiteralsProperty: zod
        .object({
          "@language": zod.string().optional(),
          "@type": zod.string().optional(),
          "@value": zod.string(),
        })
        .optional(),
      orTermsProperty: zod
        .discriminatedUnion("termType", [
          zod.object({
            "@language": zod.string().optional(),
            "@type": zod.string().optional(),
            "@value": zod.string(),
            termType: zod.literal("Literal"),
          }),
          zod.object({
            "@id": zod.string().min(1),
            termType: zod.literal("NamedNode"),
          }),
        ])
        .optional(),
      orUnrelatedProperty: zod
        .discriminatedUnion("type", [
          zod.object({ type: zod.literal("0-number"), value: zod.number() }),
          zod.object({
            type: zod.literal("1-NonClassNodeShape"),
            value: NonClassNodeShape.jsonZodSchema(),
          }),
        ])
        .optional(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      orLiteralsProperty: purify.Maybe<rdfjs.Literal>;
      orTermsProperty: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
      orUnrelatedProperty: purify.Maybe<
        | { type: "0-number"; value: number }
        | { type: "1-NonClassNodeShape"; value: NonClassNodeShape }
      >;
    }
  > {
    const identifier = _resource.identifier;
    const _orLiteralsPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/orLiteralsProperty"),
          { unique: true },
        )
        .filter((_value) => {
          const _languageInOrDefault = _languageIn ?? [];
          if (_languageInOrDefault.length === 0) {
            return true;
          }
          const _valueLiteral = _value.toLiteral().toMaybe().extract();
          if (typeof _valueLiteral === "undefined") {
            return false;
          }
          return _languageInOrDefault.some(
            (_languageIn) => _languageIn === _valueLiteral.language,
          );
        })
        .head()
        .chain((_value) => _value.toLiteral())
        .toMaybe(),
    );
    if (_orLiteralsPropertyEither.isLeft()) {
      return _orLiteralsPropertyEither;
    }

    const orLiteralsProperty = _orLiteralsPropertyEither.unsafeCoerce();
    const _orTermsPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/orTermsProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) =>
          purify.Either.of(_value.toTerm()).chain((term) => {
            switch (term.termType) {
              case "Literal":
              case "NamedNode":
                return purify.Either.of(term);
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: term,
                    expectedValueType: "(rdfjs.Literal | rdfjs.NamedNode)",
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://example.com/orTermsProperty",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_orTermsPropertyEither.isLeft()) {
      return _orTermsPropertyEither;
    }

    const orTermsProperty = _orTermsPropertyEither.unsafeCoerce();
    const _orUnrelatedPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<
        | { type: "0-number"; value: number }
        | { type: "1-NonClassNodeShape"; value: NonClassNodeShape }
      >
    > = purify.Either.of(
      (
        _resource
          .values(
            dataFactory.namedNode("http://example.com/orUnrelatedProperty"),
            { unique: true },
          )
          .head()
          .chain((_value) => _value.toNumber())
          .map(
            (value) =>
              ({ type: "0-number" as const, value }) as
                | { type: "0-number"; value: number }
                | { type: "1-NonClassNodeShape"; value: NonClassNodeShape },
          ) as purify.Either<
          rdfjsResource.Resource.ValueError,
          | { type: "0-number"; value: number }
          | { type: "1-NonClassNodeShape"; value: NonClassNodeShape }
        >
      )
        .altLazy(
          () =>
            _resource
              .values(
                dataFactory.namedNode("http://example.com/orUnrelatedProperty"),
                { unique: true },
              )
              .head()
              .chain((value) => value.toResource())
              .chain((_resource) =>
                NonClassNodeShape.fromRdf({
                  ..._context,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .map(
                (value) =>
                  ({ type: "1-NonClassNodeShape" as const, value }) as
                    | { type: "0-number"; value: number }
                    | { type: "1-NonClassNodeShape"; value: NonClassNodeShape },
              ) as purify.Either<
              rdfjsResource.Resource.ValueError,
              | { type: "0-number"; value: number }
              | { type: "1-NonClassNodeShape"; value: NonClassNodeShape }
            >,
        )
        .toMaybe(),
    );
    if (_orUnrelatedPropertyEither.isLeft()) {
      return _orUnrelatedPropertyEither;
    }

    const orUnrelatedProperty = _orUnrelatedPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      orLiteralsProperty,
      orTermsProperty,
      orUnrelatedProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof UnionPropertiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    UnionPropertiesNodeShape
  > {
    return UnionPropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new UnionPropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        UnionPropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        UnionPropertiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      UnionPropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("unionPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "unionPropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}OrLiteralsProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/orLiteralsProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}OrTermsProperty`),
        predicate: dataFactory.namedNode("http://example.com/orTermsProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}OrUnrelatedProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/orUnrelatedProperty",
        ),
        subject,
      },
      ...NonClassNodeShape.sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(`${variablePrefix}OrUnrelatedProperty`),
        variablePrefix: `${variablePrefix}OrUnrelatedProperty`,
      }),
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("unionPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "unionPropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}OrLiteralsProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/orLiteralsProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}OrTermsProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/orTermsProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}OrUnrelatedProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/orUnrelatedProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
          {
            patterns: [
              { patterns: [], type: "group" },
              {
                patterns: [
                  ...NonClassNodeShape.sparqlWherePatterns({
                    ignoreRdfType: true,
                    subject: dataFactory.variable!(
                      `${variablePrefix}OrUnrelatedProperty`,
                    ),
                    variablePrefix: `${variablePrefix}OrUnrelatedProperty`,
                  }),
                ],
                type: "group",
              },
            ],
            type: "union",
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
export class UnionNodeShapeMember2 {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "UnionNodeShapeMember2";
  readonly stringProperty2: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty2: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.stringProperty2 = parameters.stringProperty2;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: UnionNodeShapeMember2): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty2, other.stringProperty2).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty2",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.stringProperty2);
    return _hasher;
  }

  toJson(): UnionNodeShapeMember2.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        stringProperty2: this.stringProperty2,
      } satisfies UnionNodeShapeMember2.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty2"),
      this.stringProperty2,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace UnionNodeShapeMember2 {
  export type Json = {
    readonly "@id": string;
    readonly type: "UnionNodeShapeMember2";
    readonly stringProperty2: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty2: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty2 = _jsonObject["stringProperty2"];
    return purify.Either.of({ identifier, stringProperty2 });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, UnionNodeShapeMember2> {
    return propertiesFromJson(json).map(
      (properties) => new UnionNodeShapeMember2(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "UnionNodeShapeMember2" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty2`, type: "Control" },
      ],
      label: "UnionNodeShapeMember2",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("UnionNodeShapeMember2"),
      stringProperty2: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty2: string }
  > {
    const identifier = _resource.identifier;
    const _stringProperty2Either: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty2"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringProperty2Either.isLeft()) {
      return _stringProperty2Either;
    }

    const stringProperty2 = _stringProperty2Either.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty2 });
  }

  export function fromRdf(
    parameters: Parameters<typeof UnionNodeShapeMember2.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, UnionNodeShapeMember2> {
    return UnionNodeShapeMember2.propertiesFromRdf(parameters).map(
      (properties) => new UnionNodeShapeMember2(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        UnionNodeShapeMember2.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        UnionNodeShapeMember2.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      UnionNodeShapeMember2.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("unionNodeShapeMember2");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "unionNodeShapeMember2");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty2`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty2"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("unionNodeShapeMember2");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "unionNodeShapeMember2");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty2`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty2",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
export class UnionNodeShapeMember1 {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "UnionNodeShapeMember1";
  readonly stringProperty1: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty1: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.stringProperty1 = parameters.stringProperty1;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: UnionNodeShapeMember1): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty1, other.stringProperty1).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty1",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.stringProperty1);
    return _hasher;
  }

  toJson(): UnionNodeShapeMember1.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        stringProperty1: this.stringProperty1,
      } satisfies UnionNodeShapeMember1.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty1"),
      this.stringProperty1,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace UnionNodeShapeMember1 {
  export type Json = {
    readonly "@id": string;
    readonly type: "UnionNodeShapeMember1";
    readonly stringProperty1: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty1: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty1 = _jsonObject["stringProperty1"];
    return purify.Either.of({ identifier, stringProperty1 });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, UnionNodeShapeMember1> {
    return propertiesFromJson(json).map(
      (properties) => new UnionNodeShapeMember1(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "UnionNodeShapeMember1" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty1`, type: "Control" },
      ],
      label: "UnionNodeShapeMember1",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("UnionNodeShapeMember1"),
      stringProperty1: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty1: string }
  > {
    const identifier = _resource.identifier;
    const _stringProperty1Either: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty1"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringProperty1Either.isLeft()) {
      return _stringProperty1Either;
    }

    const stringProperty1 = _stringProperty1Either.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty1 });
  }

  export function fromRdf(
    parameters: Parameters<typeof UnionNodeShapeMember1.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, UnionNodeShapeMember1> {
    return UnionNodeShapeMember1.propertiesFromRdf(parameters).map(
      (properties) => new UnionNodeShapeMember1(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        UnionNodeShapeMember1.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        UnionNodeShapeMember1.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      UnionNodeShapeMember1.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("unionNodeShapeMember1");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "unionNodeShapeMember1");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty1`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty1"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("unionNodeShapeMember1");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "unionNodeShapeMember1");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty1`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty1",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape with properties that are not nested objects
 */
export class TermPropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "TermPropertiesNodeShape";
  readonly booleanProperty: purify.Maybe<boolean>;
  readonly dateProperty: purify.Maybe<Date>;
  readonly dateTimeProperty: purify.Maybe<Date>;
  readonly iriProperty: purify.Maybe<rdfjs.NamedNode>;
  readonly literalProperty: purify.Maybe<rdfjs.Literal>;
  readonly numberProperty: purify.Maybe<number>;
  readonly stringProperty: purify.Maybe<string>;
  readonly termProperty: purify.Maybe<
    rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal
  >;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly booleanProperty?: boolean | purify.Maybe<boolean>;
    readonly dateProperty?: Date | purify.Maybe<Date>;
    readonly dateTimeProperty?: Date | purify.Maybe<Date>;
    readonly iriProperty?:
      | rdfjs.NamedNode
      | purify.Maybe<rdfjs.NamedNode>
      | string;
    readonly literalProperty?:
      | rdfjs.Literal
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal>
      | string;
    readonly numberProperty?: number | purify.Maybe<number>;
    readonly stringProperty?: purify.Maybe<string> | string;
    readonly termProperty?:
      | (rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal)
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal>
      | string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    if (purify.Maybe.isMaybe(parameters.booleanProperty)) {
      this.booleanProperty = parameters.booleanProperty;
    } else if (typeof parameters.booleanProperty === "boolean") {
      this.booleanProperty = purify.Maybe.of(parameters.booleanProperty);
    } else if (typeof parameters.booleanProperty === "undefined") {
      this.booleanProperty = purify.Maybe.empty();
    } else {
      this.booleanProperty = parameters.booleanProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.dateProperty)) {
      this.dateProperty = parameters.dateProperty;
    } else if (
      typeof parameters.dateProperty === "object" &&
      parameters.dateProperty instanceof Date
    ) {
      this.dateProperty = purify.Maybe.of(parameters.dateProperty);
    } else if (typeof parameters.dateProperty === "undefined") {
      this.dateProperty = purify.Maybe.empty();
    } else {
      this.dateProperty = parameters.dateProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.dateTimeProperty)) {
      this.dateTimeProperty = parameters.dateTimeProperty;
    } else if (
      typeof parameters.dateTimeProperty === "object" &&
      parameters.dateTimeProperty instanceof Date
    ) {
      this.dateTimeProperty = purify.Maybe.of(parameters.dateTimeProperty);
    } else if (typeof parameters.dateTimeProperty === "undefined") {
      this.dateTimeProperty = purify.Maybe.empty();
    } else {
      this.dateTimeProperty = parameters.dateTimeProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.iriProperty)) {
      this.iriProperty = parameters.iriProperty;
    } else if (typeof parameters.iriProperty === "object") {
      this.iriProperty = purify.Maybe.of(parameters.iriProperty);
    } else if (typeof parameters.iriProperty === "string") {
      this.iriProperty = purify.Maybe.of(
        dataFactory.namedNode(parameters.iriProperty),
      );
    } else if (typeof parameters.iriProperty === "undefined") {
      this.iriProperty = purify.Maybe.empty();
    } else {
      this.iriProperty = parameters.iriProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.literalProperty)) {
      this.literalProperty = parameters.literalProperty;
    } else if (typeof parameters.literalProperty === "boolean") {
      this.literalProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.literalProperty === "object" &&
      parameters.literalProperty instanceof Date
    ) {
      this.literalProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalProperty, { dataFactory }),
      );
    } else if (typeof parameters.literalProperty === "number") {
      this.literalProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalProperty, { dataFactory }),
      );
    } else if (typeof parameters.literalProperty === "string") {
      this.literalProperty = purify.Maybe.of(
        dataFactory.literal(parameters.literalProperty),
      );
    } else if (typeof parameters.literalProperty === "object") {
      this.literalProperty = purify.Maybe.of(parameters.literalProperty);
    } else if (typeof parameters.literalProperty === "undefined") {
      this.literalProperty = purify.Maybe.empty();
    } else {
      this.literalProperty = parameters.literalProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.numberProperty)) {
      this.numberProperty = parameters.numberProperty;
    } else if (typeof parameters.numberProperty === "number") {
      this.numberProperty = purify.Maybe.of(parameters.numberProperty);
    } else if (typeof parameters.numberProperty === "undefined") {
      this.numberProperty = purify.Maybe.empty();
    } else {
      this.numberProperty = parameters.numberProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.stringProperty)) {
      this.stringProperty = parameters.stringProperty;
    } else if (typeof parameters.stringProperty === "string") {
      this.stringProperty = purify.Maybe.of(parameters.stringProperty);
    } else if (typeof parameters.stringProperty === "undefined") {
      this.stringProperty = purify.Maybe.empty();
    } else {
      this.stringProperty = parameters.stringProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.termProperty)) {
      this.termProperty = parameters.termProperty;
    } else if (typeof parameters.termProperty === "boolean") {
      this.termProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.termProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.termProperty === "object" &&
      parameters.termProperty instanceof Date
    ) {
      this.termProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.termProperty, { dataFactory }),
      );
    } else if (typeof parameters.termProperty === "number") {
      this.termProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.termProperty, { dataFactory }),
      );
    } else if (typeof parameters.termProperty === "string") {
      this.termProperty = purify.Maybe.of(
        dataFactory.literal(parameters.termProperty),
      );
    } else if (typeof parameters.termProperty === "object") {
      this.termProperty = purify.Maybe.of(parameters.termProperty);
    } else if (typeof parameters.termProperty === "undefined") {
      this.termProperty = purify.Maybe.empty();
    } else {
      this.termProperty = parameters.termProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: TermPropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.booleanProperty,
          other.booleanProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "booleanProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $dateEquals))(
          this.dateProperty,
          other.dateProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "dateProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $dateEquals))(
          this.dateTimeProperty,
          other.dateTimeProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "dateTimeProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.iriProperty,
          other.iriProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "iriProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.literalProperty,
          other.literalProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "literalProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.numberProperty,
          other.numberProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "numberProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.stringProperty,
          other.stringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "stringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.termProperty,
          other.termProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "termProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.booleanProperty.ifJust((_value0) => {
      _hasher.update(_value0.toString());
    });
    this.dateProperty.ifJust((_value0) => {
      _hasher.update(_value0.toISOString());
    });
    this.dateTimeProperty.ifJust((_value0) => {
      _hasher.update(_value0.toISOString());
    });
    this.iriProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.literalProperty.ifJust((_value0) => {
      _hasher.update(_value0.datatype.value);
      _hasher.update(_value0.language);
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.numberProperty.ifJust((_value0) => {
      _hasher.update(_value0.toString());
    });
    this.stringProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    this.termProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    return _hasher;
  }

  toJson(): TermPropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        booleanProperty: this.booleanProperty.map((_item) => _item).extract(),
        dateProperty: this.dateProperty
          .map((_item) => _item.toISOString().replace(/T.*$/, ""))
          .extract(),
        dateTimeProperty: this.dateTimeProperty
          .map((_item) => _item.toISOString())
          .extract(),
        iriProperty: this.iriProperty
          .map((_item) => ({ "@id": _item.value }))
          .extract(),
        literalProperty: this.literalProperty
          .map((_item) => ({
            "@language": _item.language.length > 0 ? _item.language : undefined,
            "@type":
              _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
                ? _item.datatype.value
                : undefined,
            "@value": _item.value,
          }))
          .extract(),
        numberProperty: this.numberProperty.map((_item) => _item).extract(),
        stringProperty: this.stringProperty.map((_item) => _item).extract(),
        termProperty: this.termProperty
          .map((_item) =>
            _item.termType === "Literal"
              ? {
                  "@language":
                    _item.language.length > 0 ? _item.language : undefined,
                  "@type":
                    _item.datatype.value !==
                    "http://www.w3.org/2001/XMLSchema#string"
                      ? _item.datatype.value
                      : undefined,
                  "@value": _item.value,
                  termType: "Literal" as const,
                }
              : _item.termType === "NamedNode"
                ? { "@id": _item.value, termType: "NamedNode" as const }
                : { "@id": `_:${_item.value}`, termType: "BlankNode" as const },
          )
          .extract(),
      } satisfies TermPropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/booleanProperty"),
      this.booleanProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/dateProperty"),
      this.dateProperty.map((_value) =>
        rdfLiteral.toRdf(_value, {
          dataFactory,
          datatype: dataFactory.namedNode(
            "http://www.w3.org/2001/XMLSchema#date",
          ),
        }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/dateTimeProperty"),
      this.dateTimeProperty.map((_value) =>
        rdfLiteral.toRdf(_value, {
          dataFactory,
          datatype: dataFactory.namedNode(
            "http://www.w3.org/2001/XMLSchema#dateTime",
          ),
        }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/iriProperty"),
      this.iriProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/literalProperty"),
      this.literalProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/numberProperty"),
      this.numberProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/termProperty"),
      this.termProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace TermPropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "TermPropertiesNodeShape";
    readonly booleanProperty: boolean | undefined;
    readonly dateProperty: string | undefined;
    readonly dateTimeProperty: string | undefined;
    readonly iriProperty: { readonly "@id": string } | undefined;
    readonly literalProperty:
      | {
          readonly "@language": string | undefined;
          readonly "@type": string | undefined;
          readonly "@value": string;
        }
      | undefined;
    readonly numberProperty: number | undefined;
    readonly stringProperty: string | undefined;
    readonly termProperty:
      | (
          | {
              readonly "@id": string;
              readonly termType: "BlankNode" | "NamedNode";
            }
          | {
              readonly "@language": string | undefined;
              readonly "@type": string | undefined;
              readonly "@value": string;
              readonly termType: "Literal";
            }
        )
      | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      booleanProperty: purify.Maybe<boolean>;
      dateProperty: purify.Maybe<Date>;
      dateTimeProperty: purify.Maybe<Date>;
      iriProperty: purify.Maybe<rdfjs.NamedNode>;
      literalProperty: purify.Maybe<rdfjs.Literal>;
      numberProperty: purify.Maybe<number>;
      stringProperty: purify.Maybe<string>;
      termProperty: purify.Maybe<
        rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal
      >;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const booleanProperty = purify.Maybe.fromNullable(
      _jsonObject["booleanProperty"],
    );
    const dateProperty = purify.Maybe.fromNullable(
      _jsonObject["dateProperty"],
    ).map((_item) => new Date(_item));
    const dateTimeProperty = purify.Maybe.fromNullable(
      _jsonObject["dateTimeProperty"],
    ).map((_item) => new Date(_item));
    const iriProperty = purify.Maybe.fromNullable(
      _jsonObject["iriProperty"],
    ).map((_item) => dataFactory.namedNode(_item["@id"]));
    const literalProperty = purify.Maybe.fromNullable(
      _jsonObject["literalProperty"],
    ).map((_item) =>
      dataFactory.literal(
        _item["@value"],
        typeof _item["@language"] !== "undefined"
          ? _item["@language"]
          : typeof _item["@type"] !== "undefined"
            ? dataFactory.namedNode(_item["@type"])
            : undefined,
      ),
    );
    const numberProperty = purify.Maybe.fromNullable(
      _jsonObject["numberProperty"],
    );
    const stringProperty = purify.Maybe.fromNullable(
      _jsonObject["stringProperty"],
    );
    const termProperty = purify.Maybe.fromNullable(
      _jsonObject["termProperty"],
    ).map((_item) =>
      _item.termType === "Literal"
        ? dataFactory.literal(
            _item["@value"],
            typeof _item["@language"] !== "undefined"
              ? _item["@language"]
              : typeof _item["@type"] !== "undefined"
                ? dataFactory.namedNode(_item["@type"])
                : undefined,
          )
        : _item.termType === "NamedNode"
          ? dataFactory.namedNode(_item["@id"])
          : dataFactory.blankNode(_item["@id"].substring(2)),
    );
    return purify.Either.of({
      identifier,
      booleanProperty,
      dateProperty,
      dateTimeProperty,
      iriProperty,
      literalProperty,
      numberProperty,
      stringProperty,
      termProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, TermPropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new TermPropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "TermPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/booleanProperty`, type: "Control" },
        { scope: `${scopePrefix}/properties/dateProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/dateTimeProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/iriProperty`, type: "Control" },
        { scope: `${scopePrefix}/properties/literalProperty`, type: "Control" },
        { scope: `${scopePrefix}/properties/numberProperty`, type: "Control" },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
        { scope: `${scopePrefix}/properties/termProperty`, type: "Control" },
      ],
      label: "TermPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("TermPropertiesNodeShape"),
      booleanProperty: zod.boolean().optional(),
      dateProperty: zod.string().date().optional(),
      dateTimeProperty: zod.string().datetime().optional(),
      iriProperty: zod.object({ "@id": zod.string().min(1) }).optional(),
      literalProperty: zod
        .object({
          "@language": zod.string().optional(),
          "@type": zod.string().optional(),
          "@value": zod.string(),
        })
        .optional(),
      numberProperty: zod.number().optional(),
      stringProperty: zod.string().optional(),
      termProperty: zod
        .discriminatedUnion("termType", [
          zod.object({
            "@id": zod.string().min(1),
            termType: zod.literal("BlankNode"),
          }),
          zod.object({
            "@id": zod.string().min(1),
            termType: zod.literal("NamedNode"),
          }),
          zod.object({
            "@language": zod.string().optional(),
            "@type": zod.string().optional(),
            "@value": zod.string(),
            termType: zod.literal("Literal"),
          }),
        ])
        .optional(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      booleanProperty: purify.Maybe<boolean>;
      dateProperty: purify.Maybe<Date>;
      dateTimeProperty: purify.Maybe<Date>;
      iriProperty: purify.Maybe<rdfjs.NamedNode>;
      literalProperty: purify.Maybe<rdfjs.Literal>;
      numberProperty: purify.Maybe<number>;
      stringProperty: purify.Maybe<string>;
      termProperty: purify.Maybe<
        rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal
      >;
    }
  > {
    const identifier = _resource.identifier;
    const _booleanPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/booleanProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_booleanPropertyEither.isLeft()) {
      return _booleanPropertyEither;
    }

    const booleanProperty = _booleanPropertyEither.unsafeCoerce();
    const _datePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<Date>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/dateProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toDate())
        .toMaybe(),
    );
    if (_datePropertyEither.isLeft()) {
      return _datePropertyEither;
    }

    const dateProperty = _datePropertyEither.unsafeCoerce();
    const _dateTimePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<Date>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/dateTimeProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toDate())
        .toMaybe(),
    );
    if (_dateTimePropertyEither.isLeft()) {
      return _dateTimePropertyEither;
    }

    const dateTimeProperty = _dateTimePropertyEither.unsafeCoerce();
    const _iriPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/iriProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toIri())
        .toMaybe(),
    );
    if (_iriPropertyEither.isLeft()) {
      return _iriPropertyEither;
    }

    const iriProperty = _iriPropertyEither.unsafeCoerce();
    const _literalPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/literalProperty"), {
          unique: true,
        })
        .filter((_value) => {
          const _languageInOrDefault = _languageIn ?? [];
          if (_languageInOrDefault.length === 0) {
            return true;
          }
          const _valueLiteral = _value.toLiteral().toMaybe().extract();
          if (typeof _valueLiteral === "undefined") {
            return false;
          }
          return _languageInOrDefault.some(
            (_languageIn) => _languageIn === _valueLiteral.language,
          );
        })
        .head()
        .chain((_value) => _value.toLiteral())
        .toMaybe(),
    );
    if (_literalPropertyEither.isLeft()) {
      return _literalPropertyEither;
    }

    const literalProperty = _literalPropertyEither.unsafeCoerce();
    const _numberPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/numberProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toNumber())
        .toMaybe(),
    );
    if (_numberPropertyEither.isLeft()) {
      return _numberPropertyEither;
    }

    const numberProperty = _numberPropertyEither.unsafeCoerce();
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/stringProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    const _termPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/termProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => purify.Either.of(_value.toTerm()))
        .toMaybe(),
    );
    if (_termPropertyEither.isLeft()) {
      return _termPropertyEither;
    }

    const termProperty = _termPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      booleanProperty,
      dateProperty,
      dateTimeProperty,
      iriProperty,
      literalProperty,
      numberProperty,
      stringProperty,
      termProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof TermPropertiesNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, TermPropertiesNodeShape> {
    return TermPropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new TermPropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        TermPropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        TermPropertiesNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      TermPropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("termPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "termPropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}BooleanProperty`),
        predicate: dataFactory.namedNode("http://example.com/booleanProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}DateProperty`),
        predicate: dataFactory.namedNode("http://example.com/dateProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}DateTimeProperty`),
        predicate: dataFactory.namedNode("http://example.com/dateTimeProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}IriProperty`),
        predicate: dataFactory.namedNode("http://example.com/iriProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}LiteralProperty`),
        predicate: dataFactory.namedNode("http://example.com/literalProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}NumberProperty`),
        predicate: dataFactory.namedNode("http://example.com/numberProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}TermProperty`),
        predicate: dataFactory.namedNode("http://example.com/termProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("termPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "termPropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}BooleanProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/booleanProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(`${variablePrefix}DateProperty`),
                predicate: dataFactory.namedNode(
                  "http://example.com/dateProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}DateTimeProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/dateTimeProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(`${variablePrefix}IriProperty`),
                predicate: dataFactory.namedNode(
                  "http://example.com/iriProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}LiteralProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/literalProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}NumberProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/numberProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}StringProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/stringProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(`${variablePrefix}TermProperty`),
                predicate: dataFactory.namedNode(
                  "http://example.com/termProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * A node shape that mints its identifier by hashing (other) contents, if no identifier is supplied.
 */
export class Sha256IriNodeShape {
  private _identifier: rdfjs.NamedNode | undefined;
  protected readonly _identifierPrefix?: string;
  readonly type = "Sha256IriNodeShape";
  readonly stringProperty: string;

  constructor(parameters: {
    readonly identifier?: rdfjs.NamedNode | string;
    readonly identifierPrefix?: string;
    readonly stringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this._identifierPrefix = parameters.identifierPrefix;
    this.stringProperty = parameters.stringProperty;
  }

  get identifier(): rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.namedNode(
        `${this.identifierPrefix}${this.hashShaclProperties(sha256.create())}`,
      );
    }
    return this._identifier;
  }

  protected get identifierPrefix(): string {
    return typeof this._identifierPrefix !== "undefined"
      ? this._identifierPrefix
      : `urn:shaclmate:${this.type}:`;
  }

  equals(other: Sha256IriNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.identifierPrefix, other.identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty, other.stringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.stringProperty);
    return _hasher;
  }

  toJson(): Sha256IriNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.identifier.value,
        type: this.type,
        stringProperty: this.stringProperty,
      } satisfies Sha256IriNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace Sha256IriNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "Sha256IriNodeShape";
    readonly stringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.NamedNode; stringProperty: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty = _jsonObject["stringProperty"];
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, Sha256IriNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new Sha256IriNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "Sha256IriNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
      ],
      label: "Sha256IriNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("Sha256IriNodeShape"),
      stringProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.NamedNode; stringProperty: string }
  > {
    const identifier = _resource.identifier;
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromRdf(
    parameters: Parameters<typeof Sha256IriNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, Sha256IriNodeShape> {
    return Sha256IriNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new Sha256IriNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        Sha256IriNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        Sha256IriNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      Sha256IriNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("sha256IriNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "sha256IriNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("sha256IriNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "sha256IriNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape with properties that have visibility modifiers (private, protected, public)
 */
export class PropertyVisibilitiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "PropertyVisibilitiesNodeShape";
  private readonly privateProperty: string;
  protected readonly protectedProperty: string;
  readonly publicProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly privateProperty: string;
    readonly protectedProperty: string;
    readonly publicProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.privateProperty = parameters.privateProperty;
    this.protectedProperty = parameters.protectedProperty;
    this.publicProperty = parameters.publicProperty;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: PropertyVisibilitiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.privateProperty, other.privateProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "privateProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.protectedProperty, other.protectedProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "protectedProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.publicProperty, other.publicProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "publicProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.privateProperty);
    _hasher.update(this.protectedProperty);
    _hasher.update(this.publicProperty);
    return _hasher;
  }

  toJson(): PropertyVisibilitiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        privateProperty: this.privateProperty,
        protectedProperty: this.protectedProperty,
        publicProperty: this.publicProperty,
      } satisfies PropertyVisibilitiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/privateProperty"),
      this.privateProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/protectedProperty"),
      this.protectedProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/publicProperty"),
      this.publicProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace PropertyVisibilitiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "PropertyVisibilitiesNodeShape";
    readonly privateProperty: string;
    readonly protectedProperty: string;
    readonly publicProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      privateProperty: string;
      protectedProperty: string;
      publicProperty: string;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const privateProperty = _jsonObject["privateProperty"];
    const protectedProperty = _jsonObject["protectedProperty"];
    const publicProperty = _jsonObject["publicProperty"];
    return purify.Either.of({
      identifier,
      privateProperty,
      protectedProperty,
      publicProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, PropertyVisibilitiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new PropertyVisibilitiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "PropertyVisibilitiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/privateProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/protectedProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/publicProperty`, type: "Control" },
      ],
      label: "PropertyVisibilitiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("PropertyVisibilitiesNodeShape"),
      privateProperty: zod.string(),
      protectedProperty: zod.string(),
      publicProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      privateProperty: string;
      protectedProperty: string;
      publicProperty: string;
    }
  > {
    const identifier = _resource.identifier;
    const _privatePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/privateProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_privatePropertyEither.isLeft()) {
      return _privatePropertyEither;
    }

    const privateProperty = _privatePropertyEither.unsafeCoerce();
    const _protectedPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/protectedProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_protectedPropertyEither.isLeft()) {
      return _protectedPropertyEither;
    }

    const protectedProperty = _protectedPropertyEither.unsafeCoerce();
    const _publicPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/publicProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_publicPropertyEither.isLeft()) {
      return _publicPropertyEither;
    }

    const publicProperty = _publicPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      privateProperty,
      protectedProperty,
      publicProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof PropertyVisibilitiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    PropertyVisibilitiesNodeShape
  > {
    return PropertyVisibilitiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new PropertyVisibilitiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        PropertyVisibilitiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        PropertyVisibilitiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      PropertyVisibilitiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("propertyVisibilitiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "propertyVisibilitiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}PrivateProperty`),
        predicate: dataFactory.namedNode("http://example.com/privateProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}ProtectedProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/protectedProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}PublicProperty`),
        predicate: dataFactory.namedNode("http://example.com/publicProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("propertyVisibilitiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "propertyVisibilitiesNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}PrivateProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/privateProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}ProtectedProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/protectedProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}PublicProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/publicProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape that has properties with different cardinalities
 */
export class PropertyCardinalitiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "PropertyCardinalitiesNodeShape";
  /**
   * Set: minCount implicitly=0, no maxCount or maxCount > 1
   */
  readonly emptyStringSetProperty: readonly string[];
  /**
   * Set: minCount implicitly=1, no maxCount or maxCount > 1
   */
  readonly nonEmptyStringSetProperty: purify.NonEmptyList<string>;
  /**
   * Option: maxCount=1 minCount=0
   */
  readonly optionalStringProperty: purify.Maybe<string>;
  /**
   * Required: maxCount=minCount=1
   */
  readonly requiredStringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly emptyStringSetProperty?: readonly string[];
    readonly nonEmptyStringSetProperty: purify.NonEmptyList<string>;
    readonly optionalStringProperty?: purify.Maybe<string> | string;
    readonly requiredStringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    if (typeof parameters.emptyStringSetProperty === "undefined") {
      this.emptyStringSetProperty = [];
    } else if (Array.isArray(parameters.emptyStringSetProperty)) {
      this.emptyStringSetProperty = parameters.emptyStringSetProperty;
    } else {
      this.emptyStringSetProperty = parameters.emptyStringSetProperty as never;
    }

    this.nonEmptyStringSetProperty = parameters.nonEmptyStringSetProperty;
    if (purify.Maybe.isMaybe(parameters.optionalStringProperty)) {
      this.optionalStringProperty = parameters.optionalStringProperty;
    } else if (typeof parameters.optionalStringProperty === "string") {
      this.optionalStringProperty = purify.Maybe.of(
        parameters.optionalStringProperty,
      );
    } else if (typeof parameters.optionalStringProperty === "undefined") {
      this.optionalStringProperty = purify.Maybe.empty();
    } else {
      this.optionalStringProperty = parameters.optionalStringProperty as never;
    }

    this.requiredStringProperty = parameters.requiredStringProperty;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: PropertyCardinalitiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $arrayEquals(left, right, $strictEquals))(
          this.emptyStringSetProperty,
          other.emptyStringSetProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "emptyStringSetProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $arrayEquals(left, right, $strictEquals))(
          this.nonEmptyStringSetProperty,
          other.nonEmptyStringSetProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "nonEmptyStringSetProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.optionalStringProperty,
          other.optionalStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "optionalStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        $strictEquals(
          this.requiredStringProperty,
          other.requiredStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "requiredStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    for (const _item0 of this.emptyStringSetProperty) {
      _hasher.update(_item0);
    }

    for (const _item0 of this.nonEmptyStringSetProperty) {
      _hasher.update(_item0);
    }

    this.optionalStringProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    _hasher.update(this.requiredStringProperty);
    return _hasher;
  }

  toJson(): PropertyCardinalitiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        emptyStringSetProperty: this.emptyStringSetProperty.map(
          (_item) => _item,
        ),
        nonEmptyStringSetProperty: this.nonEmptyStringSetProperty.map(
          (_item) => _item,
        ),
        optionalStringProperty: this.optionalStringProperty
          .map((_item) => _item)
          .extract(),
        requiredStringProperty: this.requiredStringProperty,
      } satisfies PropertyCardinalitiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/emptyStringSetProperty"),
      this.emptyStringSetProperty.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/nonEmptyStringSetProperty"),
      this.nonEmptyStringSetProperty.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/optionalStringProperty"),
      this.optionalStringProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/requiredStringProperty"),
      this.requiredStringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace PropertyCardinalitiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "PropertyCardinalitiesNodeShape";
    readonly emptyStringSetProperty: readonly string[];
    readonly nonEmptyStringSetProperty: readonly string[];
    readonly optionalStringProperty: string | undefined;
    readonly requiredStringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      emptyStringSetProperty: readonly string[];
      nonEmptyStringSetProperty: purify.NonEmptyList<string>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const emptyStringSetProperty = _jsonObject["emptyStringSetProperty"];
    const nonEmptyStringSetProperty = purify.NonEmptyList.fromArray(
      _jsonObject["nonEmptyStringSetProperty"],
    ).unsafeCoerce();
    const optionalStringProperty = purify.Maybe.fromNullable(
      _jsonObject["optionalStringProperty"],
    );
    const requiredStringProperty = _jsonObject["requiredStringProperty"];
    return purify.Either.of({
      identifier,
      emptyStringSetProperty,
      nonEmptyStringSetProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, PropertyCardinalitiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new PropertyCardinalitiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "PropertyCardinalitiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/emptyStringSetProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/nonEmptyStringSetProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/optionalStringProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/requiredStringProperty`,
          type: "Control",
        },
      ],
      label: "PropertyCardinalitiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("PropertyCardinalitiesNodeShape"),
      emptyStringSetProperty: zod
        .string()
        .array()
        .default(() => [])
        .describe("Set: minCount implicitly=0, no maxCount or maxCount > 1"),
      nonEmptyStringSetProperty: zod
        .string()
        .array()
        .nonempty()
        .min(1)
        .describe("Set: minCount implicitly=1, no maxCount or maxCount > 1"),
      optionalStringProperty: zod
        .string()
        .optional()
        .describe("Option: maxCount=1 minCount=0"),
      requiredStringProperty: zod
        .string()
        .describe("Required: maxCount=minCount=1"),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      emptyStringSetProperty: readonly string[];
      nonEmptyStringSetProperty: purify.NonEmptyList<string>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    }
  > {
    const identifier = _resource.identifier;
    const _emptyStringSetPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly string[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://example.com/emptyStringSetProperty"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_emptyStringSetPropertyEither.isLeft()) {
      return _emptyStringSetPropertyEither;
    }

    const emptyStringSetProperty = _emptyStringSetPropertyEither.unsafeCoerce();
    const _nonEmptyStringSetPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.NonEmptyList<string>
    > = purify.NonEmptyList.fromArray([
      ..._resource
        .values(
          dataFactory.namedNode("http://example.com/nonEmptyStringSetProperty"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]).toEither(
      new rdfjsResource.Resource.ValueError({
        focusResource: _resource,
        message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} is empty`,
        predicate: dataFactory.namedNode(
          "http://example.com/nonEmptyStringSetProperty",
        ),
      }),
    );
    if (_nonEmptyStringSetPropertyEither.isLeft()) {
      return _nonEmptyStringSetPropertyEither;
    }

    const nonEmptyStringSetProperty =
      _nonEmptyStringSetPropertyEither.unsafeCoerce();
    const _optionalStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/optionalStringProperty"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_optionalStringPropertyEither.isLeft()) {
      return _optionalStringPropertyEither;
    }

    const optionalStringProperty = _optionalStringPropertyEither.unsafeCoerce();
    const _requiredStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(
        dataFactory.namedNode("http://example.com/requiredStringProperty"),
        { unique: true },
      )
      .head()
      .chain((_value) => _value.toString());
    if (_requiredStringPropertyEither.isLeft()) {
      return _requiredStringPropertyEither;
    }

    const requiredStringProperty = _requiredStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      emptyStringSetProperty,
      nonEmptyStringSetProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof PropertyCardinalitiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    PropertyCardinalitiesNodeShape
  > {
    return PropertyCardinalitiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new PropertyCardinalitiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        PropertyCardinalitiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        PropertyCardinalitiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      PropertyCardinalitiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("propertyCardinalitiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "propertyCardinalitiesNodeShape");
    return [
      {
        object: dataFactory.variable!(
          `${variablePrefix}EmptyStringSetProperty`,
        ),
        predicate: dataFactory.namedNode(
          "http://example.com/emptyStringSetProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(
          `${variablePrefix}NonEmptyStringSetProperty`,
        ),
        predicate: dataFactory.namedNode(
          "http://example.com/nonEmptyStringSetProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(
          `${variablePrefix}OptionalStringProperty`,
        ),
        predicate: dataFactory.namedNode(
          "http://example.com/optionalStringProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(
          `${variablePrefix}RequiredStringProperty`,
        ),
        predicate: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("propertyCardinalitiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "propertyCardinalitiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}EmptyStringSetProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/emptyStringSetProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}NonEmptyStringSetProperty`,
            ),
            predicate: dataFactory.namedNode(
              "http://example.com/nonEmptyStringSetProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}OptionalStringProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/optionalStringProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}RequiredStringProperty`,
            ),
            predicate: dataFactory.namedNode(
              "http://example.com/requiredStringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape whose sh:properties have sh:order's. The compiler should order them C, A, B based on sh:order instead of on the declaration or lexicographic orders.
 */
export class OrderedPropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "OrderedPropertiesNodeShape";
  readonly propertyC: string;
  readonly propertyB: string;
  readonly propertyA: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly propertyC: string;
    readonly propertyB: string;
    readonly propertyA: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.propertyC = parameters.propertyC;
    this.propertyB = parameters.propertyB;
    this.propertyA = parameters.propertyA;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: OrderedPropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.propertyC, other.propertyC).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "propertyC",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.propertyB, other.propertyB).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "propertyB",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.propertyA, other.propertyA).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "propertyA",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.propertyC);
    _hasher.update(this.propertyB);
    _hasher.update(this.propertyA);
    return _hasher;
  }

  toJson(): OrderedPropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        propertyC: this.propertyC,
        propertyB: this.propertyB,
        propertyA: this.propertyA,
      } satisfies OrderedPropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/propertyC"),
      this.propertyC,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/propertyB"),
      this.propertyB,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/propertyA"),
      this.propertyA,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace OrderedPropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "OrderedPropertiesNodeShape";
    readonly propertyC: string;
    readonly propertyB: string;
    readonly propertyA: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      propertyC: string;
      propertyB: string;
      propertyA: string;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const propertyC = _jsonObject["propertyC"];
    const propertyB = _jsonObject["propertyB"];
    const propertyA = _jsonObject["propertyA"];
    return purify.Either.of({ identifier, propertyC, propertyB, propertyA });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, OrderedPropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new OrderedPropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "OrderedPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/propertyC`, type: "Control" },
        { scope: `${scopePrefix}/properties/propertyB`, type: "Control" },
        { scope: `${scopePrefix}/properties/propertyA`, type: "Control" },
      ],
      label: "OrderedPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("OrderedPropertiesNodeShape"),
      propertyC: zod.string(),
      propertyB: zod.string(),
      propertyA: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      propertyC: string;
      propertyB: string;
      propertyA: string;
    }
  > {
    const identifier = _resource.identifier;
    const _propertyCEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/propertyC"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_propertyCEither.isLeft()) {
      return _propertyCEither;
    }

    const propertyC = _propertyCEither.unsafeCoerce();
    const _propertyBEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/propertyB"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_propertyBEither.isLeft()) {
      return _propertyBEither;
    }

    const propertyB = _propertyBEither.unsafeCoerce();
    const _propertyAEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/propertyA"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_propertyAEither.isLeft()) {
      return _propertyAEither;
    }

    const propertyA = _propertyAEither.unsafeCoerce();
    return purify.Either.of({ identifier, propertyC, propertyB, propertyA });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof OrderedPropertiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    OrderedPropertiesNodeShape
  > {
    return OrderedPropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new OrderedPropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        OrderedPropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        OrderedPropertiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      OrderedPropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("orderedPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "orderedPropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}PropertyC`),
        predicate: dataFactory.namedNode("http://example.com/propertyC"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}PropertyB`),
        predicate: dataFactory.namedNode("http://example.com/propertyB"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}PropertyA`),
        predicate: dataFactory.namedNode("http://example.com/propertyA"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("orderedPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "orderedPropertiesNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}PropertyC`),
            predicate: dataFactory.namedNode("http://example.com/propertyC"),
            subject,
          },
        ],
        type: "bgp",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}PropertyB`),
            predicate: dataFactory.namedNode("http://example.com/propertyB"),
            subject,
          },
        ],
        type: "bgp",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}PropertyA`),
            predicate: dataFactory.namedNode("http://example.com/propertyA"),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Node shape that isn't an rdfs:Class.
 */
export class NonClassNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "NonClassNodeShape";
  readonly stringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.stringProperty = parameters.stringProperty;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: NonClassNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty, other.stringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.stringProperty);
    return _hasher;
  }

  toJson(): NonClassNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        stringProperty: this.stringProperty,
      } satisfies NonClassNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace NonClassNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "NonClassNodeShape";
    readonly stringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty = _jsonObject["stringProperty"];
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, NonClassNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new NonClassNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "NonClassNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
      ],
      label: "NonClassNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("NonClassNodeShape"),
      stringProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty: string }
  > {
    const identifier = _resource.identifier;
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromRdf(
    parameters: Parameters<typeof NonClassNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, NonClassNodeShape> {
    return NonClassNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new NonClassNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        NonClassNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        NonClassNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      NonClassNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("nonClassNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "nonClassNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("nonClassNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "nonClassNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape with shaclmate:mutable properties.
 */
export class MutablePropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  protected readonly _identifierPrefix?: string;
  readonly type = "MutablePropertiesNodeShape";
  /**
   * List-valued property that can't be reassigned but whose value can be mutated
   */
  readonly mutableListProperty: purify.Maybe<string[]>;
  /**
   * Set-valued property that can't be reassigned but whose value can be mutated
   */
  mutableSetProperty: string[];
  /**
   * String-valued property that can be re-assigned
   */
  mutableStringProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly identifierPrefix?: string;
    readonly mutableListProperty?: purify.Maybe<string[]> | string[];
    readonly mutableSetProperty?: readonly string[];
    readonly mutableStringProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this._identifierPrefix = parameters.identifierPrefix;
    if (purify.Maybe.isMaybe(parameters.mutableListProperty)) {
      this.mutableListProperty = parameters.mutableListProperty;
    } else if (Array.isArray(parameters.mutableListProperty)) {
      this.mutableListProperty = purify.Maybe.of(
        parameters.mutableListProperty,
      );
    } else if (typeof parameters.mutableListProperty === "undefined") {
      this.mutableListProperty = purify.Maybe.empty();
    } else {
      this.mutableListProperty = parameters.mutableListProperty as never;
    }

    if (typeof parameters.mutableSetProperty === "undefined") {
      this.mutableSetProperty = [];
    } else if (Array.isArray(parameters.mutableSetProperty)) {
      this.mutableSetProperty = parameters.mutableSetProperty;
    } else {
      this.mutableSetProperty = parameters.mutableSetProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.mutableStringProperty)) {
      this.mutableStringProperty = parameters.mutableStringProperty;
    } else if (typeof parameters.mutableStringProperty === "string") {
      this.mutableStringProperty = purify.Maybe.of(
        parameters.mutableStringProperty,
      );
    } else if (typeof parameters.mutableStringProperty === "undefined") {
      this.mutableStringProperty = purify.Maybe.empty();
    } else {
      this.mutableStringProperty = parameters.mutableStringProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    return typeof this._identifier !== "undefined"
      ? this._identifier
      : dataFactory.namedNode(
          `${this.identifierPrefix}${this.hashShaclProperties(sha256.create())}`,
        );
  }

  protected get identifierPrefix(): string {
    return typeof this._identifierPrefix !== "undefined"
      ? this._identifierPrefix
      : `urn:shaclmate:${this.type}:`;
  }

  equals(other: MutablePropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.identifierPrefix, other.identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(left, right, (left, right) =>
            $arrayEquals(left, right, $strictEquals),
          ))(this.mutableListProperty, other.mutableListProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "mutableListProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $arrayEquals(left, right, $strictEquals))(
          this.mutableSetProperty,
          other.mutableSetProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "mutableSetProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.mutableStringProperty,
          other.mutableStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "mutableStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.mutableListProperty.ifJust((_value0) => {
      for (const _element1 of _value0) {
        _hasher.update(_element1);
      }
    });
    for (const _item0 of this.mutableSetProperty) {
      _hasher.update(_item0);
    }

    this.mutableStringProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    return _hasher;
  }

  toJson(): MutablePropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        mutableListProperty: this.mutableListProperty
          .map((_item) => _item.map((_item) => _item))
          .extract(),
        mutableSetProperty: this.mutableSetProperty.map((_item) => _item),
        mutableStringProperty: this.mutableStringProperty
          .map((_item) => _item)
          .extract(),
      } satisfies MutablePropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/mutableListProperty"),
      this.mutableListProperty.map((_value) =>
        _value.length > 0
          ? _value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    { mutateGraph },
                  );
                  currentSubListResource!.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  dataFactory.namedNode(
                    "http://example.com/MutableStringListShape",
                  ),
                );

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
              },
            ).listResource.identifier
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/mutableSetProperty"),
      this.mutableSetProperty.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/mutableStringProperty"),
      this.mutableStringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace MutablePropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "MutablePropertiesNodeShape";
    readonly mutableListProperty: readonly string[] | undefined;
    readonly mutableSetProperty: readonly string[];
    readonly mutableStringProperty: string | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      mutableListProperty: purify.Maybe<string[]>;
      mutableSetProperty: string[];
      mutableStringProperty: purify.Maybe<string>;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const mutableListProperty = purify.Maybe.fromNullable(
      _jsonObject["mutableListProperty"],
    ).map((_item) => _item.map((_item) => _item));
    const mutableSetProperty = _jsonObject["mutableSetProperty"];
    const mutableStringProperty = purify.Maybe.fromNullable(
      _jsonObject["mutableStringProperty"],
    );
    return purify.Either.of({
      identifier,
      mutableListProperty,
      mutableSetProperty,
      mutableStringProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, MutablePropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new MutablePropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "MutablePropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/mutableListProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/mutableSetProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/mutableStringProperty`,
          type: "Control",
        },
      ],
      label: "MutablePropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("MutablePropertiesNodeShape"),
      mutableListProperty: zod
        .string()
        .array()
        .optional()
        .describe(
          "List-valued property that can't be reassigned but whose value can be mutated",
        ),
      mutableSetProperty: zod
        .string()
        .array()
        .default(() => [])
        .describe(
          "Set-valued property that can't be reassigned but whose value can be mutated",
        ),
      mutableStringProperty: zod
        .string()
        .optional()
        .describe("String-valued property that can be re-assigned"),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      mutableListProperty: purify.Maybe<string[]>;
      mutableSetProperty: string[];
      mutableStringProperty: purify.Maybe<string>;
    }
  > {
    const identifier = _resource.identifier;
    const _mutableListPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string[]>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/mutableListProperty"),
          { unique: true },
        )
        .head()
        .chain((value) => value.toList())
        .map((values) =>
          values.flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((_value) => _value.toString())
              .toMaybe()
              .toList(),
          ),
        )
        .toMaybe(),
    );
    if (_mutableListPropertyEither.isLeft()) {
      return _mutableListPropertyEither;
    }

    const mutableListProperty = _mutableListPropertyEither.unsafeCoerce();
    const _mutableSetPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://example.com/mutableSetProperty"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_mutableSetPropertyEither.isLeft()) {
      return _mutableSetPropertyEither;
    }

    const mutableSetProperty = _mutableSetPropertyEither.unsafeCoerce();
    const _mutableStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/mutableStringProperty"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_mutableStringPropertyEither.isLeft()) {
      return _mutableStringPropertyEither;
    }

    const mutableStringProperty = _mutableStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      mutableListProperty,
      mutableSetProperty,
      mutableStringProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof MutablePropertiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    MutablePropertiesNodeShape
  > {
    return MutablePropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new MutablePropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        MutablePropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        MutablePropertiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      MutablePropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("mutablePropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "mutablePropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}MutableListProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/mutableListProperty",
        ),
        subject,
      },
      {
        subject: dataFactory.variable!(`${variablePrefix}MutableListProperty`),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}MutableListProperty`}Item0`,
        ),
      },
      {
        subject: dataFactory.variable!(`${variablePrefix}MutableListProperty`),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}MutableListProperty`}Rest0`,
        ),
      },
      {
        subject: dataFactory.variable!(
          `${`${variablePrefix}MutableListProperty`}RestN`,
        ),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}MutableListProperty`}ItemN`,
        ),
      },
      {
        subject: dataFactory.variable!(
          `${`${variablePrefix}MutableListProperty`}RestN`,
        ),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}MutableListProperty`}RestNBasic`,
        ),
      },
      {
        object: dataFactory.variable!(`${variablePrefix}MutableSetProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/mutableSetProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}MutableStringProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/mutableStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("mutablePropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "mutablePropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}MutableListProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/mutableListProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
          {
            type: "optional",
            patterns: [
              {
                type: "bgp",
                triples: [
                  {
                    subject: dataFactory.variable!(
                      `${variablePrefix}MutableListProperty`,
                    ),
                    predicate: dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                    ),
                    object: dataFactory.variable!(
                      `${`${variablePrefix}MutableListProperty`}Item0`,
                    ),
                  },
                ],
              },
              {
                type: "bgp",
                triples: [
                  {
                    subject: dataFactory.variable!(
                      `${variablePrefix}MutableListProperty`,
                    ),
                    predicate: dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    object: dataFactory.variable!(
                      `${`${variablePrefix}MutableListProperty`}Rest0`,
                    ),
                  },
                ],
              },
              {
                type: "optional",
                patterns: [
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${variablePrefix}MutableListProperty`,
                        ),
                        predicate: {
                          type: "path",
                          pathType: "*",
                          items: [
                            dataFactory.namedNode(
                              "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                            ),
                          ],
                        },
                        object: dataFactory.variable!(
                          `${`${variablePrefix}MutableListProperty`}RestN`,
                        ),
                      },
                    ],
                  },
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${`${variablePrefix}MutableListProperty`}RestN`,
                        ),
                        predicate: dataFactory.namedNode(
                          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                        ),
                        object: dataFactory.variable!(
                          `${`${variablePrefix}MutableListProperty`}ItemN`,
                        ),
                      },
                    ],
                  },
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${`${variablePrefix}MutableListProperty`}RestN`,
                        ),
                        predicate: dataFactory.namedNode(
                          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                        ),
                        object: dataFactory.variable!(
                          `${`${variablePrefix}MutableListProperty`}RestNBasic`,
                        ),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}MutableSetProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/mutableSetProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}MutableStringProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/mutableStringProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape that uses the list shapes in properties.
 */
export class ListPropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "ListPropertiesNodeShape";
  readonly objectListProperty: purify.Maybe<readonly NonClassNodeShape[]>;
  readonly stringListProperty: purify.Maybe<readonly string[]>;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly objectListProperty?:
      | purify.Maybe<readonly NonClassNodeShape[]>
      | readonly NonClassNodeShape[];
    readonly stringListProperty?:
      | purify.Maybe<readonly string[]>
      | readonly string[];
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    if (purify.Maybe.isMaybe(parameters.objectListProperty)) {
      this.objectListProperty = parameters.objectListProperty;
    } else if (Array.isArray(parameters.objectListProperty)) {
      this.objectListProperty = purify.Maybe.of(parameters.objectListProperty);
    } else if (typeof parameters.objectListProperty === "undefined") {
      this.objectListProperty = purify.Maybe.empty();
    } else {
      this.objectListProperty = parameters.objectListProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.stringListProperty)) {
      this.stringListProperty = parameters.stringListProperty;
    } else if (Array.isArray(parameters.stringListProperty)) {
      this.stringListProperty = purify.Maybe.of(parameters.stringListProperty);
    } else if (typeof parameters.stringListProperty === "undefined") {
      this.stringListProperty = purify.Maybe.empty();
    } else {
      this.stringListProperty = parameters.stringListProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: ListPropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(left, right, (left, right) =>
            $arrayEquals(left, right, (left, right) => left.equals(right)),
          ))(this.objectListProperty, other.objectListProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "objectListProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(left, right, (left, right) =>
            $arrayEquals(left, right, $strictEquals),
          ))(this.stringListProperty, other.stringListProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringListProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.objectListProperty.ifJust((_value0) => {
      for (const _element1 of _value0) {
        _element1.hash(_hasher);
      }
    });
    this.stringListProperty.ifJust((_value0) => {
      for (const _element1 of _value0) {
        _hasher.update(_element1);
      }
    });
    return _hasher;
  }

  toJson(): ListPropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        objectListProperty: this.objectListProperty
          .map((_item) => _item.map((_item) => _item.toJson()))
          .extract(),
        stringListProperty: this.stringListProperty
          .map((_item) => _item.map((_item) => _item))
          .extract(),
      } satisfies ListPropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/objectListProperty"),
      this.objectListProperty.map((_value) =>
        _value.length > 0
          ? _value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    { mutateGraph },
                  );
                  currentSubListResource!.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  dataFactory.namedNode("http://example.com/ObjectListShape"),
                );

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item.toRdf({
                    mutateGraph: mutateGraph,
                    resourceSet: resourceSet,
                  }),
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
              },
            ).listResource.identifier
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/stringListProperty"),
      this.stringListProperty.map((_value) =>
        _value.length > 0
          ? _value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    { mutateGraph },
                  );
                  currentSubListResource!.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  dataFactory.namedNode("http://example.com/StringListShape"),
                );

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
              },
            ).listResource.identifier
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
      ),
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace ListPropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "ListPropertiesNodeShape";
    readonly objectListProperty: readonly NonClassNodeShape.Json[] | undefined;
    readonly stringListProperty: readonly string[] | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      objectListProperty: purify.Maybe<readonly NonClassNodeShape[]>;
      stringListProperty: purify.Maybe<readonly string[]>;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const objectListProperty = purify.Maybe.fromNullable(
      _jsonObject["objectListProperty"],
    ).map((_item) =>
      _item.map((_item) => NonClassNodeShape.fromJson(_item).unsafeCoerce()),
    );
    const stringListProperty = purify.Maybe.fromNullable(
      _jsonObject["stringListProperty"],
    ).map((_item) => _item.map((_item) => _item));
    return purify.Either.of({
      identifier,
      objectListProperty,
      stringListProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ListPropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new ListPropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ListPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        NonClassNodeShape.jsonUiSchema({
          scopePrefix: `${scopePrefix}/properties/objectListProperty`,
        }),
        {
          scope: `${scopePrefix}/properties/stringListProperty`,
          type: "Control",
        },
      ],
      label: "ListPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("ListPropertiesNodeShape"),
      objectListProperty: NonClassNodeShape.jsonZodSchema().array().optional(),
      stringListProperty: zod.string().array().optional(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      objectListProperty: purify.Maybe<readonly NonClassNodeShape[]>;
      stringListProperty: purify.Maybe<readonly string[]>;
    }
  > {
    const identifier = _resource.identifier;
    const _objectListPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<readonly NonClassNodeShape[]>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/objectListProperty"),
          { unique: true },
        )
        .head()
        .chain((value) => value.toList())
        .map((values) =>
          values.flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toResource())
              .chain((_resource) =>
                NonClassNodeShape.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
        )
        .toMaybe(),
    );
    if (_objectListPropertyEither.isLeft()) {
      return _objectListPropertyEither;
    }

    const objectListProperty = _objectListPropertyEither.unsafeCoerce();
    const _stringListPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<readonly string[]>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/stringListProperty"),
          { unique: true },
        )
        .head()
        .chain((value) => value.toList())
        .map((values) =>
          values.flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((_value) => _value.toString())
              .toMaybe()
              .toList(),
          ),
        )
        .toMaybe(),
    );
    if (_stringListPropertyEither.isLeft()) {
      return _stringListPropertyEither;
    }

    const stringListProperty = _stringListPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      objectListProperty,
      stringListProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof ListPropertiesNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ListPropertiesNodeShape> {
    return ListPropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new ListPropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        ListPropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ListPropertiesNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ListPropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("listPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "listPropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}ObjectListProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/objectListProperty",
        ),
        subject,
      },
      {
        subject: dataFactory.variable!(`${variablePrefix}ObjectListProperty`),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}Item0`,
        ),
      },
      ...NonClassNodeShape.sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}Item0`,
        ),
        variablePrefix: `${`${variablePrefix}ObjectListProperty`}Item0`,
      }),
      {
        subject: dataFactory.variable!(`${variablePrefix}ObjectListProperty`),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}Rest0`,
        ),
      },
      {
        subject: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}RestN`,
        ),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}ItemN`,
        ),
      },
      ...NonClassNodeShape.sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}ItemN`,
        ),
        variablePrefix: `${`${variablePrefix}ObjectListProperty`}ItemN`,
      }),
      {
        subject: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}RestN`,
        ),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}RestNBasic`,
        ),
      },
      {
        object: dataFactory.variable!(`${variablePrefix}StringListProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/stringListProperty",
        ),
        subject,
      },
      {
        subject: dataFactory.variable!(`${variablePrefix}StringListProperty`),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}StringListProperty`}Item0`,
        ),
      },
      {
        subject: dataFactory.variable!(`${variablePrefix}StringListProperty`),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}StringListProperty`}Rest0`,
        ),
      },
      {
        subject: dataFactory.variable!(
          `${`${variablePrefix}StringListProperty`}RestN`,
        ),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}StringListProperty`}ItemN`,
        ),
      },
      {
        subject: dataFactory.variable!(
          `${`${variablePrefix}StringListProperty`}RestN`,
        ),
        predicate: dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
        ),
        object: dataFactory.variable!(
          `${`${variablePrefix}StringListProperty`}RestNBasic`,
        ),
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("listPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "listPropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}ObjectListProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/objectListProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
          {
            type: "optional",
            patterns: [
              {
                type: "bgp",
                triples: [
                  {
                    subject: dataFactory.variable!(
                      `${variablePrefix}ObjectListProperty`,
                    ),
                    predicate: dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                    ),
                    object: dataFactory.variable!(
                      `${`${variablePrefix}ObjectListProperty`}Item0`,
                    ),
                  },
                ],
              },
              ...NonClassNodeShape.sparqlWherePatterns({
                ignoreRdfType: true,
                subject: dataFactory.variable!(
                  `${`${variablePrefix}ObjectListProperty`}Item0`,
                ),
                variablePrefix: `${`${variablePrefix}ObjectListProperty`}Item0`,
              }),
              {
                type: "bgp",
                triples: [
                  {
                    subject: dataFactory.variable!(
                      `${variablePrefix}ObjectListProperty`,
                    ),
                    predicate: dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    object: dataFactory.variable!(
                      `${`${variablePrefix}ObjectListProperty`}Rest0`,
                    ),
                  },
                ],
              },
              {
                type: "optional",
                patterns: [
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${variablePrefix}ObjectListProperty`,
                        ),
                        predicate: {
                          type: "path",
                          pathType: "*",
                          items: [
                            dataFactory.namedNode(
                              "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                            ),
                          ],
                        },
                        object: dataFactory.variable!(
                          `${`${variablePrefix}ObjectListProperty`}RestN`,
                        ),
                      },
                    ],
                  },
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${`${variablePrefix}ObjectListProperty`}RestN`,
                        ),
                        predicate: dataFactory.namedNode(
                          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                        ),
                        object: dataFactory.variable!(
                          `${`${variablePrefix}ObjectListProperty`}ItemN`,
                        ),
                      },
                    ],
                  },
                  ...NonClassNodeShape.sparqlWherePatterns({
                    ignoreRdfType: true,
                    subject: dataFactory.variable!(
                      `${`${variablePrefix}ObjectListProperty`}ItemN`,
                    ),
                    variablePrefix: `${`${variablePrefix}ObjectListProperty`}ItemN`,
                  }),
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${`${variablePrefix}ObjectListProperty`}RestN`,
                        ),
                        predicate: dataFactory.namedNode(
                          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                        ),
                        object: dataFactory.variable!(
                          `${`${variablePrefix}ObjectListProperty`}RestNBasic`,
                        ),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}StringListProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/stringListProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
          {
            type: "optional",
            patterns: [
              {
                type: "bgp",
                triples: [
                  {
                    subject: dataFactory.variable!(
                      `${variablePrefix}StringListProperty`,
                    ),
                    predicate: dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                    ),
                    object: dataFactory.variable!(
                      `${`${variablePrefix}StringListProperty`}Item0`,
                    ),
                  },
                ],
              },
              {
                type: "bgp",
                triples: [
                  {
                    subject: dataFactory.variable!(
                      `${variablePrefix}StringListProperty`,
                    ),
                    predicate: dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    object: dataFactory.variable!(
                      `${`${variablePrefix}StringListProperty`}Rest0`,
                    ),
                  },
                ],
              },
              {
                type: "optional",
                patterns: [
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${variablePrefix}StringListProperty`,
                        ),
                        predicate: {
                          type: "path",
                          pathType: "*",
                          items: [
                            dataFactory.namedNode(
                              "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                            ),
                          ],
                        },
                        object: dataFactory.variable!(
                          `${`${variablePrefix}StringListProperty`}RestN`,
                        ),
                      },
                    ],
                  },
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${`${variablePrefix}StringListProperty`}RestN`,
                        ),
                        predicate: dataFactory.namedNode(
                          "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                        ),
                        object: dataFactory.variable!(
                          `${`${variablePrefix}StringListProperty`}ItemN`,
                        ),
                      },
                    ],
                  },
                  {
                    type: "bgp",
                    triples: [
                      {
                        subject: dataFactory.variable!(
                          `${`${variablePrefix}StringListProperty`}RestN`,
                        ),
                        predicate: dataFactory.namedNode(
                          "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                        ),
                        object: dataFactory.variable!(
                          `${`${variablePrefix}StringListProperty`}RestNBasic`,
                        ),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape that uses the StringListShape in a property.
 */
export class LanguageInPropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "LanguageInPropertiesNodeShape";
  readonly languageInProperty: purify.Maybe<rdfjs.Literal>;
  /**
   * literal property for testing runtime languageIn
   */
  readonly literalProperty: purify.Maybe<rdfjs.Literal>;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly languageInProperty?:
      | rdfjs.Literal
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal>
      | string;
    readonly literalProperty?:
      | rdfjs.Literal
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal>
      | string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    if (purify.Maybe.isMaybe(parameters.languageInProperty)) {
      this.languageInProperty = parameters.languageInProperty;
    } else if (typeof parameters.languageInProperty === "boolean") {
      this.languageInProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.languageInProperty === "object" &&
      parameters.languageInProperty instanceof Date
    ) {
      this.languageInProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInProperty, { dataFactory }),
      );
    } else if (typeof parameters.languageInProperty === "number") {
      this.languageInProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInProperty, { dataFactory }),
      );
    } else if (typeof parameters.languageInProperty === "string") {
      this.languageInProperty = purify.Maybe.of(
        dataFactory.literal(parameters.languageInProperty),
      );
    } else if (typeof parameters.languageInProperty === "object") {
      this.languageInProperty = purify.Maybe.of(parameters.languageInProperty);
    } else if (typeof parameters.languageInProperty === "undefined") {
      this.languageInProperty = purify.Maybe.empty();
    } else {
      this.languageInProperty = parameters.languageInProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.literalProperty)) {
      this.literalProperty = parameters.literalProperty;
    } else if (typeof parameters.literalProperty === "boolean") {
      this.literalProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.literalProperty === "object" &&
      parameters.literalProperty instanceof Date
    ) {
      this.literalProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalProperty, { dataFactory }),
      );
    } else if (typeof parameters.literalProperty === "number") {
      this.literalProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalProperty, { dataFactory }),
      );
    } else if (typeof parameters.literalProperty === "string") {
      this.literalProperty = purify.Maybe.of(
        dataFactory.literal(parameters.literalProperty),
      );
    } else if (typeof parameters.literalProperty === "object") {
      this.literalProperty = purify.Maybe.of(parameters.literalProperty);
    } else if (typeof parameters.literalProperty === "undefined") {
      this.literalProperty = purify.Maybe.empty();
    } else {
      this.literalProperty = parameters.literalProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: LanguageInPropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.languageInProperty,
          other.languageInProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "languageInProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.literalProperty,
          other.literalProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "literalProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.languageInProperty.ifJust((_value0) => {
      _hasher.update(_value0.datatype.value);
      _hasher.update(_value0.language);
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.literalProperty.ifJust((_value0) => {
      _hasher.update(_value0.datatype.value);
      _hasher.update(_value0.language);
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    return _hasher;
  }

  toJson(): LanguageInPropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        languageInProperty: this.languageInProperty
          .map((_item) => ({
            "@language": _item.language.length > 0 ? _item.language : undefined,
            "@type":
              _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
                ? _item.datatype.value
                : undefined,
            "@value": _item.value,
          }))
          .extract(),
        literalProperty: this.literalProperty
          .map((_item) => ({
            "@language": _item.language.length > 0 ? _item.language : undefined,
            "@type":
              _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
                ? _item.datatype.value
                : undefined,
            "@value": _item.value,
          }))
          .extract(),
      } satisfies LanguageInPropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/languageInProperty"),
      this.languageInProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/literalProperty"),
      this.literalProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace LanguageInPropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "LanguageInPropertiesNodeShape";
    readonly languageInProperty:
      | {
          readonly "@language": string | undefined;
          readonly "@type": string | undefined;
          readonly "@value": string;
        }
      | undefined;
    readonly literalProperty:
      | {
          readonly "@language": string | undefined;
          readonly "@type": string | undefined;
          readonly "@value": string;
        }
      | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      languageInProperty: purify.Maybe<rdfjs.Literal>;
      literalProperty: purify.Maybe<rdfjs.Literal>;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const languageInProperty = purify.Maybe.fromNullable(
      _jsonObject["languageInProperty"],
    ).map((_item) =>
      dataFactory.literal(
        _item["@value"],
        typeof _item["@language"] !== "undefined"
          ? _item["@language"]
          : typeof _item["@type"] !== "undefined"
            ? dataFactory.namedNode(_item["@type"])
            : undefined,
      ),
    );
    const literalProperty = purify.Maybe.fromNullable(
      _jsonObject["literalProperty"],
    ).map((_item) =>
      dataFactory.literal(
        _item["@value"],
        typeof _item["@language"] !== "undefined"
          ? _item["@language"]
          : typeof _item["@type"] !== "undefined"
            ? dataFactory.namedNode(_item["@type"])
            : undefined,
      ),
    );
    return purify.Either.of({
      identifier,
      languageInProperty,
      literalProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, LanguageInPropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new LanguageInPropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "LanguageInPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/languageInProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/literalProperty`, type: "Control" },
      ],
      label: "LanguageInPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("LanguageInPropertiesNodeShape"),
      languageInProperty: zod
        .object({
          "@language": zod.string().optional(),
          "@type": zod.string().optional(),
          "@value": zod.string(),
        })
        .optional(),
      literalProperty: zod
        .object({
          "@language": zod.string().optional(),
          "@type": zod.string().optional(),
          "@value": zod.string(),
        })
        .optional()
        .describe("literal property for testing runtime languageIn"),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      languageInProperty: purify.Maybe<rdfjs.Literal>;
      literalProperty: purify.Maybe<rdfjs.Literal>;
    }
  > {
    const identifier = _resource.identifier;
    const _languageInPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/languageInProperty"),
          { unique: true },
        )
        .filter((_value) => {
          const _languageInOrDefault = _languageIn ?? ["en", "fr"];
          if (_languageInOrDefault.length === 0) {
            return true;
          }
          const _valueLiteral = _value.toLiteral().toMaybe().extract();
          if (typeof _valueLiteral === "undefined") {
            return false;
          }
          return _languageInOrDefault.some(
            (_languageIn) => _languageIn === _valueLiteral.language,
          );
        })
        .head()
        .chain((_value) => _value.toLiteral())
        .toMaybe(),
    );
    if (_languageInPropertyEither.isLeft()) {
      return _languageInPropertyEither;
    }

    const languageInProperty = _languageInPropertyEither.unsafeCoerce();
    const _literalPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/literalProperty"), {
          unique: true,
        })
        .filter((_value) => {
          const _languageInOrDefault = _languageIn ?? [];
          if (_languageInOrDefault.length === 0) {
            return true;
          }
          const _valueLiteral = _value.toLiteral().toMaybe().extract();
          if (typeof _valueLiteral === "undefined") {
            return false;
          }
          return _languageInOrDefault.some(
            (_languageIn) => _languageIn === _valueLiteral.language,
          );
        })
        .head()
        .chain((_value) => _value.toLiteral())
        .toMaybe(),
    );
    if (_literalPropertyEither.isLeft()) {
      return _literalPropertyEither;
    }

    const literalProperty = _literalPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      languageInProperty,
      literalProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof LanguageInPropertiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    LanguageInPropertiesNodeShape
  > {
    return LanguageInPropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new LanguageInPropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        LanguageInPropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        LanguageInPropertiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      LanguageInPropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("languageInPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "languageInPropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}LanguageInProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/languageInProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}LiteralProperty`),
        predicate: dataFactory.namedNode("http://example.com/literalProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("languageInPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "languageInPropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}LanguageInProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/languageInProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}LiteralProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/literalProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * A node shape that only allows IRI identifiers.
 */
export class IriNodeShape {
  readonly identifier: rdfjs.NamedNode;
  readonly type = "IriNodeShape";

  constructor(parameters: { readonly identifier: rdfjs.NamedNode | string }) {
    if (typeof parameters.identifier === "object") {
      this.identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this.identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      this.identifier = parameters.identifier as never;
    }
  }

  equals(other: IriNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    return _hasher;
  }

  toJson(): IriNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.identifier.value,
        type: this.type,
      } satisfies IriNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.identifier, {
      mutateGraph,
    });
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace IriNodeShape {
  export type Json = { readonly "@id": string; readonly type: "IriNodeShape" };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<zod.ZodError, { identifier: rdfjs.NamedNode }> {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = dataFactory.namedNode(_jsonObject["@id"]);
    return purify.Either.of({ identifier });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, IriNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new IriNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "IriNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
      ],
      label: "IriNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("IriNodeShape"),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.NamedNode }
  > {
    const identifier = _resource.identifier;
    return purify.Either.of({ identifier });
  }

  export function fromRdf(
    parameters: Parameters<typeof IriNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, IriNodeShape> {
    return IriNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new IriNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        IriNodeShape.sparqlConstructTemplateTriples({ ignoreRdfType, subject }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        IriNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      IriNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(_parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [];
  }

  export function sparqlWherePatterns(_parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
export interface InterfaceUnionNodeShapeMember2b {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "InterfaceUnionNodeShapeMember2b";
  readonly stringProperty2b: string;
}

export namespace InterfaceUnionNodeShapeMember2b {
  export function create(parameters: {
    readonly identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty2b: string;
  }): InterfaceUnionNodeShapeMember2b {
    let identifier: rdfjs.BlankNode | rdfjs.NamedNode;
    if (typeof parameters.identifier === "object") {
      identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      identifier = parameters.identifier as never;
    }

    const type = "InterfaceUnionNodeShapeMember2b" as const;
    const stringProperty2b = parameters.stringProperty2b;
    return { identifier, type, stringProperty2b };
  }

  export function equals(
    left: InterfaceUnionNodeShapeMember2b,
    right: InterfaceUnionNodeShapeMember2b,
  ): $EqualsResult {
    return $booleanEquals(left.identifier, right.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(left.type, right.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(left.stringProperty2b, right.stringProperty2b).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "stringProperty2b",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  export type Json = {
    readonly "@id": string;
    readonly type: "InterfaceUnionNodeShapeMember2b";
    readonly stringProperty2b: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "InterfaceUnionNodeShapeMember2b";
      stringProperty2b: string;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const type = "InterfaceUnionNodeShapeMember2b" as const;
    const stringProperty2b = _jsonObject["stringProperty2b"];
    return purify.Either.of({ identifier, type, stringProperty2b });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionNodeShapeMember2b> {
    return propertiesFromJson(json);
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InterfaceUnionNodeShapeMember2b" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/stringProperty2b`,
          type: "Control",
        },
      ],
      label: "InterfaceUnionNodeShapeMember2b",
      type: "Group",
    };
  }

  export function toJson(
    _interfaceUnionNodeShapeMember2b: InterfaceUnionNodeShapeMember2b,
  ): InterfaceUnionNodeShapeMember2b.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _interfaceUnionNodeShapeMember2b.identifier.termType === "BlankNode"
            ? `_:${_interfaceUnionNodeShapeMember2b.identifier.value}`
            : _interfaceUnionNodeShapeMember2b.identifier.value,
        type: _interfaceUnionNodeShapeMember2b.type,
        stringProperty2b: _interfaceUnionNodeShapeMember2b.stringProperty2b,
      } satisfies InterfaceUnionNodeShapeMember2b.Json),
    );
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("InterfaceUnionNodeShapeMember2b"),
      stringProperty2b: zod.string(),
    });
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionNodeShapeMember2b: InterfaceUnionNodeShapeMember2b,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionNodeShapeMember2b.identifier.value);
    _hasher.update(_interfaceUnionNodeShapeMember2b.type);
    InterfaceUnionNodeShapeMember2b.hashShaclProperties(
      _interfaceUnionNodeShapeMember2b,
      _hasher,
    );
    return _hasher;
  }

  export function hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionNodeShapeMember2b: InterfaceUnionNodeShapeMember2b,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionNodeShapeMember2b.stringProperty2b);
    return _hasher;
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "InterfaceUnionNodeShapeMember2b";
      stringProperty2b: string;
    }
  > {
    const identifier = _resource.identifier;
    const type = "InterfaceUnionNodeShapeMember2b" as const;
    const _stringProperty2bEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty2b"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringProperty2bEither.isLeft()) {
      return _stringProperty2bEither;
    }

    const stringProperty2b = _stringProperty2bEither.unsafeCoerce();
    return purify.Either.of({ identifier, type, stringProperty2b });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof InterfaceUnionNodeShapeMember2b.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    InterfaceUnionNodeShapeMember2b
  > {
    return InterfaceUnionNodeShapeMember2b.propertiesFromRdf(parameters);
  }

  export function toRdf(
    _interfaceUnionNodeShapeMember2b: InterfaceUnionNodeShapeMember2b,
    {
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(
      _interfaceUnionNodeShapeMember2b.identifier,
      { mutateGraph },
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty2b"),
      _interfaceUnionNodeShapeMember2b.stringProperty2b,
    );
    return _resource;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InterfaceUnionNodeShapeMember2b.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionNodeShapeMember2b.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionNodeShapeMember2b.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("interfaceUnionNodeShapeMember2b");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionNodeShapeMember2b");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty2b`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty2b"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("interfaceUnionNodeShapeMember2b");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionNodeShapeMember2b");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty2b`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty2b",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    create,
    equals,
    fromJson,
    fromRdf,
    hash,
    hashShaclProperties,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
export interface InterfaceUnionNodeShapeMember2a {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "InterfaceUnionNodeShapeMember2a";
  readonly stringProperty2a: string;
}

export namespace InterfaceUnionNodeShapeMember2a {
  export function create(parameters: {
    readonly identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty2a: string;
  }): InterfaceUnionNodeShapeMember2a {
    let identifier: rdfjs.BlankNode | rdfjs.NamedNode;
    if (typeof parameters.identifier === "object") {
      identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      identifier = parameters.identifier as never;
    }

    const type = "InterfaceUnionNodeShapeMember2a" as const;
    const stringProperty2a = parameters.stringProperty2a;
    return { identifier, type, stringProperty2a };
  }

  export function equals(
    left: InterfaceUnionNodeShapeMember2a,
    right: InterfaceUnionNodeShapeMember2a,
  ): $EqualsResult {
    return $booleanEquals(left.identifier, right.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(left.type, right.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(left.stringProperty2a, right.stringProperty2a).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "stringProperty2a",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  export type Json = {
    readonly "@id": string;
    readonly type: "InterfaceUnionNodeShapeMember2a";
    readonly stringProperty2a: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "InterfaceUnionNodeShapeMember2a";
      stringProperty2a: string;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const type = "InterfaceUnionNodeShapeMember2a" as const;
    const stringProperty2a = _jsonObject["stringProperty2a"];
    return purify.Either.of({ identifier, type, stringProperty2a });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionNodeShapeMember2a> {
    return propertiesFromJson(json);
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InterfaceUnionNodeShapeMember2a" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/stringProperty2a`,
          type: "Control",
        },
      ],
      label: "InterfaceUnionNodeShapeMember2a",
      type: "Group",
    };
  }

  export function toJson(
    _interfaceUnionNodeShapeMember2a: InterfaceUnionNodeShapeMember2a,
  ): InterfaceUnionNodeShapeMember2a.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _interfaceUnionNodeShapeMember2a.identifier.termType === "BlankNode"
            ? `_:${_interfaceUnionNodeShapeMember2a.identifier.value}`
            : _interfaceUnionNodeShapeMember2a.identifier.value,
        type: _interfaceUnionNodeShapeMember2a.type,
        stringProperty2a: _interfaceUnionNodeShapeMember2a.stringProperty2a,
      } satisfies InterfaceUnionNodeShapeMember2a.Json),
    );
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("InterfaceUnionNodeShapeMember2a"),
      stringProperty2a: zod.string(),
    });
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionNodeShapeMember2a: InterfaceUnionNodeShapeMember2a,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionNodeShapeMember2a.identifier.value);
    _hasher.update(_interfaceUnionNodeShapeMember2a.type);
    InterfaceUnionNodeShapeMember2a.hashShaclProperties(
      _interfaceUnionNodeShapeMember2a,
      _hasher,
    );
    return _hasher;
  }

  export function hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionNodeShapeMember2a: InterfaceUnionNodeShapeMember2a,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionNodeShapeMember2a.stringProperty2a);
    return _hasher;
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "InterfaceUnionNodeShapeMember2a";
      stringProperty2a: string;
    }
  > {
    const identifier = _resource.identifier;
    const type = "InterfaceUnionNodeShapeMember2a" as const;
    const _stringProperty2aEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty2a"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringProperty2aEither.isLeft()) {
      return _stringProperty2aEither;
    }

    const stringProperty2a = _stringProperty2aEither.unsafeCoerce();
    return purify.Either.of({ identifier, type, stringProperty2a });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof InterfaceUnionNodeShapeMember2a.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    InterfaceUnionNodeShapeMember2a
  > {
    return InterfaceUnionNodeShapeMember2a.propertiesFromRdf(parameters);
  }

  export function toRdf(
    _interfaceUnionNodeShapeMember2a: InterfaceUnionNodeShapeMember2a,
    {
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(
      _interfaceUnionNodeShapeMember2a.identifier,
      { mutateGraph },
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty2a"),
      _interfaceUnionNodeShapeMember2a.stringProperty2a,
    );
    return _resource;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InterfaceUnionNodeShapeMember2a.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionNodeShapeMember2a.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionNodeShapeMember2a.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("interfaceUnionNodeShapeMember2a");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionNodeShapeMember2a");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty2a`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty2a"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("interfaceUnionNodeShapeMember2a");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionNodeShapeMember2a");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty2a`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty2a",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    create,
    equals,
    fromJson,
    fromRdf,
    hash,
    hashShaclProperties,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
export interface InterfaceUnionNodeShapeMember1 {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "InterfaceUnionNodeShapeMember1";
  readonly stringProperty1: string;
}

export namespace InterfaceUnionNodeShapeMember1 {
  export function create(parameters: {
    readonly identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty1: string;
  }): InterfaceUnionNodeShapeMember1 {
    let identifier: rdfjs.BlankNode | rdfjs.NamedNode;
    if (typeof parameters.identifier === "object") {
      identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      identifier = parameters.identifier as never;
    }

    const type = "InterfaceUnionNodeShapeMember1" as const;
    const stringProperty1 = parameters.stringProperty1;
    return { identifier, type, stringProperty1 };
  }

  export function equals(
    left: InterfaceUnionNodeShapeMember1,
    right: InterfaceUnionNodeShapeMember1,
  ): $EqualsResult {
    return $booleanEquals(left.identifier, right.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(left.type, right.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(left.stringProperty1, right.stringProperty1).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "stringProperty1",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  export type Json = {
    readonly "@id": string;
    readonly type: "InterfaceUnionNodeShapeMember1";
    readonly stringProperty1: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "InterfaceUnionNodeShapeMember1";
      stringProperty1: string;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const type = "InterfaceUnionNodeShapeMember1" as const;
    const stringProperty1 = _jsonObject["stringProperty1"];
    return purify.Either.of({ identifier, type, stringProperty1 });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionNodeShapeMember1> {
    return propertiesFromJson(json);
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InterfaceUnionNodeShapeMember1" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty1`, type: "Control" },
      ],
      label: "InterfaceUnionNodeShapeMember1",
      type: "Group",
    };
  }

  export function toJson(
    _interfaceUnionNodeShapeMember1: InterfaceUnionNodeShapeMember1,
  ): InterfaceUnionNodeShapeMember1.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _interfaceUnionNodeShapeMember1.identifier.termType === "BlankNode"
            ? `_:${_interfaceUnionNodeShapeMember1.identifier.value}`
            : _interfaceUnionNodeShapeMember1.identifier.value,
        type: _interfaceUnionNodeShapeMember1.type,
        stringProperty1: _interfaceUnionNodeShapeMember1.stringProperty1,
      } satisfies InterfaceUnionNodeShapeMember1.Json),
    );
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("InterfaceUnionNodeShapeMember1"),
      stringProperty1: zod.string(),
    });
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionNodeShapeMember1: InterfaceUnionNodeShapeMember1,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionNodeShapeMember1.identifier.value);
    _hasher.update(_interfaceUnionNodeShapeMember1.type);
    InterfaceUnionNodeShapeMember1.hashShaclProperties(
      _interfaceUnionNodeShapeMember1,
      _hasher,
    );
    return _hasher;
  }

  export function hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionNodeShapeMember1: InterfaceUnionNodeShapeMember1,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionNodeShapeMember1.stringProperty1);
    return _hasher;
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "InterfaceUnionNodeShapeMember1";
      stringProperty1: string;
    }
  > {
    const identifier = _resource.identifier;
    const type = "InterfaceUnionNodeShapeMember1" as const;
    const _stringProperty1Either: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty1"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringProperty1Either.isLeft()) {
      return _stringProperty1Either;
    }

    const stringProperty1 = _stringProperty1Either.unsafeCoerce();
    return purify.Either.of({ identifier, type, stringProperty1 });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof InterfaceUnionNodeShapeMember1.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    InterfaceUnionNodeShapeMember1
  > {
    return InterfaceUnionNodeShapeMember1.propertiesFromRdf(parameters);
  }

  export function toRdf(
    _interfaceUnionNodeShapeMember1: InterfaceUnionNodeShapeMember1,
    {
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(
      _interfaceUnionNodeShapeMember1.identifier,
      { mutateGraph },
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty1"),
      _interfaceUnionNodeShapeMember1.stringProperty1,
    );
    return _resource;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InterfaceUnionNodeShapeMember1.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionNodeShapeMember1.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionNodeShapeMember1.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("interfaceUnionNodeShapeMember1");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionNodeShapeMember1");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty1`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty1"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("interfaceUnionNodeShapeMember1");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionNodeShapeMember1");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty1`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty1",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    create,
    equals,
    fromJson,
    fromRdf,
    hash,
    hashShaclProperties,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
/**
 * A node shape that's generated as a TypeScript interface instead of a class.
 */
export interface InterfaceNodeShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "InterfaceNodeShape";
  readonly stringProperty: string;
}

export namespace InterfaceNodeShape {
  export function create(parameters: {
    readonly identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty: string;
  }): InterfaceNodeShape {
    let identifier: rdfjs.BlankNode | rdfjs.NamedNode;
    if (typeof parameters.identifier === "object") {
      identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      identifier = parameters.identifier as never;
    }

    const type = "InterfaceNodeShape" as const;
    const stringProperty = parameters.stringProperty;
    return { identifier, type, stringProperty };
  }

  export function equals(
    left: InterfaceNodeShape,
    right: InterfaceNodeShape,
  ): $EqualsResult {
    return $booleanEquals(left.identifier, right.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(left.type, right.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(left.stringProperty, right.stringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "stringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  export type Json = {
    readonly "@id": string;
    readonly type: "InterfaceNodeShape";
    readonly stringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "InterfaceNodeShape";
      stringProperty: string;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const type = "InterfaceNodeShape" as const;
    const stringProperty = _jsonObject["stringProperty"];
    return purify.Either.of({ identifier, type, stringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceNodeShape> {
    return propertiesFromJson(json);
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InterfaceNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
      ],
      label: "InterfaceNodeShape",
      type: "Group",
    };
  }

  export function toJson(
    _interfaceNodeShape: InterfaceNodeShape,
  ): InterfaceNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _interfaceNodeShape.identifier.termType === "BlankNode"
            ? `_:${_interfaceNodeShape.identifier.value}`
            : _interfaceNodeShape.identifier.value,
        type: _interfaceNodeShape.type,
        stringProperty: _interfaceNodeShape.stringProperty,
      } satisfies InterfaceNodeShape.Json),
    );
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("InterfaceNodeShape"),
      stringProperty: zod.string(),
    });
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_interfaceNodeShape: InterfaceNodeShape, _hasher: HasherT): HasherT {
    _hasher.update(_interfaceNodeShape.identifier.value);
    _hasher.update(_interfaceNodeShape.type);
    InterfaceNodeShape.hashShaclProperties(_interfaceNodeShape, _hasher);
    return _hasher;
  }

  export function hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_interfaceNodeShape: InterfaceNodeShape, _hasher: HasherT): HasherT {
    _hasher.update(_interfaceNodeShape.stringProperty);
    return _hasher;
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "InterfaceNodeShape";
      stringProperty: string;
    }
  > {
    const identifier = _resource.identifier;
    const type = "InterfaceNodeShape" as const;
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, type, stringProperty });
  }

  export function fromRdf(
    parameters: Parameters<typeof InterfaceNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InterfaceNodeShape> {
    return InterfaceNodeShape.propertiesFromRdf(parameters);
  }

  export function toRdf(
    _interfaceNodeShape: InterfaceNodeShape,
    {
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(
      _interfaceNodeShape.identifier,
      { mutateGraph },
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      _interfaceNodeShape.stringProperty,
    );
    return _resource;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InterfaceNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("interfaceNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "interfaceNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("interfaceNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "interfaceNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    create,
    equals,
    fromJson,
    fromRdf,
    hash,
    hashShaclProperties,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
/**
 * Shape with sh:in properties.
 */
export class InPropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "InPropertiesNodeShape";
  readonly inBooleansProperty: purify.Maybe<true>;
  readonly inDateTimesProperty: purify.Maybe<Date>;
  readonly inIrisProperty: purify.Maybe<
    rdfjs.NamedNode<
      | "http://example.com/InPropertiesNodeShapeIri1"
      | "http://example.com/InPropertiesNodeShapeIri2"
    >
  >;
  readonly inNumbersProperty: purify.Maybe<1 | 2>;
  readonly inStringsProperty: purify.Maybe<"text" | "html">;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly inBooleansProperty?: purify.Maybe<true> | true;
    readonly inDateTimesProperty?: Date | purify.Maybe<Date>;
    readonly inIrisProperty?:
      | "http://example.com/InPropertiesNodeShapeIri1"
      | "http://example.com/InPropertiesNodeShapeIri2"
      | purify.Maybe<
          rdfjs.NamedNode<
            | "http://example.com/InPropertiesNodeShapeIri1"
            | "http://example.com/InPropertiesNodeShapeIri2"
          >
        >
      | rdfjs.NamedNode<
          | "http://example.com/InPropertiesNodeShapeIri1"
          | "http://example.com/InPropertiesNodeShapeIri2"
        >;
    readonly inNumbersProperty?: 1 | 2 | purify.Maybe<1 | 2>;
    readonly inStringsProperty?:
      | "text"
      | "html"
      | purify.Maybe<"text" | "html">;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    if (purify.Maybe.isMaybe(parameters.inBooleansProperty)) {
      this.inBooleansProperty = parameters.inBooleansProperty;
    } else if (typeof parameters.inBooleansProperty === "boolean") {
      this.inBooleansProperty = purify.Maybe.of(parameters.inBooleansProperty);
    } else if (typeof parameters.inBooleansProperty === "undefined") {
      this.inBooleansProperty = purify.Maybe.empty();
    } else {
      this.inBooleansProperty = parameters.inBooleansProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.inDateTimesProperty)) {
      this.inDateTimesProperty = parameters.inDateTimesProperty;
    } else if (
      typeof parameters.inDateTimesProperty === "object" &&
      parameters.inDateTimesProperty instanceof Date
    ) {
      this.inDateTimesProperty = purify.Maybe.of(
        parameters.inDateTimesProperty,
      );
    } else if (typeof parameters.inDateTimesProperty === "undefined") {
      this.inDateTimesProperty = purify.Maybe.empty();
    } else {
      this.inDateTimesProperty = parameters.inDateTimesProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.inIrisProperty)) {
      this.inIrisProperty = parameters.inIrisProperty;
    } else if (typeof parameters.inIrisProperty === "object") {
      this.inIrisProperty = purify.Maybe.of(parameters.inIrisProperty);
    } else if (typeof parameters.inIrisProperty === "string") {
      this.inIrisProperty = purify.Maybe.of(
        dataFactory.namedNode(parameters.inIrisProperty),
      );
    } else if (typeof parameters.inIrisProperty === "undefined") {
      this.inIrisProperty = purify.Maybe.empty();
    } else {
      this.inIrisProperty = parameters.inIrisProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.inNumbersProperty)) {
      this.inNumbersProperty = parameters.inNumbersProperty;
    } else if (typeof parameters.inNumbersProperty === "number") {
      this.inNumbersProperty = purify.Maybe.of(parameters.inNumbersProperty);
    } else if (typeof parameters.inNumbersProperty === "undefined") {
      this.inNumbersProperty = purify.Maybe.empty();
    } else {
      this.inNumbersProperty = parameters.inNumbersProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.inStringsProperty)) {
      this.inStringsProperty = parameters.inStringsProperty;
    } else if (typeof parameters.inStringsProperty === "string") {
      this.inStringsProperty = purify.Maybe.of(parameters.inStringsProperty);
    } else if (typeof parameters.inStringsProperty === "undefined") {
      this.inStringsProperty = purify.Maybe.empty();
    } else {
      this.inStringsProperty = parameters.inStringsProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: InPropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.inBooleansProperty,
          other.inBooleansProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inBooleansProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $dateEquals))(
          this.inDateTimesProperty,
          other.inDateTimesProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inDateTimesProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.inIrisProperty,
          other.inIrisProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inIrisProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.inNumbersProperty,
          other.inNumbersProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inNumbersProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.inStringsProperty,
          other.inStringsProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inStringsProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.inBooleansProperty.ifJust((_value0) => {
      _hasher.update(_value0.toString());
    });
    this.inDateTimesProperty.ifJust((_value0) => {
      _hasher.update(_value0.toISOString());
    });
    this.inIrisProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.inNumbersProperty.ifJust((_value0) => {
      _hasher.update(_value0.toString());
    });
    this.inStringsProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    return _hasher;
  }

  toJson(): InPropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        inBooleansProperty: this.inBooleansProperty
          .map((_item) => _item)
          .extract(),
        inDateTimesProperty: this.inDateTimesProperty
          .map((_item) => _item.toISOString())
          .extract(),
        inIrisProperty: this.inIrisProperty
          .map((_item) => ({ "@id": _item.value }))
          .extract(),
        inNumbersProperty: this.inNumbersProperty
          .map((_item) => _item)
          .extract(),
        inStringsProperty: this.inStringsProperty
          .map((_item) => _item)
          .extract(),
      } satisfies InPropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/inBooleansProperty"),
      this.inBooleansProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/inDateTimesProperty"),
      this.inDateTimesProperty.map((_value) =>
        rdfLiteral.toRdf(_value, {
          dataFactory,
          datatype: dataFactory.namedNode(
            "http://www.w3.org/2001/XMLSchema#dateTime",
          ),
        }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/inIrisProperty"),
      this.inIrisProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/inNumbersProperty"),
      this.inNumbersProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/inStringsProperty"),
      this.inStringsProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace InPropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "InPropertiesNodeShape";
    readonly inBooleansProperty: true | undefined;
    readonly inDateTimesProperty: string | undefined;
    readonly inIrisProperty:
      | {
          readonly "@id":
            | "http://example.com/InPropertiesNodeShapeIri1"
            | "http://example.com/InPropertiesNodeShapeIri2";
        }
      | undefined;
    readonly inNumbersProperty: (1 | 2) | undefined;
    readonly inStringsProperty: ("text" | "html") | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      inBooleansProperty: purify.Maybe<true>;
      inDateTimesProperty: purify.Maybe<Date>;
      inIrisProperty: purify.Maybe<
        rdfjs.NamedNode<
          | "http://example.com/InPropertiesNodeShapeIri1"
          | "http://example.com/InPropertiesNodeShapeIri2"
        >
      >;
      inNumbersProperty: purify.Maybe<1 | 2>;
      inStringsProperty: purify.Maybe<"text" | "html">;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const inBooleansProperty = purify.Maybe.fromNullable(
      _jsonObject["inBooleansProperty"],
    );
    const inDateTimesProperty = purify.Maybe.fromNullable(
      _jsonObject["inDateTimesProperty"],
    ).map((_item) => new Date(_item));
    const inIrisProperty = purify.Maybe.fromNullable(
      _jsonObject["inIrisProperty"],
    ).map((_item) => dataFactory.namedNode(_item["@id"]));
    const inNumbersProperty = purify.Maybe.fromNullable(
      _jsonObject["inNumbersProperty"],
    );
    const inStringsProperty = purify.Maybe.fromNullable(
      _jsonObject["inStringsProperty"],
    );
    return purify.Either.of({
      identifier,
      inBooleansProperty,
      inDateTimesProperty,
      inIrisProperty,
      inNumbersProperty,
      inStringsProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InPropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new InPropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/inBooleansProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/inDateTimesProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/inIrisProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/inNumbersProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/inStringsProperty`,
          type: "Control",
        },
      ],
      label: "InPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("InPropertiesNodeShape"),
      inBooleansProperty: zod.literal(true).optional(),
      inDateTimesProperty: zod.string().datetime().optional(),
      inIrisProperty: zod
        .object({
          "@id": zod.enum([
            "http://example.com/InPropertiesNodeShapeIri1",
            "http://example.com/InPropertiesNodeShapeIri2",
          ]),
        })
        .optional(),
      inNumbersProperty: zod.union([zod.literal(1), zod.literal(2)]).optional(),
      inStringsProperty: zod.enum(["text", "html"]).optional(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      inBooleansProperty: purify.Maybe<true>;
      inDateTimesProperty: purify.Maybe<Date>;
      inIrisProperty: purify.Maybe<
        rdfjs.NamedNode<
          | "http://example.com/InPropertiesNodeShapeIri1"
          | "http://example.com/InPropertiesNodeShapeIri2"
        >
      >;
      inNumbersProperty: purify.Maybe<1 | 2>;
      inStringsProperty: purify.Maybe<"text" | "html">;
    }
  > {
    const identifier = _resource.identifier;
    const _inBooleansPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<true>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/inBooleansProperty"),
          { unique: true },
        )
        .head()
        .chain((_value) =>
          _value
            .toBoolean()
            .chain((value) =>
              value === true
                ? purify.Either.of(value)
                : purify.Left(
                    new rdfjsResource.Resource.MistypedValueError({
                      actualValue: rdfLiteral.toRdf(value),
                      expectedValueType: "true",
                      focusResource: _resource,
                      predicate: dataFactory.namedNode(
                        "http://example.com/inBooleansProperty",
                      ),
                    }),
                  ),
            ),
        )
        .toMaybe(),
    );
    if (_inBooleansPropertyEither.isLeft()) {
      return _inBooleansPropertyEither;
    }

    const inBooleansProperty = _inBooleansPropertyEither.unsafeCoerce();
    const _inDateTimesPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<Date>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/inDateTimesProperty"),
          { unique: true },
        )
        .head()
        .chain((_value) =>
          _value.toDate().chain((value) => {
            if (value.getTime() === 1523268000000) {
              return purify.Either.of(value);
            }
            return purify.Left(
              new rdfjsResource.Resource.MistypedValueError({
                actualValue: rdfLiteral.toRdf(value, {
                  dataFactory,
                  datatype: dataFactory.namedNode(
                    "http://www.w3.org/2001/XMLSchema#dateTime",
                  ),
                }),
                expectedValueType: "Date",
                focusResource: _resource,
                predicate: dataFactory.namedNode(
                  "http://example.com/inDateTimesProperty",
                ),
              }),
            );
          }),
        )
        .toMaybe(),
    );
    if (_inDateTimesPropertyEither.isLeft()) {
      return _inDateTimesPropertyEither;
    }

    const inDateTimesProperty = _inDateTimesPropertyEither.unsafeCoerce();
    const _inIrisPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://example.com/InPropertiesNodeShapeIri1"
          | "http://example.com/InPropertiesNodeShapeIri2"
        >
      >
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/inIrisProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) =>
          _value.toIri().chain((iri) => {
            switch (iri.value) {
              case "http://example.com/InPropertiesNodeShapeIri1":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://example.com/InPropertiesNodeShapeIri1"
                    | "http://example.com/InPropertiesNodeShapeIri2"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://example.com/InPropertiesNodeShapeIri1">,
                );
              case "http://example.com/InPropertiesNodeShapeIri2":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://example.com/InPropertiesNodeShapeIri1"
                    | "http://example.com/InPropertiesNodeShapeIri2"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://example.com/InPropertiesNodeShapeIri2">,
                );
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: iri,
                    expectedValueType:
                      'rdfjs.NamedNode<"http://example.com/InPropertiesNodeShapeIri1" | "http://example.com/InPropertiesNodeShapeIri2">',
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://example.com/inIrisProperty",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_inIrisPropertyEither.isLeft()) {
      return _inIrisPropertyEither;
    }

    const inIrisProperty = _inIrisPropertyEither.unsafeCoerce();
    const _inNumbersPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<1 | 2>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/inNumbersProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) =>
          _value.toNumber().chain((value) => {
            switch (value) {
              case 1:
              case 2:
                return purify.Either.of(value);
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: rdfLiteral.toRdf(value),
                    expectedValueType: "1 | 2",
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://example.com/inNumbersProperty",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_inNumbersPropertyEither.isLeft()) {
      return _inNumbersPropertyEither;
    }

    const inNumbersProperty = _inNumbersPropertyEither.unsafeCoerce();
    const _inStringsPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<"text" | "html">
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/inStringsProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) =>
          _value.toString().chain((value) => {
            switch (value) {
              case "text":
              case "html":
                return purify.Either.of(value);
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: rdfLiteral.toRdf(value),
                    expectedValueType: '"text" | "html"',
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://example.com/inStringsProperty",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_inStringsPropertyEither.isLeft()) {
      return _inStringsPropertyEither;
    }

    const inStringsProperty = _inStringsPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      inBooleansProperty,
      inDateTimesProperty,
      inIrisProperty,
      inNumbersProperty,
      inStringsProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof InPropertiesNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InPropertiesNodeShape> {
    return InPropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new InPropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InPropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InPropertiesNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InPropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("inPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "inPropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}InBooleansProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/inBooleansProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}InDateTimesProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/inDateTimesProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}InIrisProperty`),
        predicate: dataFactory.namedNode("http://example.com/inIrisProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}InNumbersProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/inNumbersProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}InStringsProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/inStringsProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("inPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "inPropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}InBooleansProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/inBooleansProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}InDateTimesProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/inDateTimesProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}InIrisProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/inIrisProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}InNumbersProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/inNumbersProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}InStringsProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/inStringsProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape with sh:in constraining its identifier.
 */
export class InIdentifierNodeShape {
  readonly identifier: rdfjs.NamedNode<
    | "http://example.com/InIdentifierNodeShapeInstance1"
    | "http://example.com/InIdentifierNodeShapeInstance2"
  >;
  readonly type = "InIdentifierNodeShape";
  readonly stringProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly identifier:
      | "http://example.com/InIdentifierNodeShapeInstance1"
      | "http://example.com/InIdentifierNodeShapeInstance2"
      | rdfjs.NamedNode<
          | "http://example.com/InIdentifierNodeShapeInstance1"
          | "http://example.com/InIdentifierNodeShapeInstance2"
        >;
    readonly stringProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.identifier === "object") {
      this.identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this.identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      this.identifier = parameters.identifier as never;
    }

    if (purify.Maybe.isMaybe(parameters.stringProperty)) {
      this.stringProperty = parameters.stringProperty;
    } else if (typeof parameters.stringProperty === "string") {
      this.stringProperty = purify.Maybe.of(parameters.stringProperty);
    } else if (typeof parameters.stringProperty === "undefined") {
      this.stringProperty = purify.Maybe.empty();
    } else {
      this.stringProperty = parameters.stringProperty as never;
    }
  }

  equals(other: InIdentifierNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.stringProperty,
          other.stringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "stringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.stringProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    return _hasher;
  }

  toJson(): InIdentifierNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.identifier.value,
        type: this.type,
        stringProperty: this.stringProperty.map((_item) => _item).extract(),
      } satisfies InIdentifierNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace InIdentifierNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "InIdentifierNodeShape";
    readonly stringProperty: string | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.NamedNode<
        | "http://example.com/InIdentifierNodeShapeInstance1"
        | "http://example.com/InIdentifierNodeShapeInstance2"
      >;
      stringProperty: purify.Maybe<string>;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty = purify.Maybe.fromNullable(
      _jsonObject["stringProperty"],
    );
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InIdentifierNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new InIdentifierNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InIdentifierNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
      ],
      label: "InIdentifierNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.enum([
        "http://example.com/InIdentifierNodeShapeInstance1",
        "http://example.com/InIdentifierNodeShapeInstance2",
      ]),
      type: zod.literal("InIdentifierNodeShape"),
      stringProperty: zod.string().optional(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.NamedNode<
        | "http://example.com/InIdentifierNodeShapeInstance1"
        | "http://example.com/InIdentifierNodeShapeInstance2"
      >;
      stringProperty: purify.Maybe<string>;
    }
  > {
    let identifier: rdfjs.NamedNode<
      | "http://example.com/InIdentifierNodeShapeInstance1"
      | "http://example.com/InIdentifierNodeShapeInstance2"
    >;
    switch (_resource.identifier.value) {
      case "http://example.com/InIdentifierNodeShapeInstance1":
        identifier = dataFactory.namedNode(
          "http://example.com/InIdentifierNodeShapeInstance1",
        );
        break;
      case "http://example.com/InIdentifierNodeShapeInstance2":
        identifier = dataFactory.namedNode(
          "http://example.com/InIdentifierNodeShapeInstance2",
        );
        break;
      default:
        return purify.Left(
          new rdfjsResource.Resource.MistypedValueError({
            actualValue: _resource.identifier,
            expectedValueType:
              'rdfjs.NamedNode<"http://example.com/InIdentifierNodeShapeInstance1" | "http://example.com/InIdentifierNodeShapeInstance2">',
            focusResource: _resource,
            predicate: dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
            ),
          }),
        );
    }

    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/stringProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromRdf(
    parameters: Parameters<typeof InIdentifierNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InIdentifierNodeShape> {
    return InIdentifierNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new InIdentifierNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InIdentifierNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InIdentifierNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InIdentifierNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("inIdentifierNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "inIdentifierNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("inIdentifierNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "inIdentifierNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}StringProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/stringProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape with sh:hasValue properties.
 */
export class HasValuePropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "HasValuePropertiesNodeShape";
  readonly hasIriProperty: purify.Maybe<rdfjs.NamedNode>;
  readonly hasLiteralProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly hasIriProperty?:
      | rdfjs.NamedNode
      | purify.Maybe<rdfjs.NamedNode>
      | string;
    readonly hasLiteralProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    if (purify.Maybe.isMaybe(parameters.hasIriProperty)) {
      this.hasIriProperty = parameters.hasIriProperty;
    } else if (typeof parameters.hasIriProperty === "object") {
      this.hasIriProperty = purify.Maybe.of(parameters.hasIriProperty);
    } else if (typeof parameters.hasIriProperty === "string") {
      this.hasIriProperty = purify.Maybe.of(
        dataFactory.namedNode(parameters.hasIriProperty),
      );
    } else if (typeof parameters.hasIriProperty === "undefined") {
      this.hasIriProperty = purify.Maybe.empty();
    } else {
      this.hasIriProperty = parameters.hasIriProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.hasLiteralProperty)) {
      this.hasLiteralProperty = parameters.hasLiteralProperty;
    } else if (typeof parameters.hasLiteralProperty === "string") {
      this.hasLiteralProperty = purify.Maybe.of(parameters.hasLiteralProperty);
    } else if (typeof parameters.hasLiteralProperty === "undefined") {
      this.hasLiteralProperty = purify.Maybe.empty();
    } else {
      this.hasLiteralProperty = parameters.hasLiteralProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: HasValuePropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.hasIriProperty,
          other.hasIriProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "hasIriProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.hasLiteralProperty,
          other.hasLiteralProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "hasLiteralProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.hasIriProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.hasLiteralProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    return _hasher;
  }

  toJson(): HasValuePropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        hasIriProperty: this.hasIriProperty
          .map((_item) => ({ "@id": _item.value }))
          .extract(),
        hasLiteralProperty: this.hasLiteralProperty
          .map((_item) => _item)
          .extract(),
      } satisfies HasValuePropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/hasIriProperty"),
      this.hasIriProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/hasLiteralProperty"),
      this.hasLiteralProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace HasValuePropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "HasValuePropertiesNodeShape";
    readonly hasIriProperty: { readonly "@id": string } | undefined;
    readonly hasLiteralProperty: string | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      hasIriProperty: purify.Maybe<rdfjs.NamedNode>;
      hasLiteralProperty: purify.Maybe<string>;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const hasIriProperty = purify.Maybe.fromNullable(
      _jsonObject["hasIriProperty"],
    ).map((_item) => dataFactory.namedNode(_item["@id"]));
    const hasLiteralProperty = purify.Maybe.fromNullable(
      _jsonObject["hasLiteralProperty"],
    );
    return purify.Either.of({ identifier, hasIriProperty, hasLiteralProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, HasValuePropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new HasValuePropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "HasValuePropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/hasIriProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/hasLiteralProperty`,
          type: "Control",
        },
      ],
      label: "HasValuePropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("HasValuePropertiesNodeShape"),
      hasIriProperty: zod.object({ "@id": zod.string().min(1) }).optional(),
      hasLiteralProperty: zod.string().optional(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      hasIriProperty: purify.Maybe<rdfjs.NamedNode>;
      hasLiteralProperty: purify.Maybe<string>;
    }
  > {
    const identifier = _resource.identifier;
    const _hasIriPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/hasIriProperty"), {
          unique: true,
        })
        .find((_value) =>
          _value
            .toTerm()
            .equals(
              dataFactory.namedNode(
                "http://example.com/HasValuePropertiesNodeShapeIri1",
              ),
            ),
        )
        .chain((_value) => _value.toIri())
        .toMaybe(),
    );
    if (_hasIriPropertyEither.isLeft()) {
      return _hasIriPropertyEither;
    }

    const hasIriProperty = _hasIriPropertyEither.unsafeCoerce();
    const _hasLiteralPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/hasLiteralProperty"),
          { unique: true },
        )
        .find((_value) =>
          _value.toTerm().equals(dataFactory.literal("test", "")),
        )
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_hasLiteralPropertyEither.isLeft()) {
      return _hasLiteralPropertyEither;
    }

    const hasLiteralProperty = _hasLiteralPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, hasIriProperty, hasLiteralProperty });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof HasValuePropertiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    HasValuePropertiesNodeShape
  > {
    return HasValuePropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new HasValuePropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        HasValuePropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        HasValuePropertiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      HasValuePropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("hasValuePropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "hasValuePropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}HasIriProperty`),
        predicate: dataFactory.namedNode("http://example.com/hasIriProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}HasLiteralProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/hasLiteralProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("hasValuePropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "hasValuePropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}HasIriProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/hasIriProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}HasLiteralProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/hasLiteralProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
export class InlineNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "InlineNodeShape";
  readonly stringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.stringProperty = parameters.stringProperty;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: InlineNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty, other.stringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.stringProperty);
    return _hasher;
  }

  toJson(): InlineNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        stringProperty: this.stringProperty,
      } satisfies InlineNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace InlineNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "InlineNodeShape";
    readonly stringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty = _jsonObject["stringProperty"];
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InlineNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new InlineNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InlineNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
      ],
      label: "InlineNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("InlineNodeShape"),
      stringProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty: string }
  > {
    const identifier = _resource.identifier;
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromRdf(
    parameters: Parameters<typeof InlineNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InlineNodeShape> {
    return InlineNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new InlineNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InlineNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InlineNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InlineNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("inlineNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "inlineNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("inlineNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "inlineNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
export class ExternNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "ExternNodeShape";
  readonly stringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.stringProperty = parameters.stringProperty;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: ExternNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty, other.stringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.stringProperty);
    return _hasher;
  }

  toJson(): ExternNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        stringProperty: this.stringProperty,
      } satisfies ExternNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace ExternNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "ExternNodeShape";
    readonly stringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty = _jsonObject["stringProperty"];
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ExternNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new ExternNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ExternNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
      ],
      label: "ExternNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("ExternNodeShape"),
      stringProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty: string }
  > {
    const identifier = _resource.identifier;
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromRdf(
    parameters: Parameters<typeof ExternNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ExternNodeShape> {
    return ExternNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new ExternNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        ExternNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ExternNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ExternNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("externNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "externNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("externNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "externNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Node shape that inlines/nests another node shape and externs/references another.
 */
export class ExternPropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "ExternPropertiesNodeShape";
  readonly externObjectTypeProperty: purify.Maybe<ExternObjectType>;
  readonly externProperty: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
  readonly inlineProperty: purify.Maybe<InlineNodeShape>;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly externObjectTypeProperty?:
      | ExternObjectType
      | purify.Maybe<ExternObjectType>;
    readonly externProperty?:
      | (rdfjs.BlankNode | rdfjs.NamedNode)
      | purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
      | string;
    readonly inlineProperty?: InlineNodeShape | purify.Maybe<InlineNodeShape>;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    if (purify.Maybe.isMaybe(parameters.externObjectTypeProperty)) {
      this.externObjectTypeProperty = parameters.externObjectTypeProperty;
    } else if (
      typeof parameters.externObjectTypeProperty === "object" &&
      parameters.externObjectTypeProperty instanceof ExternObjectType
    ) {
      this.externObjectTypeProperty = purify.Maybe.of(
        parameters.externObjectTypeProperty,
      );
    } else if (typeof parameters.externObjectTypeProperty === "undefined") {
      this.externObjectTypeProperty = purify.Maybe.empty();
    } else {
      this.externObjectTypeProperty =
        parameters.externObjectTypeProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.externProperty)) {
      this.externProperty = parameters.externProperty;
    } else if (typeof parameters.externProperty === "object") {
      this.externProperty = purify.Maybe.of(parameters.externProperty);
    } else if (typeof parameters.externProperty === "string") {
      this.externProperty = purify.Maybe.of(
        dataFactory.namedNode(parameters.externProperty),
      );
    } else if (typeof parameters.externProperty === "undefined") {
      this.externProperty = purify.Maybe.empty();
    } else {
      this.externProperty = parameters.externProperty as never;
    }

    if (purify.Maybe.isMaybe(parameters.inlineProperty)) {
      this.inlineProperty = parameters.inlineProperty;
    } else if (
      typeof parameters.inlineProperty === "object" &&
      parameters.inlineProperty instanceof InlineNodeShape
    ) {
      this.inlineProperty = purify.Maybe.of(parameters.inlineProperty);
    } else if (typeof parameters.inlineProperty === "undefined") {
      this.inlineProperty = purify.Maybe.empty();
    } else {
      this.inlineProperty = parameters.inlineProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: ExternPropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(left, right, (left, right) => left.equals(right)))(
          this.externObjectTypeProperty,
          other.externObjectTypeProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "externObjectTypeProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.externProperty,
          other.externProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "externProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(left, right, (left, right) => left.equals(right)))(
          this.inlineProperty,
          other.inlineProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inlineProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.externObjectTypeProperty.ifJust((_value0) => {
      _value0.hash(_hasher);
    });
    this.externProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.inlineProperty.ifJust((_value0) => {
      _value0.hash(_hasher);
    });
    return _hasher;
  }

  toJson(): ExternPropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        externObjectTypeProperty: this.externObjectTypeProperty
          .map((_item) => _item.toJson())
          .extract(),
        externProperty: this.externProperty
          .map((_item) =>
            _item.termType === "BlankNode"
              ? { "@id": `_:${_item.value}` }
              : { "@id": _item.value },
          )
          .extract(),
        inlineProperty: this.inlineProperty
          .map((_item) => _item.toJson())
          .extract(),
      } satisfies ExternPropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/externObjectTypeProperty"),
      this.externObjectTypeProperty.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/externProperty"),
      this.externProperty,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/inlineProperty"),
      this.inlineProperty.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace ExternPropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "ExternPropertiesNodeShape";
    readonly externObjectTypeProperty: ExternObjectType.Json | undefined;
    readonly externProperty: { readonly "@id": string } | undefined;
    readonly inlineProperty: InlineNodeShape.Json | undefined;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      externObjectTypeProperty: purify.Maybe<ExternObjectType>;
      externProperty: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
      inlineProperty: purify.Maybe<InlineNodeShape>;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const externObjectTypeProperty = purify.Maybe.fromNullable(
      _jsonObject["externObjectTypeProperty"],
    ).map((_item) => ExternObjectType.fromJson(_item).unsafeCoerce());
    const externProperty = purify.Maybe.fromNullable(
      _jsonObject["externProperty"],
    ).map((_item) =>
      _item["@id"].startsWith("_:")
        ? dataFactory.blankNode(_item["@id"].substring(2))
        : dataFactory.namedNode(_item["@id"]),
    );
    const inlineProperty = purify.Maybe.fromNullable(
      _jsonObject["inlineProperty"],
    ).map((_item) => InlineNodeShape.fromJson(_item).unsafeCoerce());
    return purify.Either.of({
      identifier,
      externObjectTypeProperty,
      externProperty,
      inlineProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ExternPropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new ExternPropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ExternPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        ExternObjectType.jsonUiSchema({
          scopePrefix: `${scopePrefix}/properties/externObjectTypeProperty`,
        }),
        { scope: `${scopePrefix}/properties/externProperty`, type: "Control" },
        InlineNodeShape.jsonUiSchema({
          scopePrefix: `${scopePrefix}/properties/inlineProperty`,
        }),
      ],
      label: "ExternPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("ExternPropertiesNodeShape"),
      externObjectTypeProperty: ExternObjectType.jsonZodSchema().optional(),
      externProperty: zod.object({ "@id": zod.string().min(1) }).optional(),
      inlineProperty: InlineNodeShape.jsonZodSchema().optional(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      externObjectTypeProperty: purify.Maybe<ExternObjectType>;
      externProperty: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
      inlineProperty: purify.Maybe<InlineNodeShape>;
    }
  > {
    const identifier = _resource.identifier;
    const _externObjectTypePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<ExternObjectType>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://example.com/externObjectTypeProperty"),
          { unique: true },
        )
        .head()
        .chain((value) => value.toResource())
        .chain((_resource) =>
          ExternObjectType.fromRdf({
            ..._context,
            ignoreRdfType: true,
            languageIn: _languageIn,
            resource: _resource,
          }),
        )
        .toMaybe(),
    );
    if (_externObjectTypePropertyEither.isLeft()) {
      return _externObjectTypePropertyEither;
    }

    const externObjectTypeProperty =
      _externObjectTypePropertyEither.unsafeCoerce();
    const _externPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/externProperty"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toIdentifier())
        .toMaybe(),
    );
    if (_externPropertyEither.isLeft()) {
      return _externPropertyEither;
    }

    const externProperty = _externPropertyEither.unsafeCoerce();
    const _inlinePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<InlineNodeShape>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://example.com/inlineProperty"), {
          unique: true,
        })
        .head()
        .chain((value) => value.toResource())
        .chain((_resource) =>
          InlineNodeShape.fromRdf({
            ..._context,
            ignoreRdfType: true,
            languageIn: _languageIn,
            resource: _resource,
          }),
        )
        .toMaybe(),
    );
    if (_inlinePropertyEither.isLeft()) {
      return _inlinePropertyEither;
    }

    const inlineProperty = _inlinePropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      externObjectTypeProperty,
      externProperty,
      inlineProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof ExternPropertiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ExternPropertiesNodeShape
  > {
    return ExternPropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new ExternPropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        ExternPropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ExternPropertiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ExternPropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("externPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "externPropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(
          `${variablePrefix}ExternObjectTypeProperty`,
        ),
        predicate: dataFactory.namedNode(
          "http://example.com/externObjectTypeProperty",
        ),
        subject,
      },
      ...ExternObjectType.sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(
          `${variablePrefix}ExternObjectTypeProperty`,
        ),
        variablePrefix: `${variablePrefix}ExternObjectTypeProperty`,
      }),
      {
        object: dataFactory.variable!(`${variablePrefix}ExternProperty`),
        predicate: dataFactory.namedNode("http://example.com/externProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}InlineProperty`),
        predicate: dataFactory.namedNode("http://example.com/inlineProperty"),
        subject,
      },
      ...InlineNodeShape.sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(`${variablePrefix}InlineProperty`),
        variablePrefix: `${variablePrefix}InlineProperty`,
      }),
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("externPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "externPropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}ExternObjectTypeProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/externObjectTypeProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
          ...ExternObjectType.sparqlWherePatterns({
            ignoreRdfType: true,
            subject: dataFactory.variable!(
              `${variablePrefix}ExternObjectTypeProperty`,
            ),
            variablePrefix: `${variablePrefix}ExternObjectTypeProperty`,
          }),
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}ExternProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/externProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}InlineProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/inlineProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
          ...InlineNodeShape.sparqlWherePatterns({
            ignoreRdfType: true,
            subject: dataFactory.variable!(`${variablePrefix}InlineProperty`),
            variablePrefix: `${variablePrefix}InlineProperty`,
          }),
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape with custom rdf:type's.
 *
 * The shaclmate:fromRdfType is expected on deserialization.
 * shaclmate:toRdfType's are added an serialization.
 */
export class ExplicitRdfTypesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "ExplicitRdfTypesNodeShape";
  readonly stringProperty: string;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly stringProperty: string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.stringProperty = parameters.stringProperty;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: ExplicitRdfTypesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty, other.stringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.stringProperty);
    return _hasher;
  }

  toJson(): ExplicitRdfTypesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        stringProperty: this.stringProperty,
      } satisfies ExplicitRdfTypesNodeShape.Json),
    );
  }

  toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode("http://example.com/ToRdfType"),
      );
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode("http://example.com/FromRdfType"),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace ExplicitRdfTypesNodeShape {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/FromRdfType",
  );
  export type Json = {
    readonly "@id": string;
    readonly type: "ExplicitRdfTypesNodeShape";
    readonly stringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const stringProperty = _jsonObject["stringProperty"];
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ExplicitRdfTypesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new ExplicitRdfTypesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ExplicitRdfTypesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
      ],
      label: "ExplicitRdfTypesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("ExplicitRdfTypesNodeShape"),
      stringProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; stringProperty: string }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/FromRdfType"),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/FromRdfType)`,
          predicate: dataFactory.namedNode("http://example.com/FromRdfType"),
        }),
      );
    }

    const identifier = _resource.identifier;
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, stringProperty });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof ExplicitRdfTypesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ExplicitRdfTypesNodeShape
  > {
    return ExplicitRdfTypesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new ExplicitRdfTypesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        ExplicitRdfTypesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ExplicitRdfTypesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ExplicitRdfTypesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("explicitRdfTypesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "explicitRdfTypesNodeShape");
    return [
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              subject,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
              object: dataFactory.variable!(`${variablePrefix}RdfType`),
            },
          ]),
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("explicitRdfTypesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "explicitRdfTypesNodeShape");
    return [
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.namedNode(
                    "http://example.com/FromRdfType",
                  ),
                },
              ],
              type: "bgp" as const,
            },
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.variable!(`${variablePrefix}RdfType`),
                },
              ],
              type: "bgp" as const,
            },
          ]),
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}StringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape with sh:defaultValue properties.
 */
export class DefaultValuePropertiesNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  protected readonly _identifierPrefix?: string;
  readonly type = "DefaultValuePropertiesNodeShape";
  readonly dateProperty: Date;
  readonly dateTimeProperty: Date;
  readonly falseBooleanProperty: boolean;
  readonly numberProperty: number;
  readonly stringProperty: string;
  readonly trueBooleanProperty: boolean;

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly identifierPrefix?: string;
    readonly dateProperty?: Date;
    readonly dateTimeProperty?: Date;
    readonly falseBooleanProperty?: boolean;
    readonly numberProperty?: number;
    readonly stringProperty?: string;
    readonly trueBooleanProperty?: boolean;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this._identifierPrefix = parameters.identifierPrefix;
    if (
      typeof parameters.dateProperty === "object" &&
      parameters.dateProperty instanceof Date
    ) {
      this.dateProperty = parameters.dateProperty;
    } else if (typeof parameters.dateProperty === "undefined") {
      this.dateProperty = new Date("2018-04-09T00:00:00.000Z");
    } else {
      this.dateProperty = parameters.dateProperty as never;
    }

    if (
      typeof parameters.dateTimeProperty === "object" &&
      parameters.dateTimeProperty instanceof Date
    ) {
      this.dateTimeProperty = parameters.dateTimeProperty;
    } else if (typeof parameters.dateTimeProperty === "undefined") {
      this.dateTimeProperty = new Date("2018-04-09T10:00:00.000Z");
    } else {
      this.dateTimeProperty = parameters.dateTimeProperty as never;
    }

    if (typeof parameters.falseBooleanProperty === "boolean") {
      this.falseBooleanProperty = parameters.falseBooleanProperty;
    } else if (typeof parameters.falseBooleanProperty === "undefined") {
      this.falseBooleanProperty = false;
    } else {
      this.falseBooleanProperty = parameters.falseBooleanProperty as never;
    }

    if (typeof parameters.numberProperty === "number") {
      this.numberProperty = parameters.numberProperty;
    } else if (typeof parameters.numberProperty === "undefined") {
      this.numberProperty = 0;
    } else {
      this.numberProperty = parameters.numberProperty as never;
    }

    if (typeof parameters.stringProperty === "string") {
      this.stringProperty = parameters.stringProperty;
    } else if (typeof parameters.stringProperty === "undefined") {
      this.stringProperty = "";
    } else {
      this.stringProperty = parameters.stringProperty as never;
    }

    if (typeof parameters.trueBooleanProperty === "boolean") {
      this.trueBooleanProperty = parameters.trueBooleanProperty;
    } else if (typeof parameters.trueBooleanProperty === "undefined") {
      this.trueBooleanProperty = true;
    } else {
      this.trueBooleanProperty = parameters.trueBooleanProperty as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    return typeof this._identifier !== "undefined"
      ? this._identifier
      : dataFactory.namedNode(
          `${this.identifierPrefix}${this.hashShaclProperties(sha256.create())}`,
        );
  }

  protected get identifierPrefix(): string {
    return typeof this._identifierPrefix !== "undefined"
      ? this._identifierPrefix
      : `urn:shaclmate:${this.type}:`;
  }

  equals(other: DefaultValuePropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.identifierPrefix, other.identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $dateEquals(this.dateProperty, other.dateProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "dateProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $dateEquals(this.dateTimeProperty, other.dateTimeProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "dateTimeProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.falseBooleanProperty,
          other.falseBooleanProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "falseBooleanProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        $strictEquals(this.numberProperty, other.numberProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "numberProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.stringProperty, other.stringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "stringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.trueBooleanProperty,
          other.trueBooleanProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "trueBooleanProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.dateProperty.toISOString());
    _hasher.update(this.dateTimeProperty.toISOString());
    _hasher.update(this.falseBooleanProperty.toString());
    _hasher.update(this.numberProperty.toString());
    _hasher.update(this.stringProperty);
    _hasher.update(this.trueBooleanProperty.toString());
    return _hasher;
  }

  toJson(): DefaultValuePropertiesNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        dateProperty: this.dateProperty.toISOString().replace(/T.*$/, ""),
        dateTimeProperty: this.dateTimeProperty.toISOString(),
        falseBooleanProperty: this.falseBooleanProperty,
        numberProperty: this.numberProperty,
        stringProperty: this.stringProperty,
        trueBooleanProperty: this.trueBooleanProperty,
      } satisfies DefaultValuePropertiesNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/dateProperty"),
      this.dateProperty.getTime() !== 1523232000000
        ? rdfLiteral.toRdf(this.dateProperty, {
            dataFactory,
            datatype: dataFactory.namedNode(
              "http://www.w3.org/2001/XMLSchema#date",
            ),
          })
        : undefined,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/dateTimeProperty"),
      this.dateTimeProperty.getTime() !== 1523268000000
        ? rdfLiteral.toRdf(this.dateTimeProperty, {
            dataFactory,
            datatype: dataFactory.namedNode(
              "http://www.w3.org/2001/XMLSchema#dateTime",
            ),
          })
        : undefined,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/falseBooleanProperty"),
      this.falseBooleanProperty ? true : undefined,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/numberProperty"),
      this.numberProperty !== 0 ? this.numberProperty : undefined,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      this.stringProperty !== "" ? this.stringProperty : undefined,
    );
    _resource.add(
      dataFactory.namedNode("http://example.com/trueBooleanProperty"),
      !this.trueBooleanProperty ? false : undefined,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace DefaultValuePropertiesNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "DefaultValuePropertiesNodeShape";
    readonly dateProperty: string;
    readonly dateTimeProperty: string;
    readonly falseBooleanProperty: boolean;
    readonly numberProperty: number;
    readonly stringProperty: string;
    readonly trueBooleanProperty: boolean;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      dateProperty: Date;
      dateTimeProperty: Date;
      falseBooleanProperty: boolean;
      numberProperty: number;
      stringProperty: string;
      trueBooleanProperty: boolean;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const dateProperty = new Date(_jsonObject["dateProperty"]);
    const dateTimeProperty = new Date(_jsonObject["dateTimeProperty"]);
    const falseBooleanProperty = _jsonObject["falseBooleanProperty"];
    const numberProperty = _jsonObject["numberProperty"];
    const stringProperty = _jsonObject["stringProperty"];
    const trueBooleanProperty = _jsonObject["trueBooleanProperty"];
    return purify.Either.of({
      identifier,
      dateProperty,
      dateTimeProperty,
      falseBooleanProperty,
      numberProperty,
      stringProperty,
      trueBooleanProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, DefaultValuePropertiesNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new DefaultValuePropertiesNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "DefaultValuePropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/dateProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/dateTimeProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/falseBooleanProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/numberProperty`, type: "Control" },
        { scope: `${scopePrefix}/properties/stringProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/trueBooleanProperty`,
          type: "Control",
        },
      ],
      label: "DefaultValuePropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("DefaultValuePropertiesNodeShape"),
      dateProperty: zod.string().date(),
      dateTimeProperty: zod.string().datetime(),
      falseBooleanProperty: zod.boolean(),
      numberProperty: zod.number(),
      stringProperty: zod.string(),
      trueBooleanProperty: zod.boolean(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      dateProperty: Date;
      dateTimeProperty: Date;
      falseBooleanProperty: boolean;
      numberProperty: number;
      stringProperty: string;
      trueBooleanProperty: boolean;
    }
  > {
    const identifier = _resource.identifier;
    const _datePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      Date
    > = _resource
      .values(dataFactory.namedNode("http://example.com/dateProperty"), {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate: dataFactory.namedNode("http://example.com/dateProperty"),
            object: dataFactory.literal(
              "2018-04-09",
              dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#date"),
            ),
          }),
        ),
      )
      .chain((_value) => _value.toDate());
    if (_datePropertyEither.isLeft()) {
      return _datePropertyEither;
    }

    const dateProperty = _datePropertyEither.unsafeCoerce();
    const _dateTimePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      Date
    > = _resource
      .values(dataFactory.namedNode("http://example.com/dateTimeProperty"), {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate: dataFactory.namedNode(
              "http://example.com/dateTimeProperty",
            ),
            object: dataFactory.literal(
              "2018-04-09T10:00:00Z",
              dataFactory.namedNode(
                "http://www.w3.org/2001/XMLSchema#dateTime",
              ),
            ),
          }),
        ),
      )
      .chain((_value) => _value.toDate());
    if (_dateTimePropertyEither.isLeft()) {
      return _dateTimePropertyEither;
    }

    const dateTimeProperty = _dateTimePropertyEither.unsafeCoerce();
    const _falseBooleanPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      boolean
    > = _resource
      .values(
        dataFactory.namedNode("http://example.com/falseBooleanProperty"),
        { unique: true },
      )
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate: dataFactory.namedNode(
              "http://example.com/falseBooleanProperty",
            ),
            object: dataFactory.literal(
              "false",
              dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean"),
            ),
          }),
        ),
      )
      .chain((_value) => _value.toBoolean());
    if (_falseBooleanPropertyEither.isLeft()) {
      return _falseBooleanPropertyEither;
    }

    const falseBooleanProperty = _falseBooleanPropertyEither.unsafeCoerce();
    const _numberPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      number
    > = _resource
      .values(dataFactory.namedNode("http://example.com/numberProperty"), {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate: dataFactory.namedNode(
              "http://example.com/numberProperty",
            ),
            object: dataFactory.literal(
              "0",
              dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer"),
            ),
          }),
        ),
      )
      .chain((_value) => _value.toNumber());
    if (_numberPropertyEither.isLeft()) {
      return _numberPropertyEither;
    }

    const numberProperty = _numberPropertyEither.unsafeCoerce();
    const _stringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/stringProperty"), {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate: dataFactory.namedNode(
              "http://example.com/stringProperty",
            ),
            object: dataFactory.literal("", ""),
          }),
        ),
      )
      .chain((_value) => _value.toString());
    if (_stringPropertyEither.isLeft()) {
      return _stringPropertyEither;
    }

    const stringProperty = _stringPropertyEither.unsafeCoerce();
    const _trueBooleanPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      boolean
    > = _resource
      .values(dataFactory.namedNode("http://example.com/trueBooleanProperty"), {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate: dataFactory.namedNode(
              "http://example.com/trueBooleanProperty",
            ),
            object: dataFactory.literal(
              "true",
              dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean"),
            ),
          }),
        ),
      )
      .chain((_value) => _value.toBoolean());
    if (_trueBooleanPropertyEither.isLeft()) {
      return _trueBooleanPropertyEither;
    }

    const trueBooleanProperty = _trueBooleanPropertyEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
      dateProperty,
      dateTimeProperty,
      falseBooleanProperty,
      numberProperty,
      stringProperty,
      trueBooleanProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof DefaultValuePropertiesNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    DefaultValuePropertiesNodeShape
  > {
    return DefaultValuePropertiesNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new DefaultValuePropertiesNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        DefaultValuePropertiesNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        DefaultValuePropertiesNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      DefaultValuePropertiesNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("defaultValuePropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "defaultValuePropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}DateProperty`),
        predicate: dataFactory.namedNode("http://example.com/dateProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}DateTimeProperty`),
        predicate: dataFactory.namedNode("http://example.com/dateTimeProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}FalseBooleanProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/falseBooleanProperty",
        ),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}NumberProperty`),
        predicate: dataFactory.namedNode("http://example.com/numberProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}StringProperty`),
        predicate: dataFactory.namedNode("http://example.com/stringProperty"),
        subject,
      },
      {
        object: dataFactory.variable!(`${variablePrefix}TrueBooleanProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/trueBooleanProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("defaultValuePropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "defaultValuePropertiesNodeShape");
    return [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(`${variablePrefix}DateProperty`),
                predicate: dataFactory.namedNode(
                  "http://example.com/dateProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}DateTimeProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/dateTimeProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}FalseBooleanProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/falseBooleanProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}NumberProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/numberProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}StringProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/stringProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}TrueBooleanProperty`,
                ),
                predicate: dataFactory.namedNode(
                  "http://example.com/trueBooleanProperty",
                ),
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Base interface for other node shapes.
 */
export interface BaseInterfaceWithPropertiesNodeShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type:
    | "BaseInterfaceWithPropertiesNodeShape"
    | "BaseInterfaceWithoutPropertiesNodeShape"
    | "ConcreteChildInterfaceNodeShape"
    | "ConcreteParentInterfaceNodeShape";
  readonly baseStringProperty: string;
}

export namespace BaseInterfaceWithPropertiesNodeShapeStatic {
  export function create(parameters: {
    readonly identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly baseStringProperty: string;
  }): BaseInterfaceWithPropertiesNodeShape {
    let identifier: rdfjs.BlankNode | rdfjs.NamedNode;
    if (typeof parameters.identifier === "object") {
      identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      identifier = parameters.identifier as never;
    }

    const type = "BaseInterfaceWithPropertiesNodeShape" as const;
    const baseStringProperty = parameters.baseStringProperty;
    return { identifier, type, baseStringProperty };
  }

  export function equals(
    left: BaseInterfaceWithPropertiesNodeShape,
    right: BaseInterfaceWithPropertiesNodeShape,
  ): $EqualsResult {
    return $booleanEquals(left.identifier, right.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(left.type, right.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          left.baseStringProperty,
          right.baseStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "baseStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/BaseInterfaceWithPropertiesNodeShape",
  );
  export type Json = {
    readonly "@id": string;
    readonly type:
      | "BaseInterfaceWithPropertiesNodeShape"
      | "BaseInterfaceWithoutPropertiesNodeShape"
      | "ConcreteChildInterfaceNodeShape"
      | "ConcreteParentInterfaceNodeShape";
    readonly baseStringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type:
        | "BaseInterfaceWithPropertiesNodeShape"
        | "BaseInterfaceWithoutPropertiesNodeShape"
        | "ConcreteChildInterfaceNodeShape"
        | "ConcreteParentInterfaceNodeShape";
      baseStringProperty: string;
    }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const type = "BaseInterfaceWithPropertiesNodeShape" as const;
    const baseStringProperty = _jsonObject["baseStringProperty"];
    return purify.Either.of({ identifier, type, baseStringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, BaseInterfaceWithPropertiesNodeShape> {
    return (
      BaseInterfaceWithoutPropertiesNodeShapeStatic.fromJson(
        json,
      ) as purify.Either<zod.ZodError, BaseInterfaceWithPropertiesNodeShape>
    ).altLazy(() => propertiesFromJson(json));
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "BaseInterfaceWithPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/baseStringProperty`,
          type: "Control",
        },
      ],
      label: "BaseInterfaceWithPropertiesNodeShape",
      type: "Group",
    };
  }

  export function toJson(
    _baseInterfaceWithPropertiesNodeShape: BaseInterfaceWithPropertiesNodeShape,
  ): BaseInterfaceWithPropertiesNodeShapeStatic.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _baseInterfaceWithPropertiesNodeShape.identifier.termType ===
          "BlankNode"
            ? `_:${_baseInterfaceWithPropertiesNodeShape.identifier.value}`
            : _baseInterfaceWithPropertiesNodeShape.identifier.value,
        type: _baseInterfaceWithPropertiesNodeShape.type,
        baseStringProperty:
          _baseInterfaceWithPropertiesNodeShape.baseStringProperty,
      } satisfies BaseInterfaceWithPropertiesNodeShapeStatic.Json),
    );
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.enum([
        "BaseInterfaceWithPropertiesNodeShape",
        "BaseInterfaceWithoutPropertiesNodeShape",
        "ConcreteChildInterfaceNodeShape",
        "ConcreteParentInterfaceNodeShape",
      ]),
      baseStringProperty: zod.string(),
    });
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _baseInterfaceWithPropertiesNodeShape: BaseInterfaceWithPropertiesNodeShape,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_baseInterfaceWithPropertiesNodeShape.identifier.value);
    _hasher.update(_baseInterfaceWithPropertiesNodeShape.type);
    BaseInterfaceWithPropertiesNodeShapeStatic.hashShaclProperties(
      _baseInterfaceWithPropertiesNodeShape,
      _hasher,
    );
    return _hasher;
  }

  export function hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _baseInterfaceWithPropertiesNodeShape: BaseInterfaceWithPropertiesNodeShape,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_baseInterfaceWithPropertiesNodeShape.baseStringProperty);
    return _hasher;
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type:
        | "BaseInterfaceWithPropertiesNodeShape"
        | "BaseInterfaceWithoutPropertiesNodeShape"
        | "ConcreteChildInterfaceNodeShape"
        | "ConcreteParentInterfaceNodeShape";
      baseStringProperty: string;
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode(
          "http://example.com/BaseInterfaceWithPropertiesNodeShape",
        ),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/BaseInterfaceWithPropertiesNodeShape)`,
          predicate: dataFactory.namedNode(
            "http://example.com/BaseInterfaceWithPropertiesNodeShape",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
    const type = "BaseInterfaceWithPropertiesNodeShape" as const;
    const _baseStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/baseStringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_baseStringPropertyEither.isLeft()) {
      return _baseStringPropertyEither;
    }

    const baseStringProperty = _baseStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, type, baseStringProperty });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof BaseInterfaceWithPropertiesNodeShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    BaseInterfaceWithPropertiesNodeShape
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      BaseInterfaceWithoutPropertiesNodeShapeStatic.fromRdf(
        otherParameters,
      ) as purify.Either<
        rdfjsResource.Resource.ValueError,
        BaseInterfaceWithPropertiesNodeShape
      >
    ).altLazy(() =>
      BaseInterfaceWithPropertiesNodeShapeStatic.propertiesFromRdf(parameters),
    );
  }

  export function toRdf(
    _baseInterfaceWithPropertiesNodeShape: BaseInterfaceWithPropertiesNodeShape,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(
      _baseInterfaceWithPropertiesNodeShape.identifier,
      { mutateGraph },
    );
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://example.com/BaseInterfaceWithPropertiesNodeShape",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/baseStringProperty"),
      _baseInterfaceWithPropertiesNodeShape.baseStringProperty,
    );
    return _resource;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        BaseInterfaceWithPropertiesNodeShapeStatic.sparqlConstructTemplateTriples(
          { ignoreRdfType, subject },
        ),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        BaseInterfaceWithPropertiesNodeShapeStatic.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      BaseInterfaceWithPropertiesNodeShapeStatic.sparqlConstructQuery(
        parameters,
      ),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("baseInterfaceWithPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "baseInterfaceWithPropertiesNodeShape");
    return [
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              subject,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
              object: dataFactory.variable!(`${variablePrefix}RdfType`),
            },
          ]),
      {
        object: dataFactory.variable!(`${variablePrefix}BaseStringProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/baseStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("baseInterfaceWithPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "baseInterfaceWithPropertiesNodeShape");
    return [
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.namedNode(
                    "http://example.com/BaseInterfaceWithPropertiesNodeShape",
                  ),
                },
              ],
              type: "bgp" as const,
            },
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.variable!(`${variablePrefix}RdfType`),
                },
              ],
              type: "bgp" as const,
            },
          ]),
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}BaseStringProperty`,
            ),
            predicate: dataFactory.namedNode(
              "http://example.com/baseStringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    create,
    equals,
    fromJson,
    fromRdf,
    hash,
    hashShaclProperties,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
/**
 * Base interface for other node shapes. Put the base interface with properties above the base interface without.
 */
export interface BaseInterfaceWithoutPropertiesNodeShape
  extends BaseInterfaceWithPropertiesNodeShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type:
    | "BaseInterfaceWithoutPropertiesNodeShape"
    | "ConcreteChildInterfaceNodeShape"
    | "ConcreteParentInterfaceNodeShape";
}

export namespace BaseInterfaceWithoutPropertiesNodeShapeStatic {
  export function create(
    parameters: {
      readonly identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    } & Parameters<typeof BaseInterfaceWithPropertiesNodeShapeStatic.create>[0],
  ): BaseInterfaceWithoutPropertiesNodeShape {
    let identifier: rdfjs.BlankNode | rdfjs.NamedNode;
    if (typeof parameters.identifier === "object") {
      identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      identifier = parameters.identifier as never;
    }

    const type = "BaseInterfaceWithoutPropertiesNodeShape" as const;
    return {
      ...BaseInterfaceWithPropertiesNodeShapeStatic.create(parameters),
      identifier,
      type,
    };
  }

  export function equals(
    left: BaseInterfaceWithoutPropertiesNodeShape,
    right: BaseInterfaceWithoutPropertiesNodeShape,
  ): $EqualsResult {
    return BaseInterfaceWithPropertiesNodeShapeStatic.equals(left, right);
  }

  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/BaseInterfaceWithoutPropertiesNodeShape",
  );
  export type Json = BaseInterfaceWithPropertiesNodeShapeStatic.Json;

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type:
        | "BaseInterfaceWithoutPropertiesNodeShape"
        | "ConcreteChildInterfaceNodeShape"
        | "ConcreteParentInterfaceNodeShape";
    } & $UnwrapR<
      ReturnType<
        typeof BaseInterfaceWithPropertiesNodeShapeStatic.propertiesFromJson
      >
    >
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const _super0Either =
      BaseInterfaceWithPropertiesNodeShapeStatic.propertiesFromJson(
        _jsonObject,
      );
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const type = "BaseInterfaceWithoutPropertiesNodeShape" as const;
    return purify.Either.of({ ..._super0, identifier, type });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, BaseInterfaceWithoutPropertiesNodeShape> {
    return (
      ConcreteParentInterfaceNodeShapeStatic.fromJson(json) as purify.Either<
        zod.ZodError,
        BaseInterfaceWithoutPropertiesNodeShape
      >
    ).altLazy(() => propertiesFromJson(json));
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        BaseInterfaceWithPropertiesNodeShapeStatic.jsonUiSchema({
          scopePrefix,
        }),
      ],
      label: "BaseInterfaceWithoutPropertiesNodeShape",
      type: "Group",
    };
  }

  export function toJson(
    _baseInterfaceWithoutPropertiesNodeShape: BaseInterfaceWithoutPropertiesNodeShape,
  ): BaseInterfaceWithoutPropertiesNodeShapeStatic.Json {
    return JSON.parse(
      JSON.stringify({
        ...BaseInterfaceWithPropertiesNodeShapeStatic.toJson(
          _baseInterfaceWithoutPropertiesNodeShape,
        ),
      } satisfies BaseInterfaceWithoutPropertiesNodeShapeStatic.Json),
    );
  }

  export function jsonZodSchema() {
    return BaseInterfaceWithPropertiesNodeShapeStatic.jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        type: zod.enum([
          "BaseInterfaceWithoutPropertiesNodeShape",
          "ConcreteChildInterfaceNodeShape",
          "ConcreteParentInterfaceNodeShape",
        ]),
      }),
    );
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _baseInterfaceWithoutPropertiesNodeShape: BaseInterfaceWithoutPropertiesNodeShape,
    _hasher: HasherT,
  ): HasherT {
    BaseInterfaceWithoutPropertiesNodeShapeStatic.hashShaclProperties(
      _baseInterfaceWithoutPropertiesNodeShape,
      _hasher,
    );
    return _hasher;
  }

  export function hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _baseInterfaceWithoutPropertiesNodeShape: BaseInterfaceWithoutPropertiesNodeShape,
    _hasher: HasherT,
  ): HasherT {
    BaseInterfaceWithPropertiesNodeShapeStatic.hashShaclProperties(
      _baseInterfaceWithoutPropertiesNodeShape,
      _hasher,
    );
    return _hasher;
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type:
        | "BaseInterfaceWithoutPropertiesNodeShape"
        | "ConcreteChildInterfaceNodeShape"
        | "ConcreteParentInterfaceNodeShape";
    } & $UnwrapR<
      ReturnType<
        typeof BaseInterfaceWithPropertiesNodeShapeStatic.propertiesFromRdf
      >
    >
  > {
    const _super0Either =
      BaseInterfaceWithPropertiesNodeShapeStatic.propertiesFromRdf({
        ..._context,
        ignoreRdfType: true,
        languageIn: _languageIn,
        resource: _resource,
      });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode(
          "http://example.com/BaseInterfaceWithoutPropertiesNodeShape",
        ),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/BaseInterfaceWithoutPropertiesNodeShape)`,
          predicate: dataFactory.namedNode(
            "http://example.com/BaseInterfaceWithoutPropertiesNodeShape",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
    const type = "BaseInterfaceWithoutPropertiesNodeShape" as const;
    return purify.Either.of({ ..._super0, identifier, type });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof BaseInterfaceWithoutPropertiesNodeShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    BaseInterfaceWithoutPropertiesNodeShape
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ConcreteParentInterfaceNodeShapeStatic.fromRdf(
        otherParameters,
      ) as purify.Either<
        rdfjsResource.Resource.ValueError,
        BaseInterfaceWithoutPropertiesNodeShape
      >
    ).altLazy(() =>
      BaseInterfaceWithoutPropertiesNodeShapeStatic.propertiesFromRdf(
        parameters,
      ),
    );
  }

  export function toRdf(
    _baseInterfaceWithoutPropertiesNodeShape: BaseInterfaceWithoutPropertiesNodeShape,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = BaseInterfaceWithPropertiesNodeShapeStatic.toRdf(
      _baseInterfaceWithoutPropertiesNodeShape,
      { ignoreRdfType: true, mutateGraph, resourceSet },
    );
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://example.com/BaseInterfaceWithoutPropertiesNodeShape",
        ),
      );
    }

    return _resource;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        BaseInterfaceWithoutPropertiesNodeShapeStatic.sparqlConstructTemplateTriples(
          { ignoreRdfType, subject },
        ),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        BaseInterfaceWithoutPropertiesNodeShapeStatic.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      BaseInterfaceWithoutPropertiesNodeShapeStatic.sparqlConstructQuery(
        parameters,
      ),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("baseInterfaceWithoutPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "baseInterfaceWithoutPropertiesNodeShape");
    return [
      ...BaseInterfaceWithPropertiesNodeShapeStatic.sparqlConstructTemplateTriples(
        { ignoreRdfType: true, subject, variablePrefix },
      ),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              subject,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
              object: dataFactory.variable!(`${variablePrefix}RdfType`),
            },
          ]),
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("baseInterfaceWithoutPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "baseInterfaceWithoutPropertiesNodeShape");
    return [
      ...BaseInterfaceWithPropertiesNodeShapeStatic.sparqlWherePatterns({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.namedNode(
                    "http://example.com/BaseInterfaceWithoutPropertiesNodeShape",
                  ),
                },
              ],
              type: "bgp" as const,
            },
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.variable!(`${variablePrefix}RdfType`),
                },
              ],
              type: "bgp" as const,
            },
          ]),
    ];
  }

  export const Pointers = {
    create,
    equals,
    fromJson,
    fromRdf,
    hash,
    hashShaclProperties,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
/**
 * Interface node shape that inherits the base interface and is the parent of the ConcreteChildInterfaceNodeShape.
 */
export interface ConcreteParentInterfaceNodeShape
  extends BaseInterfaceWithoutPropertiesNodeShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type:
    | "ConcreteChildInterfaceNodeShape"
    | "ConcreteParentInterfaceNodeShape";
  readonly parentStringProperty: string;
}

export namespace ConcreteParentInterfaceNodeShapeStatic {
  export function create(
    parameters: {
      readonly identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
      readonly parentStringProperty: string;
    } & Parameters<
      typeof BaseInterfaceWithoutPropertiesNodeShapeStatic.create
    >[0],
  ): ConcreteParentInterfaceNodeShape {
    let identifier: rdfjs.BlankNode | rdfjs.NamedNode;
    if (typeof parameters.identifier === "object") {
      identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      identifier = parameters.identifier as never;
    }

    const type = "ConcreteParentInterfaceNodeShape" as const;
    const parentStringProperty = parameters.parentStringProperty;
    return {
      ...BaseInterfaceWithoutPropertiesNodeShapeStatic.create(parameters),
      identifier,
      type,
      parentStringProperty,
    };
  }

  export function equals(
    left: ConcreteParentInterfaceNodeShape,
    right: ConcreteParentInterfaceNodeShape,
  ): $EqualsResult {
    return BaseInterfaceWithoutPropertiesNodeShapeStatic.equals(
      left,
      right,
    ).chain(() =>
      $strictEquals(
        left.parentStringProperty,
        right.parentStringProperty,
      ).mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "parentStringProperty",
        propertyValuesUnequal,
        type: "Property" as const,
      })),
    );
  }

  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteParentInterfaceNodeShape",
  );
  export type Json = {
    readonly parentStringProperty: string;
  } & BaseInterfaceWithoutPropertiesNodeShapeStatic.Json;

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type:
        | "ConcreteChildInterfaceNodeShape"
        | "ConcreteParentInterfaceNodeShape";
      parentStringProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof BaseInterfaceWithoutPropertiesNodeShapeStatic.propertiesFromJson
      >
    >
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const _super0Either =
      BaseInterfaceWithoutPropertiesNodeShapeStatic.propertiesFromJson(
        _jsonObject,
      );
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const type = "ConcreteParentInterfaceNodeShape" as const;
    const parentStringProperty = _jsonObject["parentStringProperty"];
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      parentStringProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ConcreteParentInterfaceNodeShape> {
    return (
      ConcreteChildInterfaceNodeShape.fromJson(json) as purify.Either<
        zod.ZodError,
        ConcreteParentInterfaceNodeShape
      >
    ).altLazy(() => propertiesFromJson(json));
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        BaseInterfaceWithoutPropertiesNodeShapeStatic.jsonUiSchema({
          scopePrefix,
        }),
        {
          scope: `${scopePrefix}/properties/parentStringProperty`,
          type: "Control",
        },
      ],
      label: "ConcreteParentInterfaceNodeShape",
      type: "Group",
    };
  }

  export function toJson(
    _concreteParentInterfaceNodeShape: ConcreteParentInterfaceNodeShape,
  ): ConcreteParentInterfaceNodeShapeStatic.Json {
    return JSON.parse(
      JSON.stringify({
        ...BaseInterfaceWithoutPropertiesNodeShapeStatic.toJson(
          _concreteParentInterfaceNodeShape,
        ),
        parentStringProperty:
          _concreteParentInterfaceNodeShape.parentStringProperty,
      } satisfies ConcreteParentInterfaceNodeShapeStatic.Json),
    );
  }

  export function jsonZodSchema() {
    return BaseInterfaceWithoutPropertiesNodeShapeStatic.jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        type: zod.enum([
          "ConcreteChildInterfaceNodeShape",
          "ConcreteParentInterfaceNodeShape",
        ]),
        parentStringProperty: zod.string(),
      }),
    );
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _concreteParentInterfaceNodeShape: ConcreteParentInterfaceNodeShape,
    _hasher: HasherT,
  ): HasherT {
    ConcreteParentInterfaceNodeShapeStatic.hashShaclProperties(
      _concreteParentInterfaceNodeShape,
      _hasher,
    );
    return _hasher;
  }

  export function hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _concreteParentInterfaceNodeShape: ConcreteParentInterfaceNodeShape,
    _hasher: HasherT,
  ): HasherT {
    BaseInterfaceWithoutPropertiesNodeShapeStatic.hashShaclProperties(
      _concreteParentInterfaceNodeShape,
      _hasher,
    );
    _hasher.update(_concreteParentInterfaceNodeShape.parentStringProperty);
    return _hasher;
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type:
        | "ConcreteChildInterfaceNodeShape"
        | "ConcreteParentInterfaceNodeShape";
      parentStringProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof BaseInterfaceWithoutPropertiesNodeShapeStatic.propertiesFromRdf
      >
    >
  > {
    const _super0Either =
      BaseInterfaceWithoutPropertiesNodeShapeStatic.propertiesFromRdf({
        ..._context,
        ignoreRdfType: true,
        languageIn: _languageIn,
        resource: _resource,
      });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode(
          "http://example.com/ConcreteParentInterfaceNodeShape",
        ),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/ConcreteParentInterfaceNodeShape)`,
          predicate: dataFactory.namedNode(
            "http://example.com/ConcreteParentInterfaceNodeShape",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
    const type = "ConcreteParentInterfaceNodeShape" as const;
    const _parentStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(
        dataFactory.namedNode("http://example.com/parentStringProperty"),
        { unique: true },
      )
      .head()
      .chain((_value) => _value.toString());
    if (_parentStringPropertyEither.isLeft()) {
      return _parentStringPropertyEither;
    }

    const parentStringProperty = _parentStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      parentStringProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof ConcreteParentInterfaceNodeShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ConcreteParentInterfaceNodeShape
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ConcreteChildInterfaceNodeShape.fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ConcreteParentInterfaceNodeShape
      >
    ).altLazy(() =>
      ConcreteParentInterfaceNodeShapeStatic.propertiesFromRdf(parameters),
    );
  }

  export function toRdf(
    _concreteParentInterfaceNodeShape: ConcreteParentInterfaceNodeShape,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = BaseInterfaceWithoutPropertiesNodeShapeStatic.toRdf(
      _concreteParentInterfaceNodeShape,
      { ignoreRdfType: true, mutateGraph, resourceSet },
    );
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://example.com/ConcreteParentInterfaceNodeShape",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/parentStringProperty"),
      _concreteParentInterfaceNodeShape.parentStringProperty,
    );
    return _resource;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        ConcreteParentInterfaceNodeShapeStatic.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ConcreteParentInterfaceNodeShapeStatic.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ConcreteParentInterfaceNodeShapeStatic.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("concreteParentInterfaceNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteParentInterfaceNodeShape");
    return [
      ...BaseInterfaceWithoutPropertiesNodeShapeStatic.sparqlConstructTemplateTriples(
        { ignoreRdfType: true, subject, variablePrefix },
      ),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              subject,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
              object: dataFactory.variable!(`${variablePrefix}RdfType`),
            },
          ]),
      {
        object: dataFactory.variable!(`${variablePrefix}ParentStringProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/parentStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("concreteParentInterfaceNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteParentInterfaceNodeShape");
    return [
      ...BaseInterfaceWithoutPropertiesNodeShapeStatic.sparqlWherePatterns({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.namedNode(
                    "http://example.com/ConcreteParentInterfaceNodeShape",
                  ),
                },
              ],
              type: "bgp" as const,
            },
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.variable!(`${variablePrefix}RdfType`),
                },
              ],
              type: "bgp" as const,
            },
          ]),
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ParentStringProperty`,
            ),
            predicate: dataFactory.namedNode(
              "http://example.com/parentStringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    create,
    equals,
    fromJson,
    fromRdf,
    hash,
    hashShaclProperties,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
/**
 * Child interface of ConcreteParentInterfaceNodeShape. Should inherit properties and node kinds.
 */
export interface ConcreteChildInterfaceNodeShape
  extends ConcreteParentInterfaceNodeShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "ConcreteChildInterfaceNodeShape";
  readonly childStringProperty: string;
}

export namespace ConcreteChildInterfaceNodeShape {
  export function create(
    parameters: {
      readonly identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
      readonly childStringProperty: string;
    } & Parameters<typeof ConcreteParentInterfaceNodeShapeStatic.create>[0],
  ): ConcreteChildInterfaceNodeShape {
    let identifier: rdfjs.BlankNode | rdfjs.NamedNode;
    if (typeof parameters.identifier === "object") {
      identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      identifier = dataFactory.namedNode(parameters.identifier);
    } else {
      identifier = parameters.identifier as never;
    }

    const type = "ConcreteChildInterfaceNodeShape" as const;
    const childStringProperty = parameters.childStringProperty;
    return {
      ...ConcreteParentInterfaceNodeShapeStatic.create(parameters),
      identifier,
      type,
      childStringProperty,
    };
  }

  export function equals(
    left: ConcreteChildInterfaceNodeShape,
    right: ConcreteChildInterfaceNodeShape,
  ): $EqualsResult {
    return ConcreteParentInterfaceNodeShapeStatic.equals(left, right).chain(
      () =>
        $strictEquals(
          left.childStringProperty,
          right.childStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "childStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
    );
  }

  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteChildInterfaceNodeShape",
  );
  export type Json = {
    readonly childStringProperty: string;
  } & ConcreteParentInterfaceNodeShapeStatic.Json;

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "ConcreteChildInterfaceNodeShape";
      childStringProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof ConcreteParentInterfaceNodeShapeStatic.propertiesFromJson
      >
    >
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const _super0Either =
      ConcreteParentInterfaceNodeShapeStatic.propertiesFromJson(_jsonObject);
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const type = "ConcreteChildInterfaceNodeShape" as const;
    const childStringProperty = _jsonObject["childStringProperty"];
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      childStringProperty,
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ConcreteChildInterfaceNodeShape> {
    return propertiesFromJson(json);
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        ConcreteParentInterfaceNodeShapeStatic.jsonUiSchema({ scopePrefix }),
        {
          scope: `${scopePrefix}/properties/childStringProperty`,
          type: "Control",
        },
      ],
      label: "ConcreteChildInterfaceNodeShape",
      type: "Group",
    };
  }

  export function toJson(
    _concreteChildInterfaceNodeShape: ConcreteChildInterfaceNodeShape,
  ): ConcreteChildInterfaceNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        ...ConcreteParentInterfaceNodeShapeStatic.toJson(
          _concreteChildInterfaceNodeShape,
        ),
        childStringProperty:
          _concreteChildInterfaceNodeShape.childStringProperty,
      } satisfies ConcreteChildInterfaceNodeShape.Json),
    );
  }

  export function jsonZodSchema() {
    return ConcreteParentInterfaceNodeShapeStatic.jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        type: zod.literal("ConcreteChildInterfaceNodeShape"),
        childStringProperty: zod.string(),
      }),
    );
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _concreteChildInterfaceNodeShape: ConcreteChildInterfaceNodeShape,
    _hasher: HasherT,
  ): HasherT {
    ConcreteChildInterfaceNodeShape.hashShaclProperties(
      _concreteChildInterfaceNodeShape,
      _hasher,
    );
    return _hasher;
  }

  export function hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _concreteChildInterfaceNodeShape: ConcreteChildInterfaceNodeShape,
    _hasher: HasherT,
  ): HasherT {
    ConcreteParentInterfaceNodeShapeStatic.hashShaclProperties(
      _concreteChildInterfaceNodeShape,
      _hasher,
    );
    _hasher.update(_concreteChildInterfaceNodeShape.childStringProperty);
    return _hasher;
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "ConcreteChildInterfaceNodeShape";
      childStringProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof ConcreteParentInterfaceNodeShapeStatic.propertiesFromRdf
      >
    >
  > {
    const _super0Either =
      ConcreteParentInterfaceNodeShapeStatic.propertiesFromRdf({
        ..._context,
        ignoreRdfType: true,
        languageIn: _languageIn,
        resource: _resource,
      });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode(
          "http://example.com/ConcreteChildInterfaceNodeShape",
        ),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/ConcreteChildInterfaceNodeShape)`,
          predicate: dataFactory.namedNode(
            "http://example.com/ConcreteChildInterfaceNodeShape",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
    const type = "ConcreteChildInterfaceNodeShape" as const;
    const _childStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/childStringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_childStringPropertyEither.isLeft()) {
      return _childStringPropertyEither;
    }

    const childStringProperty = _childStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      childStringProperty,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof ConcreteChildInterfaceNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ConcreteChildInterfaceNodeShape
  > {
    return ConcreteChildInterfaceNodeShape.propertiesFromRdf(parameters);
  }

  export function toRdf(
    _concreteChildInterfaceNodeShape: ConcreteChildInterfaceNodeShape,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = ConcreteParentInterfaceNodeShapeStatic.toRdf(
      _concreteChildInterfaceNodeShape,
      { ignoreRdfType: true, mutateGraph, resourceSet },
    );
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://example.com/ConcreteChildInterfaceNodeShape",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/childStringProperty"),
      _concreteChildInterfaceNodeShape.childStringProperty,
    );
    return _resource;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        ConcreteChildInterfaceNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ConcreteChildInterfaceNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ConcreteChildInterfaceNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("concreteChildInterfaceNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteChildInterfaceNodeShape");
    return [
      ...ConcreteParentInterfaceNodeShapeStatic.sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              subject,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
              object: dataFactory.variable!(`${variablePrefix}RdfType`),
            },
          ]),
      {
        object: dataFactory.variable!(`${variablePrefix}ChildStringProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/childStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("concreteChildInterfaceNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteChildInterfaceNodeShape");
    return [
      ...ConcreteParentInterfaceNodeShapeStatic.sparqlWherePatterns({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.namedNode(
                    "http://example.com/ConcreteChildInterfaceNodeShape",
                  ),
                },
              ],
              type: "bgp" as const,
            },
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.variable!(`${variablePrefix}RdfType`),
                },
              ],
              type: "bgp" as const,
            },
          ]),
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ChildStringProperty`,
            ),
            predicate: dataFactory.namedNode(
              "http://example.com/childStringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    create,
    equals,
    fromJson,
    fromRdf,
    hash,
    hashShaclProperties,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
/**
 * Node shape that serves as an abstract base class for child node shapes.
 *
 * It's marked abstract in TypeScript and not exported from the module.
 *
 * Common pattern: put the minting strategy and nodeKind on an ABC.
 */
export abstract class AbstractBaseClassWithPropertiesNodeShape {
  abstract readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  protected readonly _identifierPrefix?: string;
  abstract readonly type:
    | "ConcreteChildClassNodeShape"
    | "ConcreteParentClassNodeShape";
  readonly abcStringProperty: string;

  constructor(parameters: {
    readonly identifierPrefix?: string;
    readonly abcStringProperty: string;
  }) {
    this._identifierPrefix = parameters.identifierPrefix;
    this.abcStringProperty = parameters.abcStringProperty;
  }

  protected get identifierPrefix(): string {
    return typeof this._identifierPrefix !== "undefined"
      ? this._identifierPrefix
      : `urn:shaclmate:${this.type}:`;
  }

  equals(other: AbstractBaseClassWithPropertiesNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.identifierPrefix, other.identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.abcStringProperty, other.abcStringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "abcStringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.abcStringProperty);
    return _hasher;
  }

  toJson(): AbstractBaseClassWithPropertiesNodeShapeStatic.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        abcStringProperty: this.abcStringProperty,
      } satisfies AbstractBaseClassWithPropertiesNodeShapeStatic.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/abcStringProperty"),
      this.abcStringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace AbstractBaseClassWithPropertiesNodeShapeStatic {
  export type Json = {
    readonly "@id": string;
    readonly type:
      | "ConcreteChildClassNodeShape"
      | "ConcreteParentClassNodeShape";
    readonly abcStringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; abcStringProperty: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const abcStringProperty = _jsonObject["abcStringProperty"];
    return purify.Either.of({ identifier, abcStringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, AbstractBaseClassWithPropertiesNodeShape> {
    return AbstractBaseClassWithoutPropertiesNodeShapeStatic.fromJson(
      json,
    ) as purify.Either<zod.ZodError, AbstractBaseClassWithPropertiesNodeShape>;
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "AbstractBaseClassWithPropertiesNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/abcStringProperty`,
          type: "Control",
        },
      ],
      label: "AbstractBaseClassWithPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.enum([
        "ConcreteChildClassNodeShape",
        "ConcreteParentClassNodeShape",
      ]),
      abcStringProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; abcStringProperty: string }
  > {
    const identifier = _resource.identifier;
    const _abcStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/abcStringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_abcStringPropertyEither.isLeft()) {
      return _abcStringPropertyEither;
    }

    const abcStringProperty = _abcStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, abcStringProperty });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof AbstractBaseClassWithPropertiesNodeShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    AbstractBaseClassWithPropertiesNodeShape
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return AbstractBaseClassWithoutPropertiesNodeShapeStatic.fromRdf(
      otherParameters,
    ) as purify.Either<
      rdfjsResource.Resource.ValueError,
      AbstractBaseClassWithPropertiesNodeShape
    >;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        AbstractBaseClassWithPropertiesNodeShapeStatic.sparqlConstructTemplateTriples(
          { ignoreRdfType, subject },
        ),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        AbstractBaseClassWithPropertiesNodeShapeStatic.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      AbstractBaseClassWithPropertiesNodeShapeStatic.sparqlConstructQuery(
        parameters,
      ),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassWithPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassWithPropertiesNodeShape");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}AbcStringProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/abcStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassWithPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassWithPropertiesNodeShape");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}AbcStringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/abcStringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Abstract base for other node shapes. Put the ABC with properties above the ABC without.
 */
export abstract class AbstractBaseClassWithoutPropertiesNodeShape extends AbstractBaseClassWithPropertiesNodeShape {
  abstract override readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  abstract override readonly type:
    | "ConcreteChildClassNodeShape"
    | "ConcreteParentClassNodeShape";

  // biome-ignore lint/complexity/noUselessConstructor: Always have a constructor
  constructor(
    parameters: { readonly identifierPrefix?: string } & ConstructorParameters<
      typeof AbstractBaseClassWithPropertiesNodeShape
    >[0],
  ) {
    super(parameters);
  }

  protected override get identifierPrefix(): string {
    return typeof this._identifierPrefix !== "undefined"
      ? this._identifierPrefix
      : `urn:shaclmate:${this.type}:`;
  }

  override toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = super.toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace AbstractBaseClassWithoutPropertiesNodeShapeStatic {
  export type Json = AbstractBaseClassWithPropertiesNodeShapeStatic.Json;

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode } & $UnwrapR<
      ReturnType<
        typeof AbstractBaseClassWithPropertiesNodeShapeStatic.propertiesFromJson
      >
    >
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const _super0Either =
      AbstractBaseClassWithPropertiesNodeShapeStatic.propertiesFromJson(
        _jsonObject,
      );
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    return purify.Either.of({ ..._super0, identifier });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, AbstractBaseClassWithoutPropertiesNodeShape> {
    return ConcreteParentClassNodeShapeStatic.fromJson(json) as purify.Either<
      zod.ZodError,
      AbstractBaseClassWithoutPropertiesNodeShape
    >;
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        AbstractBaseClassWithPropertiesNodeShapeStatic.jsonUiSchema({
          scopePrefix,
        }),
      ],
      label: "AbstractBaseClassWithoutPropertiesNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return AbstractBaseClassWithPropertiesNodeShapeStatic.jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        type: zod.enum([
          "ConcreteChildClassNodeShape",
          "ConcreteParentClassNodeShape",
        ]),
      }),
    );
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode } & $UnwrapR<
      ReturnType<
        typeof AbstractBaseClassWithPropertiesNodeShapeStatic.propertiesFromRdf
      >
    >
  > {
    const _super0Either =
      AbstractBaseClassWithPropertiesNodeShapeStatic.propertiesFromRdf({
        ..._context,
        ignoreRdfType: true,
        languageIn: _languageIn,
        resource: _resource,
      });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    const identifier = _resource.identifier;
    return purify.Either.of({ ..._super0, identifier });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof AbstractBaseClassWithoutPropertiesNodeShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    AbstractBaseClassWithoutPropertiesNodeShape
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return ConcreteParentClassNodeShapeStatic.fromRdf(
      otherParameters,
    ) as purify.Either<
      rdfjsResource.Resource.ValueError,
      AbstractBaseClassWithoutPropertiesNodeShape
    >;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        AbstractBaseClassWithoutPropertiesNodeShapeStatic.sparqlConstructTemplateTriples(
          { ignoreRdfType, subject },
        ),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        AbstractBaseClassWithoutPropertiesNodeShapeStatic.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      AbstractBaseClassWithoutPropertiesNodeShapeStatic.sparqlConstructQuery(
        parameters,
      ),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassWithoutPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassWithoutPropertiesNodeShape");
    return [
      ...AbstractBaseClassWithPropertiesNodeShapeStatic.sparqlConstructTemplateTriples(
        { ignoreRdfType: true, subject, variablePrefix },
      ),
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassWithoutPropertiesNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassWithoutPropertiesNodeShape");
    return [
      ...AbstractBaseClassWithPropertiesNodeShapeStatic.sparqlWherePatterns({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Class node shape that inherits the abstract base class and is the parent of the ConcreteChildClassNodeShape.
 */
export class ConcreteParentClassNodeShape extends AbstractBaseClassWithoutPropertiesNodeShape {
  protected _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  override readonly type:
    | "ConcreteChildClassNodeShape"
    | "ConcreteParentClassNodeShape" = "ConcreteParentClassNodeShape";
  readonly parentStringProperty: string;

  constructor(
    parameters: {
      readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
      readonly identifierPrefix?: string;
      readonly parentStringProperty: string;
    } & ConstructorParameters<
      typeof AbstractBaseClassWithoutPropertiesNodeShape
    >[0],
  ) {
    super(parameters);
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }

    this.parentStringProperty = parameters.parentStringProperty;
  }

  override get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.namedNode(
        `${this.identifierPrefix}${this.hashShaclProperties(sha256.create())}`,
      );
    }
    return this._identifier;
  }

  protected override get identifierPrefix(): string {
    return typeof this._identifierPrefix !== "undefined"
      ? this._identifierPrefix
      : `urn:shaclmate:${this.type}:`;
  }

  override equals(other: ConcreteParentClassNodeShape): $EqualsResult {
    return super
      .equals(other)
      .chain(() =>
        $strictEquals(
          this.parentStringProperty,
          other.parentStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "parentStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  override hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected override hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    super.hashShaclProperties(_hasher);
    _hasher.update(this.parentStringProperty);
    return _hasher;
  }

  override toJson(): ConcreteParentClassNodeShapeStatic.Json {
    return JSON.parse(
      JSON.stringify({
        ...super.toJson(),
        parentStringProperty: this.parentStringProperty,
      } satisfies ConcreteParentClassNodeShapeStatic.Json),
    );
  }

  override toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = super.toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://example.com/ConcreteParentClassNodeShape",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/parentStringProperty"),
      this.parentStringProperty,
    );
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace ConcreteParentClassNodeShapeStatic {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteParentClassNodeShape",
  );
  export type Json = {
    readonly parentStringProperty: string;
  } & AbstractBaseClassWithoutPropertiesNodeShapeStatic.Json;

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      parentStringProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof AbstractBaseClassWithoutPropertiesNodeShapeStatic.propertiesFromJson
      >
    >
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const _super0Either =
      AbstractBaseClassWithoutPropertiesNodeShapeStatic.propertiesFromJson(
        _jsonObject,
      );
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const parentStringProperty = _jsonObject["parentStringProperty"];
    return purify.Either.of({ ..._super0, identifier, parentStringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ConcreteParentClassNodeShape> {
    return (
      ConcreteChildClassNodeShape.fromJson(json) as purify.Either<
        zod.ZodError,
        ConcreteParentClassNodeShape
      >
    ).altLazy(() =>
      propertiesFromJson(json).map(
        (properties) => new ConcreteParentClassNodeShape(properties),
      ),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        AbstractBaseClassWithoutPropertiesNodeShapeStatic.jsonUiSchema({
          scopePrefix,
        }),
        {
          scope: `${scopePrefix}/properties/parentStringProperty`,
          type: "Control",
        },
      ],
      label: "ConcreteParentClassNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return AbstractBaseClassWithoutPropertiesNodeShapeStatic.jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        type: zod.enum([
          "ConcreteChildClassNodeShape",
          "ConcreteParentClassNodeShape",
        ]),
        parentStringProperty: zod.string(),
      }),
    );
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      parentStringProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof AbstractBaseClassWithoutPropertiesNodeShapeStatic.propertiesFromRdf
      >
    >
  > {
    const _super0Either =
      AbstractBaseClassWithoutPropertiesNodeShapeStatic.propertiesFromRdf({
        ..._context,
        ignoreRdfType: true,
        languageIn: _languageIn,
        resource: _resource,
      });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode(
          "http://example.com/ConcreteParentClassNodeShape",
        ),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/ConcreteParentClassNodeShape)`,
          predicate: dataFactory.namedNode(
            "http://example.com/ConcreteParentClassNodeShape",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
    const _parentStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(
        dataFactory.namedNode("http://example.com/parentStringProperty"),
        { unique: true },
      )
      .head()
      .chain((_value) => _value.toString());
    if (_parentStringPropertyEither.isLeft()) {
      return _parentStringPropertyEither;
    }

    const parentStringProperty = _parentStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ ..._super0, identifier, parentStringProperty });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof ConcreteParentClassNodeShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ConcreteParentClassNodeShape
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ConcreteChildClassNodeShape.fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ConcreteParentClassNodeShape
      >
    ).altLazy(() =>
      ConcreteParentClassNodeShapeStatic.propertiesFromRdf(parameters).map(
        (properties) => new ConcreteParentClassNodeShape(properties),
      ),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        ConcreteParentClassNodeShapeStatic.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ConcreteParentClassNodeShapeStatic.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ConcreteParentClassNodeShapeStatic.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("concreteParentClassNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteParentClassNodeShape");
    return [
      ...AbstractBaseClassWithoutPropertiesNodeShapeStatic.sparqlConstructTemplateTriples(
        { ignoreRdfType: true, subject, variablePrefix },
      ),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              subject,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
              object: dataFactory.variable!(`${variablePrefix}RdfType`),
            },
          ]),
      {
        object: dataFactory.variable!(`${variablePrefix}ParentStringProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/parentStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("concreteParentClassNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteParentClassNodeShape");
    return [
      ...AbstractBaseClassWithoutPropertiesNodeShapeStatic.sparqlWherePatterns({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.namedNode(
                    "http://example.com/ConcreteParentClassNodeShape",
                  ),
                },
              ],
              type: "bgp" as const,
            },
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.variable!(`${variablePrefix}RdfType`),
                },
              ],
              type: "bgp" as const,
            },
          ]),
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ParentStringProperty`,
            ),
            predicate: dataFactory.namedNode(
              "http://example.com/parentStringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Child (class) of ConcreteParentClassNodeShape. Should inherit properties, node kinds, and minting strategy.
 */
export class ConcreteChildClassNodeShape extends ConcreteParentClassNodeShape {
  override readonly type = "ConcreteChildClassNodeShape";
  readonly childStringProperty: string;

  constructor(
    parameters: {
      readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
      readonly identifierPrefix?: string;
      readonly childStringProperty: string;
    } & ConstructorParameters<typeof ConcreteParentClassNodeShape>[0],
  ) {
    super(parameters);
    this.childStringProperty = parameters.childStringProperty;
  }

  override get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.namedNode(
        `${this.identifierPrefix}${this.hashShaclProperties(sha256.create())}`,
      );
    }
    return this._identifier;
  }

  protected override get identifierPrefix(): string {
    return typeof this._identifierPrefix !== "undefined"
      ? this._identifierPrefix
      : `urn:shaclmate:${this.type}:`;
  }

  override equals(other: ConcreteChildClassNodeShape): $EqualsResult {
    return super
      .equals(other)
      .chain(() =>
        $strictEquals(
          this.childStringProperty,
          other.childStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "childStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  override hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected override hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    super.hashShaclProperties(_hasher);
    _hasher.update(this.childStringProperty);
    return _hasher;
  }

  override toJson(): ConcreteChildClassNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        ...super.toJson(),
        childStringProperty: this.childStringProperty,
      } satisfies ConcreteChildClassNodeShape.Json),
    );
  }

  override toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = super.toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://example.com/ConcreteChildClassNodeShape",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://example.com/childStringProperty"),
      this.childStringProperty,
    );
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace ConcreteChildClassNodeShape {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteChildClassNodeShape",
  );
  export type Json = {
    readonly childStringProperty: string;
  } & ConcreteParentClassNodeShapeStatic.Json;

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      childStringProperty: string;
    } & $UnwrapR<
      ReturnType<typeof ConcreteParentClassNodeShapeStatic.propertiesFromJson>
    >
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const _super0Either =
      ConcreteParentClassNodeShapeStatic.propertiesFromJson(_jsonObject);
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const childStringProperty = _jsonObject["childStringProperty"];
    return purify.Either.of({ ..._super0, identifier, childStringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ConcreteChildClassNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new ConcreteChildClassNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        ConcreteParentClassNodeShapeStatic.jsonUiSchema({ scopePrefix }),
        {
          scope: `${scopePrefix}/properties/childStringProperty`,
          type: "Control",
        },
      ],
      label: "ConcreteChildClassNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return ConcreteParentClassNodeShapeStatic.jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        type: zod.literal("ConcreteChildClassNodeShape"),
        childStringProperty: zod.string(),
      }),
    );
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      childStringProperty: string;
    } & $UnwrapR<
      ReturnType<typeof ConcreteParentClassNodeShapeStatic.propertiesFromRdf>
    >
  > {
    const _super0Either = ConcreteParentClassNodeShapeStatic.propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/ConcreteChildClassNodeShape"),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://example.com/ConcreteChildClassNodeShape)`,
          predicate: dataFactory.namedNode(
            "http://example.com/ConcreteChildClassNodeShape",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
    const _childStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/childStringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_childStringPropertyEither.isLeft()) {
      return _childStringPropertyEither;
    }

    const childStringProperty = _childStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ ..._super0, identifier, childStringProperty });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof ConcreteChildClassNodeShape.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ConcreteChildClassNodeShape
  > {
    return ConcreteChildClassNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new ConcreteChildClassNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        ConcreteChildClassNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ConcreteChildClassNodeShape.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ConcreteChildClassNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("concreteChildClassNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteChildClassNodeShape");
    return [
      ...ConcreteParentClassNodeShapeStatic.sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              subject,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
              object: dataFactory.variable!(`${variablePrefix}RdfType`),
            },
          ]),
      {
        object: dataFactory.variable!(`${variablePrefix}ChildStringProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/childStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("concreteChildClassNodeShape");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteChildClassNodeShape");
    return [
      ...ConcreteParentClassNodeShapeStatic.sparqlWherePatterns({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
      ...(parameters?.ignoreRdfType
        ? []
        : [
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.namedNode(
                    "http://example.com/ConcreteChildClassNodeShape",
                  ),
                },
              ],
              type: "bgp" as const,
            },
            {
              triples: [
                {
                  subject,
                  predicate: dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                  ),
                  object: dataFactory.variable!(`${variablePrefix}RdfType`),
                },
              ],
              type: "bgp" as const,
            },
          ]),
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ChildStringProperty`,
            ),
            predicate: dataFactory.namedNode(
              "http://example.com/childStringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Shape that can have a blank node or IRI as an identifier
 */
export class BlankNodeShape {
  private _identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | undefined;
  readonly type = "BlankNodeShape";

  constructor(parameters: {
    readonly identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
  }) {
    if (typeof parameters.identifier === "object") {
      this._identifier = parameters.identifier;
    } else if (typeof parameters.identifier === "string") {
      this._identifier = dataFactory.namedNode(parameters.identifier);
    } else if (typeof parameters.identifier === "undefined") {
    } else {
      this._identifier = parameters.identifier as never;
    }
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: BlankNodeShape): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    return _hasher;
  }

  toJson(): BlankNodeShape.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
      } satisfies BlankNodeShape.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace BlankNodeShape {
  export type Json = {
    readonly "@id": string;
    readonly type: "BlankNodeShape";
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    return purify.Either.of({ identifier });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, BlankNodeShape> {
    return propertiesFromJson(json).map(
      (properties) => new BlankNodeShape(properties),
    );
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "BlankNodeShape" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
      ],
      label: "BlankNodeShape",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("BlankNodeShape"),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode }
  > {
    const identifier = _resource.identifier;
    return purify.Either.of({ identifier });
  }

  export function fromRdf(
    parameters: Parameters<typeof BlankNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, BlankNodeShape> {
    return BlankNodeShape.propertiesFromRdf(parameters).map(
      (properties) => new BlankNodeShape(properties),
    );
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        BlankNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        BlankNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      BlankNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(_parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [];
  }

  export function sparqlWherePatterns(_parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * An abstract base class that will be inherited by the extern object type, showing how to mix generated and hand-written code.
 */
export abstract class AbstractBaseClassForExternObjectType {
  abstract readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  abstract readonly type: "ExternObjectType";
  readonly abcStringProperty: string;

  constructor(parameters: { readonly abcStringProperty: string }) {
    this.abcStringProperty = parameters.abcStringProperty;
  }

  equals(other: AbstractBaseClassForExternObjectType): $EqualsResult {
    return $booleanEquals(this.identifier, other.identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.abcStringProperty, other.abcStringProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "abcStringProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.identifier.value);
    _hasher.update(this.type);
    this.hashShaclProperties(_hasher);
    return _hasher;
  }

  protected hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.abcStringProperty);
    return _hasher;
  }

  toJson(): AbstractBaseClassForExternObjectTypeStatic.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.identifier.termType === "BlankNode"
            ? `_:${this.identifier.value}`
            : this.identifier.value,
        type: this.type,
        abcStringProperty: this.abcStringProperty,
      } satisfies AbstractBaseClassForExternObjectTypeStatic.Json),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.identifier, {
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://example.com/abcStringProperty"),
      this.abcStringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace AbstractBaseClassForExternObjectTypeStatic {
  export type Json = {
    readonly "@id": string;
    readonly type: "ExternObjectType";
    readonly abcStringProperty: string;
  };

  export function propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; abcStringProperty: string }
  > {
    const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);
    if (!_jsonSafeParseResult.success) {
      return purify.Left(_jsonSafeParseResult.error);
    }

    const _jsonObject = _jsonSafeParseResult.data;
    const identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const abcStringProperty = _jsonObject["abcStringProperty"];
    return purify.Either.of({ identifier, abcStringProperty });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, AbstractBaseClassForExternObjectType> {
    return ExternObjectType.fromJson(json) as purify.Either<
      zod.ZodError,
      AbstractBaseClassForExternObjectType
    >;
  }

  export function jsonSchema() {
    return zodToJsonSchema(jsonZodSchema());
  }

  export function jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "AbstractBaseClassForExternObjectType" },
              scope: `${scopePrefix}/properties/type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/abcStringProperty`,
          type: "Control",
        },
      ],
      label: "AbstractBaseClassForExternObjectType",
      type: "Group",
    };
  }

  export function jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      type: zod.literal("ExternObjectType"),
      abcStringProperty: zod.string(),
    });
  }

  export function propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    { identifier: rdfjs.BlankNode | rdfjs.NamedNode; abcStringProperty: string }
  > {
    const identifier = _resource.identifier;
    const _abcStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(dataFactory.namedNode("http://example.com/abcStringProperty"), {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_abcStringPropertyEither.isLeft()) {
      return _abcStringPropertyEither;
    }

    const abcStringProperty = _abcStringPropertyEither.unsafeCoerce();
    return purify.Either.of({ identifier, abcStringProperty });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof AbstractBaseClassForExternObjectTypeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    AbstractBaseClassForExternObjectType
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return ExternObjectType.fromRdf(otherParameters) as purify.Either<
      rdfjsResource.Resource.ValueError,
      AbstractBaseClassForExternObjectType
    >;
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        AbstractBaseClassForExternObjectTypeStatic.sparqlConstructTemplateTriples(
          { ignoreRdfType, subject },
        ),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        AbstractBaseClassForExternObjectTypeStatic.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      AbstractBaseClassForExternObjectTypeStatic.sparqlConstructQuery(
        parameters,
      ),
    );
  }

  export function sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassForExternObjectType");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassForExternObjectType");
    return [
      {
        object: dataFactory.variable!(`${variablePrefix}AbcStringProperty`),
        predicate: dataFactory.namedNode(
          "http://example.com/abcStringProperty",
        ),
        subject,
      },
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassForExternObjectType");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassForExternObjectType");
    return [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}AbcStringProperty`),
            predicate: dataFactory.namedNode(
              "http://example.com/abcStringProperty",
            ),
            subject,
          },
        ],
        type: "bgp",
      },
    ];
  }

  export const Pointers = {
    fromJson,
    fromRdf,
    jsonSchema,
    jsonUiSchema,
    jsonZodSchema,
    propertiesFromJson,
    propertiesFromRdf,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
  };
}
/**
 * Node shape that sh:xone's other node shapes. This will usually be generated as a discriminated union.
 */
export type InterfaceUnionNodeShape =
  | InterfaceUnionNodeShapeMember1
  | InterfaceUnionNodeShapeMember2a
  | InterfaceUnionNodeShapeMember2b;

export namespace InterfaceUnionNodeShape {
  export function equals(
    left: InterfaceUnionNodeShape,
    right: InterfaceUnionNodeShape,
  ): $EqualsResult {
    return $strictEquals(left.type, right.type).chain(() => {
      switch (left.type) {
        case "InterfaceUnionNodeShapeMember1":
          return InterfaceUnionNodeShapeMember1.equals(
            left,
            right as unknown as InterfaceUnionNodeShapeMember1,
          );
        case "InterfaceUnionNodeShapeMember2a":
          return InterfaceUnionNodeShapeMember2a.equals(
            left,
            right as unknown as InterfaceUnionNodeShapeMember2a,
          );
        case "InterfaceUnionNodeShapeMember2b":
          return InterfaceUnionNodeShapeMember2b.equals(
            left,
            right as unknown as InterfaceUnionNodeShapeMember2b,
          );
      }
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionNodeShape> {
    return (
      InterfaceUnionNodeShapeMember1.fromJson(json) as purify.Either<
        zod.ZodError,
        InterfaceUnionNodeShape
      >
    )
      .altLazy(
        () =>
          InterfaceUnionNodeShapeMember2a.fromJson(json) as purify.Either<
            zod.ZodError,
            InterfaceUnionNodeShape
          >,
      )
      .altLazy(
        () =>
          InterfaceUnionNodeShapeMember2b.fromJson(json) as purify.Either<
            zod.ZodError,
            InterfaceUnionNodeShape
          >,
      );
  }

  export function fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    InterfaceUnionNodeShape
  > {
    return (
      InterfaceUnionNodeShapeMember1.fromRdf({
        ...context,
        resource,
      }) as purify.Either<
        rdfjsResource.Resource.ValueError,
        InterfaceUnionNodeShape
      >
    )
      .altLazy(
        () =>
          InterfaceUnionNodeShapeMember2a.fromRdf({
            ...context,
            resource,
          }) as purify.Either<
            rdfjsResource.Resource.ValueError,
            InterfaceUnionNodeShape
          >,
      )
      .altLazy(
        () =>
          InterfaceUnionNodeShapeMember2b.fromRdf({
            ...context,
            resource,
          }) as purify.Either<
            rdfjsResource.Resource.ValueError,
            InterfaceUnionNodeShape
          >,
      );
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionNodeShape: InterfaceUnionNodeShape,
    _hasher: HasherT,
  ): HasherT {
    switch (_interfaceUnionNodeShape.type) {
      case "InterfaceUnionNodeShapeMember1":
        return InterfaceUnionNodeShapeMember1.hash(
          _interfaceUnionNodeShape,
          _hasher,
        );
      case "InterfaceUnionNodeShapeMember2a":
        return InterfaceUnionNodeShapeMember2a.hash(
          _interfaceUnionNodeShape,
          _hasher,
        );
      case "InterfaceUnionNodeShapeMember2b":
        return InterfaceUnionNodeShapeMember2b.hash(
          _interfaceUnionNodeShape,
          _hasher,
        );
    }
  }

  export type Json =
    | InterfaceUnionNodeShapeMember1.Json
    | InterfaceUnionNodeShapeMember2a.Json
    | InterfaceUnionNodeShapeMember2b.Json;

  export function jsonZodSchema() {
    return zod.discriminatedUnion("type", [
      InterfaceUnionNodeShapeMember1.jsonZodSchema(),
      InterfaceUnionNodeShapeMember2a.jsonZodSchema(),
      InterfaceUnionNodeShapeMember2b.jsonZodSchema(),
    ]);
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InterfaceUnionNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [
      ...InterfaceUnionNodeShapeMember1.sparqlConstructTemplateTriples({
        subject:
          parameters.subject ??
          dataFactory.variable!(
            "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember1",
          ),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember1`
          : "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember1",
      }).concat(),
      ...InterfaceUnionNodeShapeMember2a.sparqlConstructTemplateTriples({
        subject:
          parameters.subject ??
          dataFactory.variable!(
            "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember2a",
          ),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember2a`
          : "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember2a",
      }).concat(),
      ...InterfaceUnionNodeShapeMember2b.sparqlConstructTemplateTriples({
        subject:
          parameters.subject ??
          dataFactory.variable!(
            "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember2b",
          ),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember2b`
          : "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember2b",
      }).concat(),
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [
      {
        patterns: [
          {
            patterns: InterfaceUnionNodeShapeMember1.sparqlWherePatterns({
              subject:
                parameters.subject ??
                dataFactory.variable!(
                  "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember1",
                ),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember1`
                : "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember1",
            }).concat(),
            type: "group",
          },
          {
            patterns: InterfaceUnionNodeShapeMember2a.sparqlWherePatterns({
              subject:
                parameters.subject ??
                dataFactory.variable!(
                  "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember2a",
                ),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember2a`
                : "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember2a",
            }).concat(),
            type: "group",
          },
          {
            patterns: InterfaceUnionNodeShapeMember2b.sparqlWherePatterns({
              subject:
                parameters.subject ??
                dataFactory.variable!(
                  "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember2b",
                ),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember2b`
                : "interfaceUnionNodeShapeInterfaceUnionNodeShapeMember2b",
            }).concat(),
            type: "group",
          },
        ],
        type: "union",
      },
    ];
  }

  export function toJson(
    _interfaceUnionNodeShape: InterfaceUnionNodeShape,
  ):
    | InterfaceUnionNodeShapeMember1.Json
    | InterfaceUnionNodeShapeMember2a.Json
    | InterfaceUnionNodeShapeMember2b.Json {
    switch (_interfaceUnionNodeShape.type) {
      case "InterfaceUnionNodeShapeMember1":
        return InterfaceUnionNodeShapeMember1.toJson(_interfaceUnionNodeShape);
      case "InterfaceUnionNodeShapeMember2a":
        return InterfaceUnionNodeShapeMember2a.toJson(_interfaceUnionNodeShape);
      case "InterfaceUnionNodeShapeMember2b":
        return InterfaceUnionNodeShapeMember2b.toJson(_interfaceUnionNodeShape);
    }
  }

  export function toRdf(
    _interfaceUnionNodeShape: InterfaceUnionNodeShape,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_interfaceUnionNodeShape.type) {
      case "InterfaceUnionNodeShapeMember1":
        return InterfaceUnionNodeShapeMember1.toRdf(
          _interfaceUnionNodeShape,
          _parameters,
        );
      case "InterfaceUnionNodeShapeMember2a":
        return InterfaceUnionNodeShapeMember2a.toRdf(
          _interfaceUnionNodeShape,
          _parameters,
        );
      case "InterfaceUnionNodeShapeMember2b":
        return InterfaceUnionNodeShapeMember2b.toRdf(
          _interfaceUnionNodeShape,
          _parameters,
        );
    }
  }

  export const Pointers = {
    equals,
    fromJson,
    fromRdf,
    hash,
    jsonZodSchema,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
/**
 * A union node shape that is part of another union shape, to test composition of unions.
 */
export type InterfaceUnionNodeShapeMember2 =
  | InterfaceUnionNodeShapeMember2a
  | InterfaceUnionNodeShapeMember2b;

export namespace InterfaceUnionNodeShapeMember2 {
  export function equals(
    left: InterfaceUnionNodeShapeMember2,
    right: InterfaceUnionNodeShapeMember2,
  ): $EqualsResult {
    return $strictEquals(left.type, right.type).chain(() => {
      switch (left.type) {
        case "InterfaceUnionNodeShapeMember2a":
          return InterfaceUnionNodeShapeMember2a.equals(
            left,
            right as unknown as InterfaceUnionNodeShapeMember2a,
          );
        case "InterfaceUnionNodeShapeMember2b":
          return InterfaceUnionNodeShapeMember2b.equals(
            left,
            right as unknown as InterfaceUnionNodeShapeMember2b,
          );
      }
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionNodeShapeMember2> {
    return (
      InterfaceUnionNodeShapeMember2a.fromJson(json) as purify.Either<
        zod.ZodError,
        InterfaceUnionNodeShapeMember2
      >
    ).altLazy(
      () =>
        InterfaceUnionNodeShapeMember2b.fromJson(json) as purify.Either<
          zod.ZodError,
          InterfaceUnionNodeShapeMember2
        >,
    );
  }

  export function fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    InterfaceUnionNodeShapeMember2
  > {
    return (
      InterfaceUnionNodeShapeMember2a.fromRdf({
        ...context,
        resource,
      }) as purify.Either<
        rdfjsResource.Resource.ValueError,
        InterfaceUnionNodeShapeMember2
      >
    ).altLazy(
      () =>
        InterfaceUnionNodeShapeMember2b.fromRdf({
          ...context,
          resource,
        }) as purify.Either<
          rdfjsResource.Resource.ValueError,
          InterfaceUnionNodeShapeMember2
        >,
    );
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionNodeShapeMember2: InterfaceUnionNodeShapeMember2,
    _hasher: HasherT,
  ): HasherT {
    switch (_interfaceUnionNodeShapeMember2.type) {
      case "InterfaceUnionNodeShapeMember2a":
        return InterfaceUnionNodeShapeMember2a.hash(
          _interfaceUnionNodeShapeMember2,
          _hasher,
        );
      case "InterfaceUnionNodeShapeMember2b":
        return InterfaceUnionNodeShapeMember2b.hash(
          _interfaceUnionNodeShapeMember2,
          _hasher,
        );
    }
  }

  export type Json =
    | InterfaceUnionNodeShapeMember2a.Json
    | InterfaceUnionNodeShapeMember2b.Json;

  export function jsonZodSchema() {
    return zod.discriminatedUnion("type", [
      InterfaceUnionNodeShapeMember2a.jsonZodSchema(),
      InterfaceUnionNodeShapeMember2b.jsonZodSchema(),
    ]);
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        InterfaceUnionNodeShapeMember2.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionNodeShapeMember2.sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionNodeShapeMember2.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [
      ...InterfaceUnionNodeShapeMember2a.sparqlConstructTemplateTriples({
        subject:
          parameters.subject ??
          dataFactory.variable!(
            "interfaceUnionNodeShapeMember2InterfaceUnionNodeShapeMember2a",
          ),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember2a`
          : "interfaceUnionNodeShapeMember2InterfaceUnionNodeShapeMember2a",
      }).concat(),
      ...InterfaceUnionNodeShapeMember2b.sparqlConstructTemplateTriples({
        subject:
          parameters.subject ??
          dataFactory.variable!(
            "interfaceUnionNodeShapeMember2InterfaceUnionNodeShapeMember2b",
          ),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember2b`
          : "interfaceUnionNodeShapeMember2InterfaceUnionNodeShapeMember2b",
      }).concat(),
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [
      {
        patterns: [
          {
            patterns: InterfaceUnionNodeShapeMember2a.sparqlWherePatterns({
              subject:
                parameters.subject ??
                dataFactory.variable!(
                  "interfaceUnionNodeShapeMember2InterfaceUnionNodeShapeMember2a",
                ),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember2a`
                : "interfaceUnionNodeShapeMember2InterfaceUnionNodeShapeMember2a",
            }).concat(),
            type: "group",
          },
          {
            patterns: InterfaceUnionNodeShapeMember2b.sparqlWherePatterns({
              subject:
                parameters.subject ??
                dataFactory.variable!(
                  "interfaceUnionNodeShapeMember2InterfaceUnionNodeShapeMember2b",
                ),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionNodeShapeMember2b`
                : "interfaceUnionNodeShapeMember2InterfaceUnionNodeShapeMember2b",
            }).concat(),
            type: "group",
          },
        ],
        type: "union",
      },
    ];
  }

  export function toJson(
    _interfaceUnionNodeShapeMember2: InterfaceUnionNodeShapeMember2,
  ):
    | InterfaceUnionNodeShapeMember2a.Json
    | InterfaceUnionNodeShapeMember2b.Json {
    switch (_interfaceUnionNodeShapeMember2.type) {
      case "InterfaceUnionNodeShapeMember2a":
        return InterfaceUnionNodeShapeMember2a.toJson(
          _interfaceUnionNodeShapeMember2,
        );
      case "InterfaceUnionNodeShapeMember2b":
        return InterfaceUnionNodeShapeMember2b.toJson(
          _interfaceUnionNodeShapeMember2,
        );
    }
  }

  export function toRdf(
    _interfaceUnionNodeShapeMember2: InterfaceUnionNodeShapeMember2,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_interfaceUnionNodeShapeMember2.type) {
      case "InterfaceUnionNodeShapeMember2a":
        return InterfaceUnionNodeShapeMember2a.toRdf(
          _interfaceUnionNodeShapeMember2,
          _parameters,
        );
      case "InterfaceUnionNodeShapeMember2b":
        return InterfaceUnionNodeShapeMember2b.toRdf(
          _interfaceUnionNodeShapeMember2,
          _parameters,
        );
    }
  }

  export const Pointers = {
    equals,
    fromJson,
    fromRdf,
    hash,
    jsonZodSchema,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}
/**
 * Node shape sh:xone's other node shapes. This will usually be generated as a discriminated union.
 */
export type UnionNodeShape =
  | UnionNodeShapeMember1
  | UnionNodeShapeMember2
  | ExternObjectType;

export namespace UnionNodeShape {
  export function equals(
    left: UnionNodeShape,
    right: UnionNodeShape,
  ): $EqualsResult {
    return $strictEquals(left.type, right.type).chain(() => {
      switch (left.type) {
        case "UnionNodeShapeMember1":
          return left.equals(right as unknown as UnionNodeShapeMember1);
        case "UnionNodeShapeMember2":
          return left.equals(right as unknown as UnionNodeShapeMember2);
        case "ExternObjectType":
          return left.equals(right as unknown as ExternObjectType);
      }
    });
  }

  export function fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, UnionNodeShape> {
    return (
      UnionNodeShapeMember1.fromJson(json) as purify.Either<
        zod.ZodError,
        UnionNodeShape
      >
    )
      .altLazy(
        () =>
          UnionNodeShapeMember2.fromJson(json) as purify.Either<
            zod.ZodError,
            UnionNodeShape
          >,
      )
      .altLazy(
        () =>
          ExternObjectType.fromJson(json) as purify.Either<
            zod.ZodError,
            UnionNodeShape
          >,
      );
  }

  export function fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<rdfjsResource.Resource.ValueError, UnionNodeShape> {
    return (
      UnionNodeShapeMember1.fromRdf({ ...context, resource }) as purify.Either<
        rdfjsResource.Resource.ValueError,
        UnionNodeShape
      >
    )
      .altLazy(
        () =>
          UnionNodeShapeMember2.fromRdf({
            ...context,
            resource,
          }) as purify.Either<
            rdfjsResource.Resource.ValueError,
            UnionNodeShape
          >,
      )
      .altLazy(
        () =>
          ExternObjectType.fromRdf({ ...context, resource }) as purify.Either<
            rdfjsResource.Resource.ValueError,
            UnionNodeShape
          >,
      );
  }

  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_unionNodeShape: UnionNodeShape, _hasher: HasherT): HasherT {
    switch (_unionNodeShape.type) {
      case "UnionNodeShapeMember1":
        return _unionNodeShape.hash(_hasher);
      case "UnionNodeShapeMember2":
        return _unionNodeShape.hash(_hasher);
      case "ExternObjectType":
        return _unionNodeShape.hash(_hasher);
    }
  }

  export type Json =
    | UnionNodeShapeMember1.Json
    | UnionNodeShapeMember2.Json
    | ExternObjectType.Json;

  export function jsonZodSchema() {
    return zod.discriminatedUnion("type", [
      UnionNodeShapeMember1.jsonZodSchema(),
      UnionNodeShapeMember2.jsonZodSchema(),
      ExternObjectType.jsonZodSchema(),
    ]);
  }

  export function sparqlConstructQuery(
    parameters?: {
      ignoreRdfType?: boolean;
      prefixes?: { [prefix: string]: string };
      subject?: sparqljs.Triple["subject"];
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">,
  ): sparqljs.ConstructQuery {
    const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {};

    return {
      ...queryParameters,
      prefixes: parameters?.prefixes ?? {},
      queryType: "CONSTRUCT",
      template: (queryParameters.template ?? []).concat(
        UnionNodeShape.sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        UnionNodeShape.sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      UnionNodeShape.sparqlConstructQuery(parameters),
    );
  }

  export function sparqlConstructTemplateTriples(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [
      ...UnionNodeShapeMember1.sparqlConstructTemplateTriples({
        subject:
          parameters.subject ??
          dataFactory.variable!("unionNodeShapeUnionNodeShapeMember1"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}UnionNodeShapeMember1`
          : "unionNodeShapeUnionNodeShapeMember1",
      }).concat(),
      ...UnionNodeShapeMember2.sparqlConstructTemplateTriples({
        subject:
          parameters.subject ??
          dataFactory.variable!("unionNodeShapeUnionNodeShapeMember2"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}UnionNodeShapeMember2`
          : "unionNodeShapeUnionNodeShapeMember2",
      }).concat(),
      ...ExternObjectType.sparqlConstructTemplateTriples({
        subject:
          parameters.subject ??
          dataFactory.variable!("unionNodeShapeExternObjectType"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}ExternObjectType`
          : "unionNodeShapeExternObjectType",
      }).concat(),
    ];
  }

  export function sparqlWherePatterns(parameters: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [
      {
        patterns: [
          {
            patterns: UnionNodeShapeMember1.sparqlWherePatterns({
              subject:
                parameters.subject ??
                dataFactory.variable!("unionNodeShapeUnionNodeShapeMember1"),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}UnionNodeShapeMember1`
                : "unionNodeShapeUnionNodeShapeMember1",
            }).concat(),
            type: "group",
          },
          {
            patterns: UnionNodeShapeMember2.sparqlWherePatterns({
              subject:
                parameters.subject ??
                dataFactory.variable!("unionNodeShapeUnionNodeShapeMember2"),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}UnionNodeShapeMember2`
                : "unionNodeShapeUnionNodeShapeMember2",
            }).concat(),
            type: "group",
          },
          {
            patterns: ExternObjectType.sparqlWherePatterns({
              subject:
                parameters.subject ??
                dataFactory.variable!("unionNodeShapeExternObjectType"),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}ExternObjectType`
                : "unionNodeShapeExternObjectType",
            }).concat(),
            type: "group",
          },
        ],
        type: "union",
      },
    ];
  }

  export function toJson(
    _unionNodeShape: UnionNodeShape,
  ):
    | UnionNodeShapeMember1.Json
    | UnionNodeShapeMember2.Json
    | ExternObjectType.Json {
    switch (_unionNodeShape.type) {
      case "UnionNodeShapeMember1":
        return _unionNodeShape.toJson();
      case "UnionNodeShapeMember2":
        return _unionNodeShape.toJson();
      case "ExternObjectType":
        return _unionNodeShape.toJson();
    }
  }

  export function toRdf(
    _unionNodeShape: UnionNodeShape,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_unionNodeShape.type) {
      case "UnionNodeShapeMember1":
        return _unionNodeShape.toRdf(_parameters);
      case "UnionNodeShapeMember2":
        return _unionNodeShape.toRdf(_parameters);
      case "ExternObjectType":
        return _unionNodeShape.toRdf(_parameters);
    }
  }

  export const Pointers = {
    equals,
    fromJson,
    fromRdf,
    hash,
    jsonZodSchema,
    sparqlConstructQuery,
    sparqlConstructQueryString,
    sparqlConstructTemplateTriples,
    sparqlWherePatterns,
    toJson,
    toRdf,
  };
}

const $ObjectTypePointers = {
  AbstractBaseClassForExternObjectType:
    AbstractBaseClassForExternObjectTypeStatic.Pointers,
  AbstractBaseClassWithoutPropertiesNodeShape:
    AbstractBaseClassWithoutPropertiesNodeShapeStatic.Pointers,
  AbstractBaseClassWithPropertiesNodeShape:
    AbstractBaseClassWithPropertiesNodeShapeStatic.Pointers,
  BaseInterfaceWithoutPropertiesNodeShape:
    BaseInterfaceWithoutPropertiesNodeShapeStatic.Pointers,
  BaseInterfaceWithPropertiesNodeShape:
    BaseInterfaceWithPropertiesNodeShapeStatic.Pointers,
  BlankNodeShape: BlankNodeShape.Pointers,
  ConcreteChildClassNodeShape: ConcreteChildClassNodeShape.Pointers,
  ConcreteChildInterfaceNodeShape: ConcreteChildInterfaceNodeShape.Pointers,
  ConcreteParentClassNodeShape: ConcreteParentClassNodeShapeStatic.Pointers,
  ConcreteParentInterfaceNodeShape:
    ConcreteParentInterfaceNodeShapeStatic.Pointers,
  DefaultValuePropertiesNodeShape: DefaultValuePropertiesNodeShape.Pointers,
  ExplicitRdfTypesNodeShape: ExplicitRdfTypesNodeShape.Pointers,
  ExternNodeShape: ExternNodeShape.Pointers,
  ExternObjectType: ExternObjectType.Pointers,
  ExternPropertiesNodeShape: ExternPropertiesNodeShape.Pointers,
  HasValuePropertiesNodeShape: HasValuePropertiesNodeShape.Pointers,
  InIdentifierNodeShape: InIdentifierNodeShape.Pointers,
  InlineNodeShape: InlineNodeShape.Pointers,
  InPropertiesNodeShape: InPropertiesNodeShape.Pointers,
  InterfaceNodeShape: InterfaceNodeShape.Pointers,
  InterfaceUnionNodeShapeMember1: InterfaceUnionNodeShapeMember1.Pointers,
  InterfaceUnionNodeShapeMember2a: InterfaceUnionNodeShapeMember2a.Pointers,
  InterfaceUnionNodeShapeMember2b: InterfaceUnionNodeShapeMember2b.Pointers,
  IriNodeShape: IriNodeShape.Pointers,
  LanguageInPropertiesNodeShape: LanguageInPropertiesNodeShape.Pointers,
  ListPropertiesNodeShape: ListPropertiesNodeShape.Pointers,
  MutablePropertiesNodeShape: MutablePropertiesNodeShape.Pointers,
  NonClassNodeShape: NonClassNodeShape.Pointers,
  OrderedPropertiesNodeShape: OrderedPropertiesNodeShape.Pointers,
  PropertyCardinalitiesNodeShape: PropertyCardinalitiesNodeShape.Pointers,
  PropertyVisibilitiesNodeShape: PropertyVisibilitiesNodeShape.Pointers,
  Sha256IriNodeShape: Sha256IriNodeShape.Pointers,
  TermPropertiesNodeShape: TermPropertiesNodeShape.Pointers,
  UnionNodeShapeMember1: UnionNodeShapeMember1.Pointers,
  UnionNodeShapeMember2: UnionNodeShapeMember2.Pointers,
  UnionPropertiesNodeShape: UnionPropertiesNodeShape.Pointers,
  UuidV4IriNodeShape: UuidV4IriNodeShape.Pointers,
};
const $ObjectUnionTypePointers = {
  InterfaceUnionNodeShape: InterfaceUnionNodeShape.Pointers,
  InterfaceUnionNodeShapeMember2: InterfaceUnionNodeShapeMember2.Pointers,
  UnionNodeShape: UnionNodeShape.Pointers,
};
export const $Pointers = {
  ObjectTypes: $ObjectTypePointers,
  ObjectUnionTypes: $ObjectUnionTypePointers,
  Types: { ...$ObjectTypePointers, ...$ObjectUnionTypePointers },
};

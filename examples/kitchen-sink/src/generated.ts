import type * as rdfjs from "@rdfjs/types";
import { sha256 } from "js-sha256";
import N3, { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfLiteral from "rdf-literal";
import * as rdfjsResource from "rdfjs-resource";
import * as sparqljs from "sparqljs";
import * as uuid from "uuid";
import { z as zod } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ExternClass } from "./ExternClass.js";
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
/**
 * A sparqljs.Pattern that's the equivalent of ?subject rdf:type/rdfs:subClassOf* ?rdfType .
 */
export function $sparqlInstancesOfPattern({
  rdfType,
  subject,
}: {
  rdfType: rdfjs.NamedNode;
  subject: sparqljs.Triple["subject"];
}): sparqljs.Pattern {
  return {
    triples: [
      {
        subject,
        predicate: {
          items: [
            $RdfVocabularies.rdf.type,
            {
              items: [$RdfVocabularies.rdfs.subClassOf],
              pathType: "*",
              type: "path",
            },
          ],
          pathType: "/",
          type: "path",
        },
        object: rdfType,
      },
    ],
    type: "bgp",
  };
}
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
/**
 * A node shape that mints its identifier by generating a v4 UUID, if no identifier is supplied.
 */
export class UuidV4IriClass {
  private _$identifier: UuidV4IriClass.$Identifier | undefined;
  protected readonly _$identifierPrefix?: string;
  readonly $type = "UuidV4IriClass";
  readonly uuidV4IriProperty: string;

  constructor(parameters: {
    readonly $identifier?: rdfjs.NamedNode | string;
    readonly $identifierPrefix?: string;
    readonly uuidV4IriProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this._$identifierPrefix = parameters.$identifierPrefix;
    this.uuidV4IriProperty = parameters.uuidV4IriProperty;
  }

  get $identifier(): UuidV4IriClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.namedNode(
        `${this.$identifierPrefix}${uuid.v4()}`,
      );
    }
    return this._$identifier;
  }

  protected get $identifierPrefix(): string {
    return typeof this._$identifierPrefix !== "undefined"
      ? this._$identifierPrefix
      : `urn:shaclmate:${this.$type}:`;
  }

  $equals(other: UuidV4IriClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$identifierPrefix, other.$identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.uuidV4IriProperty, other.uuidV4IriProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "uuidV4IriProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.uuidV4IriProperty);
    return _hasher;
  }

  $toJson(): UuidV4IriClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.$identifier.value,
        $type: this.$type,
        uuidV4IriProperty: this.uuidV4IriProperty,
      } satisfies UuidV4IriClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      UuidV4IriClass.$properties.uuidV4IriProperty["identifier"],
      this.uuidV4IriProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace UuidV4IriClass {
  export type $Identifier = rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjs.NamedNode> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      ).chain((identifier) =>
        identifier.termType === "NamedNode"
          ? purify.Either.of(identifier)
          : purify.Left(new Error("expected identifier to be NamedNode")),
      ) as purify.Either<Error, rdfjs.NamedNode>;
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "UuidV4IriClass";
    readonly uuidV4IriProperty: string;
  };

  export function $propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { $identifier: rdfjs.NamedNode; uuidV4IriProperty: string }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = dataFactory.namedNode(_jsonObject["@id"]);
    const uuidV4IriProperty = _jsonObject["uuidV4IriProperty"];
    return purify.Either.of({ $identifier, uuidV4IriProperty });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, UuidV4IriClass> {
    return $propertiesFromJson(json).map(
      (properties) => new UuidV4IriClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "UuidV4IriClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/uuidV4IriProperty`,
          type: "Control",
        },
      ],
      label: "UuidV4IriClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("UuidV4IriClass"),
      uuidV4IriProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
    { $identifier: rdfjs.NamedNode; uuidV4IriProperty: string }
  > {
    if (_resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: _resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: _resource,
          predicate: $RdfVocabularies.rdf.subject,
        }),
      );
    }

    const $identifier: UuidV4IriClass.$Identifier = _resource.identifier;
    const _uuidV4IriPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.uuidV4IriProperty["identifier"], { unique: true })
      .head()
      .chain((_value) => _value.toString());
    if (_uuidV4IriPropertyEither.isLeft()) {
      return _uuidV4IriPropertyEither;
    }

    const uuidV4IriProperty = _uuidV4IriPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, uuidV4IriProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof UuidV4IriClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, UuidV4IriClass> {
    return UuidV4IriClass.$propertiesFromRdf(parameters).map(
      (properties) => new UuidV4IriClass(properties),
    );
  }

  export const $properties = {
    uuidV4IriProperty: {
      identifier: dataFactory.namedNode("http://example.com/uuidV4IriProperty"),
    },
  };

  export function $sparqlConstructQuery(
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
        UuidV4IriClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        UuidV4IriClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      UuidV4IriClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("uuidV4IriClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "uuidV4IriClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}UuidV4IriProperty`),
      predicate: UuidV4IriClass.$properties.uuidV4IriProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("uuidV4IriClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "uuidV4IriClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}UuidV4IriProperty`),
            predicate:
              UuidV4IriClass.$properties.uuidV4IriProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with sh:xone properties.
 */
export class UnionPropertiesClass {
  private _$identifier: UnionPropertiesClass.$Identifier | undefined;
  readonly $type = "UnionPropertiesClass";
  readonly narrowLiteralsProperty: purify.Maybe<number | string>;
  readonly unrelatedTypesProperty: purify.Maybe<number | NonClass>;
  readonly widenedLiteralsProperty: purify.Maybe<rdfjs.Literal>;
  readonly widenedTermsProperty: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly narrowLiteralsProperty?:
      | number
      | purify.Maybe<number | string>
      | string;
    readonly unrelatedTypesProperty?:
      | NonClass
      | number
      | purify.Maybe<number | NonClass>;
    readonly widenedLiteralsProperty?:
      | rdfjs.Literal
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal>
      | string;
    readonly widenedTermsProperty?:
      | (rdfjs.Literal | rdfjs.NamedNode)
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
      | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.narrowLiteralsProperty)) {
      this.narrowLiteralsProperty = parameters.narrowLiteralsProperty;
    } else if (typeof parameters.narrowLiteralsProperty === "number") {
      this.narrowLiteralsProperty = purify.Maybe.of(
        parameters.narrowLiteralsProperty,
      );
    } else if (typeof parameters.narrowLiteralsProperty === "string") {
      this.narrowLiteralsProperty = purify.Maybe.of(
        parameters.narrowLiteralsProperty,
      );
    } else if (typeof parameters.narrowLiteralsProperty === "undefined") {
      this.narrowLiteralsProperty = purify.Maybe.empty();
    } else {
      this.narrowLiteralsProperty =
        parameters.narrowLiteralsProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.unrelatedTypesProperty)) {
      this.unrelatedTypesProperty = parameters.unrelatedTypesProperty;
    } else if (typeof parameters.unrelatedTypesProperty === "number") {
      this.unrelatedTypesProperty = purify.Maybe.of(
        parameters.unrelatedTypesProperty,
      );
    } else if (typeof parameters.unrelatedTypesProperty === "object") {
      this.unrelatedTypesProperty = purify.Maybe.of(
        parameters.unrelatedTypesProperty,
      );
    } else if (typeof parameters.unrelatedTypesProperty === "undefined") {
      this.unrelatedTypesProperty = purify.Maybe.empty();
    } else {
      this.unrelatedTypesProperty =
        parameters.unrelatedTypesProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.widenedLiteralsProperty)) {
      this.widenedLiteralsProperty = parameters.widenedLiteralsProperty;
    } else if (typeof parameters.widenedLiteralsProperty === "boolean") {
      this.widenedLiteralsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.widenedLiteralsProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.widenedLiteralsProperty === "object" &&
      parameters.widenedLiteralsProperty instanceof Date
    ) {
      this.widenedLiteralsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.widenedLiteralsProperty, { dataFactory }),
      );
    } else if (typeof parameters.widenedLiteralsProperty === "number") {
      this.widenedLiteralsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.widenedLiteralsProperty, { dataFactory }),
      );
    } else if (typeof parameters.widenedLiteralsProperty === "string") {
      this.widenedLiteralsProperty = purify.Maybe.of(
        dataFactory.literal(parameters.widenedLiteralsProperty),
      );
    } else if (typeof parameters.widenedLiteralsProperty === "object") {
      this.widenedLiteralsProperty = purify.Maybe.of(
        parameters.widenedLiteralsProperty,
      );
    } else if (typeof parameters.widenedLiteralsProperty === "undefined") {
      this.widenedLiteralsProperty = purify.Maybe.empty();
    } else {
      this.widenedLiteralsProperty =
        parameters.widenedLiteralsProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.widenedTermsProperty)) {
      this.widenedTermsProperty = parameters.widenedTermsProperty;
    } else if (typeof parameters.widenedTermsProperty === "boolean") {
      this.widenedTermsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.widenedTermsProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.widenedTermsProperty === "object" &&
      parameters.widenedTermsProperty instanceof Date
    ) {
      this.widenedTermsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.widenedTermsProperty, { dataFactory }),
      );
    } else if (typeof parameters.widenedTermsProperty === "number") {
      this.widenedTermsProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.widenedTermsProperty, { dataFactory }),
      );
    } else if (typeof parameters.widenedTermsProperty === "string") {
      this.widenedTermsProperty = purify.Maybe.of(
        dataFactory.literal(parameters.widenedTermsProperty),
      );
    } else if (typeof parameters.widenedTermsProperty === "object") {
      this.widenedTermsProperty = purify.Maybe.of(
        parameters.widenedTermsProperty,
      );
    } else if (typeof parameters.widenedTermsProperty === "undefined") {
      this.widenedTermsProperty = purify.Maybe.empty();
    } else {
      this.widenedTermsProperty =
        parameters.widenedTermsProperty satisfies never;
    }
  }

  get $identifier(): UnionPropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: UnionPropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(
            left,
            right,
            (left: number | string, right: number | string) => {
              if (typeof left === "number" && typeof right === "number") {
                return $strictEquals(left, right);
              }
              if (typeof left === "string" && typeof right === "string") {
                return $strictEquals(left, right);
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
          ))(this.narrowLiteralsProperty, other.narrowLiteralsProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "narrowLiteralsProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(
            left,
            right,
            (left: number | NonClass, right: number | NonClass) => {
              if (typeof left === "number" && typeof right === "number") {
                return $strictEquals(left, right);
              }
              if (typeof left === "object" && typeof right === "object") {
                return ((left, right) => left.$equals(right))(left, right);
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
          ))(this.unrelatedTypesProperty, other.unrelatedTypesProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "unrelatedTypesProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.widenedLiteralsProperty,
          other.widenedLiteralsProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "widenedLiteralsProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.widenedTermsProperty,
          other.widenedTermsProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "widenedTermsProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.narrowLiteralsProperty.ifJust((_value0) => {
      switch (typeof _value0) {
        case "number": {
          _hasher.update(_value0.toString());
          break;
        }
        case "string": {
          _hasher.update(_value0);
          break;
        }
        default:
          _value0 satisfies never;
          throw new Error("unrecognized type");
      }
    });
    this.unrelatedTypesProperty.ifJust((_value0) => {
      switch (typeof _value0) {
        case "number": {
          _hasher.update(_value0.toString());
          break;
        }
        case "object": {
          _value0.$hash(_hasher);
          break;
        }
        default:
          _value0 satisfies never;
          throw new Error("unrecognized type");
      }
    });
    this.widenedLiteralsProperty.ifJust((_value0) => {
      _hasher.update(_value0.datatype.value);
      _hasher.update(_value0.language);
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.widenedTermsProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    return _hasher;
  }

  $toJson(): UnionPropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        narrowLiteralsProperty: this.narrowLiteralsProperty
          .map((_item) => (typeof _item === "string" ? _item : _item))
          .extract(),
        unrelatedTypesProperty: this.unrelatedTypesProperty
          .map((_item) => (typeof _item === "object" ? _item.$toJson() : _item))
          .extract(),
        widenedLiteralsProperty: this.widenedLiteralsProperty
          .map((_item) => ({
            "@language": _item.language.length > 0 ? _item.language : undefined,
            "@type":
              _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
                ? _item.datatype.value
                : undefined,
            "@value": _item.value,
          }))
          .extract(),
        widenedTermsProperty: this.widenedTermsProperty
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
      } satisfies UnionPropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      UnionPropertiesClass.$properties.narrowLiteralsProperty["identifier"],
      this.narrowLiteralsProperty.map((_value) =>
        typeof _value === "string" ? _value : _value,
      ),
    );
    _resource.add(
      UnionPropertiesClass.$properties.unrelatedTypesProperty["identifier"],
      this.unrelatedTypesProperty.map((_value) =>
        typeof _value === "object"
          ? _value.$toRdf({
              mutateGraph: mutateGraph,
              resourceSet: resourceSet,
            })
          : _value,
      ),
    );
    _resource.add(
      UnionPropertiesClass.$properties.widenedLiteralsProperty["identifier"],
      this.widenedLiteralsProperty,
    );
    _resource.add(
      UnionPropertiesClass.$properties.widenedTermsProperty["identifier"],
      this.widenedTermsProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace UnionPropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "UnionPropertiesClass";
    readonly narrowLiteralsProperty: (number | string) | undefined;
    readonly unrelatedTypesProperty: (number | NonClass.$Json) | undefined;
    readonly widenedLiteralsProperty:
      | {
          readonly "@language": string | undefined;
          readonly "@type": string | undefined;
          readonly "@value": string;
        }
      | undefined;
    readonly widenedTermsProperty:
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
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      narrowLiteralsProperty: purify.Maybe<number | string>;
      unrelatedTypesProperty: purify.Maybe<number | NonClass>;
      widenedLiteralsProperty: purify.Maybe<rdfjs.Literal>;
      widenedTermsProperty: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const narrowLiteralsProperty = purify.Maybe.fromNullable(
      _jsonObject["narrowLiteralsProperty"],
    ).map((_item) => (typeof _item === "string" ? _item : _item));
    const unrelatedTypesProperty = purify.Maybe.fromNullable(
      _jsonObject["unrelatedTypesProperty"],
    ).map((_item) =>
      typeof _item === "object"
        ? NonClass.$fromJson(_item).unsafeCoerce()
        : _item,
    );
    const widenedLiteralsProperty = purify.Maybe.fromNullable(
      _jsonObject["widenedLiteralsProperty"],
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
    const widenedTermsProperty = purify.Maybe.fromNullable(
      _jsonObject["widenedTermsProperty"],
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
    return purify.Either.of({
      $identifier,
      narrowLiteralsProperty,
      unrelatedTypesProperty,
      widenedLiteralsProperty,
      widenedTermsProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, UnionPropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new UnionPropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "UnionPropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/narrowLiteralsProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/unrelatedTypesProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/widenedLiteralsProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/widenedTermsProperty`,
          type: "Control",
        },
      ],
      label: "UnionPropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("UnionPropertiesClass"),
      narrowLiteralsProperty: zod
        .union([zod.number(), zod.string()])
        .optional(),
      unrelatedTypesProperty: zod
        .union([zod.number(), NonClass.$jsonZodSchema()])
        .optional(),
      widenedLiteralsProperty: zod
        .object({
          "@language": zod.string().optional(),
          "@type": zod.string().optional(),
          "@value": zod.string(),
        })
        .optional(),
      widenedTermsProperty: zod
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
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      narrowLiteralsProperty: purify.Maybe<number | string>;
      unrelatedTypesProperty: purify.Maybe<number | NonClass>;
      widenedLiteralsProperty: purify.Maybe<rdfjs.Literal>;
      widenedTermsProperty: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
    }
  > {
    const $identifier: UnionPropertiesClass.$Identifier = _resource.identifier;
    const _narrowLiteralsPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number | string>
    > = purify.Either.of(
      (
        _resource
          .values($properties.narrowLiteralsProperty["identifier"], {
            unique: true,
          })
          .head()
          .chain((_value) => _value.toNumber()) as purify.Either<
          rdfjsResource.Resource.ValueError,
          number | string
        >
      )
        .altLazy(
          () =>
            _resource
              .values($properties.narrowLiteralsProperty["identifier"], {
                unique: true,
              })
              .head()
              .chain((_value) => _value.toString()) as purify.Either<
              rdfjsResource.Resource.ValueError,
              number | string
            >,
        )
        .toMaybe(),
    );
    if (_narrowLiteralsPropertyEither.isLeft()) {
      return _narrowLiteralsPropertyEither;
    }

    const narrowLiteralsProperty = _narrowLiteralsPropertyEither.unsafeCoerce();
    const _unrelatedTypesPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number | NonClass>
    > = purify.Either.of(
      (
        _resource
          .values($properties.unrelatedTypesProperty["identifier"], {
            unique: true,
          })
          .head()
          .chain((_value) => _value.toNumber()) as purify.Either<
          rdfjsResource.Resource.ValueError,
          number | NonClass
        >
      )
        .altLazy(
          () =>
            _resource
              .values($properties.unrelatedTypesProperty["identifier"], {
                unique: true,
              })
              .head()
              .chain((value) => value.toResource())
              .chain((_resource) =>
                NonClass.$fromRdf({
                  ..._context,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              ) as purify.Either<
              rdfjsResource.Resource.ValueError,
              number | NonClass
            >,
        )
        .toMaybe(),
    );
    if (_unrelatedTypesPropertyEither.isLeft()) {
      return _unrelatedTypesPropertyEither;
    }

    const unrelatedTypesProperty = _unrelatedTypesPropertyEither.unsafeCoerce();
    const _widenedLiteralsPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values($properties.widenedLiteralsProperty["identifier"], {
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
    if (_widenedLiteralsPropertyEither.isLeft()) {
      return _widenedLiteralsPropertyEither;
    }

    const widenedLiteralsProperty =
      _widenedLiteralsPropertyEither.unsafeCoerce();
    const _widenedTermsPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values($properties.widenedTermsProperty["identifier"], {
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
                    predicate:
                      UnionPropertiesClass.$properties.widenedTermsProperty[
                        "identifier"
                      ],
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_widenedTermsPropertyEither.isLeft()) {
      return _widenedTermsPropertyEither;
    }

    const widenedTermsProperty = _widenedTermsPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      narrowLiteralsProperty,
      unrelatedTypesProperty,
      widenedLiteralsProperty,
      widenedTermsProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof UnionPropertiesClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, UnionPropertiesClass> {
    return UnionPropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new UnionPropertiesClass(properties),
    );
  }

  export const $properties = {
    narrowLiteralsProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/narrowLiteralsProperty",
      ),
    },
    unrelatedTypesProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/unrelatedTypesProperty",
      ),
    },
    widenedLiteralsProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/widenedLiteralsProperty",
      ),
    },
    widenedTermsProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/widenedTermsProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        UnionPropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        UnionPropertiesClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      UnionPropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("unionPropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "unionPropertiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}NarrowLiteralsProperty`),
      predicate:
        UnionPropertiesClass.$properties.narrowLiteralsProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}UnrelatedTypesProperty`),
      predicate:
        UnionPropertiesClass.$properties.unrelatedTypesProperty["identifier"],
      subject,
    });
    triples.push(
      ...NonClass.$sparqlConstructTemplateTriples({
        subject: dataFactory.variable!(
          `${variablePrefix}UnrelatedTypesProperty`,
        ),
        variablePrefix: `${variablePrefix}UnrelatedTypesProperty`,
      }),
    );
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}WidenedLiteralsProperty`),
      predicate:
        UnionPropertiesClass.$properties.widenedLiteralsProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}WidenedTermsProperty`),
      predicate:
        UnionPropertiesClass.$properties.widenedTermsProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("unionPropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "unionPropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}NarrowLiteralsProperty`,
                ),
                predicate:
                  UnionPropertiesClass.$properties.narrowLiteralsProperty[
                    "identifier"
                  ],
                subject,
              },
            ],
            type: "bgp",
          },
          { patterns: [{ patterns: [], type: "group" }], type: "union" },
        ],
        type: "optional",
      },
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}UnrelatedTypesProperty`,
                ),
                predicate:
                  UnionPropertiesClass.$properties.unrelatedTypesProperty[
                    "identifier"
                  ],
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
                  ...NonClass.$sparqlWherePatterns({
                    subject: dataFactory.variable!(
                      `${variablePrefix}UnrelatedTypesProperty`,
                    ),
                    variablePrefix: `${variablePrefix}UnrelatedTypesProperty`,
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
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}WidenedLiteralsProperty`,
                ),
                predicate:
                  UnionPropertiesClass.$properties.widenedLiteralsProperty[
                    "identifier"
                  ],
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
                  `${variablePrefix}WidenedTermsProperty`,
                ),
                predicate:
                  UnionPropertiesClass.$properties.widenedTermsProperty[
                    "identifier"
                  ],
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with properties that are not nested objects
 */
export class TermPropertiesClass {
  private _$identifier: TermPropertiesClass.$Identifier | undefined;
  readonly $type = "TermPropertiesClass";
  readonly booleanTermProperty: purify.Maybe<boolean>;
  readonly dateTermProperty: purify.Maybe<Date>;
  readonly dateTimeTermProperty: purify.Maybe<Date>;
  readonly iriTermProperty: purify.Maybe<rdfjs.NamedNode>;
  readonly literalTermProperty: purify.Maybe<rdfjs.Literal>;
  readonly numberTermProperty: purify.Maybe<number>;
  readonly stringTermProperty: purify.Maybe<string>;
  readonly termProperty: purify.Maybe<
    rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal
  >;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly booleanTermProperty?: boolean | purify.Maybe<boolean>;
    readonly dateTermProperty?: Date | purify.Maybe<Date>;
    readonly dateTimeTermProperty?: Date | purify.Maybe<Date>;
    readonly iriTermProperty?:
      | rdfjs.NamedNode
      | purify.Maybe<rdfjs.NamedNode>
      | string;
    readonly literalTermProperty?:
      | rdfjs.Literal
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal>
      | string;
    readonly numberTermProperty?: number | purify.Maybe<number>;
    readonly stringTermProperty?: purify.Maybe<string> | string;
    readonly termProperty?:
      | (rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal)
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal>
      | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.booleanTermProperty)) {
      this.booleanTermProperty = parameters.booleanTermProperty;
    } else if (typeof parameters.booleanTermProperty === "boolean") {
      this.booleanTermProperty = purify.Maybe.of(
        parameters.booleanTermProperty,
      );
    } else if (typeof parameters.booleanTermProperty === "undefined") {
      this.booleanTermProperty = purify.Maybe.empty();
    } else {
      this.booleanTermProperty = parameters.booleanTermProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.dateTermProperty)) {
      this.dateTermProperty = parameters.dateTermProperty;
    } else if (
      typeof parameters.dateTermProperty === "object" &&
      parameters.dateTermProperty instanceof Date
    ) {
      this.dateTermProperty = purify.Maybe.of(parameters.dateTermProperty);
    } else if (typeof parameters.dateTermProperty === "undefined") {
      this.dateTermProperty = purify.Maybe.empty();
    } else {
      this.dateTermProperty = parameters.dateTermProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.dateTimeTermProperty)) {
      this.dateTimeTermProperty = parameters.dateTimeTermProperty;
    } else if (
      typeof parameters.dateTimeTermProperty === "object" &&
      parameters.dateTimeTermProperty instanceof Date
    ) {
      this.dateTimeTermProperty = purify.Maybe.of(
        parameters.dateTimeTermProperty,
      );
    } else if (typeof parameters.dateTimeTermProperty === "undefined") {
      this.dateTimeTermProperty = purify.Maybe.empty();
    } else {
      this.dateTimeTermProperty =
        parameters.dateTimeTermProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.iriTermProperty)) {
      this.iriTermProperty = parameters.iriTermProperty;
    } else if (typeof parameters.iriTermProperty === "object") {
      this.iriTermProperty = purify.Maybe.of(parameters.iriTermProperty);
    } else if (typeof parameters.iriTermProperty === "string") {
      this.iriTermProperty = purify.Maybe.of(
        dataFactory.namedNode(parameters.iriTermProperty),
      );
    } else if (typeof parameters.iriTermProperty === "undefined") {
      this.iriTermProperty = purify.Maybe.empty();
    } else {
      this.iriTermProperty = parameters.iriTermProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.literalTermProperty)) {
      this.literalTermProperty = parameters.literalTermProperty;
    } else if (typeof parameters.literalTermProperty === "boolean") {
      this.literalTermProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalTermProperty, { dataFactory }),
      );
    } else if (
      typeof parameters.literalTermProperty === "object" &&
      parameters.literalTermProperty instanceof Date
    ) {
      this.literalTermProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalTermProperty, { dataFactory }),
      );
    } else if (typeof parameters.literalTermProperty === "number") {
      this.literalTermProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.literalTermProperty, { dataFactory }),
      );
    } else if (typeof parameters.literalTermProperty === "string") {
      this.literalTermProperty = purify.Maybe.of(
        dataFactory.literal(parameters.literalTermProperty),
      );
    } else if (typeof parameters.literalTermProperty === "object") {
      this.literalTermProperty = purify.Maybe.of(
        parameters.literalTermProperty,
      );
    } else if (typeof parameters.literalTermProperty === "undefined") {
      this.literalTermProperty = purify.Maybe.empty();
    } else {
      this.literalTermProperty = parameters.literalTermProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.numberTermProperty)) {
      this.numberTermProperty = parameters.numberTermProperty;
    } else if (typeof parameters.numberTermProperty === "number") {
      this.numberTermProperty = purify.Maybe.of(parameters.numberTermProperty);
    } else if (typeof parameters.numberTermProperty === "undefined") {
      this.numberTermProperty = purify.Maybe.empty();
    } else {
      this.numberTermProperty = parameters.numberTermProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.stringTermProperty)) {
      this.stringTermProperty = parameters.stringTermProperty;
    } else if (typeof parameters.stringTermProperty === "string") {
      this.stringTermProperty = purify.Maybe.of(parameters.stringTermProperty);
    } else if (typeof parameters.stringTermProperty === "undefined") {
      this.stringTermProperty = purify.Maybe.empty();
    } else {
      this.stringTermProperty = parameters.stringTermProperty satisfies never;
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
      this.termProperty = parameters.termProperty satisfies never;
    }
  }

  get $identifier(): TermPropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: TermPropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.booleanTermProperty,
          other.booleanTermProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "booleanTermProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $dateEquals))(
          this.dateTermProperty,
          other.dateTermProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "dateTermProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $dateEquals))(
          this.dateTimeTermProperty,
          other.dateTimeTermProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "dateTimeTermProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.iriTermProperty,
          other.iriTermProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "iriTermProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.literalTermProperty,
          other.literalTermProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "literalTermProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.numberTermProperty,
          other.numberTermProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "numberTermProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.stringTermProperty,
          other.stringTermProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "stringTermProperty",
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

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.booleanTermProperty.ifJust((_value0) => {
      _hasher.update(_value0.toString());
    });
    this.dateTermProperty.ifJust((_value0) => {
      _hasher.update(_value0.toISOString());
    });
    this.dateTimeTermProperty.ifJust((_value0) => {
      _hasher.update(_value0.toISOString());
    });
    this.iriTermProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.literalTermProperty.ifJust((_value0) => {
      _hasher.update(_value0.datatype.value);
      _hasher.update(_value0.language);
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.numberTermProperty.ifJust((_value0) => {
      _hasher.update(_value0.toString());
    });
    this.stringTermProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    this.termProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    return _hasher;
  }

  $toJson(): TermPropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        booleanTermProperty: this.booleanTermProperty
          .map((_item) => _item)
          .extract(),
        dateTermProperty: this.dateTermProperty
          .map((_item) => _item.toISOString().replace(/T.*$/, ""))
          .extract(),
        dateTimeTermProperty: this.dateTimeTermProperty
          .map((_item) => _item.toISOString())
          .extract(),
        iriTermProperty: this.iriTermProperty
          .map((_item) => ({ "@id": _item.value }))
          .extract(),
        literalTermProperty: this.literalTermProperty
          .map((_item) => ({
            "@language": _item.language.length > 0 ? _item.language : undefined,
            "@type":
              _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
                ? _item.datatype.value
                : undefined,
            "@value": _item.value,
          }))
          .extract(),
        numberTermProperty: this.numberTermProperty
          .map((_item) => _item)
          .extract(),
        stringTermProperty: this.stringTermProperty
          .map((_item) => _item)
          .extract(),
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
      } satisfies TermPropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      TermPropertiesClass.$properties.booleanTermProperty["identifier"],
      this.booleanTermProperty,
    );
    _resource.add(
      TermPropertiesClass.$properties.dateTermProperty["identifier"],
      this.dateTermProperty.map((_value) =>
        rdfLiteral.toRdf(_value, {
          dataFactory,
          datatype: $RdfVocabularies.xsd.date,
        }),
      ),
    );
    _resource.add(
      TermPropertiesClass.$properties.dateTimeTermProperty["identifier"],
      this.dateTimeTermProperty.map((_value) =>
        rdfLiteral.toRdf(_value, {
          dataFactory,
          datatype: $RdfVocabularies.xsd.dateTime,
        }),
      ),
    );
    _resource.add(
      TermPropertiesClass.$properties.iriTermProperty["identifier"],
      this.iriTermProperty,
    );
    _resource.add(
      TermPropertiesClass.$properties.literalTermProperty["identifier"],
      this.literalTermProperty,
    );
    _resource.add(
      TermPropertiesClass.$properties.numberTermProperty["identifier"],
      this.numberTermProperty,
    );
    _resource.add(
      TermPropertiesClass.$properties.stringTermProperty["identifier"],
      this.stringTermProperty,
    );
    _resource.add(
      TermPropertiesClass.$properties.termProperty["identifier"],
      this.termProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace TermPropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "TermPropertiesClass";
    readonly booleanTermProperty: boolean | undefined;
    readonly dateTermProperty: string | undefined;
    readonly dateTimeTermProperty: string | undefined;
    readonly iriTermProperty: { readonly "@id": string } | undefined;
    readonly literalTermProperty:
      | {
          readonly "@language": string | undefined;
          readonly "@type": string | undefined;
          readonly "@value": string;
        }
      | undefined;
    readonly numberTermProperty: number | undefined;
    readonly stringTermProperty: string | undefined;
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

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      booleanTermProperty: purify.Maybe<boolean>;
      dateTermProperty: purify.Maybe<Date>;
      dateTimeTermProperty: purify.Maybe<Date>;
      iriTermProperty: purify.Maybe<rdfjs.NamedNode>;
      literalTermProperty: purify.Maybe<rdfjs.Literal>;
      numberTermProperty: purify.Maybe<number>;
      stringTermProperty: purify.Maybe<string>;
      termProperty: purify.Maybe<
        rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal
      >;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const booleanTermProperty = purify.Maybe.fromNullable(
      _jsonObject["booleanTermProperty"],
    );
    const dateTermProperty = purify.Maybe.fromNullable(
      _jsonObject["dateTermProperty"],
    ).map((_item) => new Date(_item));
    const dateTimeTermProperty = purify.Maybe.fromNullable(
      _jsonObject["dateTimeTermProperty"],
    ).map((_item) => new Date(_item));
    const iriTermProperty = purify.Maybe.fromNullable(
      _jsonObject["iriTermProperty"],
    ).map((_item) => dataFactory.namedNode(_item["@id"]));
    const literalTermProperty = purify.Maybe.fromNullable(
      _jsonObject["literalTermProperty"],
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
    const numberTermProperty = purify.Maybe.fromNullable(
      _jsonObject["numberTermProperty"],
    );
    const stringTermProperty = purify.Maybe.fromNullable(
      _jsonObject["stringTermProperty"],
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
      $identifier,
      booleanTermProperty,
      dateTermProperty,
      dateTimeTermProperty,
      iriTermProperty,
      literalTermProperty,
      numberTermProperty,
      stringTermProperty,
      termProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, TermPropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new TermPropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "TermPropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/booleanTermProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/dateTermProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/dateTimeTermProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/iriTermProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/literalTermProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/numberTermProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/stringTermProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/termProperty`, type: "Control" },
      ],
      label: "TermPropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("TermPropertiesClass"),
      booleanTermProperty: zod.boolean().optional(),
      dateTermProperty: zod.string().date().optional(),
      dateTimeTermProperty: zod.string().datetime().optional(),
      iriTermProperty: zod.object({ "@id": zod.string().min(1) }).optional(),
      literalTermProperty: zod
        .object({
          "@language": zod.string().optional(),
          "@type": zod.string().optional(),
          "@value": zod.string(),
        })
        .optional(),
      numberTermProperty: zod.number().optional(),
      stringTermProperty: zod.string().optional(),
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

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      booleanTermProperty: purify.Maybe<boolean>;
      dateTermProperty: purify.Maybe<Date>;
      dateTimeTermProperty: purify.Maybe<Date>;
      iriTermProperty: purify.Maybe<rdfjs.NamedNode>;
      literalTermProperty: purify.Maybe<rdfjs.Literal>;
      numberTermProperty: purify.Maybe<number>;
      stringTermProperty: purify.Maybe<string>;
      termProperty: purify.Maybe<
        rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal
      >;
    }
  > {
    const $identifier: TermPropertiesClass.$Identifier = _resource.identifier;
    const _booleanTermPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values($properties.booleanTermProperty["identifier"], { unique: true })
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_booleanTermPropertyEither.isLeft()) {
      return _booleanTermPropertyEither;
    }

    const booleanTermProperty = _booleanTermPropertyEither.unsafeCoerce();
    const _dateTermPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<Date>
    > = purify.Either.of(
      _resource
        .values($properties.dateTermProperty["identifier"], { unique: true })
        .head()
        .chain((_value) => _value.toDate())
        .toMaybe(),
    );
    if (_dateTermPropertyEither.isLeft()) {
      return _dateTermPropertyEither;
    }

    const dateTermProperty = _dateTermPropertyEither.unsafeCoerce();
    const _dateTimeTermPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<Date>
    > = purify.Either.of(
      _resource
        .values($properties.dateTimeTermProperty["identifier"], {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toDate())
        .toMaybe(),
    );
    if (_dateTimeTermPropertyEither.isLeft()) {
      return _dateTimeTermPropertyEither;
    }

    const dateTimeTermProperty = _dateTimeTermPropertyEither.unsafeCoerce();
    const _iriTermPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values($properties.iriTermProperty["identifier"], { unique: true })
        .head()
        .chain((_value) => _value.toIri())
        .toMaybe(),
    );
    if (_iriTermPropertyEither.isLeft()) {
      return _iriTermPropertyEither;
    }

    const iriTermProperty = _iriTermPropertyEither.unsafeCoerce();
    const _literalTermPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values($properties.literalTermProperty["identifier"], { unique: true })
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
    if (_literalTermPropertyEither.isLeft()) {
      return _literalTermPropertyEither;
    }

    const literalTermProperty = _literalTermPropertyEither.unsafeCoerce();
    const _numberTermPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number>
    > = purify.Either.of(
      _resource
        .values($properties.numberTermProperty["identifier"], { unique: true })
        .head()
        .chain((_value) => _value.toNumber())
        .toMaybe(),
    );
    if (_numberTermPropertyEither.isLeft()) {
      return _numberTermPropertyEither;
    }

    const numberTermProperty = _numberTermPropertyEither.unsafeCoerce();
    const _stringTermPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values($properties.stringTermProperty["identifier"], { unique: true })
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_stringTermPropertyEither.isLeft()) {
      return _stringTermPropertyEither;
    }

    const stringTermProperty = _stringTermPropertyEither.unsafeCoerce();
    const _termPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values($properties.termProperty["identifier"], { unique: true })
        .head()
        .chain((_value) => purify.Either.of(_value.toTerm()))
        .toMaybe(),
    );
    if (_termPropertyEither.isLeft()) {
      return _termPropertyEither;
    }

    const termProperty = _termPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      booleanTermProperty,
      dateTermProperty,
      dateTimeTermProperty,
      iriTermProperty,
      literalTermProperty,
      numberTermProperty,
      stringTermProperty,
      termProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof TermPropertiesClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, TermPropertiesClass> {
    return TermPropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new TermPropertiesClass(properties),
    );
  }

  export const $properties = {
    booleanTermProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/booleanTermProperty",
      ),
    },
    dateTermProperty: {
      identifier: dataFactory.namedNode("http://example.com/dateTermProperty"),
    },
    dateTimeTermProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/dateTimeTermProperty",
      ),
    },
    iriTermProperty: {
      identifier: dataFactory.namedNode("http://example.com/iriTermProperty"),
    },
    literalTermProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/literalTermProperty",
      ),
    },
    numberTermProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/numberTermProperty",
      ),
    },
    stringTermProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/stringTermProperty",
      ),
    },
    termProperty: {
      identifier: dataFactory.namedNode("http://example.com/termProperty"),
    },
  };

  export function $sparqlConstructQuery(
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
        TermPropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        TermPropertiesClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      TermPropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("termPropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "termPropertiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}BooleanTermProperty`),
      predicate:
        TermPropertiesClass.$properties.booleanTermProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}DateTermProperty`),
      predicate: TermPropertiesClass.$properties.dateTermProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}DateTimeTermProperty`),
      predicate:
        TermPropertiesClass.$properties.dateTimeTermProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}IriTermProperty`),
      predicate: TermPropertiesClass.$properties.iriTermProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}LiteralTermProperty`),
      predicate:
        TermPropertiesClass.$properties.literalTermProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}NumberTermProperty`),
      predicate:
        TermPropertiesClass.$properties.numberTermProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}StringTermProperty`),
      predicate:
        TermPropertiesClass.$properties.stringTermProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}TermProperty`),
      predicate: TermPropertiesClass.$properties.termProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("termPropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "termPropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}BooleanTermProperty`,
                ),
                predicate:
                  TermPropertiesClass.$properties.booleanTermProperty[
                    "identifier"
                  ],
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
                  `${variablePrefix}DateTermProperty`,
                ),
                predicate:
                  TermPropertiesClass.$properties.dateTermProperty[
                    "identifier"
                  ],
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
                  `${variablePrefix}DateTimeTermProperty`,
                ),
                predicate:
                  TermPropertiesClass.$properties.dateTimeTermProperty[
                    "identifier"
                  ],
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
                  `${variablePrefix}IriTermProperty`,
                ),
                predicate:
                  TermPropertiesClass.$properties.iriTermProperty["identifier"],
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
                  `${variablePrefix}LiteralTermProperty`,
                ),
                predicate:
                  TermPropertiesClass.$properties.literalTermProperty[
                    "identifier"
                  ],
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
                  `${variablePrefix}NumberTermProperty`,
                ),
                predicate:
                  TermPropertiesClass.$properties.numberTermProperty[
                    "identifier"
                  ],
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
                  `${variablePrefix}StringTermProperty`,
                ),
                predicate:
                  TermPropertiesClass.$properties.stringTermProperty[
                    "identifier"
                  ],
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
                predicate:
                  TermPropertiesClass.$properties.termProperty["identifier"],
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * A node shape that mints its identifier by hashing (other) contents, if no identifier is supplied.
 */
export class Sha256IriClass {
  private _$identifier: Sha256IriClass.$Identifier | undefined;
  protected readonly _$identifierPrefix?: string;
  readonly $type = "Sha256IriClass";
  readonly sha256IriProperty: string;

  constructor(parameters: {
    readonly $identifier?: rdfjs.NamedNode | string;
    readonly $identifierPrefix?: string;
    readonly sha256IriProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this._$identifierPrefix = parameters.$identifierPrefix;
    this.sha256IriProperty = parameters.sha256IriProperty;
  }

  get $identifier(): Sha256IriClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.namedNode(
        `${this.$identifierPrefix}${this.$hashShaclProperties(sha256.create())}`,
      );
    }
    return this._$identifier;
  }

  protected get $identifierPrefix(): string {
    return typeof this._$identifierPrefix !== "undefined"
      ? this._$identifierPrefix
      : `urn:shaclmate:${this.$type}:`;
  }

  $equals(other: Sha256IriClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$identifierPrefix, other.$identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.sha256IriProperty, other.sha256IriProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "sha256IriProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.sha256IriProperty);
    return _hasher;
  }

  $toJson(): Sha256IriClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.$identifier.value,
        $type: this.$type,
        sha256IriProperty: this.sha256IriProperty,
      } satisfies Sha256IriClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      Sha256IriClass.$properties.sha256IriProperty["identifier"],
      this.sha256IriProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace Sha256IriClass {
  export type $Identifier = rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjs.NamedNode> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      ).chain((identifier) =>
        identifier.termType === "NamedNode"
          ? purify.Either.of(identifier)
          : purify.Left(new Error("expected identifier to be NamedNode")),
      ) as purify.Either<Error, rdfjs.NamedNode>;
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "Sha256IriClass";
    readonly sha256IriProperty: string;
  };

  export function $propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { $identifier: rdfjs.NamedNode; sha256IriProperty: string }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = dataFactory.namedNode(_jsonObject["@id"]);
    const sha256IriProperty = _jsonObject["sha256IriProperty"];
    return purify.Either.of({ $identifier, sha256IriProperty });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, Sha256IriClass> {
    return $propertiesFromJson(json).map(
      (properties) => new Sha256IriClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "Sha256IriClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/sha256IriProperty`,
          type: "Control",
        },
      ],
      label: "Sha256IriClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("Sha256IriClass"),
      sha256IriProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
    { $identifier: rdfjs.NamedNode; sha256IriProperty: string }
  > {
    if (_resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: _resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: _resource,
          predicate: $RdfVocabularies.rdf.subject,
        }),
      );
    }

    const $identifier: Sha256IriClass.$Identifier = _resource.identifier;
    const _sha256IriPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.sha256IriProperty["identifier"], { unique: true })
      .head()
      .chain((_value) => _value.toString());
    if (_sha256IriPropertyEither.isLeft()) {
      return _sha256IriPropertyEither;
    }

    const sha256IriProperty = _sha256IriPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, sha256IriProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof Sha256IriClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, Sha256IriClass> {
    return Sha256IriClass.$propertiesFromRdf(parameters).map(
      (properties) => new Sha256IriClass(properties),
    );
  }

  export const $properties = {
    sha256IriProperty: {
      identifier: dataFactory.namedNode("http://example.com/sha256IriProperty"),
    },
  };

  export function $sparqlConstructQuery(
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
        Sha256IriClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        Sha256IriClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      Sha256IriClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("sha256IriClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "sha256IriClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}Sha256IriProperty`),
      predicate: Sha256IriClass.$properties.sha256IriProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("sha256IriClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "sha256IriClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}Sha256IriProperty`),
            predicate:
              Sha256IriClass.$properties.sha256IriProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with properties that have visibility modifiers (private, protected, public)
 */
export class PropertyVisibilitiesClass {
  private _$identifier: PropertyVisibilitiesClass.$Identifier | undefined;
  readonly $type = "PropertyVisibilitiesClass";
  private readonly privateProperty: string;
  protected readonly protectedProperty: string;
  readonly publicProperty: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly privateProperty: string;
    readonly protectedProperty: string;
    readonly publicProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.privateProperty = parameters.privateProperty;
    this.protectedProperty = parameters.protectedProperty;
    this.publicProperty = parameters.publicProperty;
  }

  get $identifier(): PropertyVisibilitiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: PropertyVisibilitiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
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

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.privateProperty);
    _hasher.update(this.protectedProperty);
    _hasher.update(this.publicProperty);
    return _hasher;
  }

  $toJson(): PropertyVisibilitiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        privateProperty: this.privateProperty,
        protectedProperty: this.protectedProperty,
        publicProperty: this.publicProperty,
      } satisfies PropertyVisibilitiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      PropertyVisibilitiesClass.$properties.privateProperty["identifier"],
      this.privateProperty,
    );
    _resource.add(
      PropertyVisibilitiesClass.$properties.protectedProperty["identifier"],
      this.protectedProperty,
    );
    _resource.add(
      PropertyVisibilitiesClass.$properties.publicProperty["identifier"],
      this.publicProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace PropertyVisibilitiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "PropertyVisibilitiesClass";
    readonly privateProperty: string;
    readonly protectedProperty: string;
    readonly publicProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      privateProperty: string;
      protectedProperty: string;
      publicProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const privateProperty = _jsonObject["privateProperty"];
    const protectedProperty = _jsonObject["protectedProperty"];
    const publicProperty = _jsonObject["publicProperty"];
    return purify.Either.of({
      $identifier,
      privateProperty,
      protectedProperty,
      publicProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, PropertyVisibilitiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new PropertyVisibilitiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "PropertyVisibilitiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/privateProperty`, type: "Control" },
        {
          scope: `${scopePrefix}/properties/protectedProperty`,
          type: "Control",
        },
        { scope: `${scopePrefix}/properties/publicProperty`, type: "Control" },
      ],
      label: "PropertyVisibilitiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("PropertyVisibilitiesClass"),
      privateProperty: zod.string(),
      protectedProperty: zod.string(),
      publicProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      privateProperty: string;
      protectedProperty: string;
      publicProperty: string;
    }
  > {
    const $identifier: PropertyVisibilitiesClass.$Identifier =
      _resource.identifier;
    const _privatePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.privateProperty["identifier"], { unique: true })
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
      .values($properties.protectedProperty["identifier"], { unique: true })
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
      .values($properties.publicProperty["identifier"], { unique: true })
      .head()
      .chain((_value) => _value.toString());
    if (_publicPropertyEither.isLeft()) {
      return _publicPropertyEither;
    }

    const publicProperty = _publicPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      privateProperty,
      protectedProperty,
      publicProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof PropertyVisibilitiesClass.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    PropertyVisibilitiesClass
  > {
    return PropertyVisibilitiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new PropertyVisibilitiesClass(properties),
    );
  }

  export const $properties = {
    privateProperty: {
      identifier: dataFactory.namedNode("http://example.com/privateProperty"),
    },
    protectedProperty: {
      identifier: dataFactory.namedNode("http://example.com/protectedProperty"),
    },
    publicProperty: {
      identifier: dataFactory.namedNode("http://example.com/publicProperty"),
    },
  };

  export function $sparqlConstructQuery(
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
        PropertyVisibilitiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        PropertyVisibilitiesClass.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      PropertyVisibilitiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("propertyVisibilitiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "propertyVisibilitiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}PrivateProperty`),
      predicate:
        PropertyVisibilitiesClass.$properties.privateProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}ProtectedProperty`),
      predicate:
        PropertyVisibilitiesClass.$properties.protectedProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}PublicProperty`),
      predicate:
        PropertyVisibilitiesClass.$properties.publicProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("propertyVisibilitiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "propertyVisibilitiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}PrivateProperty`),
            predicate:
              PropertyVisibilitiesClass.$properties.privateProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}ProtectedProperty`),
            predicate:
              PropertyVisibilitiesClass.$properties.protectedProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}PublicProperty`),
            predicate:
              PropertyVisibilitiesClass.$properties.publicProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape that has properties with different cardinalities
 */
export class PropertyCardinalitiesClass {
  private _$identifier: PropertyCardinalitiesClass.$Identifier | undefined;
  readonly $type = "PropertyCardinalitiesClass";
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
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly emptyStringSetProperty?: readonly string[];
    readonly nonEmptyStringSetProperty: purify.NonEmptyList<string>;
    readonly optionalStringProperty?: purify.Maybe<string> | string;
    readonly requiredStringProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    if (typeof parameters.emptyStringSetProperty === "undefined") {
      this.emptyStringSetProperty = [];
    } else if (typeof parameters.emptyStringSetProperty === "object") {
      this.emptyStringSetProperty = parameters.emptyStringSetProperty;
    } else {
      this.emptyStringSetProperty =
        parameters.emptyStringSetProperty satisfies never;
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
      this.optionalStringProperty =
        parameters.optionalStringProperty satisfies never;
    }

    this.requiredStringProperty = parameters.requiredStringProperty;
  }

  get $identifier(): PropertyCardinalitiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: PropertyCardinalitiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
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

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
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

  $toJson(): PropertyCardinalitiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
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
      } satisfies PropertyCardinalitiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      PropertyCardinalitiesClass.$properties.emptyStringSetProperty[
        "identifier"
      ],
      this.emptyStringSetProperty.map((_item) => _item),
    );
    _resource.add(
      PropertyCardinalitiesClass.$properties.nonEmptyStringSetProperty[
        "identifier"
      ],
      this.nonEmptyStringSetProperty.map((_item) => _item),
    );
    _resource.add(
      PropertyCardinalitiesClass.$properties.optionalStringProperty[
        "identifier"
      ],
      this.optionalStringProperty,
    );
    _resource.add(
      PropertyCardinalitiesClass.$properties.requiredStringProperty[
        "identifier"
      ],
      this.requiredStringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace PropertyCardinalitiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "PropertyCardinalitiesClass";
    readonly emptyStringSetProperty: readonly string[];
    readonly nonEmptyStringSetProperty: readonly string[];
    readonly optionalStringProperty: string | undefined;
    readonly requiredStringProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      emptyStringSetProperty: readonly string[];
      nonEmptyStringSetProperty: purify.NonEmptyList<string>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
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
      $identifier,
      emptyStringSetProperty,
      nonEmptyStringSetProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, PropertyCardinalitiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new PropertyCardinalitiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "PropertyCardinalitiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
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
      label: "PropertyCardinalitiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("PropertyCardinalitiesClass"),
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

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      emptyStringSetProperty: readonly string[];
      nonEmptyStringSetProperty: purify.NonEmptyList<string>;
      optionalStringProperty: purify.Maybe<string>;
      requiredStringProperty: string;
    }
  > {
    const $identifier: PropertyCardinalitiesClass.$Identifier =
      _resource.identifier;
    const _emptyStringSetPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly string[]
    > = purify.Either.sequence(
      _resource
        .values($properties.emptyStringSetProperty["identifier"], {
          unique: true,
        })
        .map((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString()),
        ),
    );
    if (_emptyStringSetPropertyEither.isLeft()) {
      return _emptyStringSetPropertyEither;
    }

    const emptyStringSetProperty = _emptyStringSetPropertyEither.unsafeCoerce();
    const _nonEmptyStringSetPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.NonEmptyList<string>
    > = purify.Either.sequence(
      _resource
        .values($properties.nonEmptyStringSetProperty["identifier"], {
          unique: true,
        })
        .map((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString()),
        ),
    ).chain((_array) =>
      purify.NonEmptyList.fromArray(_array).toEither(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} is empty`,
          predicate:
            PropertyCardinalitiesClass.$properties.nonEmptyStringSetProperty[
              "identifier"
            ],
        }),
      ),
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
        .values($properties.optionalStringProperty["identifier"], {
          unique: true,
        })
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
      .values($properties.requiredStringProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_requiredStringPropertyEither.isLeft()) {
      return _requiredStringPropertyEither;
    }

    const requiredStringProperty = _requiredStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      emptyStringSetProperty,
      nonEmptyStringSetProperty,
      optionalStringProperty,
      requiredStringProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof PropertyCardinalitiesClass.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    PropertyCardinalitiesClass
  > {
    return PropertyCardinalitiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new PropertyCardinalitiesClass(properties),
    );
  }

  export const $properties = {
    emptyStringSetProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/emptyStringSetProperty",
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
    requiredStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/requiredStringProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        PropertyCardinalitiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        PropertyCardinalitiesClass.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      PropertyCardinalitiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("propertyCardinalitiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "propertyCardinalitiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}EmptyStringSetProperty`),
      predicate:
        PropertyCardinalitiesClass.$properties.emptyStringSetProperty[
          "identifier"
        ],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}NonEmptyStringSetProperty`,
      ),
      predicate:
        PropertyCardinalitiesClass.$properties.nonEmptyStringSetProperty[
          "identifier"
        ],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}OptionalStringProperty`),
      predicate:
        PropertyCardinalitiesClass.$properties.optionalStringProperty[
          "identifier"
        ],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}RequiredStringProperty`),
      predicate:
        PropertyCardinalitiesClass.$properties.requiredStringProperty[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("propertyCardinalitiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "propertyCardinalitiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}EmptyStringSetProperty`,
                ),
                predicate:
                  PropertyCardinalitiesClass.$properties.emptyStringSetProperty[
                    "identifier"
                  ],
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
            predicate:
              PropertyCardinalitiesClass.$properties.nonEmptyStringSetProperty[
                "identifier"
              ],
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
                predicate:
                  PropertyCardinalitiesClass.$properties.optionalStringProperty[
                    "identifier"
                  ],
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
            predicate:
              PropertyCardinalitiesClass.$properties.requiredStringProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape whose sh:properties have sh:order's. The compiler should order them C, A, B based on sh:order instead of on the declaration or lexicographic orders.
 */
export class OrderedPropertiesClass {
  private _$identifier: OrderedPropertiesClass.$Identifier | undefined;
  readonly $type = "OrderedPropertiesClass";
  readonly orderedPropertyC: string;
  readonly orderedPropertyB: string;
  readonly orderedPropertyA: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly orderedPropertyC: string;
    readonly orderedPropertyB: string;
    readonly orderedPropertyA: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.orderedPropertyC = parameters.orderedPropertyC;
    this.orderedPropertyB = parameters.orderedPropertyB;
    this.orderedPropertyA = parameters.orderedPropertyA;
  }

  get $identifier(): OrderedPropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: OrderedPropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.orderedPropertyC, other.orderedPropertyC).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "orderedPropertyC",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.orderedPropertyB, other.orderedPropertyB).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "orderedPropertyB",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.orderedPropertyA, other.orderedPropertyA).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "orderedPropertyA",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.orderedPropertyC);
    _hasher.update(this.orderedPropertyB);
    _hasher.update(this.orderedPropertyA);
    return _hasher;
  }

  $toJson(): OrderedPropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        orderedPropertyC: this.orderedPropertyC,
        orderedPropertyB: this.orderedPropertyB,
        orderedPropertyA: this.orderedPropertyA,
      } satisfies OrderedPropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      OrderedPropertiesClass.$properties.orderedPropertyC["identifier"],
      this.orderedPropertyC,
    );
    _resource.add(
      OrderedPropertiesClass.$properties.orderedPropertyB["identifier"],
      this.orderedPropertyB,
    );
    _resource.add(
      OrderedPropertiesClass.$properties.orderedPropertyA["identifier"],
      this.orderedPropertyA,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace OrderedPropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "OrderedPropertiesClass";
    readonly orderedPropertyC: string;
    readonly orderedPropertyB: string;
    readonly orderedPropertyA: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      orderedPropertyC: string;
      orderedPropertyB: string;
      orderedPropertyA: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const orderedPropertyC = _jsonObject["orderedPropertyC"];
    const orderedPropertyB = _jsonObject["orderedPropertyB"];
    const orderedPropertyA = _jsonObject["orderedPropertyA"];
    return purify.Either.of({
      $identifier,
      orderedPropertyC,
      orderedPropertyB,
      orderedPropertyA,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, OrderedPropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new OrderedPropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "OrderedPropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/orderedPropertyC`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/orderedPropertyB`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/orderedPropertyA`,
          type: "Control",
        },
      ],
      label: "OrderedPropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("OrderedPropertiesClass"),
      orderedPropertyC: zod.string(),
      orderedPropertyB: zod.string(),
      orderedPropertyA: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      orderedPropertyC: string;
      orderedPropertyB: string;
      orderedPropertyA: string;
    }
  > {
    const $identifier: OrderedPropertiesClass.$Identifier =
      _resource.identifier;
    const _orderedPropertyCEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.orderedPropertyC["identifier"], { unique: true })
      .head()
      .chain((_value) => _value.toString());
    if (_orderedPropertyCEither.isLeft()) {
      return _orderedPropertyCEither;
    }

    const orderedPropertyC = _orderedPropertyCEither.unsafeCoerce();
    const _orderedPropertyBEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.orderedPropertyB["identifier"], { unique: true })
      .head()
      .chain((_value) => _value.toString());
    if (_orderedPropertyBEither.isLeft()) {
      return _orderedPropertyBEither;
    }

    const orderedPropertyB = _orderedPropertyBEither.unsafeCoerce();
    const _orderedPropertyAEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.orderedPropertyA["identifier"], { unique: true })
      .head()
      .chain((_value) => _value.toString());
    if (_orderedPropertyAEither.isLeft()) {
      return _orderedPropertyAEither;
    }

    const orderedPropertyA = _orderedPropertyAEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      orderedPropertyC,
      orderedPropertyB,
      orderedPropertyA,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof OrderedPropertiesClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, OrderedPropertiesClass> {
    return OrderedPropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new OrderedPropertiesClass(properties),
    );
  }

  export const $properties = {
    orderedPropertyC: {
      identifier: dataFactory.namedNode("http://example.com/orderedPropertyC"),
    },
    orderedPropertyB: {
      identifier: dataFactory.namedNode("http://example.com/orderedPropertyB"),
    },
    orderedPropertyA: {
      identifier: dataFactory.namedNode("http://example.com/orderedPropertyA"),
    },
  };

  export function $sparqlConstructQuery(
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
        OrderedPropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        OrderedPropertiesClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      OrderedPropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("orderedPropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "orderedPropertiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}OrderedPropertyC`),
      predicate:
        OrderedPropertiesClass.$properties.orderedPropertyC["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}OrderedPropertyB`),
      predicate:
        OrderedPropertiesClass.$properties.orderedPropertyB["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}OrderedPropertyA`),
      predicate:
        OrderedPropertiesClass.$properties.orderedPropertyA["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("orderedPropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "orderedPropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}OrderedPropertyC`),
            predicate:
              OrderedPropertiesClass.$properties.orderedPropertyC["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}OrderedPropertyB`),
            predicate:
              OrderedPropertiesClass.$properties.orderedPropertyB["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}OrderedPropertyA`),
            predicate:
              OrderedPropertiesClass.$properties.orderedPropertyA["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Node shape that isn't an rdfs:Class.
 */
export class NonClass {
  private _$identifier: NonClass.$Identifier | undefined;
  readonly $type = "NonClass";
  readonly nonClassProperty: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly nonClassProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.nonClassProperty = parameters.nonClassProperty;
  }

  get $identifier(): NonClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: NonClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.nonClassProperty, other.nonClassProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "nonClassProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.nonClassProperty);
    return _hasher;
  }

  $toJson(): NonClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        nonClassProperty: this.nonClassProperty,
      } satisfies NonClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      NonClass.$properties.nonClassProperty["identifier"],
      this.nonClassProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace NonClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "NonClass";
    readonly nonClassProperty: string;
  };

  export function $propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { $identifier: rdfjs.BlankNode | rdfjs.NamedNode; nonClassProperty: string }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const nonClassProperty = _jsonObject["nonClassProperty"];
    return purify.Either.of({ $identifier, nonClassProperty });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, NonClass> {
    return $propertiesFromJson(json).map(
      (properties) => new NonClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "NonClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/nonClassProperty`,
          type: "Control",
        },
      ],
      label: "NonClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("NonClass"),
      nonClassProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
    { $identifier: rdfjs.BlankNode | rdfjs.NamedNode; nonClassProperty: string }
  > {
    const $identifier: NonClass.$Identifier = _resource.identifier;
    const _nonClassPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.nonClassProperty["identifier"], { unique: true })
      .head()
      .chain((_value) => _value.toString());
    if (_nonClassPropertyEither.isLeft()) {
      return _nonClassPropertyEither;
    }

    const nonClassProperty = _nonClassPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, nonClassProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof NonClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, NonClass> {
    return NonClass.$propertiesFromRdf(parameters).map(
      (properties) => new NonClass(properties),
    );
  }

  export const $properties = {
    nonClassProperty: {
      identifier: dataFactory.namedNode("http://example.com/nonClassProperty"),
    },
  };

  export function $sparqlConstructQuery(
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
        NonClass.$sparqlConstructTemplateTriples({ ignoreRdfType, subject }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        NonClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      NonClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject = parameters?.subject ?? dataFactory.variable!("nonClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "nonClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}NonClassProperty`),
      predicate: NonClass.$properties.nonClassProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject = parameters?.subject ?? dataFactory.variable!("nonClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "nonClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}NonClassProperty`),
            predicate: NonClass.$properties.nonClassProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with shaclmate:mutable properties.
 */
export class MutablePropertiesClass {
  private _$identifier: MutablePropertiesClass.$Identifier | undefined;
  protected readonly _$identifierPrefix?: string;
  readonly $type = "MutablePropertiesClass";
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
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly $identifierPrefix?: string;
    readonly mutableListProperty?: purify.Maybe<string[]> | string[];
    readonly mutableSetProperty?: readonly string[];
    readonly mutableStringProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this._$identifierPrefix = parameters.$identifierPrefix;
    if (purify.Maybe.isMaybe(parameters.mutableListProperty)) {
      this.mutableListProperty = parameters.mutableListProperty;
    } else if (typeof parameters.mutableListProperty === "object") {
      this.mutableListProperty = purify.Maybe.of(
        parameters.mutableListProperty.concat(),
      );
    } else if (typeof parameters.mutableListProperty === "undefined") {
      this.mutableListProperty = purify.Maybe.empty();
    } else {
      this.mutableListProperty = parameters.mutableListProperty satisfies never;
    }

    if (typeof parameters.mutableSetProperty === "undefined") {
      this.mutableSetProperty = [];
    } else if (typeof parameters.mutableSetProperty === "object") {
      this.mutableSetProperty = parameters.mutableSetProperty.concat();
    } else {
      this.mutableSetProperty = parameters.mutableSetProperty satisfies never;
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
      this.mutableStringProperty =
        parameters.mutableStringProperty satisfies never;
    }
  }

  get $identifier(): MutablePropertiesClass.$Identifier {
    return typeof this._$identifier !== "undefined"
      ? this._$identifier
      : dataFactory.namedNode(
          `${this.$identifierPrefix}${this.$hashShaclProperties(sha256.create())}`,
        );
  }

  protected get $identifierPrefix(): string {
    return typeof this._$identifierPrefix !== "undefined"
      ? this._$identifierPrefix
      : `urn:shaclmate:${this.$type}:`;
  }

  $equals(other: MutablePropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$identifierPrefix, other.$identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
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

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
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

  $toJson(): MutablePropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        mutableListProperty: this.mutableListProperty
          .map((_item) => _item.map((_item) => _item))
          .extract(),
        mutableSetProperty: this.mutableSetProperty.map((_item) => _item),
        mutableStringProperty: this.mutableStringProperty
          .map((_item) => _item)
          .extract(),
      } satisfies MutablePropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      MutablePropertiesClass.$properties.mutableListProperty["identifier"],
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
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add($RdfVocabularies.rdf.first, item);

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
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
          : $RdfVocabularies.rdf.nil,
      ),
    );
    _resource.add(
      MutablePropertiesClass.$properties.mutableSetProperty["identifier"],
      this.mutableSetProperty.map((_item) => _item),
    );
    _resource.add(
      MutablePropertiesClass.$properties.mutableStringProperty["identifier"],
      this.mutableStringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace MutablePropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "MutablePropertiesClass";
    readonly mutableListProperty: readonly string[] | undefined;
    readonly mutableSetProperty: readonly string[];
    readonly mutableStringProperty: string | undefined;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      mutableListProperty: purify.Maybe<string[]>;
      mutableSetProperty: string[];
      mutableStringProperty: purify.Maybe<string>;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
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
      $identifier,
      mutableListProperty,
      mutableSetProperty,
      mutableStringProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, MutablePropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new MutablePropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "MutablePropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
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
      label: "MutablePropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("MutablePropertiesClass"),
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

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      mutableListProperty: purify.Maybe<string[]>;
      mutableSetProperty: string[];
      mutableStringProperty: purify.Maybe<string>;
    }
  > {
    const $identifier: MutablePropertiesClass.$Identifier =
      _resource.identifier;
    const _mutableListPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string[]>
    > = purify.Either.of(
      _resource
        .values($properties.mutableListProperty["identifier"], { unique: true })
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
    > = purify.Either.sequence(
      _resource
        .values($properties.mutableSetProperty["identifier"], { unique: true })
        .map((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString()),
        ),
    );
    if (_mutableSetPropertyEither.isLeft()) {
      return _mutableSetPropertyEither;
    }

    const mutableSetProperty = _mutableSetPropertyEither.unsafeCoerce();
    const _mutableStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values($properties.mutableStringProperty["identifier"], {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_mutableStringPropertyEither.isLeft()) {
      return _mutableStringPropertyEither;
    }

    const mutableStringProperty = _mutableStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      mutableListProperty,
      mutableSetProperty,
      mutableStringProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof MutablePropertiesClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, MutablePropertiesClass> {
    return MutablePropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new MutablePropertiesClass(properties),
    );
  }

  export const $properties = {
    mutableListProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/mutableListProperty",
      ),
    },
    mutableSetProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/mutableSetProperty",
      ),
    },
    mutableStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/mutableStringProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        MutablePropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        MutablePropertiesClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      MutablePropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("mutablePropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "mutablePropertiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}MutableListProperty`),
      predicate:
        MutablePropertiesClass.$properties.mutableListProperty["identifier"],
      subject,
    });
    triples.push({
      subject: dataFactory.variable!(`${variablePrefix}MutableListProperty`),
      predicate: $RdfVocabularies.rdf.first,
      object: dataFactory.variable!(
        `${`${variablePrefix}MutableListProperty`}Item0`,
      ),
    });
    triples.push({
      subject: dataFactory.variable!(`${variablePrefix}MutableListProperty`),
      predicate: $RdfVocabularies.rdf.rest,
      object: dataFactory.variable!(
        `${`${variablePrefix}MutableListProperty`}Rest0`,
      ),
    });
    triples.push({
      subject: dataFactory.variable!(
        `${`${variablePrefix}MutableListProperty`}RestN`,
      ),
      predicate: $RdfVocabularies.rdf.first,
      object: dataFactory.variable!(
        `${`${variablePrefix}MutableListProperty`}ItemN`,
      ),
    });
    triples.push({
      subject: dataFactory.variable!(
        `${`${variablePrefix}MutableListProperty`}RestN`,
      ),
      predicate: $RdfVocabularies.rdf.rest,
      object: dataFactory.variable!(
        `${`${variablePrefix}MutableListProperty`}RestNBasic`,
      ),
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}MutableSetProperty`),
      predicate:
        MutablePropertiesClass.$properties.mutableSetProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}MutableStringProperty`),
      predicate:
        MutablePropertiesClass.$properties.mutableStringProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("mutablePropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "mutablePropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}MutableListProperty`,
                ),
                predicate:
                  MutablePropertiesClass.$properties.mutableListProperty[
                    "identifier"
                  ],
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
                    predicate: $RdfVocabularies.rdf.first,
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
                    predicate: $RdfVocabularies.rdf.rest,
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
                          items: [$RdfVocabularies.rdf.rest],
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
                        predicate: $RdfVocabularies.rdf.first,
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
                        predicate: $RdfVocabularies.rdf.rest,
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
                predicate:
                  MutablePropertiesClass.$properties.mutableSetProperty[
                    "identifier"
                  ],
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
                predicate:
                  MutablePropertiesClass.$properties.mutableStringProperty[
                    "identifier"
                  ],
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape that uses the list shapes in properties.
 */
export class ListPropertiesClass {
  private _$identifier: ListPropertiesClass.$Identifier | undefined;
  readonly $type = "ListPropertiesClass";
  readonly objectListProperty: purify.Maybe<readonly NonClass[]>;
  readonly stringListProperty: purify.Maybe<readonly string[]>;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly objectListProperty?:
      | purify.Maybe<readonly NonClass[]>
      | readonly NonClass[];
    readonly stringListProperty?:
      | purify.Maybe<readonly string[]>
      | readonly string[];
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.objectListProperty)) {
      this.objectListProperty = parameters.objectListProperty;
    } else if (typeof parameters.objectListProperty === "object") {
      this.objectListProperty = purify.Maybe.of(parameters.objectListProperty);
    } else if (typeof parameters.objectListProperty === "undefined") {
      this.objectListProperty = purify.Maybe.empty();
    } else {
      this.objectListProperty = parameters.objectListProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.stringListProperty)) {
      this.stringListProperty = parameters.stringListProperty;
    } else if (typeof parameters.stringListProperty === "object") {
      this.stringListProperty = purify.Maybe.of(parameters.stringListProperty);
    } else if (typeof parameters.stringListProperty === "undefined") {
      this.stringListProperty = purify.Maybe.empty();
    } else {
      this.stringListProperty = parameters.stringListProperty satisfies never;
    }
  }

  get $identifier(): ListPropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: ListPropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(left, right, (left, right) =>
            $arrayEquals(left, right, (left, right) => left.$equals(right)),
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

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.objectListProperty.ifJust((_value0) => {
      for (const _element1 of _value0) {
        _element1.$hash(_hasher);
      }
    });
    this.stringListProperty.ifJust((_value0) => {
      for (const _element1 of _value0) {
        _hasher.update(_element1);
      }
    });
    return _hasher;
  }

  $toJson(): ListPropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        objectListProperty: this.objectListProperty
          .map((_item) => _item.map((_item) => _item.$toJson()))
          .extract(),
        stringListProperty: this.stringListProperty
          .map((_item) => _item.map((_item) => _item))
          .extract(),
      } satisfies ListPropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      ListPropertiesClass.$properties.objectListProperty["identifier"],
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
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  item.$toRdf({
                    mutateGraph: mutateGraph,
                    resourceSet: resourceSet,
                  }),
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
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
          : $RdfVocabularies.rdf.nil,
      ),
    );
    _resource.add(
      ListPropertiesClass.$properties.stringListProperty["identifier"],
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
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add($RdfVocabularies.rdf.first, item);

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
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
          : $RdfVocabularies.rdf.nil,
      ),
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ListPropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ListPropertiesClass";
    readonly objectListProperty: readonly NonClass.$Json[] | undefined;
    readonly stringListProperty: readonly string[] | undefined;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      objectListProperty: purify.Maybe<readonly NonClass[]>;
      stringListProperty: purify.Maybe<readonly string[]>;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const objectListProperty = purify.Maybe.fromNullable(
      _jsonObject["objectListProperty"],
    ).map((_item) =>
      _item.map((_item) => NonClass.$fromJson(_item).unsafeCoerce()),
    );
    const stringListProperty = purify.Maybe.fromNullable(
      _jsonObject["stringListProperty"],
    ).map((_item) => _item.map((_item) => _item));
    return purify.Either.of({
      $identifier,
      objectListProperty,
      stringListProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ListPropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new ListPropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ListPropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        NonClass.$jsonUiSchema({
          scopePrefix: `${scopePrefix}/properties/objectListProperty`,
        }),
        {
          scope: `${scopePrefix}/properties/stringListProperty`,
          type: "Control",
        },
      ],
      label: "ListPropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ListPropertiesClass"),
      objectListProperty: NonClass.$jsonZodSchema().array().optional(),
      stringListProperty: zod.string().array().optional(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      objectListProperty: purify.Maybe<readonly NonClass[]>;
      stringListProperty: purify.Maybe<readonly string[]>;
    }
  > {
    const $identifier: ListPropertiesClass.$Identifier = _resource.identifier;
    const _objectListPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<readonly NonClass[]>
    > = purify.Either.of(
      _resource
        .values($properties.objectListProperty["identifier"], { unique: true })
        .head()
        .chain((value) => value.toList())
        .map((values) =>
          values.flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toResource())
              .chain((_resource) =>
                NonClass.$fromRdf({
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
        .values($properties.stringListProperty["identifier"], { unique: true })
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
      $identifier,
      objectListProperty,
      stringListProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ListPropertiesClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ListPropertiesClass> {
    return ListPropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new ListPropertiesClass(properties),
    );
  }

  export const $properties = {
    objectListProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/objectListProperty",
      ),
    },
    stringListProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/stringListProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ListPropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ListPropertiesClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ListPropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("listPropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "listPropertiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}ObjectListProperty`),
      predicate:
        ListPropertiesClass.$properties.objectListProperty["identifier"],
      subject,
    });
    triples.push({
      subject: dataFactory.variable!(`${variablePrefix}ObjectListProperty`),
      predicate: $RdfVocabularies.rdf.first,
      object: dataFactory.variable!(
        `${`${variablePrefix}ObjectListProperty`}Item0`,
      ),
    });
    triples.push(
      ...NonClass.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}Item0`,
        ),
        variablePrefix: `${`${variablePrefix}ObjectListProperty`}Item0`,
      }),
    );
    triples.push({
      subject: dataFactory.variable!(`${variablePrefix}ObjectListProperty`),
      predicate: $RdfVocabularies.rdf.rest,
      object: dataFactory.variable!(
        `${`${variablePrefix}ObjectListProperty`}Rest0`,
      ),
    });
    triples.push({
      subject: dataFactory.variable!(
        `${`${variablePrefix}ObjectListProperty`}RestN`,
      ),
      predicate: $RdfVocabularies.rdf.first,
      object: dataFactory.variable!(
        `${`${variablePrefix}ObjectListProperty`}ItemN`,
      ),
    });
    triples.push(
      ...NonClass.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(
          `${`${variablePrefix}ObjectListProperty`}ItemN`,
        ),
        variablePrefix: `${`${variablePrefix}ObjectListProperty`}ItemN`,
      }),
    );
    triples.push({
      subject: dataFactory.variable!(
        `${`${variablePrefix}ObjectListProperty`}RestN`,
      ),
      predicate: $RdfVocabularies.rdf.rest,
      object: dataFactory.variable!(
        `${`${variablePrefix}ObjectListProperty`}RestNBasic`,
      ),
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}StringListProperty`),
      predicate:
        ListPropertiesClass.$properties.stringListProperty["identifier"],
      subject,
    });
    triples.push({
      subject: dataFactory.variable!(`${variablePrefix}StringListProperty`),
      predicate: $RdfVocabularies.rdf.first,
      object: dataFactory.variable!(
        `${`${variablePrefix}StringListProperty`}Item0`,
      ),
    });
    triples.push({
      subject: dataFactory.variable!(`${variablePrefix}StringListProperty`),
      predicate: $RdfVocabularies.rdf.rest,
      object: dataFactory.variable!(
        `${`${variablePrefix}StringListProperty`}Rest0`,
      ),
    });
    triples.push({
      subject: dataFactory.variable!(
        `${`${variablePrefix}StringListProperty`}RestN`,
      ),
      predicate: $RdfVocabularies.rdf.first,
      object: dataFactory.variable!(
        `${`${variablePrefix}StringListProperty`}ItemN`,
      ),
    });
    triples.push({
      subject: dataFactory.variable!(
        `${`${variablePrefix}StringListProperty`}RestN`,
      ),
      predicate: $RdfVocabularies.rdf.rest,
      object: dataFactory.variable!(
        `${`${variablePrefix}StringListProperty`}RestNBasic`,
      ),
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("listPropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "listPropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}ObjectListProperty`,
                ),
                predicate:
                  ListPropertiesClass.$properties.objectListProperty[
                    "identifier"
                  ],
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
                    predicate: $RdfVocabularies.rdf.first,
                    object: dataFactory.variable!(
                      `${`${variablePrefix}ObjectListProperty`}Item0`,
                    ),
                  },
                ],
              },
              ...NonClass.$sparqlWherePatterns({
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
                    predicate: $RdfVocabularies.rdf.rest,
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
                          items: [$RdfVocabularies.rdf.rest],
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
                        predicate: $RdfVocabularies.rdf.first,
                        object: dataFactory.variable!(
                          `${`${variablePrefix}ObjectListProperty`}ItemN`,
                        ),
                      },
                    ],
                  },
                  ...NonClass.$sparqlWherePatterns({
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
                        predicate: $RdfVocabularies.rdf.rest,
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
                predicate:
                  ListPropertiesClass.$properties.stringListProperty[
                    "identifier"
                  ],
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
                    predicate: $RdfVocabularies.rdf.first,
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
                    predicate: $RdfVocabularies.rdf.rest,
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
                          items: [$RdfVocabularies.rdf.rest],
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
                        predicate: $RdfVocabularies.rdf.first,
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
                        predicate: $RdfVocabularies.rdf.rest,
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
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape that uses the StringListShape in a property.
 */
export class LanguageInPropertiesClass {
  private _$identifier: LanguageInPropertiesClass.$Identifier | undefined;
  readonly $type = "LanguageInPropertiesClass";
  readonly languageInPropertiesLanguageInProperty: purify.Maybe<rdfjs.Literal>;
  /**
   * literal property for testing runtime languageIn
   */
  readonly languageInPropertiesLiteralProperty: purify.Maybe<rdfjs.Literal>;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly languageInPropertiesLanguageInProperty?:
      | rdfjs.Literal
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal>
      | string;
    readonly languageInPropertiesLiteralProperty?:
      | rdfjs.Literal
      | Date
      | boolean
      | number
      | purify.Maybe<rdfjs.Literal>
      | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    if (
      purify.Maybe.isMaybe(parameters.languageInPropertiesLanguageInProperty)
    ) {
      this.languageInPropertiesLanguageInProperty =
        parameters.languageInPropertiesLanguageInProperty;
    } else if (
      typeof parameters.languageInPropertiesLanguageInProperty === "boolean"
    ) {
      this.languageInPropertiesLanguageInProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInPropertiesLanguageInProperty, {
          dataFactory,
        }),
      );
    } else if (
      typeof parameters.languageInPropertiesLanguageInProperty === "object" &&
      parameters.languageInPropertiesLanguageInProperty instanceof Date
    ) {
      this.languageInPropertiesLanguageInProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInPropertiesLanguageInProperty, {
          dataFactory,
        }),
      );
    } else if (
      typeof parameters.languageInPropertiesLanguageInProperty === "number"
    ) {
      this.languageInPropertiesLanguageInProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInPropertiesLanguageInProperty, {
          dataFactory,
        }),
      );
    } else if (
      typeof parameters.languageInPropertiesLanguageInProperty === "string"
    ) {
      this.languageInPropertiesLanguageInProperty = purify.Maybe.of(
        dataFactory.literal(parameters.languageInPropertiesLanguageInProperty),
      );
    } else if (
      typeof parameters.languageInPropertiesLanguageInProperty === "object"
    ) {
      this.languageInPropertiesLanguageInProperty = purify.Maybe.of(
        parameters.languageInPropertiesLanguageInProperty,
      );
    } else if (
      typeof parameters.languageInPropertiesLanguageInProperty === "undefined"
    ) {
      this.languageInPropertiesLanguageInProperty = purify.Maybe.empty();
    } else {
      this.languageInPropertiesLanguageInProperty =
        parameters.languageInPropertiesLanguageInProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.languageInPropertiesLiteralProperty)) {
      this.languageInPropertiesLiteralProperty =
        parameters.languageInPropertiesLiteralProperty;
    } else if (
      typeof parameters.languageInPropertiesLiteralProperty === "boolean"
    ) {
      this.languageInPropertiesLiteralProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInPropertiesLiteralProperty, {
          dataFactory,
        }),
      );
    } else if (
      typeof parameters.languageInPropertiesLiteralProperty === "object" &&
      parameters.languageInPropertiesLiteralProperty instanceof Date
    ) {
      this.languageInPropertiesLiteralProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInPropertiesLiteralProperty, {
          dataFactory,
        }),
      );
    } else if (
      typeof parameters.languageInPropertiesLiteralProperty === "number"
    ) {
      this.languageInPropertiesLiteralProperty = purify.Maybe.of(
        rdfLiteral.toRdf(parameters.languageInPropertiesLiteralProperty, {
          dataFactory,
        }),
      );
    } else if (
      typeof parameters.languageInPropertiesLiteralProperty === "string"
    ) {
      this.languageInPropertiesLiteralProperty = purify.Maybe.of(
        dataFactory.literal(parameters.languageInPropertiesLiteralProperty),
      );
    } else if (
      typeof parameters.languageInPropertiesLiteralProperty === "object"
    ) {
      this.languageInPropertiesLiteralProperty = purify.Maybe.of(
        parameters.languageInPropertiesLiteralProperty,
      );
    } else if (
      typeof parameters.languageInPropertiesLiteralProperty === "undefined"
    ) {
      this.languageInPropertiesLiteralProperty = purify.Maybe.empty();
    } else {
      this.languageInPropertiesLiteralProperty =
        parameters.languageInPropertiesLiteralProperty satisfies never;
    }
  }

  get $identifier(): LanguageInPropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: LanguageInPropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.languageInPropertiesLanguageInProperty,
          other.languageInPropertiesLanguageInProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "languageInPropertiesLanguageInProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.languageInPropertiesLiteralProperty,
          other.languageInPropertiesLiteralProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "languageInPropertiesLiteralProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.languageInPropertiesLanguageInProperty.ifJust((_value0) => {
      _hasher.update(_value0.datatype.value);
      _hasher.update(_value0.language);
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.languageInPropertiesLiteralProperty.ifJust((_value0) => {
      _hasher.update(_value0.datatype.value);
      _hasher.update(_value0.language);
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    return _hasher;
  }

  $toJson(): LanguageInPropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        languageInPropertiesLanguageInProperty:
          this.languageInPropertiesLanguageInProperty
            .map((_item) => ({
              "@language":
                _item.language.length > 0 ? _item.language : undefined,
              "@type":
                _item.datatype.value !==
                "http://www.w3.org/2001/XMLSchema#string"
                  ? _item.datatype.value
                  : undefined,
              "@value": _item.value,
            }))
            .extract(),
        languageInPropertiesLiteralProperty:
          this.languageInPropertiesLiteralProperty
            .map((_item) => ({
              "@language":
                _item.language.length > 0 ? _item.language : undefined,
              "@type":
                _item.datatype.value !==
                "http://www.w3.org/2001/XMLSchema#string"
                  ? _item.datatype.value
                  : undefined,
              "@value": _item.value,
            }))
            .extract(),
      } satisfies LanguageInPropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      LanguageInPropertiesClass.$properties
        .languageInPropertiesLanguageInProperty["identifier"],
      this.languageInPropertiesLanguageInProperty,
    );
    _resource.add(
      LanguageInPropertiesClass.$properties.languageInPropertiesLiteralProperty[
        "identifier"
      ],
      this.languageInPropertiesLiteralProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace LanguageInPropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "LanguageInPropertiesClass";
    readonly languageInPropertiesLanguageInProperty:
      | {
          readonly "@language": string | undefined;
          readonly "@type": string | undefined;
          readonly "@value": string;
        }
      | undefined;
    readonly languageInPropertiesLiteralProperty:
      | {
          readonly "@language": string | undefined;
          readonly "@type": string | undefined;
          readonly "@value": string;
        }
      | undefined;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      languageInPropertiesLanguageInProperty: purify.Maybe<rdfjs.Literal>;
      languageInPropertiesLiteralProperty: purify.Maybe<rdfjs.Literal>;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const languageInPropertiesLanguageInProperty = purify.Maybe.fromNullable(
      _jsonObject["languageInPropertiesLanguageInProperty"],
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
    const languageInPropertiesLiteralProperty = purify.Maybe.fromNullable(
      _jsonObject["languageInPropertiesLiteralProperty"],
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
      $identifier,
      languageInPropertiesLanguageInProperty,
      languageInPropertiesLiteralProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, LanguageInPropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new LanguageInPropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "LanguageInPropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/languageInPropertiesLanguageInProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/languageInPropertiesLiteralProperty`,
          type: "Control",
        },
      ],
      label: "LanguageInPropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("LanguageInPropertiesClass"),
      languageInPropertiesLanguageInProperty: zod
        .object({
          "@language": zod.string().optional(),
          "@type": zod.string().optional(),
          "@value": zod.string(),
        })
        .optional(),
      languageInPropertiesLiteralProperty: zod
        .object({
          "@language": zod.string().optional(),
          "@type": zod.string().optional(),
          "@value": zod.string(),
        })
        .optional()
        .describe("literal property for testing runtime languageIn"),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      languageInPropertiesLanguageInProperty: purify.Maybe<rdfjs.Literal>;
      languageInPropertiesLiteralProperty: purify.Maybe<rdfjs.Literal>;
    }
  > {
    const $identifier: LanguageInPropertiesClass.$Identifier =
      _resource.identifier;
    const _languageInPropertiesLanguageInPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(
          $properties.languageInPropertiesLanguageInProperty["identifier"],
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
    if (_languageInPropertiesLanguageInPropertyEither.isLeft()) {
      return _languageInPropertiesLanguageInPropertyEither;
    }

    const languageInPropertiesLanguageInProperty =
      _languageInPropertiesLanguageInPropertyEither.unsafeCoerce();
    const _languageInPropertiesLiteralPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values($properties.languageInPropertiesLiteralProperty["identifier"], {
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
    if (_languageInPropertiesLiteralPropertyEither.isLeft()) {
      return _languageInPropertiesLiteralPropertyEither;
    }

    const languageInPropertiesLiteralProperty =
      _languageInPropertiesLiteralPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      languageInPropertiesLanguageInProperty,
      languageInPropertiesLiteralProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof LanguageInPropertiesClass.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    LanguageInPropertiesClass
  > {
    return LanguageInPropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new LanguageInPropertiesClass(properties),
    );
  }

  export const $properties = {
    languageInPropertiesLanguageInProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/languageInPropertiesLanguageInProperty",
      ),
    },
    languageInPropertiesLiteralProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/languageInPropertiesLiteralProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        LanguageInPropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        LanguageInPropertiesClass.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      LanguageInPropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("languageInPropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "languageInPropertiesClass");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}LanguageInPropertiesLanguageInProperty`,
      ),
      predicate:
        LanguageInPropertiesClass.$properties
          .languageInPropertiesLanguageInProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}LanguageInPropertiesLiteralProperty`,
      ),
      predicate:
        LanguageInPropertiesClass.$properties
          .languageInPropertiesLiteralProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("languageInPropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "languageInPropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}LanguageInPropertiesLanguageInProperty`,
                ),
                predicate:
                  LanguageInPropertiesClass.$properties
                    .languageInPropertiesLanguageInProperty["identifier"],
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
                  `${variablePrefix}LanguageInPropertiesLiteralProperty`,
                ),
                predicate:
                  LanguageInPropertiesClass.$properties
                    .languageInPropertiesLiteralProperty["identifier"],
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * A node shape that only allows IRI identifiers.
 */
export class IriClass {
  readonly $identifier: IriClass.$Identifier;
  readonly $type = "IriClass";

  constructor(parameters: { readonly $identifier: rdfjs.NamedNode | string }) {
    if (typeof parameters.$identifier === "object") {
      this.$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this.$identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      this.$identifier = parameters.$identifier satisfies never;
    }
  }

  $equals(other: IriClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    return _hasher;
  }

  $toJson(): IriClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.$identifier.value,
        $type: this.$type,
      } satisfies IriClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.$identifier, {
      mutateGraph,
    });
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace IriClass {
  export type $Identifier = rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjs.NamedNode> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      ).chain((identifier) =>
        identifier.termType === "NamedNode"
          ? purify.Either.of(identifier)
          : purify.Left(new Error("expected identifier to be NamedNode")),
      ) as purify.Either<Error, rdfjs.NamedNode>;
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = { readonly "@id": string; readonly $type: "IriClass" };

  export function $propertiesFromJson(
    _json: unknown,
  ): purify.Either<zod.ZodError, { $identifier: rdfjs.NamedNode }> {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = dataFactory.namedNode(_jsonObject["@id"]);
    return purify.Either.of({ $identifier });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, IriClass> {
    return $propertiesFromJson(json).map(
      (properties) => new IriClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "IriClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
      ],
      label: "IriClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("IriClass"),
    });
  }

  export function $propertiesFromRdf({
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
    { $identifier: rdfjs.NamedNode }
  > {
    if (_resource.identifier.termType !== "NamedNode") {
      return purify.Left(
        new rdfjsResource.Resource.MistypedValueError({
          actualValue: _resource.identifier,
          expectedValueType: "(rdfjs.NamedNode)",
          focusResource: _resource,
          predicate: $RdfVocabularies.rdf.subject,
        }),
      );
    }

    const $identifier: IriClass.$Identifier = _resource.identifier;
    return purify.Either.of({ $identifier });
  }

  export function $fromRdf(
    parameters: Parameters<typeof IriClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, IriClass> {
    return IriClass.$propertiesFromRdf(parameters).map(
      (properties) => new IriClass(properties),
    );
  }

  export const $properties = {};

  export function $sparqlConstructQuery(
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
        IriClass.$sparqlConstructTemplateTriples({ ignoreRdfType, subject }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        IriClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      IriClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(_parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [];
  }

  export function $sparqlWherePatterns(_parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [];
  }
}
export interface InterfaceUnionMember2b {
  readonly $identifier: InterfaceUnionMember2b.$Identifier;
  readonly $type: "InterfaceUnionMember2b";
  readonly interfaceUnionMember2bProperty: string;
}

export namespace InterfaceUnionMember2b {
  export function $create(parameters: {
    readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly interfaceUnionMember2bProperty: string;
  }): InterfaceUnionMember2b {
    let $identifier: InterfaceUnionMember2b.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      $identifier = parameters.$identifier satisfies never;
    }

    const $type = "InterfaceUnionMember2b" as const;
    const interfaceUnionMember2bProperty =
      parameters.interfaceUnionMember2bProperty;
    return { $identifier, $type, interfaceUnionMember2bProperty };
  }

  export function $equals(
    left: InterfaceUnionMember2b,
    right: InterfaceUnionMember2b,
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
          left.interfaceUnionMember2bProperty,
          right.interfaceUnionMember2bProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "interfaceUnionMember2bProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "InterfaceUnionMember2b";
    readonly interfaceUnionMember2bProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "InterfaceUnionMember2b";
      interfaceUnionMember2bProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const $type = "InterfaceUnionMember2b" as const;
    const interfaceUnionMember2bProperty =
      _jsonObject["interfaceUnionMember2bProperty"];
    return purify.Either.of({
      $identifier,
      $type,
      interfaceUnionMember2bProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionMember2b> {
    return $propertiesFromJson(json);
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InterfaceUnionMember2b" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/interfaceUnionMember2bProperty`,
          type: "Control",
        },
      ],
      label: "InterfaceUnionMember2b",
      type: "Group",
    };
  }

  export function $toJson(
    _interfaceUnionMember2b: InterfaceUnionMember2b,
  ): InterfaceUnionMember2b.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _interfaceUnionMember2b.$identifier.termType === "BlankNode"
            ? `_:${_interfaceUnionMember2b.$identifier.value}`
            : _interfaceUnionMember2b.$identifier.value,
        $type: _interfaceUnionMember2b.$type,
        interfaceUnionMember2bProperty:
          _interfaceUnionMember2b.interfaceUnionMember2bProperty,
      } satisfies InterfaceUnionMember2b.$Json),
    );
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("InterfaceUnionMember2b"),
      interfaceUnionMember2bProperty: zod.string(),
    });
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionMember2b: InterfaceUnionMember2b,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionMember2b.$identifier.value);
    _hasher.update(_interfaceUnionMember2b.$type);
    InterfaceUnionMember2b.$hashShaclProperties(
      _interfaceUnionMember2b,
      _hasher,
    );
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionMember2b: InterfaceUnionMember2b,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionMember2b.interfaceUnionMember2bProperty);
    return _hasher;
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "InterfaceUnionMember2b";
      interfaceUnionMember2bProperty: string;
    }
  > {
    const $identifier: InterfaceUnionMember2b.$Identifier =
      _resource.identifier;
    const $type = "InterfaceUnionMember2b" as const;
    const _interfaceUnionMember2bPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.interfaceUnionMember2bProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_interfaceUnionMember2bPropertyEither.isLeft()) {
      return _interfaceUnionMember2bPropertyEither;
    }

    const interfaceUnionMember2bProperty =
      _interfaceUnionMember2bPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      $type,
      interfaceUnionMember2bProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof InterfaceUnionMember2b.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InterfaceUnionMember2b> {
    return InterfaceUnionMember2b.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _interfaceUnionMember2b: InterfaceUnionMember2b,
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
      _interfaceUnionMember2b.$identifier,
      { mutateGraph },
    );
    _resource.add(
      InterfaceUnionMember2b.$properties.interfaceUnionMember2bProperty[
        "identifier"
      ],
      _interfaceUnionMember2b.interfaceUnionMember2bProperty,
    );
    return _resource;
  }

  export const $properties = {
    interfaceUnionMember2bProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/interfaceUnionMember2bProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        InterfaceUnionMember2b.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionMember2b.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionMember2b.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("interfaceUnionMember2b");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionMember2b");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}InterfaceUnionMember2bProperty`,
      ),
      predicate:
        InterfaceUnionMember2b.$properties.interfaceUnionMember2bProperty[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("interfaceUnionMember2b");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionMember2b");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}InterfaceUnionMember2bProperty`,
            ),
            predicate:
              InterfaceUnionMember2b.$properties.interfaceUnionMember2bProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
export interface InterfaceUnionMember2a {
  readonly $identifier: InterfaceUnionMember2a.$Identifier;
  readonly $type: "InterfaceUnionMember2a";
  readonly interfaceUnionMember2aProperty: string;
}

export namespace InterfaceUnionMember2a {
  export function $create(parameters: {
    readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly interfaceUnionMember2aProperty: string;
  }): InterfaceUnionMember2a {
    let $identifier: InterfaceUnionMember2a.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      $identifier = parameters.$identifier satisfies never;
    }

    const $type = "InterfaceUnionMember2a" as const;
    const interfaceUnionMember2aProperty =
      parameters.interfaceUnionMember2aProperty;
    return { $identifier, $type, interfaceUnionMember2aProperty };
  }

  export function $equals(
    left: InterfaceUnionMember2a,
    right: InterfaceUnionMember2a,
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
          left.interfaceUnionMember2aProperty,
          right.interfaceUnionMember2aProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "interfaceUnionMember2aProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "InterfaceUnionMember2a";
    readonly interfaceUnionMember2aProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "InterfaceUnionMember2a";
      interfaceUnionMember2aProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const $type = "InterfaceUnionMember2a" as const;
    const interfaceUnionMember2aProperty =
      _jsonObject["interfaceUnionMember2aProperty"];
    return purify.Either.of({
      $identifier,
      $type,
      interfaceUnionMember2aProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionMember2a> {
    return $propertiesFromJson(json);
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InterfaceUnionMember2a" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/interfaceUnionMember2aProperty`,
          type: "Control",
        },
      ],
      label: "InterfaceUnionMember2a",
      type: "Group",
    };
  }

  export function $toJson(
    _interfaceUnionMember2a: InterfaceUnionMember2a,
  ): InterfaceUnionMember2a.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _interfaceUnionMember2a.$identifier.termType === "BlankNode"
            ? `_:${_interfaceUnionMember2a.$identifier.value}`
            : _interfaceUnionMember2a.$identifier.value,
        $type: _interfaceUnionMember2a.$type,
        interfaceUnionMember2aProperty:
          _interfaceUnionMember2a.interfaceUnionMember2aProperty,
      } satisfies InterfaceUnionMember2a.$Json),
    );
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("InterfaceUnionMember2a"),
      interfaceUnionMember2aProperty: zod.string(),
    });
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionMember2a: InterfaceUnionMember2a,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionMember2a.$identifier.value);
    _hasher.update(_interfaceUnionMember2a.$type);
    InterfaceUnionMember2a.$hashShaclProperties(
      _interfaceUnionMember2a,
      _hasher,
    );
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _interfaceUnionMember2a: InterfaceUnionMember2a,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_interfaceUnionMember2a.interfaceUnionMember2aProperty);
    return _hasher;
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "InterfaceUnionMember2a";
      interfaceUnionMember2aProperty: string;
    }
  > {
    const $identifier: InterfaceUnionMember2a.$Identifier =
      _resource.identifier;
    const $type = "InterfaceUnionMember2a" as const;
    const _interfaceUnionMember2aPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.interfaceUnionMember2aProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_interfaceUnionMember2aPropertyEither.isLeft()) {
      return _interfaceUnionMember2aPropertyEither;
    }

    const interfaceUnionMember2aProperty =
      _interfaceUnionMember2aPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      $type,
      interfaceUnionMember2aProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof InterfaceUnionMember2a.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InterfaceUnionMember2a> {
    return InterfaceUnionMember2a.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _interfaceUnionMember2a: InterfaceUnionMember2a,
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
      _interfaceUnionMember2a.$identifier,
      { mutateGraph },
    );
    _resource.add(
      InterfaceUnionMember2a.$properties.interfaceUnionMember2aProperty[
        "identifier"
      ],
      _interfaceUnionMember2a.interfaceUnionMember2aProperty,
    );
    return _resource;
  }

  export const $properties = {
    interfaceUnionMember2aProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/interfaceUnionMember2aProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        InterfaceUnionMember2a.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionMember2a.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionMember2a.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("interfaceUnionMember2a");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionMember2a");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}InterfaceUnionMember2aProperty`,
      ),
      predicate:
        InterfaceUnionMember2a.$properties.interfaceUnionMember2aProperty[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("interfaceUnionMember2a");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionMember2a");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}InterfaceUnionMember2aProperty`,
            ),
            predicate:
              InterfaceUnionMember2a.$properties.interfaceUnionMember2aProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
export interface InterfaceUnionMember1 {
  readonly $identifier: InterfaceUnionMember1.$Identifier;
  readonly $type: "InterfaceUnionMember1";
  readonly interfaceUnionMember1Property: string;
}

export namespace InterfaceUnionMember1 {
  export function $create(parameters: {
    readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly interfaceUnionMember1Property: string;
  }): InterfaceUnionMember1 {
    let $identifier: InterfaceUnionMember1.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      $identifier = parameters.$identifier satisfies never;
    }

    const $type = "InterfaceUnionMember1" as const;
    const interfaceUnionMember1Property =
      parameters.interfaceUnionMember1Property;
    return { $identifier, $type, interfaceUnionMember1Property };
  }

  export function $equals(
    left: InterfaceUnionMember1,
    right: InterfaceUnionMember1,
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
          left.interfaceUnionMember1Property,
          right.interfaceUnionMember1Property,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "interfaceUnionMember1Property",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "InterfaceUnionMember1";
    readonly interfaceUnionMember1Property: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "InterfaceUnionMember1";
      interfaceUnionMember1Property: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const $type = "InterfaceUnionMember1" as const;
    const interfaceUnionMember1Property =
      _jsonObject["interfaceUnionMember1Property"];
    return purify.Either.of({
      $identifier,
      $type,
      interfaceUnionMember1Property,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionMember1> {
    return $propertiesFromJson(json);
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InterfaceUnionMember1" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/interfaceUnionMember1Property`,
          type: "Control",
        },
      ],
      label: "InterfaceUnionMember1",
      type: "Group",
    };
  }

  export function $toJson(
    _interfaceUnionMember1: InterfaceUnionMember1,
  ): InterfaceUnionMember1.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _interfaceUnionMember1.$identifier.termType === "BlankNode"
            ? `_:${_interfaceUnionMember1.$identifier.value}`
            : _interfaceUnionMember1.$identifier.value,
        $type: _interfaceUnionMember1.$type,
        interfaceUnionMember1Property:
          _interfaceUnionMember1.interfaceUnionMember1Property,
      } satisfies InterfaceUnionMember1.$Json),
    );
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("InterfaceUnionMember1"),
      interfaceUnionMember1Property: zod.string(),
    });
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_interfaceUnionMember1: InterfaceUnionMember1, _hasher: HasherT): HasherT {
    _hasher.update(_interfaceUnionMember1.$identifier.value);
    _hasher.update(_interfaceUnionMember1.$type);
    InterfaceUnionMember1.$hashShaclProperties(_interfaceUnionMember1, _hasher);
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_interfaceUnionMember1: InterfaceUnionMember1, _hasher: HasherT): HasherT {
    _hasher.update(_interfaceUnionMember1.interfaceUnionMember1Property);
    return _hasher;
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "InterfaceUnionMember1";
      interfaceUnionMember1Property: string;
    }
  > {
    const $identifier: InterfaceUnionMember1.$Identifier = _resource.identifier;
    const $type = "InterfaceUnionMember1" as const;
    const _interfaceUnionMember1PropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.interfaceUnionMember1Property["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_interfaceUnionMember1PropertyEither.isLeft()) {
      return _interfaceUnionMember1PropertyEither;
    }

    const interfaceUnionMember1Property =
      _interfaceUnionMember1PropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      $type,
      interfaceUnionMember1Property,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof InterfaceUnionMember1.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InterfaceUnionMember1> {
    return InterfaceUnionMember1.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _interfaceUnionMember1: InterfaceUnionMember1,
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
      _interfaceUnionMember1.$identifier,
      { mutateGraph },
    );
    _resource.add(
      InterfaceUnionMember1.$properties.interfaceUnionMember1Property[
        "identifier"
      ],
      _interfaceUnionMember1.interfaceUnionMember1Property,
    );
    return _resource;
  }

  export const $properties = {
    interfaceUnionMember1Property: {
      identifier: dataFactory.namedNode(
        "http://example.com/interfaceUnionMember1Property",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        InterfaceUnionMember1.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionMember1.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionMember1.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("interfaceUnionMember1");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionMember1");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}InterfaceUnionMember1Property`,
      ),
      predicate:
        InterfaceUnionMember1.$properties.interfaceUnionMember1Property[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("interfaceUnionMember1");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "interfaceUnionMember1");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}InterfaceUnionMember1Property`,
            ),
            predicate:
              InterfaceUnionMember1.$properties.interfaceUnionMember1Property[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * A node shape that's generated as a TypeScript interface instead of a class.
 */
export interface Interface {
  readonly $identifier: Interface.$Identifier;
  readonly $type: "Interface";
  readonly interfaceProperty: string;
}

export namespace Interface {
  export function $create(parameters: {
    readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly interfaceProperty: string;
  }): Interface {
    let $identifier: Interface.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      $identifier = parameters.$identifier satisfies never;
    }

    const $type = "Interface" as const;
    const interfaceProperty = parameters.interfaceProperty;
    return { $identifier, $type, interfaceProperty };
  }

  export function $equals(left: Interface, right: Interface): $EqualsResult {
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
        $strictEquals(left.interfaceProperty, right.interfaceProperty).mapLeft(
          (propertyValuesUnequal) => ({
            left: left,
            right: right,
            propertyName: "interfaceProperty",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "Interface";
    readonly interfaceProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "Interface";
      interfaceProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const $type = "Interface" as const;
    const interfaceProperty = _jsonObject["interfaceProperty"];
    return purify.Either.of({ $identifier, $type, interfaceProperty });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, Interface> {
    return $propertiesFromJson(json);
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "Interface" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/interfaceProperty`,
          type: "Control",
        },
      ],
      label: "Interface",
      type: "Group",
    };
  }

  export function $toJson(_interface: Interface): Interface.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _interface.$identifier.termType === "BlankNode"
            ? `_:${_interface.$identifier.value}`
            : _interface.$identifier.value,
        $type: _interface.$type,
        interfaceProperty: _interface.interfaceProperty,
      } satisfies Interface.$Json),
    );
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("Interface"),
      interfaceProperty: zod.string(),
    });
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_interface: Interface, _hasher: HasherT): HasherT {
    _hasher.update(_interface.$identifier.value);
    _hasher.update(_interface.$type);
    Interface.$hashShaclProperties(_interface, _hasher);
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_interface: Interface, _hasher: HasherT): HasherT {
    _hasher.update(_interface.interfaceProperty);
    return _hasher;
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "Interface";
      interfaceProperty: string;
    }
  > {
    const $identifier: Interface.$Identifier = _resource.identifier;
    const $type = "Interface" as const;
    const _interfacePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.interfaceProperty["identifier"], { unique: true })
      .head()
      .chain((_value) => _value.toString());
    if (_interfacePropertyEither.isLeft()) {
      return _interfacePropertyEither;
    }

    const interfaceProperty = _interfacePropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, $type, interfaceProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof Interface.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, Interface> {
    return Interface.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _interface: Interface,
    {
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(_interface.$identifier, {
      mutateGraph,
    });
    _resource.add(
      Interface.$properties.interfaceProperty["identifier"],
      _interface.interfaceProperty,
    );
    return _resource;
  }

  export const $properties = {
    interfaceProperty: {
      identifier: dataFactory.namedNode("http://example.com/interfaceProperty"),
    },
  };

  export function $sparqlConstructQuery(
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
        Interface.$sparqlConstructTemplateTriples({ ignoreRdfType, subject }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        Interface.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      Interface.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject = parameters?.subject ?? dataFactory.variable!("interface");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "interface");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}InterfaceProperty`),
      predicate: Interface.$properties.interfaceProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject = parameters?.subject ?? dataFactory.variable!("interface");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "interface");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(`${variablePrefix}InterfaceProperty`),
            predicate: Interface.$properties.interfaceProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with sh:in properties.
 */
export class InPropertiesClass {
  private _$identifier: InPropertiesClass.$Identifier | undefined;
  readonly $type = "InPropertiesClass";
  readonly inBooleansProperty: purify.Maybe<true>;
  readonly inDateTimesProperty: purify.Maybe<Date>;
  readonly inIrisProperty: purify.Maybe<
    rdfjs.NamedNode<
      | "http://example.com/InPropertiesIri1"
      | "http://example.com/InPropertiesIri2"
    >
  >;
  readonly inNumbersProperty: purify.Maybe<1 | 2>;
  readonly inStringsProperty: purify.Maybe<"text" | "html">;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly inBooleansProperty?: purify.Maybe<true> | true;
    readonly inDateTimesProperty?: Date | purify.Maybe<Date>;
    readonly inIrisProperty?:
      | "http://example.com/InPropertiesIri1"
      | "http://example.com/InPropertiesIri2"
      | purify.Maybe<
          rdfjs.NamedNode<
            | "http://example.com/InPropertiesIri1"
            | "http://example.com/InPropertiesIri2"
          >
        >
      | rdfjs.NamedNode<
          | "http://example.com/InPropertiesIri1"
          | "http://example.com/InPropertiesIri2"
        >;
    readonly inNumbersProperty?: 1 | 2 | purify.Maybe<1 | 2>;
    readonly inStringsProperty?:
      | "text"
      | "html"
      | purify.Maybe<"text" | "html">;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.inBooleansProperty)) {
      this.inBooleansProperty = parameters.inBooleansProperty;
    } else if (typeof parameters.inBooleansProperty === "boolean") {
      this.inBooleansProperty = purify.Maybe.of(parameters.inBooleansProperty);
    } else if (typeof parameters.inBooleansProperty === "undefined") {
      this.inBooleansProperty = purify.Maybe.empty();
    } else {
      this.inBooleansProperty = parameters.inBooleansProperty satisfies never;
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
      this.inDateTimesProperty = parameters.inDateTimesProperty satisfies never;
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
      this.inIrisProperty = parameters.inIrisProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.inNumbersProperty)) {
      this.inNumbersProperty = parameters.inNumbersProperty;
    } else if (typeof parameters.inNumbersProperty === "number") {
      this.inNumbersProperty = purify.Maybe.of(parameters.inNumbersProperty);
    } else if (typeof parameters.inNumbersProperty === "undefined") {
      this.inNumbersProperty = purify.Maybe.empty();
    } else {
      this.inNumbersProperty = parameters.inNumbersProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.inStringsProperty)) {
      this.inStringsProperty = parameters.inStringsProperty;
    } else if (typeof parameters.inStringsProperty === "string") {
      this.inStringsProperty = purify.Maybe.of(parameters.inStringsProperty);
    } else if (typeof parameters.inStringsProperty === "undefined") {
      this.inStringsProperty = purify.Maybe.empty();
    } else {
      this.inStringsProperty = parameters.inStringsProperty satisfies never;
    }
  }

  get $identifier(): InPropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: InPropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
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

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
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

  $toJson(): InPropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
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
      } satisfies InPropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      InPropertiesClass.$properties.inBooleansProperty["identifier"],
      this.inBooleansProperty,
    );
    _resource.add(
      InPropertiesClass.$properties.inDateTimesProperty["identifier"],
      this.inDateTimesProperty.map((_value) =>
        rdfLiteral.toRdf(_value, {
          dataFactory,
          datatype: $RdfVocabularies.xsd.dateTime,
        }),
      ),
    );
    _resource.add(
      InPropertiesClass.$properties.inIrisProperty["identifier"],
      this.inIrisProperty,
    );
    _resource.add(
      InPropertiesClass.$properties.inNumbersProperty["identifier"],
      this.inNumbersProperty,
    );
    _resource.add(
      InPropertiesClass.$properties.inStringsProperty["identifier"],
      this.inStringsProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace InPropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "InPropertiesClass";
    readonly inBooleansProperty: true | undefined;
    readonly inDateTimesProperty: string | undefined;
    readonly inIrisProperty:
      | {
          readonly "@id":
            | "http://example.com/InPropertiesIri1"
            | "http://example.com/InPropertiesIri2";
        }
      | undefined;
    readonly inNumbersProperty: (1 | 2) | undefined;
    readonly inStringsProperty: ("text" | "html") | undefined;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      inBooleansProperty: purify.Maybe<true>;
      inDateTimesProperty: purify.Maybe<Date>;
      inIrisProperty: purify.Maybe<
        rdfjs.NamedNode<
          | "http://example.com/InPropertiesIri1"
          | "http://example.com/InPropertiesIri2"
        >
      >;
      inNumbersProperty: purify.Maybe<1 | 2>;
      inStringsProperty: purify.Maybe<"text" | "html">;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
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
      $identifier,
      inBooleansProperty,
      inDateTimesProperty,
      inIrisProperty,
      inNumbersProperty,
      inStringsProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InPropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new InPropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InPropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
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
      label: "InPropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("InPropertiesClass"),
      inBooleansProperty: zod.literal(true).optional(),
      inDateTimesProperty: zod.string().datetime().optional(),
      inIrisProperty: zod
        .object({
          "@id": zod.enum([
            "http://example.com/InPropertiesIri1",
            "http://example.com/InPropertiesIri2",
          ]),
        })
        .optional(),
      inNumbersProperty: zod.union([zod.literal(1), zod.literal(2)]).optional(),
      inStringsProperty: zod.enum(["text", "html"]).optional(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      inBooleansProperty: purify.Maybe<true>;
      inDateTimesProperty: purify.Maybe<Date>;
      inIrisProperty: purify.Maybe<
        rdfjs.NamedNode<
          | "http://example.com/InPropertiesIri1"
          | "http://example.com/InPropertiesIri2"
        >
      >;
      inNumbersProperty: purify.Maybe<1 | 2>;
      inStringsProperty: purify.Maybe<"text" | "html">;
    }
  > {
    const $identifier: InPropertiesClass.$Identifier = _resource.identifier;
    const _inBooleansPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<true>
    > = purify.Either.of(
      _resource
        .values($properties.inBooleansProperty["identifier"], { unique: true })
        .head()
        .chain((_value) =>
          _value.toBoolean().chain((value) =>
            value === true
              ? purify.Either.of(value)
              : purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: rdfLiteral.toRdf(value),
                    expectedValueType: "true",
                    focusResource: _resource,
                    predicate:
                      InPropertiesClass.$properties.inBooleansProperty[
                        "identifier"
                      ],
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
        .values($properties.inDateTimesProperty["identifier"], { unique: true })
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
                  datatype: $RdfVocabularies.xsd.dateTime,
                }),
                expectedValueType: "Date",
                focusResource: _resource,
                predicate:
                  InPropertiesClass.$properties.inDateTimesProperty[
                    "identifier"
                  ],
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
          | "http://example.com/InPropertiesIri1"
          | "http://example.com/InPropertiesIri2"
        >
      >
    > = purify.Either.of(
      _resource
        .values($properties.inIrisProperty["identifier"], { unique: true })
        .head()
        .chain((_value) =>
          _value.toIri().chain((iri) => {
            switch (iri.value) {
              case "http://example.com/InPropertiesIri1":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://example.com/InPropertiesIri1"
                    | "http://example.com/InPropertiesIri2"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://example.com/InPropertiesIri1">,
                );
              case "http://example.com/InPropertiesIri2":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://example.com/InPropertiesIri1"
                    | "http://example.com/InPropertiesIri2"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://example.com/InPropertiesIri2">,
                );
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: iri,
                    expectedValueType:
                      'rdfjs.NamedNode<"http://example.com/InPropertiesIri1" | "http://example.com/InPropertiesIri2">',
                    focusResource: _resource,
                    predicate:
                      InPropertiesClass.$properties.inIrisProperty[
                        "identifier"
                      ],
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
        .values($properties.inNumbersProperty["identifier"], { unique: true })
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
                    predicate:
                      InPropertiesClass.$properties.inNumbersProperty[
                        "identifier"
                      ],
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
        .values($properties.inStringsProperty["identifier"], { unique: true })
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
                    predicate:
                      InPropertiesClass.$properties.inStringsProperty[
                        "identifier"
                      ],
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
      $identifier,
      inBooleansProperty,
      inDateTimesProperty,
      inIrisProperty,
      inNumbersProperty,
      inStringsProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof InPropertiesClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InPropertiesClass> {
    return InPropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new InPropertiesClass(properties),
    );
  }

  export const $properties = {
    inBooleansProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/inBooleansProperty",
      ),
    },
    inDateTimesProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/inDateTimesProperty",
      ),
    },
    inIrisProperty: {
      identifier: dataFactory.namedNode("http://example.com/inIrisProperty"),
    },
    inNumbersProperty: {
      identifier: dataFactory.namedNode("http://example.com/inNumbersProperty"),
    },
    inStringsProperty: {
      identifier: dataFactory.namedNode("http://example.com/inStringsProperty"),
    },
  };

  export function $sparqlConstructQuery(
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
        InPropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InPropertiesClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InPropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("inPropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "inPropertiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}InBooleansProperty`),
      predicate: InPropertiesClass.$properties.inBooleansProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}InDateTimesProperty`),
      predicate:
        InPropertiesClass.$properties.inDateTimesProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}InIrisProperty`),
      predicate: InPropertiesClass.$properties.inIrisProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}InNumbersProperty`),
      predicate: InPropertiesClass.$properties.inNumbersProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}InStringsProperty`),
      predicate: InPropertiesClass.$properties.inStringsProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("inPropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "inPropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}InBooleansProperty`,
                ),
                predicate:
                  InPropertiesClass.$properties.inBooleansProperty[
                    "identifier"
                  ],
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
                predicate:
                  InPropertiesClass.$properties.inDateTimesProperty[
                    "identifier"
                  ],
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
                predicate:
                  InPropertiesClass.$properties.inIrisProperty["identifier"],
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
                predicate:
                  InPropertiesClass.$properties.inNumbersProperty["identifier"],
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
                predicate:
                  InPropertiesClass.$properties.inStringsProperty["identifier"],
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with sh:in constraining its identifier.
 */
export class InIdentifierClass {
  readonly $identifier: InIdentifierClass.$Identifier;
  readonly $type = "InIdentifierClass";
  readonly inIdentifierProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly $identifier:
      | "http://example.com/InIdentifierInstance1"
      | "http://example.com/InIdentifierInstance2"
      | rdfjs.NamedNode<
          | "http://example.com/InIdentifierInstance1"
          | "http://example.com/InIdentifierInstance2"
        >;
    readonly inIdentifierProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this.$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this.$identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      this.$identifier = parameters.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.inIdentifierProperty)) {
      this.inIdentifierProperty = parameters.inIdentifierProperty;
    } else if (typeof parameters.inIdentifierProperty === "string") {
      this.inIdentifierProperty = purify.Maybe.of(
        parameters.inIdentifierProperty,
      );
    } else if (typeof parameters.inIdentifierProperty === "undefined") {
      this.inIdentifierProperty = purify.Maybe.empty();
    } else {
      this.inIdentifierProperty =
        parameters.inIdentifierProperty satisfies never;
    }
  }

  $equals(other: InIdentifierClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.inIdentifierProperty,
          other.inIdentifierProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inIdentifierProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.inIdentifierProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    return _hasher;
  }

  $toJson(): InIdentifierClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id": this.$identifier.value,
        $type: this.$type,
        inIdentifierProperty: this.inIdentifierProperty
          .map((_item) => _item)
          .extract(),
      } satisfies InIdentifierClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      InIdentifierClass.$properties.inIdentifierProperty["identifier"],
      this.inIdentifierProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace InIdentifierClass {
  export type $Identifier = rdfjs.NamedNode<
    | "http://example.com/InIdentifierInstance1"
    | "http://example.com/InIdentifierInstance2"
  >;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<
      Error,
      rdfjs.NamedNode<
        | "http://example.com/InIdentifierInstance1"
        | "http://example.com/InIdentifierInstance2"
      >
    > {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      )
        .chain((identifier) =>
          identifier.termType === "NamedNode"
            ? purify.Either.of(identifier)
            : purify.Left(new Error("expected identifier to be NamedNode")),
        )
        .chain((identifier) => {
          switch (identifier.value) {
            case "http://example.com/InIdentifierInstance1":
              return purify.Either.of(
                identifier as rdfjs.NamedNode<"http://example.com/InIdentifierInstance1">,
              );
            case "http://example.com/InIdentifierInstance2":
              return purify.Either.of(
                identifier as rdfjs.NamedNode<"http://example.com/InIdentifierInstance2">,
              );
            default:
              return purify.Left(
                new Error(
                  "expected NamedNode identifier to be one of http://example.com/InIdentifierInstance1 http://example.com/InIdentifierInstance2",
                ),
              );
          }
        }) as purify.Either<
        Error,
        rdfjs.NamedNode<
          | "http://example.com/InIdentifierInstance1"
          | "http://example.com/InIdentifierInstance2"
        >
      >;
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "InIdentifierClass";
    readonly inIdentifierProperty: string | undefined;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.NamedNode<
        | "http://example.com/InIdentifierInstance1"
        | "http://example.com/InIdentifierInstance2"
      >;
      inIdentifierProperty: purify.Maybe<string>;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = dataFactory.namedNode(_jsonObject["@id"]);
    const inIdentifierProperty = purify.Maybe.fromNullable(
      _jsonObject["inIdentifierProperty"],
    );
    return purify.Either.of({ $identifier, inIdentifierProperty });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InIdentifierClass> {
    return $propertiesFromJson(json).map(
      (properties) => new InIdentifierClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "InIdentifierClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/inIdentifierProperty`,
          type: "Control",
        },
      ],
      label: "InIdentifierClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.enum([
        "http://example.com/InIdentifierInstance1",
        "http://example.com/InIdentifierInstance2",
      ]),
      $type: zod.literal("InIdentifierClass"),
      inIdentifierProperty: zod.string().optional(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.NamedNode<
        | "http://example.com/InIdentifierInstance1"
        | "http://example.com/InIdentifierInstance2"
      >;
      inIdentifierProperty: purify.Maybe<string>;
    }
  > {
    let $identifier: InIdentifierClass.$Identifier;
    switch (_resource.identifier.value) {
      case "http://example.com/InIdentifierInstance1":
        $identifier = dataFactory.namedNode(
          "http://example.com/InIdentifierInstance1",
        );
        break;
      case "http://example.com/InIdentifierInstance2":
        $identifier = dataFactory.namedNode(
          "http://example.com/InIdentifierInstance2",
        );
        break;
      default:
        return purify.Left(
          new rdfjsResource.Resource.MistypedValueError({
            actualValue: _resource.identifier,
            expectedValueType:
              'rdfjs.NamedNode<"http://example.com/InIdentifierInstance1" | "http://example.com/InIdentifierInstance2">',
            focusResource: _resource,
            predicate: $RdfVocabularies.rdf.subject,
          }),
        );
    }

    const _inIdentifierPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values($properties.inIdentifierProperty["identifier"], {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_inIdentifierPropertyEither.isLeft()) {
      return _inIdentifierPropertyEither;
    }

    const inIdentifierProperty = _inIdentifierPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, inIdentifierProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof InIdentifierClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, InIdentifierClass> {
    return InIdentifierClass.$propertiesFromRdf(parameters).map(
      (properties) => new InIdentifierClass(properties),
    );
  }

  export const $properties = {
    inIdentifierProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/inIdentifierProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        InIdentifierClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InIdentifierClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InIdentifierClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("inIdentifierClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "inIdentifierClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}InIdentifierProperty`),
      predicate:
        InIdentifierClass.$properties.inIdentifierProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("inIdentifierClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "inIdentifierClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}InIdentifierProperty`,
                ),
                predicate:
                  InIdentifierClass.$properties.inIdentifierProperty[
                    "identifier"
                  ],
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with sh:hasValue properties.
 */
export class HasValuePropertiesClass {
  private _$identifier: HasValuePropertiesClass.$Identifier | undefined;
  readonly $type = "HasValuePropertiesClass";
  readonly hasIriValueProperty: purify.Maybe<rdfjs.NamedNode>;
  readonly hasLiteralValueProperty: purify.Maybe<string>;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly hasIriValueProperty?:
      | rdfjs.NamedNode
      | purify.Maybe<rdfjs.NamedNode>
      | string;
    readonly hasLiteralValueProperty?: purify.Maybe<string> | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.hasIriValueProperty)) {
      this.hasIriValueProperty = parameters.hasIriValueProperty;
    } else if (typeof parameters.hasIriValueProperty === "object") {
      this.hasIriValueProperty = purify.Maybe.of(
        parameters.hasIriValueProperty,
      );
    } else if (typeof parameters.hasIriValueProperty === "string") {
      this.hasIriValueProperty = purify.Maybe.of(
        dataFactory.namedNode(parameters.hasIriValueProperty),
      );
    } else if (typeof parameters.hasIriValueProperty === "undefined") {
      this.hasIriValueProperty = purify.Maybe.empty();
    } else {
      this.hasIriValueProperty = parameters.hasIriValueProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.hasLiteralValueProperty)) {
      this.hasLiteralValueProperty = parameters.hasLiteralValueProperty;
    } else if (typeof parameters.hasLiteralValueProperty === "string") {
      this.hasLiteralValueProperty = purify.Maybe.of(
        parameters.hasLiteralValueProperty,
      );
    } else if (typeof parameters.hasLiteralValueProperty === "undefined") {
      this.hasLiteralValueProperty = purify.Maybe.empty();
    } else {
      this.hasLiteralValueProperty =
        parameters.hasLiteralValueProperty satisfies never;
    }
  }

  get $identifier(): HasValuePropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: HasValuePropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.hasIriValueProperty,
          other.hasIriValueProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "hasIriValueProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $strictEquals))(
          this.hasLiteralValueProperty,
          other.hasLiteralValueProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "hasLiteralValueProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.hasIriValueProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.hasLiteralValueProperty.ifJust((_value0) => {
      _hasher.update(_value0);
    });
    return _hasher;
  }

  $toJson(): HasValuePropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        hasIriValueProperty: this.hasIriValueProperty
          .map((_item) => ({ "@id": _item.value }))
          .extract(),
        hasLiteralValueProperty: this.hasLiteralValueProperty
          .map((_item) => _item)
          .extract(),
      } satisfies HasValuePropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      HasValuePropertiesClass.$properties.hasIriValueProperty["identifier"],
      this.hasIriValueProperty,
    );
    _resource.add(
      HasValuePropertiesClass.$properties.hasLiteralValueProperty["identifier"],
      this.hasLiteralValueProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace HasValuePropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "HasValuePropertiesClass";
    readonly hasIriValueProperty: { readonly "@id": string } | undefined;
    readonly hasLiteralValueProperty: string | undefined;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      hasIriValueProperty: purify.Maybe<rdfjs.NamedNode>;
      hasLiteralValueProperty: purify.Maybe<string>;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const hasIriValueProperty = purify.Maybe.fromNullable(
      _jsonObject["hasIriValueProperty"],
    ).map((_item) => dataFactory.namedNode(_item["@id"]));
    const hasLiteralValueProperty = purify.Maybe.fromNullable(
      _jsonObject["hasLiteralValueProperty"],
    );
    return purify.Either.of({
      $identifier,
      hasIriValueProperty,
      hasLiteralValueProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, HasValuePropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new HasValuePropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "HasValuePropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/hasIriValueProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/hasLiteralValueProperty`,
          type: "Control",
        },
      ],
      label: "HasValuePropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("HasValuePropertiesClass"),
      hasIriValueProperty: zod
        .object({ "@id": zod.string().min(1) })
        .optional(),
      hasLiteralValueProperty: zod.string().optional(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      hasIriValueProperty: purify.Maybe<rdfjs.NamedNode>;
      hasLiteralValueProperty: purify.Maybe<string>;
    }
  > {
    const $identifier: HasValuePropertiesClass.$Identifier =
      _resource.identifier;
    const _hasIriValuePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values($properties.hasIriValueProperty["identifier"], { unique: true })
        .find((_value) =>
          _value
            .toTerm()
            .equals(
              dataFactory.namedNode(
                "http://example.com/HasValuePropertiesClassIri1",
              ),
            ),
        )
        .chain((_value) => _value.toIri())
        .toMaybe(),
    );
    if (_hasIriValuePropertyEither.isLeft()) {
      return _hasIriValuePropertyEither;
    }

    const hasIriValueProperty = _hasIriValuePropertyEither.unsafeCoerce();
    const _hasLiteralValuePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values($properties.hasLiteralValueProperty["identifier"], {
          unique: true,
        })
        .find((_value) => _value.toTerm().equals(dataFactory.literal("test")))
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_hasLiteralValuePropertyEither.isLeft()) {
      return _hasLiteralValuePropertyEither;
    }

    const hasLiteralValueProperty =
      _hasLiteralValuePropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      hasIriValueProperty,
      hasLiteralValueProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof HasValuePropertiesClass.$propertiesFromRdf
    >[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, HasValuePropertiesClass> {
    return HasValuePropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new HasValuePropertiesClass(properties),
    );
  }

  export const $properties = {
    hasIriValueProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/hasIriValueProperty",
      ),
    },
    hasLiteralValueProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/hasLiteralValueProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        HasValuePropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        HasValuePropertiesClass.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      HasValuePropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("hasValuePropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "hasValuePropertiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}HasIriValueProperty`),
      predicate:
        HasValuePropertiesClass.$properties.hasIriValueProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}HasLiteralValueProperty`),
      predicate:
        HasValuePropertiesClass.$properties.hasLiteralValueProperty[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("hasValuePropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "hasValuePropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}HasIriValueProperty`,
                ),
                predicate:
                  HasValuePropertiesClass.$properties.hasIriValueProperty[
                    "identifier"
                  ],
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
                  `${variablePrefix}HasLiteralValueProperty`,
                ),
                predicate:
                  HasValuePropertiesClass.$properties.hasLiteralValueProperty[
                    "identifier"
                  ],
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
export class ExternPropertiesInlineNestedClass {
  private _$identifier:
    | ExternPropertiesInlineNestedClass.$Identifier
    | undefined;
  readonly $type = "ExternPropertiesInlineNestedClass";
  readonly externPropertiesInlineNestedStringProperty: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly externPropertiesInlineNestedStringProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.externPropertiesInlineNestedStringProperty =
      parameters.externPropertiesInlineNestedStringProperty;
  }

  get $identifier(): ExternPropertiesInlineNestedClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: ExternPropertiesInlineNestedClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.externPropertiesInlineNestedStringProperty,
          other.externPropertiesInlineNestedStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "externPropertiesInlineNestedStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.externPropertiesInlineNestedStringProperty);
    return _hasher;
  }

  $toJson(): ExternPropertiesInlineNestedClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        externPropertiesInlineNestedStringProperty:
          this.externPropertiesInlineNestedStringProperty,
      } satisfies ExternPropertiesInlineNestedClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      ExternPropertiesInlineNestedClass.$properties
        .externPropertiesInlineNestedStringProperty["identifier"],
      this.externPropertiesInlineNestedStringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ExternPropertiesInlineNestedClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ExternPropertiesInlineNestedClass";
    readonly externPropertiesInlineNestedStringProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      externPropertiesInlineNestedStringProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const externPropertiesInlineNestedStringProperty =
      _jsonObject["externPropertiesInlineNestedStringProperty"];
    return purify.Either.of({
      $identifier,
      externPropertiesInlineNestedStringProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ExternPropertiesInlineNestedClass> {
    return $propertiesFromJson(json).map(
      (properties) => new ExternPropertiesInlineNestedClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ExternPropertiesInlineNestedClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/externPropertiesInlineNestedStringProperty`,
          type: "Control",
        },
      ],
      label: "ExternPropertiesInlineNestedClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ExternPropertiesInlineNestedClass"),
      externPropertiesInlineNestedStringProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      externPropertiesInlineNestedStringProperty: string;
    }
  > {
    const $identifier: ExternPropertiesInlineNestedClass.$Identifier =
      _resource.identifier;
    const _externPropertiesInlineNestedStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(
        $properties.externPropertiesInlineNestedStringProperty["identifier"],
        { unique: true },
      )
      .head()
      .chain((_value) => _value.toString());
    if (_externPropertiesInlineNestedStringPropertyEither.isLeft()) {
      return _externPropertiesInlineNestedStringPropertyEither;
    }

    const externPropertiesInlineNestedStringProperty =
      _externPropertiesInlineNestedStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      externPropertiesInlineNestedStringProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof ExternPropertiesInlineNestedClass.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ExternPropertiesInlineNestedClass
  > {
    return ExternPropertiesInlineNestedClass.$propertiesFromRdf(parameters).map(
      (properties) => new ExternPropertiesInlineNestedClass(properties),
    );
  }

  export const $properties = {
    externPropertiesInlineNestedStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/externPropertiesInlineNestedStringProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ExternPropertiesInlineNestedClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ExternPropertiesInlineNestedClass.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ExternPropertiesInlineNestedClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("externPropertiesInlineNestedClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "externPropertiesInlineNestedClass");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ExternPropertiesInlineNestedStringProperty`,
      ),
      predicate:
        ExternPropertiesInlineNestedClass.$properties
          .externPropertiesInlineNestedStringProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("externPropertiesInlineNestedClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "externPropertiesInlineNestedClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ExternPropertiesInlineNestedStringProperty`,
            ),
            predicate:
              ExternPropertiesInlineNestedClass.$properties
                .externPropertiesInlineNestedStringProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
export class ExternPropertiesExternNestedClass {
  private _$identifier:
    | ExternPropertiesExternNestedClass.$Identifier
    | undefined;
  readonly $type = "ExternPropertiesExternNestedClass";
  readonly externPropertiesExternNestedStringProperty: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly externPropertiesExternNestedStringProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.externPropertiesExternNestedStringProperty =
      parameters.externPropertiesExternNestedStringProperty;
  }

  get $identifier(): ExternPropertiesExternNestedClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: ExternPropertiesExternNestedClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.externPropertiesExternNestedStringProperty,
          other.externPropertiesExternNestedStringProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "externPropertiesExternNestedStringProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.externPropertiesExternNestedStringProperty);
    return _hasher;
  }

  $toJson(): ExternPropertiesExternNestedClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        externPropertiesExternNestedStringProperty:
          this.externPropertiesExternNestedStringProperty,
      } satisfies ExternPropertiesExternNestedClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      ExternPropertiesExternNestedClass.$properties
        .externPropertiesExternNestedStringProperty["identifier"],
      this.externPropertiesExternNestedStringProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ExternPropertiesExternNestedClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ExternPropertiesExternNestedClass";
    readonly externPropertiesExternNestedStringProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      externPropertiesExternNestedStringProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const externPropertiesExternNestedStringProperty =
      _jsonObject["externPropertiesExternNestedStringProperty"];
    return purify.Either.of({
      $identifier,
      externPropertiesExternNestedStringProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ExternPropertiesExternNestedClass> {
    return $propertiesFromJson(json).map(
      (properties) => new ExternPropertiesExternNestedClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ExternPropertiesExternNestedClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/externPropertiesExternNestedStringProperty`,
          type: "Control",
        },
      ],
      label: "ExternPropertiesExternNestedClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ExternPropertiesExternNestedClass"),
      externPropertiesExternNestedStringProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      externPropertiesExternNestedStringProperty: string;
    }
  > {
    const $identifier: ExternPropertiesExternNestedClass.$Identifier =
      _resource.identifier;
    const _externPropertiesExternNestedStringPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(
        $properties.externPropertiesExternNestedStringProperty["identifier"],
        { unique: true },
      )
      .head()
      .chain((_value) => _value.toString());
    if (_externPropertiesExternNestedStringPropertyEither.isLeft()) {
      return _externPropertiesExternNestedStringPropertyEither;
    }

    const externPropertiesExternNestedStringProperty =
      _externPropertiesExternNestedStringPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      externPropertiesExternNestedStringProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof ExternPropertiesExternNestedClass.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ExternPropertiesExternNestedClass
  > {
    return ExternPropertiesExternNestedClass.$propertiesFromRdf(parameters).map(
      (properties) => new ExternPropertiesExternNestedClass(properties),
    );
  }

  export const $properties = {
    externPropertiesExternNestedStringProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/externPropertiesExternNestedStringProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ExternPropertiesExternNestedClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ExternPropertiesExternNestedClass.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ExternPropertiesExternNestedClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("externPropertiesExternNestedClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "externPropertiesExternNestedClass");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ExternPropertiesExternNestedStringProperty`,
      ),
      predicate:
        ExternPropertiesExternNestedClass.$properties
          .externPropertiesExternNestedStringProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("externPropertiesExternNestedClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "externPropertiesExternNestedClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ExternPropertiesExternNestedStringProperty`,
            ),
            predicate:
              ExternPropertiesExternNestedClass.$properties
                .externPropertiesExternNestedStringProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Node shape that inlines/nests another node shape and externs/references another.
 */
export class ExternPropertiesClass {
  private _$identifier: ExternPropertiesClass.$Identifier | undefined;
  readonly $type = "ExternPropertiesClass";
  readonly externClassProperty: purify.Maybe<ExternClass>;
  readonly externNestedProperty: purify.Maybe<
    rdfjs.BlankNode | rdfjs.NamedNode
  >;
  readonly inlineNestedProperty: purify.Maybe<ExternPropertiesInlineNestedClass>;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly externClassProperty?: ExternClass | purify.Maybe<ExternClass>;
    readonly externNestedProperty?:
      | (rdfjs.BlankNode | rdfjs.NamedNode)
      | purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
      | string;
    readonly inlineNestedProperty?:
      | ExternPropertiesInlineNestedClass
      | purify.Maybe<ExternPropertiesInlineNestedClass>;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.externClassProperty)) {
      this.externClassProperty = parameters.externClassProperty;
    } else if (
      typeof parameters.externClassProperty === "object" &&
      parameters.externClassProperty instanceof ExternClass
    ) {
      this.externClassProperty = purify.Maybe.of(
        parameters.externClassProperty,
      );
    } else if (typeof parameters.externClassProperty === "undefined") {
      this.externClassProperty = purify.Maybe.empty();
    } else {
      this.externClassProperty = parameters.externClassProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.externNestedProperty)) {
      this.externNestedProperty = parameters.externNestedProperty;
    } else if (typeof parameters.externNestedProperty === "object") {
      this.externNestedProperty = purify.Maybe.of(
        parameters.externNestedProperty,
      );
    } else if (typeof parameters.externNestedProperty === "string") {
      this.externNestedProperty = purify.Maybe.of(
        dataFactory.namedNode(parameters.externNestedProperty),
      );
    } else if (typeof parameters.externNestedProperty === "undefined") {
      this.externNestedProperty = purify.Maybe.empty();
    } else {
      this.externNestedProperty =
        parameters.externNestedProperty satisfies never;
    }

    if (purify.Maybe.isMaybe(parameters.inlineNestedProperty)) {
      this.inlineNestedProperty = parameters.inlineNestedProperty;
    } else if (
      typeof parameters.inlineNestedProperty === "object" &&
      parameters.inlineNestedProperty instanceof
        ExternPropertiesInlineNestedClass
    ) {
      this.inlineNestedProperty = purify.Maybe.of(
        parameters.inlineNestedProperty,
      );
    } else if (typeof parameters.inlineNestedProperty === "undefined") {
      this.inlineNestedProperty = purify.Maybe.empty();
    } else {
      this.inlineNestedProperty =
        parameters.inlineNestedProperty satisfies never;
    }
  }

  get $identifier(): ExternPropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: ExternPropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(left, right, (left, right) => left.$equals(right)))(
          this.externClassProperty,
          other.externClassProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "externClassProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) => $maybeEquals(left, right, $booleanEquals))(
          this.externNestedProperty,
          other.externNestedProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "externNestedProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          $maybeEquals(left, right, (left, right) => left.$equals(right)))(
          this.inlineNestedProperty,
          other.inlineNestedProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inlineNestedProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.externClassProperty.ifJust((_value0) => {
      _value0.$hash(_hasher);
    });
    this.externNestedProperty.ifJust((_value0) => {
      _hasher.update(_value0.termType);
      _hasher.update(_value0.value);
    });
    this.inlineNestedProperty.ifJust((_value0) => {
      _value0.$hash(_hasher);
    });
    return _hasher;
  }

  $toJson(): ExternPropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        externClassProperty: this.externClassProperty
          .map((_item) => _item.$toJson())
          .extract(),
        externNestedProperty: this.externNestedProperty
          .map((_item) =>
            _item.termType === "BlankNode"
              ? { "@id": `_:${_item.value}` }
              : { "@id": _item.value },
          )
          .extract(),
        inlineNestedProperty: this.inlineNestedProperty
          .map((_item) => _item.$toJson())
          .extract(),
      } satisfies ExternPropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      ExternPropertiesClass.$properties.externClassProperty["identifier"],
      this.externClassProperty.map((_value) =>
        _value.$toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      ExternPropertiesClass.$properties.externNestedProperty["identifier"],
      this.externNestedProperty,
    );
    _resource.add(
      ExternPropertiesClass.$properties.inlineNestedProperty["identifier"],
      this.inlineNestedProperty.map((_value) =>
        _value.$toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ExternPropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ExternPropertiesClass";
    readonly externClassProperty: ExternClass.$Json | undefined;
    readonly externNestedProperty: { readonly "@id": string } | undefined;
    readonly inlineNestedProperty:
      | ExternPropertiesInlineNestedClass.$Json
      | undefined;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      externClassProperty: purify.Maybe<ExternClass>;
      externNestedProperty: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
      inlineNestedProperty: purify.Maybe<ExternPropertiesInlineNestedClass>;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const externClassProperty = purify.Maybe.fromNullable(
      _jsonObject["externClassProperty"],
    ).map((_item) => ExternClass.$fromJson(_item).unsafeCoerce());
    const externNestedProperty = purify.Maybe.fromNullable(
      _jsonObject["externNestedProperty"],
    ).map((_item) =>
      _item["@id"].startsWith("_:")
        ? dataFactory.blankNode(_item["@id"].substring(2))
        : dataFactory.namedNode(_item["@id"]),
    );
    const inlineNestedProperty = purify.Maybe.fromNullable(
      _jsonObject["inlineNestedProperty"],
    ).map((_item) =>
      ExternPropertiesInlineNestedClass.$fromJson(_item).unsafeCoerce(),
    );
    return purify.Either.of({
      $identifier,
      externClassProperty,
      externNestedProperty,
      inlineNestedProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ExternPropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new ExternPropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ExternPropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        ExternClass.$jsonUiSchema({
          scopePrefix: `${scopePrefix}/properties/externClassProperty`,
        }),
        {
          scope: `${scopePrefix}/properties/externNestedProperty`,
          type: "Control",
        },
        ExternPropertiesInlineNestedClass.$jsonUiSchema({
          scopePrefix: `${scopePrefix}/properties/inlineNestedProperty`,
        }),
      ],
      label: "ExternPropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ExternPropertiesClass"),
      externClassProperty: ExternClass.$jsonZodSchema().optional(),
      externNestedProperty: zod
        .object({ "@id": zod.string().min(1) })
        .optional(),
      inlineNestedProperty:
        ExternPropertiesInlineNestedClass.$jsonZodSchema().optional(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      externClassProperty: purify.Maybe<ExternClass>;
      externNestedProperty: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
      inlineNestedProperty: purify.Maybe<ExternPropertiesInlineNestedClass>;
    }
  > {
    const $identifier: ExternPropertiesClass.$Identifier = _resource.identifier;
    const _externClassPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<ExternClass>
    > = purify.Either.of(
      _resource
        .values($properties.externClassProperty["identifier"], { unique: true })
        .head()
        .chain((value) => value.toResource())
        .chain((_resource) =>
          ExternClass.$fromRdf({
            ..._context,
            ignoreRdfType: true,
            languageIn: _languageIn,
            resource: _resource,
          }),
        )
        .toMaybe(),
    );
    if (_externClassPropertyEither.isLeft()) {
      return _externClassPropertyEither;
    }

    const externClassProperty = _externClassPropertyEither.unsafeCoerce();
    const _externNestedPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values($properties.externNestedProperty["identifier"], {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toIdentifier())
        .toMaybe(),
    );
    if (_externNestedPropertyEither.isLeft()) {
      return _externNestedPropertyEither;
    }

    const externNestedProperty = _externNestedPropertyEither.unsafeCoerce();
    const _inlineNestedPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<ExternPropertiesInlineNestedClass>
    > = purify.Either.of(
      _resource
        .values($properties.inlineNestedProperty["identifier"], {
          unique: true,
        })
        .head()
        .chain((value) => value.toResource())
        .chain((_resource) =>
          ExternPropertiesInlineNestedClass.$fromRdf({
            ..._context,
            ignoreRdfType: true,
            languageIn: _languageIn,
            resource: _resource,
          }),
        )
        .toMaybe(),
    );
    if (_inlineNestedPropertyEither.isLeft()) {
      return _inlineNestedPropertyEither;
    }

    const inlineNestedProperty = _inlineNestedPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      externClassProperty,
      externNestedProperty,
      inlineNestedProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ExternPropertiesClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ExternPropertiesClass> {
    return ExternPropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new ExternPropertiesClass(properties),
    );
  }

  export const $properties = {
    externClassProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/externClassProperty",
      ),
    },
    externNestedProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/externNestedProperty",
      ),
    },
    inlineNestedProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/inlineNestedProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ExternPropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ExternPropertiesClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ExternPropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("externPropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "externPropertiesClass");
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}ExternClassProperty`),
      predicate:
        ExternPropertiesClass.$properties.externClassProperty["identifier"],
      subject,
    });
    triples.push(
      ...ExternClass.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(`${variablePrefix}ExternClassProperty`),
        variablePrefix: `${variablePrefix}ExternClassProperty`,
      }),
    );
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}ExternNestedProperty`),
      predicate:
        ExternPropertiesClass.$properties.externNestedProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(`${variablePrefix}InlineNestedProperty`),
      predicate:
        ExternPropertiesClass.$properties.inlineNestedProperty["identifier"],
      subject,
    });
    triples.push(
      ...ExternPropertiesInlineNestedClass.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject: dataFactory.variable!(`${variablePrefix}InlineNestedProperty`),
        variablePrefix: `${variablePrefix}InlineNestedProperty`,
      }),
    );
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("externPropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "externPropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}ExternClassProperty`,
                ),
                predicate:
                  ExternPropertiesClass.$properties.externClassProperty[
                    "identifier"
                  ],
                subject,
              },
            ],
            type: "bgp",
          },
          ...ExternClass.$sparqlWherePatterns({
            ignoreRdfType: true,
            subject: dataFactory.variable!(
              `${variablePrefix}ExternClassProperty`,
            ),
            variablePrefix: `${variablePrefix}ExternClassProperty`,
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
                  `${variablePrefix}ExternNestedProperty`,
                ),
                predicate:
                  ExternPropertiesClass.$properties.externNestedProperty[
                    "identifier"
                  ],
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
                  `${variablePrefix}InlineNestedProperty`,
                ),
                predicate:
                  ExternPropertiesClass.$properties.inlineNestedProperty[
                    "identifier"
                  ],
                subject,
              },
            ],
            type: "bgp",
          },
          ...ExternPropertiesInlineNestedClass.$sparqlWherePatterns({
            ignoreRdfType: true,
            subject: dataFactory.variable!(
              `${variablePrefix}InlineNestedProperty`,
            ),
            variablePrefix: `${variablePrefix}InlineNestedProperty`,
          }),
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with custom rdf:type's.
 *
 * The shaclmate:rdfType is expected on deserialization and added on serialization.
 */
export class ExplicitRdfTypeClass {
  private _$identifier: ExplicitRdfTypeClass.$Identifier | undefined;
  readonly $type = "ExplicitRdfTypeClass";
  readonly explicitRdfTypeProperty: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly explicitRdfTypeProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.explicitRdfTypeProperty = parameters.explicitRdfTypeProperty;
  }

  get $identifier(): ExplicitRdfTypeClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: ExplicitRdfTypeClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.explicitRdfTypeProperty,
          other.explicitRdfTypeProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "explicitRdfTypeProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.explicitRdfTypeProperty);
    return _hasher;
  }

  $toJson(): ExplicitRdfTypeClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        explicitRdfTypeProperty: this.explicitRdfTypeProperty,
      } satisfies ExplicitRdfTypeClass.$Json),
    );
  }

  $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/RdfType"),
      );
    }

    _resource.add(
      ExplicitRdfTypeClass.$properties.explicitRdfTypeProperty["identifier"],
      this.explicitRdfTypeProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ExplicitRdfTypeClass {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/RdfType",
  );
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ExplicitRdfTypeClass";
    readonly explicitRdfTypeProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      explicitRdfTypeProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const explicitRdfTypeProperty = _jsonObject["explicitRdfTypeProperty"];
    return purify.Either.of({ $identifier, explicitRdfTypeProperty });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ExplicitRdfTypeClass> {
    return $propertiesFromJson(json).map(
      (properties) => new ExplicitRdfTypeClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ExplicitRdfTypeClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/explicitRdfTypeProperty`,
          type: "Control",
        },
      ],
      label: "ExplicitRdfTypeClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ExplicitRdfTypeClass"),
      explicitRdfTypeProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      explicitRdfTypeProperty: string;
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/RdfType)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: ExplicitRdfTypeClass.$Identifier = _resource.identifier;
    const _explicitRdfTypePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.explicitRdfTypeProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_explicitRdfTypePropertyEither.isLeft()) {
      return _explicitRdfTypePropertyEither;
    }

    const explicitRdfTypeProperty =
      _explicitRdfTypePropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, explicitRdfTypeProperty });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ExplicitRdfTypeClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ExplicitRdfTypeClass> {
    return ExplicitRdfTypeClass.$propertiesFromRdf(parameters).map(
      (properties) => new ExplicitRdfTypeClass(properties),
    );
  }

  export const $properties = {
    explicitRdfTypeProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/explicitRdfTypeProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ExplicitRdfTypeClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ExplicitRdfTypeClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ExplicitRdfTypeClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("explicitRdfTypeClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "explicitRdfTypeClass");
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(`${variablePrefix}ExplicitRdfTypeProperty`),
      predicate:
        ExplicitRdfTypeClass.$properties.explicitRdfTypeProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("explicitRdfTypeClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "explicitRdfTypeClass");
    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ExplicitRdfTypeProperty`,
            ),
            predicate:
              ExplicitRdfTypeClass.$properties.explicitRdfTypeProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with custom rdf:type's.
 *
 * The shaclmate:fromRdfType is expected on deserialization.
 * shaclmate:toRdfType's are added an serialization.
 */
export class ExplicitFromToRdfTypesClass {
  private _$identifier: ExplicitFromToRdfTypesClass.$Identifier | undefined;
  readonly $type = "ExplicitFromToRdfTypesClass";
  readonly explicitFromToRdfTypesProperty: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly explicitFromToRdfTypesProperty: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.explicitFromToRdfTypesProperty =
      parameters.explicitFromToRdfTypesProperty;
  }

  get $identifier(): ExplicitFromToRdfTypesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: ExplicitFromToRdfTypesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.explicitFromToRdfTypesProperty,
          other.explicitFromToRdfTypesProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "explicitFromToRdfTypesProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.explicitFromToRdfTypesProperty);
    return _hasher;
  }

  $toJson(): ExplicitFromToRdfTypesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        explicitFromToRdfTypesProperty: this.explicitFromToRdfTypesProperty,
      } satisfies ExplicitFromToRdfTypesClass.$Json),
    );
  }

  $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/ToRdfType"),
      );
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/FromRdfType"),
      );
    }

    _resource.add(
      ExplicitFromToRdfTypesClass.$properties.explicitFromToRdfTypesProperty[
        "identifier"
      ],
      this.explicitFromToRdfTypesProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ExplicitFromToRdfTypesClass {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/FromRdfType",
  );
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ExplicitFromToRdfTypesClass";
    readonly explicitFromToRdfTypesProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      explicitFromToRdfTypesProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const explicitFromToRdfTypesProperty =
      _jsonObject["explicitFromToRdfTypesProperty"];
    return purify.Either.of({ $identifier, explicitFromToRdfTypesProperty });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ExplicitFromToRdfTypesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new ExplicitFromToRdfTypesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ExplicitFromToRdfTypesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/explicitFromToRdfTypesProperty`,
          type: "Control",
        },
      ],
      label: "ExplicitFromToRdfTypesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ExplicitFromToRdfTypesClass"),
      explicitFromToRdfTypesProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      explicitFromToRdfTypesProperty: string;
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/FromRdfType)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: ExplicitFromToRdfTypesClass.$Identifier =
      _resource.identifier;
    const _explicitFromToRdfTypesPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.explicitFromToRdfTypesProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_explicitFromToRdfTypesPropertyEither.isLeft()) {
      return _explicitFromToRdfTypesPropertyEither;
    }

    const explicitFromToRdfTypesProperty =
      _explicitFromToRdfTypesPropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, explicitFromToRdfTypesProperty });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof ExplicitFromToRdfTypesClass.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    ExplicitFromToRdfTypesClass
  > {
    return ExplicitFromToRdfTypesClass.$propertiesFromRdf(parameters).map(
      (properties) => new ExplicitFromToRdfTypesClass(properties),
    );
  }

  export const $properties = {
    explicitFromToRdfTypesProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/explicitFromToRdfTypesProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ExplicitFromToRdfTypesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ExplicitFromToRdfTypesClass.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ExplicitFromToRdfTypesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("explicitFromToRdfTypesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "explicitFromToRdfTypesClass");
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ExplicitFromToRdfTypesProperty`,
      ),
      predicate:
        ExplicitFromToRdfTypesClass.$properties.explicitFromToRdfTypesProperty[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("explicitFromToRdfTypesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "explicitFromToRdfTypesClass");
    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ExplicitFromToRdfTypesProperty`,
            ),
            predicate:
              ExplicitFromToRdfTypesClass.$properties
                .explicitFromToRdfTypesProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape with sh:defaultValue properties.
 */
export class DefaultValuePropertiesClass {
  private _$identifier: DefaultValuePropertiesClass.$Identifier | undefined;
  protected readonly _$identifierPrefix?: string;
  readonly $type = "DefaultValuePropertiesClass";
  readonly dateDefaultValueProperty: Date;
  readonly dateTimeDefaultValueProperty: Date;
  readonly falseBooleanDefaultValueProperty: boolean;
  readonly numberDefaultValueProperty: number;
  readonly stringDefaultValueProperty: string;
  readonly trueBooleanDefaultValueProperty: boolean;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly $identifierPrefix?: string;
    readonly dateDefaultValueProperty?: Date;
    readonly dateTimeDefaultValueProperty?: Date;
    readonly falseBooleanDefaultValueProperty?: boolean;
    readonly numberDefaultValueProperty?: number;
    readonly stringDefaultValueProperty?: string;
    readonly trueBooleanDefaultValueProperty?: boolean;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this._$identifierPrefix = parameters.$identifierPrefix;
    if (
      typeof parameters.dateDefaultValueProperty === "object" &&
      parameters.dateDefaultValueProperty instanceof Date
    ) {
      this.dateDefaultValueProperty = parameters.dateDefaultValueProperty;
    } else if (typeof parameters.dateDefaultValueProperty === "undefined") {
      this.dateDefaultValueProperty = new Date("2018-04-09T00:00:00.000Z");
    } else {
      this.dateDefaultValueProperty =
        parameters.dateDefaultValueProperty satisfies never;
    }

    if (
      typeof parameters.dateTimeDefaultValueProperty === "object" &&
      parameters.dateTimeDefaultValueProperty instanceof Date
    ) {
      this.dateTimeDefaultValueProperty =
        parameters.dateTimeDefaultValueProperty;
    } else if (typeof parameters.dateTimeDefaultValueProperty === "undefined") {
      this.dateTimeDefaultValueProperty = new Date("2018-04-09T10:00:00.000Z");
    } else {
      this.dateTimeDefaultValueProperty =
        parameters.dateTimeDefaultValueProperty satisfies never;
    }

    if (typeof parameters.falseBooleanDefaultValueProperty === "boolean") {
      this.falseBooleanDefaultValueProperty =
        parameters.falseBooleanDefaultValueProperty;
    } else if (
      typeof parameters.falseBooleanDefaultValueProperty === "undefined"
    ) {
      this.falseBooleanDefaultValueProperty = false;
    } else {
      this.falseBooleanDefaultValueProperty =
        parameters.falseBooleanDefaultValueProperty satisfies never;
    }

    if (typeof parameters.numberDefaultValueProperty === "number") {
      this.numberDefaultValueProperty = parameters.numberDefaultValueProperty;
    } else if (typeof parameters.numberDefaultValueProperty === "undefined") {
      this.numberDefaultValueProperty = 0;
    } else {
      this.numberDefaultValueProperty =
        parameters.numberDefaultValueProperty satisfies never;
    }

    if (typeof parameters.stringDefaultValueProperty === "string") {
      this.stringDefaultValueProperty = parameters.stringDefaultValueProperty;
    } else if (typeof parameters.stringDefaultValueProperty === "undefined") {
      this.stringDefaultValueProperty = "";
    } else {
      this.stringDefaultValueProperty =
        parameters.stringDefaultValueProperty satisfies never;
    }

    if (typeof parameters.trueBooleanDefaultValueProperty === "boolean") {
      this.trueBooleanDefaultValueProperty =
        parameters.trueBooleanDefaultValueProperty;
    } else if (
      typeof parameters.trueBooleanDefaultValueProperty === "undefined"
    ) {
      this.trueBooleanDefaultValueProperty = true;
    } else {
      this.trueBooleanDefaultValueProperty =
        parameters.trueBooleanDefaultValueProperty satisfies never;
    }
  }

  get $identifier(): DefaultValuePropertiesClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.namedNode(
        `${this.$identifierPrefix}${this.$hashShaclProperties(sha256.create())}`,
      );
    }
    return this._$identifier;
  }

  protected get $identifierPrefix(): string {
    return typeof this._$identifierPrefix !== "undefined"
      ? this._$identifierPrefix
      : `urn:shaclmate:${this.$type}:`;
  }

  $equals(other: DefaultValuePropertiesClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$identifierPrefix, other.$identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $dateEquals(
          this.dateDefaultValueProperty,
          other.dateDefaultValueProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "dateDefaultValueProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        $dateEquals(
          this.dateTimeDefaultValueProperty,
          other.dateTimeDefaultValueProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "dateTimeDefaultValueProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        $strictEquals(
          this.falseBooleanDefaultValueProperty,
          other.falseBooleanDefaultValueProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "falseBooleanDefaultValueProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        $strictEquals(
          this.numberDefaultValueProperty,
          other.numberDefaultValueProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "numberDefaultValueProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        $strictEquals(
          this.stringDefaultValueProperty,
          other.stringDefaultValueProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "stringDefaultValueProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        $strictEquals(
          this.trueBooleanDefaultValueProperty,
          other.trueBooleanDefaultValueProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "trueBooleanDefaultValueProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.dateDefaultValueProperty.toISOString());
    _hasher.update(this.dateTimeDefaultValueProperty.toISOString());
    _hasher.update(this.falseBooleanDefaultValueProperty.toString());
    _hasher.update(this.numberDefaultValueProperty.toString());
    _hasher.update(this.stringDefaultValueProperty);
    _hasher.update(this.trueBooleanDefaultValueProperty.toString());
    return _hasher;
  }

  $toJson(): DefaultValuePropertiesClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        dateDefaultValueProperty: this.dateDefaultValueProperty
          .toISOString()
          .replace(/T.*$/, ""),
        dateTimeDefaultValueProperty:
          this.dateTimeDefaultValueProperty.toISOString(),
        falseBooleanDefaultValueProperty: this.falseBooleanDefaultValueProperty,
        numberDefaultValueProperty: this.numberDefaultValueProperty,
        stringDefaultValueProperty: this.stringDefaultValueProperty,
        trueBooleanDefaultValueProperty: this.trueBooleanDefaultValueProperty,
      } satisfies DefaultValuePropertiesClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      DefaultValuePropertiesClass.$properties.dateDefaultValueProperty[
        "identifier"
      ],
      this.dateDefaultValueProperty.getTime() !== 1523232000000
        ? rdfLiteral.toRdf(this.dateDefaultValueProperty, {
            dataFactory,
            datatype: $RdfVocabularies.xsd.date,
          })
        : undefined,
    );
    _resource.add(
      DefaultValuePropertiesClass.$properties.dateTimeDefaultValueProperty[
        "identifier"
      ],
      this.dateTimeDefaultValueProperty.getTime() !== 1523268000000
        ? rdfLiteral.toRdf(this.dateTimeDefaultValueProperty, {
            dataFactory,
            datatype: $RdfVocabularies.xsd.dateTime,
          })
        : undefined,
    );
    _resource.add(
      DefaultValuePropertiesClass.$properties.falseBooleanDefaultValueProperty[
        "identifier"
      ],
      this.falseBooleanDefaultValueProperty ? true : undefined,
    );
    _resource.add(
      DefaultValuePropertiesClass.$properties.numberDefaultValueProperty[
        "identifier"
      ],
      this.numberDefaultValueProperty !== 0
        ? this.numberDefaultValueProperty
        : undefined,
    );
    _resource.add(
      DefaultValuePropertiesClass.$properties.stringDefaultValueProperty[
        "identifier"
      ],
      this.stringDefaultValueProperty !== ""
        ? this.stringDefaultValueProperty
        : undefined,
    );
    _resource.add(
      DefaultValuePropertiesClass.$properties.trueBooleanDefaultValueProperty[
        "identifier"
      ],
      !this.trueBooleanDefaultValueProperty ? false : undefined,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace DefaultValuePropertiesClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "DefaultValuePropertiesClass";
    readonly dateDefaultValueProperty: string;
    readonly dateTimeDefaultValueProperty: string;
    readonly falseBooleanDefaultValueProperty: boolean;
    readonly numberDefaultValueProperty: number;
    readonly stringDefaultValueProperty: string;
    readonly trueBooleanDefaultValueProperty: boolean;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      dateDefaultValueProperty: Date;
      dateTimeDefaultValueProperty: Date;
      falseBooleanDefaultValueProperty: boolean;
      numberDefaultValueProperty: number;
      stringDefaultValueProperty: string;
      trueBooleanDefaultValueProperty: boolean;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const dateDefaultValueProperty = new Date(
      _jsonObject["dateDefaultValueProperty"],
    );
    const dateTimeDefaultValueProperty = new Date(
      _jsonObject["dateTimeDefaultValueProperty"],
    );
    const falseBooleanDefaultValueProperty =
      _jsonObject["falseBooleanDefaultValueProperty"];
    const numberDefaultValueProperty =
      _jsonObject["numberDefaultValueProperty"];
    const stringDefaultValueProperty =
      _jsonObject["stringDefaultValueProperty"];
    const trueBooleanDefaultValueProperty =
      _jsonObject["trueBooleanDefaultValueProperty"];
    return purify.Either.of({
      $identifier,
      dateDefaultValueProperty,
      dateTimeDefaultValueProperty,
      falseBooleanDefaultValueProperty,
      numberDefaultValueProperty,
      stringDefaultValueProperty,
      trueBooleanDefaultValueProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, DefaultValuePropertiesClass> {
    return $propertiesFromJson(json).map(
      (properties) => new DefaultValuePropertiesClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "DefaultValuePropertiesClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/dateDefaultValueProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/dateTimeDefaultValueProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/falseBooleanDefaultValueProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/numberDefaultValueProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/stringDefaultValueProperty`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/trueBooleanDefaultValueProperty`,
          type: "Control",
        },
      ],
      label: "DefaultValuePropertiesClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("DefaultValuePropertiesClass"),
      dateDefaultValueProperty: zod.string().date(),
      dateTimeDefaultValueProperty: zod.string().datetime(),
      falseBooleanDefaultValueProperty: zod.boolean(),
      numberDefaultValueProperty: zod.number(),
      stringDefaultValueProperty: zod.string(),
      trueBooleanDefaultValueProperty: zod.boolean(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      dateDefaultValueProperty: Date;
      dateTimeDefaultValueProperty: Date;
      falseBooleanDefaultValueProperty: boolean;
      numberDefaultValueProperty: number;
      stringDefaultValueProperty: string;
      trueBooleanDefaultValueProperty: boolean;
    }
  > {
    const $identifier: DefaultValuePropertiesClass.$Identifier =
      _resource.identifier;
    const _dateDefaultValuePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      Date
    > = _resource
      .values($properties.dateDefaultValueProperty["identifier"], {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate:
              DefaultValuePropertiesClass.$properties.dateDefaultValueProperty[
                "identifier"
              ],
            object: dataFactory.literal(
              "2018-04-09",
              $RdfVocabularies.xsd.date,
            ),
          }),
        ),
      )
      .chain((_value) => _value.toDate());
    if (_dateDefaultValuePropertyEither.isLeft()) {
      return _dateDefaultValuePropertyEither;
    }

    const dateDefaultValueProperty =
      _dateDefaultValuePropertyEither.unsafeCoerce();
    const _dateTimeDefaultValuePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      Date
    > = _resource
      .values($properties.dateTimeDefaultValueProperty["identifier"], {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate:
              DefaultValuePropertiesClass.$properties
                .dateTimeDefaultValueProperty["identifier"],
            object: dataFactory.literal(
              "2018-04-09T10:00:00Z",
              $RdfVocabularies.xsd.dateTime,
            ),
          }),
        ),
      )
      .chain((_value) => _value.toDate());
    if (_dateTimeDefaultValuePropertyEither.isLeft()) {
      return _dateTimeDefaultValuePropertyEither;
    }

    const dateTimeDefaultValueProperty =
      _dateTimeDefaultValuePropertyEither.unsafeCoerce();
    const _falseBooleanDefaultValuePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      boolean
    > = _resource
      .values($properties.falseBooleanDefaultValueProperty["identifier"], {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate:
              DefaultValuePropertiesClass.$properties
                .falseBooleanDefaultValueProperty["identifier"],
            object: dataFactory.literal("false", $RdfVocabularies.xsd.boolean),
          }),
        ),
      )
      .chain((_value) => _value.toBoolean());
    if (_falseBooleanDefaultValuePropertyEither.isLeft()) {
      return _falseBooleanDefaultValuePropertyEither;
    }

    const falseBooleanDefaultValueProperty =
      _falseBooleanDefaultValuePropertyEither.unsafeCoerce();
    const _numberDefaultValuePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      number
    > = _resource
      .values($properties.numberDefaultValueProperty["identifier"], {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate:
              DefaultValuePropertiesClass.$properties
                .numberDefaultValueProperty["identifier"],
            object: dataFactory.literal("0", $RdfVocabularies.xsd.integer),
          }),
        ),
      )
      .chain((_value) => _value.toNumber());
    if (_numberDefaultValuePropertyEither.isLeft()) {
      return _numberDefaultValuePropertyEither;
    }

    const numberDefaultValueProperty =
      _numberDefaultValuePropertyEither.unsafeCoerce();
    const _stringDefaultValuePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.stringDefaultValueProperty["identifier"], {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate:
              DefaultValuePropertiesClass.$properties
                .stringDefaultValueProperty["identifier"],
            object: dataFactory.literal(""),
          }),
        ),
      )
      .chain((_value) => _value.toString());
    if (_stringDefaultValuePropertyEither.isLeft()) {
      return _stringDefaultValuePropertyEither;
    }

    const stringDefaultValueProperty =
      _stringDefaultValuePropertyEither.unsafeCoerce();
    const _trueBooleanDefaultValuePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      boolean
    > = _resource
      .values($properties.trueBooleanDefaultValueProperty["identifier"], {
        unique: true,
      })
      .head()
      .alt(
        purify.Either.of(
          new rdfjsResource.Resource.Value({
            subject: _resource,
            predicate:
              DefaultValuePropertiesClass.$properties
                .trueBooleanDefaultValueProperty["identifier"],
            object: dataFactory.literal("true", $RdfVocabularies.xsd.boolean),
          }),
        ),
      )
      .chain((_value) => _value.toBoolean());
    if (_trueBooleanDefaultValuePropertyEither.isLeft()) {
      return _trueBooleanDefaultValuePropertyEither;
    }

    const trueBooleanDefaultValueProperty =
      _trueBooleanDefaultValuePropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      dateDefaultValueProperty,
      dateTimeDefaultValueProperty,
      falseBooleanDefaultValueProperty,
      numberDefaultValueProperty,
      stringDefaultValueProperty,
      trueBooleanDefaultValueProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof DefaultValuePropertiesClass.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    DefaultValuePropertiesClass
  > {
    return DefaultValuePropertiesClass.$propertiesFromRdf(parameters).map(
      (properties) => new DefaultValuePropertiesClass(properties),
    );
  }

  export const $properties = {
    dateDefaultValueProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/dateDefaultValueProperty",
      ),
    },
    dateTimeDefaultValueProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/dateTimeDefaultValueProperty",
      ),
    },
    falseBooleanDefaultValueProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/falseBooleanDefaultValueProperty",
      ),
    },
    numberDefaultValueProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/numberDefaultValueProperty",
      ),
    },
    stringDefaultValueProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/stringDefaultValueProperty",
      ),
    },
    trueBooleanDefaultValueProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/trueBooleanDefaultValueProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        DefaultValuePropertiesClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        DefaultValuePropertiesClass.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      DefaultValuePropertiesClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("defaultValuePropertiesClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "defaultValuePropertiesClass");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}DateDefaultValueProperty`,
      ),
      predicate:
        DefaultValuePropertiesClass.$properties.dateDefaultValueProperty[
          "identifier"
        ],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}DateTimeDefaultValueProperty`,
      ),
      predicate:
        DefaultValuePropertiesClass.$properties.dateTimeDefaultValueProperty[
          "identifier"
        ],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}FalseBooleanDefaultValueProperty`,
      ),
      predicate:
        DefaultValuePropertiesClass.$properties
          .falseBooleanDefaultValueProperty["identifier"],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}NumberDefaultValueProperty`,
      ),
      predicate:
        DefaultValuePropertiesClass.$properties.numberDefaultValueProperty[
          "identifier"
        ],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}StringDefaultValueProperty`,
      ),
      predicate:
        DefaultValuePropertiesClass.$properties.stringDefaultValueProperty[
          "identifier"
        ],
      subject,
    });
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}TrueBooleanDefaultValueProperty`,
      ),
      predicate:
        DefaultValuePropertiesClass.$properties.trueBooleanDefaultValueProperty[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("defaultValuePropertiesClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "defaultValuePropertiesClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        patterns: [
          {
            triples: [
              {
                object: dataFactory.variable!(
                  `${variablePrefix}DateDefaultValueProperty`,
                ),
                predicate:
                  DefaultValuePropertiesClass.$properties
                    .dateDefaultValueProperty["identifier"],
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
                  `${variablePrefix}DateTimeDefaultValueProperty`,
                ),
                predicate:
                  DefaultValuePropertiesClass.$properties
                    .dateTimeDefaultValueProperty["identifier"],
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
                  `${variablePrefix}FalseBooleanDefaultValueProperty`,
                ),
                predicate:
                  DefaultValuePropertiesClass.$properties
                    .falseBooleanDefaultValueProperty["identifier"],
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
                  `${variablePrefix}NumberDefaultValueProperty`,
                ),
                predicate:
                  DefaultValuePropertiesClass.$properties
                    .numberDefaultValueProperty["identifier"],
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
                  `${variablePrefix}StringDefaultValueProperty`,
                ),
                predicate:
                  DefaultValuePropertiesClass.$properties
                    .stringDefaultValueProperty["identifier"],
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
                  `${variablePrefix}TrueBooleanDefaultValueProperty`,
                ),
                predicate:
                  DefaultValuePropertiesClass.$properties
                    .trueBooleanDefaultValueProperty["identifier"],
                subject,
              },
            ],
            type: "bgp",
          },
        ],
        type: "optional",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Base interface for other node shapes.
 */
export interface BaseInterfaceWithProperties {
  readonly $identifier: BaseInterfaceWithPropertiesStatic.$Identifier;
  readonly $type:
    | "BaseInterfaceWithProperties"
    | "BaseInterfaceWithoutProperties"
    | "ConcreteChildInterface"
    | "ConcreteParentInterface";
  readonly baseInterfaceWithPropertiesProperty: string;
}

export namespace BaseInterfaceWithPropertiesStatic {
  export function $create(parameters: {
    readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly baseInterfaceWithPropertiesProperty: string;
  }): BaseInterfaceWithProperties {
    let $identifier: BaseInterfaceWithPropertiesStatic.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      $identifier = parameters.$identifier satisfies never;
    }

    const $type = "BaseInterfaceWithProperties" as const;
    const baseInterfaceWithPropertiesProperty =
      parameters.baseInterfaceWithPropertiesProperty;
    return { $identifier, $type, baseInterfaceWithPropertiesProperty };
  }

  export function $equals(
    left: BaseInterfaceWithProperties,
    right: BaseInterfaceWithProperties,
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
          left.baseInterfaceWithPropertiesProperty,
          right.baseInterfaceWithPropertiesProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: left,
          right: right,
          propertyName: "baseInterfaceWithPropertiesProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/BaseInterfaceWithProperties",
  );
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type:
      | "BaseInterfaceWithProperties"
      | "BaseInterfaceWithoutProperties"
      | "ConcreteChildInterface"
      | "ConcreteParentInterface";
    readonly baseInterfaceWithPropertiesProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type:
        | "BaseInterfaceWithProperties"
        | "BaseInterfaceWithoutProperties"
        | "ConcreteChildInterface"
        | "ConcreteParentInterface";
      baseInterfaceWithPropertiesProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const $type = "BaseInterfaceWithProperties" as const;
    const baseInterfaceWithPropertiesProperty =
      _jsonObject["baseInterfaceWithPropertiesProperty"];
    return purify.Either.of({
      $identifier,
      $type,
      baseInterfaceWithPropertiesProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, BaseInterfaceWithProperties> {
    return (
      BaseInterfaceWithoutPropertiesStatic.$fromJson(json) as purify.Either<
        zod.ZodError,
        BaseInterfaceWithProperties
      >
    ).altLazy(() => $propertiesFromJson(json));
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "BaseInterfaceWithProperties" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/baseInterfaceWithPropertiesProperty`,
          type: "Control",
        },
      ],
      label: "BaseInterfaceWithProperties",
      type: "Group",
    };
  }

  export function $toJson(
    _baseInterfaceWithProperties: BaseInterfaceWithProperties,
  ): BaseInterfaceWithPropertiesStatic.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _baseInterfaceWithProperties.$identifier.termType === "BlankNode"
            ? `_:${_baseInterfaceWithProperties.$identifier.value}`
            : _baseInterfaceWithProperties.$identifier.value,
        $type: _baseInterfaceWithProperties.$type,
        baseInterfaceWithPropertiesProperty:
          _baseInterfaceWithProperties.baseInterfaceWithPropertiesProperty,
      } satisfies BaseInterfaceWithPropertiesStatic.$Json),
    );
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.enum([
        "BaseInterfaceWithProperties",
        "BaseInterfaceWithoutProperties",
        "ConcreteChildInterface",
        "ConcreteParentInterface",
      ]),
      baseInterfaceWithPropertiesProperty: zod.string(),
    });
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _baseInterfaceWithProperties: BaseInterfaceWithProperties,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(_baseInterfaceWithProperties.$identifier.value);
    _hasher.update(_baseInterfaceWithProperties.$type);
    BaseInterfaceWithPropertiesStatic.$hashShaclProperties(
      _baseInterfaceWithProperties,
      _hasher,
    );
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _baseInterfaceWithProperties: BaseInterfaceWithProperties,
    _hasher: HasherT,
  ): HasherT {
    _hasher.update(
      _baseInterfaceWithProperties.baseInterfaceWithPropertiesProperty,
    );
    return _hasher;
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type:
        | "BaseInterfaceWithProperties"
        | "BaseInterfaceWithoutProperties"
        | "ConcreteChildInterface"
        | "ConcreteParentInterface";
      baseInterfaceWithPropertiesProperty: string;
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/BaseInterfaceWithProperties)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: BaseInterfaceWithPropertiesStatic.$Identifier =
      _resource.identifier;
    const $type = "BaseInterfaceWithProperties" as const;
    const _baseInterfaceWithPropertiesPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.baseInterfaceWithPropertiesProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_baseInterfaceWithPropertiesPropertyEither.isLeft()) {
      return _baseInterfaceWithPropertiesPropertyEither;
    }

    const baseInterfaceWithPropertiesProperty =
      _baseInterfaceWithPropertiesPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      $type,
      baseInterfaceWithPropertiesProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof BaseInterfaceWithPropertiesStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    BaseInterfaceWithProperties
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      BaseInterfaceWithoutPropertiesStatic.$fromRdf(
        otherParameters,
      ) as purify.Either<
        rdfjsResource.Resource.ValueError,
        BaseInterfaceWithProperties
      >
    ).altLazy(() =>
      BaseInterfaceWithPropertiesStatic.$propertiesFromRdf(parameters),
    );
  }

  export function $toRdf(
    _baseInterfaceWithProperties: BaseInterfaceWithProperties,
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
      _baseInterfaceWithProperties.$identifier,
      { mutateGraph },
    );
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://example.com/BaseInterfaceWithProperties",
        ),
      );
    }

    _resource.add(
      BaseInterfaceWithPropertiesStatic.$properties
        .baseInterfaceWithPropertiesProperty["identifier"],
      _baseInterfaceWithProperties.baseInterfaceWithPropertiesProperty,
    );
    return _resource;
  }

  export const $properties = {
    baseInterfaceWithPropertiesProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/baseInterfaceWithPropertiesProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        BaseInterfaceWithPropertiesStatic.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        BaseInterfaceWithPropertiesStatic.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      BaseInterfaceWithPropertiesStatic.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("baseInterfaceWithProperties");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "baseInterfaceWithProperties");
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}BaseInterfaceWithPropertiesProperty`,
      ),
      predicate:
        BaseInterfaceWithPropertiesStatic.$properties
          .baseInterfaceWithPropertiesProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("baseInterfaceWithProperties");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "baseInterfaceWithProperties");
    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}BaseInterfaceWithPropertiesProperty`,
            ),
            predicate:
              BaseInterfaceWithPropertiesStatic.$properties
                .baseInterfaceWithPropertiesProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Base interface for other node shapes. Put the base interface with properties above the base interface without.
 */
export interface BaseInterfaceWithoutProperties
  extends BaseInterfaceWithProperties {
  readonly $identifier: BaseInterfaceWithoutPropertiesStatic.$Identifier;
  readonly $type:
    | "BaseInterfaceWithoutProperties"
    | "ConcreteChildInterface"
    | "ConcreteParentInterface";
}

export namespace BaseInterfaceWithoutPropertiesStatic {
  export function $create(
    parameters: {
      readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    } & Parameters<typeof BaseInterfaceWithPropertiesStatic.$create>[0],
  ): BaseInterfaceWithoutProperties {
    let $identifier: BaseInterfaceWithoutPropertiesStatic.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      $identifier = parameters.$identifier satisfies never;
    }

    const $type = "BaseInterfaceWithoutProperties" as const;
    return {
      ...BaseInterfaceWithPropertiesStatic.$create(parameters),
      $identifier,
      $type,
    };
  }

  export function $equals(
    left: BaseInterfaceWithoutProperties,
    right: BaseInterfaceWithoutProperties,
  ): $EqualsResult {
    return BaseInterfaceWithPropertiesStatic.$equals(left, right);
  }

  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/BaseInterfaceWithoutProperties",
  );
  export type $Identifier = BaseInterfaceWithPropertiesStatic.$Identifier;
  export const $Identifier = BaseInterfaceWithPropertiesStatic.$Identifier;
  export type $Json = BaseInterfaceWithPropertiesStatic.$Json;

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type:
        | "BaseInterfaceWithoutProperties"
        | "ConcreteChildInterface"
        | "ConcreteParentInterface";
    } & $UnwrapR<
      ReturnType<typeof BaseInterfaceWithPropertiesStatic.$propertiesFromJson>
    >
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $super0Either =
      BaseInterfaceWithPropertiesStatic.$propertiesFromJson(_jsonObject);
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const $type = "BaseInterfaceWithoutProperties" as const;
    return purify.Either.of({ ...$super0, $identifier, $type });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, BaseInterfaceWithoutProperties> {
    return (
      ConcreteParentInterfaceStatic.$fromJson(json) as purify.Either<
        zod.ZodError,
        BaseInterfaceWithoutProperties
      >
    ).altLazy(() => $propertiesFromJson(json));
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        BaseInterfaceWithPropertiesStatic.$jsonUiSchema({ scopePrefix }),
      ],
      label: "BaseInterfaceWithoutProperties",
      type: "Group",
    };
  }

  export function $toJson(
    _baseInterfaceWithoutProperties: BaseInterfaceWithoutProperties,
  ): BaseInterfaceWithoutPropertiesStatic.$Json {
    return JSON.parse(
      JSON.stringify({
        ...BaseInterfaceWithPropertiesStatic.$toJson(
          _baseInterfaceWithoutProperties,
        ),
      } satisfies BaseInterfaceWithoutPropertiesStatic.$Json),
    );
  }

  export function $jsonZodSchema() {
    return BaseInterfaceWithPropertiesStatic.$jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        $type: zod.enum([
          "BaseInterfaceWithoutProperties",
          "ConcreteChildInterface",
          "ConcreteParentInterface",
        ]),
      }),
    );
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _baseInterfaceWithoutProperties: BaseInterfaceWithoutProperties,
    _hasher: HasherT,
  ): HasherT {
    BaseInterfaceWithoutPropertiesStatic.$hashShaclProperties(
      _baseInterfaceWithoutProperties,
      _hasher,
    );
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _baseInterfaceWithoutProperties: BaseInterfaceWithoutProperties,
    _hasher: HasherT,
  ): HasherT {
    BaseInterfaceWithPropertiesStatic.$hashShaclProperties(
      _baseInterfaceWithoutProperties,
      _hasher,
    );
    return _hasher;
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type:
        | "BaseInterfaceWithoutProperties"
        | "ConcreteChildInterface"
        | "ConcreteParentInterface";
    } & $UnwrapR<
      ReturnType<typeof BaseInterfaceWithPropertiesStatic.$propertiesFromRdf>
    >
  > {
    const $super0Either = BaseInterfaceWithPropertiesStatic.$propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/BaseInterfaceWithoutProperties)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: BaseInterfaceWithoutPropertiesStatic.$Identifier =
      _resource.identifier;
    const $type = "BaseInterfaceWithoutProperties" as const;
    return purify.Either.of({ ...$super0, $identifier, $type });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof BaseInterfaceWithoutPropertiesStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    BaseInterfaceWithoutProperties
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ConcreteParentInterfaceStatic.$fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        BaseInterfaceWithoutProperties
      >
    ).altLazy(() =>
      BaseInterfaceWithoutPropertiesStatic.$propertiesFromRdf(parameters),
    );
  }

  export function $toRdf(
    _baseInterfaceWithoutProperties: BaseInterfaceWithoutProperties,
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
    const _resource = BaseInterfaceWithPropertiesStatic.$toRdf(
      _baseInterfaceWithoutProperties,
      { ignoreRdfType: true, mutateGraph, resourceSet },
    );
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://example.com/BaseInterfaceWithoutProperties",
        ),
      );
    }

    return _resource;
  }

  export const $properties = {
    ...BaseInterfaceWithPropertiesStatic.$properties,
  };

  export function $sparqlConstructQuery(
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
        BaseInterfaceWithoutPropertiesStatic.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        BaseInterfaceWithoutPropertiesStatic.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      BaseInterfaceWithoutPropertiesStatic.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("baseInterfaceWithoutProperties");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "baseInterfaceWithoutProperties");
    triples.push(
      ...BaseInterfaceWithPropertiesStatic.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
    );
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("baseInterfaceWithoutProperties");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "baseInterfaceWithoutProperties");
    for (const pattern of BaseInterfaceWithPropertiesStatic.$sparqlWherePatterns(
      { ignoreRdfType: true, subject, variablePrefix },
    )) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Interface node shape that inherits the base interface and is the parent of the ConcreteChildInterface.
 */
export interface ConcreteParentInterface
  extends BaseInterfaceWithoutProperties {
  readonly $identifier: ConcreteParentInterfaceStatic.$Identifier;
  readonly $type: "ConcreteParentInterface" | "ConcreteChildInterface";
  readonly concreteParentInterfaceProperty: string;
}

export namespace ConcreteParentInterfaceStatic {
  export function $create(
    parameters: {
      readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
      readonly concreteParentInterfaceProperty: string;
    } & Parameters<typeof BaseInterfaceWithoutPropertiesStatic.$create>[0],
  ): ConcreteParentInterface {
    let $identifier: ConcreteParentInterfaceStatic.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      $identifier = parameters.$identifier satisfies never;
    }

    const $type = "ConcreteParentInterface" as const;
    const concreteParentInterfaceProperty =
      parameters.concreteParentInterfaceProperty;
    return {
      ...BaseInterfaceWithoutPropertiesStatic.$create(parameters),
      $identifier,
      $type,
      concreteParentInterfaceProperty,
    };
  }

  export function $equals(
    left: ConcreteParentInterface,
    right: ConcreteParentInterface,
  ): $EqualsResult {
    return BaseInterfaceWithoutPropertiesStatic.$equals(left, right).chain(() =>
      $strictEquals(
        left.concreteParentInterfaceProperty,
        right.concreteParentInterfaceProperty,
      ).mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "concreteParentInterfaceProperty",
        propertyValuesUnequal,
        type: "Property" as const,
      })),
    );
  }

  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteParentInterface",
  );
  export type $Identifier = BaseInterfaceWithoutPropertiesStatic.$Identifier;
  export const $Identifier = BaseInterfaceWithoutPropertiesStatic.$Identifier;
  export type $Json = {
    readonly concreteParentInterfaceProperty: string;
  } & BaseInterfaceWithoutPropertiesStatic.$Json;

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ConcreteParentInterface" | "ConcreteChildInterface";
      concreteParentInterfaceProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof BaseInterfaceWithoutPropertiesStatic.$propertiesFromJson
      >
    >
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $super0Either =
      BaseInterfaceWithoutPropertiesStatic.$propertiesFromJson(_jsonObject);
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const $type = "ConcreteParentInterface" as const;
    const concreteParentInterfaceProperty =
      _jsonObject["concreteParentInterfaceProperty"];
    return purify.Either.of({
      ...$super0,
      $identifier,
      $type,
      concreteParentInterfaceProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ConcreteParentInterface> {
    return (
      ConcreteChildInterface.$fromJson(json) as purify.Either<
        zod.ZodError,
        ConcreteParentInterface
      >
    ).altLazy(() => $propertiesFromJson(json));
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        BaseInterfaceWithoutPropertiesStatic.$jsonUiSchema({ scopePrefix }),
        {
          scope: `${scopePrefix}/properties/concreteParentInterfaceProperty`,
          type: "Control",
        },
      ],
      label: "ConcreteParentInterface",
      type: "Group",
    };
  }

  export function $toJson(
    _concreteParentInterface: ConcreteParentInterface,
  ): ConcreteParentInterfaceStatic.$Json {
    return JSON.parse(
      JSON.stringify({
        ...BaseInterfaceWithoutPropertiesStatic.$toJson(
          _concreteParentInterface,
        ),
        concreteParentInterfaceProperty:
          _concreteParentInterface.concreteParentInterfaceProperty,
      } satisfies ConcreteParentInterfaceStatic.$Json),
    );
  }

  export function $jsonZodSchema() {
    return BaseInterfaceWithoutPropertiesStatic.$jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        $type: zod.enum(["ConcreteParentInterface", "ConcreteChildInterface"]),
        concreteParentInterfaceProperty: zod.string(),
      }),
    );
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _concreteParentInterface: ConcreteParentInterface,
    _hasher: HasherT,
  ): HasherT {
    ConcreteParentInterfaceStatic.$hashShaclProperties(
      _concreteParentInterface,
      _hasher,
    );
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _concreteParentInterface: ConcreteParentInterface,
    _hasher: HasherT,
  ): HasherT {
    BaseInterfaceWithoutPropertiesStatic.$hashShaclProperties(
      _concreteParentInterface,
      _hasher,
    );
    _hasher.update(_concreteParentInterface.concreteParentInterfaceProperty);
    return _hasher;
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ConcreteParentInterface" | "ConcreteChildInterface";
      concreteParentInterfaceProperty: string;
    } & $UnwrapR<
      ReturnType<typeof BaseInterfaceWithoutPropertiesStatic.$propertiesFromRdf>
    >
  > {
    const $super0Either =
      BaseInterfaceWithoutPropertiesStatic.$propertiesFromRdf({
        ..._context,
        ignoreRdfType: true,
        languageIn: _languageIn,
        resource: _resource,
      });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ConcreteParentInterface)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: ConcreteParentInterfaceStatic.$Identifier =
      _resource.identifier;
    const $type = "ConcreteParentInterface" as const;
    const _concreteParentInterfacePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.concreteParentInterfaceProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_concreteParentInterfacePropertyEither.isLeft()) {
      return _concreteParentInterfacePropertyEither;
    }

    const concreteParentInterfaceProperty =
      _concreteParentInterfacePropertyEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      $type,
      concreteParentInterfaceProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof ConcreteParentInterfaceStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ConcreteParentInterface> {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ConcreteChildInterface.$fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ConcreteParentInterface
      >
    ).altLazy(() =>
      ConcreteParentInterfaceStatic.$propertiesFromRdf(parameters),
    );
  }

  export function $toRdf(
    _concreteParentInterface: ConcreteParentInterface,
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
    const _resource = BaseInterfaceWithoutPropertiesStatic.$toRdf(
      _concreteParentInterface,
      { ignoreRdfType: true, mutateGraph, resourceSet },
    );
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://example.com/ConcreteParentInterface",
        ),
      );
    }

    _resource.add(
      ConcreteParentInterfaceStatic.$properties.concreteParentInterfaceProperty[
        "identifier"
      ],
      _concreteParentInterface.concreteParentInterfaceProperty,
    );
    return _resource;
  }

  export const $properties = {
    ...BaseInterfaceWithoutPropertiesStatic.$properties,
    concreteParentInterfaceProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/concreteParentInterfaceProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ConcreteParentInterfaceStatic.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ConcreteParentInterfaceStatic.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ConcreteParentInterfaceStatic.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("concreteParentInterface");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteParentInterface");
    triples.push(
      ...BaseInterfaceWithoutPropertiesStatic.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
    );
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ConcreteParentInterfaceProperty`,
      ),
      predicate:
        ConcreteParentInterfaceStatic.$properties
          .concreteParentInterfaceProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("concreteParentInterface");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteParentInterface");
    for (const pattern of BaseInterfaceWithoutPropertiesStatic.$sparqlWherePatterns(
      { ignoreRdfType: true, subject, variablePrefix },
    )) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ConcreteParentInterfaceProperty`,
            ),
            predicate:
              ConcreteParentInterfaceStatic.$properties
                .concreteParentInterfaceProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Child interface of ConcreteParentInterface. Should inherit properties and node kinds.
 */
export interface ConcreteChildInterface extends ConcreteParentInterface {
  readonly $identifier: ConcreteChildInterface.$Identifier;
  readonly $type: "ConcreteChildInterface";
  readonly concreteChildInterfaceProperty: string;
}

export namespace ConcreteChildInterface {
  export function $create(
    parameters: {
      readonly $identifier: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
      readonly concreteChildInterfaceProperty: string;
    } & Parameters<typeof ConcreteParentInterfaceStatic.$create>[0],
  ): ConcreteChildInterface {
    let $identifier: ConcreteChildInterface.$Identifier;
    if (typeof parameters.$identifier === "object") {
      $identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      $identifier = dataFactory.namedNode(parameters.$identifier);
    } else {
      $identifier = parameters.$identifier satisfies never;
    }

    const $type = "ConcreteChildInterface" as const;
    const concreteChildInterfaceProperty =
      parameters.concreteChildInterfaceProperty;
    return {
      ...ConcreteParentInterfaceStatic.$create(parameters),
      $identifier,
      $type,
      concreteChildInterfaceProperty,
    };
  }

  export function $equals(
    left: ConcreteChildInterface,
    right: ConcreteChildInterface,
  ): $EqualsResult {
    return ConcreteParentInterfaceStatic.$equals(left, right).chain(() =>
      $strictEquals(
        left.concreteChildInterfaceProperty,
        right.concreteChildInterfaceProperty,
      ).mapLeft((propertyValuesUnequal) => ({
        left: left,
        right: right,
        propertyName: "concreteChildInterfaceProperty",
        propertyValuesUnequal,
        type: "Property" as const,
      })),
    );
  }

  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteChildInterface",
  );
  export type $Identifier = ConcreteParentInterfaceStatic.$Identifier;
  export const $Identifier = ConcreteParentInterfaceStatic.$Identifier;
  export type $Json = {
    readonly concreteChildInterfaceProperty: string;
  } & ConcreteParentInterfaceStatic.$Json;

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ConcreteChildInterface";
      concreteChildInterfaceProperty: string;
    } & $UnwrapR<
      ReturnType<typeof ConcreteParentInterfaceStatic.$propertiesFromJson>
    >
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $super0Either =
      ConcreteParentInterfaceStatic.$propertiesFromJson(_jsonObject);
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const $type = "ConcreteChildInterface" as const;
    const concreteChildInterfaceProperty =
      _jsonObject["concreteChildInterfaceProperty"];
    return purify.Either.of({
      ...$super0,
      $identifier,
      $type,
      concreteChildInterfaceProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ConcreteChildInterface> {
    return $propertiesFromJson(json);
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        ConcreteParentInterfaceStatic.$jsonUiSchema({ scopePrefix }),
        {
          scope: `${scopePrefix}/properties/concreteChildInterfaceProperty`,
          type: "Control",
        },
      ],
      label: "ConcreteChildInterface",
      type: "Group",
    };
  }

  export function $toJson(
    _concreteChildInterface: ConcreteChildInterface,
  ): ConcreteChildInterface.$Json {
    return JSON.parse(
      JSON.stringify({
        ...ConcreteParentInterfaceStatic.$toJson(_concreteChildInterface),
        concreteChildInterfaceProperty:
          _concreteChildInterface.concreteChildInterfaceProperty,
      } satisfies ConcreteChildInterface.$Json),
    );
  }

  export function $jsonZodSchema() {
    return ConcreteParentInterfaceStatic.$jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        $type: zod.literal("ConcreteChildInterface"),
        concreteChildInterfaceProperty: zod.string(),
      }),
    );
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _concreteChildInterface: ConcreteChildInterface,
    _hasher: HasherT,
  ): HasherT {
    ConcreteChildInterface.$hashShaclProperties(
      _concreteChildInterface,
      _hasher,
    );
    return _hasher;
  }

  export function $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(
    _concreteChildInterface: ConcreteChildInterface,
    _hasher: HasherT,
  ): HasherT {
    ConcreteParentInterfaceStatic.$hashShaclProperties(
      _concreteChildInterface,
      _hasher,
    );
    _hasher.update(_concreteChildInterface.concreteChildInterfaceProperty);
    return _hasher;
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ConcreteChildInterface";
      concreteChildInterfaceProperty: string;
    } & $UnwrapR<
      ReturnType<typeof ConcreteParentInterfaceStatic.$propertiesFromRdf>
    >
  > {
    const $super0Either = ConcreteParentInterfaceStatic.$propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ConcreteChildInterface)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: ConcreteChildInterface.$Identifier =
      _resource.identifier;
    const $type = "ConcreteChildInterface" as const;
    const _concreteChildInterfacePropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.concreteChildInterfaceProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_concreteChildInterfacePropertyEither.isLeft()) {
      return _concreteChildInterfacePropertyEither;
    }

    const concreteChildInterfaceProperty =
      _concreteChildInterfacePropertyEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      $type,
      concreteChildInterfaceProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ConcreteChildInterface.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ConcreteChildInterface> {
    return ConcreteChildInterface.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _concreteChildInterface: ConcreteChildInterface,
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
    const _resource = ConcreteParentInterfaceStatic.$toRdf(
      _concreteChildInterface,
      { ignoreRdfType: true, mutateGraph, resourceSet },
    );
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://example.com/ConcreteChildInterface",
        ),
      );
    }

    _resource.add(
      ConcreteChildInterface.$properties.concreteChildInterfaceProperty[
        "identifier"
      ],
      _concreteChildInterface.concreteChildInterfaceProperty,
    );
    return _resource;
  }

  export const $properties = {
    ...ConcreteParentInterfaceStatic.$properties,
    concreteChildInterfaceProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/concreteChildInterfaceProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ConcreteChildInterface.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ConcreteChildInterface.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ConcreteChildInterface.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("concreteChildInterface");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteChildInterface");
    triples.push(
      ...ConcreteParentInterfaceStatic.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
    );
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ConcreteChildInterfaceProperty`,
      ),
      predicate:
        ConcreteChildInterface.$properties.concreteChildInterfaceProperty[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("concreteChildInterface");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "concreteChildInterface");
    for (const pattern of ConcreteParentInterfaceStatic.$sparqlWherePatterns({
      ignoreRdfType: true,
      subject,
      variablePrefix,
    })) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ConcreteChildInterfaceProperty`,
            ),
            predicate:
              ConcreteChildInterface.$properties.concreteChildInterfaceProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Node shape that serves as an abstract base class for child node shapes.
 *
 * It's marked abstract in TypeScript and not exported from the module.
 *
 * Common pattern: put the minting strategy and nodeKind on an ABC.
 */
export abstract class AbstractBaseClassWithProperties {
  abstract readonly $identifier: AbstractBaseClassWithPropertiesStatic.$Identifier;
  protected readonly _$identifierPrefix?: string;
  abstract readonly $type: "ConcreteChildClass" | "ConcreteParentClass";
  readonly abstractBaseClassWithPropertiesProperty: string;

  constructor(parameters: {
    readonly $identifierPrefix?: string;
    readonly abstractBaseClassWithPropertiesProperty: string;
  }) {
    this._$identifierPrefix = parameters.$identifierPrefix;
    this.abstractBaseClassWithPropertiesProperty =
      parameters.abstractBaseClassWithPropertiesProperty;
  }

  protected get $identifierPrefix(): string {
    return typeof this._$identifierPrefix !== "undefined"
      ? this._$identifierPrefix
      : `urn:shaclmate:${this.$type}:`;
  }

  $equals(other: AbstractBaseClassWithProperties): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$identifierPrefix, other.$identifierPrefix).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$identifierPrefix",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.abstractBaseClassWithPropertiesProperty,
          other.abstractBaseClassWithPropertiesProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "abstractBaseClassWithPropertiesProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.abstractBaseClassWithPropertiesProperty);
    return _hasher;
  }

  $toJson(): AbstractBaseClassWithPropertiesStatic.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        abstractBaseClassWithPropertiesProperty:
          this.abstractBaseClassWithPropertiesProperty,
      } satisfies AbstractBaseClassWithPropertiesStatic.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      AbstractBaseClassWithPropertiesStatic.$properties
        .abstractBaseClassWithPropertiesProperty["identifier"],
      this.abstractBaseClassWithPropertiesProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace AbstractBaseClassWithPropertiesStatic {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ConcreteChildClass" | "ConcreteParentClass";
    readonly abstractBaseClassWithPropertiesProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      abstractBaseClassWithPropertiesProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const abstractBaseClassWithPropertiesProperty =
      _jsonObject["abstractBaseClassWithPropertiesProperty"];
    return purify.Either.of({
      $identifier,
      abstractBaseClassWithPropertiesProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, AbstractBaseClassWithProperties> {
    return AbstractBaseClassWithoutPropertiesStatic.$fromJson(
      json,
    ) as purify.Either<zod.ZodError, AbstractBaseClassWithProperties>;
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "AbstractBaseClassWithProperties" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/abstractBaseClassWithPropertiesProperty`,
          type: "Control",
        },
      ],
      label: "AbstractBaseClassWithProperties",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.enum(["ConcreteChildClass", "ConcreteParentClass"]),
      abstractBaseClassWithPropertiesProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      abstractBaseClassWithPropertiesProperty: string;
    }
  > {
    const $identifier: AbstractBaseClassWithPropertiesStatic.$Identifier =
      _resource.identifier;
    const _abstractBaseClassWithPropertiesPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(
        $properties.abstractBaseClassWithPropertiesProperty["identifier"],
        { unique: true },
      )
      .head()
      .chain((_value) => _value.toString());
    if (_abstractBaseClassWithPropertiesPropertyEither.isLeft()) {
      return _abstractBaseClassWithPropertiesPropertyEither;
    }

    const abstractBaseClassWithPropertiesProperty =
      _abstractBaseClassWithPropertiesPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      abstractBaseClassWithPropertiesProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof AbstractBaseClassWithPropertiesStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    AbstractBaseClassWithProperties
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return AbstractBaseClassWithoutPropertiesStatic.$fromRdf(
      otherParameters,
    ) as purify.Either<
      rdfjsResource.Resource.ValueError,
      AbstractBaseClassWithProperties
    >;
  }

  export const $properties = {
    abstractBaseClassWithPropertiesProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/abstractBaseClassWithPropertiesProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        AbstractBaseClassWithPropertiesStatic.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        AbstractBaseClassWithPropertiesStatic.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      AbstractBaseClassWithPropertiesStatic.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassWithProperties");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassWithProperties");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}AbstractBaseClassWithPropertiesProperty`,
      ),
      predicate:
        AbstractBaseClassWithPropertiesStatic.$properties
          .abstractBaseClassWithPropertiesProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassWithProperties");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassWithProperties");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}AbstractBaseClassWithPropertiesProperty`,
            ),
            predicate:
              AbstractBaseClassWithPropertiesStatic.$properties
                .abstractBaseClassWithPropertiesProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Abstract base for other node shapes. Put the ABC with properties above the ABC without.
 */
export abstract class AbstractBaseClassWithoutProperties extends AbstractBaseClassWithProperties {
  abstract override readonly $identifier: AbstractBaseClassWithoutPropertiesStatic.$Identifier;
  abstract override readonly $type:
    | "ConcreteChildClass"
    | "ConcreteParentClass";

  // biome-ignore lint/complexity/noUselessConstructor: Always have a constructor
  constructor(
    parameters: { readonly $identifierPrefix?: string } & ConstructorParameters<
      typeof AbstractBaseClassWithProperties
    >[0],
  ) {
    super(parameters);
  }

  protected override get $identifierPrefix(): string {
    return typeof this._$identifierPrefix !== "undefined"
      ? this._$identifierPrefix
      : `urn:shaclmate:${this.$type}:`;
  }

  override $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = super.$toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace AbstractBaseClassWithoutPropertiesStatic {
  export type $Identifier = AbstractBaseClassWithPropertiesStatic.$Identifier;
  export const $Identifier = AbstractBaseClassWithPropertiesStatic.$Identifier;
  export type $Json = AbstractBaseClassWithPropertiesStatic.$Json;

  export function $propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { $identifier: rdfjs.BlankNode | rdfjs.NamedNode } & $UnwrapR<
      ReturnType<
        typeof AbstractBaseClassWithPropertiesStatic.$propertiesFromJson
      >
    >
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $super0Either =
      AbstractBaseClassWithPropertiesStatic.$propertiesFromJson(_jsonObject);
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    return purify.Either.of({ ...$super0, $identifier });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, AbstractBaseClassWithoutProperties> {
    return ConcreteParentClassStatic.$fromJson(json) as purify.Either<
      zod.ZodError,
      AbstractBaseClassWithoutProperties
    >;
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        AbstractBaseClassWithPropertiesStatic.$jsonUiSchema({ scopePrefix }),
      ],
      label: "AbstractBaseClassWithoutProperties",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return AbstractBaseClassWithPropertiesStatic.$jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        $type: zod.enum(["ConcreteChildClass", "ConcreteParentClass"]),
      }),
    );
  }

  export function $propertiesFromRdf({
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
    { $identifier: rdfjs.BlankNode | rdfjs.NamedNode } & $UnwrapR<
      ReturnType<
        typeof AbstractBaseClassWithPropertiesStatic.$propertiesFromRdf
      >
    >
  > {
    const $super0Either =
      AbstractBaseClassWithPropertiesStatic.$propertiesFromRdf({
        ..._context,
        ignoreRdfType: true,
        languageIn: _languageIn,
        resource: _resource,
      });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    const $identifier: AbstractBaseClassWithoutPropertiesStatic.$Identifier =
      _resource.identifier;
    return purify.Either.of({ ...$super0, $identifier });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof AbstractBaseClassWithoutPropertiesStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    AbstractBaseClassWithoutProperties
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return ConcreteParentClassStatic.$fromRdf(otherParameters) as purify.Either<
      rdfjsResource.Resource.ValueError,
      AbstractBaseClassWithoutProperties
    >;
  }

  export const $properties = {
    ...AbstractBaseClassWithPropertiesStatic.$properties,
  };

  export function $sparqlConstructQuery(
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
        AbstractBaseClassWithoutPropertiesStatic.$sparqlConstructTemplateTriples(
          { ignoreRdfType, subject },
        ),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        AbstractBaseClassWithoutPropertiesStatic.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      AbstractBaseClassWithoutPropertiesStatic.$sparqlConstructQuery(
        parameters,
      ),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassWithoutProperties");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassWithoutProperties");
    triples.push(
      ...AbstractBaseClassWithPropertiesStatic.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
    );
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassWithoutProperties");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassWithoutProperties");
    for (const pattern of AbstractBaseClassWithPropertiesStatic.$sparqlWherePatterns(
      { ignoreRdfType: true, subject, variablePrefix },
    )) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Class node shape that inherits the abstract base class and is the parent of the ConcreteChildClass.
 */
export class ConcreteParentClass extends AbstractBaseClassWithoutProperties {
  protected _$identifier: ConcreteParentClassStatic.$Identifier | undefined;
  override readonly $type: "ConcreteParentClass" | "ConcreteChildClass" =
    "ConcreteParentClass";
  readonly concreteParentClassProperty: string;

  constructor(
    parameters: {
      readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
      readonly $identifierPrefix?: string;
      readonly concreteParentClassProperty: string;
    } & ConstructorParameters<typeof AbstractBaseClassWithoutProperties>[0],
  ) {
    super(parameters);
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.concreteParentClassProperty = parameters.concreteParentClassProperty;
  }

  override get $identifier(): ConcreteParentClassStatic.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.namedNode(
        `${this.$identifierPrefix}${this.$hashShaclProperties(sha256.create())}`,
      );
    }
    return this._$identifier;
  }

  protected override get $identifierPrefix(): string {
    return typeof this._$identifierPrefix !== "undefined"
      ? this._$identifierPrefix
      : `urn:shaclmate:${this.$type}:`;
  }

  override $equals(other: ConcreteParentClass): $EqualsResult {
    return super.$equals(other).chain(() =>
      $strictEquals(
        this.concreteParentClassProperty,
        other.concreteParentClassProperty,
      ).mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "concreteParentClassProperty",
        propertyValuesUnequal,
        type: "Property" as const,
      })),
    );
  }

  override $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected override $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    super.$hashShaclProperties(_hasher);
    _hasher.update(this.concreteParentClassProperty);
    return _hasher;
  }

  override $toJson(): ConcreteParentClassStatic.$Json {
    return JSON.parse(
      JSON.stringify({
        ...super.$toJson(),
        concreteParentClassProperty: this.concreteParentClassProperty,
      } satisfies ConcreteParentClassStatic.$Json),
    );
  }

  override $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = super.$toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://example.com/ConcreteParentClass",
        ),
      );
    }

    _resource.add(
      ConcreteParentClassStatic.$properties.concreteParentClassProperty[
        "identifier"
      ],
      this.concreteParentClassProperty,
    );
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ConcreteParentClassStatic {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteParentClass",
  );
  export type $Identifier =
    AbstractBaseClassWithoutPropertiesStatic.$Identifier;
  export const $Identifier =
    AbstractBaseClassWithoutPropertiesStatic.$Identifier;
  export type $Json = {
    readonly concreteParentClassProperty: string;
  } & AbstractBaseClassWithoutPropertiesStatic.$Json;

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      concreteParentClassProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof AbstractBaseClassWithoutPropertiesStatic.$propertiesFromJson
      >
    >
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $super0Either =
      AbstractBaseClassWithoutPropertiesStatic.$propertiesFromJson(_jsonObject);
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const concreteParentClassProperty =
      _jsonObject["concreteParentClassProperty"];
    return purify.Either.of({
      ...$super0,
      $identifier,
      concreteParentClassProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ConcreteParentClass> {
    return (
      ConcreteChildClass.$fromJson(json) as purify.Either<
        zod.ZodError,
        ConcreteParentClass
      >
    ).altLazy(() =>
      $propertiesFromJson(json).map(
        (properties) => new ConcreteParentClass(properties),
      ),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        AbstractBaseClassWithoutPropertiesStatic.$jsonUiSchema({ scopePrefix }),
        {
          scope: `${scopePrefix}/properties/concreteParentClassProperty`,
          type: "Control",
        },
      ],
      label: "ConcreteParentClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return AbstractBaseClassWithoutPropertiesStatic.$jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        $type: zod.enum(["ConcreteParentClass", "ConcreteChildClass"]),
        concreteParentClassProperty: zod.string(),
      }),
    );
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      concreteParentClassProperty: string;
    } & $UnwrapR<
      ReturnType<
        typeof AbstractBaseClassWithoutPropertiesStatic.$propertiesFromRdf
      >
    >
  > {
    const $super0Either =
      AbstractBaseClassWithoutPropertiesStatic.$propertiesFromRdf({
        ..._context,
        ignoreRdfType: true,
        languageIn: _languageIn,
        resource: _resource,
      });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ConcreteParentClass)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: ConcreteParentClassStatic.$Identifier =
      _resource.identifier;
    const _concreteParentClassPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.concreteParentClassProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_concreteParentClassPropertyEither.isLeft()) {
      return _concreteParentClassPropertyEither;
    }

    const concreteParentClassProperty =
      _concreteParentClassPropertyEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      concreteParentClassProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof ConcreteParentClassStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ConcreteParentClass> {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ConcreteChildClass.$fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ConcreteParentClass
      >
    ).altLazy(() =>
      ConcreteParentClassStatic.$propertiesFromRdf(parameters).map(
        (properties) => new ConcreteParentClass(properties),
      ),
    );
  }

  export const $properties = {
    ...AbstractBaseClassWithoutPropertiesStatic.$properties,
    concreteParentClassProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/concreteParentClassProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ConcreteParentClassStatic.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ConcreteParentClassStatic.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ConcreteParentClassStatic.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("concreteParentClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "concreteParentClass");
    triples.push(
      ...AbstractBaseClassWithoutPropertiesStatic.$sparqlConstructTemplateTriples(
        { ignoreRdfType: true, subject, variablePrefix },
      ),
    );
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ConcreteParentClassProperty`,
      ),
      predicate:
        ConcreteParentClassStatic.$properties.concreteParentClassProperty[
          "identifier"
        ],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("concreteParentClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "concreteParentClass");
    for (const pattern of AbstractBaseClassWithoutPropertiesStatic.$sparqlWherePatterns(
      { ignoreRdfType: true, subject, variablePrefix },
    )) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ConcreteParentClassProperty`,
            ),
            predicate:
              ConcreteParentClassStatic.$properties.concreteParentClassProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Child (class) of ConcreteParentClass. Should inherit properties, node kinds, and minting strategy.
 */
export class ConcreteChildClass extends ConcreteParentClass {
  override readonly $type = "ConcreteChildClass";
  readonly concreteChildClassProperty: string;

  constructor(
    parameters: {
      readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
      readonly $identifierPrefix?: string;
      readonly concreteChildClassProperty: string;
    } & ConstructorParameters<typeof ConcreteParentClass>[0],
  ) {
    super(parameters);
    this.concreteChildClassProperty = parameters.concreteChildClassProperty;
  }

  override get $identifier(): ConcreteChildClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.namedNode(
        `${this.$identifierPrefix}${this.$hashShaclProperties(sha256.create())}`,
      );
    }
    return this._$identifier;
  }

  protected override get $identifierPrefix(): string {
    return typeof this._$identifierPrefix !== "undefined"
      ? this._$identifierPrefix
      : `urn:shaclmate:${this.$type}:`;
  }

  override $equals(other: ConcreteChildClass): $EqualsResult {
    return super.$equals(other).chain(() =>
      $strictEquals(
        this.concreteChildClassProperty,
        other.concreteChildClassProperty,
      ).mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "concreteChildClassProperty",
        propertyValuesUnequal,
        type: "Property" as const,
      })),
    );
  }

  override $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected override $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    super.$hashShaclProperties(_hasher);
    _hasher.update(this.concreteChildClassProperty);
    return _hasher;
  }

  override $toJson(): ConcreteChildClass.$Json {
    return JSON.parse(
      JSON.stringify({
        ...super.$toJson(),
        concreteChildClassProperty: this.concreteChildClassProperty,
      } satisfies ConcreteChildClass.$Json),
    );
  }

  override $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = super.$toRdf({
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://example.com/ConcreteChildClass",
        ),
      );
    }

    _resource.add(
      ConcreteChildClass.$properties.concreteChildClassProperty["identifier"],
      this.concreteChildClassProperty,
    );
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ConcreteChildClass {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ConcreteChildClass",
  );
  export type $Identifier = ConcreteParentClassStatic.$Identifier;
  export const $Identifier = ConcreteParentClassStatic.$Identifier;
  export type $Json = {
    readonly concreteChildClassProperty: string;
  } & ConcreteParentClassStatic.$Json;

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      concreteChildClassProperty: string;
    } & $UnwrapR<
      ReturnType<typeof ConcreteParentClassStatic.$propertiesFromJson>
    >
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $super0Either =
      ConcreteParentClassStatic.$propertiesFromJson(_jsonObject);
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const concreteChildClassProperty =
      _jsonObject["concreteChildClassProperty"];
    return purify.Either.of({
      ...$super0,
      $identifier,
      concreteChildClassProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ConcreteChildClass> {
    return $propertiesFromJson(json).map(
      (properties) => new ConcreteChildClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
    const scopePrefix = parameters?.scopePrefix ?? "#";
    return {
      elements: [
        ConcreteParentClassStatic.$jsonUiSchema({ scopePrefix }),
        {
          scope: `${scopePrefix}/properties/concreteChildClassProperty`,
          type: "Control",
        },
      ],
      label: "ConcreteChildClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return ConcreteParentClassStatic.$jsonZodSchema().merge(
      zod.object({
        "@id": zod.string().min(1),
        $type: zod.literal("ConcreteChildClass"),
        concreteChildClassProperty: zod.string(),
      }),
    );
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      concreteChildClassProperty: string;
    } & $UnwrapR<
      ReturnType<typeof ConcreteParentClassStatic.$propertiesFromRdf>
    >
  > {
    const $super0Either = ConcreteParentClassStatic.$propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ConcreteChildClass)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: ConcreteChildClass.$Identifier = _resource.identifier;
    const _concreteChildClassPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.concreteChildClassProperty["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_concreteChildClassPropertyEither.isLeft()) {
      return _concreteChildClassPropertyEither;
    }

    const concreteChildClassProperty =
      _concreteChildClassPropertyEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      concreteChildClassProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ConcreteChildClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ConcreteChildClass> {
    return ConcreteChildClass.$propertiesFromRdf(parameters).map(
      (properties) => new ConcreteChildClass(properties),
    );
  }

  export const $properties = {
    ...ConcreteParentClassStatic.$properties,
    concreteChildClassProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/concreteChildClassProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ConcreteChildClass.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ConcreteChildClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ConcreteChildClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("concreteChildClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "concreteChildClass");
    triples.push(
      ...ConcreteParentClassStatic.$sparqlConstructTemplateTriples({
        ignoreRdfType: true,
        subject,
        variablePrefix,
      }),
    );
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ConcreteChildClassProperty`,
      ),
      predicate:
        ConcreteChildClass.$properties.concreteChildClassProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("concreteChildClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "concreteChildClass");
    for (const pattern of ConcreteParentClassStatic.$sparqlWherePatterns({
      ignoreRdfType: true,
      subject,
      variablePrefix,
    })) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ConcreteChildClassProperty`,
            ),
            predicate:
              ConcreteChildClass.$properties.concreteChildClassProperty[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
export class ClassUnionMember2 {
  private _$identifier: ClassUnionMember2.$Identifier | undefined;
  readonly $type = "ClassUnionMember2";
  readonly classUnionMember2Property: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly classUnionMember2Property: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.classUnionMember2Property = parameters.classUnionMember2Property;
  }

  get $identifier(): ClassUnionMember2.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: ClassUnionMember2): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.classUnionMember2Property,
          other.classUnionMember2Property,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "classUnionMember2Property",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.classUnionMember2Property);
    return _hasher;
  }

  $toJson(): ClassUnionMember2.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        classUnionMember2Property: this.classUnionMember2Property,
      } satisfies ClassUnionMember2.$Json),
    );
  }

  $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/ClassUnionMember2"),
      );
    }

    _resource.add(
      ClassUnionMember2.$properties.classUnionMember2Property["identifier"],
      this.classUnionMember2Property,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ClassUnionMember2 {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ClassUnionMember2",
  );
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ClassUnionMember2";
    readonly classUnionMember2Property: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      classUnionMember2Property: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const classUnionMember2Property = _jsonObject["classUnionMember2Property"];
    return purify.Either.of({ $identifier, classUnionMember2Property });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ClassUnionMember2> {
    return $propertiesFromJson(json).map(
      (properties) => new ClassUnionMember2(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ClassUnionMember2" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/classUnionMember2Property`,
          type: "Control",
        },
      ],
      label: "ClassUnionMember2",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ClassUnionMember2"),
      classUnionMember2Property: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      classUnionMember2Property: string;
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ClassUnionMember2)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: ClassUnionMember2.$Identifier = _resource.identifier;
    const _classUnionMember2PropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.classUnionMember2Property["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_classUnionMember2PropertyEither.isLeft()) {
      return _classUnionMember2PropertyEither;
    }

    const classUnionMember2Property =
      _classUnionMember2PropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, classUnionMember2Property });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ClassUnionMember2.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ClassUnionMember2> {
    return ClassUnionMember2.$propertiesFromRdf(parameters).map(
      (properties) => new ClassUnionMember2(properties),
    );
  }

  export const $properties = {
    classUnionMember2Property: {
      identifier: dataFactory.namedNode(
        "http://example.com/classUnionMember2Property",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ClassUnionMember2.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ClassUnionMember2.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ClassUnionMember2.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("classUnionMember2");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "classUnionMember2");
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ClassUnionMember2Property`,
      ),
      predicate:
        ClassUnionMember2.$properties.classUnionMember2Property["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("classUnionMember2");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "classUnionMember2");
    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ClassUnionMember2Property`,
            ),
            predicate:
              ClassUnionMember2.$properties.classUnionMember2Property[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
export class ClassUnionMember1 {
  private _$identifier: ClassUnionMember1.$Identifier | undefined;
  readonly $type = "ClassUnionMember1";
  readonly classUnionMember1Property: string;

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
    readonly classUnionMember1Property: string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }

    this.classUnionMember1Property = parameters.classUnionMember1Property;
  }

  get $identifier(): ClassUnionMember1.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: ClassUnionMember1): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.classUnionMember1Property,
          other.classUnionMember1Property,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "classUnionMember1Property",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.classUnionMember1Property);
    return _hasher;
  }

  $toJson(): ClassUnionMember1.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        classUnionMember1Property: this.classUnionMember1Property,
      } satisfies ClassUnionMember1.$Json),
    );
  }

  $toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://example.com/ClassUnionMember1"),
      );
    }

    _resource.add(
      ClassUnionMember1.$properties.classUnionMember1Property["identifier"],
      this.classUnionMember1Property,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace ClassUnionMember1 {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://example.com/ClassUnionMember1",
  );
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ClassUnionMember1";
    readonly classUnionMember1Property: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      classUnionMember1Property: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const classUnionMember1Property = _jsonObject["classUnionMember1Property"];
    return purify.Either.of({ $identifier, classUnionMember1Property });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ClassUnionMember1> {
    return $propertiesFromJson(json).map(
      (properties) => new ClassUnionMember1(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "ClassUnionMember1" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/classUnionMember1Property`,
          type: "Control",
        },
      ],
      label: "ClassUnionMember1",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ClassUnionMember1"),
      classUnionMember1Property: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      classUnionMember1Property: string;
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://example.com/ClassUnionMember1)`,
              predicate: $RdfVocabularies.rdf.type,
            }),
          ),
        );
    }

    const $identifier: ClassUnionMember1.$Identifier = _resource.identifier;
    const _classUnionMember1PropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values($properties.classUnionMember1Property["identifier"], {
        unique: true,
      })
      .head()
      .chain((_value) => _value.toString());
    if (_classUnionMember1PropertyEither.isLeft()) {
      return _classUnionMember1PropertyEither;
    }

    const classUnionMember1Property =
      _classUnionMember1PropertyEither.unsafeCoerce();
    return purify.Either.of({ $identifier, classUnionMember1Property });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ClassUnionMember1.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ClassUnionMember1> {
    return ClassUnionMember1.$propertiesFromRdf(parameters).map(
      (properties) => new ClassUnionMember1(properties),
    );
  }

  export const $properties = {
    classUnionMember1Property: {
      identifier: dataFactory.namedNode(
        "http://example.com/classUnionMember1Property",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        ClassUnionMember1.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ClassUnionMember1.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ClassUnionMember1.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ?? dataFactory.variable!("classUnionMember1");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "classUnionMember1");
    if (!parameters?.ignoreRdfType) {
      triples.push(
        {
          subject,
          predicate: $RdfVocabularies.rdf.type,
          object: dataFactory.variable!(`${variablePrefix}RdfType`),
        },
        {
          subject: dataFactory.variable!(`${variablePrefix}RdfType`),
          predicate: $RdfVocabularies.rdfs.subClassOf,
          object: dataFactory.variable!(`${variablePrefix}RdfClass`),
        },
      );
    }

    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}ClassUnionMember1Property`,
      ),
      predicate:
        ClassUnionMember1.$properties.classUnionMember1Property["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ?? dataFactory.variable!("classUnionMember1");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable" ? subject.value : "classUnionMember1");
    if (!parameters?.ignoreRdfType) {
      requiredPatterns.push(
        $sparqlInstancesOfPattern({ rdfType: $fromRdfType, subject }),
      );
      requiredPatterns.push({
        triples: [
          {
            subject,
            predicate: $RdfVocabularies.rdf.type,
            object: dataFactory.variable!(`${variablePrefix}RdfType`),
          },
        ],
        type: "bgp" as const,
      });
      optionalPatterns.push({
        patterns: [
          {
            triples: [
              {
                subject: dataFactory.variable!(`${variablePrefix}RdfType`),
                predicate: {
                  items: [$RdfVocabularies.rdfs.subClassOf],
                  pathType: "+" as const,
                  type: "path" as const,
                },
                object: dataFactory.variable!(`${variablePrefix}RdfClass`),
              },
            ],
            type: "bgp" as const,
          },
        ],
        type: "optional" as const,
      });
    }

    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}ClassUnionMember1Property`,
            ),
            predicate:
              ClassUnionMember1.$properties.classUnionMember1Property[
                "identifier"
              ],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Shape that can have a blank node or IRI as an identifier
 */
export class BlankClass {
  private _$identifier: BlankClass.$Identifier | undefined;
  readonly $type = "BlankClass";

  constructor(parameters: {
    readonly $identifier?: (rdfjs.BlankNode | rdfjs.NamedNode) | string;
  }) {
    if (typeof parameters.$identifier === "object") {
      this._$identifier = parameters.$identifier;
    } else if (typeof parameters.$identifier === "string") {
      this._$identifier = dataFactory.namedNode(parameters.$identifier);
    } else if (typeof parameters.$identifier === "undefined") {
    } else {
      this._$identifier = parameters.$identifier satisfies never;
    }
  }

  get $identifier(): BlankClass.$Identifier {
    if (typeof this._$identifier === "undefined") {
      this._$identifier = dataFactory.blankNode();
    }
    return this._$identifier;
  }

  $equals(other: BlankClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    return _hasher;
  }

  $toJson(): BlankClass.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
      } satisfies BlankClass.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace BlankClass {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = { readonly "@id": string; readonly $type: "BlankClass" };

  export function $propertiesFromJson(
    _json: unknown,
  ): purify.Either<
    zod.ZodError,
    { $identifier: rdfjs.BlankNode | rdfjs.NamedNode }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    return purify.Either.of({ $identifier });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, BlankClass> {
    return $propertiesFromJson(json).map(
      (properties) => new BlankClass(properties),
    );
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "BlankClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
      ],
      label: "BlankClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("BlankClass"),
    });
  }

  export function $propertiesFromRdf({
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
    { $identifier: rdfjs.BlankNode | rdfjs.NamedNode }
  > {
    const $identifier: BlankClass.$Identifier = _resource.identifier;
    return purify.Either.of({ $identifier });
  }

  export function $fromRdf(
    parameters: Parameters<typeof BlankClass.$propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, BlankClass> {
    return BlankClass.$propertiesFromRdf(parameters).map(
      (properties) => new BlankClass(properties),
    );
  }

  export const $properties = {};

  export function $sparqlConstructQuery(
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
        BlankClass.$sparqlConstructTemplateTriples({ ignoreRdfType, subject }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        BlankClass.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      BlankClass.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(_parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [];
  }

  export function $sparqlWherePatterns(_parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [];
  }
}
/**
 * An abstract base class that will be inherited by the extern object type, showing how to mix generated and hand-written code.
 */
export abstract class AbstractBaseClassForExternClass {
  abstract readonly $identifier: AbstractBaseClassForExternClassStatic.$Identifier;
  abstract readonly $type: "ExternClass";
  readonly abstractBaseClassForExternClassProperty: string;

  constructor(parameters: {
    readonly abstractBaseClassForExternClassProperty: string;
  }) {
    this.abstractBaseClassForExternClassProperty =
      parameters.abstractBaseClassForExternClassProperty;
  }

  $equals(other: AbstractBaseClassForExternClass): $EqualsResult {
    return $booleanEquals(this.$identifier, other.$identifier)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "$identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        $strictEquals(this.$type, other.$type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "$type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        $strictEquals(
          this.abstractBaseClassForExternClassProperty,
          other.abstractBaseClassForExternClassProperty,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "abstractBaseClassForExternClassProperty",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.$identifier.value);
    _hasher.update(this.$type);
    this.$hashShaclProperties(_hasher);
    return _hasher;
  }

  protected $hashShaclProperties<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    _hasher.update(this.abstractBaseClassForExternClassProperty);
    return _hasher;
  }

  $toJson(): AbstractBaseClassForExternClassStatic.$Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          this.$identifier.termType === "BlankNode"
            ? `_:${this.$identifier.value}`
            : this.$identifier.value,
        $type: this.$type,
        abstractBaseClassForExternClassProperty:
          this.abstractBaseClassForExternClassProperty,
      } satisfies AbstractBaseClassForExternClassStatic.$Json),
    );
  }

  $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(this.$identifier, {
      mutateGraph,
    });
    _resource.add(
      AbstractBaseClassForExternClassStatic.$properties
        .abstractBaseClassForExternClassProperty["identifier"],
      this.abstractBaseClassForExternClassProperty,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.$toJson());
  }
}

export namespace AbstractBaseClassForExternClassStatic {
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export type $Json = {
    readonly "@id": string;
    readonly $type: "ExternClass";
    readonly abstractBaseClassForExternClassProperty: string;
  };

  export function $propertiesFromJson(_json: unknown): purify.Either<
    zod.ZodError,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      abstractBaseClassForExternClassProperty: string;
    }
  > {
    const $jsonSafeParseResult = $jsonZodSchema().safeParse(_json);
    if (!$jsonSafeParseResult.success) {
      return purify.Left($jsonSafeParseResult.error);
    }

    const _jsonObject = $jsonSafeParseResult.data;
    const $identifier = _jsonObject["@id"].startsWith("_:")
      ? dataFactory.blankNode(_jsonObject["@id"].substring(2))
      : dataFactory.namedNode(_jsonObject["@id"]);
    const abstractBaseClassForExternClassProperty =
      _jsonObject["abstractBaseClassForExternClassProperty"];
    return purify.Either.of({
      $identifier,
      abstractBaseClassForExternClassProperty,
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, AbstractBaseClassForExternClass> {
    return ExternClass.$fromJson(json) as purify.Either<
      zod.ZodError,
      AbstractBaseClassForExternClass
    >;
  }

  export function $jsonSchema() {
    return zodToJsonSchema($jsonZodSchema());
  }

  export function $jsonUiSchema(parameters?: { scopePrefix?: string }) {
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
              schema: { const: "AbstractBaseClassForExternClass" },
              scope: `${scopePrefix}/properties/$type`,
            },
            effect: "HIDE",
          },
          scope: `${scopePrefix}/properties/$type`,
          type: "Control",
        },
        {
          scope: `${scopePrefix}/properties/abstractBaseClassForExternClassProperty`,
          type: "Control",
        },
      ],
      label: "AbstractBaseClassForExternClass",
      type: "Group",
    };
  }

  export function $jsonZodSchema() {
    return zod.object({
      "@id": zod.string().min(1),
      $type: zod.literal("ExternClass"),
      abstractBaseClassForExternClassProperty: zod.string(),
    });
  }

  export function $propertiesFromRdf({
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
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      abstractBaseClassForExternClassProperty: string;
    }
  > {
    const $identifier: AbstractBaseClassForExternClassStatic.$Identifier =
      _resource.identifier;
    const _abstractBaseClassForExternClassPropertyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      string
    > = _resource
      .values(
        $properties.abstractBaseClassForExternClassProperty["identifier"],
        { unique: true },
      )
      .head()
      .chain((_value) => _value.toString());
    if (_abstractBaseClassForExternClassPropertyEither.isLeft()) {
      return _abstractBaseClassForExternClassPropertyEither;
    }

    const abstractBaseClassForExternClassProperty =
      _abstractBaseClassForExternClassPropertyEither.unsafeCoerce();
    return purify.Either.of({
      $identifier,
      abstractBaseClassForExternClassProperty,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof AbstractBaseClassForExternClassStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<
    rdfjsResource.Resource.ValueError,
    AbstractBaseClassForExternClass
  > {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return ExternClass.$fromRdf(otherParameters) as purify.Either<
      rdfjsResource.Resource.ValueError,
      AbstractBaseClassForExternClass
    >;
  }

  export const $properties = {
    abstractBaseClassForExternClassProperty: {
      identifier: dataFactory.namedNode(
        "http://example.com/abstractBaseClassForExternClassProperty",
      ),
    },
  };

  export function $sparqlConstructQuery(
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
        AbstractBaseClassForExternClassStatic.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        AbstractBaseClassForExternClassStatic.$sparqlWherePatterns({
          ignoreRdfType,
          subject,
        }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      AbstractBaseClassForExternClassStatic.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassForExternClass");
    const triples: sparqljs.Triple[] = [];
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassForExternClass");
    triples.push({
      object: dataFactory.variable!(
        `${variablePrefix}AbstractBaseClassForExternClassProperty`,
      ),
      predicate:
        AbstractBaseClassForExternClassStatic.$properties
          .abstractBaseClassForExternClassProperty["identifier"],
      subject,
    });
    return triples;
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    const optionalPatterns: sparqljs.OptionalPattern[] = [];
    const requiredPatterns: sparqljs.Pattern[] = [];
    const subject =
      parameters?.subject ??
      dataFactory.variable!("abstractBaseClassForExternClass");
    const variablePrefix =
      parameters?.variablePrefix ??
      (subject.termType === "Variable"
        ? subject.value
        : "abstractBaseClassForExternClass");
    const propertyPatterns: readonly sparqljs.Pattern[] = [
      {
        triples: [
          {
            object: dataFactory.variable!(
              `${variablePrefix}AbstractBaseClassForExternClassProperty`,
            ),
            predicate:
              AbstractBaseClassForExternClassStatic.$properties
                .abstractBaseClassForExternClassProperty["identifier"],
            subject,
          },
        ],
        type: "bgp",
      },
    ];
    for (const pattern of propertyPatterns) {
      if (pattern.type === "optional") {
        optionalPatterns.push(pattern);
      } else {
        requiredPatterns.push(pattern);
      }
    }

    return requiredPatterns.concat(optionalPatterns);
  }
}
/**
 * Node shape sh:xone's other node shapes. This will usually be generated as a discriminated union.
 */
export type ClassUnion = ClassUnionMember1 | ClassUnionMember2;

export namespace ClassUnion {
  export function $equals(left: ClassUnion, right: ClassUnion): $EqualsResult {
    return $strictEquals(left.$type, right.$type).chain(() => {
      switch (left.$type) {
        case "ClassUnionMember1":
          return left.$equals(right as unknown as ClassUnionMember1);
        case "ClassUnionMember2":
          return left.$equals(right as unknown as ClassUnionMember2);
        default:
          left satisfies never;
          throw new Error("unrecognized type");
      }
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, ClassUnion> {
    return (
      ClassUnionMember1.$fromJson(json) as purify.Either<
        zod.ZodError,
        ClassUnion
      >
    ).altLazy(
      () =>
        ClassUnionMember2.$fromJson(json) as purify.Either<
          zod.ZodError,
          ClassUnion
        >,
    );
  }

  export function $fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<rdfjsResource.Resource.ValueError, ClassUnion> {
    return (
      ClassUnionMember1.$fromRdf({ ...context, resource }) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ClassUnion
      >
    ).altLazy(
      () =>
        ClassUnionMember2.$fromRdf({ ...context, resource }) as purify.Either<
          rdfjsResource.Resource.ValueError,
          ClassUnion
        >,
    );
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_classUnion: ClassUnion, _hasher: HasherT): HasherT {
    switch (_classUnion.$type) {
      case "ClassUnionMember1":
        return _classUnion.$hash(_hasher);
      case "ClassUnionMember2":
        return _classUnion.$hash(_hasher);
      default:
        _classUnion satisfies never;
        throw new Error("unrecognized type");
    }
  }

  export type $Json = ClassUnionMember1.$Json | ClassUnionMember2.$Json;

  export function $jsonZodSchema() {
    return zod.discriminatedUnion("$type", [
      ClassUnionMember1.$jsonZodSchema(),
      ClassUnionMember2.$jsonZodSchema(),
    ]);
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $sparqlConstructQuery(
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
        ClassUnion.$sparqlConstructTemplateTriples({ ignoreRdfType, subject }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        ClassUnion.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      ClassUnion.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [
      ...ClassUnionMember1.$sparqlConstructTemplateTriples({
        subject:
          parameters?.subject ??
          dataFactory.variable!("classUnionClassUnionMember1"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}ClassUnionMember1`
          : "classUnionClassUnionMember1",
      }).concat(),
      ...ClassUnionMember2.$sparqlConstructTemplateTriples({
        subject:
          parameters?.subject ??
          dataFactory.variable!("classUnionClassUnionMember2"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}ClassUnionMember2`
          : "classUnionClassUnionMember2",
      }).concat(),
    ];
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [
      {
        patterns: [
          {
            patterns: ClassUnionMember1.$sparqlWherePatterns({
              subject:
                parameters?.subject ??
                dataFactory.variable!("classUnionClassUnionMember1"),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}ClassUnionMember1`
                : "classUnionClassUnionMember1",
            }).concat(),
            type: "group",
          },
          {
            patterns: ClassUnionMember2.$sparqlWherePatterns({
              subject:
                parameters?.subject ??
                dataFactory.variable!("classUnionClassUnionMember2"),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}ClassUnionMember2`
                : "classUnionClassUnionMember2",
            }).concat(),
            type: "group",
          },
        ],
        type: "union",
      },
    ];
  }

  export function $toJson(
    _classUnion: ClassUnion,
  ): ClassUnionMember1.$Json | ClassUnionMember2.$Json {
    switch (_classUnion.$type) {
      case "ClassUnionMember1":
        return _classUnion.$toJson();
      case "ClassUnionMember2":
        return _classUnion.$toJson();
      default:
        _classUnion satisfies never;
        throw new Error("unrecognized type");
    }
  }

  export function $toRdf(
    _classUnion: ClassUnion,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_classUnion.$type) {
      case "ClassUnionMember1":
        return _classUnion.$toRdf(_parameters);
      case "ClassUnionMember2":
        return _classUnion.$toRdf(_parameters);
      default:
        _classUnion satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
/**
 * Node shape that sh:xone's other node shapes. This will usually be generated as a discriminated union.
 */
export type InterfaceUnion =
  | InterfaceUnionMember1
  | InterfaceUnionMember2a
  | InterfaceUnionMember2b;

export namespace InterfaceUnion {
  export function $equals(
    left: InterfaceUnion,
    right: InterfaceUnion,
  ): $EqualsResult {
    return $strictEquals(left.$type, right.$type).chain(() => {
      switch (left.$type) {
        case "InterfaceUnionMember1":
          return InterfaceUnionMember1.$equals(
            left,
            right as unknown as InterfaceUnionMember1,
          );
        case "InterfaceUnionMember2a":
          return InterfaceUnionMember2a.$equals(
            left,
            right as unknown as InterfaceUnionMember2a,
          );
        case "InterfaceUnionMember2b":
          return InterfaceUnionMember2b.$equals(
            left,
            right as unknown as InterfaceUnionMember2b,
          );
        default:
          left satisfies never;
          throw new Error("unrecognized type");
      }
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnion> {
    return (
      InterfaceUnionMember1.$fromJson(json) as purify.Either<
        zod.ZodError,
        InterfaceUnion
      >
    )
      .altLazy(
        () =>
          InterfaceUnionMember2a.$fromJson(json) as purify.Either<
            zod.ZodError,
            InterfaceUnion
          >,
      )
      .altLazy(
        () =>
          InterfaceUnionMember2b.$fromJson(json) as purify.Either<
            zod.ZodError,
            InterfaceUnion
          >,
      );
  }

  export function $fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<rdfjsResource.Resource.ValueError, InterfaceUnion> {
    return (
      InterfaceUnionMember1.$fromRdf({ ...context, resource }) as purify.Either<
        rdfjsResource.Resource.ValueError,
        InterfaceUnion
      >
    )
      .altLazy(
        () =>
          InterfaceUnionMember2a.$fromRdf({
            ...context,
            resource,
          }) as purify.Either<
            rdfjsResource.Resource.ValueError,
            InterfaceUnion
          >,
      )
      .altLazy(
        () =>
          InterfaceUnionMember2b.$fromRdf({
            ...context,
            resource,
          }) as purify.Either<
            rdfjsResource.Resource.ValueError,
            InterfaceUnion
          >,
      );
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_interfaceUnion: InterfaceUnion, _hasher: HasherT): HasherT {
    switch (_interfaceUnion.$type) {
      case "InterfaceUnionMember1":
        return InterfaceUnionMember1.$hash(_interfaceUnion, _hasher);
      case "InterfaceUnionMember2a":
        return InterfaceUnionMember2a.$hash(_interfaceUnion, _hasher);
      case "InterfaceUnionMember2b":
        return InterfaceUnionMember2b.$hash(_interfaceUnion, _hasher);
      default:
        _interfaceUnion satisfies never;
        throw new Error("unrecognized type");
    }
  }

  export type $Json =
    | InterfaceUnionMember1.$Json
    | InterfaceUnionMember2a.$Json
    | InterfaceUnionMember2b.$Json;

  export function $jsonZodSchema() {
    return zod.discriminatedUnion("$type", [
      InterfaceUnionMember1.$jsonZodSchema(),
      InterfaceUnionMember2a.$jsonZodSchema(),
      InterfaceUnionMember2b.$jsonZodSchema(),
    ]);
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $sparqlConstructQuery(
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
        InterfaceUnion.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnion.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnion.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [
      ...InterfaceUnionMember1.$sparqlConstructTemplateTriples({
        subject:
          parameters?.subject ??
          dataFactory.variable!("interfaceUnionInterfaceUnionMember1"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionMember1`
          : "interfaceUnionInterfaceUnionMember1",
      }).concat(),
      ...InterfaceUnionMember2a.$sparqlConstructTemplateTriples({
        subject:
          parameters?.subject ??
          dataFactory.variable!("interfaceUnionInterfaceUnionMember2a"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionMember2a`
          : "interfaceUnionInterfaceUnionMember2a",
      }).concat(),
      ...InterfaceUnionMember2b.$sparqlConstructTemplateTriples({
        subject:
          parameters?.subject ??
          dataFactory.variable!("interfaceUnionInterfaceUnionMember2b"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionMember2b`
          : "interfaceUnionInterfaceUnionMember2b",
      }).concat(),
    ];
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [
      {
        patterns: [
          {
            patterns: InterfaceUnionMember1.$sparqlWherePatterns({
              subject:
                parameters?.subject ??
                dataFactory.variable!("interfaceUnionInterfaceUnionMember1"),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionMember1`
                : "interfaceUnionInterfaceUnionMember1",
            }).concat(),
            type: "group",
          },
          {
            patterns: InterfaceUnionMember2a.$sparqlWherePatterns({
              subject:
                parameters?.subject ??
                dataFactory.variable!("interfaceUnionInterfaceUnionMember2a"),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionMember2a`
                : "interfaceUnionInterfaceUnionMember2a",
            }).concat(),
            type: "group",
          },
          {
            patterns: InterfaceUnionMember2b.$sparqlWherePatterns({
              subject:
                parameters?.subject ??
                dataFactory.variable!("interfaceUnionInterfaceUnionMember2b"),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionMember2b`
                : "interfaceUnionInterfaceUnionMember2b",
            }).concat(),
            type: "group",
          },
        ],
        type: "union",
      },
    ];
  }

  export function $toJson(
    _interfaceUnion: InterfaceUnion,
  ):
    | InterfaceUnionMember1.$Json
    | InterfaceUnionMember2a.$Json
    | InterfaceUnionMember2b.$Json {
    switch (_interfaceUnion.$type) {
      case "InterfaceUnionMember1":
        return InterfaceUnionMember1.$toJson(_interfaceUnion);
      case "InterfaceUnionMember2a":
        return InterfaceUnionMember2a.$toJson(_interfaceUnion);
      case "InterfaceUnionMember2b":
        return InterfaceUnionMember2b.$toJson(_interfaceUnion);
      default:
        _interfaceUnion satisfies never;
        throw new Error("unrecognized type");
    }
  }

  export function $toRdf(
    _interfaceUnion: InterfaceUnion,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_interfaceUnion.$type) {
      case "InterfaceUnionMember1":
        return InterfaceUnionMember1.$toRdf(_interfaceUnion, _parameters);
      case "InterfaceUnionMember2a":
        return InterfaceUnionMember2a.$toRdf(_interfaceUnion, _parameters);
      case "InterfaceUnionMember2b":
        return InterfaceUnionMember2b.$toRdf(_interfaceUnion, _parameters);
      default:
        _interfaceUnion satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
/**
 * A union node shape that is part of another union shape, to test composition of unions.
 */
export type InterfaceUnionMember2 =
  | InterfaceUnionMember2a
  | InterfaceUnionMember2b;

export namespace InterfaceUnionMember2 {
  export function $equals(
    left: InterfaceUnionMember2,
    right: InterfaceUnionMember2,
  ): $EqualsResult {
    return $strictEquals(left.$type, right.$type).chain(() => {
      switch (left.$type) {
        case "InterfaceUnionMember2a":
          return InterfaceUnionMember2a.$equals(
            left,
            right as unknown as InterfaceUnionMember2a,
          );
        case "InterfaceUnionMember2b":
          return InterfaceUnionMember2b.$equals(
            left,
            right as unknown as InterfaceUnionMember2b,
          );
        default:
          left satisfies never;
          throw new Error("unrecognized type");
      }
    });
  }

  export function $fromJson(
    json: unknown,
  ): purify.Either<zod.ZodError, InterfaceUnionMember2> {
    return (
      InterfaceUnionMember2a.$fromJson(json) as purify.Either<
        zod.ZodError,
        InterfaceUnionMember2
      >
    ).altLazy(
      () =>
        InterfaceUnionMember2b.$fromJson(json) as purify.Either<
          zod.ZodError,
          InterfaceUnionMember2
        >,
    );
  }

  export function $fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<rdfjsResource.Resource.ValueError, InterfaceUnionMember2> {
    return (
      InterfaceUnionMember2a.$fromRdf({
        ...context,
        resource,
      }) as purify.Either<
        rdfjsResource.Resource.ValueError,
        InterfaceUnionMember2
      >
    ).altLazy(
      () =>
        InterfaceUnionMember2b.$fromRdf({
          ...context,
          resource,
        }) as purify.Either<
          rdfjsResource.Resource.ValueError,
          InterfaceUnionMember2
        >,
    );
  }

  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_interfaceUnionMember2: InterfaceUnionMember2, _hasher: HasherT): HasherT {
    switch (_interfaceUnionMember2.$type) {
      case "InterfaceUnionMember2a":
        return InterfaceUnionMember2a.$hash(_interfaceUnionMember2, _hasher);
      case "InterfaceUnionMember2b":
        return InterfaceUnionMember2b.$hash(_interfaceUnionMember2, _hasher);
      default:
        _interfaceUnionMember2 satisfies never;
        throw new Error("unrecognized type");
    }
  }

  export type $Json =
    | InterfaceUnionMember2a.$Json
    | InterfaceUnionMember2b.$Json;

  export function $jsonZodSchema() {
    return zod.discriminatedUnion("$type", [
      InterfaceUnionMember2a.$jsonZodSchema(),
      InterfaceUnionMember2b.$jsonZodSchema(),
    ]);
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $sparqlConstructQuery(
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
        InterfaceUnionMember2.$sparqlConstructTemplateTriples({
          ignoreRdfType,
          subject,
        }),
      ),
      type: "query",
      where: (queryParameters.where ?? []).concat(
        InterfaceUnionMember2.$sparqlWherePatterns({ ignoreRdfType, subject }),
      ),
    };
  }

  export function $sparqlConstructQueryString(
    parameters?: {
      ignoreRdfType?: boolean;
      subject?: sparqljs.Triple["subject"];
      variablePrefix?: string;
    } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> &
      sparqljs.GeneratorOptions,
  ): string {
    return new sparqljs.Generator(parameters).stringify(
      InterfaceUnionMember2.$sparqlConstructQuery(parameters),
    );
  }

  export function $sparqlConstructTemplateTriples(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Triple[] {
    return [
      ...InterfaceUnionMember2a.$sparqlConstructTemplateTriples({
        subject:
          parameters?.subject ??
          dataFactory.variable!("interfaceUnionMember2InterfaceUnionMember2a"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionMember2a`
          : "interfaceUnionMember2InterfaceUnionMember2a",
      }).concat(),
      ...InterfaceUnionMember2b.$sparqlConstructTemplateTriples({
        subject:
          parameters?.subject ??
          dataFactory.variable!("interfaceUnionMember2InterfaceUnionMember2b"),
        variablePrefix: parameters?.variablePrefix
          ? `${parameters.variablePrefix}InterfaceUnionMember2b`
          : "interfaceUnionMember2InterfaceUnionMember2b",
      }).concat(),
    ];
  }

  export function $sparqlWherePatterns(parameters?: {
    ignoreRdfType?: boolean;
    subject?: sparqljs.Triple["subject"];
    variablePrefix?: string;
  }): readonly sparqljs.Pattern[] {
    return [
      {
        patterns: [
          {
            patterns: InterfaceUnionMember2a.$sparqlWherePatterns({
              subject:
                parameters?.subject ??
                dataFactory.variable!(
                  "interfaceUnionMember2InterfaceUnionMember2a",
                ),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionMember2a`
                : "interfaceUnionMember2InterfaceUnionMember2a",
            }).concat(),
            type: "group",
          },
          {
            patterns: InterfaceUnionMember2b.$sparqlWherePatterns({
              subject:
                parameters?.subject ??
                dataFactory.variable!(
                  "interfaceUnionMember2InterfaceUnionMember2b",
                ),
              variablePrefix: parameters?.variablePrefix
                ? `${parameters.variablePrefix}InterfaceUnionMember2b`
                : "interfaceUnionMember2InterfaceUnionMember2b",
            }).concat(),
            type: "group",
          },
        ],
        type: "union",
      },
    ];
  }

  export function $toJson(
    _interfaceUnionMember2: InterfaceUnionMember2,
  ): InterfaceUnionMember2a.$Json | InterfaceUnionMember2b.$Json {
    switch (_interfaceUnionMember2.$type) {
      case "InterfaceUnionMember2a":
        return InterfaceUnionMember2a.$toJson(_interfaceUnionMember2);
      case "InterfaceUnionMember2b":
        return InterfaceUnionMember2b.$toJson(_interfaceUnionMember2);
      default:
        _interfaceUnionMember2 satisfies never;
        throw new Error("unrecognized type");
    }
  }

  export function $toRdf(
    _interfaceUnionMember2: InterfaceUnionMember2,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_interfaceUnionMember2.$type) {
      case "InterfaceUnionMember2a":
        return InterfaceUnionMember2a.$toRdf(
          _interfaceUnionMember2,
          _parameters,
        );
      case "InterfaceUnionMember2b":
        return InterfaceUnionMember2b.$toRdf(
          _interfaceUnionMember2,
          _parameters,
        );
      default:
        _interfaceUnionMember2 satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
export interface $ObjectSet {
  baseInterfaceWithoutProperties(
    identifier: BaseInterfaceWithoutPropertiesStatic.$Identifier,
  ): Promise<purify.Either<Error, BaseInterfaceWithoutProperties>>;
  baseInterfaceWithoutPropertiesIdentifiers(
    query?: $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly BaseInterfaceWithoutPropertiesStatic.$Identifier[]
    >
  >;
  baseInterfaceWithoutPropertieses(
    query?: $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, BaseInterfaceWithoutProperties>[]>;
  baseInterfaceWithoutPropertiesesCount(
    query?: Pick<
      $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  baseInterfaceWithProperties(
    identifier: BaseInterfaceWithPropertiesStatic.$Identifier,
  ): Promise<purify.Either<Error, BaseInterfaceWithProperties>>;
  baseInterfaceWithPropertiesIdentifiers(
    query?: $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly BaseInterfaceWithPropertiesStatic.$Identifier[]
    >
  >;
  baseInterfaceWithPropertieses(
    query?: $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, BaseInterfaceWithProperties>[]>;
  baseInterfaceWithPropertiesesCount(
    query?: Pick<
      $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  blankClass(
    identifier: BlankClass.$Identifier,
  ): Promise<purify.Either<Error, BlankClass>>;
  blankClassIdentifiers(
    query?: $ObjectSet.Query<BlankClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly BlankClass.$Identifier[]>>;
  blankClasses(
    query?: $ObjectSet.Query<BlankClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, BlankClass>[]>;
  blankClassesCount(
    query?: Pick<$ObjectSet.Query<BlankClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  classUnionMember1(
    identifier: ClassUnionMember1.$Identifier,
  ): Promise<purify.Either<Error, ClassUnionMember1>>;
  classUnionMember1Identifiers(
    query?: $ObjectSet.Query<ClassUnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnionMember1.$Identifier[]>>;
  classUnionMember1s(
    query?: $ObjectSet.Query<ClassUnionMember1.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnionMember1>[]>;
  classUnionMember1sCount(
    query?: Pick<$ObjectSet.Query<ClassUnionMember1.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  classUnionMember2(
    identifier: ClassUnionMember2.$Identifier,
  ): Promise<purify.Either<Error, ClassUnionMember2>>;
  classUnionMember2Identifiers(
    query?: $ObjectSet.Query<ClassUnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnionMember2.$Identifier[]>>;
  classUnionMember2s(
    query?: $ObjectSet.Query<ClassUnionMember2.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnionMember2>[]>;
  classUnionMember2sCount(
    query?: Pick<$ObjectSet.Query<ClassUnionMember2.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  concreteChildClass(
    identifier: ConcreteChildClass.$Identifier,
  ): Promise<purify.Either<Error, ConcreteChildClass>>;
  concreteChildClassIdentifiers(
    query?: $ObjectSet.Query<ConcreteChildClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly ConcreteChildClass.$Identifier[]>>;
  concreteChildClasses(
    query?: $ObjectSet.Query<ConcreteChildClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteChildClass>[]>;
  concreteChildClassesCount(
    query?: Pick<$ObjectSet.Query<ConcreteChildClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  concreteChildInterface(
    identifier: ConcreteChildInterface.$Identifier,
  ): Promise<purify.Either<Error, ConcreteChildInterface>>;
  concreteChildInterfaceIdentifiers(
    query?: $ObjectSet.Query<ConcreteChildInterface.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteChildInterface.$Identifier[]>
  >;
  concreteChildInterfaces(
    query?: $ObjectSet.Query<ConcreteChildInterface.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteChildInterface>[]>;
  concreteChildInterfacesCount(
    query?: Pick<$ObjectSet.Query<ConcreteChildInterface.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  concreteParentClass(
    identifier: ConcreteParentClassStatic.$Identifier,
  ): Promise<purify.Either<Error, ConcreteParentClass>>;
  concreteParentClassIdentifiers(
    query?: $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteParentClassStatic.$Identifier[]>
  >;
  concreteParentClasses(
    query?: $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteParentClass>[]>;
  concreteParentClassesCount(
    query?: Pick<
      $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  concreteParentInterface(
    identifier: ConcreteParentInterfaceStatic.$Identifier,
  ): Promise<purify.Either<Error, ConcreteParentInterface>>;
  concreteParentInterfaceIdentifiers(
    query?: $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteParentInterfaceStatic.$Identifier[]>
  >;
  concreteParentInterfaces(
    query?: $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteParentInterface>[]>;
  concreteParentInterfacesCount(
    query?: Pick<
      $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  defaultValuePropertiesClass(
    identifier: DefaultValuePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, DefaultValuePropertiesClass>>;
  defaultValuePropertiesClassIdentifiers(
    query?: $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly DefaultValuePropertiesClass.$Identifier[]>
  >;
  defaultValuePropertiesClasses(
    query?: $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, DefaultValuePropertiesClass>[]>;
  defaultValuePropertiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  explicitFromToRdfTypesClass(
    identifier: ExplicitFromToRdfTypesClass.$Identifier,
  ): Promise<purify.Either<Error, ExplicitFromToRdfTypesClass>>;
  explicitFromToRdfTypesClassIdentifiers(
    query?: $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ExplicitFromToRdfTypesClass.$Identifier[]>
  >;
  explicitFromToRdfTypesClasses(
    query?: $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExplicitFromToRdfTypesClass>[]>;
  explicitFromToRdfTypesClassesCount(
    query?: Pick<
      $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  explicitRdfTypeClass(
    identifier: ExplicitRdfTypeClass.$Identifier,
  ): Promise<purify.Either<Error, ExplicitRdfTypeClass>>;
  explicitRdfTypeClassIdentifiers(
    query?: $ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly ExplicitRdfTypeClass.$Identifier[]>>;
  explicitRdfTypeClasses(
    query?: $ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExplicitRdfTypeClass>[]>;
  explicitRdfTypeClassesCount(
    query?: Pick<$ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  externPropertiesClass(
    identifier: ExternPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesClass>>;
  externPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<ExternPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ExternPropertiesClass.$Identifier[]>
  >;
  externPropertiesClasses(
    query?: $ObjectSet.Query<ExternPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExternPropertiesClass>[]>;
  externPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<ExternPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  externPropertiesExternNestedClass(
    identifier: ExternPropertiesExternNestedClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesExternNestedClass>>;
  externPropertiesExternNestedClassIdentifiers(
    query?: $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly ExternPropertiesExternNestedClass.$Identifier[]
    >
  >;
  externPropertiesExternNestedClasses(
    query?: $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
  ): Promise<
    readonly purify.Either<Error, ExternPropertiesExternNestedClass>[]
  >;
  externPropertiesExternNestedClassesCount(
    query?: Pick<
      $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  externPropertiesInlineNestedClass(
    identifier: ExternPropertiesInlineNestedClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesInlineNestedClass>>;
  externPropertiesInlineNestedClassIdentifiers(
    query?: $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly ExternPropertiesInlineNestedClass.$Identifier[]
    >
  >;
  externPropertiesInlineNestedClasses(
    query?: $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
  ): Promise<
    readonly purify.Either<Error, ExternPropertiesInlineNestedClass>[]
  >;
  externPropertiesInlineNestedClassesCount(
    query?: Pick<
      $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  hasValuePropertiesClass(
    identifier: HasValuePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, HasValuePropertiesClass>>;
  hasValuePropertiesClassIdentifiers(
    query?: $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly HasValuePropertiesClass.$Identifier[]>
  >;
  hasValuePropertiesClasses(
    query?: $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, HasValuePropertiesClass>[]>;
  hasValuePropertiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  inIdentifierClass(
    identifier: InIdentifierClass.$Identifier,
  ): Promise<purify.Either<Error, InIdentifierClass>>;
  inIdentifierClassIdentifiers(
    query?: $ObjectSet.Query<InIdentifierClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly InIdentifierClass.$Identifier[]>>;
  inIdentifierClasses(
    query?: $ObjectSet.Query<InIdentifierClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, InIdentifierClass>[]>;
  inIdentifierClassesCount(
    query?: Pick<$ObjectSet.Query<InIdentifierClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  inPropertiesClass(
    identifier: InPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, InPropertiesClass>>;
  inPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<InPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly InPropertiesClass.$Identifier[]>>;
  inPropertiesClasses(
    query?: $ObjectSet.Query<InPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, InPropertiesClass>[]>;
  inPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<InPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  interface(
    identifier: Interface.$Identifier,
  ): Promise<purify.Either<Error, Interface>>;
  interfaceIdentifiers(
    query?: $ObjectSet.Query<Interface.$Identifier>,
  ): Promise<purify.Either<Error, readonly Interface.$Identifier[]>>;
  interfaces(
    query?: $ObjectSet.Query<Interface.$Identifier>,
  ): Promise<readonly purify.Either<Error, Interface>[]>;
  interfacesCount(
    query?: Pick<$ObjectSet.Query<Interface.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  interfaceUnionMember1(
    identifier: InterfaceUnionMember1.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember1>>;
  interfaceUnionMember1Identifiers(
    query?: $ObjectSet.Query<InterfaceUnionMember1.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember1.$Identifier[]>
  >;
  interfaceUnionMember1s(
    query?: $ObjectSet.Query<InterfaceUnionMember1.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember1>[]>;
  interfaceUnionMember1sCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember1.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  interfaceUnionMember2a(
    identifier: InterfaceUnionMember2a.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2a>>;
  interfaceUnionMember2aIdentifiers(
    query?: $ObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2a.$Identifier[]>
  >;
  interfaceUnionMember2as(
    query?: $ObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2a>[]>;
  interfaceUnionMember2asCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2a.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  interfaceUnionMember2b(
    identifier: InterfaceUnionMember2b.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2b>>;
  interfaceUnionMember2bIdentifiers(
    query?: $ObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2b.$Identifier[]>
  >;
  interfaceUnionMember2bs(
    query?: $ObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2b>[]>;
  interfaceUnionMember2bsCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2b.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  iriClass(
    identifier: IriClass.$Identifier,
  ): Promise<purify.Either<Error, IriClass>>;
  iriClassIdentifiers(
    query?: $ObjectSet.Query<IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly IriClass.$Identifier[]>>;
  iriClasses(
    query?: $ObjectSet.Query<IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, IriClass>[]>;
  iriClassesCount(
    query?: Pick<$ObjectSet.Query<IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  languageInPropertiesClass(
    identifier: LanguageInPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, LanguageInPropertiesClass>>;
  languageInPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly LanguageInPropertiesClass.$Identifier[]>
  >;
  languageInPropertiesClasses(
    query?: $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, LanguageInPropertiesClass>[]>;
  languageInPropertiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  listPropertiesClass(
    identifier: ListPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, ListPropertiesClass>>;
  listPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<ListPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly ListPropertiesClass.$Identifier[]>>;
  listPropertiesClasses(
    query?: $ObjectSet.Query<ListPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ListPropertiesClass>[]>;
  listPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<ListPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  mutablePropertiesClass(
    identifier: MutablePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, MutablePropertiesClass>>;
  mutablePropertiesClassIdentifiers(
    query?: $ObjectSet.Query<MutablePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly MutablePropertiesClass.$Identifier[]>
  >;
  mutablePropertiesClasses(
    query?: $ObjectSet.Query<MutablePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, MutablePropertiesClass>[]>;
  mutablePropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<MutablePropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  nonClass(
    identifier: NonClass.$Identifier,
  ): Promise<purify.Either<Error, NonClass>>;
  nonClassIdentifiers(
    query?: $ObjectSet.Query<NonClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly NonClass.$Identifier[]>>;
  nonClasses(
    query?: $ObjectSet.Query<NonClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, NonClass>[]>;
  nonClassesCount(
    query?: Pick<$ObjectSet.Query<NonClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  orderedPropertiesClass(
    identifier: OrderedPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, OrderedPropertiesClass>>;
  orderedPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<OrderedPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly OrderedPropertiesClass.$Identifier[]>
  >;
  orderedPropertiesClasses(
    query?: $ObjectSet.Query<OrderedPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, OrderedPropertiesClass>[]>;
  orderedPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<OrderedPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  propertyCardinalitiesClass(
    identifier: PropertyCardinalitiesClass.$Identifier,
  ): Promise<purify.Either<Error, PropertyCardinalitiesClass>>;
  propertyCardinalitiesClassIdentifiers(
    query?: $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly PropertyCardinalitiesClass.$Identifier[]>
  >;
  propertyCardinalitiesClasses(
    query?: $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, PropertyCardinalitiesClass>[]>;
  propertyCardinalitiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  propertyVisibilitiesClass(
    identifier: PropertyVisibilitiesClass.$Identifier,
  ): Promise<purify.Either<Error, PropertyVisibilitiesClass>>;
  propertyVisibilitiesClassIdentifiers(
    query?: $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly PropertyVisibilitiesClass.$Identifier[]>
  >;
  propertyVisibilitiesClasses(
    query?: $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, PropertyVisibilitiesClass>[]>;
  propertyVisibilitiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  sha256IriClass(
    identifier: Sha256IriClass.$Identifier,
  ): Promise<purify.Either<Error, Sha256IriClass>>;
  sha256IriClassIdentifiers(
    query?: $ObjectSet.Query<Sha256IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly Sha256IriClass.$Identifier[]>>;
  sha256IriClasses(
    query?: $ObjectSet.Query<Sha256IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, Sha256IriClass>[]>;
  sha256IriClassesCount(
    query?: Pick<$ObjectSet.Query<Sha256IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  termPropertiesClass(
    identifier: TermPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, TermPropertiesClass>>;
  termPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<TermPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly TermPropertiesClass.$Identifier[]>>;
  termPropertiesClasses(
    query?: $ObjectSet.Query<TermPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, TermPropertiesClass>[]>;
  termPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<TermPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  unionPropertiesClass(
    identifier: UnionPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, UnionPropertiesClass>>;
  unionPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<UnionPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly UnionPropertiesClass.$Identifier[]>>;
  unionPropertiesClasses(
    query?: $ObjectSet.Query<UnionPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, UnionPropertiesClass>[]>;
  unionPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<UnionPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  uuidV4IriClass(
    identifier: UuidV4IriClass.$Identifier,
  ): Promise<purify.Either<Error, UuidV4IriClass>>;
  uuidV4IriClassIdentifiers(
    query?: $ObjectSet.Query<UuidV4IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly UuidV4IriClass.$Identifier[]>>;
  uuidV4IriClasses(
    query?: $ObjectSet.Query<UuidV4IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, UuidV4IriClass>[]>;
  uuidV4IriClassesCount(
    query?: Pick<$ObjectSet.Query<UuidV4IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  classUnion(
    identifier: ClassUnion.$Identifier,
  ): Promise<purify.Either<Error, ClassUnion>>;
  classUnionIdentifiers(
    query?: $ObjectSet.Query<ClassUnion.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnion.$Identifier[]>>;
  classUnions(
    query?: $ObjectSet.Query<ClassUnion.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnion>[]>;
  classUnionsCount(
    query?: Pick<$ObjectSet.Query<ClassUnion.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  interfaceUnion(
    identifier: InterfaceUnion.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnion>>;
  interfaceUnionIdentifiers(
    query?: $ObjectSet.Query<InterfaceUnion.$Identifier>,
  ): Promise<purify.Either<Error, readonly InterfaceUnion.$Identifier[]>>;
  interfaceUnions(
    query?: $ObjectSet.Query<InterfaceUnion.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnion>[]>;
  interfaceUnionsCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnion.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  interfaceUnionMember2(
    identifier: InterfaceUnionMember2.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2>>;
  interfaceUnionMember2Identifiers(
    query?: $ObjectSet.Query<InterfaceUnionMember2.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2.$Identifier[]>
  >;
  interfaceUnionMember2s(
    query?: $ObjectSet.Query<InterfaceUnionMember2.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2>[]>;
  interfaceUnionMember2sCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2.$Identifier>, "where">,
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
  > = {
    readonly identifiers: readonly ObjectIdentifierT[];
    readonly type: "identifiers";
  };
}

export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly resourceSet: rdfjsResource.ResourceSet;

  constructor({ dataset }: { dataset: rdfjs.DatasetCore }) {
    this.resourceSet = new rdfjsResource.ResourceSet({ dataset });
  }

  async baseInterfaceWithoutProperties(
    identifier: BaseInterfaceWithoutPropertiesStatic.$Identifier,
  ): Promise<purify.Either<Error, BaseInterfaceWithoutProperties>> {
    return this.baseInterfaceWithoutPropertiesSync(identifier);
  }

  baseInterfaceWithoutPropertiesSync(
    identifier: BaseInterfaceWithoutPropertiesStatic.$Identifier,
  ): purify.Either<Error, BaseInterfaceWithoutProperties> {
    return this.baseInterfaceWithoutPropertiesesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async baseInterfaceWithoutPropertiesIdentifiers(
    query?: $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly BaseInterfaceWithoutPropertiesStatic.$Identifier[]
    >
  > {
    return this.baseInterfaceWithoutPropertiesIdentifiersSync(query);
  }

  baseInterfaceWithoutPropertiesIdentifiersSync(
    query?: $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
  ): purify.Either<
    Error,
    readonly BaseInterfaceWithoutPropertiesStatic.$Identifier[]
  > {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        BaseInterfaceWithoutProperties,
        BaseInterfaceWithoutPropertiesStatic.$Identifier
      >(BaseInterfaceWithoutPropertiesStatic, query),
    ]);
  }

  async baseInterfaceWithoutPropertieses(
    query?: $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, BaseInterfaceWithoutProperties>[]> {
    return this.baseInterfaceWithoutPropertiesesSync(query);
  }

  baseInterfaceWithoutPropertiesesSync(
    query?: $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
  ): readonly purify.Either<Error, BaseInterfaceWithoutProperties>[] {
    return [
      ...this.$objectsSync<
        BaseInterfaceWithoutProperties,
        BaseInterfaceWithoutPropertiesStatic.$Identifier
      >(BaseInterfaceWithoutPropertiesStatic, query),
    ];
  }

  async baseInterfaceWithoutPropertiesesCount(
    query?: Pick<
      $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.baseInterfaceWithoutPropertiesesCountSync(query);
  }

  baseInterfaceWithoutPropertiesesCountSync(
    query?: Pick<
      $ObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      BaseInterfaceWithoutProperties,
      BaseInterfaceWithoutPropertiesStatic.$Identifier
    >(BaseInterfaceWithoutPropertiesStatic, query);
  }

  async baseInterfaceWithProperties(
    identifier: BaseInterfaceWithPropertiesStatic.$Identifier,
  ): Promise<purify.Either<Error, BaseInterfaceWithProperties>> {
    return this.baseInterfaceWithPropertiesSync(identifier);
  }

  baseInterfaceWithPropertiesSync(
    identifier: BaseInterfaceWithPropertiesStatic.$Identifier,
  ): purify.Either<Error, BaseInterfaceWithProperties> {
    return this.baseInterfaceWithPropertiesesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async baseInterfaceWithPropertiesIdentifiers(
    query?: $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly BaseInterfaceWithPropertiesStatic.$Identifier[]
    >
  > {
    return this.baseInterfaceWithPropertiesIdentifiersSync(query);
  }

  baseInterfaceWithPropertiesIdentifiersSync(
    query?: $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
  ): purify.Either<
    Error,
    readonly BaseInterfaceWithPropertiesStatic.$Identifier[]
  > {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        BaseInterfaceWithProperties,
        BaseInterfaceWithPropertiesStatic.$Identifier
      >(BaseInterfaceWithPropertiesStatic, query),
    ]);
  }

  async baseInterfaceWithPropertieses(
    query?: $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, BaseInterfaceWithProperties>[]> {
    return this.baseInterfaceWithPropertiesesSync(query);
  }

  baseInterfaceWithPropertiesesSync(
    query?: $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
  ): readonly purify.Either<Error, BaseInterfaceWithProperties>[] {
    return [
      ...this.$objectsSync<
        BaseInterfaceWithProperties,
        BaseInterfaceWithPropertiesStatic.$Identifier
      >(BaseInterfaceWithPropertiesStatic, query),
    ];
  }

  async baseInterfaceWithPropertiesesCount(
    query?: Pick<
      $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.baseInterfaceWithPropertiesesCountSync(query);
  }

  baseInterfaceWithPropertiesesCountSync(
    query?: Pick<
      $ObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      BaseInterfaceWithProperties,
      BaseInterfaceWithPropertiesStatic.$Identifier
    >(BaseInterfaceWithPropertiesStatic, query);
  }

  async blankClass(
    identifier: BlankClass.$Identifier,
  ): Promise<purify.Either<Error, BlankClass>> {
    return this.blankClassSync(identifier);
  }

  blankClassSync(
    identifier: BlankClass.$Identifier,
  ): purify.Either<Error, BlankClass> {
    return this.blankClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async blankClassIdentifiers(
    query?: $ObjectSet.Query<BlankClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly BlankClass.$Identifier[]>> {
    return this.blankClassIdentifiersSync(query);
  }

  blankClassIdentifiersSync(
    query?: $ObjectSet.Query<BlankClass.$Identifier>,
  ): purify.Either<Error, readonly BlankClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<BlankClass, BlankClass.$Identifier>(
        { ...BlankClass, $fromRdfType: undefined },
        query,
      ),
    ]);
  }

  async blankClasses(
    query?: $ObjectSet.Query<BlankClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, BlankClass>[]> {
    return this.blankClassesSync(query);
  }

  blankClassesSync(
    query?: $ObjectSet.Query<BlankClass.$Identifier>,
  ): readonly purify.Either<Error, BlankClass>[] {
    return [
      ...this.$objectsSync<BlankClass, BlankClass.$Identifier>(
        { ...BlankClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async blankClassesCount(
    query?: Pick<$ObjectSet.Query<BlankClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.blankClassesCountSync(query);
  }

  blankClassesCountSync(
    query?: Pick<$ObjectSet.Query<BlankClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<BlankClass, BlankClass.$Identifier>(
      { ...BlankClass, $fromRdfType: undefined },
      query,
    );
  }

  async classUnionMember1(
    identifier: ClassUnionMember1.$Identifier,
  ): Promise<purify.Either<Error, ClassUnionMember1>> {
    return this.classUnionMember1Sync(identifier);
  }

  classUnionMember1Sync(
    identifier: ClassUnionMember1.$Identifier,
  ): purify.Either<Error, ClassUnionMember1> {
    return this.classUnionMember1sSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async classUnionMember1Identifiers(
    query?: $ObjectSet.Query<ClassUnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnionMember1.$Identifier[]>> {
    return this.classUnionMember1IdentifiersSync(query);
  }

  classUnionMember1IdentifiersSync(
    query?: $ObjectSet.Query<ClassUnionMember1.$Identifier>,
  ): purify.Either<Error, readonly ClassUnionMember1.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ClassUnionMember1,
        ClassUnionMember1.$Identifier
      >(ClassUnionMember1, query),
    ]);
  }

  async classUnionMember1s(
    query?: $ObjectSet.Query<ClassUnionMember1.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnionMember1>[]> {
    return this.classUnionMember1sSync(query);
  }

  classUnionMember1sSync(
    query?: $ObjectSet.Query<ClassUnionMember1.$Identifier>,
  ): readonly purify.Either<Error, ClassUnionMember1>[] {
    return [
      ...this.$objectsSync<ClassUnionMember1, ClassUnionMember1.$Identifier>(
        ClassUnionMember1,
        query,
      ),
    ];
  }

  async classUnionMember1sCount(
    query?: Pick<$ObjectSet.Query<ClassUnionMember1.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.classUnionMember1sCountSync(query);
  }

  classUnionMember1sCountSync(
    query?: Pick<$ObjectSet.Query<ClassUnionMember1.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ClassUnionMember1,
      ClassUnionMember1.$Identifier
    >(ClassUnionMember1, query);
  }

  async classUnionMember2(
    identifier: ClassUnionMember2.$Identifier,
  ): Promise<purify.Either<Error, ClassUnionMember2>> {
    return this.classUnionMember2Sync(identifier);
  }

  classUnionMember2Sync(
    identifier: ClassUnionMember2.$Identifier,
  ): purify.Either<Error, ClassUnionMember2> {
    return this.classUnionMember2sSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async classUnionMember2Identifiers(
    query?: $ObjectSet.Query<ClassUnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnionMember2.$Identifier[]>> {
    return this.classUnionMember2IdentifiersSync(query);
  }

  classUnionMember2IdentifiersSync(
    query?: $ObjectSet.Query<ClassUnionMember2.$Identifier>,
  ): purify.Either<Error, readonly ClassUnionMember2.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ClassUnionMember2,
        ClassUnionMember2.$Identifier
      >(ClassUnionMember2, query),
    ]);
  }

  async classUnionMember2s(
    query?: $ObjectSet.Query<ClassUnionMember2.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnionMember2>[]> {
    return this.classUnionMember2sSync(query);
  }

  classUnionMember2sSync(
    query?: $ObjectSet.Query<ClassUnionMember2.$Identifier>,
  ): readonly purify.Either<Error, ClassUnionMember2>[] {
    return [
      ...this.$objectsSync<ClassUnionMember2, ClassUnionMember2.$Identifier>(
        ClassUnionMember2,
        query,
      ),
    ];
  }

  async classUnionMember2sCount(
    query?: Pick<$ObjectSet.Query<ClassUnionMember2.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.classUnionMember2sCountSync(query);
  }

  classUnionMember2sCountSync(
    query?: Pick<$ObjectSet.Query<ClassUnionMember2.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ClassUnionMember2,
      ClassUnionMember2.$Identifier
    >(ClassUnionMember2, query);
  }

  async concreteChildClass(
    identifier: ConcreteChildClass.$Identifier,
  ): Promise<purify.Either<Error, ConcreteChildClass>> {
    return this.concreteChildClassSync(identifier);
  }

  concreteChildClassSync(
    identifier: ConcreteChildClass.$Identifier,
  ): purify.Either<Error, ConcreteChildClass> {
    return this.concreteChildClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async concreteChildClassIdentifiers(
    query?: $ObjectSet.Query<ConcreteChildClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly ConcreteChildClass.$Identifier[]>> {
    return this.concreteChildClassIdentifiersSync(query);
  }

  concreteChildClassIdentifiersSync(
    query?: $ObjectSet.Query<ConcreteChildClass.$Identifier>,
  ): purify.Either<Error, readonly ConcreteChildClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ConcreteChildClass,
        ConcreteChildClass.$Identifier
      >(ConcreteChildClass, query),
    ]);
  }

  async concreteChildClasses(
    query?: $ObjectSet.Query<ConcreteChildClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteChildClass>[]> {
    return this.concreteChildClassesSync(query);
  }

  concreteChildClassesSync(
    query?: $ObjectSet.Query<ConcreteChildClass.$Identifier>,
  ): readonly purify.Either<Error, ConcreteChildClass>[] {
    return [
      ...this.$objectsSync<ConcreteChildClass, ConcreteChildClass.$Identifier>(
        ConcreteChildClass,
        query,
      ),
    ];
  }

  async concreteChildClassesCount(
    query?: Pick<$ObjectSet.Query<ConcreteChildClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.concreteChildClassesCountSync(query);
  }

  concreteChildClassesCountSync(
    query?: Pick<$ObjectSet.Query<ConcreteChildClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ConcreteChildClass,
      ConcreteChildClass.$Identifier
    >(ConcreteChildClass, query);
  }

  async concreteChildInterface(
    identifier: ConcreteChildInterface.$Identifier,
  ): Promise<purify.Either<Error, ConcreteChildInterface>> {
    return this.concreteChildInterfaceSync(identifier);
  }

  concreteChildInterfaceSync(
    identifier: ConcreteChildInterface.$Identifier,
  ): purify.Either<Error, ConcreteChildInterface> {
    return this.concreteChildInterfacesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async concreteChildInterfaceIdentifiers(
    query?: $ObjectSet.Query<ConcreteChildInterface.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteChildInterface.$Identifier[]>
  > {
    return this.concreteChildInterfaceIdentifiersSync(query);
  }

  concreteChildInterfaceIdentifiersSync(
    query?: $ObjectSet.Query<ConcreteChildInterface.$Identifier>,
  ): purify.Either<Error, readonly ConcreteChildInterface.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ConcreteChildInterface,
        ConcreteChildInterface.$Identifier
      >(ConcreteChildInterface, query),
    ]);
  }

  async concreteChildInterfaces(
    query?: $ObjectSet.Query<ConcreteChildInterface.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteChildInterface>[]> {
    return this.concreteChildInterfacesSync(query);
  }

  concreteChildInterfacesSync(
    query?: $ObjectSet.Query<ConcreteChildInterface.$Identifier>,
  ): readonly purify.Either<Error, ConcreteChildInterface>[] {
    return [
      ...this.$objectsSync<
        ConcreteChildInterface,
        ConcreteChildInterface.$Identifier
      >(ConcreteChildInterface, query),
    ];
  }

  async concreteChildInterfacesCount(
    query?: Pick<$ObjectSet.Query<ConcreteChildInterface.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.concreteChildInterfacesCountSync(query);
  }

  concreteChildInterfacesCountSync(
    query?: Pick<$ObjectSet.Query<ConcreteChildInterface.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ConcreteChildInterface,
      ConcreteChildInterface.$Identifier
    >(ConcreteChildInterface, query);
  }

  async concreteParentClass(
    identifier: ConcreteParentClassStatic.$Identifier,
  ): Promise<purify.Either<Error, ConcreteParentClass>> {
    return this.concreteParentClassSync(identifier);
  }

  concreteParentClassSync(
    identifier: ConcreteParentClassStatic.$Identifier,
  ): purify.Either<Error, ConcreteParentClass> {
    return this.concreteParentClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async concreteParentClassIdentifiers(
    query?: $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteParentClassStatic.$Identifier[]>
  > {
    return this.concreteParentClassIdentifiersSync(query);
  }

  concreteParentClassIdentifiersSync(
    query?: $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
  ): purify.Either<Error, readonly ConcreteParentClassStatic.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ConcreteParentClass,
        ConcreteParentClassStatic.$Identifier
      >(ConcreteParentClassStatic, query),
    ]);
  }

  async concreteParentClasses(
    query?: $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteParentClass>[]> {
    return this.concreteParentClassesSync(query);
  }

  concreteParentClassesSync(
    query?: $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
  ): readonly purify.Either<Error, ConcreteParentClass>[] {
    return [
      ...this.$objectsSync<
        ConcreteParentClass,
        ConcreteParentClassStatic.$Identifier
      >(ConcreteParentClassStatic, query),
    ];
  }

  async concreteParentClassesCount(
    query?: Pick<
      $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.concreteParentClassesCountSync(query);
  }

  concreteParentClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ConcreteParentClass,
      ConcreteParentClassStatic.$Identifier
    >(ConcreteParentClassStatic, query);
  }

  async concreteParentInterface(
    identifier: ConcreteParentInterfaceStatic.$Identifier,
  ): Promise<purify.Either<Error, ConcreteParentInterface>> {
    return this.concreteParentInterfaceSync(identifier);
  }

  concreteParentInterfaceSync(
    identifier: ConcreteParentInterfaceStatic.$Identifier,
  ): purify.Either<Error, ConcreteParentInterface> {
    return this.concreteParentInterfacesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async concreteParentInterfaceIdentifiers(
    query?: $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteParentInterfaceStatic.$Identifier[]>
  > {
    return this.concreteParentInterfaceIdentifiersSync(query);
  }

  concreteParentInterfaceIdentifiersSync(
    query?: $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
  ): purify.Either<
    Error,
    readonly ConcreteParentInterfaceStatic.$Identifier[]
  > {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ConcreteParentInterface,
        ConcreteParentInterfaceStatic.$Identifier
      >(ConcreteParentInterfaceStatic, query),
    ]);
  }

  async concreteParentInterfaces(
    query?: $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteParentInterface>[]> {
    return this.concreteParentInterfacesSync(query);
  }

  concreteParentInterfacesSync(
    query?: $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
  ): readonly purify.Either<Error, ConcreteParentInterface>[] {
    return [
      ...this.$objectsSync<
        ConcreteParentInterface,
        ConcreteParentInterfaceStatic.$Identifier
      >(ConcreteParentInterfaceStatic, query),
    ];
  }

  async concreteParentInterfacesCount(
    query?: Pick<
      $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.concreteParentInterfacesCountSync(query);
  }

  concreteParentInterfacesCountSync(
    query?: Pick<
      $ObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ConcreteParentInterface,
      ConcreteParentInterfaceStatic.$Identifier
    >(ConcreteParentInterfaceStatic, query);
  }

  async defaultValuePropertiesClass(
    identifier: DefaultValuePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, DefaultValuePropertiesClass>> {
    return this.defaultValuePropertiesClassSync(identifier);
  }

  defaultValuePropertiesClassSync(
    identifier: DefaultValuePropertiesClass.$Identifier,
  ): purify.Either<Error, DefaultValuePropertiesClass> {
    return this.defaultValuePropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async defaultValuePropertiesClassIdentifiers(
    query?: $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly DefaultValuePropertiesClass.$Identifier[]>
  > {
    return this.defaultValuePropertiesClassIdentifiersSync(query);
  }

  defaultValuePropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly DefaultValuePropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        DefaultValuePropertiesClass,
        DefaultValuePropertiesClass.$Identifier
      >({ ...DefaultValuePropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async defaultValuePropertiesClasses(
    query?: $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, DefaultValuePropertiesClass>[]> {
    return this.defaultValuePropertiesClassesSync(query);
  }

  defaultValuePropertiesClassesSync(
    query?: $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, DefaultValuePropertiesClass>[] {
    return [
      ...this.$objectsSync<
        DefaultValuePropertiesClass,
        DefaultValuePropertiesClass.$Identifier
      >({ ...DefaultValuePropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async defaultValuePropertiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.defaultValuePropertiesClassesCountSync(query);
  }

  defaultValuePropertiesClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      DefaultValuePropertiesClass,
      DefaultValuePropertiesClass.$Identifier
    >({ ...DefaultValuePropertiesClass, $fromRdfType: undefined }, query);
  }

  async explicitFromToRdfTypesClass(
    identifier: ExplicitFromToRdfTypesClass.$Identifier,
  ): Promise<purify.Either<Error, ExplicitFromToRdfTypesClass>> {
    return this.explicitFromToRdfTypesClassSync(identifier);
  }

  explicitFromToRdfTypesClassSync(
    identifier: ExplicitFromToRdfTypesClass.$Identifier,
  ): purify.Either<Error, ExplicitFromToRdfTypesClass> {
    return this.explicitFromToRdfTypesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async explicitFromToRdfTypesClassIdentifiers(
    query?: $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ExplicitFromToRdfTypesClass.$Identifier[]>
  > {
    return this.explicitFromToRdfTypesClassIdentifiersSync(query);
  }

  explicitFromToRdfTypesClassIdentifiersSync(
    query?: $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
  ): purify.Either<Error, readonly ExplicitFromToRdfTypesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ExplicitFromToRdfTypesClass,
        ExplicitFromToRdfTypesClass.$Identifier
      >(ExplicitFromToRdfTypesClass, query),
    ]);
  }

  async explicitFromToRdfTypesClasses(
    query?: $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExplicitFromToRdfTypesClass>[]> {
    return this.explicitFromToRdfTypesClassesSync(query);
  }

  explicitFromToRdfTypesClassesSync(
    query?: $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
  ): readonly purify.Either<Error, ExplicitFromToRdfTypesClass>[] {
    return [
      ...this.$objectsSync<
        ExplicitFromToRdfTypesClass,
        ExplicitFromToRdfTypesClass.$Identifier
      >(ExplicitFromToRdfTypesClass, query),
    ];
  }

  async explicitFromToRdfTypesClassesCount(
    query?: Pick<
      $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.explicitFromToRdfTypesClassesCountSync(query);
  }

  explicitFromToRdfTypesClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ExplicitFromToRdfTypesClass,
      ExplicitFromToRdfTypesClass.$Identifier
    >(ExplicitFromToRdfTypesClass, query);
  }

  async explicitRdfTypeClass(
    identifier: ExplicitRdfTypeClass.$Identifier,
  ): Promise<purify.Either<Error, ExplicitRdfTypeClass>> {
    return this.explicitRdfTypeClassSync(identifier);
  }

  explicitRdfTypeClassSync(
    identifier: ExplicitRdfTypeClass.$Identifier,
  ): purify.Either<Error, ExplicitRdfTypeClass> {
    return this.explicitRdfTypeClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async explicitRdfTypeClassIdentifiers(
    query?: $ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ExplicitRdfTypeClass.$Identifier[]>
  > {
    return this.explicitRdfTypeClassIdentifiersSync(query);
  }

  explicitRdfTypeClassIdentifiersSync(
    query?: $ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
  ): purify.Either<Error, readonly ExplicitRdfTypeClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ExplicitRdfTypeClass,
        ExplicitRdfTypeClass.$Identifier
      >(ExplicitRdfTypeClass, query),
    ]);
  }

  async explicitRdfTypeClasses(
    query?: $ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExplicitRdfTypeClass>[]> {
    return this.explicitRdfTypeClassesSync(query);
  }

  explicitRdfTypeClassesSync(
    query?: $ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
  ): readonly purify.Either<Error, ExplicitRdfTypeClass>[] {
    return [
      ...this.$objectsSync<
        ExplicitRdfTypeClass,
        ExplicitRdfTypeClass.$Identifier
      >(ExplicitRdfTypeClass, query),
    ];
  }

  async explicitRdfTypeClassesCount(
    query?: Pick<$ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.explicitRdfTypeClassesCountSync(query);
  }

  explicitRdfTypeClassesCountSync(
    query?: Pick<$ObjectSet.Query<ExplicitRdfTypeClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ExplicitRdfTypeClass,
      ExplicitRdfTypeClass.$Identifier
    >(ExplicitRdfTypeClass, query);
  }

  async externPropertiesClass(
    identifier: ExternPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesClass>> {
    return this.externPropertiesClassSync(identifier);
  }

  externPropertiesClassSync(
    identifier: ExternPropertiesClass.$Identifier,
  ): purify.Either<Error, ExternPropertiesClass> {
    return this.externPropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async externPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<ExternPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ExternPropertiesClass.$Identifier[]>
  > {
    return this.externPropertiesClassIdentifiersSync(query);
  }

  externPropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<ExternPropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly ExternPropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ExternPropertiesClass,
        ExternPropertiesClass.$Identifier
      >({ ...ExternPropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async externPropertiesClasses(
    query?: $ObjectSet.Query<ExternPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExternPropertiesClass>[]> {
    return this.externPropertiesClassesSync(query);
  }

  externPropertiesClassesSync(
    query?: $ObjectSet.Query<ExternPropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, ExternPropertiesClass>[] {
    return [
      ...this.$objectsSync<
        ExternPropertiesClass,
        ExternPropertiesClass.$Identifier
      >({ ...ExternPropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async externPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<ExternPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.externPropertiesClassesCountSync(query);
  }

  externPropertiesClassesCountSync(
    query?: Pick<$ObjectSet.Query<ExternPropertiesClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ExternPropertiesClass,
      ExternPropertiesClass.$Identifier
    >({ ...ExternPropertiesClass, $fromRdfType: undefined }, query);
  }

  async externPropertiesExternNestedClass(
    identifier: ExternPropertiesExternNestedClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesExternNestedClass>> {
    return this.externPropertiesExternNestedClassSync(identifier);
  }

  externPropertiesExternNestedClassSync(
    identifier: ExternPropertiesExternNestedClass.$Identifier,
  ): purify.Either<Error, ExternPropertiesExternNestedClass> {
    return this.externPropertiesExternNestedClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async externPropertiesExternNestedClassIdentifiers(
    query?: $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly ExternPropertiesExternNestedClass.$Identifier[]
    >
  > {
    return this.externPropertiesExternNestedClassIdentifiersSync(query);
  }

  externPropertiesExternNestedClassIdentifiersSync(
    query?: $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
  ): purify.Either<
    Error,
    readonly ExternPropertiesExternNestedClass.$Identifier[]
  > {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ExternPropertiesExternNestedClass,
        ExternPropertiesExternNestedClass.$Identifier
      >(
        { ...ExternPropertiesExternNestedClass, $fromRdfType: undefined },
        query,
      ),
    ]);
  }

  async externPropertiesExternNestedClasses(
    query?: $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
  ): Promise<
    readonly purify.Either<Error, ExternPropertiesExternNestedClass>[]
  > {
    return this.externPropertiesExternNestedClassesSync(query);
  }

  externPropertiesExternNestedClassesSync(
    query?: $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
  ): readonly purify.Either<Error, ExternPropertiesExternNestedClass>[] {
    return [
      ...this.$objectsSync<
        ExternPropertiesExternNestedClass,
        ExternPropertiesExternNestedClass.$Identifier
      >(
        { ...ExternPropertiesExternNestedClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async externPropertiesExternNestedClassesCount(
    query?: Pick<
      $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.externPropertiesExternNestedClassesCountSync(query);
  }

  externPropertiesExternNestedClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ExternPropertiesExternNestedClass,
      ExternPropertiesExternNestedClass.$Identifier
    >({ ...ExternPropertiesExternNestedClass, $fromRdfType: undefined }, query);
  }

  async externPropertiesInlineNestedClass(
    identifier: ExternPropertiesInlineNestedClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesInlineNestedClass>> {
    return this.externPropertiesInlineNestedClassSync(identifier);
  }

  externPropertiesInlineNestedClassSync(
    identifier: ExternPropertiesInlineNestedClass.$Identifier,
  ): purify.Either<Error, ExternPropertiesInlineNestedClass> {
    return this.externPropertiesInlineNestedClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async externPropertiesInlineNestedClassIdentifiers(
    query?: $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly ExternPropertiesInlineNestedClass.$Identifier[]
    >
  > {
    return this.externPropertiesInlineNestedClassIdentifiersSync(query);
  }

  externPropertiesInlineNestedClassIdentifiersSync(
    query?: $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
  ): purify.Either<
    Error,
    readonly ExternPropertiesInlineNestedClass.$Identifier[]
  > {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ExternPropertiesInlineNestedClass,
        ExternPropertiesInlineNestedClass.$Identifier
      >(
        { ...ExternPropertiesInlineNestedClass, $fromRdfType: undefined },
        query,
      ),
    ]);
  }

  async externPropertiesInlineNestedClasses(
    query?: $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
  ): Promise<
    readonly purify.Either<Error, ExternPropertiesInlineNestedClass>[]
  > {
    return this.externPropertiesInlineNestedClassesSync(query);
  }

  externPropertiesInlineNestedClassesSync(
    query?: $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
  ): readonly purify.Either<Error, ExternPropertiesInlineNestedClass>[] {
    return [
      ...this.$objectsSync<
        ExternPropertiesInlineNestedClass,
        ExternPropertiesInlineNestedClass.$Identifier
      >(
        { ...ExternPropertiesInlineNestedClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async externPropertiesInlineNestedClassesCount(
    query?: Pick<
      $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.externPropertiesInlineNestedClassesCountSync(query);
  }

  externPropertiesInlineNestedClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ExternPropertiesInlineNestedClass,
      ExternPropertiesInlineNestedClass.$Identifier
    >({ ...ExternPropertiesInlineNestedClass, $fromRdfType: undefined }, query);
  }

  async hasValuePropertiesClass(
    identifier: HasValuePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, HasValuePropertiesClass>> {
    return this.hasValuePropertiesClassSync(identifier);
  }

  hasValuePropertiesClassSync(
    identifier: HasValuePropertiesClass.$Identifier,
  ): purify.Either<Error, HasValuePropertiesClass> {
    return this.hasValuePropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async hasValuePropertiesClassIdentifiers(
    query?: $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly HasValuePropertiesClass.$Identifier[]>
  > {
    return this.hasValuePropertiesClassIdentifiersSync(query);
  }

  hasValuePropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly HasValuePropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        HasValuePropertiesClass,
        HasValuePropertiesClass.$Identifier
      >({ ...HasValuePropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async hasValuePropertiesClasses(
    query?: $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, HasValuePropertiesClass>[]> {
    return this.hasValuePropertiesClassesSync(query);
  }

  hasValuePropertiesClassesSync(
    query?: $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, HasValuePropertiesClass>[] {
    return [
      ...this.$objectsSync<
        HasValuePropertiesClass,
        HasValuePropertiesClass.$Identifier
      >({ ...HasValuePropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async hasValuePropertiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.hasValuePropertiesClassesCountSync(query);
  }

  hasValuePropertiesClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<HasValuePropertiesClass.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      HasValuePropertiesClass,
      HasValuePropertiesClass.$Identifier
    >({ ...HasValuePropertiesClass, $fromRdfType: undefined }, query);
  }

  async inIdentifierClass(
    identifier: InIdentifierClass.$Identifier,
  ): Promise<purify.Either<Error, InIdentifierClass>> {
    return this.inIdentifierClassSync(identifier);
  }

  inIdentifierClassSync(
    identifier: InIdentifierClass.$Identifier,
  ): purify.Either<Error, InIdentifierClass> {
    return this.inIdentifierClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async inIdentifierClassIdentifiers(
    query?: $ObjectSet.Query<InIdentifierClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly InIdentifierClass.$Identifier[]>> {
    return this.inIdentifierClassIdentifiersSync(query);
  }

  inIdentifierClassIdentifiersSync(
    query?: $ObjectSet.Query<InIdentifierClass.$Identifier>,
  ): purify.Either<Error, readonly InIdentifierClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        InIdentifierClass,
        InIdentifierClass.$Identifier
      >({ ...InIdentifierClass, $fromRdfType: undefined }, query),
    ]);
  }

  async inIdentifierClasses(
    query?: $ObjectSet.Query<InIdentifierClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, InIdentifierClass>[]> {
    return this.inIdentifierClassesSync(query);
  }

  inIdentifierClassesSync(
    query?: $ObjectSet.Query<InIdentifierClass.$Identifier>,
  ): readonly purify.Either<Error, InIdentifierClass>[] {
    return [
      ...this.$objectsSync<InIdentifierClass, InIdentifierClass.$Identifier>(
        { ...InIdentifierClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async inIdentifierClassesCount(
    query?: Pick<$ObjectSet.Query<InIdentifierClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.inIdentifierClassesCountSync(query);
  }

  inIdentifierClassesCountSync(
    query?: Pick<$ObjectSet.Query<InIdentifierClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      InIdentifierClass,
      InIdentifierClass.$Identifier
    >({ ...InIdentifierClass, $fromRdfType: undefined }, query);
  }

  async inPropertiesClass(
    identifier: InPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, InPropertiesClass>> {
    return this.inPropertiesClassSync(identifier);
  }

  inPropertiesClassSync(
    identifier: InPropertiesClass.$Identifier,
  ): purify.Either<Error, InPropertiesClass> {
    return this.inPropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async inPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<InPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly InPropertiesClass.$Identifier[]>> {
    return this.inPropertiesClassIdentifiersSync(query);
  }

  inPropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<InPropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly InPropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        InPropertiesClass,
        InPropertiesClass.$Identifier
      >({ ...InPropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async inPropertiesClasses(
    query?: $ObjectSet.Query<InPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, InPropertiesClass>[]> {
    return this.inPropertiesClassesSync(query);
  }

  inPropertiesClassesSync(
    query?: $ObjectSet.Query<InPropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, InPropertiesClass>[] {
    return [
      ...this.$objectsSync<InPropertiesClass, InPropertiesClass.$Identifier>(
        { ...InPropertiesClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async inPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<InPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.inPropertiesClassesCountSync(query);
  }

  inPropertiesClassesCountSync(
    query?: Pick<$ObjectSet.Query<InPropertiesClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      InPropertiesClass,
      InPropertiesClass.$Identifier
    >({ ...InPropertiesClass, $fromRdfType: undefined }, query);
  }

  async interface(
    identifier: Interface.$Identifier,
  ): Promise<purify.Either<Error, Interface>> {
    return this.interfaceSync(identifier);
  }

  interfaceSync(
    identifier: Interface.$Identifier,
  ): purify.Either<Error, Interface> {
    return this.interfacesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async interfaceIdentifiers(
    query?: $ObjectSet.Query<Interface.$Identifier>,
  ): Promise<purify.Either<Error, readonly Interface.$Identifier[]>> {
    return this.interfaceIdentifiersSync(query);
  }

  interfaceIdentifiersSync(
    query?: $ObjectSet.Query<Interface.$Identifier>,
  ): purify.Either<Error, readonly Interface.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<Interface, Interface.$Identifier>(
        { ...Interface, $fromRdfType: undefined },
        query,
      ),
    ]);
  }

  async interfaces(
    query?: $ObjectSet.Query<Interface.$Identifier>,
  ): Promise<readonly purify.Either<Error, Interface>[]> {
    return this.interfacesSync(query);
  }

  interfacesSync(
    query?: $ObjectSet.Query<Interface.$Identifier>,
  ): readonly purify.Either<Error, Interface>[] {
    return [
      ...this.$objectsSync<Interface, Interface.$Identifier>(
        { ...Interface, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async interfacesCount(
    query?: Pick<$ObjectSet.Query<Interface.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.interfacesCountSync(query);
  }

  interfacesCountSync(
    query?: Pick<$ObjectSet.Query<Interface.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<Interface, Interface.$Identifier>(
      { ...Interface, $fromRdfType: undefined },
      query,
    );
  }

  async interfaceUnionMember1(
    identifier: InterfaceUnionMember1.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember1>> {
    return this.interfaceUnionMember1Sync(identifier);
  }

  interfaceUnionMember1Sync(
    identifier: InterfaceUnionMember1.$Identifier,
  ): purify.Either<Error, InterfaceUnionMember1> {
    return this.interfaceUnionMember1sSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async interfaceUnionMember1Identifiers(
    query?: $ObjectSet.Query<InterfaceUnionMember1.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember1.$Identifier[]>
  > {
    return this.interfaceUnionMember1IdentifiersSync(query);
  }

  interfaceUnionMember1IdentifiersSync(
    query?: $ObjectSet.Query<InterfaceUnionMember1.$Identifier>,
  ): purify.Either<Error, readonly InterfaceUnionMember1.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        InterfaceUnionMember1,
        InterfaceUnionMember1.$Identifier
      >({ ...InterfaceUnionMember1, $fromRdfType: undefined }, query),
    ]);
  }

  async interfaceUnionMember1s(
    query?: $ObjectSet.Query<InterfaceUnionMember1.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember1>[]> {
    return this.interfaceUnionMember1sSync(query);
  }

  interfaceUnionMember1sSync(
    query?: $ObjectSet.Query<InterfaceUnionMember1.$Identifier>,
  ): readonly purify.Either<Error, InterfaceUnionMember1>[] {
    return [
      ...this.$objectsSync<
        InterfaceUnionMember1,
        InterfaceUnionMember1.$Identifier
      >({ ...InterfaceUnionMember1, $fromRdfType: undefined }, query),
    ];
  }

  async interfaceUnionMember1sCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember1.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.interfaceUnionMember1sCountSync(query);
  }

  interfaceUnionMember1sCountSync(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember1.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      InterfaceUnionMember1,
      InterfaceUnionMember1.$Identifier
    >({ ...InterfaceUnionMember1, $fromRdfType: undefined }, query);
  }

  async interfaceUnionMember2a(
    identifier: InterfaceUnionMember2a.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2a>> {
    return this.interfaceUnionMember2aSync(identifier);
  }

  interfaceUnionMember2aSync(
    identifier: InterfaceUnionMember2a.$Identifier,
  ): purify.Either<Error, InterfaceUnionMember2a> {
    return this.interfaceUnionMember2asSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async interfaceUnionMember2aIdentifiers(
    query?: $ObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2a.$Identifier[]>
  > {
    return this.interfaceUnionMember2aIdentifiersSync(query);
  }

  interfaceUnionMember2aIdentifiersSync(
    query?: $ObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
  ): purify.Either<Error, readonly InterfaceUnionMember2a.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        InterfaceUnionMember2a,
        InterfaceUnionMember2a.$Identifier
      >({ ...InterfaceUnionMember2a, $fromRdfType: undefined }, query),
    ]);
  }

  async interfaceUnionMember2as(
    query?: $ObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2a>[]> {
    return this.interfaceUnionMember2asSync(query);
  }

  interfaceUnionMember2asSync(
    query?: $ObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
  ): readonly purify.Either<Error, InterfaceUnionMember2a>[] {
    return [
      ...this.$objectsSync<
        InterfaceUnionMember2a,
        InterfaceUnionMember2a.$Identifier
      >({ ...InterfaceUnionMember2a, $fromRdfType: undefined }, query),
    ];
  }

  async interfaceUnionMember2asCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2a.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.interfaceUnionMember2asCountSync(query);
  }

  interfaceUnionMember2asCountSync(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2a.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      InterfaceUnionMember2a,
      InterfaceUnionMember2a.$Identifier
    >({ ...InterfaceUnionMember2a, $fromRdfType: undefined }, query);
  }

  async interfaceUnionMember2b(
    identifier: InterfaceUnionMember2b.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2b>> {
    return this.interfaceUnionMember2bSync(identifier);
  }

  interfaceUnionMember2bSync(
    identifier: InterfaceUnionMember2b.$Identifier,
  ): purify.Either<Error, InterfaceUnionMember2b> {
    return this.interfaceUnionMember2bsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async interfaceUnionMember2bIdentifiers(
    query?: $ObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2b.$Identifier[]>
  > {
    return this.interfaceUnionMember2bIdentifiersSync(query);
  }

  interfaceUnionMember2bIdentifiersSync(
    query?: $ObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
  ): purify.Either<Error, readonly InterfaceUnionMember2b.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        InterfaceUnionMember2b,
        InterfaceUnionMember2b.$Identifier
      >({ ...InterfaceUnionMember2b, $fromRdfType: undefined }, query),
    ]);
  }

  async interfaceUnionMember2bs(
    query?: $ObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2b>[]> {
    return this.interfaceUnionMember2bsSync(query);
  }

  interfaceUnionMember2bsSync(
    query?: $ObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
  ): readonly purify.Either<Error, InterfaceUnionMember2b>[] {
    return [
      ...this.$objectsSync<
        InterfaceUnionMember2b,
        InterfaceUnionMember2b.$Identifier
      >({ ...InterfaceUnionMember2b, $fromRdfType: undefined }, query),
    ];
  }

  async interfaceUnionMember2bsCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2b.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.interfaceUnionMember2bsCountSync(query);
  }

  interfaceUnionMember2bsCountSync(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2b.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      InterfaceUnionMember2b,
      InterfaceUnionMember2b.$Identifier
    >({ ...InterfaceUnionMember2b, $fromRdfType: undefined }, query);
  }

  async iriClass(
    identifier: IriClass.$Identifier,
  ): Promise<purify.Either<Error, IriClass>> {
    return this.iriClassSync(identifier);
  }

  iriClassSync(
    identifier: IriClass.$Identifier,
  ): purify.Either<Error, IriClass> {
    return this.iriClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async iriClassIdentifiers(
    query?: $ObjectSet.Query<IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly IriClass.$Identifier[]>> {
    return this.iriClassIdentifiersSync(query);
  }

  iriClassIdentifiersSync(
    query?: $ObjectSet.Query<IriClass.$Identifier>,
  ): purify.Either<Error, readonly IriClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<IriClass, IriClass.$Identifier>(
        { ...IriClass, $fromRdfType: undefined },
        query,
      ),
    ]);
  }

  async iriClasses(
    query?: $ObjectSet.Query<IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, IriClass>[]> {
    return this.iriClassesSync(query);
  }

  iriClassesSync(
    query?: $ObjectSet.Query<IriClass.$Identifier>,
  ): readonly purify.Either<Error, IriClass>[] {
    return [
      ...this.$objectsSync<IriClass, IriClass.$Identifier>(
        { ...IriClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async iriClassesCount(
    query?: Pick<$ObjectSet.Query<IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.iriClassesCountSync(query);
  }

  iriClassesCountSync(
    query?: Pick<$ObjectSet.Query<IriClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<IriClass, IriClass.$Identifier>(
      { ...IriClass, $fromRdfType: undefined },
      query,
    );
  }

  async languageInPropertiesClass(
    identifier: LanguageInPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, LanguageInPropertiesClass>> {
    return this.languageInPropertiesClassSync(identifier);
  }

  languageInPropertiesClassSync(
    identifier: LanguageInPropertiesClass.$Identifier,
  ): purify.Either<Error, LanguageInPropertiesClass> {
    return this.languageInPropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async languageInPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly LanguageInPropertiesClass.$Identifier[]>
  > {
    return this.languageInPropertiesClassIdentifiersSync(query);
  }

  languageInPropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly LanguageInPropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        LanguageInPropertiesClass,
        LanguageInPropertiesClass.$Identifier
      >({ ...LanguageInPropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async languageInPropertiesClasses(
    query?: $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, LanguageInPropertiesClass>[]> {
    return this.languageInPropertiesClassesSync(query);
  }

  languageInPropertiesClassesSync(
    query?: $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, LanguageInPropertiesClass>[] {
    return [
      ...this.$objectsSync<
        LanguageInPropertiesClass,
        LanguageInPropertiesClass.$Identifier
      >({ ...LanguageInPropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async languageInPropertiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.languageInPropertiesClassesCountSync(query);
  }

  languageInPropertiesClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      LanguageInPropertiesClass,
      LanguageInPropertiesClass.$Identifier
    >({ ...LanguageInPropertiesClass, $fromRdfType: undefined }, query);
  }

  async listPropertiesClass(
    identifier: ListPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, ListPropertiesClass>> {
    return this.listPropertiesClassSync(identifier);
  }

  listPropertiesClassSync(
    identifier: ListPropertiesClass.$Identifier,
  ): purify.Either<Error, ListPropertiesClass> {
    return this.listPropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async listPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<ListPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly ListPropertiesClass.$Identifier[]>> {
    return this.listPropertiesClassIdentifiersSync(query);
  }

  listPropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<ListPropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly ListPropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ListPropertiesClass,
        ListPropertiesClass.$Identifier
      >({ ...ListPropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async listPropertiesClasses(
    query?: $ObjectSet.Query<ListPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ListPropertiesClass>[]> {
    return this.listPropertiesClassesSync(query);
  }

  listPropertiesClassesSync(
    query?: $ObjectSet.Query<ListPropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, ListPropertiesClass>[] {
    return [
      ...this.$objectsSync<
        ListPropertiesClass,
        ListPropertiesClass.$Identifier
      >({ ...ListPropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async listPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<ListPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.listPropertiesClassesCountSync(query);
  }

  listPropertiesClassesCountSync(
    query?: Pick<$ObjectSet.Query<ListPropertiesClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ListPropertiesClass,
      ListPropertiesClass.$Identifier
    >({ ...ListPropertiesClass, $fromRdfType: undefined }, query);
  }

  async mutablePropertiesClass(
    identifier: MutablePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, MutablePropertiesClass>> {
    return this.mutablePropertiesClassSync(identifier);
  }

  mutablePropertiesClassSync(
    identifier: MutablePropertiesClass.$Identifier,
  ): purify.Either<Error, MutablePropertiesClass> {
    return this.mutablePropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async mutablePropertiesClassIdentifiers(
    query?: $ObjectSet.Query<MutablePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly MutablePropertiesClass.$Identifier[]>
  > {
    return this.mutablePropertiesClassIdentifiersSync(query);
  }

  mutablePropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<MutablePropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly MutablePropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        MutablePropertiesClass,
        MutablePropertiesClass.$Identifier
      >({ ...MutablePropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async mutablePropertiesClasses(
    query?: $ObjectSet.Query<MutablePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, MutablePropertiesClass>[]> {
    return this.mutablePropertiesClassesSync(query);
  }

  mutablePropertiesClassesSync(
    query?: $ObjectSet.Query<MutablePropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, MutablePropertiesClass>[] {
    return [
      ...this.$objectsSync<
        MutablePropertiesClass,
        MutablePropertiesClass.$Identifier
      >({ ...MutablePropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async mutablePropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<MutablePropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.mutablePropertiesClassesCountSync(query);
  }

  mutablePropertiesClassesCountSync(
    query?: Pick<$ObjectSet.Query<MutablePropertiesClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      MutablePropertiesClass,
      MutablePropertiesClass.$Identifier
    >({ ...MutablePropertiesClass, $fromRdfType: undefined }, query);
  }

  async nonClass(
    identifier: NonClass.$Identifier,
  ): Promise<purify.Either<Error, NonClass>> {
    return this.nonClassSync(identifier);
  }

  nonClassSync(
    identifier: NonClass.$Identifier,
  ): purify.Either<Error, NonClass> {
    return this.nonClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async nonClassIdentifiers(
    query?: $ObjectSet.Query<NonClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly NonClass.$Identifier[]>> {
    return this.nonClassIdentifiersSync(query);
  }

  nonClassIdentifiersSync(
    query?: $ObjectSet.Query<NonClass.$Identifier>,
  ): purify.Either<Error, readonly NonClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<NonClass, NonClass.$Identifier>(
        { ...NonClass, $fromRdfType: undefined },
        query,
      ),
    ]);
  }

  async nonClasses(
    query?: $ObjectSet.Query<NonClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, NonClass>[]> {
    return this.nonClassesSync(query);
  }

  nonClassesSync(
    query?: $ObjectSet.Query<NonClass.$Identifier>,
  ): readonly purify.Either<Error, NonClass>[] {
    return [
      ...this.$objectsSync<NonClass, NonClass.$Identifier>(
        { ...NonClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async nonClassesCount(
    query?: Pick<$ObjectSet.Query<NonClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.nonClassesCountSync(query);
  }

  nonClassesCountSync(
    query?: Pick<$ObjectSet.Query<NonClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<NonClass, NonClass.$Identifier>(
      { ...NonClass, $fromRdfType: undefined },
      query,
    );
  }

  async orderedPropertiesClass(
    identifier: OrderedPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, OrderedPropertiesClass>> {
    return this.orderedPropertiesClassSync(identifier);
  }

  orderedPropertiesClassSync(
    identifier: OrderedPropertiesClass.$Identifier,
  ): purify.Either<Error, OrderedPropertiesClass> {
    return this.orderedPropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async orderedPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<OrderedPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly OrderedPropertiesClass.$Identifier[]>
  > {
    return this.orderedPropertiesClassIdentifiersSync(query);
  }

  orderedPropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<OrderedPropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly OrderedPropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        OrderedPropertiesClass,
        OrderedPropertiesClass.$Identifier
      >({ ...OrderedPropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async orderedPropertiesClasses(
    query?: $ObjectSet.Query<OrderedPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, OrderedPropertiesClass>[]> {
    return this.orderedPropertiesClassesSync(query);
  }

  orderedPropertiesClassesSync(
    query?: $ObjectSet.Query<OrderedPropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, OrderedPropertiesClass>[] {
    return [
      ...this.$objectsSync<
        OrderedPropertiesClass,
        OrderedPropertiesClass.$Identifier
      >({ ...OrderedPropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async orderedPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<OrderedPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.orderedPropertiesClassesCountSync(query);
  }

  orderedPropertiesClassesCountSync(
    query?: Pick<$ObjectSet.Query<OrderedPropertiesClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      OrderedPropertiesClass,
      OrderedPropertiesClass.$Identifier
    >({ ...OrderedPropertiesClass, $fromRdfType: undefined }, query);
  }

  async propertyCardinalitiesClass(
    identifier: PropertyCardinalitiesClass.$Identifier,
  ): Promise<purify.Either<Error, PropertyCardinalitiesClass>> {
    return this.propertyCardinalitiesClassSync(identifier);
  }

  propertyCardinalitiesClassSync(
    identifier: PropertyCardinalitiesClass.$Identifier,
  ): purify.Either<Error, PropertyCardinalitiesClass> {
    return this.propertyCardinalitiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async propertyCardinalitiesClassIdentifiers(
    query?: $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly PropertyCardinalitiesClass.$Identifier[]>
  > {
    return this.propertyCardinalitiesClassIdentifiersSync(query);
  }

  propertyCardinalitiesClassIdentifiersSync(
    query?: $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
  ): purify.Either<Error, readonly PropertyCardinalitiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        PropertyCardinalitiesClass,
        PropertyCardinalitiesClass.$Identifier
      >({ ...PropertyCardinalitiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async propertyCardinalitiesClasses(
    query?: $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, PropertyCardinalitiesClass>[]> {
    return this.propertyCardinalitiesClassesSync(query);
  }

  propertyCardinalitiesClassesSync(
    query?: $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
  ): readonly purify.Either<Error, PropertyCardinalitiesClass>[] {
    return [
      ...this.$objectsSync<
        PropertyCardinalitiesClass,
        PropertyCardinalitiesClass.$Identifier
      >({ ...PropertyCardinalitiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async propertyCardinalitiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.propertyCardinalitiesClassesCountSync(query);
  }

  propertyCardinalitiesClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      PropertyCardinalitiesClass,
      PropertyCardinalitiesClass.$Identifier
    >({ ...PropertyCardinalitiesClass, $fromRdfType: undefined }, query);
  }

  async propertyVisibilitiesClass(
    identifier: PropertyVisibilitiesClass.$Identifier,
  ): Promise<purify.Either<Error, PropertyVisibilitiesClass>> {
    return this.propertyVisibilitiesClassSync(identifier);
  }

  propertyVisibilitiesClassSync(
    identifier: PropertyVisibilitiesClass.$Identifier,
  ): purify.Either<Error, PropertyVisibilitiesClass> {
    return this.propertyVisibilitiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async propertyVisibilitiesClassIdentifiers(
    query?: $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly PropertyVisibilitiesClass.$Identifier[]>
  > {
    return this.propertyVisibilitiesClassIdentifiersSync(query);
  }

  propertyVisibilitiesClassIdentifiersSync(
    query?: $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
  ): purify.Either<Error, readonly PropertyVisibilitiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        PropertyVisibilitiesClass,
        PropertyVisibilitiesClass.$Identifier
      >({ ...PropertyVisibilitiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async propertyVisibilitiesClasses(
    query?: $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, PropertyVisibilitiesClass>[]> {
    return this.propertyVisibilitiesClassesSync(query);
  }

  propertyVisibilitiesClassesSync(
    query?: $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
  ): readonly purify.Either<Error, PropertyVisibilitiesClass>[] {
    return [
      ...this.$objectsSync<
        PropertyVisibilitiesClass,
        PropertyVisibilitiesClass.$Identifier
      >({ ...PropertyVisibilitiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async propertyVisibilitiesClassesCount(
    query?: Pick<
      $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.propertyVisibilitiesClassesCountSync(query);
  }

  propertyVisibilitiesClassesCountSync(
    query?: Pick<
      $ObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      PropertyVisibilitiesClass,
      PropertyVisibilitiesClass.$Identifier
    >({ ...PropertyVisibilitiesClass, $fromRdfType: undefined }, query);
  }

  async sha256IriClass(
    identifier: Sha256IriClass.$Identifier,
  ): Promise<purify.Either<Error, Sha256IriClass>> {
    return this.sha256IriClassSync(identifier);
  }

  sha256IriClassSync(
    identifier: Sha256IriClass.$Identifier,
  ): purify.Either<Error, Sha256IriClass> {
    return this.sha256IriClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async sha256IriClassIdentifiers(
    query?: $ObjectSet.Query<Sha256IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly Sha256IriClass.$Identifier[]>> {
    return this.sha256IriClassIdentifiersSync(query);
  }

  sha256IriClassIdentifiersSync(
    query?: $ObjectSet.Query<Sha256IriClass.$Identifier>,
  ): purify.Either<Error, readonly Sha256IriClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        Sha256IriClass,
        Sha256IriClass.$Identifier
      >({ ...Sha256IriClass, $fromRdfType: undefined }, query),
    ]);
  }

  async sha256IriClasses(
    query?: $ObjectSet.Query<Sha256IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, Sha256IriClass>[]> {
    return this.sha256IriClassesSync(query);
  }

  sha256IriClassesSync(
    query?: $ObjectSet.Query<Sha256IriClass.$Identifier>,
  ): readonly purify.Either<Error, Sha256IriClass>[] {
    return [
      ...this.$objectsSync<Sha256IriClass, Sha256IriClass.$Identifier>(
        { ...Sha256IriClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async sha256IriClassesCount(
    query?: Pick<$ObjectSet.Query<Sha256IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.sha256IriClassesCountSync(query);
  }

  sha256IriClassesCountSync(
    query?: Pick<$ObjectSet.Query<Sha256IriClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<Sha256IriClass, Sha256IriClass.$Identifier>(
      { ...Sha256IriClass, $fromRdfType: undefined },
      query,
    );
  }

  async termPropertiesClass(
    identifier: TermPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, TermPropertiesClass>> {
    return this.termPropertiesClassSync(identifier);
  }

  termPropertiesClassSync(
    identifier: TermPropertiesClass.$Identifier,
  ): purify.Either<Error, TermPropertiesClass> {
    return this.termPropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async termPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<TermPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly TermPropertiesClass.$Identifier[]>> {
    return this.termPropertiesClassIdentifiersSync(query);
  }

  termPropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<TermPropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly TermPropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        TermPropertiesClass,
        TermPropertiesClass.$Identifier
      >({ ...TermPropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async termPropertiesClasses(
    query?: $ObjectSet.Query<TermPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, TermPropertiesClass>[]> {
    return this.termPropertiesClassesSync(query);
  }

  termPropertiesClassesSync(
    query?: $ObjectSet.Query<TermPropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, TermPropertiesClass>[] {
    return [
      ...this.$objectsSync<
        TermPropertiesClass,
        TermPropertiesClass.$Identifier
      >({ ...TermPropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async termPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<TermPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.termPropertiesClassesCountSync(query);
  }

  termPropertiesClassesCountSync(
    query?: Pick<$ObjectSet.Query<TermPropertiesClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      TermPropertiesClass,
      TermPropertiesClass.$Identifier
    >({ ...TermPropertiesClass, $fromRdfType: undefined }, query);
  }

  async unionPropertiesClass(
    identifier: UnionPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, UnionPropertiesClass>> {
    return this.unionPropertiesClassSync(identifier);
  }

  unionPropertiesClassSync(
    identifier: UnionPropertiesClass.$Identifier,
  ): purify.Either<Error, UnionPropertiesClass> {
    return this.unionPropertiesClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async unionPropertiesClassIdentifiers(
    query?: $ObjectSet.Query<UnionPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly UnionPropertiesClass.$Identifier[]>
  > {
    return this.unionPropertiesClassIdentifiersSync(query);
  }

  unionPropertiesClassIdentifiersSync(
    query?: $ObjectSet.Query<UnionPropertiesClass.$Identifier>,
  ): purify.Either<Error, readonly UnionPropertiesClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        UnionPropertiesClass,
        UnionPropertiesClass.$Identifier
      >({ ...UnionPropertiesClass, $fromRdfType: undefined }, query),
    ]);
  }

  async unionPropertiesClasses(
    query?: $ObjectSet.Query<UnionPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, UnionPropertiesClass>[]> {
    return this.unionPropertiesClassesSync(query);
  }

  unionPropertiesClassesSync(
    query?: $ObjectSet.Query<UnionPropertiesClass.$Identifier>,
  ): readonly purify.Either<Error, UnionPropertiesClass>[] {
    return [
      ...this.$objectsSync<
        UnionPropertiesClass,
        UnionPropertiesClass.$Identifier
      >({ ...UnionPropertiesClass, $fromRdfType: undefined }, query),
    ];
  }

  async unionPropertiesClassesCount(
    query?: Pick<$ObjectSet.Query<UnionPropertiesClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.unionPropertiesClassesCountSync(query);
  }

  unionPropertiesClassesCountSync(
    query?: Pick<$ObjectSet.Query<UnionPropertiesClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      UnionPropertiesClass,
      UnionPropertiesClass.$Identifier
    >({ ...UnionPropertiesClass, $fromRdfType: undefined }, query);
  }

  async uuidV4IriClass(
    identifier: UuidV4IriClass.$Identifier,
  ): Promise<purify.Either<Error, UuidV4IriClass>> {
    return this.uuidV4IriClassSync(identifier);
  }

  uuidV4IriClassSync(
    identifier: UuidV4IriClass.$Identifier,
  ): purify.Either<Error, UuidV4IriClass> {
    return this.uuidV4IriClassesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async uuidV4IriClassIdentifiers(
    query?: $ObjectSet.Query<UuidV4IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly UuidV4IriClass.$Identifier[]>> {
    return this.uuidV4IriClassIdentifiersSync(query);
  }

  uuidV4IriClassIdentifiersSync(
    query?: $ObjectSet.Query<UuidV4IriClass.$Identifier>,
  ): purify.Either<Error, readonly UuidV4IriClass.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        UuidV4IriClass,
        UuidV4IriClass.$Identifier
      >({ ...UuidV4IriClass, $fromRdfType: undefined }, query),
    ]);
  }

  async uuidV4IriClasses(
    query?: $ObjectSet.Query<UuidV4IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, UuidV4IriClass>[]> {
    return this.uuidV4IriClassesSync(query);
  }

  uuidV4IriClassesSync(
    query?: $ObjectSet.Query<UuidV4IriClass.$Identifier>,
  ): readonly purify.Either<Error, UuidV4IriClass>[] {
    return [
      ...this.$objectsSync<UuidV4IriClass, UuidV4IriClass.$Identifier>(
        { ...UuidV4IriClass, $fromRdfType: undefined },
        query,
      ),
    ];
  }

  async uuidV4IriClassesCount(
    query?: Pick<$ObjectSet.Query<UuidV4IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.uuidV4IriClassesCountSync(query);
  }

  uuidV4IriClassesCountSync(
    query?: Pick<$ObjectSet.Query<UuidV4IriClass.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<UuidV4IriClass, UuidV4IriClass.$Identifier>(
      { ...UuidV4IriClass, $fromRdfType: undefined },
      query,
    );
  }

  async classUnion(
    identifier: ClassUnion.$Identifier,
  ): Promise<purify.Either<Error, ClassUnion>> {
    return this.classUnionSync(identifier);
  }

  classUnionSync(
    identifier: ClassUnion.$Identifier,
  ): purify.Either<Error, ClassUnion> {
    return this.classUnionsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async classUnionIdentifiers(
    query?: $ObjectSet.Query<ClassUnion.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnion.$Identifier[]>> {
    return this.classUnionIdentifiersSync(query);
  }

  classUnionIdentifiersSync(
    query?: $ObjectSet.Query<ClassUnion.$Identifier>,
  ): purify.Either<Error, readonly ClassUnion.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectUnionIdentifiersSync<ClassUnion, ClassUnion.$Identifier>(
        [ClassUnionMember1, ClassUnionMember2],
        query,
      ),
    ]);
  }

  async classUnions(
    query?: $ObjectSet.Query<ClassUnion.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnion>[]> {
    return this.classUnionsSync(query);
  }

  classUnionsSync(
    query?: $ObjectSet.Query<ClassUnion.$Identifier>,
  ): readonly purify.Either<Error, ClassUnion>[] {
    return [
      ...this.$objectUnionsSync<ClassUnion, ClassUnion.$Identifier>(
        [ClassUnionMember1, ClassUnionMember2],
        query,
      ),
    ];
  }

  async classUnionsCount(
    query?: Pick<$ObjectSet.Query<ClassUnion.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.classUnionsCountSync(query);
  }

  classUnionsCountSync(
    query?: Pick<$ObjectSet.Query<ClassUnion.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectUnionsCountSync<ClassUnion, ClassUnion.$Identifier>(
      [ClassUnionMember1, ClassUnionMember2],
      query,
    );
  }

  async interfaceUnion(
    identifier: InterfaceUnion.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnion>> {
    return this.interfaceUnionSync(identifier);
  }

  interfaceUnionSync(
    identifier: InterfaceUnion.$Identifier,
  ): purify.Either<Error, InterfaceUnion> {
    return this.interfaceUnionsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async interfaceUnionIdentifiers(
    query?: $ObjectSet.Query<InterfaceUnion.$Identifier>,
  ): Promise<purify.Either<Error, readonly InterfaceUnion.$Identifier[]>> {
    return this.interfaceUnionIdentifiersSync(query);
  }

  interfaceUnionIdentifiersSync(
    query?: $ObjectSet.Query<InterfaceUnion.$Identifier>,
  ): purify.Either<Error, readonly InterfaceUnion.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectUnionIdentifiersSync<
        InterfaceUnion,
        InterfaceUnion.$Identifier
      >(
        [
          { ...InterfaceUnionMember1, $fromRdfType: undefined },
          { ...InterfaceUnionMember2a, $fromRdfType: undefined },
          { ...InterfaceUnionMember2b, $fromRdfType: undefined },
        ],
        query,
      ),
    ]);
  }

  async interfaceUnions(
    query?: $ObjectSet.Query<InterfaceUnion.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnion>[]> {
    return this.interfaceUnionsSync(query);
  }

  interfaceUnionsSync(
    query?: $ObjectSet.Query<InterfaceUnion.$Identifier>,
  ): readonly purify.Either<Error, InterfaceUnion>[] {
    return [
      ...this.$objectUnionsSync<InterfaceUnion, InterfaceUnion.$Identifier>(
        [
          { ...InterfaceUnionMember1, $fromRdfType: undefined },
          { ...InterfaceUnionMember2a, $fromRdfType: undefined },
          { ...InterfaceUnionMember2b, $fromRdfType: undefined },
        ],
        query,
      ),
    ];
  }

  async interfaceUnionsCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnion.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.interfaceUnionsCountSync(query);
  }

  interfaceUnionsCountSync(
    query?: Pick<$ObjectSet.Query<InterfaceUnion.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectUnionsCountSync<
      InterfaceUnion,
      InterfaceUnion.$Identifier
    >(
      [
        { ...InterfaceUnionMember1, $fromRdfType: undefined },
        { ...InterfaceUnionMember2a, $fromRdfType: undefined },
        { ...InterfaceUnionMember2b, $fromRdfType: undefined },
      ],
      query,
    );
  }

  async interfaceUnionMember2(
    identifier: InterfaceUnionMember2.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2>> {
    return this.interfaceUnionMember2Sync(identifier);
  }

  interfaceUnionMember2Sync(
    identifier: InterfaceUnionMember2.$Identifier,
  ): purify.Either<Error, InterfaceUnionMember2> {
    return this.interfaceUnionMember2sSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async interfaceUnionMember2Identifiers(
    query?: $ObjectSet.Query<InterfaceUnionMember2.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2.$Identifier[]>
  > {
    return this.interfaceUnionMember2IdentifiersSync(query);
  }

  interfaceUnionMember2IdentifiersSync(
    query?: $ObjectSet.Query<InterfaceUnionMember2.$Identifier>,
  ): purify.Either<Error, readonly InterfaceUnionMember2.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectUnionIdentifiersSync<
        InterfaceUnionMember2,
        InterfaceUnionMember2.$Identifier
      >(
        [
          { ...InterfaceUnionMember2a, $fromRdfType: undefined },
          { ...InterfaceUnionMember2b, $fromRdfType: undefined },
        ],
        query,
      ),
    ]);
  }

  async interfaceUnionMember2s(
    query?: $ObjectSet.Query<InterfaceUnionMember2.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2>[]> {
    return this.interfaceUnionMember2sSync(query);
  }

  interfaceUnionMember2sSync(
    query?: $ObjectSet.Query<InterfaceUnionMember2.$Identifier>,
  ): readonly purify.Either<Error, InterfaceUnionMember2>[] {
    return [
      ...this.$objectUnionsSync<
        InterfaceUnionMember2,
        InterfaceUnionMember2.$Identifier
      >(
        [
          { ...InterfaceUnionMember2a, $fromRdfType: undefined },
          { ...InterfaceUnionMember2b, $fromRdfType: undefined },
        ],
        query,
      ),
    ];
  }

  async interfaceUnionMember2sCount(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.interfaceUnionMember2sCountSync(query);
  }

  interfaceUnionMember2sCountSync(
    query?: Pick<$ObjectSet.Query<InterfaceUnionMember2.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectUnionsCountSync<
      InterfaceUnionMember2,
      InterfaceUnionMember2.$Identifier
    >(
      [
        { ...InterfaceUnionMember2a, $fromRdfType: undefined },
        { ...InterfaceUnionMember2b, $fromRdfType: undefined },
      ],
      query,
    );
  }

  protected *$objectIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<ObjectIdentifierT> {
    for (const object of this.$objectsSync<ObjectT, ObjectIdentifierT>(
      objectType,
      query,
    )) {
      if (object.isRight()) {
        yield object.unsafeCoerce().$identifier;
      }
    }
  }

  protected *$objectsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<purify.Either<Error, ObjectT>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return;
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      for (const identifier of query.where.identifiers.slice(
        offset,
        offset + limit,
      )) {
        yield objectType.$fromRdf({
          resource: this.resourceSet.resource(identifier),
        });
      }
      return;
    }

    if (!objectType.$fromRdfType) {
      return;
    }

    const resources = [
      ...this.resourceSet.instancesOf(objectType.$fromRdfType),
    ];
    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.identifier.value.localeCompare(right.identifier.value),
    );

    let objectCount = 0;
    let objectI = 0;
    for (const resource of resources) {
      const object = objectType.$fromRdf({ resource });
      if (object.isLeft()) {
        continue;
      }
      if (objectI++ >= offset) {
        yield object;
        if (++objectCount === limit) {
          return;
        }
      }
    }
  }

  protected $objectsCountSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    let count = 0;
    for (const _ of this.$objectIdentifiersSync<ObjectT, ObjectIdentifierT>(
      objectType,
      query,
    )) {
      count++;
    }

    return purify.Either.of(count);
  }

  protected *$objectUnionIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<ObjectIdentifierT> {
    for (const object of this.$objectUnionsSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    )) {
      if (object.isRight()) {
        yield object.unsafeCoerce().$identifier;
      }
    }
  }

  protected *$objectUnionsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<purify.Either<Error, ObjectT>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return;
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      // Figure out which object type the identifiers belong to
      for (const identifier of query.where.identifiers.slice(
        offset,
        offset + limit,
      )) {
        const resource = this.resourceSet.resource(identifier);
        const lefts: purify.Either<Error, ObjectT>[] = [];
        for (const objectType of objectTypes) {
          const object = objectType.$fromRdf({ resource });
          if (object.isRight()) {
            yield object;
            break;
          }
          lefts.push(object);
        }
        // Doesn't appear to belong to any of the known object types, just assume the first
        if (lefts.length === objectTypes.length) {
          yield lefts[0];
        }
      }

      return;
    }

    let objectCount = 0;
    let objectI = 0;

    const resources: {
      objectType: {
        $fromRdf: (parameters: {
          resource: rdfjsResource.Resource;
        }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
        $fromRdfType?: rdfjs.NamedNode;
      };
      resource: rdfjsResource.Resource;
    }[] = [];
    for (const objectType of objectTypes) {
      if (!objectType.$fromRdfType) {
        continue;
      }

      for (const resource of this.resourceSet.instancesOf(
        objectType.$fromRdfType,
      )) {
        resources.push({ objectType, resource });
      }
    }

    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.resource.identifier.value.localeCompare(
        right.resource.identifier.value,
      ),
    );

    for (const { objectType, resource } of resources) {
      const object = objectType.$fromRdf({ resource });
      if (object.isLeft()) {
        continue;
      }
      if (objectI++ >= offset) {
        yield object;
        if (++objectCount === limit) {
          return;
        }
      }
    }
  }

  protected $objectUnionsCountSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    let count = 0;
    for (const _ of this.$objectUnionIdentifiersSync<
      ObjectT,
      ObjectIdentifierT
    >(objectTypes, query)) {
      count++;
    }

    return purify.Either.of(count);
  }
}

export class $SparqlObjectSet implements $ObjectSet {
  protected readonly $countVariable = dataFactory.variable!("count");
  protected readonly $objectVariable = dataFactory.variable!("object");
  protected readonly $sparqlClient: {
    queryBindings: (
      query: string,
    ) => Promise<
      readonly Record<
        string,
        rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode
      >[]
    >;
    queryQuads: (query: string) => Promise<readonly rdfjs.Quad[]>;
  };
  protected readonly $sparqlGenerator = new sparqljs.Generator();

  constructor({
    sparqlClient,
  }: { sparqlClient: $SparqlObjectSet["$sparqlClient"] }) {
    this.$sparqlClient = sparqlClient;
  }

  async baseInterfaceWithoutProperties(
    identifier: BaseInterfaceWithoutPropertiesStatic.$Identifier,
  ): Promise<purify.Either<Error, BaseInterfaceWithoutProperties>> {
    return (
      await this.baseInterfaceWithoutPropertieses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async baseInterfaceWithoutPropertiesIdentifiers(
    query?: $SparqlObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly BaseInterfaceWithoutPropertiesStatic.$Identifier[]
    >
  > {
    return this.$objectIdentifiers<BaseInterfaceWithoutPropertiesStatic.$Identifier>(
      BaseInterfaceWithoutPropertiesStatic,
      query,
    );
  }

  async baseInterfaceWithoutPropertieses(
    query?: $SparqlObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, BaseInterfaceWithoutProperties>[]> {
    return this.$objects<
      BaseInterfaceWithoutProperties,
      BaseInterfaceWithoutPropertiesStatic.$Identifier
    >(BaseInterfaceWithoutPropertiesStatic, query);
  }

  async baseInterfaceWithoutPropertiesesCount(
    query?: Pick<
      $SparqlObjectSet.Query<BaseInterfaceWithoutPropertiesStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<BaseInterfaceWithoutPropertiesStatic.$Identifier>(
      BaseInterfaceWithoutPropertiesStatic,
      query,
    );
  }

  async baseInterfaceWithProperties(
    identifier: BaseInterfaceWithPropertiesStatic.$Identifier,
  ): Promise<purify.Either<Error, BaseInterfaceWithProperties>> {
    return (
      await this.baseInterfaceWithPropertieses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async baseInterfaceWithPropertiesIdentifiers(
    query?: $SparqlObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly BaseInterfaceWithPropertiesStatic.$Identifier[]
    >
  > {
    return this.$objectIdentifiers<BaseInterfaceWithPropertiesStatic.$Identifier>(
      BaseInterfaceWithPropertiesStatic,
      query,
    );
  }

  async baseInterfaceWithPropertieses(
    query?: $SparqlObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, BaseInterfaceWithProperties>[]> {
    return this.$objects<
      BaseInterfaceWithProperties,
      BaseInterfaceWithPropertiesStatic.$Identifier
    >(BaseInterfaceWithPropertiesStatic, query);
  }

  async baseInterfaceWithPropertiesesCount(
    query?: Pick<
      $SparqlObjectSet.Query<BaseInterfaceWithPropertiesStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<BaseInterfaceWithPropertiesStatic.$Identifier>(
      BaseInterfaceWithPropertiesStatic,
      query,
    );
  }

  async blankClass(
    identifier: BlankClass.$Identifier,
  ): Promise<purify.Either<Error, BlankClass>> {
    return (
      await this.blankClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async blankClassIdentifiers(
    query?: $SparqlObjectSet.Query<BlankClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly BlankClass.$Identifier[]>> {
    return this.$objectIdentifiers<BlankClass.$Identifier>(BlankClass, query);
  }

  async blankClasses(
    query?: $SparqlObjectSet.Query<BlankClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, BlankClass>[]> {
    return this.$objects<BlankClass, BlankClass.$Identifier>(BlankClass, query);
  }

  async blankClassesCount(
    query?: Pick<$SparqlObjectSet.Query<BlankClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<BlankClass.$Identifier>(BlankClass, query);
  }

  async classUnionMember1(
    identifier: ClassUnionMember1.$Identifier,
  ): Promise<purify.Either<Error, ClassUnionMember1>> {
    return (
      await this.classUnionMember1s({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async classUnionMember1Identifiers(
    query?: $SparqlObjectSet.Query<ClassUnionMember1.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnionMember1.$Identifier[]>> {
    return this.$objectIdentifiers<ClassUnionMember1.$Identifier>(
      ClassUnionMember1,
      query,
    );
  }

  async classUnionMember1s(
    query?: $SparqlObjectSet.Query<ClassUnionMember1.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnionMember1>[]> {
    return this.$objects<ClassUnionMember1, ClassUnionMember1.$Identifier>(
      ClassUnionMember1,
      query,
    );
  }

  async classUnionMember1sCount(
    query?: Pick<
      $SparqlObjectSet.Query<ClassUnionMember1.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ClassUnionMember1.$Identifier>(
      ClassUnionMember1,
      query,
    );
  }

  async classUnionMember2(
    identifier: ClassUnionMember2.$Identifier,
  ): Promise<purify.Either<Error, ClassUnionMember2>> {
    return (
      await this.classUnionMember2s({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async classUnionMember2Identifiers(
    query?: $SparqlObjectSet.Query<ClassUnionMember2.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnionMember2.$Identifier[]>> {
    return this.$objectIdentifiers<ClassUnionMember2.$Identifier>(
      ClassUnionMember2,
      query,
    );
  }

  async classUnionMember2s(
    query?: $SparqlObjectSet.Query<ClassUnionMember2.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnionMember2>[]> {
    return this.$objects<ClassUnionMember2, ClassUnionMember2.$Identifier>(
      ClassUnionMember2,
      query,
    );
  }

  async classUnionMember2sCount(
    query?: Pick<
      $SparqlObjectSet.Query<ClassUnionMember2.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ClassUnionMember2.$Identifier>(
      ClassUnionMember2,
      query,
    );
  }

  async concreteChildClass(
    identifier: ConcreteChildClass.$Identifier,
  ): Promise<purify.Either<Error, ConcreteChildClass>> {
    return (
      await this.concreteChildClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async concreteChildClassIdentifiers(
    query?: $SparqlObjectSet.Query<ConcreteChildClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly ConcreteChildClass.$Identifier[]>> {
    return this.$objectIdentifiers<ConcreteChildClass.$Identifier>(
      ConcreteChildClass,
      query,
    );
  }

  async concreteChildClasses(
    query?: $SparqlObjectSet.Query<ConcreteChildClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteChildClass>[]> {
    return this.$objects<ConcreteChildClass, ConcreteChildClass.$Identifier>(
      ConcreteChildClass,
      query,
    );
  }

  async concreteChildClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ConcreteChildClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ConcreteChildClass.$Identifier>(
      ConcreteChildClass,
      query,
    );
  }

  async concreteChildInterface(
    identifier: ConcreteChildInterface.$Identifier,
  ): Promise<purify.Either<Error, ConcreteChildInterface>> {
    return (
      await this.concreteChildInterfaces({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async concreteChildInterfaceIdentifiers(
    query?: $SparqlObjectSet.Query<ConcreteChildInterface.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteChildInterface.$Identifier[]>
  > {
    return this.$objectIdentifiers<ConcreteChildInterface.$Identifier>(
      ConcreteChildInterface,
      query,
    );
  }

  async concreteChildInterfaces(
    query?: $SparqlObjectSet.Query<ConcreteChildInterface.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteChildInterface>[]> {
    return this.$objects<
      ConcreteChildInterface,
      ConcreteChildInterface.$Identifier
    >(ConcreteChildInterface, query);
  }

  async concreteChildInterfacesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ConcreteChildInterface.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ConcreteChildInterface.$Identifier>(
      ConcreteChildInterface,
      query,
    );
  }

  async concreteParentClass(
    identifier: ConcreteParentClassStatic.$Identifier,
  ): Promise<purify.Either<Error, ConcreteParentClass>> {
    return (
      await this.concreteParentClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async concreteParentClassIdentifiers(
    query?: $SparqlObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteParentClassStatic.$Identifier[]>
  > {
    return this.$objectIdentifiers<ConcreteParentClassStatic.$Identifier>(
      ConcreteParentClassStatic,
      query,
    );
  }

  async concreteParentClasses(
    query?: $SparqlObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteParentClass>[]> {
    return this.$objects<
      ConcreteParentClass,
      ConcreteParentClassStatic.$Identifier
    >(ConcreteParentClassStatic, query);
  }

  async concreteParentClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ConcreteParentClassStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ConcreteParentClassStatic.$Identifier>(
      ConcreteParentClassStatic,
      query,
    );
  }

  async concreteParentInterface(
    identifier: ConcreteParentInterfaceStatic.$Identifier,
  ): Promise<purify.Either<Error, ConcreteParentInterface>> {
    return (
      await this.concreteParentInterfaces({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async concreteParentInterfaceIdentifiers(
    query?: $SparqlObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ConcreteParentInterfaceStatic.$Identifier[]>
  > {
    return this.$objectIdentifiers<ConcreteParentInterfaceStatic.$Identifier>(
      ConcreteParentInterfaceStatic,
      query,
    );
  }

  async concreteParentInterfaces(
    query?: $SparqlObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
  ): Promise<readonly purify.Either<Error, ConcreteParentInterface>[]> {
    return this.$objects<
      ConcreteParentInterface,
      ConcreteParentInterfaceStatic.$Identifier
    >(ConcreteParentInterfaceStatic, query);
  }

  async concreteParentInterfacesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ConcreteParentInterfaceStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ConcreteParentInterfaceStatic.$Identifier>(
      ConcreteParentInterfaceStatic,
      query,
    );
  }

  async defaultValuePropertiesClass(
    identifier: DefaultValuePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, DefaultValuePropertiesClass>> {
    return (
      await this.defaultValuePropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async defaultValuePropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly DefaultValuePropertiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<DefaultValuePropertiesClass.$Identifier>(
      DefaultValuePropertiesClass,
      query,
    );
  }

  async defaultValuePropertiesClasses(
    query?: $SparqlObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, DefaultValuePropertiesClass>[]> {
    return this.$objects<
      DefaultValuePropertiesClass,
      DefaultValuePropertiesClass.$Identifier
    >(DefaultValuePropertiesClass, query);
  }

  async defaultValuePropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<DefaultValuePropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<DefaultValuePropertiesClass.$Identifier>(
      DefaultValuePropertiesClass,
      query,
    );
  }

  async explicitFromToRdfTypesClass(
    identifier: ExplicitFromToRdfTypesClass.$Identifier,
  ): Promise<purify.Either<Error, ExplicitFromToRdfTypesClass>> {
    return (
      await this.explicitFromToRdfTypesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async explicitFromToRdfTypesClassIdentifiers(
    query?: $SparqlObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ExplicitFromToRdfTypesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<ExplicitFromToRdfTypesClass.$Identifier>(
      ExplicitFromToRdfTypesClass,
      query,
    );
  }

  async explicitFromToRdfTypesClasses(
    query?: $SparqlObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExplicitFromToRdfTypesClass>[]> {
    return this.$objects<
      ExplicitFromToRdfTypesClass,
      ExplicitFromToRdfTypesClass.$Identifier
    >(ExplicitFromToRdfTypesClass, query);
  }

  async explicitFromToRdfTypesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ExplicitFromToRdfTypesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ExplicitFromToRdfTypesClass.$Identifier>(
      ExplicitFromToRdfTypesClass,
      query,
    );
  }

  async explicitRdfTypeClass(
    identifier: ExplicitRdfTypeClass.$Identifier,
  ): Promise<purify.Either<Error, ExplicitRdfTypeClass>> {
    return (
      await this.explicitRdfTypeClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async explicitRdfTypeClassIdentifiers(
    query?: $SparqlObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ExplicitRdfTypeClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<ExplicitRdfTypeClass.$Identifier>(
      ExplicitRdfTypeClass,
      query,
    );
  }

  async explicitRdfTypeClasses(
    query?: $SparqlObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExplicitRdfTypeClass>[]> {
    return this.$objects<
      ExplicitRdfTypeClass,
      ExplicitRdfTypeClass.$Identifier
    >(ExplicitRdfTypeClass, query);
  }

  async explicitRdfTypeClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ExplicitRdfTypeClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ExplicitRdfTypeClass.$Identifier>(
      ExplicitRdfTypeClass,
      query,
    );
  }

  async externPropertiesClass(
    identifier: ExternPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesClass>> {
    return (
      await this.externPropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async externPropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<ExternPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ExternPropertiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<ExternPropertiesClass.$Identifier>(
      ExternPropertiesClass,
      query,
    );
  }

  async externPropertiesClasses(
    query?: $SparqlObjectSet.Query<ExternPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ExternPropertiesClass>[]> {
    return this.$objects<
      ExternPropertiesClass,
      ExternPropertiesClass.$Identifier
    >(ExternPropertiesClass, query);
  }

  async externPropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ExternPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ExternPropertiesClass.$Identifier>(
      ExternPropertiesClass,
      query,
    );
  }

  async externPropertiesExternNestedClass(
    identifier: ExternPropertiesExternNestedClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesExternNestedClass>> {
    return (
      await this.externPropertiesExternNestedClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async externPropertiesExternNestedClassIdentifiers(
    query?: $SparqlObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly ExternPropertiesExternNestedClass.$Identifier[]
    >
  > {
    return this.$objectIdentifiers<ExternPropertiesExternNestedClass.$Identifier>(
      ExternPropertiesExternNestedClass,
      query,
    );
  }

  async externPropertiesExternNestedClasses(
    query?: $SparqlObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
  ): Promise<
    readonly purify.Either<Error, ExternPropertiesExternNestedClass>[]
  > {
    return this.$objects<
      ExternPropertiesExternNestedClass,
      ExternPropertiesExternNestedClass.$Identifier
    >(ExternPropertiesExternNestedClass, query);
  }

  async externPropertiesExternNestedClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ExternPropertiesExternNestedClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ExternPropertiesExternNestedClass.$Identifier>(
      ExternPropertiesExternNestedClass,
      query,
    );
  }

  async externPropertiesInlineNestedClass(
    identifier: ExternPropertiesInlineNestedClass.$Identifier,
  ): Promise<purify.Either<Error, ExternPropertiesInlineNestedClass>> {
    return (
      await this.externPropertiesInlineNestedClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async externPropertiesInlineNestedClassIdentifiers(
    query?: $SparqlObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
  ): Promise<
    purify.Either<
      Error,
      readonly ExternPropertiesInlineNestedClass.$Identifier[]
    >
  > {
    return this.$objectIdentifiers<ExternPropertiesInlineNestedClass.$Identifier>(
      ExternPropertiesInlineNestedClass,
      query,
    );
  }

  async externPropertiesInlineNestedClasses(
    query?: $SparqlObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
  ): Promise<
    readonly purify.Either<Error, ExternPropertiesInlineNestedClass>[]
  > {
    return this.$objects<
      ExternPropertiesInlineNestedClass,
      ExternPropertiesInlineNestedClass.$Identifier
    >(ExternPropertiesInlineNestedClass, query);
  }

  async externPropertiesInlineNestedClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ExternPropertiesInlineNestedClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ExternPropertiesInlineNestedClass.$Identifier>(
      ExternPropertiesInlineNestedClass,
      query,
    );
  }

  async hasValuePropertiesClass(
    identifier: HasValuePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, HasValuePropertiesClass>> {
    return (
      await this.hasValuePropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async hasValuePropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<HasValuePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly HasValuePropertiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<HasValuePropertiesClass.$Identifier>(
      HasValuePropertiesClass,
      query,
    );
  }

  async hasValuePropertiesClasses(
    query?: $SparqlObjectSet.Query<HasValuePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, HasValuePropertiesClass>[]> {
    return this.$objects<
      HasValuePropertiesClass,
      HasValuePropertiesClass.$Identifier
    >(HasValuePropertiesClass, query);
  }

  async hasValuePropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<HasValuePropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<HasValuePropertiesClass.$Identifier>(
      HasValuePropertiesClass,
      query,
    );
  }

  async inIdentifierClass(
    identifier: InIdentifierClass.$Identifier,
  ): Promise<purify.Either<Error, InIdentifierClass>> {
    return (
      await this.inIdentifierClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async inIdentifierClassIdentifiers(
    query?: $SparqlObjectSet.Query<InIdentifierClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly InIdentifierClass.$Identifier[]>> {
    return this.$objectIdentifiers<InIdentifierClass.$Identifier>(
      InIdentifierClass,
      query,
    );
  }

  async inIdentifierClasses(
    query?: $SparqlObjectSet.Query<InIdentifierClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, InIdentifierClass>[]> {
    return this.$objects<InIdentifierClass, InIdentifierClass.$Identifier>(
      InIdentifierClass,
      query,
    );
  }

  async inIdentifierClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<InIdentifierClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<InIdentifierClass.$Identifier>(
      InIdentifierClass,
      query,
    );
  }

  async inPropertiesClass(
    identifier: InPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, InPropertiesClass>> {
    return (
      await this.inPropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async inPropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<InPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly InPropertiesClass.$Identifier[]>> {
    return this.$objectIdentifiers<InPropertiesClass.$Identifier>(
      InPropertiesClass,
      query,
    );
  }

  async inPropertiesClasses(
    query?: $SparqlObjectSet.Query<InPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, InPropertiesClass>[]> {
    return this.$objects<InPropertiesClass, InPropertiesClass.$Identifier>(
      InPropertiesClass,
      query,
    );
  }

  async inPropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<InPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<InPropertiesClass.$Identifier>(
      InPropertiesClass,
      query,
    );
  }

  async interface(
    identifier: Interface.$Identifier,
  ): Promise<purify.Either<Error, Interface>> {
    return (
      await this.interfaces({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async interfaceIdentifiers(
    query?: $SparqlObjectSet.Query<Interface.$Identifier>,
  ): Promise<purify.Either<Error, readonly Interface.$Identifier[]>> {
    return this.$objectIdentifiers<Interface.$Identifier>(Interface, query);
  }

  async interfaces(
    query?: $SparqlObjectSet.Query<Interface.$Identifier>,
  ): Promise<readonly purify.Either<Error, Interface>[]> {
    return this.$objects<Interface, Interface.$Identifier>(Interface, query);
  }

  async interfacesCount(
    query?: Pick<$SparqlObjectSet.Query<Interface.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<Interface.$Identifier>(Interface, query);
  }

  async interfaceUnionMember1(
    identifier: InterfaceUnionMember1.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember1>> {
    return (
      await this.interfaceUnionMember1s({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async interfaceUnionMember1Identifiers(
    query?: $SparqlObjectSet.Query<InterfaceUnionMember1.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember1.$Identifier[]>
  > {
    return this.$objectIdentifiers<InterfaceUnionMember1.$Identifier>(
      InterfaceUnionMember1,
      query,
    );
  }

  async interfaceUnionMember1s(
    query?: $SparqlObjectSet.Query<InterfaceUnionMember1.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember1>[]> {
    return this.$objects<
      InterfaceUnionMember1,
      InterfaceUnionMember1.$Identifier
    >(InterfaceUnionMember1, query);
  }

  async interfaceUnionMember1sCount(
    query?: Pick<
      $SparqlObjectSet.Query<InterfaceUnionMember1.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<InterfaceUnionMember1.$Identifier>(
      InterfaceUnionMember1,
      query,
    );
  }

  async interfaceUnionMember2a(
    identifier: InterfaceUnionMember2a.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2a>> {
    return (
      await this.interfaceUnionMember2as({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async interfaceUnionMember2aIdentifiers(
    query?: $SparqlObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2a.$Identifier[]>
  > {
    return this.$objectIdentifiers<InterfaceUnionMember2a.$Identifier>(
      InterfaceUnionMember2a,
      query,
    );
  }

  async interfaceUnionMember2as(
    query?: $SparqlObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2a>[]> {
    return this.$objects<
      InterfaceUnionMember2a,
      InterfaceUnionMember2a.$Identifier
    >(InterfaceUnionMember2a, query);
  }

  async interfaceUnionMember2asCount(
    query?: Pick<
      $SparqlObjectSet.Query<InterfaceUnionMember2a.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<InterfaceUnionMember2a.$Identifier>(
      InterfaceUnionMember2a,
      query,
    );
  }

  async interfaceUnionMember2b(
    identifier: InterfaceUnionMember2b.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2b>> {
    return (
      await this.interfaceUnionMember2bs({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async interfaceUnionMember2bIdentifiers(
    query?: $SparqlObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2b.$Identifier[]>
  > {
    return this.$objectIdentifiers<InterfaceUnionMember2b.$Identifier>(
      InterfaceUnionMember2b,
      query,
    );
  }

  async interfaceUnionMember2bs(
    query?: $SparqlObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2b>[]> {
    return this.$objects<
      InterfaceUnionMember2b,
      InterfaceUnionMember2b.$Identifier
    >(InterfaceUnionMember2b, query);
  }

  async interfaceUnionMember2bsCount(
    query?: Pick<
      $SparqlObjectSet.Query<InterfaceUnionMember2b.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<InterfaceUnionMember2b.$Identifier>(
      InterfaceUnionMember2b,
      query,
    );
  }

  async iriClass(
    identifier: IriClass.$Identifier,
  ): Promise<purify.Either<Error, IriClass>> {
    return (
      await this.iriClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async iriClassIdentifiers(
    query?: $SparqlObjectSet.Query<IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly IriClass.$Identifier[]>> {
    return this.$objectIdentifiers<IriClass.$Identifier>(IriClass, query);
  }

  async iriClasses(
    query?: $SparqlObjectSet.Query<IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, IriClass>[]> {
    return this.$objects<IriClass, IriClass.$Identifier>(IriClass, query);
  }

  async iriClassesCount(
    query?: Pick<$SparqlObjectSet.Query<IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<IriClass.$Identifier>(IriClass, query);
  }

  async languageInPropertiesClass(
    identifier: LanguageInPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, LanguageInPropertiesClass>> {
    return (
      await this.languageInPropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async languageInPropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly LanguageInPropertiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<LanguageInPropertiesClass.$Identifier>(
      LanguageInPropertiesClass,
      query,
    );
  }

  async languageInPropertiesClasses(
    query?: $SparqlObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, LanguageInPropertiesClass>[]> {
    return this.$objects<
      LanguageInPropertiesClass,
      LanguageInPropertiesClass.$Identifier
    >(LanguageInPropertiesClass, query);
  }

  async languageInPropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<LanguageInPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<LanguageInPropertiesClass.$Identifier>(
      LanguageInPropertiesClass,
      query,
    );
  }

  async listPropertiesClass(
    identifier: ListPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, ListPropertiesClass>> {
    return (
      await this.listPropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async listPropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<ListPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly ListPropertiesClass.$Identifier[]>> {
    return this.$objectIdentifiers<ListPropertiesClass.$Identifier>(
      ListPropertiesClass,
      query,
    );
  }

  async listPropertiesClasses(
    query?: $SparqlObjectSet.Query<ListPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, ListPropertiesClass>[]> {
    return this.$objects<ListPropertiesClass, ListPropertiesClass.$Identifier>(
      ListPropertiesClass,
      query,
    );
  }

  async listPropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<ListPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ListPropertiesClass.$Identifier>(
      ListPropertiesClass,
      query,
    );
  }

  async mutablePropertiesClass(
    identifier: MutablePropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, MutablePropertiesClass>> {
    return (
      await this.mutablePropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async mutablePropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<MutablePropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly MutablePropertiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<MutablePropertiesClass.$Identifier>(
      MutablePropertiesClass,
      query,
    );
  }

  async mutablePropertiesClasses(
    query?: $SparqlObjectSet.Query<MutablePropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, MutablePropertiesClass>[]> {
    return this.$objects<
      MutablePropertiesClass,
      MutablePropertiesClass.$Identifier
    >(MutablePropertiesClass, query);
  }

  async mutablePropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<MutablePropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<MutablePropertiesClass.$Identifier>(
      MutablePropertiesClass,
      query,
    );
  }

  async nonClass(
    identifier: NonClass.$Identifier,
  ): Promise<purify.Either<Error, NonClass>> {
    return (
      await this.nonClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async nonClassIdentifiers(
    query?: $SparqlObjectSet.Query<NonClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly NonClass.$Identifier[]>> {
    return this.$objectIdentifiers<NonClass.$Identifier>(NonClass, query);
  }

  async nonClasses(
    query?: $SparqlObjectSet.Query<NonClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, NonClass>[]> {
    return this.$objects<NonClass, NonClass.$Identifier>(NonClass, query);
  }

  async nonClassesCount(
    query?: Pick<$SparqlObjectSet.Query<NonClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<NonClass.$Identifier>(NonClass, query);
  }

  async orderedPropertiesClass(
    identifier: OrderedPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, OrderedPropertiesClass>> {
    return (
      await this.orderedPropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async orderedPropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<OrderedPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly OrderedPropertiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<OrderedPropertiesClass.$Identifier>(
      OrderedPropertiesClass,
      query,
    );
  }

  async orderedPropertiesClasses(
    query?: $SparqlObjectSet.Query<OrderedPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, OrderedPropertiesClass>[]> {
    return this.$objects<
      OrderedPropertiesClass,
      OrderedPropertiesClass.$Identifier
    >(OrderedPropertiesClass, query);
  }

  async orderedPropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<OrderedPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<OrderedPropertiesClass.$Identifier>(
      OrderedPropertiesClass,
      query,
    );
  }

  async propertyCardinalitiesClass(
    identifier: PropertyCardinalitiesClass.$Identifier,
  ): Promise<purify.Either<Error, PropertyCardinalitiesClass>> {
    return (
      await this.propertyCardinalitiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async propertyCardinalitiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly PropertyCardinalitiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<PropertyCardinalitiesClass.$Identifier>(
      PropertyCardinalitiesClass,
      query,
    );
  }

  async propertyCardinalitiesClasses(
    query?: $SparqlObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, PropertyCardinalitiesClass>[]> {
    return this.$objects<
      PropertyCardinalitiesClass,
      PropertyCardinalitiesClass.$Identifier
    >(PropertyCardinalitiesClass, query);
  }

  async propertyCardinalitiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<PropertyCardinalitiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<PropertyCardinalitiesClass.$Identifier>(
      PropertyCardinalitiesClass,
      query,
    );
  }

  async propertyVisibilitiesClass(
    identifier: PropertyVisibilitiesClass.$Identifier,
  ): Promise<purify.Either<Error, PropertyVisibilitiesClass>> {
    return (
      await this.propertyVisibilitiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async propertyVisibilitiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly PropertyVisibilitiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<PropertyVisibilitiesClass.$Identifier>(
      PropertyVisibilitiesClass,
      query,
    );
  }

  async propertyVisibilitiesClasses(
    query?: $SparqlObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, PropertyVisibilitiesClass>[]> {
    return this.$objects<
      PropertyVisibilitiesClass,
      PropertyVisibilitiesClass.$Identifier
    >(PropertyVisibilitiesClass, query);
  }

  async propertyVisibilitiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<PropertyVisibilitiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<PropertyVisibilitiesClass.$Identifier>(
      PropertyVisibilitiesClass,
      query,
    );
  }

  async sha256IriClass(
    identifier: Sha256IriClass.$Identifier,
  ): Promise<purify.Either<Error, Sha256IriClass>> {
    return (
      await this.sha256IriClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async sha256IriClassIdentifiers(
    query?: $SparqlObjectSet.Query<Sha256IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly Sha256IriClass.$Identifier[]>> {
    return this.$objectIdentifiers<Sha256IriClass.$Identifier>(
      Sha256IriClass,
      query,
    );
  }

  async sha256IriClasses(
    query?: $SparqlObjectSet.Query<Sha256IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, Sha256IriClass>[]> {
    return this.$objects<Sha256IriClass, Sha256IriClass.$Identifier>(
      Sha256IriClass,
      query,
    );
  }

  async sha256IriClassesCount(
    query?: Pick<$SparqlObjectSet.Query<Sha256IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<Sha256IriClass.$Identifier>(
      Sha256IriClass,
      query,
    );
  }

  async termPropertiesClass(
    identifier: TermPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, TermPropertiesClass>> {
    return (
      await this.termPropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async termPropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<TermPropertiesClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly TermPropertiesClass.$Identifier[]>> {
    return this.$objectIdentifiers<TermPropertiesClass.$Identifier>(
      TermPropertiesClass,
      query,
    );
  }

  async termPropertiesClasses(
    query?: $SparqlObjectSet.Query<TermPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, TermPropertiesClass>[]> {
    return this.$objects<TermPropertiesClass, TermPropertiesClass.$Identifier>(
      TermPropertiesClass,
      query,
    );
  }

  async termPropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<TermPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<TermPropertiesClass.$Identifier>(
      TermPropertiesClass,
      query,
    );
  }

  async unionPropertiesClass(
    identifier: UnionPropertiesClass.$Identifier,
  ): Promise<purify.Either<Error, UnionPropertiesClass>> {
    return (
      await this.unionPropertiesClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async unionPropertiesClassIdentifiers(
    query?: $SparqlObjectSet.Query<UnionPropertiesClass.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly UnionPropertiesClass.$Identifier[]>
  > {
    return this.$objectIdentifiers<UnionPropertiesClass.$Identifier>(
      UnionPropertiesClass,
      query,
    );
  }

  async unionPropertiesClasses(
    query?: $SparqlObjectSet.Query<UnionPropertiesClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, UnionPropertiesClass>[]> {
    return this.$objects<
      UnionPropertiesClass,
      UnionPropertiesClass.$Identifier
    >(UnionPropertiesClass, query);
  }

  async unionPropertiesClassesCount(
    query?: Pick<
      $SparqlObjectSet.Query<UnionPropertiesClass.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<UnionPropertiesClass.$Identifier>(
      UnionPropertiesClass,
      query,
    );
  }

  async uuidV4IriClass(
    identifier: UuidV4IriClass.$Identifier,
  ): Promise<purify.Either<Error, UuidV4IriClass>> {
    return (
      await this.uuidV4IriClasses({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async uuidV4IriClassIdentifiers(
    query?: $SparqlObjectSet.Query<UuidV4IriClass.$Identifier>,
  ): Promise<purify.Either<Error, readonly UuidV4IriClass.$Identifier[]>> {
    return this.$objectIdentifiers<UuidV4IriClass.$Identifier>(
      UuidV4IriClass,
      query,
    );
  }

  async uuidV4IriClasses(
    query?: $SparqlObjectSet.Query<UuidV4IriClass.$Identifier>,
  ): Promise<readonly purify.Either<Error, UuidV4IriClass>[]> {
    return this.$objects<UuidV4IriClass, UuidV4IriClass.$Identifier>(
      UuidV4IriClass,
      query,
    );
  }

  async uuidV4IriClassesCount(
    query?: Pick<$SparqlObjectSet.Query<UuidV4IriClass.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<UuidV4IriClass.$Identifier>(
      UuidV4IriClass,
      query,
    );
  }

  async classUnion(
    identifier: ClassUnion.$Identifier,
  ): Promise<purify.Either<Error, ClassUnion>> {
    return (
      await this.classUnions({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async classUnionIdentifiers(
    query?: $SparqlObjectSet.Query<ClassUnion.$Identifier>,
  ): Promise<purify.Either<Error, readonly ClassUnion.$Identifier[]>> {
    return this.$objectIdentifiers<ClassUnion.$Identifier>(ClassUnion, query);
  }

  async classUnions(
    query?: $SparqlObjectSet.Query<ClassUnion.$Identifier>,
  ): Promise<readonly purify.Either<Error, ClassUnion>[]> {
    return this.$objects<ClassUnion, ClassUnion.$Identifier>(ClassUnion, query);
  }

  async classUnionsCount(
    query?: Pick<$SparqlObjectSet.Query<ClassUnion.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<ClassUnion.$Identifier>(ClassUnion, query);
  }

  async interfaceUnion(
    identifier: InterfaceUnion.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnion>> {
    return (
      await this.interfaceUnions({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async interfaceUnionIdentifiers(
    query?: $SparqlObjectSet.Query<InterfaceUnion.$Identifier>,
  ): Promise<purify.Either<Error, readonly InterfaceUnion.$Identifier[]>> {
    return this.$objectIdentifiers<InterfaceUnion.$Identifier>(
      InterfaceUnion,
      query,
    );
  }

  async interfaceUnions(
    query?: $SparqlObjectSet.Query<InterfaceUnion.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnion>[]> {
    return this.$objects<InterfaceUnion, InterfaceUnion.$Identifier>(
      InterfaceUnion,
      query,
    );
  }

  async interfaceUnionsCount(
    query?: Pick<$SparqlObjectSet.Query<InterfaceUnion.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<InterfaceUnion.$Identifier>(
      InterfaceUnion,
      query,
    );
  }

  async interfaceUnionMember2(
    identifier: InterfaceUnionMember2.$Identifier,
  ): Promise<purify.Either<Error, InterfaceUnionMember2>> {
    return (
      await this.interfaceUnionMember2s({
        where: { identifiers: [identifier], type: "identifiers" },
      })
    )[0];
  }

  async interfaceUnionMember2Identifiers(
    query?: $SparqlObjectSet.Query<InterfaceUnionMember2.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly InterfaceUnionMember2.$Identifier[]>
  > {
    return this.$objectIdentifiers<InterfaceUnionMember2.$Identifier>(
      InterfaceUnionMember2,
      query,
    );
  }

  async interfaceUnionMember2s(
    query?: $SparqlObjectSet.Query<InterfaceUnionMember2.$Identifier>,
  ): Promise<readonly purify.Either<Error, InterfaceUnionMember2>[]> {
    return this.$objects<
      InterfaceUnionMember2,
      InterfaceUnionMember2.$Identifier
    >(InterfaceUnionMember2, query);
  }

  async interfaceUnionMember2sCount(
    query?: Pick<
      $SparqlObjectSet.Query<InterfaceUnionMember2.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.$objectsCount<InterfaceUnionMember2.$Identifier>(
      InterfaceUnionMember2,
      query,
    );
  }

  protected $mapBindingsToCount(
    bindings: readonly Record<
      string,
      rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode
    >[],
    variable: string,
  ): purify.Either<Error, number> {
    if (bindings.length === 0) {
      return purify.Left(new Error("empty result rows"));
    }
    if (bindings.length > 1) {
      return purify.Left(new Error("more than one result row"));
    }
    const count = bindings[0][variable];
    if (typeof count === "undefined") {
      return purify.Left(new Error("no 'count' variable in result row"));
    }
    if (count.termType !== "Literal") {
      return purify.Left(new Error("'count' variable is not a Literal"));
    }
    const parsedCount = Number.parseInt(count.value);
    if (Number.isNaN(parsedCount)) {
      return purify.Left(new Error("'count' variable is NaN"));
    }
    return purify.Either.of(parsedCount);
  }

  protected $mapBindingsToIdentifiers(
    bindings: readonly Record<
      string,
      rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode
    >[],
    variable: string,
  ): readonly rdfjs.NamedNode[] {
    const identifiers: rdfjs.NamedNode[] = [];
    for (const bindings_ of bindings) {
      const identifier = bindings_[variable];
      if (
        typeof identifier !== "undefined" &&
        identifier.termType === "NamedNode"
      ) {
        identifiers.push(identifier);
      }
    }
    return identifiers;
  }

  protected async $objectIdentifiers<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $sparqlWherePatterns: (parameters?: {
        subject?: sparqljs.Triple["subject"];
      }) => readonly sparqljs.Pattern[];
    },
    query?: $SparqlObjectSet.Query<ObjectIdentifierT>,
  ): Promise<purify.Either<Error, readonly ObjectIdentifierT[]>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    const wherePatterns = this.$wherePatterns(objectType, query?.where).filter(
      (pattern) => pattern.type !== "optional",
    );
    if (wherePatterns.length === 0) {
      return purify.Left(
        new Error("no required SPARQL WHERE patterns for identifiers"),
      );
    }

    const selectQueryString = this.$sparqlGenerator.stringify({
      distinct: true,
      limit: limit < Number.MAX_SAFE_INTEGER ? limit : undefined,
      offset,
      order: query?.order
        ? query.order(this.$objectVariable).concat()
        : [{ expression: this.$objectVariable }],
      prefixes: {},
      queryType: "SELECT",
      type: "query",
      variables: [this.$objectVariable],
      where: wherePatterns,
    });

    return purify.EitherAsync(
      async () =>
        this.$mapBindingsToIdentifiers(
          await this.$sparqlClient.queryBindings(selectQueryString),
          this.$objectVariable.value,
        ) as readonly ObjectIdentifierT[],
    );
  }

  async $objects<
    ObjectT,
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      $sparqlConstructQueryString: (
        parameters?: { subject?: sparqljs.Triple["subject"] } & Omit<
          sparqljs.ConstructQuery,
          "prefixes" | "queryType" | "type"
        > &
          sparqljs.GeneratorOptions,
      ) => string;
      $sparqlWherePatterns: (parameters?: {
        subject?: sparqljs.Triple["subject"];
      }) => readonly sparqljs.Pattern[];
    },
    query?: $SparqlObjectSet.Query<ObjectIdentifierT>,
  ): Promise<readonly purify.Either<Error, ObjectT>[]> {
    const identifiersEither = await this.$objectIdentifiers<ObjectIdentifierT>(
      objectType,
      query,
    );
    if (identifiersEither.isLeft()) {
      return [identifiersEither];
    }
    const identifiers = identifiersEither.unsafeCoerce();
    if (identifiers.length === 0) {
      return [];
    }

    const constructQueryString = objectType.$sparqlConstructQueryString({
      subject: this.$objectVariable,
      where: [
        {
          type: "values" as const,
          values: identifiers.map((identifier) => {
            const valuePatternRow: sparqljs.ValuePatternRow = {};
            valuePatternRow["?object"] = identifier as rdfjs.NamedNode;
            return valuePatternRow;
          }),
        },
      ],
    });

    let quads: readonly rdfjs.Quad[];
    try {
      quads = await this.$sparqlClient.queryQuads(constructQueryString);
    } catch (e) {
      const left = purify.Left<Error, ObjectT>(e as Error);
      return identifiers.map(() => left);
    }

    const dataset: rdfjs.DatasetCore = new N3.Store(quads.concat());

    return identifiers.map((identifier) =>
      objectType.$fromRdf({
        resource: new rdfjsResource.Resource<rdfjs.NamedNode>({
          dataset,
          identifier: identifier as rdfjs.NamedNode,
        }),
      }),
    );
  }

  protected async $objectsCount<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $sparqlWherePatterns: (parameters?: {
        subject?: sparqljs.Triple["subject"];
      }) => readonly sparqljs.Pattern[];
    },
    query?: $SparqlObjectSet.Query<ObjectIdentifierT>,
  ): Promise<purify.Either<Error, number>> {
    const wherePatterns = this.$wherePatterns(objectType, query?.where).filter(
      (pattern) => pattern.type !== "optional",
    );
    if (wherePatterns.length === 0) {
      return purify.Left(
        new Error("no required SPARQL WHERE patterns for count"),
      );
    }

    const selectQueryString = this.$sparqlGenerator.stringify({
      prefixes: {},
      queryType: "SELECT",
      type: "query",
      variables: [
        {
          expression: {
            aggregation: "COUNT",
            distinct: true,
            expression: this.$objectVariable,
            type: "aggregate",
          },
          variable: this.$countVariable,
        },
      ],
      where: wherePatterns,
    });

    return purify.EitherAsync(async ({ liftEither }) =>
      liftEither(
        this.$mapBindingsToCount(
          await this.$sparqlClient.queryBindings(selectQueryString),
          this.$countVariable.value,
        ),
      ),
    );
  }

  protected $wherePatterns<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $sparqlWherePatterns: (parameters?: {
        subject?: sparqljs.Triple["subject"];
      }) => readonly sparqljs.Pattern[];
    },
    where?: $SparqlObjectSet.Where<ObjectIdentifierT>,
  ): sparqljs.Pattern[] {
    const patterns: sparqljs.Pattern[] = [];

    // Patterns should be most to least specific.

    if (where) {
      switch (where.type) {
        case "identifiers":
          patterns.push({
            type: "values" as const,
            values: where.identifiers.map((identifier) => {
              const valuePatternRow: sparqljs.ValuePatternRow = {};
              valuePatternRow["?object"] = identifier as rdfjs.NamedNode;
              return valuePatternRow;
            }),
          });
          break;
        case "patterns":
          patterns.push(...where.patterns(this.$objectVariable));
          break;
      }
    }

    patterns.push(
      ...objectType.$sparqlWherePatterns({ subject: this.$objectVariable }),
    );

    return patterns;
  }
}

export namespace $SparqlObjectSet {
  export type Query<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  > = Omit<$ObjectSet.Query<ObjectIdentifierT>, "where"> & {
    readonly order?: (
      objectVariable: rdfjs.Variable,
    ) => readonly sparqljs.Ordering[];
    readonly where?: Where<ObjectIdentifierT>;
  };
  export type Where<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  > =
    | $ObjectSet.Where<ObjectIdentifierT>
    | {
        readonly patterns: (
          objectVariable: rdfjs.Variable,
        ) => readonly sparqljs.Pattern[];
        readonly type: "patterns";
      };
}

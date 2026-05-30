import datasetFactory from "@rdfjs/dataset";
import type {
  BlankNode,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import {
  PropertyPath as RdfxResourcePropertyPath,
  type Resource,
  ResourceSet,
} from "@rdfx/resource";
import { NTriplesIdentifier, NTriplesTerm } from "@rdfx/string";
import { Either, Left, Maybe, Right } from "purify-ts";
import { z } from "zod";

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

function $convertToScalarSet<
  ItemSourceT,
  ItemTargetT,
  Readonly extends boolean,
>(
  convertToItem: $ConversionFunction<ItemSourceT, ItemTargetT>,
  _readonly: Readonly,
) {
  type ItemTargetArrayT = Readonly extends true
    ? ReadonlyArray<ItemTargetT>
    : Array<ItemTargetT>;
  return (
    value: ItemSourceT | readonly ItemSourceT[] | undefined,
  ): Either<Error, ItemTargetArrayT> => {
    if (typeof value === "undefined") {
      return Either.of<Error, ItemTargetArrayT>(
        [] as unknown as ItemTargetArrayT,
      );
    }
    if (Array.isArray(value)) {
      return Either.sequence(value.map(convertToItem)) as Either<
        Error,
        ItemTargetArrayT
      >;
    }
    return convertToItem(value as ItemSourceT).map((value) => [
      value,
    ]) as Either<Error, ItemTargetArrayT>;
  };
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

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

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

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

export type $PropertyPath = RdfxResourcePropertyPath;

export namespace $PropertyPath {
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
      valueArray.map((value) => validateItem(schema.itemType, value)),
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
      .map((value) =>
        validateItem(schema.itemType, value).map(() => valueMaybe),
      )
      .orDefault(Either.of(valueMaybe));
}

type $ValidationFunction<SchemaT, ValueT> = (
  schema: SchemaT,
  value: ValueT,
) => Either<Error, ValueT>;

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
export interface FormObject {
  readonly $identifier: () => FormObject.Identifier;

  readonly $type: "FormObject";

  /**
   * Empty string set
   */
  readonly emptyStringSetProperty: readonly string[];

  /**
   * Nested object
   */
  readonly nestedObjectProperty: NestedObject;

  /**
   * Non-empty string set
   */
  readonly nonEmptyStringSetProperty: readonly string[];

  /**
   * Optional string
   */
  readonly optionalStringProperty: Maybe<string>;

  /**
   * Required int
   */
  readonly requiredIntProperty: number;

  /**
   * Required string
   */
  readonly requiredStringProperty: string;
}

export namespace FormObject {
  export function create(parameters: {
    readonly $identifier?:
      | (() => FormObject.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly emptyStringSetProperty?: string | readonly string[];
    readonly nestedObjectProperty: NestedObject;
    readonly nonEmptyStringSetProperty: string | readonly string[];
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredIntProperty: number;
    readonly requiredStringProperty: string;
  }): Either<Error, FormObject> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters.$identifier),
      emptyStringSetProperty: $convertToScalarSet(
        $identityConversionFunction,
        true,
      )(parameters.emptyStringSetProperty).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          FormObject.schema.properties.emptyStringSetProperty.type,
          value,
        ),
      ),
      nestedObjectProperty: Either.of(parameters.nestedObjectProperty),
      nonEmptyStringSetProperty: $convertToScalarSet(
        $identityConversionFunction,
        true,
      )(parameters.nonEmptyStringSetProperty).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          FormObject.schema.properties.nonEmptyStringSetProperty.type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          FormObject.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
      requiredIntProperty: Either.of(parameters.requiredIntProperty),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    })
      .map((properties) => ({ ...properties, $type: "FormObject" as const }))
      .map((object) => $monkeyPatchObject(object, { toJson, $toString }));
  }

  export function createUnsafe(parameters: {
    readonly $identifier?:
      | (() => FormObject.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly emptyStringSetProperty?: string | readonly string[];
    readonly nestedObjectProperty: NestedObject;
    readonly nonEmptyStringSetProperty: string | readonly string[];
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredIntProperty: number;
    readonly requiredStringProperty: string;
  }): FormObject {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export type Json = {
    readonly "@id": string;
    readonly "@type": "FormObject";
    readonly emptyStringSetProperty?: readonly string[];
    readonly nestedObjectProperty: NestedObject.Json;
    readonly nonEmptyStringSetProperty: readonly string[];
    readonly optionalStringProperty?: string;
    readonly requiredIntProperty: number;
    readonly requiredStringProperty: string;
  };

  export namespace Json {
    export function parse(json: unknown): Either<Error, Json> {
      const jsonSafeParseResult = schema().safeParse(json);
      if (!jsonSafeParseResult.success) {
        return Left(jsonSafeParseResult.error);
      }
      return Right(jsonSafeParseResult.data);
    }

    export function schema() {
      return z
        .object({
          "@id": z.string().min(1),
          "@type": z.literal("FormObject"),
          emptyStringSetProperty: z
            .string()
            .array()
            .optional()
            .readonly()
            .meta({ title: "Empty string set" }),
          nestedObjectProperty: NestedObject.Json.schema().meta({
            title: "Nested object",
          }),
          nonEmptyStringSetProperty: z
            .string()
            .array()
            .nonempty()
            .min(1)
            .readonly()
            .meta({
              title: "Non-empty string set",
            }),
          optionalStringProperty: z
            .string()
            .optional()
            .meta({ title: "Optional string" }),
          requiredIntProperty: z.number().meta({ title: "Required int" }),
          requiredStringProperty: z.string().meta({ title: "Required string" }),
        })
        .meta({}) satisfies z.ZodType<Json>;
    }

    export function uiSchema(parameters?: { scopePrefix?: string }): any {
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
                schema: { const: "FormObject" as const },
                scope: `${scopePrefix}/properties/@type`,
              },
              effect: "HIDE",
            },
            scope: `${scopePrefix}/properties/@type`,
            type: "Control",
          },
          {
            label: "Empty string set",
            scope: `${scopePrefix}/properties/emptyStringSetProperty`,
            type: "Control",
          },
          NestedObject.Json.uiSchema({
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
            label: "Required int",
            scope: `${scopePrefix}/properties/requiredIntProperty`,
            type: "Control",
          },
          {
            label: "Required string",
            scope: `${scopePrefix}/properties/requiredStringProperty`,
            type: "Control",
          },
        ],
        label: "FormObject",
        type: "Group",
      };
    }
  }

  export function fromJson($json: FormObject.Json): Either<Error, FormObject> {
    return $sequenceRecord({
      $identifier: Either.of<Error, BlankNode | NamedNode>(
        $json["@id"].startsWith("_:")
          ? dataFactory.blankNode($json["@id"].substring(2))
          : dataFactory.namedNode($json["@id"]),
      ),
      emptyStringSetProperty: Either.sequence<Error, string>(
        ($json["emptyStringSetProperty"] ?? []).map((item) =>
          Either.of<Error, string>(item),
        ),
      ),
      nestedObjectProperty: NestedObject.fromJson(
        $json["nestedObjectProperty"],
      ),
      nonEmptyStringSetProperty: Either.sequence<Error, string>(
        $json["nonEmptyStringSetProperty"].map((item) =>
          Either.of<Error, string>(item),
        ),
      ),
      optionalStringProperty: Maybe.fromNullable(
        $json["optionalStringProperty"],
      )
        .map((item) => Either.of<Error, string>(item).map(Maybe.of))
        .orDefault(Either.of(Maybe.empty())),
      requiredIntProperty: Either.of<Error, number>(
        $json["requiredIntProperty"],
      ),
      requiredStringProperty: Either.of<Error, string>(
        $json["requiredStringProperty"],
      ),
    }).chain(create);
  }

  export function isFormObject(object: $Object): object is FormObject {
    return object.$type === "FormObject";
  }

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
      emptyStringSetProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/emptyStringSetProperty",
        ),
        type: { kind: "Set" as const, itemType: { kind: "String" as const } },
      },
      nestedObjectProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://example.com/nestedObjectProperty"),
        get type() {
          return NestedObject.schema;
        },
      },
      nonEmptyStringSetProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/nonEmptyStringSetProperty",
        ),
        type: {
          kind: "Set" as const,
          itemType: { kind: "String" as const },
          minCount: 1,
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
      requiredIntProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://example.com/requiredIntProperty"),
        type: { kind: "Int" as const },
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

  export function toJson(_formObject: FormObject): FormObject.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _formObject.$identifier().termType === "BlankNode"
            ? `_:${_formObject.$identifier().value}`
            : _formObject.$identifier().value,
        "@type": _formObject.$type,
        emptyStringSetProperty: _formObject.emptyStringSetProperty.map(
          (item) => item,
        ),
        nestedObjectProperty: NestedObject.toJson(
          _formObject.nestedObjectProperty,
        ),
        nonEmptyStringSetProperty: _formObject.nonEmptyStringSetProperty.map(
          (item) => item,
        ),
        optionalStringProperty: _formObject.optionalStringProperty
          .map((item) => item)
          .extract(),
        requiredIntProperty: _formObject.requiredIntProperty,
        requiredStringProperty: _formObject.requiredStringProperty,
      } satisfies FormObject.Json),
    );
  }

  export const _toRdfResource: $_ToRdfResourceFunction<
    FormObject.Identifier,
    FormObject
  > = (parameters) => {
    parameters.resource.add(
      FormObject.schema.properties.emptyStringSetProperty.path,
      parameters.object.emptyStringSetProperty.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      FormObject.schema.properties.nestedObjectProperty.path,
      [
        NestedObject.toRdfResource(parameters.object.nestedObjectProperty, {
          graph: parameters.graph,
          resourceSet: parameters.resourceSet,
        }).identifier,
      ],
      parameters.graph,
    );
    parameters.resource.add(
      FormObject.schema.properties.nonEmptyStringSetProperty.path,
      parameters.object.nonEmptyStringSetProperty.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      FormObject.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      FormObject.schema.properties.requiredIntProperty.path,
      [
        $literalFactory.number(
          parameters.object.requiredIntProperty,
          $RdfVocabularies.xsd.int,
        ),
      ],
      parameters.graph,
    );
    parameters.resource.add(
      FormObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _formObject: FormObject,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _formObject.$identifier().toString(),
    });
  }

  export function $toString(_formObject: FormObject): string {
    return `FormObject(${JSON.stringify(_propertiesToStrings(_formObject))})`;
  }
}
export interface NestedObject {
  readonly $identifier: () => NestedObject.Identifier;

  readonly $type: "NestedObject";

  /**
   * Required string
   */
  readonly requiredStringProperty: string;
}

export namespace NestedObject {
  export function create(parameters: {
    readonly $identifier?:
      | (() => NestedObject.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly requiredStringProperty: string;
  }): Either<Error, NestedObject> {
    return $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters.$identifier),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    })
      .map((properties) => ({ ...properties, $type: "NestedObject" as const }))
      .map((object) => $monkeyPatchObject(object, { toJson, $toString }));
  }

  export function createUnsafe(parameters: {
    readonly $identifier?:
      | (() => NestedObject.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly requiredStringProperty: string;
  }): NestedObject {
    return create(parameters).unsafeCoerce();
  }

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export type Json = {
    readonly "@id": string;
    readonly "@type": "NestedObject";
    readonly requiredStringProperty: string;
  };

  export namespace Json {
    export function parse(json: unknown): Either<Error, Json> {
      const jsonSafeParseResult = schema().safeParse(json);
      if (!jsonSafeParseResult.success) {
        return Left(jsonSafeParseResult.error);
      }
      return Right(jsonSafeParseResult.data);
    }

    export function schema() {
      return z
        .object({
          "@id": z.string().min(1),
          "@type": z.literal("NestedObject"),
          requiredStringProperty: z.string().meta({ title: "Required string" }),
        })
        .meta({}) satisfies z.ZodType<Json>;
    }

    export function uiSchema(parameters?: { scopePrefix?: string }): any {
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
                schema: { const: "NestedObject" as const },
                scope: `${scopePrefix}/properties/@type`,
              },
              effect: "HIDE",
            },
            scope: `${scopePrefix}/properties/@type`,
            type: "Control",
          },
          {
            label: "Required string",
            scope: `${scopePrefix}/properties/requiredStringProperty`,
            type: "Control",
          },
        ],
        label: "NestedObject",
        type: "Group",
      };
    }
  }

  export function fromJson(
    $json: NestedObject.Json,
  ): Either<Error, NestedObject> {
    return $sequenceRecord({
      $identifier: Either.of<Error, BlankNode | NamedNode>(
        $json["@id"].startsWith("_:")
          ? dataFactory.blankNode($json["@id"].substring(2))
          : dataFactory.namedNode($json["@id"]),
      ),
      requiredStringProperty: Either.of<Error, string>(
        $json["requiredStringProperty"],
      ),
    }).chain(create);
  }

  export function isNestedObject(object: $Object): object is NestedObject {
    return object.$type === "NestedObject";
  }

  export const schema = {
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
  } as const;

  export function toJson(_nestedObject: NestedObject): NestedObject.Json {
    return JSON.parse(
      JSON.stringify({
        "@id":
          _nestedObject.$identifier().termType === "BlankNode"
            ? `_:${_nestedObject.$identifier().value}`
            : _nestedObject.$identifier().value,
        "@type": _nestedObject.$type,
        requiredStringProperty: _nestedObject.requiredStringProperty,
      } satisfies NestedObject.Json),
    );
  }

  export const _toRdfResource: $_ToRdfResourceFunction<
    NestedObject.Identifier,
    NestedObject
  > = (parameters) => {
    parameters.resource.add(
      NestedObject.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export function _propertiesToStrings(
    _nestedObject: NestedObject,
  ): Record<string, string> {
    return $compactRecord({
      $identifier: _nestedObject.$identifier().toString(),
    });
  }

  export function $toString(_nestedObject: NestedObject): string {
    return `NestedObject(${JSON.stringify(_propertiesToStrings(_nestedObject))})`;
  }
}
export type $Object = FormObject | NestedObject;

export namespace $Object {
  export const $toString = (value: $Object): string => {
    if (FormObject.isFormObject(value)) {
      return FormObject.$toString(value);
    }
    if (NestedObject.isNestedObject(value)) {
      return NestedObject.$toString(value);
    }

    throw new Error("unable to serialize to string");
  };

  export const fromJson = (value: $Object.Json): Either<Error, $Object> => {
    if (value["@type"] === "FormObject") {
      return FormObject.fromJson(value as FormObject.Json).map(
        (value) => value,
      );
    }
    if (value["@type"] === "NestedObject") {
      return NestedObject.fromJson(value as NestedObject.Json).map(
        (value) => value,
      );
    }

    throw new Error("unable to deserialize JSON");
  };

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export namespace Json {
    export const schema = () =>
      z
        .discriminatedUnion("$type", [
          FormObject.Json.schema(),
          NestedObject.Json.schema(),
        ])
        .readonly()
        .meta({});

    export function parse(json: unknown): Either<Error, Json> {
      const jsonSafeParseResult = schema().safeParse(json);
      if (!jsonSafeParseResult.success) {
        return Left(jsonSafeParseResult.error);
      }
      return Right(jsonSafeParseResult.data);
    }
  }

  export type Json = FormObject.Json | NestedObject.Json;

  export const schema = {
    kind: "ObjectUnion" as const,
    members: {
      FormObject: {
        discriminantValues: ["FormObject"],
        type: FormObject.schema,
      },
      NestedObject: {
        discriminantValues: ["NestedObject"],
        type: NestedObject.schema,
      },
    },
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

  export const toJson = (value: $Object): $Object.Json => {
    if (FormObject.isFormObject(value)) {
      return FormObject.toJson(value);
    }
    if (NestedObject.isNestedObject(value)) {
      return NestedObject.toJson(value);
    }

    throw new Error("unable to serialize to JSON");
  };

  export const toRdfResource: $ToRdfResourceFunction<$Object> = (
    object,
    options,
  ) => {
    if (FormObject.isFormObject(object)) {
      return FormObject.toRdfResource(object, options);
    }
    if (NestedObject.isNestedObject(object)) {
      return NestedObject.toRdfResource(object, options);
    }
    throw new Error("unrecognized type");
  };

  export const toRdfResourceValues = ((
    value,
    _options,
  ): (BlankNode | NamedNode)[] => {
    if (FormObject.isFormObject(value)) {
      return [
        FormObject.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (NestedObject.isNestedObject(value)) {
      return [
        NestedObject.toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) satisfies $ToRdfResourceValuesFunction<$Object>;
}

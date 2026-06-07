import datasetFactory from "@rdfjs/dataset";
import type { BlankNode, NamedNode, Quad_Graph, Variable } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import { type Resource, ResourceSet } from "@rdfx/resource";
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

namespace $RdfVocabularies {
  export const rdf = {
    first: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    ),
    nil: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
    ),
    rest: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
    ),
    subject: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
    ),
    type: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    ),
  };

  export const rdfs = {
    subClassOf: dataFactory.namedNode(
      "http://www.w3.org/2000/01/rdf-schema#subClassOf",
    ),
  };

  export const xsd = {
    boolean: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean"),
    byte: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#byte"),
    date: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#date"),
    dateTime: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#dateTime",
    ),
    decimal: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#decimal"),
    double: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#double"),
    float: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#float"),
    int: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#int"),
    integer: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer"),
    long: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#long"),
    negativeInteger: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#negativeInteger",
    ),
    nonNegativeInteger: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
    ),
    nonPositiveInteger: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
    ),
    positiveInteger: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#positiveInteger",
    ),
    short: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#short"),
    string: dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#string"),
    unsignedByte: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedByte",
    ),
    unsignedInt: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedInt",
    ),
    unsignedLong: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedLong",
    ),
    unsignedShort: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#unsignedShort",
    ),
  };
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
export type FormStruct = {
  readonly $identifier: () => FormStruct.Identifier;

  readonly $type: "FormStruct";

  /**
   * Empty string set
   */
  readonly emptyStringSetProperty: readonly string[];

  /**
   * Nested object
   */
  readonly nestedStructProperty: {
    readonly $identifier: () => BlankNode | NamedNode;

    /**
     * Required string
     */
    readonly requiredStringProperty: string;
  };

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
};

export namespace FormStruct {
  export const create: (parameters: {
    readonly $identifier?:
      | (() => FormStruct.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly emptyStringSetProperty?: string | readonly string[];
    readonly nestedStructProperty: {
      readonly $identifier?:
        | (() => BlankNode | NamedNode)
        | BlankNode
        | NamedNode
        | string;
      readonly requiredStringProperty: string;
    };
    readonly nonEmptyStringSetProperty: string | readonly string[];
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredIntProperty: number;
    readonly requiredStringProperty: string;
  }) => Either<Error, FormStruct> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(parameters.$identifier),
      emptyStringSetProperty: $convertToScalarSet(
        $identityConversionFunction,
        true,
      )(parameters.emptyStringSetProperty).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          FormStruct.schema.properties.emptyStringSetProperty.type,
          value,
        ),
      ),
      nestedStructProperty: ((parameters) =>
        $sequenceRecord({
          $identifier: $convertToIdentifierProperty(parameters.$identifier),
          requiredStringProperty: Either.of(parameters.requiredStringProperty),
        }).map((object) =>
          $monkeyPatchObject(object, {
            toJson: (_object) =>
              JSON.parse(
                JSON.stringify({
                  "@id":
                    _object.$identifier().termType === "BlankNode"
                      ? `_:${_object.$identifier().value}`
                      : _object.$identifier().value,
                  requiredStringProperty: _object.requiredStringProperty,
                } satisfies {
                  readonly "@id": string;
                  readonly requiredStringProperty: string;
                }),
              ),
            $toString: (_object) =>
              JSON.stringify(
                $compactRecord({
                  $identifier: _object.$identifier().toString(),
                }),
              ),
          }),
        ))(parameters.nestedStructProperty),
      nonEmptyStringSetProperty: $convertToScalarSet(
        $identityConversionFunction,
        true,
      )(parameters.nonEmptyStringSetProperty).chain((value) =>
        $validateArray($identityValidationFunction, true)(
          FormStruct.schema.properties.nonEmptyStringSetProperty.type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          FormStruct.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
      requiredIntProperty: Either.of(parameters.requiredIntProperty),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    })
      .map((properties) => ({ ...properties, $type: "FormStruct" as const }))
      .map((object) =>
        $monkeyPatchObject(object, {
          toJson: FormStruct.toJson,
          $toString: FormStruct.$toString,
        }),
      );

  export function createUnsafe(parameters: {
    readonly $identifier?:
      | (() => FormStruct.Identifier)
      | BlankNode
      | NamedNode
      | string;
    readonly emptyStringSetProperty?: string | readonly string[];
    readonly nestedStructProperty: {
      readonly $identifier?:
        | (() => BlankNode | NamedNode)
        | BlankNode
        | NamedNode
        | string;
      readonly requiredStringProperty: string;
    };
    readonly nonEmptyStringSetProperty: string | readonly string[];
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredIntProperty: number;
    readonly requiredStringProperty: string;
  }): FormStruct {
    return create(parameters).unsafeCoerce();
  }

  export const fromJson: (json: FormStruct.Json) => Either<Error, FormStruct> =
    ($json) =>
      $sequenceRecord({
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
        nestedStructProperty: (($json) =>
          $sequenceRecord({
            $identifier: Either.of<Error, BlankNode | NamedNode>(
              $json["@id"].startsWith("_:")
                ? dataFactory.blankNode($json["@id"].substring(2))
                : dataFactory.namedNode($json["@id"]),
            ),
            requiredStringProperty: Either.of<Error, string>(
              $json["requiredStringProperty"],
            ),
          }).chain((parameters) =>
            $sequenceRecord({
              $identifier: $convertToIdentifierProperty(parameters.$identifier),
              requiredStringProperty: Either.of(
                parameters.requiredStringProperty,
              ),
            }).map((object) =>
              $monkeyPatchObject(object, {
                toJson: (_object) =>
                  JSON.parse(
                    JSON.stringify({
                      "@id":
                        _object.$identifier().termType === "BlankNode"
                          ? `_:${_object.$identifier().value}`
                          : _object.$identifier().value,
                      requiredStringProperty: _object.requiredStringProperty,
                    } satisfies {
                      readonly "@id": string;
                      readonly requiredStringProperty: string;
                    }),
                  ),
                $toString: (_object) =>
                  JSON.stringify(
                    $compactRecord({
                      $identifier: _object.$identifier().toString(),
                    }),
                  ),
              }),
            ),
          ))($json["nestedStructProperty"]),
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
      }).chain(FormStruct.create);

  export type Identifier = BlankNode | NamedNode;

  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export function isFormStruct(object: $Object): object is FormStruct {
    return object.$type === "FormStruct";
  }

  export type Json = {
    readonly "@id": string;
    readonly "@type": "FormStruct";
    readonly emptyStringSetProperty?: readonly string[];
    readonly nestedStructProperty: {
      readonly "@id": string;
      readonly requiredStringProperty: string;
    };
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
          "@type": z.literal("FormStruct"),
          emptyStringSetProperty: z
            .string()
            .array()
            .optional()
            .readonly()
            .meta({ title: "Empty string set" }),
          nestedStructProperty: z
            .object({
              "@id": z.string().min(1),
              requiredStringProperty: z
                .string()
                .meta({ title: "Required string" }),
            })
            .meta({})
            .meta({ title: "Nested object" }),
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

    export const uiSchema = (parameters?: { scopePrefix?: string }): any => {
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
                schema: { const: "FormStruct" as const },
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
          ((parameters?: { scopePrefix?: string }): any => {
            const scopePrefix = parameters?.scopePrefix ?? "#";
            return {
              elements: [
                {
                  label: "Identifier",
                  scope: `${scopePrefix}/properties/@id`,
                  type: "Control",
                },
                {
                  label: "Required string",
                  scope: `${scopePrefix}/properties/requiredStringProperty`,
                  type: "Control",
                },
              ],
              type: "Group",
            };
          })({ scopePrefix: `${scopePrefix}/properties/nestedStructProperty` }),
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
        type: "Group",
        label: "FormStruct",
      };
    };
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
      nestedStructProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://example.com/nestedStructProperty"),
        type: {
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
        } as const,
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

  export type Schema = typeof schema;

  export const toJson: (_formStruct: FormStruct) => FormStruct.Json = (
    _formStruct,
  ) =>
    JSON.parse(
      JSON.stringify({
        "@id":
          _formStruct.$identifier().termType === "BlankNode"
            ? `_:${_formStruct.$identifier().value}`
            : _formStruct.$identifier().value,
        "@type": _formStruct.$type,
        emptyStringSetProperty: _formStruct.emptyStringSetProperty.map(
          (item) => item,
        ),
        nestedStructProperty: ((_object) =>
          JSON.parse(
            JSON.stringify({
              "@id":
                _object.$identifier().termType === "BlankNode"
                  ? `_:${_object.$identifier().value}`
                  : _object.$identifier().value,
              requiredStringProperty: _object.requiredStringProperty,
            } satisfies {
              readonly "@id": string;
              readonly requiredStringProperty: string;
            }),
          ))(_formStruct.nestedStructProperty),
        nonEmptyStringSetProperty: _formStruct.nonEmptyStringSetProperty.map(
          (item) => item,
        ),
        optionalStringProperty: _formStruct.optionalStringProperty
          .map((item) => item)
          .extract(),
        requiredIntProperty: _formStruct.requiredIntProperty,
        requiredStringProperty: _formStruct.requiredStringProperty,
      } satisfies FormStruct.Json),
    );

  export const _toRdfResource: $_ToRdfResourceFunction<
    FormStruct.Identifier,
    FormStruct
  > = (parameters) => {
    parameters.resource.add(
      FormStruct.schema.properties.emptyStringSetProperty.path,
      parameters.object.emptyStringSetProperty.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      FormStruct.schema.properties.nestedStructProperty.path,
      [
        $wrap_ToRdfResourceFunction<
          BlankNode | NamedNode,
          {
            readonly $identifier: () => BlankNode | NamedNode;

            /**
             * Required string
             */
            readonly requiredStringProperty: string;
          }
        >((parameters) => {
          parameters.resource.add(
            dataFactory.namedNode("http://example.com/requiredStringProperty"),
            [$literalFactory.string(parameters.object.requiredStringProperty)],
            parameters.graph,
          );
          return parameters.resource;
        })(parameters.object.nestedStructProperty, {
          graph: parameters.graph,
          resourceSet: parameters.resourceSet,
        }).identifier,
      ],
      parameters.graph,
    );
    parameters.resource.add(
      FormStruct.schema.properties.nonEmptyStringSetProperty.path,
      parameters.object.nonEmptyStringSetProperty.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      parameters.graph,
    );
    parameters.resource.add(
      FormStruct.schema.properties.optionalStringProperty.path,
      parameters.object.optionalStringProperty
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      parameters.graph,
    );
    parameters.resource.add(
      FormStruct.schema.properties.requiredIntProperty.path,
      [
        $literalFactory.number(
          parameters.object.requiredIntProperty,
          $RdfVocabularies.xsd.int,
        ),
      ],
      parameters.graph,
    );
    parameters.resource.add(
      FormStruct.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export const $toString: (_formStruct: FormStruct) => string = (_formStruct) =>
    `FormStruct(${JSON.stringify(toStringRecord(_formStruct))})`;

  export const toStringRecord: (
    _formStruct: FormStruct,
  ) => Record<string, string> = (_formStruct) =>
    $compactRecord({ $identifier: _formStruct.$identifier().toString() });
}
type $Object = FormStruct;

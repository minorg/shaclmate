import type {
  BlankNode,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import { datasetFactory } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import {
  PropertyPath as RdfxResourcePropertyPath,
  type Resource,
  ResourceSet,
} from "@rdfx/resource";
import { NTriplesIdentifier } from "@rdfx/string";
import { Either, Left, Maybe, Right } from "purify-ts";
import { z } from "zod";

export type $_ToRdfResourceFunction<
  IdentifierT extends Resource.Identifier,
  ObjectT extends object,
> = (parameters: {
  graph: Exclude<Quad_Graph, Variable> | undefined;
  ignoreRdfType: boolean;
  object: ObjectT;
  resource: Resource<IdentifierT>;
  resourceSet: ResourceSet;
}) => void;

function $arrayFromJsonArray<ItemJsonValueT, ItemT, ItemSchemaT>(
  itemFromJsonValue: $FromJsonValueFunction<ItemJsonValueT, ItemT, ItemSchemaT>,
): $FromJsonValueFunction<
  ItemJsonValueT[] | undefined,
  ItemT[],
  $CollectionSchema<ItemSchemaT>
> {
  return (arrayJsonValue, options) => {
    if (arrayJsonValue === undefined) {
      return Either.of([]);
    }
    const { schema, ...otherOptions } = options;
    const itemFromJsonValueOptions = {
      ...otherOptions,
      schema: schema.itemType,
    };
    return Either.sequence(
      arrayJsonValue.map((itemJsonValue) =>
        itemFromJsonValue(itemJsonValue, itemFromJsonValueOptions),
      ),
    );
  };
}

function $arrayToJsonArray<ItemT, ItemJsonValueT>(
  itemToJsonValue: $ToJsonValueFunction<ItemT, ItemJsonValueT>,
): $ToJsonValueFunction<readonly ItemT[], ItemJsonValueT[]> {
  return (values) => values.map(itemToJsonValue);
}

const $blankNodeFromJsonString: $FromJsonValueFunction<
  string,
  BlankNode,
  object
> = (jsonValue) => Right(dataFactory.blankNode(jsonValue.substring(2)));

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

type $ConversionFunction<
  SourceT,
  TargetT,
  DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
> = (
  source: SourceT,
  defaultNamespace?: DefaultNamespaceT,
) => Either<Error, TargetT>;

function $convertToIdentifierProperty<
  DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
>(
  identifier:
    | (() => BlankNode | NamedNode)
    | BlankNode
    | NamedNode
    | (keyof DefaultNamespaceT & string)
    | undefined,
  defaultNamespace?: DefaultNamespaceT,
): Either<Error, () => BlankNode | NamedNode> {
  switch (typeof identifier) {
    case "function":
      return Either.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return Either.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = defaultNamespace
        ? defaultNamespace(identifier)
        : dataFactory.namedNode(identifier);
      return Either.of(() => captureIdentifier);
    }
    case "undefined": {
      const captureIdentifier = dataFactory.blankNode();
      return Either.of(() => captureIdentifier);
    }
  }
}

function $convertToMaybe<
  DefaultNamespaceT extends $NamespaceBuilder,
  ItemSourceT,
  ItemTargetT,
>(
  convertToItem: $ConversionFunction<
    ItemSourceT,
    ItemTargetT,
    DefaultNamespaceT
  >,
): $ConversionFunction<
  ItemSourceT | Maybe<ItemTargetT> | undefined,
  Maybe<ItemTargetT>,
  DefaultNamespaceT
> {
  return (value, defaultNamespace) => {
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

    return convertToItem(value, defaultNamespace).map(Maybe.of);
  };
}

function $convertToScalarSet<
  DefaultNamespaceT extends $NamespaceBuilder,
  ItemSourceT,
  ItemTargetT,
>(
  convertToItem: $ConversionFunction<
    ItemSourceT,
    ItemTargetT,
    DefaultNamespaceT
  >,
): $ConversionFunction<
  ItemSourceT | readonly ItemSourceT[] | undefined,
  readonly ItemTargetT[],
  DefaultNamespaceT
> {
  return (value, defaultNamespace) => {
    if (typeof value === "undefined") {
      return Either.of<Error, readonly ItemTargetT[]>(
        [] as unknown as readonly ItemTargetT[],
      );
    }
    if (Array.isArray(value)) {
      return Either.sequence(
        value.map((value) => convertToItem(value, defaultNamespace)),
      ) as Either<Error, readonly ItemTargetT[]>;
    }
    return convertToItem(value as ItemSourceT).map((value) => [
      value,
    ]) as Either<Error, readonly ItemTargetT[]>;
  };
}

export type $FromJsonObjectFunction<
  JsonObjectT extends object,
  ValueT,
  ValueSchemaT,
> = (
  jsonObject: JsonObjectT,
  options: { context?: unknown; schema: ValueSchemaT },
) => Either<Error, ValueT>;

export type $FromJsonValueFunction<JsonValueT, ValueT, ValueSchemaT> = (
  jsonValue: JsonValueT,
  options: { context?: unknown; schema: ValueSchemaT },
) => Either<Error, ValueT>;

const $identifierFromJsonString: $FromJsonValueFunction<
  string,
  BlankNode | NamedNode,
  $IdentifierSchema
> = (jsonString, options) =>
  jsonString.startsWith("_:")
    ? ($blankNodeFromJsonString(jsonString, options) as Either<
        Error,
        BlankNode | NamedNode
      >)
    : ($iriFromJsonString(jsonString, options) as Either<
        Error,
        BlankNode | NamedNode
      >);

interface $IdentifierSchema {
  readonly hasValues?: readonly NamedNode[];
  readonly kind: "Identifier";
}

function $identityConversionFunction<T>(
  value: T,
  _defaultNamespace?: $NamespaceBuilder,
): Either<Error, T> {
  return Either.of(value);
}

function $identityValidationFunction<T>(
  _schema: unknown,
  value: T,
): Either<Error, T> {
  return Either.of(value);
}

function $intFromJsonNumber<IntT extends number>(
  jsonNumber: IntT,
  _options: Parameters<
    $FromJsonValueFunction<IntT, IntT, $NumericSchema<IntT>>
  >[1],
): Either<Error, IntT> {
  return Either.of(jsonNumber);
}

function $iriFromJsonString<IriT extends string = string>(
  jsonValue: IriT,
  _options: Parameters<
    $FromJsonValueFunction<IriT, NamedNode<IriT>, object>
  >[1],
): Either<Error, NamedNode<IriT>> {
  return Either.of(dataFactory.namedNode(jsonValue));
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

function $maybeFromJsonValue<ItemJsonValueT, ItemT, ItemSchemaT>(
  itemFromJsonValue: $FromJsonValueFunction<ItemJsonValueT, ItemT, ItemSchemaT>,
): $FromJsonValueFunction<
  ItemJsonValueT | undefined,
  Maybe<ItemT>,
  $MaybeSchema<ItemSchemaT>
> {
  return (value, options) => {
    if (value === undefined) {
      return Either.of(Maybe.empty());
    }
    const { schema, ...otherOptions } = options;
    return itemFromJsonValue(value, {
      ...otherOptions,
      schema: schema.itemType,
    }).map((value) => Maybe.of(value));
  };
}

interface $MaybeSchema<ItemSchemaT> {
  readonly itemType: ItemSchemaT;
  readonly kind: "Option";
}

function $maybeToJsonValue<ItemT, ItemJsonValueT>(
  itemToJsonValue: $ToJsonValueFunction<ItemT, ItemJsonValueT>,
): $ToJsonValueFunction<Maybe<ItemT>, ItemJsonValueT | undefined> {
  return (value) => value.map((value) => itemToJsonValue(value)).extract();
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

/**
 * NamespaceBuilder type excerpted from @rdfjs/namespace (MIT license) in lieu of a type import.
 */
export type $NamespaceBuilder<TermNames extends string = any> = Record<
  TermNames,
  NamedNode
> &
  ((property?: TemplateStringsArray | TermNames) => NamedNode);

interface $NumericSchema<T> {
  readonly datatype: NamedNode;
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly T[];
  readonly kind: "BigDecimal" | "BigInt" | "Float" | "Int";
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

function $primitiveToJsonValue<PrimitiveT extends boolean | number | string>(
  primitive: PrimitiveT,
): PrimitiveT {
  return primitive;
}

export type $PropertyPath = RdfxResourcePropertyPath;

export namespace $PropertyPath {
  export const schema: Readonly<object> = {};

  export type Schema = typeof schema;

  export const toRdfResource: $ToRdfResourceFunction<
    Resource.Identifier,
    $PropertyPath
  > = RdfxResourcePropertyPath.toResource;

  export const $toString = RdfxResourcePropertyPath.toString;
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

function $stringFromJsonString<StringT extends string>(
  jsonString: StringT,
  _options: Parameters<
    $FromJsonValueFunction<StringT, StringT, $StringSchema<StringT>>
  >[1],
): Either<Error, StringT> {
  return Either.of(jsonString);
}

interface $StringSchema<StringT extends string> {
  readonly datatype: NamedNode;
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly StringT[];
  readonly languageIn?: readonly string[];
  readonly kind: "String";
}

export type $ToJsonObjectFunction<T, JsonT extends object> = (
  value: T,
) => JsonT;

export type $ToJsonValueFunction<T, JsonValueT> = (value: T) => JsonValueT;

export type $ToRdfResourceFunction<
  IdentifierT extends Resource.Identifier,
  ObjectT extends object,
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

export type $ToStringFunction<T> = (value: T) => string;

export type $ToStringRecordFunction<T> = (value: T) => Record<string, string>;

function $validateArray<ItemSchemaT, ItemValueT>(
  validateItem: $ValidationFunction<ItemSchemaT, ItemValueT>,
): $ValidationFunction<$CollectionSchema<ItemSchemaT>, readonly ItemValueT[]> {
  return (schema, valueArray) => {
    if (schema.minCount !== undefined && valueArray.length < schema.minCount) {
      return Left(
        new Error(
          `value array has length (${valueArray.length}) less than minCount (${schema.minCount})`,
        ),
      ) as Either<Error, readonly ItemValueT[]>;
    }

    return Either.sequence(
      valueArray.map((value) => validateItem(schema.itemType, value)),
    ) as Either<Error, readonly ItemValueT[]>;
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
): $ToRdfResourceFunction<IdentifierT, ObjectT>;
function $wrap_ToRdfResourceFunction<
  _IdentifierT extends BlankNode,
  ObjectT extends object,
>(
  _toRdfResourceFunction: $_ToRdfResourceFunction<BlankNode, ObjectT>,
): $ToRdfResourceFunction<BlankNode, ObjectT>;
function $wrap_ToRdfResourceFunction<
  IdentifierT extends Resource.Identifier,
  ObjectT extends object & { $identifier?: () => IdentifierT },
>(
  _toRdfResourceFunction: $_ToRdfResourceFunction<IdentifierT, ObjectT>,
): $ToRdfResourceFunction<IdentifierT, ObjectT> {
  return (object, options) => {
    let { graph, ignoreRdfType = false, resourceSet } = options ?? {};
    if (!resourceSet) {
      resourceSet = new ResourceSet({
        dataFactory: dataFactory,
        dataset: datasetFactory.dataset(),
      });
    }
    const resource = (
      object.$identifier
        ? resourceSet.resource(object.$identifier())
        : resourceSet.resource(dataFactory.blankNode())
    ) as Resource<IdentifierT>;
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

const $xsd_int = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#int");

const $xsd_string = dataFactory.namedNode(
  "http://www.w3.org/2001/XMLSchema#string",
);

export type FormStruct = {
  readonly $identifier: () => FormStruct.Identifier;

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
      ((value, options) => [
        $wrap_ToRdfResourceFunction<
          BlankNode | NamedNode,
          {
            readonly $identifier: () => BlankNode | NamedNode;

            /**
             * Required string
             */
            readonly requiredStringProperty: string;
          }
        >(((parameters) => {
          parameters.resource.add(
            dataFactory.namedNode("http://example.com/requiredStringProperty"),
            [$literalFactory.string(parameters.object.requiredStringProperty)],
            parameters.graph,
          );
          return parameters.resource;
        }) satisfies $_ToRdfResourceFunction<
          BlankNode | NamedNode,
          {
            readonly $identifier: () => BlankNode | NamedNode;

            /**
             * Required string
             */
            readonly requiredStringProperty: string;
          }
        >)(value, { graph: options.graph, resourceSet: options.resourceSet })
          .identifier,
      ])(parameters.object.nestedStructProperty, {
        ignoreRdfType: parameters.ignoreRdfType,
        graph: parameters.graph,
        objectSchema: {
          literals: ["", ".schema"],
          placeholders: ["FormStruct"],
          trim: false,
          oneline: false,
        },
        resource: parameters.resource,
        resourceSet: parameters.resourceSet,
        propertyPath: FormStruct.schema.properties.nestedStructProperty.path,
      }),
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
      [$literalFactory.number(parameters.object.requiredIntProperty, $xsd_int)],
      parameters.graph,
    );
    parameters.resource.add(
      FormStruct.schema.properties.requiredStringProperty.path,
      [$literalFactory.string(parameters.object.requiredStringProperty)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const $toString: $ToStringFunction<Pick<FormStruct, "$identifier">> = (
    _formStruct,
  ) => `FormStruct(${JSON.stringify(FormStruct.toStringRecord(_formStruct))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: FormStruct.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, FormStruct.Discriminated> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("FormStruct" as const),
      emptyStringSetProperty: $convertToScalarSet($identityConversionFunction)(
        parameters.emptyStringSetProperty,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          FormStruct.schema.properties.emptyStringSetProperty.type,
          value,
        ),
      ),
      nestedStructProperty: (<
        $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
      >(
        value: {
          readonly $identifier?:
            | (() => BlankNode | NamedNode)
            | BlankNode
            | NamedNode
            | (keyof $DefaultNamespaceT & string);
          readonly requiredStringProperty: string;
        },
        $defaultNamespace?: $DefaultNamespaceT,
      ) =>
        ((parameters) =>
          $sequenceRecord({
            $identifier: $convertToIdentifierProperty(
              parameters.$identifier,
              parameters.$defaultNamespace,
            ),
            requiredStringProperty: Either.of(
              parameters.requiredStringProperty,
            ),
          }).map((object) =>
            $monkeyPatchObject(object, {
              toJson: ((_object) =>
                JSON.parse(
                  JSON.stringify({
                    "@id":
                      _object.$identifier().termType === "BlankNode"
                        ? `_:${_object.$identifier().value}`
                        : _object.$identifier().value,
                    requiredStringProperty: $primitiveToJsonValue<string>(
                      _object.requiredStringProperty,
                    ),
                  }),
                )) satisfies $ToJsonObjectFunction<
                {
                  readonly $identifier: () => BlankNode | NamedNode;

                  /**
                   * Required string
                   */
                  readonly requiredStringProperty: string;
                },
                { "@id": string; requiredStringProperty: string }
              >,
              $toString: ((_object) =>
                JSON.stringify(
                  ((_object) =>
                    $compactRecord({
                      $identifier: _object.$identifier().toString(),
                    }))(_object),
                )) satisfies $ToStringFunction<{
                readonly $identifier: () => BlankNode | NamedNode;
              }>,
            }),
          ))({ ...value, $defaultNamespace }))(
        parameters.nestedStructProperty,
        parameters.$defaultNamespace,
      ),
      nonEmptyStringSetProperty: $convertToScalarSet(
        $identityConversionFunction,
      )(
        parameters.nonEmptyStringSetProperty,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          FormStruct.schema.properties.nonEmptyStringSetProperty.type,
          value,
        ),
      ),
      optionalStringProperty: $convertToMaybe($identityConversionFunction)(
        parameters.optionalStringProperty,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          FormStruct.schema.properties.optionalStringProperty.type,
          value,
        ),
      ),
      requiredIntProperty: Either.of(parameters.requiredIntProperty),
      requiredStringProperty: Either.of(parameters.requiredStringProperty),
    }).map((object) =>
      $monkeyPatchObject(object, {
        toJson: FormStruct.toJsonObject,
        $toString: FormStruct.$toString,
      }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => FormStruct.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly emptyStringSetProperty?: string | readonly string[];
    readonly nestedStructProperty: {
      readonly $identifier?:
        | (() => BlankNode | NamedNode)
        | BlankNode
        | NamedNode
        | (keyof $DefaultNamespaceT & string);
      readonly requiredStringProperty: string;
    };
    readonly nonEmptyStringSetProperty: string | readonly string[];
    readonly optionalStringProperty?: string | Maybe<string>;
    readonly requiredIntProperty: number;
    readonly requiredStringProperty: string;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: FormStruct.CreateParameters<$DefaultNamespaceT>,
  ) => FormStruct.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = FormStruct & { readonly $type: "FormStruct" };

  export const fromJsonObject: $FromJsonObjectFunction<
    FormStruct.Json,
    FormStruct.Discriminated,
    FormStruct.Schema
  > = ($jsonObject, options) =>
    $sequenceRecord({
      $identifier: $identifierFromJsonString($jsonObject["@id"], {
        ...options,
        schema: FormStruct.schema.properties.$identifier.type,
      }),
      emptyStringSetProperty: $arrayFromJsonArray(
        $stringFromJsonString<string>,
      )($jsonObject["emptyStringSetProperty"], {
        ...options,
        schema: FormStruct.schema.properties.emptyStringSetProperty.type,
      }),
      nestedStructProperty: (($jsonObject, options) =>
        $sequenceRecord({
          $identifier: $identifierFromJsonString($jsonObject["@id"], {
            ...options,
            schema: { kind: "Identifier" as const },
          }),
          requiredStringProperty: $stringFromJsonString<string>(
            $jsonObject["requiredStringProperty"],
            {
              ...options,
              schema: { kind: "String" as const, datatype: $xsd_string },
            },
          ),
        }).chain(((parameters) =>
          $sequenceRecord({
            $identifier: $convertToIdentifierProperty(
              parameters.$identifier,
              parameters.$defaultNamespace,
            ),
            requiredStringProperty: Either.of(
              parameters.requiredStringProperty,
            ),
          }).map((object) =>
            $monkeyPatchObject(object, {
              toJson: ((_object) =>
                JSON.parse(
                  JSON.stringify({
                    "@id":
                      _object.$identifier().termType === "BlankNode"
                        ? `_:${_object.$identifier().value}`
                        : _object.$identifier().value,
                    requiredStringProperty: $primitiveToJsonValue<string>(
                      _object.requiredStringProperty,
                    ),
                  }),
                )) satisfies $ToJsonObjectFunction<
                {
                  readonly $identifier: () => BlankNode | NamedNode;

                  /**
                   * Required string
                   */
                  readonly requiredStringProperty: string;
                },
                { "@id": string; requiredStringProperty: string }
              >,
              $toString: ((_object) =>
                JSON.stringify(
                  ((_object) =>
                    $compactRecord({
                      $identifier: _object.$identifier().toString(),
                    }))(_object),
                )) satisfies $ToStringFunction<{
                readonly $identifier: () => BlankNode | NamedNode;
              }>,
            }),
          )) satisfies <
          $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
        >(parameters: {
          readonly $defaultNamespace?: $DefaultNamespaceT;
          readonly $identifier?:
            | (() => BlankNode | NamedNode)
            | BlankNode
            | NamedNode
            | (keyof $DefaultNamespaceT & string);
          readonly requiredStringProperty: string;
        }) => Either<
          Error,
          {
            readonly $identifier: () => BlankNode | NamedNode;

            /**
             * Required string
             */
            readonly requiredStringProperty: string;
          }
        >))($jsonObject["nestedStructProperty"], {
        ...options,
        schema: FormStruct.schema.properties.nestedStructProperty.type,
      }),
      nonEmptyStringSetProperty: $arrayFromJsonArray(
        $stringFromJsonString<string>,
      )($jsonObject["nonEmptyStringSetProperty"], {
        ...options,
        schema: FormStruct.schema.properties.nonEmptyStringSetProperty.type,
      }),
      optionalStringProperty: $maybeFromJsonValue(
        $stringFromJsonString<string>,
      )($jsonObject["optionalStringProperty"], {
        ...options,
        schema: FormStruct.schema.properties.optionalStringProperty.type,
      }),
      requiredIntProperty: $intFromJsonNumber<number>(
        $jsonObject["requiredIntProperty"],
        {
          ...options,
          schema: FormStruct.schema.properties.requiredIntProperty.type,
        },
      ),
      requiredStringProperty: $stringFromJsonString<string>(
        $jsonObject["requiredStringProperty"],
        {
          ...options,
          schema: FormStruct.schema.properties.requiredStringProperty.type,
        },
      ),
    }).chain(FormStruct.create);

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isFormStruct: (
    object: $Object,
  ) => object is FormStruct.Discriminated = (
    object,
  ): object is FormStruct.Discriminated => object.$type === "FormStruct";

  export type Json = {
    "@id": string;
    emptyStringSetProperty?: string[];
    nestedStructProperty: { "@id": string; requiredStringProperty: string };
    nonEmptyStringSetProperty: string[];
    optionalStringProperty?: string;
    requiredIntProperty: number;
    requiredStringProperty: string;
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
      return z.object({
        "@id": z.string().min(1),
        emptyStringSetProperty: z
          .array(z.string())
          .optional()
          .meta({ title: "Empty string set" }),
        nestedStructProperty: z
          .object({
            "@id": z.string().min(1),
            requiredStringProperty: z
              .string()
              .meta({ title: "Required string" }),
          })
          .meta({ title: "Nested object" }),
        nonEmptyStringSetProperty: z
          .array(z.string())
          .min(1)
          .meta({ title: "Non-empty string set" }),
        optionalStringProperty: z
          .string()
          .optional()
          .meta({ title: "Optional string" }),
        requiredIntProperty: z.number().meta({ title: "Required int" }),
        requiredStringProperty: z.string().meta({ title: "Required string" }),
      }) satisfies z.ZodType<Json>;
    }

    export const uiSchema = (_options?: { scopePrefix?: string }): any => {
      return {
        elements: [
          {
            label: "Identifier",
            scope: `${_options?.scopePrefix ?? "#"}/properties/@id`,
            type: "Control",
          },
          {
            label: "Empty string set",
            scope: `${_options?.scopePrefix ?? "#"}/properties/emptyStringSetProperty`,
            type: "Control",
          },
          ((_options?: { scopePrefix?: string }): any => {
            return {
              elements: [
                {
                  label: "Identifier",
                  scope: `${_options?.scopePrefix ?? "#"}/properties/@id`,
                  type: "Control",
                },
                {
                  label: "Required string",
                  scope: `${_options?.scopePrefix ?? "#"}/properties/requiredStringProperty`,
                  type: "Control",
                },
              ],
              type: "Group",
            };
          })({ scopePrefix: _options?.scopePrefix ?? "#" }),
          {
            label: "Non-empty string set",
            scope: `${_options?.scopePrefix ?? "#"}/properties/nonEmptyStringSetProperty`,
            type: "Control",
          },
          {
            label: "Optional string",
            scope: `${_options?.scopePrefix ?? "#"}/properties/optionalStringProperty`,
            type: "Control",
          },
          {
            label: "Required int",
            scope: `${_options?.scopePrefix ?? "#"}/properties/requiredIntProperty`,
            type: "Control",
          },
          {
            label: "Required string",
            scope: `${_options?.scopePrefix ?? "#"}/properties/requiredStringProperty`,
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
        type: {
          kind: "Set" as const,
          itemType: { kind: "String" as const, datatype: $xsd_string },
        },
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
              type: { kind: "String" as const, datatype: $xsd_string },
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
          itemType: { kind: "String" as const, datatype: $xsd_string },
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
          itemType: { kind: "String" as const, datatype: $xsd_string },
        },
      },
      requiredIntProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://example.com/requiredIntProperty"),
        type: { kind: "Int" as const, datatype: $xsd_int },
      },
      requiredStringProperty: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://example.com/requiredStringProperty",
        ),
        type: { kind: "String" as const, datatype: $xsd_string },
      },
    },
  } as const;

  export type Schema = typeof schema;

  export const toJsonObject: $ToJsonObjectFunction<
    FormStruct,
    FormStruct.Json
  > = (_formStruct) =>
    JSON.parse(
      JSON.stringify({
        "@id":
          _formStruct.$identifier().termType === "BlankNode"
            ? `_:${_formStruct.$identifier().value}`
            : _formStruct.$identifier().value,
        emptyStringSetProperty: $arrayToJsonArray(
          $primitiveToJsonValue<string>,
        )(_formStruct.emptyStringSetProperty),
        nestedStructProperty: ((_object) =>
          JSON.parse(
            JSON.stringify({
              "@id":
                _object.$identifier().termType === "BlankNode"
                  ? `_:${_object.$identifier().value}`
                  : _object.$identifier().value,
              requiredStringProperty: $primitiveToJsonValue<string>(
                _object.requiredStringProperty,
              ),
            }),
          ))(_formStruct.nestedStructProperty),
        nonEmptyStringSetProperty: $arrayToJsonArray(
          $primitiveToJsonValue<string>,
        )(_formStruct.nonEmptyStringSetProperty),
        optionalStringProperty: $maybeToJsonValue(
          $primitiveToJsonValue<string>,
        )(_formStruct.optionalStringProperty),
        requiredIntProperty: $primitiveToJsonValue<number>(
          _formStruct.requiredIntProperty,
        ),
        requiredStringProperty: $primitiveToJsonValue<string>(
          _formStruct.requiredStringProperty,
        ),
      }),
    );

  export const toRdfResource: $ToRdfResourceFunction<
    FormStruct.Identifier,
    FormStruct
  > = $wrap_ToRdfResourceFunction<FormStruct.Identifier, FormStruct>(
    FormStruct._toRdfResource,
  );

  export const toRdfResourceValues: $ToRdfResourceValuesFunction<
    FormStruct,
    BlankNode | NamedNode
  > = (value, options) => [
    FormStruct.toRdfResource(value, {
      graph: options.graph,
      resourceSet: options.resourceSet,
    }).identifier,
  ];

  export const toStringRecord: $ToStringRecordFunction<
    Pick<FormStruct, "$identifier">
  > = (_formStruct) =>
    $compactRecord({ $identifier: _formStruct.$identifier().toString() });
}

export type $Object = FormStruct.Discriminated;

export namespace $Object {
  export const toJsonObject = FormStruct.toJsonObject;

  export const toRdfResource = FormStruct.toRdfResource;

  export const $toString = FormStruct.$toString;
}

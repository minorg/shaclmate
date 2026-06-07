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
  Resource,
  ResourceSet,
} from "@rdfx/resource";
import { NTriplesIdentifier, NTriplesTerm } from "@rdfx/string";
import { Either, Left, Maybe, Right } from "purify-ts";
import { z } from "zod";

type $_FromRdfResourceFunction<T> = (
  resource: Resource,
  options: {
    context: undefined | unknown;
    graph: Exclude<Quad_Graph, Variable> | undefined;
    ignoreRdfType: boolean;

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

export type $FromRdfResourceFunction<T> = (
  resource: Resource,
  options?: {
    context?: unknown;
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;

    preferredLanguages?: readonly string[];
  },
) => Either<Error, T>;

export type $FromRdfResourceValuesFunction<ValueT, ValueSchemaT> = (
  resourceValues: Resource.Values,
  options: {
    context?: unknown;
    graph?: Exclude<Quad_Graph, Variable>;
    focusResource: Resource;
    ignoreRdfType?: boolean;

    preferredLanguages?: readonly string[];
    propertyPath: $PropertyPath;
    schema: ValueSchemaT;
  },
) => Either<Error, Resource.Values<ValueT>>;

function $identifierFromRdfResourceValues(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<BlankNode | NamedNode, $IdentifierSchema>
  >[1],
): Either<Error, Resource.Values<BlankNode | NamedNode>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) => value.toIdentifier()),
  );
}

interface $IdentifierSchema {
  readonly hasValues?: readonly NamedNode[];
  readonly kind: "Identifier";
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

function $intFromRdfResourceValues<IntT extends number>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<IntT, $NumericSchema<IntT>>
  >[1],
): Either<Error, Resource.Values<IntT>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toInt(options.schema.in)
        : (value.toInt() as Either<Error, IntT>),
    ),
  );
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

function $maybeFromRdfResourceValues<ItemT, ItemSchemaT>(
  itemFromRdfResourceValues: $FromRdfResourceValuesFunction<ItemT, ItemSchemaT>,
): $FromRdfResourceValuesFunction<Maybe<ItemT>, $MaybeSchema<ItemSchemaT>> {
  return (values, options) =>
    itemFromRdfResourceValues(values, {
      ...options,
      schema: options.schema.itemType,
    }).map((values) =>
      values.length > 0
        ? values.map((value) => Maybe.of(value))
        : Resource.Values.fromValue<Maybe<ItemT>>({
            focusResource: options.focusResource,
            propertyPath: options.propertyPath,
            value: Maybe.empty(),
          }),
    );
}

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

interface $NumericSchema<T> {
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly T[];
  readonly kind: "BigDecimal" | "BigInt" | "Float" | "Int";
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

export type $PropertyPath = RdfxResourcePropertyPath;

export namespace $PropertyPath {
  export const fromRdfResource: $FromRdfResourceFunction<$PropertyPath> =
    RdfxResourcePropertyPath.fromResource;

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    $PropertyPath,
    object
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

  export const schema: Readonly<object> = {};

  export const toRdfResource: $ToRdfResourceFunction<$PropertyPath> =
    RdfxResourcePropertyPath.toResource;

  export const $toString = RdfxResourcePropertyPath.toString;
}

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

function $setFromRdfResourceValues<ItemT, ItemSchemaT>(
  itemFromRdfResourceValues: $FromRdfResourceValuesFunction<ItemT, ItemSchemaT>,
): $FromRdfResourceValuesFunction<
  readonly ItemT[],
  $CollectionSchema<ItemSchemaT>
> {
  return (values, options) =>
    itemFromRdfResourceValues(values, {
      ...options,
      schema: options.schema.itemType,
    })
      .map((values) => values.toArray())
      .map((valuesArray) =>
        Resource.Values.fromValue({
          focusResource: options.focusResource,
          propertyPath: options.propertyPath,
          value: valuesArray,
        }),
      );
}

function $shaclPropertyFromRdf<TypeT, TypeSchemaT>({
  focusResource,
  graph,
  propertySchema,
  typeFromRdfResourceValues,
  ...otherParameters
}: {
  propertySchema: $ShaclPropertySchema<TypeSchemaT>;
  typeFromRdfResourceValues: $FromRdfResourceValuesFunction<TypeT, TypeSchemaT>;
} & Omit<
  Parameters<$FromRdfResourceValuesFunction<TypeT, TypeSchemaT>>[1],
  "propertyPath" | "schema"
>): Either<Error, TypeT> {
  return typeFromRdfResourceValues(
    focusResource.values(propertySchema.path, { graph, unique: true }),
    {
      ...otherParameters,
      focusResource,
      graph,
      propertyPath: propertySchema.path,
      schema: propertySchema.type,
    },
  ).chain((values) => values.head());
}

export interface $ShaclPropertySchema<TypeSchemaT> {
  readonly kind: "Shacl";
  readonly path: $PropertyPath;
  readonly type: TypeSchemaT;
}

function $stringFromRdfResourceValues<StringT extends string>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<StringT, $StringSchema<StringT>>
  >[1],
): Either<Error, Resource.Values<StringT>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toString(options.schema.in)
        : (value.toString() as Either<Error, StringT>),
    ),
  );
}

interface $StringSchema<StringT extends string> {
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly StringT[];
  readonly languageIn?: readonly string[];
  readonly kind: "String";
}

const $termLikeFromRdfResourceValues: $FromRdfResourceValuesFunction<
  Resource.Value,
  {
    readonly hasValues?: readonly (Literal | NamedNode)[];
    readonly languageIn?: readonly string[];
  }
> = (values, { preferredLanguages, schema: { hasValues, languageIn } }) => {
  let chain = Either.of<Error, Resource.Values>(values);

  if (hasValues && hasValues.length > 0) {
    chain = chain.chain((values) =>
      Either.sequence(
        hasValues.map((hasValue) =>
          values.find((value) => value.term.equals(hasValue)),
        ),
      ).map(() => values),
    );
  }

  if (languageIn && languageIn.length > 0) {
    chain = chain.chain((values) =>
      values.chainMap((value) =>
        value.toLiteral().chain((literal) =>
          languageIn.includes(literal.language)
            ? Right(value)
            : Left(
                new Resource.MistypedTermValueError({
                  actualValue: literal,
                  expectedValueType: "Literal",
                  focusResource: value.focusResource,
                  propertyPath: value.propertyPath,
                }),
              ),
        ),
      ),
    );
  }

  if (preferredLanguages && preferredLanguages.length > 0) {
    chain = chain.chain((values) => {
      const literals: Literal[] = [];
      const literalValues: Resource.Value[] = [];
      const nonLiteralValues: Resource.Value[] = [];

      for (const value of values) {
        const term = value.toTerm().unsafeCoerce();
        if (term.termType === "Literal") {
          literals.push(term);
          literalValues.push(value);
        } else {
          nonLiteralValues.push(value);
        }
      }

      // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
      // Within a preferredLanguage the literals may be in any order.
      const preferredLanguageLiteralValues: Resource.Value[] = [];
      for (const preferredLanguage of preferredLanguages) {
        for (let literalI = 0; literalI < literals.length; literalI++) {
          if (literals[literalI].language === preferredLanguage) {
            preferredLanguageLiteralValues.push(literalValues[literalI]);
          }
        }
      }

      return Right(
        Resource.Values.fromArray({
          focusResource: values.focusResource,
          propertyPath: values.propertyPath,
          values: nonLiteralValues.concat(preferredLanguageLiteralValues),
        }),
      );
    });
  }

  return chain;
};

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

function $wrap_FromRdfResourceFunction<T>(
  _fromRdfResourceFunction: $_FromRdfResourceFunction<T>,
): $FromRdfResourceFunction<T> {
  return (resource, options) => {
    const {
      context,
      graph,
      ignoreRdfType = false,
      preferredLanguages,
    } = options ?? {};
    return _fromRdfResourceFunction(resource, {
      context,
      graph,
      ignoreRdfType,
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
      readonly $identifier: () => BlankNode | NamedNode;

      /**
       * Required string
       */
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
      nestedStructProperty: Either.of(parameters.nestedStructProperty),
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
      readonly $identifier: () => BlankNode | NamedNode;

      /**
       * Required string
       */
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

  export const _fromRdfResource: $_FromRdfResourceFunction<FormStruct> = (
    $resource,
    _$options,
  ) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        new Resource.Value({
          dataFactory: dataFactory,
          focusResource: $resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          term: $resource.identifier,
        }).toValues(),
        {
          context: _$options.context,
          graph: _$options.graph,
          focusResource: $resource,
          preferredLanguages: _$options.preferredLanguages,
          propertyPath: $RdfVocabularies.rdf.subject,
          schema: schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      emptyStringSetProperty: $shaclPropertyFromRdf<
        readonly string[],
        $CollectionSchema<$StringSchema<string>>
      >({
        context: _$options.context,
        graph: _$options.graph,
        focusResource: $resource,
        ignoreRdfType: true,
        preferredLanguages: _$options.preferredLanguages,
        propertySchema: schema.properties.emptyStringSetProperty,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      nestedStructProperty: $shaclPropertyFromRdf<
        {
          readonly $identifier: () => BlankNode | NamedNode;

          /**
           * Required string
           */
          readonly requiredStringProperty: string;
        },
        {
          properties: {
            $identifier: {
              readonly kind: "Identifier";
              readonly type: $IdentifierSchema;
            };
            requiredStringProperty: {
              readonly kind: "Shacl";
              readonly path: $PropertyPath;
              readonly type: $StringSchema<string>;
            };
          };
        }
      >({
        context: _$options.context,
        graph: _$options.graph,
        focusResource: $resource,
        ignoreRdfType: true,
        preferredLanguages: _$options.preferredLanguages,
        propertySchema: schema.properties.nestedStructProperty,
        typeFromRdfResourceValues: (values, options) =>
          values.chainMap((value) =>
            value.toResource().chain((resource) =>
              (($resource, _$options) =>
                $sequenceRecord({
                  $identifier: $identifierFromRdfResourceValues(
                    new Resource.Value({
                      dataFactory: dataFactory,
                      focusResource: $resource,
                      propertyPath: $RdfVocabularies.rdf.subject,
                      term: $resource.identifier,
                    }).toValues(),
                    {
                      context: _$options.context,
                      graph: _$options.graph,
                      focusResource: $resource,
                      preferredLanguages: _$options.preferredLanguages,
                      propertyPath: $RdfVocabularies.rdf.subject,
                      schema: schema.properties.$identifier.type,
                    },
                  ).chain((values) => values.head()),
                  requiredStringProperty: $shaclPropertyFromRdf<
                    string,
                    $StringSchema<string>
                  >({
                    context: _$options.context,
                    graph: _$options.graph,
                    focusResource: $resource,
                    ignoreRdfType: true,
                    preferredLanguages: _$options.preferredLanguages,
                    propertySchema: schema.properties.requiredStringProperty,
                    typeFromRdfResourceValues:
                      $stringFromRdfResourceValues<string>,
                  }),
                }).chain((properties) =>
                  ((parameters) =>
                    $sequenceRecord({
                      $identifier: $convertToIdentifierProperty(
                        parameters.$identifier,
                      ),
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
                              requiredStringProperty:
                                _object.requiredStringProperty,
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
                    ))(properties),
                ))(resource, options),
            ),
          ),
      }),
      nonEmptyStringSetProperty: $shaclPropertyFromRdf<
        readonly string[],
        $CollectionSchema<$StringSchema<string>>
      >({
        context: _$options.context,
        graph: _$options.graph,
        focusResource: $resource,
        ignoreRdfType: true,
        preferredLanguages: _$options.preferredLanguages,
        propertySchema: schema.properties.nonEmptyStringSetProperty,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      optionalStringProperty: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        context: _$options.context,
        graph: _$options.graph,
        focusResource: $resource,
        ignoreRdfType: true,
        preferredLanguages: _$options.preferredLanguages,
        propertySchema: schema.properties.optionalStringProperty,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      requiredIntProperty: $shaclPropertyFromRdf<
        number,
        $NumericSchema<number>
      >({
        context: _$options.context,
        graph: _$options.graph,
        focusResource: $resource,
        ignoreRdfType: true,
        preferredLanguages: _$options.preferredLanguages,
        propertySchema: schema.properties.requiredIntProperty,
        typeFromRdfResourceValues: $intFromRdfResourceValues<number>,
      }),
      requiredStringProperty: $shaclPropertyFromRdf<
        string,
        $StringSchema<string>
      >({
        context: _$options.context,
        graph: _$options.graph,
        focusResource: $resource,
        ignoreRdfType: true,
        preferredLanguages: _$options.preferredLanguages,
        propertySchema: schema.properties.requiredStringProperty,
        typeFromRdfResourceValues: $stringFromRdfResourceValues<string>,
      }),
    }).chain((properties) => FormStruct.create(properties));

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    FormStruct,
    FormStruct.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

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

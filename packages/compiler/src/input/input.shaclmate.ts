import type {
  BlankNode,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import { expandIri } from "@rdfx/curie";
import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import {
  PropertyPath as RdfxResourcePropertyPath,
  Resource,
} from "@rdfx/resource";
import { NTriplesIdentifier } from "@rdfx/string";
import { Either, Left, Maybe, Right } from "purify-ts";

type $_FromRdfResourceFunction<T> = (
  resource: Resource,
  options: {
    context: undefined | unknown;
    graph: Exclude<Quad_Graph, Variable> | undefined;
    ignoreRdfType: boolean;

    preferredLanguages: readonly string[] | undefined;
  },
) => Either<Error, T>;

function $bigIntFromRdfResourceValues<BigIntT extends bigint>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<BigIntT, $NumericSchema<BigIntT>>
  >[1],
): Either<Error, Resource.Values<BigIntT>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toBigInt(options.schema.in)
        : (value.toBigInt() as Either<Error, BigIntT>),
    ),
  );
}

function $booleanFromRdfResourceValues<BooleanT extends boolean>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<BooleanT, $BooleanSchema<BooleanT>>
  >[1],
): Either<Error, Resource.Values<BooleanT>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toBoolean(options.schema.in)
        : (value.toBoolean() as Either<Error, BooleanT>),
    ),
  );
}

interface $BooleanSchema<BooleanT extends boolean> {
  readonly datatype: NamedNode;
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly BooleanT[];
  readonly kind: "Boolean";
}

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

const $convertToBigInt: $ConversionFunction<
  bigint | number | string,
  bigint
> = (value) => Either.encase(() => BigInt(value));

function $convertToIdentifier<
  DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
>(
  value: BlankNode | NamedNode | (keyof DefaultNamespaceT & string) | undefined,
  defaultNamespace?: DefaultNamespaceT,
): Either<Error, BlankNode | NamedNode> {
  switch (typeof value) {
    case "object":
      return Either.of(value);
    case "string":
      return expandIri(value, { dataFactory: dataFactory, defaultNamespace });
    case "undefined":
      return Either.of(dataFactory.blankNode());
  }
}

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
    case "string":
      return expandIri(identifier, {
        dataFactory: dataFactory,
        defaultNamespace,
      }).map((iri) => () => iri);
    case "undefined": {
      const captureIdentifier = dataFactory.blankNode();
      return Either.of(() => captureIdentifier);
    }
  }
}

function $convertToIri<
  DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
>(
  value: NamedNode | (keyof DefaultNamespaceT & string),
  defaultNamespace?: DefaultNamespaceT,
): Either<Error, NamedNode> {
  switch (typeof value) {
    case "object":
      return Either.of(value);
    case "string":
      return expandIri(value, { dataFactory: dataFactory, defaultNamespace });
  }
}

function $convertToIriLiteral<IriT extends string>(
  value: IriT | NamedNode<IriT>,
  _defaultNamespace?: $NamespaceBuilder,
): Either<Error, NamedNode<IriT>> {
  switch (typeof value) {
    case "object":
      return Either.of(value);
    case "string":
      return Either.of(dataFactory.namedNode<IriT>(value));
  }
}

function $convertToList<
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
  readonly ItemSourceT[],
  readonly ItemTargetT[],
  DefaultNamespaceT
> {
  return (value, defaultNamespace) =>
    Either.sequence(
      value.map((value) => convertToItem(value, defaultNamespace)),
    ) as Either<Error, readonly ItemTargetT[]>;
}

const $convertToLiteral: $ConversionFunction<
  bigint | boolean | Date | number | string | Literal,
  Literal
> = (value) => {
  if (typeof value === "object") {
    if (value instanceof Date) {
      return Either.of($literalFactory.date(value));
    }
    return Either.of(value);
  }

  return Either.of($literalFactory.primitive(value));
};

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

function $convertWithDefaultValue<ItemSourceT, ItemTargetT>(
  convertToItem: $ConversionFunction<ItemSourceT, ItemTargetT>,
  defaultValue: ItemSourceT,
): $ConversionFunction<ItemSourceT | undefined, ItemTargetT> {
  return (value) => {
    if (typeof value === "undefined") {
      return convertToItem(defaultValue);
    }
    return convertToItem(value);
  };
}

function $defaultValueFromRdfResourceValues<ItemT, ItemSchemaT>(
  itemFromRdfResourceValues: $FromRdfResourceValuesFunction<ItemT, ItemSchemaT>,
): $FromRdfResourceValuesFunction<ItemT, $DefaultValueSchema<ItemSchemaT>> {
  return (values, options) =>
    itemFromRdfResourceValues(
      values.length > 0
        ? values
        : new Resource.Value({
            dataFactory: dataFactory,
            focusResource: options.focusResource,
            propertyPath: options.propertyPath,
            term: options.schema.defaultValue,
          }).toValues(),
      { ...options, schema: options.schema.itemType },
    );
}

interface $DefaultValueSchema<ItemSchemaT> {
  readonly defaultValue: Literal | NamedNode;
  readonly itemType: ItemSchemaT;
  readonly kind: "DefaultValue";
}

function $ensureRdfResourceType(
  resource: Resource,
  types: readonly NamedNode[],
  options: { graph: Exclude<Quad_Graph, Variable> | undefined },
): Either<Error, undefined> {
  return resource
    .value($rdf_type, options)
    .chain((actualRdfTypeValue) => actualRdfTypeValue.toIri())
    .chain((actualRdfType) => {
      // Check the expected type and its known subtypes
      for (const type of types) {
        if (resource.isInstanceOf(type, options)) {
          return Right(undefined);
        }
      }

      return Left(
        new Error(
          `${resource.identifier} has unexpected RDF type (actual: ${actualRdfType}, expected one of ${types})`,
        ),
      );
    });
}

function $floatFromRdfResourceValues<FloatT extends number>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<FloatT, $NumericSchema<FloatT>>
  >[1],
): Either<Error, Resource.Values<FloatT>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toFloat(options.schema.in)
        : (value.toFloat() as Either<Error, FloatT>),
    ),
  );
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

const $identifierFromRdfResourceValues: $FromRdfResourceValuesFunction<
  BlankNode | NamedNode,
  $IdentifierSchema
> = (values, options) =>
  $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) => value.toIdentifier()),
  );

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

function $iriFromRdfResourceValues<IriT extends string = string>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<NamedNode<IriT>, $IriSchema<IriT>>
  >[1],
): Either<Error, Resource.Values<NamedNode<IriT>>> {
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      options.schema.in
        ? value.toIri(options.schema.in)
        : (value.toIri() as Either<Error, NamedNode<IriT>>),
    ),
  );
}

interface $IriSchema<IriT extends string = string> {
  readonly hasValues?: readonly NamedNode[];
  readonly in?: readonly NamedNode<IriT>[];
  readonly kind: "Iri";
}

function $listFromRdfResourceValues<ItemT, ItemSchemaT>(
  itemFromRdfResourceValues: $FromRdfResourceValuesFunction<ItemT, ItemSchemaT>,
): $FromRdfResourceValuesFunction<
  readonly ItemT[],
  $CollectionSchema<ItemSchemaT>
> {
  return (values, options) =>
    values
      .chainMap((value) => value.toList({ graph: options.graph })) // Resource.Values<Resource.Value> to Resource.Values<Resource.Values>;
      .chain((valueLists) =>
        valueLists.chainMap((valueList) =>
          itemFromRdfResourceValues(
            Resource.Values.fromArray({
              focusResource: options.focusResource,
              propertyPath: options.propertyPath,
              values: valueList.toArray(),
            }),
            { ...options, schema: options.schema.itemType },
          ),
        ),
      ) // Resource.Values<Resource.Values> to Resource.Values<item type arrays>
      .map((valueLists) => valueLists.map((valueList) => valueList.toArray())); // Convert inner Resource.Values to arrays
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

const $literalFromRdfResourceValues: $FromRdfResourceValuesFunction<
  Literal,
  $LiteralSchema
> = (values, options) =>
  $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) => value.toLiteral(options.schema.in)),
  );

interface $LiteralSchema {
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly Literal[];
  readonly kind: "Literal";
  readonly languageIn?: readonly string[];
}

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

export type $ObjectTypeGuardFunction<ObjectT extends $Object> = (
  object: $Object,
) => object is ObjectT;

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

  export type Schema = typeof schema;

  export const $toString = RdfxResourcePropertyPath.toString;
}

const $rdf_subject = dataFactory.namedNode(
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
);

const $rdf_type = dataFactory.namedNode(
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
);

function $rdfResourceIdentifierValues(resource: Resource): Resource.Values {
  return new Resource.Value({
    dataFactory: dataFactory,
    focusResource: resource,
    propertyPath: $rdf_subject,
    term: resource.identifier,
  }).toValues();
}

const $rdfs_comment = dataFactory.namedNode(
  "http://www.w3.org/2000/01/rdf-schema#comment",
);

const $rdfs_isDefinedBy = dataFactory.namedNode(
  "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
);

const $rdfs_label = dataFactory.namedNode(
  "http://www.w3.org/2000/01/rdf-schema#label",
);

const $rdfs_subClassOf = dataFactory.namedNode(
  "http://www.w3.org/2000/01/rdf-schema#subClassOf",
);

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
  readonly datatype: NamedNode;
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly StringT[];
  readonly languageIn?: readonly string[];
  readonly kind: "String";
}

function $termFromRdfResourceValues<
  TermT extends BlankNode | Literal | NamedNode,
>(
  values: Resource.Values,
  options: Parameters<
    $FromRdfResourceValuesFunction<TermT, $TermSchema<TermT>>
  >[1],
): Either<Error, Resource.Values<TermT>> {
  const { focusResource, propertyPath, schema } = options;
  return $termLikeFromRdfResourceValues(values, options).chain((values) =>
    values.chainMap((value) =>
      value.toTerm().chain((term) => {
        if (
          schema.in &&
          schema.in.length > 0 &&
          !schema.in.some((in_) => in_.equals(term))
        ) {
          return Left(
            new Resource.MistypedValueError({
              actualValue: term,
              expectedValueType: "Term in",
              focusResource,
              propertyPath,
            }),
          );
        }

        if (!schema.types.some((type) => term.termType === type)) {
          return Left(
            new Resource.MistypedValueError({
              actualValue: term,
              expectedValueType: "BlankNode | Literal | NamedNode",
              focusResource,
              propertyPath,
            }),
          );
        }

        return Right(term as TermT);
      }),
    ),
  );
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
                new Resource.MistypedValueError({
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

interface $TermSchema<TermT extends BlankNode | Literal | NamedNode> {
  readonly hasValues?: readonly Exclude<TermT, BlankNode>[];
  readonly in?: readonly Exclude<TermT, BlankNode>[];
  readonly kind: "Term";
  readonly types: readonly TermT["termType"][];
}

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

const $xsd_boolean = dataFactory.namedNode(
  "http://www.w3.org/2001/XMLSchema#boolean",
);

const $xsd_double = dataFactory.namedNode(
  "http://www.w3.org/2001/XMLSchema#double",
);

const $xsd_int = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#int");

const $xsd_integer = dataFactory.namedNode(
  "http://www.w3.org/2001/XMLSchema#integer",
);

const $xsd_string = dataFactory.namedNode(
  "http://www.w3.org/2001/XMLSchema#string",
);

export type BaseShape = {
  readonly $identifier: () => BaseShape.Identifier;

  readonly and: Maybe<readonly (BlankNode | NamedNode)[]>;

  readonly classes: readonly NamedNode[];

  readonly comment: Maybe<string>;

  readonly datatype: Maybe<NamedNode>;

  readonly deactivated: Maybe<boolean>;

  readonly flags: Maybe<string>;

  readonly hasValues: readonly (NamedNode | Literal)[];

  /**
   * Whether to ignore this shape in code generation, defaults to false
   */
  readonly ignore: boolean;

  readonly in_: Maybe<readonly (NamedNode | Literal)[]>;

  readonly isDefinedBy: Maybe<BlankNode | NamedNode>;

  readonly label: Maybe<string>;

  readonly languageIn: Maybe<readonly string[]>;

  readonly maxExclusive: Maybe<Literal>;

  readonly maxInclusive: Maybe<Literal>;

  readonly maxLength: Maybe<bigint>;

  readonly message: Maybe<string>;

  readonly minExclusive: Maybe<Literal>;

  readonly minInclusive: Maybe<Literal>;

  readonly minLength: Maybe<bigint>;

  /**
   * Whether the code generated from the shape should be mutable e.g., a mutable property, a mutable array, etc.
   */
  readonly mutable: Maybe<boolean>;

  readonly node: Maybe<BlankNode | NamedNode>;

  readonly nodeKind: Maybe<
    NamedNode<
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
    >
  >;

  readonly not: readonly (BlankNode | NamedNode)[];

  readonly or: Maybe<readonly (BlankNode | NamedNode)[]>;

  readonly pattern: Maybe<string>;

  readonly severity: Maybe<Severity>;

  /**
   * Name to use in generated code. Used on node shapes (which don't permit sh:name) and to override sh:name in property shapes.
   */
  readonly shaclmateName: Maybe<string>;

  readonly targetClasses: readonly NamedNode[];

  readonly targetNodes: readonly (NamedNode | Literal)[];

  readonly targetObjectsOf: readonly NamedNode[];

  readonly targetSubjectsOf: readonly NamedNode[];

  readonly xone: Maybe<readonly (BlankNode | NamedNode)[]>;
};

export namespace BaseShape {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    BaseShape.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: BaseShape.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      and: $shaclPropertyFromRdf<
        Maybe<readonly (BlankNode | NamedNode)[]>,
        $MaybeSchema<$CollectionSchema<$IdentifierSchema>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.and,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          readonly (BlankNode | NamedNode)[],
          $CollectionSchema<$IdentifierSchema>
        >(
          $listFromRdfResourceValues<BlankNode | NamedNode, $IdentifierSchema>(
            $identifierFromRdfResourceValues,
          ),
        ),
      }),
      classes: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.classes,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      comment: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.comment,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      datatype: $shaclPropertyFromRdf<
        Maybe<NamedNode>,
        $MaybeSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.datatype,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      deactivated: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.deactivated,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      flags: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.flags,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      hasValues: $shaclPropertyFromRdf<
        readonly (NamedNode | Literal)[],
        $CollectionSchema<$TermSchema<NamedNode | Literal>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.hasValues,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode | Literal,
          $TermSchema<NamedNode | Literal>
        >($termFromRdfResourceValues<NamedNode | Literal>),
      }),
      ignore: $shaclPropertyFromRdf<
        boolean,
        $DefaultValueSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.ignore,
        typeFromRdfResourceValues: $defaultValueFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      in_: $shaclPropertyFromRdf<
        Maybe<readonly (NamedNode | Literal)[]>,
        $MaybeSchema<$CollectionSchema<$TermSchema<NamedNode | Literal>>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.in_,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          readonly (NamedNode | Literal)[],
          $CollectionSchema<$TermSchema<NamedNode | Literal>>
        >(
          $listFromRdfResourceValues<
            NamedNode | Literal,
            $TermSchema<NamedNode | Literal>
          >($termFromRdfResourceValues<NamedNode | Literal>),
        ),
      }),
      isDefinedBy: $shaclPropertyFromRdf<
        Maybe<BlankNode | NamedNode>,
        $MaybeSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.isDefinedBy,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      label: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.label,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      languageIn: $shaclPropertyFromRdf<
        Maybe<readonly string[]>,
        $MaybeSchema<$CollectionSchema<$StringSchema<string>>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.languageIn,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          readonly string[],
          $CollectionSchema<$StringSchema<string>>
        >(
          $listFromRdfResourceValues<string, $StringSchema<string>>(
            $stringFromRdfResourceValues<string>,
          ),
        ),
      }),
      maxExclusive: $shaclPropertyFromRdf<
        Maybe<Literal>,
        $MaybeSchema<$LiteralSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.maxExclusive,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          Literal,
          $LiteralSchema
        >($literalFromRdfResourceValues),
      }),
      maxInclusive: $shaclPropertyFromRdf<
        Maybe<Literal>,
        $MaybeSchema<$LiteralSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.maxInclusive,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          Literal,
          $LiteralSchema
        >($literalFromRdfResourceValues),
      }),
      maxLength: $shaclPropertyFromRdf<
        Maybe<bigint>,
        $MaybeSchema<$NumericSchema<bigint>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.maxLength,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          bigint,
          $NumericSchema<bigint>
        >($bigIntFromRdfResourceValues<bigint>),
      }),
      message: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.message,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      minExclusive: $shaclPropertyFromRdf<
        Maybe<Literal>,
        $MaybeSchema<$LiteralSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.minExclusive,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          Literal,
          $LiteralSchema
        >($literalFromRdfResourceValues),
      }),
      minInclusive: $shaclPropertyFromRdf<
        Maybe<Literal>,
        $MaybeSchema<$LiteralSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.minInclusive,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          Literal,
          $LiteralSchema
        >($literalFromRdfResourceValues),
      }),
      minLength: $shaclPropertyFromRdf<
        Maybe<bigint>,
        $MaybeSchema<$NumericSchema<bigint>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.minLength,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          bigint,
          $NumericSchema<bigint>
        >($bigIntFromRdfResourceValues<bigint>),
      }),
      mutable: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.mutable,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      node: $shaclPropertyFromRdf<
        Maybe<BlankNode | NamedNode>,
        $MaybeSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.node,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      nodeKind: $shaclPropertyFromRdf<
        Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >,
        $MaybeSchema<
          $IriSchema<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.nodeKind,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >,
          $IriSchema<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >(
          $iriFromRdfResourceValues<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >,
        ),
      }),
      not: $shaclPropertyFromRdf<
        readonly (BlankNode | NamedNode)[],
        $CollectionSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.not,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      or: $shaclPropertyFromRdf<
        Maybe<readonly (BlankNode | NamedNode)[]>,
        $MaybeSchema<$CollectionSchema<$IdentifierSchema>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.or,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          readonly (BlankNode | NamedNode)[],
          $CollectionSchema<$IdentifierSchema>
        >(
          $listFromRdfResourceValues<BlankNode | NamedNode, $IdentifierSchema>(
            $identifierFromRdfResourceValues,
          ),
        ),
      }),
      pattern: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.pattern,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      severity: $shaclPropertyFromRdf<
        Maybe<Severity>,
        $MaybeSchema<$IriSchema<Severity["value"]>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.severity,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          Severity,
          $IriSchema<Severity["value"]>
        >($iriFromRdfResourceValues<Severity["value"]>),
      }),
      shaclmateName: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.shaclmateName,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      targetClasses: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.targetClasses,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      targetNodes: $shaclPropertyFromRdf<
        readonly (NamedNode | Literal)[],
        $CollectionSchema<$TermSchema<NamedNode | Literal>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.targetNodes,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode | Literal,
          $TermSchema<NamedNode | Literal>
        >($termFromRdfResourceValues<NamedNode | Literal>),
      }),
      targetObjectsOf: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.targetObjectsOf,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      targetSubjectsOf: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.targetSubjectsOf,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      xone: $shaclPropertyFromRdf<
        Maybe<readonly (BlankNode | NamedNode)[]>,
        $MaybeSchema<$CollectionSchema<$IdentifierSchema>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.xone,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          readonly (BlankNode | NamedNode)[],
          $CollectionSchema<$IdentifierSchema>
        >(
          $listFromRdfResourceValues<BlankNode | NamedNode, $IdentifierSchema>(
            $identifierFromRdfResourceValues,
          ),
        ),
      }),
    }).chain((properties) => BaseShape.create(properties));

  export const $toString: $ToStringFunction<
    Pick<BaseShape, "$identifier" | "label" | "shaclmateName">
  > = (_baseShape) =>
    `BaseShape(${JSON.stringify(BaseShape.toStringRecord(_baseShape))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: BaseShape.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, BaseShape.Discriminated> = (parameters = {}) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("BaseShape" as const),
      and: $convertToMaybe($convertToList($convertToIdentifier))(
        parameters.and,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction))(
          BaseShape.schema.properties.and.type,
          value,
        ),
      ),
      classes: $convertToScalarSet($convertToIri)(
        parameters.classes,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          BaseShape.schema.properties.classes.type,
          value,
        ),
      ),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters.comment,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.comment.type,
          value,
        ),
      ),
      datatype: $convertToMaybe($convertToIri)(
        parameters.datatype,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.datatype.type,
          value,
        ),
      ),
      deactivated: $convertToMaybe($identityConversionFunction)(
        parameters.deactivated,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.deactivated.type,
          value,
        ),
      ),
      flags: $convertToMaybe($identityConversionFunction)(
        parameters.flags,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.flags.type,
          value,
        ),
      ),
      hasValues: $convertToScalarSet($identityConversionFunction)(
        parameters.hasValues,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          BaseShape.schema.properties.hasValues.type,
          value,
        ),
      ),
      ignore: $convertWithDefaultValue($identityConversionFunction, false)(
        parameters.ignore,
        parameters.$defaultNamespace,
      ),
      in_: $convertToMaybe($convertToList($identityConversionFunction))(
        parameters.in_,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction))(
          BaseShape.schema.properties.in_.type,
          value,
        ),
      ),
      isDefinedBy: $convertToMaybe($convertToIdentifier)(
        parameters.isDefinedBy,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.isDefinedBy.type,
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters.label,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.label.type,
          value,
        ),
      ),
      languageIn: $convertToMaybe($convertToList($identityConversionFunction))(
        parameters.languageIn,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction))(
          BaseShape.schema.properties.languageIn.type,
          value,
        ),
      ),
      maxExclusive: $convertToMaybe($convertToLiteral)(
        parameters.maxExclusive,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.maxExclusive.type,
          value,
        ),
      ),
      maxInclusive: $convertToMaybe($convertToLiteral)(
        parameters.maxInclusive,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.maxInclusive.type,
          value,
        ),
      ),
      maxLength: $convertToMaybe($convertToBigInt)(
        parameters.maxLength,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.maxLength.type,
          value,
        ),
      ),
      message: $convertToMaybe($identityConversionFunction)(
        parameters.message,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.message.type,
          value,
        ),
      ),
      minExclusive: $convertToMaybe($convertToLiteral)(
        parameters.minExclusive,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.minExclusive.type,
          value,
        ),
      ),
      minInclusive: $convertToMaybe($convertToLiteral)(
        parameters.minInclusive,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.minInclusive.type,
          value,
        ),
      ),
      minLength: $convertToMaybe($convertToBigInt)(
        parameters.minLength,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.minLength.type,
          value,
        ),
      ),
      mutable: $convertToMaybe($identityConversionFunction)(
        parameters.mutable,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.mutable.type,
          value,
        ),
      ),
      node: $convertToMaybe($convertToIdentifier)(
        parameters.node,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.node.type,
          value,
        ),
      ),
      nodeKind: $convertToMaybe(
        $convertToIriLiteral<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >,
      )(parameters.nodeKind, parameters.$defaultNamespace).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.nodeKind.type,
          value,
        ),
      ),
      not: $convertToScalarSet($convertToIdentifier)(
        parameters.not,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          BaseShape.schema.properties.not.type,
          value,
        ),
      ),
      or: $convertToMaybe($convertToList($convertToIdentifier))(
        parameters.or,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction))(
          BaseShape.schema.properties.or.type,
          value,
        ),
      ),
      pattern: $convertToMaybe($identityConversionFunction)(
        parameters.pattern,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.pattern.type,
          value,
        ),
      ),
      severity: $convertToMaybe($convertToIriLiteral<Severity["value"]>)(
        parameters.severity,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.severity.type,
          value,
        ),
      ),
      shaclmateName: $convertToMaybe($identityConversionFunction)(
        parameters.shaclmateName,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.shaclmateName.type,
          value,
        ),
      ),
      targetClasses: $convertToScalarSet($convertToIri)(
        parameters.targetClasses,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          BaseShape.schema.properties.targetClasses.type,
          value,
        ),
      ),
      targetNodes: $convertToScalarSet($identityConversionFunction)(
        parameters.targetNodes,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          BaseShape.schema.properties.targetNodes.type,
          value,
        ),
      ),
      targetObjectsOf: $convertToScalarSet($convertToIri)(
        parameters.targetObjectsOf,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          BaseShape.schema.properties.targetObjectsOf.type,
          value,
        ),
      ),
      targetSubjectsOf: $convertToScalarSet($convertToIri)(
        parameters.targetSubjectsOf,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          BaseShape.schema.properties.targetSubjectsOf.type,
          value,
        ),
      ),
      xone: $convertToMaybe($convertToList($convertToIdentifier))(
        parameters.xone,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction))(
          BaseShape.schema.properties.xone.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: BaseShape.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => BaseShape.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly and?:
      | readonly (
          | BlankNode
          | NamedNode
          | (keyof $DefaultNamespaceT & string)
          | undefined
        )[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly classes?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly comment?: string | Maybe<string>;
    readonly datatype?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | Maybe<NamedNode>;
    readonly deactivated?: boolean | Maybe<boolean>;
    readonly flags?: string | Maybe<string>;
    readonly hasValues?:
      | (NamedNode | Literal)
      | readonly (NamedNode | Literal)[];
    readonly ignore?: boolean;
    readonly in_?:
      | readonly (NamedNode | Literal)[]
      | Maybe<readonly (NamedNode | Literal)[]>;
    readonly isDefinedBy?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | Maybe<BlankNode | NamedNode>;
    readonly label?: string | Maybe<string>;
    readonly languageIn?: readonly string[] | Maybe<readonly string[]>;
    readonly maxExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly maxLength?: bigint | number | string | Maybe<bigint>;
    readonly message?: string | Maybe<string>;
    readonly minExclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minInclusive?:
      | bigint
      | boolean
      | number
      | string
      | Date
      | Literal
      | Maybe<Literal>;
    readonly minLength?: bigint | number | string | Maybe<bigint>;
    readonly mutable?: boolean | Maybe<boolean>;
    readonly node?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | Maybe<BlankNode | NamedNode>;
    readonly nodeKind?:
      | (
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        )
      | NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      | Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >;
    readonly not?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | readonly (
          | BlankNode
          | NamedNode
          | (keyof $DefaultNamespaceT & string)
          | undefined
        )[];
    readonly or?:
      | readonly (
          | BlankNode
          | NamedNode
          | (keyof $DefaultNamespaceT & string)
          | undefined
        )[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
    readonly pattern?: string | Maybe<string>;
    readonly severity?: Severity["value"] | Severity | Maybe<Severity>;
    readonly shaclmateName?: string | Maybe<string>;
    readonly targetClasses?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly targetNodes?:
      | (NamedNode | Literal)
      | readonly (NamedNode | Literal)[];
    readonly targetObjectsOf?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly targetSubjectsOf?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly xone?:
      | readonly (
          | BlankNode
          | NamedNode
          | (keyof $DefaultNamespaceT & string)
          | undefined
        )[]
      | Maybe<readonly (BlankNode | NamedNode)[]>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: BaseShape.CreateParameters<$DefaultNamespaceT>,
  ) => BaseShape.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = BaseShape & { readonly $type: "BaseShape" };

  export const fromRdfResource: $FromRdfResourceFunction<BaseShape.Discriminated> =
    $wrap_FromRdfResourceFunction(BaseShape._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    BaseShape.Discriminated,
    BaseShape.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => BaseShape.fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isBaseShape: $ObjectTypeGuardFunction<
    BaseShape.Discriminated
  > = (object): object is BaseShape.Discriminated =>
    object.$type === "BaseShape";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      and: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
        type: {
          itemType: {
            itemType: { kind: "Identifier" } as const,
            kind: "List",
          } as const,
          kind: "Option",
        } as const,
      } as const,
      classes: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      comment: {
        kind: "Shacl",
        path: $rdfs_comment,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      datatype: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
        type: { itemType: { kind: "Iri" } as const, kind: "Option" } as const,
      } as const,
      deactivated: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
      flags: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      hasValues: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
        type: {
          itemType: { kind: "Term", types: ["NamedNode", "Literal"] } as const,
          kind: "Set",
        } as const,
      } as const,
      ignore: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#ignore",
        ),
        type: {
          defaultValue: dataFactory.literal("false", $xsd_boolean),
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "DefaultValue",
        } as const,
      } as const,
      in_: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
        type: {
          itemType: {
            itemType: {
              kind: "Term",
              types: ["NamedNode", "Literal"],
            } as const,
            kind: "List",
          } as const,
          kind: "Option",
        } as const,
      } as const,
      isDefinedBy: {
        kind: "Shacl",
        path: $rdfs_isDefinedBy,
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Option",
        } as const,
      } as const,
      label: {
        kind: "Shacl",
        path: $rdfs_label,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      languageIn: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
        type: {
          itemType: {
            itemType: { datatype: $xsd_string, kind: "String" } as const,
            kind: "List",
          } as const,
          kind: "Option",
        } as const,
      } as const,
      maxExclusive: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
        type: {
          itemType: { kind: "Literal" } as const,
          kind: "Option",
        } as const,
      } as const,
      maxInclusive: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
        type: {
          itemType: { kind: "Literal" } as const,
          kind: "Option",
        } as const,
      } as const,
      maxLength: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
        type: {
          itemType: { datatype: $xsd_integer, kind: "BigInt" } as const,
          kind: "Option",
        } as const,
      } as const,
      message: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#message"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      minExclusive: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
        type: {
          itemType: { kind: "Literal" } as const,
          kind: "Option",
        } as const,
      } as const,
      minInclusive: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
        type: {
          itemType: { kind: "Literal" } as const,
          kind: "Option",
        } as const,
      } as const,
      minLength: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
        type: {
          itemType: { datatype: $xsd_integer, kind: "BigInt" } as const,
          kind: "Option",
        } as const,
      } as const,
      mutable: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#mutable",
        ),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
      node: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Option",
        } as const,
      } as const,
      nodeKind: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
        type: {
          itemType: {
            in: [
              dataFactory.namedNode("http://www.w3.org/ns/shacl#BlankNode"),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrIRI",
              ),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrLiteral",
              ),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRI"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRIOrLiteral"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#Literal"),
            ] as const,
            kind: "Iri",
          } as const,
          kind: "Option",
        } as const,
      } as const,
      not: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Set",
        } as const,
      } as const,
      or: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
        type: {
          itemType: {
            itemType: { kind: "Identifier" } as const,
            kind: "List",
          } as const,
          kind: "Option",
        } as const,
      } as const,
      pattern: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      severity: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#severity"),
        get type() {
          return {
            get itemType() {
              return Severity.schema;
            },
            kind: "Option",
          } as const;
        },
      } as const,
      shaclmateName: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      targetClasses: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#targetClass"),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      targetNodes: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#targetNode"),
        type: {
          itemType: { kind: "Term", types: ["NamedNode", "Literal"] } as const,
          kind: "Set",
        } as const,
      } as const,
      targetObjectsOf: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#targetObjectsOf",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      targetSubjectsOf: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#targetSubjectsOf",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      xone: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
        type: {
          itemType: {
            itemType: { kind: "Identifier" } as const,
            kind: "List",
          } as const,
          kind: "Option",
        } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<BaseShape, "$identifier" | "label" | "shaclmateName">
  > = (_baseShape) =>
    $compactRecord({
      $identifier: _baseShape.$identifier().toString(),
      label: _baseShape.label.map((item) => item.toString()).extract(),
      shaclmateName: _baseShape.shaclmateName
        .map((item) => item.toString())
        .extract(),
    });
}

export type NodeShapeSpecificProperties = {
  readonly $identifier: () => NodeShapeSpecificProperties.Identifier;

  readonly closed: Maybe<boolean>;

  /**
   * The type discriminant value to use when a type in a discriminated union needs to be wrapped in a discriminant envelope.
   *
   * Example:
   *
   *     sh:xone ([
   *             shaclmate:discriminantValue "date" ;
   *             sh:datatype xsd:date
   *         ]
   *         [
   *             shaclmate:discriminantValue "dateTime" ;
   *             sh:datatype xsd:dateTime
   *         ]
   *     )
   *
   * Because xsd:date and xsd:dateTime are both Date in JavaScript, the generated discriminated union needs to be wrapped in an envelope like:
   *
   * { $type: 'type1'; value: Date } | { $type: 'type2'; value: Date }
   *
   * in order to discriminate values at runtime. With shaclmate:discriminantValue from the example above, the generated type would be:
   *
   * { $type: 'date'; value: Date } | { $type: 'dateTime'; value: Date }
   */
  readonly discriminantValue: Maybe<string>;

  readonly extern: Maybe<boolean>;

  readonly fromRdfType: Maybe<NamedNode>;

  readonly ignoredProperties: Maybe<readonly NamedNode[]>;

  readonly properties: readonly (BlankNode | NamedNode)[];

  readonly rdfType: Maybe<NamedNode>;

  readonly subClassOf: readonly NamedNode[];

  readonly toRdfTypes: readonly NamedNode[];

  readonly tsImports: readonly string[];

  readonly types: readonly NamedNode[];
};

export namespace NodeShapeSpecificProperties {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    NodeShapeSpecificProperties.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema:
            NodeShapeSpecificProperties.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      closed: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.closed,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      discriminantValue: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.discriminantValue,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      extern: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.extern,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      fromRdfType: $shaclPropertyFromRdf<
        Maybe<NamedNode>,
        $MaybeSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.fromRdfType,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      ignoredProperties: $shaclPropertyFromRdf<
        Maybe<readonly NamedNode[]>,
        $MaybeSchema<$CollectionSchema<$IriSchema<string>>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.ignoredProperties,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          readonly NamedNode[],
          $CollectionSchema<$IriSchema<string>>
        >(
          $listFromRdfResourceValues<NamedNode, $IriSchema<string>>(
            $iriFromRdfResourceValues<string>,
          ),
        ),
      }),
      properties: $shaclPropertyFromRdf<
        readonly (BlankNode | NamedNode)[],
        $CollectionSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.properties,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      rdfType: $shaclPropertyFromRdf<
        Maybe<NamedNode>,
        $MaybeSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.rdfType,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      subClassOf: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.subClassOf,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      toRdfTypes: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.toRdfTypes,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      tsImports: $shaclPropertyFromRdf<
        readonly string[],
        $CollectionSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.tsImports,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      types: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.types,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
    }).chain((properties) => NodeShapeSpecificProperties.create(properties));

  export const $toString: $ToStringFunction<
    Pick<NodeShapeSpecificProperties, "$identifier">
  > = (_nodeShapeSpecificProperties) =>
    `NodeShapeSpecificProperties(${JSON.stringify(
      NodeShapeSpecificProperties.toStringRecord(_nodeShapeSpecificProperties),
    )})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: NodeShapeSpecificProperties.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, NodeShapeSpecificProperties.Discriminated> = (
    parameters = {},
  ) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("NodeShapeSpecificProperties" as const),
      closed: $convertToMaybe($identityConversionFunction)(
        parameters.closed,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.closed.type,
          value,
        ),
      ),
      discriminantValue: $convertToMaybe($identityConversionFunction)(
        parameters.discriminantValue,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.discriminantValue.type,
          value,
        ),
      ),
      extern: $convertToMaybe($identityConversionFunction)(
        parameters.extern,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.extern.type,
          value,
        ),
      ),
      fromRdfType: $convertToMaybe($convertToIri)(
        parameters.fromRdfType,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.fromRdfType.type,
          value,
        ),
      ),
      ignoredProperties: $convertToMaybe($convertToList($convertToIri))(
        parameters.ignoredProperties,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction))(
          NodeShapeSpecificProperties.schema.properties.ignoredProperties.type,
          value,
        ),
      ),
      properties: $convertToScalarSet($convertToIdentifier)(
        parameters.properties,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.properties.type,
          value,
        ),
      ),
      rdfType: $convertToMaybe($convertToIri)(
        parameters.rdfType,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.rdfType.type,
          value,
        ),
      ),
      subClassOf: $convertToScalarSet($convertToIri)(
        parameters.subClassOf,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.subClassOf.type,
          value,
        ),
      ),
      toRdfTypes: $convertToScalarSet($convertToIri)(
        parameters.toRdfTypes,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.toRdfTypes.type,
          value,
        ),
      ),
      tsImports: $convertToScalarSet($identityConversionFunction)(
        parameters.tsImports,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.tsImports.type,
          value,
        ),
      ),
      types: $convertToScalarSet($convertToIri)(
        parameters.types,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.types.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, {
        $toString: NodeShapeSpecificProperties.$toString,
      }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => NodeShapeSpecificProperties.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly closed?: boolean | Maybe<boolean>;
    readonly discriminantValue?: string | Maybe<string>;
    readonly extern?: boolean | Maybe<boolean>;
    readonly fromRdfType?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | Maybe<NamedNode>;
    readonly ignoredProperties?:
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[]
      | Maybe<readonly NamedNode[]>;
    readonly properties?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | readonly (
          | BlankNode
          | NamedNode
          | (keyof $DefaultNamespaceT & string)
          | undefined
        )[];
    readonly rdfType?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | Maybe<NamedNode>;
    readonly subClassOf?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly toRdfTypes?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly tsImports?: string | readonly string[];
    readonly types?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: NodeShapeSpecificProperties.CreateParameters<$DefaultNamespaceT>,
  ) => NodeShapeSpecificProperties.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = NodeShapeSpecificProperties & {
    readonly $type: "NodeShapeSpecificProperties";
  };

  export const fromRdfResource: $FromRdfResourceFunction<NodeShapeSpecificProperties.Discriminated> =
    $wrap_FromRdfResourceFunction(NodeShapeSpecificProperties._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    NodeShapeSpecificProperties.Discriminated,
    NodeShapeSpecificProperties.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) =>
          NodeShapeSpecificProperties.fromRdfResource(resource, options),
        ),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isNodeShapeSpecificProperties: $ObjectTypeGuardFunction<
    NodeShapeSpecificProperties.Discriminated
  > = (object): object is NodeShapeSpecificProperties.Discriminated =>
    object.$type === "NodeShapeSpecificProperties";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      closed: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
      discriminantValue: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#discriminantValue",
        ),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      extern: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#extern",
        ),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
      fromRdfType: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#fromRdfType",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Option" } as const,
      } as const,
      ignoredProperties: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ignoredProperties",
        ),
        type: {
          itemType: {
            itemType: { kind: "Iri" } as const,
            kind: "List",
          } as const,
          kind: "Option",
        } as const,
      } as const,
      properties: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Set",
        } as const,
      } as const,
      rdfType: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#rdfType",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Option" } as const,
      } as const,
      subClassOf: {
        kind: "Shacl",
        path: $rdfs_subClassOf,
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      toRdfTypes: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#toRdfType",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      tsImports: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsImport",
        ),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Set",
        } as const,
      } as const,
      types: {
        kind: "Shacl",
        path: $rdf_type,
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<NodeShapeSpecificProperties, "$identifier">
  > = (_nodeShapeSpecificProperties) =>
    $compactRecord({
      $identifier: _nodeShapeSpecificProperties.$identifier().toString(),
    });
}

export type Ontology = {
  readonly $identifier: () => Ontology.Identifier;

  readonly comment: Maybe<string>;

  readonly label: Maybe<string>;
};

export namespace Ontology {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    Ontology.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: Ontology.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      comment: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.comment,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      label: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.label,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
    }).chain((properties) => Ontology.create(properties));

  export const $toString: $ToStringFunction<Omit<Ontology, "comment">> = (
    _ontology,
  ) => `Ontology(${JSON.stringify(Ontology.toStringRecord(_ontology))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: Ontology.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, Ontology.Discriminated> = (parameters = {}) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("Ontology" as const),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters.comment,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.comment.type,
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters.label,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.label.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: Ontology.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => Ontology.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly comment?: string | Maybe<string>;
    readonly label?: string | Maybe<string>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: Ontology.CreateParameters<$DefaultNamespaceT>,
  ) => Ontology.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = Ontology & { readonly $type: "Ontology" };

  export const fromRdfResource: $FromRdfResourceFunction<Ontology.Discriminated> =
    $wrap_FromRdfResourceFunction(Ontology._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    Ontology.Discriminated,
    Ontology.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => Ontology.fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isOntology: $ObjectTypeGuardFunction<Ontology.Discriminated> = (
    object,
  ): object is Ontology.Discriminated => object.$type === "Ontology";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      comment: {
        kind: "Shacl",
        path: $rdfs_comment,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      label: {
        kind: "Shacl",
        path: $rdfs_label,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Omit<Ontology, "comment">
  > = (_ontology) =>
    $compactRecord({
      $identifier: _ontology.$identifier().toString(),
      label: _ontology.label.map((item) => item.toString()).extract(),
    });
}

/**
 * Service operation
 */
export type Operation = {
  readonly $identifier: () => Operation.Identifier;

  /**
   * Transport bindings for the operation, loosely modeled after WSDL. If no bindings are specified the operation will be excluded from transport client and server generation.
   */
  readonly bindings: readonly OperationHttpBinding[];

  readonly comment: Maybe<string>;

  /**
   * Error types associated with the operation
   */
  readonly error: readonly OperationError[];

  readonly label: Maybe<string>;

  /**
   * Identifier-safe name of the operation, incorporated into generated code.
   */
  readonly name: Maybe<string>;

  /**
   * Optional parameter type. This must be a node shape with properties (a 'struct').
   */
  readonly parameter: Maybe<OperationParameter>;

  /**
   * Optional result type. The type is a property shape in order to incorporate cardinality.
   */
  readonly result: Maybe<OperationResult>;
};

export namespace Operation {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    Operation.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: Operation.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      $rdfType: !options.ignoreRdfType
        ? $ensureRdfResourceType(
            resource,
            [Operation.schema.properties.$rdfType.fromRdfType],
            {
              graph: options.graph,
            },
          )
        : Right(true as const),
      bindings: $shaclPropertyFromRdf<
        readonly OperationHttpBinding[],
        $CollectionSchema<OperationHttpBinding.Schema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: Operation.schema.properties.bindings,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          OperationHttpBinding,
          OperationHttpBinding.Schema
        >(OperationHttpBinding.fromRdfResourceValues),
      }),
      comment: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.comment,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      error: $shaclPropertyFromRdf<
        readonly OperationError[],
        $CollectionSchema<OperationError.Schema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: Operation.schema.properties.error,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          OperationError,
          OperationError.Schema
        >(OperationError.fromRdfResourceValues),
      }),
      label: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.label,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      name: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: Operation.schema.properties.name,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      parameter: $shaclPropertyFromRdf<
        Maybe<OperationParameter>,
        $MaybeSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: Operation.schema.properties.parameter,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          OperationParameter,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      result: $shaclPropertyFromRdf<
        Maybe<OperationResult>,
        $MaybeSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: Operation.schema.properties.result,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          OperationResult,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
    }).chain((properties) => Operation.create(properties));

  export const $toString: $ToStringFunction<
    Pick<Operation, "$identifier" | "label" | "name">
  > = (_operation) =>
    `Operation(${JSON.stringify(Operation.toStringRecord(_operation))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: Operation.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, Operation.Discriminated> = (parameters = {}) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("Operation" as const),
      bindings: $convertToScalarSet($identityConversionFunction)(
        parameters.bindings,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          Operation.schema.properties.bindings.type,
          value,
        ),
      ),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters.comment,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.comment.type,
          value,
        ),
      ),
      error: $convertToScalarSet($identityConversionFunction)(
        parameters.error,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          Operation.schema.properties.error.type,
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters.label,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.label.type,
          value,
        ),
      ),
      name: $convertToMaybe($identityConversionFunction)(
        parameters.name,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          Operation.schema.properties.name.type,
          value,
        ),
      ),
      parameter: $convertToMaybe($convertToIdentifier)(
        parameters.parameter,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          Operation.schema.properties.parameter.type,
          value,
        ),
      ),
      result: $convertToMaybe($convertToIdentifier)(
        parameters.result,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          Operation.schema.properties.result.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: Operation.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => Operation.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly bindings?: OperationHttpBinding | readonly OperationHttpBinding[];
    readonly comment?: string | Maybe<string>;
    readonly error?: OperationError | readonly OperationError[];
    readonly label?: string | Maybe<string>;
    readonly name?: string | Maybe<string>;
    readonly parameter?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | Maybe<OperationParameter>;
    readonly result?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | Maybe<OperationResult>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: Operation.CreateParameters<$DefaultNamespaceT>,
  ) => Operation.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = Operation & { readonly $type: "Operation" };

  export const fromRdfResource: $FromRdfResourceFunction<Operation.Discriminated> =
    $wrap_FromRdfResourceFunction(Operation._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    Operation.Discriminated,
    Operation.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => Operation.fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isOperation: $ObjectTypeGuardFunction<
    Operation.Discriminated
  > = (object): object is Operation.Discriminated =>
    object.$type === "Operation";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      $rdfType: {
        fromRdfType: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#Operation",
        ),
        kind: "RdfType",
        toRdfTypes: [
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#Operation"),
        ],
      } as const,
      bindings: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#binding",
        ),
        get type() {
          return {
            get itemType() {
              return OperationHttpBinding.schema;
            },
            kind: "Set",
          } as const;
        },
      } as const,
      comment: {
        kind: "Shacl",
        path: $rdfs_comment,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      error: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#error"),
        get type() {
          return {
            get itemType() {
              return OperationError.schema;
            },
            kind: "Set",
          } as const;
        },
      } as const,
      label: {
        kind: "Shacl",
        path: $rdfs_label,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      name: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      parameter: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#parameter",
        ),
        get type() {
          return {
            get itemType() {
              return OperationParameter.schema;
            },
            kind: "Option",
          } as const;
        },
      } as const,
      result: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#result",
        ),
        get type() {
          return {
            get itemType() {
              return OperationResult.schema;
            },
            kind: "Option",
          } as const;
        },
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<Operation, "$identifier" | "label" | "name">
  > = (_operation) =>
    $compactRecord({
      $identifier: _operation.$identifier().toString(),
      label: _operation.label.map((item) => item.toString()).extract(),
      name: _operation.name.map((item) => item.toString()).extract(),
    });
}

/**
 * Error type associated with an operation. Must be a struct type (i.e., have at least one sh:property).
 */
export type OperationError = {
  readonly $identifier: () => OperationError.Identifier;

  readonly classes: readonly NamedNode[];

  readonly closed: Maybe<boolean>;

  readonly comment: Maybe<string>;

  readonly deactivated: Maybe<boolean>;

  readonly extern: Maybe<boolean>;

  readonly fromRdfType: Maybe<NamedNode>;

  readonly ignoredProperties: Maybe<readonly NamedNode[]>;

  readonly isDefinedBy: Maybe<BlankNode | NamedNode>;

  readonly label: Maybe<string>;

  readonly message: Maybe<string>;

  readonly nodeKind: Maybe<
    NamedNode<
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
    >
  >;

  readonly properties: readonly (BlankNode | NamedNode)[];

  readonly rdfType: Maybe<NamedNode>;

  readonly severity: Maybe<Severity>;

  /**
   * Name to use in generated code. Used on node shapes (which don't permit sh:name) and to override sh:name in property shapes.
   */
  readonly shaclmateName: Maybe<string>;

  readonly subClassOf: readonly NamedNode[];

  readonly toRdfTypes: readonly NamedNode[];

  readonly tsImports: readonly string[];

  readonly types: readonly NamedNode[];
};

export namespace OperationError {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    OperationError.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: OperationError.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      classes: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.classes,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      closed: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.closed,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      comment: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.comment,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      deactivated: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.deactivated,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      extern: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.extern,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      fromRdfType: $shaclPropertyFromRdf<
        Maybe<NamedNode>,
        $MaybeSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.fromRdfType,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      ignoredProperties: $shaclPropertyFromRdf<
        Maybe<readonly NamedNode[]>,
        $MaybeSchema<$CollectionSchema<$IriSchema<string>>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.ignoredProperties,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          readonly NamedNode[],
          $CollectionSchema<$IriSchema<string>>
        >(
          $listFromRdfResourceValues<NamedNode, $IriSchema<string>>(
            $iriFromRdfResourceValues<string>,
          ),
        ),
      }),
      isDefinedBy: $shaclPropertyFromRdf<
        Maybe<BlankNode | NamedNode>,
        $MaybeSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.isDefinedBy,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      label: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.label,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      message: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.message,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      nodeKind: $shaclPropertyFromRdf<
        Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >,
        $MaybeSchema<
          $IriSchema<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.nodeKind,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >,
          $IriSchema<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >(
          $iriFromRdfResourceValues<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >,
        ),
      }),
      properties: $shaclPropertyFromRdf<
        readonly (BlankNode | NamedNode)[],
        $CollectionSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: OperationError.schema.properties.properties,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      rdfType: $shaclPropertyFromRdf<
        Maybe<NamedNode>,
        $MaybeSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.rdfType,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      severity: $shaclPropertyFromRdf<
        Maybe<Severity>,
        $MaybeSchema<$IriSchema<Severity["value"]>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.severity,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          Severity,
          $IriSchema<Severity["value"]>
        >($iriFromRdfResourceValues<Severity["value"]>),
      }),
      shaclmateName: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.shaclmateName,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      subClassOf: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.subClassOf,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      toRdfTypes: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          NodeShapeSpecificProperties.schema.properties.toRdfTypes,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      tsImports: $shaclPropertyFromRdf<
        readonly string[],
        $CollectionSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.tsImports,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      types: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: NodeShapeSpecificProperties.schema.properties.types,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
    }).chain((properties) => OperationError.create(properties));

  export const $toString: $ToStringFunction<
    Pick<OperationError, "$identifier" | "label" | "shaclmateName">
  > = (_operationError) =>
    `OperationError(${JSON.stringify(OperationError.toStringRecord(_operationError))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: OperationError.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, OperationError.Discriminated> = (parameters = {}) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("OperationError" as const),
      classes: $convertToScalarSet($convertToIri)(
        parameters.classes,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          BaseShape.schema.properties.classes.type,
          value,
        ),
      ),
      closed: $convertToMaybe($identityConversionFunction)(
        parameters.closed,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.closed.type,
          value,
        ),
      ),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters.comment,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.comment.type,
          value,
        ),
      ),
      deactivated: $convertToMaybe($identityConversionFunction)(
        parameters.deactivated,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.deactivated.type,
          value,
        ),
      ),
      extern: $convertToMaybe($identityConversionFunction)(
        parameters.extern,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.extern.type,
          value,
        ),
      ),
      fromRdfType: $convertToMaybe($convertToIri)(
        parameters.fromRdfType,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.fromRdfType.type,
          value,
        ),
      ),
      ignoredProperties: $convertToMaybe($convertToList($convertToIri))(
        parameters.ignoredProperties,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($validateArray($identityValidationFunction))(
          NodeShapeSpecificProperties.schema.properties.ignoredProperties.type,
          value,
        ),
      ),
      isDefinedBy: $convertToMaybe($convertToIdentifier)(
        parameters.isDefinedBy,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.isDefinedBy.type,
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters.label,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.label.type,
          value,
        ),
      ),
      message: $convertToMaybe($identityConversionFunction)(
        parameters.message,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.message.type,
          value,
        ),
      ),
      nodeKind: $convertToMaybe(
        $convertToIriLiteral<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >,
      )(parameters.nodeKind, parameters.$defaultNamespace).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.nodeKind.type,
          value,
        ),
      ),
      properties: $convertToScalarSet($convertToIdentifier)(
        parameters.properties,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          OperationError.schema.properties.properties.type,
          value,
        ),
      ),
      rdfType: $convertToMaybe($convertToIri)(
        parameters.rdfType,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.rdfType.type,
          value,
        ),
      ),
      severity: $convertToMaybe($convertToIriLiteral<Severity["value"]>)(
        parameters.severity,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.severity.type,
          value,
        ),
      ),
      shaclmateName: $convertToMaybe($identityConversionFunction)(
        parameters.shaclmateName,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.shaclmateName.type,
          value,
        ),
      ),
      subClassOf: $convertToScalarSet($convertToIri)(
        parameters.subClassOf,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.subClassOf.type,
          value,
        ),
      ),
      toRdfTypes: $convertToScalarSet($convertToIri)(
        parameters.toRdfTypes,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.toRdfTypes.type,
          value,
        ),
      ),
      tsImports: $convertToScalarSet($identityConversionFunction)(
        parameters.tsImports,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.tsImports.type,
          value,
        ),
      ),
      types: $convertToScalarSet($convertToIri)(
        parameters.types,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          NodeShapeSpecificProperties.schema.properties.types.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: OperationError.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => OperationError.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly classes?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly closed?: boolean | Maybe<boolean>;
    readonly comment?: string | Maybe<string>;
    readonly deactivated?: boolean | Maybe<boolean>;
    readonly extern?: boolean | Maybe<boolean>;
    readonly fromRdfType?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | Maybe<NamedNode>;
    readonly ignoredProperties?:
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[]
      | Maybe<readonly NamedNode[]>;
    readonly isDefinedBy?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | Maybe<BlankNode | NamedNode>;
    readonly label?: string | Maybe<string>;
    readonly message?: string | Maybe<string>;
    readonly nodeKind?:
      | (
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        )
      | NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      | Maybe<
          NamedNode<
            | "http://www.w3.org/ns/shacl#BlankNode"
            | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
            | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
            | "http://www.w3.org/ns/shacl#IRI"
            | "http://www.w3.org/ns/shacl#IRIOrLiteral"
            | "http://www.w3.org/ns/shacl#Literal"
          >
        >;
    readonly properties?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | readonly (
          | BlankNode
          | NamedNode
          | (keyof $DefaultNamespaceT & string)
          | undefined
        )[];
    readonly rdfType?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | Maybe<NamedNode>;
    readonly severity?: Severity["value"] | Severity | Maybe<Severity>;
    readonly shaclmateName?: string | Maybe<string>;
    readonly subClassOf?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly toRdfTypes?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly tsImports?: string | readonly string[];
    readonly types?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: OperationError.CreateParameters<$DefaultNamespaceT>,
  ) => OperationError.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = OperationError & {
    readonly $type: "OperationError";
  };

  export const fromRdfResource: $FromRdfResourceFunction<OperationError.Discriminated> =
    $wrap_FromRdfResourceFunction(OperationError._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    OperationError.Discriminated,
    OperationError.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => OperationError.fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isOperationError: $ObjectTypeGuardFunction<
    OperationError.Discriminated
  > = (object): object is OperationError.Discriminated =>
    object.$type === "OperationError";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      classes: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      closed: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
      comment: {
        kind: "Shacl",
        path: $rdfs_comment,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      deactivated: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
      extern: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#extern",
        ),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
      fromRdfType: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#fromRdfType",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Option" } as const,
      } as const,
      ignoredProperties: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ignoredProperties",
        ),
        type: {
          itemType: {
            itemType: { kind: "Iri" } as const,
            kind: "List",
          } as const,
          kind: "Option",
        } as const,
      } as const,
      isDefinedBy: {
        kind: "Shacl",
        path: $rdfs_isDefinedBy,
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Option",
        } as const,
      } as const,
      label: {
        kind: "Shacl",
        path: $rdfs_label,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      message: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#message"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      nodeKind: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
        type: {
          itemType: {
            in: [
              dataFactory.namedNode("http://www.w3.org/ns/shacl#BlankNode"),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrIRI",
              ),
              dataFactory.namedNode(
                "http://www.w3.org/ns/shacl#BlankNodeOrLiteral",
              ),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRI"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#IRIOrLiteral"),
              dataFactory.namedNode("http://www.w3.org/ns/shacl#Literal"),
            ] as const,
            kind: "Iri",
          } as const,
          kind: "Option",
        } as const,
      } as const,
      properties: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Set",
          minCount: 1,
        } as const,
      } as const,
      rdfType: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#rdfType",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Option" } as const,
      } as const,
      severity: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#severity"),
        get type() {
          return {
            get itemType() {
              return Severity.schema;
            },
            kind: "Option",
          } as const;
        },
      } as const,
      shaclmateName: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      subClassOf: {
        kind: "Shacl",
        path: $rdfs_subClassOf,
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      toRdfTypes: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#toRdfType",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      tsImports: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsImport",
        ),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Set",
        } as const,
      } as const,
      types: {
        kind: "Shacl",
        path: $rdf_type,
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<OperationError, "$identifier" | "label" | "shaclmateName">
  > = (_operationError) =>
    $compactRecord({
      $identifier: _operationError.$identifier().toString(),
      label: _operationError.label.map((item) => item.toString()).extract(),
      shaclmateName: _operationError.shaclmateName
        .map((item) => item.toString())
        .extract(),
    });
}

/**
 * HTTP binding for an operation error
 */
export type OperationErrorHttpBinding = {
  readonly $identifier: () => OperationErrorHttpBinding.Identifier;

  /**
   * HTTP client/server error code for the bound error.
   */
  readonly statusCode: OperationErrorHttpBindingStatusCode;
};

export namespace OperationErrorHttpBinding {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    OperationErrorHttpBinding.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: OperationErrorHttpBinding.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      statusCode: $shaclPropertyFromRdf<
        OperationErrorHttpBindingStatusCode,
        $NumericSchema<OperationErrorHttpBindingStatusCode>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: OperationErrorHttpBinding.schema.properties.statusCode,
        typeFromRdfResourceValues:
          $intFromRdfResourceValues<OperationErrorHttpBindingStatusCode>,
      }),
    }).chain((properties) => OperationErrorHttpBinding.create(properties));

  export const $toString: $ToStringFunction<
    Pick<OperationErrorHttpBinding, "$identifier">
  > = (_operationErrorHttpBinding) =>
    `OperationErrorHttpBinding(${JSON.stringify(
      OperationErrorHttpBinding.toStringRecord(_operationErrorHttpBinding),
    )})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: OperationErrorHttpBinding.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, OperationErrorHttpBinding.Discriminated> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("OperationErrorHttpBinding" as const),
      statusCode: Either.of(parameters.statusCode),
    }).map((object) =>
      $monkeyPatchObject(object, {
        $toString: OperationErrorHttpBinding.$toString,
      }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => OperationErrorHttpBinding.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly statusCode: OperationErrorHttpBindingStatusCode;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: OperationErrorHttpBinding.CreateParameters<$DefaultNamespaceT>,
  ) => OperationErrorHttpBinding.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = OperationErrorHttpBinding & {
    readonly $type: "OperationErrorHttpBinding";
  };

  export const fromRdfResource: $FromRdfResourceFunction<OperationErrorHttpBinding.Discriminated> =
    $wrap_FromRdfResourceFunction(OperationErrorHttpBinding._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    OperationErrorHttpBinding.Discriminated,
    OperationErrorHttpBinding.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) =>
          OperationErrorHttpBinding.fromRdfResource(resource, options),
        ),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isOperationErrorHttpBinding: $ObjectTypeGuardFunction<
    OperationErrorHttpBinding.Discriminated
  > = (object): object is OperationErrorHttpBinding.Discriminated =>
    object.$type === "OperationErrorHttpBinding";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      statusCode: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#httpStatusCode",
        ),
        get type() {
          return OperationErrorHttpBindingStatusCode.schema;
        },
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<OperationErrorHttpBinding, "$identifier">
  > = (_operationErrorHttpBinding) =>
    $compactRecord({
      $identifier: _operationErrorHttpBinding.$identifier().toString(),
    });
}

export type OperationErrorHttpBindingStatusCode =
  OperationErrorHttpBindingStatusCode.Schema["in"][number];

export namespace OperationErrorHttpBindingStatusCode {
  export const schema = {
    datatype: $xsd_int,
    in: [
      400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414,
      415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451, 500,
      501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
    ] as const,
    kind: "Int",
  } as const;

  export type Schema = typeof schema;
}

/**
 * HTTP binding for an operation
 */
export type OperationHttpBinding = {
  readonly $identifier: () => OperationHttpBinding.Identifier;

  /**
   * HTTP request body method. If this is not specified, it's inferred from the existence of path, query, and/or body parameters
   */
  readonly method: Maybe<OperationHttpBindingMethod>;

  /**
   * RFC 6570 URI template for the HTTP request. Variables in the template must correspond to properties of the parameter. Any other properties of the parameter are serialized into the HTTP requets body following the given/inferred content type.
   */
  readonly urlTemplate: string;
};

export namespace OperationHttpBinding {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    OperationHttpBinding.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: OperationHttpBinding.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      method: $shaclPropertyFromRdf<
        Maybe<OperationHttpBindingMethod>,
        $MaybeSchema<$StringSchema<OperationHttpBindingMethod>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: OperationHttpBinding.schema.properties.method,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          OperationHttpBindingMethod,
          $StringSchema<OperationHttpBindingMethod>
        >($stringFromRdfResourceValues<OperationHttpBindingMethod>),
      }),
      urlTemplate: $shaclPropertyFromRdf<string, $StringSchema<string>>({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: OperationHttpBinding.schema.properties.urlTemplate,
        typeFromRdfResourceValues: $stringFromRdfResourceValues<string>,
      }),
    }).chain((properties) => OperationHttpBinding.create(properties));

  export const $toString: $ToStringFunction<
    Pick<OperationHttpBinding, "$identifier">
  > = (_operationHttpBinding) =>
    `OperationHttpBinding(${JSON.stringify(OperationHttpBinding.toStringRecord(_operationHttpBinding))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: OperationHttpBinding.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, OperationHttpBinding.Discriminated> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("OperationHttpBinding" as const),
      method: $convertToMaybe($identityConversionFunction)(
        parameters.method,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          OperationHttpBinding.schema.properties.method.type,
          value,
        ),
      ),
      urlTemplate: Either.of(parameters.urlTemplate),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: OperationHttpBinding.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => OperationHttpBinding.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly method?:
      | OperationHttpBindingMethod
      | Maybe<OperationHttpBindingMethod>;
    readonly urlTemplate: string;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: OperationHttpBinding.CreateParameters<$DefaultNamespaceT>,
  ) => OperationHttpBinding.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = OperationHttpBinding & {
    readonly $type: "OperationHttpBinding";
  };

  export const fromRdfResource: $FromRdfResourceFunction<OperationHttpBinding.Discriminated> =
    $wrap_FromRdfResourceFunction(OperationHttpBinding._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    OperationHttpBinding.Discriminated,
    OperationHttpBinding.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) =>
          OperationHttpBinding.fromRdfResource(resource, options),
        ),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isOperationHttpBinding: $ObjectTypeGuardFunction<
    OperationHttpBinding.Discriminated
  > = (object): object is OperationHttpBinding.Discriminated =>
    object.$type === "OperationHttpBinding";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      method: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://schema.org/httpMethod"),
        get type() {
          return {
            get itemType() {
              return OperationHttpBindingMethod.schema;
            },
            kind: "Option",
          } as const;
        },
      } as const,
      urlTemplate: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://schema.org/urlTemplate"),
        type: { datatype: $xsd_string, kind: "String" } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<OperationHttpBinding, "$identifier">
  > = (_operationHttpBinding) =>
    $compactRecord({
      $identifier: _operationHttpBinding.$identifier().toString(),
    });
}

export type OperationHttpBindingMethod =
  OperationHttpBindingMethod.Schema["in"][number];

export namespace OperationHttpBindingMethod {
  export const schema = {
    datatype: $xsd_string,
    in: ["DELETE", "GET", "POST", "PUT"] as const,
    kind: "String",
  } as const;

  export type Schema = typeof schema;
}

export type OperationHttpBindingStatusCode =
  OperationHttpBindingStatusCode.Schema["in"][number];

export namespace OperationHttpBindingStatusCode {
  export const schema = {
    datatype: $xsd_int,
    in: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226] as const,
    kind: "Int",
  } as const;

  export type Schema = typeof schema;
}

export type OperationParameter = BlankNode | NamedNode;

export namespace OperationParameter {
  export const schema = { kind: "Identifier" } as const;

  export type Schema = typeof schema;
}

export type OperationParameterHttpBindingContentType =
  OperationParameterHttpBindingContentType.Schema["in"][number];

export namespace OperationParameterHttpBindingContentType {
  export const schema = {
    datatype: $xsd_string,
    in: ["application/json"] as const,
    kind: "String",
  } as const;

  export type Schema = typeof schema;
}

export type OperationResult = BlankNode | NamedNode;

export namespace OperationResult {
  export const schema = { kind: "Identifier" } as const;

  export type Schema = typeof schema;
}

export type OperationResultHttpBindingContentType =
  OperationResultHttpBindingContentType.Schema["in"][number];

export namespace OperationResultHttpBindingContentType {
  export const schema = {
    datatype: $xsd_string,
    in: ["application/json"] as const,
    kind: "String",
  } as const;

  export type Schema = typeof schema;
}

export type PropertyGroup = {
  readonly $identifier: () => PropertyGroup.Identifier;

  readonly comment: Maybe<string>;

  readonly label: Maybe<string>;
};

export namespace PropertyGroup {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    PropertyGroup.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: PropertyGroup.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      comment: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.comment,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      label: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.label,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
    }).chain((properties) => PropertyGroup.create(properties));

  export const $toString: $ToStringFunction<Omit<PropertyGroup, "comment">> = (
    _propertyGroup,
  ) =>
    `PropertyGroup(${JSON.stringify(PropertyGroup.toStringRecord(_propertyGroup))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: PropertyGroup.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, PropertyGroup.Discriminated> = (parameters = {}) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("PropertyGroup" as const),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters.comment,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.comment.type,
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters.label,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.label.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: PropertyGroup.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => PropertyGroup.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly comment?: string | Maybe<string>;
    readonly label?: string | Maybe<string>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: PropertyGroup.CreateParameters<$DefaultNamespaceT>,
  ) => PropertyGroup.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = PropertyGroup & {
    readonly $type: "PropertyGroup";
  };

  export const fromRdfResource: $FromRdfResourceFunction<PropertyGroup.Discriminated> =
    $wrap_FromRdfResourceFunction(PropertyGroup._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    PropertyGroup.Discriminated,
    PropertyGroup.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => PropertyGroup.fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isPropertyGroup: $ObjectTypeGuardFunction<
    PropertyGroup.Discriminated
  > = (object): object is PropertyGroup.Discriminated =>
    object.$type === "PropertyGroup";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      comment: {
        kind: "Shacl",
        path: $rdfs_comment,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      label: {
        kind: "Shacl",
        path: $rdfs_label,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Omit<PropertyGroup, "comment">
  > = (_propertyGroup) =>
    $compactRecord({
      $identifier: _propertyGroup.$identifier().toString(),
      label: _propertyGroup.label.map((item) => item.toString()).extract(),
    });
}

export type PropertyShapeSpecificProperties = {
  readonly $identifier: () => PropertyShapeSpecificProperties.Identifier;

  readonly defaultValue: Maybe<NamedNode | Literal>;

  readonly description: Maybe<string>;

  readonly disjoint: readonly NamedNode[];

  /**
   * Whether to include this property in a toString()-type display, defaults to false
   */
  readonly display: boolean;

  readonly equals: readonly NamedNode[];

  readonly groups: readonly (BlankNode | NamedNode)[];

  readonly lessThan: readonly NamedNode[];

  readonly lessThanOrEquals: readonly NamedNode[];

  readonly maxCount: Maybe<bigint>;

  readonly minCount: Maybe<bigint>;

  readonly name: Maybe<string>;

  readonly order: Maybe<number>;

  readonly path: $PropertyPath;

  readonly qualifiedMaxCount: Maybe<bigint>;

  readonly qualifiedMinCount: Maybe<bigint>;

  readonly qualifiedValueShape: Maybe<BlankNode | NamedNode>;

  readonly qualifiedValueShapesDisjoint: Maybe<boolean>;

  readonly resolve: Maybe<BlankNode | NamedNode>;

  readonly uniqueLang: Maybe<boolean>;
};

export namespace PropertyShapeSpecificProperties {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    PropertyShapeSpecificProperties.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema:
            PropertyShapeSpecificProperties.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      defaultValue: $shaclPropertyFromRdf<
        Maybe<NamedNode | Literal>,
        $MaybeSchema<$TermSchema<NamedNode | Literal>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.defaultValue,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          NamedNode | Literal,
          $TermSchema<NamedNode | Literal>
        >($termFromRdfResourceValues<NamedNode | Literal>),
      }),
      description: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.description,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      disjoint: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.disjoint,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      display: $shaclPropertyFromRdf<
        boolean,
        $DefaultValueSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.display,
        typeFromRdfResourceValues: $defaultValueFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      equals: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.equals,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      groups: $shaclPropertyFromRdf<
        readonly (BlankNode | NamedNode)[],
        $CollectionSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.groups,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      lessThan: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.lessThan,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      lessThanOrEquals: $shaclPropertyFromRdf<
        readonly NamedNode[],
        $CollectionSchema<$IriSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.lessThanOrEquals,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          NamedNode,
          $IriSchema<string>
        >($iriFromRdfResourceValues<string>),
      }),
      maxCount: $shaclPropertyFromRdf<
        Maybe<bigint>,
        $MaybeSchema<$NumericSchema<bigint>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.maxCount,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          bigint,
          $NumericSchema<bigint>
        >($bigIntFromRdfResourceValues<bigint>),
      }),
      minCount: $shaclPropertyFromRdf<
        Maybe<bigint>,
        $MaybeSchema<$NumericSchema<bigint>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.minCount,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          bigint,
          $NumericSchema<bigint>
        >($bigIntFromRdfResourceValues<bigint>),
      }),
      name: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: PropertyShapeSpecificProperties.schema.properties.name,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      order: $shaclPropertyFromRdf<
        Maybe<number>,
        $MaybeSchema<$NumericSchema<number>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: PropertyShapeSpecificProperties.schema.properties.order,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          number,
          $NumericSchema<number>
        >($floatFromRdfResourceValues<number>),
      }),
      path: $shaclPropertyFromRdf<$PropertyPath, $PropertyPath.Schema>({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: PropertyShapeSpecificProperties.schema.properties.path,
        typeFromRdfResourceValues: $PropertyPath.fromRdfResourceValues,
      }),
      qualifiedMaxCount: $shaclPropertyFromRdf<
        Maybe<bigint>,
        $MaybeSchema<$NumericSchema<bigint>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.qualifiedMaxCount,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          bigint,
          $NumericSchema<bigint>
        >($bigIntFromRdfResourceValues<bigint>),
      }),
      qualifiedMinCount: $shaclPropertyFromRdf<
        Maybe<bigint>,
        $MaybeSchema<$NumericSchema<bigint>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.qualifiedMinCount,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          bigint,
          $NumericSchema<bigint>
        >($bigIntFromRdfResourceValues<bigint>),
      }),
      qualifiedValueShape: $shaclPropertyFromRdf<
        Maybe<BlankNode | NamedNode>,
        $MaybeSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.qualifiedValueShape,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      qualifiedValueShapesDisjoint: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties
            .qualifiedValueShapesDisjoint,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
      resolve: $shaclPropertyFromRdf<
        Maybe<BlankNode | NamedNode>,
        $MaybeSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.resolve,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      uniqueLang: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          PropertyShapeSpecificProperties.schema.properties.uniqueLang,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
    }).chain((properties) =>
      PropertyShapeSpecificProperties.create(properties),
    );

  export const $toString: $ToStringFunction<
    Pick<PropertyShapeSpecificProperties, "$identifier" | "name" | "path">
  > = (_propertyShapeSpecificProperties) =>
    `PropertyShapeSpecificProperties(${JSON.stringify(
      PropertyShapeSpecificProperties.toStringRecord(
        _propertyShapeSpecificProperties,
      ),
    )})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: PropertyShapeSpecificProperties.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, PropertyShapeSpecificProperties.Discriminated> = (
    parameters,
  ) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("PropertyShapeSpecificProperties" as const),
      defaultValue: $convertToMaybe($identityConversionFunction)(
        parameters.defaultValue,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.defaultValue.type,
          value,
        ),
      ),
      description: $convertToMaybe($identityConversionFunction)(
        parameters.description,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.description.type,
          value,
        ),
      ),
      disjoint: $convertToScalarSet($convertToIri)(
        parameters.disjoint,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.disjoint.type,
          value,
        ),
      ),
      display: $convertWithDefaultValue($identityConversionFunction, false)(
        parameters.display,
        parameters.$defaultNamespace,
      ),
      equals: $convertToScalarSet($convertToIri)(
        parameters.equals,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.equals.type,
          value,
        ),
      ),
      groups: $convertToScalarSet($convertToIdentifier)(
        parameters.groups,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.groups.type,
          value,
        ),
      ),
      lessThan: $convertToScalarSet($convertToIri)(
        parameters.lessThan,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.lessThan.type,
          value,
        ),
      ),
      lessThanOrEquals: $convertToScalarSet($convertToIri)(
        parameters.lessThanOrEquals,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.lessThanOrEquals
            .type,
          value,
        ),
      ),
      maxCount: $convertToMaybe($convertToBigInt)(
        parameters.maxCount,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.maxCount.type,
          value,
        ),
      ),
      minCount: $convertToMaybe($convertToBigInt)(
        parameters.minCount,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.minCount.type,
          value,
        ),
      ),
      name: $convertToMaybe($identityConversionFunction)(
        parameters.name,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.name.type,
          value,
        ),
      ),
      order: $convertToMaybe($identityConversionFunction)(
        parameters.order,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.order.type,
          value,
        ),
      ),
      path: Either.of(parameters.path),
      qualifiedMaxCount: $convertToMaybe($convertToBigInt)(
        parameters.qualifiedMaxCount,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.qualifiedMaxCount
            .type,
          value,
        ),
      ),
      qualifiedMinCount: $convertToMaybe($convertToBigInt)(
        parameters.qualifiedMinCount,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.qualifiedMinCount
            .type,
          value,
        ),
      ),
      qualifiedValueShape: $convertToMaybe($convertToIdentifier)(
        parameters.qualifiedValueShape,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.qualifiedValueShape
            .type,
          value,
        ),
      ),
      qualifiedValueShapesDisjoint: $convertToMaybe(
        $identityConversionFunction,
      )(
        parameters.qualifiedValueShapesDisjoint,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties
            .qualifiedValueShapesDisjoint.type,
          value,
        ),
      ),
      resolve: $convertToMaybe($convertToIdentifier)(
        parameters.resolve,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.resolve.type,
          value,
        ),
      ),
      uniqueLang: $convertToMaybe($identityConversionFunction)(
        parameters.uniqueLang,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PropertyShapeSpecificProperties.schema.properties.uniqueLang.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, {
        $toString: PropertyShapeSpecificProperties.$toString,
      }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => PropertyShapeSpecificProperties.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly defaultValue?: (NamedNode | Literal) | Maybe<NamedNode | Literal>;
    readonly description?: string | Maybe<string>;
    readonly disjoint?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly display?: boolean;
    readonly equals?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly groups?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | readonly (
          | BlankNode
          | NamedNode
          | (keyof $DefaultNamespaceT & string)
          | undefined
        )[];
    readonly lessThan?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly lessThanOrEquals?:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode
      | readonly ((keyof $DefaultNamespaceT & string) | NamedNode)[];
    readonly maxCount?: bigint | number | string | Maybe<bigint>;
    readonly minCount?: bigint | number | string | Maybe<bigint>;
    readonly name?: string | Maybe<string>;
    readonly order?: number | Maybe<number>;
    readonly path: $PropertyPath;
    readonly qualifiedMaxCount?: bigint | number | string | Maybe<bigint>;
    readonly qualifiedMinCount?: bigint | number | string | Maybe<bigint>;
    readonly qualifiedValueShape?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | Maybe<BlankNode | NamedNode>;
    readonly qualifiedValueShapesDisjoint?: boolean | Maybe<boolean>;
    readonly resolve?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | Maybe<BlankNode | NamedNode>;
    readonly uniqueLang?: boolean | Maybe<boolean>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: PropertyShapeSpecificProperties.CreateParameters<$DefaultNamespaceT>,
  ) => PropertyShapeSpecificProperties.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = PropertyShapeSpecificProperties & {
    readonly $type: "PropertyShapeSpecificProperties";
  };

  export const fromRdfResource: $FromRdfResourceFunction<PropertyShapeSpecificProperties.Discriminated> =
    $wrap_FromRdfResourceFunction(
      PropertyShapeSpecificProperties._fromRdfResource,
    );

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    PropertyShapeSpecificProperties.Discriminated,
    PropertyShapeSpecificProperties.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) =>
          PropertyShapeSpecificProperties.fromRdfResource(resource, options),
        ),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isPropertyShapeSpecificProperties: $ObjectTypeGuardFunction<
    PropertyShapeSpecificProperties.Discriminated
  > = (object): object is PropertyShapeSpecificProperties.Discriminated =>
    object.$type === "PropertyShapeSpecificProperties";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      defaultValue: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
        type: {
          itemType: { kind: "Term", types: ["NamedNode", "Literal"] } as const,
          kind: "Option",
        } as const,
      } as const,
      description: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      disjoint: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#disjoint"),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      display: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#display",
        ),
        type: {
          defaultValue: dataFactory.literal("false", $xsd_boolean),
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "DefaultValue",
        } as const,
      } as const,
      equals: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#equals"),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      groups: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Set",
        } as const,
      } as const,
      lessThan: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#lessThan"),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      lessThanOrEquals: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#lessThanOrEquals",
        ),
        type: { itemType: { kind: "Iri" } as const, kind: "Set" } as const,
      } as const,
      maxCount: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
        type: {
          itemType: { datatype: $xsd_integer, kind: "BigInt" } as const,
          kind: "Option",
        } as const,
      } as const,
      minCount: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
        type: {
          itemType: { datatype: $xsd_integer, kind: "BigInt" } as const,
          kind: "Option",
        } as const,
      } as const,
      name: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      order: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
        type: {
          itemType: { datatype: $xsd_double, kind: "Float" } as const,
          kind: "Option",
        } as const,
      } as const,
      path: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
        get type() {
          return $PropertyPath.schema;
        },
      } as const,
      qualifiedMaxCount: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#qualifiedMaxCount",
        ),
        type: {
          itemType: { datatype: $xsd_integer, kind: "BigInt" } as const,
          kind: "Option",
        } as const,
      } as const,
      qualifiedMinCount: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#qualifiedMinCount",
        ),
        type: {
          itemType: { datatype: $xsd_integer, kind: "BigInt" } as const,
          kind: "Option",
        } as const,
      } as const,
      qualifiedValueShape: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#qualifiedValueShape",
        ),
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Option",
        } as const,
      } as const,
      qualifiedValueShapesDisjoint: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#qualifiedValueShapesDisjoint",
        ),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
      resolve: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#resolve",
        ),
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Option",
        } as const,
      } as const,
      uniqueLang: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<PropertyShapeSpecificProperties, "$identifier" | "name" | "path">
  > = (_propertyShapeSpecificProperties) =>
    $compactRecord({
      $identifier: _propertyShapeSpecificProperties.$identifier().toString(),
      name: _propertyShapeSpecificProperties.name
        .map((item) => item.toString())
        .extract(),
      path: $PropertyPath.$toString(_propertyShapeSpecificProperties.path),
    });
}

/**
 * Service with operations
 */
export type Service = {
  readonly $identifier: () => Service.Identifier;

  readonly comment: Maybe<string>;

  readonly label: Maybe<string>;

  /**
   * Identifier-safe name of the service
   */
  readonly name: Maybe<string>;

  /**
   * Set of operations associated with the service
   */
  readonly operations: readonly Operation[];
};

export namespace Service {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    Service.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: Service.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      $rdfType: !options.ignoreRdfType
        ? $ensureRdfResourceType(
            resource,
            [Service.schema.properties.$rdfType.fromRdfType],
            { graph: options.graph },
          )
        : Right(true as const),
      comment: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.comment,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      label: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: BaseShape.schema.properties.label,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      name: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: Service.schema.properties.name,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      operations: $shaclPropertyFromRdf<
        readonly Operation[],
        $CollectionSchema<Operation.Schema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: Service.schema.properties.operations,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          Operation,
          Operation.Schema
        >(Operation.fromRdfResourceValues),
      }),
    }).chain((properties) => Service.create(properties));

  export const $toString: $ToStringFunction<
    Omit<Service, "comment" | "operations">
  > = (_service) =>
    `Service(${JSON.stringify(Service.toStringRecord(_service))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: Service.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, Service.Discriminated> = (parameters = {}) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("Service" as const),
      comment: $convertToMaybe($identityConversionFunction)(
        parameters.comment,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.comment.type,
          value,
        ),
      ),
      label: $convertToMaybe($identityConversionFunction)(
        parameters.label,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          BaseShape.schema.properties.label.type,
          value,
        ),
      ),
      name: $convertToMaybe($identityConversionFunction)(
        parameters.name,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          Service.schema.properties.name.type,
          value,
        ),
      ),
      operations: $convertToScalarSet($identityConversionFunction)(
        parameters.operations,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          Service.schema.properties.operations.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: Service.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => Service.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly comment?: string | Maybe<string>;
    readonly label?: string | Maybe<string>;
    readonly name?: string | Maybe<string>;
    readonly operations?: Operation | readonly Operation[];
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: Service.CreateParameters<$DefaultNamespaceT>,
  ) => Service.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = Service & { readonly $type: "Service" };

  export const fromRdfResource: $FromRdfResourceFunction<Service.Discriminated> =
    $wrap_FromRdfResourceFunction(Service._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    Service.Discriminated,
    Service.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => Service.fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isService: $ObjectTypeGuardFunction<Service.Discriminated> = (
    object,
  ): object is Service.Discriminated => object.$type === "Service";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      $rdfType: {
        fromRdfType: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#Service",
        ),
        kind: "RdfType",
        toRdfTypes: [
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#Service"),
        ],
      } as const,
      comment: {
        kind: "Shacl",
        path: $rdfs_comment,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      label: {
        kind: "Shacl",
        path: $rdfs_label,
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      name: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      operations: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#operation",
        ),
        get type() {
          return {
            get itemType() {
              return Operation.schema;
            },
            kind: "Set",
          } as const;
        },
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Omit<Service, "comment" | "operations">
  > = (_service) =>
    $compactRecord({
      $identifier: _service.$identifier().toString(),
      label: _service.label.map((item) => item.toString()).extract(),
      name: _service.name.map((item) => item.toString()).extract(),
    });
}

export type Severity = NamedNode<(typeof Severity.schema)["inValues"][number]>;

export namespace Severity {
  const inValues = [
    "http://www.w3.org/ns/shacl#Info",
    "http://www.w3.org/ns/shacl#Warning",
    "http://www.w3.org/ns/shacl#Violation",
  ] as const;

  export const schema = {
    in: inValues.map((inValue) => dataFactory.namedNode(inValue)),
    inValues,
    kind: "Iri",
  } as const;

  export type Schema = typeof schema;
}

export type ValidationReport = {
  readonly $identifier: () => ValidationReport.Identifier;

  readonly conforms: boolean;

  readonly results: readonly ValidationResult[];

  readonly shapesGraphWellFormed: Maybe<boolean>;
};

export namespace ValidationReport {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    ValidationReport.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: ValidationReport.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      $rdfType: !options.ignoreRdfType
        ? $ensureRdfResourceType(
            resource,
            [ValidationReport.schema.properties.$rdfType.fromRdfType],
            {
              graph: options.graph,
            },
          )
        : Right(true as const),
      conforms: $shaclPropertyFromRdf<boolean, $BooleanSchema<boolean>>({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationReport.schema.properties.conforms,
        typeFromRdfResourceValues: $booleanFromRdfResourceValues<boolean>,
      }),
      results: $shaclPropertyFromRdf<
        readonly ValidationResult[],
        $CollectionSchema<ValidationResult.Schema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationReport.schema.properties.results,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          ValidationResult,
          ValidationResult.Schema
        >(ValidationResult.fromRdfResourceValues),
      }),
      shapesGraphWellFormed: $shaclPropertyFromRdf<
        Maybe<boolean>,
        $MaybeSchema<$BooleanSchema<boolean>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          ValidationReport.schema.properties.shapesGraphWellFormed,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          boolean,
          $BooleanSchema<boolean>
        >($booleanFromRdfResourceValues<boolean>),
      }),
    }).chain((properties) => ValidationReport.create(properties));

  export const $toString: $ToStringFunction<
    Pick<ValidationReport, "$identifier">
  > = (_validationReport) =>
    `ValidationReport(${JSON.stringify(ValidationReport.toStringRecord(_validationReport))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: ValidationReport.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, ValidationReport.Discriminated> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("ValidationReport" as const),
      conforms: Either.of(parameters.conforms),
      results: $convertToScalarSet($identityConversionFunction)(
        parameters.results,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          ValidationReport.schema.properties.results.type,
          value,
        ),
      ),
      shapesGraphWellFormed: $convertToMaybe($identityConversionFunction)(
        parameters.shapesGraphWellFormed,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          ValidationReport.schema.properties.shapesGraphWellFormed.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: ValidationReport.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => ValidationReport.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly conforms: boolean;
    readonly results?: ValidationResult | readonly ValidationResult[];
    readonly shapesGraphWellFormed?: boolean | Maybe<boolean>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: ValidationReport.CreateParameters<$DefaultNamespaceT>,
  ) => ValidationReport.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = ValidationReport & {
    readonly $type: "ValidationReport";
  };

  export const fromRdfResource: $FromRdfResourceFunction<ValidationReport.Discriminated> =
    $wrap_FromRdfResourceFunction(ValidationReport._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    ValidationReport.Discriminated,
    ValidationReport.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) =>
          ValidationReport.fromRdfResource(resource, options),
        ),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isValidationReport: $ObjectTypeGuardFunction<
    ValidationReport.Discriminated
  > = (object): object is ValidationReport.Discriminated =>
    object.$type === "ValidationReport";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      $rdfType: {
        fromRdfType: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ValidationReport",
        ),
        kind: "RdfType",
        toRdfTypes: [
          dataFactory.namedNode("http://www.w3.org/ns/shacl#ValidationReport"),
        ],
      } as const,
      conforms: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#conforms"),
        type: { datatype: $xsd_boolean, kind: "Boolean" } as const,
      } as const,
      results: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#result"),
        get type() {
          return {
            get itemType() {
              return ValidationResult.schema;
            },
            kind: "Set",
          } as const;
        },
      } as const,
      shapesGraphWellFormed: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#shapesGraphWellFormed",
        ),
        type: {
          itemType: { datatype: $xsd_boolean, kind: "Boolean" } as const,
          kind: "Option",
        } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<ValidationReport, "$identifier">
  > = (_validationReport) =>
    $compactRecord({ $identifier: _validationReport.$identifier().toString() });
}

export type ValidationResult = {
  readonly $identifier: () => ValidationResult.Identifier;

  readonly details: readonly (BlankNode | NamedNode | Literal)[];

  readonly focusNode: BlankNode | NamedNode | Literal;

  readonly message: Maybe<string>;

  readonly path: Maybe<$PropertyPath>;

  readonly severity: Severity;

  readonly sourceConstraintComponent: NamedNode;

  readonly sourceShape: Maybe<BlankNode | NamedNode>;

  readonly value: Maybe<BlankNode | NamedNode | Literal>;
};

export namespace ValidationResult {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    ValidationResult.Discriminated
  > = (resource, options) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $rdf_subject,
          schema: ValidationResult.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      $rdfType: !options.ignoreRdfType
        ? $ensureRdfResourceType(
            resource,
            [ValidationResult.schema.properties.$rdfType.fromRdfType],
            {
              graph: options.graph,
            },
          )
        : Right(true as const),
      details: $shaclPropertyFromRdf<
        readonly (BlankNode | NamedNode | Literal)[],
        $CollectionSchema<$TermSchema<BlankNode | NamedNode | Literal>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationResult.schema.properties.details,
        typeFromRdfResourceValues: $setFromRdfResourceValues<
          BlankNode | NamedNode | Literal,
          $TermSchema<BlankNode | NamedNode | Literal>
        >($termFromRdfResourceValues<BlankNode | NamedNode | Literal>),
      }),
      focusNode: $shaclPropertyFromRdf<
        BlankNode | NamedNode | Literal,
        $TermSchema<BlankNode | NamedNode | Literal>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationResult.schema.properties.focusNode,
        typeFromRdfResourceValues: $termFromRdfResourceValues<
          BlankNode | NamedNode | Literal
        >,
      }),
      message: $shaclPropertyFromRdf<
        Maybe<string>,
        $MaybeSchema<$StringSchema<string>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationResult.schema.properties.message,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          string,
          $StringSchema<string>
        >($stringFromRdfResourceValues<string>),
      }),
      path: $shaclPropertyFromRdf<
        Maybe<$PropertyPath>,
        $MaybeSchema<$PropertyPath.Schema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationResult.schema.properties.path,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          $PropertyPath,
          $PropertyPath.Schema
        >($PropertyPath.fromRdfResourceValues),
      }),
      severity: $shaclPropertyFromRdf<Severity, $IriSchema<Severity["value"]>>({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationResult.schema.properties.severity,
        typeFromRdfResourceValues: $iriFromRdfResourceValues<Severity["value"]>,
      }),
      sourceConstraintComponent: $shaclPropertyFromRdf<
        NamedNode,
        $IriSchema<string>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema:
          ValidationResult.schema.properties.sourceConstraintComponent,
        typeFromRdfResourceValues: $iriFromRdfResourceValues<string>,
      }),
      sourceShape: $shaclPropertyFromRdf<
        Maybe<BlankNode | NamedNode>,
        $MaybeSchema<$IdentifierSchema>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationResult.schema.properties.sourceShape,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          BlankNode | NamedNode,
          $IdentifierSchema
        >($identifierFromRdfResourceValues),
      }),
      value: $shaclPropertyFromRdf<
        Maybe<BlankNode | NamedNode | Literal>,
        $MaybeSchema<$TermSchema<BlankNode | NamedNode | Literal>>
      >({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ValidationResult.schema.properties.value,
        typeFromRdfResourceValues: $maybeFromRdfResourceValues<
          BlankNode | NamedNode | Literal,
          $TermSchema<BlankNode | NamedNode | Literal>
        >($termFromRdfResourceValues<BlankNode | NamedNode | Literal>),
      }),
    }).chain((properties) => ValidationResult.create(properties));

  export const $toString: $ToStringFunction<
    Pick<ValidationResult, "$identifier">
  > = (_validationResult) =>
    `ValidationResult(${JSON.stringify(ValidationResult.toStringRecord(_validationResult))})`;

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: ValidationResult.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, ValidationResult.Discriminated> = (parameters) =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      $type: Right("ValidationResult" as const),
      details: $convertToScalarSet($identityConversionFunction)(
        parameters.details,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateArray($identityValidationFunction)(
          ValidationResult.schema.properties.details.type,
          value,
        ),
      ),
      focusNode: Either.of(parameters.focusNode),
      message: $convertToMaybe($identityConversionFunction)(
        parameters.message,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          ValidationResult.schema.properties.message.type,
          value,
        ),
      ),
      path: $convertToMaybe($identityConversionFunction)(
        parameters.path,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          ValidationResult.schema.properties.path.type,
          value,
        ),
      ),
      severity: $convertToIriLiteral<Severity["value"]>(
        parameters.severity,
        parameters.$defaultNamespace,
      ),
      sourceConstraintComponent: $convertToIri(
        parameters.sourceConstraintComponent,
        parameters.$defaultNamespace,
      ),
      sourceShape: $convertToMaybe($convertToIdentifier)(
        parameters.sourceShape,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          ValidationResult.schema.properties.sourceShape.type,
          value,
        ),
      ),
      value: $convertToMaybe($identityConversionFunction)(
        parameters.value,
        parameters.$defaultNamespace,
      ).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          ValidationResult.schema.properties.value.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: ValidationResult.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => ValidationResult.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly details?:
      | (BlankNode | NamedNode | Literal)
      | readonly (BlankNode | NamedNode | Literal)[];
    readonly focusNode: BlankNode | NamedNode | Literal;
    readonly message?: string | Maybe<string>;
    readonly path?: $PropertyPath | Maybe<$PropertyPath>;
    readonly severity: Severity["value"] | Severity;
    readonly sourceConstraintComponent:
      | (keyof $DefaultNamespaceT & string)
      | NamedNode;
    readonly sourceShape?:
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string)
      | Maybe<BlankNode | NamedNode>;
    readonly value?:
      | (BlankNode | NamedNode | Literal)
      | Maybe<BlankNode | NamedNode | Literal>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: ValidationResult.CreateParameters<$DefaultNamespaceT>,
  ) => ValidationResult.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = ValidationResult & {
    readonly $type: "ValidationResult";
  };

  export const fromRdfResource: $FromRdfResourceFunction<ValidationResult.Discriminated> =
    $wrap_FromRdfResourceFunction(ValidationResult._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    ValidationResult.Discriminated,
    ValidationResult.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) =>
          ValidationResult.fromRdfResource(resource, options),
        ),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isValidationResult: $ObjectTypeGuardFunction<
    ValidationResult.Discriminated
  > = (object): object is ValidationResult.Discriminated =>
    object.$type === "ValidationResult";

  export const schema = {
    kind: "Object",
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" } as const,
      } as const,
      $rdfType: {
        fromRdfType: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ValidationResult",
        ),
        kind: "RdfType",
        toRdfTypes: [
          dataFactory.namedNode("http://www.w3.org/ns/shacl#ValidationResult"),
        ],
      } as const,
      details: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#detail"),
        type: {
          itemType: {
            kind: "Term",
            types: ["BlankNode", "NamedNode", "Literal"],
          } as const,
          kind: "Set",
        } as const,
      } as const,
      focusNode: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#focusNode"),
        type: {
          kind: "Term",
          types: ["BlankNode", "NamedNode", "Literal"],
        } as const,
      } as const,
      message: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#resultMessage"),
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
      path: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#resultPath"),
        get type() {
          return {
            get itemType() {
              return $PropertyPath.schema;
            },
            kind: "Option",
          } as const;
        },
      } as const,
      severity: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#resultSeverity",
        ),
        get type() {
          return Severity.schema;
        },
      } as const,
      sourceConstraintComponent: {
        kind: "Shacl",
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#sourceConstraintComponent",
        ),
        type: { kind: "Iri" } as const,
      } as const,
      sourceShape: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#sourceShape"),
        type: {
          itemType: { kind: "Identifier" } as const,
          kind: "Option",
        } as const,
      } as const,
      value: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#value"),
        type: {
          itemType: {
            kind: "Term",
            types: ["BlankNode", "NamedNode", "Literal"],
          } as const,
          kind: "Option",
        } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toStringRecord: $ToStringRecordFunction<
    Pick<ValidationResult, "$identifier">
  > = (_validationResult) =>
    $compactRecord({ $identifier: _validationResult.$identifier().toString() });
}

export type NodeShape = BaseShape & NodeShapeSpecificProperties;

export namespace NodeShape {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    NodeShape.Discriminated
  > = (resource, options) =>
    BaseShape.fromRdfResource(resource, options).chain((member0) =>
      NodeShapeSpecificProperties.fromRdfResource(resource, options).map(
        (member1) => ({
          ...member0,
          ...member1,
          $type: "NodeShape" as const,
        }),
      ),
    );

  export const $toString: $ToStringFunction<NodeShape> = (value) =>
    JSON.stringify([
      BaseShape.$toString(value),
      NodeShapeSpecificProperties.$toString(value),
    ]);

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: NodeShape.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, NodeShape.Discriminated> = (parameters) =>
    BaseShape.create(parameters)
      .chain((member0) =>
        NodeShapeSpecificProperties.create(parameters).map((member1) => ({
          ...member0,
          ...member1,
          $type: "NodeShape" as const,
        })),
      )
      .map((object) =>
        $monkeyPatchObject(object, { $toString: NodeShape.$toString }),
      );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = BaseShape.CreateParameters<$DefaultNamespaceT> &
    NodeShapeSpecificProperties.CreateParameters<$DefaultNamespaceT>;

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters?: NodeShape.CreateParameters<$DefaultNamespaceT>,
  ) => NodeShape.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = NodeShape & { readonly $type: "NodeShape" };

  export const fromRdfResource: $FromRdfResourceFunction<NodeShape.Discriminated> =
    $wrap_FromRdfResourceFunction(NodeShape._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    NodeShape.Discriminated,
    NodeShape.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => NodeShape.fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isNodeShape: $ObjectTypeGuardFunction<
    NodeShape.Discriminated
  > = (object): object is NodeShape.Discriminated =>
    object.$type === "NodeShape";

  export const schema = {
    kind: "ObjectIntersection",
    members: [BaseShape.schema, NodeShapeSpecificProperties.schema] as const,
  } as const;

  export type Schema = typeof schema;
}

export type PropertyShape = BaseShape & PropertyShapeSpecificProperties;

export namespace PropertyShape {
  export const _fromRdfResource: $_FromRdfResourceFunction<
    PropertyShape.Discriminated
  > = (resource, options) =>
    BaseShape.fromRdfResource(resource, options).chain((member0) =>
      PropertyShapeSpecificProperties.fromRdfResource(resource, options).map(
        (member1) => ({
          ...member0,
          ...member1,
          $type: "PropertyShape" as const,
        }),
      ),
    );

  export const $toString: $ToStringFunction<PropertyShape> = (value) =>
    JSON.stringify([
      BaseShape.$toString(value),
      PropertyShapeSpecificProperties.$toString(value),
    ]);

  export const create: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: PropertyShape.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, PropertyShape.Discriminated> = (parameters) =>
    BaseShape.create(parameters)
      .chain((member0) =>
        PropertyShapeSpecificProperties.create(parameters).map((member1) => ({
          ...member0,
          ...member1,
          $type: "PropertyShape" as const,
        })),
      )
      .map((object) =>
        $monkeyPatchObject(object, { $toString: PropertyShape.$toString }),
      );

  export type CreateParameters<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  > = BaseShape.CreateParameters<$DefaultNamespaceT> &
    PropertyShapeSpecificProperties.CreateParameters<$DefaultNamespaceT>;

  export const createUnsafe: <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(
    parameters: PropertyShape.CreateParameters<$DefaultNamespaceT>,
  ) => PropertyShape.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = PropertyShape & {
    readonly $type: "PropertyShape";
  };

  export const fromRdfResource: $FromRdfResourceFunction<PropertyShape.Discriminated> =
    $wrap_FromRdfResourceFunction(PropertyShape._fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    PropertyShape.Discriminated,
    PropertyShape.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => PropertyShape.fromRdfResource(resource, options)),
    );

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isPropertyShape: $ObjectTypeGuardFunction<
    PropertyShape.Discriminated
  > = (object): object is PropertyShape.Discriminated =>
    object.$type === "PropertyShape";

  export const schema = {
    kind: "ObjectIntersection",
    members: [
      BaseShape.schema,
      PropertyShapeSpecificProperties.schema,
    ] as const,
  } as const;

  export type Schema = typeof schema;
}

export type Shape = NodeShape.Discriminated | PropertyShape.Discriminated;

export namespace Shape {
  export const $toString: $ToStringFunction<Shape> = (value) => {
    if (value["$type"] === "NodeShape") {
      return NodeShape.$toString(value);
    }
    if (value["$type"] === "PropertyShape") {
      return PropertyShape.$toString(value);
    }

    throw new Error("unable to serialize to string");
  };

  export const fromRdfResource: $FromRdfResourceFunction<Shape> = (
    resource,
    options,
  ) =>
    (
      NodeShape.fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, Shape>
    ).altLazy(
      () =>
        PropertyShape.fromRdfResource(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, Shape>,
    );

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    Shape,
    Shape.Schema
  > = (inputValues, options) => {
    const memberInputValues: Resource.Values[] = Array.from({ length: 2 }).map(
      () =>
        Resource.Values.empty({
          focusResource: inputValues.focusResource,
          propertyPath: inputValues.propertyPath,
        }),
    );
    for (const inputValue of inputValues) {
      const inputValueAsValues = inputValue.toValues();
      let memberOutputValuesEither: Either<Error, unknown> | undefined;
      for (let memberI = 0; memberI < 2; memberI++) {
        if (memberI === 0) {
          memberOutputValuesEither = NodeShape.fromRdfResourceValues(
            inputValueAsValues,
            {
              ...options,
              ignoreRdfType: false,
              schema: options.schema.members["NodeShape"].type,
            },
          );
          if (memberOutputValuesEither.isRight()) {
            memberInputValues[memberI] =
              memberInputValues[memberI].concat(inputValue);
            break;
          }
        } else if (memberI === 1) {
          memberOutputValuesEither = PropertyShape.fromRdfResourceValues(
            inputValueAsValues,
            {
              ...options,
              ignoreRdfType: false,
              schema: options.schema.members["PropertyShape"].type,
            },
          );
          if (memberOutputValuesEither.isRight()) {
            memberInputValues[memberI] =
              memberInputValues[memberI].concat(inputValue);
            break;
          }
        }
      }
      if (memberOutputValuesEither!.isLeft()) {
        return memberOutputValuesEither;
      }
    }

    let collectedOutputValues: Resource.Values<Shape> = Resource.Values.empty({
      focusResource: inputValues.focusResource,
      propertyPath: inputValues.propertyPath,
    });
    for (let memberI = 0; memberI < 2; memberI++) {
      if (memberInputValues[memberI].length === 0) {
        continue;
      }
      switch (memberI) {
        case 0:
          collectedOutputValues = collectedOutputValues.concat(
            ...NodeShape.fromRdfResourceValues(memberInputValues[memberI], {
              ...options,
              ignoreRdfType: false,
              schema: options.schema.members["NodeShape"].type,
            }).unsafeCoerce(),
          );
          break;
        case 1:
          collectedOutputValues = collectedOutputValues.concat(
            ...PropertyShape.fromRdfResourceValues(memberInputValues[memberI], {
              ...options,
              ignoreRdfType: false,
              schema: options.schema.members["PropertyShape"].type,
            }).unsafeCoerce(),
          );
          break;
      }
    }
    return Right(collectedOutputValues);
  };

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
  }

  export const isShape: $ObjectTypeGuardFunction<Shape> = (
    object,
  ): object is Shape =>
    NodeShape.isNodeShape(object) || PropertyShape.isPropertyShape(object);

  export const schema = {
    kind: "ObjectDiscriminatedUnion",
    members: {
      NodeShape: { discriminantValues: ["NodeShape"], type: NodeShape.schema },
      PropertyShape: {
        discriminantValues: ["PropertyShape"],
        type: PropertyShape.schema,
      },
    },
  } as const;

  export type Schema = typeof schema;
}

export type $Object =
  | BaseShape.Discriminated
  | NodeShapeSpecificProperties.Discriminated
  | Ontology.Discriminated
  | Operation.Discriminated
  | OperationError.Discriminated
  | OperationErrorHttpBinding.Discriminated
  | OperationHttpBinding.Discriminated
  | PropertyGroup.Discriminated
  | PropertyShapeSpecificProperties.Discriminated
  | Service.Discriminated
  | ValidationReport.Discriminated
  | ValidationResult.Discriminated
  | NodeShape.Discriminated
  | PropertyShape.Discriminated;

export namespace $Object {
  export function $toString(object: $Object) {
    switch (object.$type) {
      case "BaseShape":
        return BaseShape.$toString(object);
      case "NodeShapeSpecificProperties":
        return NodeShapeSpecificProperties.$toString(object);
      case "Ontology":
        return Ontology.$toString(object);
      case "Operation":
        return Operation.$toString(object);
      case "OperationError":
        return OperationError.$toString(object);
      case "OperationErrorHttpBinding":
        return OperationErrorHttpBinding.$toString(object);
      case "OperationHttpBinding":
        return OperationHttpBinding.$toString(object);
      case "PropertyGroup":
        return PropertyGroup.$toString(object);
      case "PropertyShapeSpecificProperties":
        return PropertyShapeSpecificProperties.$toString(object);
      case "Service":
        return Service.$toString(object);
      case "ValidationReport":
        return ValidationReport.$toString(object);
      case "ValidationResult":
        return ValidationResult.$toString(object);
      case "NodeShape":
        return NodeShape.$toString(object);
      case "PropertyShape":
        return PropertyShape.$toString(object);
      default:
        object satisfies never;
        throw new Error("should never reach this point");
    }
  }
}

import { Either, Left, Right, Maybe } from 'purify-ts';
import { BlankNode, NamedNode, Quad_Graph, Variable, Literal } from '@rdfjs/types';
import { NTriplesTerm, NTriplesIdentifier } from '@rdfx/string';
import { Resource, ResourceSet, PropertyPath as RdfxResourcePropertyPath } from '@rdfx/resource';
import dataFactory from '@rdfx/data-factory';
import datasetFactory from '@rdfjs/dataset';
import { z } from 'zod';
import { LiteralFactory } from '@rdfx/literal';

type $_FromRdfResourceFunction<T> = (
  resource: Resource,
  options: {
    context: undefined | unknown;
    graph: Exclude<Quad_Graph, Variable> | undefined;
    ignoreRdfType: boolean;
    
    preferredLanguages: readonly string[] | undefined;
  }
) => Either<Error, T>;

export type $_ToRdfResourceFunction<IdentifierT extends Resource.Identifier, ObjectT extends { $identifier: () => IdentifierT }> = (
  parameters: {
    graph: Exclude<Quad_Graph, Variable> | undefined;
    ignoreRdfType: boolean;
    object: ObjectT
    resource: Resource<IdentifierT>;
    resourceSet: ResourceSet;
  }
) => void;

































interface $CollectionSchema<ItemSchemaT> {
  readonly itemType: ItemSchemaT;
  readonly kind: "List" | "Set";
  readonly minCount?: number;
}

/**
 * Remove undefined values from a record.
 */  
function $compactRecord<KeyT extends string, ValueT extends {}>(record: Record<KeyT, ValueT | undefined>): Record<KeyT, ValueT> {
  return     globalThis.Object.entries(record).reduce((definedProperties, [propertyName, propertyValue]) => {
      if (propertyValue !== undefined) {
        definedProperties[propertyName as KeyT] = propertyValue as ValueT;
      }
      return definedProperties;
    }, {} as Record<KeyT, ValueT>);
}

type $ConversionFunction<SourceT, TargetT> = (source: SourceT) => Either<Error, TargetT>;









function $convertToIdentifierProperty(identifier: (() => BlankNode | NamedNode) | BlankNode | NamedNode | string | undefined): Either<Error, (() => BlankNode | NamedNode)> {
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















function $convertToMaybe<ItemSourceT, ItemTargetT>(convertToItem: $ConversionFunction<ItemSourceT, ItemTargetT>) {
  return (value: ItemSourceT | Maybe<ItemTargetT> | undefined): Either<Error, Maybe<ItemTargetT>> => {
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
  }
}

function $convertToScalarSet<ItemSourceT, ItemTargetT, Readonly extends boolean>(convertToItem: $ConversionFunction<ItemSourceT, ItemTargetT>, _readonly: Readonly) {
  type ItemTargetArrayT = Readonly extends true ? ReadonlyArray<ItemTargetT> : Array<ItemTargetT>;
  return (value: ItemSourceT | readonly ItemSourceT[] | undefined): Either<Error, ItemTargetArrayT> => {
    if (typeof value === "undefined") {
      return Either.of<Error, ItemTargetArrayT>([] as unknown as ItemTargetArrayT);
    }
    if (Array.isArray(value)) {
      return Either.sequence(value.map(convertToItem)) as Either<Error, ItemTargetArrayT>;
    }
    return convertToItem(value as ItemSourceT).map(value => [value]) as Either<Error, ItemTargetArrayT>;
  };
}



























































export type $FromRdfResourceFunction<T> = (
  resource: Resource,
  options?: {
    context?: unknown;
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    
    preferredLanguages?: readonly string[];
  }
) => Either<Error, T>

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
  }
) => Either<Error, Resource.Values<ValueT>>;

























function $identifierFromRdfResourceValues(values: Resource.Values, options: Parameters<$FromRdfResourceValuesFunction<BlankNode | NamedNode, $IdentifierSchema>>[1]): Either<Error, Resource.Values<BlankNode | NamedNode>> {
  return $termLikeFromRdfResourceValues(values, options).chain(values => values.chainMap(value => value.toIdentifier()));
}

interface $IdentifierSchema {
  readonly hasValues?: readonly (BlankNode | NamedNode)[];
  readonly kind: "Identifier";
}





function $identityConversionFunction<T>(value: T): Either<Error, T> {
  return Either.of(value);
}

function $identityValidationFunction<T>(_schema: unknown, value: T): Either<Error, T> {
  return Either.of(value);
}

function $intFromRdfResourceValues<T extends number>(values: Resource.Values, options: Parameters<$FromRdfResourceValuesFunction<T, $NumericSchema<T>>>[1]): Either<Error, Resource.Values<T>> {
  return $termLikeFromRdfResourceValues(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toInt(options.schema.in) : value.toInt() as Either<Error, T>));
}























const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });















function $maybeFromRdfResourceValues<ItemT, ItemSchemaT>(itemFromRdfResourceValues: $FromRdfResourceValuesFunction<ItemT, ItemSchemaT>): $FromRdfResourceValuesFunction<Maybe<ItemT>, $MaybeSchema<ItemSchemaT>> {
  return (values, options) =>
    itemFromRdfResourceValues(values, { ...options, schema: options.schema.itemType })      .map(values => values.length > 0
        ? values.map(value => Maybe.of(value))
        : Resource.Values.fromValue<Maybe<ItemT>>({ focusResource: options.focusResource, propertyPath: options.propertyPath, value: Maybe.empty() })
      );
}

interface $MaybeSchema<ItemSchemaT>{
  readonly itemType: ItemSchemaT;
  readonly kind: "Option";
}





function $monkeyPatchObject<T extends object>(obj: T, methods: { toJson?: (obj: T) => object, $toString?: (obj: T) => string }): T {
  if (methods.toJson && (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toJSON") || typeof (obj as any).toJSON === "function")) {
    const toJsonMethod = methods.toJson;
    (obj as any).toJSON = function(this: T, _key: string) { return toJsonMethod(this); }
  }

  if (methods.$toString && (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toString") || typeof (obj as any).toJSON === "function")) {
    const toStringMethod = methods.$toString;
    (obj as any).toString = function(this: T) { return toStringMethod(this); }
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
export const fromRdfResource: $FromRdfResourceFunction<$PropertyPath> = RdfxResourcePropertyPath.fromResource;

export const fromRdfResourceValues: $FromRdfResourceValuesFunction<$PropertyPath, object> = (values, options) =>
  values.chainMap((value) =>
    value
      .toResource()
      .chain((resource) => fromRdfResource(resource, options)),
  );

export const schema: Readonly<object> = {}

export const toRdfResource: $ToRdfResourceFunction<$PropertyPath> = RdfxResourcePropertyPath.toResource;

export const $toString = RdfxResourcePropertyPath.toString;
}

namespace $RdfVocabularies {
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
    export const byte = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#byte");
    export const date = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#date");
    export const dateTime = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime");
    export const decimal = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#decimal");
    export const double = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#double");
    export const float = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#float");
    export const int = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#int");
    export const integer = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer");
    export const long = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#long");
    export const negativeInteger = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#negativeInteger");
    export const nonNegativeInteger = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#nonNegativeInteger");
    export const nonPositiveInteger = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#nonPositiveInteger");
    export const positiveInteger = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#positiveInteger");
    export const short = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#short");
    export const string = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#string");
    export const unsignedByte = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#unsignedByte");
    export const unsignedInt = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#unsignedInt");
    export const unsignedLong = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#unsignedLong");
    export const unsignedShort = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#unsignedShort");
  }
}

function $sequenceRecord<T extends Record<string, unknown>>(
  record: { [K in keyof T]: Either<Error, T[K]> }
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

function $setFromRdfResourceValues<ItemT, ItemSchemaT>(itemFromRdfResourceValues: $FromRdfResourceValuesFunction<ItemT, ItemSchemaT>): $FromRdfResourceValuesFunction<ItemT[], $CollectionSchema<ItemSchemaT>> {
  return (values, options) =>
    itemFromRdfResourceValues(values, { ...options, schema: options.schema.itemType })    .map(values => values.toArray().concat())    .map(valuesArray => Resource.Values.fromValue({ focusResource: options.focusResource, propertyPath: options.propertyPath, value: valuesArray }));
}





function $shaclPropertyFromRdf<TypeT, TypeSchemaT>(
  { focusResource, graph, propertySchema, typeFromRdfResourceValues, ...otherParameters }:
    {
      propertySchema: $ShaclPropertySchema<TypeSchemaT>;
      typeFromRdfResourceValues: $FromRdfResourceValuesFunction<TypeT, TypeSchemaT>;
    } & Omit<Parameters<$FromRdfResourceValuesFunction<TypeT, TypeSchemaT>>[1], "propertyPath" | "schema">
): Either<Error, TypeT> {
  return       typeFromRdfResourceValues(
        focusResource.values(propertySchema.path, { graph, unique: true }),
        { ...otherParameters, focusResource, graph, propertyPath: propertySchema.path, schema: propertySchema.type }
      )
      .chain(values => values.head());
}

export interface $ShaclPropertySchema<TypeSchemaT> {
  readonly kind: "Shacl";
  readonly path: $PropertyPath;
  readonly type: TypeSchemaT;
}























function $stringFromRdfResourceValues<T extends string>(values: Resource.Values, options: Parameters<$FromRdfResourceValuesFunction<T, $StringSchema<T>>>[1]): Either<Error, Resource.Values<T>> {
  return $termLikeFromRdfResourceValues(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toString(options.schema.in) : value.toString() as Either<Error, T>));
}

interface $StringSchema<T extends string> {
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly T[];
  readonly languageIn?: readonly string[];
  readonly kind: "String";
}









const $termLikeFromRdfResourceValues:
  $FromRdfResourceValuesFunction<Resource.Value, {
    readonly hasValues?: readonly (Literal | NamedNode)[];
    readonly languageIn?: readonly string[];
  }> = (values, { preferredLanguages, schema: { hasValues, languageIn } }) => {
    let chain = Either.of<Error, Resource.Values>(values);

    if (hasValues && hasValues.length > 0) {
      chain = chain.chain(values => Either.sequence(hasValues.map(hasValue => values.find(value => value.term.equals(hasValue)))).map(() => values));
    }

    if (languageIn && languageIn.length > 0) {
      chain = chain.chain(values => values.chainMap(value => value.toLiteral().chain(literal =>
        languageIn.includes(literal.language) ?
          Right(value) :
          Left(new Resource.MistypedTermValueError({ "actualValue" : literal , "expectedValueType" : "Literal" , "focusResource" : value.focusResource , "propertyPath" : value.propertyPath }))
      )));
    }

    if (preferredLanguages && preferredLanguages.length > 0) {
      chain = chain.chain(values => {
        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        const filteredValues: Resource.Value[] = [];
        for (const preferredLanguage of preferredLanguages) {
          for (const value of values) {
            value.toLiteral().ifRight(literal => {
              if (literal.language === preferredLanguage) {
                filteredValues.push(value);
              }
            });
          }
        }

        return Right(Resource.Values.fromArray({ focusResource: values.focusResource, propertyPath: values.propertyPath, values: filteredValues }));
      });
    }

    return chain;
  };









export type $ToRdfResourceFunction<ObjectT, IdentifierT extends Resource.Identifier = Resource.Identifier> = (
  object: ObjectT,
  options?: {
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    resourceSet?: ResourceSet;
  }
) => Resource<IdentifierT>;

export type $ToRdfResourceValuesFunction<ValueT, ReturnT extends BlankNode | Literal | NamedNode = BlankNode | Literal | NamedNode> =
  (value: ValueT,
   options: {
     graph?: Exclude<Quad_Graph, Variable>;
     ignoreRdfType?: boolean;
     propertyPath: $PropertyPath;
     resource: Resource;
     resourceSet: ResourceSet;
   }
  ) => ReturnT[];



function $validateArray<ItemSchemaT, ItemValueT, Readonly extends boolean>(validateItem: $ValidationFunction<ItemSchemaT, ItemValueT>, _readonly: Readonly) {
  type EitherR = Readonly extends true ? ReadonlyArray<ItemValueT> : Array<ItemValueT>;
  return (schema: $CollectionSchema<ItemSchemaT>, valueArray: readonly ItemValueT[]): Either<Error, EitherR> => {
    if (schema.minCount !== undefined && valueArray.length < schema.minCount) {
      return Left(new Error(`value array has length (${valueArray.length}) less than minCount (${schema.minCount})`)) as Either<Error, EitherR>;
    }

    return Either.sequence(valueArray.map(value => validateItem(schema.itemType, value))) as Either<Error, EitherR>;
  }
}

function $validateMaybe<ItemSchemaT, ItemValueT>(validateItem: $ValidationFunction<ItemSchemaT, ItemValueT>) {
  return (schema: $MaybeSchema<ItemSchemaT>, valueMaybe: Maybe<ItemValueT>): Either<Error, Maybe<ItemValueT>> =>
    valueMaybe.map(value => validateItem(schema.itemType, value).map(() => valueMaybe)).orDefault(Either.of(valueMaybe));
}

type $ValidationFunction<SchemaT, ValueT> = (schema: SchemaT, value: ValueT) => Either<Error, ValueT>;





function $wrap_FromRdfResourceFunction<T>(_fromRdfResourceFunction: $_FromRdfResourceFunction<T>): $FromRdfResourceFunction<T> {
  return (resource, options) => {
    const { context, graph, ignoreRdfType = false, preferredLanguages } = (options ?? {});
    return _fromRdfResourceFunction(resource, { context, graph, ignoreRdfType, preferredLanguages });
  };
}

function $wrap_ToRdfResourceFunction<IdentifierT extends Resource.Identifier, ObjectT extends { $identifier: () => IdentifierT }>(_toRdfResourceFunction: $_ToRdfResourceFunction<IdentifierT, ObjectT>): $ToRdfResourceFunction<ObjectT, IdentifierT> {
  return (object, options) => {
    let { graph, ignoreRdfType = false, resourceSet } = (options ?? {});
    if (!resourceSet) {
      resourceSet = new ResourceSet({ dataFactory: dataFactory, dataset: datasetFactory.dataset() });
    }
    const resource = resourceSet.resource(object.$identifier());
    _toRdfResourceFunction({ graph, ignoreRdfType, object, resource, resourceSet });
    return resource;
  };
}export interface FormStruct {
  readonly $identifier: () => FormStruct.Identifier;

readonly $type: "FormStruct";

/**
 * Empty string set
 **/
readonly emptyStringSetProperty: readonly (string)[];

/**
 * Nested object
 **/
readonly nestedStructProperty: NestedStruct;

/**
 * Non-empty string set
 **/
readonly nonEmptyStringSetProperty: readonly (string)[];

/**
 * Optional string
 **/
readonly optionalStringProperty: Maybe<string>;

/**
 * Required int
 **/
readonly requiredIntProperty: number;

/**
 * Required string
 **/
readonly requiredStringProperty: string;
}

export namespace FormStruct {
export function create(parameters: { readonly $identifier?: (() => FormStruct.Identifier)|BlankNode|NamedNode|string;readonly emptyStringSetProperty?: string|readonly (string)[];readonly nestedStructProperty: NestedStruct;readonly nonEmptyStringSetProperty: string|readonly (string)[];readonly optionalStringProperty?: string|Maybe<string>;readonly requiredIntProperty: number;readonly requiredStringProperty: string; }): Either<Error, FormStruct> {
  return $sequenceRecord({ $identifier: $convertToIdentifierProperty(parameters.$identifier),emptyStringSetProperty: $convertToScalarSet($identityConversionFunction, true)(parameters.emptyStringSetProperty).chain(value => $validateArray($identityValidationFunction, true)(FormStruct.schema.properties.emptyStringSetProperty.type, value)),nestedStructProperty: Either.of(parameters.nestedStructProperty),nonEmptyStringSetProperty: $convertToScalarSet($identityConversionFunction, true)(parameters.nonEmptyStringSetProperty).chain(value => $validateArray($identityValidationFunction, true)(FormStruct.schema.properties.nonEmptyStringSetProperty.type, value)),optionalStringProperty: $convertToMaybe($identityConversionFunction)(parameters.optionalStringProperty).chain(value => $validateMaybe($identityValidationFunction)(FormStruct.schema.properties.optionalStringProperty.type, value)),requiredIntProperty: Either.of(parameters.requiredIntProperty),requiredStringProperty: Either.of(parameters.requiredStringProperty) }).map(properties => ({ ...properties, $type: "FormStruct" as const })).map(object => $monkeyPatchObject(object, { toJson, $toString }));
}
  
export function createUnsafe(parameters: { readonly $identifier?: (() => FormStruct.Identifier)|BlankNode|NamedNode|string;readonly emptyStringSetProperty?: string|readonly (string)[];readonly nestedStructProperty: NestedStruct;readonly nonEmptyStringSetProperty: string|readonly (string)[];readonly optionalStringProperty?: string|Maybe<string>;readonly requiredIntProperty: number;readonly requiredStringProperty: string; }): FormStruct {
  return create(parameters).unsafeCoerce();
}

export type Identifier = (BlankNode | NamedNode);

export namespace Identifier {
  export const parse = $parseIdentifier;;
  export const stringify = NTriplesTerm.stringify;
}

export type Json = { readonly "@id": string;readonly "@type": "FormStruct";readonly emptyStringSetProperty?: readonly (string)[];readonly nestedStructProperty: NestedStruct.Json;readonly nonEmptyStringSetProperty: readonly (string)[];readonly optionalStringProperty?: string;readonly requiredIntProperty: number;readonly requiredStringProperty: string }

export namespace Json { export function parse(json: unknown): Either<Error, Json> {
  const jsonSafeParseResult = schema().safeParse(json);
  if (!jsonSafeParseResult.success) { return Left(jsonSafeParseResult.error); }
  return Right(jsonSafeParseResult.data);
}

export function schema() {
  return z.object({"@id": z.string().min(1),"@type": z.literal("FormStruct"),"emptyStringSetProperty": z.string().array().optional().readonly().meta({ "title" : "Empty string set" }),"nestedStructProperty": ;
    $;
    this.name.unsafeCoerce();
    .Json.schema().meta({ "title" : "Nested object" }),"nonEmptyStringSetProperty": z.string().array().nonempty().min(1).readonly().meta({ "title" : "Non-empty string set" }),"optionalStringProperty": z.string().optional().meta({ "title" : "Optional string" }),"requiredIntProperty": z.number().meta({ "title" : "Required int" }),"requiredStringProperty": z.string().meta({ "title" : "Required string" })}).meta({ }) satisfies z.ZodType<Json>;
}

export function uiSchema(parameters?: { scopePrefix?: string }): any {
  const scopePrefix = parameters?.scopePrefix ?? "#";
  return { "elements": [ { label: "Identifier", scope: `${scopePrefix}/properties/@id`, type: "Control" },{ rule: { condition: { schema: { const: "FormStruct" as const }, scope: `${scopePrefix}/properties/@type` }, effect: "HIDE" }, scope: `${scopePrefix}/properties/@type`, type: "Control" },{ label: "Empty string set", scope: `${scopePrefix}/properties/emptyStringSetProperty`, type: "Control" },NestedStruct.Json.uiSchema({ scopePrefix: `${scopePrefix}/properties/nestedStructProperty` }),{ label: "Non-empty string set", scope: `${scopePrefix}/properties/nonEmptyStringSetProperty`, type: "Control" },{ label: "Optional string", scope: `${scopePrefix}/properties/optionalStringProperty`, type: "Control" },{ label: "Required int", scope: `${scopePrefix}/properties/requiredIntProperty`, type: "Control" },{ label: "Required string", scope: `${scopePrefix}/properties/requiredStringProperty`, type: "Control" } ], label: "FormStruct", type: "Group" };
} }

export function fromJson($json: FormStruct.Json): Either<Error, FormStruct> {
  return $sequenceRecord({ $identifier: Either.of<Error, (BlankNode | NamedNode)>(($json["@id"].startsWith("_:") ? dataFactory.blankNode($json["@id"].substring(2)) : dataFactory.namedNode($json["@id"]))),emptyStringSetProperty: Either.sequence<Error, string>(($json["emptyStringSetProperty"] ?? []).map(item => (Either.of<Error, string>(item)))),nestedStructProperty: NestedStruct.fromJson($json["nestedStructProperty"]),nonEmptyStringSetProperty: Either.sequence<Error, string>($json["nonEmptyStringSetProperty"].map(item => (Either.of<Error, string>(item)))),optionalStringProperty: Maybe.fromNullable($json["optionalStringProperty"]).map(item => (Either.of<Error, string>(item)).map(Maybe.of)).orDefault(Either.of(Maybe.empty())),requiredIntProperty: Either.of<Error, number>($json["requiredIntProperty"]),requiredStringProperty: Either.of<Error, string>($json["requiredStringProperty"]) }).chain(create);
}

export const _fromRdfResource: $_FromRdfResourceFunction<FormStruct> = ($resource, _$options) => {
  return ($sequenceRecord({ $identifier: $identifierFromRdfResourceValues(
        Right(new Resource.Value({ "dataFactory" : dataFactory , "focusResource" : $resource , "propertyPath" : $RdfVocabularies.rdf.subject , "term" : $resource.identifier }).toValues()),
        { "context" : _$options.context , "focusResource" : $resource , "graph" : _$options.graph , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages }).chain(values => values.head()), emptyStringSetProperty: $shaclPropertyFromRdf($setFromRdfResourceValues<string, $StringSchema<string>>($stringFromRdfResourceValues<string>))({ "context" : _$options.context , "graph" : _$options.graph , "focusResource" : $resource , "ignoreRdfType" : true , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages , "propertySchema" : schema.properties.emptyStringSetProperty }), nestedStructProperty: $shaclPropertyFromRdf(NestedStruct.fromRdfResourceValues)({ "context" : _$options.context , "graph" : _$options.graph , "focusResource" : $resource , "ignoreRdfType" : true , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages , "propertySchema" : schema.properties.nestedStructProperty }), nonEmptyStringSetProperty: $shaclPropertyFromRdf($setFromRdfResourceValues<string, $StringSchema<string>>($stringFromRdfResourceValues<string>))({ "context" : _$options.context , "graph" : _$options.graph , "focusResource" : $resource , "ignoreRdfType" : true , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages , "propertySchema" : schema.properties.nonEmptyStringSetProperty }), optionalStringProperty: $shaclPropertyFromRdf($maybeFromRdfResourceValues<string, $StringSchema<string>>($stringFromRdfResourceValues<string>))({ "context" : _$options.context , "graph" : _$options.graph , "focusResource" : $resource , "ignoreRdfType" : true , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages , "propertySchema" : schema.properties.optionalStringProperty }), requiredIntProperty: $shaclPropertyFromRdf($intFromRdfResourceValues<number>)({ "context" : _$options.context , "graph" : _$options.graph , "focusResource" : $resource , "ignoreRdfType" : true , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages , "propertySchema" : schema.properties.requiredIntProperty }), requiredStringProperty: $shaclPropertyFromRdf($stringFromRdfResourceValues<string>)({ "context" : _$options.context , "graph" : _$options.graph , "focusResource" : $resource , "ignoreRdfType" : true , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages , "propertySchema" : schema.properties.requiredStringProperty }) })).chain(properties => (create(properties)));
}

export const fromRdfResource = $wrap_FromRdfResourceFunction(_fromRdfResource);

export const fromRdfResourceValues: $FromRdfResourceValuesFunction<FormStruct, typeof FormStruct.schema> = (values, options) => 
  values.chainMap(value => value.toResource().chain(resource => FormStruct.fromRdfResource(resource, options)));

export function isFormStruct(object: $Object): object is FormStruct {
  return object.$type === "FormStruct";
}

export const schema = { properties: { $identifier: { kind: "Identifier", type: { kind: "Identifier" as const } }, emptyStringSetProperty: { kind: "Shacl", path: dataFactory.namedNode("http://example.com/emptyStringSetProperty"), type: { kind: "Set" as const, itemType: { kind: "String" as const } } }, nestedStructProperty: { kind: "Shacl", path: dataFactory.namedNode("http://example.com/nestedStructProperty"), get type() { return NestedStruct.schema; } }, nonEmptyStringSetProperty: { kind: "Shacl", path: dataFactory.namedNode("http://example.com/nonEmptyStringSetProperty"), type: { kind: "Set" as const, itemType: { kind: "String" as const }, minCount: 1 } }, optionalStringProperty: { kind: "Shacl", path: dataFactory.namedNode("http://example.com/optionalStringProperty"), type: { kind: "Option" as const, itemType: { kind: "String" as const } } }, requiredIntProperty: { kind: "Shacl", path: dataFactory.namedNode("http://example.com/requiredIntProperty"), type: { kind: "Int" as const } }, requiredStringProperty: { kind: "Shacl", path: dataFactory.namedNode("http://example.com/requiredStringProperty"), type: { kind: "String" as const } } } } as const;

export function toJson(_formStruct: FormStruct): FormStruct.Json {
  return JSON.parse(JSON.stringify({ "@id": _formStruct.$identifier().termType === "BlankNode" ? `_:${_formStruct.$identifier().value}` : _formStruct.$identifier().value,"@type": _formStruct.$type,emptyStringSetProperty: _formStruct.emptyStringSetProperty.map(item => (item)),nestedStructProperty: NestedStruct.toJson(_formStruct.nestedStructProperty),nonEmptyStringSetProperty: _formStruct.nonEmptyStringSetProperty.map(item => (item)),optionalStringProperty: _formStruct.optionalStringProperty.map(item => (item)).extract(),requiredIntProperty: _formStruct.requiredIntProperty,requiredStringProperty: _formStruct.requiredStringProperty } satisfies FormStruct.Json));
}

export const _toRdfResource: $_ToRdfResourceFunction<FormStruct.Identifier, FormStruct> = (parameters) => {
parameters.resource.add(FormStruct.schema.properties.emptyStringSetProperty.path, parameters.object.emptyStringSetProperty.flatMap((item) => [$literalFactory.string(item)]), parameters.graph);parameters.resource.add(FormStruct.schema.properties.nestedStructProperty.path, [NestedStruct.toRdfResource(parameters.object.nestedStructProperty, { graph: parameters.graph, resourceSet: parameters.resourceSet }).identifier], parameters.graph);parameters.resource.add(FormStruct.schema.properties.nonEmptyStringSetProperty.path, parameters.object.nonEmptyStringSetProperty.flatMap((item) => [$literalFactory.string(item)]), parameters.graph);parameters.resource.add(FormStruct.schema.properties.optionalStringProperty.path, parameters.object.optionalStringProperty.toList().flatMap((value) => [$literalFactory.string(value)]), parameters.graph);parameters.resource.add(FormStruct.schema.properties.requiredIntProperty.path, [$literalFactory.number(parameters.object.requiredIntProperty, $RdfVocabularies.xsd.int)], parameters.graph);parameters.resource.add(FormStruct.schema.properties.requiredStringProperty.path, [$literalFactory.string(parameters.object.requiredStringProperty)], parameters.graph);return parameters.resource;
}

export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

export function _propertiesToStrings(_formStruct: FormStruct): Record<string, string> {
  return $compactRecord({"$identifier": _formStruct.$identifier().toString()});
}

export function $toString(_formStruct: FormStruct): string {
  return `FormStruct(${JSON.stringify(_propertiesToStrings(_formStruct))})`;
}
}export interface NestedStruct {
  readonly $identifier: () => NestedStruct.Identifier;

readonly $type: "NestedStruct";

/**
 * Required string
 **/
readonly requiredStringProperty: string;
}

export namespace NestedStruct {
export function create(parameters: { readonly $identifier?: (() => NestedStruct.Identifier)|BlankNode|NamedNode|string;readonly requiredStringProperty: string; }): Either<Error, NestedStruct> {
  return $sequenceRecord({ $identifier: $convertToIdentifierProperty(parameters.$identifier),requiredStringProperty: Either.of(parameters.requiredStringProperty) }).map(properties => ({ ...properties, $type: "NestedStruct" as const })).map(object => $monkeyPatchObject(object, { toJson, $toString }));
}
  
export function createUnsafe(parameters: { readonly $identifier?: (() => NestedStruct.Identifier)|BlankNode|NamedNode|string;readonly requiredStringProperty: string; }): NestedStruct {
  return create(parameters).unsafeCoerce();
}

export type Identifier = (BlankNode | NamedNode);

export namespace Identifier {
  export const parse = $parseIdentifier;;
  export const stringify = NTriplesTerm.stringify;
}

export type Json = { readonly "@id": string;readonly "@type": "NestedStruct";readonly requiredStringProperty: string }

export namespace Json { export function parse(json: unknown): Either<Error, Json> {
  const jsonSafeParseResult = schema().safeParse(json);
  if (!jsonSafeParseResult.success) { return Left(jsonSafeParseResult.error); }
  return Right(jsonSafeParseResult.data);
}

export function schema() {
  return z.object({"@id": z.string().min(1),"@type": z.literal("NestedStruct"),"requiredStringProperty": z.string().meta({ "title" : "Required string" })}).meta({ }) satisfies z.ZodType<Json>;
}

export function uiSchema(parameters?: { scopePrefix?: string }): any {
  const scopePrefix = parameters?.scopePrefix ?? "#";
  return { "elements": [ { label: "Identifier", scope: `${scopePrefix}/properties/@id`, type: "Control" },{ rule: { condition: { schema: { const: "NestedStruct" as const }, scope: `${scopePrefix}/properties/@type` }, effect: "HIDE" }, scope: `${scopePrefix}/properties/@type`, type: "Control" },{ label: "Required string", scope: `${scopePrefix}/properties/requiredStringProperty`, type: "Control" } ], label: "NestedStruct", type: "Group" };
} }

export function fromJson($json: NestedStruct.Json): Either<Error, NestedStruct> {
  return $sequenceRecord({ $identifier: Either.of<Error, (BlankNode | NamedNode)>(($json["@id"].startsWith("_:") ? dataFactory.blankNode($json["@id"].substring(2)) : dataFactory.namedNode($json["@id"]))),requiredStringProperty: Either.of<Error, string>($json["requiredStringProperty"]) }).chain(create);
}

export const _fromRdfResource: $_FromRdfResourceFunction<NestedStruct> = ($resource, _$options) => {
  return ($sequenceRecord({ $identifier: $identifierFromRdfResourceValues(
        Right(new Resource.Value({ "dataFactory" : dataFactory , "focusResource" : $resource , "propertyPath" : $RdfVocabularies.rdf.subject , "term" : $resource.identifier }).toValues()),
        { "context" : _$options.context , "focusResource" : $resource , "graph" : _$options.graph , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages }).chain(values => values.head()), requiredStringProperty: $shaclPropertyFromRdf($stringFromRdfResourceValues<string>)({ "context" : _$options.context , "graph" : _$options.graph , "focusResource" : $resource , "ignoreRdfType" : true , "objectSet" : _$options.objectSet , "preferredLanguages" : _$options.preferredLanguages , "propertySchema" : schema.properties.requiredStringProperty }) })).chain(properties => (create(properties)));
}

export const fromRdfResource = $wrap_FromRdfResourceFunction(_fromRdfResource);

export const fromRdfResourceValues: $FromRdfResourceValuesFunction<NestedStruct, typeof NestedStruct.schema> = (values, options) => 
  values.chainMap(value => value.toResource().chain(resource => NestedStruct.fromRdfResource(resource, options)));

export function isNestedStruct(object: $Object): object is NestedStruct {
  return object.$type === "NestedStruct";
}

export const schema = { properties: { $identifier: { kind: "Identifier", type: { kind: "Identifier" as const } }, requiredStringProperty: { kind: "Shacl", path: dataFactory.namedNode("http://example.com/requiredStringProperty"), type: { kind: "String" as const } } } } as const;

export function toJson(_nestedStruct: NestedStruct): NestedStruct.Json {
  return JSON.parse(JSON.stringify({ "@id": _nestedStruct.$identifier().termType === "BlankNode" ? `_:${_nestedStruct.$identifier().value}` : _nestedStruct.$identifier().value,"@type": _nestedStruct.$type,requiredStringProperty: _nestedStruct.requiredStringProperty } satisfies NestedStruct.Json));
}

export const _toRdfResource: $_ToRdfResourceFunction<NestedStruct.Identifier, NestedStruct> = (parameters) => {
parameters.resource.add(NestedStruct.schema.properties.requiredStringProperty.path, [$literalFactory.string(parameters.object.requiredStringProperty)], parameters.graph);return parameters.resource;
}

export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

export function _propertiesToStrings(_nestedStruct: NestedStruct): Record<string, string> {
  return $compactRecord({"$identifier": _nestedStruct.$identifier().toString()});
}

export function $toString(_nestedStruct: NestedStruct): string {
  return `NestedStruct(${JSON.stringify(_propertiesToStrings(_nestedStruct))})`;
}
}export type $Object = (FormStruct|NestedStruct);

export namespace $Object {
export const $toString = ((value: $Object): string => {
if (FormStruct.isFormStruct(value)) { return FormStruct.$toString(value); }if (NestedStruct.isNestedStruct(value)) { return NestedStruct.$toString(value); }

  throw new Error("unable to serialize to string");
});

export const fromJson = ((value: $Object.Json): Either<Error, $Object> => {
if ((value["@type"] === "FormStruct")) { return FormStruct.fromJson((value as FormStruct.Json)).map(value => (value)); }if ((value["@type"] === "NestedStruct")) { return NestedStruct.fromJson((value as NestedStruct.Json)).map(value => (value)); }

  throw new Error("unable to deserialize JSON");
});

export const fromRdfResource: $FromRdfResourceFunction<$Object> = (resource, options) => 
  (FormStruct.fromRdfResource(resource, { ...options, ignoreRdfType: false }) as Either<Error, $Object>).altLazy(() => (NestedStruct.fromRdfResource(resource, { ...options, ignoreRdfType: false }) as Either<Error, $Object>));

export const fromRdfResourceValues: $FromRdfResourceValuesFunction<$Object, typeof $Object.schema> = (((values, options) =>
  values.chainMap(value => {
    const valueAsValues = value.toValues();
    return (FormStruct.fromRdfResourceValues(valueAsValues, { ...options, schema: options.schema.members["FormStruct"].type }) as Either<Error, Resource.Values<$Object>>).altLazy(() => (NestedStruct.fromRdfResourceValues(valueAsValues, { ...options, schema: options.schema.members["NestedStruct"].type }) as Either<Error, Resource.Values<$Object>>)).chain(values => values.head());
  })
) satisfies $FromRdfResourceValuesFunction<$Object, typeof $Object.schema>);

export type Identifier = (BlankNode | NamedNode);
export namespace Identifier {
  export const parse = $parseIdentifier;;
  export const stringify = NTriplesTerm.stringify;
}

export namespace Json {
  export const schema = () => z.discriminatedUnion("$type", [;
    $;
    this.name.unsafeCoerce();
    .Json.schema(),;
    $;
    this.name.unsafeCoerce();
    .Json.schema()]).readonly().meta({ });

  export function parse(json: unknown): Either<Error, Json> {
    const jsonSafeParseResult = schema().safeParse(json);
    if (!jsonSafeParseResult.success) { return Left(jsonSafeParseResult.error); }
    return Right(jsonSafeParseResult.data);
  }
}

export type Json = FormStruct.Json|NestedStruct.Json

export const schema = { kind: "ObjectUnion" as const, members: { "FormStruct": { "discriminantValues" : [ "FormStruct" ] , "type" : FormStruct.schema },"NestedStruct": { "discriminantValues" : [ "NestedStruct" ] , "type" : NestedStruct.schema } }, properties: { requiredStringProperty: { kind: "Shacl", path: dataFactory.namedNode("http://example.com/requiredStringProperty"), type: { kind: "String" as const } } } } as const;

export const toJson = ((value: $Object): $Object.Json => {
if (FormStruct.isFormStruct(value)) { return FormStruct.toJson(value); }if (NestedStruct.isNestedStruct(value)) { return NestedStruct.toJson(value); }

  throw new Error("unable to serialize to JSON");
});

export const toRdfResource: $ToRdfResourceFunction<$Object> = (object, options) => {
if (FormStruct.isFormStruct(object)) { return FormStruct.toRdfResource(object, options); }if (NestedStruct.isNestedStruct(object)) { return NestedStruct.toRdfResource(object, options); }throw new Error("unrecognized type");
};

export const toRdfResourceValues = (((value, _options): (BlankNode | NamedNode)[] => {
if (FormStruct.isFormStruct(value)) { return [FormStruct.toRdfResource(value, { graph: _options.graph, resourceSet: _options.resourceSet }).identifier]; }if (NestedStruct.isNestedStruct(value)) { return [NestedStruct.toRdfResource(value, { graph: _options.graph, resourceSet: _options.resourceSet }).identifier]; }

  throw new Error("unable to serialize to RDF");
}) satisfies $ToRdfResourceValuesFunction<$Object>);
}
import type {
  BlankNode,
  DatasetCore,
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
  Resource,
  ResourceSet,
} from "@rdfx/resource";
import { NTriplesIdentifier, NTriplesTerm } from "@rdfx/string";
import { Either, Left, Right } from "purify-ts";
import { z } from "zod";

type $_FromRdfResourceFunction<T> = (
  resource: Resource,
  options: {
    context: undefined | unknown;
    graph: Exclude<Quad_Graph, Variable> | undefined;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
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

/**
 * Compare two objects with equals(other: T): boolean methods and return an $EqualsResult.
 */
function $booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left.equals(right));
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

export type $EqualsFunction<T> = (left: T, right: T) => $EqualsResult;

export type $EqualsResult = Either<$EqualsResult.Unequal, true>;

export namespace $EqualsResult {
  export const Equal: $EqualsResult = Right(true);

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

    return Left({ left, right, type: "boolean" });
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
        readonly type: "array-element";
      }
    | {
        readonly left: readonly any[];
        readonly right: readonly any[];
        readonly type: "array-length";
      }
    | { readonly left: any; readonly right: any; readonly type: "boolean" }
    | { readonly right: any; readonly type: "left-null" }
    | {
        readonly left: any;
        readonly right: any;
        readonly propertyName: string;
        readonly propertyValuesUnequal: Unequal;
        readonly type: "property";
      }
    | { readonly left: any; readonly type: "right-null" };
}

function $filterIdentifier(
  filter: $IdentifierFilter,
  value: BlankNode | NamedNode,
) {
  if (
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
    return false;
  }

  if (filter.type !== undefined && value.termType !== filter.type) {
    return false;
  }

  return true;
}

function $filterString(filter: $StringFilter, value: string) {
  if (
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue === value)
  ) {
    return false;
  }

  if (filter.maxLength !== undefined && value.length > filter.maxLength) {
    return false;
  }

  if (filter.minLength !== undefined && value.length < filter.minLength) {
    return false;
  }

  return true;
}

export type $FromRdfResourceFunction<T> = (
  resource: Resource,
  options?: {
    context?: unknown;
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    objectSet?: $ObjectSet;
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
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    propertyPath: $PropertyPath;
    schema: ValueSchemaT;
  },
) => Either<Error, Resource.Values<ValueT>>;

type $Hasher = {
  update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
};

function $hashString<HasherT extends $Hasher>(
  hasher: HasherT,
  value: string,
): HasherT {
  hasher.update(value);
  return hasher;
}

interface $IdentifierFilter {
  readonly in?: readonly (BlankNode | NamedNode)[];
  readonly type?: "BlankNode" | "NamedNode";
}

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

class $IdentifierSet {
  private readonly blankNodeValues = new Set<string>();
  private readonly namedNodeValues = new Set<string>();

  add(identifier: BlankNode | NamedNode): this {
    switch (identifier.termType) {
      case "BlankNode":
        this.blankNodeValues.add(identifier.value);
        return this;
      case "NamedNode":
        this.namedNodeValues.add(identifier.value);
        return this;
    }
  }

  has(identifier: BlankNode | NamedNode): boolean {
    switch (identifier.termType) {
      case "BlankNode":
        return this.blankNodeValues.has(identifier.value);
      case "NamedNode":
        return this.namedNodeValues.has(identifier.value);
    }
  }
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

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

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

function $propertyEquals<ObjectT, PropertyValueT>(
  property: Readonly<{
    equalsFunction: $EqualsFunction<PropertyValueT>;
    name: string;
  }>,
  left: readonly [ObjectT, PropertyValueT],
  right: readonly [ObjectT, PropertyValueT],
): $EqualsResult {
  return property
    .equalsFunction(left[1], right[1])
    .mapLeft((propertyValuesUnequal) => ({
      left: left[0],
      right: right[0],
      propertyName: property.name,
      propertyValuesUnequal,
      type: "property" as const,
    }));
}

export type $PropertyPath = RdfxResourcePropertyPath;

export namespace $PropertyPath {
  export function equals(
    left: $PropertyPath,
    right: $PropertyPath,
  ): $EqualsResult {
    return $EqualsResult.fromBooleanEqualsResult(
      left,
      right,
      RdfxResourcePropertyPath.equals(left, right),
    );
  }

  export type Filter = object;

  export function filter(_filter: Filter, _value: $PropertyPath): boolean {
    return true;
  }

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

  export const toRdfResource: $ToRdfResourceFunction<$PropertyPath> =
    RdfxResourcePropertyPath.toResource;

  export const $toString = RdfxResourcePropertyPath.toString;
}

function $rdfResourceIdentifierValues(resource: Resource): Resource.Values {
  return new Resource.Value({
    dataFactory: dataFactory,
    focusResource: resource,
    propertyPath: $RdfVocabularies.rdf.subject,
    term: resource.identifier,
  }).toValues();
}

namespace $RdfVocabularies {
  export const rdf = {
    first: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
    ),
    langString: dataFactory.namedNode(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
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
    dateTimeStamp: dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#dateTimeStamp",
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

/**
 * Compare two values for strict equality (===), returning an $EqualsResult rather than a boolean.
 */
function $strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left === right);
}

interface $StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
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

function $wrap_FromRdfResourceFunction<T>(
  _fromRdfResourceFunction: $_FromRdfResourceFunction<T>,
): $FromRdfResourceFunction<T> {
  return (resource, options) => {
    const {
      context,
      graph,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    return _fromRdfResourceFunction(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet: objectSet ?? new $RdfjsDatasetObjectSet(resource.dataset),
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
export type ExampleError = {
  readonly $identifier: () => ExampleError.Identifier;

  readonly $type: "ExampleError";

  readonly message: string;
};

export namespace ExampleError {
  export const _fromRdfResource: $_FromRdfResourceFunction<ExampleError> = (
    resource,
    options,
  ) =>
    $sequenceRecord({
      $identifier: $identifierFromRdfResourceValues(
        $rdfResourceIdentifierValues(resource),
        {
          ...options,
          focusResource: resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          schema: ExampleError.schema.properties.$identifier.type,
        },
      ).chain((values) => values.head()),
      message: $shaclPropertyFromRdf<string, $StringSchema<string>>({
        ...options,
        focusResource: resource,
        ignoreRdfType: true,
        propertySchema: ExampleError.schema.properties.message,
        typeFromRdfResourceValues: $stringFromRdfResourceValues<string>,
      }),
    }).chain((properties) => ExampleError.create(properties));

  export const _toRdfResource: $_ToRdfResourceFunction<
    ExampleError.Identifier,
    ExampleError
  > = (parameters) => {
    parameters.resource.add(
      ExampleError.schema.properties.message.path,
      [$literalFactory.string(parameters.object.message)],
      parameters.graph,
    );
    return parameters.resource;
  };

  export const $toString: (_exampleError: ExampleError) => string = (
    _exampleError,
  ) => `ExampleError(${JSON.stringify(toStringRecord(_exampleError))})`;

  export const create = <
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(parameters: {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => ExampleError.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly message: string;
  }): Either<Error, ExampleError> =>
    $sequenceRecord({
      $identifier: $convertToIdentifierProperty(
        parameters.$identifier,
        parameters.$defaultNamespace,
      ),
      message: Either.of(parameters.message),
    })
      .map((properties) => ({ ...properties, $type: "ExampleError" as const }))
      .map((object) =>
        $monkeyPatchObject(object, {
          toJson: ExampleError.toJson,
          $toString: ExampleError.$toString,
        }),
      );

  export function createUnsafe<
    $DefaultNamespaceT extends $NamespaceBuilder = $NamespaceBuilder,
  >(parameters: {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly $identifier?:
      | (() => ExampleError.Identifier)
      | BlankNode
      | NamedNode
      | (keyof $DefaultNamespaceT & string);
    readonly message: string;
  }): ExampleError {
    return create(parameters).unsafeCoerce();
  }

  export const equals: (
    left: ExampleError,
    right: ExampleError,
  ) => $EqualsResult = (left, right) =>
    $propertyEquals(
      { equalsFunction: $booleanEquals, name: "$identifier" },
      [left, left.$identifier()],
      [right, right.$identifier()],
    ).chain(() =>
      $propertyEquals(
        { equalsFunction: $strictEquals, name: "message" },
        [left, left.message],
        [right, right.message],
      ),
    );

  export const filter: (
    filter: ExampleError.Filter,
    value: ExampleError,
  ) => boolean = (filter, value) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier())
    ) {
      return false;
    }
    if (
      filter.message !== undefined &&
      !$filterString(filter.message, value.message)
    ) {
      return false;
    }
    return true;
  };

  export type Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly message?: $StringFilter;
  };

  export const fromJson: (
    json: ExampleError.Json,
  ) => Either<Error, ExampleError> = ($json) =>
    $sequenceRecord({
      $identifier: Either.of<Error, BlankNode | NamedNode>(
        $json["@id"].startsWith("_:")
          ? dataFactory.blankNode($json["@id"].substring(2))
          : dataFactory.namedNode($json["@id"]),
      ),
      message: Either.of<Error, string>($json["message"]),
    }).chain(ExampleError.create);

  export const fromRdfResource =
    $wrap_FromRdfResourceFunction(_fromRdfResource);

  export const fromRdfResourceValues: $FromRdfResourceValuesFunction<
    ExampleError,
    ExampleError.Schema
  > = (values, options) =>
    values.chainMap((value) =>
      value
        .toResource()
        .chain((resource) => fromRdfResource(resource, options)),
    );

  export const hash = <HasherT extends $Hasher>(
    hasher: HasherT,
    _exampleError: Omit<ExampleError, "$identifier" | "$type"> & {
      readonly $identifier?: () => ExampleError.Identifier;
      readonly $type?: "ExampleError";
    },
  ): HasherT => {
    if (_exampleError.$identifier) {
      hasher.update(_exampleError.$identifier().value);
    }
    if (_exampleError.$type) {
      hasher.update(_exampleError.$type);
    }
    $hashString(hasher, _exampleError.message);
    return hasher;
  };

  export type Identifier = BlankNode | NamedNode;
  export namespace Identifier {
    export const parse = $parseIdentifier;
    export const stringify = NTriplesTerm.stringify;
  }

  export const isExampleError = (object: $Object): object is ExampleError =>
    object.$type === "ExampleError";

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
        $type: z.literal("ExampleError"),
        message: z.string(),
      }) satisfies z.ZodType<Json>;
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
                schema: { const: "ExampleError" as const },
                scope: `${scopePrefix}/properties/$type`,
              },
              effect: "HIDE",
            },
            scope: `${scopePrefix}/properties/$type`,
            type: "Control",
          },
          { scope: `${scopePrefix}/properties/message`, type: "Control" },
        ],
        type: "Group",
        label: "ExampleError",
      };
    };
  }

  export type Json = {
    readonly "@id": string;
    readonly $type: "ExampleError";
    readonly message: string;
  };

  export const schema = {
    properties: {
      $identifier: {
        kind: "Identifier",
        type: { kind: "Identifier" as const },
      },
      $type: { kind: "Discriminant", value: "ExampleError" },
      message: {
        kind: "Shacl",
        path: dataFactory.namedNode("http://example.com/message"),
        type: { kind: "String" as const },
      },
    },
  } as const;

  export type Schema = typeof schema;

  export const toJson: (_exampleError: ExampleError) => ExampleError.Json = (
    _exampleError,
  ) =>
    JSON.parse(
      JSON.stringify({
        "@id":
          _exampleError.$identifier().termType === "BlankNode"
            ? `_:${_exampleError.$identifier().value}`
            : _exampleError.$identifier().value,
        $type: _exampleError.$type,
        message: _exampleError.message,
      } satisfies ExampleError.Json),
    );

  export const toRdfResource = $wrap_ToRdfResourceFunction(_toRdfResource);

  export const toStringRecord: (
    _exampleError: ExampleError,
  ) => Record<string, string> = (_exampleError) =>
    $compactRecord({ $identifier: _exampleError.$identifier().toString() });
}
export type $Object = ExampleError;

export namespace $Object {
  export const equals = ExampleError.equals;

  export const hash = ExampleError.hash;

  export const toJson = ExampleError.toJson;

  export const toRdfResource = ExampleError.toRdfResource;

  export const $toString = ExampleError.$toString;
}
export interface $ObjectSet {
  exampleError(
    identifier: ExampleError.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, ExampleError>>;

  exampleErrorCount(
    query?: Pick<
      $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  exampleErrorIdentifiers(
    query?: $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
  ): Promise<Either<Error, readonly ExampleError.Identifier[]>>;

  exampleErrors(
    query?: $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
  ): Promise<Either<Error, readonly ExampleError[]>>;
}

export namespace $ObjectSet {
  export interface Query<
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  > {
    readonly filter?: ObjectFilterT;
    readonly graph?: Exclude<Quad_Graph, Variable>;
    readonly identifiers?: readonly ObjectIdentifierT[];
    readonly limit?: number;
    readonly offset?: number;
    readonly preferredLanguages?: readonly string[];
  }
}
export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly #dataset: DatasetCore | (() => DatasetCore);
  readonly #graph?: Exclude<Quad_Graph, Variable>;

  constructor(
    dataset: DatasetCore | (() => DatasetCore),
    options?: { graph?: Exclude<Quad_Graph, Variable> },
  ) {
    this.#dataset = dataset;
    this.#graph = options?.graph;
  }

  protected $dataset(): DatasetCore {
    if (typeof this.#dataset === "object") {
      return this.#dataset;
    }
    return this.#dataset();
  }

  protected $resourceSet(): ResourceSet {
    return new ResourceSet({
      dataFactory: dataFactory,
      dataset: this.$dataset(),
    });
  }

  async exampleError(
    identifier: ExampleError.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, ExampleError>> {
    return this.exampleErrorSync(identifier, options);
  }

  exampleErrorSync(
    identifier: ExampleError.Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, ExampleError> {
    return this.exampleErrorsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async exampleErrorCount(
    query?: Pick<
      $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.exampleErrorCountSync(query);
  }

  exampleErrorCountSync(
    query?: Pick<
      $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.exampleErrorsSync(query).map((objects) => objects.length);
  }

  async exampleErrorIdentifiers(
    query?: $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
  ): Promise<Either<Error, readonly ExampleError.Identifier[]>> {
    return this.exampleErrorIdentifiersSync(query);
  }

  exampleErrorIdentifiersSync(
    query?: $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
  ): Either<Error, readonly ExampleError.Identifier[]> {
    return this.exampleErrorsSync(query).map((objects) =>
      objects.map((object) => object.$identifier()),
    );
  }

  async exampleErrors(
    query?: $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
  ): Promise<Either<Error, readonly ExampleError[]>> {
    return this.exampleErrorsSync(query);
  }

  exampleErrorsSync(
    query?: $ObjectSet.Query<ExampleError.Filter, ExampleError.Identifier>,
  ): Either<Error, readonly ExampleError[]> {
    return this.#objectsSync<
      ExampleError,
      ExampleError.Filter,
      ExampleError.Identifier
    >(
      {
        filter: ExampleError.filter,
        fromRdfResource: ExampleError.fromRdfResource,
        fromRdfTypes: [],
      },
      query,
    );
  }

  #objectsSync<
    ObjectT extends { readonly $identifier: () => ObjectIdentifierT },
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  >(
    namedObjectType: {
      filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      fromRdfResource: $FromRdfResourceFunction<ObjectT>;
      fromRdfTypes: readonly NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const graph = query?.graph ?? this.#graph;

    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Right([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    const fromRdfResourceOptions: Parameters<
      $FromRdfResourceFunction<ObjectT>
    >[1] = {
      graph,
      objectSet: this,
      preferredLanguages: query?.preferredLanguages,
    };

    let resources: { object?: ObjectT; resource: Resource }[];
    const resourceSet = this.$resourceSet(); // Access once, in case it's instantiated lazily
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: resourceSet.resource(identifier),
      }));
      sortResources = false;
    } else if (namedObjectType.fromRdfTypes.length > 0) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const fromRdfType of namedObjectType.fromRdfTypes) {
        for (const resource of resourceSet.instancesOf(fromRdfType, {
          graph,
        })) {
          if (!identifierSet.has(resource.identifier)) {
            identifierSet.add(resource.identifier);
            resources.push({ resource });
          }
        }
      }
    } else {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const quad of resourceSet.dataset) {
        if (graph && !quad.graph.equals(graph)) {
          continue;
        }

        switch (quad.subject.termType) {
          case "BlankNode":
          case "NamedNode":
            break;
          default:
            continue;
        }

        if (identifierSet.has(quad.subject)) {
          continue;
        }
        identifierSet.add(quad.subject);
        const resource = resourceSet.resource(quad.subject);
        // Eagerly eliminate the majority of resources that won't match the object type
        namedObjectType
          .fromRdfResource(resource, fromRdfResourceOptions)
          .ifRight((object) => {
            resources.push({ object, resource });
          });
      }
    }

    if (sortResources) {
      // Sort resources by identifier so limit and offset are deterministic
      resources.sort((left, right) =>
        left.resource.identifier.value.localeCompare(
          right.resource.identifier.value,
        ),
      );
    }

    let objectI = 0;
    const objects: ObjectT[] = [];
    for (let { object, resource } of resources) {
      if (!object) {
        const objectEither = namedObjectType.fromRdfResource(
          resource,
          fromRdfResourceOptions,
        );
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }

      if (query?.filter && !namedObjectType.filter(query.filter, object)) {
        continue;
      }

      if (objectI++ >= offset) {
        objects.push(object);
        if (objects.length === limit) {
          return Right(objects);
        }
      }
    }
    return Right(objects);
  }
}

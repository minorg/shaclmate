import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import type {
  BlankNode,
  DatasetCore,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import { Either, Left, Maybe, Right } from "purify-ts";
import {
  LiteralFactory,
  PropertyPath,
  Resource,
  ResourceSet,
} from "rdfjs-resource";

interface $BooleanFilter {
  readonly value?: boolean;
}

type $CollectionFilter<ItemFilterT> = ItemFilterT & {
  readonly $maxCount?: number;
  readonly $minCount?: number;
};

function $filterArray<ItemT, ItemFilterT>(
  filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean,
) {
  return (
    filter: $CollectionFilter<ItemFilterT>,
    values: readonly ItemT[],
  ): boolean => {
    for (const value of values) {
      if (!filterItem(filter, value)) {
        return false;
      }
    }

    if (filter.$maxCount !== undefined && values.length > filter.$maxCount) {
      return false;
    }

    if (filter.$minCount !== undefined && values.length < filter.$minCount) {
      return false;
    }

    return true;
  };
}

function $filterBoolean(filter: $BooleanFilter, value: boolean) {
  if (filter.value !== undefined && value !== filter.value) {
    return false;
  }

  return true;
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

function $filterIri(filter: $IriFilter, value: NamedNode) {
  if (
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
    return false;
  }

  return true;
}

function $filterLiteral(filter: $LiteralFilter, value: Literal): boolean {
  return $filterTerm(filter, value);
}

function $filterMaybe<ItemT, ItemFilterT>(
  filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean,
) {
  return (filter: $MaybeFilter<ItemFilterT>, value: Maybe<ItemT>): boolean => {
    if (filter !== null) {
      if (value.isNothing()) {
        return false;
      }

      if (!filterItem(filter, value.extract()!)) {
        return false;
      }
    } else {
      if (value.isJust()) {
        return false;
      }
    }

    return true;
  };
}

function $filterNumeric<T extends bigint | number>(
  filter: $NumericFilter<T>,
  value: T,
) {
  if (
    filter.in !== undefined &&
    !filter.in.some((inValue) => inValue === value)
  ) {
    return false;
  }

  if (filter.maxExclusive !== undefined && value >= filter.maxExclusive) {
    return false;
  }

  if (filter.maxInclusive !== undefined && value > filter.maxInclusive) {
    return false;
  }

  if (filter.minExclusive !== undefined && value <= filter.minExclusive) {
    return false;
  }

  if (filter.minInclusive !== undefined && value < filter.minInclusive) {
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

function $filterTerm(
  filter: $TermFilter,
  value: BlankNode | Literal | NamedNode,
): boolean {
  if (
    filter.datatypeIn !== undefined &&
    (value.termType !== "Literal" ||
      !filter.datatypeIn.some((inDatatype) =>
        inDatatype.equals(value.datatype),
      ))
  ) {
    return false;
  }

  if (
    filter.in !== undefined &&
    !filter.in.some((inTerm) => inTerm.equals(value))
  ) {
    return false;
  }

  if (
    filter.languageIn !== undefined &&
    (value.termType !== "Literal" ||
      !filter.languageIn.some((inLanguage) => inLanguage === value.language))
  ) {
    return false;
  }

  if (
    filter.typeIn !== undefined &&
    !filter.typeIn.some((inType) => inType === value.termType)
  ) {
    return false;
  }

  return true;
}

type $FromRdfOptions = {
  context?: unknown;
  graph?: Exclude<Quad_Graph, Variable>;
  ignoreRdfType?: boolean;
  objectSet?: $ObjectSet;
  preferredLanguages?: readonly string[];
};

function $fromRdfPreferredLanguages(
  values: Resource.Values,
  preferredLanguages?: readonly string[],
): Either<Error, Resource.Values> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return Right(values);
  }

  // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
  // Within a preferredLanguage the literals may be in any order.
  const filteredValues: Resource.Value[] = [];
  for (const preferredLanguage of preferredLanguages) {
    for (const value of values) {
      value.toLiteral().ifRight((literal) => {
        if (literal.language === preferredLanguage) {
          filteredValues.push(value);
        }
      });
    }
  }

  return Right(
    Resource.Values.fromArray({
      focusResource: values.focusResource,
      propertyPath: values.propertyPath,
      values: filteredValues,
    }),
  );
}

interface $IdentifierFilter {
  readonly in?: readonly (BlankNode | NamedNode)[];
  readonly type?: "BlankNode" | "NamedNode";
}

function $identifierFromString(
  identifier: string,
): Either<Error, BlankNode | NamedNode> {
  return Either.encase(() =>
    Resource.Identifier.fromString({ dataFactory, identifier }),
  );
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

interface $IriFilter {
  readonly in?: readonly NamedNode[];
}

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

interface $LiteralFilter extends Omit<$TermFilter, "in" | "type"> {
  readonly in?: readonly Literal[];
}

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

interface $NumericFilter<T> {
  readonly in?: readonly T[];
  readonly maxExclusive?: T;
  readonly maxInclusive?: T;
  readonly minExclusive?: T;
  readonly minInclusive?: T;
}

type $PropertiesFromRdfParameters = {
  context?: unknown;
  graph?: Exclude<Quad_Graph, Variable>;
  ignoreRdfType: boolean;
  objectSet: $ObjectSet;
  preferredLanguages?: readonly string[];
  resource: Resource;
};

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

function $shaclPropertyFromRdf<T>({
  graph,
  propertySchema,
  resource,
  typeFromRdf,
}: {
  graph?: Exclude<Quad_Graph, Variable>;
  propertySchema: $ShaclPropertySchema;
  resource: Resource;
  typeFromRdf: (
    resourceValues: Either<Error, Resource.Values>,
  ) => Either<Error, Resource.Values<T>>;
}): Either<Error, T> {
  return typeFromRdf(
    Right(resource.values(propertySchema.path, { graph, unique: true })),
  ).chain((values) => values.head());
}

export interface $ShaclPropertySchema<TypeSchemaT = object> {
  readonly kind: "Shacl";
  readonly path: PropertyPath;
  readonly type: () => TypeSchemaT;
}

interface $StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}

interface $TermFilter {
  readonly datatypeIn?: readonly NamedNode[];
  readonly in?: readonly (Literal | NamedNode)[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
}

type $UnwrapR<T> = T extends Either<any, infer R> ? R : never;
export interface BaseShaclCoreShape {
  readonly $identifier: BaseShaclCoreShapeStatic.$Identifier;
  readonly $type:
    | "ShaclCoreNodeShape"
    | "ShaclCorePropertyShape"
    | "ShaclmateNodeShape"
    | "ShaclmatePropertyShape";
  readonly and: readonly (readonly (BlankNode | NamedNode)[])[];
  readonly classes: readonly NamedNode[];
  readonly comments: readonly string[];
  readonly datatype: Maybe<NamedNode>;
  readonly deactivated: Maybe<boolean>;
  readonly flags: readonly string[];
  readonly hasValues: readonly (NamedNode | Literal)[];
  readonly in_: Maybe<readonly (NamedNode | Literal)[]>;
  readonly isDefinedBy: Maybe<BlankNode | NamedNode>;
  readonly labels: readonly string[];
  readonly languageIn: Maybe<readonly string[]>;
  readonly maxCount: Maybe<number>;
  readonly maxExclusive: Maybe<Literal>;
  readonly maxInclusive: Maybe<Literal>;
  readonly maxLength: Maybe<number>;
  readonly minCount: Maybe<number>;
  readonly minExclusive: Maybe<Literal>;
  readonly minInclusive: Maybe<Literal>;
  readonly minLength: Maybe<number>;
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
  readonly nodes: readonly (BlankNode | NamedNode)[];
  readonly not: readonly (BlankNode | NamedNode)[];
  readonly or: readonly (readonly (BlankNode | NamedNode)[])[];
  readonly patterns: readonly string[];
  readonly xone: readonly (readonly (BlankNode | NamedNode)[])[];
}

export namespace BaseShaclCoreShapeStatic {
  export function $filter(
    filter: BaseShaclCoreShapeStatic.$Filter,
    value: BaseShaclCoreShape,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      filter.and !== undefined &&
      !$filterArray<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.and, value.and)
    ) {
      return false;
    }
    if (
      filter.classes !== undefined &&
      !$filterArray<NamedNode, $IriFilter>($filterIri)(
        filter.classes,
        value.classes,
      )
    ) {
      return false;
    }
    if (
      filter.comments !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.comments,
        value.comments,
      )
    ) {
      return false;
    }
    if (
      filter.datatype !== undefined &&
      !$filterMaybe<NamedNode, $IriFilter>($filterIri)(
        filter.datatype,
        value.datatype,
      )
    ) {
      return false;
    }
    if (
      filter.deactivated !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.deactivated,
        value.deactivated,
      )
    ) {
      return false;
    }
    if (
      filter.flags !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.flags,
        value.flags,
      )
    ) {
      return false;
    }
    if (
      filter.hasValues !== undefined &&
      !$filterArray<NamedNode | Literal, $TermFilter>($filterTerm)(
        filter.hasValues,
        value.hasValues,
      )
    ) {
      return false;
    }
    if (
      filter.in_ !== undefined &&
      !$filterMaybe<
        readonly (NamedNode | Literal)[],
        $CollectionFilter<$TermFilter>
      >($filterArray<NamedNode | Literal, $TermFilter>($filterTerm))(
        filter.in_,
        value.in_,
      )
    ) {
      return false;
    }
    if (
      filter.isDefinedBy !== undefined &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.isDefinedBy, value.isDefinedBy)
    ) {
      return false;
    }
    if (
      filter.labels !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.labels,
        value.labels,
      )
    ) {
      return false;
    }
    if (
      filter.languageIn !== undefined &&
      !$filterMaybe<readonly string[], $CollectionFilter<$StringFilter>>(
        $filterArray<string, $StringFilter>($filterString),
      )(filter.languageIn, value.languageIn)
    ) {
      return false;
    }
    if (
      filter.maxCount !== undefined &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.maxCount,
        value.maxCount,
      )
    ) {
      return false;
    }
    if (
      filter.maxExclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.maxExclusive,
        value.maxExclusive,
      )
    ) {
      return false;
    }
    if (
      filter.maxInclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.maxInclusive,
        value.maxInclusive,
      )
    ) {
      return false;
    }
    if (
      filter.maxLength !== undefined &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.maxLength,
        value.maxLength,
      )
    ) {
      return false;
    }
    if (
      filter.minCount !== undefined &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.minCount,
        value.minCount,
      )
    ) {
      return false;
    }
    if (
      filter.minExclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.minExclusive,
        value.minExclusive,
      )
    ) {
      return false;
    }
    if (
      filter.minInclusive !== undefined &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.minInclusive,
        value.minInclusive,
      )
    ) {
      return false;
    }
    if (
      filter.minLength !== undefined &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.minLength,
        value.minLength,
      )
    ) {
      return false;
    }
    if (
      filter.nodeKind !== undefined &&
      !$filterMaybe<
        NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >,
        $IriFilter
      >($filterIri)(filter.nodeKind, value.nodeKind)
    ) {
      return false;
    }
    if (
      filter.nodes !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.nodes, value.nodes)
    ) {
      return false;
    }
    if (
      filter.not !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.not, value.not)
    ) {
      return false;
    }
    if (
      filter.or !== undefined &&
      !$filterArray<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.or, value.or)
    ) {
      return false;
    }
    if (
      filter.patterns !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.patterns,
        value.patterns,
      )
    ) {
      return false;
    }
    if (
      filter.xone !== undefined &&
      !$filterArray<
        readonly (BlankNode | NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<BlankNode | NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.xone, value.xone)
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly and?: $CollectionFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly classes?: $CollectionFilter<$IriFilter>;
    readonly comments?: $CollectionFilter<$StringFilter>;
    readonly datatype?: $MaybeFilter<$IriFilter>;
    readonly deactivated?: $MaybeFilter<$BooleanFilter>;
    readonly flags?: $CollectionFilter<$StringFilter>;
    readonly hasValues?: $CollectionFilter<$TermFilter>;
    readonly in_?: $MaybeFilter<$CollectionFilter<$TermFilter>>;
    readonly isDefinedBy?: $MaybeFilter<$IdentifierFilter>;
    readonly labels?: $CollectionFilter<$StringFilter>;
    readonly languageIn?: $MaybeFilter<$CollectionFilter<$StringFilter>>;
    readonly maxCount?: $MaybeFilter<$NumericFilter<number>>;
    readonly maxExclusive?: $MaybeFilter<$LiteralFilter>;
    readonly maxInclusive?: $MaybeFilter<$LiteralFilter>;
    readonly maxLength?: $MaybeFilter<$NumericFilter<number>>;
    readonly minCount?: $MaybeFilter<$NumericFilter<number>>;
    readonly minExclusive?: $MaybeFilter<$LiteralFilter>;
    readonly minInclusive?: $MaybeFilter<$LiteralFilter>;
    readonly minLength?: $MaybeFilter<$NumericFilter<number>>;
    readonly nodeKind?: $MaybeFilter<$IriFilter>;
    readonly nodes?: $CollectionFilter<$IdentifierFilter>;
    readonly not?: $CollectionFilter<$IdentifierFilter>;
    readonly or?: $CollectionFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly patterns?: $CollectionFilter<$StringFilter>;
    readonly xone?: $CollectionFilter<$CollectionFilter<$IdentifierFilter>>;
  };

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isBaseShaclCoreShape(
    object: $Object,
  ): object is BaseShaclCoreShape {
    switch (object.$type) {
      case "ShaclCoreNodeShape":
      case "ShaclCorePropertyShape":
      case "ShaclmateNodeShape":
      case "ShaclmatePropertyShape":
        return true;
      default:
        return false;
    }
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      and: readonly (readonly (BlankNode | NamedNode)[])[];
      classes: readonly NamedNode[];
      comments: readonly string[];
      datatype: Maybe<NamedNode>;
      deactivated: Maybe<boolean>;
      flags: readonly string[];
      hasValues: readonly (NamedNode | Literal)[];
      in_: Maybe<readonly (NamedNode | Literal)[]>;
      isDefinedBy: Maybe<BlankNode | NamedNode>;
      labels: readonly string[];
      languageIn: Maybe<readonly string[]>;
      maxCount: Maybe<number>;
      maxExclusive: Maybe<Literal>;
      maxInclusive: Maybe<Literal>;
      maxLength: Maybe<number>;
      minCount: Maybe<number>;
      minExclusive: Maybe<Literal>;
      minInclusive: Maybe<Literal>;
      minLength: Maybe<number>;
      nodeKind: Maybe<
        NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      >;
      nodes: readonly (BlankNode | NamedNode)[];
      not: readonly (BlankNode | NamedNode)[];
      or: readonly (readonly (BlankNode | NamedNode)[])[];
      patterns: readonly string[];
      xone: readonly (readonly (BlankNode | NamedNode)[])[];
    }
  > {
    return Right(
      new Resource.Value({
        dataFactory: dataFactory,
        focusResource: $parameters.resource,
        propertyPath: $RdfVocabularies.rdf.subject,
        term: $parameters.resource.identifier,
      }).toValues(),
    )
      .chain((values) => values.chainMap((value) => value.toIdentifier()))
      .chain((values) => values.head())
      .chain(($identifier) =>
        $shaclPropertyFromRdf({
          graph: $parameters.graph,
          resource: $parameters.resource,
          propertySchema: $schema.properties.and,
          typeFromRdf: (resourceValues) =>
            resourceValues
              .chain((values) =>
                values.chainMap((value) =>
                  value.toList({ graph: $parameters.graph }),
                ),
              )
              .chain((valueLists) =>
                valueLists.chainMap((valueList) =>
                  Right(
                    Resource.Values.fromArray({
                      focusResource: $parameters.resource,
                      propertyPath:
                        BaseShaclCoreShapeStatic.$schema.properties.and.path,
                      values: valueList.toArray(),
                    }),
                  ).chain((values) =>
                    values.chainMap((value) => value.toIdentifier()),
                  ),
                ),
              )
              .map((valueLists) =>
                valueLists.map((valueList) => valueList.toArray()),
              )
              .map((values) => values.toArray())
              .map((valuesArray) =>
                Resource.Values.fromValue({
                  focusResource: $parameters.resource,
                  propertyPath:
                    BaseShaclCoreShapeStatic.$schema.properties.and.path,
                  value: valuesArray,
                }),
              ),
        }).chain((and) =>
          $shaclPropertyFromRdf({
            graph: $parameters.graph,
            resource: $parameters.resource,
            propertySchema: $schema.properties.classes,
            typeFromRdf: (resourceValues) =>
              resourceValues
                .chain((values) => values.chainMap((value) => value.toIri()))
                .map((values) => values.toArray())
                .map((valuesArray) =>
                  Resource.Values.fromValue({
                    focusResource: $parameters.resource,
                    propertyPath:
                      BaseShaclCoreShapeStatic.$schema.properties.classes.path,
                    value: valuesArray,
                  }),
                ),
          }).chain((classes) =>
            $shaclPropertyFromRdf({
              graph: $parameters.graph,
              resource: $parameters.resource,
              propertySchema: $schema.properties.comments,
              typeFromRdf: (resourceValues) =>
                resourceValues
                  .chain((values) =>
                    $fromRdfPreferredLanguages(
                      values,
                      $parameters.preferredLanguages,
                    ),
                  )
                  .chain((values) =>
                    values.chainMap((value) => value.toString()),
                  )
                  .map((values) => values.toArray())
                  .map((valuesArray) =>
                    Resource.Values.fromValue({
                      focusResource: $parameters.resource,
                      propertyPath:
                        BaseShaclCoreShapeStatic.$schema.properties.comments
                          .path,
                      value: valuesArray,
                    }),
                  ),
            }).chain((comments) =>
              $shaclPropertyFromRdf({
                graph: $parameters.graph,
                resource: $parameters.resource,
                propertySchema: $schema.properties.datatype,
                typeFromRdf: (resourceValues) =>
                  resourceValues
                    .chain((values) =>
                      values.chainMap((value) => value.toIri()),
                    )
                    .map((values) =>
                      values.length > 0
                        ? values.map((value) => Maybe.of(value))
                        : Resource.Values.fromValue<Maybe<NamedNode>>({
                            focusResource: $parameters.resource,
                            propertyPath:
                              BaseShaclCoreShapeStatic.$schema.properties
                                .datatype.path,
                            value: Maybe.empty(),
                          }),
                    ),
              }).chain((datatype) =>
                $shaclPropertyFromRdf({
                  graph: $parameters.graph,
                  resource: $parameters.resource,
                  propertySchema: $schema.properties.deactivated,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        values.chainMap((value) => value.toBoolean()),
                      )
                      .map((values) =>
                        values.length > 0
                          ? values.map((value) => Maybe.of(value))
                          : Resource.Values.fromValue<Maybe<boolean>>({
                              focusResource: $parameters.resource,
                              propertyPath:
                                BaseShaclCoreShapeStatic.$schema.properties
                                  .deactivated.path,
                              value: Maybe.empty(),
                            }),
                      ),
                }).chain((deactivated) =>
                  $shaclPropertyFromRdf({
                    graph: $parameters.graph,
                    resource: $parameters.resource,
                    propertySchema: $schema.properties.flags,
                    typeFromRdf: (resourceValues) =>
                      resourceValues
                        .chain((values) =>
                          $fromRdfPreferredLanguages(
                            values,
                            $parameters.preferredLanguages,
                          ),
                        )
                        .chain((values) =>
                          values.chainMap((value) => value.toString()),
                        )
                        .map((values) => values.toArray())
                        .map((valuesArray) =>
                          Resource.Values.fromValue({
                            focusResource: $parameters.resource,
                            propertyPath:
                              BaseShaclCoreShapeStatic.$schema.properties.flags
                                .path,
                            value: valuesArray,
                          }),
                        ),
                  }).chain((flags) =>
                    $shaclPropertyFromRdf({
                      graph: $parameters.graph,
                      resource: $parameters.resource,
                      propertySchema: $schema.properties.hasValues,
                      typeFromRdf: (resourceValues) =>
                        resourceValues
                          .chain((values) =>
                            values.chainMap((value) =>
                              value.toTerm().chain((term) => {
                                switch (term.termType) {
                                  case "NamedNode":
                                  case "Literal":
                                    return Either.of<
                                      Error,
                                      NamedNode | Literal
                                    >(term);
                                  default:
                                    return Left<Error, NamedNode | Literal>(
                                      new Resource.MistypedTermValueError({
                                        actualValue: term,
                                        expectedValueType:
                                          "(NamedNode | Literal)",
                                        focusResource: $parameters.resource,
                                        propertyPath:
                                          BaseShaclCoreShapeStatic.$schema
                                            .properties.hasValues.path,
                                      }),
                                    );
                                }
                              }),
                            ),
                          )
                          .map((values) => values.toArray())
                          .map((valuesArray) =>
                            Resource.Values.fromValue({
                              focusResource: $parameters.resource,
                              propertyPath:
                                BaseShaclCoreShapeStatic.$schema.properties
                                  .hasValues.path,
                              value: valuesArray,
                            }),
                          ),
                    }).chain((hasValues) =>
                      $shaclPropertyFromRdf({
                        graph: $parameters.graph,
                        resource: $parameters.resource,
                        propertySchema: $schema.properties.in_,
                        typeFromRdf: (resourceValues) =>
                          resourceValues
                            .chain((values) =>
                              values.chainMap((value) =>
                                value.toList({ graph: $parameters.graph }),
                              ),
                            )
                            .chain((valueLists) =>
                              valueLists.chainMap((valueList) =>
                                Right(
                                  Resource.Values.fromArray({
                                    focusResource: $parameters.resource,
                                    propertyPath:
                                      BaseShaclCoreShapeStatic.$schema
                                        .properties.in_.path,
                                    values: valueList.toArray(),
                                  }),
                                ).chain((values) =>
                                  values.chainMap((value) =>
                                    value.toTerm().chain((term) => {
                                      switch (term.termType) {
                                        case "NamedNode":
                                        case "Literal":
                                          return Either.of<
                                            Error,
                                            NamedNode | Literal
                                          >(term);
                                        default:
                                          return Left<
                                            Error,
                                            NamedNode | Literal
                                          >(
                                            new Resource.MistypedTermValueError(
                                              {
                                                actualValue: term,
                                                expectedValueType:
                                                  "(NamedNode | Literal)",
                                                focusResource:
                                                  $parameters.resource,
                                                propertyPath:
                                                  BaseShaclCoreShapeStatic
                                                    .$schema.properties.in_
                                                    .path,
                                              },
                                            ),
                                          );
                                      }
                                    }),
                                  ),
                                ),
                              ),
                            )
                            .map((valueLists) =>
                              valueLists.map((valueList) =>
                                valueList.toArray(),
                              ),
                            )
                            .map((values) =>
                              values.length > 0
                                ? values.map((value) => Maybe.of(value))
                                : Resource.Values.fromValue<
                                    Maybe<readonly (NamedNode | Literal)[]>
                                  >({
                                    focusResource: $parameters.resource,
                                    propertyPath:
                                      BaseShaclCoreShapeStatic.$schema
                                        .properties.in_.path,
                                    value: Maybe.empty(),
                                  }),
                            ),
                      }).chain((in_) =>
                        $shaclPropertyFromRdf({
                          graph: $parameters.graph,
                          resource: $parameters.resource,
                          propertySchema: $schema.properties.isDefinedBy,
                          typeFromRdf: (resourceValues) =>
                            resourceValues
                              .chain((values) =>
                                values.chainMap((value) =>
                                  value.toIdentifier(),
                                ),
                              )
                              .map((values) =>
                                values.length > 0
                                  ? values.map((value) => Maybe.of(value))
                                  : Resource.Values.fromValue<
                                      Maybe<BlankNode | NamedNode>
                                    >({
                                      focusResource: $parameters.resource,
                                      propertyPath:
                                        BaseShaclCoreShapeStatic.$schema
                                          .properties.isDefinedBy.path,
                                      value: Maybe.empty(),
                                    }),
                              ),
                        }).chain((isDefinedBy) =>
                          $shaclPropertyFromRdf({
                            graph: $parameters.graph,
                            resource: $parameters.resource,
                            propertySchema: $schema.properties.labels,
                            typeFromRdf: (resourceValues) =>
                              resourceValues
                                .chain((values) =>
                                  $fromRdfPreferredLanguages(
                                    values,
                                    $parameters.preferredLanguages,
                                  ),
                                )
                                .chain((values) =>
                                  values.chainMap((value) => value.toString()),
                                )
                                .map((values) => values.toArray())
                                .map((valuesArray) =>
                                  Resource.Values.fromValue({
                                    focusResource: $parameters.resource,
                                    propertyPath:
                                      BaseShaclCoreShapeStatic.$schema
                                        .properties.labels.path,
                                    value: valuesArray,
                                  }),
                                ),
                          }).chain((labels) =>
                            $shaclPropertyFromRdf({
                              graph: $parameters.graph,
                              resource: $parameters.resource,
                              propertySchema: $schema.properties.languageIn,
                              typeFromRdf: (resourceValues) =>
                                resourceValues
                                  .chain((values) =>
                                    values.chainMap((value) =>
                                      value.toList({
                                        graph: $parameters.graph,
                                      }),
                                    ),
                                  )
                                  .chain((valueLists) =>
                                    valueLists.chainMap((valueList) =>
                                      Right(
                                        Resource.Values.fromArray({
                                          focusResource: $parameters.resource,
                                          propertyPath:
                                            BaseShaclCoreShapeStatic.$schema
                                              .properties.languageIn.path,
                                          values: valueList.toArray(),
                                        }),
                                      )
                                        .chain((values) =>
                                          $fromRdfPreferredLanguages(
                                            values,
                                            $parameters.preferredLanguages,
                                          ),
                                        )
                                        .chain((values) =>
                                          values.chainMap((value) =>
                                            value.toString(),
                                          ),
                                        ),
                                    ),
                                  )
                                  .map((valueLists) =>
                                    valueLists.map((valueList) =>
                                      valueList.toArray(),
                                    ),
                                  )
                                  .map((values) =>
                                    values.length > 0
                                      ? values.map((value) => Maybe.of(value))
                                      : Resource.Values.fromValue<
                                          Maybe<readonly string[]>
                                        >({
                                          focusResource: $parameters.resource,
                                          propertyPath:
                                            BaseShaclCoreShapeStatic.$schema
                                              .properties.languageIn.path,
                                          value: Maybe.empty(),
                                        }),
                                  ),
                            }).chain((languageIn) =>
                              $shaclPropertyFromRdf({
                                graph: $parameters.graph,
                                resource: $parameters.resource,
                                propertySchema: $schema.properties.maxCount,
                                typeFromRdf: (resourceValues) =>
                                  resourceValues
                                    .chain((values) =>
                                      values.chainMap((value) => value.toInt()),
                                    )
                                    .map((values) =>
                                      values.length > 0
                                        ? values.map((value) => Maybe.of(value))
                                        : Resource.Values.fromValue<
                                            Maybe<number>
                                          >({
                                            focusResource: $parameters.resource,
                                            propertyPath:
                                              BaseShaclCoreShapeStatic.$schema
                                                .properties.maxCount.path,
                                            value: Maybe.empty(),
                                          }),
                                    ),
                              }).chain((maxCount) =>
                                $shaclPropertyFromRdf({
                                  graph: $parameters.graph,
                                  resource: $parameters.resource,
                                  propertySchema:
                                    $schema.properties.maxExclusive,
                                  typeFromRdf: (resourceValues) =>
                                    resourceValues
                                      .chain((values) =>
                                        $fromRdfPreferredLanguages(
                                          values,
                                          $parameters.preferredLanguages,
                                        ),
                                      )
                                      .chain((values) =>
                                        values.chainMap((value) =>
                                          value.toLiteral(),
                                        ),
                                      )
                                      .map((values) =>
                                        values.length > 0
                                          ? values.map((value) =>
                                              Maybe.of(value),
                                            )
                                          : Resource.Values.fromValue<
                                              Maybe<Literal>
                                            >({
                                              focusResource:
                                                $parameters.resource,
                                              propertyPath:
                                                BaseShaclCoreShapeStatic.$schema
                                                  .properties.maxExclusive.path,
                                              value: Maybe.empty(),
                                            }),
                                      ),
                                }).chain((maxExclusive) =>
                                  $shaclPropertyFromRdf({
                                    graph: $parameters.graph,
                                    resource: $parameters.resource,
                                    propertySchema:
                                      $schema.properties.maxInclusive,
                                    typeFromRdf: (resourceValues) =>
                                      resourceValues
                                        .chain((values) =>
                                          $fromRdfPreferredLanguages(
                                            values,
                                            $parameters.preferredLanguages,
                                          ),
                                        )
                                        .chain((values) =>
                                          values.chainMap((value) =>
                                            value.toLiteral(),
                                          ),
                                        )
                                        .map((values) =>
                                          values.length > 0
                                            ? values.map((value) =>
                                                Maybe.of(value),
                                              )
                                            : Resource.Values.fromValue<
                                                Maybe<Literal>
                                              >({
                                                focusResource:
                                                  $parameters.resource,
                                                propertyPath:
                                                  BaseShaclCoreShapeStatic
                                                    .$schema.properties
                                                    .maxInclusive.path,
                                                value: Maybe.empty(),
                                              }),
                                        ),
                                  }).chain((maxInclusive) =>
                                    $shaclPropertyFromRdf({
                                      graph: $parameters.graph,
                                      resource: $parameters.resource,
                                      propertySchema:
                                        $schema.properties.maxLength,
                                      typeFromRdf: (resourceValues) =>
                                        resourceValues
                                          .chain((values) =>
                                            values.chainMap((value) =>
                                              value.toInt(),
                                            ),
                                          )
                                          .map((values) =>
                                            values.length > 0
                                              ? values.map((value) =>
                                                  Maybe.of(value),
                                                )
                                              : Resource.Values.fromValue<
                                                  Maybe<number>
                                                >({
                                                  focusResource:
                                                    $parameters.resource,
                                                  propertyPath:
                                                    BaseShaclCoreShapeStatic
                                                      .$schema.properties
                                                      .maxLength.path,
                                                  value: Maybe.empty(),
                                                }),
                                          ),
                                    }).chain((maxLength) =>
                                      $shaclPropertyFromRdf({
                                        graph: $parameters.graph,
                                        resource: $parameters.resource,
                                        propertySchema:
                                          $schema.properties.minCount,
                                        typeFromRdf: (resourceValues) =>
                                          resourceValues
                                            .chain((values) =>
                                              values.chainMap((value) =>
                                                value.toInt(),
                                              ),
                                            )
                                            .map((values) =>
                                              values.length > 0
                                                ? values.map((value) =>
                                                    Maybe.of(value),
                                                  )
                                                : Resource.Values.fromValue<
                                                    Maybe<number>
                                                  >({
                                                    focusResource:
                                                      $parameters.resource,
                                                    propertyPath:
                                                      BaseShaclCoreShapeStatic
                                                        .$schema.properties
                                                        .minCount.path,
                                                    value: Maybe.empty(),
                                                  }),
                                            ),
                                      }).chain((minCount) =>
                                        $shaclPropertyFromRdf({
                                          graph: $parameters.graph,
                                          resource: $parameters.resource,
                                          propertySchema:
                                            $schema.properties.minExclusive,
                                          typeFromRdf: (resourceValues) =>
                                            resourceValues
                                              .chain((values) =>
                                                $fromRdfPreferredLanguages(
                                                  values,
                                                  $parameters.preferredLanguages,
                                                ),
                                              )
                                              .chain((values) =>
                                                values.chainMap((value) =>
                                                  value.toLiteral(),
                                                ),
                                              )
                                              .map((values) =>
                                                values.length > 0
                                                  ? values.map((value) =>
                                                      Maybe.of(value),
                                                    )
                                                  : Resource.Values.fromValue<
                                                      Maybe<Literal>
                                                    >({
                                                      focusResource:
                                                        $parameters.resource,
                                                      propertyPath:
                                                        BaseShaclCoreShapeStatic
                                                          .$schema.properties
                                                          .minExclusive.path,
                                                      value: Maybe.empty(),
                                                    }),
                                              ),
                                        }).chain((minExclusive) =>
                                          $shaclPropertyFromRdf({
                                            graph: $parameters.graph,
                                            resource: $parameters.resource,
                                            propertySchema:
                                              $schema.properties.minInclusive,
                                            typeFromRdf: (resourceValues) =>
                                              resourceValues
                                                .chain((values) =>
                                                  $fromRdfPreferredLanguages(
                                                    values,
                                                    $parameters.preferredLanguages,
                                                  ),
                                                )
                                                .chain((values) =>
                                                  values.chainMap((value) =>
                                                    value.toLiteral(),
                                                  ),
                                                )
                                                .map((values) =>
                                                  values.length > 0
                                                    ? values.map((value) =>
                                                        Maybe.of(value),
                                                      )
                                                    : Resource.Values.fromValue<
                                                        Maybe<Literal>
                                                      >({
                                                        focusResource:
                                                          $parameters.resource,
                                                        propertyPath:
                                                          BaseShaclCoreShapeStatic
                                                            .$schema.properties
                                                            .minInclusive.path,
                                                        value: Maybe.empty(),
                                                      }),
                                                ),
                                          }).chain((minInclusive) =>
                                            $shaclPropertyFromRdf({
                                              graph: $parameters.graph,
                                              resource: $parameters.resource,
                                              propertySchema:
                                                $schema.properties.minLength,
                                              typeFromRdf: (resourceValues) =>
                                                resourceValues
                                                  .chain((values) =>
                                                    values.chainMap((value) =>
                                                      value.toInt(),
                                                    ),
                                                  )
                                                  .map((values) =>
                                                    values.length > 0
                                                      ? values.map((value) =>
                                                          Maybe.of(value),
                                                        )
                                                      : Resource.Values.fromValue<
                                                          Maybe<number>
                                                        >({
                                                          focusResource:
                                                            $parameters.resource,
                                                          propertyPath:
                                                            BaseShaclCoreShapeStatic
                                                              .$schema
                                                              .properties
                                                              .minLength.path,
                                                          value: Maybe.empty(),
                                                        }),
                                                  ),
                                            }).chain((minLength) =>
                                              $shaclPropertyFromRdf({
                                                graph: $parameters.graph,
                                                resource: $parameters.resource,
                                                propertySchema:
                                                  $schema.properties.nodeKind,
                                                typeFromRdf: (resourceValues) =>
                                                  resourceValues
                                                    .chain((values) =>
                                                      values.chainMap((value) =>
                                                        value.toIri([
                                                          dataFactory.namedNode(
                                                            "http://www.w3.org/ns/shacl#BlankNode",
                                                          ),
                                                          dataFactory.namedNode(
                                                            "http://www.w3.org/ns/shacl#BlankNodeOrIRI",
                                                          ),
                                                          dataFactory.namedNode(
                                                            "http://www.w3.org/ns/shacl#BlankNodeOrLiteral",
                                                          ),
                                                          dataFactory.namedNode(
                                                            "http://www.w3.org/ns/shacl#IRI",
                                                          ),
                                                          dataFactory.namedNode(
                                                            "http://www.w3.org/ns/shacl#IRIOrLiteral",
                                                          ),
                                                          dataFactory.namedNode(
                                                            "http://www.w3.org/ns/shacl#Literal",
                                                          ),
                                                        ]),
                                                      ),
                                                    )
                                                    .map((values) =>
                                                      values.length > 0
                                                        ? values.map((value) =>
                                                            Maybe.of(value),
                                                          )
                                                        : Resource.Values.fromValue<
                                                            Maybe<
                                                              NamedNode<
                                                                | "http://www.w3.org/ns/shacl#BlankNode"
                                                                | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                | "http://www.w3.org/ns/shacl#IRI"
                                                                | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                | "http://www.w3.org/ns/shacl#Literal"
                                                              >
                                                            >
                                                          >({
                                                            focusResource:
                                                              $parameters.resource,
                                                            propertyPath:
                                                              BaseShaclCoreShapeStatic
                                                                .$schema
                                                                .properties
                                                                .nodeKind.path,
                                                            value:
                                                              Maybe.empty(),
                                                          }),
                                                    ),
                                              }).chain((nodeKind) =>
                                                $shaclPropertyFromRdf({
                                                  graph: $parameters.graph,
                                                  resource:
                                                    $parameters.resource,
                                                  propertySchema:
                                                    $schema.properties.nodes,
                                                  typeFromRdf: (
                                                    resourceValues,
                                                  ) =>
                                                    resourceValues
                                                      .chain((values) =>
                                                        values.chainMap(
                                                          (value) =>
                                                            value.toIdentifier(),
                                                        ),
                                                      )
                                                      .map((values) =>
                                                        values.toArray(),
                                                      )
                                                      .map((valuesArray) =>
                                                        Resource.Values.fromValue(
                                                          {
                                                            focusResource:
                                                              $parameters.resource,
                                                            propertyPath:
                                                              BaseShaclCoreShapeStatic
                                                                .$schema
                                                                .properties
                                                                .nodes.path,
                                                            value: valuesArray,
                                                          },
                                                        ),
                                                      ),
                                                }).chain((nodes) =>
                                                  $shaclPropertyFromRdf({
                                                    graph: $parameters.graph,
                                                    resource:
                                                      $parameters.resource,
                                                    propertySchema:
                                                      $schema.properties.not,
                                                    typeFromRdf: (
                                                      resourceValues,
                                                    ) =>
                                                      resourceValues
                                                        .chain((values) =>
                                                          values.chainMap(
                                                            (value) =>
                                                              value.toIdentifier(),
                                                          ),
                                                        )
                                                        .map((values) =>
                                                          values.toArray(),
                                                        )
                                                        .map((valuesArray) =>
                                                          Resource.Values.fromValue(
                                                            {
                                                              focusResource:
                                                                $parameters.resource,
                                                              propertyPath:
                                                                BaseShaclCoreShapeStatic
                                                                  .$schema
                                                                  .properties
                                                                  .not.path,
                                                              value:
                                                                valuesArray,
                                                            },
                                                          ),
                                                        ),
                                                  }).chain((not) =>
                                                    $shaclPropertyFromRdf({
                                                      graph: $parameters.graph,
                                                      resource:
                                                        $parameters.resource,
                                                      propertySchema:
                                                        $schema.properties.or,
                                                      typeFromRdf: (
                                                        resourceValues,
                                                      ) =>
                                                        resourceValues
                                                          .chain((values) =>
                                                            values.chainMap(
                                                              (value) =>
                                                                value.toList({
                                                                  graph:
                                                                    $parameters.graph,
                                                                }),
                                                            ),
                                                          )
                                                          .chain((valueLists) =>
                                                            valueLists.chainMap(
                                                              (valueList) =>
                                                                Right(
                                                                  Resource.Values.fromArray(
                                                                    {
                                                                      focusResource:
                                                                        $parameters.resource,
                                                                      propertyPath:
                                                                        BaseShaclCoreShapeStatic
                                                                          .$schema
                                                                          .properties
                                                                          .or
                                                                          .path,
                                                                      values:
                                                                        valueList.toArray(),
                                                                    },
                                                                  ),
                                                                ).chain(
                                                                  (values) =>
                                                                    values.chainMap(
                                                                      (value) =>
                                                                        value.toIdentifier(),
                                                                    ),
                                                                ),
                                                            ),
                                                          )
                                                          .map((valueLists) =>
                                                            valueLists.map(
                                                              (valueList) =>
                                                                valueList.toArray(),
                                                            ),
                                                          )
                                                          .map((values) =>
                                                            values.toArray(),
                                                          )
                                                          .map((valuesArray) =>
                                                            Resource.Values.fromValue(
                                                              {
                                                                focusResource:
                                                                  $parameters.resource,
                                                                propertyPath:
                                                                  BaseShaclCoreShapeStatic
                                                                    .$schema
                                                                    .properties
                                                                    .or.path,
                                                                value:
                                                                  valuesArray,
                                                              },
                                                            ),
                                                          ),
                                                    }).chain((or) =>
                                                      $shaclPropertyFromRdf({
                                                        graph:
                                                          $parameters.graph,
                                                        resource:
                                                          $parameters.resource,
                                                        propertySchema:
                                                          $schema.properties
                                                            .patterns,
                                                        typeFromRdf: (
                                                          resourceValues,
                                                        ) =>
                                                          resourceValues
                                                            .chain((values) =>
                                                              $fromRdfPreferredLanguages(
                                                                values,
                                                                $parameters.preferredLanguages,
                                                              ),
                                                            )
                                                            .chain((values) =>
                                                              values.chainMap(
                                                                (value) =>
                                                                  value.toString(),
                                                              ),
                                                            )
                                                            .map((values) =>
                                                              values.toArray(),
                                                            )
                                                            .map(
                                                              (valuesArray) =>
                                                                Resource.Values.fromValue(
                                                                  {
                                                                    focusResource:
                                                                      $parameters.resource,
                                                                    propertyPath:
                                                                      BaseShaclCoreShapeStatic
                                                                        .$schema
                                                                        .properties
                                                                        .patterns
                                                                        .path,
                                                                    value:
                                                                      valuesArray,
                                                                  },
                                                                ),
                                                            ),
                                                      }).chain((patterns) =>
                                                        $shaclPropertyFromRdf({
                                                          graph:
                                                            $parameters.graph,
                                                          resource:
                                                            $parameters.resource,
                                                          propertySchema:
                                                            $schema.properties
                                                              .xone,
                                                          typeFromRdf: (
                                                            resourceValues,
                                                          ) =>
                                                            resourceValues
                                                              .chain((values) =>
                                                                values.chainMap(
                                                                  (value) =>
                                                                    value.toList(
                                                                      {
                                                                        graph:
                                                                          $parameters.graph,
                                                                      },
                                                                    ),
                                                                ),
                                                              )
                                                              .chain(
                                                                (valueLists) =>
                                                                  valueLists.chainMap(
                                                                    (
                                                                      valueList,
                                                                    ) =>
                                                                      Right(
                                                                        Resource.Values.fromArray(
                                                                          {
                                                                            focusResource:
                                                                              $parameters.resource,
                                                                            propertyPath:
                                                                              BaseShaclCoreShapeStatic
                                                                                .$schema
                                                                                .properties
                                                                                .xone
                                                                                .path,
                                                                            values:
                                                                              valueList.toArray(),
                                                                          },
                                                                        ),
                                                                      ).chain(
                                                                        (
                                                                          values,
                                                                        ) =>
                                                                          values.chainMap(
                                                                            (
                                                                              value,
                                                                            ) =>
                                                                              value.toIdentifier(),
                                                                          ),
                                                                      ),
                                                                  ),
                                                              )
                                                              .map(
                                                                (valueLists) =>
                                                                  valueLists.map(
                                                                    (
                                                                      valueList,
                                                                    ) =>
                                                                      valueList.toArray(),
                                                                  ),
                                                              )
                                                              .map((values) =>
                                                                values.toArray(),
                                                              )
                                                              .map(
                                                                (valuesArray) =>
                                                                  Resource.Values.fromValue(
                                                                    {
                                                                      focusResource:
                                                                        $parameters.resource,
                                                                      propertyPath:
                                                                        BaseShaclCoreShapeStatic
                                                                          .$schema
                                                                          .properties
                                                                          .xone
                                                                          .path,
                                                                      value:
                                                                        valuesArray,
                                                                    },
                                                                  ),
                                                              ),
                                                        }).map((xone) => ({
                                                          $identifier,
                                                          and,
                                                          classes,
                                                          comments,
                                                          datatype,
                                                          deactivated,
                                                          flags,
                                                          hasValues,
                                                          in_,
                                                          isDefinedBy,
                                                          labels,
                                                          languageIn,
                                                          maxCount,
                                                          maxExclusive,
                                                          maxInclusive,
                                                          maxLength,
                                                          minCount,
                                                          minExclusive,
                                                          minInclusive,
                                                          minLength,
                                                          nodeKind,
                                                          nodes,
                                                          not,
                                                          or,
                                                          patterns,
                                                          xone,
                                                        })),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
  }

  export function $toRdf(
    _baseShaclCoreShape: BaseShaclCoreShape,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_baseShaclCoreShape.$identifier);
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      _baseShaclCoreShape.and.flatMap((item) => [
        item.length > 0
          ? item.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.resource(
                    dataFactory.blankNode(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    options?.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  options?.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    options?.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.resource(dataFactory.blankNode()),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      _baseShaclCoreShape.classes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      _baseShaclCoreShape.comments.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      _baseShaclCoreShape.datatype.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      _baseShaclCoreShape.deactivated
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      _baseShaclCoreShape.flags.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      _baseShaclCoreShape.hasValues.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      _baseShaclCoreShape.in_.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.resource(
                    dataFactory.blankNode(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    options?.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  options?.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    options?.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.resource(dataFactory.blankNode()),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#isDefinedBy"),
      _baseShaclCoreShape.isDefinedBy.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _baseShaclCoreShape.labels.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      _baseShaclCoreShape.languageIn.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.resource(
                    dataFactory.blankNode(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    options?.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [$literalFactory.string(item)],
                  options?.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    options?.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.resource(dataFactory.blankNode()),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      _baseShaclCoreShape.maxCount
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      _baseShaclCoreShape.maxExclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      _baseShaclCoreShape.maxInclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      _baseShaclCoreShape.maxLength
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      _baseShaclCoreShape.minCount
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      _baseShaclCoreShape.minExclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      _baseShaclCoreShape.minInclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      _baseShaclCoreShape.minLength
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      _baseShaclCoreShape.nodeKind.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      _baseShaclCoreShape.nodes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      _baseShaclCoreShape.not.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      _baseShaclCoreShape.or.flatMap((item) => [
        item.length > 0
          ? item.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.resource(
                    dataFactory.blankNode(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    options?.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  options?.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    options?.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.resource(dataFactory.blankNode()),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      _baseShaclCoreShape.patterns.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      _baseShaclCoreShape.xone.flatMap((item) => [
        item.length > 0
          ? item.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.resource(
                    dataFactory.blankNode(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    options?.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  options?.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    options?.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.resource(dataFactory.blankNode()),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      options?.graph,
    );
    return resource;
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "TypeDiscriminant" as const,
        type: () => ({
          descendantValues: [
            "ShaclCoreNodeShape",
            "ShaclCorePropertyShape",
            "ShaclmateNodeShape",
            "ShaclmatePropertyShape",
          ],
          kind: "TypeDiscriminant" as const,
        }),
      },
      and: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comments: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      },
      deactivated: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      },
      in_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Term" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "String" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      },
      maxCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      },
      maxExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      },
      maxInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      },
      maxLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      },
      minCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      },
      minExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      },
      minInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      },
      minLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      },
      nodeKind: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
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
            ],
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      },
      nodes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      not: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      xone: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;
}
export interface ShaclCorePropertyShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCorePropertyShapeStatic.$Identifier;
  readonly $type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
  readonly defaultValue: Maybe<NamedNode | Literal>;
  readonly descriptions: readonly string[];
  readonly groups: readonly (BlankNode | NamedNode)[];
  readonly names: readonly string[];
  readonly order: Maybe<number>;
  readonly path: PropertyPath;
  readonly uniqueLang: Maybe<boolean>;
}

export namespace ShaclCorePropertyShapeStatic {
  export function $filter(
    filter: ShaclCorePropertyShapeStatic.$Filter,
    value: ShaclCorePropertyShape,
  ): boolean {
    if (!BaseShaclCoreShapeStatic.$filter(filter, value)) {
      return false;
    }
    if (
      filter.defaultValue !== undefined &&
      !$filterMaybe<NamedNode | Literal, $TermFilter>($filterTerm)(
        filter.defaultValue,
        value.defaultValue,
      )
    ) {
      return false;
    }
    if (
      filter.descriptions !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.descriptions,
        value.descriptions,
      )
    ) {
      return false;
    }
    if (
      filter.groups !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.groups, value.groups)
    ) {
      return false;
    }
    if (
      filter.names !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.names,
        value.names,
      )
    ) {
      return false;
    }
    if (
      filter.order !== undefined &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.order,
        value.order,
      )
    ) {
      return false;
    }
    if (
      filter.path !== undefined &&
      !PropertyPath.$filter(filter.path, value.path)
    ) {
      return false;
    }
    if (
      filter.uniqueLang !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.uniqueLang,
        value.uniqueLang,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly defaultValue?: $MaybeFilter<$TermFilter>;
    readonly descriptions?: $CollectionFilter<$StringFilter>;
    readonly groups?: $CollectionFilter<$IdentifierFilter>;
    readonly names?: $CollectionFilter<$StringFilter>;
    readonly order?: $MaybeFilter<$NumericFilter<number>>;
    readonly path?: PropertyPath.$Filter;
    readonly uniqueLang?: $MaybeFilter<$BooleanFilter>;
  } & BaseShaclCoreShapeStatic.$Filter;

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isShaclCorePropertyShape(
    object: $Object,
  ): object is ShaclCorePropertyShape {
    switch (object.$type) {
      case "ShaclmatePropertyShape":
      case "ShaclCorePropertyShape":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclCorePropertyShape> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return ShaclCorePropertyShapeStatic.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
      defaultValue: Maybe<NamedNode | Literal>;
      descriptions: readonly string[];
      groups: readonly (BlankNode | NamedNode)[];
      names: readonly string[];
      order: Maybe<number>;
      path: PropertyPath;
      uniqueLang: Maybe<boolean>;
    } & $UnwrapR<ReturnType<typeof BaseShaclCoreShapeStatic.$propertiesFromRdf>>
  > {
    return BaseShaclCoreShapeStatic.$propertiesFromRdf({
      ...$parameters,
      ignoreRdfType: true,
    }).chain(($super0) =>
      (!$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type, { graph: $parameters.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyShape":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCorePropertyShapeStatic.$fromRdfType,
                  { graph: $parameters.graph },
                )
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
                ),
              );
            })
        : Right(true as const)
      ).chain((_rdfTypeCheck) =>
        Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $parameters.resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $parameters.resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIdentifier()))
          .chain((values) => values.head())
          .chain(($identifier) =>
            Right<"ShaclCorePropertyShape">(
              "ShaclCorePropertyShape" as const,
            ).chain(($type) =>
              $shaclPropertyFromRdf({
                graph: $parameters.graph,
                resource: $parameters.resource,
                propertySchema: $schema.properties.defaultValue,
                typeFromRdf: (resourceValues) =>
                  resourceValues
                    .chain((values) =>
                      values.chainMap((value) =>
                        value.toTerm().chain((term) => {
                          switch (term.termType) {
                            case "NamedNode":
                            case "Literal":
                              return Either.of<Error, NamedNode | Literal>(
                                term,
                              );
                            default:
                              return Left<Error, NamedNode | Literal>(
                                new Resource.MistypedTermValueError({
                                  actualValue: term,
                                  expectedValueType: "(NamedNode | Literal)",
                                  focusResource: $parameters.resource,
                                  propertyPath:
                                    ShaclCorePropertyShapeStatic.$schema
                                      .properties.defaultValue.path,
                                }),
                              );
                          }
                        }),
                      ),
                    )
                    .map((values) =>
                      values.length > 0
                        ? values.map((value) => Maybe.of(value))
                        : Resource.Values.fromValue<Maybe<NamedNode | Literal>>(
                            {
                              focusResource: $parameters.resource,
                              propertyPath:
                                ShaclCorePropertyShapeStatic.$schema.properties
                                  .defaultValue.path,
                              value: Maybe.empty(),
                            },
                          ),
                    ),
              }).chain((defaultValue) =>
                $shaclPropertyFromRdf({
                  graph: $parameters.graph,
                  resource: $parameters.resource,
                  propertySchema: $schema.properties.descriptions,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        $fromRdfPreferredLanguages(
                          values,
                          $parameters.preferredLanguages,
                        ),
                      )
                      .chain((values) =>
                        values.chainMap((value) => value.toString()),
                      )
                      .map((values) => values.toArray())
                      .map((valuesArray) =>
                        Resource.Values.fromValue({
                          focusResource: $parameters.resource,
                          propertyPath:
                            ShaclCorePropertyShapeStatic.$schema.properties
                              .descriptions.path,
                          value: valuesArray,
                        }),
                      ),
                }).chain((descriptions) =>
                  $shaclPropertyFromRdf({
                    graph: $parameters.graph,
                    resource: $parameters.resource,
                    propertySchema: $schema.properties.groups,
                    typeFromRdf: (resourceValues) =>
                      resourceValues
                        .chain((values) =>
                          values.chainMap((value) => value.toIdentifier()),
                        )
                        .map((values) => values.toArray())
                        .map((valuesArray) =>
                          Resource.Values.fromValue({
                            focusResource: $parameters.resource,
                            propertyPath:
                              ShaclCorePropertyShapeStatic.$schema.properties
                                .groups.path,
                            value: valuesArray,
                          }),
                        ),
                  }).chain((groups) =>
                    $shaclPropertyFromRdf({
                      graph: $parameters.graph,
                      resource: $parameters.resource,
                      propertySchema: $schema.properties.names,
                      typeFromRdf: (resourceValues) =>
                        resourceValues
                          .chain((values) =>
                            $fromRdfPreferredLanguages(
                              values,
                              $parameters.preferredLanguages,
                            ),
                          )
                          .chain((values) =>
                            values.chainMap((value) => value.toString()),
                          )
                          .map((values) => values.toArray())
                          .map((valuesArray) =>
                            Resource.Values.fromValue({
                              focusResource: $parameters.resource,
                              propertyPath:
                                ShaclCorePropertyShapeStatic.$schema.properties
                                  .names.path,
                              value: valuesArray,
                            }),
                          ),
                    }).chain((names) =>
                      $shaclPropertyFromRdf({
                        graph: $parameters.graph,
                        resource: $parameters.resource,
                        propertySchema: $schema.properties.order,
                        typeFromRdf: (resourceValues) =>
                          resourceValues
                            .chain((values) =>
                              values.chainMap((value) => value.toFloat()),
                            )
                            .map((values) =>
                              values.length > 0
                                ? values.map((value) => Maybe.of(value))
                                : Resource.Values.fromValue<Maybe<number>>({
                                    focusResource: $parameters.resource,
                                    propertyPath:
                                      ShaclCorePropertyShapeStatic.$schema
                                        .properties.order.path,
                                    value: Maybe.empty(),
                                  }),
                            ),
                      }).chain((order) =>
                        $shaclPropertyFromRdf({
                          graph: $parameters.graph,
                          resource: $parameters.resource,
                          propertySchema: $schema.properties.path,
                          typeFromRdf: (resourceValues) =>
                            resourceValues.chain((values) =>
                              values.chainMap((value) =>
                                value.toResource().chain((resource) =>
                                  PropertyPath.$fromRdf(resource, {
                                    context: $parameters.context,
                                    ignoreRdfType: true,
                                    objectSet: $parameters.objectSet,
                                    preferredLanguages:
                                      $parameters.preferredLanguages,
                                  }),
                                ),
                              ),
                            ),
                        }).chain((path) =>
                          $shaclPropertyFromRdf({
                            graph: $parameters.graph,
                            resource: $parameters.resource,
                            propertySchema: $schema.properties.uniqueLang,
                            typeFromRdf: (resourceValues) =>
                              resourceValues
                                .chain((values) =>
                                  values.chainMap((value) => value.toBoolean()),
                                )
                                .map((values) =>
                                  values.length > 0
                                    ? values.map((value) => Maybe.of(value))
                                    : Resource.Values.fromValue<Maybe<boolean>>(
                                        {
                                          focusResource: $parameters.resource,
                                          propertyPath:
                                            ShaclCorePropertyShapeStatic.$schema
                                              .properties.uniqueLang.path,
                                          value: Maybe.empty(),
                                        },
                                      ),
                                ),
                          }).map((uniqueLang) => ({
                            ...$super0,
                            $identifier,
                            $type,
                            defaultValue,
                            descriptions,
                            groups,
                            names,
                            order,
                            path,
                            uniqueLang,
                          })),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ),
    );
  }

  export function $toRdf(
    _shaclCorePropertyShape: ShaclCorePropertyShape,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = BaseShaclCoreShapeStatic.$toRdf(_shaclCorePropertyShape, {
      ignoreRdfType: true,
      graph: options?.graph,
      resourceSet,
    });
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyShape"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
      _shaclCorePropertyShape.defaultValue.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
      _shaclCorePropertyShape.descriptions.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
      _shaclCorePropertyShape.groups.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
      _shaclCorePropertyShape.names.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
      _shaclCorePropertyShape.order
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      [
        PropertyPath.$toRdf(_shaclCorePropertyShape.path, {
          graph: options?.graph,
          resourceSet: resourceSet,
        }).identifier,
      ],
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
      _shaclCorePropertyShape.uniqueLang
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...BaseShaclCoreShapeStatic.$schema.properties,
      defaultValue: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
      },
      descriptions: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
      },
      groups: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
      },
      names: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
      },
      order: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Float" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
      },
      path: {
        kind: "Shacl" as const,
        type: () => PropertyPath.$schema,
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      },
      uniqueLang: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
      },
    },
  } as const;
}
export interface ShaclmatePropertyShape extends ShaclCorePropertyShape {
  readonly $identifier: ShaclmatePropertyShape.$Identifier;
  readonly $type: "ShaclmatePropertyShape";
  readonly mutable: Maybe<boolean>;
  readonly name: Maybe<string>;
  readonly resolve: Maybe<BlankNode | NamedNode>;
  readonly visibility: Maybe<
    NamedNode<
      | "http://purl.org/shaclmate/ontology#_Visibility_Private"
      | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
      | "http://purl.org/shaclmate/ontology#_Visibility_Public"
    >
  >;
}

export namespace ShaclmatePropertyShape {
  export function $filter(
    filter: ShaclmatePropertyShape.$Filter,
    value: ShaclmatePropertyShape,
  ): boolean {
    if (!ShaclCorePropertyShapeStatic.$filter(filter, value)) {
      return false;
    }
    if (
      filter.mutable !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.mutable,
        value.mutable,
      )
    ) {
      return false;
    }
    if (
      filter.name !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.name,
        value.name,
      )
    ) {
      return false;
    }
    if (
      filter.resolve !== undefined &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.resolve, value.resolve)
    ) {
      return false;
    }
    if (
      filter.visibility !== undefined &&
      !$filterMaybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_Visibility_Private"
          | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
          | "http://purl.org/shaclmate/ontology#_Visibility_Public"
        >,
        $IriFilter
      >($filterIri)(filter.visibility, value.visibility)
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly mutable?: $MaybeFilter<$BooleanFilter>;
    readonly name?: $MaybeFilter<$StringFilter>;
    readonly resolve?: $MaybeFilter<$IdentifierFilter>;
    readonly visibility?: $MaybeFilter<$IriFilter>;
  } & ShaclCorePropertyShapeStatic.$Filter;

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isShaclmatePropertyShape(
    object: $Object,
  ): object is ShaclmatePropertyShape {
    switch (object.$type) {
      case "ShaclmatePropertyShape":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclmatePropertyShape> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return ShaclmatePropertyShape.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "ShaclmatePropertyShape";
      mutable: Maybe<boolean>;
      name: Maybe<string>;
      resolve: Maybe<BlankNode | NamedNode>;
      visibility: Maybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_Visibility_Private"
          | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
          | "http://purl.org/shaclmate/ontology#_Visibility_Public"
        >
      >;
    } & $UnwrapR<
      ReturnType<typeof ShaclCorePropertyShapeStatic.$propertiesFromRdf>
    >
  > {
    return ShaclCorePropertyShapeStatic.$propertiesFromRdf({
      ...$parameters,
      ignoreRdfType: true,
    }).chain(($super0) =>
      (!$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type, { graph: $parameters.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyShape":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclmatePropertyShape.$fromRdfType,
                  { graph: $parameters.graph },
                )
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
                ),
              );
            })
        : Right(true as const)
      ).chain((_rdfTypeCheck) =>
        Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $parameters.resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $parameters.resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIdentifier()))
          .chain((values) => values.head())
          .chain(($identifier) =>
            Right<"ShaclmatePropertyShape">(
              "ShaclmatePropertyShape" as const,
            ).chain(($type) =>
              $shaclPropertyFromRdf({
                graph: $parameters.graph,
                resource: $parameters.resource,
                propertySchema: $schema.properties.mutable,
                typeFromRdf: (resourceValues) =>
                  resourceValues
                    .chain((values) =>
                      values.chainMap((value) => value.toBoolean()),
                    )
                    .map((values) =>
                      values.length > 0
                        ? values.map((value) => Maybe.of(value))
                        : Resource.Values.fromValue<Maybe<boolean>>({
                            focusResource: $parameters.resource,
                            propertyPath:
                              ShaclmatePropertyShape.$schema.properties.mutable
                                .path,
                            value: Maybe.empty(),
                          }),
                    ),
              }).chain((mutable) =>
                $shaclPropertyFromRdf({
                  graph: $parameters.graph,
                  resource: $parameters.resource,
                  propertySchema: $schema.properties.name,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        $fromRdfPreferredLanguages(
                          values,
                          $parameters.preferredLanguages,
                        ),
                      )
                      .chain((values) =>
                        values.chainMap((value) => value.toString()),
                      )
                      .map((values) =>
                        values.length > 0
                          ? values.map((value) => Maybe.of(value))
                          : Resource.Values.fromValue<Maybe<string>>({
                              focusResource: $parameters.resource,
                              propertyPath:
                                ShaclmatePropertyShape.$schema.properties.name
                                  .path,
                              value: Maybe.empty(),
                            }),
                      ),
                }).chain((name) =>
                  $shaclPropertyFromRdf({
                    graph: $parameters.graph,
                    resource: $parameters.resource,
                    propertySchema: $schema.properties.resolve,
                    typeFromRdf: (resourceValues) =>
                      resourceValues
                        .chain((values) =>
                          values.chainMap((value) => value.toIdentifier()),
                        )
                        .map((values) =>
                          values.length > 0
                            ? values.map((value) => Maybe.of(value))
                            : Resource.Values.fromValue<
                                Maybe<BlankNode | NamedNode>
                              >({
                                focusResource: $parameters.resource,
                                propertyPath:
                                  ShaclmatePropertyShape.$schema.properties
                                    .resolve.path,
                                value: Maybe.empty(),
                              }),
                        ),
                  }).chain((resolve) =>
                    $shaclPropertyFromRdf({
                      graph: $parameters.graph,
                      resource: $parameters.resource,
                      propertySchema: $schema.properties.visibility,
                      typeFromRdf: (resourceValues) =>
                        resourceValues
                          .chain((values) =>
                            values.chainMap((value) =>
                              value.toIri([
                                dataFactory.namedNode(
                                  "http://purl.org/shaclmate/ontology#_Visibility_Private",
                                ),
                                dataFactory.namedNode(
                                  "http://purl.org/shaclmate/ontology#_Visibility_Protected",
                                ),
                                dataFactory.namedNode(
                                  "http://purl.org/shaclmate/ontology#_Visibility_Public",
                                ),
                              ]),
                            ),
                          )
                          .map((values) =>
                            values.length > 0
                              ? values.map((value) => Maybe.of(value))
                              : Resource.Values.fromValue<
                                  Maybe<
                                    NamedNode<
                                      | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                                      | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                                      | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                                    >
                                  >
                                >({
                                  focusResource: $parameters.resource,
                                  propertyPath:
                                    ShaclmatePropertyShape.$schema.properties
                                      .visibility.path,
                                  value: Maybe.empty(),
                                }),
                          ),
                    }).map((visibility) => ({
                      ...$super0,
                      $identifier,
                      $type,
                      mutable,
                      name,
                      resolve,
                      visibility,
                    })),
                  ),
                ),
              ),
            ),
          ),
      ),
    );
  }

  export function $toRdf(
    _shaclmatePropertyShape: ShaclmatePropertyShape,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = ShaclCorePropertyShapeStatic.$toRdf(
      _shaclmatePropertyShape,
      {
        ignoreRdfType: true,
        graph: options?.graph,
        resourceSet,
      },
    );
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyShape"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
      _shaclmatePropertyShape.mutable
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      _shaclmatePropertyShape.name
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#resolve"),
      _shaclmatePropertyShape.resolve.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#visibility"),
      _shaclmatePropertyShape.visibility.toList(),
      options?.graph,
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...ShaclCorePropertyShapeStatic.$schema.properties,
      mutable: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#mutable",
        ),
      },
      name: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      },
      resolve: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#resolve",
        ),
      },
      visibility: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_Visibility_Private",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_Visibility_Protected",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_Visibility_Public",
              ),
            ],
          }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#visibility",
        ),
      },
    },
  } as const;
}
export interface OwlOntology {
  readonly $identifier: OwlOntologyStatic.$Identifier;
  readonly $type: "OwlOntology" | "ShaclmateOntology";
  readonly labels: readonly string[];
}

export namespace OwlOntologyStatic {
  export function $filter(
    filter: OwlOntologyStatic.$Filter,
    value: OwlOntology,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      filter.labels !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.labels,
        value.labels,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly labels?: $CollectionFilter<$StringFilter>;
  };

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isOwlOntology(object: $Object): object is OwlOntology {
    switch (object.$type) {
      case "ShaclmateOntology":
      case "OwlOntology":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, OwlOntology> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return OwlOntologyStatic.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "OwlOntology" | "ShaclmateOntology";
      labels: readonly string[];
    }
  > {
    return (
      !$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type, { graph: $parameters.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/2002/07/owl#Ontology":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  OwlOntologyStatic.$fromRdfType,
                  { graph: $parameters.graph },
                )
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
                ),
              );
            })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      Right(
        new Resource.Value({
          dataFactory: dataFactory,
          focusResource: $parameters.resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          term: $parameters.resource.identifier,
        }).toValues(),
      )
        .chain((values) => values.chainMap((value) => value.toIdentifier()))
        .chain((values) => values.head())
        .chain(($identifier) =>
          Right<"OwlOntology">("OwlOntology" as const).chain(($type) =>
            $shaclPropertyFromRdf({
              graph: $parameters.graph,
              resource: $parameters.resource,
              propertySchema: $schema.properties.labels,
              typeFromRdf: (resourceValues) =>
                resourceValues
                  .chain((values) =>
                    $fromRdfPreferredLanguages(
                      values,
                      $parameters.preferredLanguages,
                    ),
                  )
                  .chain((values) =>
                    values.chainMap((value) => value.toString()),
                  )
                  .map((values) => values.toArray())
                  .map((valuesArray) =>
                    Resource.Values.fromValue({
                      focusResource: $parameters.resource,
                      propertyPath:
                        OwlOntologyStatic.$schema.properties.labels.path,
                      value: valuesArray,
                    }),
                  ),
            }).map((labels) => ({ $identifier, $type, labels })),
          ),
        ),
    );
  }

  export function $toRdf(
    _owlOntology: OwlOntology,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_owlOntology.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _owlOntology.labels.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    return resource;
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "TypeDiscriminant" as const,
        type: () => ({
          descendantValues: ["ShaclmateOntology"],
          kind: "TypeDiscriminant" as const,
          ownValues: ["OwlOntology"],
        }),
      },
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
    },
  } as const;
}
export interface ShaclmateOntology extends OwlOntology {
  readonly $identifier: ShaclmateOntology.$Identifier;
  readonly $type: "ShaclmateOntology";
  readonly tsFeatureExcludes: readonly NamedNode<
    | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
    | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
    | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
  >[];
  readonly tsFeatureIncludes: readonly NamedNode<
    | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
    | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
    | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
  >[];
  readonly tsImports: readonly string[];
  readonly tsObjectDeclarationType: Maybe<
    NamedNode<
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
    >
  >;
}

export namespace ShaclmateOntology {
  export function $filter(
    filter: ShaclmateOntology.$Filter,
    value: ShaclmateOntology,
  ): boolean {
    if (!OwlOntologyStatic.$filter(filter, value)) {
      return false;
    }
    if (
      filter.tsFeatureExcludes !== undefined &&
      !$filterArray<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
          | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
          | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
        >,
        $IriFilter
      >($filterIri)(filter.tsFeatureExcludes, value.tsFeatureExcludes)
    ) {
      return false;
    }
    if (
      filter.tsFeatureIncludes !== undefined &&
      !$filterArray<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
          | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
          | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
        >,
        $IriFilter
      >($filterIri)(filter.tsFeatureIncludes, value.tsFeatureIncludes)
    ) {
      return false;
    }
    if (
      filter.tsImports !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.tsImports,
        value.tsImports,
      )
    ) {
      return false;
    }
    if (
      filter.tsObjectDeclarationType !== undefined &&
      !$filterMaybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >,
        $IriFilter
      >($filterIri)(
        filter.tsObjectDeclarationType,
        value.tsObjectDeclarationType,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly tsFeatureExcludes?: $CollectionFilter<$IriFilter>;
    readonly tsFeatureIncludes?: $CollectionFilter<$IriFilter>;
    readonly tsImports?: $CollectionFilter<$StringFilter>;
    readonly tsObjectDeclarationType?: $MaybeFilter<$IriFilter>;
  } & OwlOntologyStatic.$Filter;

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isShaclmateOntology(
    object: $Object,
  ): object is ShaclmateOntology {
    switch (object.$type) {
      case "ShaclmateOntology":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclmateOntology> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return ShaclmateOntology.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "ShaclmateOntology";
      tsFeatureExcludes: readonly NamedNode<
        | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
      >[];
      tsFeatureIncludes: readonly NamedNode<
        | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
      >[];
      tsImports: readonly string[];
      tsObjectDeclarationType: Maybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >
      >;
    } & $UnwrapR<ReturnType<typeof OwlOntologyStatic.$propertiesFromRdf>>
  > {
    return OwlOntologyStatic.$propertiesFromRdf({
      ...$parameters,
      ignoreRdfType: true,
    }).chain(($super0) =>
      (!$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type, { graph: $parameters.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/2002/07/owl#Ontology":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclmateOntology.$fromRdfType,
                  { graph: $parameters.graph },
                )
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
                ),
              );
            })
        : Right(true as const)
      ).chain((_rdfTypeCheck) =>
        Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $parameters.resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $parameters.resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIdentifier()))
          .chain((values) => values.head())
          .chain(($identifier) =>
            Right<"ShaclmateOntology">("ShaclmateOntology" as const).chain(
              ($type) =>
                $shaclPropertyFromRdf({
                  graph: $parameters.graph,
                  resource: $parameters.resource,
                  propertySchema: $schema.properties.tsFeatureExcludes,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        values.chainMap((value) =>
                          value.toIri([
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeatures_All",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeature_Create",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeatures_Default",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeature_Equals",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeature_Graphql",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeature_Hash",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeature_Json",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeatures_None",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeature_Rdf",
                            ),
                            dataFactory.namedNode(
                              "http://purl.org/shaclmate/ontology#_TsFeature_Sparql",
                            ),
                          ]),
                        ),
                      )
                      .map((values) => values.toArray())
                      .map((valuesArray) =>
                        Resource.Values.fromValue({
                          focusResource: $parameters.resource,
                          propertyPath:
                            ShaclmateOntology.$schema.properties
                              .tsFeatureExcludes.path,
                          value: valuesArray,
                        }),
                      ),
                }).chain((tsFeatureExcludes) =>
                  $shaclPropertyFromRdf({
                    graph: $parameters.graph,
                    resource: $parameters.resource,
                    propertySchema: $schema.properties.tsFeatureIncludes,
                    typeFromRdf: (resourceValues) =>
                      resourceValues
                        .chain((values) =>
                          values.chainMap((value) =>
                            value.toIri([
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeatures_All",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeature_Create",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeatures_Default",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeature_Equals",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeature_Graphql",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeature_Hash",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeature_Json",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeatures_None",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeature_Rdf",
                              ),
                              dataFactory.namedNode(
                                "http://purl.org/shaclmate/ontology#_TsFeature_Sparql",
                              ),
                            ]),
                          ),
                        )
                        .map((values) => values.toArray())
                        .map((valuesArray) =>
                          Resource.Values.fromValue({
                            focusResource: $parameters.resource,
                            propertyPath:
                              ShaclmateOntology.$schema.properties
                                .tsFeatureIncludes.path,
                            value: valuesArray,
                          }),
                        ),
                  }).chain((tsFeatureIncludes) =>
                    $shaclPropertyFromRdf({
                      graph: $parameters.graph,
                      resource: $parameters.resource,
                      propertySchema: $schema.properties.tsImports,
                      typeFromRdf: (resourceValues) =>
                        resourceValues
                          .chain((values) =>
                            $fromRdfPreferredLanguages(
                              values,
                              $parameters.preferredLanguages,
                            ),
                          )
                          .chain((values) =>
                            values.chainMap((value) => value.toString()),
                          )
                          .map((values) => values.toArray())
                          .map((valuesArray) =>
                            Resource.Values.fromValue({
                              focusResource: $parameters.resource,
                              propertyPath:
                                ShaclmateOntology.$schema.properties.tsImports
                                  .path,
                              value: valuesArray,
                            }),
                          ),
                    }).chain((tsImports) =>
                      $shaclPropertyFromRdf({
                        graph: $parameters.graph,
                        resource: $parameters.resource,
                        propertySchema:
                          $schema.properties.tsObjectDeclarationType,
                        typeFromRdf: (resourceValues) =>
                          resourceValues
                            .chain((values) =>
                              values.chainMap((value) =>
                                value.toIri([
                                  dataFactory.namedNode(
                                    "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class",
                                  ),
                                  dataFactory.namedNode(
                                    "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface",
                                  ),
                                ]),
                              ),
                            )
                            .map((values) =>
                              values.length > 0
                                ? values.map((value) => Maybe.of(value))
                                : Resource.Values.fromValue<
                                    Maybe<
                                      NamedNode<
                                        | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                        | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                      >
                                    >
                                  >({
                                    focusResource: $parameters.resource,
                                    propertyPath:
                                      ShaclmateOntology.$schema.properties
                                        .tsObjectDeclarationType.path,
                                    value: Maybe.empty(),
                                  }),
                            ),
                      }).map((tsObjectDeclarationType) => ({
                        ...$super0,
                        $identifier,
                        $type,
                        tsFeatureExcludes,
                        tsFeatureIncludes,
                        tsImports,
                        tsObjectDeclarationType,
                      })),
                    ),
                  ),
                ),
            ),
          ),
      ),
    );
  }

  export function $toRdf(
    _shaclmateOntology: ShaclmateOntology,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = OwlOntologyStatic.$toRdf(_shaclmateOntology, {
      ignoreRdfType: true,
      graph: options?.graph,
      resourceSet,
    });
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
      _shaclmateOntology.tsFeatureExcludes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
      _shaclmateOntology.tsFeatureIncludes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
      _shaclmateOntology.tsImports.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
      _shaclmateOntology.tsObjectDeclarationType.toList(),
      options?.graph,
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...OwlOntologyStatic.$schema.properties,
      tsFeatureExcludes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_All",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Create",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_Default",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Equals",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Graphql",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Hash",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Json",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_None",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Rdf",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Sparql",
              ),
            ],
          }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsFeatureExclude",
        ),
      },
      tsFeatureIncludes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_All",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Create",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_Default",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Equals",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Graphql",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Hash",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Json",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_None",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Rdf",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Sparql",
              ),
            ],
          }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsFeatureInclude",
        ),
      },
      tsImports: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsImport",
        ),
      },
      tsObjectDeclarationType: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface",
              ),
            ],
          }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
        ),
      },
    },
  } as const;
}
export interface ShaclCoreNodeShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCoreNodeShapeStatic.$Identifier;
  readonly $type: "ShaclCoreNodeShape" | "ShaclmateNodeShape";
  readonly closed: Maybe<boolean>;
  readonly ignoredProperties: Maybe<readonly NamedNode[]>;
  readonly properties: readonly (BlankNode | NamedNode)[];
}

export namespace ShaclCoreNodeShapeStatic {
  export function $filter(
    filter: ShaclCoreNodeShapeStatic.$Filter,
    value: ShaclCoreNodeShape,
  ): boolean {
    if (!BaseShaclCoreShapeStatic.$filter(filter, value)) {
      return false;
    }
    if (
      filter.closed !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.closed,
        value.closed,
      )
    ) {
      return false;
    }
    if (
      filter.ignoredProperties !== undefined &&
      !$filterMaybe<readonly NamedNode[], $CollectionFilter<$IriFilter>>(
        $filterArray<NamedNode, $IriFilter>($filterIri),
      )(filter.ignoredProperties, value.ignoredProperties)
    ) {
      return false;
    }
    if (
      filter.properties !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.properties, value.properties)
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly closed?: $MaybeFilter<$BooleanFilter>;
    readonly ignoredProperties?: $MaybeFilter<$CollectionFilter<$IriFilter>>;
    readonly properties?: $CollectionFilter<$IdentifierFilter>;
  } & BaseShaclCoreShapeStatic.$Filter;

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isShaclCoreNodeShape(
    object: $Object,
  ): object is ShaclCoreNodeShape {
    switch (object.$type) {
      case "ShaclmateNodeShape":
      case "ShaclCoreNodeShape":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclCoreNodeShape> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return ShaclCoreNodeShapeStatic.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "ShaclCoreNodeShape" | "ShaclmateNodeShape";
      closed: Maybe<boolean>;
      ignoredProperties: Maybe<readonly NamedNode[]>;
      properties: readonly (BlankNode | NamedNode)[];
    } & $UnwrapR<ReturnType<typeof BaseShaclCoreShapeStatic.$propertiesFromRdf>>
  > {
    return BaseShaclCoreShapeStatic.$propertiesFromRdf({
      ...$parameters,
      ignoreRdfType: true,
    }).chain(($super0) =>
      (!$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type, { graph: $parameters.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#NodeShape":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCoreNodeShapeStatic.$fromRdfType,
                  { graph: $parameters.graph },
                )
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
                ),
              );
            })
        : Right(true as const)
      ).chain((_rdfTypeCheck) =>
        Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $parameters.resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $parameters.resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIdentifier()))
          .chain((values) => values.head())
          .chain(($identifier) =>
            Right<"ShaclCoreNodeShape">("ShaclCoreNodeShape" as const).chain(
              ($type) =>
                $shaclPropertyFromRdf({
                  graph: $parameters.graph,
                  resource: $parameters.resource,
                  propertySchema: $schema.properties.closed,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        values.chainMap((value) => value.toBoolean()),
                      )
                      .map((values) =>
                        values.length > 0
                          ? values.map((value) => Maybe.of(value))
                          : Resource.Values.fromValue<Maybe<boolean>>({
                              focusResource: $parameters.resource,
                              propertyPath:
                                ShaclCoreNodeShapeStatic.$schema.properties
                                  .closed.path,
                              value: Maybe.empty(),
                            }),
                      ),
                }).chain((closed) =>
                  $shaclPropertyFromRdf({
                    graph: $parameters.graph,
                    resource: $parameters.resource,
                    propertySchema: $schema.properties.ignoredProperties,
                    typeFromRdf: (resourceValues) =>
                      resourceValues
                        .chain((values) =>
                          values.chainMap((value) =>
                            value.toList({ graph: $parameters.graph }),
                          ),
                        )
                        .chain((valueLists) =>
                          valueLists.chainMap((valueList) =>
                            Right(
                              Resource.Values.fromArray({
                                focusResource: $parameters.resource,
                                propertyPath:
                                  ShaclCoreNodeShapeStatic.$schema.properties
                                    .ignoredProperties.path,
                                values: valueList.toArray(),
                              }),
                            ).chain((values) =>
                              values.chainMap((value) => value.toIri()),
                            ),
                          ),
                        )
                        .map((valueLists) =>
                          valueLists.map((valueList) => valueList.toArray()),
                        )
                        .map((values) =>
                          values.length > 0
                            ? values.map((value) => Maybe.of(value))
                            : Resource.Values.fromValue<
                                Maybe<readonly NamedNode[]>
                              >({
                                focusResource: $parameters.resource,
                                propertyPath:
                                  ShaclCoreNodeShapeStatic.$schema.properties
                                    .ignoredProperties.path,
                                value: Maybe.empty(),
                              }),
                        ),
                  }).chain((ignoredProperties) =>
                    $shaclPropertyFromRdf({
                      graph: $parameters.graph,
                      resource: $parameters.resource,
                      propertySchema: $schema.properties.properties,
                      typeFromRdf: (resourceValues) =>
                        resourceValues
                          .chain((values) =>
                            values.chainMap((value) => value.toIdentifier()),
                          )
                          .map((values) => values.toArray())
                          .map((valuesArray) =>
                            Resource.Values.fromValue({
                              focusResource: $parameters.resource,
                              propertyPath:
                                ShaclCoreNodeShapeStatic.$schema.properties
                                  .properties.path,
                              value: valuesArray,
                            }),
                          ),
                    }).map((properties) => ({
                      ...$super0,
                      $identifier,
                      $type,
                      closed,
                      ignoredProperties,
                      properties,
                    })),
                  ),
                ),
            ),
          ),
      ),
    );
  }

  export function $toRdf(
    _shaclCoreNodeShape: ShaclCoreNodeShape,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = BaseShaclCoreShapeStatic.$toRdf(_shaclCoreNodeShape, {
      ignoreRdfType: true,
      graph: options?.graph,
      resourceSet,
    });
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
      _shaclCoreNodeShape.closed
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#ignoredProperties"),
      _shaclCoreNodeShape.ignoredProperties.toList().flatMap((value) => [
        value.length > 0
          ? value.reduce(
              (
                { currentSubListResource, listResource },
                item,
                itemIndex,
                list,
              ) => {
                if (itemIndex === 0) {
                  currentSubListResource = listResource;
                } else {
                  const newSubListResource = resourceSet.resource(
                    dataFactory.blankNode(),
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                    options?.graph,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  [item],
                  options?.graph,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                    options?.graph,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.resource(dataFactory.blankNode()),
              } as {
                currentSubListResource: Resource<BlankNode> | null;
                listResource: Resource<BlankNode>;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
      _shaclCoreNodeShape.properties.flatMap((item) => [item]),
      options?.graph,
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...BaseShaclCoreShapeStatic.$schema.properties,
      closed: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
      },
      ignoredProperties: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Iri" as const }),
          }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ignoredProperties",
        ),
      },
      properties: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
      },
    },
  } as const;
}
export interface ShaclmateNodeShape extends ShaclCoreNodeShape {
  readonly $identifier: ShaclmateNodeShape.$Identifier;
  readonly $type: "ShaclmateNodeShape";
  readonly abstract: Maybe<boolean>;
  readonly discriminantValue: Maybe<string>;
  readonly export_: Maybe<boolean>;
  readonly extern: Maybe<boolean>;
  readonly fromRdfType: Maybe<NamedNode>;
  readonly identifierMintingStrategy: Maybe<
    NamedNode<
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
    >
  >;
  readonly mutable: Maybe<boolean>;
  readonly name: Maybe<string>;
  readonly rdfType: Maybe<NamedNode>;
  readonly toRdfTypes: readonly NamedNode[];
  readonly tsFeatureExcludes: readonly NamedNode<
    | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
    | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
    | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
  >[];
  readonly tsFeatureIncludes: readonly NamedNode<
    | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
    | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
    | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
  >[];
  readonly tsImports: readonly string[];
  readonly tsObjectDeclarationType: Maybe<
    NamedNode<
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
    >
  >;
}

export namespace ShaclmateNodeShape {
  export function $filter(
    filter: ShaclmateNodeShape.$Filter,
    value: ShaclmateNodeShape,
  ): boolean {
    if (!ShaclCoreNodeShapeStatic.$filter(filter, value)) {
      return false;
    }
    if (
      filter.abstract !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.abstract,
        value.abstract,
      )
    ) {
      return false;
    }
    if (
      filter.discriminantValue !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.discriminantValue,
        value.discriminantValue,
      )
    ) {
      return false;
    }
    if (
      filter.export_ !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.export_,
        value.export_,
      )
    ) {
      return false;
    }
    if (
      filter.extern !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.extern,
        value.extern,
      )
    ) {
      return false;
    }
    if (
      filter.fromRdfType !== undefined &&
      !$filterMaybe<NamedNode, $IriFilter>($filterIri)(
        filter.fromRdfType,
        value.fromRdfType,
      )
    ) {
      return false;
    }
    if (
      filter.identifierMintingStrategy !== undefined &&
      !$filterMaybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
        >,
        $IriFilter
      >($filterIri)(
        filter.identifierMintingStrategy,
        value.identifierMintingStrategy,
      )
    ) {
      return false;
    }
    if (
      filter.mutable !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.mutable,
        value.mutable,
      )
    ) {
      return false;
    }
    if (
      filter.name !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.name,
        value.name,
      )
    ) {
      return false;
    }
    if (
      filter.rdfType !== undefined &&
      !$filterMaybe<NamedNode, $IriFilter>($filterIri)(
        filter.rdfType,
        value.rdfType,
      )
    ) {
      return false;
    }
    if (
      filter.toRdfTypes !== undefined &&
      !$filterArray<NamedNode, $IriFilter>($filterIri)(
        filter.toRdfTypes,
        value.toRdfTypes,
      )
    ) {
      return false;
    }
    if (
      filter.tsFeatureExcludes !== undefined &&
      !$filterArray<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
          | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
          | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
        >,
        $IriFilter
      >($filterIri)(filter.tsFeatureExcludes, value.tsFeatureExcludes)
    ) {
      return false;
    }
    if (
      filter.tsFeatureIncludes !== undefined &&
      !$filterArray<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
          | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
          | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
          | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
        >,
        $IriFilter
      >($filterIri)(filter.tsFeatureIncludes, value.tsFeatureIncludes)
    ) {
      return false;
    }
    if (
      filter.tsImports !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.tsImports,
        value.tsImports,
      )
    ) {
      return false;
    }
    if (
      filter.tsObjectDeclarationType !== undefined &&
      !$filterMaybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >,
        $IriFilter
      >($filterIri)(
        filter.tsObjectDeclarationType,
        value.tsObjectDeclarationType,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly abstract?: $MaybeFilter<$BooleanFilter>;
    readonly discriminantValue?: $MaybeFilter<$StringFilter>;
    readonly export_?: $MaybeFilter<$BooleanFilter>;
    readonly extern?: $MaybeFilter<$BooleanFilter>;
    readonly fromRdfType?: $MaybeFilter<$IriFilter>;
    readonly identifierMintingStrategy?: $MaybeFilter<$IriFilter>;
    readonly mutable?: $MaybeFilter<$BooleanFilter>;
    readonly name?: $MaybeFilter<$StringFilter>;
    readonly rdfType?: $MaybeFilter<$IriFilter>;
    readonly toRdfTypes?: $CollectionFilter<$IriFilter>;
    readonly tsFeatureExcludes?: $CollectionFilter<$IriFilter>;
    readonly tsFeatureIncludes?: $CollectionFilter<$IriFilter>;
    readonly tsImports?: $CollectionFilter<$StringFilter>;
    readonly tsObjectDeclarationType?: $MaybeFilter<$IriFilter>;
  } & ShaclCoreNodeShapeStatic.$Filter;

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isShaclmateNodeShape(
    object: $Object,
  ): object is ShaclmateNodeShape {
    switch (object.$type) {
      case "ShaclmateNodeShape":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclmateNodeShape> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return ShaclmateNodeShape.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "ShaclmateNodeShape";
      abstract: Maybe<boolean>;
      discriminantValue: Maybe<string>;
      export_: Maybe<boolean>;
      extern: Maybe<boolean>;
      fromRdfType: Maybe<NamedNode>;
      identifierMintingStrategy: Maybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
        >
      >;
      mutable: Maybe<boolean>;
      name: Maybe<string>;
      rdfType: Maybe<NamedNode>;
      toRdfTypes: readonly NamedNode[];
      tsFeatureExcludes: readonly NamedNode<
        | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
      >[];
      tsFeatureIncludes: readonly NamedNode<
        | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
      >[];
      tsImports: readonly string[];
      tsObjectDeclarationType: Maybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >
      >;
    } & $UnwrapR<ReturnType<typeof ShaclCoreNodeShapeStatic.$propertiesFromRdf>>
  > {
    return ShaclCoreNodeShapeStatic.$propertiesFromRdf({
      ...$parameters,
      ignoreRdfType: true,
    }).chain(($super0) =>
      (!$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type, { graph: $parameters.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#NodeShape":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclmateNodeShape.$fromRdfType,
                  { graph: $parameters.graph },
                )
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
                ),
              );
            })
        : Right(true as const)
      ).chain((_rdfTypeCheck) =>
        Right(
          new Resource.Value({
            dataFactory: dataFactory,
            focusResource: $parameters.resource,
            propertyPath: $RdfVocabularies.rdf.subject,
            term: $parameters.resource.identifier,
          }).toValues(),
        )
          .chain((values) => values.chainMap((value) => value.toIdentifier()))
          .chain((values) => values.head())
          .chain(($identifier) =>
            Right<"ShaclmateNodeShape">("ShaclmateNodeShape" as const).chain(
              ($type) =>
                $shaclPropertyFromRdf({
                  graph: $parameters.graph,
                  resource: $parameters.resource,
                  propertySchema: $schema.properties.abstract,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        values.chainMap((value) => value.toBoolean()),
                      )
                      .map((values) =>
                        values.length > 0
                          ? values.map((value) => Maybe.of(value))
                          : Resource.Values.fromValue<Maybe<boolean>>({
                              focusResource: $parameters.resource,
                              propertyPath:
                                ShaclmateNodeShape.$schema.properties.abstract
                                  .path,
                              value: Maybe.empty(),
                            }),
                      ),
                }).chain((abstract) =>
                  $shaclPropertyFromRdf({
                    graph: $parameters.graph,
                    resource: $parameters.resource,
                    propertySchema: $schema.properties.discriminantValue,
                    typeFromRdf: (resourceValues) =>
                      resourceValues
                        .chain((values) =>
                          $fromRdfPreferredLanguages(
                            values,
                            $parameters.preferredLanguages,
                          ),
                        )
                        .chain((values) =>
                          values.chainMap((value) => value.toString()),
                        )
                        .map((values) =>
                          values.length > 0
                            ? values.map((value) => Maybe.of(value))
                            : Resource.Values.fromValue<Maybe<string>>({
                                focusResource: $parameters.resource,
                                propertyPath:
                                  ShaclmateNodeShape.$schema.properties
                                    .discriminantValue.path,
                                value: Maybe.empty(),
                              }),
                        ),
                  }).chain((discriminantValue) =>
                    $shaclPropertyFromRdf({
                      graph: $parameters.graph,
                      resource: $parameters.resource,
                      propertySchema: $schema.properties.export_,
                      typeFromRdf: (resourceValues) =>
                        resourceValues
                          .chain((values) =>
                            values.chainMap((value) => value.toBoolean()),
                          )
                          .map((values) =>
                            values.length > 0
                              ? values.map((value) => Maybe.of(value))
                              : Resource.Values.fromValue<Maybe<boolean>>({
                                  focusResource: $parameters.resource,
                                  propertyPath:
                                    ShaclmateNodeShape.$schema.properties
                                      .export_.path,
                                  value: Maybe.empty(),
                                }),
                          ),
                    }).chain((export_) =>
                      $shaclPropertyFromRdf({
                        graph: $parameters.graph,
                        resource: $parameters.resource,
                        propertySchema: $schema.properties.extern,
                        typeFromRdf: (resourceValues) =>
                          resourceValues
                            .chain((values) =>
                              values.chainMap((value) => value.toBoolean()),
                            )
                            .map((values) =>
                              values.length > 0
                                ? values.map((value) => Maybe.of(value))
                                : Resource.Values.fromValue<Maybe<boolean>>({
                                    focusResource: $parameters.resource,
                                    propertyPath:
                                      ShaclmateNodeShape.$schema.properties
                                        .extern.path,
                                    value: Maybe.empty(),
                                  }),
                            ),
                      }).chain((extern) =>
                        $shaclPropertyFromRdf({
                          graph: $parameters.graph,
                          resource: $parameters.resource,
                          propertySchema: $schema.properties.fromRdfType,
                          typeFromRdf: (resourceValues) =>
                            resourceValues
                              .chain((values) =>
                                values.chainMap((value) => value.toIri()),
                              )
                              .map((values) =>
                                values.length > 0
                                  ? values.map((value) => Maybe.of(value))
                                  : Resource.Values.fromValue<Maybe<NamedNode>>(
                                      {
                                        focusResource: $parameters.resource,
                                        propertyPath:
                                          ShaclmateNodeShape.$schema.properties
                                            .fromRdfType.path,
                                        value: Maybe.empty(),
                                      },
                                    ),
                              ),
                        }).chain((fromRdfType) =>
                          $shaclPropertyFromRdf({
                            graph: $parameters.graph,
                            resource: $parameters.resource,
                            propertySchema:
                              $schema.properties.identifierMintingStrategy,
                            typeFromRdf: (resourceValues) =>
                              resourceValues
                                .chain((values) =>
                                  values.chainMap((value) =>
                                    value.toIri([
                                      dataFactory.namedNode(
                                        "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode",
                                      ),
                                      dataFactory.namedNode(
                                        "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256",
                                      ),
                                      dataFactory.namedNode(
                                        "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4",
                                      ),
                                    ]),
                                  ),
                                )
                                .map((values) =>
                                  values.length > 0
                                    ? values.map((value) => Maybe.of(value))
                                    : Resource.Values.fromValue<
                                        Maybe<
                                          NamedNode<
                                            | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                                            | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                                            | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                                          >
                                        >
                                      >({
                                        focusResource: $parameters.resource,
                                        propertyPath:
                                          ShaclmateNodeShape.$schema.properties
                                            .identifierMintingStrategy.path,
                                        value: Maybe.empty(),
                                      }),
                                ),
                          }).chain((identifierMintingStrategy) =>
                            $shaclPropertyFromRdf({
                              graph: $parameters.graph,
                              resource: $parameters.resource,
                              propertySchema: $schema.properties.mutable,
                              typeFromRdf: (resourceValues) =>
                                resourceValues
                                  .chain((values) =>
                                    values.chainMap((value) =>
                                      value.toBoolean(),
                                    ),
                                  )
                                  .map((values) =>
                                    values.length > 0
                                      ? values.map((value) => Maybe.of(value))
                                      : Resource.Values.fromValue<
                                          Maybe<boolean>
                                        >({
                                          focusResource: $parameters.resource,
                                          propertyPath:
                                            ShaclmatePropertyShape.$schema
                                              .properties.mutable.path,
                                          value: Maybe.empty(),
                                        }),
                                  ),
                            }).chain((mutable) =>
                              $shaclPropertyFromRdf({
                                graph: $parameters.graph,
                                resource: $parameters.resource,
                                propertySchema: $schema.properties.name,
                                typeFromRdf: (resourceValues) =>
                                  resourceValues
                                    .chain((values) =>
                                      $fromRdfPreferredLanguages(
                                        values,
                                        $parameters.preferredLanguages,
                                      ),
                                    )
                                    .chain((values) =>
                                      values.chainMap((value) =>
                                        value.toString(),
                                      ),
                                    )
                                    .map((values) =>
                                      values.length > 0
                                        ? values.map((value) => Maybe.of(value))
                                        : Resource.Values.fromValue<
                                            Maybe<string>
                                          >({
                                            focusResource: $parameters.resource,
                                            propertyPath:
                                              ShaclmatePropertyShape.$schema
                                                .properties.name.path,
                                            value: Maybe.empty(),
                                          }),
                                    ),
                              }).chain((name) =>
                                $shaclPropertyFromRdf({
                                  graph: $parameters.graph,
                                  resource: $parameters.resource,
                                  propertySchema: $schema.properties.rdfType,
                                  typeFromRdf: (resourceValues) =>
                                    resourceValues
                                      .chain((values) =>
                                        values.chainMap((value) =>
                                          value.toIri(),
                                        ),
                                      )
                                      .map((values) =>
                                        values.length > 0
                                          ? values.map((value) =>
                                              Maybe.of(value),
                                            )
                                          : Resource.Values.fromValue<
                                              Maybe<NamedNode>
                                            >({
                                              focusResource:
                                                $parameters.resource,
                                              propertyPath:
                                                ShaclmateNodeShape.$schema
                                                  .properties.rdfType.path,
                                              value: Maybe.empty(),
                                            }),
                                      ),
                                }).chain((rdfType) =>
                                  $shaclPropertyFromRdf({
                                    graph: $parameters.graph,
                                    resource: $parameters.resource,
                                    propertySchema:
                                      $schema.properties.toRdfTypes,
                                    typeFromRdf: (resourceValues) =>
                                      resourceValues
                                        .chain((values) =>
                                          values.chainMap((value) =>
                                            value.toIri(),
                                          ),
                                        )
                                        .map((values) => values.toArray())
                                        .map((valuesArray) =>
                                          Resource.Values.fromValue({
                                            focusResource: $parameters.resource,
                                            propertyPath:
                                              ShaclmateNodeShape.$schema
                                                .properties.toRdfTypes.path,
                                            value: valuesArray,
                                          }),
                                        ),
                                  }).chain((toRdfTypes) =>
                                    $shaclPropertyFromRdf({
                                      graph: $parameters.graph,
                                      resource: $parameters.resource,
                                      propertySchema:
                                        $schema.properties.tsFeatureExcludes,
                                      typeFromRdf: (resourceValues) =>
                                        resourceValues
                                          .chain((values) =>
                                            values.chainMap((value) =>
                                              value.toIri([
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeatures_All",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeature_Create",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeatures_Default",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeature_Equals",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeature_Graphql",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeature_Hash",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeature_Json",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeatures_None",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeature_Rdf",
                                                ),
                                                dataFactory.namedNode(
                                                  "http://purl.org/shaclmate/ontology#_TsFeature_Sparql",
                                                ),
                                              ]),
                                            ),
                                          )
                                          .map((values) => values.toArray())
                                          .map((valuesArray) =>
                                            Resource.Values.fromValue({
                                              focusResource:
                                                $parameters.resource,
                                              propertyPath:
                                                ShaclmateOntology.$schema
                                                  .properties.tsFeatureExcludes
                                                  .path,
                                              value: valuesArray,
                                            }),
                                          ),
                                    }).chain((tsFeatureExcludes) =>
                                      $shaclPropertyFromRdf({
                                        graph: $parameters.graph,
                                        resource: $parameters.resource,
                                        propertySchema:
                                          $schema.properties.tsFeatureIncludes,
                                        typeFromRdf: (resourceValues) =>
                                          resourceValues
                                            .chain((values) =>
                                              values.chainMap((value) =>
                                                value.toIri([
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeatures_All",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeature_Create",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeatures_Default",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeature_Equals",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeature_Graphql",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeature_Hash",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeature_Json",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeatures_None",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeature_Rdf",
                                                  ),
                                                  dataFactory.namedNode(
                                                    "http://purl.org/shaclmate/ontology#_TsFeature_Sparql",
                                                  ),
                                                ]),
                                              ),
                                            )
                                            .map((values) => values.toArray())
                                            .map((valuesArray) =>
                                              Resource.Values.fromValue({
                                                focusResource:
                                                  $parameters.resource,
                                                propertyPath:
                                                  ShaclmateOntology.$schema
                                                    .properties
                                                    .tsFeatureIncludes.path,
                                                value: valuesArray,
                                              }),
                                            ),
                                      }).chain((tsFeatureIncludes) =>
                                        $shaclPropertyFromRdf({
                                          graph: $parameters.graph,
                                          resource: $parameters.resource,
                                          propertySchema:
                                            $schema.properties.tsImports,
                                          typeFromRdf: (resourceValues) =>
                                            resourceValues
                                              .chain((values) =>
                                                $fromRdfPreferredLanguages(
                                                  values,
                                                  $parameters.preferredLanguages,
                                                ),
                                              )
                                              .chain((values) =>
                                                values.chainMap((value) =>
                                                  value.toString(),
                                                ),
                                              )
                                              .map((values) => values.toArray())
                                              .map((valuesArray) =>
                                                Resource.Values.fromValue({
                                                  focusResource:
                                                    $parameters.resource,
                                                  propertyPath:
                                                    ShaclmateOntology.$schema
                                                      .properties.tsImports
                                                      .path,
                                                  value: valuesArray,
                                                }),
                                              ),
                                        }).chain((tsImports) =>
                                          $shaclPropertyFromRdf({
                                            graph: $parameters.graph,
                                            resource: $parameters.resource,
                                            propertySchema:
                                              $schema.properties
                                                .tsObjectDeclarationType,
                                            typeFromRdf: (resourceValues) =>
                                              resourceValues
                                                .chain((values) =>
                                                  values.chainMap((value) =>
                                                    value.toIri([
                                                      dataFactory.namedNode(
                                                        "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class",
                                                      ),
                                                      dataFactory.namedNode(
                                                        "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface",
                                                      ),
                                                    ]),
                                                  ),
                                                )
                                                .map((values) =>
                                                  values.length > 0
                                                    ? values.map((value) =>
                                                        Maybe.of(value),
                                                      )
                                                    : Resource.Values.fromValue<
                                                        Maybe<
                                                          NamedNode<
                                                            | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                                            | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                                          >
                                                        >
                                                      >({
                                                        focusResource:
                                                          $parameters.resource,
                                                        propertyPath:
                                                          ShaclmateOntology
                                                            .$schema.properties
                                                            .tsObjectDeclarationType
                                                            .path,
                                                        value: Maybe.empty(),
                                                      }),
                                                ),
                                          }).map((tsObjectDeclarationType) => ({
                                            ...$super0,
                                            $identifier,
                                            $type,
                                            abstract,
                                            discriminantValue,
                                            export_,
                                            extern,
                                            fromRdfType,
                                            identifierMintingStrategy,
                                            mutable,
                                            name,
                                            rdfType,
                                            toRdfTypes,
                                            tsFeatureExcludes,
                                            tsFeatureIncludes,
                                            tsImports,
                                            tsObjectDeclarationType,
                                          })),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ),
          ),
      ),
    );
  }

  export function $toRdf(
    _shaclmateNodeShape: ShaclmateNodeShape,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = ShaclCoreNodeShapeStatic.$toRdf(_shaclmateNodeShape, {
      ignoreRdfType: true,
      graph: options?.graph,
      resourceSet,
    });
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#abstract"),
      _shaclmateNodeShape.abstract
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#discriminantValue",
      ),
      _shaclmateNodeShape.discriminantValue
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#export"),
      _shaclmateNodeShape.export_
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
      _shaclmateNodeShape.extern
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#fromRdfType"),
      _shaclmateNodeShape.fromRdfType.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
      ),
      _shaclmateNodeShape.identifierMintingStrategy.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
      _shaclmateNodeShape.mutable
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      _shaclmateNodeShape.name
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#rdfType"),
      _shaclmateNodeShape.rdfType.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#toRdfType"),
      _shaclmateNodeShape.toRdfTypes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
      _shaclmateNodeShape.tsFeatureExcludes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
      _shaclmateNodeShape.tsFeatureIncludes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
      _shaclmateNodeShape.tsImports.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
      _shaclmateNodeShape.tsObjectDeclarationType.toList(),
      options?.graph,
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...ShaclCoreNodeShapeStatic.$schema.properties,
      abstract: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#abstract",
        ),
      },
      discriminantValue: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#discriminantValue",
        ),
      },
      export_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#export",
        ),
      },
      extern: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#extern",
        ),
      },
      fromRdfType: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#fromRdfType",
        ),
      },
      identifierMintingStrategy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4",
              ),
            ],
          }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
        ),
      },
      mutable: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#mutable",
        ),
      },
      name: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      },
      rdfType: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#rdfType",
        ),
      },
      toRdfTypes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#toRdfType",
        ),
      },
      tsFeatureExcludes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_All",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Create",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_Default",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Equals",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Graphql",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Hash",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Json",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_None",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Rdf",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Sparql",
              ),
            ],
          }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsFeatureExclude",
        ),
      },
      tsFeatureIncludes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_All",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Create",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_Default",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Equals",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Graphql",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Hash",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Json",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeatures_None",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Rdf",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsFeature_Sparql",
              ),
            ],
          }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsFeatureInclude",
        ),
      },
      tsImports: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsImport",
        ),
      },
      tsObjectDeclarationType: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface",
              ),
            ],
          }),
        }),
        path: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
        ),
      },
    },
  } as const;
}
export interface ShaclCorePropertyGroup {
  readonly $identifier: ShaclCorePropertyGroup.$Identifier;
  readonly $type: "ShaclCorePropertyGroup";
  readonly comments: readonly string[];
  readonly labels: readonly string[];
}

export namespace ShaclCorePropertyGroup {
  export function $filter(
    filter: ShaclCorePropertyGroup.$Filter,
    value: ShaclCorePropertyGroup,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      filter.comments !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.comments,
        value.comments,
      )
    ) {
      return false;
    }
    if (
      filter.labels !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.labels,
        value.labels,
      )
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly comments?: $CollectionFilter<$StringFilter>;
    readonly labels?: $CollectionFilter<$StringFilter>;
  };

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyGroup",
  );

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isShaclCorePropertyGroup(
    object: $Object,
  ): object is ShaclCorePropertyGroup {
    switch (object.$type) {
      case "ShaclCorePropertyGroup":
        return true;
      default:
        return false;
    }
  }

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclCorePropertyGroup> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return ShaclCorePropertyGroup.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf(
    $parameters: $PropertiesFromRdfParameters,
  ): Either<
    Error,
    {
      $identifier: BlankNode | NamedNode;
      $type: "ShaclCorePropertyGroup";
      comments: readonly string[];
      labels: readonly string[];
    }
  > {
    return (
      !$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type, { graph: $parameters.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyGroup":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCorePropertyGroup.$fromRdfType,
                  { graph: $parameters.graph },
                )
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
                ),
              );
            })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      Right(
        new Resource.Value({
          dataFactory: dataFactory,
          focusResource: $parameters.resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          term: $parameters.resource.identifier,
        }).toValues(),
      )
        .chain((values) => values.chainMap((value) => value.toIdentifier()))
        .chain((values) => values.head())
        .chain(($identifier) =>
          Right<"ShaclCorePropertyGroup">(
            "ShaclCorePropertyGroup" as const,
          ).chain(($type) =>
            $shaclPropertyFromRdf({
              graph: $parameters.graph,
              resource: $parameters.resource,
              propertySchema: $schema.properties.comments,
              typeFromRdf: (resourceValues) =>
                resourceValues
                  .chain((values) =>
                    $fromRdfPreferredLanguages(
                      values,
                      $parameters.preferredLanguages,
                    ),
                  )
                  .chain((values) =>
                    values.chainMap((value) => value.toString()),
                  )
                  .map((values) => values.toArray())
                  .map((valuesArray) =>
                    Resource.Values.fromValue({
                      focusResource: $parameters.resource,
                      propertyPath:
                        ShaclCorePropertyGroup.$schema.properties.comments.path,
                      value: valuesArray,
                    }),
                  ),
            }).chain((comments) =>
              $shaclPropertyFromRdf({
                graph: $parameters.graph,
                resource: $parameters.resource,
                propertySchema: $schema.properties.labels,
                typeFromRdf: (resourceValues) =>
                  resourceValues
                    .chain((values) =>
                      $fromRdfPreferredLanguages(
                        values,
                        $parameters.preferredLanguages,
                      ),
                    )
                    .chain((values) =>
                      values.chainMap((value) => value.toString()),
                    )
                    .map((values) => values.toArray())
                    .map((valuesArray) =>
                      Resource.Values.fromValue({
                        focusResource: $parameters.resource,
                        propertyPath:
                          ShaclCorePropertyGroup.$schema.properties.labels.path,
                        value: valuesArray,
                      }),
                    ),
              }).map((labels) => ({ $identifier, $type, comments, labels })),
            ),
          ),
        ),
    );
  }

  export function $toRdf(
    _shaclCorePropertyGroup: ShaclCorePropertyGroup,
    options?: {
      ignoreRdfType?: boolean;
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_shaclCorePropertyGroup.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyGroup"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      _shaclCorePropertyGroup.comments.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _shaclCorePropertyGroup.labels.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    return resource;
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "TypeDiscriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["ShaclCorePropertyGroup"],
        }),
      },
      comments: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
    },
  } as const;
}
export type ShaclCoreShape = ShaclCoreNodeShape | ShaclCorePropertyShape;

export namespace ShaclCoreShape {
  export function $filter(
    filter: ShaclCoreShape.$Filter,
    value: ShaclCoreShape,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      ShaclCoreNodeShapeStatic.isShaclCoreNodeShape(value) &&
      filter.on?.ShaclCoreNodeShape &&
      !ShaclCoreNodeShapeStatic.$filter(
        filter.on.ShaclCoreNodeShape,
        value as ShaclCoreNodeShape,
      )
    ) {
      return false;
    }
    if (
      ShaclCorePropertyShapeStatic.isShaclCorePropertyShape(value) &&
      filter.on?.ShaclCorePropertyShape &&
      !ShaclCorePropertyShapeStatic.$filter(
        filter.on.ShaclCorePropertyShape,
        value as ShaclCorePropertyShape,
      )
    ) {
      return false;
    }
    return true;
  }

  export interface $Filter {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly ShaclCoreNodeShape?: Omit<
        ShaclCoreNodeShapeStatic.$Filter,
        "$identifier"
      >;
      readonly ShaclCorePropertyShape?: Omit<
        ShaclCorePropertyShapeStatic.$Filter,
        "$identifier"
      >;
    };
  }

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isShaclCoreShape(object: $Object): object is ShaclCoreShape {
    return (
      ShaclCoreNodeShapeStatic.isShaclCoreNodeShape(object) ||
      ShaclCorePropertyShapeStatic.isShaclCorePropertyShape(object)
    );
  }

  export const $schema = {
    properties: {
      and: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comments: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      },
      deactivated: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      },
      in_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Term" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "String" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      },
      maxCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      },
      maxExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      },
      maxInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      },
      maxLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      },
      minCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      },
      minExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      },
      minInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      },
      minLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      },
      nodeKind: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
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
            ],
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      },
      nodes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      not: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      xone: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclCoreShape> {
    return (
      ShaclCoreNodeShapeStatic.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, ShaclCoreShape>
    ).altLazy(
      () =>
        ShaclCorePropertyShapeStatic.$fromRdf(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, ShaclCoreShape>,
    );
  }

  export function $toRdf(
    _shaclCoreShape: ShaclCoreShape,
    _parameters?: {
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    if (ShaclCoreNodeShapeStatic.isShaclCoreNodeShape(_shaclCoreShape)) {
      return ShaclCoreNodeShapeStatic.$toRdf(_shaclCoreShape, _parameters);
    }
    if (
      ShaclCorePropertyShapeStatic.isShaclCorePropertyShape(_shaclCoreShape)
    ) {
      return ShaclCorePropertyShapeStatic.$toRdf(_shaclCoreShape, _parameters);
    }
    throw new Error("unrecognized type");
  }
}
export type ShaclmateShape = ShaclmateNodeShape | ShaclCorePropertyShape;

export namespace ShaclmateShape {
  export function $filter(
    filter: ShaclmateShape.$Filter,
    value: ShaclmateShape,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      ShaclmateNodeShape.isShaclmateNodeShape(value) &&
      filter.on?.ShaclmateNodeShape &&
      !ShaclmateNodeShape.$filter(
        filter.on.ShaclmateNodeShape,
        value as ShaclmateNodeShape,
      )
    ) {
      return false;
    }
    if (
      ShaclCorePropertyShapeStatic.isShaclCorePropertyShape(value) &&
      filter.on?.ShaclCorePropertyShape &&
      !ShaclCorePropertyShapeStatic.$filter(
        filter.on.ShaclCorePropertyShape,
        value as ShaclCorePropertyShape,
      )
    ) {
      return false;
    }
    return true;
  }

  export interface $Filter {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly ShaclmateNodeShape?: Omit<
        ShaclmateNodeShape.$Filter,
        "$identifier"
      >;
      readonly ShaclCorePropertyShape?: Omit<
        ShaclCorePropertyShapeStatic.$Filter,
        "$identifier"
      >;
    };
  }

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function isShaclmateShape(object: $Object): object is ShaclmateShape {
    return (
      ShaclmateNodeShape.isShaclmateNodeShape(object) ||
      ShaclCorePropertyShapeStatic.isShaclCorePropertyShape(object)
    );
  }

  export const $schema = {
    properties: {
      and: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comments: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Iri" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      },
      deactivated: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      },
      in_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Term" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "String" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      },
      maxCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      },
      maxExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      },
      maxInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      },
      maxLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      },
      minCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      },
      minExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      },
      minInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      },
      minLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      },
      nodeKind: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "Iri" as const,
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
            ],
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      },
      nodes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      not: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      xone: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "Identifier" as const }),
          }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclmateShape> {
    return (
      ShaclmateNodeShape.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, ShaclmateShape>
    ).altLazy(
      () =>
        ShaclCorePropertyShapeStatic.$fromRdf(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, ShaclmateShape>,
    );
  }

  export function $toRdf(
    _shaclmateShape: ShaclmateShape,
    _parameters?: {
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    if (ShaclmateNodeShape.isShaclmateNodeShape(_shaclmateShape)) {
      return ShaclmateNodeShape.$toRdf(_shaclmateShape, _parameters);
    }
    if (
      ShaclCorePropertyShapeStatic.isShaclCorePropertyShape(_shaclmateShape)
    ) {
      return ShaclCorePropertyShapeStatic.$toRdf(_shaclmateShape, _parameters);
    }
    throw new Error("unrecognized type");
  }
}
export type $Object =
  | ShaclCorePropertyGroup
  | ShaclmateNodeShape
  | ShaclCoreNodeShape
  | ShaclmateOntology
  | OwlOntology
  | ShaclmatePropertyShape
  | ShaclCorePropertyShape
  | BaseShaclCoreShape;

export namespace $Object {
  export function $filter(filter: $Object.$Filter, value: $Object): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      ShaclCorePropertyGroup.isShaclCorePropertyGroup(value) &&
      filter.on?.ShaclCorePropertyGroup &&
      !ShaclCorePropertyGroup.$filter(
        filter.on.ShaclCorePropertyGroup,
        value as ShaclCorePropertyGroup,
      )
    ) {
      return false;
    }
    if (
      ShaclmateNodeShape.isShaclmateNodeShape(value) &&
      filter.on?.ShaclmateNodeShape &&
      !ShaclmateNodeShape.$filter(
        filter.on.ShaclmateNodeShape,
        value as ShaclmateNodeShape,
      )
    ) {
      return false;
    }
    if (
      ShaclCoreNodeShapeStatic.isShaclCoreNodeShape(value) &&
      filter.on?.ShaclCoreNodeShape &&
      !ShaclCoreNodeShapeStatic.$filter(
        filter.on.ShaclCoreNodeShape,
        value as ShaclCoreNodeShape,
      )
    ) {
      return false;
    }
    if (
      ShaclmateOntology.isShaclmateOntology(value) &&
      filter.on?.ShaclmateOntology &&
      !ShaclmateOntology.$filter(
        filter.on.ShaclmateOntology,
        value as ShaclmateOntology,
      )
    ) {
      return false;
    }
    if (
      OwlOntologyStatic.isOwlOntology(value) &&
      filter.on?.OwlOntology &&
      !OwlOntologyStatic.$filter(filter.on.OwlOntology, value as OwlOntology)
    ) {
      return false;
    }
    if (
      ShaclmatePropertyShape.isShaclmatePropertyShape(value) &&
      filter.on?.ShaclmatePropertyShape &&
      !ShaclmatePropertyShape.$filter(
        filter.on.ShaclmatePropertyShape,
        value as ShaclmatePropertyShape,
      )
    ) {
      return false;
    }
    if (
      ShaclCorePropertyShapeStatic.isShaclCorePropertyShape(value) &&
      filter.on?.ShaclCorePropertyShape &&
      !ShaclCorePropertyShapeStatic.$filter(
        filter.on.ShaclCorePropertyShape,
        value as ShaclCorePropertyShape,
      )
    ) {
      return false;
    }
    if (
      BaseShaclCoreShapeStatic.isBaseShaclCoreShape(value) &&
      filter.on?.BaseShaclCoreShape &&
      !BaseShaclCoreShapeStatic.$filter(
        filter.on.BaseShaclCoreShape,
        value as BaseShaclCoreShape,
      )
    ) {
      return false;
    }
    return true;
  }

  export interface $Filter {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly ShaclCorePropertyGroup?: Omit<
        ShaclCorePropertyGroup.$Filter,
        "$identifier"
      >;
      readonly ShaclmateNodeShape?: Omit<
        ShaclmateNodeShape.$Filter,
        "$identifier"
      >;
      readonly ShaclCoreNodeShape?: Omit<
        ShaclCoreNodeShapeStatic.$Filter,
        "$identifier"
      >;
      readonly ShaclmateOntology?: Omit<
        ShaclmateOntology.$Filter,
        "$identifier"
      >;
      readonly OwlOntology?: Omit<OwlOntologyStatic.$Filter, "$identifier">;
      readonly ShaclmatePropertyShape?: Omit<
        ShaclmatePropertyShape.$Filter,
        "$identifier"
      >;
      readonly ShaclCorePropertyShape?: Omit<
        ShaclCorePropertyShapeStatic.$Filter,
        "$identifier"
      >;
      readonly BaseShaclCoreShape?: Omit<
        BaseShaclCoreShapeStatic.$Filter,
        "$identifier"
      >;
    };
  }

  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export const $schema = {
    properties: {
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
    },
  } as const;

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, $Object> {
    return (
      ShaclCorePropertyGroup.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, $Object>
    )
      .altLazy(
        () =>
          ShaclmateNodeShape.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          ShaclCoreNodeShapeStatic.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          ShaclmateOntology.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          OwlOntologyStatic.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          ShaclmatePropertyShape.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          ShaclCorePropertyShapeStatic.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      );
  }

  export function $toRdf(
    _object: $Object,
    _parameters?: {
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    },
  ): Resource {
    if (ShaclCorePropertyGroup.isShaclCorePropertyGroup(_object)) {
      return ShaclCorePropertyGroup.$toRdf(_object, _parameters);
    }
    if (ShaclmateNodeShape.isShaclmateNodeShape(_object)) {
      return ShaclmateNodeShape.$toRdf(_object, _parameters);
    }
    if (ShaclCoreNodeShapeStatic.isShaclCoreNodeShape(_object)) {
      return ShaclCoreNodeShapeStatic.$toRdf(_object, _parameters);
    }
    if (ShaclmateOntology.isShaclmateOntology(_object)) {
      return ShaclmateOntology.$toRdf(_object, _parameters);
    }
    if (OwlOntologyStatic.isOwlOntology(_object)) {
      return OwlOntologyStatic.$toRdf(_object, _parameters);
    }
    if (ShaclmatePropertyShape.isShaclmatePropertyShape(_object)) {
      return ShaclmatePropertyShape.$toRdf(_object, _parameters);
    }
    if (ShaclCorePropertyShapeStatic.isShaclCorePropertyShape(_object)) {
      return ShaclCorePropertyShapeStatic.$toRdf(_object, _parameters);
    }
    throw new Error("unrecognized type");
  }
}
export interface $ObjectSet {
  owlOntology(
    identifier: OwlOntologyStatic.$Identifier,
  ): Promise<Either<Error, OwlOntology>>;

  owlOntologyCount(
    query?: Pick<
      $ObjectSet.Query<
        OwlOntologyStatic.$Filter,
        OwlOntologyStatic.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<
      OwlOntologyStatic.$Filter,
      OwlOntologyStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly OwlOntologyStatic.$Identifier[]>>;

  owlOntologies(
    query?: $ObjectSet.Query<
      OwlOntologyStatic.$Filter,
      OwlOntologyStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly OwlOntology[]>>;

  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShapeStatic.$Identifier,
  ): Promise<Either<Error, ShaclCoreNodeShape>>;

  shaclCoreNodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCoreNodeShapeStatic.$Filter,
        ShaclCoreNodeShapeStatic.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShapeStatic.$Filter,
      ShaclCoreNodeShapeStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]>>;

  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShapeStatic.$Filter,
      ShaclCoreNodeShapeStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreNodeShape[]>>;

  shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyGroup>>;

  shaclCorePropertyGroupCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyGroup.$Filter,
        ShaclCorePropertyGroup.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCorePropertyGroup.$Filter,
      ShaclCorePropertyGroup.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>>;

  shaclCorePropertyGroups(
    query?: $ObjectSet.Query<
      ShaclCorePropertyGroup.$Filter,
      ShaclCorePropertyGroup.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyGroup[]>>;

  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShapeStatic.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyShape>>;

  shaclCorePropertyShapeCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyShapeStatic.$Filter,
        ShaclCorePropertyShapeStatic.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShapeStatic.$Filter,
      ShaclCorePropertyShapeStatic.$Identifier
    >,
  ): Promise<
    Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]>
  >;

  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShapeStatic.$Filter,
      ShaclCorePropertyShapeStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyShape[]>>;

  shaclmateNodeShape(
    identifier: ShaclmateNodeShape.$Identifier,
  ): Promise<Either<Error, ShaclmateNodeShape>>;

  shaclmateNodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmateNodeShape.$Filter,
        ShaclmateNodeShape.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclmateNodeShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclmateNodeShape.$Filter,
      ShaclmateNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateNodeShape.$Identifier[]>>;

  shaclmateNodeShapes(
    query?: $ObjectSet.Query<
      ShaclmateNodeShape.$Filter,
      ShaclmateNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateNodeShape[]>>;

  shaclmateOntology(
    identifier: ShaclmateOntology.$Identifier,
  ): Promise<Either<Error, ShaclmateOntology>>;

  shaclmateOntologyCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmateOntology.$Filter,
        ShaclmateOntology.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclmateOntologyIdentifiers(
    query?: $ObjectSet.Query<
      ShaclmateOntology.$Filter,
      ShaclmateOntology.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateOntology.$Identifier[]>>;

  shaclmateOntologies(
    query?: $ObjectSet.Query<
      ShaclmateOntology.$Filter,
      ShaclmateOntology.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateOntology[]>>;

  shaclmatePropertyShape(
    identifier: ShaclmatePropertyShape.$Identifier,
  ): Promise<Either<Error, ShaclmatePropertyShape>>;

  shaclmatePropertyShapeCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmatePropertyShape.$Filter,
        ShaclmatePropertyShape.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclmatePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclmatePropertyShape.$Filter,
      ShaclmatePropertyShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmatePropertyShape.$Identifier[]>>;

  shaclmatePropertyShapes(
    query?: $ObjectSet.Query<
      ShaclmatePropertyShape.$Filter,
      ShaclmatePropertyShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmatePropertyShape[]>>;

  shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<Either<Error, ShaclCoreShape>>;

  shaclCoreShapeCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreShape.$Filter, ShaclCoreShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCoreShape.$Filter,
      ShaclCoreShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreShape.$Identifier[]>>;

  shaclCoreShapes(
    query?: $ObjectSet.Query<
      ShaclCoreShape.$Filter,
      ShaclCoreShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreShape[]>>;

  shaclmateShape(
    identifier: ShaclmateShape.$Identifier,
  ): Promise<Either<Error, ShaclmateShape>>;

  shaclmateShapeCount(
    query?: Pick<
      $ObjectSet.Query<ShaclmateShape.$Filter, ShaclmateShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclmateShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclmateShape.$Filter,
      ShaclmateShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateShape.$Identifier[]>>;

  shaclmateShapes(
    query?: $ObjectSet.Query<
      ShaclmateShape.$Filter,
      ShaclmateShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateShape[]>>;

  object(identifier: $Object.$Identifier): Promise<Either<Error, $Object>>;

  objectCount(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object.$Identifier[]>>;

  objects(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object[]>>;
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
  }
}
export class $RdfjsDatasetObjectSet implements $ObjectSet {
  protected readonly $graph?: Exclude<Quad_Graph, Variable>;
  readonly #dataset: DatasetCore | (() => DatasetCore);

  constructor(
    dataset: DatasetCore | (() => DatasetCore),
    options?: { graph?: Exclude<Quad_Graph, Variable> },
  ) {
    this.#dataset = dataset;
    this.$graph = options?.graph;
  }

  protected $dataset(): DatasetCore {
    if (typeof this.#dataset === "object") {
      return this.#dataset;
    }
    return this.#dataset();
  }

  protected $resourceSet(): ResourceSet {
    return new ResourceSet(this.$dataset(), { dataFactory: dataFactory });
  }

  async owlOntology(
    identifier: OwlOntologyStatic.$Identifier,
  ): Promise<Either<Error, OwlOntology>> {
    return this.owlOntologySync(identifier);
  }

  owlOntologySync(
    identifier: OwlOntologyStatic.$Identifier,
  ): Either<Error, OwlOntology> {
    return this.owlOntologiesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async owlOntologyCount(
    query?: Pick<
      $ObjectSet.Query<
        OwlOntologyStatic.$Filter,
        OwlOntologyStatic.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.owlOntologyCountSync(query);
  }

  owlOntologyCountSync(
    query?: Pick<
      $ObjectSet.Query<
        OwlOntologyStatic.$Filter,
        OwlOntologyStatic.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.owlOntologiesSync(query).map((objects) => objects.length);
  }

  async owlOntologyIdentifiers(
    query?: $ObjectSet.Query<
      OwlOntologyStatic.$Filter,
      OwlOntologyStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly OwlOntologyStatic.$Identifier[]>> {
    return this.owlOntologyIdentifiersSync(query);
  }

  owlOntologyIdentifiersSync(
    query?: $ObjectSet.Query<
      OwlOntologyStatic.$Filter,
      OwlOntologyStatic.$Identifier
    >,
  ): Either<Error, readonly OwlOntologyStatic.$Identifier[]> {
    return this.owlOntologiesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async owlOntologies(
    query?: $ObjectSet.Query<
      OwlOntologyStatic.$Filter,
      OwlOntologyStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly OwlOntology[]>> {
    return this.owlOntologiesSync(query);
  }

  owlOntologiesSync(
    query?: $ObjectSet.Query<
      OwlOntologyStatic.$Filter,
      OwlOntologyStatic.$Identifier
    >,
  ): Either<Error, readonly OwlOntology[]> {
    return this.$objectsSync<
      OwlOntology,
      OwlOntologyStatic.$Filter,
      OwlOntologyStatic.$Identifier
    >(
      {
        $filter: OwlOntologyStatic.$filter,
        $fromRdf: OwlOntologyStatic.$fromRdf,
        $fromRdfTypes: [
          OwlOntologyStatic.$fromRdfType,
          ShaclmateOntology.$fromRdfType,
        ],
      },
      query,
    );
  }

  async shaclCoreNodeShape(
    identifier: ShaclCoreNodeShapeStatic.$Identifier,
  ): Promise<Either<Error, ShaclCoreNodeShape>> {
    return this.shaclCoreNodeShapeSync(identifier);
  }

  shaclCoreNodeShapeSync(
    identifier: ShaclCoreNodeShapeStatic.$Identifier,
  ): Either<Error, ShaclCoreNodeShape> {
    return this.shaclCoreNodeShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclCoreNodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCoreNodeShapeStatic.$Filter,
        ShaclCoreNodeShapeStatic.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCoreNodeShapeCountSync(query);
  }

  shaclCoreNodeShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCoreNodeShapeStatic.$Filter,
        ShaclCoreNodeShapeStatic.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclCoreNodeShapesSync(query).map((objects) => objects.length);
  }

  async shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShapeStatic.$Filter,
      ShaclCoreNodeShapeStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]>> {
    return this.shaclCoreNodeShapeIdentifiersSync(query);
  }

  shaclCoreNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShapeStatic.$Filter,
      ShaclCoreNodeShapeStatic.$Identifier
    >,
  ): Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]> {
    return this.shaclCoreNodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCoreNodeShapes(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShapeStatic.$Filter,
      ShaclCoreNodeShapeStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreNodeShape[]>> {
    return this.shaclCoreNodeShapesSync(query);
  }

  shaclCoreNodeShapesSync(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShapeStatic.$Filter,
      ShaclCoreNodeShapeStatic.$Identifier
    >,
  ): Either<Error, readonly ShaclCoreNodeShape[]> {
    return this.$objectsSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShapeStatic.$Filter,
      ShaclCoreNodeShapeStatic.$Identifier
    >(
      {
        $filter: ShaclCoreNodeShapeStatic.$filter,
        $fromRdf: ShaclCoreNodeShapeStatic.$fromRdf,
        $fromRdfTypes: [
          ShaclCoreNodeShapeStatic.$fromRdfType,
          ShaclmateNodeShape.$fromRdfType,
        ],
      },
      query,
    );
  }

  async shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyGroup>> {
    return this.shaclCorePropertyGroupSync(identifier);
  }

  shaclCorePropertyGroupSync(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Either<Error, ShaclCorePropertyGroup> {
    return this.shaclCorePropertyGroupsSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclCorePropertyGroupCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyGroup.$Filter,
        ShaclCorePropertyGroup.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCorePropertyGroupCountSync(query);
  }

  shaclCorePropertyGroupCountSync(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyGroup.$Filter,
        ShaclCorePropertyGroup.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclCorePropertyGroupsSync(query).map(
      (objects) => objects.length,
    );
  }

  async shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCorePropertyGroup.$Filter,
      ShaclCorePropertyGroup.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>> {
    return this.shaclCorePropertyGroupIdentifiersSync(query);
  }

  shaclCorePropertyGroupIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclCorePropertyGroup.$Filter,
      ShaclCorePropertyGroup.$Identifier
    >,
  ): Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]> {
    return this.shaclCorePropertyGroupsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCorePropertyGroups(
    query?: $ObjectSet.Query<
      ShaclCorePropertyGroup.$Filter,
      ShaclCorePropertyGroup.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyGroup[]>> {
    return this.shaclCorePropertyGroupsSync(query);
  }

  shaclCorePropertyGroupsSync(
    query?: $ObjectSet.Query<
      ShaclCorePropertyGroup.$Filter,
      ShaclCorePropertyGroup.$Identifier
    >,
  ): Either<Error, readonly ShaclCorePropertyGroup[]> {
    return this.$objectsSync<
      ShaclCorePropertyGroup,
      ShaclCorePropertyGroup.$Filter,
      ShaclCorePropertyGroup.$Identifier
    >(
      {
        $filter: ShaclCorePropertyGroup.$filter,
        $fromRdf: ShaclCorePropertyGroup.$fromRdf,
        $fromRdfTypes: [ShaclCorePropertyGroup.$fromRdfType],
      },
      query,
    );
  }

  async shaclCorePropertyShape(
    identifier: ShaclCorePropertyShapeStatic.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyShape>> {
    return this.shaclCorePropertyShapeSync(identifier);
  }

  shaclCorePropertyShapeSync(
    identifier: ShaclCorePropertyShapeStatic.$Identifier,
  ): Either<Error, ShaclCorePropertyShape> {
    return this.shaclCorePropertyShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclCorePropertyShapeCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyShapeStatic.$Filter,
        ShaclCorePropertyShapeStatic.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCorePropertyShapeCountSync(query);
  }

  shaclCorePropertyShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyShapeStatic.$Filter,
        ShaclCorePropertyShapeStatic.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclCorePropertyShapesSync(query).map(
      (objects) => objects.length,
    );
  }

  async shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShapeStatic.$Filter,
      ShaclCorePropertyShapeStatic.$Identifier
    >,
  ): Promise<
    Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]>
  > {
    return this.shaclCorePropertyShapeIdentifiersSync(query);
  }

  shaclCorePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShapeStatic.$Filter,
      ShaclCorePropertyShapeStatic.$Identifier
    >,
  ): Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]> {
    return this.shaclCorePropertyShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCorePropertyShapes(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShapeStatic.$Filter,
      ShaclCorePropertyShapeStatic.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyShape[]>> {
    return this.shaclCorePropertyShapesSync(query);
  }

  shaclCorePropertyShapesSync(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShapeStatic.$Filter,
      ShaclCorePropertyShapeStatic.$Identifier
    >,
  ): Either<Error, readonly ShaclCorePropertyShape[]> {
    return this.$objectsSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShapeStatic.$Filter,
      ShaclCorePropertyShapeStatic.$Identifier
    >(
      {
        $filter: ShaclCorePropertyShapeStatic.$filter,
        $fromRdf: ShaclCorePropertyShapeStatic.$fromRdf,
        $fromRdfTypes: [
          ShaclCorePropertyShapeStatic.$fromRdfType,
          ShaclmatePropertyShape.$fromRdfType,
        ],
      },
      query,
    );
  }

  async shaclmateNodeShape(
    identifier: ShaclmateNodeShape.$Identifier,
  ): Promise<Either<Error, ShaclmateNodeShape>> {
    return this.shaclmateNodeShapeSync(identifier);
  }

  shaclmateNodeShapeSync(
    identifier: ShaclmateNodeShape.$Identifier,
  ): Either<Error, ShaclmateNodeShape> {
    return this.shaclmateNodeShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclmateNodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmateNodeShape.$Filter,
        ShaclmateNodeShape.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclmateNodeShapeCountSync(query);
  }

  shaclmateNodeShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmateNodeShape.$Filter,
        ShaclmateNodeShape.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclmateNodeShapesSync(query).map((objects) => objects.length);
  }

  async shaclmateNodeShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclmateNodeShape.$Filter,
      ShaclmateNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateNodeShape.$Identifier[]>> {
    return this.shaclmateNodeShapeIdentifiersSync(query);
  }

  shaclmateNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclmateNodeShape.$Filter,
      ShaclmateNodeShape.$Identifier
    >,
  ): Either<Error, readonly ShaclmateNodeShape.$Identifier[]> {
    return this.shaclmateNodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclmateNodeShapes(
    query?: $ObjectSet.Query<
      ShaclmateNodeShape.$Filter,
      ShaclmateNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateNodeShape[]>> {
    return this.shaclmateNodeShapesSync(query);
  }

  shaclmateNodeShapesSync(
    query?: $ObjectSet.Query<
      ShaclmateNodeShape.$Filter,
      ShaclmateNodeShape.$Identifier
    >,
  ): Either<Error, readonly ShaclmateNodeShape[]> {
    return this.$objectsSync<
      ShaclmateNodeShape,
      ShaclmateNodeShape.$Filter,
      ShaclmateNodeShape.$Identifier
    >(
      {
        $filter: ShaclmateNodeShape.$filter,
        $fromRdf: ShaclmateNodeShape.$fromRdf,
        $fromRdfTypes: [ShaclmateNodeShape.$fromRdfType],
      },
      query,
    );
  }

  async shaclmateOntology(
    identifier: ShaclmateOntology.$Identifier,
  ): Promise<Either<Error, ShaclmateOntology>> {
    return this.shaclmateOntologySync(identifier);
  }

  shaclmateOntologySync(
    identifier: ShaclmateOntology.$Identifier,
  ): Either<Error, ShaclmateOntology> {
    return this.shaclmateOntologiesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclmateOntologyCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmateOntology.$Filter,
        ShaclmateOntology.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclmateOntologyCountSync(query);
  }

  shaclmateOntologyCountSync(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmateOntology.$Filter,
        ShaclmateOntology.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclmateOntologiesSync(query).map((objects) => objects.length);
  }

  async shaclmateOntologyIdentifiers(
    query?: $ObjectSet.Query<
      ShaclmateOntology.$Filter,
      ShaclmateOntology.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateOntology.$Identifier[]>> {
    return this.shaclmateOntologyIdentifiersSync(query);
  }

  shaclmateOntologyIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclmateOntology.$Filter,
      ShaclmateOntology.$Identifier
    >,
  ): Either<Error, readonly ShaclmateOntology.$Identifier[]> {
    return this.shaclmateOntologiesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclmateOntologies(
    query?: $ObjectSet.Query<
      ShaclmateOntology.$Filter,
      ShaclmateOntology.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateOntology[]>> {
    return this.shaclmateOntologiesSync(query);
  }

  shaclmateOntologiesSync(
    query?: $ObjectSet.Query<
      ShaclmateOntology.$Filter,
      ShaclmateOntology.$Identifier
    >,
  ): Either<Error, readonly ShaclmateOntology[]> {
    return this.$objectsSync<
      ShaclmateOntology,
      ShaclmateOntology.$Filter,
      ShaclmateOntology.$Identifier
    >(
      {
        $filter: ShaclmateOntology.$filter,
        $fromRdf: ShaclmateOntology.$fromRdf,
        $fromRdfTypes: [ShaclmateOntology.$fromRdfType],
      },
      query,
    );
  }

  async shaclmatePropertyShape(
    identifier: ShaclmatePropertyShape.$Identifier,
  ): Promise<Either<Error, ShaclmatePropertyShape>> {
    return this.shaclmatePropertyShapeSync(identifier);
  }

  shaclmatePropertyShapeSync(
    identifier: ShaclmatePropertyShape.$Identifier,
  ): Either<Error, ShaclmatePropertyShape> {
    return this.shaclmatePropertyShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclmatePropertyShapeCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmatePropertyShape.$Filter,
        ShaclmatePropertyShape.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclmatePropertyShapeCountSync(query);
  }

  shaclmatePropertyShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<
        ShaclmatePropertyShape.$Filter,
        ShaclmatePropertyShape.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclmatePropertyShapesSync(query).map(
      (objects) => objects.length,
    );
  }

  async shaclmatePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclmatePropertyShape.$Filter,
      ShaclmatePropertyShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmatePropertyShape.$Identifier[]>> {
    return this.shaclmatePropertyShapeIdentifiersSync(query);
  }

  shaclmatePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclmatePropertyShape.$Filter,
      ShaclmatePropertyShape.$Identifier
    >,
  ): Either<Error, readonly ShaclmatePropertyShape.$Identifier[]> {
    return this.shaclmatePropertyShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclmatePropertyShapes(
    query?: $ObjectSet.Query<
      ShaclmatePropertyShape.$Filter,
      ShaclmatePropertyShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmatePropertyShape[]>> {
    return this.shaclmatePropertyShapesSync(query);
  }

  shaclmatePropertyShapesSync(
    query?: $ObjectSet.Query<
      ShaclmatePropertyShape.$Filter,
      ShaclmatePropertyShape.$Identifier
    >,
  ): Either<Error, readonly ShaclmatePropertyShape[]> {
    return this.$objectsSync<
      ShaclmatePropertyShape,
      ShaclmatePropertyShape.$Filter,
      ShaclmatePropertyShape.$Identifier
    >(
      {
        $filter: ShaclmatePropertyShape.$filter,
        $fromRdf: ShaclmatePropertyShape.$fromRdf,
        $fromRdfTypes: [ShaclmatePropertyShape.$fromRdfType],
      },
      query,
    );
  }

  async shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<Either<Error, ShaclCoreShape>> {
    return this.shaclCoreShapeSync(identifier);
  }

  shaclCoreShapeSync(
    identifier: ShaclCoreShape.$Identifier,
  ): Either<Error, ShaclCoreShape> {
    return this.shaclCoreShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclCoreShapeCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreShape.$Filter, ShaclCoreShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCoreShapeCountSync(query);
  }

  shaclCoreShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreShape.$Filter, ShaclCoreShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclCoreShapesSync(query).map((objects) => objects.length);
  }

  async shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCoreShape.$Filter,
      ShaclCoreShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreShape.$Identifier[]>> {
    return this.shaclCoreShapeIdentifiersSync(query);
  }

  shaclCoreShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclCoreShape.$Filter,
      ShaclCoreShape.$Identifier
    >,
  ): Either<Error, readonly ShaclCoreShape.$Identifier[]> {
    return this.shaclCoreShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCoreShapes(
    query?: $ObjectSet.Query<
      ShaclCoreShape.$Filter,
      ShaclCoreShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreShape[]>> {
    return this.shaclCoreShapesSync(query);
  }

  shaclCoreShapesSync(
    query?: $ObjectSet.Query<
      ShaclCoreShape.$Filter,
      ShaclCoreShape.$Identifier
    >,
  ): Either<Error, readonly ShaclCoreShape[]> {
    return this.$objectUnionsSync<
      ShaclCoreShape,
      ShaclCoreShape.$Filter,
      ShaclCoreShape.$Identifier
    >(
      [
        {
          $filter: ShaclCoreShape.$filter,
          $fromRdf: ShaclCoreNodeShapeStatic.$fromRdf,
          $fromRdfTypes: [
            ShaclCoreNodeShapeStatic.$fromRdfType,
            ShaclmateNodeShape.$fromRdfType,
          ],
        },
        {
          $filter: ShaclCoreShape.$filter,
          $fromRdf: ShaclCorePropertyShapeStatic.$fromRdf,
          $fromRdfTypes: [
            ShaclCorePropertyShapeStatic.$fromRdfType,
            ShaclmatePropertyShape.$fromRdfType,
          ],
        },
      ],
      query,
    );
  }

  async shaclmateShape(
    identifier: ShaclmateShape.$Identifier,
  ): Promise<Either<Error, ShaclmateShape>> {
    return this.shaclmateShapeSync(identifier);
  }

  shaclmateShapeSync(
    identifier: ShaclmateShape.$Identifier,
  ): Either<Error, ShaclmateShape> {
    return this.shaclmateShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclmateShapeCount(
    query?: Pick<
      $ObjectSet.Query<ShaclmateShape.$Filter, ShaclmateShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclmateShapeCountSync(query);
  }

  shaclmateShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<ShaclmateShape.$Filter, ShaclmateShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclmateShapesSync(query).map((objects) => objects.length);
  }

  async shaclmateShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclmateShape.$Filter,
      ShaclmateShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateShape.$Identifier[]>> {
    return this.shaclmateShapeIdentifiersSync(query);
  }

  shaclmateShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclmateShape.$Filter,
      ShaclmateShape.$Identifier
    >,
  ): Either<Error, readonly ShaclmateShape.$Identifier[]> {
    return this.shaclmateShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclmateShapes(
    query?: $ObjectSet.Query<
      ShaclmateShape.$Filter,
      ShaclmateShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclmateShape[]>> {
    return this.shaclmateShapesSync(query);
  }

  shaclmateShapesSync(
    query?: $ObjectSet.Query<
      ShaclmateShape.$Filter,
      ShaclmateShape.$Identifier
    >,
  ): Either<Error, readonly ShaclmateShape[]> {
    return this.$objectUnionsSync<
      ShaclmateShape,
      ShaclmateShape.$Filter,
      ShaclmateShape.$Identifier
    >(
      [
        {
          $filter: ShaclmateShape.$filter,
          $fromRdf: ShaclmateNodeShape.$fromRdf,
          $fromRdfTypes: [ShaclmateNodeShape.$fromRdfType],
        },
        {
          $filter: ShaclmateShape.$filter,
          $fromRdf: ShaclCorePropertyShapeStatic.$fromRdf,
          $fromRdfTypes: [
            ShaclCorePropertyShapeStatic.$fromRdfType,
            ShaclmatePropertyShape.$fromRdfType,
          ],
        },
      ],
      query,
    );
  }

  async object(
    identifier: $Object.$Identifier,
  ): Promise<Either<Error, $Object>> {
    return this.objectSync(identifier);
  }

  objectSync(identifier: $Object.$Identifier): Either<Error, $Object> {
    return this.objectsSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async objectCount(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.objectCountSync(query);
  }

  objectCountSync(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.objectsSync(query).map((objects) => objects.length);
  }

  async objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object.$Identifier[]>> {
    return this.objectIdentifiersSync(query);
  }

  objectIdentifiersSync(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Either<Error, readonly $Object.$Identifier[]> {
    return this.objectsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async objects(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object[]>> {
    return this.objectsSync(query);
  }

  objectsSync(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Either<Error, readonly $Object[]> {
    return this.$objectUnionsSync<
      $Object,
      $Object.$Filter,
      $Object.$Identifier
    >(
      [
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclCorePropertyGroup.$fromRdf,
          $fromRdfTypes: [ShaclCorePropertyGroup.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclmateNodeShape.$fromRdf,
          $fromRdfTypes: [ShaclmateNodeShape.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclCoreNodeShapeStatic.$fromRdf,
          $fromRdfTypes: [
            ShaclCoreNodeShapeStatic.$fromRdfType,
            ShaclmateNodeShape.$fromRdfType,
          ],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclmateOntology.$fromRdf,
          $fromRdfTypes: [ShaclmateOntology.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: OwlOntologyStatic.$fromRdf,
          $fromRdfTypes: [
            OwlOntologyStatic.$fromRdfType,
            ShaclmateOntology.$fromRdfType,
          ],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclmatePropertyShape.$fromRdf,
          $fromRdfTypes: [ShaclmatePropertyShape.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclCorePropertyShapeStatic.$fromRdf,
          $fromRdfTypes: [
            ShaclCorePropertyShapeStatic.$fromRdfType,
            ShaclmatePropertyShape.$fromRdfType,
          ],
        },
      ],
      query,
    );
  }

  protected $objectsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  >(
    objectType: {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdf: (
        resource: Resource,
        options: {
          graph?: Exclude<Quad_Graph, Variable>;
          objectSet: $ObjectSet;
        },
      ) => Either<Error, ObjectT>;
      $fromRdfTypes: readonly NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const graph = query?.graph ?? this.$graph;

    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Right([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    let resources: { object?: ObjectT; resource: Resource }[];
    const resourceSet = this.$resourceSet(); // Access once, in case it's instantiated lazily
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: resourceSet.resource(identifier),
      }));
      sortResources = false;
    } else if (objectType.$fromRdfTypes.length > 0) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const fromRdfType of objectType.$fromRdfTypes) {
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
        objectType
          .$fromRdf(resource, { graph, objectSet: this })
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
        const objectEither = objectType.$fromRdf(resource, {
          graph,
          objectSet: this,
        });
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }

      if (query?.filter && !objectType.$filter(query.filter, object)) {
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

  protected $objectUnionsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  >(
    objectTypes: readonly {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdf: (
        resource: Resource,
        options: {
          graph?: Exclude<Quad_Graph, Variable>;
          objectSet: $ObjectSet;
        },
      ) => Either<Error, ObjectT>;
      $fromRdfTypes: readonly NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const graph = query?.graph ?? this.$graph;

    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Right([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    let resources: {
      object?: ObjectT;
      objectType?: {
        $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
        $fromRdf: (
          resource: Resource,
          options: {
            graph?: Exclude<Quad_Graph, Variable>;
            objectSet: $ObjectSet;
          },
        ) => Either<Error, ObjectT>;
        $fromRdfTypes: readonly NamedNode[];
      };
      resource: Resource;
    }[];
    const resourceSet = this.$resourceSet(); // Access once, in case it's instantiated lazily
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: resourceSet.resource(identifier),
      }));
      sortResources = false;
    } else if (
      objectTypes.every((objectType) => objectType.$fromRdfTypes.length > 0)
    ) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const objectType of objectTypes) {
        for (const fromRdfType of objectType.$fromRdfTypes) {
          for (const resource of resourceSet.instancesOf(fromRdfType, {
            graph,
          })) {
            if (!identifierSet.has(resource.identifier)) {
              identifierSet.add(resource.identifier);
              resources.push({ objectType, resource });
            }
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
        // Eagerly eliminate the majority of resources that won't match the object types
        const resource = resourceSet.resource(quad.subject);
        for (const objectType of objectTypes) {
          if (
            objectType
              .$fromRdf(resource, { graph, objectSet: this })
              .ifRight((object) => {
                resources.push({ object, objectType, resource });
              })
              .isRight()
          ) {
            break;
          }
        }
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
    for (let { object, objectType, resource } of resources) {
      if (!object) {
        let objectEither: Either<Error, ObjectT>;
        if (objectType) {
          objectEither = objectType.$fromRdf(resource, {
            graph,
            objectSet: this,
          });
        } else {
          objectEither = Left(new Error("no object types"));
          for (const tryObjectType of objectTypes) {
            objectEither = tryObjectType.$fromRdf(resource, {
              graph,
              objectSet: this,
            });
            if (objectEither.isRight()) {
              objectType = tryObjectType;
              break;
            }
          }
        }
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }
      if (!objectType) {
        throw new Error("objectType should be set here");
      }

      if (query?.filter && !objectType.$filter(query.filter, object)) {
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

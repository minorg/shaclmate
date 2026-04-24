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
  PropertyPath as RdfjsResourcePropertyPath,
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

export type $FromRdfResourceValuesFunction<T> = (
  resourceValues: Either<Error, Resource.Values>,
  options: {
    context?: unknown;
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    objectSet?: $ObjectSet;
    preferredLanguages?: readonly string[];
    propertyPath: $PropertyPath;
    resource: Resource;
  },
) => Either<Error, Resource.Values<T>>;

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

type $PropertiesFromRdfResourceFunction<T> = (
  resource: Resource,
  options: {
    context: undefined | unknown;
    graph: Exclude<Quad_Graph, Variable> | undefined;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
  },
) => Either<Error, T>;

export type $PropertyPath = RdfjsResourcePropertyPath;

export namespace $PropertyPath {
  export type $Filter = object;

  export function $filter(_filter: $Filter, _value: $PropertyPath): boolean {
    return true;
  }

  export const $fromRdfResource: $FromRdfResourceFunction<$PropertyPath> =
    RdfjsResourcePropertyPath.fromResource;

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    $PropertyPath
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => $fromRdfResource(resource, options)),
      ),
    );

  export const $schema: Readonly<object> = {};

  export const $toRdfResource: $ToRdfResourceFunction<$PropertyPath> =
    RdfjsResourcePropertyPath.toResource;
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
  readonly path: $PropertyPath;
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

export type $ToRdfResourceFunction<T> = (
  value: T,
  options?: {
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    resourceSet?: ResourceSet;
  },
) => Resource;

export type $ToRdfResourceValuesFunction<T> = (
  value: T,
  options: {
    graph?: Exclude<Quad_Graph, Variable>;
    ignoreRdfType?: boolean;
    propertyPath: $PropertyPath;
    resource: Resource;
    resourceSet: ResourceSet;
  },
) => (bigint | boolean | number | string | BlankNode | Literal | NamedNode)[];
export interface PropertyShape {
  readonly $identifier: PropertyShape.$Identifier;
  readonly $type: "PropertyShape";
  readonly and: readonly (readonly (BlankNode | NamedNode)[])[];
  readonly classes: readonly NamedNode[];
  readonly comments: readonly string[];
  readonly datatype: Maybe<NamedNode>;
  readonly deactivated: Maybe<boolean>;
  readonly defaultValue: Maybe<NamedNode | Literal>;
  readonly description: Maybe<string>;
  readonly flags: readonly string[];
  readonly groups: readonly (BlankNode | NamedNode)[];
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
  readonly mutable: Maybe<boolean>;
  readonly name: Maybe<string>;
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
  readonly order: Maybe<number>;
  readonly path: $PropertyPath;
  readonly patterns: readonly string[];
  readonly resolve: Maybe<BlankNode | NamedNode>;
  readonly shaclmateName: Maybe<string>;
  readonly uniqueLang: Maybe<boolean>;
  readonly visibility: Maybe<
    NamedNode<
      | "http://purl.org/shaclmate/ontology#_Visibility_Private"
      | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
      | "http://purl.org/shaclmate/ontology#_Visibility_Public"
    >
  >;
  readonly xone: readonly (readonly (BlankNode | NamedNode)[])[];
}

export namespace PropertyShape {
  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function $filter(
    filter: PropertyShape.$Filter,
    value: PropertyShape,
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
      filter.defaultValue !== undefined &&
      !$filterMaybe<NamedNode | Literal, $TermFilter>($filterTerm)(
        filter.defaultValue,
        value.defaultValue,
      )
    ) {
      return false;
    }
    if (
      filter.description !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.description,
        value.description,
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
      filter.groups !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.groups, value.groups)
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
      !$PropertyPath.$filter(filter.path, value.path)
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
      filter.resolve !== undefined &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.resolve, value.resolve)
    ) {
      return false;
    }
    if (
      filter.shaclmateName !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.shaclmateName,
        value.shaclmateName,
      )
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
    readonly defaultValue?: $MaybeFilter<$TermFilter>;
    readonly description?: $MaybeFilter<$StringFilter>;
    readonly flags?: $CollectionFilter<$StringFilter>;
    readonly groups?: $CollectionFilter<$IdentifierFilter>;
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
    readonly mutable?: $MaybeFilter<$BooleanFilter>;
    readonly name?: $MaybeFilter<$StringFilter>;
    readonly nodeKind?: $MaybeFilter<$IriFilter>;
    readonly nodes?: $CollectionFilter<$IdentifierFilter>;
    readonly not?: $CollectionFilter<$IdentifierFilter>;
    readonly or?: $CollectionFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly order?: $MaybeFilter<$NumericFilter<number>>;
    readonly path?: $PropertyPath.$Filter;
    readonly patterns?: $CollectionFilter<$StringFilter>;
    readonly resolve?: $MaybeFilter<$IdentifierFilter>;
    readonly shaclmateName?: $MaybeFilter<$StringFilter>;
    readonly uniqueLang?: $MaybeFilter<$BooleanFilter>;
    readonly visibility?: $MaybeFilter<$IriFilter>;
    readonly xone?: $CollectionFilter<$CollectionFilter<$IdentifierFilter>>;
  };

  export const $fromRdfResource: $FromRdfResourceFunction<PropertyShape> = (
    resource,
    options,
  ) => {
    let {
      context,
      graph,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return PropertyShape.$propertiesFromRdfResource(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
    });
  };

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    PropertyShape
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) =>
            PropertyShape.$fromRdfResource(resource, options),
          ),
      ),
    );

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );

  export function isPropertyShape(object: $Object): object is PropertyShape {
    switch (object.$type) {
      case "PropertyShape":
        return true;
      default:
        return false;
    }
  }

  export const $propertiesFromRdfResource: $PropertiesFromRdfResourceFunction<{
    $identifier: BlankNode | NamedNode;
    $type: "PropertyShape";
    and: readonly (readonly (BlankNode | NamedNode)[])[];
    classes: readonly NamedNode[];
    comments: readonly string[];
    datatype: Maybe<NamedNode>;
    deactivated: Maybe<boolean>;
    defaultValue: Maybe<NamedNode | Literal>;
    description: Maybe<string>;
    flags: readonly string[];
    groups: readonly (BlankNode | NamedNode)[];
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
    mutable: Maybe<boolean>;
    name: Maybe<string>;
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
    order: Maybe<number>;
    path: $PropertyPath;
    patterns: readonly string[];
    resolve: Maybe<BlankNode | NamedNode>;
    shaclmateName: Maybe<string>;
    uniqueLang: Maybe<boolean>;
    visibility: Maybe<
      NamedNode<
        | "http://purl.org/shaclmate/ontology#_Visibility_Private"
        | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
        | "http://purl.org/shaclmate/ontology#_Visibility_Public"
      >
    >;
    xone: readonly (readonly (BlankNode | NamedNode)[])[];
  }> = ($resource, _$options) => {
    return (
      !_$options.ignoreRdfType
        ? $resource
            .value($RdfVocabularies.rdf.type, { graph: _$options.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyShape":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $resource.isInstanceOf(PropertyShape.$fromRdfType, {
                  graph: _$options.graph,
                })
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
                ),
              );
            })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      Right(
        new Resource.Value({
          dataFactory: dataFactory,
          focusResource: $resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          term: $resource.identifier,
        }).toValues(),
      )
        .chain((values) => values.chainMap((value) => value.toIdentifier()))
        .chain((values) => values.head())
        .chain(($identifier) =>
          Right<"PropertyShape">("PropertyShape" as const).chain(($type) =>
            $shaclPropertyFromRdf({
              graph: _$options.graph,
              resource: $resource,
              propertySchema: $schema.properties.and,
              typeFromRdf: (resourceValues) =>
                resourceValues
                  .chain((values) =>
                    values.chainMap((value) =>
                      value.toList({ graph: _$options.graph }),
                    ),
                  )
                  .chain((valueLists) =>
                    valueLists.chainMap((valueList) =>
                      Right(
                        Resource.Values.fromArray({
                          focusResource: $resource,
                          propertyPath:
                            PropertyShape.$schema.properties.and.path,
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
                      focusResource: $resource,
                      propertyPath: PropertyShape.$schema.properties.and.path,
                      value: valuesArray,
                    }),
                  ),
            }).chain((and) =>
              $shaclPropertyFromRdf({
                graph: _$options.graph,
                resource: $resource,
                propertySchema: $schema.properties.classes,
                typeFromRdf: (resourceValues) =>
                  resourceValues
                    .chain((values) =>
                      values.chainMap((value) => value.toIri()),
                    )
                    .map((values) => values.toArray())
                    .map((valuesArray) =>
                      Resource.Values.fromValue({
                        focusResource: $resource,
                        propertyPath:
                          PropertyShape.$schema.properties.classes.path,
                        value: valuesArray,
                      }),
                    ),
              }).chain((classes) =>
                $shaclPropertyFromRdf({
                  graph: _$options.graph,
                  resource: $resource,
                  propertySchema: $schema.properties.comments,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        $fromRdfPreferredLanguages(
                          values,
                          _$options.preferredLanguages,
                        ),
                      )
                      .chain((values) =>
                        values.chainMap((value) => value.toString()),
                      )
                      .map((values) => values.toArray())
                      .map((valuesArray) =>
                        Resource.Values.fromValue({
                          focusResource: $resource,
                          propertyPath:
                            PropertyShape.$schema.properties.comments.path,
                          value: valuesArray,
                        }),
                      ),
                }).chain((comments) =>
                  $shaclPropertyFromRdf({
                    graph: _$options.graph,
                    resource: $resource,
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
                                focusResource: $resource,
                                propertyPath:
                                  PropertyShape.$schema.properties.datatype
                                    .path,
                                value: Maybe.empty(),
                              }),
                        ),
                  }).chain((datatype) =>
                    $shaclPropertyFromRdf({
                      graph: _$options.graph,
                      resource: $resource,
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
                                  focusResource: $resource,
                                  propertyPath:
                                    PropertyShape.$schema.properties.deactivated
                                      .path,
                                  value: Maybe.empty(),
                                }),
                          ),
                    }).chain((deactivated) =>
                      $shaclPropertyFromRdf({
                        graph: _$options.graph,
                        resource: $resource,
                        propertySchema: $schema.properties.defaultValue,
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
                                          focusResource: $resource,
                                          propertyPath:
                                            PropertyShape.$schema.properties
                                              .defaultValue.path,
                                        }),
                                      );
                                  }
                                }),
                              ),
                            )
                            .map((values) =>
                              values.length > 0
                                ? values.map((value) => Maybe.of(value))
                                : Resource.Values.fromValue<
                                    Maybe<NamedNode | Literal>
                                  >({
                                    focusResource: $resource,
                                    propertyPath:
                                      PropertyShape.$schema.properties
                                        .defaultValue.path,
                                    value: Maybe.empty(),
                                  }),
                            ),
                      }).chain((defaultValue) =>
                        $shaclPropertyFromRdf({
                          graph: _$options.graph,
                          resource: $resource,
                          propertySchema: $schema.properties.description,
                          typeFromRdf: (resourceValues) =>
                            resourceValues
                              .chain((values) =>
                                $fromRdfPreferredLanguages(
                                  values,
                                  _$options.preferredLanguages,
                                ),
                              )
                              .chain((values) =>
                                values.chainMap((value) => value.toString()),
                              )
                              .map((values) =>
                                values.length > 0
                                  ? values.map((value) => Maybe.of(value))
                                  : Resource.Values.fromValue<Maybe<string>>({
                                      focusResource: $resource,
                                      propertyPath:
                                        PropertyShape.$schema.properties
                                          .description.path,
                                      value: Maybe.empty(),
                                    }),
                              ),
                        }).chain((description) =>
                          $shaclPropertyFromRdf({
                            graph: _$options.graph,
                            resource: $resource,
                            propertySchema: $schema.properties.flags,
                            typeFromRdf: (resourceValues) =>
                              resourceValues
                                .chain((values) =>
                                  $fromRdfPreferredLanguages(
                                    values,
                                    _$options.preferredLanguages,
                                  ),
                                )
                                .chain((values) =>
                                  values.chainMap((value) => value.toString()),
                                )
                                .map((values) => values.toArray())
                                .map((valuesArray) =>
                                  Resource.Values.fromValue({
                                    focusResource: $resource,
                                    propertyPath:
                                      PropertyShape.$schema.properties.flags
                                        .path,
                                    value: valuesArray,
                                  }),
                                ),
                          }).chain((flags) =>
                            $shaclPropertyFromRdf({
                              graph: _$options.graph,
                              resource: $resource,
                              propertySchema: $schema.properties.groups,
                              typeFromRdf: (resourceValues) =>
                                resourceValues
                                  .chain((values) =>
                                    values.chainMap((value) =>
                                      value.toIdentifier(),
                                    ),
                                  )
                                  .map((values) => values.toArray())
                                  .map((valuesArray) =>
                                    Resource.Values.fromValue({
                                      focusResource: $resource,
                                      propertyPath:
                                        PropertyShape.$schema.properties.groups
                                          .path,
                                      value: valuesArray,
                                    }),
                                  ),
                            }).chain((groups) =>
                              $shaclPropertyFromRdf({
                                graph: _$options.graph,
                                resource: $resource,
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
                                              return Left<
                                                Error,
                                                NamedNode | Literal
                                              >(
                                                new Resource.MistypedTermValueError(
                                                  {
                                                    actualValue: term,
                                                    expectedValueType:
                                                      "(NamedNode | Literal)",
                                                    focusResource: $resource,
                                                    propertyPath:
                                                      PropertyShape.$schema
                                                        .properties.hasValues
                                                        .path,
                                                  },
                                                ),
                                              );
                                          }
                                        }),
                                      ),
                                    )
                                    .map((values) => values.toArray())
                                    .map((valuesArray) =>
                                      Resource.Values.fromValue({
                                        focusResource: $resource,
                                        propertyPath:
                                          PropertyShape.$schema.properties
                                            .hasValues.path,
                                        value: valuesArray,
                                      }),
                                    ),
                              }).chain((hasValues) =>
                                $shaclPropertyFromRdf({
                                  graph: _$options.graph,
                                  resource: $resource,
                                  propertySchema: $schema.properties.in_,
                                  typeFromRdf: (resourceValues) =>
                                    resourceValues
                                      .chain((values) =>
                                        values.chainMap((value) =>
                                          value.toList({
                                            graph: _$options.graph,
                                          }),
                                        ),
                                      )
                                      .chain((valueLists) =>
                                        valueLists.chainMap((valueList) =>
                                          Right(
                                            Resource.Values.fromArray({
                                              focusResource: $resource,
                                              propertyPath:
                                                PropertyShape.$schema.properties
                                                  .in_.path,
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
                                                            $resource,
                                                          propertyPath:
                                                            PropertyShape
                                                              .$schema
                                                              .properties.in_
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
                                          ? values.map((value) =>
                                              Maybe.of(value),
                                            )
                                          : Resource.Values.fromValue<
                                              Maybe<
                                                readonly (NamedNode | Literal)[]
                                              >
                                            >({
                                              focusResource: $resource,
                                              propertyPath:
                                                PropertyShape.$schema.properties
                                                  .in_.path,
                                              value: Maybe.empty(),
                                            }),
                                      ),
                                }).chain((in_) =>
                                  $shaclPropertyFromRdf({
                                    graph: _$options.graph,
                                    resource: $resource,
                                    propertySchema:
                                      $schema.properties.isDefinedBy,
                                    typeFromRdf: (resourceValues) =>
                                      resourceValues
                                        .chain((values) =>
                                          values.chainMap((value) =>
                                            value.toIdentifier(),
                                          ),
                                        )
                                        .map((values) =>
                                          values.length > 0
                                            ? values.map((value) =>
                                                Maybe.of(value),
                                              )
                                            : Resource.Values.fromValue<
                                                Maybe<BlankNode | NamedNode>
                                              >({
                                                focusResource: $resource,
                                                propertyPath:
                                                  PropertyShape.$schema
                                                    .properties.isDefinedBy
                                                    .path,
                                                value: Maybe.empty(),
                                              }),
                                        ),
                                  }).chain((isDefinedBy) =>
                                    $shaclPropertyFromRdf({
                                      graph: _$options.graph,
                                      resource: $resource,
                                      propertySchema: $schema.properties.labels,
                                      typeFromRdf: (resourceValues) =>
                                        resourceValues
                                          .chain((values) =>
                                            $fromRdfPreferredLanguages(
                                              values,
                                              _$options.preferredLanguages,
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
                                              focusResource: $resource,
                                              propertyPath:
                                                PropertyShape.$schema.properties
                                                  .labels.path,
                                              value: valuesArray,
                                            }),
                                          ),
                                    }).chain((labels) =>
                                      $shaclPropertyFromRdf({
                                        graph: _$options.graph,
                                        resource: $resource,
                                        propertySchema:
                                          $schema.properties.languageIn,
                                        typeFromRdf: (resourceValues) =>
                                          resourceValues
                                            .chain((values) =>
                                              values.chainMap((value) =>
                                                value.toList({
                                                  graph: _$options.graph,
                                                }),
                                              ),
                                            )
                                            .chain((valueLists) =>
                                              valueLists.chainMap((valueList) =>
                                                Right(
                                                  Resource.Values.fromArray({
                                                    focusResource: $resource,
                                                    propertyPath:
                                                      PropertyShape.$schema
                                                        .properties.languageIn
                                                        .path,
                                                    values: valueList.toArray(),
                                                  }),
                                                )
                                                  .chain((values) =>
                                                    $fromRdfPreferredLanguages(
                                                      values,
                                                      _$options.preferredLanguages,
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
                                                ? values.map((value) =>
                                                    Maybe.of(value),
                                                  )
                                                : Resource.Values.fromValue<
                                                    Maybe<readonly string[]>
                                                  >({
                                                    focusResource: $resource,
                                                    propertyPath:
                                                      PropertyShape.$schema
                                                        .properties.languageIn
                                                        .path,
                                                    value: Maybe.empty(),
                                                  }),
                                            ),
                                      }).chain((languageIn) =>
                                        $shaclPropertyFromRdf({
                                          graph: _$options.graph,
                                          resource: $resource,
                                          propertySchema:
                                            $schema.properties.maxCount,
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
                                                      focusResource: $resource,
                                                      propertyPath:
                                                        PropertyShape.$schema
                                                          .properties.maxCount
                                                          .path,
                                                      value: Maybe.empty(),
                                                    }),
                                              ),
                                        }).chain((maxCount) =>
                                          $shaclPropertyFromRdf({
                                            graph: _$options.graph,
                                            resource: $resource,
                                            propertySchema:
                                              $schema.properties.maxExclusive,
                                            typeFromRdf: (resourceValues) =>
                                              resourceValues
                                                .chain((values) =>
                                                  $fromRdfPreferredLanguages(
                                                    values,
                                                    _$options.preferredLanguages,
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
                                                          $resource,
                                                        propertyPath:
                                                          PropertyShape.$schema
                                                            .properties
                                                            .maxExclusive.path,
                                                        value: Maybe.empty(),
                                                      }),
                                                ),
                                          }).chain((maxExclusive) =>
                                            $shaclPropertyFromRdf({
                                              graph: _$options.graph,
                                              resource: $resource,
                                              propertySchema:
                                                $schema.properties.maxInclusive,
                                              typeFromRdf: (resourceValues) =>
                                                resourceValues
                                                  .chain((values) =>
                                                    $fromRdfPreferredLanguages(
                                                      values,
                                                      _$options.preferredLanguages,
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
                                                            $resource,
                                                          propertyPath:
                                                            PropertyShape
                                                              .$schema
                                                              .properties
                                                              .maxInclusive
                                                              .path,
                                                          value: Maybe.empty(),
                                                        }),
                                                  ),
                                            }).chain((maxInclusive) =>
                                              $shaclPropertyFromRdf({
                                                graph: _$options.graph,
                                                resource: $resource,
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
                                                              $resource,
                                                            propertyPath:
                                                              PropertyShape
                                                                .$schema
                                                                .properties
                                                                .maxLength.path,
                                                            value:
                                                              Maybe.empty(),
                                                          }),
                                                    ),
                                              }).chain((maxLength) =>
                                                $shaclPropertyFromRdf({
                                                  graph: _$options.graph,
                                                  resource: $resource,
                                                  propertySchema:
                                                    $schema.properties.minCount,
                                                  typeFromRdf: (
                                                    resourceValues,
                                                  ) =>
                                                    resourceValues
                                                      .chain((values) =>
                                                        values.chainMap(
                                                          (value) =>
                                                            value.toInt(),
                                                        ),
                                                      )
                                                      .map((values) =>
                                                        values.length > 0
                                                          ? values.map(
                                                              (value) =>
                                                                Maybe.of(value),
                                                            )
                                                          : Resource.Values.fromValue<
                                                              Maybe<number>
                                                            >({
                                                              focusResource:
                                                                $resource,
                                                              propertyPath:
                                                                PropertyShape
                                                                  .$schema
                                                                  .properties
                                                                  .minCount
                                                                  .path,
                                                              value:
                                                                Maybe.empty(),
                                                            }),
                                                      ),
                                                }).chain((minCount) =>
                                                  $shaclPropertyFromRdf({
                                                    graph: _$options.graph,
                                                    resource: $resource,
                                                    propertySchema:
                                                      $schema.properties
                                                        .minExclusive,
                                                    typeFromRdf: (
                                                      resourceValues,
                                                    ) =>
                                                      resourceValues
                                                        .chain((values) =>
                                                          $fromRdfPreferredLanguages(
                                                            values,
                                                            _$options.preferredLanguages,
                                                          ),
                                                        )
                                                        .chain((values) =>
                                                          values.chainMap(
                                                            (value) =>
                                                              value.toLiteral(),
                                                          ),
                                                        )
                                                        .map((values) =>
                                                          values.length > 0
                                                            ? values.map(
                                                                (value) =>
                                                                  Maybe.of(
                                                                    value,
                                                                  ),
                                                              )
                                                            : Resource.Values.fromValue<
                                                                Maybe<Literal>
                                                              >({
                                                                focusResource:
                                                                  $resource,
                                                                propertyPath:
                                                                  PropertyShape
                                                                    .$schema
                                                                    .properties
                                                                    .minExclusive
                                                                    .path,
                                                                value:
                                                                  Maybe.empty(),
                                                              }),
                                                        ),
                                                  }).chain((minExclusive) =>
                                                    $shaclPropertyFromRdf({
                                                      graph: _$options.graph,
                                                      resource: $resource,
                                                      propertySchema:
                                                        $schema.properties
                                                          .minInclusive,
                                                      typeFromRdf: (
                                                        resourceValues,
                                                      ) =>
                                                        resourceValues
                                                          .chain((values) =>
                                                            $fromRdfPreferredLanguages(
                                                              values,
                                                              _$options.preferredLanguages,
                                                            ),
                                                          )
                                                          .chain((values) =>
                                                            values.chainMap(
                                                              (value) =>
                                                                value.toLiteral(),
                                                            ),
                                                          )
                                                          .map((values) =>
                                                            values.length > 0
                                                              ? values.map(
                                                                  (value) =>
                                                                    Maybe.of(
                                                                      value,
                                                                    ),
                                                                )
                                                              : Resource.Values.fromValue<
                                                                  Maybe<Literal>
                                                                >({
                                                                  focusResource:
                                                                    $resource,
                                                                  propertyPath:
                                                                    PropertyShape
                                                                      .$schema
                                                                      .properties
                                                                      .minInclusive
                                                                      .path,
                                                                  value:
                                                                    Maybe.empty(),
                                                                }),
                                                          ),
                                                    }).chain((minInclusive) =>
                                                      $shaclPropertyFromRdf({
                                                        graph: _$options.graph,
                                                        resource: $resource,
                                                        propertySchema:
                                                          $schema.properties
                                                            .minLength,
                                                        typeFromRdf: (
                                                          resourceValues,
                                                        ) =>
                                                          resourceValues
                                                            .chain((values) =>
                                                              values.chainMap(
                                                                (value) =>
                                                                  value.toInt(),
                                                              ),
                                                            )
                                                            .map((values) =>
                                                              values.length > 0
                                                                ? values.map(
                                                                    (value) =>
                                                                      Maybe.of(
                                                                        value,
                                                                      ),
                                                                  )
                                                                : Resource.Values.fromValue<
                                                                    Maybe<number>
                                                                  >({
                                                                    focusResource:
                                                                      $resource,
                                                                    propertyPath:
                                                                      PropertyShape
                                                                        .$schema
                                                                        .properties
                                                                        .minLength
                                                                        .path,
                                                                    value:
                                                                      Maybe.empty(),
                                                                  }),
                                                            ),
                                                      }).chain((minLength) =>
                                                        $shaclPropertyFromRdf({
                                                          graph:
                                                            _$options.graph,
                                                          resource: $resource,
                                                          propertySchema:
                                                            $schema.properties
                                                              .mutable,
                                                          typeFromRdf: (
                                                            resourceValues,
                                                          ) =>
                                                            resourceValues
                                                              .chain((values) =>
                                                                values.chainMap(
                                                                  (value) =>
                                                                    value.toBoolean(),
                                                                ),
                                                              )
                                                              .map((values) =>
                                                                values.length >
                                                                0
                                                                  ? values.map(
                                                                      (value) =>
                                                                        Maybe.of(
                                                                          value,
                                                                        ),
                                                                    )
                                                                  : Resource.Values.fromValue<
                                                                      Maybe<boolean>
                                                                    >({
                                                                      focusResource:
                                                                        $resource,
                                                                      propertyPath:
                                                                        PropertyShape
                                                                          .$schema
                                                                          .properties
                                                                          .mutable
                                                                          .path,
                                                                      value:
                                                                        Maybe.empty(),
                                                                    }),
                                                              ),
                                                        }).chain((mutable) =>
                                                          $shaclPropertyFromRdf(
                                                            {
                                                              graph:
                                                                _$options.graph,
                                                              resource:
                                                                $resource,
                                                              propertySchema:
                                                                $schema
                                                                  .properties
                                                                  .name,
                                                              typeFromRdf: (
                                                                resourceValues,
                                                              ) =>
                                                                resourceValues
                                                                  .chain(
                                                                    (values) =>
                                                                      $fromRdfPreferredLanguages(
                                                                        values,
                                                                        _$options.preferredLanguages,
                                                                      ),
                                                                  )
                                                                  .chain(
                                                                    (values) =>
                                                                      values.chainMap(
                                                                        (
                                                                          value,
                                                                        ) =>
                                                                          value.toString(),
                                                                      ),
                                                                  )
                                                                  .map(
                                                                    (values) =>
                                                                      values.length >
                                                                      0
                                                                        ? values.map(
                                                                            (
                                                                              value,
                                                                            ) =>
                                                                              Maybe.of(
                                                                                value,
                                                                              ),
                                                                          )
                                                                        : Resource.Values.fromValue<
                                                                            Maybe<string>
                                                                          >({
                                                                            focusResource:
                                                                              $resource,
                                                                            propertyPath:
                                                                              PropertyShape
                                                                                .$schema
                                                                                .properties
                                                                                .name
                                                                                .path,
                                                                            value:
                                                                              Maybe.empty(),
                                                                          }),
                                                                  ),
                                                            },
                                                          ).chain((name) =>
                                                            $shaclPropertyFromRdf(
                                                              {
                                                                graph:
                                                                  _$options.graph,
                                                                resource:
                                                                  $resource,
                                                                propertySchema:
                                                                  $schema
                                                                    .properties
                                                                    .nodeKind,
                                                                typeFromRdf: (
                                                                  resourceValues,
                                                                ) =>
                                                                  resourceValues
                                                                    .chain(
                                                                      (
                                                                        values,
                                                                      ) =>
                                                                        values.chainMap(
                                                                          (
                                                                            value,
                                                                          ) =>
                                                                            value.toIri(
                                                                              [
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
                                                                              ],
                                                                            ),
                                                                        ),
                                                                    )
                                                                    .map(
                                                                      (
                                                                        values,
                                                                      ) =>
                                                                        values.length >
                                                                        0
                                                                          ? values.map(
                                                                              (
                                                                                value,
                                                                              ) =>
                                                                                Maybe.of(
                                                                                  value,
                                                                                ),
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
                                                                                $resource,
                                                                              propertyPath:
                                                                                PropertyShape
                                                                                  .$schema
                                                                                  .properties
                                                                                  .nodeKind
                                                                                  .path,
                                                                              value:
                                                                                Maybe.empty(),
                                                                            }),
                                                                    ),
                                                              },
                                                            ).chain(
                                                              (nodeKind) =>
                                                                $shaclPropertyFromRdf(
                                                                  {
                                                                    graph:
                                                                      _$options.graph,
                                                                    resource:
                                                                      $resource,
                                                                    propertySchema:
                                                                      $schema
                                                                        .properties
                                                                        .nodes,
                                                                    typeFromRdf:
                                                                      (
                                                                        resourceValues,
                                                                      ) =>
                                                                        resourceValues
                                                                          .chain(
                                                                            (
                                                                              values,
                                                                            ) =>
                                                                              values.chainMap(
                                                                                (
                                                                                  value,
                                                                                ) =>
                                                                                  value.toIdentifier(),
                                                                              ),
                                                                          )
                                                                          .map(
                                                                            (
                                                                              values,
                                                                            ) =>
                                                                              values.toArray(),
                                                                          )
                                                                          .map(
                                                                            (
                                                                              valuesArray,
                                                                            ) =>
                                                                              Resource.Values.fromValue(
                                                                                {
                                                                                  focusResource:
                                                                                    $resource,
                                                                                  propertyPath:
                                                                                    PropertyShape
                                                                                      .$schema
                                                                                      .properties
                                                                                      .nodes
                                                                                      .path,
                                                                                  value:
                                                                                    valuesArray,
                                                                                },
                                                                              ),
                                                                          ),
                                                                  },
                                                                ).chain(
                                                                  (nodes) =>
                                                                    $shaclPropertyFromRdf(
                                                                      {
                                                                        graph:
                                                                          _$options.graph,
                                                                        resource:
                                                                          $resource,
                                                                        propertySchema:
                                                                          $schema
                                                                            .properties
                                                                            .not,
                                                                        typeFromRdf:
                                                                          (
                                                                            resourceValues,
                                                                          ) =>
                                                                            resourceValues
                                                                              .chain(
                                                                                (
                                                                                  values,
                                                                                ) =>
                                                                                  values.chainMap(
                                                                                    (
                                                                                      value,
                                                                                    ) =>
                                                                                      value.toIdentifier(),
                                                                                  ),
                                                                              )
                                                                              .map(
                                                                                (
                                                                                  values,
                                                                                ) =>
                                                                                  values.toArray(),
                                                                              )
                                                                              .map(
                                                                                (
                                                                                  valuesArray,
                                                                                ) =>
                                                                                  Resource.Values.fromValue(
                                                                                    {
                                                                                      focusResource:
                                                                                        $resource,
                                                                                      propertyPath:
                                                                                        PropertyShape
                                                                                          .$schema
                                                                                          .properties
                                                                                          .not
                                                                                          .path,
                                                                                      value:
                                                                                        valuesArray,
                                                                                    },
                                                                                  ),
                                                                              ),
                                                                      },
                                                                    ).chain(
                                                                      (not) =>
                                                                        $shaclPropertyFromRdf(
                                                                          {
                                                                            graph:
                                                                              _$options.graph,
                                                                            resource:
                                                                              $resource,
                                                                            propertySchema:
                                                                              $schema
                                                                                .properties
                                                                                .or,
                                                                            typeFromRdf:
                                                                              (
                                                                                resourceValues,
                                                                              ) =>
                                                                                resourceValues
                                                                                  .chain(
                                                                                    (
                                                                                      values,
                                                                                    ) =>
                                                                                      values.chainMap(
                                                                                        (
                                                                                          value,
                                                                                        ) =>
                                                                                          value.toList(
                                                                                            {
                                                                                              graph:
                                                                                                _$options.graph,
                                                                                            },
                                                                                          ),
                                                                                      ),
                                                                                  )
                                                                                  .chain(
                                                                                    (
                                                                                      valueLists,
                                                                                    ) =>
                                                                                      valueLists.chainMap(
                                                                                        (
                                                                                          valueList,
                                                                                        ) =>
                                                                                          Right(
                                                                                            Resource.Values.fromArray(
                                                                                              {
                                                                                                focusResource:
                                                                                                  $resource,
                                                                                                propertyPath:
                                                                                                  PropertyShape
                                                                                                    .$schema
                                                                                                    .properties
                                                                                                    .or
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
                                                                                    (
                                                                                      valueLists,
                                                                                    ) =>
                                                                                      valueLists.map(
                                                                                        (
                                                                                          valueList,
                                                                                        ) =>
                                                                                          valueList.toArray(),
                                                                                      ),
                                                                                  )
                                                                                  .map(
                                                                                    (
                                                                                      values,
                                                                                    ) =>
                                                                                      values.toArray(),
                                                                                  )
                                                                                  .map(
                                                                                    (
                                                                                      valuesArray,
                                                                                    ) =>
                                                                                      Resource.Values.fromValue(
                                                                                        {
                                                                                          focusResource:
                                                                                            $resource,
                                                                                          propertyPath:
                                                                                            PropertyShape
                                                                                              .$schema
                                                                                              .properties
                                                                                              .or
                                                                                              .path,
                                                                                          value:
                                                                                            valuesArray,
                                                                                        },
                                                                                      ),
                                                                                  ),
                                                                          },
                                                                        ).chain(
                                                                          (
                                                                            or,
                                                                          ) =>
                                                                            $shaclPropertyFromRdf(
                                                                              {
                                                                                graph:
                                                                                  _$options.graph,
                                                                                resource:
                                                                                  $resource,
                                                                                propertySchema:
                                                                                  $schema
                                                                                    .properties
                                                                                    .order,
                                                                                typeFromRdf:
                                                                                  (
                                                                                    resourceValues,
                                                                                  ) =>
                                                                                    resourceValues
                                                                                      .chain(
                                                                                        (
                                                                                          values,
                                                                                        ) =>
                                                                                          values.chainMap(
                                                                                            (
                                                                                              value,
                                                                                            ) =>
                                                                                              value.toFloat(),
                                                                                          ),
                                                                                      )
                                                                                      .map(
                                                                                        (
                                                                                          values,
                                                                                        ) =>
                                                                                          values.length >
                                                                                          0
                                                                                            ? values.map(
                                                                                                (
                                                                                                  value,
                                                                                                ) =>
                                                                                                  Maybe.of(
                                                                                                    value,
                                                                                                  ),
                                                                                              )
                                                                                            : Resource.Values.fromValue<
                                                                                                Maybe<number>
                                                                                              >(
                                                                                                {
                                                                                                  focusResource:
                                                                                                    $resource,
                                                                                                  propertyPath:
                                                                                                    PropertyShape
                                                                                                      .$schema
                                                                                                      .properties
                                                                                                      .order
                                                                                                      .path,
                                                                                                  value:
                                                                                                    Maybe.empty(),
                                                                                                },
                                                                                              ),
                                                                                      ),
                                                                              },
                                                                            ).chain(
                                                                              (
                                                                                order,
                                                                              ) =>
                                                                                $shaclPropertyFromRdf(
                                                                                  {
                                                                                    graph:
                                                                                      _$options.graph,
                                                                                    resource:
                                                                                      $resource,
                                                                                    propertySchema:
                                                                                      $schema
                                                                                        .properties
                                                                                        .path,
                                                                                    typeFromRdf:
                                                                                      (
                                                                                        resourceValues,
                                                                                      ) =>
                                                                                        $PropertyPath.$fromRdfResourceValues(
                                                                                          resourceValues,
                                                                                          {
                                                                                            context:
                                                                                              _$options.context,
                                                                                            graph:
                                                                                              _$options.graph,
                                                                                            preferredLanguages:
                                                                                              _$options.preferredLanguages,
                                                                                            objectSet:
                                                                                              _$options.objectSet,
                                                                                            resource:
                                                                                              $resource,
                                                                                            ignoreRdfType: true,
                                                                                            propertyPath:
                                                                                              PropertyShape
                                                                                                .$schema
                                                                                                .properties
                                                                                                .path
                                                                                                .path,
                                                                                          },
                                                                                        ),
                                                                                  },
                                                                                ).chain(
                                                                                  (
                                                                                    path,
                                                                                  ) =>
                                                                                    $shaclPropertyFromRdf(
                                                                                      {
                                                                                        graph:
                                                                                          _$options.graph,
                                                                                        resource:
                                                                                          $resource,
                                                                                        propertySchema:
                                                                                          $schema
                                                                                            .properties
                                                                                            .patterns,
                                                                                        typeFromRdf:
                                                                                          (
                                                                                            resourceValues,
                                                                                          ) =>
                                                                                            resourceValues
                                                                                              .chain(
                                                                                                (
                                                                                                  values,
                                                                                                ) =>
                                                                                                  $fromRdfPreferredLanguages(
                                                                                                    values,
                                                                                                    _$options.preferredLanguages,
                                                                                                  ),
                                                                                              )
                                                                                              .chain(
                                                                                                (
                                                                                                  values,
                                                                                                ) =>
                                                                                                  values.chainMap(
                                                                                                    (
                                                                                                      value,
                                                                                                    ) =>
                                                                                                      value.toString(),
                                                                                                  ),
                                                                                              )
                                                                                              .map(
                                                                                                (
                                                                                                  values,
                                                                                                ) =>
                                                                                                  values.toArray(),
                                                                                              )
                                                                                              .map(
                                                                                                (
                                                                                                  valuesArray,
                                                                                                ) =>
                                                                                                  Resource.Values.fromValue(
                                                                                                    {
                                                                                                      focusResource:
                                                                                                        $resource,
                                                                                                      propertyPath:
                                                                                                        PropertyShape
                                                                                                          .$schema
                                                                                                          .properties
                                                                                                          .patterns
                                                                                                          .path,
                                                                                                      value:
                                                                                                        valuesArray,
                                                                                                    },
                                                                                                  ),
                                                                                              ),
                                                                                      },
                                                                                    ).chain(
                                                                                      (
                                                                                        patterns,
                                                                                      ) =>
                                                                                        $shaclPropertyFromRdf(
                                                                                          {
                                                                                            graph:
                                                                                              _$options.graph,
                                                                                            resource:
                                                                                              $resource,
                                                                                            propertySchema:
                                                                                              $schema
                                                                                                .properties
                                                                                                .resolve,
                                                                                            typeFromRdf:
                                                                                              (
                                                                                                resourceValues,
                                                                                              ) =>
                                                                                                resourceValues
                                                                                                  .chain(
                                                                                                    (
                                                                                                      values,
                                                                                                    ) =>
                                                                                                      values.chainMap(
                                                                                                        (
                                                                                                          value,
                                                                                                        ) =>
                                                                                                          value.toIdentifier(),
                                                                                                      ),
                                                                                                  )
                                                                                                  .map(
                                                                                                    (
                                                                                                      values,
                                                                                                    ) =>
                                                                                                      values.length >
                                                                                                      0
                                                                                                        ? values.map(
                                                                                                            (
                                                                                                              value,
                                                                                                            ) =>
                                                                                                              Maybe.of(
                                                                                                                value,
                                                                                                              ),
                                                                                                          )
                                                                                                        : Resource.Values.fromValue<
                                                                                                            Maybe<
                                                                                                              | BlankNode
                                                                                                              | NamedNode
                                                                                                            >
                                                                                                          >(
                                                                                                            {
                                                                                                              focusResource:
                                                                                                                $resource,
                                                                                                              propertyPath:
                                                                                                                PropertyShape
                                                                                                                  .$schema
                                                                                                                  .properties
                                                                                                                  .resolve
                                                                                                                  .path,
                                                                                                              value:
                                                                                                                Maybe.empty(),
                                                                                                            },
                                                                                                          ),
                                                                                                  ),
                                                                                          },
                                                                                        ).chain(
                                                                                          (
                                                                                            resolve,
                                                                                          ) =>
                                                                                            $shaclPropertyFromRdf(
                                                                                              {
                                                                                                graph:
                                                                                                  _$options.graph,
                                                                                                resource:
                                                                                                  $resource,
                                                                                                propertySchema:
                                                                                                  $schema
                                                                                                    .properties
                                                                                                    .shaclmateName,
                                                                                                typeFromRdf:
                                                                                                  (
                                                                                                    resourceValues,
                                                                                                  ) =>
                                                                                                    resourceValues
                                                                                                      .chain(
                                                                                                        (
                                                                                                          values,
                                                                                                        ) =>
                                                                                                          $fromRdfPreferredLanguages(
                                                                                                            values,
                                                                                                            _$options.preferredLanguages,
                                                                                                          ),
                                                                                                      )
                                                                                                      .chain(
                                                                                                        (
                                                                                                          values,
                                                                                                        ) =>
                                                                                                          values.chainMap(
                                                                                                            (
                                                                                                              value,
                                                                                                            ) =>
                                                                                                              value.toString(),
                                                                                                          ),
                                                                                                      )
                                                                                                      .map(
                                                                                                        (
                                                                                                          values,
                                                                                                        ) =>
                                                                                                          values.length >
                                                                                                          0
                                                                                                            ? values.map(
                                                                                                                (
                                                                                                                  value,
                                                                                                                ) =>
                                                                                                                  Maybe.of(
                                                                                                                    value,
                                                                                                                  ),
                                                                                                              )
                                                                                                            : Resource.Values.fromValue<
                                                                                                                Maybe<string>
                                                                                                              >(
                                                                                                                {
                                                                                                                  focusResource:
                                                                                                                    $resource,
                                                                                                                  propertyPath:
                                                                                                                    PropertyShape
                                                                                                                      .$schema
                                                                                                                      .properties
                                                                                                                      .shaclmateName
                                                                                                                      .path,
                                                                                                                  value:
                                                                                                                    Maybe.empty(),
                                                                                                                },
                                                                                                              ),
                                                                                                      ),
                                                                                              },
                                                                                            ).chain(
                                                                                              (
                                                                                                shaclmateName,
                                                                                              ) =>
                                                                                                $shaclPropertyFromRdf(
                                                                                                  {
                                                                                                    graph:
                                                                                                      _$options.graph,
                                                                                                    resource:
                                                                                                      $resource,
                                                                                                    propertySchema:
                                                                                                      $schema
                                                                                                        .properties
                                                                                                        .uniqueLang,
                                                                                                    typeFromRdf:
                                                                                                      (
                                                                                                        resourceValues,
                                                                                                      ) =>
                                                                                                        resourceValues
                                                                                                          .chain(
                                                                                                            (
                                                                                                              values,
                                                                                                            ) =>
                                                                                                              values.chainMap(
                                                                                                                (
                                                                                                                  value,
                                                                                                                ) =>
                                                                                                                  value.toBoolean(),
                                                                                                              ),
                                                                                                          )
                                                                                                          .map(
                                                                                                            (
                                                                                                              values,
                                                                                                            ) =>
                                                                                                              values.length >
                                                                                                              0
                                                                                                                ? values.map(
                                                                                                                    (
                                                                                                                      value,
                                                                                                                    ) =>
                                                                                                                      Maybe.of(
                                                                                                                        value,
                                                                                                                      ),
                                                                                                                  )
                                                                                                                : Resource.Values.fromValue<
                                                                                                                    Maybe<boolean>
                                                                                                                  >(
                                                                                                                    {
                                                                                                                      focusResource:
                                                                                                                        $resource,
                                                                                                                      propertyPath:
                                                                                                                        PropertyShape
                                                                                                                          .$schema
                                                                                                                          .properties
                                                                                                                          .uniqueLang
                                                                                                                          .path,
                                                                                                                      value:
                                                                                                                        Maybe.empty(),
                                                                                                                    },
                                                                                                                  ),
                                                                                                          ),
                                                                                                  },
                                                                                                ).chain(
                                                                                                  (
                                                                                                    uniqueLang,
                                                                                                  ) =>
                                                                                                    $shaclPropertyFromRdf(
                                                                                                      {
                                                                                                        graph:
                                                                                                          _$options.graph,
                                                                                                        resource:
                                                                                                          $resource,
                                                                                                        propertySchema:
                                                                                                          $schema
                                                                                                            .properties
                                                                                                            .visibility,
                                                                                                        typeFromRdf:
                                                                                                          (
                                                                                                            resourceValues,
                                                                                                          ) =>
                                                                                                            resourceValues
                                                                                                              .chain(
                                                                                                                (
                                                                                                                  values,
                                                                                                                ) =>
                                                                                                                  values.chainMap(
                                                                                                                    (
                                                                                                                      value,
                                                                                                                    ) =>
                                                                                                                      value.toIri(
                                                                                                                        [
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
                                                                                                                      ),
                                                                                                                  ),
                                                                                                              )
                                                                                                              .map(
                                                                                                                (
                                                                                                                  values,
                                                                                                                ) =>
                                                                                                                  values.length >
                                                                                                                  0
                                                                                                                    ? values.map(
                                                                                                                        (
                                                                                                                          value,
                                                                                                                        ) =>
                                                                                                                          Maybe.of(
                                                                                                                            value,
                                                                                                                          ),
                                                                                                                      )
                                                                                                                    : Resource.Values.fromValue<
                                                                                                                        Maybe<
                                                                                                                          NamedNode<
                                                                                                                            | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                                                                                                                            | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                                                                                                                            | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                                                                                                                          >
                                                                                                                        >
                                                                                                                      >(
                                                                                                                        {
                                                                                                                          focusResource:
                                                                                                                            $resource,
                                                                                                                          propertyPath:
                                                                                                                            PropertyShape
                                                                                                                              .$schema
                                                                                                                              .properties
                                                                                                                              .visibility
                                                                                                                              .path,
                                                                                                                          value:
                                                                                                                            Maybe.empty(),
                                                                                                                        },
                                                                                                                      ),
                                                                                                              ),
                                                                                                      },
                                                                                                    ).chain(
                                                                                                      (
                                                                                                        visibility,
                                                                                                      ) =>
                                                                                                        $shaclPropertyFromRdf(
                                                                                                          {
                                                                                                            graph:
                                                                                                              _$options.graph,
                                                                                                            resource:
                                                                                                              $resource,
                                                                                                            propertySchema:
                                                                                                              $schema
                                                                                                                .properties
                                                                                                                .xone,
                                                                                                            typeFromRdf:
                                                                                                              (
                                                                                                                resourceValues,
                                                                                                              ) =>
                                                                                                                resourceValues
                                                                                                                  .chain(
                                                                                                                    (
                                                                                                                      values,
                                                                                                                    ) =>
                                                                                                                      values.chainMap(
                                                                                                                        (
                                                                                                                          value,
                                                                                                                        ) =>
                                                                                                                          value.toList(
                                                                                                                            {
                                                                                                                              graph:
                                                                                                                                _$options.graph,
                                                                                                                            },
                                                                                                                          ),
                                                                                                                      ),
                                                                                                                  )
                                                                                                                  .chain(
                                                                                                                    (
                                                                                                                      valueLists,
                                                                                                                    ) =>
                                                                                                                      valueLists.chainMap(
                                                                                                                        (
                                                                                                                          valueList,
                                                                                                                        ) =>
                                                                                                                          Right(
                                                                                                                            Resource.Values.fromArray(
                                                                                                                              {
                                                                                                                                focusResource:
                                                                                                                                  $resource,
                                                                                                                                propertyPath:
                                                                                                                                  PropertyShape
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
                                                                                                                    (
                                                                                                                      valueLists,
                                                                                                                    ) =>
                                                                                                                      valueLists.map(
                                                                                                                        (
                                                                                                                          valueList,
                                                                                                                        ) =>
                                                                                                                          valueList.toArray(),
                                                                                                                      ),
                                                                                                                  )
                                                                                                                  .map(
                                                                                                                    (
                                                                                                                      values,
                                                                                                                    ) =>
                                                                                                                      values.toArray(),
                                                                                                                  )
                                                                                                                  .map(
                                                                                                                    (
                                                                                                                      valuesArray,
                                                                                                                    ) =>
                                                                                                                      Resource.Values.fromValue(
                                                                                                                        {
                                                                                                                          focusResource:
                                                                                                                            $resource,
                                                                                                                          propertyPath:
                                                                                                                            PropertyShape
                                                                                                                              .$schema
                                                                                                                              .properties
                                                                                                                              .xone
                                                                                                                              .path,
                                                                                                                          value:
                                                                                                                            valuesArray,
                                                                                                                        },
                                                                                                                      ),
                                                                                                                  ),
                                                                                                          },
                                                                                                        ).map(
                                                                                                          (
                                                                                                            xone,
                                                                                                          ) => ({
                                                                                                            $identifier,
                                                                                                            $type,
                                                                                                            and,
                                                                                                            classes,
                                                                                                            comments,
                                                                                                            datatype,
                                                                                                            deactivated,
                                                                                                            defaultValue,
                                                                                                            description,
                                                                                                            flags,
                                                                                                            groups,
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
                                                                                                            mutable,
                                                                                                            name,
                                                                                                            nodeKind,
                                                                                                            nodes,
                                                                                                            not,
                                                                                                            or,
                                                                                                            order,
                                                                                                            path,
                                                                                                            patterns,
                                                                                                            resolve,
                                                                                                            shaclmateName,
                                                                                                            uniqueLang,
                                                                                                            visibility,
                                                                                                            xone,
                                                                                                          }),
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
  };

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["PropertyShape"],
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
      defaultValue: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
      },
      description: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      groups: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
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
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
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
        type: () => $PropertyPath.$schema,
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
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
      shaclmateName: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      },
      uniqueLang: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
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

  export function $toRdfResource(
    _propertyShape: PropertyShape,
    options?: Parameters<$ToRdfResourceFunction<PropertyShape>>[1],
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_propertyShape.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyShape"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      _propertyShape.and.flatMap((item) => [
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
      _propertyShape.classes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      _propertyShape.comments.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      _propertyShape.datatype.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      _propertyShape.deactivated
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
      _propertyShape.defaultValue.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
      _propertyShape.description
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      _propertyShape.flags.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
      _propertyShape.groups.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      _propertyShape.hasValues.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      _propertyShape.in_.toList().flatMap((value) => [
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
      _propertyShape.isDefinedBy.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _propertyShape.labels.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      _propertyShape.languageIn.toList().flatMap((value) => [
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
      _propertyShape.maxCount
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      _propertyShape.maxExclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      _propertyShape.maxInclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      _propertyShape.maxLength
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      _propertyShape.minCount
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      _propertyShape.minExclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      _propertyShape.minInclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      _propertyShape.minLength
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
      _propertyShape.mutable
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
      _propertyShape.name
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      _propertyShape.nodeKind.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      _propertyShape.nodes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      _propertyShape.not.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      _propertyShape.or.flatMap((item) => [
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
      _propertyShape.order
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      [
        $PropertyPath.$toRdfResource(_propertyShape.path, {
          graph: options?.graph,
          resourceSet: resourceSet,
        }).identifier,
      ],
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      _propertyShape.patterns.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#resolve"),
      _propertyShape.resolve.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      _propertyShape.shaclmateName
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
      _propertyShape.uniqueLang
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#visibility"),
      _propertyShape.visibility.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      _propertyShape.xone.flatMap((item) => [
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
}
export interface PropertyGroup {
  readonly $identifier: PropertyGroup.$Identifier;
  readonly $type: "PropertyGroup";
  readonly comments: readonly string[];
  readonly labels: readonly string[];
}

export namespace PropertyGroup {
  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function $filter(
    filter: PropertyGroup.$Filter,
    value: PropertyGroup,
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

  export const $fromRdfResource: $FromRdfResourceFunction<PropertyGroup> = (
    resource,
    options,
  ) => {
    let {
      context,
      graph,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return PropertyGroup.$propertiesFromRdfResource(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
    });
  };

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    PropertyGroup
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) =>
            PropertyGroup.$fromRdfResource(resource, options),
          ),
      ),
    );

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyGroup",
  );

  export function isPropertyGroup(object: $Object): object is PropertyGroup {
    switch (object.$type) {
      case "PropertyGroup":
        return true;
      default:
        return false;
    }
  }

  export const $propertiesFromRdfResource: $PropertiesFromRdfResourceFunction<{
    $identifier: BlankNode | NamedNode;
    $type: "PropertyGroup";
    comments: readonly string[];
    labels: readonly string[];
  }> = ($resource, _$options) => {
    return (
      !_$options.ignoreRdfType
        ? $resource
            .value($RdfVocabularies.rdf.type, { graph: _$options.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyGroup":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $resource.isInstanceOf(PropertyGroup.$fromRdfType, {
                  graph: _$options.graph,
                })
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
                ),
              );
            })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      Right(
        new Resource.Value({
          dataFactory: dataFactory,
          focusResource: $resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          term: $resource.identifier,
        }).toValues(),
      )
        .chain((values) => values.chainMap((value) => value.toIdentifier()))
        .chain((values) => values.head())
        .chain(($identifier) =>
          Right<"PropertyGroup">("PropertyGroup" as const).chain(($type) =>
            $shaclPropertyFromRdf({
              graph: _$options.graph,
              resource: $resource,
              propertySchema: $schema.properties.comments,
              typeFromRdf: (resourceValues) =>
                resourceValues
                  .chain((values) =>
                    $fromRdfPreferredLanguages(
                      values,
                      _$options.preferredLanguages,
                    ),
                  )
                  .chain((values) =>
                    values.chainMap((value) => value.toString()),
                  )
                  .map((values) => values.toArray())
                  .map((valuesArray) =>
                    Resource.Values.fromValue({
                      focusResource: $resource,
                      propertyPath:
                        PropertyGroup.$schema.properties.comments.path,
                      value: valuesArray,
                    }),
                  ),
            }).chain((comments) =>
              $shaclPropertyFromRdf({
                graph: _$options.graph,
                resource: $resource,
                propertySchema: $schema.properties.labels,
                typeFromRdf: (resourceValues) =>
                  resourceValues
                    .chain((values) =>
                      $fromRdfPreferredLanguages(
                        values,
                        _$options.preferredLanguages,
                      ),
                    )
                    .chain((values) =>
                      values.chainMap((value) => value.toString()),
                    )
                    .map((values) => values.toArray())
                    .map((valuesArray) =>
                      Resource.Values.fromValue({
                        focusResource: $resource,
                        propertyPath:
                          PropertyGroup.$schema.properties.labels.path,
                        value: valuesArray,
                      }),
                    ),
              }).map((labels) => ({ $identifier, $type, comments, labels })),
            ),
          ),
        ),
    );
  };

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["PropertyGroup"],
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

  export function $toRdfResource(
    _propertyGroup: PropertyGroup,
    options?: Parameters<$ToRdfResourceFunction<PropertyGroup>>[1],
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_propertyGroup.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyGroup"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      _propertyGroup.comments.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _propertyGroup.labels.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    return resource;
  }
}
export interface Ontology {
  readonly $identifier: Ontology.$Identifier;
  readonly $type: "Ontology";
  readonly labels: readonly string[];
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

export namespace Ontology {
  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function $filter(filter: Ontology.$Filter, value: Ontology): boolean {
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
    readonly labels?: $CollectionFilter<$StringFilter>;
    readonly tsFeatureExcludes?: $CollectionFilter<$IriFilter>;
    readonly tsFeatureIncludes?: $CollectionFilter<$IriFilter>;
    readonly tsImports?: $CollectionFilter<$StringFilter>;
    readonly tsObjectDeclarationType?: $MaybeFilter<$IriFilter>;
  };

  export const $fromRdfResource: $FromRdfResourceFunction<Ontology> = (
    resource,
    options,
  ) => {
    let {
      context,
      graph,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return Ontology.$propertiesFromRdfResource(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
    });
  };

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    Ontology
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => Ontology.$fromRdfResource(resource, options)),
      ),
    );

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );

  export function isOntology(object: $Object): object is Ontology {
    switch (object.$type) {
      case "Ontology":
        return true;
      default:
        return false;
    }
  }

  export const $propertiesFromRdfResource: $PropertiesFromRdfResourceFunction<{
    $identifier: BlankNode | NamedNode;
    $type: "Ontology";
    labels: readonly string[];
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
  }> = ($resource, _$options) => {
    return (
      !_$options.ignoreRdfType
        ? $resource
            .value($RdfVocabularies.rdf.type, { graph: _$options.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/2002/07/owl#Ontology":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $resource.isInstanceOf(Ontology.$fromRdfType, {
                  graph: _$options.graph,
                })
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
                ),
              );
            })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      Right(
        new Resource.Value({
          dataFactory: dataFactory,
          focusResource: $resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          term: $resource.identifier,
        }).toValues(),
      )
        .chain((values) => values.chainMap((value) => value.toIdentifier()))
        .chain((values) => values.head())
        .chain(($identifier) =>
          Right<"Ontology">("Ontology" as const).chain(($type) =>
            $shaclPropertyFromRdf({
              graph: _$options.graph,
              resource: $resource,
              propertySchema: $schema.properties.labels,
              typeFromRdf: (resourceValues) =>
                resourceValues
                  .chain((values) =>
                    $fromRdfPreferredLanguages(
                      values,
                      _$options.preferredLanguages,
                    ),
                  )
                  .chain((values) =>
                    values.chainMap((value) => value.toString()),
                  )
                  .map((values) => values.toArray())
                  .map((valuesArray) =>
                    Resource.Values.fromValue({
                      focusResource: $resource,
                      propertyPath: Ontology.$schema.properties.labels.path,
                      value: valuesArray,
                    }),
                  ),
            }).chain((labels) =>
              $shaclPropertyFromRdf({
                graph: _$options.graph,
                resource: $resource,
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
                        focusResource: $resource,
                        propertyPath:
                          Ontology.$schema.properties.tsFeatureExcludes.path,
                        value: valuesArray,
                      }),
                    ),
              }).chain((tsFeatureExcludes) =>
                $shaclPropertyFromRdf({
                  graph: _$options.graph,
                  resource: $resource,
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
                          focusResource: $resource,
                          propertyPath:
                            Ontology.$schema.properties.tsFeatureIncludes.path,
                          value: valuesArray,
                        }),
                      ),
                }).chain((tsFeatureIncludes) =>
                  $shaclPropertyFromRdf({
                    graph: _$options.graph,
                    resource: $resource,
                    propertySchema: $schema.properties.tsImports,
                    typeFromRdf: (resourceValues) =>
                      resourceValues
                        .chain((values) =>
                          $fromRdfPreferredLanguages(
                            values,
                            _$options.preferredLanguages,
                          ),
                        )
                        .chain((values) =>
                          values.chainMap((value) => value.toString()),
                        )
                        .map((values) => values.toArray())
                        .map((valuesArray) =>
                          Resource.Values.fromValue({
                            focusResource: $resource,
                            propertyPath:
                              Ontology.$schema.properties.tsImports.path,
                            value: valuesArray,
                          }),
                        ),
                  }).chain((tsImports) =>
                    $shaclPropertyFromRdf({
                      graph: _$options.graph,
                      resource: $resource,
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
                                  focusResource: $resource,
                                  propertyPath:
                                    Ontology.$schema.properties
                                      .tsObjectDeclarationType.path,
                                  value: Maybe.empty(),
                                }),
                          ),
                    }).map((tsObjectDeclarationType) => ({
                      $identifier,
                      $type,
                      labels,
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
  };

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["Ontology"],
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

  export function $toRdfResource(
    _ontology: Ontology,
    options?: Parameters<$ToRdfResourceFunction<Ontology>>[1],
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_ontology.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _ontology.labels.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
      _ontology.tsFeatureExcludes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
      _ontology.tsFeatureIncludes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
      _ontology.tsImports.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
      _ontology.tsObjectDeclarationType.toList(),
      options?.graph,
    );
    return resource;
  }
}
export interface NodeShape {
  readonly $identifier: NodeShape.$Identifier;
  readonly $type: "NodeShape";
  readonly abstract: Maybe<boolean>;
  readonly and: readonly (readonly (BlankNode | NamedNode)[])[];
  readonly classes: readonly NamedNode[];
  readonly closed: Maybe<boolean>;
  readonly comments: readonly string[];
  readonly datatype: Maybe<NamedNode>;
  readonly deactivated: Maybe<boolean>;
  readonly discriminantValue: Maybe<string>;
  readonly extern: Maybe<boolean>;
  readonly flags: readonly string[];
  readonly fromRdfType: Maybe<NamedNode>;
  readonly hasValues: readonly (NamedNode | Literal)[];
  readonly identifierMintingStrategy: Maybe<
    NamedNode<
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
    >
  >;
  readonly ignoredProperties: Maybe<readonly NamedNode[]>;
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
  readonly mutable: Maybe<boolean>;
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
  readonly properties: readonly (BlankNode | NamedNode)[];
  readonly rdfType: Maybe<NamedNode>;
  readonly shaclmateName: Maybe<string>;
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
  readonly xone: readonly (readonly (BlankNode | NamedNode)[])[];
}

export namespace NodeShape {
  export type $Identifier = BlankNode | NamedNode;

  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export function $filter(
    filter: NodeShape.$Filter,
    value: NodeShape,
  ): boolean {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
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
      filter.closed !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.closed,
        value.closed,
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
      filter.discriminantValue !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.discriminantValue,
        value.discriminantValue,
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
      filter.flags !== undefined &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.flags,
        value.flags,
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
      filter.hasValues !== undefined &&
      !$filterArray<NamedNode | Literal, $TermFilter>($filterTerm)(
        filter.hasValues,
        value.hasValues,
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
      filter.ignoredProperties !== undefined &&
      !$filterMaybe<readonly NamedNode[], $CollectionFilter<$IriFilter>>(
        $filterArray<NamedNode, $IriFilter>($filterIri),
      )(filter.ignoredProperties, value.ignoredProperties)
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
      filter.mutable !== undefined &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.mutable,
        value.mutable,
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
      filter.properties !== undefined &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.properties, value.properties)
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
      filter.shaclmateName !== undefined &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.shaclmateName,
        value.shaclmateName,
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
    readonly abstract?: $MaybeFilter<$BooleanFilter>;
    readonly and?: $CollectionFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly classes?: $CollectionFilter<$IriFilter>;
    readonly closed?: $MaybeFilter<$BooleanFilter>;
    readonly comments?: $CollectionFilter<$StringFilter>;
    readonly datatype?: $MaybeFilter<$IriFilter>;
    readonly deactivated?: $MaybeFilter<$BooleanFilter>;
    readonly discriminantValue?: $MaybeFilter<$StringFilter>;
    readonly extern?: $MaybeFilter<$BooleanFilter>;
    readonly flags?: $CollectionFilter<$StringFilter>;
    readonly fromRdfType?: $MaybeFilter<$IriFilter>;
    readonly hasValues?: $CollectionFilter<$TermFilter>;
    readonly identifierMintingStrategy?: $MaybeFilter<$IriFilter>;
    readonly ignoredProperties?: $MaybeFilter<$CollectionFilter<$IriFilter>>;
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
    readonly mutable?: $MaybeFilter<$BooleanFilter>;
    readonly nodeKind?: $MaybeFilter<$IriFilter>;
    readonly nodes?: $CollectionFilter<$IdentifierFilter>;
    readonly not?: $CollectionFilter<$IdentifierFilter>;
    readonly or?: $CollectionFilter<$CollectionFilter<$IdentifierFilter>>;
    readonly patterns?: $CollectionFilter<$StringFilter>;
    readonly properties?: $CollectionFilter<$IdentifierFilter>;
    readonly rdfType?: $MaybeFilter<$IriFilter>;
    readonly shaclmateName?: $MaybeFilter<$StringFilter>;
    readonly toRdfTypes?: $CollectionFilter<$IriFilter>;
    readonly tsFeatureExcludes?: $CollectionFilter<$IriFilter>;
    readonly tsFeatureIncludes?: $CollectionFilter<$IriFilter>;
    readonly tsImports?: $CollectionFilter<$StringFilter>;
    readonly tsObjectDeclarationType?: $MaybeFilter<$IriFilter>;
    readonly xone?: $CollectionFilter<$CollectionFilter<$IdentifierFilter>>;
  };

  export const $fromRdfResource: $FromRdfResourceFunction<NodeShape> = (
    resource,
    options,
  ) => {
    let {
      context,
      graph,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return NodeShape.$propertiesFromRdfResource(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
    });
  };

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    NodeShape
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => NodeShape.$fromRdfResource(resource, options)),
      ),
    );

  export const $fromRdfType: NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );

  export function isNodeShape(object: $Object): object is NodeShape {
    switch (object.$type) {
      case "NodeShape":
        return true;
      default:
        return false;
    }
  }

  export const $propertiesFromRdfResource: $PropertiesFromRdfResourceFunction<{
    $identifier: BlankNode | NamedNode;
    $type: "NodeShape";
    abstract: Maybe<boolean>;
    and: readonly (readonly (BlankNode | NamedNode)[])[];
    classes: readonly NamedNode[];
    closed: Maybe<boolean>;
    comments: readonly string[];
    datatype: Maybe<NamedNode>;
    deactivated: Maybe<boolean>;
    discriminantValue: Maybe<string>;
    extern: Maybe<boolean>;
    flags: readonly string[];
    fromRdfType: Maybe<NamedNode>;
    hasValues: readonly (NamedNode | Literal)[];
    identifierMintingStrategy: Maybe<
      NamedNode<
        | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
        | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
        | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
      >
    >;
    ignoredProperties: Maybe<readonly NamedNode[]>;
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
    mutable: Maybe<boolean>;
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
    properties: readonly (BlankNode | NamedNode)[];
    rdfType: Maybe<NamedNode>;
    shaclmateName: Maybe<string>;
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
    xone: readonly (readonly (BlankNode | NamedNode)[])[];
  }> = ($resource, _$options) => {
    return (
      !_$options.ignoreRdfType
        ? $resource
            .value($RdfVocabularies.rdf.type, { graph: _$options.graph })
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#NodeShape":
                  return Right(true as const);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $resource.isInstanceOf(NodeShape.$fromRdfType, {
                  graph: _$options.graph,
                })
              ) {
                return Right(true as const);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
                ),
              );
            })
        : Right(true as const)
    ).chain((_rdfTypeCheck) =>
      Right(
        new Resource.Value({
          dataFactory: dataFactory,
          focusResource: $resource,
          propertyPath: $RdfVocabularies.rdf.subject,
          term: $resource.identifier,
        }).toValues(),
      )
        .chain((values) => values.chainMap((value) => value.toIdentifier()))
        .chain((values) => values.head())
        .chain(($identifier) =>
          Right<"NodeShape">("NodeShape" as const).chain(($type) =>
            $shaclPropertyFromRdf({
              graph: _$options.graph,
              resource: $resource,
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
                          focusResource: $resource,
                          propertyPath:
                            NodeShape.$schema.properties.abstract.path,
                          value: Maybe.empty(),
                        }),
                  ),
            }).chain((abstract) =>
              $shaclPropertyFromRdf({
                graph: _$options.graph,
                resource: $resource,
                propertySchema: $schema.properties.and,
                typeFromRdf: (resourceValues) =>
                  resourceValues
                    .chain((values) =>
                      values.chainMap((value) =>
                        value.toList({ graph: _$options.graph }),
                      ),
                    )
                    .chain((valueLists) =>
                      valueLists.chainMap((valueList) =>
                        Right(
                          Resource.Values.fromArray({
                            focusResource: $resource,
                            propertyPath:
                              PropertyShape.$schema.properties.and.path,
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
                        focusResource: $resource,
                        propertyPath: PropertyShape.$schema.properties.and.path,
                        value: valuesArray,
                      }),
                    ),
              }).chain((and) =>
                $shaclPropertyFromRdf({
                  graph: _$options.graph,
                  resource: $resource,
                  propertySchema: $schema.properties.classes,
                  typeFromRdf: (resourceValues) =>
                    resourceValues
                      .chain((values) =>
                        values.chainMap((value) => value.toIri()),
                      )
                      .map((values) => values.toArray())
                      .map((valuesArray) =>
                        Resource.Values.fromValue({
                          focusResource: $resource,
                          propertyPath:
                            PropertyShape.$schema.properties.classes.path,
                          value: valuesArray,
                        }),
                      ),
                }).chain((classes) =>
                  $shaclPropertyFromRdf({
                    graph: _$options.graph,
                    resource: $resource,
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
                                focusResource: $resource,
                                propertyPath:
                                  NodeShape.$schema.properties.closed.path,
                                value: Maybe.empty(),
                              }),
                        ),
                  }).chain((closed) =>
                    $shaclPropertyFromRdf({
                      graph: _$options.graph,
                      resource: $resource,
                      propertySchema: $schema.properties.comments,
                      typeFromRdf: (resourceValues) =>
                        resourceValues
                          .chain((values) =>
                            $fromRdfPreferredLanguages(
                              values,
                              _$options.preferredLanguages,
                            ),
                          )
                          .chain((values) =>
                            values.chainMap((value) => value.toString()),
                          )
                          .map((values) => values.toArray())
                          .map((valuesArray) =>
                            Resource.Values.fromValue({
                              focusResource: $resource,
                              propertyPath:
                                PropertyShape.$schema.properties.comments.path,
                              value: valuesArray,
                            }),
                          ),
                    }).chain((comments) =>
                      $shaclPropertyFromRdf({
                        graph: _$options.graph,
                        resource: $resource,
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
                                    focusResource: $resource,
                                    propertyPath:
                                      PropertyShape.$schema.properties.datatype
                                        .path,
                                    value: Maybe.empty(),
                                  }),
                            ),
                      }).chain((datatype) =>
                        $shaclPropertyFromRdf({
                          graph: _$options.graph,
                          resource: $resource,
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
                                      focusResource: $resource,
                                      propertyPath:
                                        PropertyShape.$schema.properties
                                          .deactivated.path,
                                      value: Maybe.empty(),
                                    }),
                              ),
                        }).chain((deactivated) =>
                          $shaclPropertyFromRdf({
                            graph: _$options.graph,
                            resource: $resource,
                            propertySchema:
                              $schema.properties.discriminantValue,
                            typeFromRdf: (resourceValues) =>
                              resourceValues
                                .chain((values) =>
                                  $fromRdfPreferredLanguages(
                                    values,
                                    _$options.preferredLanguages,
                                  ),
                                )
                                .chain((values) =>
                                  values.chainMap((value) => value.toString()),
                                )
                                .map((values) =>
                                  values.length > 0
                                    ? values.map((value) => Maybe.of(value))
                                    : Resource.Values.fromValue<Maybe<string>>({
                                        focusResource: $resource,
                                        propertyPath:
                                          NodeShape.$schema.properties
                                            .discriminantValue.path,
                                        value: Maybe.empty(),
                                      }),
                                ),
                          }).chain((discriminantValue) =>
                            $shaclPropertyFromRdf({
                              graph: _$options.graph,
                              resource: $resource,
                              propertySchema: $schema.properties.extern,
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
                                          focusResource: $resource,
                                          propertyPath:
                                            NodeShape.$schema.properties.extern
                                              .path,
                                          value: Maybe.empty(),
                                        }),
                                  ),
                            }).chain((extern) =>
                              $shaclPropertyFromRdf({
                                graph: _$options.graph,
                                resource: $resource,
                                propertySchema: $schema.properties.flags,
                                typeFromRdf: (resourceValues) =>
                                  resourceValues
                                    .chain((values) =>
                                      $fromRdfPreferredLanguages(
                                        values,
                                        _$options.preferredLanguages,
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
                                        focusResource: $resource,
                                        propertyPath:
                                          PropertyShape.$schema.properties.flags
                                            .path,
                                        value: valuesArray,
                                      }),
                                    ),
                              }).chain((flags) =>
                                $shaclPropertyFromRdf({
                                  graph: _$options.graph,
                                  resource: $resource,
                                  propertySchema:
                                    $schema.properties.fromRdfType,
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
                                              focusResource: $resource,
                                              propertyPath:
                                                NodeShape.$schema.properties
                                                  .fromRdfType.path,
                                              value: Maybe.empty(),
                                            }),
                                      ),
                                }).chain((fromRdfType) =>
                                  $shaclPropertyFromRdf({
                                    graph: _$options.graph,
                                    resource: $resource,
                                    propertySchema:
                                      $schema.properties.hasValues,
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
                                                          $resource,
                                                        propertyPath:
                                                          PropertyShape.$schema
                                                            .properties
                                                            .hasValues.path,
                                                      },
                                                    ),
                                                  );
                                              }
                                            }),
                                          ),
                                        )
                                        .map((values) => values.toArray())
                                        .map((valuesArray) =>
                                          Resource.Values.fromValue({
                                            focusResource: $resource,
                                            propertyPath:
                                              PropertyShape.$schema.properties
                                                .hasValues.path,
                                            value: valuesArray,
                                          }),
                                        ),
                                  }).chain((hasValues) =>
                                    $shaclPropertyFromRdf({
                                      graph: _$options.graph,
                                      resource: $resource,
                                      propertySchema:
                                        $schema.properties
                                          .identifierMintingStrategy,
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
                                              ? values.map((value) =>
                                                  Maybe.of(value),
                                                )
                                              : Resource.Values.fromValue<
                                                  Maybe<
                                                    NamedNode<
                                                      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                                                      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                                                      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                                                    >
                                                  >
                                                >({
                                                  focusResource: $resource,
                                                  propertyPath:
                                                    NodeShape.$schema.properties
                                                      .identifierMintingStrategy
                                                      .path,
                                                  value: Maybe.empty(),
                                                }),
                                          ),
                                    }).chain((identifierMintingStrategy) =>
                                      $shaclPropertyFromRdf({
                                        graph: _$options.graph,
                                        resource: $resource,
                                        propertySchema:
                                          $schema.properties.ignoredProperties,
                                        typeFromRdf: (resourceValues) =>
                                          resourceValues
                                            .chain((values) =>
                                              values.chainMap((value) =>
                                                value.toList({
                                                  graph: _$options.graph,
                                                }),
                                              ),
                                            )
                                            .chain((valueLists) =>
                                              valueLists.chainMap((valueList) =>
                                                Right(
                                                  Resource.Values.fromArray({
                                                    focusResource: $resource,
                                                    propertyPath:
                                                      NodeShape.$schema
                                                        .properties
                                                        .ignoredProperties.path,
                                                    values: valueList.toArray(),
                                                  }),
                                                ).chain((values) =>
                                                  values.chainMap((value) =>
                                                    value.toIri(),
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
                                                ? values.map((value) =>
                                                    Maybe.of(value),
                                                  )
                                                : Resource.Values.fromValue<
                                                    Maybe<readonly NamedNode[]>
                                                  >({
                                                    focusResource: $resource,
                                                    propertyPath:
                                                      NodeShape.$schema
                                                        .properties
                                                        .ignoredProperties.path,
                                                    value: Maybe.empty(),
                                                  }),
                                            ),
                                      }).chain((ignoredProperties) =>
                                        $shaclPropertyFromRdf({
                                          graph: _$options.graph,
                                          resource: $resource,
                                          propertySchema:
                                            $schema.properties.in_,
                                          typeFromRdf: (resourceValues) =>
                                            resourceValues
                                              .chain((values) =>
                                                values.chainMap((value) =>
                                                  value.toList({
                                                    graph: _$options.graph,
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
                                                            $resource,
                                                          propertyPath:
                                                            PropertyShape
                                                              .$schema
                                                              .properties.in_
                                                              .path,
                                                          values:
                                                            valueList.toArray(),
                                                        },
                                                      ),
                                                    ).chain((values) =>
                                                      values.chainMap((value) =>
                                                        value
                                                          .toTerm()
                                                          .chain((term) => {
                                                            switch (
                                                              term.termType
                                                            ) {
                                                              case "NamedNode":
                                                              case "Literal":
                                                                return Either.of<
                                                                  Error,
                                                                  | NamedNode
                                                                  | Literal
                                                                >(term);
                                                              default:
                                                                return Left<
                                                                  Error,
                                                                  | NamedNode
                                                                  | Literal
                                                                >(
                                                                  new Resource.MistypedTermValueError(
                                                                    {
                                                                      actualValue:
                                                                        term,
                                                                      expectedValueType:
                                                                        "(NamedNode | Literal)",
                                                                      focusResource:
                                                                        $resource,
                                                                      propertyPath:
                                                                        PropertyShape
                                                                          .$schema
                                                                          .properties
                                                                          .in_
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
                                                  ? values.map((value) =>
                                                      Maybe.of(value),
                                                    )
                                                  : Resource.Values.fromValue<
                                                      Maybe<
                                                        readonly (
                                                          | NamedNode
                                                          | Literal
                                                        )[]
                                                      >
                                                    >({
                                                      focusResource: $resource,
                                                      propertyPath:
                                                        PropertyShape.$schema
                                                          .properties.in_.path,
                                                      value: Maybe.empty(),
                                                    }),
                                              ),
                                        }).chain((in_) =>
                                          $shaclPropertyFromRdf({
                                            graph: _$options.graph,
                                            resource: $resource,
                                            propertySchema:
                                              $schema.properties.isDefinedBy,
                                            typeFromRdf: (resourceValues) =>
                                              resourceValues
                                                .chain((values) =>
                                                  values.chainMap((value) =>
                                                    value.toIdentifier(),
                                                  ),
                                                )
                                                .map((values) =>
                                                  values.length > 0
                                                    ? values.map((value) =>
                                                        Maybe.of(value),
                                                      )
                                                    : Resource.Values.fromValue<
                                                        Maybe<
                                                          BlankNode | NamedNode
                                                        >
                                                      >({
                                                        focusResource:
                                                          $resource,
                                                        propertyPath:
                                                          PropertyShape.$schema
                                                            .properties
                                                            .isDefinedBy.path,
                                                        value: Maybe.empty(),
                                                      }),
                                                ),
                                          }).chain((isDefinedBy) =>
                                            $shaclPropertyFromRdf({
                                              graph: _$options.graph,
                                              resource: $resource,
                                              propertySchema:
                                                $schema.properties.labels,
                                              typeFromRdf: (resourceValues) =>
                                                resourceValues
                                                  .chain((values) =>
                                                    $fromRdfPreferredLanguages(
                                                      values,
                                                      _$options.preferredLanguages,
                                                    ),
                                                  )
                                                  .chain((values) =>
                                                    values.chainMap((value) =>
                                                      value.toString(),
                                                    ),
                                                  )
                                                  .map((values) =>
                                                    values.toArray(),
                                                  )
                                                  .map((valuesArray) =>
                                                    Resource.Values.fromValue({
                                                      focusResource: $resource,
                                                      propertyPath:
                                                        PropertyShape.$schema
                                                          .properties.labels
                                                          .path,
                                                      value: valuesArray,
                                                    }),
                                                  ),
                                            }).chain((labels) =>
                                              $shaclPropertyFromRdf({
                                                graph: _$options.graph,
                                                resource: $resource,
                                                propertySchema:
                                                  $schema.properties.languageIn,
                                                typeFromRdf: (resourceValues) =>
                                                  resourceValues
                                                    .chain((values) =>
                                                      values.chainMap((value) =>
                                                        value.toList({
                                                          graph:
                                                            _$options.graph,
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
                                                                  $resource,
                                                                propertyPath:
                                                                  PropertyShape
                                                                    .$schema
                                                                    .properties
                                                                    .languageIn
                                                                    .path,
                                                                values:
                                                                  valueList.toArray(),
                                                              },
                                                            ),
                                                          )
                                                            .chain((values) =>
                                                              $fromRdfPreferredLanguages(
                                                                values,
                                                                _$options.preferredLanguages,
                                                              ),
                                                            )
                                                            .chain((values) =>
                                                              values.chainMap(
                                                                (value) =>
                                                                  value.toString(),
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
                                                      values.length > 0
                                                        ? values.map((value) =>
                                                            Maybe.of(value),
                                                          )
                                                        : Resource.Values.fromValue<
                                                            Maybe<
                                                              readonly string[]
                                                            >
                                                          >({
                                                            focusResource:
                                                              $resource,
                                                            propertyPath:
                                                              PropertyShape
                                                                .$schema
                                                                .properties
                                                                .languageIn
                                                                .path,
                                                            value:
                                                              Maybe.empty(),
                                                          }),
                                                    ),
                                              }).chain((languageIn) =>
                                                $shaclPropertyFromRdf({
                                                  graph: _$options.graph,
                                                  resource: $resource,
                                                  propertySchema:
                                                    $schema.properties.maxCount,
                                                  typeFromRdf: (
                                                    resourceValues,
                                                  ) =>
                                                    resourceValues
                                                      .chain((values) =>
                                                        values.chainMap(
                                                          (value) =>
                                                            value.toInt(),
                                                        ),
                                                      )
                                                      .map((values) =>
                                                        values.length > 0
                                                          ? values.map(
                                                              (value) =>
                                                                Maybe.of(value),
                                                            )
                                                          : Resource.Values.fromValue<
                                                              Maybe<number>
                                                            >({
                                                              focusResource:
                                                                $resource,
                                                              propertyPath:
                                                                PropertyShape
                                                                  .$schema
                                                                  .properties
                                                                  .maxCount
                                                                  .path,
                                                              value:
                                                                Maybe.empty(),
                                                            }),
                                                      ),
                                                }).chain((maxCount) =>
                                                  $shaclPropertyFromRdf({
                                                    graph: _$options.graph,
                                                    resource: $resource,
                                                    propertySchema:
                                                      $schema.properties
                                                        .maxExclusive,
                                                    typeFromRdf: (
                                                      resourceValues,
                                                    ) =>
                                                      resourceValues
                                                        .chain((values) =>
                                                          $fromRdfPreferredLanguages(
                                                            values,
                                                            _$options.preferredLanguages,
                                                          ),
                                                        )
                                                        .chain((values) =>
                                                          values.chainMap(
                                                            (value) =>
                                                              value.toLiteral(),
                                                          ),
                                                        )
                                                        .map((values) =>
                                                          values.length > 0
                                                            ? values.map(
                                                                (value) =>
                                                                  Maybe.of(
                                                                    value,
                                                                  ),
                                                              )
                                                            : Resource.Values.fromValue<
                                                                Maybe<Literal>
                                                              >({
                                                                focusResource:
                                                                  $resource,
                                                                propertyPath:
                                                                  PropertyShape
                                                                    .$schema
                                                                    .properties
                                                                    .maxExclusive
                                                                    .path,
                                                                value:
                                                                  Maybe.empty(),
                                                              }),
                                                        ),
                                                  }).chain((maxExclusive) =>
                                                    $shaclPropertyFromRdf({
                                                      graph: _$options.graph,
                                                      resource: $resource,
                                                      propertySchema:
                                                        $schema.properties
                                                          .maxInclusive,
                                                      typeFromRdf: (
                                                        resourceValues,
                                                      ) =>
                                                        resourceValues
                                                          .chain((values) =>
                                                            $fromRdfPreferredLanguages(
                                                              values,
                                                              _$options.preferredLanguages,
                                                            ),
                                                          )
                                                          .chain((values) =>
                                                            values.chainMap(
                                                              (value) =>
                                                                value.toLiteral(),
                                                            ),
                                                          )
                                                          .map((values) =>
                                                            values.length > 0
                                                              ? values.map(
                                                                  (value) =>
                                                                    Maybe.of(
                                                                      value,
                                                                    ),
                                                                )
                                                              : Resource.Values.fromValue<
                                                                  Maybe<Literal>
                                                                >({
                                                                  focusResource:
                                                                    $resource,
                                                                  propertyPath:
                                                                    PropertyShape
                                                                      .$schema
                                                                      .properties
                                                                      .maxInclusive
                                                                      .path,
                                                                  value:
                                                                    Maybe.empty(),
                                                                }),
                                                          ),
                                                    }).chain((maxInclusive) =>
                                                      $shaclPropertyFromRdf({
                                                        graph: _$options.graph,
                                                        resource: $resource,
                                                        propertySchema:
                                                          $schema.properties
                                                            .maxLength,
                                                        typeFromRdf: (
                                                          resourceValues,
                                                        ) =>
                                                          resourceValues
                                                            .chain((values) =>
                                                              values.chainMap(
                                                                (value) =>
                                                                  value.toInt(),
                                                              ),
                                                            )
                                                            .map((values) =>
                                                              values.length > 0
                                                                ? values.map(
                                                                    (value) =>
                                                                      Maybe.of(
                                                                        value,
                                                                      ),
                                                                  )
                                                                : Resource.Values.fromValue<
                                                                    Maybe<number>
                                                                  >({
                                                                    focusResource:
                                                                      $resource,
                                                                    propertyPath:
                                                                      PropertyShape
                                                                        .$schema
                                                                        .properties
                                                                        .maxLength
                                                                        .path,
                                                                    value:
                                                                      Maybe.empty(),
                                                                  }),
                                                            ),
                                                      }).chain((maxLength) =>
                                                        $shaclPropertyFromRdf({
                                                          graph:
                                                            _$options.graph,
                                                          resource: $resource,
                                                          propertySchema:
                                                            $schema.properties
                                                              .minCount,
                                                          typeFromRdf: (
                                                            resourceValues,
                                                          ) =>
                                                            resourceValues
                                                              .chain((values) =>
                                                                values.chainMap(
                                                                  (value) =>
                                                                    value.toInt(),
                                                                ),
                                                              )
                                                              .map((values) =>
                                                                values.length >
                                                                0
                                                                  ? values.map(
                                                                      (value) =>
                                                                        Maybe.of(
                                                                          value,
                                                                        ),
                                                                    )
                                                                  : Resource.Values.fromValue<
                                                                      Maybe<number>
                                                                    >({
                                                                      focusResource:
                                                                        $resource,
                                                                      propertyPath:
                                                                        PropertyShape
                                                                          .$schema
                                                                          .properties
                                                                          .minCount
                                                                          .path,
                                                                      value:
                                                                        Maybe.empty(),
                                                                    }),
                                                              ),
                                                        }).chain((minCount) =>
                                                          $shaclPropertyFromRdf(
                                                            {
                                                              graph:
                                                                _$options.graph,
                                                              resource:
                                                                $resource,
                                                              propertySchema:
                                                                $schema
                                                                  .properties
                                                                  .minExclusive,
                                                              typeFromRdf: (
                                                                resourceValues,
                                                              ) =>
                                                                resourceValues
                                                                  .chain(
                                                                    (values) =>
                                                                      $fromRdfPreferredLanguages(
                                                                        values,
                                                                        _$options.preferredLanguages,
                                                                      ),
                                                                  )
                                                                  .chain(
                                                                    (values) =>
                                                                      values.chainMap(
                                                                        (
                                                                          value,
                                                                        ) =>
                                                                          value.toLiteral(),
                                                                      ),
                                                                  )
                                                                  .map(
                                                                    (values) =>
                                                                      values.length >
                                                                      0
                                                                        ? values.map(
                                                                            (
                                                                              value,
                                                                            ) =>
                                                                              Maybe.of(
                                                                                value,
                                                                              ),
                                                                          )
                                                                        : Resource.Values.fromValue<
                                                                            Maybe<Literal>
                                                                          >({
                                                                            focusResource:
                                                                              $resource,
                                                                            propertyPath:
                                                                              PropertyShape
                                                                                .$schema
                                                                                .properties
                                                                                .minExclusive
                                                                                .path,
                                                                            value:
                                                                              Maybe.empty(),
                                                                          }),
                                                                  ),
                                                            },
                                                          ).chain(
                                                            (minExclusive) =>
                                                              $shaclPropertyFromRdf(
                                                                {
                                                                  graph:
                                                                    _$options.graph,
                                                                  resource:
                                                                    $resource,
                                                                  propertySchema:
                                                                    $schema
                                                                      .properties
                                                                      .minInclusive,
                                                                  typeFromRdf: (
                                                                    resourceValues,
                                                                  ) =>
                                                                    resourceValues
                                                                      .chain(
                                                                        (
                                                                          values,
                                                                        ) =>
                                                                          $fromRdfPreferredLanguages(
                                                                            values,
                                                                            _$options.preferredLanguages,
                                                                          ),
                                                                      )
                                                                      .chain(
                                                                        (
                                                                          values,
                                                                        ) =>
                                                                          values.chainMap(
                                                                            (
                                                                              value,
                                                                            ) =>
                                                                              value.toLiteral(),
                                                                          ),
                                                                      )
                                                                      .map(
                                                                        (
                                                                          values,
                                                                        ) =>
                                                                          values.length >
                                                                          0
                                                                            ? values.map(
                                                                                (
                                                                                  value,
                                                                                ) =>
                                                                                  Maybe.of(
                                                                                    value,
                                                                                  ),
                                                                              )
                                                                            : Resource.Values.fromValue<
                                                                                Maybe<Literal>
                                                                              >(
                                                                                {
                                                                                  focusResource:
                                                                                    $resource,
                                                                                  propertyPath:
                                                                                    PropertyShape
                                                                                      .$schema
                                                                                      .properties
                                                                                      .minInclusive
                                                                                      .path,
                                                                                  value:
                                                                                    Maybe.empty(),
                                                                                },
                                                                              ),
                                                                      ),
                                                                },
                                                              ).chain(
                                                                (
                                                                  minInclusive,
                                                                ) =>
                                                                  $shaclPropertyFromRdf(
                                                                    {
                                                                      graph:
                                                                        _$options.graph,
                                                                      resource:
                                                                        $resource,
                                                                      propertySchema:
                                                                        $schema
                                                                          .properties
                                                                          .minLength,
                                                                      typeFromRdf:
                                                                        (
                                                                          resourceValues,
                                                                        ) =>
                                                                          resourceValues
                                                                            .chain(
                                                                              (
                                                                                values,
                                                                              ) =>
                                                                                values.chainMap(
                                                                                  (
                                                                                    value,
                                                                                  ) =>
                                                                                    value.toInt(),
                                                                                ),
                                                                            )
                                                                            .map(
                                                                              (
                                                                                values,
                                                                              ) =>
                                                                                values.length >
                                                                                0
                                                                                  ? values.map(
                                                                                      (
                                                                                        value,
                                                                                      ) =>
                                                                                        Maybe.of(
                                                                                          value,
                                                                                        ),
                                                                                    )
                                                                                  : Resource.Values.fromValue<
                                                                                      Maybe<number>
                                                                                    >(
                                                                                      {
                                                                                        focusResource:
                                                                                          $resource,
                                                                                        propertyPath:
                                                                                          PropertyShape
                                                                                            .$schema
                                                                                            .properties
                                                                                            .minLength
                                                                                            .path,
                                                                                        value:
                                                                                          Maybe.empty(),
                                                                                      },
                                                                                    ),
                                                                            ),
                                                                    },
                                                                  ).chain(
                                                                    (
                                                                      minLength,
                                                                    ) =>
                                                                      $shaclPropertyFromRdf(
                                                                        {
                                                                          graph:
                                                                            _$options.graph,
                                                                          resource:
                                                                            $resource,
                                                                          propertySchema:
                                                                            $schema
                                                                              .properties
                                                                              .mutable,
                                                                          typeFromRdf:
                                                                            (
                                                                              resourceValues,
                                                                            ) =>
                                                                              resourceValues
                                                                                .chain(
                                                                                  (
                                                                                    values,
                                                                                  ) =>
                                                                                    values.chainMap(
                                                                                      (
                                                                                        value,
                                                                                      ) =>
                                                                                        value.toBoolean(),
                                                                                    ),
                                                                                )
                                                                                .map(
                                                                                  (
                                                                                    values,
                                                                                  ) =>
                                                                                    values.length >
                                                                                    0
                                                                                      ? values.map(
                                                                                          (
                                                                                            value,
                                                                                          ) =>
                                                                                            Maybe.of(
                                                                                              value,
                                                                                            ),
                                                                                        )
                                                                                      : Resource.Values.fromValue<
                                                                                          Maybe<boolean>
                                                                                        >(
                                                                                          {
                                                                                            focusResource:
                                                                                              $resource,
                                                                                            propertyPath:
                                                                                              PropertyShape
                                                                                                .$schema
                                                                                                .properties
                                                                                                .mutable
                                                                                                .path,
                                                                                            value:
                                                                                              Maybe.empty(),
                                                                                          },
                                                                                        ),
                                                                                ),
                                                                        },
                                                                      ).chain(
                                                                        (
                                                                          mutable,
                                                                        ) =>
                                                                          $shaclPropertyFromRdf(
                                                                            {
                                                                              graph:
                                                                                _$options.graph,
                                                                              resource:
                                                                                $resource,
                                                                              propertySchema:
                                                                                $schema
                                                                                  .properties
                                                                                  .nodeKind,
                                                                              typeFromRdf:
                                                                                (
                                                                                  resourceValues,
                                                                                ) =>
                                                                                  resourceValues
                                                                                    .chain(
                                                                                      (
                                                                                        values,
                                                                                      ) =>
                                                                                        values.chainMap(
                                                                                          (
                                                                                            value,
                                                                                          ) =>
                                                                                            value.toIri(
                                                                                              [
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
                                                                                              ],
                                                                                            ),
                                                                                        ),
                                                                                    )
                                                                                    .map(
                                                                                      (
                                                                                        values,
                                                                                      ) =>
                                                                                        values.length >
                                                                                        0
                                                                                          ? values.map(
                                                                                              (
                                                                                                value,
                                                                                              ) =>
                                                                                                Maybe.of(
                                                                                                  value,
                                                                                                ),
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
                                                                                            >(
                                                                                              {
                                                                                                focusResource:
                                                                                                  $resource,
                                                                                                propertyPath:
                                                                                                  PropertyShape
                                                                                                    .$schema
                                                                                                    .properties
                                                                                                    .nodeKind
                                                                                                    .path,
                                                                                                value:
                                                                                                  Maybe.empty(),
                                                                                              },
                                                                                            ),
                                                                                    ),
                                                                            },
                                                                          ).chain(
                                                                            (
                                                                              nodeKind,
                                                                            ) =>
                                                                              $shaclPropertyFromRdf(
                                                                                {
                                                                                  graph:
                                                                                    _$options.graph,
                                                                                  resource:
                                                                                    $resource,
                                                                                  propertySchema:
                                                                                    $schema
                                                                                      .properties
                                                                                      .nodes,
                                                                                  typeFromRdf:
                                                                                    (
                                                                                      resourceValues,
                                                                                    ) =>
                                                                                      resourceValues
                                                                                        .chain(
                                                                                          (
                                                                                            values,
                                                                                          ) =>
                                                                                            values.chainMap(
                                                                                              (
                                                                                                value,
                                                                                              ) =>
                                                                                                value.toIdentifier(),
                                                                                            ),
                                                                                        )
                                                                                        .map(
                                                                                          (
                                                                                            values,
                                                                                          ) =>
                                                                                            values.toArray(),
                                                                                        )
                                                                                        .map(
                                                                                          (
                                                                                            valuesArray,
                                                                                          ) =>
                                                                                            Resource.Values.fromValue(
                                                                                              {
                                                                                                focusResource:
                                                                                                  $resource,
                                                                                                propertyPath:
                                                                                                  PropertyShape
                                                                                                    .$schema
                                                                                                    .properties
                                                                                                    .nodes
                                                                                                    .path,
                                                                                                value:
                                                                                                  valuesArray,
                                                                                              },
                                                                                            ),
                                                                                        ),
                                                                                },
                                                                              ).chain(
                                                                                (
                                                                                  nodes,
                                                                                ) =>
                                                                                  $shaclPropertyFromRdf(
                                                                                    {
                                                                                      graph:
                                                                                        _$options.graph,
                                                                                      resource:
                                                                                        $resource,
                                                                                      propertySchema:
                                                                                        $schema
                                                                                          .properties
                                                                                          .not,
                                                                                      typeFromRdf:
                                                                                        (
                                                                                          resourceValues,
                                                                                        ) =>
                                                                                          resourceValues
                                                                                            .chain(
                                                                                              (
                                                                                                values,
                                                                                              ) =>
                                                                                                values.chainMap(
                                                                                                  (
                                                                                                    value,
                                                                                                  ) =>
                                                                                                    value.toIdentifier(),
                                                                                                ),
                                                                                            )
                                                                                            .map(
                                                                                              (
                                                                                                values,
                                                                                              ) =>
                                                                                                values.toArray(),
                                                                                            )
                                                                                            .map(
                                                                                              (
                                                                                                valuesArray,
                                                                                              ) =>
                                                                                                Resource.Values.fromValue(
                                                                                                  {
                                                                                                    focusResource:
                                                                                                      $resource,
                                                                                                    propertyPath:
                                                                                                      PropertyShape
                                                                                                        .$schema
                                                                                                        .properties
                                                                                                        .not
                                                                                                        .path,
                                                                                                    value:
                                                                                                      valuesArray,
                                                                                                  },
                                                                                                ),
                                                                                            ),
                                                                                    },
                                                                                  ).chain(
                                                                                    (
                                                                                      not,
                                                                                    ) =>
                                                                                      $shaclPropertyFromRdf(
                                                                                        {
                                                                                          graph:
                                                                                            _$options.graph,
                                                                                          resource:
                                                                                            $resource,
                                                                                          propertySchema:
                                                                                            $schema
                                                                                              .properties
                                                                                              .or,
                                                                                          typeFromRdf:
                                                                                            (
                                                                                              resourceValues,
                                                                                            ) =>
                                                                                              resourceValues
                                                                                                .chain(
                                                                                                  (
                                                                                                    values,
                                                                                                  ) =>
                                                                                                    values.chainMap(
                                                                                                      (
                                                                                                        value,
                                                                                                      ) =>
                                                                                                        value.toList(
                                                                                                          {
                                                                                                            graph:
                                                                                                              _$options.graph,
                                                                                                          },
                                                                                                        ),
                                                                                                    ),
                                                                                                )
                                                                                                .chain(
                                                                                                  (
                                                                                                    valueLists,
                                                                                                  ) =>
                                                                                                    valueLists.chainMap(
                                                                                                      (
                                                                                                        valueList,
                                                                                                      ) =>
                                                                                                        Right(
                                                                                                          Resource.Values.fromArray(
                                                                                                            {
                                                                                                              focusResource:
                                                                                                                $resource,
                                                                                                              propertyPath:
                                                                                                                PropertyShape
                                                                                                                  .$schema
                                                                                                                  .properties
                                                                                                                  .or
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
                                                                                                  (
                                                                                                    valueLists,
                                                                                                  ) =>
                                                                                                    valueLists.map(
                                                                                                      (
                                                                                                        valueList,
                                                                                                      ) =>
                                                                                                        valueList.toArray(),
                                                                                                    ),
                                                                                                )
                                                                                                .map(
                                                                                                  (
                                                                                                    values,
                                                                                                  ) =>
                                                                                                    values.toArray(),
                                                                                                )
                                                                                                .map(
                                                                                                  (
                                                                                                    valuesArray,
                                                                                                  ) =>
                                                                                                    Resource.Values.fromValue(
                                                                                                      {
                                                                                                        focusResource:
                                                                                                          $resource,
                                                                                                        propertyPath:
                                                                                                          PropertyShape
                                                                                                            .$schema
                                                                                                            .properties
                                                                                                            .or
                                                                                                            .path,
                                                                                                        value:
                                                                                                          valuesArray,
                                                                                                      },
                                                                                                    ),
                                                                                                ),
                                                                                        },
                                                                                      ).chain(
                                                                                        (
                                                                                          or,
                                                                                        ) =>
                                                                                          $shaclPropertyFromRdf(
                                                                                            {
                                                                                              graph:
                                                                                                _$options.graph,
                                                                                              resource:
                                                                                                $resource,
                                                                                              propertySchema:
                                                                                                $schema
                                                                                                  .properties
                                                                                                  .patterns,
                                                                                              typeFromRdf:
                                                                                                (
                                                                                                  resourceValues,
                                                                                                ) =>
                                                                                                  resourceValues
                                                                                                    .chain(
                                                                                                      (
                                                                                                        values,
                                                                                                      ) =>
                                                                                                        $fromRdfPreferredLanguages(
                                                                                                          values,
                                                                                                          _$options.preferredLanguages,
                                                                                                        ),
                                                                                                    )
                                                                                                    .chain(
                                                                                                      (
                                                                                                        values,
                                                                                                      ) =>
                                                                                                        values.chainMap(
                                                                                                          (
                                                                                                            value,
                                                                                                          ) =>
                                                                                                            value.toString(),
                                                                                                        ),
                                                                                                    )
                                                                                                    .map(
                                                                                                      (
                                                                                                        values,
                                                                                                      ) =>
                                                                                                        values.toArray(),
                                                                                                    )
                                                                                                    .map(
                                                                                                      (
                                                                                                        valuesArray,
                                                                                                      ) =>
                                                                                                        Resource.Values.fromValue(
                                                                                                          {
                                                                                                            focusResource:
                                                                                                              $resource,
                                                                                                            propertyPath:
                                                                                                              PropertyShape
                                                                                                                .$schema
                                                                                                                .properties
                                                                                                                .patterns
                                                                                                                .path,
                                                                                                            value:
                                                                                                              valuesArray,
                                                                                                          },
                                                                                                        ),
                                                                                                    ),
                                                                                            },
                                                                                          ).chain(
                                                                                            (
                                                                                              patterns,
                                                                                            ) =>
                                                                                              $shaclPropertyFromRdf(
                                                                                                {
                                                                                                  graph:
                                                                                                    _$options.graph,
                                                                                                  resource:
                                                                                                    $resource,
                                                                                                  propertySchema:
                                                                                                    $schema
                                                                                                      .properties
                                                                                                      .properties,
                                                                                                  typeFromRdf:
                                                                                                    (
                                                                                                      resourceValues,
                                                                                                    ) =>
                                                                                                      resourceValues
                                                                                                        .chain(
                                                                                                          (
                                                                                                            values,
                                                                                                          ) =>
                                                                                                            values.chainMap(
                                                                                                              (
                                                                                                                value,
                                                                                                              ) =>
                                                                                                                value.toIdentifier(),
                                                                                                            ),
                                                                                                        )
                                                                                                        .map(
                                                                                                          (
                                                                                                            values,
                                                                                                          ) =>
                                                                                                            values.toArray(),
                                                                                                        )
                                                                                                        .map(
                                                                                                          (
                                                                                                            valuesArray,
                                                                                                          ) =>
                                                                                                            Resource.Values.fromValue(
                                                                                                              {
                                                                                                                focusResource:
                                                                                                                  $resource,
                                                                                                                propertyPath:
                                                                                                                  NodeShape
                                                                                                                    .$schema
                                                                                                                    .properties
                                                                                                                    .properties
                                                                                                                    .path,
                                                                                                                value:
                                                                                                                  valuesArray,
                                                                                                              },
                                                                                                            ),
                                                                                                        ),
                                                                                                },
                                                                                              ).chain(
                                                                                                (
                                                                                                  properties,
                                                                                                ) =>
                                                                                                  $shaclPropertyFromRdf(
                                                                                                    {
                                                                                                      graph:
                                                                                                        _$options.graph,
                                                                                                      resource:
                                                                                                        $resource,
                                                                                                      propertySchema:
                                                                                                        $schema
                                                                                                          .properties
                                                                                                          .rdfType,
                                                                                                      typeFromRdf:
                                                                                                        (
                                                                                                          resourceValues,
                                                                                                        ) =>
                                                                                                          resourceValues
                                                                                                            .chain(
                                                                                                              (
                                                                                                                values,
                                                                                                              ) =>
                                                                                                                values.chainMap(
                                                                                                                  (
                                                                                                                    value,
                                                                                                                  ) =>
                                                                                                                    value.toIri(),
                                                                                                                ),
                                                                                                            )
                                                                                                            .map(
                                                                                                              (
                                                                                                                values,
                                                                                                              ) =>
                                                                                                                values.length >
                                                                                                                0
                                                                                                                  ? values.map(
                                                                                                                      (
                                                                                                                        value,
                                                                                                                      ) =>
                                                                                                                        Maybe.of(
                                                                                                                          value,
                                                                                                                        ),
                                                                                                                    )
                                                                                                                  : Resource.Values.fromValue<
                                                                                                                      Maybe<NamedNode>
                                                                                                                    >(
                                                                                                                      {
                                                                                                                        focusResource:
                                                                                                                          $resource,
                                                                                                                        propertyPath:
                                                                                                                          NodeShape
                                                                                                                            .$schema
                                                                                                                            .properties
                                                                                                                            .rdfType
                                                                                                                            .path,
                                                                                                                        value:
                                                                                                                          Maybe.empty(),
                                                                                                                      },
                                                                                                                    ),
                                                                                                            ),
                                                                                                    },
                                                                                                  ).chain(
                                                                                                    (
                                                                                                      rdfType,
                                                                                                    ) =>
                                                                                                      $shaclPropertyFromRdf(
                                                                                                        {
                                                                                                          graph:
                                                                                                            _$options.graph,
                                                                                                          resource:
                                                                                                            $resource,
                                                                                                          propertySchema:
                                                                                                            $schema
                                                                                                              .properties
                                                                                                              .shaclmateName,
                                                                                                          typeFromRdf:
                                                                                                            (
                                                                                                              resourceValues,
                                                                                                            ) =>
                                                                                                              resourceValues
                                                                                                                .chain(
                                                                                                                  (
                                                                                                                    values,
                                                                                                                  ) =>
                                                                                                                    $fromRdfPreferredLanguages(
                                                                                                                      values,
                                                                                                                      _$options.preferredLanguages,
                                                                                                                    ),
                                                                                                                )
                                                                                                                .chain(
                                                                                                                  (
                                                                                                                    values,
                                                                                                                  ) =>
                                                                                                                    values.chainMap(
                                                                                                                      (
                                                                                                                        value,
                                                                                                                      ) =>
                                                                                                                        value.toString(),
                                                                                                                    ),
                                                                                                                )
                                                                                                                .map(
                                                                                                                  (
                                                                                                                    values,
                                                                                                                  ) =>
                                                                                                                    values.length >
                                                                                                                    0
                                                                                                                      ? values.map(
                                                                                                                          (
                                                                                                                            value,
                                                                                                                          ) =>
                                                                                                                            Maybe.of(
                                                                                                                              value,
                                                                                                                            ),
                                                                                                                        )
                                                                                                                      : Resource.Values.fromValue<
                                                                                                                          Maybe<string>
                                                                                                                        >(
                                                                                                                          {
                                                                                                                            focusResource:
                                                                                                                              $resource,
                                                                                                                            propertyPath:
                                                                                                                              PropertyShape
                                                                                                                                .$schema
                                                                                                                                .properties
                                                                                                                                .shaclmateName
                                                                                                                                .path,
                                                                                                                            value:
                                                                                                                              Maybe.empty(),
                                                                                                                          },
                                                                                                                        ),
                                                                                                                ),
                                                                                                        },
                                                                                                      ).chain(
                                                                                                        (
                                                                                                          shaclmateName,
                                                                                                        ) =>
                                                                                                          $shaclPropertyFromRdf(
                                                                                                            {
                                                                                                              graph:
                                                                                                                _$options.graph,
                                                                                                              resource:
                                                                                                                $resource,
                                                                                                              propertySchema:
                                                                                                                $schema
                                                                                                                  .properties
                                                                                                                  .toRdfTypes,
                                                                                                              typeFromRdf:
                                                                                                                (
                                                                                                                  resourceValues,
                                                                                                                ) =>
                                                                                                                  resourceValues
                                                                                                                    .chain(
                                                                                                                      (
                                                                                                                        values,
                                                                                                                      ) =>
                                                                                                                        values.chainMap(
                                                                                                                          (
                                                                                                                            value,
                                                                                                                          ) =>
                                                                                                                            value.toIri(),
                                                                                                                        ),
                                                                                                                    )
                                                                                                                    .map(
                                                                                                                      (
                                                                                                                        values,
                                                                                                                      ) =>
                                                                                                                        values.toArray(),
                                                                                                                    )
                                                                                                                    .map(
                                                                                                                      (
                                                                                                                        valuesArray,
                                                                                                                      ) =>
                                                                                                                        Resource.Values.fromValue(
                                                                                                                          {
                                                                                                                            focusResource:
                                                                                                                              $resource,
                                                                                                                            propertyPath:
                                                                                                                              NodeShape
                                                                                                                                .$schema
                                                                                                                                .properties
                                                                                                                                .toRdfTypes
                                                                                                                                .path,
                                                                                                                            value:
                                                                                                                              valuesArray,
                                                                                                                          },
                                                                                                                        ),
                                                                                                                    ),
                                                                                                            },
                                                                                                          ).chain(
                                                                                                            (
                                                                                                              toRdfTypes,
                                                                                                            ) =>
                                                                                                              $shaclPropertyFromRdf(
                                                                                                                {
                                                                                                                  graph:
                                                                                                                    _$options.graph,
                                                                                                                  resource:
                                                                                                                    $resource,
                                                                                                                  propertySchema:
                                                                                                                    $schema
                                                                                                                      .properties
                                                                                                                      .tsFeatureExcludes,
                                                                                                                  typeFromRdf:
                                                                                                                    (
                                                                                                                      resourceValues,
                                                                                                                    ) =>
                                                                                                                      resourceValues
                                                                                                                        .chain(
                                                                                                                          (
                                                                                                                            values,
                                                                                                                          ) =>
                                                                                                                            values.chainMap(
                                                                                                                              (
                                                                                                                                value,
                                                                                                                              ) =>
                                                                                                                                value.toIri(
                                                                                                                                  [
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
                                                                                                                                ),
                                                                                                                            ),
                                                                                                                        )
                                                                                                                        .map(
                                                                                                                          (
                                                                                                                            values,
                                                                                                                          ) =>
                                                                                                                            values.toArray(),
                                                                                                                        )
                                                                                                                        .map(
                                                                                                                          (
                                                                                                                            valuesArray,
                                                                                                                          ) =>
                                                                                                                            Resource.Values.fromValue(
                                                                                                                              {
                                                                                                                                focusResource:
                                                                                                                                  $resource,
                                                                                                                                propertyPath:
                                                                                                                                  Ontology
                                                                                                                                    .$schema
                                                                                                                                    .properties
                                                                                                                                    .tsFeatureExcludes
                                                                                                                                    .path,
                                                                                                                                value:
                                                                                                                                  valuesArray,
                                                                                                                              },
                                                                                                                            ),
                                                                                                                        ),
                                                                                                                },
                                                                                                              ).chain(
                                                                                                                (
                                                                                                                  tsFeatureExcludes,
                                                                                                                ) =>
                                                                                                                  $shaclPropertyFromRdf(
                                                                                                                    {
                                                                                                                      graph:
                                                                                                                        _$options.graph,
                                                                                                                      resource:
                                                                                                                        $resource,
                                                                                                                      propertySchema:
                                                                                                                        $schema
                                                                                                                          .properties
                                                                                                                          .tsFeatureIncludes,
                                                                                                                      typeFromRdf:
                                                                                                                        (
                                                                                                                          resourceValues,
                                                                                                                        ) =>
                                                                                                                          resourceValues
                                                                                                                            .chain(
                                                                                                                              (
                                                                                                                                values,
                                                                                                                              ) =>
                                                                                                                                values.chainMap(
                                                                                                                                  (
                                                                                                                                    value,
                                                                                                                                  ) =>
                                                                                                                                    value.toIri(
                                                                                                                                      [
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
                                                                                                                                    ),
                                                                                                                                ),
                                                                                                                            )
                                                                                                                            .map(
                                                                                                                              (
                                                                                                                                values,
                                                                                                                              ) =>
                                                                                                                                values.toArray(),
                                                                                                                            )
                                                                                                                            .map(
                                                                                                                              (
                                                                                                                                valuesArray,
                                                                                                                              ) =>
                                                                                                                                Resource.Values.fromValue(
                                                                                                                                  {
                                                                                                                                    focusResource:
                                                                                                                                      $resource,
                                                                                                                                    propertyPath:
                                                                                                                                      Ontology
                                                                                                                                        .$schema
                                                                                                                                        .properties
                                                                                                                                        .tsFeatureIncludes
                                                                                                                                        .path,
                                                                                                                                    value:
                                                                                                                                      valuesArray,
                                                                                                                                  },
                                                                                                                                ),
                                                                                                                            ),
                                                                                                                    },
                                                                                                                  ).chain(
                                                                                                                    (
                                                                                                                      tsFeatureIncludes,
                                                                                                                    ) =>
                                                                                                                      $shaclPropertyFromRdf(
                                                                                                                        {
                                                                                                                          graph:
                                                                                                                            _$options.graph,
                                                                                                                          resource:
                                                                                                                            $resource,
                                                                                                                          propertySchema:
                                                                                                                            $schema
                                                                                                                              .properties
                                                                                                                              .tsImports,
                                                                                                                          typeFromRdf:
                                                                                                                            (
                                                                                                                              resourceValues,
                                                                                                                            ) =>
                                                                                                                              resourceValues
                                                                                                                                .chain(
                                                                                                                                  (
                                                                                                                                    values,
                                                                                                                                  ) =>
                                                                                                                                    $fromRdfPreferredLanguages(
                                                                                                                                      values,
                                                                                                                                      _$options.preferredLanguages,
                                                                                                                                    ),
                                                                                                                                )
                                                                                                                                .chain(
                                                                                                                                  (
                                                                                                                                    values,
                                                                                                                                  ) =>
                                                                                                                                    values.chainMap(
                                                                                                                                      (
                                                                                                                                        value,
                                                                                                                                      ) =>
                                                                                                                                        value.toString(),
                                                                                                                                    ),
                                                                                                                                )
                                                                                                                                .map(
                                                                                                                                  (
                                                                                                                                    values,
                                                                                                                                  ) =>
                                                                                                                                    values.toArray(),
                                                                                                                                )
                                                                                                                                .map(
                                                                                                                                  (
                                                                                                                                    valuesArray,
                                                                                                                                  ) =>
                                                                                                                                    Resource.Values.fromValue(
                                                                                                                                      {
                                                                                                                                        focusResource:
                                                                                                                                          $resource,
                                                                                                                                        propertyPath:
                                                                                                                                          Ontology
                                                                                                                                            .$schema
                                                                                                                                            .properties
                                                                                                                                            .tsImports
                                                                                                                                            .path,
                                                                                                                                        value:
                                                                                                                                          valuesArray,
                                                                                                                                      },
                                                                                                                                    ),
                                                                                                                                ),
                                                                                                                        },
                                                                                                                      ).chain(
                                                                                                                        (
                                                                                                                          tsImports,
                                                                                                                        ) =>
                                                                                                                          $shaclPropertyFromRdf(
                                                                                                                            {
                                                                                                                              graph:
                                                                                                                                _$options.graph,
                                                                                                                              resource:
                                                                                                                                $resource,
                                                                                                                              propertySchema:
                                                                                                                                $schema
                                                                                                                                  .properties
                                                                                                                                  .tsObjectDeclarationType,
                                                                                                                              typeFromRdf:
                                                                                                                                (
                                                                                                                                  resourceValues,
                                                                                                                                ) =>
                                                                                                                                  resourceValues
                                                                                                                                    .chain(
                                                                                                                                      (
                                                                                                                                        values,
                                                                                                                                      ) =>
                                                                                                                                        values.chainMap(
                                                                                                                                          (
                                                                                                                                            value,
                                                                                                                                          ) =>
                                                                                                                                            value.toIri(
                                                                                                                                              [
                                                                                                                                                dataFactory.namedNode(
                                                                                                                                                  "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class",
                                                                                                                                                ),
                                                                                                                                                dataFactory.namedNode(
                                                                                                                                                  "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface",
                                                                                                                                                ),
                                                                                                                                              ],
                                                                                                                                            ),
                                                                                                                                        ),
                                                                                                                                    )
                                                                                                                                    .map(
                                                                                                                                      (
                                                                                                                                        values,
                                                                                                                                      ) =>
                                                                                                                                        values.length >
                                                                                                                                        0
                                                                                                                                          ? values.map(
                                                                                                                                              (
                                                                                                                                                value,
                                                                                                                                              ) =>
                                                                                                                                                Maybe.of(
                                                                                                                                                  value,
                                                                                                                                                ),
                                                                                                                                            )
                                                                                                                                          : Resource.Values.fromValue<
                                                                                                                                              Maybe<
                                                                                                                                                NamedNode<
                                                                                                                                                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                                                                                                                                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                                                                                                                                >
                                                                                                                                              >
                                                                                                                                            >(
                                                                                                                                              {
                                                                                                                                                focusResource:
                                                                                                                                                  $resource,
                                                                                                                                                propertyPath:
                                                                                                                                                  Ontology
                                                                                                                                                    .$schema
                                                                                                                                                    .properties
                                                                                                                                                    .tsObjectDeclarationType
                                                                                                                                                    .path,
                                                                                                                                                value:
                                                                                                                                                  Maybe.empty(),
                                                                                                                                              },
                                                                                                                                            ),
                                                                                                                                    ),
                                                                                                                            },
                                                                                                                          ).chain(
                                                                                                                            (
                                                                                                                              tsObjectDeclarationType,
                                                                                                                            ) =>
                                                                                                                              $shaclPropertyFromRdf(
                                                                                                                                {
                                                                                                                                  graph:
                                                                                                                                    _$options.graph,
                                                                                                                                  resource:
                                                                                                                                    $resource,
                                                                                                                                  propertySchema:
                                                                                                                                    $schema
                                                                                                                                      .properties
                                                                                                                                      .xone,
                                                                                                                                  typeFromRdf:
                                                                                                                                    (
                                                                                                                                      resourceValues,
                                                                                                                                    ) =>
                                                                                                                                      resourceValues
                                                                                                                                        .chain(
                                                                                                                                          (
                                                                                                                                            values,
                                                                                                                                          ) =>
                                                                                                                                            values.chainMap(
                                                                                                                                              (
                                                                                                                                                value,
                                                                                                                                              ) =>
                                                                                                                                                value.toList(
                                                                                                                                                  {
                                                                                                                                                    graph:
                                                                                                                                                      _$options.graph,
                                                                                                                                                  },
                                                                                                                                                ),
                                                                                                                                            ),
                                                                                                                                        )
                                                                                                                                        .chain(
                                                                                                                                          (
                                                                                                                                            valueLists,
                                                                                                                                          ) =>
                                                                                                                                            valueLists.chainMap(
                                                                                                                                              (
                                                                                                                                                valueList,
                                                                                                                                              ) =>
                                                                                                                                                Right(
                                                                                                                                                  Resource.Values.fromArray(
                                                                                                                                                    {
                                                                                                                                                      focusResource:
                                                                                                                                                        $resource,
                                                                                                                                                      propertyPath:
                                                                                                                                                        PropertyShape
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
                                                                                                                                          (
                                                                                                                                            valueLists,
                                                                                                                                          ) =>
                                                                                                                                            valueLists.map(
                                                                                                                                              (
                                                                                                                                                valueList,
                                                                                                                                              ) =>
                                                                                                                                                valueList.toArray(),
                                                                                                                                            ),
                                                                                                                                        )
                                                                                                                                        .map(
                                                                                                                                          (
                                                                                                                                            values,
                                                                                                                                          ) =>
                                                                                                                                            values.toArray(),
                                                                                                                                        )
                                                                                                                                        .map(
                                                                                                                                          (
                                                                                                                                            valuesArray,
                                                                                                                                          ) =>
                                                                                                                                            Resource.Values.fromValue(
                                                                                                                                              {
                                                                                                                                                focusResource:
                                                                                                                                                  $resource,
                                                                                                                                                propertyPath:
                                                                                                                                                  PropertyShape
                                                                                                                                                    .$schema
                                                                                                                                                    .properties
                                                                                                                                                    .xone
                                                                                                                                                    .path,
                                                                                                                                                value:
                                                                                                                                                  valuesArray,
                                                                                                                                              },
                                                                                                                                            ),
                                                                                                                                        ),
                                                                                                                                },
                                                                                                                              ).map(
                                                                                                                                (
                                                                                                                                  xone,
                                                                                                                                ) => ({
                                                                                                                                  $identifier,
                                                                                                                                  $type,
                                                                                                                                  abstract,
                                                                                                                                  and,
                                                                                                                                  classes,
                                                                                                                                  closed,
                                                                                                                                  comments,
                                                                                                                                  datatype,
                                                                                                                                  deactivated,
                                                                                                                                  discriminantValue,
                                                                                                                                  extern,
                                                                                                                                  flags,
                                                                                                                                  fromRdfType,
                                                                                                                                  hasValues,
                                                                                                                                  identifierMintingStrategy,
                                                                                                                                  ignoredProperties,
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
                                                                                                                                  mutable,
                                                                                                                                  nodeKind,
                                                                                                                                  nodes,
                                                                                                                                  not,
                                                                                                                                  or,
                                                                                                                                  patterns,
                                                                                                                                  properties,
                                                                                                                                  rdfType,
                                                                                                                                  shaclmateName,
                                                                                                                                  toRdfTypes,
                                                                                                                                  tsFeatureExcludes,
                                                                                                                                  tsFeatureIncludes,
                                                                                                                                  tsImports,
                                                                                                                                  tsObjectDeclarationType,
                                                                                                                                  xone,
                                                                                                                                }),
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
  };

  export const $schema = {
    properties: {
      $identifier: {
        kind: "Identifier" as const,
        type: () => ({ kind: "Identifier" as const }),
      },
      $type: {
        kind: "Discriminant" as const,
        type: () => ({
          kind: "TypeDiscriminant" as const,
          ownValues: ["NodeShape"],
        }),
      },
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
      closed: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
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
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
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
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Term" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
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
      properties: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        path: dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
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
      shaclmateName: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
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

  export function $toRdfResource(
    _nodeShape: NodeShape,
    options?: Parameters<$ToRdfResourceFunction<NodeShape>>[1],
  ): Resource {
    const resourceSet =
      options?.resourceSet ??
      new ResourceSet(datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_nodeShape.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
        options?.graph,
      );
    }
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#abstract"),
      _nodeShape.abstract
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      _nodeShape.and.flatMap((item) => [
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
      _nodeShape.classes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
      _nodeShape.closed
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      _nodeShape.comments.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      _nodeShape.datatype.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      _nodeShape.deactivated
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
      _nodeShape.discriminantValue
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
      _nodeShape.extern
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      _nodeShape.flags.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#fromRdfType"),
      _nodeShape.fromRdfType.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      _nodeShape.hasValues.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
      ),
      _nodeShape.identifierMintingStrategy.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#ignoredProperties"),
      _nodeShape.ignoredProperties.toList().flatMap((value) => [
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
      dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      _nodeShape.in_.toList().flatMap((value) => [
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
      _nodeShape.isDefinedBy.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _nodeShape.labels.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      _nodeShape.languageIn.toList().flatMap((value) => [
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
      _nodeShape.maxCount
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      _nodeShape.maxExclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      _nodeShape.maxInclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      _nodeShape.maxLength
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      _nodeShape.minCount
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      _nodeShape.minExclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      _nodeShape.minInclusive.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      _nodeShape.minLength
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
      _nodeShape.mutable
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      _nodeShape.nodeKind.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      _nodeShape.nodes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      _nodeShape.not.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      _nodeShape.or.flatMap((item) => [
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
      _nodeShape.patterns.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
      _nodeShape.properties.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#rdfType"),
      _nodeShape.rdfType.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      _nodeShape.shaclmateName
        .toList()
        .flatMap((value) => [$literalFactory.string(value)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#toRdfType"),
      _nodeShape.toRdfTypes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
      _nodeShape.tsFeatureExcludes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
      _nodeShape.tsFeatureIncludes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
      _nodeShape.tsImports.flatMap((item) => [$literalFactory.string(item)]),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
      _nodeShape.tsObjectDeclarationType.toList(),
      options?.graph,
    );
    resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      _nodeShape.xone.flatMap((item) => [
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
}
export type Shape = NodeShape | PropertyShape;

export namespace Shape {
  export const $filter = (filter: Shape.$Filter, value: Shape) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      filter.on?.["NodeShape"] !== undefined &&
      NodeShape.isNodeShape(value)
    ) {
      if (!NodeShape.$filter(filter.on["NodeShape"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["PropertyShape"] !== undefined &&
      PropertyShape.isPropertyShape(value)
    ) {
      if (!PropertyShape.$filter(filter.on["PropertyShape"], value)) {
        return false;
      }
    }

    return true;
  };

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly NodeShape?: NodeShape.$Filter;
      readonly PropertyShape?: PropertyShape.$Filter;
    };
  };

  export const $fromRdfResource: $FromRdfResourceFunction<Shape> = (
    resource,
    options,
  ) =>
    (
      NodeShape.$fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, Shape>
    ).altLazy(
      () =>
        PropertyShape.$fromRdfResource(resource, {
          ...options,
          ignoreRdfType: false,
        }) as Either<Error, Shape>,
    );

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<Shape> =
    ((values, _options) =>
      values.chain((values) =>
        values.chainMap((value) => {
          const valueAsValues = Right(value.toValues());
          return (
            NodeShape.$fromRdfResourceValues(valueAsValues, {
              context: _options.context,
              graph: _options.graph,
              ignoreRdfType: false,
              objectSet: _options.objectSet,
              preferredLanguages: _options.preferredLanguages,
              propertyPath: _options.propertyPath,
              resource: _options.resource,
            }) as Either<Error, Resource.Values<Shape>>
          )
            .altLazy(
              () =>
                PropertyShape.$fromRdfResourceValues(valueAsValues, {
                  context: _options.context,
                  graph: _options.graph,
                  ignoreRdfType: false,
                  objectSet: _options.objectSet,
                  preferredLanguages: _options.preferredLanguages,
                  propertyPath: _options.propertyPath,
                  resource: _options.resource,
                }) as Either<Error, Resource.Values<Shape>>,
            )
            .chain((values) => values.head());
        }),
      )) satisfies $FromRdfResourceValuesFunction<Shape>;

  export type $Identifier = BlankNode | NamedNode;
  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export const $schema = {
    kind: "NamedObjectUnion" as const,
    members: {
      NodeShape: { discriminantValues: ["NodeShape"], type: NodeShape.$schema },
      PropertyShape: {
        discriminantValues: ["PropertyShape"],
        type: PropertyShape.$schema,
      },
    },
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
      shaclmateName: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "String" as const }),
        }),
        path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
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

  export const $toRdfResource: $ToRdfResourceFunction<Shape> = (
    value,
    options,
  ) => {
    if (NodeShape.isNodeShape(value)) {
      return NodeShape.$toRdfResource(value, options);
    }
    if (PropertyShape.isPropertyShape(value)) {
      return PropertyShape.$toRdfResource(value, options);
    }
    throw new Error("unrecognized type");
  };

  export const $toRdfResourceValues: $ToRdfResourceValuesFunction<Shape> = ((
    value,
    _options,
  ) => {
    if (NodeShape.isNodeShape(value)) {
      return [
        NodeShape.$toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (PropertyShape.isPropertyShape(value)) {
      return [
        PropertyShape.$toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) as $ToRdfResourceValuesFunction<Shape>;

  export function isShape(object: $Object): object is Shape {
    return (
      NodeShape.isNodeShape(object) || PropertyShape.isPropertyShape(object)
    );
  }
}
export type $Object = NodeShape | Ontology | PropertyGroup | PropertyShape;

export namespace $Object {
  export const $filter = (filter: $Object.$Filter, value: $Object) => {
    if (
      filter.$identifier !== undefined &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      filter.on?.["NodeShape"] !== undefined &&
      NodeShape.isNodeShape(value)
    ) {
      if (!NodeShape.$filter(filter.on["NodeShape"], value)) {
        return false;
      }
    }
    if (filter.on?.["Ontology"] !== undefined && Ontology.isOntology(value)) {
      if (!Ontology.$filter(filter.on["Ontology"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["PropertyGroup"] !== undefined &&
      PropertyGroup.isPropertyGroup(value)
    ) {
      if (!PropertyGroup.$filter(filter.on["PropertyGroup"], value)) {
        return false;
      }
    }
    if (
      filter.on?.["PropertyShape"] !== undefined &&
      PropertyShape.isPropertyShape(value)
    ) {
      if (!PropertyShape.$filter(filter.on["PropertyShape"], value)) {
        return false;
      }
    }

    return true;
  };

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly on?: {
      readonly NodeShape?: NodeShape.$Filter;
      readonly Ontology?: Ontology.$Filter;
      readonly PropertyGroup?: PropertyGroup.$Filter;
      readonly PropertyShape?: PropertyShape.$Filter;
    };
  };

  export const $fromRdfResource: $FromRdfResourceFunction<$Object> = (
    resource,
    options,
  ) =>
    (
      NodeShape.$fromRdfResource(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, $Object>
    )
      .altLazy(
        () =>
          Ontology.$fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          PropertyGroup.$fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          PropertyShape.$fromRdfResource(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      );

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<$Object> =
    ((values, _options) =>
      values.chain((values) =>
        values.chainMap((value) => {
          const valueAsValues = Right(value.toValues());
          return (
            NodeShape.$fromRdfResourceValues(valueAsValues, {
              context: _options.context,
              graph: _options.graph,
              ignoreRdfType: false,
              objectSet: _options.objectSet,
              preferredLanguages: _options.preferredLanguages,
              propertyPath: _options.propertyPath,
              resource: _options.resource,
            }) as Either<Error, Resource.Values<$Object>>
          )
            .altLazy(
              () =>
                Ontology.$fromRdfResourceValues(valueAsValues, {
                  context: _options.context,
                  graph: _options.graph,
                  ignoreRdfType: false,
                  objectSet: _options.objectSet,
                  preferredLanguages: _options.preferredLanguages,
                  propertyPath: _options.propertyPath,
                  resource: _options.resource,
                }) as Either<Error, Resource.Values<$Object>>,
            )
            .altLazy(
              () =>
                PropertyGroup.$fromRdfResourceValues(valueAsValues, {
                  context: _options.context,
                  graph: _options.graph,
                  ignoreRdfType: false,
                  objectSet: _options.objectSet,
                  preferredLanguages: _options.preferredLanguages,
                  propertyPath: _options.propertyPath,
                  resource: _options.resource,
                }) as Either<Error, Resource.Values<$Object>>,
            )
            .altLazy(
              () =>
                PropertyShape.$fromRdfResourceValues(valueAsValues, {
                  context: _options.context,
                  graph: _options.graph,
                  ignoreRdfType: false,
                  objectSet: _options.objectSet,
                  preferredLanguages: _options.preferredLanguages,
                  propertyPath: _options.propertyPath,
                  resource: _options.resource,
                }) as Either<Error, Resource.Values<$Object>>,
            )
            .chain((values) => values.head());
        }),
      )) satisfies $FromRdfResourceValuesFunction<$Object>;

  export type $Identifier = BlankNode | NamedNode;
  export namespace $Identifier {
    export const fromString = $identifierFromString; // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
    export const toString = Resource.Identifier.toString;
  }

  export const $schema = {
    kind: "NamedObjectUnion" as const,
    members: {
      NodeShape: { discriminantValues: ["NodeShape"], type: NodeShape.$schema },
      Ontology: { discriminantValues: ["Ontology"], type: Ontology.$schema },
      PropertyGroup: {
        discriminantValues: ["PropertyGroup"],
        type: PropertyGroup.$schema,
      },
      PropertyShape: {
        discriminantValues: ["PropertyShape"],
        type: PropertyShape.$schema,
      },
    },
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

  export const $toRdfResource: $ToRdfResourceFunction<$Object> = (
    value,
    options,
  ) => {
    if (NodeShape.isNodeShape(value)) {
      return NodeShape.$toRdfResource(value, options);
    }
    if (Ontology.isOntology(value)) {
      return Ontology.$toRdfResource(value, options);
    }
    if (PropertyGroup.isPropertyGroup(value)) {
      return PropertyGroup.$toRdfResource(value, options);
    }
    if (PropertyShape.isPropertyShape(value)) {
      return PropertyShape.$toRdfResource(value, options);
    }
    throw new Error("unrecognized type");
  };

  export const $toRdfResourceValues: $ToRdfResourceValuesFunction<$Object> = ((
    value,
    _options,
  ) => {
    if (NodeShape.isNodeShape(value)) {
      return [
        NodeShape.$toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (Ontology.isOntology(value)) {
      return [
        Ontology.$toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (PropertyGroup.isPropertyGroup(value)) {
      return [
        PropertyGroup.$toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }
    if (PropertyShape.isPropertyShape(value)) {
      return [
        PropertyShape.$toRdfResource(value, {
          graph: _options.graph,
          resourceSet: _options.resourceSet,
        }).identifier,
      ];
    }

    throw new Error("unable to serialize to RDF");
  }) as $ToRdfResourceValuesFunction<$Object>;
}
export interface $ObjectSet {
  nodeShape(
    identifier: NodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, NodeShape>>;

  nodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  nodeShapeIdentifiers(
    query?: $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
  ): Promise<Either<Error, readonly NodeShape.$Identifier[]>>;

  nodeShapes(
    query?: $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
  ): Promise<Either<Error, readonly NodeShape[]>>;

  ontology(
    identifier: Ontology.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Ontology>>;

  ontologyCount(
    query?: Pick<
      $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  ontologyIdentifiers(
    query?: $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
  ): Promise<Either<Error, readonly Ontology.$Identifier[]>>;

  ontologies(
    query?: $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
  ): Promise<Either<Error, readonly Ontology[]>>;

  propertyGroup(
    identifier: PropertyGroup.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, PropertyGroup>>;

  propertyGroupCount(
    query?: Pick<
      $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  propertyGroupIdentifiers(
    query?: $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
  ): Promise<Either<Error, readonly PropertyGroup.$Identifier[]>>;

  propertyGroups(
    query?: $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
  ): Promise<Either<Error, readonly PropertyGroup[]>>;

  propertyShape(
    identifier: PropertyShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, PropertyShape>>;

  propertyShapeCount(
    query?: Pick<
      $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  propertyShapeIdentifiers(
    query?: $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
  ): Promise<Either<Error, readonly PropertyShape.$Identifier[]>>;

  propertyShapes(
    query?: $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
  ): Promise<Either<Error, readonly PropertyShape[]>>;

  shape(
    identifier: Shape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Shape>>;

  shapeCount(
    query?: Pick<$ObjectSet.Query<Shape.$Filter, Shape.$Identifier>, "filter">,
  ): Promise<Either<Error, number>>;

  shapeIdentifiers(
    query?: $ObjectSet.Query<Shape.$Filter, Shape.$Identifier>,
  ): Promise<Either<Error, readonly Shape.$Identifier[]>>;

  shapes(
    query?: $ObjectSet.Query<Shape.$Filter, Shape.$Identifier>,
  ): Promise<Either<Error, readonly Shape[]>>;

  object(
    identifier: $Object.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, $Object>>;

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
    readonly preferredLanguages?: readonly string[];
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

  async nodeShape(
    identifier: NodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, NodeShape>> {
    return this.nodeShapeSync(identifier, options);
  }

  nodeShapeSync(
    identifier: NodeShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, NodeShape> {
    return this.nodeShapesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async nodeShapeCount(
    query?: Pick<
      $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.nodeShapeCountSync(query);
  }

  nodeShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.nodeShapesSync(query).map((objects) => objects.length);
  }

  async nodeShapeIdentifiers(
    query?: $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
  ): Promise<Either<Error, readonly NodeShape.$Identifier[]>> {
    return this.nodeShapeIdentifiersSync(query);
  }

  nodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
  ): Either<Error, readonly NodeShape.$Identifier[]> {
    return this.nodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async nodeShapes(
    query?: $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
  ): Promise<Either<Error, readonly NodeShape[]>> {
    return this.nodeShapesSync(query);
  }

  nodeShapesSync(
    query?: $ObjectSet.Query<NodeShape.$Filter, NodeShape.$Identifier>,
  ): Either<Error, readonly NodeShape[]> {
    return this.$objectsSync<
      NodeShape,
      NodeShape.$Filter,
      NodeShape.$Identifier
    >(
      {
        $filter: NodeShape.$filter,
        $fromRdfResource: NodeShape.$fromRdfResource,
        $fromRdfTypes: [NodeShape.$fromRdfType],
      },
      query,
    );
  }

  async ontology(
    identifier: Ontology.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Ontology>> {
    return this.ontologySync(identifier, options);
  }

  ontologySync(
    identifier: Ontology.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, Ontology> {
    return this.ontologiesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async ontologyCount(
    query?: Pick<
      $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.ontologyCountSync(query);
  }

  ontologyCountSync(
    query?: Pick<
      $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.ontologiesSync(query).map((objects) => objects.length);
  }

  async ontologyIdentifiers(
    query?: $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
  ): Promise<Either<Error, readonly Ontology.$Identifier[]>> {
    return this.ontologyIdentifiersSync(query);
  }

  ontologyIdentifiersSync(
    query?: $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
  ): Either<Error, readonly Ontology.$Identifier[]> {
    return this.ontologiesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async ontologies(
    query?: $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
  ): Promise<Either<Error, readonly Ontology[]>> {
    return this.ontologiesSync(query);
  }

  ontologiesSync(
    query?: $ObjectSet.Query<Ontology.$Filter, Ontology.$Identifier>,
  ): Either<Error, readonly Ontology[]> {
    return this.$objectsSync<Ontology, Ontology.$Filter, Ontology.$Identifier>(
      {
        $filter: Ontology.$filter,
        $fromRdfResource: Ontology.$fromRdfResource,
        $fromRdfTypes: [Ontology.$fromRdfType],
      },
      query,
    );
  }

  async propertyGroup(
    identifier: PropertyGroup.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, PropertyGroup>> {
    return this.propertyGroupSync(identifier, options);
  }

  propertyGroupSync(
    identifier: PropertyGroup.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, PropertyGroup> {
    return this.propertyGroupsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async propertyGroupCount(
    query?: Pick<
      $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.propertyGroupCountSync(query);
  }

  propertyGroupCountSync(
    query?: Pick<
      $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.propertyGroupsSync(query).map((objects) => objects.length);
  }

  async propertyGroupIdentifiers(
    query?: $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
  ): Promise<Either<Error, readonly PropertyGroup.$Identifier[]>> {
    return this.propertyGroupIdentifiersSync(query);
  }

  propertyGroupIdentifiersSync(
    query?: $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
  ): Either<Error, readonly PropertyGroup.$Identifier[]> {
    return this.propertyGroupsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async propertyGroups(
    query?: $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
  ): Promise<Either<Error, readonly PropertyGroup[]>> {
    return this.propertyGroupsSync(query);
  }

  propertyGroupsSync(
    query?: $ObjectSet.Query<PropertyGroup.$Filter, PropertyGroup.$Identifier>,
  ): Either<Error, readonly PropertyGroup[]> {
    return this.$objectsSync<
      PropertyGroup,
      PropertyGroup.$Filter,
      PropertyGroup.$Identifier
    >(
      {
        $filter: PropertyGroup.$filter,
        $fromRdfResource: PropertyGroup.$fromRdfResource,
        $fromRdfTypes: [PropertyGroup.$fromRdfType],
      },
      query,
    );
  }

  async propertyShape(
    identifier: PropertyShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, PropertyShape>> {
    return this.propertyShapeSync(identifier, options);
  }

  propertyShapeSync(
    identifier: PropertyShape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, PropertyShape> {
    return this.propertyShapesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async propertyShapeCount(
    query?: Pick<
      $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.propertyShapeCountSync(query);
  }

  propertyShapeCountSync(
    query?: Pick<
      $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.propertyShapesSync(query).map((objects) => objects.length);
  }

  async propertyShapeIdentifiers(
    query?: $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
  ): Promise<Either<Error, readonly PropertyShape.$Identifier[]>> {
    return this.propertyShapeIdentifiersSync(query);
  }

  propertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
  ): Either<Error, readonly PropertyShape.$Identifier[]> {
    return this.propertyShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async propertyShapes(
    query?: $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
  ): Promise<Either<Error, readonly PropertyShape[]>> {
    return this.propertyShapesSync(query);
  }

  propertyShapesSync(
    query?: $ObjectSet.Query<PropertyShape.$Filter, PropertyShape.$Identifier>,
  ): Either<Error, readonly PropertyShape[]> {
    return this.$objectsSync<
      PropertyShape,
      PropertyShape.$Filter,
      PropertyShape.$Identifier
    >(
      {
        $filter: PropertyShape.$filter,
        $fromRdfResource: PropertyShape.$fromRdfResource,
        $fromRdfTypes: [PropertyShape.$fromRdfType],
      },
      query,
    );
  }

  async shape(
    identifier: Shape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, Shape>> {
    return this.shapeSync(identifier, options);
  }

  shapeSync(
    identifier: Shape.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, Shape> {
    return this.shapesSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
  }

  async shapeCount(
    query?: Pick<$ObjectSet.Query<Shape.$Filter, Shape.$Identifier>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shapeCountSync(query);
  }

  shapeCountSync(
    query?: Pick<$ObjectSet.Query<Shape.$Filter, Shape.$Identifier>, "filter">,
  ): Either<Error, number> {
    return this.shapesSync(query).map((objects) => objects.length);
  }

  async shapeIdentifiers(
    query?: $ObjectSet.Query<Shape.$Filter, Shape.$Identifier>,
  ): Promise<Either<Error, readonly Shape.$Identifier[]>> {
    return this.shapeIdentifiersSync(query);
  }

  shapeIdentifiersSync(
    query?: $ObjectSet.Query<Shape.$Filter, Shape.$Identifier>,
  ): Either<Error, readonly Shape.$Identifier[]> {
    return this.shapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shapes(
    query?: $ObjectSet.Query<Shape.$Filter, Shape.$Identifier>,
  ): Promise<Either<Error, readonly Shape[]>> {
    return this.shapesSync(query);
  }

  shapesSync(
    query?: $ObjectSet.Query<Shape.$Filter, Shape.$Identifier>,
  ): Either<Error, readonly Shape[]> {
    return this.$objectUnionsSync<Shape, Shape.$Filter, Shape.$Identifier>(
      [
        {
          $filter: Shape.$filter,
          $fromRdfResource: NodeShape.$fromRdfResource,
          $fromRdfTypes: [NodeShape.$fromRdfType],
        },
        {
          $filter: Shape.$filter,
          $fromRdfResource: PropertyShape.$fromRdfResource,
          $fromRdfTypes: [PropertyShape.$fromRdfType],
        },
      ],
      query,
    );
  }

  async object(
    identifier: $Object.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Promise<Either<Error, $Object>> {
    return this.objectSync(identifier, options);
  }

  objectSync(
    identifier: $Object.$Identifier,
    options?: { preferredLanguages?: readonly string[] },
  ): Either<Error, $Object> {
    return this.objectsSync({
      identifiers: [identifier],
      preferredLanguages: options?.preferredLanguages,
    }).map((objects) => objects[0]);
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
          $fromRdfResource: NodeShape.$fromRdfResource,
          $fromRdfTypes: [NodeShape.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdfResource: Ontology.$fromRdfResource,
          $fromRdfTypes: [Ontology.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdfResource: PropertyGroup.$fromRdfResource,
          $fromRdfTypes: [PropertyGroup.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdfResource: PropertyShape.$fromRdfResource,
          $fromRdfTypes: [PropertyShape.$fromRdfType],
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
    namedObjectType: {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdfResource: $FromRdfResourceFunction<ObjectT>;
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
    } else if (namedObjectType.$fromRdfTypes.length > 0) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const fromRdfType of namedObjectType.$fromRdfTypes) {
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
          .$fromRdfResource(resource, fromRdfResourceOptions)
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
        const objectEither = namedObjectType.$fromRdfResource(
          resource,
          fromRdfResourceOptions,
        );
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }

      if (query?.filter && !namedObjectType.$filter(query.filter, object)) {
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
    namedObjectTypes: readonly {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdfResource: $FromRdfResourceFunction<ObjectT>;
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

    const fromRdfResourceOptions: Parameters<
      $FromRdfResourceFunction<ObjectT>
    >[1] = {
      graph,
      objectSet: this,
      preferredLanguages: query?.preferredLanguages,
    };

    let resources: {
      object?: ObjectT;
      namedObjectType?: {
        $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
        $fromRdfResource: $FromRdfResourceFunction<ObjectT>;
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
      namedObjectTypes.every(
        (namedObjectType) => namedObjectType.$fromRdfTypes.length > 0,
      )
    ) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const namedObjectType of namedObjectTypes) {
        for (const fromRdfType of namedObjectType.$fromRdfTypes) {
          for (const resource of resourceSet.instancesOf(fromRdfType, {
            graph,
          })) {
            if (!identifierSet.has(resource.identifier)) {
              identifierSet.add(resource.identifier);
              resources.push({ namedObjectType, resource });
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
        for (const namedObjectType of namedObjectTypes) {
          if (
            namedObjectType
              .$fromRdfResource(resource, fromRdfResourceOptions)
              .ifRight((object) => {
                resources.push({ object, namedObjectType, resource });
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
    for (let { object, namedObjectType, resource } of resources) {
      if (!object) {
        let objectEither: Either<Error, ObjectT>;
        if (namedObjectType) {
          objectEither = namedObjectType.$fromRdfResource(
            resource,
            fromRdfResourceOptions,
          );
        } else {
          objectEither = Left(new Error("no object types"));
          for (const tryObjectType of namedObjectTypes) {
            objectEither = tryObjectType.$fromRdfResource(
              resource,
              fromRdfResourceOptions,
            );
            if (objectEither.isRight()) {
              namedObjectType = tryObjectType;
              break;
            }
          }
        }
        if (objectEither.isLeft()) {
          return objectEither;
        }
        object = objectEither.unsafeCoerce();
      }
      if (!namedObjectType) {
        throw new Error("namedObjectType should be set here");
      }

      if (query?.filter && !namedObjectType.$filter(query.filter, object)) {
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

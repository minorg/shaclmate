import type {
  BlankNode,
  DatasetCore,
  Literal,
  NamedNode,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import { StoreFactory as DatasetFactory, DataFactory as dataFactory } from "n3";
import { Either, Left, Maybe } from "purify-ts";
import { LiteralFactory, Resource, ResourceSet } from "rdfjs-resource";

interface $BooleanFilter {
  readonly value?: boolean;
}

type $CollectionFilter<ItemFilterT> = ItemFilterT & {
  readonly $maxCount?: number;
  readonly $minCount?: number;
};

const $datasetFactory = new DatasetFactory();

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

    if (
      typeof filter.$maxCount !== "undefined" &&
      values.length > filter.$maxCount
    ) {
      return false;
    }

    if (
      typeof filter.$minCount !== "undefined" &&
      values.length < filter.$minCount
    ) {
      return false;
    }

    return true;
  };
}

function $filterBoolean(filter: $BooleanFilter, value: boolean) {
  if (typeof filter.value !== "undefined" && value !== filter.value) {
    return false;
  }

  return true;
}

function $filterIdentifier(
  filter: $IdentifierFilter,
  value: BlankNode | NamedNode,
) {
  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
    return false;
  }

  if (typeof filter.type !== "undefined" && value.termType !== filter.type) {
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

function $filterNamedNode(filter: $NamedNodeFilter, value: NamedNode) {
  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inValue) => inValue.equals(value))
  ) {
    return false;
  }

  return true;
}

function $filterNumeric<T extends bigint | number>(
  filter: $NumericFilter<T>,
  value: T,
) {
  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inValue) => inValue === value)
  ) {
    return false;
  }

  if (
    typeof filter.maxExclusive !== "undefined" &&
    value >= filter.maxExclusive
  ) {
    return false;
  }

  if (
    typeof filter.maxInclusive !== "undefined" &&
    value > filter.maxInclusive
  ) {
    return false;
  }

  if (
    typeof filter.minExclusive !== "undefined" &&
    value <= filter.minExclusive
  ) {
    return false;
  }

  if (
    typeof filter.minInclusive !== "undefined" &&
    value < filter.minInclusive
  ) {
    return false;
  }

  return true;
}

function $filterString(filter: $StringFilter, value: string) {
  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inValue) => inValue === value)
  ) {
    return false;
  }

  if (
    typeof filter.maxLength !== "undefined" &&
    value.length > filter.maxLength
  ) {
    return false;
  }

  if (
    typeof filter.minLength !== "undefined" &&
    value.length < filter.minLength
  ) {
    return false;
  }

  return true;
}

function $filterTerm(
  filter: $TermFilter,
  value: BlankNode | Literal | NamedNode,
): boolean {
  if (
    typeof filter.datatypeIn !== "undefined" &&
    (value.termType !== "Literal" ||
      !filter.datatypeIn.some((inDatatype) =>
        inDatatype.equals(value.datatype),
      ))
  ) {
    return false;
  }

  if (
    typeof filter.in !== "undefined" &&
    !filter.in.some((inTerm) => inTerm.equals(value))
  ) {
    return false;
  }

  if (
    typeof filter.languageIn !== "undefined" &&
    (value.termType !== "Literal" ||
      !filter.languageIn.some((inLanguage) => inLanguage === value.language))
  ) {
    return false;
  }

  if (
    typeof filter.typeIn !== "undefined" &&
    !filter.typeIn.some((inType) => inType === value.termType)
  ) {
    return false;
  }

  return true;
}

type $FromRdfOptions = {
  context?: any;
  ignoreRdfType?: boolean;
  objectSet?: $ObjectSet;
  preferredLanguages?: readonly string[];
};

function $fromRdfPreferredLanguages({
  focusResource,
  predicate,
  preferredLanguages,
  values,
}: {
  focusResource: Resource;
  predicate: NamedNode;
  preferredLanguages?: readonly string[];
  values: Resource.Values<Resource.TermValue>;
}): Either<Error, Resource.Values<Resource.TermValue>> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return Either.of<Error, Resource.Values<Resource.TermValue>>(values);
  }

  return values
    .chainMap((value) => value.toLiteral())
    .map((literalValues) => {
      // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
      // Within a preferredLanguage the literals may be in any order.
      let filteredLiteralValues: Resource.Values<Literal> | undefined;
      for (const preferredLanguage of preferredLanguages) {
        if (!filteredLiteralValues) {
          filteredLiteralValues = literalValues.filter(
            (value) => value.language === preferredLanguage,
          );
        } else {
          filteredLiteralValues = filteredLiteralValues.concat(
            ...literalValues
              .filter((value) => value.language === preferredLanguage)
              .toArray(),
          );
        }
      }

      return filteredLiteralValues!.map(
        (literalValue) =>
          new Resource.TermValue({
            focusResource,
            predicate,
            term: literalValue,
          }),
      );
    });
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

const $literalFactory = new LiteralFactory({ dataFactory: dataFactory });

interface $LiteralFilter extends Omit<$TermFilter, "in" | "type"> {
  readonly in?: readonly Literal[];
}

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

interface $NamedNodeFilter {
  readonly in?: readonly NamedNode[];
}

interface $NumericFilter<T extends bigint | number> {
  readonly in?: readonly T[];
  readonly maxExclusive?: T;
  readonly maxInclusive?: T;
  readonly minExclusive?: T;
  readonly minInclusive?: T;
}

type $PropertiesFromRdfParameters = {
  context?: any;
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
  readonly $type: "ShaclCoreNodeShape" | "ShaclCorePropertyShape";
  readonly and: readonly (readonly (BlankNode | NamedNode)[])[];
  readonly classes: readonly NamedNode[];
  readonly comments: readonly string[];
  readonly datatype: Maybe<NamedNode>;
  readonly deactivated: Maybe<boolean>;
  readonly flags: readonly string[];
  readonly hasValues: readonly (Literal | NamedNode)[];
  readonly in_: Maybe<readonly (Literal | NamedNode)[]>;
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
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      typeof filter.and !== "undefined" &&
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
      typeof filter.classes !== "undefined" &&
      !$filterArray<NamedNode, $NamedNodeFilter>($filterNamedNode)(
        filter.classes,
        value.classes,
      )
    ) {
      return false;
    }
    if (
      typeof filter.comments !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.comments,
        value.comments,
      )
    ) {
      return false;
    }
    if (
      typeof filter.datatype !== "undefined" &&
      !$filterMaybe<NamedNode, $NamedNodeFilter>($filterNamedNode)(
        filter.datatype,
        value.datatype,
      )
    ) {
      return false;
    }
    if (
      typeof filter.deactivated !== "undefined" &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.deactivated,
        value.deactivated,
      )
    ) {
      return false;
    }
    if (
      typeof filter.flags !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.flags,
        value.flags,
      )
    ) {
      return false;
    }
    if (
      typeof filter.hasValues !== "undefined" &&
      !$filterArray<Literal | NamedNode, $TermFilter>($filterTerm)(
        filter.hasValues,
        value.hasValues,
      )
    ) {
      return false;
    }
    if (
      typeof filter.in_ !== "undefined" &&
      !$filterMaybe<
        readonly (Literal | NamedNode)[],
        $CollectionFilter<$TermFilter>
      >($filterArray<Literal | NamedNode, $TermFilter>($filterTerm))(
        filter.in_,
        value.in_,
      )
    ) {
      return false;
    }
    if (
      typeof filter.isDefinedBy !== "undefined" &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.isDefinedBy, value.isDefinedBy)
    ) {
      return false;
    }
    if (
      typeof filter.labels !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.labels,
        value.labels,
      )
    ) {
      return false;
    }
    if (
      typeof filter.languageIn !== "undefined" &&
      !$filterMaybe<readonly string[], $CollectionFilter<$StringFilter>>(
        $filterArray<string, $StringFilter>($filterString),
      )(filter.languageIn, value.languageIn)
    ) {
      return false;
    }
    if (
      typeof filter.maxCount !== "undefined" &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.maxCount,
        value.maxCount,
      )
    ) {
      return false;
    }
    if (
      typeof filter.maxExclusive !== "undefined" &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.maxExclusive,
        value.maxExclusive,
      )
    ) {
      return false;
    }
    if (
      typeof filter.maxInclusive !== "undefined" &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.maxInclusive,
        value.maxInclusive,
      )
    ) {
      return false;
    }
    if (
      typeof filter.maxLength !== "undefined" &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.maxLength,
        value.maxLength,
      )
    ) {
      return false;
    }
    if (
      typeof filter.minCount !== "undefined" &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.minCount,
        value.minCount,
      )
    ) {
      return false;
    }
    if (
      typeof filter.minExclusive !== "undefined" &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.minExclusive,
        value.minExclusive,
      )
    ) {
      return false;
    }
    if (
      typeof filter.minInclusive !== "undefined" &&
      !$filterMaybe<Literal, $LiteralFilter>($filterLiteral)(
        filter.minInclusive,
        value.minInclusive,
      )
    ) {
      return false;
    }
    if (
      typeof filter.minLength !== "undefined" &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.minLength,
        value.minLength,
      )
    ) {
      return false;
    }
    if (
      typeof filter.nodeKind !== "undefined" &&
      !$filterMaybe<
        NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >,
        $NamedNodeFilter
      >($filterNamedNode)(filter.nodeKind, value.nodeKind)
    ) {
      return false;
    }
    if (
      typeof filter.nodes !== "undefined" &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.nodes, value.nodes)
    ) {
      return false;
    }
    if (
      typeof filter.not !== "undefined" &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.not, value.not)
    ) {
      return false;
    }
    if (
      typeof filter.or !== "undefined" &&
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
      typeof filter.patterns !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.patterns,
        value.patterns,
      )
    ) {
      return false;
    }
    if (
      typeof filter.xone !== "undefined" &&
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
    readonly classes?: $CollectionFilter<$NamedNodeFilter>;
    readonly comments?: $CollectionFilter<$StringFilter>;
    readonly datatype?: $MaybeFilter<$NamedNodeFilter>;
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
    readonly nodeKind?: $MaybeFilter<$NamedNodeFilter>;
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
      hasValues: readonly (Literal | NamedNode)[];
      in_: Maybe<readonly (Literal | NamedNode)[]>;
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
    return Either.of<Error, BaseShaclCoreShapeStatic.$Identifier>(
      $parameters.resource.identifier as BaseShaclCoreShapeStatic.$Identifier,
    ).chain(($identifier) =>
      Either.of<Error, Resource.Values<Resource.TermValue>>(
        $parameters.resource.values($schema.properties.and.identifier, {
          unique: true,
        }),
      )
        .chain((values) => values.chainMap((value) => value.toList()))
        .chain((valueLists) =>
          valueLists.chainMap((valueList) =>
            Either.of<Error, Resource.Values<Resource.TermValue>>(
              Resource.Values.fromArray({
                focusResource: $parameters.resource,
                predicate:
                  BaseShaclCoreShapeStatic.$schema.properties.and.identifier,
                values: valueList,
              }),
            ).chain((values) =>
              values.chainMap((value) => value.toIdentifier()),
            ),
          ),
        )
        .map((valueLists) => valueLists.map((valueList) => valueList.toArray()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          Resource.Values.fromValue({
            focusResource: $parameters.resource,
            predicate:
              BaseShaclCoreShapeStatic.$schema.properties.and.identifier,
            value: valuesArray,
          }),
        )
        .chain((values) => values.head())
        .chain((and) =>
          Either.of<Error, Resource.Values<Resource.TermValue>>(
            $parameters.resource.values($schema.properties.classes.identifier, {
              unique: true,
            }),
          )
            .chain((values) => values.chainMap((value) => value.toIri()))
            .map((values) => values.toArray())
            .map((valuesArray) =>
              Resource.Values.fromValue({
                focusResource: $parameters.resource,
                predicate:
                  BaseShaclCoreShapeStatic.$schema.properties.classes
                    .identifier,
                value: valuesArray,
              }),
            )
            .chain((values) => values.head())
            .chain((classes) =>
              Either.of<Error, Resource.Values<Resource.TermValue>>(
                $parameters.resource.values(
                  $schema.properties.comments.identifier,
                  { unique: true },
                ),
              )
                .chain((values) =>
                  $fromRdfPreferredLanguages({
                    focusResource: $parameters.resource,
                    predicate:
                      BaseShaclCoreShapeStatic.$schema.properties.comments
                        .identifier,
                    preferredLanguages: $parameters.preferredLanguages,
                    values,
                  }),
                )
                .chain((values) => values.chainMap((value) => value.toString()))
                .map((values) => values.toArray())
                .map((valuesArray) =>
                  Resource.Values.fromValue({
                    focusResource: $parameters.resource,
                    predicate:
                      BaseShaclCoreShapeStatic.$schema.properties.comments
                        .identifier,
                    value: valuesArray,
                  }),
                )
                .chain((values) => values.head())
                .chain((comments) =>
                  Either.of<Error, Resource.Values<Resource.TermValue>>(
                    $parameters.resource.values(
                      $schema.properties.datatype.identifier,
                      { unique: true },
                    ),
                  )
                    .chain((values) =>
                      values.chainMap((value) => value.toIri()),
                    )
                    .map((values) =>
                      values.length > 0
                        ? values.map((value) => Maybe.of(value))
                        : Resource.Values.fromValue<Maybe<NamedNode>>({
                            focusResource: $parameters.resource,
                            predicate:
                              BaseShaclCoreShapeStatic.$schema.properties
                                .datatype.identifier,
                            value: Maybe.empty(),
                          }),
                    )
                    .chain((values) => values.head())
                    .chain((datatype) =>
                      Either.of<Error, Resource.Values<Resource.TermValue>>(
                        $parameters.resource.values(
                          $schema.properties.deactivated.identifier,
                          { unique: true },
                        ),
                      )
                        .chain((values) =>
                          values.chainMap((value) => value.toBoolean()),
                        )
                        .map((values) =>
                          values.length > 0
                            ? values.map((value) => Maybe.of(value))
                            : Resource.Values.fromValue<Maybe<boolean>>({
                                focusResource: $parameters.resource,
                                predicate:
                                  BaseShaclCoreShapeStatic.$schema.properties
                                    .deactivated.identifier,
                                value: Maybe.empty(),
                              }),
                        )
                        .chain((values) => values.head())
                        .chain((deactivated) =>
                          Either.of<Error, Resource.Values<Resource.TermValue>>(
                            $parameters.resource.values(
                              $schema.properties.flags.identifier,
                              { unique: true },
                            ),
                          )
                            .chain((values) =>
                              $fromRdfPreferredLanguages({
                                focusResource: $parameters.resource,
                                predicate:
                                  BaseShaclCoreShapeStatic.$schema.properties
                                    .flags.identifier,
                                preferredLanguages:
                                  $parameters.preferredLanguages,
                                values,
                              }),
                            )
                            .chain((values) =>
                              values.chainMap((value) => value.toString()),
                            )
                            .map((values) => values.toArray())
                            .map((valuesArray) =>
                              Resource.Values.fromValue({
                                focusResource: $parameters.resource,
                                predicate:
                                  BaseShaclCoreShapeStatic.$schema.properties
                                    .flags.identifier,
                                value: valuesArray,
                              }),
                            )
                            .chain((values) => values.head())
                            .chain((flags) =>
                              Either.of<
                                Error,
                                Resource.Values<Resource.TermValue>
                              >(
                                $parameters.resource.values(
                                  $schema.properties.hasValues.identifier,
                                  { unique: true },
                                ),
                              )
                                .chain((values) =>
                                  values.chainMap((value) =>
                                    Either.of<
                                      Error,
                                      BlankNode | Literal | NamedNode
                                    >(value.toTerm()).chain((term) => {
                                      switch (term.termType) {
                                        case "Literal":
                                        case "NamedNode":
                                          return Either.of<
                                            Error,
                                            Literal | NamedNode
                                          >(term);
                                        default:
                                          return Left<
                                            Error,
                                            Literal | NamedNode
                                          >(
                                            new Resource.MistypedTermValueError(
                                              {
                                                actualValue: term,
                                                expectedValueType:
                                                  "(Literal | NamedNode)",
                                                focusResource:
                                                  $parameters.resource,
                                                predicate:
                                                  BaseShaclCoreShapeStatic
                                                    .$schema.properties
                                                    .hasValues.identifier,
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
                                    focusResource: $parameters.resource,
                                    predicate:
                                      BaseShaclCoreShapeStatic.$schema
                                        .properties.hasValues.identifier,
                                    value: valuesArray,
                                  }),
                                )
                                .chain((values) => values.head())
                                .chain((hasValues) =>
                                  Either.of<
                                    Error,
                                    Resource.Values<Resource.TermValue>
                                  >(
                                    $parameters.resource.values(
                                      $schema.properties.in_.identifier,
                                      { unique: true },
                                    ),
                                  )
                                    .chain((values) =>
                                      values.chainMap((value) =>
                                        value.toList(),
                                      ),
                                    )
                                    .chain((valueLists) =>
                                      valueLists.chainMap((valueList) =>
                                        Either.of<
                                          Error,
                                          Resource.Values<Resource.TermValue>
                                        >(
                                          Resource.Values.fromArray({
                                            focusResource: $parameters.resource,
                                            predicate:
                                              BaseShaclCoreShapeStatic.$schema
                                                .properties.in_.identifier,
                                            values: valueList,
                                          }),
                                        ).chain((values) =>
                                          values.chainMap((value) =>
                                            Either.of<
                                              Error,
                                              BlankNode | Literal | NamedNode
                                            >(value.toTerm()).chain((term) => {
                                              switch (term.termType) {
                                                case "Literal":
                                                case "NamedNode":
                                                  return Either.of<
                                                    Error,
                                                    Literal | NamedNode
                                                  >(term);
                                                default:
                                                  return Left<
                                                    Error,
                                                    Literal | NamedNode
                                                  >(
                                                    new Resource.MistypedTermValueError(
                                                      {
                                                        actualValue: term,
                                                        expectedValueType:
                                                          "(Literal | NamedNode)",
                                                        focusResource:
                                                          $parameters.resource,
                                                        predicate:
                                                          BaseShaclCoreShapeStatic
                                                            .$schema.properties
                                                            .in_.identifier,
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
                                            Maybe<
                                              readonly (Literal | NamedNode)[]
                                            >
                                          >({
                                            focusResource: $parameters.resource,
                                            predicate:
                                              BaseShaclCoreShapeStatic.$schema
                                                .properties.in_.identifier,
                                            value: Maybe.empty(),
                                          }),
                                    )
                                    .chain((values) => values.head())
                                    .chain((in_) =>
                                      Either.of<
                                        Error,
                                        Resource.Values<Resource.TermValue>
                                      >(
                                        $parameters.resource.values(
                                          $schema.properties.isDefinedBy
                                            .identifier,
                                          { unique: true },
                                        ),
                                      )
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
                                                focusResource:
                                                  $parameters.resource,
                                                predicate:
                                                  BaseShaclCoreShapeStatic
                                                    .$schema.properties
                                                    .isDefinedBy.identifier,
                                                value: Maybe.empty(),
                                              }),
                                        )
                                        .chain((values) => values.head())
                                        .chain((isDefinedBy) =>
                                          Either.of<
                                            Error,
                                            Resource.Values<Resource.TermValue>
                                          >(
                                            $parameters.resource.values(
                                              $schema.properties.labels
                                                .identifier,
                                              { unique: true },
                                            ),
                                          )
                                            .chain((values) =>
                                              $fromRdfPreferredLanguages({
                                                focusResource:
                                                  $parameters.resource,
                                                predicate:
                                                  BaseShaclCoreShapeStatic
                                                    .$schema.properties.labels
                                                    .identifier,
                                                preferredLanguages:
                                                  $parameters.preferredLanguages,
                                                values,
                                              }),
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
                                                predicate:
                                                  BaseShaclCoreShapeStatic
                                                    .$schema.properties.labels
                                                    .identifier,
                                                value: valuesArray,
                                              }),
                                            )
                                            .chain((values) => values.head())
                                            .chain((labels) =>
                                              Either.of<
                                                Error,
                                                Resource.Values<Resource.TermValue>
                                              >(
                                                $parameters.resource.values(
                                                  $schema.properties.languageIn
                                                    .identifier,
                                                  { unique: true },
                                                ),
                                              )
                                                .chain((values) =>
                                                  values.chainMap((value) =>
                                                    value.toList(),
                                                  ),
                                                )
                                                .chain((valueLists) =>
                                                  valueLists.chainMap(
                                                    (valueList) =>
                                                      Either.of<
                                                        Error,
                                                        Resource.Values<Resource.TermValue>
                                                      >(
                                                        Resource.Values.fromArray(
                                                          {
                                                            focusResource:
                                                              $parameters.resource,
                                                            predicate:
                                                              BaseShaclCoreShapeStatic
                                                                .$schema
                                                                .properties
                                                                .languageIn
                                                                .identifier,
                                                            values: valueList,
                                                          },
                                                        ),
                                                      )
                                                        .chain((values) =>
                                                          $fromRdfPreferredLanguages(
                                                            {
                                                              focusResource:
                                                                $parameters.resource,
                                                              predicate:
                                                                BaseShaclCoreShapeStatic
                                                                  .$schema
                                                                  .properties
                                                                  .languageIn
                                                                  .identifier,
                                                              preferredLanguages:
                                                                $parameters.preferredLanguages,
                                                              values,
                                                            },
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
                                                        focusResource:
                                                          $parameters.resource,
                                                        predicate:
                                                          BaseShaclCoreShapeStatic
                                                            .$schema.properties
                                                            .languageIn
                                                            .identifier,
                                                        value: Maybe.empty(),
                                                      }),
                                                )
                                                .chain((values) =>
                                                  values.head(),
                                                )
                                                .chain((languageIn) =>
                                                  Either.of<
                                                    Error,
                                                    Resource.Values<Resource.TermValue>
                                                  >(
                                                    $parameters.resource.values(
                                                      $schema.properties
                                                        .maxCount.identifier,
                                                      { unique: true },
                                                    ),
                                                  )
                                                    .chain((values) =>
                                                      values.chainMap((value) =>
                                                        value.toNumber(),
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
                                                            predicate:
                                                              BaseShaclCoreShapeStatic
                                                                .$schema
                                                                .properties
                                                                .maxCount
                                                                .identifier,
                                                            value:
                                                              Maybe.empty(),
                                                          }),
                                                    )
                                                    .chain((values) =>
                                                      values.head(),
                                                    )
                                                    .chain((maxCount) =>
                                                      Either.of<
                                                        Error,
                                                        Resource.Values<Resource.TermValue>
                                                      >(
                                                        $parameters.resource.values(
                                                          $schema.properties
                                                            .maxExclusive
                                                            .identifier,
                                                          {
                                                            unique: true,
                                                          },
                                                        ),
                                                      )
                                                        .chain((values) =>
                                                          $fromRdfPreferredLanguages(
                                                            {
                                                              focusResource:
                                                                $parameters.resource,
                                                              predicate:
                                                                BaseShaclCoreShapeStatic
                                                                  .$schema
                                                                  .properties
                                                                  .maxExclusive
                                                                  .identifier,
                                                              preferredLanguages:
                                                                $parameters.preferredLanguages,
                                                              values,
                                                            },
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
                                                                  $parameters.resource,
                                                                predicate:
                                                                  BaseShaclCoreShapeStatic
                                                                    .$schema
                                                                    .properties
                                                                    .maxExclusive
                                                                    .identifier,
                                                                value:
                                                                  Maybe.empty(),
                                                              }),
                                                        )
                                                        .chain((values) =>
                                                          values.head(),
                                                        )
                                                        .chain((maxExclusive) =>
                                                          Either.of<
                                                            Error,
                                                            Resource.Values<Resource.TermValue>
                                                          >(
                                                            $parameters.resource.values(
                                                              $schema.properties
                                                                .maxInclusive
                                                                .identifier,
                                                              {
                                                                unique: true,
                                                              },
                                                            ),
                                                          )
                                                            .chain((values) =>
                                                              $fromRdfPreferredLanguages(
                                                                {
                                                                  focusResource:
                                                                    $parameters.resource,
                                                                  predicate:
                                                                    BaseShaclCoreShapeStatic
                                                                      .$schema
                                                                      .properties
                                                                      .maxInclusive
                                                                      .identifier,
                                                                  preferredLanguages:
                                                                    $parameters.preferredLanguages,
                                                                  values,
                                                                },
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
                                                                      $parameters.resource,
                                                                    predicate:
                                                                      BaseShaclCoreShapeStatic
                                                                        .$schema
                                                                        .properties
                                                                        .maxInclusive
                                                                        .identifier,
                                                                    value:
                                                                      Maybe.empty(),
                                                                  }),
                                                            )
                                                            .chain((values) =>
                                                              values.head(),
                                                            )
                                                            .chain(
                                                              (maxInclusive) =>
                                                                Either.of<
                                                                  Error,
                                                                  Resource.Values<Resource.TermValue>
                                                                >(
                                                                  $parameters.resource.values(
                                                                    $schema
                                                                      .properties
                                                                      .maxLength
                                                                      .identifier,
                                                                    {
                                                                      unique: true,
                                                                    },
                                                                  ),
                                                                )
                                                                  .chain(
                                                                    (values) =>
                                                                      values.chainMap(
                                                                        (
                                                                          value,
                                                                        ) =>
                                                                          value.toNumber(),
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
                                                                            Maybe<number>
                                                                          >({
                                                                            focusResource:
                                                                              $parameters.resource,
                                                                            predicate:
                                                                              BaseShaclCoreShapeStatic
                                                                                .$schema
                                                                                .properties
                                                                                .maxLength
                                                                                .identifier,
                                                                            value:
                                                                              Maybe.empty(),
                                                                          }),
                                                                  )
                                                                  .chain(
                                                                    (values) =>
                                                                      values.head(),
                                                                  )
                                                                  .chain(
                                                                    (
                                                                      maxLength,
                                                                    ) =>
                                                                      Either.of<
                                                                        Error,
                                                                        Resource.Values<Resource.TermValue>
                                                                      >(
                                                                        $parameters.resource.values(
                                                                          $schema
                                                                            .properties
                                                                            .minCount
                                                                            .identifier,
                                                                          {
                                                                            unique: true,
                                                                          },
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
                                                                                value.toNumber(),
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
                                                                                      $parameters.resource,
                                                                                    predicate:
                                                                                      BaseShaclCoreShapeStatic
                                                                                        .$schema
                                                                                        .properties
                                                                                        .minCount
                                                                                        .identifier,
                                                                                    value:
                                                                                      Maybe.empty(),
                                                                                  },
                                                                                ),
                                                                        )
                                                                        .chain(
                                                                          (
                                                                            values,
                                                                          ) =>
                                                                            values.head(),
                                                                        )
                                                                        .chain(
                                                                          (
                                                                            minCount,
                                                                          ) =>
                                                                            Either.of<
                                                                              Error,
                                                                              Resource.Values<Resource.TermValue>
                                                                            >(
                                                                              $parameters.resource.values(
                                                                                $schema
                                                                                  .properties
                                                                                  .minExclusive
                                                                                  .identifier,
                                                                                {
                                                                                  unique: true,
                                                                                },
                                                                              ),
                                                                            )
                                                                              .chain(
                                                                                (
                                                                                  values,
                                                                                ) =>
                                                                                  $fromRdfPreferredLanguages(
                                                                                    {
                                                                                      focusResource:
                                                                                        $parameters.resource,
                                                                                      predicate:
                                                                                        BaseShaclCoreShapeStatic
                                                                                          .$schema
                                                                                          .properties
                                                                                          .minExclusive
                                                                                          .identifier,
                                                                                      preferredLanguages:
                                                                                        $parameters.preferredLanguages,
                                                                                      values,
                                                                                    },
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
                                                                                            $parameters.resource,
                                                                                          predicate:
                                                                                            BaseShaclCoreShapeStatic
                                                                                              .$schema
                                                                                              .properties
                                                                                              .minExclusive
                                                                                              .identifier,
                                                                                          value:
                                                                                            Maybe.empty(),
                                                                                        },
                                                                                      ),
                                                                              )
                                                                              .chain(
                                                                                (
                                                                                  values,
                                                                                ) =>
                                                                                  values.head(),
                                                                              )
                                                                              .chain(
                                                                                (
                                                                                  minExclusive,
                                                                                ) =>
                                                                                  Either.of<
                                                                                    Error,
                                                                                    Resource.Values<Resource.TermValue>
                                                                                  >(
                                                                                    $parameters.resource.values(
                                                                                      $schema
                                                                                        .properties
                                                                                        .minInclusive
                                                                                        .identifier,
                                                                                      {
                                                                                        unique: true,
                                                                                      },
                                                                                    ),
                                                                                  )
                                                                                    .chain(
                                                                                      (
                                                                                        values,
                                                                                      ) =>
                                                                                        $fromRdfPreferredLanguages(
                                                                                          {
                                                                                            focusResource:
                                                                                              $parameters.resource,
                                                                                            predicate:
                                                                                              BaseShaclCoreShapeStatic
                                                                                                .$schema
                                                                                                .properties
                                                                                                .minInclusive
                                                                                                .identifier,
                                                                                            preferredLanguages:
                                                                                              $parameters.preferredLanguages,
                                                                                            values,
                                                                                          },
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
                                                                                                  $parameters.resource,
                                                                                                predicate:
                                                                                                  BaseShaclCoreShapeStatic
                                                                                                    .$schema
                                                                                                    .properties
                                                                                                    .minInclusive
                                                                                                    .identifier,
                                                                                                value:
                                                                                                  Maybe.empty(),
                                                                                              },
                                                                                            ),
                                                                                    )
                                                                                    .chain(
                                                                                      (
                                                                                        values,
                                                                                      ) =>
                                                                                        values.head(),
                                                                                    )
                                                                                    .chain(
                                                                                      (
                                                                                        minInclusive,
                                                                                      ) =>
                                                                                        Either.of<
                                                                                          Error,
                                                                                          Resource.Values<Resource.TermValue>
                                                                                        >(
                                                                                          $parameters.resource.values(
                                                                                            $schema
                                                                                              .properties
                                                                                              .minLength
                                                                                              .identifier,
                                                                                            {
                                                                                              unique: true,
                                                                                            },
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
                                                                                                  value.toNumber(),
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
                                                                                                        $parameters.resource,
                                                                                                      predicate:
                                                                                                        BaseShaclCoreShapeStatic
                                                                                                          .$schema
                                                                                                          .properties
                                                                                                          .minLength
                                                                                                          .identifier,
                                                                                                      value:
                                                                                                        Maybe.empty(),
                                                                                                    },
                                                                                                  ),
                                                                                          )
                                                                                          .chain(
                                                                                            (
                                                                                              values,
                                                                                            ) =>
                                                                                              values.head(),
                                                                                          )
                                                                                          .chain(
                                                                                            (
                                                                                              minLength,
                                                                                            ) =>
                                                                                              Either.of<
                                                                                                Error,
                                                                                                Resource.Values<Resource.TermValue>
                                                                                              >(
                                                                                                $parameters.resource.values(
                                                                                                  $schema
                                                                                                    .properties
                                                                                                    .nodeKind
                                                                                                    .identifier,
                                                                                                  {
                                                                                                    unique: true,
                                                                                                  },
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
                                                                                                        value
                                                                                                          .toIri()
                                                                                                          .chain(
                                                                                                            (
                                                                                                              iri,
                                                                                                            ) => {
                                                                                                              switch (
                                                                                                                iri.value
                                                                                                              ) {
                                                                                                                case "http://www.w3.org/ns/shacl#BlankNode":
                                                                                                                  return Either.of<
                                                                                                                    Error,
                                                                                                                    NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as NamedNode<"http://www.w3.org/ns/shacl#BlankNode">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#BlankNodeOrIRI":
                                                                                                                  return Either.of<
                                                                                                                    Error,
                                                                                                                    NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as NamedNode<"http://www.w3.org/ns/shacl#BlankNodeOrIRI">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#BlankNodeOrLiteral":
                                                                                                                  return Either.of<
                                                                                                                    Error,
                                                                                                                    NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as NamedNode<"http://www.w3.org/ns/shacl#BlankNodeOrLiteral">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#IRI":
                                                                                                                  return Either.of<
                                                                                                                    Error,
                                                                                                                    NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as NamedNode<"http://www.w3.org/ns/shacl#IRI">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#IRIOrLiteral":
                                                                                                                  return Either.of<
                                                                                                                    Error,
                                                                                                                    NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as NamedNode<"http://www.w3.org/ns/shacl#IRIOrLiteral">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#Literal":
                                                                                                                  return Either.of<
                                                                                                                    Error,
                                                                                                                    NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as NamedNode<"http://www.w3.org/ns/shacl#Literal">,
                                                                                                                  );
                                                                                                                default:
                                                                                                                  return Left<
                                                                                                                    Error,
                                                                                                                    NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    new Resource.MistypedTermValueError(
                                                                                                                      {
                                                                                                                        actualValue:
                                                                                                                          iri,
                                                                                                                        expectedValueType:
                                                                                                                          'NamedNode<"http://www.w3.org/ns/shacl#BlankNode" | "http://www.w3.org/ns/shacl#BlankNodeOrIRI" | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral" | "http://www.w3.org/ns/shacl#IRI" | "http://www.w3.org/ns/shacl#IRIOrLiteral" | "http://www.w3.org/ns/shacl#Literal">',
                                                                                                                        focusResource:
                                                                                                                          $parameters.resource,
                                                                                                                        predicate:
                                                                                                                          BaseShaclCoreShapeStatic
                                                                                                                            .$schema
                                                                                                                            .properties
                                                                                                                            .nodeKind
                                                                                                                            .identifier,
                                                                                                                      },
                                                                                                                    ),
                                                                                                                  );
                                                                                                              }
                                                                                                            },
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
                                                                                                              $parameters.resource,
                                                                                                            predicate:
                                                                                                              BaseShaclCoreShapeStatic
                                                                                                                .$schema
                                                                                                                .properties
                                                                                                                .nodeKind
                                                                                                                .identifier,
                                                                                                            value:
                                                                                                              Maybe.empty(),
                                                                                                          },
                                                                                                        ),
                                                                                                )
                                                                                                .chain(
                                                                                                  (
                                                                                                    values,
                                                                                                  ) =>
                                                                                                    values.head(),
                                                                                                )
                                                                                                .chain(
                                                                                                  (
                                                                                                    nodeKind,
                                                                                                  ) =>
                                                                                                    Either.of<
                                                                                                      Error,
                                                                                                      Resource.Values<Resource.TermValue>
                                                                                                    >(
                                                                                                      $parameters.resource.values(
                                                                                                        $schema
                                                                                                          .properties
                                                                                                          .nodes
                                                                                                          .identifier,
                                                                                                        {
                                                                                                          unique: true,
                                                                                                        },
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
                                                                                                                $parameters.resource,
                                                                                                              predicate:
                                                                                                                BaseShaclCoreShapeStatic
                                                                                                                  .$schema
                                                                                                                  .properties
                                                                                                                  .nodes
                                                                                                                  .identifier,
                                                                                                              value:
                                                                                                                valuesArray,
                                                                                                            },
                                                                                                          ),
                                                                                                      )
                                                                                                      .chain(
                                                                                                        (
                                                                                                          values,
                                                                                                        ) =>
                                                                                                          values.head(),
                                                                                                      )
                                                                                                      .chain(
                                                                                                        (
                                                                                                          nodes,
                                                                                                        ) =>
                                                                                                          Either.of<
                                                                                                            Error,
                                                                                                            Resource.Values<Resource.TermValue>
                                                                                                          >(
                                                                                                            $parameters.resource.values(
                                                                                                              $schema
                                                                                                                .properties
                                                                                                                .not
                                                                                                                .identifier,
                                                                                                              {
                                                                                                                unique: true,
                                                                                                              },
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
                                                                                                                      $parameters.resource,
                                                                                                                    predicate:
                                                                                                                      BaseShaclCoreShapeStatic
                                                                                                                        .$schema
                                                                                                                        .properties
                                                                                                                        .not
                                                                                                                        .identifier,
                                                                                                                    value:
                                                                                                                      valuesArray,
                                                                                                                  },
                                                                                                                ),
                                                                                                            )
                                                                                                            .chain(
                                                                                                              (
                                                                                                                values,
                                                                                                              ) =>
                                                                                                                values.head(),
                                                                                                            )
                                                                                                            .chain(
                                                                                                              (
                                                                                                                not,
                                                                                                              ) =>
                                                                                                                Either.of<
                                                                                                                  Error,
                                                                                                                  Resource.Values<Resource.TermValue>
                                                                                                                >(
                                                                                                                  $parameters.resource.values(
                                                                                                                    $schema
                                                                                                                      .properties
                                                                                                                      .or
                                                                                                                      .identifier,
                                                                                                                    {
                                                                                                                      unique: true,
                                                                                                                    },
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
                                                                                                                          value.toList(),
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
                                                                                                                          Either.of<
                                                                                                                            Error,
                                                                                                                            Resource.Values<Resource.TermValue>
                                                                                                                          >(
                                                                                                                            Resource.Values.fromArray(
                                                                                                                              {
                                                                                                                                focusResource:
                                                                                                                                  $parameters.resource,
                                                                                                                                predicate:
                                                                                                                                  BaseShaclCoreShapeStatic
                                                                                                                                    .$schema
                                                                                                                                    .properties
                                                                                                                                    .or
                                                                                                                                    .identifier,
                                                                                                                                values:
                                                                                                                                  valueList,
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
                                                                                                                            $parameters.resource,
                                                                                                                          predicate:
                                                                                                                            BaseShaclCoreShapeStatic
                                                                                                                              .$schema
                                                                                                                              .properties
                                                                                                                              .or
                                                                                                                              .identifier,
                                                                                                                          value:
                                                                                                                            valuesArray,
                                                                                                                        },
                                                                                                                      ),
                                                                                                                  )
                                                                                                                  .chain(
                                                                                                                    (
                                                                                                                      values,
                                                                                                                    ) =>
                                                                                                                      values.head(),
                                                                                                                  )
                                                                                                                  .chain(
                                                                                                                    (
                                                                                                                      or,
                                                                                                                    ) =>
                                                                                                                      Either.of<
                                                                                                                        Error,
                                                                                                                        Resource.Values<Resource.TermValue>
                                                                                                                      >(
                                                                                                                        $parameters.resource.values(
                                                                                                                          $schema
                                                                                                                            .properties
                                                                                                                            .patterns
                                                                                                                            .identifier,
                                                                                                                          {
                                                                                                                            unique: true,
                                                                                                                          },
                                                                                                                        ),
                                                                                                                      )
                                                                                                                        .chain(
                                                                                                                          (
                                                                                                                            values,
                                                                                                                          ) =>
                                                                                                                            $fromRdfPreferredLanguages(
                                                                                                                              {
                                                                                                                                focusResource:
                                                                                                                                  $parameters.resource,
                                                                                                                                predicate:
                                                                                                                                  BaseShaclCoreShapeStatic
                                                                                                                                    .$schema
                                                                                                                                    .properties
                                                                                                                                    .patterns
                                                                                                                                    .identifier,
                                                                                                                                preferredLanguages:
                                                                                                                                  $parameters.preferredLanguages,
                                                                                                                                values,
                                                                                                                              },
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
                                                                                                                                  $parameters.resource,
                                                                                                                                predicate:
                                                                                                                                  BaseShaclCoreShapeStatic
                                                                                                                                    .$schema
                                                                                                                                    .properties
                                                                                                                                    .patterns
                                                                                                                                    .identifier,
                                                                                                                                value:
                                                                                                                                  valuesArray,
                                                                                                                              },
                                                                                                                            ),
                                                                                                                        )
                                                                                                                        .chain(
                                                                                                                          (
                                                                                                                            values,
                                                                                                                          ) =>
                                                                                                                            values.head(),
                                                                                                                        )
                                                                                                                        .chain(
                                                                                                                          (
                                                                                                                            patterns,
                                                                                                                          ) =>
                                                                                                                            Either.of<
                                                                                                                              Error,
                                                                                                                              Resource.Values<Resource.TermValue>
                                                                                                                            >(
                                                                                                                              $parameters.resource.values(
                                                                                                                                $schema
                                                                                                                                  .properties
                                                                                                                                  .xone
                                                                                                                                  .identifier,
                                                                                                                                {
                                                                                                                                  unique: true,
                                                                                                                                },
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
                                                                                                                                      value.toList(),
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
                                                                                                                                      Either.of<
                                                                                                                                        Error,
                                                                                                                                        Resource.Values<Resource.TermValue>
                                                                                                                                      >(
                                                                                                                                        Resource.Values.fromArray(
                                                                                                                                          {
                                                                                                                                            focusResource:
                                                                                                                                              $parameters.resource,
                                                                                                                                            predicate:
                                                                                                                                              BaseShaclCoreShapeStatic
                                                                                                                                                .$schema
                                                                                                                                                .properties
                                                                                                                                                .xone
                                                                                                                                                .identifier,
                                                                                                                                            values:
                                                                                                                                              valueList,
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
                                                                                                                                        $parameters.resource,
                                                                                                                                      predicate:
                                                                                                                                        BaseShaclCoreShapeStatic
                                                                                                                                          .$schema
                                                                                                                                          .properties
                                                                                                                                          .xone
                                                                                                                                          .identifier,
                                                                                                                                      value:
                                                                                                                                        valuesArray,
                                                                                                                                    },
                                                                                                                                  ),
                                                                                                                              )
                                                                                                                              .chain(
                                                                                                                                (
                                                                                                                                  values,
                                                                                                                                ) =>
                                                                                                                                  values.head(),
                                                                                                                              )
                                                                                                                              .map(
                                                                                                                                (
                                                                                                                                  xone,
                                                                                                                                ) => ({
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
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_baseShaclCoreShape.$identifier);
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.and.identifier,
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
      BaseShaclCoreShapeStatic.$schema.properties.classes.identifier,
      _baseShaclCoreShape.classes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.comments.identifier,
      _baseShaclCoreShape.comments.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.datatype.identifier,
      _baseShaclCoreShape.datatype.toList(),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.deactivated.identifier,
      _baseShaclCoreShape.deactivated
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.flags.identifier,
      _baseShaclCoreShape.flags.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.hasValues.identifier,
      _baseShaclCoreShape.hasValues.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.in_.identifier,
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
      BaseShaclCoreShapeStatic.$schema.properties.isDefinedBy.identifier,
      _baseShaclCoreShape.isDefinedBy.toList(),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.labels.identifier,
      _baseShaclCoreShape.labels.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.languageIn.identifier,
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
      BaseShaclCoreShapeStatic.$schema.properties.maxCount.identifier,
      _baseShaclCoreShape.maxCount
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.maxExclusive.identifier,
      _baseShaclCoreShape.maxExclusive.toList(),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.maxInclusive.identifier,
      _baseShaclCoreShape.maxInclusive.toList(),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.maxLength.identifier,
      _baseShaclCoreShape.maxLength
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.minCount.identifier,
      _baseShaclCoreShape.minCount
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.minExclusive.identifier,
      _baseShaclCoreShape.minExclusive.toList(),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.minInclusive.identifier,
      _baseShaclCoreShape.minInclusive.toList(),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.minLength.identifier,
      _baseShaclCoreShape.minLength
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.unsignedInt),
        ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.nodeKind.identifier,
      _baseShaclCoreShape.nodeKind.toList(),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.nodes.identifier,
      _baseShaclCoreShape.nodes.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.not.identifier,
      _baseShaclCoreShape.not.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.or.identifier,
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
      BaseShaclCoreShapeStatic.$schema.properties.patterns.identifier,
      _baseShaclCoreShape.patterns.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.xone.identifier,
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
          descendantValues: ["ShaclCoreNodeShape", "ShaclCorePropertyShape"],
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
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "NamedNode" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comments: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "NamedNode" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#datatype",
        ),
      },
      deactivated: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#deactivated",
        ),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "Term" as const,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#hasValue",
        ),
      },
      in_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({
              kind: "Term" as const,
              nodeKinds: ["Literal" as const, "NamedNode" as const],
            }),
          }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
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
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#languageIn",
        ),
      },
      maxCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxCount",
        ),
      },
      maxExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxExclusive",
        ),
      },
      maxInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxInclusive",
        ),
      },
      maxLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxLength",
        ),
      },
      minCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minCount",
        ),
      },
      minExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minExclusive",
        ),
      },
      minInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minInclusive",
        ),
      },
      minLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minLength",
        ),
      },
      nodeKind: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "NamedNode" as const,
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
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#nodeKind",
        ),
      },
      nodes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      not: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
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
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
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
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;
}
export interface ShaclCorePropertyShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCorePropertyShape.$Identifier;
  readonly $type: "ShaclCorePropertyShape";
  readonly defaultValue: Maybe<Literal | NamedNode>;
  readonly descriptions: readonly string[];
  readonly groups: readonly (BlankNode | NamedNode)[];
  readonly names: readonly string[];
  readonly order: Maybe<number>;
  readonly path: PropertyPath;
  readonly uniqueLang: Maybe<boolean>;
}

export namespace ShaclCorePropertyShape {
  export function $filter(
    filter: ShaclCorePropertyShape.$Filter,
    value: ShaclCorePropertyShape,
  ): boolean {
    if (!BaseShaclCoreShapeStatic.$filter(filter, value)) {
      return false;
    }
    if (
      typeof filter.defaultValue !== "undefined" &&
      !$filterMaybe<Literal | NamedNode, $TermFilter>($filterTerm)(
        filter.defaultValue,
        value.defaultValue,
      )
    ) {
      return false;
    }
    if (
      typeof filter.descriptions !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.descriptions,
        value.descriptions,
      )
    ) {
      return false;
    }
    if (
      typeof filter.groups !== "undefined" &&
      !$filterArray<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.groups, value.groups)
    ) {
      return false;
    }
    if (
      typeof filter.names !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.names,
        value.names,
      )
    ) {
      return false;
    }
    if (
      typeof filter.order !== "undefined" &&
      !$filterMaybe<number, $NumericFilter<number>>($filterNumeric<number>)(
        filter.order,
        value.order,
      )
    ) {
      return false;
    }
    if (
      typeof filter.path !== "undefined" &&
      !PropertyPath.$filter(filter.path, value.path)
    ) {
      return false;
    }
    if (
      typeof filter.uniqueLang !== "undefined" &&
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
    return ShaclCorePropertyShape.$propertiesFromRdf({
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
      $type: "ShaclCorePropertyShape";
      defaultValue: Maybe<Literal | NamedNode>;
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
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyShape":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCorePropertyShape.$fromRdfType,
                )
              ) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
      ).chain((_rdfTypeCheck) =>
        Either.of<Error, ShaclCorePropertyShape.$Identifier>(
          $parameters.resource.identifier as ShaclCorePropertyShape.$Identifier,
        ).chain(($identifier) =>
          Either.of<Error, "ShaclCorePropertyShape">(
            "ShaclCorePropertyShape" as const,
          ).chain(($type) =>
            Either.of<Error, Resource.Values<Resource.TermValue>>(
              $parameters.resource.values(
                $schema.properties.defaultValue.identifier,
                { unique: true },
              ),
            )
              .chain((values) =>
                values.chainMap((value) =>
                  Either.of<Error, BlankNode | Literal | NamedNode>(
                    value.toTerm(),
                  ).chain((term) => {
                    switch (term.termType) {
                      case "Literal":
                      case "NamedNode":
                        return Either.of<Error, Literal | NamedNode>(term);
                      default:
                        return Left<Error, Literal | NamedNode>(
                          new Resource.MistypedTermValueError({
                            actualValue: term,
                            expectedValueType: "(Literal | NamedNode)",
                            focusResource: $parameters.resource,
                            predicate:
                              ShaclCorePropertyShape.$schema.properties
                                .defaultValue.identifier,
                          }),
                        );
                    }
                  }),
                ),
              )
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<Literal | NamedNode>>({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclCorePropertyShape.$schema.properties.defaultValue
                          .identifier,
                      value: Maybe.empty(),
                    }),
              )
              .chain((values) => values.head())
              .chain((defaultValue) =>
                Either.of<Error, Resource.Values<Resource.TermValue>>(
                  $parameters.resource.values(
                    $schema.properties.descriptions.identifier,
                    { unique: true },
                  ),
                )
                  .chain((values) =>
                    $fromRdfPreferredLanguages({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclCorePropertyShape.$schema.properties.descriptions
                          .identifier,
                      preferredLanguages: $parameters.preferredLanguages,
                      values,
                    }),
                  )
                  .chain((values) =>
                    values.chainMap((value) => value.toString()),
                  )
                  .map((values) => values.toArray())
                  .map((valuesArray) =>
                    Resource.Values.fromValue({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclCorePropertyShape.$schema.properties.descriptions
                          .identifier,
                      value: valuesArray,
                    }),
                  )
                  .chain((values) => values.head())
                  .chain((descriptions) =>
                    Either.of<Error, Resource.Values<Resource.TermValue>>(
                      $parameters.resource.values(
                        $schema.properties.groups.identifier,
                        { unique: true },
                      ),
                    )
                      .chain((values) =>
                        values.chainMap((value) => value.toIdentifier()),
                      )
                      .map((values) => values.toArray())
                      .map((valuesArray) =>
                        Resource.Values.fromValue({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclCorePropertyShape.$schema.properties.groups
                              .identifier,
                          value: valuesArray,
                        }),
                      )
                      .chain((values) => values.head())
                      .chain((groups) =>
                        Either.of<Error, Resource.Values<Resource.TermValue>>(
                          $parameters.resource.values(
                            $schema.properties.names.identifier,
                            { unique: true },
                          ),
                        )
                          .chain((values) =>
                            $fromRdfPreferredLanguages({
                              focusResource: $parameters.resource,
                              predicate:
                                ShaclCorePropertyShape.$schema.properties.names
                                  .identifier,
                              preferredLanguages:
                                $parameters.preferredLanguages,
                              values,
                            }),
                          )
                          .chain((values) =>
                            values.chainMap((value) => value.toString()),
                          )
                          .map((values) => values.toArray())
                          .map((valuesArray) =>
                            Resource.Values.fromValue({
                              focusResource: $parameters.resource,
                              predicate:
                                ShaclCorePropertyShape.$schema.properties.names
                                  .identifier,
                              value: valuesArray,
                            }),
                          )
                          .chain((values) => values.head())
                          .chain((names) =>
                            Either.of<
                              Error,
                              Resource.Values<Resource.TermValue>
                            >(
                              $parameters.resource.values(
                                $schema.properties.order.identifier,
                                { unique: true },
                              ),
                            )
                              .chain((values) =>
                                values.chainMap((value) => value.toNumber()),
                              )
                              .map((values) =>
                                values.length > 0
                                  ? values.map((value) => Maybe.of(value))
                                  : Resource.Values.fromValue<Maybe<number>>({
                                      focusResource: $parameters.resource,
                                      predicate:
                                        ShaclCorePropertyShape.$schema
                                          .properties.order.identifier,
                                      value: Maybe.empty(),
                                    }),
                              )
                              .chain((values) => values.head())
                              .chain((order) =>
                                Either.of<
                                  Error,
                                  Resource.Values<Resource.TermValue>
                                >(
                                  $parameters.resource.values(
                                    $schema.properties.path.identifier,
                                    { unique: true },
                                  ),
                                )
                                  .chain((values) =>
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
                                  )
                                  .chain((values) => values.head())
                                  .chain((path) =>
                                    Either.of<
                                      Error,
                                      Resource.Values<Resource.TermValue>
                                    >(
                                      $parameters.resource.values(
                                        $schema.properties.uniqueLang
                                          .identifier,
                                        { unique: true },
                                      ),
                                    )
                                      .chain((values) =>
                                        values.chainMap((value) =>
                                          value.toBoolean(),
                                        ),
                                      )
                                      .map((values) =>
                                        values.length > 0
                                          ? values.map((value) =>
                                              Maybe.of(value),
                                            )
                                          : Resource.Values.fromValue<
                                              Maybe<boolean>
                                            >({
                                              focusResource:
                                                $parameters.resource,
                                              predicate:
                                                ShaclCorePropertyShape.$schema
                                                  .properties.uniqueLang
                                                  .identifier,
                                              value: Maybe.empty(),
                                            }),
                                      )
                                      .chain((values) => values.head())
                                      .map((uniqueLang) => ({
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
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
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
      ShaclCorePropertyShape.$schema.properties.defaultValue.identifier,
      _shaclCorePropertyShape.defaultValue.toList(),
      options?.graph,
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.descriptions.identifier,
      _shaclCorePropertyShape.descriptions.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.groups.identifier,
      _shaclCorePropertyShape.groups.flatMap((item) => [item]),
      options?.graph,
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.names.identifier,
      _shaclCorePropertyShape.names.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.order.identifier,
      _shaclCorePropertyShape.order
        .toList()
        .flatMap((value) => [
          $literalFactory.number(value, $RdfVocabularies.xsd.double),
        ]),
      options?.graph,
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.path.identifier,
      [
        PropertyPath.$toRdf(_shaclCorePropertyShape.path, {
          graph: options?.graph,
          resourceSet: resourceSet,
        }).identifier,
      ],
      options?.graph,
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.uniqueLang.identifier,
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
          item: () => ({
            kind: "Term" as const,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#defaultValue",
        ),
      },
      descriptions: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#description",
        ),
      },
      groups: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
      },
      names: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
      },
      order: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Float" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
      },
      path: {
        kind: "Shacl" as const,
        type: () => PropertyPath.$schema,
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      },
      uniqueLang: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#uniqueLang",
        ),
      },
    },
  } as const;
}

import { PropertyPath } from "./PropertyPath.js";
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
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      typeof filter.comments !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.comments,
        value.comments,
      )
    ) {
      return false;
    }
    if (
      typeof filter.labels !== "undefined" &&
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
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#PropertyGroup":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCorePropertyGroup.$fromRdfType,
                )
              ) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
    ).chain((_rdfTypeCheck) =>
      Either.of<Error, ShaclCorePropertyGroup.$Identifier>(
        $parameters.resource.identifier as ShaclCorePropertyGroup.$Identifier,
      ).chain(($identifier) =>
        Either.of<Error, "ShaclCorePropertyGroup">(
          "ShaclCorePropertyGroup" as const,
        ).chain(($type) =>
          Either.of<Error, Resource.Values<Resource.TermValue>>(
            $parameters.resource.values(
              $schema.properties.comments.identifier,
              { unique: true },
            ),
          )
            .chain((values) =>
              $fromRdfPreferredLanguages({
                focusResource: $parameters.resource,
                predicate:
                  ShaclCorePropertyGroup.$schema.properties.comments.identifier,
                preferredLanguages: $parameters.preferredLanguages,
                values,
              }),
            )
            .chain((values) => values.chainMap((value) => value.toString()))
            .map((values) => values.toArray())
            .map((valuesArray) =>
              Resource.Values.fromValue({
                focusResource: $parameters.resource,
                predicate:
                  ShaclCorePropertyGroup.$schema.properties.comments.identifier,
                value: valuesArray,
              }),
            )
            .chain((values) => values.head())
            .chain((comments) =>
              Either.of<Error, Resource.Values<Resource.TermValue>>(
                $parameters.resource.values(
                  $schema.properties.labels.identifier,
                  { unique: true },
                ),
              )
                .chain((values) =>
                  $fromRdfPreferredLanguages({
                    focusResource: $parameters.resource,
                    predicate:
                      ShaclCorePropertyGroup.$schema.properties.labels
                        .identifier,
                    preferredLanguages: $parameters.preferredLanguages,
                    values,
                  }),
                )
                .chain((values) => values.chainMap((value) => value.toString()))
                .map((values) => values.toArray())
                .map((valuesArray) =>
                  Resource.Values.fromValue({
                    focusResource: $parameters.resource,
                    predicate:
                      ShaclCorePropertyGroup.$schema.properties.labels
                        .identifier,
                    value: valuesArray,
                  }),
                )
                .chain((values) => values.head())
                .map((labels) => ({ $identifier, $type, comments, labels })),
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
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_shaclCorePropertyGroup.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyGroup"),
        options?.graph,
      );
    }
    resource.add(
      ShaclCorePropertyGroup.$schema.properties.comments.identifier,
      _shaclCorePropertyGroup.comments.flatMap((item) => [
        $literalFactory.string(item),
      ]),
      options?.graph,
    );
    resource.add(
      ShaclCorePropertyGroup.$schema.properties.labels.identifier,
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
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
    },
  } as const;
}
export interface ShaclCoreNodeShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCoreNodeShape.$Identifier;
  readonly $type: "ShaclCoreNodeShape";
  readonly closed: Maybe<boolean>;
  readonly ignoredProperties: Maybe<readonly NamedNode[]>;
  readonly properties: readonly (BlankNode | NamedNode)[];
}

export namespace ShaclCoreNodeShape {
  export function $filter(
    filter: ShaclCoreNodeShape.$Filter,
    value: ShaclCoreNodeShape,
  ): boolean {
    if (!BaseShaclCoreShapeStatic.$filter(filter, value)) {
      return false;
    }
    if (
      typeof filter.closed !== "undefined" &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.closed,
        value.closed,
      )
    ) {
      return false;
    }
    if (
      typeof filter.ignoredProperties !== "undefined" &&
      !$filterMaybe<readonly NamedNode[], $CollectionFilter<$NamedNodeFilter>>(
        $filterArray<NamedNode, $NamedNodeFilter>($filterNamedNode),
      )(filter.ignoredProperties, value.ignoredProperties)
    ) {
      return false;
    }
    if (
      typeof filter.properties !== "undefined" &&
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
    readonly ignoredProperties?: $MaybeFilter<
      $CollectionFilter<$NamedNodeFilter>
    >;
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
    return ShaclCoreNodeShape.$propertiesFromRdf({
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
      $type: "ShaclCoreNodeShape";
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
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/ns/shacl#NodeShape":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCoreNodeShape.$fromRdfType,
                )
              ) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
      ).chain((_rdfTypeCheck) =>
        Either.of<Error, ShaclCoreNodeShape.$Identifier>(
          $parameters.resource.identifier as ShaclCoreNodeShape.$Identifier,
        ).chain(($identifier) =>
          Either.of<Error, "ShaclCoreNodeShape">(
            "ShaclCoreNodeShape" as const,
          ).chain(($type) =>
            Either.of<Error, Resource.Values<Resource.TermValue>>(
              $parameters.resource.values(
                $schema.properties.closed.identifier,
                { unique: true },
              ),
            )
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclCoreNodeShape.$schema.properties.closed.identifier,
                      value: Maybe.empty(),
                    }),
              )
              .chain((values) => values.head())
              .chain((closed) =>
                Either.of<Error, Resource.Values<Resource.TermValue>>(
                  $parameters.resource.values(
                    $schema.properties.ignoredProperties.identifier,
                    { unique: true },
                  ),
                )
                  .chain((values) => values.chainMap((value) => value.toList()))
                  .chain((valueLists) =>
                    valueLists.chainMap((valueList) =>
                      Either.of<Error, Resource.Values<Resource.TermValue>>(
                        Resource.Values.fromArray({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclCoreNodeShape.$schema.properties
                              .ignoredProperties.identifier,
                          values: valueList,
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
                      : Resource.Values.fromValue<Maybe<readonly NamedNode[]>>({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclCoreNodeShape.$schema.properties
                              .ignoredProperties.identifier,
                          value: Maybe.empty(),
                        }),
                  )
                  .chain((values) => values.head())
                  .chain((ignoredProperties) =>
                    Either.of<Error, Resource.Values<Resource.TermValue>>(
                      $parameters.resource.values(
                        $schema.properties.properties.identifier,
                        { unique: true },
                      ),
                    )
                      .chain((values) =>
                        values.chainMap((value) => value.toIdentifier()),
                      )
                      .map((values) => values.toArray())
                      .map((valuesArray) =>
                        Resource.Values.fromValue({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclCoreNodeShape.$schema.properties.properties
                              .identifier,
                          value: valuesArray,
                        }),
                      )
                      .chain((values) => values.head())
                      .map((properties) => ({
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
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
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
      ShaclCoreNodeShape.$schema.properties.closed.identifier,
      _shaclCoreNodeShape.closed
        .toList()
        .flatMap((value) => [
          $literalFactory.boolean(value, $RdfVocabularies.xsd.boolean),
        ]),
      options?.graph,
    );
    resource.add(
      ShaclCoreNodeShape.$schema.properties.ignoredProperties.identifier,
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
      ShaclCoreNodeShape.$schema.properties.properties.identifier,
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
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
      },
      ignoredProperties: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({ kind: "NamedNode" as const }),
          }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ignoredProperties",
        ),
      },
      properties: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#property",
        ),
      },
    },
  } as const;
}
export interface OwlOntology {
  readonly $identifier: OwlOntology.$Identifier;
  readonly $type: "OwlOntology";
  readonly labels: readonly string[];
}

export namespace OwlOntology {
  export function $filter(
    filter: OwlOntology.$Filter,
    value: OwlOntology,
  ): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      typeof filter.labels !== "undefined" &&
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
    return OwlOntology.$propertiesFromRdf({
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
      $type: "OwlOntology";
      labels: readonly string[];
    }
  > {
    return (
      !$parameters.ignoreRdfType
        ? $parameters.resource
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/2002/07/owl#Ontology":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if ($parameters.resource.isInstanceOf(OwlOntology.$fromRdfType)) {
                return Either.of<Error, true>(true);
              }

              return Left(
                new Error(
                  `${Resource.Identifier.toString(
                    $parameters.resource.identifier,
                  )} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
                ),
              );
            })
        : Either.of<Error, true>(true)
    ).chain((_rdfTypeCheck) =>
      Either.of<Error, OwlOntology.$Identifier>(
        $parameters.resource.identifier as OwlOntology.$Identifier,
      ).chain(($identifier) =>
        Either.of<Error, "OwlOntology">("OwlOntology" as const).chain(($type) =>
          Either.of<Error, Resource.Values<Resource.TermValue>>(
            $parameters.resource.values($schema.properties.labels.identifier, {
              unique: true,
            }),
          )
            .chain((values) =>
              $fromRdfPreferredLanguages({
                focusResource: $parameters.resource,
                predicate: OwlOntology.$schema.properties.labels.identifier,
                preferredLanguages: $parameters.preferredLanguages,
                values,
              }),
            )
            .chain((values) => values.chainMap((value) => value.toString()))
            .map((values) => values.toArray())
            .map((valuesArray) =>
              Resource.Values.fromValue({
                focusResource: $parameters.resource,
                predicate: OwlOntology.$schema.properties.labels.identifier,
                value: valuesArray,
              }),
            )
            .chain((values) => values.head())
            .map((labels) => ({ $identifier, $type, labels })),
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
      new ResourceSet($datasetFactory.dataset(), { dataFactory: dataFactory });
    const resource = resourceSet.resource(_owlOntology.$identifier);
    if (!options?.ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
        options?.graph,
      );
    }
    resource.add(
      OwlOntology.$schema.properties.labels.identifier,
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
        identifier: dataFactory.namedNode(
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
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      ShaclCoreNodeShape.isShaclCoreNodeShape(value) &&
      filter.on?.ShaclCoreNodeShape &&
      !ShaclCoreNodeShape.$filter(
        filter.on.ShaclCoreNodeShape,
        value as ShaclCoreNodeShape,
      )
    ) {
      return false;
    }
    if (
      ShaclCorePropertyShape.isShaclCorePropertyShape(value) &&
      filter.on?.ShaclCorePropertyShape &&
      !ShaclCorePropertyShape.$filter(
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
        ShaclCoreNodeShape.$Filter,
        "$identifier"
      >;
      readonly ShaclCorePropertyShape?: Omit<
        ShaclCorePropertyShape.$Filter,
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
      ShaclCoreNodeShape.isShaclCoreNodeShape(object) ||
      ShaclCorePropertyShape.isShaclCorePropertyShape(object)
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
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "NamedNode" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comments: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "NamedNode" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#datatype",
        ),
      },
      deactivated: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Boolean" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#deactivated",
        ),
      },
      flags: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({
            kind: "Term" as const,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#hasValue",
        ),
      },
      in_: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "List" as const,
            item: () => ({
              kind: "Term" as const,
              nodeKinds: ["Literal" as const, "NamedNode" as const],
            }),
          }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      labels: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode(
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
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#languageIn",
        ),
      },
      maxCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxCount",
        ),
      },
      maxExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxExclusive",
        ),
      },
      maxInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxInclusive",
        ),
      },
      maxLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxLength",
        ),
      },
      minCount: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minCount",
        ),
      },
      minExclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minExclusive",
        ),
      },
      minInclusive: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Literal" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minInclusive",
        ),
      },
      minLength: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({ kind: "Int" as const }),
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minLength",
        ),
      },
      nodeKind: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Maybe" as const,
          item: () => ({
            kind: "NamedNode" as const,
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
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#nodeKind",
        ),
      },
      nodes: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      not: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "Identifier" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
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
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "Shacl" as const,
        type: () => ({
          kind: "Set" as const,
          item: () => ({ kind: "String" as const }),
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
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
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;

  export function $fromRdf(
    resource: Resource,
    options?: $FromRdfOptions,
  ): Either<Error, ShaclCoreShape> {
    return (
      ShaclCoreNodeShape.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, ShaclCoreShape>
    ).altLazy(
      () =>
        ShaclCorePropertyShape.$fromRdf(resource, {
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
    if (ShaclCoreNodeShape.isShaclCoreNodeShape(_shaclCoreShape)) {
      return ShaclCoreNodeShape.$toRdf(_shaclCoreShape, _parameters);
    }
    if (ShaclCorePropertyShape.isShaclCorePropertyShape(_shaclCoreShape)) {
      return ShaclCorePropertyShape.$toRdf(_shaclCoreShape, _parameters);
    }
    throw new Error("unrecognized type");
  }
}
export type $Object =
  | OwlOntology
  | ShaclCoreNodeShape
  | ShaclCorePropertyGroup
  | ShaclCorePropertyShape
  | BaseShaclCoreShape;

export namespace $Object {
  export function $filter(filter: $Object.$Filter, value: $Object): boolean {
    if (
      typeof filter.$identifier !== "undefined" &&
      !$filterIdentifier(filter.$identifier, value.$identifier)
    ) {
      return false;
    }
    if (
      OwlOntology.isOwlOntology(value) &&
      filter.on?.OwlOntology &&
      !OwlOntology.$filter(filter.on.OwlOntology, value as OwlOntology)
    ) {
      return false;
    }
    if (
      ShaclCoreNodeShape.isShaclCoreNodeShape(value) &&
      filter.on?.ShaclCoreNodeShape &&
      !ShaclCoreNodeShape.$filter(
        filter.on.ShaclCoreNodeShape,
        value as ShaclCoreNodeShape,
      )
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
      ShaclCorePropertyShape.isShaclCorePropertyShape(value) &&
      filter.on?.ShaclCorePropertyShape &&
      !ShaclCorePropertyShape.$filter(
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
      readonly OwlOntology?: Omit<OwlOntology.$Filter, "$identifier">;
      readonly ShaclCoreNodeShape?: Omit<
        ShaclCoreNodeShape.$Filter,
        "$identifier"
      >;
      readonly ShaclCorePropertyGroup?: Omit<
        ShaclCorePropertyGroup.$Filter,
        "$identifier"
      >;
      readonly ShaclCorePropertyShape?: Omit<
        ShaclCorePropertyShape.$Filter,
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
        identifier: dataFactory.namedNode(
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
      OwlOntology.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as Either<Error, $Object>
    )
      .altLazy(
        () =>
          ShaclCoreNodeShape.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          ShaclCorePropertyGroup.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as Either<Error, $Object>,
      )
      .altLazy(
        () =>
          ShaclCorePropertyShape.$fromRdf(resource, {
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
    if (OwlOntology.isOwlOntology(_object)) {
      return OwlOntology.$toRdf(_object, _parameters);
    }
    if (ShaclCoreNodeShape.isShaclCoreNodeShape(_object)) {
      return ShaclCoreNodeShape.$toRdf(_object, _parameters);
    }
    if (ShaclCorePropertyGroup.isShaclCorePropertyGroup(_object)) {
      return ShaclCorePropertyGroup.$toRdf(_object, _parameters);
    }
    if (ShaclCorePropertyShape.isShaclCorePropertyShape(_object)) {
      return ShaclCorePropertyShape.$toRdf(_object, _parameters);
    }
    throw new Error("unrecognized type");
  }
}
export interface $ObjectSet {
  owlOntology(
    identifier: OwlOntology.$Identifier,
  ): Promise<Either<Error, OwlOntology>>;

  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
  ): Promise<Either<Error, readonly OwlOntology.$Identifier[]>>;

  owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
  ): Promise<Either<Error, readonly OwlOntology[]>>;

  owlOntologiesCount(
    query?: Pick<
      $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShape.$Identifier,
  ): Promise<Either<Error, ShaclCoreNodeShape>>;

  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShape.$Filter,
      ShaclCoreNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>>;

  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShape.$Filter,
      ShaclCoreNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreNodeShape[]>>;

  shaclCoreNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCoreNodeShape.$Filter,
        ShaclCoreNodeShape.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyGroup>>;

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

  shaclCorePropertyGroupsCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyGroup.$Filter,
        ShaclCorePropertyGroup.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShape.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyShape>>;

  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShape.$Filter,
      ShaclCorePropertyShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyShape.$Identifier[]>>;

  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShape.$Filter,
      ShaclCorePropertyShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyShape[]>>;

  shaclCorePropertyShapesCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyShape.$Filter,
        ShaclCorePropertyShape.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<Either<Error, ShaclCoreShape>>;

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

  shaclCoreShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreShape.$Filter, ShaclCoreShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;

  object(identifier: $Object.$Identifier): Promise<Either<Error, $Object>>;

  objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object.$Identifier[]>>;

  objects(
    query?: $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
  ): Promise<Either<Error, readonly $Object[]>>;

  objectsCount(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;
}

export namespace $ObjectSet {
  export interface Query<
    ObjectFilterT,
    ObjectIdentifierT extends BlankNode | NamedNode,
  > {
    readonly filter?: ObjectFilterT;
    readonly identifiers?: readonly ObjectIdentifierT[];
    readonly limit?: number;
    readonly offset?: number;
  }
}
export class $RdfjsDatasetObjectSet implements $ObjectSet {
  protected readonly resourceSet: ResourceSet;

  constructor(dataset: DatasetCore) {
    this.resourceSet = new ResourceSet(dataset, { dataFactory: dataFactory });
  }

  async owlOntology(
    identifier: OwlOntology.$Identifier,
  ): Promise<Either<Error, OwlOntology>> {
    return this.owlOntologySync(identifier);
  }

  owlOntologySync(
    identifier: OwlOntology.$Identifier,
  ): Either<Error, OwlOntology> {
    return this.owlOntologiesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
  ): Promise<Either<Error, readonly OwlOntology.$Identifier[]>> {
    return this.owlOntologyIdentifiersSync(query);
  }

  owlOntologyIdentifiersSync(
    query?: $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
  ): Either<Error, readonly OwlOntology.$Identifier[]> {
    return this.owlOntologiesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
  ): Promise<Either<Error, readonly OwlOntology[]>> {
    return this.owlOntologiesSync(query);
  }

  async owlOntologiesCount(
    query?: Pick<
      $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.owlOntologiesCountSync(query);
  }

  owlOntologiesCountSync(
    query?: Pick<
      $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.owlOntologiesSync(query).map((objects) => objects.length);
  }

  owlOntologiesSync(
    query?: $ObjectSet.Query<OwlOntology.$Filter, OwlOntology.$Identifier>,
  ): Either<Error, readonly OwlOntology[]> {
    return this.$objectsSync<
      OwlOntology,
      OwlOntology.$Filter,
      OwlOntology.$Identifier
    >(
      {
        $filter: OwlOntology.$filter,
        $fromRdf: OwlOntology.$fromRdf,
        $fromRdfTypes: [OwlOntology.$fromRdfType],
      },
      query,
    );
  }

  async shaclCoreNodeShape(
    identifier: ShaclCoreNodeShape.$Identifier,
  ): Promise<Either<Error, ShaclCoreNodeShape>> {
    return this.shaclCoreNodeShapeSync(identifier);
  }

  shaclCoreNodeShapeSync(
    identifier: ShaclCoreNodeShape.$Identifier,
  ): Either<Error, ShaclCoreNodeShape> {
    return this.shaclCoreNodeShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShape.$Filter,
      ShaclCoreNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>> {
    return this.shaclCoreNodeShapeIdentifiersSync(query);
  }

  shaclCoreNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShape.$Filter,
      ShaclCoreNodeShape.$Identifier
    >,
  ): Either<Error, readonly ShaclCoreNodeShape.$Identifier[]> {
    return this.shaclCoreNodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCoreNodeShapes(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShape.$Filter,
      ShaclCoreNodeShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCoreNodeShape[]>> {
    return this.shaclCoreNodeShapesSync(query);
  }

  async shaclCoreNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCoreNodeShape.$Filter,
        ShaclCoreNodeShape.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCoreNodeShapesCountSync(query);
  }

  shaclCoreNodeShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCoreNodeShape.$Filter,
        ShaclCoreNodeShape.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclCoreNodeShapesSync(query).map((objects) => objects.length);
  }

  shaclCoreNodeShapesSync(
    query?: $ObjectSet.Query<
      ShaclCoreNodeShape.$Filter,
      ShaclCoreNodeShape.$Identifier
    >,
  ): Either<Error, readonly ShaclCoreNodeShape[]> {
    return this.$objectsSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShape.$Filter,
      ShaclCoreNodeShape.$Identifier
    >(
      {
        $filter: ShaclCoreNodeShape.$filter,
        $fromRdf: ShaclCoreNodeShape.$fromRdf,
        $fromRdfTypes: [ShaclCoreNodeShape.$fromRdfType],
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

  async shaclCorePropertyGroupsCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyGroup.$Filter,
        ShaclCorePropertyGroup.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCorePropertyGroupsCountSync(query);
  }

  shaclCorePropertyGroupsCountSync(
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
    identifier: ShaclCorePropertyShape.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyShape>> {
    return this.shaclCorePropertyShapeSync(identifier);
  }

  shaclCorePropertyShapeSync(
    identifier: ShaclCorePropertyShape.$Identifier,
  ): Either<Error, ShaclCorePropertyShape> {
    return this.shaclCorePropertyShapesSync({ identifiers: [identifier] }).map(
      (objects) => objects[0],
    );
  }

  async shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShape.$Filter,
      ShaclCorePropertyShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyShape.$Identifier[]>> {
    return this.shaclCorePropertyShapeIdentifiersSync(query);
  }

  shaclCorePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShape.$Filter,
      ShaclCorePropertyShape.$Identifier
    >,
  ): Either<Error, readonly ShaclCorePropertyShape.$Identifier[]> {
    return this.shaclCorePropertyShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCorePropertyShapes(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShape.$Filter,
      ShaclCorePropertyShape.$Identifier
    >,
  ): Promise<Either<Error, readonly ShaclCorePropertyShape[]>> {
    return this.shaclCorePropertyShapesSync(query);
  }

  async shaclCorePropertyShapesCount(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyShape.$Filter,
        ShaclCorePropertyShape.$Identifier
      >,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCorePropertyShapesCountSync(query);
  }

  shaclCorePropertyShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<
        ShaclCorePropertyShape.$Filter,
        ShaclCorePropertyShape.$Identifier
      >,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclCorePropertyShapesSync(query).map(
      (objects) => objects.length,
    );
  }

  shaclCorePropertyShapesSync(
    query?: $ObjectSet.Query<
      ShaclCorePropertyShape.$Filter,
      ShaclCorePropertyShape.$Identifier
    >,
  ): Either<Error, readonly ShaclCorePropertyShape[]> {
    return this.$objectsSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShape.$Filter,
      ShaclCorePropertyShape.$Identifier
    >(
      {
        $filter: ShaclCorePropertyShape.$filter,
        $fromRdf: ShaclCorePropertyShape.$fromRdf,
        $fromRdfTypes: [ShaclCorePropertyShape.$fromRdfType],
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

  async shaclCoreShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreShape.$Filter, ShaclCoreShape.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCoreShapesCountSync(query);
  }

  shaclCoreShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreShape.$Filter, ShaclCoreShape.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclCoreShapesSync(query).map((objects) => objects.length);
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
          $fromRdf: ShaclCoreNodeShape.$fromRdf,
          $fromRdfTypes: [ShaclCoreNodeShape.$fromRdfType],
        },
        {
          $filter: ShaclCoreShape.$filter,
          $fromRdf: ShaclCorePropertyShape.$fromRdf,
          $fromRdfTypes: [ShaclCorePropertyShape.$fromRdfType],
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

  async objectsCount(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.objectsCountSync(query);
  }

  objectsCountSync(
    query?: Pick<
      $ObjectSet.Query<$Object.$Filter, $Object.$Identifier>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.objectsSync(query).map((objects) => objects.length);
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
          $fromRdf: OwlOntology.$fromRdf,
          $fromRdfTypes: [OwlOntology.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclCoreNodeShape.$fromRdf,
          $fromRdfTypes: [ShaclCoreNodeShape.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclCorePropertyGroup.$fromRdf,
          $fromRdfTypes: [ShaclCorePropertyGroup.$fromRdfType],
        },
        {
          $filter: $Object.$filter,
          $fromRdf: ShaclCorePropertyShape.$fromRdf,
          $fromRdfTypes: [ShaclCorePropertyShape.$fromRdfType],
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
        options: { objectSet: $ObjectSet },
      ) => Either<Error, ObjectT>;
      $fromRdfTypes: readonly NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    let resources: { object?: ObjectT; resource: Resource }[];
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: this.resourceSet.resource(identifier),
      }));
      sortResources = false;
    } else if (objectType.$fromRdfTypes.length > 0) {
      const identifierSet = new $IdentifierSet();
      resources = [];
      sortResources = true;
      for (const fromRdfType of objectType.$fromRdfTypes) {
        for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
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
      for (const quad of this.resourceSet.dataset) {
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
        const resource = this.resourceSet.resource(quad.subject);
        // Eagerly eliminate the majority of resources that won't match the object type
        objectType.$fromRdf(resource, { objectSet: this }).ifRight((object) => {
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
        const objectEither = objectType.$fromRdf(resource, { objectSet: this });
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
          return Either.of(objects);
        }
      }
    }
    return Either.of(objects);
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
        options: { objectSet: $ObjectSet },
      ) => Either<Error, ObjectT>;
      $fromRdfTypes: readonly NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectFilterT, ObjectIdentifierT>,
  ): Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return Either.of([]);
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
          options: { objectSet: $ObjectSet },
        ) => Either<Error, ObjectT>;
        $fromRdfTypes: readonly NamedNode[];
      };
      resource: Resource;
    }[];
    let sortResources: boolean;
    if (query?.identifiers) {
      resources = query.identifiers.map((identifier) => ({
        resource: this.resourceSet.resource(identifier),
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
          for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
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
      for (const quad of this.resourceSet.dataset) {
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
        const resource = this.resourceSet.resource(quad.subject);
        for (const objectType of objectTypes) {
          if (
            objectType
              .$fromRdf(resource, { objectSet: this })
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
          objectEither = objectType.$fromRdf(resource, { objectSet: this });
        } else {
          objectEither = Left(new Error("no object types"));
          for (const tryObjectType of objectTypes) {
            objectEither = tryObjectType.$fromRdf(resource, {
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
          return Either.of(objects);
        }
      }
    }
    return Either.of(objects);
  }
}

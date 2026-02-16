import type { BlankNode, DatasetCore, Literal, NamedNode } from "@rdfjs/types";
import { StoreFactory as DatasetFactory, DataFactory as dataFactory } from "n3";
import { Either, Left, Maybe } from "purify-ts";
import {
  type MutableResource,
  MutableResourceSet,
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

function $filterNumber(filter: $NumberFilter, value: number) {
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

interface $LiteralFilter extends Omit<$TermFilter, "in" | "type"> {
  readonly in?: readonly Literal[];
}

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;

interface $NamedNodeFilter {
  readonly in?: readonly NamedNode[];
}

interface $NumberFilter {
  readonly in?: readonly number[];
  readonly maxExclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly minInclusive?: number;
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
    export const integer = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#integer",
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
      !$filterMaybe<number, $NumberFilter>($filterNumber)(
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
      !$filterMaybe<number, $NumberFilter>($filterNumber)(
        filter.maxLength,
        value.maxLength,
      )
    ) {
      return false;
    }
    if (
      typeof filter.minCount !== "undefined" &&
      !$filterMaybe<number, $NumberFilter>($filterNumber)(
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
      !$filterMaybe<number, $NumberFilter>($filterNumber)(
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
    readonly maxCount?: $MaybeFilter<$NumberFilter>;
    readonly maxExclusive?: $MaybeFilter<$LiteralFilter>;
    readonly maxInclusive?: $MaybeFilter<$LiteralFilter>;
    readonly maxLength?: $MaybeFilter<$NumberFilter>;
    readonly minCount?: $MaybeFilter<$NumberFilter>;
    readonly minExclusive?: $MaybeFilter<$LiteralFilter>;
    readonly minInclusive?: $MaybeFilter<$LiteralFilter>;
    readonly minLength?: $MaybeFilter<$NumberFilter>;
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(
      _baseShaclCoreShape.$identifier,
      { mutateGraph },
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.and.identifier,
      ..._baseShaclCoreShape.and.flatMap((item) => [
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
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    {
                      mutateGraph: mutateGraph,
                    },
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  ...[item],
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph: mutateGraph },
                ),
              } as {
                currentSubListResource: MutableResource | null;
                listResource: MutableResource;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.classes.identifier,
      ..._baseShaclCoreShape.classes.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.comments.identifier,
      ..._baseShaclCoreShape.comments.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.datatype.identifier,
      ..._baseShaclCoreShape.datatype.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.deactivated.identifier,
      ..._baseShaclCoreShape.deactivated
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.flags.identifier,
      ..._baseShaclCoreShape.flags.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.hasValues.identifier,
      ..._baseShaclCoreShape.hasValues.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.in_.identifier,
      ..._baseShaclCoreShape.in_.toList().flatMap((value) => [
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
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    {
                      mutateGraph: mutateGraph,
                    },
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  ...[item],
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph: mutateGraph },
                ),
              } as {
                currentSubListResource: MutableResource | null;
                listResource: MutableResource;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.isDefinedBy.identifier,
      ..._baseShaclCoreShape.isDefinedBy.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.labels.identifier,
      ..._baseShaclCoreShape.labels.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.languageIn.identifier,
      ..._baseShaclCoreShape.languageIn.toList().flatMap((value) => [
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
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    {
                      mutateGraph: mutateGraph,
                    },
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  ...[dataFactory.literal(item)],
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph: mutateGraph },
                ),
              } as {
                currentSubListResource: MutableResource | null;
                listResource: MutableResource;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.maxCount.identifier,
      ..._baseShaclCoreShape.maxCount
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(10), $RdfVocabularies.xsd.integer),
        ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.maxExclusive.identifier,
      ..._baseShaclCoreShape.maxExclusive.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.maxInclusive.identifier,
      ..._baseShaclCoreShape.maxInclusive.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.maxLength.identifier,
      ..._baseShaclCoreShape.maxLength
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(10), $RdfVocabularies.xsd.integer),
        ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.minCount.identifier,
      ..._baseShaclCoreShape.minCount
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(10), $RdfVocabularies.xsd.integer),
        ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.minExclusive.identifier,
      ..._baseShaclCoreShape.minExclusive.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.minInclusive.identifier,
      ..._baseShaclCoreShape.minInclusive.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.minLength.identifier,
      ..._baseShaclCoreShape.minLength
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(10), $RdfVocabularies.xsd.integer),
        ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.nodeKind.identifier,
      ..._baseShaclCoreShape.nodeKind.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.nodes.identifier,
      ..._baseShaclCoreShape.nodes.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.not.identifier,
      ..._baseShaclCoreShape.not.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.or.identifier,
      ..._baseShaclCoreShape.or.flatMap((item) => [
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
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    {
                      mutateGraph: mutateGraph,
                    },
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  ...[item],
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph: mutateGraph },
                ),
              } as {
                currentSubListResource: MutableResource | null;
                listResource: MutableResource;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.patterns.identifier,
      ..._baseShaclCoreShape.patterns.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$schema.properties.xone.identifier,
      ..._baseShaclCoreShape.xone.flatMap((item) => [
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
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    {
                      mutateGraph: mutateGraph,
                    },
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  ...[item],
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph: mutateGraph },
                ),
              } as {
                currentSubListResource: MutableResource | null;
                listResource: MutableResource;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
    );
    return resource;
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "IdentifierProperty" as const,
        name: "$identifier",
        type: () => ({ kind: "IdentifierType" as const }),
        identifierMintingStrategy: "[object Object] as const",
      },
      $type: {
        kind: "TypeDiscriminantProperty" as const,
        name: "$type",
        type: () => ({
          descendantValues: [
            '"ShaclCoreNodeShape"',
            '"ShaclCorePropertyShape"',
            '"ShaclmateNodeShape"',
            '"ShaclmatePropertyShape"',
          ],
          ownValues: undefined,
        }),
      },
      and: {
        kind: "ShaclProperty" as const,
        name: "and",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "ShaclProperty" as const,
        name: "classes",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comments: {
        kind: "ShaclProperty" as const,
        name: "comments",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "ShaclProperty" as const,
        name: "datatype",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#datatype",
        ),
      },
      deactivated: {
        kind: "ShaclProperty" as const,
        name: "deactivated",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#deactivated",
        ),
      },
      flags: {
        kind: "ShaclProperty" as const,
        name: "flags",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "ShaclProperty" as const,
        name: "hasValues",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "TermType" as const,
            in: undefined,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#hasValue",
        ),
      },
      in_: {
        kind: "ShaclProperty" as const,
        name: "in_",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "ListType" as const,
            item: {
              kind: "TermType" as const,
              in: undefined,
              nodeKinds: ["Literal" as const, "NamedNode" as const],
            },
            minCount: 0,
          },
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "ShaclProperty" as const,
        name: "isDefinedBy",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "IdentifierType" as const },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      labels: {
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "ShaclProperty" as const,
        name: "languageIn",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "ListType" as const,
            item: {
              kind: "StringType" as const,
              languageIn: undefined,
              in: undefined,
            },
            minCount: 0,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#languageIn",
        ),
      },
      maxCount: {
        kind: "ShaclProperty" as const,
        name: "maxCount",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxCount",
        ),
      },
      maxExclusive: {
        kind: "ShaclProperty" as const,
        name: "maxExclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxExclusive",
        ),
      },
      maxInclusive: {
        kind: "ShaclProperty" as const,
        name: "maxInclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxInclusive",
        ),
      },
      maxLength: {
        kind: "ShaclProperty" as const,
        name: "maxLength",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxLength",
        ),
      },
      minCount: {
        kind: "ShaclProperty" as const,
        name: "minCount",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minCount",
        ),
      },
      minExclusive: {
        kind: "ShaclProperty" as const,
        name: "minExclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minExclusive",
        ),
      },
      minInclusive: {
        kind: "ShaclProperty" as const,
        name: "minInclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minInclusive",
        ),
      },
      minLength: {
        kind: "ShaclProperty" as const,
        name: "minLength",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minLength",
        ),
      },
      nodeKind: {
        kind: "ShaclProperty" as const,
        name: "nodeKind",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#nodeKind",
        ),
      },
      nodes: {
        kind: "ShaclProperty" as const,
        name: "nodes",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "IdentifierType" as const },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      not: {
        kind: "ShaclProperty" as const,
        name: "not",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "IdentifierType" as const },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "ShaclProperty" as const,
        name: "or",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "ShaclProperty" as const,
        name: "patterns",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      xone: {
        kind: "ShaclProperty" as const,
        name: "xone",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      },
    },
  } as const;
}
export interface ShaclCorePropertyShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCorePropertyShapeStatic.$Identifier;
  readonly $type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
  readonly defaultValue: Maybe<Literal | NamedNode>;
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
      !$filterMaybe<number, $NumberFilter>($filterNumber)(
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
    readonly order?: $MaybeFilter<$NumberFilter>;
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
                  ShaclCorePropertyShapeStatic.$fromRdfType,
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
        Either.of<Error, ShaclCorePropertyShapeStatic.$Identifier>(
          $parameters.resource
            .identifier as ShaclCorePropertyShapeStatic.$Identifier,
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
                              ShaclCorePropertyShapeStatic.$schema.properties
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
                        ShaclCorePropertyShapeStatic.$schema.properties
                          .defaultValue.identifier,
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
                        ShaclCorePropertyShapeStatic.$schema.properties
                          .descriptions.identifier,
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
                        ShaclCorePropertyShapeStatic.$schema.properties
                          .descriptions.identifier,
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
                            ShaclCorePropertyShapeStatic.$schema.properties
                              .groups.identifier,
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
                                ShaclCorePropertyShapeStatic.$schema.properties
                                  .names.identifier,
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
                                ShaclCorePropertyShapeStatic.$schema.properties
                                  .names.identifier,
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
                                        ShaclCorePropertyShapeStatic.$schema
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
                                                ShaclCorePropertyShapeStatic
                                                  .$schema.properties.uniqueLang
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = BaseShaclCoreShapeStatic.$toRdf(_shaclCorePropertyShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyShape"),
      );
    }
    resource.add(
      ShaclCorePropertyShapeStatic.$schema.properties.defaultValue.identifier,
      ..._shaclCorePropertyShape.defaultValue.toList(),
    );
    resource.add(
      ShaclCorePropertyShapeStatic.$schema.properties.descriptions.identifier,
      ..._shaclCorePropertyShape.descriptions.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      ShaclCorePropertyShapeStatic.$schema.properties.groups.identifier,
      ..._shaclCorePropertyShape.groups.flatMap((item) => [item]),
    );
    resource.add(
      ShaclCorePropertyShapeStatic.$schema.properties.names.identifier,
      ..._shaclCorePropertyShape.names.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      ShaclCorePropertyShapeStatic.$schema.properties.order.identifier,
      ..._shaclCorePropertyShape.order
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(10), $RdfVocabularies.xsd.decimal),
        ]),
    );
    resource.add(
      ShaclCorePropertyShapeStatic.$schema.properties.path.identifier,
      ...[
        PropertyPath.$toRdf(_shaclCorePropertyShape.path, {
          mutateGraph: mutateGraph,
          resourceSet: resourceSet,
        }).identifier,
      ],
    );
    resource.add(
      ShaclCorePropertyShapeStatic.$schema.properties.uniqueLang.identifier,
      ..._shaclCorePropertyShape.uniqueLang
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...BaseShaclCoreShapeStatic.$schema.properties,
      defaultValue: {
        kind: "ShaclProperty" as const,
        name: "defaultValue",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "TermType" as const,
            in: undefined,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#defaultValue",
        ),
      },
      descriptions: {
        kind: "ShaclProperty" as const,
        name: "descriptions",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#description",
        ),
      },
      groups: {
        kind: "ShaclProperty" as const,
        name: "groups",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "IdentifierType" as const },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
      },
      names: {
        kind: "ShaclProperty" as const,
        name: "names",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
      },
      order: {
        kind: "ShaclProperty" as const,
        name: "order",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "FloatType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
      },
      path: {
        kind: "ShaclProperty" as const,
        name: "path",
        type: () => PropertyPath.$schema,
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      },
      uniqueLang: {
        kind: "ShaclProperty" as const,
        name: "uniqueLang",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#uniqueLang",
        ),
      },
    },
  } as const;
}
export interface ShaclmatePropertyShape extends ShaclCorePropertyShape {
  readonly $identifier: ShaclmatePropertyShape.$Identifier;
  readonly $type: "ShaclmatePropertyShape";
  readonly lazy: Maybe<boolean>;
  readonly mutable: Maybe<boolean>;
  readonly name: Maybe<string>;
  readonly partial: Maybe<BlankNode | NamedNode>;
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
      typeof filter.lazy !== "undefined" &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.lazy,
        value.lazy,
      )
    ) {
      return false;
    }
    if (
      typeof filter.mutable !== "undefined" &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.mutable,
        value.mutable,
      )
    ) {
      return false;
    }
    if (
      typeof filter.name !== "undefined" &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.name,
        value.name,
      )
    ) {
      return false;
    }
    if (
      typeof filter.partial !== "undefined" &&
      !$filterMaybe<BlankNode | NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.partial, value.partial)
    ) {
      return false;
    }
    if (
      typeof filter.visibility !== "undefined" &&
      !$filterMaybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_Visibility_Private"
          | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
          | "http://purl.org/shaclmate/ontology#_Visibility_Public"
        >,
        $NamedNodeFilter
      >($filterNamedNode)(filter.visibility, value.visibility)
    ) {
      return false;
    }
    return true;
  }

  export type $Filter = {
    readonly $identifier?: $IdentifierFilter;
    readonly lazy?: $MaybeFilter<$BooleanFilter>;
    readonly mutable?: $MaybeFilter<$BooleanFilter>;
    readonly name?: $MaybeFilter<$StringFilter>;
    readonly partial?: $MaybeFilter<$IdentifierFilter>;
    readonly visibility?: $MaybeFilter<$NamedNodeFilter>;
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
      lazy: Maybe<boolean>;
      mutable: Maybe<boolean>;
      name: Maybe<string>;
      partial: Maybe<BlankNode | NamedNode>;
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
                  ShaclmatePropertyShape.$fromRdfType,
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
        Either.of<Error, ShaclmatePropertyShape.$Identifier>(
          $parameters.resource.identifier as ShaclmatePropertyShape.$Identifier,
        ).chain(($identifier) =>
          Either.of<Error, "ShaclmatePropertyShape">(
            "ShaclmatePropertyShape" as const,
          ).chain(($type) =>
            Either.of<Error, Resource.Values<Resource.TermValue>>(
              $parameters.resource.values($schema.properties.lazy.identifier, {
                unique: true,
              }),
            )
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => Maybe.of(value))
                  : Resource.Values.fromValue<Maybe<boolean>>({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclmatePropertyShape.$schema.properties.lazy
                          .identifier,
                      value: Maybe.empty(),
                    }),
              )
              .chain((values) => values.head())
              .chain((lazy) =>
                Either.of<Error, Resource.Values<Resource.TermValue>>(
                  $parameters.resource.values(
                    $schema.properties.mutable.identifier,
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
                            ShaclmatePropertyShape.$schema.properties.mutable
                              .identifier,
                          value: Maybe.empty(),
                        }),
                  )
                  .chain((values) => values.head())
                  .chain((mutable) =>
                    Either.of<Error, Resource.Values<Resource.TermValue>>(
                      $parameters.resource.values(
                        $schema.properties.name.identifier,
                        { unique: true },
                      ),
                    )
                      .chain((values) =>
                        $fromRdfPreferredLanguages({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclmatePropertyShape.$schema.properties.name
                              .identifier,
                          preferredLanguages: $parameters.preferredLanguages,
                          values,
                        }),
                      )
                      .chain((values) =>
                        values.chainMap((value) => value.toString()),
                      )
                      .map((values) =>
                        values.length > 0
                          ? values.map((value) => Maybe.of(value))
                          : Resource.Values.fromValue<Maybe<string>>({
                              focusResource: $parameters.resource,
                              predicate:
                                ShaclmatePropertyShape.$schema.properties.name
                                  .identifier,
                              value: Maybe.empty(),
                            }),
                      )
                      .chain((values) => values.head())
                      .chain((name) =>
                        Either.of<Error, Resource.Values<Resource.TermValue>>(
                          $parameters.resource.values(
                            $schema.properties.partial.identifier,
                            { unique: true },
                          ),
                        )
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
                                  predicate:
                                    ShaclmatePropertyShape.$schema.properties
                                      .partial.identifier,
                                  value: Maybe.empty(),
                                }),
                          )
                          .chain((values) => values.head())
                          .chain((partial) =>
                            Either.of<
                              Error,
                              Resource.Values<Resource.TermValue>
                            >(
                              $parameters.resource.values(
                                $schema.properties.visibility.identifier,
                                { unique: true },
                              ),
                            )
                              .chain((values) =>
                                values.chainMap((value) =>
                                  value.toIri().chain((iri) => {
                                    switch (iri.value) {
                                      case "http://purl.org/shaclmate/ontology#_Visibility_Private":
                                        return Either.of<
                                          Error,
                                          NamedNode<
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                                          >
                                        >(
                                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Private">,
                                        );
                                      case "http://purl.org/shaclmate/ontology#_Visibility_Protected":
                                        return Either.of<
                                          Error,
                                          NamedNode<
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                                          >
                                        >(
                                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Protected">,
                                        );
                                      case "http://purl.org/shaclmate/ontology#_Visibility_Public":
                                        return Either.of<
                                          Error,
                                          NamedNode<
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                                          >
                                        >(
                                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Public">,
                                        );
                                      default:
                                        return Left<
                                          Error,
                                          NamedNode<
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                                            | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                                          >
                                        >(
                                          new Resource.MistypedTermValueError({
                                            actualValue: iri,
                                            expectedValueType:
                                              'NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Private" | "http://purl.org/shaclmate/ontology#_Visibility_Protected" | "http://purl.org/shaclmate/ontology#_Visibility_Public">',
                                            focusResource: $parameters.resource,
                                            predicate:
                                              ShaclmatePropertyShape.$schema
                                                .properties.visibility
                                                .identifier,
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
                                      Maybe<
                                        NamedNode<
                                          | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                                          | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                                          | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                                        >
                                      >
                                    >({
                                      focusResource: $parameters.resource,
                                      predicate:
                                        ShaclmatePropertyShape.$schema
                                          .properties.visibility.identifier,
                                      value: Maybe.empty(),
                                    }),
                              )
                              .chain((values) => values.head())
                              .map((visibility) => ({
                                ...$super0,
                                $identifier,
                                $type,
                                lazy,
                                mutable,
                                name,
                                partial,
                                visibility,
                              })),
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
    _shaclmatePropertyShape: ShaclmatePropertyShape,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = ShaclCorePropertyShapeStatic.$toRdf(
      _shaclmatePropertyShape,
      {
        ignoreRdfType: true,
        mutateGraph,
        resourceSet,
      },
    );
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyShape"),
      );
    }
    resource.add(
      ShaclmatePropertyShape.$schema.properties.lazy.identifier,
      ..._shaclmatePropertyShape.lazy
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      ShaclmatePropertyShape.$schema.properties.mutable.identifier,
      ..._shaclmatePropertyShape.mutable
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      ShaclmatePropertyShape.$schema.properties.name.identifier,
      ..._shaclmatePropertyShape.name
        .toList()
        .flatMap((value) => [dataFactory.literal(value)]),
    );
    resource.add(
      ShaclmatePropertyShape.$schema.properties.partial.identifier,
      ..._shaclmatePropertyShape.partial.toList(),
    );
    resource.add(
      ShaclmatePropertyShape.$schema.properties.visibility.identifier,
      ..._shaclmatePropertyShape.visibility.toList(),
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...ShaclCorePropertyShapeStatic.$schema.properties,
      lazy: {
        kind: "ShaclProperty" as const,
        name: "lazy",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#lazy",
        ),
      },
      mutable: {
        kind: "ShaclProperty" as const,
        name: "mutable",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#mutable",
        ),
      },
      name: {
        kind: "ShaclProperty" as const,
        name: "name",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#name",
        ),
      },
      partial: {
        kind: "ShaclProperty" as const,
        name: "partial",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "IdentifierType" as const },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#partial",
        ),
      },
      visibility: {
        kind: "ShaclProperty" as const,
        name: "visibility",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
        }),
        identifier: dataFactory.namedNode(
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
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/2002/07/owl#Ontology":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  OwlOntologyStatic.$fromRdfType,
                )
              ) {
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
      Either.of<Error, OwlOntologyStatic.$Identifier>(
        $parameters.resource.identifier as OwlOntologyStatic.$Identifier,
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
                predicate:
                  OwlOntologyStatic.$schema.properties.labels.identifier,
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
                  OwlOntologyStatic.$schema.properties.labels.identifier,
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(_owlOntology.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
      );
    }
    resource.add(
      OwlOntologyStatic.$schema.properties.labels.identifier,
      ..._owlOntology.labels.flatMap((item) => [dataFactory.literal(item)]),
    );
    return resource;
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "IdentifierProperty" as const,
        name: "$identifier",
        type: () => ({ kind: "IdentifierType" as const }),
        identifierMintingStrategy: "[object Object] as const",
      },
      $type: {
        kind: "TypeDiscriminantProperty" as const,
        name: "$type",
        type: () => ({
          descendantValues: ['"ShaclmateOntology"'],
          ownValues: ['"OwlOntology"'],
        }),
      },
      labels: {
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
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
      typeof filter.tsFeatureExcludes !== "undefined" &&
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
        $NamedNodeFilter
      >($filterNamedNode)(filter.tsFeatureExcludes, value.tsFeatureExcludes)
    ) {
      return false;
    }
    if (
      typeof filter.tsFeatureIncludes !== "undefined" &&
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
        $NamedNodeFilter
      >($filterNamedNode)(filter.tsFeatureIncludes, value.tsFeatureIncludes)
    ) {
      return false;
    }
    if (
      typeof filter.tsImports !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.tsImports,
        value.tsImports,
      )
    ) {
      return false;
    }
    if (
      typeof filter.tsObjectDeclarationType !== "undefined" &&
      !$filterMaybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >,
        $NamedNodeFilter
      >($filterNamedNode)(
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
    readonly tsFeatureExcludes?: $CollectionFilter<$NamedNodeFilter>;
    readonly tsFeatureIncludes?: $CollectionFilter<$NamedNodeFilter>;
    readonly tsImports?: $CollectionFilter<$StringFilter>;
    readonly tsObjectDeclarationType?: $MaybeFilter<$NamedNodeFilter>;
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
            .value($RdfVocabularies.rdf.type)
            .chain((actualRdfType) => actualRdfType.toIri())
            .chain((actualRdfType) => {
              // Check the expected type and its known subtypes
              switch (actualRdfType.value) {
                case "http://www.w3.org/2002/07/owl#Ontology":
                  return Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclmateOntology.$fromRdfType,
                )
              ) {
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
        Either.of<Error, ShaclmateOntology.$Identifier>(
          $parameters.resource.identifier as ShaclmateOntology.$Identifier,
        ).chain(($identifier) =>
          Either.of<Error, "ShaclmateOntology">(
            "ShaclmateOntology" as const,
          ).chain(($type) =>
            Either.of<Error, Resource.Values<Resource.TermValue>>(
              $parameters.resource.values(
                $schema.properties.tsFeatureExcludes.identifier,
                { unique: true },
              ),
            )
              .chain((values) =>
                values.chainMap((value) =>
                  value.toIri().chain((iri) => {
                    switch (iri.value) {
                      case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_Default">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Graphql">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Hash">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_None">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Rdf">,
                        );
                      case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
                        return Either.of<
                          Error,
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
                          >
                        >(
                          iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Sparql">,
                        );
                      default:
                        return Left<
                          Error,
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
                          >
                        >(
                          new Resource.MistypedTermValueError({
                            actualValue: iri,
                            expectedValueType:
                              'NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                            focusResource: $parameters.resource,
                            predicate:
                              ShaclmateOntology.$schema.properties
                                .tsFeatureExcludes.identifier,
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
                  predicate:
                    ShaclmateOntology.$schema.properties.tsFeatureExcludes
                      .identifier,
                  value: valuesArray,
                }),
              )
              .chain((values) => values.head())
              .chain((tsFeatureExcludes) =>
                Either.of<Error, Resource.Values<Resource.TermValue>>(
                  $parameters.resource.values(
                    $schema.properties.tsFeatureIncludes.identifier,
                    { unique: true },
                  ),
                )
                  .chain((values) =>
                    values.chainMap((value) =>
                      value.toIri().chain((iri) => {
                        switch (iri.value) {
                          case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_Default">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Graphql">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Hash">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_None">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Rdf">,
                            );
                          case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
                            return Either.of<
                              Error,
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
                              >
                            >(
                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Sparql">,
                            );
                          default:
                            return Left<
                              Error,
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
                              >
                            >(
                              new Resource.MistypedTermValueError({
                                actualValue: iri,
                                expectedValueType:
                                  'NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                                focusResource: $parameters.resource,
                                predicate:
                                  ShaclmateOntology.$schema.properties
                                    .tsFeatureIncludes.identifier,
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
                      predicate:
                        ShaclmateOntology.$schema.properties.tsFeatureIncludes
                          .identifier,
                      value: valuesArray,
                    }),
                  )
                  .chain((values) => values.head())
                  .chain((tsFeatureIncludes) =>
                    Either.of<Error, Resource.Values<Resource.TermValue>>(
                      $parameters.resource.values(
                        $schema.properties.tsImports.identifier,
                        { unique: true },
                      ),
                    )
                      .chain((values) =>
                        $fromRdfPreferredLanguages({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclmateOntology.$schema.properties.tsImports
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
                            ShaclmateOntology.$schema.properties.tsImports
                              .identifier,
                          value: valuesArray,
                        }),
                      )
                      .chain((values) => values.head())
                      .chain((tsImports) =>
                        Either.of<Error, Resource.Values<Resource.TermValue>>(
                          $parameters.resource.values(
                            $schema.properties.tsObjectDeclarationType
                              .identifier,
                            {
                              unique: true,
                            },
                          ),
                        )
                          .chain((values) =>
                            values.chainMap((value) =>
                              value.toIri().chain((iri) => {
                                switch (iri.value) {
                                  case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
                                    return Either.of<
                                      Error,
                                      NamedNode<
                                        | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                        | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                      >
                                    >(
                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class">,
                                    );
                                  case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
                                    return Either.of<
                                      Error,
                                      NamedNode<
                                        | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                        | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                      >
                                    >(
                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">,
                                    );
                                  default:
                                    return Left<
                                      Error,
                                      NamedNode<
                                        | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                        | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                      >
                                    >(
                                      new Resource.MistypedTermValueError({
                                        actualValue: iri,
                                        expectedValueType:
                                          'NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class" | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">',
                                        focusResource: $parameters.resource,
                                        predicate:
                                          ShaclmateOntology.$schema.properties
                                            .tsObjectDeclarationType.identifier,
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
                                  Maybe<
                                    NamedNode<
                                      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                    >
                                  >
                                >({
                                  focusResource: $parameters.resource,
                                  predicate:
                                    ShaclmateOntology.$schema.properties
                                      .tsObjectDeclarationType.identifier,
                                  value: Maybe.empty(),
                                }),
                          )
                          .chain((values) => values.head())
                          .map((tsObjectDeclarationType) => ({
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = OwlOntologyStatic.$toRdf(_shaclmateOntology, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
      );
    }
    resource.add(
      ShaclmateOntology.$schema.properties.tsFeatureExcludes.identifier,
      ..._shaclmateOntology.tsFeatureExcludes.flatMap((item) => [item]),
    );
    resource.add(
      ShaclmateOntology.$schema.properties.tsFeatureIncludes.identifier,
      ..._shaclmateOntology.tsFeatureIncludes.flatMap((item) => [item]),
    );
    resource.add(
      ShaclmateOntology.$schema.properties.tsImports.identifier,
      ..._shaclmateOntology.tsImports.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      ShaclmateOntology.$schema.properties.tsObjectDeclarationType.identifier,
      ..._shaclmateOntology.tsObjectDeclarationType.toList(),
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...OwlOntologyStatic.$schema.properties,
      tsFeatureExcludes: {
        kind: "ShaclProperty" as const,
        name: "tsFeatureExcludes",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsFeatureExclude",
        ),
      },
      tsFeatureIncludes: {
        kind: "ShaclProperty" as const,
        name: "tsFeatureIncludes",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsFeatureInclude",
        ),
      },
      tsImports: {
        kind: "ShaclProperty" as const,
        name: "tsImports",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsImport",
        ),
      },
      tsObjectDeclarationType: {
        kind: "ShaclProperty" as const,
        name: "tsObjectDeclarationType",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "NamedNodeType" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface",
              ),
            ],
          },
        }),
        identifier: dataFactory.namedNode(
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
                  ShaclCoreNodeShapeStatic.$fromRdfType,
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
        Either.of<Error, ShaclCoreNodeShapeStatic.$Identifier>(
          $parameters.resource
            .identifier as ShaclCoreNodeShapeStatic.$Identifier,
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
                        ShaclCoreNodeShapeStatic.$schema.properties.closed
                          .identifier,
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
                            ShaclCoreNodeShapeStatic.$schema.properties
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
                            ShaclCoreNodeShapeStatic.$schema.properties
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
                            ShaclCoreNodeShapeStatic.$schema.properties
                              .properties.identifier,
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = BaseShaclCoreShapeStatic.$toRdf(_shaclCoreNodeShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      );
    }
    resource.add(
      ShaclCoreNodeShapeStatic.$schema.properties.closed.identifier,
      ..._shaclCoreNodeShape.closed
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      ShaclCoreNodeShapeStatic.$schema.properties.ignoredProperties.identifier,
      ..._shaclCoreNodeShape.ignoredProperties.toList().flatMap((value) => [
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
                  const newSubListResource = resourceSet.mutableResource(
                    dataFactory.blankNode(),
                    {
                      mutateGraph: mutateGraph,
                    },
                  );
                  currentSubListResource!.add(
                    $RdfVocabularies.rdf.rest,
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  $RdfVocabularies.rdf.first,
                  ...[item],
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    $RdfVocabularies.rdf.rest,
                    $RdfVocabularies.rdf.nil,
                  );
                }

                return { currentSubListResource, listResource };
              },
              {
                currentSubListResource: null,
                listResource: resourceSet.mutableResource(
                  dataFactory.blankNode(),
                  { mutateGraph: mutateGraph },
                ),
              } as {
                currentSubListResource: MutableResource | null;
                listResource: MutableResource;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
    );
    resource.add(
      ShaclCoreNodeShapeStatic.$schema.properties.properties.identifier,
      ..._shaclCoreNodeShape.properties.flatMap((item) => [item]),
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...BaseShaclCoreShapeStatic.$schema.properties,
      closed: {
        kind: "ShaclProperty" as const,
        name: "closed",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
      },
      ignoredProperties: {
        kind: "ShaclProperty" as const,
        name: "ignoredProperties",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "NamedNodeType" as const, in: undefined },
            minCount: 0,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ignoredProperties",
        ),
      },
      properties: {
        kind: "ShaclProperty" as const,
        name: "properties",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "IdentifierType" as const },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#property",
        ),
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
      typeof filter.abstract !== "undefined" &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.abstract,
        value.abstract,
      )
    ) {
      return false;
    }
    if (
      typeof filter.discriminantValue !== "undefined" &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.discriminantValue,
        value.discriminantValue,
      )
    ) {
      return false;
    }
    if (
      typeof filter.export_ !== "undefined" &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.export_,
        value.export_,
      )
    ) {
      return false;
    }
    if (
      typeof filter.extern !== "undefined" &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.extern,
        value.extern,
      )
    ) {
      return false;
    }
    if (
      typeof filter.fromRdfType !== "undefined" &&
      !$filterMaybe<NamedNode, $NamedNodeFilter>($filterNamedNode)(
        filter.fromRdfType,
        value.fromRdfType,
      )
    ) {
      return false;
    }
    if (
      typeof filter.identifierMintingStrategy !== "undefined" &&
      !$filterMaybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
        >,
        $NamedNodeFilter
      >($filterNamedNode)(
        filter.identifierMintingStrategy,
        value.identifierMintingStrategy,
      )
    ) {
      return false;
    }
    if (
      typeof filter.mutable !== "undefined" &&
      !$filterMaybe<boolean, $BooleanFilter>($filterBoolean)(
        filter.mutable,
        value.mutable,
      )
    ) {
      return false;
    }
    if (
      typeof filter.name !== "undefined" &&
      !$filterMaybe<string, $StringFilter>($filterString)(
        filter.name,
        value.name,
      )
    ) {
      return false;
    }
    if (
      typeof filter.rdfType !== "undefined" &&
      !$filterMaybe<NamedNode, $NamedNodeFilter>($filterNamedNode)(
        filter.rdfType,
        value.rdfType,
      )
    ) {
      return false;
    }
    if (
      typeof filter.toRdfTypes !== "undefined" &&
      !$filterArray<NamedNode, $NamedNodeFilter>($filterNamedNode)(
        filter.toRdfTypes,
        value.toRdfTypes,
      )
    ) {
      return false;
    }
    if (
      typeof filter.tsFeatureExcludes !== "undefined" &&
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
        $NamedNodeFilter
      >($filterNamedNode)(filter.tsFeatureExcludes, value.tsFeatureExcludes)
    ) {
      return false;
    }
    if (
      typeof filter.tsFeatureIncludes !== "undefined" &&
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
        $NamedNodeFilter
      >($filterNamedNode)(filter.tsFeatureIncludes, value.tsFeatureIncludes)
    ) {
      return false;
    }
    if (
      typeof filter.tsImports !== "undefined" &&
      !$filterArray<string, $StringFilter>($filterString)(
        filter.tsImports,
        value.tsImports,
      )
    ) {
      return false;
    }
    if (
      typeof filter.tsObjectDeclarationType !== "undefined" &&
      !$filterMaybe<
        NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >,
        $NamedNodeFilter
      >($filterNamedNode)(
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
    readonly fromRdfType?: $MaybeFilter<$NamedNodeFilter>;
    readonly identifierMintingStrategy?: $MaybeFilter<$NamedNodeFilter>;
    readonly mutable?: $MaybeFilter<$BooleanFilter>;
    readonly name?: $MaybeFilter<$StringFilter>;
    readonly rdfType?: $MaybeFilter<$NamedNodeFilter>;
    readonly toRdfTypes?: $CollectionFilter<$NamedNodeFilter>;
    readonly tsFeatureExcludes?: $CollectionFilter<$NamedNodeFilter>;
    readonly tsFeatureIncludes?: $CollectionFilter<$NamedNodeFilter>;
    readonly tsImports?: $CollectionFilter<$StringFilter>;
    readonly tsObjectDeclarationType?: $MaybeFilter<$NamedNodeFilter>;
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
                  ShaclmateNodeShape.$fromRdfType,
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
        Either.of<Error, ShaclmateNodeShape.$Identifier>(
          $parameters.resource.identifier as ShaclmateNodeShape.$Identifier,
        ).chain(($identifier) =>
          Either.of<Error, "ShaclmateNodeShape">(
            "ShaclmateNodeShape" as const,
          ).chain(($type) =>
            Either.of<Error, Resource.Values<Resource.TermValue>>(
              $parameters.resource.values(
                $schema.properties.abstract.identifier,
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
                        ShaclmateNodeShape.$schema.properties.abstract
                          .identifier,
                      value: Maybe.empty(),
                    }),
              )
              .chain((values) => values.head())
              .chain((abstract) =>
                Either.of<Error, Resource.Values<Resource.TermValue>>(
                  $parameters.resource.values(
                    $schema.properties.discriminantValue.identifier,
                    { unique: true },
                  ),
                )
                  .chain((values) =>
                    $fromRdfPreferredLanguages({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclmateNodeShape.$schema.properties.discriminantValue
                          .identifier,
                      preferredLanguages: $parameters.preferredLanguages,
                      values,
                    }),
                  )
                  .chain((values) =>
                    values.chainMap((value) => value.toString()),
                  )
                  .map((values) =>
                    values.length > 0
                      ? values.map((value) => Maybe.of(value))
                      : Resource.Values.fromValue<Maybe<string>>({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclmateNodeShape.$schema.properties
                              .discriminantValue.identifier,
                          value: Maybe.empty(),
                        }),
                  )
                  .chain((values) => values.head())
                  .chain((discriminantValue) =>
                    Either.of<Error, Resource.Values<Resource.TermValue>>(
                      $parameters.resource.values(
                        $schema.properties.export_.identifier,
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
                                ShaclmateNodeShape.$schema.properties.export_
                                  .identifier,
                              value: Maybe.empty(),
                            }),
                      )
                      .chain((values) => values.head())
                      .chain((export_) =>
                        Either.of<Error, Resource.Values<Resource.TermValue>>(
                          $parameters.resource.values(
                            $schema.properties.extern.identifier,
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
                                    ShaclmateNodeShape.$schema.properties.extern
                                      .identifier,
                                  value: Maybe.empty(),
                                }),
                          )
                          .chain((values) => values.head())
                          .chain((extern) =>
                            Either.of<
                              Error,
                              Resource.Values<Resource.TermValue>
                            >(
                              $parameters.resource.values(
                                $schema.properties.fromRdfType.identifier,
                                { unique: true },
                              ),
                            )
                              .chain((values) =>
                                values.chainMap((value) => value.toIri()),
                              )
                              .map((values) =>
                                values.length > 0
                                  ? values.map((value) => Maybe.of(value))
                                  : Resource.Values.fromValue<Maybe<NamedNode>>(
                                      {
                                        focusResource: $parameters.resource,
                                        predicate:
                                          ShaclmateNodeShape.$schema.properties
                                            .fromRdfType.identifier,
                                        value: Maybe.empty(),
                                      },
                                    ),
                              )
                              .chain((values) => values.head())
                              .chain((fromRdfType) =>
                                Either.of<
                                  Error,
                                  Resource.Values<Resource.TermValue>
                                >(
                                  $parameters.resource.values(
                                    $schema.properties.identifierMintingStrategy
                                      .identifier,
                                    {
                                      unique: true,
                                    },
                                  ),
                                )
                                  .chain((values) =>
                                    values.chainMap((value) =>
                                      value.toIri().chain((iri) => {
                                        switch (iri.value) {
                                          case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode":
                                            return Either.of<
                                              Error,
                                              NamedNode<
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                                              >
                                            >(
                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode">,
                                            );
                                          case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256":
                                            return Either.of<
                                              Error,
                                              NamedNode<
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                                              >
                                            >(
                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256">,
                                            );
                                          case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4":
                                            return Either.of<
                                              Error,
                                              NamedNode<
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                                              >
                                            >(
                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4">,
                                            );
                                          default:
                                            return Left<
                                              Error,
                                              NamedNode<
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                                                | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                                              >
                                            >(
                                              new Resource.MistypedTermValueError(
                                                {
                                                  actualValue: iri,
                                                  expectedValueType:
                                                    'NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode" | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256" | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4">',
                                                  focusResource:
                                                    $parameters.resource,
                                                  predicate:
                                                    ShaclmateNodeShape.$schema
                                                      .properties
                                                      .identifierMintingStrategy
                                                      .identifier,
                                                },
                                              ),
                                            );
                                        }
                                      }),
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
                                          predicate:
                                            ShaclmateNodeShape.$schema
                                              .properties
                                              .identifierMintingStrategy
                                              .identifier,
                                          value: Maybe.empty(),
                                        }),
                                  )
                                  .chain((values) => values.head())
                                  .chain((identifierMintingStrategy) =>
                                    Either.of<
                                      Error,
                                      Resource.Values<Resource.TermValue>
                                    >(
                                      $parameters.resource.values(
                                        $schema.properties.mutable.identifier,
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
                                                ShaclmatePropertyShape.$schema
                                                  .properties.mutable
                                                  .identifier,
                                              value: Maybe.empty(),
                                            }),
                                      )
                                      .chain((values) => values.head())
                                      .chain((mutable) =>
                                        Either.of<
                                          Error,
                                          Resource.Values<Resource.TermValue>
                                        >(
                                          $parameters.resource.values(
                                            $schema.properties.name.identifier,
                                            { unique: true },
                                          ),
                                        )
                                          .chain((values) =>
                                            $fromRdfPreferredLanguages({
                                              focusResource:
                                                $parameters.resource,
                                              predicate:
                                                ShaclmatePropertyShape.$schema
                                                  .properties.name.identifier,
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
                                          .map((values) =>
                                            values.length > 0
                                              ? values.map((value) =>
                                                  Maybe.of(value),
                                                )
                                              : Resource.Values.fromValue<
                                                  Maybe<string>
                                                >({
                                                  focusResource:
                                                    $parameters.resource,
                                                  predicate:
                                                    ShaclmatePropertyShape
                                                      .$schema.properties.name
                                                      .identifier,
                                                  value: Maybe.empty(),
                                                }),
                                          )
                                          .chain((values) => values.head())
                                          .chain((name) =>
                                            Either.of<
                                              Error,
                                              Resource.Values<Resource.TermValue>
                                            >(
                                              $parameters.resource.values(
                                                $schema.properties.rdfType
                                                  .identifier,
                                                { unique: true },
                                              ),
                                            )
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
                                                      predicate:
                                                        ShaclmateNodeShape
                                                          .$schema.properties
                                                          .rdfType.identifier,
                                                      value: Maybe.empty(),
                                                    }),
                                              )
                                              .chain((values) => values.head())
                                              .chain((rdfType) =>
                                                Either.of<
                                                  Error,
                                                  Resource.Values<Resource.TermValue>
                                                >(
                                                  $parameters.resource.values(
                                                    $schema.properties
                                                      .toRdfTypes.identifier,
                                                    {
                                                      unique: true,
                                                    },
                                                  ),
                                                )
                                                  .chain((values) =>
                                                    values.chainMap((value) =>
                                                      value.toIri(),
                                                    ),
                                                  )
                                                  .map((values) =>
                                                    values.toArray(),
                                                  )
                                                  .map((valuesArray) =>
                                                    Resource.Values.fromValue({
                                                      focusResource:
                                                        $parameters.resource,
                                                      predicate:
                                                        ShaclmateNodeShape
                                                          .$schema.properties
                                                          .toRdfTypes
                                                          .identifier,
                                                      value: valuesArray,
                                                    }),
                                                  )
                                                  .chain((values) =>
                                                    values.head(),
                                                  )
                                                  .chain((toRdfTypes) =>
                                                    Either.of<
                                                      Error,
                                                      Resource.Values<Resource.TermValue>
                                                    >(
                                                      $parameters.resource.values(
                                                        $schema.properties
                                                          .tsFeatureExcludes
                                                          .identifier,
                                                        {
                                                          unique: true,
                                                        },
                                                      ),
                                                    )
                                                      .chain((values) =>
                                                        values.chainMap(
                                                          (value) =>
                                                            value
                                                              .toIri()
                                                              .chain((iri) => {
                                                                switch (
                                                                  iri.value
                                                                ) {
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_Default">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Graphql">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Hash">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_None">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Rdf">,
                                                                    );
                                                                  case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
                                                                    return Either.of<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Sparql">,
                                                                    );
                                                                  default:
                                                                    return Left<
                                                                      Error,
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
                                                                      >
                                                                    >(
                                                                      new Resource.MistypedTermValueError(
                                                                        {
                                                                          actualValue:
                                                                            iri,
                                                                          expectedValueType:
                                                                            'NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                                                                          focusResource:
                                                                            $parameters.resource,
                                                                          predicate:
                                                                            ShaclmateOntology
                                                                              .$schema
                                                                              .properties
                                                                              .tsFeatureExcludes
                                                                              .identifier,
                                                                        },
                                                                      ),
                                                                    );
                                                                }
                                                              }),
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
                                                            predicate:
                                                              ShaclmateOntology
                                                                .$schema
                                                                .properties
                                                                .tsFeatureExcludes
                                                                .identifier,
                                                            value: valuesArray,
                                                          },
                                                        ),
                                                      )
                                                      .chain((values) =>
                                                        values.head(),
                                                      )
                                                      .chain(
                                                        (tsFeatureExcludes) =>
                                                          Either.of<
                                                            Error,
                                                            Resource.Values<Resource.TermValue>
                                                          >(
                                                            $parameters.resource.values(
                                                              $schema.properties
                                                                .tsFeatureIncludes
                                                                .identifier,
                                                              {
                                                                unique: true,
                                                              },
                                                            ),
                                                          )
                                                            .chain((values) =>
                                                              values.chainMap(
                                                                (value) =>
                                                                  value
                                                                    .toIri()
                                                                    .chain(
                                                                      (iri) => {
                                                                        switch (
                                                                          iri.value
                                                                        ) {
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_Default">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Graphql">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Hash">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_None">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Rdf">,
                                                                            );
                                                                          case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
                                                                            return Either.of<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Sparql">,
                                                                            );
                                                                          default:
                                                                            return Left<
                                                                              Error,
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
                                                                              >
                                                                            >(
                                                                              new Resource.MistypedTermValueError(
                                                                                {
                                                                                  actualValue:
                                                                                    iri,
                                                                                  expectedValueType:
                                                                                    'NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                                                                                  focusResource:
                                                                                    $parameters.resource,
                                                                                  predicate:
                                                                                    ShaclmateOntology
                                                                                      .$schema
                                                                                      .properties
                                                                                      .tsFeatureIncludes
                                                                                      .identifier,
                                                                                },
                                                                              ),
                                                                            );
                                                                        }
                                                                      },
                                                                    ),
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
                                                                    predicate:
                                                                      ShaclmateOntology
                                                                        .$schema
                                                                        .properties
                                                                        .tsFeatureIncludes
                                                                        .identifier,
                                                                    value:
                                                                      valuesArray,
                                                                  },
                                                                ),
                                                            )
                                                            .chain((values) =>
                                                              values.head(),
                                                            )
                                                            .chain(
                                                              (
                                                                tsFeatureIncludes,
                                                              ) =>
                                                                Either.of<
                                                                  Error,
                                                                  Resource.Values<Resource.TermValue>
                                                                >(
                                                                  $parameters.resource.values(
                                                                    $schema
                                                                      .properties
                                                                      .tsImports
                                                                      .identifier,
                                                                    {
                                                                      unique: true,
                                                                    },
                                                                  ),
                                                                )
                                                                  .chain(
                                                                    (values) =>
                                                                      $fromRdfPreferredLanguages(
                                                                        {
                                                                          focusResource:
                                                                            $parameters.resource,
                                                                          predicate:
                                                                            ShaclmateOntology
                                                                              .$schema
                                                                              .properties
                                                                              .tsImports
                                                                              .identifier,
                                                                          preferredLanguages:
                                                                            $parameters.preferredLanguages,
                                                                          values,
                                                                        },
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
                                                                            ShaclmateOntology
                                                                              .$schema
                                                                              .properties
                                                                              .tsImports
                                                                              .identifier,
                                                                          value:
                                                                            valuesArray,
                                                                        },
                                                                      ),
                                                                  )
                                                                  .chain(
                                                                    (values) =>
                                                                      values.head(),
                                                                  )
                                                                  .chain(
                                                                    (
                                                                      tsImports,
                                                                    ) =>
                                                                      Either.of<
                                                                        Error,
                                                                        Resource.Values<Resource.TermValue>
                                                                      >(
                                                                        $parameters.resource.values(
                                                                          $schema
                                                                            .properties
                                                                            .tsObjectDeclarationType
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
                                                                                        case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
                                                                                          return Either.of<
                                                                                            Error,
                                                                                            NamedNode<
                                                                                              | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                                                                              | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                                                                            >
                                                                                          >(
                                                                                            iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class">,
                                                                                          );
                                                                                        case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
                                                                                          return Either.of<
                                                                                            Error,
                                                                                            NamedNode<
                                                                                              | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                                                                              | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                                                                            >
                                                                                          >(
                                                                                            iri as NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">,
                                                                                          );
                                                                                        default:
                                                                                          return Left<
                                                                                            Error,
                                                                                            NamedNode<
                                                                                              | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                                                                              | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                                                                            >
                                                                                          >(
                                                                                            new Resource.MistypedTermValueError(
                                                                                              {
                                                                                                actualValue:
                                                                                                  iri,
                                                                                                expectedValueType:
                                                                                                  'NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class" | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">',
                                                                                                focusResource:
                                                                                                  $parameters.resource,
                                                                                                predicate:
                                                                                                  ShaclmateOntology
                                                                                                    .$schema
                                                                                                    .properties
                                                                                                    .tsObjectDeclarationType
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
                                                                                      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                                                                                      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                                                                                    >
                                                                                  >
                                                                                >(
                                                                                  {
                                                                                    focusResource:
                                                                                      $parameters.resource,
                                                                                    predicate:
                                                                                      ShaclmateOntology
                                                                                        .$schema
                                                                                        .properties
                                                                                        .tsObjectDeclarationType
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
                                                                        .map(
                                                                          (
                                                                            tsObjectDeclarationType,
                                                                          ) => ({
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
    );
  }

  export function $toRdf(
    _shaclmateNodeShape: ShaclmateNodeShape,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = ShaclCoreNodeShapeStatic.$toRdf(_shaclmateNodeShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      );
    }
    resource.add(
      ShaclmateNodeShape.$schema.properties.abstract.identifier,
      ..._shaclmateNodeShape.abstract
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      ShaclmateNodeShape.$schema.properties.discriminantValue.identifier,
      ..._shaclmateNodeShape.discriminantValue
        .toList()
        .flatMap((value) => [dataFactory.literal(value)]),
    );
    resource.add(
      ShaclmateNodeShape.$schema.properties.export_.identifier,
      ..._shaclmateNodeShape.export_
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      ShaclmateNodeShape.$schema.properties.extern.identifier,
      ..._shaclmateNodeShape.extern
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      ShaclmateNodeShape.$schema.properties.fromRdfType.identifier,
      ..._shaclmateNodeShape.fromRdfType.toList(),
    );
    resource.add(
      ShaclmateNodeShape.$schema.properties.identifierMintingStrategy
        .identifier,
      ..._shaclmateNodeShape.identifierMintingStrategy.toList(),
    );
    resource.add(
      ShaclmatePropertyShape.$schema.properties.mutable.identifier,
      ..._shaclmateNodeShape.mutable
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      ShaclmatePropertyShape.$schema.properties.name.identifier,
      ..._shaclmateNodeShape.name
        .toList()
        .flatMap((value) => [dataFactory.literal(value)]),
    );
    resource.add(
      ShaclmateNodeShape.$schema.properties.rdfType.identifier,
      ..._shaclmateNodeShape.rdfType.toList(),
    );
    resource.add(
      ShaclmateNodeShape.$schema.properties.toRdfTypes.identifier,
      ..._shaclmateNodeShape.toRdfTypes.flatMap((item) => [item]),
    );
    resource.add(
      ShaclmateOntology.$schema.properties.tsFeatureExcludes.identifier,
      ..._shaclmateNodeShape.tsFeatureExcludes.flatMap((item) => [item]),
    );
    resource.add(
      ShaclmateOntology.$schema.properties.tsFeatureIncludes.identifier,
      ..._shaclmateNodeShape.tsFeatureIncludes.flatMap((item) => [item]),
    );
    resource.add(
      ShaclmateOntology.$schema.properties.tsImports.identifier,
      ..._shaclmateNodeShape.tsImports.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      ShaclmateOntology.$schema.properties.tsObjectDeclarationType.identifier,
      ..._shaclmateNodeShape.tsObjectDeclarationType.toList(),
    );
    return resource;
  }

  export const $schema = {
    properties: {
      ...ShaclCoreNodeShapeStatic.$schema.properties,
      abstract: {
        kind: "ShaclProperty" as const,
        name: "abstract",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#abstract",
        ),
      },
      discriminantValue: {
        kind: "ShaclProperty" as const,
        name: "discriminantValue",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#discriminantValue",
        ),
      },
      export_: {
        kind: "ShaclProperty" as const,
        name: "export_",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#export",
        ),
      },
      extern: {
        kind: "ShaclProperty" as const,
        name: "extern",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#extern",
        ),
      },
      fromRdfType: {
        kind: "ShaclProperty" as const,
        name: "fromRdfType",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#fromRdfType",
        ),
      },
      identifierMintingStrategy: {
        kind: "ShaclProperty" as const,
        name: "identifierMintingStrategy",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
        ),
      },
      mutable: {
        kind: "ShaclProperty" as const,
        name: "mutable",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#mutable",
        ),
      },
      name: {
        kind: "ShaclProperty" as const,
        name: "name",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#name",
        ),
      },
      rdfType: {
        kind: "ShaclProperty" as const,
        name: "rdfType",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#rdfType",
        ),
      },
      toRdfTypes: {
        kind: "ShaclProperty" as const,
        name: "toRdfTypes",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#toRdfType",
        ),
      },
      tsFeatureExcludes: {
        kind: "ShaclProperty" as const,
        name: "tsFeatureExcludes",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsFeatureExclude",
        ),
      },
      tsFeatureIncludes: {
        kind: "ShaclProperty" as const,
        name: "tsFeatureIncludes",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsFeatureInclude",
        ),
      },
      tsImports: {
        kind: "ShaclProperty" as const,
        name: "tsImports",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsImport",
        ),
      },
      tsObjectDeclarationType: {
        kind: "ShaclProperty" as const,
        name: "tsObjectDeclarationType",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "NamedNodeType" as const,
            in: [
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class",
              ),
              dataFactory.namedNode(
                "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface",
              ),
            ],
          },
        }),
        identifier: dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new MutableResourceSet({
        dataFactory,
        dataset: $datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(
      _shaclCorePropertyGroup.$identifier,
      { mutateGraph },
    );
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyGroup"),
      );
    }
    resource.add(
      ShaclCorePropertyGroup.$schema.properties.comments.identifier,
      ..._shaclCorePropertyGroup.comments.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      ShaclCorePropertyGroup.$schema.properties.labels.identifier,
      ..._shaclCorePropertyGroup.labels.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    return resource;
  }

  export const $schema = {
    properties: {
      $identifier: {
        kind: "IdentifierProperty" as const,
        name: "$identifier",
        type: () => ({ kind: "IdentifierType" as const }),
        identifierMintingStrategy: "[object Object] as const",
      },
      $type: {
        kind: "TypeDiscriminantProperty" as const,
        name: "$type",
        type: () => ({
          descendantValues: undefined,
          ownValues: ['"ShaclCorePropertyGroup"'],
        }),
      },
      comments: {
        kind: "ShaclProperty" as const,
        name: "comments",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      labels: {
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
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
        kind: "ShaclProperty" as const,
        name: "and",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "ShaclProperty" as const,
        name: "classes",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comments: {
        kind: "ShaclProperty" as const,
        name: "comments",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "ShaclProperty" as const,
        name: "datatype",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#datatype",
        ),
      },
      deactivated: {
        kind: "ShaclProperty" as const,
        name: "deactivated",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#deactivated",
        ),
      },
      flags: {
        kind: "ShaclProperty" as const,
        name: "flags",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "ShaclProperty" as const,
        name: "hasValues",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "TermType" as const,
            in: undefined,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#hasValue",
        ),
      },
      in_: {
        kind: "ShaclProperty" as const,
        name: "in_",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "ListType" as const,
            item: {
              kind: "TermType" as const,
              in: undefined,
              nodeKinds: ["Literal" as const, "NamedNode" as const],
            },
            minCount: 0,
          },
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "ShaclProperty" as const,
        name: "isDefinedBy",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "IdentifierType" as const },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      labels: {
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "ShaclProperty" as const,
        name: "languageIn",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "ListType" as const,
            item: {
              kind: "StringType" as const,
              languageIn: undefined,
              in: undefined,
            },
            minCount: 0,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#languageIn",
        ),
      },
      maxCount: {
        kind: "ShaclProperty" as const,
        name: "maxCount",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxCount",
        ),
      },
      maxExclusive: {
        kind: "ShaclProperty" as const,
        name: "maxExclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxExclusive",
        ),
      },
      maxInclusive: {
        kind: "ShaclProperty" as const,
        name: "maxInclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxInclusive",
        ),
      },
      maxLength: {
        kind: "ShaclProperty" as const,
        name: "maxLength",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxLength",
        ),
      },
      minCount: {
        kind: "ShaclProperty" as const,
        name: "minCount",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minCount",
        ),
      },
      minExclusive: {
        kind: "ShaclProperty" as const,
        name: "minExclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minExclusive",
        ),
      },
      minInclusive: {
        kind: "ShaclProperty" as const,
        name: "minInclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minInclusive",
        ),
      },
      minLength: {
        kind: "ShaclProperty" as const,
        name: "minLength",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minLength",
        ),
      },
      nodeKind: {
        kind: "ShaclProperty" as const,
        name: "nodeKind",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#nodeKind",
        ),
      },
      nodes: {
        kind: "ShaclProperty" as const,
        name: "nodes",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "IdentifierType" as const },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      not: {
        kind: "ShaclProperty" as const,
        name: "not",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "IdentifierType" as const },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "ShaclProperty" as const,
        name: "or",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "ShaclProperty" as const,
        name: "patterns",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      xone: {
        kind: "ShaclProperty" as const,
        name: "xone",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
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
      typeof filter.$identifier !== "undefined" &&
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
        kind: "ShaclProperty" as const,
        name: "and",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      },
      classes: {
        kind: "ShaclProperty" as const,
        name: "classes",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      },
      comments: {
        kind: "ShaclProperty" as const,
        name: "comments",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
      },
      datatype: {
        kind: "ShaclProperty" as const,
        name: "datatype",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "NamedNodeType" as const, in: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#datatype",
        ),
      },
      deactivated: {
        kind: "ShaclProperty" as const,
        name: "deactivated",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "BooleanType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#deactivated",
        ),
      },
      flags: {
        kind: "ShaclProperty" as const,
        name: "flags",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      },
      hasValues: {
        kind: "ShaclProperty" as const,
        name: "hasValues",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "TermType" as const,
            in: undefined,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#hasValue",
        ),
      },
      in_: {
        kind: "ShaclProperty" as const,
        name: "in_",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "ListType" as const,
            item: {
              kind: "TermType" as const,
              in: undefined,
              nodeKinds: ["Literal" as const, "NamedNode" as const],
            },
            minCount: 0,
          },
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      },
      isDefinedBy: {
        kind: "ShaclProperty" as const,
        name: "isDefinedBy",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "IdentifierType" as const },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
      },
      labels: {
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
      },
      languageIn: {
        kind: "ShaclProperty" as const,
        name: "languageIn",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "ListType" as const,
            item: {
              kind: "StringType" as const,
              languageIn: undefined,
              in: undefined,
            },
            minCount: 0,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#languageIn",
        ),
      },
      maxCount: {
        kind: "ShaclProperty" as const,
        name: "maxCount",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxCount",
        ),
      },
      maxExclusive: {
        kind: "ShaclProperty" as const,
        name: "maxExclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxExclusive",
        ),
      },
      maxInclusive: {
        kind: "ShaclProperty" as const,
        name: "maxInclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxInclusive",
        ),
      },
      maxLength: {
        kind: "ShaclProperty" as const,
        name: "maxLength",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxLength",
        ),
      },
      minCount: {
        kind: "ShaclProperty" as const,
        name: "minCount",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minCount",
        ),
      },
      minExclusive: {
        kind: "ShaclProperty" as const,
        name: "minExclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minExclusive",
        ),
      },
      minInclusive: {
        kind: "ShaclProperty" as const,
        name: "minInclusive",
        type: () => ({
          kind: "OptionType" as const,
          item: { kind: "LiteralType" as const, languageIn: undefined },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minInclusive",
        ),
      },
      minLength: {
        kind: "ShaclProperty" as const,
        name: "minLength",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "IntType" as const,
            languageIn: undefined,
            in: undefined,
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minLength",
        ),
      },
      nodeKind: {
        kind: "ShaclProperty" as const,
        name: "nodeKind",
        type: () => ({
          kind: "OptionType" as const,
          item: {
            kind: "NamedNodeType" as const,
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
          },
        }),
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#nodeKind",
        ),
      },
      nodes: {
        kind: "ShaclProperty" as const,
        name: "nodes",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "IdentifierType" as const },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      },
      not: {
        kind: "ShaclProperty" as const,
        name: "not",
        type: () => ({
          kind: "SetType" as const,
          item: { kind: "IdentifierType" as const },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      },
      or: {
        kind: "ShaclProperty" as const,
        name: "or",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      },
      patterns: {
        kind: "ShaclProperty" as const,
        name: "patterns",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      },
      xone: {
        kind: "ShaclProperty" as const,
        name: "xone",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "ListType" as const,
            item: { kind: "IdentifierType" as const },
            minCount: 0,
          },
          minCount: 0,
        }),
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
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
      typeof filter.$identifier !== "undefined" &&
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
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          kind: "SetType" as const,
          item: {
            kind: "StringType" as const,
            languageIn: undefined,
            in: undefined,
          },
          minCount: 0,
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
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    },
  ): MutableResource {
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
  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Filter>,
  ): Promise<Either<Error, readonly OwlOntologyStatic.$Identifier[]>>;
  owlOntologies(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Filter>,
  ): Promise<Either<Error, readonly OwlOntology[]>>;
  owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShapeStatic.$Identifier,
  ): Promise<Either<Error, ShaclCoreNodeShape>>;
  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>,
  ): Promise<Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]>>;
  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>,
  ): Promise<Either<Error, readonly ShaclCoreNodeShape[]>>;
  shaclCoreNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
  shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyGroup>>;
  shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>>;
  shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<Either<Error, readonly ShaclCorePropertyGroup[]>>;
  shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShapeStatic.$Identifier,
  ): Promise<Either<Error, ShaclCorePropertyShape>>;
  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
  ): Promise<
    Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]>
  >;
  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
  ): Promise<Either<Error, readonly ShaclCorePropertyShape[]>>;
  shaclCorePropertyShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
      "filter"
    >,
  ): Promise<Either<Error, number>>;
  shaclmateNodeShape(
    identifier: ShaclmateNodeShape.$Identifier,
  ): Promise<Either<Error, ShaclmateNodeShape>>;
  shaclmateNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateNodeShape.$Identifier[]>>;
  shaclmateNodeShapes(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateNodeShape[]>>;
  shaclmateNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
  shaclmateOntology(
    identifier: ShaclmateOntology.$Identifier,
  ): Promise<Either<Error, ShaclmateOntology>>;
  shaclmateOntologyIdentifiers(
    query?: $ObjectSet.Query<ShaclmateOntology.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateOntology.$Identifier[]>>;
  shaclmateOntologies(
    query?: $ObjectSet.Query<ShaclmateOntology.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateOntology[]>>;
  shaclmateOntologiesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
  shaclmatePropertyShape(
    identifier: ShaclmatePropertyShape.$Identifier,
  ): Promise<Either<Error, ShaclmatePropertyShape>>;
  shaclmatePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmatePropertyShape.$Identifier[]>>;
  shaclmatePropertyShapes(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmatePropertyShape[]>>;
  shaclmatePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
  shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<Either<Error, ShaclCoreShape>>;
  shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclCoreShape.$Identifier[]>>;
  shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclCoreShape[]>>;
  shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
  shaclmateShape(
    identifier: ShaclmateShape.$Identifier,
  ): Promise<Either<Error, ShaclmateShape>>;
  shaclmateShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateShape.$Identifier[]>>;
  shaclmateShapes(
    query?: $ObjectSet.Query<ShaclmateShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateShape[]>>;
  shaclmateShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
  object(identifier: $Object.$Identifier): Promise<Either<Error, $Object>>;
  objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<Either<Error, readonly $Object.$Identifier[]>>;
  objects(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<Either<Error, readonly $Object[]>>;
  objectsCount(
    query?: Pick<$ObjectSet.Query<$Object.$Filter>, "filter">,
  ): Promise<Either<Error, number>>;
}

export namespace $ObjectSet {
  export interface Query<
    ObjectFilterT extends {
      readonly $identifier?: {
        readonly in?: readonly (BlankNode | NamedNode)[];
      };
    },
  > {
    readonly filter?: ObjectFilterT;
    readonly limit?: number;
    readonly offset?: number;
  }
}
export class $RdfjsDatasetObjectSet implements $ObjectSet {
  protected readonly resourceSet: ResourceSet;

  constructor(dataset: DatasetCore) {
    this.resourceSet = new ResourceSet({ dataset });
  }

  async owlOntology(
    identifier: OwlOntologyStatic.$Identifier,
  ): Promise<Either<Error, OwlOntology>> {
    return this.owlOntologySync(identifier);
  }
  owlOntologySync(
    identifier: OwlOntologyStatic.$Identifier,
  ): Either<Error, OwlOntology> {
    return this.owlOntologiesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Filter>,
  ): Promise<Either<Error, readonly OwlOntologyStatic.$Identifier[]>> {
    return this.owlOntologyIdentifiersSync(query);
  }
  owlOntologyIdentifiersSync(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Filter>,
  ): Either<Error, readonly OwlOntologyStatic.$Identifier[]> {
    return this.owlOntologiesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async owlOntologies(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Filter>,
  ): Promise<Either<Error, readonly OwlOntology[]>> {
    return this.owlOntologiesSync(query);
  }
  async owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.owlOntologiesCountSync(query);
  }
  owlOntologiesCountSync(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.owlOntologiesSync(query).map((objects) => objects.length);
  }
  owlOntologiesSync(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Filter>,
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
    return this.shaclCoreNodeShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>,
  ): Promise<Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]>> {
    return this.shaclCoreNodeShapeIdentifiersSync(query);
  }
  shaclCoreNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>,
  ): Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]> {
    return this.shaclCoreNodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>,
  ): Promise<Either<Error, readonly ShaclCoreNodeShape[]>> {
    return this.shaclCoreNodeShapesSync(query);
  }
  async shaclCoreNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shaclCoreNodeShapesCountSync(query);
  }
  shaclCoreNodeShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.shaclCoreNodeShapesSync(query).map((objects) => objects.length);
  }
  shaclCoreNodeShapesSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Filter>,
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
    return this.shaclCorePropertyGroupsSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>> {
    return this.shaclCorePropertyGroupIdentifiersSync(query);
  }
  shaclCorePropertyGroupIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]> {
    return this.shaclCorePropertyGroupsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<Either<Error, readonly ShaclCorePropertyGroup[]>> {
    return this.shaclCorePropertyGroupsSync(query);
  }
  async shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shaclCorePropertyGroupsCountSync(query);
  }
  shaclCorePropertyGroupsCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.shaclCorePropertyGroupsSync(query).map(
      (objects) => objects.length,
    );
  }
  shaclCorePropertyGroupsSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
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
    return this.shaclCorePropertyShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
  ): Promise<
    Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]>
  > {
    return this.shaclCorePropertyShapeIdentifiersSync(query);
  }
  shaclCorePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
  ): Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]> {
    return this.shaclCorePropertyShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
  ): Promise<Either<Error, readonly ShaclCorePropertyShape[]>> {
    return this.shaclCorePropertyShapesSync(query);
  }
  async shaclCorePropertyShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
      "filter"
    >,
  ): Promise<Either<Error, number>> {
    return this.shaclCorePropertyShapesCountSync(query);
  }
  shaclCorePropertyShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
      "filter"
    >,
  ): Either<Error, number> {
    return this.shaclCorePropertyShapesSync(query).map(
      (objects) => objects.length,
    );
  }
  shaclCorePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Filter>,
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
    return this.shaclmateNodeShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async shaclmateNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateNodeShape.$Identifier[]>> {
    return this.shaclmateNodeShapeIdentifiersSync(query);
  }
  shaclmateNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Filter>,
  ): Either<Error, readonly ShaclmateNodeShape.$Identifier[]> {
    return this.shaclmateNodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async shaclmateNodeShapes(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateNodeShape[]>> {
    return this.shaclmateNodeShapesSync(query);
  }
  async shaclmateNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shaclmateNodeShapesCountSync(query);
  }
  shaclmateNodeShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.shaclmateNodeShapesSync(query).map((objects) => objects.length);
  }
  shaclmateNodeShapesSync(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Filter>,
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
    return this.shaclmateOntologiesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async shaclmateOntologyIdentifiers(
    query?: $ObjectSet.Query<ShaclmateOntology.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateOntology.$Identifier[]>> {
    return this.shaclmateOntologyIdentifiersSync(query);
  }
  shaclmateOntologyIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateOntology.$Filter>,
  ): Either<Error, readonly ShaclmateOntology.$Identifier[]> {
    return this.shaclmateOntologiesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async shaclmateOntologies(
    query?: $ObjectSet.Query<ShaclmateOntology.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateOntology[]>> {
    return this.shaclmateOntologiesSync(query);
  }
  async shaclmateOntologiesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shaclmateOntologiesCountSync(query);
  }
  shaclmateOntologiesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.shaclmateOntologiesSync(query).map((objects) => objects.length);
  }
  shaclmateOntologiesSync(
    query?: $ObjectSet.Query<ShaclmateOntology.$Filter>,
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
    return this.shaclmatePropertyShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async shaclmatePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmatePropertyShape.$Identifier[]>> {
    return this.shaclmatePropertyShapeIdentifiersSync(query);
  }
  shaclmatePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Filter>,
  ): Either<Error, readonly ShaclmatePropertyShape.$Identifier[]> {
    return this.shaclmatePropertyShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async shaclmatePropertyShapes(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmatePropertyShape[]>> {
    return this.shaclmatePropertyShapesSync(query);
  }
  async shaclmatePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shaclmatePropertyShapesCountSync(query);
  }
  shaclmatePropertyShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.shaclmatePropertyShapesSync(query).map(
      (objects) => objects.length,
    );
  }
  shaclmatePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Filter>,
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
    return this.shaclCoreShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclCoreShape.$Identifier[]>> {
    return this.shaclCoreShapeIdentifiersSync(query);
  }
  shaclCoreShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Either<Error, readonly ShaclCoreShape.$Identifier[]> {
    return this.shaclCoreShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclCoreShape[]>> {
    return this.shaclCoreShapesSync(query);
  }
  async shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shaclCoreShapesCountSync(query);
  }
  shaclCoreShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.shaclCoreShapesSync(query).map((objects) => objects.length);
  }
  shaclCoreShapesSync(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
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
    return this.shaclmateShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async shaclmateShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateShape.$Identifier[]>> {
    return this.shaclmateShapeIdentifiersSync(query);
  }
  shaclmateShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateShape.$Filter>,
  ): Either<Error, readonly ShaclmateShape.$Identifier[]> {
    return this.shaclmateShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async shaclmateShapes(
    query?: $ObjectSet.Query<ShaclmateShape.$Filter>,
  ): Promise<Either<Error, readonly ShaclmateShape[]>> {
    return this.shaclmateShapesSync(query);
  }
  async shaclmateShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.shaclmateShapesCountSync(query);
  }
  shaclmateShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.shaclmateShapesSync(query).map((objects) => objects.length);
  }
  shaclmateShapesSync(
    query?: $ObjectSet.Query<ShaclmateShape.$Filter>,
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
    return this.objectsSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }
  async objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<Either<Error, readonly $Object.$Identifier[]>> {
    return this.objectIdentifiersSync(query);
  }
  objectIdentifiersSync(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Either<Error, readonly $Object.$Identifier[]> {
    return this.objectsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }
  async objects(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<Either<Error, readonly $Object[]>> {
    return this.objectsSync(query);
  }
  async objectsCount(
    query?: Pick<$ObjectSet.Query<$Object.$Filter>, "filter">,
  ): Promise<Either<Error, number>> {
    return this.objectsCountSync(query);
  }
  objectsCountSync(
    query?: Pick<$ObjectSet.Query<$Object.$Filter>, "filter">,
  ): Either<Error, number> {
    return this.objectsSync(query).map((objects) => objects.length);
  }
  objectsSync(
    query?: $ObjectSet.Query<$Object.$Filter>,
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
    ObjectFilterT extends {
      readonly $identifier?: {
        readonly in?: readonly (BlankNode | NamedNode)[];
      };
    },
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
    query?: $ObjectSet.Query<ObjectFilterT>,
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
    if (query?.filter?.$identifier?.in) {
      resources = query.filter.$identifier.in.map((identifier) => ({
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
    ObjectFilterT extends {
      readonly $identifier?: {
        readonly in?: readonly (BlankNode | NamedNode)[];
      };
    },
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
    query?: $ObjectSet.Query<ObjectFilterT>,
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
    if (query?.filter?.$identifier?.in) {
      resources = query.filter.$identifier.in.map((identifier) => ({
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

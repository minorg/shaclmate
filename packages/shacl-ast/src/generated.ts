import { StoreFactory as _DatasetFactory } from "n3";

const datasetFactory = new _DatasetFactory();

import type * as rdfjs from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
import { PropertyPath } from "./PropertyPath.js";

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
  value: rdfjs.BlankNode | rdfjs.NamedNode,
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

function $filterLiteral(filter: $LiteralFilter, value: rdfjs.Literal): boolean {
  return $filterTerm(filter, value);
}

function $filterMaybe<ItemT, ItemFilterT>(
  filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean,
) {
  return (
    filter: $MaybeFilter<ItemFilterT>,
    value: purify.Maybe<ItemT>,
  ): boolean => {
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

function $filterNamedNode(filter: $NamedNodeFilter, value: rdfjs.NamedNode) {
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
  value: rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode,
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

function $fromRdfPreferredLanguages({
  focusResource,
  predicate,
  preferredLanguages,
  values,
}: {
  focusResource: rdfjsResource.Resource;
  predicate: rdfjs.NamedNode;
  preferredLanguages?: readonly string[];
  values: rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>;
}): purify.Either<
  Error,
  rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
    >(values);
  }

  return values
    .chainMap((value) => value.toLiteral())
    .map((literalValues) => {
      // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
      // Within a preferredLanguage the literals may be in any order.
      let filteredLiteralValues:
        | rdfjsResource.Resource.Values<rdfjs.Literal>
        | undefined;
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
          new rdfjsResource.Resource.TermValue({
            focusResource,
            predicate,
            term: literalValue,
          }),
      );
    });
}

interface $IdentifierFilter {
  readonly in?: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly type?: "BlankNode" | "NamedNode";
}

class $IdentifierSet {
  private readonly blankNodeValues = new Set<string>();
  private readonly namedNodeValues = new Set<string>();

  add(identifier: rdfjs.BlankNode | rdfjs.NamedNode): this {
    switch (identifier.termType) {
      case "BlankNode":
        this.blankNodeValues.add(identifier.value);
        return this;
      case "NamedNode":
        this.namedNodeValues.add(identifier.value);
        return this;
    }
  }

  has(identifier: rdfjs.BlankNode | rdfjs.NamedNode): boolean {
    switch (identifier.termType) {
      case "BlankNode":
        return this.blankNodeValues.has(identifier.value);
      case "NamedNode":
        return this.namedNodeValues.has(identifier.value);
    }
  }
}

interface $LiteralFilter extends Omit<$TermFilter, "in" | "type"> {
  readonly in?: readonly rdfjs.Literal[];
}

type $MaybeFilter<ItemFilterT> = ItemFilterT | null;
interface $NamedNodeFilter {
  readonly in?: readonly rdfjs.NamedNode[];
}

const $namedNodeIdentifierTypeSchema = { kind: "NamedNodeType" as const };
interface $NumberFilter {
  readonly in?: readonly number[];
  readonly maxExclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly minInclusive?: number;
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
  readonly datatypeIn?: readonly rdfjs.NamedNode[];
  readonly in?: readonly (rdfjs.Literal | rdfjs.NamedNode)[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
}

const $unconstrainedBooleanSchema = { kind: "BooleanType" as const };
const $unconstrainedFloatSchema = { kind: "FloatType" as const };
const $unconstrainedIdentifierSchema = { kind: "IdentifierType" as const };
const $unconstrainedIntSchema = { kind: "IntType" as const };
const $unconstrainedLiteralSchema = { kind: "LiteralType" as const };
const $unconstrainedStringSchema = { kind: "StringType" as const };
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
export interface BaseShaclCoreShape {
  readonly $identifier: BaseShaclCoreShapeStatic.$Identifier;
  readonly $type: "ShaclCoreNodeShape" | "ShaclCorePropertyShape";
  readonly and: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
  readonly classes: readonly rdfjs.NamedNode[];
  readonly comments: readonly string[];
  readonly datatype: purify.Maybe<rdfjs.NamedNode>;
  readonly deactivated: purify.Maybe<boolean>;
  readonly flags: readonly string[];
  readonly hasValues: readonly (rdfjs.Literal | rdfjs.NamedNode)[];
  readonly in_: purify.Maybe<readonly (rdfjs.Literal | rdfjs.NamedNode)[]>;
  readonly isDefinedBy: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
  readonly labels: readonly string[];
  readonly languageIn: purify.Maybe<readonly string[]>;
  readonly maxCount: purify.Maybe<number>;
  readonly maxExclusive: purify.Maybe<rdfjs.Literal>;
  readonly maxInclusive: purify.Maybe<rdfjs.Literal>;
  readonly maxLength: purify.Maybe<number>;
  readonly minCount: purify.Maybe<number>;
  readonly minExclusive: purify.Maybe<rdfjs.Literal>;
  readonly minInclusive: purify.Maybe<rdfjs.Literal>;
  readonly minLength: purify.Maybe<number>;
  readonly nodeKind: purify.Maybe<
    rdfjs.NamedNode<
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
    >
  >;
  readonly nodes: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly not: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly or: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
  readonly patterns: readonly string[];
  readonly xone: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
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
        readonly (rdfjs.BlankNode | rdfjs.NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<rdfjs.BlankNode | rdfjs.NamedNode, $IdentifierFilter>(
          $filterIdentifier,
        ),
      )(filter.and, value.and)
    ) {
      return false;
    }

    if (
      typeof filter.classes !== "undefined" &&
      !$filterArray<rdfjs.NamedNode, $NamedNodeFilter>($filterNamedNode)(
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
      !$filterMaybe<rdfjs.NamedNode, $NamedNodeFilter>($filterNamedNode)(
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
      !$filterArray<rdfjs.Literal | rdfjs.NamedNode, $TermFilter>($filterTerm)(
        filter.hasValues,
        value.hasValues,
      )
    ) {
      return false;
    }

    if (
      typeof filter.in_ !== "undefined" &&
      !$filterMaybe<
        readonly (rdfjs.Literal | rdfjs.NamedNode)[],
        $CollectionFilter<$TermFilter>
      >(
        $filterArray<rdfjs.Literal | rdfjs.NamedNode, $TermFilter>($filterTerm),
      )(filter.in_, value.in_)
    ) {
      return false;
    }

    if (
      typeof filter.isDefinedBy !== "undefined" &&
      !$filterMaybe<rdfjs.BlankNode | rdfjs.NamedNode, $IdentifierFilter>(
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
      !$filterMaybe<rdfjs.Literal, $LiteralFilter>($filterLiteral)(
        filter.maxExclusive,
        value.maxExclusive,
      )
    ) {
      return false;
    }

    if (
      typeof filter.maxInclusive !== "undefined" &&
      !$filterMaybe<rdfjs.Literal, $LiteralFilter>($filterLiteral)(
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
      !$filterMaybe<rdfjs.Literal, $LiteralFilter>($filterLiteral)(
        filter.minExclusive,
        value.minExclusive,
      )
    ) {
      return false;
    }

    if (
      typeof filter.minInclusive !== "undefined" &&
      !$filterMaybe<rdfjs.Literal, $LiteralFilter>($filterLiteral)(
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
        rdfjs.NamedNode<
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
      !$filterArray<rdfjs.BlankNode | rdfjs.NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.nodes, value.nodes)
    ) {
      return false;
    }

    if (
      typeof filter.not !== "undefined" &&
      !$filterArray<rdfjs.BlankNode | rdfjs.NamedNode, $IdentifierFilter>(
        $filterIdentifier,
      )(filter.not, value.not)
    ) {
      return false;
    }

    if (
      typeof filter.or !== "undefined" &&
      !$filterArray<
        readonly (rdfjs.BlankNode | rdfjs.NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<rdfjs.BlankNode | rdfjs.NamedNode, $IdentifierFilter>(
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
        readonly (rdfjs.BlankNode | rdfjs.NamedNode)[],
        $CollectionFilter<$IdentifierFilter>
      >(
        $filterArray<rdfjs.BlankNode | rdfjs.NamedNode, $IdentifierFilter>(
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
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf($parameters: {
    context?: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      and: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
      classes: readonly rdfjs.NamedNode[];
      comments: readonly string[];
      datatype: purify.Maybe<rdfjs.NamedNode>;
      deactivated: purify.Maybe<boolean>;
      flags: readonly string[];
      hasValues: readonly (rdfjs.Literal | rdfjs.NamedNode)[];
      in_: purify.Maybe<readonly (rdfjs.Literal | rdfjs.NamedNode)[]>;
      isDefinedBy: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
      labels: readonly string[];
      languageIn: purify.Maybe<readonly string[]>;
      maxCount: purify.Maybe<number>;
      maxExclusive: purify.Maybe<rdfjs.Literal>;
      maxInclusive: purify.Maybe<rdfjs.Literal>;
      maxLength: purify.Maybe<number>;
      minCount: purify.Maybe<number>;
      minExclusive: purify.Maybe<rdfjs.Literal>;
      minInclusive: purify.Maybe<rdfjs.Literal>;
      minLength: purify.Maybe<number>;
      nodeKind: purify.Maybe<
        rdfjs.NamedNode<
          | "http://www.w3.org/ns/shacl#BlankNode"
          | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
          | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
          | "http://www.w3.org/ns/shacl#IRI"
          | "http://www.w3.org/ns/shacl#IRIOrLiteral"
          | "http://www.w3.org/ns/shacl#Literal"
        >
      >;
      nodes: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
      not: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
      or: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
      patterns: readonly string[];
      xone: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
    }
  > {
    return purify.Either.of<Error, BaseShaclCoreShapeStatic.$Identifier>(
      $parameters.resource.identifier as BaseShaclCoreShapeStatic.$Identifier,
    ).chain(($identifier) =>
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
      >(
        $parameters.resource.values($schema.properties.and.identifier, {
          unique: true,
        }),
      )
        .chain((values) => values.chainMap((value) => value.toList()))
        .chain((valueLists) =>
          valueLists.chainMap((valueList) =>
            purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
            >(
              rdfjsResource.Resource.Values.fromArray({
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
          rdfjsResource.Resource.Values.fromValue({
            focusResource: $parameters.resource,
            predicate:
              BaseShaclCoreShapeStatic.$schema.properties.and.identifier,
            value: valuesArray,
          }),
        )
        .chain((values) => values.head())
        .chain((and) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
          >(
            $parameters.resource.values($schema.properties.classes.identifier, {
              unique: true,
            }),
          )
            .chain((values) => values.chainMap((value) => value.toIri()))
            .map((values) => values.toArray())
            .map((valuesArray) =>
              rdfjsResource.Resource.Values.fromValue({
                focusResource: $parameters.resource,
                predicate:
                  BaseShaclCoreShapeStatic.$schema.properties.classes
                    .identifier,
                value: valuesArray,
              }),
            )
            .chain((values) => values.head())
            .chain((classes) =>
              purify.Either.of<
                Error,
                rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
              >(
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
                  rdfjsResource.Resource.Values.fromValue({
                    focusResource: $parameters.resource,
                    predicate:
                      BaseShaclCoreShapeStatic.$schema.properties.comments
                        .identifier,
                    value: valuesArray,
                  }),
                )
                .chain((values) => values.head())
                .chain((comments) =>
                  purify.Either.of<
                    Error,
                    rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                  >(
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
                        ? values.map((value) => purify.Maybe.of(value))
                        : rdfjsResource.Resource.Values.fromValue<
                            purify.Maybe<rdfjs.NamedNode>
                          >({
                            focusResource: $parameters.resource,
                            predicate:
                              BaseShaclCoreShapeStatic.$schema.properties
                                .datatype.identifier,
                            value: purify.Maybe.empty(),
                          }),
                    )
                    .chain((values) => values.head())
                    .chain((datatype) =>
                      purify.Either.of<
                        Error,
                        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                      >(
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
                            ? values.map((value) => purify.Maybe.of(value))
                            : rdfjsResource.Resource.Values.fromValue<
                                purify.Maybe<boolean>
                              >({
                                focusResource: $parameters.resource,
                                predicate:
                                  BaseShaclCoreShapeStatic.$schema.properties
                                    .deactivated.identifier,
                                value: purify.Maybe.empty(),
                              }),
                        )
                        .chain((values) => values.head())
                        .chain((deactivated) =>
                          purify.Either.of<
                            Error,
                            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                          >(
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
                              rdfjsResource.Resource.Values.fromValue({
                                focusResource: $parameters.resource,
                                predicate:
                                  BaseShaclCoreShapeStatic.$schema.properties
                                    .flags.identifier,
                                value: valuesArray,
                              }),
                            )
                            .chain((values) => values.head())
                            .chain((flags) =>
                              purify.Either.of<
                                Error,
                                rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                              >(
                                $parameters.resource.values(
                                  $schema.properties.hasValues.identifier,
                                  { unique: true },
                                ),
                              )
                                .chain((values) =>
                                  values.chainMap((value) =>
                                    purify.Either.of<
                                      Error,
                                      | rdfjs.BlankNode
                                      | rdfjs.Literal
                                      | rdfjs.NamedNode
                                    >(value.toTerm()).chain((term) => {
                                      switch (term.termType) {
                                        case "Literal":
                                        case "NamedNode":
                                          return purify.Either.of<
                                            Error,
                                            rdfjs.Literal | rdfjs.NamedNode
                                          >(term);
                                        default:
                                          return purify.Left<
                                            Error,
                                            rdfjs.Literal | rdfjs.NamedNode
                                          >(
                                            new rdfjsResource.Resource.MistypedTermValueError(
                                              {
                                                actualValue: term,
                                                expectedValueType:
                                                  "(rdfjs.Literal | rdfjs.NamedNode)",
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
                                  rdfjsResource.Resource.Values.fromValue({
                                    focusResource: $parameters.resource,
                                    predicate:
                                      BaseShaclCoreShapeStatic.$schema
                                        .properties.hasValues.identifier,
                                    value: valuesArray,
                                  }),
                                )
                                .chain((values) => values.head())
                                .chain((hasValues) =>
                                  purify.Either.of<
                                    Error,
                                    rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                        purify.Either.of<
                                          Error,
                                          rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                                        >(
                                          rdfjsResource.Resource.Values.fromArray(
                                            {
                                              focusResource:
                                                $parameters.resource,
                                              predicate:
                                                BaseShaclCoreShapeStatic.$schema
                                                  .properties.in_.identifier,
                                              values: valueList,
                                            },
                                          ),
                                        ).chain((values) =>
                                          values.chainMap((value) =>
                                            purify.Either.of<
                                              Error,
                                              | rdfjs.BlankNode
                                              | rdfjs.Literal
                                              | rdfjs.NamedNode
                                            >(value.toTerm()).chain((term) => {
                                              switch (term.termType) {
                                                case "Literal":
                                                case "NamedNode":
                                                  return purify.Either.of<
                                                    Error,
                                                    | rdfjs.Literal
                                                    | rdfjs.NamedNode
                                                  >(term);
                                                default:
                                                  return purify.Left<
                                                    Error,
                                                    | rdfjs.Literal
                                                    | rdfjs.NamedNode
                                                  >(
                                                    new rdfjsResource.Resource.MistypedTermValueError(
                                                      {
                                                        actualValue: term,
                                                        expectedValueType:
                                                          "(rdfjs.Literal | rdfjs.NamedNode)",
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
                                        ? values.map((value) =>
                                            purify.Maybe.of(value),
                                          )
                                        : rdfjsResource.Resource.Values.fromValue<
                                            purify.Maybe<
                                              readonly (
                                                | rdfjs.Literal
                                                | rdfjs.NamedNode
                                              )[]
                                            >
                                          >({
                                            focusResource: $parameters.resource,
                                            predicate:
                                              BaseShaclCoreShapeStatic.$schema
                                                .properties.in_.identifier,
                                            value: purify.Maybe.empty(),
                                          }),
                                    )
                                    .chain((values) => values.head())
                                    .chain((in_) =>
                                      purify.Either.of<
                                        Error,
                                        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                purify.Maybe.of(value),
                                              )
                                            : rdfjsResource.Resource.Values.fromValue<
                                                purify.Maybe<
                                                  | rdfjs.BlankNode
                                                  | rdfjs.NamedNode
                                                >
                                              >({
                                                focusResource:
                                                  $parameters.resource,
                                                predicate:
                                                  BaseShaclCoreShapeStatic
                                                    .$schema.properties
                                                    .isDefinedBy.identifier,
                                                value: purify.Maybe.empty(),
                                              }),
                                        )
                                        .chain((values) => values.head())
                                        .chain((isDefinedBy) =>
                                          purify.Either.of<
                                            Error,
                                            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                              rdfjsResource.Resource.Values.fromValue(
                                                {
                                                  focusResource:
                                                    $parameters.resource,
                                                  predicate:
                                                    BaseShaclCoreShapeStatic
                                                      .$schema.properties.labels
                                                      .identifier,
                                                  value: valuesArray,
                                                },
                                              ),
                                            )
                                            .chain((values) => values.head())
                                            .chain((labels) =>
                                              purify.Either.of<
                                                Error,
                                                rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                      purify.Either.of<
                                                        Error,
                                                        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                                                      >(
                                                        rdfjsResource.Resource.Values.fromArray(
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
                                                        purify.Maybe.of(value),
                                                      )
                                                    : rdfjsResource.Resource.Values.fromValue<
                                                        purify.Maybe<
                                                          readonly string[]
                                                        >
                                                      >({
                                                        focusResource:
                                                          $parameters.resource,
                                                        predicate:
                                                          BaseShaclCoreShapeStatic
                                                            .$schema.properties
                                                            .languageIn
                                                            .identifier,
                                                        value:
                                                          purify.Maybe.empty(),
                                                      }),
                                                )
                                                .chain((values) =>
                                                  values.head(),
                                                )
                                                .chain((languageIn) =>
                                                  purify.Either.of<
                                                    Error,
                                                    rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                            purify.Maybe.of(
                                                              value,
                                                            ),
                                                          )
                                                        : rdfjsResource.Resource.Values.fromValue<
                                                            purify.Maybe<number>
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
                                                              purify.Maybe.empty(),
                                                          }),
                                                    )
                                                    .chain((values) =>
                                                      values.head(),
                                                    )
                                                    .chain((maxCount) =>
                                                      purify.Either.of<
                                                        Error,
                                                        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                                                      >(
                                                        $parameters.resource.values(
                                                          $schema.properties
                                                            .maxExclusive
                                                            .identifier,
                                                          { unique: true },
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
                                                                  purify.Maybe.of(
                                                                    value,
                                                                  ),
                                                              )
                                                            : rdfjsResource.Resource.Values.fromValue<
                                                                purify.Maybe<rdfjs.Literal>
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
                                                                  purify.Maybe.empty(),
                                                              }),
                                                        )
                                                        .chain((values) =>
                                                          values.head(),
                                                        )
                                                        .chain((maxExclusive) =>
                                                          purify.Either.of<
                                                            Error,
                                                            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                                                          >(
                                                            $parameters.resource.values(
                                                              $schema.properties
                                                                .maxInclusive
                                                                .identifier,
                                                              { unique: true },
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
                                                                      purify.Maybe.of(
                                                                        value,
                                                                      ),
                                                                  )
                                                                : rdfjsResource.Resource.Values.fromValue<
                                                                    purify.Maybe<rdfjs.Literal>
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
                                                                      purify.Maybe.empty(),
                                                                  }),
                                                            )
                                                            .chain((values) =>
                                                              values.head(),
                                                            )
                                                            .chain(
                                                              (maxInclusive) =>
                                                                purify.Either.of<
                                                                  Error,
                                                                  rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                              purify.Maybe.of(
                                                                                value,
                                                                              ),
                                                                          )
                                                                        : rdfjsResource.Resource.Values.fromValue<
                                                                            purify.Maybe<number>
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
                                                                              purify.Maybe.empty(),
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
                                                                      purify.Either.of<
                                                                        Error,
                                                                        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                    purify.Maybe.of(
                                                                                      value,
                                                                                    ),
                                                                                )
                                                                              : rdfjsResource.Resource.Values.fromValue<
                                                                                  purify.Maybe<number>
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
                                                                                      purify.Maybe.empty(),
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
                                                                            purify.Either.of<
                                                                              Error,
                                                                              rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                          purify.Maybe.of(
                                                                                            value,
                                                                                          ),
                                                                                      )
                                                                                    : rdfjsResource.Resource.Values.fromValue<
                                                                                        purify.Maybe<rdfjs.Literal>
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
                                                                                            purify.Maybe.empty(),
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
                                                                                  purify.Either.of<
                                                                                    Error,
                                                                                    rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                                purify.Maybe.of(
                                                                                                  value,
                                                                                                ),
                                                                                            )
                                                                                          : rdfjsResource.Resource.Values.fromValue<
                                                                                              purify.Maybe<rdfjs.Literal>
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
                                                                                                  purify.Maybe.empty(),
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
                                                                                        purify.Either.of<
                                                                                          Error,
                                                                                          rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                                      purify.Maybe.of(
                                                                                                        value,
                                                                                                      ),
                                                                                                  )
                                                                                                : rdfjsResource.Resource.Values.fromValue<
                                                                                                    purify.Maybe<number>
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
                                                                                                        purify.Maybe.empty(),
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
                                                                                              purify.Either.of<
                                                                                                Error,
                                                                                                rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                                                  return purify.Either.of<
                                                                                                                    Error,
                                                                                                                    rdfjs.NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#BlankNode">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#BlankNodeOrIRI":
                                                                                                                  return purify.Either.of<
                                                                                                                    Error,
                                                                                                                    rdfjs.NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#BlankNodeOrIRI">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#BlankNodeOrLiteral":
                                                                                                                  return purify.Either.of<
                                                                                                                    Error,
                                                                                                                    rdfjs.NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#BlankNodeOrLiteral">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#IRI":
                                                                                                                  return purify.Either.of<
                                                                                                                    Error,
                                                                                                                    rdfjs.NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#IRI">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#IRIOrLiteral":
                                                                                                                  return purify.Either.of<
                                                                                                                    Error,
                                                                                                                    rdfjs.NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#IRIOrLiteral">,
                                                                                                                  );
                                                                                                                case "http://www.w3.org/ns/shacl#Literal":
                                                                                                                  return purify.Either.of<
                                                                                                                    Error,
                                                                                                                    rdfjs.NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#Literal">,
                                                                                                                  );
                                                                                                                default:
                                                                                                                  return purify.Left<
                                                                                                                    Error,
                                                                                                                    rdfjs.NamedNode<
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNode"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRI"
                                                                                                                      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
                                                                                                                      | "http://www.w3.org/ns/shacl#Literal"
                                                                                                                    >
                                                                                                                  >(
                                                                                                                    new rdfjsResource.Resource.MistypedTermValueError(
                                                                                                                      {
                                                                                                                        actualValue:
                                                                                                                          iri,
                                                                                                                        expectedValueType:
                                                                                                                          'rdfjs.NamedNode<"http://www.w3.org/ns/shacl#BlankNode" | "http://www.w3.org/ns/shacl#BlankNodeOrIRI" | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral" | "http://www.w3.org/ns/shacl#IRI" | "http://www.w3.org/ns/shacl#IRIOrLiteral" | "http://www.w3.org/ns/shacl#Literal">',
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
                                                                                                            purify.Maybe.of(
                                                                                                              value,
                                                                                                            ),
                                                                                                        )
                                                                                                      : rdfjsResource.Resource.Values.fromValue<
                                                                                                          purify.Maybe<
                                                                                                            rdfjs.NamedNode<
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
                                                                                                              purify.Maybe.empty(),
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
                                                                                                    purify.Either.of<
                                                                                                      Error,
                                                                                                      rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                                          rdfjsResource.Resource.Values.fromValue(
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
                                                                                                          purify.Either.of<
                                                                                                            Error,
                                                                                                            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                                                rdfjsResource.Resource.Values.fromValue(
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
                                                                                                                purify.Either.of<
                                                                                                                  Error,
                                                                                                                  rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                                                          purify.Either.of<
                                                                                                                            Error,
                                                                                                                            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                                                                                                                          >(
                                                                                                                            rdfjsResource.Resource.Values.fromArray(
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
                                                                                                                      rdfjsResource.Resource.Values.fromValue(
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
                                                                                                                      purify.Either.of<
                                                                                                                        Error,
                                                                                                                        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                                                            rdfjsResource.Resource.Values.fromValue(
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
                                                                                                                            purify.Either.of<
                                                                                                                              Error,
                                                                                                                              rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                                                                                                                      purify.Either.of<
                                                                                                                                        Error,
                                                                                                                                        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                                                                                                                                      >(
                                                                                                                                        rdfjsResource.Resource.Values.fromArray(
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
                                                                                                                                  rdfjsResource.Resource.Values.fromValue(
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

  export const $schema = {
    properties: {
      $identifier: {
        identifierMintingStrategy: "blankNode" as const,
        kind: "IdentifierProperty" as const,
        name: "$identifier",
        type: () => $unconstrainedIdentifierSchema,
      },
      $type: {
        kind: "TypeDiscriminantProperty" as const,
        name: "$type",
        type: () => ({
          descendantValues: ["ShaclCoreNodeShape", "ShaclCorePropertyShape"],
        }),
      },
      and: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
        kind: "ShaclProperty" as const,
        name: "and",
        type: () => ({
          item: {
            item: $unconstrainedIdentifierSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      classes: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
        kind: "ShaclProperty" as const,
        name: "classes",
        type: () => ({
          item: $namedNodeIdentifierTypeSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      comments: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
        kind: "ShaclProperty" as const,
        name: "comments",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      datatype: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#datatype",
        ),
        kind: "ShaclProperty" as const,
        name: "datatype",
        type: () => ({
          item: $namedNodeIdentifierTypeSchema,
          kind: "OptionType" as const,
        }),
      },
      deactivated: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#deactivated",
        ),
        kind: "ShaclProperty" as const,
        name: "deactivated",
        type: () => ({
          item: $unconstrainedBooleanSchema,
          kind: "OptionType" as const,
        }),
      },
      flags: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
        kind: "ShaclProperty" as const,
        name: "flags",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      hasValues: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#hasValue",
        ),
        kind: "ShaclProperty" as const,
        name: "hasValues",
        type: () => ({
          item: {
            kind: "TermType" as const,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          },
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      in_: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
        kind: "ShaclProperty" as const,
        name: "in_",
        type: () => ({
          item: {
            item: {
              kind: "TermType" as const,
              nodeKinds: ["Literal" as const, "NamedNode" as const],
            },
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "OptionType" as const,
        }),
      },
      isDefinedBy: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
        kind: "ShaclProperty" as const,
        name: "isDefinedBy",
        type: () => ({
          item: $unconstrainedIdentifierSchema,
          kind: "OptionType" as const,
        }),
      },
      labels: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      languageIn: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#languageIn",
        ),
        kind: "ShaclProperty" as const,
        name: "languageIn",
        type: () => ({
          item: {
            item: $unconstrainedStringSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "OptionType" as const,
        }),
      },
      maxCount: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxCount",
        ),
        kind: "ShaclProperty" as const,
        name: "maxCount",
        type: () => ({
          item: $unconstrainedIntSchema,
          kind: "OptionType" as const,
        }),
      },
      maxExclusive: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxExclusive",
        ),
        kind: "ShaclProperty" as const,
        name: "maxExclusive",
        type: () => ({
          item: $unconstrainedLiteralSchema,
          kind: "OptionType" as const,
        }),
      },
      maxInclusive: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxInclusive",
        ),
        kind: "ShaclProperty" as const,
        name: "maxInclusive",
        type: () => ({
          item: $unconstrainedLiteralSchema,
          kind: "OptionType" as const,
        }),
      },
      maxLength: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxLength",
        ),
        kind: "ShaclProperty" as const,
        name: "maxLength",
        type: () => ({
          item: $unconstrainedIntSchema,
          kind: "OptionType" as const,
        }),
      },
      minCount: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minCount",
        ),
        kind: "ShaclProperty" as const,
        name: "minCount",
        type: () => ({
          item: $unconstrainedIntSchema,
          kind: "OptionType" as const,
        }),
      },
      minExclusive: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minExclusive",
        ),
        kind: "ShaclProperty" as const,
        name: "minExclusive",
        type: () => ({
          item: $unconstrainedLiteralSchema,
          kind: "OptionType" as const,
        }),
      },
      minInclusive: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minInclusive",
        ),
        kind: "ShaclProperty" as const,
        name: "minInclusive",
        type: () => ({
          item: $unconstrainedLiteralSchema,
          kind: "OptionType" as const,
        }),
      },
      minLength: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minLength",
        ),
        kind: "ShaclProperty" as const,
        name: "minLength",
        type: () => ({
          item: $unconstrainedIntSchema,
          kind: "OptionType" as const,
        }),
      },
      nodeKind: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#nodeKind",
        ),
        kind: "ShaclProperty" as const,
        name: "nodeKind",
        type: () => ({
          item: {
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
            kind: "NamedNodeType" as const,
          },
          kind: "OptionType" as const,
        }),
      },
      nodes: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
        kind: "ShaclProperty" as const,
        name: "nodes",
        type: () => ({
          item: $unconstrainedIdentifierSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      not: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
        kind: "ShaclProperty" as const,
        name: "not",
        type: () => ({
          item: $unconstrainedIdentifierSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      or: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
        kind: "ShaclProperty" as const,
        name: "or",
        type: () => ({
          item: {
            item: $unconstrainedIdentifierSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      patterns: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
        kind: "ShaclProperty" as const,
        name: "patterns",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      xone: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
        kind: "ShaclProperty" as const,
        name: "xone",
        type: () => ({
          item: {
            item: $unconstrainedIdentifierSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
    },
  } as const;

  export function $toRdf(
    _baseShaclCoreShape: BaseShaclCoreShape,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
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
                    { mutateGraph },
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
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
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
                    { mutateGraph },
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
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
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
                    { mutateGraph },
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
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
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
                    { mutateGraph },
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
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
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
                    { mutateGraph },
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
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
    );
    return resource;
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
}
export interface ShaclCorePropertyShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCorePropertyShape.$Identifier;
  readonly $type: "ShaclCorePropertyShape";
  readonly defaultValue: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
  readonly descriptions: readonly string[];
  readonly groups: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly names: readonly string[];
  readonly order: purify.Maybe<number>;
  readonly path: PropertyPath;
  readonly uniqueLang: purify.Maybe<boolean>;
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
      !$filterMaybe<rdfjs.Literal | rdfjs.NamedNode, $TermFilter>($filterTerm)(
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
      !$filterArray<rdfjs.BlankNode | rdfjs.NamedNode, $IdentifierFilter>(
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

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      context?: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, ShaclCorePropertyShape> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return ShaclCorePropertyShape.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );
  export type $Identifier = BaseShaclCoreShapeStatic.$Identifier;
  export const $Identifier = BaseShaclCoreShapeStatic.$Identifier;

  export function $propertiesFromRdf($parameters: {
    context?: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclCorePropertyShape";
      defaultValue: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
      descriptions: readonly string[];
      groups: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
      names: readonly string[];
      order: purify.Maybe<number>;
      path: PropertyPath;
      uniqueLang: purify.Maybe<boolean>;
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
                  return purify.Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCorePropertyShape.$fromRdfType,
                )
              ) {
                return purify.Either.of<Error, true>(true);
              }

              return purify.Left(
                new Error(
                  `${rdfjsResource.Resource.Identifier.toString($parameters.resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
                ),
              );
            })
        : purify.Either.of<Error, true>(true)
      ).chain((_rdfTypeCheck) =>
        purify.Either.of<Error, ShaclCorePropertyShape.$Identifier>(
          $parameters.resource.identifier as ShaclCorePropertyShape.$Identifier,
        ).chain(($identifier) =>
          purify.Either.of<Error, "ShaclCorePropertyShape">(
            "ShaclCorePropertyShape",
          ).chain(($type) =>
            purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
            >(
              $parameters.resource.values(
                $schema.properties.defaultValue.identifier,
                { unique: true },
              ),
            )
              .chain((values) =>
                values.chainMap((value) =>
                  purify.Either.of<
                    Error,
                    rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode
                  >(value.toTerm()).chain((term) => {
                    switch (term.termType) {
                      case "Literal":
                      case "NamedNode":
                        return purify.Either.of<
                          Error,
                          rdfjs.Literal | rdfjs.NamedNode
                        >(term);
                      default:
                        return purify.Left<
                          Error,
                          rdfjs.Literal | rdfjs.NamedNode
                        >(
                          new rdfjsResource.Resource.MistypedTermValueError({
                            actualValue: term,
                            expectedValueType:
                              "(rdfjs.Literal | rdfjs.NamedNode)",
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
                  ? values.map((value) => purify.Maybe.of(value))
                  : rdfjsResource.Resource.Values.fromValue<
                      purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
                    >({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclCorePropertyShape.$schema.properties.defaultValue
                          .identifier,
                      value: purify.Maybe.empty(),
                    }),
              )
              .chain((values) => values.head())
              .chain((defaultValue) =>
                purify.Either.of<
                  Error,
                  rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                >(
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
                    rdfjsResource.Resource.Values.fromValue({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclCorePropertyShape.$schema.properties.descriptions
                          .identifier,
                      value: valuesArray,
                    }),
                  )
                  .chain((values) => values.head())
                  .chain((descriptions) =>
                    purify.Either.of<
                      Error,
                      rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                    >(
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
                        rdfjsResource.Resource.Values.fromValue({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclCorePropertyShape.$schema.properties.groups
                              .identifier,
                          value: valuesArray,
                        }),
                      )
                      .chain((values) => values.head())
                      .chain((groups) =>
                        purify.Either.of<
                          Error,
                          rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                        >(
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
                            rdfjsResource.Resource.Values.fromValue({
                              focusResource: $parameters.resource,
                              predicate:
                                ShaclCorePropertyShape.$schema.properties.names
                                  .identifier,
                              value: valuesArray,
                            }),
                          )
                          .chain((values) => values.head())
                          .chain((names) =>
                            purify.Either.of<
                              Error,
                              rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                  ? values.map((value) =>
                                      purify.Maybe.of(value),
                                    )
                                  : rdfjsResource.Resource.Values.fromValue<
                                      purify.Maybe<number>
                                    >({
                                      focusResource: $parameters.resource,
                                      predicate:
                                        ShaclCorePropertyShape.$schema
                                          .properties.order.identifier,
                                      value: purify.Maybe.empty(),
                                    }),
                              )
                              .chain((values) => values.head())
                              .chain((order) =>
                                purify.Either.of<
                                  Error,
                                  rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                    purify.Either.of<
                                      Error,
                                      rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
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
                                              purify.Maybe.of(value),
                                            )
                                          : rdfjsResource.Resource.Values.fromValue<
                                              purify.Maybe<boolean>
                                            >({
                                              focusResource:
                                                $parameters.resource,
                                              predicate:
                                                ShaclCorePropertyShape.$schema
                                                  .properties.uniqueLang
                                                  .identifier,
                                              value: purify.Maybe.empty(),
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

  export const $schema = {
    properties: {
      ...BaseShaclCoreShapeStatic.$schema.properties,
      defaultValue: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#defaultValue",
        ),
        kind: "ShaclProperty" as const,
        name: "defaultValue",
        type: () => ({
          item: {
            kind: "TermType" as const,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          },
          kind: "OptionType" as const,
        }),
      },
      descriptions: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#description",
        ),
        kind: "ShaclProperty" as const,
        name: "descriptions",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      groups: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
        kind: "ShaclProperty" as const,
        name: "groups",
        type: () => ({
          item: $unconstrainedIdentifierSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      names: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
        kind: "ShaclProperty" as const,
        name: "names",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      order: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
        kind: "ShaclProperty" as const,
        name: "order",
        type: () => ({
          item: $unconstrainedFloatSchema,
          kind: "OptionType" as const,
        }),
      },
      path: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
        kind: "ShaclProperty" as const,
        name: "path",
        type: () => PropertyPath.$schema,
      },
      uniqueLang: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#uniqueLang",
        ),
        kind: "ShaclProperty" as const,
        name: "uniqueLang",
        type: () => ({
          item: $unconstrainedBooleanSchema,
          kind: "OptionType" as const,
        }),
      },
    },
  } as const;

  export function $toRdf(
    _shaclCorePropertyShape: ShaclCorePropertyShape,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = BaseShaclCoreShapeStatic.$toRdf(_shaclCorePropertyShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyShape",
        ),
      );
    }

    resource.add(
      ShaclCorePropertyShape.$schema.properties.defaultValue.identifier,
      ..._shaclCorePropertyShape.defaultValue.toList(),
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.descriptions.identifier,
      ..._shaclCorePropertyShape.descriptions.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.groups.identifier,
      ..._shaclCorePropertyShape.groups.flatMap((item) => [item]),
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.names.identifier,
      ..._shaclCorePropertyShape.names.flatMap((item) => [
        dataFactory.literal(item),
      ]),
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.order.identifier,
      ..._shaclCorePropertyShape.order
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(10), $RdfVocabularies.xsd.decimal),
        ]),
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.path.identifier,
      ...[
        PropertyPath.$toRdf(_shaclCorePropertyShape.path, {
          mutateGraph: mutateGraph,
          resourceSet: resourceSet,
        }).identifier,
      ],
    );
    resource.add(
      ShaclCorePropertyShape.$schema.properties.uniqueLang.identifier,
      ..._shaclCorePropertyShape.uniqueLang
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    return resource;
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

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      context?: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, ShaclCorePropertyGroup> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return ShaclCorePropertyGroup.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyGroup",
  );
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf($parameters: {
    context?: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
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
                  return purify.Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCorePropertyGroup.$fromRdfType,
                )
              ) {
                return purify.Either.of<Error, true>(true);
              }

              return purify.Left(
                new Error(
                  `${rdfjsResource.Resource.Identifier.toString($parameters.resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
                ),
              );
            })
        : purify.Either.of<Error, true>(true)
    ).chain((_rdfTypeCheck) =>
      purify.Either.of<Error, ShaclCorePropertyGroup.$Identifier>(
        $parameters.resource.identifier as ShaclCorePropertyGroup.$Identifier,
      ).chain(($identifier) =>
        purify.Either.of<Error, "ShaclCorePropertyGroup">(
          "ShaclCorePropertyGroup",
        ).chain(($type) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
          >(
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
              rdfjsResource.Resource.Values.fromValue({
                focusResource: $parameters.resource,
                predicate:
                  ShaclCorePropertyGroup.$schema.properties.comments.identifier,
                value: valuesArray,
              }),
            )
            .chain((values) => values.head())
            .chain((comments) =>
              purify.Either.of<
                Error,
                rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
              >(
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
                  rdfjsResource.Resource.Values.fromValue({
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

  export const $schema = {
    properties: {
      $identifier: {
        identifierMintingStrategy: "blankNode" as const,
        kind: "IdentifierProperty" as const,
        name: "$identifier",
        type: () => $unconstrainedIdentifierSchema,
      },
      $type: {
        kind: "TypeDiscriminantProperty" as const,
        name: "$type",
        type: () => ({ ownValues: ["ShaclCorePropertyGroup"] }),
      },
      comments: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
        kind: "ShaclProperty" as const,
        name: "comments",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      labels: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
    },
  } as const;

  export function $toRdf(
    _shaclCorePropertyGroup: ShaclCorePropertyGroup,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(
      _shaclCorePropertyGroup.$identifier,
      { mutateGraph },
    );
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyGroup",
        ),
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
}
export interface ShaclCoreNodeShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCoreNodeShape.$Identifier;
  readonly $type: "ShaclCoreNodeShape";
  readonly closed: purify.Maybe<boolean>;
  readonly ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
  readonly properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
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
      !$filterMaybe<
        readonly rdfjs.NamedNode[],
        $CollectionFilter<$NamedNodeFilter>
      >($filterArray<rdfjs.NamedNode, $NamedNodeFilter>($filterNamedNode))(
        filter.ignoredProperties,
        value.ignoredProperties,
      )
    ) {
      return false;
    }

    if (
      typeof filter.properties !== "undefined" &&
      !$filterArray<rdfjs.BlankNode | rdfjs.NamedNode, $IdentifierFilter>(
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

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      context?: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, ShaclCoreNodeShape> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return ShaclCoreNodeShape.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );
  export type $Identifier = BaseShaclCoreShapeStatic.$Identifier;
  export const $Identifier = BaseShaclCoreShapeStatic.$Identifier;

  export function $propertiesFromRdf($parameters: {
    context?: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclCoreNodeShape";
      closed: purify.Maybe<boolean>;
      ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
      properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
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
                  return purify.Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if (
                $parameters.resource.isInstanceOf(
                  ShaclCoreNodeShape.$fromRdfType,
                )
              ) {
                return purify.Either.of<Error, true>(true);
              }

              return purify.Left(
                new Error(
                  `${rdfjsResource.Resource.Identifier.toString($parameters.resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
                ),
              );
            })
        : purify.Either.of<Error, true>(true)
      ).chain((_rdfTypeCheck) =>
        purify.Either.of<Error, ShaclCoreNodeShape.$Identifier>(
          $parameters.resource.identifier as ShaclCoreNodeShape.$Identifier,
        ).chain(($identifier) =>
          purify.Either.of<Error, "ShaclCoreNodeShape">(
            "ShaclCoreNodeShape",
          ).chain(($type) =>
            purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
            >(
              $parameters.resource.values(
                $schema.properties.closed.identifier,
                { unique: true },
              ),
            )
              .chain((values) => values.chainMap((value) => value.toBoolean()))
              .map((values) =>
                values.length > 0
                  ? values.map((value) => purify.Maybe.of(value))
                  : rdfjsResource.Resource.Values.fromValue<
                      purify.Maybe<boolean>
                    >({
                      focusResource: $parameters.resource,
                      predicate:
                        ShaclCoreNodeShape.$schema.properties.closed.identifier,
                      value: purify.Maybe.empty(),
                    }),
              )
              .chain((values) => values.head())
              .chain((closed) =>
                purify.Either.of<
                  Error,
                  rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                >(
                  $parameters.resource.values(
                    $schema.properties.ignoredProperties.identifier,
                    { unique: true },
                  ),
                )
                  .chain((values) => values.chainMap((value) => value.toList()))
                  .chain((valueLists) =>
                    valueLists.chainMap((valueList) =>
                      purify.Either.of<
                        Error,
                        rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                      >(
                        rdfjsResource.Resource.Values.fromArray({
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
                      ? values.map((value) => purify.Maybe.of(value))
                      : rdfjsResource.Resource.Values.fromValue<
                          purify.Maybe<readonly rdfjs.NamedNode[]>
                        >({
                          focusResource: $parameters.resource,
                          predicate:
                            ShaclCoreNodeShape.$schema.properties
                              .ignoredProperties.identifier,
                          value: purify.Maybe.empty(),
                        }),
                  )
                  .chain((values) => values.head())
                  .chain((ignoredProperties) =>
                    purify.Either.of<
                      Error,
                      rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
                    >(
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
                        rdfjsResource.Resource.Values.fromValue({
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

  export const $schema = {
    properties: {
      ...BaseShaclCoreShapeStatic.$schema.properties,
      closed: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
        kind: "ShaclProperty" as const,
        name: "closed",
        type: () => ({
          item: $unconstrainedBooleanSchema,
          kind: "OptionType" as const,
        }),
      },
      ignoredProperties: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#ignoredProperties",
        ),
        kind: "ShaclProperty" as const,
        name: "ignoredProperties",
        type: () => ({
          item: {
            item: $namedNodeIdentifierTypeSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "OptionType" as const,
        }),
      },
      properties: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#property",
        ),
        kind: "ShaclProperty" as const,
        name: "properties",
        type: () => ({
          item: $unconstrainedIdentifierSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
    },
  } as const;

  export function $toRdf(
    _shaclCoreNodeShape: ShaclCoreNodeShape,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = BaseShaclCoreShapeStatic.$toRdf(_shaclCoreNodeShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      );
    }

    resource.add(
      ShaclCoreNodeShape.$schema.properties.closed.identifier,
      ..._shaclCoreNodeShape.closed
        .toList()
        .flatMap((value) => [
          dataFactory.literal(value.toString(), $RdfVocabularies.xsd.boolean),
        ]),
    );
    resource.add(
      ShaclCoreNodeShape.$schema.properties.ignoredProperties.identifier,
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
                    { mutateGraph },
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
                  { mutateGraph },
                ),
              } as {
                currentSubListResource: rdfjsResource.MutableResource | null;
                listResource: rdfjsResource.MutableResource;
              },
            ).listResource.identifier
          : $RdfVocabularies.rdf.nil,
      ]),
    );
    resource.add(
      ShaclCoreNodeShape.$schema.properties.properties.identifier,
      ..._shaclCoreNodeShape.properties.flatMap((item) => [item]),
    );
    return resource;
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

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      context?: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, OwlOntology> {
    let {
      context,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return OwlOntology.$propertiesFromRdf({
      context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );
  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf($parameters: {
    context?: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
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
                  return purify.Either.of<Error, true>(true);
              }

              // Check arbitrary rdfs:subClassOf's of the expected type
              if ($parameters.resource.isInstanceOf(OwlOntology.$fromRdfType)) {
                return purify.Either.of<Error, true>(true);
              }

              return purify.Left(
                new Error(
                  `${rdfjsResource.Resource.Identifier.toString($parameters.resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
                ),
              );
            })
        : purify.Either.of<Error, true>(true)
    ).chain((_rdfTypeCheck) =>
      purify.Either.of<Error, OwlOntology.$Identifier>(
        $parameters.resource.identifier as OwlOntology.$Identifier,
      ).chain(($identifier) =>
        purify.Either.of<Error, "OwlOntology">("OwlOntology").chain(($type) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
          >(
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
              rdfjsResource.Resource.Values.fromValue({
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

  export const $schema = {
    properties: {
      $identifier: {
        identifierMintingStrategy: "blankNode" as const,
        kind: "IdentifierProperty" as const,
        name: "$identifier",
        type: () => $unconstrainedIdentifierSchema,
      },
      $type: {
        kind: "TypeDiscriminantProperty" as const,
        name: "$type",
        type: () => ({ ownValues: ["OwlOntology"] }),
      },
      labels: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
    },
  } as const;

  export function $toRdf(
    _owlOntology: OwlOntology,
    options?: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const ignoreRdfType = !!options?.ignoreRdfType;
    const mutateGraph = options?.mutateGraph;
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
    const resource = resourceSet.mutableResource(_owlOntology.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode(
          "http://www.w3.org/2002/07/owl#Ontology",
        ),
      );
    }

    resource.add(
      OwlOntology.$schema.properties.labels.identifier,
      ..._owlOntology.labels.flatMap((item) => [dataFactory.literal(item)]),
    );
    return resource;
  }

  export function isOwlOntology(object: $Object): object is OwlOntology {
    switch (object.$type) {
      case "OwlOntology":
        return true;
      default:
        return false;
    }
  }
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

  export type $Filter = {
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
  };

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, ShaclCoreShape> {
    return (
      ShaclCoreNodeShape.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as purify.Either<Error, ShaclCoreShape>
    ).altLazy(
      () =>
        ShaclCorePropertyShape.$fromRdf(resource, {
          ...options,
          ignoreRdfType: false,
        }) as purify.Either<Error, ShaclCoreShape>,
    );
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export const $schema = {
    properties: {
      and: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
        kind: "ShaclProperty" as const,
        name: "and",
        type: () => ({
          item: {
            item: $unconstrainedIdentifierSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      classes: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
        kind: "ShaclProperty" as const,
        name: "classes",
        type: () => ({
          item: $namedNodeIdentifierTypeSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      comments: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#comment",
        ),
        kind: "ShaclProperty" as const,
        name: "comments",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      datatype: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#datatype",
        ),
        kind: "ShaclProperty" as const,
        name: "datatype",
        type: () => ({
          item: $namedNodeIdentifierTypeSchema,
          kind: "OptionType" as const,
        }),
      },
      deactivated: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#deactivated",
        ),
        kind: "ShaclProperty" as const,
        name: "deactivated",
        type: () => ({
          item: $unconstrainedBooleanSchema,
          kind: "OptionType" as const,
        }),
      },
      flags: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
        kind: "ShaclProperty" as const,
        name: "flags",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      hasValues: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#hasValue",
        ),
        kind: "ShaclProperty" as const,
        name: "hasValues",
        type: () => ({
          item: {
            kind: "TermType" as const,
            nodeKinds: ["Literal" as const, "NamedNode" as const],
          },
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      in_: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
        kind: "ShaclProperty" as const,
        name: "in_",
        type: () => ({
          item: {
            item: {
              kind: "TermType" as const,
              nodeKinds: ["Literal" as const, "NamedNode" as const],
            },
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "OptionType" as const,
        }),
      },
      isDefinedBy: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
        ),
        kind: "ShaclProperty" as const,
        name: "isDefinedBy",
        type: () => ({
          item: $unconstrainedIdentifierSchema,
          kind: "OptionType" as const,
        }),
      },
      labels: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      languageIn: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#languageIn",
        ),
        kind: "ShaclProperty" as const,
        name: "languageIn",
        type: () => ({
          item: {
            item: $unconstrainedStringSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "OptionType" as const,
        }),
      },
      maxCount: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxCount",
        ),
        kind: "ShaclProperty" as const,
        name: "maxCount",
        type: () => ({
          item: $unconstrainedIntSchema,
          kind: "OptionType" as const,
        }),
      },
      maxExclusive: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxExclusive",
        ),
        kind: "ShaclProperty" as const,
        name: "maxExclusive",
        type: () => ({
          item: $unconstrainedLiteralSchema,
          kind: "OptionType" as const,
        }),
      },
      maxInclusive: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxInclusive",
        ),
        kind: "ShaclProperty" as const,
        name: "maxInclusive",
        type: () => ({
          item: $unconstrainedLiteralSchema,
          kind: "OptionType" as const,
        }),
      },
      maxLength: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#maxLength",
        ),
        kind: "ShaclProperty" as const,
        name: "maxLength",
        type: () => ({
          item: $unconstrainedIntSchema,
          kind: "OptionType" as const,
        }),
      },
      minCount: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minCount",
        ),
        kind: "ShaclProperty" as const,
        name: "minCount",
        type: () => ({
          item: $unconstrainedIntSchema,
          kind: "OptionType" as const,
        }),
      },
      minExclusive: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minExclusive",
        ),
        kind: "ShaclProperty" as const,
        name: "minExclusive",
        type: () => ({
          item: $unconstrainedLiteralSchema,
          kind: "OptionType" as const,
        }),
      },
      minInclusive: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minInclusive",
        ),
        kind: "ShaclProperty" as const,
        name: "minInclusive",
        type: () => ({
          item: $unconstrainedLiteralSchema,
          kind: "OptionType" as const,
        }),
      },
      minLength: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#minLength",
        ),
        kind: "ShaclProperty" as const,
        name: "minLength",
        type: () => ({
          item: $unconstrainedIntSchema,
          kind: "OptionType" as const,
        }),
      },
      nodeKind: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#nodeKind",
        ),
        kind: "ShaclProperty" as const,
        name: "nodeKind",
        type: () => ({
          item: {
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
            kind: "NamedNodeType" as const,
          },
          kind: "OptionType" as const,
        }),
      },
      nodes: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
        kind: "ShaclProperty" as const,
        name: "nodes",
        type: () => ({
          item: $unconstrainedIdentifierSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      not: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
        kind: "ShaclProperty" as const,
        name: "not",
        type: () => ({
          item: $unconstrainedIdentifierSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      or: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
        kind: "ShaclProperty" as const,
        name: "or",
        type: () => ({
          item: {
            item: $unconstrainedIdentifierSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      patterns: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
        kind: "ShaclProperty" as const,
        name: "patterns",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
      xone: {
        identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
        kind: "ShaclProperty" as const,
        name: "xone",
        type: () => ({
          item: {
            item: $unconstrainedIdentifierSchema,
            kind: "ListType" as const,
            minCount: 0,
          },
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
    },
  } as const;

  export function $toRdf(
    _shaclCoreShape: ShaclCoreShape,
    _parameters?: {
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    if (ShaclCoreNodeShape.isShaclCoreNodeShape(_shaclCoreShape)) {
      return ShaclCoreNodeShape.$toRdf(_shaclCoreShape, _parameters);
    }

    if (ShaclCorePropertyShape.isShaclCorePropertyShape(_shaclCoreShape)) {
      return ShaclCorePropertyShape.$toRdf(_shaclCoreShape, _parameters);
    }

    throw new Error("unrecognized type");
  }

  export function isShaclCoreShape(object: $Object): object is ShaclCoreShape {
    return (
      ShaclCoreNodeShape.isShaclCoreNodeShape(object) ||
      ShaclCorePropertyShape.isShaclCorePropertyShape(object)
    );
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

  export type $Filter = {
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
  };

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, $Object> {
    return (
      OwlOntology.$fromRdf(resource, {
        ...options,
        ignoreRdfType: false,
      }) as purify.Either<Error, $Object>
    )
      .altLazy(
        () =>
          ShaclCoreNodeShape.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as purify.Either<Error, $Object>,
      )
      .altLazy(
        () =>
          ShaclCorePropertyGroup.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as purify.Either<Error, $Object>,
      )
      .altLazy(
        () =>
          ShaclCorePropertyShape.$fromRdf(resource, {
            ...options,
            ignoreRdfType: false,
          }) as purify.Either<Error, $Object>,
      );
  }

  export type $Identifier = rdfjs.BlankNode | rdfjs.NamedNode;

  export namespace $Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, rdfjsResource.Resource.Identifier> {
      return purify.Either.encase(() =>
        rdfjsResource.Resource.Identifier.fromString({
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames: allow toString
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export const $schema = {
    properties: {
      labels: {
        identifier: dataFactory.namedNode(
          "http://www.w3.org/2000/01/rdf-schema#label",
        ),
        kind: "ShaclProperty" as const,
        name: "labels",
        type: () => ({
          item: $unconstrainedStringSchema,
          kind: "SetType" as const,
          minCount: 0,
        }),
      },
    },
  } as const;

  export function $toRdf(
    _object: $Object,
    _parameters?: {
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
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
  ): Promise<purify.Either<Error, OwlOntology>>;
  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Filter>,
  ): Promise<purify.Either<Error, readonly OwlOntology.$Identifier[]>>;
  owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Filter>,
  ): Promise<purify.Either<Error, readonly OwlOntology[]>>;
  owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntology.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>>;
  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>>;
  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>>;
  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape[]>>;
  shaclCoreNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>>;
  shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyGroup>>;
  shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>
  >;
  shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyGroup[]>>;
  shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>>;
  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>>;
  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Filter>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShape.$Identifier[]>
  >;
  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyShape[]>>;
  shaclCorePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>>;
  shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreShape>>;
  shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.$Identifier[]>>;
  shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape[]>>;
  shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>>;
  object(
    identifier: $Object.$Identifier,
  ): Promise<purify.Either<Error, $Object>>;
  objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<purify.Either<Error, readonly $Object.$Identifier[]>>;
  objects(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<purify.Either<Error, readonly $Object[]>>;
  objectsCount(
    query?: Pick<$ObjectSet.Query<$Object.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>>;
}

export namespace $ObjectSet {
  export type Query<
    ObjectFilterT extends {
      readonly $identifier?: {
        readonly in?: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
      };
    },
  > = {
    readonly filter?: ObjectFilterT;
    readonly limit?: number;
    readonly offset?: number;
  };
}

export abstract class $ForwardingObjectSet implements $ObjectSet {
  protected abstract get $delegate(): $ObjectSet;

  owlOntology(
    identifier: OwlOntology.$Identifier,
  ): Promise<purify.Either<Error, OwlOntology>> {
    return this.$delegate.owlOntology(identifier);
  }

  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Filter>,
  ): Promise<purify.Either<Error, readonly OwlOntology.$Identifier[]>> {
    return this.$delegate.owlOntologyIdentifiers(query);
  }

  owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Filter>,
  ): Promise<purify.Either<Error, readonly OwlOntology[]>> {
    return this.$delegate.owlOntologies(query);
  }

  owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntology.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.owlOntologiesCount(query);
  }

  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>> {
    return this.$delegate.shaclCoreNodeShape(identifier);
  }

  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>> {
    return this.$delegate.shaclCoreNodeShapeIdentifiers(query);
  }

  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape[]>> {
    return this.$delegate.shaclCoreNodeShapes(query);
  }

  shaclCoreNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.shaclCoreNodeShapesCount(query);
  }

  shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyGroup>> {
    return this.$delegate.shaclCorePropertyGroup(identifier);
  }

  shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>
  > {
    return this.$delegate.shaclCorePropertyGroupIdentifiers(query);
  }

  shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyGroup[]>> {
    return this.$delegate.shaclCorePropertyGroups(query);
  }

  shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.shaclCorePropertyGroupsCount(query);
  }

  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>> {
    return this.$delegate.shaclCorePropertyShape(identifier);
  }

  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Filter>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShape.$Identifier[]>
  > {
    return this.$delegate.shaclCorePropertyShapeIdentifiers(query);
  }

  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyShape[]>> {
    return this.$delegate.shaclCorePropertyShapes(query);
  }

  shaclCorePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.shaclCorePropertyShapesCount(query);
  }

  shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreShape>> {
    return this.$delegate.shaclCoreShape(identifier);
  }

  shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.$Identifier[]>> {
    return this.$delegate.shaclCoreShapeIdentifiers(query);
  }

  shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape[]>> {
    return this.$delegate.shaclCoreShapes(query);
  }

  shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.shaclCoreShapesCount(query);
  }

  object(
    identifier: $Object.$Identifier,
  ): Promise<purify.Either<Error, $Object>> {
    return this.$delegate.object(identifier);
  }

  objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<purify.Either<Error, readonly $Object.$Identifier[]>> {
    return this.$delegate.objectIdentifiers(query);
  }

  objects(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<purify.Either<Error, readonly $Object[]>> {
    return this.$delegate.objects(query);
  }

  objectsCount(
    query?: Pick<$ObjectSet.Query<$Object.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.objectsCount(query);
  }
}

export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly resourceSet: rdfjsResource.ResourceSet;

  constructor({ dataset }: { dataset: rdfjs.DatasetCore }) {
    this.resourceSet = new rdfjsResource.ResourceSet({ dataset });
  }

  async owlOntology(
    identifier: OwlOntology.$Identifier,
  ): Promise<purify.Either<Error, OwlOntology>> {
    return this.owlOntologySync(identifier);
  }

  owlOntologySync(
    identifier: OwlOntology.$Identifier,
  ): purify.Either<Error, OwlOntology> {
    return this.owlOntologiesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }

  async owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Filter>,
  ): Promise<purify.Either<Error, readonly OwlOntology.$Identifier[]>> {
    return this.owlOntologyIdentifiersSync(query);
  }

  owlOntologyIdentifiersSync(
    query?: $ObjectSet.Query<OwlOntology.$Filter>,
  ): purify.Either<Error, readonly OwlOntology.$Identifier[]> {
    return this.owlOntologiesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Filter>,
  ): Promise<purify.Either<Error, readonly OwlOntology[]>> {
    return this.owlOntologiesSync(query);
  }

  async owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntology.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.owlOntologiesCountSync(query);
  }

  owlOntologiesCountSync(
    query?: Pick<$ObjectSet.Query<OwlOntology.$Filter>, "filter">,
  ): purify.Either<Error, number> {
    return this.owlOntologiesSync(query).map((objects) => objects.length);
  }

  owlOntologiesSync(
    query?: $ObjectSet.Query<OwlOntology.$Filter>,
  ): purify.Either<Error, readonly OwlOntology[]> {
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
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>> {
    return this.shaclCoreNodeShapeSync(identifier);
  }

  shaclCoreNodeShapeSync(
    identifier: ShaclCoreNodeShape.$Identifier,
  ): purify.Either<Error, ShaclCoreNodeShape> {
    return this.shaclCoreNodeShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }

  async shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>> {
    return this.shaclCoreNodeShapeIdentifiersSync(query);
  }

  shaclCoreNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Filter>,
  ): purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]> {
    return this.shaclCoreNodeShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape[]>> {
    return this.shaclCoreNodeShapesSync(query);
  }

  async shaclCoreNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCoreNodeShapesCountSync(query);
  }

  shaclCoreNodeShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShape.$Filter>, "filter">,
  ): purify.Either<Error, number> {
    return this.shaclCoreNodeShapesSync(query).map((objects) => objects.length);
  }

  shaclCoreNodeShapesSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Filter>,
  ): purify.Either<Error, readonly ShaclCoreNodeShape[]> {
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
  ): Promise<purify.Either<Error, ShaclCorePropertyGroup>> {
    return this.shaclCorePropertyGroupSync(identifier);
  }

  shaclCorePropertyGroupSync(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): purify.Either<Error, ShaclCorePropertyGroup> {
    return this.shaclCorePropertyGroupsSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }

  async shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>
  > {
    return this.shaclCorePropertyGroupIdentifiersSync(query);
  }

  shaclCorePropertyGroupIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): purify.Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]> {
    return this.shaclCorePropertyGroupsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyGroup[]>> {
    return this.shaclCorePropertyGroupsSync(query);
  }

  async shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCorePropertyGroupsCountSync(query);
  }

  shaclCorePropertyGroupsCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Filter>, "filter">,
  ): purify.Either<Error, number> {
    return this.shaclCorePropertyGroupsSync(query).map(
      (objects) => objects.length,
    );
  }

  shaclCorePropertyGroupsSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Filter>,
  ): purify.Either<Error, readonly ShaclCorePropertyGroup[]> {
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
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>> {
    return this.shaclCorePropertyShapeSync(identifier);
  }

  shaclCorePropertyShapeSync(
    identifier: ShaclCorePropertyShape.$Identifier,
  ): purify.Either<Error, ShaclCorePropertyShape> {
    return this.shaclCorePropertyShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }

  async shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Filter>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShape.$Identifier[]>
  > {
    return this.shaclCorePropertyShapeIdentifiersSync(query);
  }

  shaclCorePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Filter>,
  ): purify.Either<Error, readonly ShaclCorePropertyShape.$Identifier[]> {
    return this.shaclCorePropertyShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyShape[]>> {
    return this.shaclCorePropertyShapesSync(query);
  }

  async shaclCorePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCorePropertyShapesCountSync(query);
  }

  shaclCorePropertyShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyShape.$Filter>, "filter">,
  ): purify.Either<Error, number> {
    return this.shaclCorePropertyShapesSync(query).map(
      (objects) => objects.length,
    );
  }

  shaclCorePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Filter>,
  ): purify.Either<Error, readonly ShaclCorePropertyShape[]> {
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
  ): Promise<purify.Either<Error, ShaclCoreShape>> {
    return this.shaclCoreShapeSync(identifier);
  }

  shaclCoreShapeSync(
    identifier: ShaclCoreShape.$Identifier,
  ): purify.Either<Error, ShaclCoreShape> {
    return this.shaclCoreShapesSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }

  async shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.$Identifier[]>> {
    return this.shaclCoreShapeIdentifiersSync(query);
  }

  shaclCoreShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): purify.Either<Error, readonly ShaclCoreShape.$Identifier[]> {
    return this.shaclCoreShapesSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape[]>> {
    return this.shaclCoreShapesSync(query);
  }

  async shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCoreShapesCountSync(query);
  }

  shaclCoreShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Filter>, "filter">,
  ): purify.Either<Error, number> {
    return this.shaclCoreShapesSync(query).map((objects) => objects.length);
  }

  shaclCoreShapesSync(
    query?: $ObjectSet.Query<ShaclCoreShape.$Filter>,
  ): purify.Either<Error, readonly ShaclCoreShape[]> {
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
  ): Promise<purify.Either<Error, $Object>> {
    return this.objectSync(identifier);
  }

  objectSync(identifier: $Object.$Identifier): purify.Either<Error, $Object> {
    return this.objectsSync({
      filter: { $identifier: { in: [identifier] } },
    }).map((objects) => objects[0]);
  }

  async objectIdentifiers(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<purify.Either<Error, readonly $Object.$Identifier[]>> {
    return this.objectIdentifiersSync(query);
  }

  objectIdentifiersSync(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): purify.Either<Error, readonly $Object.$Identifier[]> {
    return this.objectsSync(query).map((objects) =>
      objects.map((object) => object.$identifier),
    );
  }

  async objects(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): Promise<purify.Either<Error, readonly $Object[]>> {
    return this.objectsSync(query);
  }

  async objectsCount(
    query?: Pick<$ObjectSet.Query<$Object.$Filter>, "filter">,
  ): Promise<purify.Either<Error, number>> {
    return this.objectsCountSync(query);
  }

  objectsCountSync(
    query?: Pick<$ObjectSet.Query<$Object.$Filter>, "filter">,
  ): purify.Either<Error, number> {
    return this.objectsSync(query).map((objects) => objects.length);
  }

  objectsSync(
    query?: $ObjectSet.Query<$Object.$Filter>,
  ): purify.Either<Error, readonly $Object[]> {
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
    ObjectFilterT extends {
      readonly $identifier?: {
        readonly in?: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
      };
    },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    },
    query?: $ObjectSet.Query<ObjectFilterT>,
  ): purify.Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    let resources: { object?: ObjectT; resource: rdfjsResource.Resource }[];
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
          return purify.Either.of(objects);
        }
      }
    }
    return purify.Either.of(objects);
  }

  protected $objectUnionsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectFilterT extends {
      readonly $identifier?: {
        readonly in?: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
      };
    },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $filter: (filter: ObjectFilterT, value: ObjectT) => boolean;
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectFilterT>,
  ): purify.Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
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
          resource: rdfjsResource.Resource,
          options: { objectSet: $ObjectSet },
        ) => purify.Either<Error, ObjectT>;
        $fromRdfTypes: readonly rdfjs.NamedNode[];
      };
      resource: rdfjsResource.Resource;
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
        let objectEither: purify.Either<Error, ObjectT>;
        if (objectType) {
          objectEither = objectType.$fromRdf(resource, { objectSet: this });
        } else {
          objectEither = purify.Left(new Error("no object types"));
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
          return purify.Either.of(objects);
        }
      }
    }
    return purify.Either.of(objects);
  }
}

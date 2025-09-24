import type * as rdfjs from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
import { PropertyPath } from "./PropertyPath.js";
export namespace $RdfVocabularies {
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
    export const integer = dataFactory.namedNode(
      "http://www.w3.org/2001/XMLSchema#integer",
    );
  }
}
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
export interface BaseShaclCoreShape {
  readonly $identifier: BaseShaclCoreShapeStatic.$Identifier;
  readonly $type:
    | "ShaclCoreNodeShape"
    | "ShaclCorePropertyShape"
    | "ShaclmateNodeShape"
    | "ShaclmatePropertyShape";
  readonly and: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
  readonly classes: readonly rdfjs.NamedNode[];
  readonly comments: readonly rdfjs.Literal[];
  readonly datatype: purify.Maybe<rdfjs.NamedNode>;
  readonly deactivated: purify.Maybe<boolean>;
  readonly flags: readonly string[];
  readonly hasValues: readonly (rdfjs.Literal | rdfjs.NamedNode)[];
  readonly in_: purify.Maybe<readonly (rdfjs.Literal | rdfjs.NamedNode)[]>;
  readonly isDefinedBy: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
  readonly labels: readonly rdfjs.Literal[];
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

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    languageIn: $languageIn,
    objectSet: $objectSetParameter,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      and: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
      classes: readonly rdfjs.NamedNode[];
      comments: readonly rdfjs.Literal[];
      datatype: purify.Maybe<rdfjs.NamedNode>;
      deactivated: purify.Maybe<boolean>;
      flags: readonly string[];
      hasValues: readonly (rdfjs.Literal | rdfjs.NamedNode)[];
      in_: purify.Maybe<readonly (rdfjs.Literal | rdfjs.NamedNode)[]>;
      isDefinedBy: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
      labels: readonly rdfjs.Literal[];
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
    const $identifier: BaseShaclCoreShapeStatic.$Identifier =
      $resource.identifier;
    const _andEither: purify.Either<
      Error,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.sequence(
      $resource
        .values($properties.and["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) => value.toList())
            .chain((values) =>
              purify.Either.sequence(
                values.map((value) =>
                  value
                    .toValues()
                    .head()
                    .chain((value) => value.toIdentifier()),
                ),
              ),
            ),
        ),
    );
    if (_andEither.isLeft()) {
      return _andEither;
    }

    const and = _andEither.unsafeCoerce();
    const _classesEither: purify.Either<Error, readonly rdfjs.NamedNode[]> =
      purify.Either.sequence(
        $resource
          .values($properties.classes["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .head()
              .chain((value) => value.toIri()),
          ),
      );
    if (_classesEither.isLeft()) {
      return _classesEither;
    }

    const classes = _classesEither.unsafeCoerce();
    const _commentsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        $resource
          .values($properties.comments["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = $languageIn ?? [];
                if (_languageInOrDefault.length === 0) {
                  return true;
                }
                const _valueLiteral = _value.toLiteral().toMaybe().extract();
                if (typeof _valueLiteral === "undefined") {
                  return false;
                }
                return _languageInOrDefault.some(
                  (_languageIn) => _languageIn === _valueLiteral.language,
                );
              })
              .head()
              .chain((value) => value.toLiteral()),
          ),
      );
    if (_commentsEither.isLeft()) {
      return _commentsEither;
    }

    const comments = _commentsEither.unsafeCoerce();
    const _datatypeEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.NamedNode>
    > = $resource
      .values($properties.datatype["identifier"], { unique: true })
      .head()
      .chain((value) => value.toIri())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_datatypeEither.isLeft()) {
      return _datatypeEither;
    }

    const datatype = _datatypeEither.unsafeCoerce();
    const _deactivatedEither: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = $resource
      .values($properties.deactivated["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_deactivatedEither.isLeft()) {
      return _deactivatedEither;
    }

    const deactivated = _deactivatedEither.unsafeCoerce();
    const _flagsEither: purify.Either<Error, readonly string[]> =
      purify.Either.sequence(
        $resource
          .values($properties.flags["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .head()
              .chain((value) => value.toString()),
          ),
      );
    if (_flagsEither.isLeft()) {
      return _flagsEither;
    }

    const flags = _flagsEither.unsafeCoerce();
    const _hasValuesEither: purify.Either<
      Error,
      readonly (rdfjs.Literal | rdfjs.NamedNode)[]
    > = purify.Either.sequence(
      $resource
        .values($properties.hasValues["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) =>
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
                    return purify.Left<Error, rdfjs.Literal | rdfjs.NamedNode>(
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: term,
                        expectedValueType: "(rdfjs.Literal | rdfjs.NamedNode)",
                        focusResource: $resource,
                        predicate:
                          BaseShaclCoreShapeStatic.$properties.hasValues[
                            "identifier"
                          ],
                      }),
                    );
                }
              }),
            ),
        ),
    );
    if (_hasValuesEither.isLeft()) {
      return _hasValuesEither;
    }

    const hasValues = _hasValuesEither.unsafeCoerce();
    const _in_Either: purify.Either<
      Error,
      purify.Maybe<readonly (rdfjs.Literal | rdfjs.NamedNode)[]>
    > = $resource
      .values($properties.in_["identifier"], { unique: true })
      .head()
      .chain((value) => value.toList())
      .chain((values) =>
        purify.Either.sequence(
          values.map((value) =>
            value
              .toValues()
              .head()
              .chain((value) =>
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
                        new rdfjsResource.Resource.MistypedValueError({
                          actualValue: term,
                          expectedValueType:
                            "(rdfjs.Literal | rdfjs.NamedNode)",
                          focusResource: $resource,
                          predicate:
                            BaseShaclCoreShapeStatic.$properties.in_[
                              "identifier"
                            ],
                        }),
                      );
                  }
                }),
              ),
          ),
        ),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_in_Either.isLeft()) {
      return _in_Either;
    }

    const in_ = _in_Either.unsafeCoerce();
    const _isDefinedByEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
    > = $resource
      .values($properties.isDefinedBy["identifier"], { unique: true })
      .head()
      .chain((value) => value.toIdentifier())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_isDefinedByEither.isLeft()) {
      return _isDefinedByEither;
    }

    const isDefinedBy = _isDefinedByEither.unsafeCoerce();
    const _labelsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        $resource
          .values($properties.labels["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = $languageIn ?? [];
                if (_languageInOrDefault.length === 0) {
                  return true;
                }
                const _valueLiteral = _value.toLiteral().toMaybe().extract();
                if (typeof _valueLiteral === "undefined") {
                  return false;
                }
                return _languageInOrDefault.some(
                  (_languageIn) => _languageIn === _valueLiteral.language,
                );
              })
              .head()
              .chain((value) => value.toLiteral()),
          ),
      );
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    const _languageInEither: purify.Either<
      Error,
      purify.Maybe<readonly string[]>
    > = $resource
      .values($properties.languageIn["identifier"], { unique: true })
      .head()
      .chain((value) => value.toList())
      .chain((values) =>
        purify.Either.sequence(
          values.map((value) =>
            value
              .toValues()
              .head()
              .chain((value) => value.toString()),
          ),
        ),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_languageInEither.isLeft()) {
      return _languageInEither;
    }

    const languageIn = _languageInEither.unsafeCoerce();
    const _maxCountEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = $resource
      .values($properties.maxCount["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_maxCountEither.isLeft()) {
      return _maxCountEither;
    }

    const maxCount = _maxCountEither.unsafeCoerce();
    const _maxExclusiveEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal>
    > = $resource
      .values($properties.maxExclusive["identifier"], { unique: true })
      .filter((_value) => {
        const _languageInOrDefault = $languageIn ?? [];
        if (_languageInOrDefault.length === 0) {
          return true;
        }
        const _valueLiteral = _value.toLiteral().toMaybe().extract();
        if (typeof _valueLiteral === "undefined") {
          return false;
        }
        return _languageInOrDefault.some(
          (_languageIn) => _languageIn === _valueLiteral.language,
        );
      })
      .head()
      .chain((value) => value.toLiteral())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_maxExclusiveEither.isLeft()) {
      return _maxExclusiveEither;
    }

    const maxExclusive = _maxExclusiveEither.unsafeCoerce();
    const _maxInclusiveEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal>
    > = $resource
      .values($properties.maxInclusive["identifier"], { unique: true })
      .filter((_value) => {
        const _languageInOrDefault = $languageIn ?? [];
        if (_languageInOrDefault.length === 0) {
          return true;
        }
        const _valueLiteral = _value.toLiteral().toMaybe().extract();
        if (typeof _valueLiteral === "undefined") {
          return false;
        }
        return _languageInOrDefault.some(
          (_languageIn) => _languageIn === _valueLiteral.language,
        );
      })
      .head()
      .chain((value) => value.toLiteral())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_maxInclusiveEither.isLeft()) {
      return _maxInclusiveEither;
    }

    const maxInclusive = _maxInclusiveEither.unsafeCoerce();
    const _maxLengthEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = $resource
      .values($properties.maxLength["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_maxLengthEither.isLeft()) {
      return _maxLengthEither;
    }

    const maxLength = _maxLengthEither.unsafeCoerce();
    const _minCountEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = $resource
      .values($properties.minCount["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_minCountEither.isLeft()) {
      return _minCountEither;
    }

    const minCount = _minCountEither.unsafeCoerce();
    const _minExclusiveEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal>
    > = $resource
      .values($properties.minExclusive["identifier"], { unique: true })
      .filter((_value) => {
        const _languageInOrDefault = $languageIn ?? [];
        if (_languageInOrDefault.length === 0) {
          return true;
        }
        const _valueLiteral = _value.toLiteral().toMaybe().extract();
        if (typeof _valueLiteral === "undefined") {
          return false;
        }
        return _languageInOrDefault.some(
          (_languageIn) => _languageIn === _valueLiteral.language,
        );
      })
      .head()
      .chain((value) => value.toLiteral())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_minExclusiveEither.isLeft()) {
      return _minExclusiveEither;
    }

    const minExclusive = _minExclusiveEither.unsafeCoerce();
    const _minInclusiveEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal>
    > = $resource
      .values($properties.minInclusive["identifier"], { unique: true })
      .filter((_value) => {
        const _languageInOrDefault = $languageIn ?? [];
        if (_languageInOrDefault.length === 0) {
          return true;
        }
        const _valueLiteral = _value.toLiteral().toMaybe().extract();
        if (typeof _valueLiteral === "undefined") {
          return false;
        }
        return _languageInOrDefault.some(
          (_languageIn) => _languageIn === _valueLiteral.language,
        );
      })
      .head()
      .chain((value) => value.toLiteral())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_minInclusiveEither.isLeft()) {
      return _minInclusiveEither;
    }

    const minInclusive = _minInclusiveEither.unsafeCoerce();
    const _minLengthEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = $resource
      .values($properties.minLength["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_minLengthEither.isLeft()) {
      return _minLengthEither;
    }

    const minLength = _minLengthEither.unsafeCoerce();
    const _nodeKindEither: purify.Either<
      Error,
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
    > = $resource
      .values($properties.nodeKind["identifier"], { unique: true })
      .head()
      .chain((value) =>
        value.toIri().chain((iri) => {
          switch (iri.value) {
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
              >(iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#BlankNode">);
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
              >(iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#IRI">);
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
              >(iri as rdfjs.NamedNode<"http://www.w3.org/ns/shacl#Literal">);
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
                new rdfjsResource.Resource.MistypedValueError({
                  actualValue: iri,
                  expectedValueType:
                    'rdfjs.NamedNode<"http://www.w3.org/ns/shacl#BlankNode" | "http://www.w3.org/ns/shacl#BlankNodeOrIRI" | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral" | "http://www.w3.org/ns/shacl#IRI" | "http://www.w3.org/ns/shacl#IRIOrLiteral" | "http://www.w3.org/ns/shacl#Literal">',
                  focusResource: $resource,
                  predicate:
                    BaseShaclCoreShapeStatic.$properties.nodeKind["identifier"],
                }),
              );
          }
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_nodeKindEither.isLeft()) {
      return _nodeKindEither;
    }

    const nodeKind = _nodeKindEither.unsafeCoerce();
    const _nodesEither: purify.Either<
      Error,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.sequence(
      $resource
        .values($properties.nodes["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) => value.toIdentifier()),
        ),
    );
    if (_nodesEither.isLeft()) {
      return _nodesEither;
    }

    const nodes = _nodesEither.unsafeCoerce();
    const _notEither: purify.Either<
      Error,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.sequence(
      $resource
        .values($properties.not["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) => value.toIdentifier()),
        ),
    );
    if (_notEither.isLeft()) {
      return _notEither;
    }

    const not = _notEither.unsafeCoerce();
    const _orEither: purify.Either<
      Error,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.sequence(
      $resource
        .values($properties.or["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) => value.toList())
            .chain((values) =>
              purify.Either.sequence(
                values.map((value) =>
                  value
                    .toValues()
                    .head()
                    .chain((value) => value.toIdentifier()),
                ),
              ),
            ),
        ),
    );
    if (_orEither.isLeft()) {
      return _orEither;
    }

    const or = _orEither.unsafeCoerce();
    const _patternsEither: purify.Either<Error, readonly string[]> =
      purify.Either.sequence(
        $resource
          .values($properties.patterns["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .head()
              .chain((value) => value.toString()),
          ),
      );
    if (_patternsEither.isLeft()) {
      return _patternsEither;
    }

    const patterns = _patternsEither.unsafeCoerce();
    const _xoneEither: purify.Either<
      Error,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.sequence(
      $resource
        .values($properties.xone["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) => value.toList())
            .chain((values) =>
              purify.Either.sequence(
                values.map((value) =>
                  value
                    .toValues()
                    .head()
                    .chain((value) => value.toIdentifier()),
                ),
              ),
            ),
        ),
    );
    if (_xoneEither.isLeft()) {
      return _xoneEither;
    }

    const xone = _xoneEither.unsafeCoerce();
    return purify.Either.of({
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
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof BaseShaclCoreShapeStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<Error, BaseShaclCoreShape> {
    const { ignoreRdfType: _, ...otherParameters } = parameters;
    return (
      ShaclCoreNodeShapeStatic.$fromRdf(otherParameters) as purify.Either<
        Error,
        BaseShaclCoreShape
      >
    ).altLazy(
      () =>
        ShaclCorePropertyShapeStatic.$fromRdf(otherParameters) as purify.Either<
          Error,
          BaseShaclCoreShape
        >,
    );
  }

  export function $toRdf(
    _baseShaclCoreShape: BaseShaclCoreShape,
    {
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(
      _baseShaclCoreShape.$identifier,
      { mutateGraph },
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.and["identifier"],
      _baseShaclCoreShape.and.map((item) =>
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

                currentSubListResource.add($RdfVocabularies.rdf.first, item);

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
      ),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.classes["identifier"],
      _baseShaclCoreShape.classes.map((item) => item),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.comments["identifier"],
      _baseShaclCoreShape.comments.map((item) => item),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.datatype["identifier"],
      _baseShaclCoreShape.datatype,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.deactivated["identifier"],
      _baseShaclCoreShape.deactivated,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.flags["identifier"],
      _baseShaclCoreShape.flags.map((item) => item),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.hasValues["identifier"],
      _baseShaclCoreShape.hasValues.map((item) => item),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.in_["identifier"],
      _baseShaclCoreShape.in_.map((value) =>
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

                currentSubListResource.add($RdfVocabularies.rdf.first, item);

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
      ),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.isDefinedBy["identifier"],
      _baseShaclCoreShape.isDefinedBy,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.labels["identifier"],
      _baseShaclCoreShape.labels.map((item) => item),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.languageIn["identifier"],
      _baseShaclCoreShape.languageIn.map((value) =>
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

                currentSubListResource.add($RdfVocabularies.rdf.first, item);

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
      ),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.maxCount["identifier"],
      _baseShaclCoreShape.maxCount,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.maxExclusive["identifier"],
      _baseShaclCoreShape.maxExclusive,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.maxInclusive["identifier"],
      _baseShaclCoreShape.maxInclusive,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.maxLength["identifier"],
      _baseShaclCoreShape.maxLength,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.minCount["identifier"],
      _baseShaclCoreShape.minCount,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.minExclusive["identifier"],
      _baseShaclCoreShape.minExclusive,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.minInclusive["identifier"],
      _baseShaclCoreShape.minInclusive,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.minLength["identifier"],
      _baseShaclCoreShape.minLength,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.nodeKind["identifier"],
      _baseShaclCoreShape.nodeKind,
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.nodes["identifier"],
      _baseShaclCoreShape.nodes.map((item) => item),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.not["identifier"],
      _baseShaclCoreShape.not.map((item) => item),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.or["identifier"],
      _baseShaclCoreShape.or.map((item) =>
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

                currentSubListResource.add($RdfVocabularies.rdf.first, item);

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
      ),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.patterns["identifier"],
      _baseShaclCoreShape.patterns.map((item) => item),
    );
    _resource.add(
      BaseShaclCoreShapeStatic.$properties.xone["identifier"],
      _baseShaclCoreShape.xone.map((item) =>
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

                currentSubListResource.add($RdfVocabularies.rdf.first, item);

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
      ),
    );
    return _resource;
  }

  export const $properties = {
    and: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
    },
    classes: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
    },
    comments: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#comment",
      ),
    },
    datatype: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
    },
    deactivated: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#deactivated",
      ),
    },
    flags: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
    },
    hasValues: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
    },
    in_: { identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#in") },
    isDefinedBy: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
      ),
    },
    labels: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#label",
      ),
    },
    languageIn: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#languageIn",
      ),
    },
    maxCount: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
    },
    maxExclusive: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#maxExclusive",
      ),
    },
    maxInclusive: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#maxInclusive",
      ),
    },
    maxLength: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
    },
    minCount: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
    },
    minExclusive: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#minExclusive",
      ),
    },
    minInclusive: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#minInclusive",
      ),
    },
    minLength: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
    },
    nodeKind: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
    },
    nodes: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
    },
    not: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
    },
    or: { identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#or") },
    patterns: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
    },
    xone: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
    },
  };
}
export interface ShaclCorePropertyShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCorePropertyShapeStatic.$Identifier;
  readonly $type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
  readonly defaultValue: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
  readonly descriptions: readonly rdfjs.Literal[];
  readonly groups: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly names: readonly rdfjs.Literal[];
  readonly order: purify.Maybe<number>;
  readonly path: PropertyPath;
  readonly uniqueLang: purify.Maybe<boolean>;
}

export namespace ShaclCorePropertyShapeStatic {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );
  export type $Identifier = BaseShaclCoreShapeStatic.$Identifier;
  export const $Identifier = BaseShaclCoreShapeStatic.$Identifier;

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    languageIn: $languageIn,
    objectSet: $objectSetParameter,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
      defaultValue: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
      descriptions: readonly rdfjs.Literal[];
      groups: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
      names: readonly rdfjs.Literal[];
      order: purify.Maybe<number>;
      path: PropertyPath;
      uniqueLang: purify.Maybe<boolean>;
    } & $UnwrapR<ReturnType<typeof BaseShaclCoreShapeStatic.$propertiesFromRdf>>
  > {
    const $super0Either = BaseShaclCoreShapeStatic.$propertiesFromRdf({
      ...$context,
      ignoreRdfType: true,
      languageIn: $languageIn,
      resource: $resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!$ignoreRdfType && !$resource.isInstanceOf($fromRdfType)) {
      return $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
            ),
          ),
        );
    }

    const $identifier: ShaclCorePropertyShapeStatic.$Identifier =
      $resource.identifier;
    const $type = "ShaclCorePropertyShape" as const;
    const _defaultValueEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
    > = $resource
      .values($properties.defaultValue["identifier"], { unique: true })
      .head()
      .chain((value) =>
        purify.Either.of<
          Error,
          rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode
        >(value.toTerm()).chain((term) => {
          switch (term.termType) {
            case "Literal":
            case "NamedNode":
              return purify.Either.of<Error, rdfjs.Literal | rdfjs.NamedNode>(
                term,
              );
            default:
              return purify.Left<Error, rdfjs.Literal | rdfjs.NamedNode>(
                new rdfjsResource.Resource.MistypedValueError({
                  actualValue: term,
                  expectedValueType: "(rdfjs.Literal | rdfjs.NamedNode)",
                  focusResource: $resource,
                  predicate:
                    ShaclCorePropertyShapeStatic.$properties.defaultValue[
                      "identifier"
                    ],
                }),
              );
          }
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_defaultValueEither.isLeft()) {
      return _defaultValueEither;
    }

    const defaultValue = _defaultValueEither.unsafeCoerce();
    const _descriptionsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        $resource
          .values($properties.descriptions["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = $languageIn ?? [];
                if (_languageInOrDefault.length === 0) {
                  return true;
                }
                const _valueLiteral = _value.toLiteral().toMaybe().extract();
                if (typeof _valueLiteral === "undefined") {
                  return false;
                }
                return _languageInOrDefault.some(
                  (_languageIn) => _languageIn === _valueLiteral.language,
                );
              })
              .head()
              .chain((value) => value.toLiteral()),
          ),
      );
    if (_descriptionsEither.isLeft()) {
      return _descriptionsEither;
    }

    const descriptions = _descriptionsEither.unsafeCoerce();
    const _groupsEither: purify.Either<
      Error,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.sequence(
      $resource
        .values($properties.groups["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) => value.toIdentifier()),
        ),
    );
    if (_groupsEither.isLeft()) {
      return _groupsEither;
    }

    const groups = _groupsEither.unsafeCoerce();
    const _namesEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        $resource
          .values($properties.names["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = $languageIn ?? [];
                if (_languageInOrDefault.length === 0) {
                  return true;
                }
                const _valueLiteral = _value.toLiteral().toMaybe().extract();
                if (typeof _valueLiteral === "undefined") {
                  return false;
                }
                return _languageInOrDefault.some(
                  (_languageIn) => _languageIn === _valueLiteral.language,
                );
              })
              .head()
              .chain((value) => value.toLiteral()),
          ),
      );
    if (_namesEither.isLeft()) {
      return _namesEither;
    }

    const names = _namesEither.unsafeCoerce();
    const _orderEither: purify.Either<Error, purify.Maybe<number>> = $resource
      .values($properties.order["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_orderEither.isLeft()) {
      return _orderEither;
    }

    const order = _orderEither.unsafeCoerce();
    const _pathEither: purify.Either<Error, PropertyPath> = $resource
      .values($properties.path["identifier"], { unique: true })
      .head()
      .chain((value) => value.toResource())
      .chain((_resource) =>
        PropertyPath.$fromRdf({
          ...$context,
          ignoreRdfType: true,
          languageIn: $languageIn,
          resource: _resource,
        }),
      );
    if (_pathEither.isLeft()) {
      return _pathEither;
    }

    const path = _pathEither.unsafeCoerce();
    const _uniqueLangEither: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = $resource
      .values($properties.uniqueLang["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_uniqueLangEither.isLeft()) {
      return _uniqueLangEither;
    }

    const uniqueLang = _uniqueLangEither.unsafeCoerce();
    return purify.Either.of({
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
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof ShaclCorePropertyShapeStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<Error, ShaclCorePropertyShape> {
    const { ignoreRdfType: _, ...otherParameters } = parameters;
    return (
      ShaclmatePropertyShape.$fromRdf(otherParameters) as purify.Either<
        Error,
        ShaclCorePropertyShape
      >
    ).altLazy(() =>
      ShaclCorePropertyShapeStatic.$propertiesFromRdf(parameters),
    );
  }

  export function $toRdf(
    _shaclCorePropertyShape: ShaclCorePropertyShape,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = BaseShaclCoreShapeStatic.$toRdf(_shaclCorePropertyShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#ShaclCorePropertyShape",
        ),
      );
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyShape",
        ),
      );
    }

    _resource.add(
      ShaclCorePropertyShapeStatic.$properties.defaultValue["identifier"],
      _shaclCorePropertyShape.defaultValue,
    );
    _resource.add(
      ShaclCorePropertyShapeStatic.$properties.descriptions["identifier"],
      _shaclCorePropertyShape.descriptions.map((item) => item),
    );
    _resource.add(
      ShaclCorePropertyShapeStatic.$properties.groups["identifier"],
      _shaclCorePropertyShape.groups.map((item) => item),
    );
    _resource.add(
      ShaclCorePropertyShapeStatic.$properties.names["identifier"],
      _shaclCorePropertyShape.names.map((item) => item),
    );
    _resource.add(
      ShaclCorePropertyShapeStatic.$properties.order["identifier"],
      _shaclCorePropertyShape.order,
    );
    _resource.add(
      ShaclCorePropertyShapeStatic.$properties.path["identifier"],
      PropertyPath.$toRdf(_shaclCorePropertyShape.path, {
        mutateGraph: mutateGraph,
        resourceSet: resourceSet,
      }),
    );
    _resource.add(
      ShaclCorePropertyShapeStatic.$properties.uniqueLang["identifier"],
      _shaclCorePropertyShape.uniqueLang,
    );
    return _resource;
  }

  export const $properties = {
    ...BaseShaclCoreShapeStatic.$properties,
    defaultValue: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#defaultValue",
      ),
    },
    descriptions: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#description",
      ),
    },
    groups: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
    },
    names: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
    },
    order: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
    },
    path: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
    },
    uniqueLang: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#uniqueLang",
      ),
    },
  };
}
export interface ShaclmatePropertyShape extends ShaclCorePropertyShape {
  readonly $identifier: ShaclmatePropertyShape.$Identifier;
  readonly $type: "ShaclmatePropertyShape";
  readonly lazy: purify.Maybe<boolean>;
  readonly mutable: purify.Maybe<boolean>;
  readonly name: purify.Maybe<string>;
  readonly stub: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
  readonly visibility: purify.Maybe<
    rdfjs.NamedNode<
      | "http://purl.org/shaclmate/ontology#_Visibility_Private"
      | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
      | "http://purl.org/shaclmate/ontology#_Visibility_Public"
    >
  >;
  readonly widen: purify.Maybe<boolean>;
}

export namespace ShaclmatePropertyShape {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );
  export type $Identifier = ShaclCorePropertyShapeStatic.$Identifier;
  export const $Identifier = ShaclCorePropertyShapeStatic.$Identifier;

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    languageIn: $languageIn,
    objectSet: $objectSetParameter,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclmatePropertyShape";
      lazy: purify.Maybe<boolean>;
      mutable: purify.Maybe<boolean>;
      name: purify.Maybe<string>;
      stub: purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>;
      visibility: purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_Visibility_Private"
          | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
          | "http://purl.org/shaclmate/ontology#_Visibility_Public"
        >
      >;
      widen: purify.Maybe<boolean>;
    } & $UnwrapR<
      ReturnType<typeof ShaclCorePropertyShapeStatic.$propertiesFromRdf>
    >
  > {
    const $super0Either = ShaclCorePropertyShapeStatic.$propertiesFromRdf({
      ...$context,
      ignoreRdfType: true,
      languageIn: $languageIn,
      resource: $resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!$ignoreRdfType && !$resource.isInstanceOf($fromRdfType)) {
      return $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
            ),
          ),
        );
    }

    const $identifier: ShaclmatePropertyShape.$Identifier =
      $resource.identifier;
    const $type = "ShaclmatePropertyShape" as const;
    const _lazyEither: purify.Either<Error, purify.Maybe<boolean>> = $resource
      .values($properties.lazy["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_lazyEither.isLeft()) {
      return _lazyEither;
    }

    const lazy = _lazyEither.unsafeCoerce();
    const _mutableEither: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = $resource
      .values($properties.mutable["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_mutableEither.isLeft()) {
      return _mutableEither;
    }

    const mutable = _mutableEither.unsafeCoerce();
    const _nameEither: purify.Either<Error, purify.Maybe<string>> = $resource
      .values($properties.name["identifier"], { unique: true })
      .head()
      .chain((value) => value.toString())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_nameEither.isLeft()) {
      return _nameEither;
    }

    const name = _nameEither.unsafeCoerce();
    const _stubEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
    > = $resource
      .values($properties.stub["identifier"], { unique: true })
      .head()
      .chain((value) => value.toIdentifier())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_stubEither.isLeft()) {
      return _stubEither;
    }

    const stub = _stubEither.unsafeCoerce();
    const _visibilityEither: purify.Either<
      Error,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_Visibility_Private"
          | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
          | "http://purl.org/shaclmate/ontology#_Visibility_Public"
        >
      >
    > = $resource
      .values($properties.visibility["identifier"], { unique: true })
      .head()
      .chain((value) =>
        value.toIri().chain((iri) => {
          switch (iri.value) {
            case "http://purl.org/shaclmate/ontology#_Visibility_Private":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                  | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                  | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Private">,
              );
            case "http://purl.org/shaclmate/ontology#_Visibility_Protected":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                  | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                  | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Protected">,
              );
            case "http://purl.org/shaclmate/ontology#_Visibility_Public":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                  | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                  | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Public">,
              );
            default:
              return purify.Left<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                  | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                  | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                >
              >(
                new rdfjsResource.Resource.MistypedValueError({
                  actualValue: iri,
                  expectedValueType:
                    'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Private" | "http://purl.org/shaclmate/ontology#_Visibility_Protected" | "http://purl.org/shaclmate/ontology#_Visibility_Public">',
                  focusResource: $resource,
                  predicate:
                    ShaclmatePropertyShape.$properties.visibility["identifier"],
                }),
              );
          }
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_visibilityEither.isLeft()) {
      return _visibilityEither;
    }

    const visibility = _visibilityEither.unsafeCoerce();
    const _widenEither: purify.Either<Error, purify.Maybe<boolean>> = $resource
      .values($properties.widen["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_widenEither.isLeft()) {
      return _widenEither;
    }

    const widen = _widenEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      $type,
      lazy,
      mutable,
      name,
      stub,
      visibility,
      widen,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ShaclmatePropertyShape.$propertiesFromRdf>[0],
  ): purify.Either<Error, ShaclmatePropertyShape> {
    return ShaclmatePropertyShape.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _shaclmatePropertyShape: ShaclmatePropertyShape,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = ShaclCorePropertyShapeStatic.$toRdf(
      _shaclmatePropertyShape,
      { ignoreRdfType: true, mutateGraph, resourceSet },
    );
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyShape",
        ),
      );
    }

    _resource.add(
      ShaclmatePropertyShape.$properties.lazy["identifier"],
      _shaclmatePropertyShape.lazy,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.mutable["identifier"],
      _shaclmatePropertyShape.mutable,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.name["identifier"],
      _shaclmatePropertyShape.name,
    );
    _resource.add(
      ShaclmatePropertyShape.$properties.stub["identifier"],
      _shaclmatePropertyShape.stub,
    );
    _resource.add(
      ShaclmatePropertyShape.$properties.visibility["identifier"],
      _shaclmatePropertyShape.visibility,
    );
    _resource.add(
      ShaclmatePropertyShape.$properties.widen["identifier"],
      _shaclmatePropertyShape.widen,
    );
    return _resource;
  }

  export const $properties = {
    ...ShaclCorePropertyShapeStatic.$properties,
    lazy: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#lazy",
      ),
    },
    mutable: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#mutable",
      ),
    },
    name: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#name",
      ),
    },
    stub: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#stub",
      ),
    },
    visibility: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#visibility",
      ),
    },
    widen: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#widen",
      ),
    },
  };
}
export interface OwlOntology {
  readonly $identifier: OwlOntologyStatic.$Identifier;
  readonly $type: "OwlOntology" | "ShaclmateOntology";
  readonly labels: readonly rdfjs.Literal[];
}

export namespace OwlOntologyStatic {
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

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    languageIn: $languageIn,
    objectSet: $objectSetParameter,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "OwlOntology" | "ShaclmateOntology";
      labels: readonly rdfjs.Literal[];
    }
  > {
    if (!$ignoreRdfType && !$resource.isInstanceOf($fromRdfType)) {
      return $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
            ),
          ),
        );
    }

    const $identifier: OwlOntologyStatic.$Identifier = $resource.identifier;
    const $type = "OwlOntology" as const;
    const _labelsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        $resource
          .values($properties.labels["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = $languageIn ?? [];
                if (_languageInOrDefault.length === 0) {
                  return true;
                }
                const _valueLiteral = _value.toLiteral().toMaybe().extract();
                if (typeof _valueLiteral === "undefined") {
                  return false;
                }
                return _languageInOrDefault.some(
                  (_languageIn) => _languageIn === _valueLiteral.language,
                );
              })
              .head()
              .chain((value) => value.toLiteral()),
          ),
      );
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    return purify.Either.of({ $identifier, $type, labels });
  }

  export function $fromRdf(
    parameters: Parameters<typeof OwlOntologyStatic.$propertiesFromRdf>[0],
  ): purify.Either<Error, OwlOntology> {
    const { ignoreRdfType: _, ...otherParameters } = parameters;
    return (
      ShaclmateOntology.$fromRdf(otherParameters) as purify.Either<
        Error,
        OwlOntology
      >
    ).altLazy(() => OwlOntologyStatic.$propertiesFromRdf(parameters));
  }

  export function $toRdf(
    _owlOntology: OwlOntology,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(_owlOntology.$identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#OwlOntology",
        ),
      );
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://www.w3.org/2002/07/owl#Ontology",
        ),
      );
    }

    _resource.add(
      OwlOntologyStatic.$properties.labels["identifier"],
      _owlOntology.labels.map((item) => item),
    );
    return _resource;
  }

  export const $properties = {
    labels: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#label",
      ),
    },
  };
}
export interface ShaclmateOntology extends OwlOntology {
  readonly $identifier: ShaclmateOntology.$Identifier;
  readonly $type: "ShaclmateOntology";
  readonly tsFeatureExcludes: readonly rdfjs.NamedNode<
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
  readonly tsFeatureIncludes: readonly rdfjs.NamedNode<
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
  readonly tsObjectDeclarationType: purify.Maybe<
    rdfjs.NamedNode<
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
    >
  >;
}

export namespace ShaclmateOntology {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );
  export type $Identifier = OwlOntologyStatic.$Identifier;
  export const $Identifier = OwlOntologyStatic.$Identifier;

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    languageIn: $languageIn,
    objectSet: $objectSetParameter,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclmateOntology";
      tsFeatureExcludes: readonly rdfjs.NamedNode<
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
      tsFeatureIncludes: readonly rdfjs.NamedNode<
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
      tsObjectDeclarationType: purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >
      >;
    } & $UnwrapR<ReturnType<typeof OwlOntologyStatic.$propertiesFromRdf>>
  > {
    const $super0Either = OwlOntologyStatic.$propertiesFromRdf({
      ...$context,
      ignoreRdfType: true,
      languageIn: $languageIn,
      resource: $resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!$ignoreRdfType && !$resource.isInstanceOf($fromRdfType)) {
      return $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
            ),
          ),
        );
    }

    const $identifier: ShaclmateOntology.$Identifier = $resource.identifier;
    const $type = "ShaclmateOntology" as const;
    const _tsFeatureExcludesEither: purify.Either<
      Error,
      readonly rdfjs.NamedNode<
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
      >[]
    > = purify.Either.sequence(
      $resource
        .values($properties.tsFeatureExcludes["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) =>
              value.toIri().chain((iri) => {
                switch (iri.value) {
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_Default">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Graphql">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Hash">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_None">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Rdf">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Sparql">,
                    );
                  default:
                    return purify.Left<
                      Error,
                      rdfjs.NamedNode<
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
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: iri,
                        expectedValueType:
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                        focusResource: $resource,
                        predicate:
                          ShaclmateNodeShape.$properties.tsFeatureExcludes[
                            "identifier"
                          ],
                      }),
                    );
                }
              }),
            ),
        ),
    );
    if (_tsFeatureExcludesEither.isLeft()) {
      return _tsFeatureExcludesEither;
    }

    const tsFeatureExcludes = _tsFeatureExcludesEither.unsafeCoerce();
    const _tsFeatureIncludesEither: purify.Either<
      Error,
      readonly rdfjs.NamedNode<
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
      >[]
    > = purify.Either.sequence(
      $resource
        .values($properties.tsFeatureIncludes["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) =>
              value.toIri().chain((iri) => {
                switch (iri.value) {
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_Default">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Graphql">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Hash">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_None">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Rdf">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Sparql">,
                    );
                  default:
                    return purify.Left<
                      Error,
                      rdfjs.NamedNode<
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
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: iri,
                        expectedValueType:
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                        focusResource: $resource,
                        predicate:
                          ShaclmateNodeShape.$properties.tsFeatureIncludes[
                            "identifier"
                          ],
                      }),
                    );
                }
              }),
            ),
        ),
    );
    if (_tsFeatureIncludesEither.isLeft()) {
      return _tsFeatureIncludesEither;
    }

    const tsFeatureIncludes = _tsFeatureIncludesEither.unsafeCoerce();
    const _tsImportsEither: purify.Either<Error, readonly string[]> =
      purify.Either.sequence(
        $resource
          .values($properties.tsImports["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .head()
              .chain((value) => value.toString()),
          ),
      );
    if (_tsImportsEither.isLeft()) {
      return _tsImportsEither;
    }

    const tsImports = _tsImportsEither.unsafeCoerce();
    const _tsObjectDeclarationTypeEither: purify.Either<
      Error,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >
      >
    > = $resource
      .values($properties.tsObjectDeclarationType["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) =>
        value.toIri().chain((iri) => {
          switch (iri.value) {
            case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class">,
              );
            case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">,
              );
            default:
              return purify.Left<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                >
              >(
                new rdfjsResource.Resource.MistypedValueError({
                  actualValue: iri,
                  expectedValueType:
                    'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class" | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">',
                  focusResource: $resource,
                  predicate:
                    ShaclmateNodeShape.$properties.tsObjectDeclarationType[
                      "identifier"
                    ],
                }),
              );
          }
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_tsObjectDeclarationTypeEither.isLeft()) {
      return _tsObjectDeclarationTypeEither;
    }

    const tsObjectDeclarationType =
      _tsObjectDeclarationTypeEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      $type,
      tsFeatureExcludes,
      tsFeatureIncludes,
      tsImports,
      tsObjectDeclarationType,
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ShaclmateOntology.$propertiesFromRdf>[0],
  ): purify.Either<Error, ShaclmateOntology> {
    return ShaclmateOntology.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _shaclmateOntology: ShaclmateOntology,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = OwlOntologyStatic.$toRdf(_shaclmateOntology, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://www.w3.org/2002/07/owl#Ontology",
        ),
      );
    }

    _resource.add(
      ShaclmateNodeShape.$properties.tsFeatureExcludes["identifier"],
      _shaclmateOntology.tsFeatureExcludes.map((item) => item),
    );
    _resource.add(
      ShaclmateNodeShape.$properties.tsFeatureIncludes["identifier"],
      _shaclmateOntology.tsFeatureIncludes.map((item) => item),
    );
    _resource.add(
      ShaclmateNodeShape.$properties.tsImports["identifier"],
      _shaclmateOntology.tsImports.map((item) => item),
    );
    _resource.add(
      ShaclmateNodeShape.$properties.tsObjectDeclarationType["identifier"],
      _shaclmateOntology.tsObjectDeclarationType,
    );
    return _resource;
  }

  export const $properties = {
    ...OwlOntologyStatic.$properties,
    tsFeatureExcludes: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
    },
    tsFeatureIncludes: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
    },
    tsImports: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsImport",
      ),
    },
    tsObjectDeclarationType: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
    },
  };
}
export interface ShaclCoreNodeShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCoreNodeShapeStatic.$Identifier;
  readonly $type: "ShaclCoreNodeShape" | "ShaclmateNodeShape";
  readonly closed: purify.Maybe<boolean>;
  readonly ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
  readonly properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
}

export namespace ShaclCoreNodeShapeStatic {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );
  export type $Identifier = BaseShaclCoreShapeStatic.$Identifier;
  export const $Identifier = BaseShaclCoreShapeStatic.$Identifier;

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    languageIn: $languageIn,
    objectSet: $objectSetParameter,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclCoreNodeShape" | "ShaclmateNodeShape";
      closed: purify.Maybe<boolean>;
      ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
      properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
    } & $UnwrapR<ReturnType<typeof BaseShaclCoreShapeStatic.$propertiesFromRdf>>
  > {
    const $super0Either = BaseShaclCoreShapeStatic.$propertiesFromRdf({
      ...$context,
      ignoreRdfType: true,
      languageIn: $languageIn,
      resource: $resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!$ignoreRdfType && !$resource.isInstanceOf($fromRdfType)) {
      return $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
            ),
          ),
        );
    }

    const $identifier: ShaclCoreNodeShapeStatic.$Identifier =
      $resource.identifier;
    const $type = "ShaclCoreNodeShape" as const;
    const _closedEither: purify.Either<Error, purify.Maybe<boolean>> = $resource
      .values($properties.closed["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_closedEither.isLeft()) {
      return _closedEither;
    }

    const closed = _closedEither.unsafeCoerce();
    const _ignoredPropertiesEither: purify.Either<
      Error,
      purify.Maybe<readonly rdfjs.NamedNode[]>
    > = $resource
      .values($properties.ignoredProperties["identifier"], { unique: true })
      .head()
      .chain((value) => value.toList())
      .chain((values) =>
        purify.Either.sequence(
          values.map((value) =>
            value
              .toValues()
              .head()
              .chain((value) => value.toIri()),
          ),
        ),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_ignoredPropertiesEither.isLeft()) {
      return _ignoredPropertiesEither;
    }

    const ignoredProperties = _ignoredPropertiesEither.unsafeCoerce();
    const _propertiesEither: purify.Either<
      Error,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.sequence(
      $resource
        .values($properties.properties["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) => value.toIdentifier()),
        ),
    );
    if (_propertiesEither.isLeft()) {
      return _propertiesEither;
    }

    const properties = _propertiesEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      $type,
      closed,
      ignoredProperties,
      properties,
    });
  }

  export function $fromRdf(
    parameters: Parameters<
      typeof ShaclCoreNodeShapeStatic.$propertiesFromRdf
    >[0],
  ): purify.Either<Error, ShaclCoreNodeShape> {
    const { ignoreRdfType: _, ...otherParameters } = parameters;
    return (
      ShaclmateNodeShape.$fromRdf(otherParameters) as purify.Either<
        Error,
        ShaclCoreNodeShape
      >
    ).altLazy(() => ShaclCoreNodeShapeStatic.$propertiesFromRdf(parameters));
  }

  export function $toRdf(
    _shaclCoreNodeShape: ShaclCoreNodeShape,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = BaseShaclCoreShapeStatic.$toRdf(_shaclCoreNodeShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#ShaclCoreNodeShape",
        ),
      );
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      );
    }

    _resource.add(
      ShaclCoreNodeShapeStatic.$properties.closed["identifier"],
      _shaclCoreNodeShape.closed,
    );
    _resource.add(
      ShaclCoreNodeShapeStatic.$properties.ignoredProperties["identifier"],
      _shaclCoreNodeShape.ignoredProperties.map((value) =>
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

                currentSubListResource.add($RdfVocabularies.rdf.first, item);

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
      ),
    );
    _resource.add(
      ShaclCoreNodeShapeStatic.$properties.properties["identifier"],
      _shaclCoreNodeShape.properties.map((item) => item),
    );
    return _resource;
  }

  export const $properties = {
    ...BaseShaclCoreShapeStatic.$properties,
    closed: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
    },
    ignoredProperties: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#ignoredProperties",
      ),
    },
    properties: {
      identifier: dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
    },
  };
}
export interface ShaclmateNodeShape extends ShaclCoreNodeShape {
  readonly $identifier: ShaclmateNodeShape.$Identifier;
  readonly $type: "ShaclmateNodeShape";
  readonly abstract: purify.Maybe<boolean>;
  readonly export_: purify.Maybe<boolean>;
  readonly extern: purify.Maybe<boolean>;
  readonly fromRdfType: purify.Maybe<rdfjs.NamedNode>;
  readonly identifierMintingStrategy: purify.Maybe<
    rdfjs.NamedNode<
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
    >
  >;
  readonly mutable: purify.Maybe<boolean>;
  readonly name: purify.Maybe<string>;
  readonly rdfType: purify.Maybe<rdfjs.NamedNode>;
  readonly toRdfTypes: readonly rdfjs.NamedNode[];
  readonly tsFeatureExcludes: readonly rdfjs.NamedNode<
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
  readonly tsFeatureIncludes: readonly rdfjs.NamedNode<
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
  readonly tsObjectDeclarationType: purify.Maybe<
    rdfjs.NamedNode<
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
    >
  >;
}

export namespace ShaclmateNodeShape {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );
  export type $Identifier = ShaclCoreNodeShapeStatic.$Identifier;
  export const $Identifier = ShaclCoreNodeShapeStatic.$Identifier;

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    languageIn: $languageIn,
    objectSet: $objectSetParameter,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclmateNodeShape";
      abstract: purify.Maybe<boolean>;
      export_: purify.Maybe<boolean>;
      extern: purify.Maybe<boolean>;
      fromRdfType: purify.Maybe<rdfjs.NamedNode>;
      identifierMintingStrategy: purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
        >
      >;
      mutable: purify.Maybe<boolean>;
      name: purify.Maybe<string>;
      rdfType: purify.Maybe<rdfjs.NamedNode>;
      toRdfTypes: readonly rdfjs.NamedNode[];
      tsFeatureExcludes: readonly rdfjs.NamedNode<
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
      tsFeatureIncludes: readonly rdfjs.NamedNode<
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
      tsObjectDeclarationType: purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >
      >;
    } & $UnwrapR<ReturnType<typeof ShaclCoreNodeShapeStatic.$propertiesFromRdf>>
  > {
    const $super0Either = ShaclCoreNodeShapeStatic.$propertiesFromRdf({
      ...$context,
      ignoreRdfType: true,
      languageIn: $languageIn,
      resource: $resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!$ignoreRdfType && !$resource.isInstanceOf($fromRdfType)) {
      return $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
            ),
          ),
        );
    }

    const $identifier: ShaclmateNodeShape.$Identifier = $resource.identifier;
    const $type = "ShaclmateNodeShape" as const;
    const _abstractEither: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = $resource
      .values($properties.abstract["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_abstractEither.isLeft()) {
      return _abstractEither;
    }

    const abstract = _abstractEither.unsafeCoerce();
    const _export_Either: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = $resource
      .values($properties.export_["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_export_Either.isLeft()) {
      return _export_Either;
    }

    const export_ = _export_Either.unsafeCoerce();
    const _externEither: purify.Either<Error, purify.Maybe<boolean>> = $resource
      .values($properties.extern["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_externEither.isLeft()) {
      return _externEither;
    }

    const extern = _externEither.unsafeCoerce();
    const _fromRdfTypeEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.NamedNode>
    > = $resource
      .values($properties.fromRdfType["identifier"], { unique: true })
      .head()
      .chain((value) => value.toIri())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_fromRdfTypeEither.isLeft()) {
      return _fromRdfTypeEither;
    }

    const fromRdfType = _fromRdfTypeEither.unsafeCoerce();
    const _identifierMintingStrategyEither: purify.Either<
      Error,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
        >
      >
    > = $resource
      .values($properties.identifierMintingStrategy["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) =>
        value.toIri().chain((iri) => {
          switch (iri.value) {
            case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode">,
              );
            case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256">,
              );
            case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4">,
              );
            default:
              return purify.Left<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                  | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                >
              >(
                new rdfjsResource.Resource.MistypedValueError({
                  actualValue: iri,
                  expectedValueType:
                    'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode" | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256" | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4">',
                  focusResource: $resource,
                  predicate:
                    ShaclmateNodeShape.$properties.identifierMintingStrategy[
                      "identifier"
                    ],
                }),
              );
          }
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_identifierMintingStrategyEither.isLeft()) {
      return _identifierMintingStrategyEither;
    }

    const identifierMintingStrategy =
      _identifierMintingStrategyEither.unsafeCoerce();
    const _mutableEither: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = $resource
      .values($properties.mutable["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_mutableEither.isLeft()) {
      return _mutableEither;
    }

    const mutable = _mutableEither.unsafeCoerce();
    const _nameEither: purify.Either<Error, purify.Maybe<string>> = $resource
      .values($properties.name["identifier"], { unique: true })
      .head()
      .chain((value) => value.toString())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_nameEither.isLeft()) {
      return _nameEither;
    }

    const name = _nameEither.unsafeCoerce();
    const _rdfTypeEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.NamedNode>
    > = $resource
      .values($properties.rdfType["identifier"], { unique: true })
      .head()
      .chain((value) => value.toIri())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_rdfTypeEither.isLeft()) {
      return _rdfTypeEither;
    }

    const rdfType = _rdfTypeEither.unsafeCoerce();
    const _toRdfTypesEither: purify.Either<Error, readonly rdfjs.NamedNode[]> =
      purify.Either.sequence(
        $resource
          .values($properties.toRdfTypes["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .head()
              .chain((value) => value.toIri()),
          ),
      );
    if (_toRdfTypesEither.isLeft()) {
      return _toRdfTypesEither;
    }

    const toRdfTypes = _toRdfTypesEither.unsafeCoerce();
    const _tsFeatureExcludesEither: purify.Either<
      Error,
      readonly rdfjs.NamedNode<
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
      >[]
    > = purify.Either.sequence(
      $resource
        .values($properties.tsFeatureExcludes["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) =>
              value.toIri().chain((iri) => {
                switch (iri.value) {
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_Default">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Graphql">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Hash">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_None">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Rdf">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Sparql">,
                    );
                  default:
                    return purify.Left<
                      Error,
                      rdfjs.NamedNode<
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
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: iri,
                        expectedValueType:
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                        focusResource: $resource,
                        predicate:
                          ShaclmateNodeShape.$properties.tsFeatureExcludes[
                            "identifier"
                          ],
                      }),
                    );
                }
              }),
            ),
        ),
    );
    if (_tsFeatureExcludesEither.isLeft()) {
      return _tsFeatureExcludesEither;
    }

    const tsFeatureExcludes = _tsFeatureExcludesEither.unsafeCoerce();
    const _tsFeatureIncludesEither: purify.Either<
      Error,
      readonly rdfjs.NamedNode<
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
      >[]
    > = purify.Either.sequence(
      $resource
        .values($properties.tsFeatureIncludes["identifier"], { unique: true })
        .map((item) =>
          item
            .toValues()
            .head()
            .chain((value) =>
              value.toIri().chain((iri) => {
                switch (iri.value) {
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_Default">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Graphql">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Hash">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_None">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Rdf">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
                    return purify.Either.of<
                      Error,
                      rdfjs.NamedNode<
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
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Sparql">,
                    );
                  default:
                    return purify.Left<
                      Error,
                      rdfjs.NamedNode<
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
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: iri,
                        expectedValueType:
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                        focusResource: $resource,
                        predicate:
                          ShaclmateNodeShape.$properties.tsFeatureIncludes[
                            "identifier"
                          ],
                      }),
                    );
                }
              }),
            ),
        ),
    );
    if (_tsFeatureIncludesEither.isLeft()) {
      return _tsFeatureIncludesEither;
    }

    const tsFeatureIncludes = _tsFeatureIncludesEither.unsafeCoerce();
    const _tsImportsEither: purify.Either<Error, readonly string[]> =
      purify.Either.sequence(
        $resource
          .values($properties.tsImports["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .head()
              .chain((value) => value.toString()),
          ),
      );
    if (_tsImportsEither.isLeft()) {
      return _tsImportsEither;
    }

    const tsImports = _tsImportsEither.unsafeCoerce();
    const _tsObjectDeclarationTypeEither: purify.Either<
      Error,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >
      >
    > = $resource
      .values($properties.tsObjectDeclarationType["identifier"], {
        unique: true,
      })
      .head()
      .chain((value) =>
        value.toIri().chain((iri) => {
          switch (iri.value) {
            case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class">,
              );
            case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
              return purify.Either.of<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                >
              >(
                iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">,
              );
            default:
              return purify.Left<
                Error,
                rdfjs.NamedNode<
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                  | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                >
              >(
                new rdfjsResource.Resource.MistypedValueError({
                  actualValue: iri,
                  expectedValueType:
                    'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class" | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">',
                  focusResource: $resource,
                  predicate:
                    ShaclmateNodeShape.$properties.tsObjectDeclarationType[
                      "identifier"
                    ],
                }),
              );
          }
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof Error
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_tsObjectDeclarationTypeEither.isLeft()) {
      return _tsObjectDeclarationTypeEither;
    }

    const tsObjectDeclarationType =
      _tsObjectDeclarationTypeEither.unsafeCoerce();
    return purify.Either.of({
      ...$super0,
      $identifier,
      $type,
      abstract,
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
    });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ShaclmateNodeShape.$propertiesFromRdf>[0],
  ): purify.Either<Error, ShaclmateNodeShape> {
    return ShaclmateNodeShape.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _shaclmateNodeShape: ShaclmateNodeShape,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = ShaclCoreNodeShapeStatic.$toRdf(_shaclmateNodeShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      );
    }

    _resource.add(
      ShaclmateNodeShape.$properties.abstract["identifier"],
      _shaclmateNodeShape.abstract,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.export_["identifier"],
      _shaclmateNodeShape.export_,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.extern["identifier"],
      _shaclmateNodeShape.extern,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.fromRdfType["identifier"],
      _shaclmateNodeShape.fromRdfType,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.identifierMintingStrategy["identifier"],
      _shaclmateNodeShape.identifierMintingStrategy,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.mutable["identifier"],
      _shaclmateNodeShape.mutable,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.name["identifier"],
      _shaclmateNodeShape.name,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.rdfType["identifier"],
      _shaclmateNodeShape.rdfType,
    );
    _resource.add(
      ShaclmateNodeShape.$properties.toRdfTypes["identifier"],
      _shaclmateNodeShape.toRdfTypes.map((item) => item),
    );
    _resource.add(
      ShaclmateNodeShape.$properties.tsFeatureExcludes["identifier"],
      _shaclmateNodeShape.tsFeatureExcludes.map((item) => item),
    );
    _resource.add(
      ShaclmateNodeShape.$properties.tsFeatureIncludes["identifier"],
      _shaclmateNodeShape.tsFeatureIncludes.map((item) => item),
    );
    _resource.add(
      ShaclmateNodeShape.$properties.tsImports["identifier"],
      _shaclmateNodeShape.tsImports.map((item) => item),
    );
    _resource.add(
      ShaclmateNodeShape.$properties.tsObjectDeclarationType["identifier"],
      _shaclmateNodeShape.tsObjectDeclarationType,
    );
    return _resource;
  }

  export const $properties = {
    ...ShaclCoreNodeShapeStatic.$properties,
    abstract: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#abstract",
      ),
    },
    export_: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#export",
      ),
    },
    extern: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#extern",
      ),
    },
    fromRdfType: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#fromRdfType",
      ),
    },
    identifierMintingStrategy: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
      ),
    },
    mutable: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#mutable",
      ),
    },
    name: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#name",
      ),
    },
    rdfType: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#rdfType",
      ),
    },
    toRdfTypes: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#toRdfType",
      ),
    },
    tsFeatureExcludes: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
    },
    tsFeatureIncludes: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
    },
    tsImports: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsImport",
      ),
    },
    tsObjectDeclarationType: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
    },
  };
}
export interface ShaclCorePropertyGroup {
  readonly $identifier: ShaclCorePropertyGroup.$Identifier;
  readonly $type: "ShaclCorePropertyGroup";
  readonly comments: readonly rdfjs.Literal[];
  readonly labels: readonly rdfjs.Literal[];
}

export namespace ShaclCorePropertyGroup {
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

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    languageIn: $languageIn,
    objectSet: $objectSetParameter,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclCorePropertyGroup";
      comments: readonly rdfjs.Literal[];
      labels: readonly rdfjs.Literal[];
    }
  > {
    if (!$ignoreRdfType && !$resource.isInstanceOf($fromRdfType)) {
      return $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
            ),
          ),
        );
    }

    const $identifier: ShaclCorePropertyGroup.$Identifier =
      $resource.identifier;
    const $type = "ShaclCorePropertyGroup" as const;
    const _commentsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        $resource
          .values($properties.comments["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = $languageIn ?? [];
                if (_languageInOrDefault.length === 0) {
                  return true;
                }
                const _valueLiteral = _value.toLiteral().toMaybe().extract();
                if (typeof _valueLiteral === "undefined") {
                  return false;
                }
                return _languageInOrDefault.some(
                  (_languageIn) => _languageIn === _valueLiteral.language,
                );
              })
              .head()
              .chain((value) => value.toLiteral()),
          ),
      );
    if (_commentsEither.isLeft()) {
      return _commentsEither;
    }

    const comments = _commentsEither.unsafeCoerce();
    const _labelsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        $resource
          .values($properties.labels["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = $languageIn ?? [];
                if (_languageInOrDefault.length === 0) {
                  return true;
                }
                const _valueLiteral = _value.toLiteral().toMaybe().extract();
                if (typeof _valueLiteral === "undefined") {
                  return false;
                }
                return _languageInOrDefault.some(
                  (_languageIn) => _languageIn === _valueLiteral.language,
                );
              })
              .head()
              .chain((value) => value.toLiteral()),
          ),
      );
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    return purify.Either.of({ $identifier, $type, comments, labels });
  }

  export function $fromRdf(
    parameters: Parameters<typeof ShaclCorePropertyGroup.$propertiesFromRdf>[0],
  ): purify.Either<Error, ShaclCorePropertyGroup> {
    return ShaclCorePropertyGroup.$propertiesFromRdf(parameters);
  }

  export function $toRdf(
    _shaclCorePropertyGroup: ShaclCorePropertyGroup,
    {
      ignoreRdfType,
      mutateGraph,
      resourceSet,
    }: {
      ignoreRdfType?: boolean;
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource(
      _shaclCorePropertyGroup.$identifier,
      { mutateGraph },
    );
    if (!ignoreRdfType) {
      _resource.add(
        $RdfVocabularies.rdf.type,
        _resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyGroup",
        ),
      );
    }

    _resource.add(
      ShaclCorePropertyGroup.$properties.comments["identifier"],
      _shaclCorePropertyGroup.comments.map((item) => item),
    );
    _resource.add(
      ShaclCorePropertyGroup.$properties.labels["identifier"],
      _shaclCorePropertyGroup.labels.map((item) => item),
    );
    return _resource;
  }

  export const $properties = {
    comments: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#comment",
      ),
    },
    labels: {
      identifier: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#label",
      ),
    },
  };
}
export type ShaclCoreShape = ShaclCoreNodeShape | ShaclCorePropertyShape;

export namespace ShaclCoreShape {
  export function $fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<Error, ShaclCoreShape> {
    return (
      ShaclCoreNodeShapeStatic.$fromRdf({
        ...context,
        resource,
      }) as purify.Either<Error, ShaclCoreShape>
    ).altLazy(
      () =>
        ShaclCorePropertyShapeStatic.$fromRdf({
          ...context,
          resource,
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

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $toRdf(
    _shaclCoreShape: ShaclCoreShape,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_shaclCoreShape.$type) {
      case "ShaclCoreNodeShape":
      case "ShaclmateNodeShape":
        return ShaclCoreNodeShapeStatic.$toRdf(_shaclCoreShape, _parameters);
      case "ShaclCorePropertyShape":
      case "ShaclmatePropertyShape":
        return ShaclCorePropertyShapeStatic.$toRdf(
          _shaclCoreShape,
          _parameters,
        );
      default:
        _shaclCoreShape satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
export type ShaclmateShape = ShaclmateNodeShape | ShaclCorePropertyShape;

export namespace ShaclmateShape {
  export function $fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<Error, ShaclmateShape> {
    return (
      ShaclmateNodeShape.$fromRdf({ ...context, resource }) as purify.Either<
        Error,
        ShaclmateShape
      >
    ).altLazy(
      () =>
        ShaclCorePropertyShapeStatic.$fromRdf({
          ...context,
          resource,
        }) as purify.Either<Error, ShaclmateShape>,
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

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $toRdf(
    _shaclmateShape: ShaclmateShape,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_shaclmateShape.$type) {
      case "ShaclmateNodeShape":
        return ShaclmateNodeShape.$toRdf(_shaclmateShape, _parameters);
      case "ShaclCorePropertyShape":
      case "ShaclmatePropertyShape":
        return ShaclCorePropertyShapeStatic.$toRdf(
          _shaclmateShape,
          _parameters,
        );
      default:
        _shaclmateShape satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
export interface $ObjectSet {
  owlOntology(
    identifier: OwlOntologyStatic.$Identifier,
  ): Promise<purify.Either<Error, OwlOntology>>;
  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntologyStatic.$Identifier[]>>;
  owlOntologies(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntology[]>>;
  owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShapeStatic.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>>;
  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]>
  >;
  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape[]>>;
  shaclCoreNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyGroup>>;
  shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>
  >;
  shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyGroup[]>>;
  shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShapeStatic.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>>;
  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]>
  >;
  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyShape[]>>;
  shaclCorePropertyShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  shaclmateNodeShape(
    identifier: ShaclmateNodeShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclmateNodeShape>>;
  shaclmateNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateNodeShape.$Identifier[]>>;
  shaclmateNodeShapes(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateNodeShape[]>>;
  shaclmateNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclmateOntology(
    identifier: ShaclmateOntology.$Identifier,
  ): Promise<purify.Either<Error, ShaclmateOntology>>;
  shaclmateOntologyIdentifiers(
    query?: $ObjectSet.Query<ShaclmateOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateOntology.$Identifier[]>>;
  shaclmateOntologies(
    query?: $ObjectSet.Query<ShaclmateOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateOntology[]>>;
  shaclmateOntologiesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclmatePropertyShape(
    identifier: ShaclmatePropertyShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclmatePropertyShape>>;
  shaclmatePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclmatePropertyShape.$Identifier[]>
  >;
  shaclmatePropertyShapes(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmatePropertyShape[]>>;
  shaclmatePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreShape>>;
  shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.$Identifier[]>>;
  shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape[]>>;
  shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclmateShape(
    identifier: ShaclmateShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclmateShape>>;
  shaclmateShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateShape.$Identifier[]>>;
  shaclmateShapes(
    query?: $ObjectSet.Query<ShaclmateShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateShape[]>>;
  shaclmateShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
}

export namespace $ObjectSet {
  export type Query<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  > = {
    readonly limit?: number;
    readonly offset?: number;
    readonly where?: Where<ObjectIdentifierT>;
  };
  export type Where<
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  > =
    | {
        readonly identifiers: readonly ObjectIdentifierT[];
        readonly type: "identifiers";
      }
    | {
        readonly predicate: rdfjs.NamedNode;
        readonly subject: rdfjs.BlankNode | rdfjs.NamedNode;
        readonly type: "triple-objects";
      };
}

export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly resourceSet: rdfjsResource.ResourceSet;

  constructor({ dataset }: { dataset: rdfjs.DatasetCore }) {
    this.resourceSet = new rdfjsResource.ResourceSet({ dataset });
  }

  async owlOntology(
    identifier: OwlOntologyStatic.$Identifier,
  ): Promise<purify.Either<Error, OwlOntology>> {
    return this.owlOntologySync(identifier);
  }

  owlOntologySync(
    identifier: OwlOntologyStatic.$Identifier,
  ): purify.Either<Error, OwlOntology> {
    return this.owlOntologiesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntologyStatic.$Identifier[]>> {
    return this.owlOntologyIdentifiersSync(query);
  }

  owlOntologyIdentifiersSync(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Identifier>,
  ): purify.Either<Error, readonly OwlOntologyStatic.$Identifier[]> {
    return this.$objectIdentifiersSync<
      OwlOntology,
      OwlOntologyStatic.$Identifier
    >(OwlOntologyStatic, query);
  }

  async owlOntologies(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntology[]>> {
    return this.owlOntologiesSync(query);
  }

  owlOntologiesSync(
    query?: $ObjectSet.Query<OwlOntologyStatic.$Identifier>,
  ): purify.Either<Error, readonly OwlOntology[]> {
    return this.$objectsSync<OwlOntology, OwlOntologyStatic.$Identifier>(
      OwlOntologyStatic,
      query,
    );
  }

  async owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.owlOntologiesCountSync(query);
  }

  owlOntologiesCountSync(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<OwlOntology, OwlOntologyStatic.$Identifier>(
      OwlOntologyStatic,
      query,
    );
  }

  async shaclCoreNodeShape(
    identifier: ShaclCoreNodeShapeStatic.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>> {
    return this.shaclCoreNodeShapeSync(identifier);
  }

  shaclCoreNodeShapeSync(
    identifier: ShaclCoreNodeShapeStatic.$Identifier,
  ): purify.Either<Error, ShaclCoreNodeShape> {
    return this.shaclCoreNodeShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]>
  > {
    return this.shaclCoreNodeShapeIdentifiersSync(query);
  }

  shaclCoreNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
  ): purify.Either<Error, readonly ShaclCoreNodeShapeStatic.$Identifier[]> {
    return this.$objectIdentifiersSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShapeStatic.$Identifier
    >(ShaclCoreNodeShapeStatic, query);
  }

  async shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape[]>> {
    return this.shaclCoreNodeShapesSync(query);
  }

  shaclCoreNodeShapesSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
  ): purify.Either<Error, readonly ShaclCoreNodeShape[]> {
    return this.$objectsSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShapeStatic.$Identifier
    >(ShaclCoreNodeShapeStatic, query);
  }

  async shaclCoreNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCoreNodeShapesCountSync(query);
  }

  shaclCoreNodeShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreNodeShapeStatic.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShapeStatic.$Identifier
    >(ShaclCoreNodeShapeStatic, query);
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
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>
  > {
    return this.shaclCorePropertyGroupIdentifiersSync(query);
  }

  shaclCorePropertyGroupIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): purify.Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]> {
    return this.$objectIdentifiersSync<
      ShaclCorePropertyGroup,
      ShaclCorePropertyGroup.$Identifier
    >(ShaclCorePropertyGroup, query);
  }

  async shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyGroup[]>> {
    return this.shaclCorePropertyGroupsSync(query);
  }

  shaclCorePropertyGroupsSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): purify.Either<Error, readonly ShaclCorePropertyGroup[]> {
    return this.$objectsSync<
      ShaclCorePropertyGroup,
      ShaclCorePropertyGroup.$Identifier
    >(ShaclCorePropertyGroup, query);
  }

  async shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCorePropertyGroupsCountSync(query);
  }

  shaclCorePropertyGroupsCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclCorePropertyGroup,
      ShaclCorePropertyGroup.$Identifier
    >(ShaclCorePropertyGroup, query);
  }

  async shaclCorePropertyShape(
    identifier: ShaclCorePropertyShapeStatic.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>> {
    return this.shaclCorePropertyShapeSync(identifier);
  }

  shaclCorePropertyShapeSync(
    identifier: ShaclCorePropertyShapeStatic.$Identifier,
  ): purify.Either<Error, ShaclCorePropertyShape> {
    return this.shaclCorePropertyShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]>
  > {
    return this.shaclCorePropertyShapeIdentifiersSync(query);
  }

  shaclCorePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
  ): purify.Either<Error, readonly ShaclCorePropertyShapeStatic.$Identifier[]> {
    return this.$objectIdentifiersSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShapeStatic.$Identifier
    >(ShaclCorePropertyShapeStatic, query);
  }

  async shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyShape[]>> {
    return this.shaclCorePropertyShapesSync(query);
  }

  shaclCorePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
  ): purify.Either<Error, readonly ShaclCorePropertyShape[]> {
    return this.$objectsSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShapeStatic.$Identifier
    >(ShaclCorePropertyShapeStatic, query);
  }

  async shaclCorePropertyShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCorePropertyShapesCountSync(query);
  }

  shaclCorePropertyShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.$Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShapeStatic.$Identifier
    >(ShaclCorePropertyShapeStatic, query);
  }

  async shaclmateNodeShape(
    identifier: ShaclmateNodeShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclmateNodeShape>> {
    return this.shaclmateNodeShapeSync(identifier);
  }

  shaclmateNodeShapeSync(
    identifier: ShaclmateNodeShape.$Identifier,
  ): purify.Either<Error, ShaclmateNodeShape> {
    return this.shaclmateNodeShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclmateNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateNodeShape.$Identifier[]>> {
    return this.shaclmateNodeShapeIdentifiersSync(query);
  }

  shaclmateNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclmateNodeShape.$Identifier[]> {
    return this.$objectIdentifiersSync<
      ShaclmateNodeShape,
      ShaclmateNodeShape.$Identifier
    >(ShaclmateNodeShape, query);
  }

  async shaclmateNodeShapes(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateNodeShape[]>> {
    return this.shaclmateNodeShapesSync(query);
  }

  shaclmateNodeShapesSync(
    query?: $ObjectSet.Query<ShaclmateNodeShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclmateNodeShape[]> {
    return this.$objectsSync<
      ShaclmateNodeShape,
      ShaclmateNodeShape.$Identifier
    >(ShaclmateNodeShape, query);
  }

  async shaclmateNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclmateNodeShapesCountSync(query);
  }

  shaclmateNodeShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclmateNodeShape,
      ShaclmateNodeShape.$Identifier
    >(ShaclmateNodeShape, query);
  }

  async shaclmateOntology(
    identifier: ShaclmateOntology.$Identifier,
  ): Promise<purify.Either<Error, ShaclmateOntology>> {
    return this.shaclmateOntologySync(identifier);
  }

  shaclmateOntologySync(
    identifier: ShaclmateOntology.$Identifier,
  ): purify.Either<Error, ShaclmateOntology> {
    return this.shaclmateOntologiesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclmateOntologyIdentifiers(
    query?: $ObjectSet.Query<ShaclmateOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateOntology.$Identifier[]>> {
    return this.shaclmateOntologyIdentifiersSync(query);
  }

  shaclmateOntologyIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateOntology.$Identifier>,
  ): purify.Either<Error, readonly ShaclmateOntology.$Identifier[]> {
    return this.$objectIdentifiersSync<
      ShaclmateOntology,
      ShaclmateOntology.$Identifier
    >(ShaclmateOntology, query);
  }

  async shaclmateOntologies(
    query?: $ObjectSet.Query<ShaclmateOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateOntology[]>> {
    return this.shaclmateOntologiesSync(query);
  }

  shaclmateOntologiesSync(
    query?: $ObjectSet.Query<ShaclmateOntology.$Identifier>,
  ): purify.Either<Error, readonly ShaclmateOntology[]> {
    return this.$objectsSync<ShaclmateOntology, ShaclmateOntology.$Identifier>(
      ShaclmateOntology,
      query,
    );
  }

  async shaclmateOntologiesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclmateOntologiesCountSync(query);
  }

  shaclmateOntologiesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclmateOntology,
      ShaclmateOntology.$Identifier
    >(ShaclmateOntology, query);
  }

  async shaclmatePropertyShape(
    identifier: ShaclmatePropertyShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclmatePropertyShape>> {
    return this.shaclmatePropertyShapeSync(identifier);
  }

  shaclmatePropertyShapeSync(
    identifier: ShaclmatePropertyShape.$Identifier,
  ): purify.Either<Error, ShaclmatePropertyShape> {
    return this.shaclmatePropertyShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclmatePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclmatePropertyShape.$Identifier[]>
  > {
    return this.shaclmatePropertyShapeIdentifiersSync(query);
  }

  shaclmatePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclmatePropertyShape.$Identifier[]> {
    return this.$objectIdentifiersSync<
      ShaclmatePropertyShape,
      ShaclmatePropertyShape.$Identifier
    >(ShaclmatePropertyShape, query);
  }

  async shaclmatePropertyShapes(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmatePropertyShape[]>> {
    return this.shaclmatePropertyShapesSync(query);
  }

  shaclmatePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclmatePropertyShape[]> {
    return this.$objectsSync<
      ShaclmatePropertyShape,
      ShaclmatePropertyShape.$Identifier
    >(ShaclmatePropertyShape, query);
  }

  async shaclmatePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclmatePropertyShapesCountSync(query);
  }

  shaclmatePropertyShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclmatePropertyShape,
      ShaclmatePropertyShape.$Identifier
    >(ShaclmatePropertyShape, query);
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
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.$Identifier[]>> {
    return this.shaclCoreShapeIdentifiersSync(query);
  }

  shaclCoreShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclCoreShape.$Identifier[]> {
    return this.$objectUnionIdentifiersSync<
      ShaclCoreShape,
      ShaclCoreShape.$Identifier
    >([ShaclCoreNodeShapeStatic, ShaclCorePropertyShapeStatic], query);
  }

  async shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape[]>> {
    return this.shaclCoreShapesSync(query);
  }

  shaclCoreShapesSync(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclCoreShape[]> {
    return this.$objectUnionsSync<ShaclCoreShape, ShaclCoreShape.$Identifier>(
      [ShaclCoreNodeShapeStatic, ShaclCorePropertyShapeStatic],
      query,
    );
  }

  async shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCoreShapesCountSync(query);
  }

  shaclCoreShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectUnionsCountSync<
      ShaclCoreShape,
      ShaclCoreShape.$Identifier
    >([ShaclCoreNodeShapeStatic, ShaclCorePropertyShapeStatic], query);
  }

  async shaclmateShape(
    identifier: ShaclmateShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclmateShape>> {
    return this.shaclmateShapeSync(identifier);
  }

  shaclmateShapeSync(
    identifier: ShaclmateShape.$Identifier,
  ): purify.Either<Error, ShaclmateShape> {
    return this.shaclmateShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclmateShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateShape.$Identifier[]>> {
    return this.shaclmateShapeIdentifiersSync(query);
  }

  shaclmateShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclmateShape.$Identifier[]> {
    return this.$objectUnionIdentifiersSync<
      ShaclmateShape,
      ShaclmateShape.$Identifier
    >([ShaclmateNodeShape, ShaclCorePropertyShapeStatic], query);
  }

  async shaclmateShapes(
    query?: $ObjectSet.Query<ShaclmateShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateShape[]>> {
    return this.shaclmateShapesSync(query);
  }

  shaclmateShapesSync(
    query?: $ObjectSet.Query<ShaclmateShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclmateShape[]> {
    return this.$objectUnionsSync<ShaclmateShape, ShaclmateShape.$Identifier>(
      [ShaclmateNodeShape, ShaclCorePropertyShapeStatic],
      query,
    );
  }

  async shaclmateShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclmateShapesCountSync(query);
  }

  shaclmateShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectUnionsCountSync<
      ShaclmateShape,
      ShaclmateShape.$Identifier
    >([ShaclmateNodeShape, ShaclCorePropertyShapeStatic], query);
  }

  protected $objectIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, readonly ObjectIdentifierT[]> {
    return this.$objectsSync<ObjectT, ObjectIdentifierT>(objectType, query).map(
      (objects) => objects.map((object) => object.$identifier),
    );
  }

  protected $objectsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      // Assign identifiers in each case block so the compiler will catch missing cases.
      let identifiers: rdfjsResource.Resource.Identifier[];
      switch (query.where.type) {
        case "identifiers": {
          identifiers = query.where.identifiers.slice(offset, offset + limit);
          break;
        }
        case "triple-objects": {
          let identifierI = 0;
          identifiers = [];
          for (const quad of this.resourceSet.dataset.match(
            query.where.subject,
            query.where.predicate,
            null,
          )) {
            if (
              quad.object.termType === "BlankNode" ||
              quad.object.termType === "NamedNode"
            ) {
              if (++identifierI >= offset) {
                identifiers.push(quad.object);
                if (identifiers.length === limit) {
                  break;
                }
              }
            } else {
              return purify.Left(
                new Error(
                  `subject=${query.where.subject.value} predicate=${query.where.predicate.value} pattern matches non-identifier (${quad.object.termType}) triple`,
                ),
              );
            }
          }
          break;
        }
      }

      const objects: ObjectT[] = [];
      for (const identifier of identifiers) {
        const either = objectType.$fromRdf({
          resource: this.resourceSet.resource(identifier),
        });
        if (either.isLeft()) {
          return either;
        }
        objects.push(either.unsafeCoerce());
      }
      return purify.Either.of(objects);
    }

    if (!objectType.$fromRdfType) {
      return purify.Either.of([]);
    }

    const resources = [
      ...this.resourceSet.instancesOf(objectType.$fromRdfType),
    ];
    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.identifier.value.localeCompare(right.identifier.value),
    );

    const objects: ObjectT[] = [];
    let objectI = 0;
    for (const resource of resources) {
      const either = objectType.$fromRdf({ resource });
      if (either.isLeft()) {
        return either;
      }
      if (objectI++ >= offset) {
        objects.push(either.unsafeCoerce());
        if (objects.length === limit) {
          return purify.Either.of(objects);
        }
      }
    }
    return purify.Either.of(objects);
  }

  protected $objectsCountSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    return this.$objectsSync<ObjectT, ObjectIdentifierT>(objectType, query).map(
      (objects) => objects.length,
    );
  }

  protected $objectUnionIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, readonly ObjectIdentifierT[]> {
    return this.$objectUnionsSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    ).map((objects) => objects.map((object) => object.$identifier));
  }

  protected $objectUnionsSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, readonly ObjectT[]> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      // Assign identifiers in each case block so the compiler will catch missing cases.
      let identifiers: rdfjsResource.Resource.Identifier[];
      switch (query.where.type) {
        case "identifiers": {
          identifiers = query.where.identifiers.slice(offset, offset + limit);
          break;
        }
        case "triple-objects": {
          let identifierI = 0;
          identifiers = [];
          for (const quad of this.resourceSet.dataset.match(
            query.where.subject,
            query.where.predicate,
            null,
          )) {
            if (
              quad.object.termType === "BlankNode" ||
              quad.object.termType === "NamedNode"
            ) {
              if (++identifierI >= offset) {
                identifiers.push(quad.object);
                if (identifiers.length === limit) {
                  break;
                }
              }
            } else {
              return purify.Left(
                new Error(
                  `subject=${query.where.subject.value} predicate=${query.where.predicate.value} pattern matches non-identifier (${quad.object.termType}) triple`,
                ),
              );
            }
          }
          break;
        }
      }

      const objects: ObjectT[] = [];
      for (const identifier of identifiers) {
        const resource = this.resourceSet.resource(identifier);
        const lefts: purify.Either<Error, ObjectT>[] = [];
        for (const objectType of objectTypes) {
          const either = objectType.$fromRdf({ resource });
          if (either.isRight()) {
            objects.push(either.unsafeCoerce());
            break;
          }
          lefts.push(either);
        }
        // Doesn't appear to belong to any of the known object types, just assume the first
        if (lefts.length === objectTypes.length) {
          return lefts[0] as unknown as purify.Either<
            Error,
            readonly ObjectT[]
          >;
        }
      }
      return purify.Either.of(objects);
    }

    const resources: {
      objectType: {
        $fromRdf: (parameters: {
          resource: rdfjsResource.Resource;
        }) => purify.Either<Error, ObjectT>;
        $fromRdfType?: rdfjs.NamedNode;
      };
      resource: rdfjsResource.Resource;
    }[] = [];
    for (const objectType of objectTypes) {
      if (!objectType.$fromRdfType) {
        continue;
      }

      for (const resource of this.resourceSet.instancesOf(
        objectType.$fromRdfType,
      )) {
        resources.push({ objectType, resource });
      }
    }

    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.resource.identifier.value.localeCompare(
        right.resource.identifier.value,
      ),
    );

    let objectI = 0;
    const objects: ObjectT[] = [];
    for (const { objectType, resource } of resources) {
      const either = objectType.$fromRdf({ resource });
      if (either.isLeft()) {
        return either;
      }
      if (objectI++ >= offset) {
        objects.push(either.unsafeCoerce());
        if (objects.length === limit) {
          return purify.Either.of(objects);
        }
      }
    }
    return purify.Either.of(objects);
  }

  protected $objectUnionsCountSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      $fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<Error, ObjectT>;
      $fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    return this.$objectUnionIdentifiersSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    ).map((objects) => objects.length);
  }
}

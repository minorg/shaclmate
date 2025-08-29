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
  readonly $type: "ShaclCoreNodeShape" | "ShaclCorePropertyShape";
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
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
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
      _resource.identifier;
    const _andEither: purify.Either<
      Error,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.sequence(
      _resource
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
        _resource
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
        _resource
          .values($properties.comments["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = _languageIn ?? [];
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
    > = _resource
      .values($properties.datatype["identifier"], { unique: true })
      .head()
      .chain((value) => value.toIri())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.deactivated["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_deactivatedEither.isLeft()) {
      return _deactivatedEither;
    }

    const deactivated = _deactivatedEither.unsafeCoerce();
    const _flagsEither: purify.Either<Error, readonly string[]> =
      purify.Either.sequence(
        _resource
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
      _resource
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
                        focusResource: _resource,
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
    > = _resource
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
                          focusResource: _resource,
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
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.isDefinedBy["identifier"], { unique: true })
      .head()
      .chain((value) => value.toIdentifier())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_isDefinedByEither.isLeft()) {
      return _isDefinedByEither;
    }

    const isDefinedBy = _isDefinedByEither.unsafeCoerce();
    const _labelsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        _resource
          .values($properties.labels["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = _languageIn ?? [];
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
    > = _resource
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
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.maxCount["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.maxExclusive["identifier"], { unique: true })
      .filter((_value) => {
        const _languageInOrDefault = _languageIn ?? [];
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
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.maxInclusive["identifier"], { unique: true })
      .filter((_value) => {
        const _languageInOrDefault = _languageIn ?? [];
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
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.maxLength["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.minCount["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.minExclusive["identifier"], { unique: true })
      .filter((_value) => {
        const _languageInOrDefault = _languageIn ?? [];
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
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.minInclusive["identifier"], { unique: true })
      .filter((_value) => {
        const _languageInOrDefault = _languageIn ?? [];
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
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
      .values($properties.minLength["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
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
                  focusResource: _resource,
                  predicate:
                    BaseShaclCoreShapeStatic.$properties.nodeKind["identifier"],
                }),
              );
          }
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
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
      _resource
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
      _resource
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
      _resource
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
        _resource
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
      _resource
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
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ShaclCoreNodeShape.$fromRdf(otherParameters) as purify.Either<
        Error,
        BaseShaclCoreShape
      >
    ).altLazy(
      () =>
        ShaclCorePropertyShape.$fromRdf(otherParameters) as purify.Either<
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
  readonly $identifier: ShaclCorePropertyShape.$Identifier;
  readonly $type: "ShaclCorePropertyShape";
  readonly defaultValue: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
  readonly descriptions: readonly rdfjs.Literal[];
  readonly groups: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly names: readonly rdfjs.Literal[];
  readonly order: purify.Maybe<number>;
  readonly path: PropertyPath;
  readonly uniqueLang: purify.Maybe<boolean>;
}

export namespace ShaclCorePropertyShape {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );
  export type $Identifier = BaseShaclCoreShapeStatic.$Identifier;
  export const $Identifier = BaseShaclCoreShapeStatic.$Identifier;

  export function $propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "ShaclCorePropertyShape";
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
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
            ),
          ),
        );
    }

    const $identifier: ShaclCorePropertyShape.$Identifier =
      _resource.identifier;
    const $type = "ShaclCorePropertyShape" as const;
    const _defaultValueEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
    > = _resource
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
                  focusResource: _resource,
                  predicate:
                    ShaclCorePropertyShape.$properties.defaultValue[
                      "identifier"
                    ],
                }),
              );
          }
        }),
      )
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_defaultValueEither.isLeft()) {
      return _defaultValueEither;
    }

    const defaultValue = _defaultValueEither.unsafeCoerce();
    const _descriptionsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        _resource
          .values($properties.descriptions["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = _languageIn ?? [];
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
      _resource
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
        _resource
          .values($properties.names["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = _languageIn ?? [];
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
    const _orderEither: purify.Either<Error, purify.Maybe<number>> = _resource
      .values($properties.order["identifier"], { unique: true })
      .head()
      .chain((value) => value.toNumber())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
          ? purify.Right(purify.Maybe.empty())
          : purify.Left(error),
      );
    if (_orderEither.isLeft()) {
      return _orderEither;
    }

    const order = _orderEither.unsafeCoerce();
    const _pathEither: purify.Either<Error, PropertyPath> = _resource
      .values($properties.path["identifier"], { unique: true })
      .head()
      .chain((value) => value.toResource())
      .chain((_resource) =>
        PropertyPath.$fromRdf({
          ..._context,
          ignoreRdfType: true,
          languageIn: _languageIn,
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
    > = _resource
      .values($properties.uniqueLang["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
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
    parameters: Parameters<typeof ShaclCorePropertyShape.$propertiesFromRdf>[0],
  ): purify.Either<Error, ShaclCorePropertyShape> {
    return ShaclCorePropertyShape.$propertiesFromRdf(parameters);
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
      ShaclCorePropertyShape.$properties.defaultValue["identifier"],
      _shaclCorePropertyShape.defaultValue,
    );
    _resource.add(
      ShaclCorePropertyShape.$properties.descriptions["identifier"],
      _shaclCorePropertyShape.descriptions.map((item) => item),
    );
    _resource.add(
      ShaclCorePropertyShape.$properties.groups["identifier"],
      _shaclCorePropertyShape.groups.map((item) => item),
    );
    _resource.add(
      ShaclCorePropertyShape.$properties.names["identifier"],
      _shaclCorePropertyShape.names.map((item) => item),
    );
    _resource.add(
      ShaclCorePropertyShape.$properties.order["identifier"],
      _shaclCorePropertyShape.order,
    );
    _resource.add(
      ShaclCorePropertyShape.$properties.path["identifier"],
      PropertyPath.$toRdf(_shaclCorePropertyShape.path, {
        mutateGraph: mutateGraph,
        resourceSet: resourceSet,
      }),
    );
    _resource.add(
      ShaclCorePropertyShape.$properties.uniqueLang["identifier"],
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
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
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
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
            ),
          ),
        );
    }

    const $identifier: ShaclCorePropertyGroup.$Identifier =
      _resource.identifier;
    const $type = "ShaclCorePropertyGroup" as const;
    const _commentsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        _resource
          .values($properties.comments["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = _languageIn ?? [];
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
        _resource
          .values($properties.labels["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = _languageIn ?? [];
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
export interface ShaclCoreNodeShape extends BaseShaclCoreShape {
  readonly $identifier: ShaclCoreNodeShape.$Identifier;
  readonly $type: "ShaclCoreNodeShape";
  readonly closed: purify.Maybe<boolean>;
  readonly ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
  readonly properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
}

export namespace ShaclCoreNodeShape {
  export const $fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );
  export type $Identifier = BaseShaclCoreShapeStatic.$Identifier;
  export const $Identifier = BaseShaclCoreShapeStatic.$Identifier;

  export function $propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
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
    const $super0Either = BaseShaclCoreShapeStatic.$propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
            ),
          ),
        );
    }

    const $identifier: ShaclCoreNodeShape.$Identifier = _resource.identifier;
    const $type = "ShaclCoreNodeShape" as const;
    const _closedEither: purify.Either<Error, purify.Maybe<boolean>> = _resource
      .values($properties.closed["identifier"], { unique: true })
      .head()
      .chain((value) => value.toBoolean())
      .map((value) => purify.Maybe.of(value))
      .chainLeft((error) =>
        error instanceof rdfjsResource.Resource.MissingValueError
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
    > = _resource
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
        error instanceof rdfjsResource.Resource.MissingValueError
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
      _resource
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
    parameters: Parameters<typeof ShaclCoreNodeShape.$propertiesFromRdf>[0],
  ): purify.Either<Error, ShaclCoreNodeShape> {
    return ShaclCoreNodeShape.$propertiesFromRdf(parameters);
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
      ShaclCoreNodeShape.$properties.closed["identifier"],
      _shaclCoreNodeShape.closed,
    );
    _resource.add(
      ShaclCoreNodeShape.$properties.ignoredProperties["identifier"],
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
      ShaclCoreNodeShape.$properties.properties["identifier"],
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
export interface OwlOntology {
  readonly $identifier: OwlOntology.$Identifier;
  readonly $type: "OwlOntology";
  readonly labels: readonly rdfjs.Literal[];
}

export namespace OwlOntology {
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
          dataFactory: dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $propertiesFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "OwlOntology";
      labels: readonly rdfjs.Literal[];
    }
  > {
    if (!_ignoreRdfType && !_resource.isInstanceOf($fromRdfType)) {
      return _resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
            ),
          ),
        );
    }

    const $identifier: OwlOntology.$Identifier = _resource.identifier;
    const $type = "OwlOntology" as const;
    const _labelsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.sequence(
        _resource
          .values($properties.labels["identifier"], { unique: true })
          .map((item) =>
            item
              .toValues()
              .filter((_value) => {
                const _languageInOrDefault = _languageIn ?? [];
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
    parameters: Parameters<typeof OwlOntology.$propertiesFromRdf>[0],
  ): purify.Either<Error, OwlOntology> {
    return OwlOntology.$propertiesFromRdf(parameters);
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
      OwlOntology.$properties.labels["identifier"],
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
      ShaclCoreNodeShape.$fromRdf({ ...context, resource }) as purify.Either<
        Error,
        ShaclCoreShape
      >
    ).altLazy(
      () =>
        ShaclCorePropertyShape.$fromRdf({
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
          dataFactory: dataFactory,
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
        return ShaclCoreNodeShape.$toRdf(_shaclCoreShape, _parameters);
      case "ShaclCorePropertyShape":
        return ShaclCorePropertyShape.$toRdf(_shaclCoreShape, _parameters);
      default:
        _shaclCoreShape satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
export interface $ObjectSet {
  owlOntology(
    identifier: OwlOntology.$Identifier,
  ): Promise<purify.Either<Error, OwlOntology>>;
  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntology.$Identifier[]>>;
  owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): Promise<readonly purify.Either<Error, OwlOntology>[]>;
  owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntology.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>>;
  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>>;
  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCoreNodeShape>[]>;
  shaclCoreNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShape.$Identifier>, "where">,
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
  ): Promise<readonly purify.Either<Error, ShaclCorePropertyGroup>[]>;
  shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>>;
  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShape.$Identifier[]>
  >;
  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCorePropertyShape>[]>;
  shaclCorePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreShape>>;
  shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.$Identifier[]>>;
  shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCoreShape>[]>;
  shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Identifier>, "where">,
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
  > = {
    readonly identifiers: readonly ObjectIdentifierT[];
    readonly type: "identifiers";
  };
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
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntology.$Identifier[]>> {
    return this.owlOntologyIdentifiersSync(query);
  }

  owlOntologyIdentifiersSync(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): purify.Either<Error, readonly OwlOntology.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<OwlOntology, OwlOntology.$Identifier>(
        OwlOntology,
        query,
      ),
    ]);
  }

  async owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): Promise<readonly purify.Either<Error, OwlOntology>[]> {
    return this.owlOntologiesSync(query);
  }

  owlOntologiesSync(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): readonly purify.Either<Error, OwlOntology>[] {
    return [
      ...this.$objectsSync<OwlOntology, OwlOntology.$Identifier>(
        OwlOntology,
        query,
      ),
    ];
  }

  async owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntology.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.owlOntologiesCountSync(query);
  }

  owlOntologiesCountSync(
    query?: Pick<$ObjectSet.Query<OwlOntology.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<OwlOntology, OwlOntology.$Identifier>(
      OwlOntology,
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
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>> {
    return this.shaclCoreNodeShapeIdentifiersSync(query);
  }

  shaclCoreNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclCoreNodeShape,
        ShaclCoreNodeShape.$Identifier
      >(ShaclCoreNodeShape, query),
    ]);
  }

  async shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCoreNodeShape>[]> {
    return this.shaclCoreNodeShapesSync(query);
  }

  shaclCoreNodeShapesSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): readonly purify.Either<Error, ShaclCoreNodeShape>[] {
    return [
      ...this.$objectsSync<ShaclCoreNodeShape, ShaclCoreNodeShape.$Identifier>(
        ShaclCoreNodeShape,
        query,
      ),
    ];
  }

  async shaclCoreNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCoreNodeShapesCountSync(query);
  }

  shaclCoreNodeShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShape.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShape.$Identifier
    >(ShaclCoreNodeShape, query);
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
    })[0];
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
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclCorePropertyGroup,
        ShaclCorePropertyGroup.$Identifier
      >(ShaclCorePropertyGroup, query),
    ]);
  }

  async shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCorePropertyGroup>[]> {
    return this.shaclCorePropertyGroupsSync(query);
  }

  shaclCorePropertyGroupsSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): readonly purify.Either<Error, ShaclCorePropertyGroup>[] {
    return [
      ...this.$objectsSync<
        ShaclCorePropertyGroup,
        ShaclCorePropertyGroup.$Identifier
      >(ShaclCorePropertyGroup, query),
    ];
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
    identifier: ShaclCorePropertyShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>> {
    return this.shaclCorePropertyShapeSync(identifier);
  }

  shaclCorePropertyShapeSync(
    identifier: ShaclCorePropertyShape.$Identifier,
  ): purify.Either<Error, ShaclCorePropertyShape> {
    return this.shaclCorePropertyShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShape.$Identifier[]>
  > {
    return this.shaclCorePropertyShapeIdentifiersSync(query);
  }

  shaclCorePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclCorePropertyShape.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclCorePropertyShape,
        ShaclCorePropertyShape.$Identifier
      >(ShaclCorePropertyShape, query),
    ]);
  }

  async shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCorePropertyShape>[]> {
    return this.shaclCorePropertyShapesSync(query);
  }

  shaclCorePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): readonly purify.Either<Error, ShaclCorePropertyShape>[] {
    return [
      ...this.$objectsSync<
        ShaclCorePropertyShape,
        ShaclCorePropertyShape.$Identifier
      >(ShaclCorePropertyShape, query),
    ];
  }

  async shaclCorePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCorePropertyShapesCountSync(query);
  }

  shaclCorePropertyShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyShape.$Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShape.$Identifier
    >(ShaclCorePropertyShape, query);
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
    })[0];
  }

  async shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.$Identifier[]>> {
    return this.shaclCoreShapeIdentifiersSync(query);
  }

  shaclCoreShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclCoreShape.$Identifier[]> {
    return purify.Either.of([
      ...this.$objectUnionIdentifiersSync<
        ShaclCoreShape,
        ShaclCoreShape.$Identifier
      >([ShaclCoreNodeShape, ShaclCorePropertyShape], query),
    ]);
  }

  async shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCoreShape>[]> {
    return this.shaclCoreShapesSync(query);
  }

  shaclCoreShapesSync(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): readonly purify.Either<Error, ShaclCoreShape>[] {
    return [
      ...this.$objectUnionsSync<ShaclCoreShape, ShaclCoreShape.$Identifier>(
        [ShaclCoreNodeShape, ShaclCorePropertyShape],
        query,
      ),
    ];
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
    >([ShaclCoreNodeShape, ShaclCorePropertyShape], query);
  }

  protected *$objectIdentifiersSync<
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
  ): Generator<ObjectIdentifierT> {
    for (const object of this.$objectsSync<ObjectT, ObjectIdentifierT>(
      objectType,
      query,
    )) {
      if (object.isRight()) {
        yield object.unsafeCoerce().$identifier;
      }
    }
  }

  protected *$objectsSync<
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
  ): Generator<purify.Either<Error, ObjectT>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return;
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      for (const identifier of query.where.identifiers.slice(
        offset,
        offset + limit,
      )) {
        yield objectType.$fromRdf({
          resource: this.resourceSet.resource(identifier),
        });
      }
      return;
    }

    if (!objectType.$fromRdfType) {
      return;
    }

    const resources = [
      ...this.resourceSet.instancesOf(objectType.$fromRdfType),
    ];
    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.identifier.value.localeCompare(right.identifier.value),
    );

    let objectCount = 0;
    let objectI = 0;
    for (const resource of resources) {
      const object = objectType.$fromRdf({ resource });
      if (object.isLeft()) {
        continue;
      }
      if (objectI++ >= offset) {
        yield object;
        if (++objectCount === limit) {
          return;
        }
      }
    }
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
    let count = 0;
    for (const _ of this.$objectIdentifiersSync<ObjectT, ObjectIdentifierT>(
      objectType,
      query,
    )) {
      count++;
    }

    return purify.Either.of(count);
  }

  protected *$objectUnionIdentifiersSync<
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
  ): Generator<ObjectIdentifierT> {
    for (const object of this.$objectUnionsSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    )) {
      if (object.isRight()) {
        yield object.unsafeCoerce().$identifier;
      }
    }
  }

  protected *$objectUnionsSync<
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
  ): Generator<purify.Either<Error, ObjectT>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return;
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    if (query?.where) {
      // Figure out which object type the identifiers belong to
      for (const identifier of query.where.identifiers.slice(
        offset,
        offset + limit,
      )) {
        const resource = this.resourceSet.resource(identifier);
        const lefts: purify.Either<Error, ObjectT>[] = [];
        for (const objectType of objectTypes) {
          const object = objectType.$fromRdf({ resource });
          if (object.isRight()) {
            yield object;
            break;
          }
          lefts.push(object);
        }
        // Doesn't appear to belong to any of the known object types, just assume the first
        if (lefts.length === objectTypes.length) {
          yield lefts[0];
        }
      }

      return;
    }

    let objectCount = 0;
    let objectI = 0;

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

    for (const { objectType, resource } of resources) {
      const object = objectType.$fromRdf({ resource });
      if (object.isLeft()) {
        continue;
      }
      if (objectI++ >= offset) {
        yield object;
        if (++objectCount === limit) {
          return;
        }
      }
    }
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
    let count = 0;
    for (const _ of this.$objectUnionIdentifiersSync<
      ObjectT,
      ObjectIdentifierT
    >(objectTypes, query)) {
      count++;
    }

    return purify.Either.of(count);
  }
}

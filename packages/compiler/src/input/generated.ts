import type * as rdfjs from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
import { PropertyPath } from "./PropertyPath.js";
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
export interface BaseShaclCoreShape {
  readonly identifier: BaseShaclCoreShapeStatic.Identifier;
  readonly type:
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
  export type Identifier = rdfjsResource.Resource.Identifier;

  export namespace Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, Identifier> {
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

  export function propertiesFromRdf({
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
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
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
    const identifier: BaseShaclCoreShapeStatic.Identifier =
      _resource.identifier;
    const _andEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#and"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((value) => value.toList())
            .map((values) =>
              values.flatMap((_value) =>
                _value
                  .toValues()
                  .head()
                  .chain((_value) => _value.toIdentifier())
                  .toMaybe()
                  .toList(),
              ),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_andEither.isLeft()) {
      return _andEither;
    }

    const and = _andEither.unsafeCoerce();
    const _classesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.NamedNode[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#class"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toIri())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_classesEither.isLeft()) {
      return _classesEither;
    }

    const classes = _classesEither.unsafeCoerce();
    const _commentsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
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
            .chain((_value) => _value.toLiteral())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_commentsEither.isLeft()) {
      return _commentsEither;
    }

    const comments = _commentsEither.unsafeCoerce();
    const _datatypeEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toIri())
        .toMaybe(),
    );
    if (_datatypeEither.isLeft()) {
      return _datatypeEither;
    }

    const datatype = _datatypeEither.unsafeCoerce();
    const _deactivatedEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_deactivatedEither.isLeft()) {
      return _deactivatedEither;
    }

    const deactivated = _deactivatedEither.unsafeCoerce();
    const _flagsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly string[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_flagsEither.isLeft()) {
      return _flagsEither;
    }

    const flags = _flagsEither.unsafeCoerce();
    const _hasValuesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly (rdfjs.Literal | rdfjs.NamedNode)[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) =>
              purify.Either.of(_value.toTerm()).chain((term) => {
                switch (term.termType) {
                  case "Literal":
                  case "NamedNode":
                    return purify.Either.of(term);
                  default:
                    return purify.Left(
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: term,
                        expectedValueType: "(rdfjs.Literal | rdfjs.NamedNode)",
                        focusResource: _resource,
                        predicate: dataFactory.namedNode(
                          "http://www.w3.org/ns/shacl#hasValue",
                        ),
                      }),
                    );
                }
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_hasValuesEither.isLeft()) {
      return _hasValuesEither;
    }

    const hasValues = _hasValuesEither.unsafeCoerce();
    const _in_Either: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<readonly (rdfjs.Literal | rdfjs.NamedNode)[]>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#in"), {
          unique: true,
        })
        .head()
        .chain((value) => value.toList())
        .map((values) =>
          values.flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((_value) =>
                purify.Either.of(_value.toTerm()).chain((term) => {
                  switch (term.termType) {
                    case "Literal":
                    case "NamedNode":
                      return purify.Either.of(term);
                    default:
                      return purify.Left(
                        new rdfjsResource.Resource.MistypedValueError({
                          actualValue: term,
                          expectedValueType:
                            "(rdfjs.Literal | rdfjs.NamedNode)",
                          focusResource: _resource,
                          predicate: dataFactory.namedNode(
                            "http://www.w3.org/ns/shacl#in",
                          ),
                        }),
                      );
                  }
                }),
              )
              .toMaybe()
              .toList(),
          ),
        )
        .toMaybe(),
    );
    if (_in_Either.isLeft()) {
      return _in_Either;
    }

    const in_ = _in_Either.unsafeCoerce();
    const _isDefinedByEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toIdentifier())
        .toMaybe(),
    );
    if (_isDefinedByEither.isLeft()) {
      return _isDefinedByEither;
    }

    const isDefinedBy = _isDefinedByEither.unsafeCoerce();
    const _labelsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
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
            .chain((_value) => _value.toLiteral())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    const _languageInEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<readonly string[]>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
          { unique: true },
        )
        .head()
        .chain((value) => value.toList())
        .map((values) =>
          values.flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((_value) => _value.toString())
              .toMaybe()
              .toList(),
          ),
        )
        .toMaybe(),
    );
    if (_languageInEither.isLeft()) {
      return _languageInEither;
    }

    const languageIn = _languageInEither.unsafeCoerce();
    const _maxCountEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toNumber())
        .toMaybe(),
    );
    if (_maxCountEither.isLeft()) {
      return _maxCountEither;
    }

    const maxCount = _maxCountEither.unsafeCoerce();
    const _maxExclusiveEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
          { unique: true },
        )
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
        .chain((_value) => _value.toLiteral())
        .toMaybe(),
    );
    if (_maxExclusiveEither.isLeft()) {
      return _maxExclusiveEither;
    }

    const maxExclusive = _maxExclusiveEither.unsafeCoerce();
    const _maxInclusiveEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
          { unique: true },
        )
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
        .chain((_value) => _value.toLiteral())
        .toMaybe(),
    );
    if (_maxInclusiveEither.isLeft()) {
      return _maxInclusiveEither;
    }

    const maxInclusive = _maxInclusiveEither.unsafeCoerce();
    const _maxLengthEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toNumber())
        .toMaybe(),
    );
    if (_maxLengthEither.isLeft()) {
      return _maxLengthEither;
    }

    const maxLength = _maxLengthEither.unsafeCoerce();
    const _minCountEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toNumber())
        .toMaybe(),
    );
    if (_minCountEither.isLeft()) {
      return _minCountEither;
    }

    const minCount = _minCountEither.unsafeCoerce();
    const _minExclusiveEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
          { unique: true },
        )
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
        .chain((_value) => _value.toLiteral())
        .toMaybe(),
    );
    if (_minExclusiveEither.isLeft()) {
      return _minExclusiveEither;
    }

    const minExclusive = _minExclusiveEither.unsafeCoerce();
    const _minInclusiveEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
          { unique: true },
        )
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
        .chain((_value) => _value.toLiteral())
        .toMaybe(),
    );
    if (_minInclusiveEither.isLeft()) {
      return _minInclusiveEither;
    }

    const minInclusive = _minInclusiveEither.unsafeCoerce();
    const _minLengthEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toNumber())
        .toMaybe(),
    );
    if (_minLengthEither.isLeft()) {
      return _minLengthEither;
    }

    const minLength = _minLengthEither.unsafeCoerce();
    const _nodeKindEither: purify.Either<
      rdfjsResource.Resource.ValueError,
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
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"), {
          unique: true,
        })
        .head()
        .chain((_value) =>
          _value.toIri().chain((iri) => {
            switch (iri.value) {
              case "http://www.w3.org/ns/shacl#BlankNode":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
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
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: iri,
                    expectedValueType:
                      'rdfjs.NamedNode<"http://www.w3.org/ns/shacl#BlankNode" | "http://www.w3.org/ns/shacl#BlankNodeOrIRI" | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral" | "http://www.w3.org/ns/shacl#IRI" | "http://www.w3.org/ns/shacl#IRIOrLiteral" | "http://www.w3.org/ns/shacl#Literal">',
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#nodeKind",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_nodeKindEither.isLeft()) {
      return _nodeKindEither;
    }

    const nodeKind = _nodeKindEither.unsafeCoerce();
    const _nodesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#node"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toIdentifier())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_nodesEither.isLeft()) {
      return _nodesEither;
    }

    const nodes = _nodesEither.unsafeCoerce();
    const _notEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#not"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toIdentifier())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_notEither.isLeft()) {
      return _notEither;
    }

    const not = _notEither.unsafeCoerce();
    const _orEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#or"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((value) => value.toList())
            .map((values) =>
              values.flatMap((_value) =>
                _value
                  .toValues()
                  .head()
                  .chain((_value) => _value.toIdentifier())
                  .toMaybe()
                  .toList(),
              ),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_orEither.isLeft()) {
      return _orEither;
    }

    const or = _orEither.unsafeCoerce();
    const _patternsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly string[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_patternsEither.isLeft()) {
      return _patternsEither;
    }

    const patterns = _patternsEither.unsafeCoerce();
    const _xoneEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((value) => value.toList())
            .map((values) =>
              values.flatMap((_value) =>
                _value
                  .toValues()
                  .head()
                  .chain((_value) => _value.toIdentifier())
                  .toMaybe()
                  .toList(),
              ),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_xoneEither.isLeft()) {
      return _xoneEither;
    }

    const xone = _xoneEither.unsafeCoerce();
    return purify.Either.of({
      identifier,
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

  export function fromRdf(
    parameters: Parameters<
      typeof BaseShaclCoreShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, BaseShaclCoreShape> {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ShaclCoreNodeShapeStatic.fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        BaseShaclCoreShape
      >
    ).altLazy(
      () =>
        ShaclCorePropertyShapeStatic.fromRdf(otherParameters) as purify.Either<
          rdfjsResource.Resource.ValueError,
          BaseShaclCoreShape
        >,
    );
  }

  export function toRdf(
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
      _baseShaclCoreShape.identifier,
      { mutateGraph },
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#and"),
      _baseShaclCoreShape.and.map((_item) =>
        _item.length > 0
          ? _item.reduce(
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
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
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
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#class"),
      _baseShaclCoreShape.classes.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      _baseShaclCoreShape.comments.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype"),
      _baseShaclCoreShape.datatype,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated"),
      _baseShaclCoreShape.deactivated,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#flags"),
      _baseShaclCoreShape.flags.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"),
      _baseShaclCoreShape.hasValues.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#in"),
      _baseShaclCoreShape.in_.map((_value) =>
        _value.length > 0
          ? _value.reduce(
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
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
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
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#isDefinedBy"),
      _baseShaclCoreShape.isDefinedBy,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _baseShaclCoreShape.labels.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn"),
      _baseShaclCoreShape.languageIn.map((_value) =>
        _value.length > 0
          ? _value.reduce(
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
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
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
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount"),
      _baseShaclCoreShape.maxCount,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive"),
      _baseShaclCoreShape.maxExclusive,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive"),
      _baseShaclCoreShape.maxInclusive,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength"),
      _baseShaclCoreShape.maxLength,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount"),
      _baseShaclCoreShape.minCount,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive"),
      _baseShaclCoreShape.minExclusive,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive"),
      _baseShaclCoreShape.minInclusive,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength"),
      _baseShaclCoreShape.minLength,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind"),
      _baseShaclCoreShape.nodeKind,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#node"),
      _baseShaclCoreShape.nodes.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#not"),
      _baseShaclCoreShape.not.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#or"),
      _baseShaclCoreShape.or.map((_item) =>
        _item.length > 0
          ? _item.reduce(
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
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
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
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern"),
      _baseShaclCoreShape.patterns.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#xone"),
      _baseShaclCoreShape.xone.map((_item) =>
        _item.length > 0
          ? _item.reduce(
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
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
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
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
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
  readonly identifier: ShaclCorePropertyShapeStatic.Identifier;
  readonly type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
  readonly defaultValue: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
  readonly descriptions: readonly rdfjs.Literal[];
  readonly groups: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly names: readonly rdfjs.Literal[];
  readonly order: purify.Maybe<number>;
  readonly path: PropertyPath;
  readonly uniqueLang: purify.Maybe<boolean>;
}

export namespace ShaclCorePropertyShapeStatic {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );
  export type Identifier = BaseShaclCoreShapeStatic.Identifier;
  export const Identifier = BaseShaclCoreShapeStatic.Identifier;

  export function propertiesFromRdf({
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
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
      defaultValue: purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>;
      descriptions: readonly rdfjs.Literal[];
      groups: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
      names: readonly rdfjs.Literal[];
      order: purify.Maybe<number>;
      path: PropertyPath;
      uniqueLang: purify.Maybe<boolean>;
    } & $UnwrapR<ReturnType<typeof BaseShaclCoreShapeStatic.propertiesFromRdf>>
  > {
    const _super0Either = BaseShaclCoreShapeStatic.propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyShape"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    const identifier: ShaclCorePropertyShapeStatic.Identifier =
      _resource.identifier;
    const type = "ShaclCorePropertyShape" as const;
    const _defaultValueEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
          { unique: true },
        )
        .head()
        .chain((_value) =>
          purify.Either.of(_value.toTerm()).chain((term) => {
            switch (term.termType) {
              case "Literal":
              case "NamedNode":
                return purify.Either.of(term);
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: term,
                    expectedValueType: "(rdfjs.Literal | rdfjs.NamedNode)",
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://www.w3.org/ns/shacl#defaultValue",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_defaultValueEither.isLeft()) {
      return _defaultValueEither;
    }

    const defaultValue = _defaultValueEither.unsafeCoerce();
    const _descriptionsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
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
            .chain((_value) => _value.toLiteral())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_descriptionsEither.isLeft()) {
      return _descriptionsEither;
    }

    const descriptions = _descriptionsEither.unsafeCoerce();
    const _groupsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#group"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toIdentifier())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_groupsEither.isLeft()) {
      return _groupsEither;
    }

    const groups = _groupsEither.unsafeCoerce();
    const _namesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#name"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
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
            .chain((_value) => _value.toLiteral())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_namesEither.isLeft()) {
      return _namesEither;
    }

    const names = _namesEither.unsafeCoerce();
    const _orderEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<number>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#order"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toNumber())
        .toMaybe(),
    );
    if (_orderEither.isLeft()) {
      return _orderEither;
    }

    const order = _orderEither.unsafeCoerce();
    const _pathEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      PropertyPath
    > = _resource
      .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#path"), {
        unique: true,
      })
      .head()
      .chain((value) => value.toResource())
      .chain((_resource) =>
        PropertyPath.fromRdf({
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
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_uniqueLangEither.isLeft()) {
      return _uniqueLangEither;
    }

    const uniqueLang = _uniqueLangEither.unsafeCoerce();
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      defaultValue,
      descriptions,
      groups,
      names,
      order,
      path,
      uniqueLang,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof ShaclCorePropertyShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ShaclCorePropertyShape> {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ShaclmatePropertyShape.fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ShaclCorePropertyShape
      >
    ).altLazy(() => ShaclCorePropertyShapeStatic.propertiesFromRdf(parameters));
  }

  export function toRdf(
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
    const _resource = BaseShaclCoreShapeStatic.toRdf(_shaclCorePropertyShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#ShaclCorePropertyShape",
        ),
      );
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyShape",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
      _shaclCorePropertyShape.defaultValue,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#description"),
      _shaclCorePropertyShape.descriptions.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#group"),
      _shaclCorePropertyShape.groups.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#name"),
      _shaclCorePropertyShape.names.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#order"),
      _shaclCorePropertyShape.order,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#path"),
      PropertyPath.toRdf(_shaclCorePropertyShape.path, {
        mutateGraph: mutateGraph,
        resourceSet: resourceSet,
      }),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang"),
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
  readonly identifier: ShaclmatePropertyShape.Identifier;
  readonly type: "ShaclmatePropertyShape";
  readonly extern: purify.Maybe<boolean>;
  readonly mutable: purify.Maybe<boolean>;
  readonly name: purify.Maybe<string>;
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
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );
  export type Identifier = ShaclCorePropertyShapeStatic.Identifier;
  export const Identifier = ShaclCorePropertyShapeStatic.Identifier;

  export function propertiesFromRdf({
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
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "ShaclmatePropertyShape";
      extern: purify.Maybe<boolean>;
      mutable: purify.Maybe<boolean>;
      name: purify.Maybe<string>;
      visibility: purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_Visibility_Private"
          | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
          | "http://purl.org/shaclmate/ontology#_Visibility_Public"
        >
      >;
      widen: purify.Maybe<boolean>;
    } & $UnwrapR<
      ReturnType<typeof ShaclCorePropertyShapeStatic.propertiesFromRdf>
    >
  > {
    const _super0Either = ShaclCorePropertyShapeStatic.propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyShape"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    const identifier: ShaclmatePropertyShape.Identifier = _resource.identifier;
    const type = "ShaclmatePropertyShape" as const;
    const _externEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_externEither.isLeft()) {
      return _externEither;
    }

    const extern = _externEither.unsafeCoerce();
    const _mutableEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_mutableEither.isLeft()) {
      return _mutableEither;
    }

    const mutable = _mutableEither.unsafeCoerce();
    const _nameEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_nameEither.isLeft()) {
      return _nameEither;
    }

    const name = _nameEither.unsafeCoerce();
    const _visibilityEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_Visibility_Private"
          | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
          | "http://purl.org/shaclmate/ontology#_Visibility_Public"
        >
      >
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#visibility",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) =>
          _value.toIri().chain((iri) => {
            switch (iri.value) {
              case "http://purl.org/shaclmate/ontology#_Visibility_Private":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://purl.org/shaclmate/ontology#_Visibility_Private"
                    | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
                    | "http://purl.org/shaclmate/ontology#_Visibility_Public"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Public">,
                );
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: iri,
                    expectedValueType:
                      'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_Visibility_Private" | "http://purl.org/shaclmate/ontology#_Visibility_Protected" | "http://purl.org/shaclmate/ontology#_Visibility_Public">',
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://purl.org/shaclmate/ontology#visibility",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_visibilityEither.isLeft()) {
      return _visibilityEither;
    }

    const visibility = _visibilityEither.unsafeCoerce();
    const _widenEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#widen"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_widenEither.isLeft()) {
      return _widenEither;
    }

    const widen = _widenEither.unsafeCoerce();
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      extern,
      mutable,
      name,
      visibility,
      widen,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof ShaclmatePropertyShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ShaclmatePropertyShape> {
    return ShaclmatePropertyShape.propertiesFromRdf(parameters);
  }

  export function toRdf(
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
    const _resource = ShaclCorePropertyShapeStatic.toRdf(
      _shaclmatePropertyShape,
      { ignoreRdfType: true, mutateGraph, resourceSet },
    );
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyShape",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
      _shaclmatePropertyShape.extern,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
      _shaclmatePropertyShape.mutable,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      _shaclmatePropertyShape.name,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#visibility"),
      _shaclmatePropertyShape.visibility,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#widen"),
      _shaclmatePropertyShape.widen,
    );
    return _resource;
  }

  export const $properties = {
    ...ShaclCorePropertyShapeStatic.$properties,
    extern: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#extern",
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
  readonly identifier: OwlOntologyStatic.Identifier;
  readonly type: "OwlOntology" | "ShaclmateOntology";
  readonly labels: readonly rdfjs.Literal[];
}

export namespace OwlOntologyStatic {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );
  export type Identifier = rdfjsResource.Resource.Identifier;

  export namespace Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, Identifier> {
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

  export function propertiesFromRdf({
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
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "OwlOntology" | "ShaclmateOntology";
      labels: readonly rdfjs.Literal[];
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    const identifier: OwlOntologyStatic.Identifier = _resource.identifier;
    const type = "OwlOntology" as const;
    const _labelsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
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
            .chain((_value) => _value.toLiteral())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    return purify.Either.of({ identifier, type, labels });
  }

  export function fromRdf(
    parameters: Parameters<typeof OwlOntologyStatic.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, OwlOntology> {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ShaclmateOntology.fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        OwlOntology
      >
    ).altLazy(() => OwlOntologyStatic.propertiesFromRdf(parameters));
  }

  export function toRdf(
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
    const _resource = resourceSet.mutableResource(_owlOntology.identifier, {
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#OwlOntology",
        ),
      );
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://www.w3.org/2002/07/owl#Ontology",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _owlOntology.labels.map((_item) => _item),
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
  readonly identifier: ShaclmateOntology.Identifier;
  readonly type: "ShaclmateOntology";
  readonly tsDataFactoryVariable: purify.Maybe<string>;
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
  readonly tsObjectIdentifierPrefixPropertyName: purify.Maybe<string>;
  readonly tsObjectIdentifierPropertyName: purify.Maybe<string>;
  readonly tsObjectTypeDiscriminatorPropertyName: purify.Maybe<string>;
}

export namespace ShaclmateOntology {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );
  export type Identifier = OwlOntologyStatic.Identifier;
  export const Identifier = OwlOntologyStatic.Identifier;

  export function propertiesFromRdf({
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
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "ShaclmateOntology";
      tsDataFactoryVariable: purify.Maybe<string>;
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
      tsObjectIdentifierPrefixPropertyName: purify.Maybe<string>;
      tsObjectIdentifierPropertyName: purify.Maybe<string>;
      tsObjectTypeDiscriminatorPropertyName: purify.Maybe<string>;
    } & $UnwrapR<ReturnType<typeof OwlOntologyStatic.propertiesFromRdf>>
  > {
    const _super0Either = OwlOntologyStatic.propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    const identifier: ShaclmateOntology.Identifier = _resource.identifier;
    const type = "ShaclmateOntology" as const;
    const _tsDataFactoryVariableEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsDataFactoryVariable",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_tsDataFactoryVariableEither.isLeft()) {
      return _tsDataFactoryVariableEither;
    }

    const tsDataFactoryVariable = _tsDataFactoryVariableEither.unsafeCoerce();
    const _tsFeatureExcludesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
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
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsFeatureExclude",
          ),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) =>
              _value.toIri().chain((iri) => {
                switch (iri.value) {
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                    return purify.Left(
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: iri,
                        expectedValueType:
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                        focusResource: _resource,
                        predicate: dataFactory.namedNode(
                          "http://purl.org/shaclmate/ontology#tsFeatureExclude",
                        ),
                      }),
                    );
                }
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_tsFeatureExcludesEither.isLeft()) {
      return _tsFeatureExcludesEither;
    }

    const tsFeatureExcludes = _tsFeatureExcludesEither.unsafeCoerce();
    const _tsFeatureIncludesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
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
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsFeatureInclude",
          ),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) =>
              _value.toIri().chain((iri) => {
                switch (iri.value) {
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                    return purify.Left(
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: iri,
                        expectedValueType:
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                        focusResource: _resource,
                        predicate: dataFactory.namedNode(
                          "http://purl.org/shaclmate/ontology#tsFeatureInclude",
                        ),
                      }),
                    );
                }
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_tsFeatureIncludesEither.isLeft()) {
      return _tsFeatureIncludesEither;
    }

    const tsFeatureIncludes = _tsFeatureIncludesEither.unsafeCoerce();
    const _tsImportsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly string[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_tsImportsEither.isLeft()) {
      return _tsImportsEither;
    }

    const tsImports = _tsImportsEither.unsafeCoerce();
    const _tsObjectDeclarationTypeEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >
      >
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) =>
          _value.toIri().chain((iri) => {
            switch (iri.value) {
              case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                    | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class">,
                );
              case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                    | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">,
                );
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: iri,
                    expectedValueType:
                      'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class" | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">',
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_tsObjectDeclarationTypeEither.isLeft()) {
      return _tsObjectDeclarationTypeEither;
    }

    const tsObjectDeclarationType =
      _tsObjectDeclarationTypeEither.unsafeCoerce();
    const _tsObjectIdentifierPrefixPropertyNameEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsObjectIdentifierPrefixPropertyName",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_tsObjectIdentifierPrefixPropertyNameEither.isLeft()) {
      return _tsObjectIdentifierPrefixPropertyNameEither;
    }

    const tsObjectIdentifierPrefixPropertyName =
      _tsObjectIdentifierPrefixPropertyNameEither.unsafeCoerce();
    const _tsObjectIdentifierPropertyNameEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsObjectIdentifierPropertyName",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_tsObjectIdentifierPropertyNameEither.isLeft()) {
      return _tsObjectIdentifierPropertyNameEither;
    }

    const tsObjectIdentifierPropertyName =
      _tsObjectIdentifierPropertyNameEither.unsafeCoerce();
    const _tsObjectTypeDiscriminatorPropertyNameEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsObjectTypeDiscriminatorPropertyName",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_tsObjectTypeDiscriminatorPropertyNameEither.isLeft()) {
      return _tsObjectTypeDiscriminatorPropertyNameEither;
    }

    const tsObjectTypeDiscriminatorPropertyName =
      _tsObjectTypeDiscriminatorPropertyNameEither.unsafeCoerce();
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      tsDataFactoryVariable,
      tsFeatureExcludes,
      tsFeatureIncludes,
      tsImports,
      tsObjectDeclarationType,
      tsObjectIdentifierPrefixPropertyName,
      tsObjectIdentifierPropertyName,
      tsObjectTypeDiscriminatorPropertyName,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof ShaclmateOntology.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ShaclmateOntology> {
    return ShaclmateOntology.propertiesFromRdf(parameters);
  }

  export function toRdf(
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
    const _resource = OwlOntologyStatic.toRdf(_shaclmateOntology, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://www.w3.org/2002/07/owl#Ontology",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsDataFactoryVariable",
      ),
      _shaclmateOntology.tsDataFactoryVariable,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
      _shaclmateOntology.tsFeatureExcludes.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
      _shaclmateOntology.tsFeatureIncludes.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
      _shaclmateOntology.tsImports.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
      _shaclmateOntology.tsObjectDeclarationType,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPrefixPropertyName",
      ),
      _shaclmateOntology.tsObjectIdentifierPrefixPropertyName,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPropertyName",
      ),
      _shaclmateOntology.tsObjectIdentifierPropertyName,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectTypeDiscriminatorPropertyName",
      ),
      _shaclmateOntology.tsObjectTypeDiscriminatorPropertyName,
    );
    return _resource;
  }

  export const $properties = {
    ...OwlOntologyStatic.$properties,
    tsDataFactoryVariable: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsDataFactoryVariable",
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
    tsObjectIdentifierPrefixPropertyName: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPrefixPropertyName",
      ),
    },
    tsObjectIdentifierPropertyName: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPropertyName",
      ),
    },
    tsObjectTypeDiscriminatorPropertyName: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectTypeDiscriminatorPropertyName",
      ),
    },
  };
}
export interface ShaclCoreNodeShape extends BaseShaclCoreShape {
  readonly identifier: ShaclCoreNodeShapeStatic.Identifier;
  readonly type: "ShaclCoreNodeShape" | "ShaclmateNodeShape";
  readonly closed: purify.Maybe<boolean>;
  readonly ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
  readonly properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
}

export namespace ShaclCoreNodeShapeStatic {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );
  export type Identifier = BaseShaclCoreShapeStatic.Identifier;
  export const Identifier = BaseShaclCoreShapeStatic.Identifier;

  export function propertiesFromRdf({
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
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "ShaclCoreNodeShape" | "ShaclmateNodeShape";
      closed: purify.Maybe<boolean>;
      ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
      properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
    } & $UnwrapR<ReturnType<typeof BaseShaclCoreShapeStatic.propertiesFromRdf>>
  > {
    const _super0Either = BaseShaclCoreShapeStatic.propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    const identifier: ShaclCoreNodeShapeStatic.Identifier =
      _resource.identifier;
    const type = "ShaclCoreNodeShape" as const;
    const _closedEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"), {
          unique: true,
        })
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_closedEither.isLeft()) {
      return _closedEither;
    }

    const closed = _closedEither.unsafeCoerce();
    const _ignoredPropertiesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<readonly rdfjs.NamedNode[]>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#ignoredProperties"),
          { unique: true },
        )
        .head()
        .chain((value) => value.toList())
        .map((values) =>
          values.flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((_value) => _value.toIri())
              .toMaybe()
              .toList(),
          ),
        )
        .toMaybe(),
    );
    if (_ignoredPropertiesEither.isLeft()) {
      return _ignoredPropertiesEither;
    }

    const ignoredProperties = _ignoredPropertiesEither.unsafeCoerce();
    const _propertiesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#property"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toIdentifier())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_propertiesEither.isLeft()) {
      return _propertiesEither;
    }

    const properties = _propertiesEither.unsafeCoerce();
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      closed,
      ignoredProperties,
      properties,
    });
  }

  export function fromRdf(
    parameters: Parameters<
      typeof ShaclCoreNodeShapeStatic.propertiesFromRdf
    >[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ShaclCoreNodeShape> {
    const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters;
    return (
      ShaclmateNodeShape.fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ShaclCoreNodeShape
      >
    ).altLazy(() => ShaclCoreNodeShapeStatic.propertiesFromRdf(parameters));
  }

  export function toRdf(
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
    const _resource = BaseShaclCoreShapeStatic.toRdf(_shaclCoreNodeShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#ShaclCoreNodeShape",
        ),
      );
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#closed"),
      _shaclCoreNodeShape.closed,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#ignoredProperties"),
      _shaclCoreNodeShape.ignoredProperties.map((_value) =>
        _value.length > 0
          ? _value.reduce(
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
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    newSubListResource.identifier,
                  );
                  currentSubListResource = newSubListResource;
                }

                currentSubListResource.add(
                  dataFactory.namedNode(
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
                  ),
                  item,
                );

                if (itemIndex + 1 === list.length) {
                  currentSubListResource.add(
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
                    ),
                    dataFactory.namedNode(
                      "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
                    ),
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
          : dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
            ),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/ns/shacl#property"),
      _shaclCoreNodeShape.properties.map((_item) => _item),
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
  readonly identifier: ShaclmateNodeShape.Identifier;
  readonly type: "ShaclmateNodeShape";
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
  readonly tsObjectIdentifierPrefixPropertyName: purify.Maybe<string>;
  readonly tsObjectIdentifierPropertyName: purify.Maybe<string>;
  readonly tsObjectTypeDiscriminatorPropertyName: purify.Maybe<string>;
}

export namespace ShaclmateNodeShape {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );
  export type Identifier = ShaclCoreNodeShapeStatic.Identifier;
  export const Identifier = ShaclCoreNodeShapeStatic.Identifier;

  export function propertiesFromRdf({
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
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "ShaclmateNodeShape";
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
      tsObjectIdentifierPrefixPropertyName: purify.Maybe<string>;
      tsObjectIdentifierPropertyName: purify.Maybe<string>;
      tsObjectTypeDiscriminatorPropertyName: purify.Maybe<string>;
    } & $UnwrapR<ReturnType<typeof ShaclCoreNodeShapeStatic.propertiesFromRdf>>
  > {
    const _super0Either = ShaclCoreNodeShapeStatic.propertiesFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    });
    if (_super0Either.isLeft()) {
      return _super0Either;
    }

    const _super0 = _super0Either.unsafeCoerce();
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    const identifier: ShaclmateNodeShape.Identifier = _resource.identifier;
    const type = "ShaclmateNodeShape" as const;
    const _abstractEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#abstract"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_abstractEither.isLeft()) {
      return _abstractEither;
    }

    const abstract = _abstractEither.unsafeCoerce();
    const _export_Either: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#export"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_export_Either.isLeft()) {
      return _export_Either;
    }

    const export_ = _export_Either.unsafeCoerce();
    const _externEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_externEither.isLeft()) {
      return _externEither;
    }

    const extern = _externEither.unsafeCoerce();
    const _fromRdfTypeEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#fromRdfType",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toIri())
        .toMaybe(),
    );
    if (_fromRdfTypeEither.isLeft()) {
      return _fromRdfTypeEither;
    }

    const fromRdfType = _fromRdfTypeEither.unsafeCoerce();
    const _identifierMintingStrategyEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
          | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
        >
      >
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) =>
          _value.toIri().chain((iri) => {
            switch (iri.value) {
              case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
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
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
                    | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
                    | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4">,
                );
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: iri,
                    expectedValueType:
                      'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode" | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256" | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4">',
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_identifierMintingStrategyEither.isLeft()) {
      return _identifierMintingStrategyEither;
    }

    const identifierMintingStrategy =
      _identifierMintingStrategyEither.unsafeCoerce();
    const _mutableEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<boolean>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toBoolean())
        .toMaybe(),
    );
    if (_mutableEither.isLeft()) {
      return _mutableEither;
    }

    const mutable = _mutableEither.unsafeCoerce();
    const _nameEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_nameEither.isLeft()) {
      return _nameEither;
    }

    const name = _nameEither.unsafeCoerce();
    const _rdfTypeEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.NamedNode>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#rdfType"),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toIri())
        .toMaybe(),
    );
    if (_rdfTypeEither.isLeft()) {
      return _rdfTypeEither;
    }

    const rdfType = _rdfTypeEither.unsafeCoerce();
    const _toRdfTypesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.NamedNode[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#toRdfType"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toIri())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_toRdfTypesEither.isLeft()) {
      return _toRdfTypesEither;
    }

    const toRdfTypes = _toRdfTypesEither.unsafeCoerce();
    const _tsFeatureExcludesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
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
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsFeatureExclude",
          ),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) =>
              _value.toIri().chain((iri) => {
                switch (iri.value) {
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                    return purify.Left(
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: iri,
                        expectedValueType:
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                        focusResource: _resource,
                        predicate: dataFactory.namedNode(
                          "http://purl.org/shaclmate/ontology#tsFeatureExclude",
                        ),
                      }),
                    );
                }
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_tsFeatureExcludesEither.isLeft()) {
      return _tsFeatureExcludesEither;
    }

    const tsFeatureExcludes = _tsFeatureExcludesEither.unsafeCoerce();
    const _tsFeatureIncludesEither: purify.Either<
      rdfjsResource.Resource.ValueError,
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
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsFeatureInclude",
          ),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) =>
              _value.toIri().chain((iri) => {
                switch (iri.value) {
                  case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                      rdfjsResource.Resource.ValueError,
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
                    return purify.Left(
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: iri,
                        expectedValueType:
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeatures_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeatures_Default" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeatures_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
                        focusResource: _resource,
                        predicate: dataFactory.namedNode(
                          "http://purl.org/shaclmate/ontology#tsFeatureInclude",
                        ),
                      }),
                    );
                }
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_tsFeatureIncludesEither.isLeft()) {
      return _tsFeatureIncludesEither;
    }

    const tsFeatureIncludes = _tsFeatureIncludesEither.unsafeCoerce();
    const _tsImportsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly string[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => _value.toString())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_tsImportsEither.isLeft()) {
      return _tsImportsEither;
    }

    const tsImports = _tsImportsEither.unsafeCoerce();
    const _tsObjectDeclarationTypeEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<
        rdfjs.NamedNode<
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
          | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
        >
      >
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) =>
          _value.toIri().chain((iri) => {
            switch (iri.value) {
              case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                    | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class">,
                );
              case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
                return purify.Either.of<
                  rdfjsResource.Resource.ValueError,
                  rdfjs.NamedNode<
                    | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
                    | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
                  >
                >(
                  iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">,
                );
              default:
                return purify.Left(
                  new rdfjsResource.Resource.MistypedValueError({
                    actualValue: iri,
                    expectedValueType:
                      'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class" | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface">',
                    focusResource: _resource,
                    predicate: dataFactory.namedNode(
                      "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
                    ),
                  }),
                );
            }
          }),
        )
        .toMaybe(),
    );
    if (_tsObjectDeclarationTypeEither.isLeft()) {
      return _tsObjectDeclarationTypeEither;
    }

    const tsObjectDeclarationType =
      _tsObjectDeclarationTypeEither.unsafeCoerce();
    const _tsObjectIdentifierPrefixPropertyNameEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsObjectIdentifierPrefixPropertyName",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_tsObjectIdentifierPrefixPropertyNameEither.isLeft()) {
      return _tsObjectIdentifierPrefixPropertyNameEither;
    }

    const tsObjectIdentifierPrefixPropertyName =
      _tsObjectIdentifierPrefixPropertyNameEither.unsafeCoerce();
    const _tsObjectIdentifierPropertyNameEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsObjectIdentifierPropertyName",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_tsObjectIdentifierPropertyNameEither.isLeft()) {
      return _tsObjectIdentifierPropertyNameEither;
    }

    const tsObjectIdentifierPropertyName =
      _tsObjectIdentifierPropertyNameEither.unsafeCoerce();
    const _tsObjectTypeDiscriminatorPropertyNameEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<string>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode(
            "http://purl.org/shaclmate/ontology#tsObjectTypeDiscriminatorPropertyName",
          ),
          { unique: true },
        )
        .head()
        .chain((_value) => _value.toString())
        .toMaybe(),
    );
    if (_tsObjectTypeDiscriminatorPropertyNameEither.isLeft()) {
      return _tsObjectTypeDiscriminatorPropertyNameEither;
    }

    const tsObjectTypeDiscriminatorPropertyName =
      _tsObjectTypeDiscriminatorPropertyNameEither.unsafeCoerce();
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
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
      tsObjectIdentifierPrefixPropertyName,
      tsObjectIdentifierPropertyName,
      tsObjectTypeDiscriminatorPropertyName,
    });
  }

  export function fromRdf(
    parameters: Parameters<typeof ShaclmateNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ShaclmateNodeShape> {
    return ShaclmateNodeShape.propertiesFromRdf(parameters);
  }

  export function toRdf(
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
    const _resource = ShaclCoreNodeShapeStatic.toRdf(_shaclmateNodeShape, {
      ignoreRdfType: true,
      mutateGraph,
      resourceSet,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#abstract"),
      _shaclmateNodeShape.abstract,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#export"),
      _shaclmateNodeShape.export_,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
      _shaclmateNodeShape.extern,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#fromRdfType"),
      _shaclmateNodeShape.fromRdfType,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
      ),
      _shaclmateNodeShape.identifierMintingStrategy,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
      _shaclmateNodeShape.mutable,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#name"),
      _shaclmateNodeShape.name,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#rdfType"),
      _shaclmateNodeShape.rdfType,
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#toRdfType"),
      _shaclmateNodeShape.toRdfTypes.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
      _shaclmateNodeShape.tsFeatureExcludes.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
      _shaclmateNodeShape.tsFeatureIncludes.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://purl.org/shaclmate/ontology#tsImport"),
      _shaclmateNodeShape.tsImports.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
      _shaclmateNodeShape.tsObjectDeclarationType,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPrefixPropertyName",
      ),
      _shaclmateNodeShape.tsObjectIdentifierPrefixPropertyName,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPropertyName",
      ),
      _shaclmateNodeShape.tsObjectIdentifierPropertyName,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectTypeDiscriminatorPropertyName",
      ),
      _shaclmateNodeShape.tsObjectTypeDiscriminatorPropertyName,
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
    tsObjectIdentifierPrefixPropertyName: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPrefixPropertyName",
      ),
    },
    tsObjectIdentifierPropertyName: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPropertyName",
      ),
    },
    tsObjectTypeDiscriminatorPropertyName: {
      identifier: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectTypeDiscriminatorPropertyName",
      ),
    },
  };
}
export interface ShaclCorePropertyGroup {
  readonly identifier: ShaclCorePropertyGroup.Identifier;
  readonly type: "ShaclCorePropertyGroup";
  readonly comments: readonly rdfjs.Literal[];
  readonly labels: readonly rdfjs.Literal[];
}

export namespace ShaclCorePropertyGroup {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyGroup",
  );
  export type Identifier = rdfjsResource.Resource.Identifier;

  export namespace Identifier {
    export function fromString(
      identifier: string,
    ): purify.Either<Error, Identifier> {
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

  export function propertiesFromRdf({
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
    rdfjsResource.Resource.ValueError,
    {
      identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      type: "ShaclCorePropertyGroup";
      comments: readonly rdfjs.Literal[];
      labels: readonly rdfjs.Literal[];
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/ns/shacl#PropertyGroup"),
      )
    ) {
      return _resource
        .value(
          dataFactory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          ),
        )
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) =>
          purify.Left(
            new rdfjsResource.Resource.ValueError({
              focusResource: _resource,
              message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
              predicate: dataFactory.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              ),
            }),
          ),
        );
    }

    const identifier: ShaclCorePropertyGroup.Identifier = _resource.identifier;
    const type = "ShaclCorePropertyGroup" as const;
    const _commentsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
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
            .chain((_value) => _value.toLiteral())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_commentsEither.isLeft()) {
      return _commentsEither;
    }

    const comments = _commentsEither.unsafeCoerce();
    const _labelsEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
          { unique: true },
        )
        .flatMap((_item) =>
          _item
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
            .chain((_value) => _value.toLiteral())
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    return purify.Either.of({ identifier, type, comments, labels });
  }

  export function fromRdf(
    parameters: Parameters<typeof ShaclCorePropertyGroup.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ShaclCorePropertyGroup> {
    return ShaclCorePropertyGroup.propertiesFromRdf(parameters);
  }

  export function toRdf(
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
      _shaclCorePropertyGroup.identifier,
      { mutateGraph },
    );
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyGroup",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#comment"),
      _shaclCorePropertyGroup.comments.map((_item) => _item),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
      _shaclCorePropertyGroup.labels.map((_item) => _item),
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
  export function fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<rdfjsResource.Resource.ValueError, ShaclCoreShape> {
    return (
      ShaclCoreNodeShapeStatic.fromRdf({
        ...context,
        resource,
      }) as purify.Either<rdfjsResource.Resource.ValueError, ShaclCoreShape>
    ).altLazy(
      () =>
        ShaclCorePropertyShapeStatic.fromRdf({
          ...context,
          resource,
        }) as purify.Either<rdfjsResource.Resource.ValueError, ShaclCoreShape>,
    );
  }

  export type Identifier =
    | ShaclCoreNodeShapeStatic.Identifier
    | ShaclCorePropertyShapeStatic.Identifier;

  export function toRdf(
    _shaclCoreShape: ShaclCoreShape,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_shaclCoreShape.type) {
      case "ShaclCoreNodeShape":
      case "ShaclmateNodeShape":
        return ShaclCoreNodeShapeStatic.toRdf(_shaclCoreShape, _parameters);
      case "ShaclCorePropertyShape":
      case "ShaclmatePropertyShape":
        return ShaclCorePropertyShapeStatic.toRdf(_shaclCoreShape, _parameters);
      default:
        _shaclCoreShape satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
export type ShaclmateShape = ShaclmateNodeShape | ShaclCorePropertyShape;

export namespace ShaclmateShape {
  export function fromRdf({
    ignoreRdfType,
    resource,
    ...context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): purify.Either<rdfjsResource.Resource.ValueError, ShaclmateShape> {
    return (
      ShaclmateNodeShape.fromRdf({ ...context, resource }) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ShaclmateShape
      >
    ).altLazy(
      () =>
        ShaclCorePropertyShapeStatic.fromRdf({
          ...context,
          resource,
        }) as purify.Either<rdfjsResource.Resource.ValueError, ShaclmateShape>,
    );
  }

  export type Identifier =
    | ShaclmateNodeShape.Identifier
    | ShaclCorePropertyShapeStatic.Identifier;

  export function toRdf(
    _shaclmateShape: ShaclmateShape,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_shaclmateShape.type) {
      case "ShaclmateNodeShape":
        return ShaclmateNodeShape.toRdf(_shaclmateShape, _parameters);
      case "ShaclCorePropertyShape":
      case "ShaclmatePropertyShape":
        return ShaclCorePropertyShapeStatic.toRdf(_shaclmateShape, _parameters);
      default:
        _shaclmateShape satisfies never;
        throw new Error("unrecognized type");
    }
  }
}
export interface $ObjectSet {
  owlOntology(
    identifier: OwlOntologyStatic.Identifier,
  ): Promise<purify.Either<Error, OwlOntology>>;
  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntologyStatic.Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntologyStatic.Identifier[]>>;
  owlOntologies(
    query?: $ObjectSet.Query<OwlOntologyStatic.Identifier>,
  ): Promise<readonly purify.Either<Error, OwlOntology>[]>;
  owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShapeStatic.Identifier,
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>>;
  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCoreNodeShapeStatic.Identifier[]>
  >;
  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCoreNodeShape>[]>;
  shaclCoreNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyGroup>>;
  shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyGroup.Identifier[]>
  >;
  shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCorePropertyGroup>[]>;
  shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShapeStatic.Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>>;
  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShapeStatic.Identifier[]>
  >;
  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCorePropertyShape>[]>;
  shaclCorePropertyShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>>;
  shaclmateNodeShape(
    identifier: ShaclmateNodeShape.Identifier,
  ): Promise<purify.Either<Error, ShaclmateNodeShape>>;
  shaclmateNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateNodeShape.Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateNodeShape.Identifier[]>>;
  shaclmateNodeShapes(
    query?: $ObjectSet.Query<ShaclmateNodeShape.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclmateNodeShape>[]>;
  shaclmateNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclmateOntology(
    identifier: ShaclmateOntology.Identifier,
  ): Promise<purify.Either<Error, ShaclmateOntology>>;
  shaclmateOntologyIdentifiers(
    query?: $ObjectSet.Query<ShaclmateOntology.Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateOntology.Identifier[]>>;
  shaclmateOntologies(
    query?: $ObjectSet.Query<ShaclmateOntology.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclmateOntology>[]>;
  shaclmateOntologiesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclmatePropertyShape(
    identifier: ShaclmatePropertyShape.Identifier,
  ): Promise<purify.Either<Error, ShaclmatePropertyShape>>;
  shaclmatePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclmatePropertyShape.Identifier[]>
  >;
  shaclmatePropertyShapes(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclmatePropertyShape>[]>;
  shaclmatePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclCoreShape(
    identifier: ShaclCoreShape.Identifier,
  ): Promise<purify.Either<Error, ShaclCoreShape>>;
  shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.Identifier[]>>;
  shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCoreShape>[]>;
  shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>>;
  shaclmateShape(
    identifier: ShaclmateShape.Identifier,
  ): Promise<purify.Either<Error, ShaclmateShape>>;
  shaclmateShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateShape.Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateShape.Identifier[]>>;
  shaclmateShapes(
    query?: $ObjectSet.Query<ShaclmateShape.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclmateShape>[]>;
  shaclmateShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.Identifier>, "where">,
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
    identifier: OwlOntologyStatic.Identifier,
  ): Promise<purify.Either<Error, OwlOntology>> {
    return this.owlOntologySync(identifier);
  }

  owlOntologySync(
    identifier: OwlOntologyStatic.Identifier,
  ): purify.Either<Error, OwlOntology> {
    return this.owlOntologiesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntologyStatic.Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntologyStatic.Identifier[]>> {
    return this.owlOntologyIdentifiersSync(query);
  }

  owlOntologyIdentifiersSync(
    query?: $ObjectSet.Query<OwlOntologyStatic.Identifier>,
  ): purify.Either<Error, readonly OwlOntologyStatic.Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<OwlOntology, OwlOntologyStatic.Identifier>(
        OwlOntologyStatic,
        query,
      ),
    ]);
  }

  async owlOntologies(
    query?: $ObjectSet.Query<OwlOntologyStatic.Identifier>,
  ): Promise<readonly purify.Either<Error, OwlOntology>[]> {
    return this.owlOntologiesSync(query);
  }

  owlOntologiesSync(
    query?: $ObjectSet.Query<OwlOntologyStatic.Identifier>,
  ): readonly purify.Either<Error, OwlOntology>[] {
    return [
      ...this.$objectsSync<OwlOntology, OwlOntologyStatic.Identifier>(
        OwlOntologyStatic,
        query,
      ),
    ];
  }

  async owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.owlOntologiesCountSync(query);
  }

  owlOntologiesCountSync(
    query?: Pick<$ObjectSet.Query<OwlOntologyStatic.Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<OwlOntology, OwlOntologyStatic.Identifier>(
      OwlOntologyStatic,
      query,
    );
  }

  async shaclCoreNodeShape(
    identifier: ShaclCoreNodeShapeStatic.Identifier,
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>> {
    return this.shaclCoreNodeShapeSync(identifier);
  }

  shaclCoreNodeShapeSync(
    identifier: ShaclCoreNodeShapeStatic.Identifier,
  ): purify.Either<Error, ShaclCoreNodeShape> {
    return this.shaclCoreNodeShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCoreNodeShapeStatic.Identifier[]>
  > {
    return this.shaclCoreNodeShapeIdentifiersSync(query);
  }

  shaclCoreNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
  ): purify.Either<Error, readonly ShaclCoreNodeShapeStatic.Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclCoreNodeShape,
        ShaclCoreNodeShapeStatic.Identifier
      >(ShaclCoreNodeShapeStatic, query),
    ]);
  }

  async shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCoreNodeShape>[]> {
    return this.shaclCoreNodeShapesSync(query);
  }

  shaclCoreNodeShapesSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
  ): readonly purify.Either<Error, ShaclCoreNodeShape>[] {
    return [
      ...this.$objectsSync<
        ShaclCoreNodeShape,
        ShaclCoreNodeShapeStatic.Identifier
      >(ShaclCoreNodeShapeStatic, query),
    ];
  }

  async shaclCoreNodeShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCoreNodeShapesCountSync(query);
  }

  shaclCoreNodeShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<ShaclCoreNodeShapeStatic.Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShapeStatic.Identifier
    >(ShaclCoreNodeShapeStatic, query);
  }

  async shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyGroup>> {
    return this.shaclCorePropertyGroupSync(identifier);
  }

  shaclCorePropertyGroupSync(
    identifier: ShaclCorePropertyGroup.Identifier,
  ): purify.Either<Error, ShaclCorePropertyGroup> {
    return this.shaclCorePropertyGroupsSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyGroup.Identifier[]>
  > {
    return this.shaclCorePropertyGroupIdentifiersSync(query);
  }

  shaclCorePropertyGroupIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.Identifier>,
  ): purify.Either<Error, readonly ShaclCorePropertyGroup.Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclCorePropertyGroup,
        ShaclCorePropertyGroup.Identifier
      >(ShaclCorePropertyGroup, query),
    ]);
  }

  async shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCorePropertyGroup>[]> {
    return this.shaclCorePropertyGroupsSync(query);
  }

  shaclCorePropertyGroupsSync(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.Identifier>,
  ): readonly purify.Either<Error, ShaclCorePropertyGroup>[] {
    return [
      ...this.$objectsSync<
        ShaclCorePropertyGroup,
        ShaclCorePropertyGroup.Identifier
      >(ShaclCorePropertyGroup, query),
    ];
  }

  async shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCorePropertyGroupsCountSync(query);
  }

  shaclCorePropertyGroupsCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclCorePropertyGroup,
      ShaclCorePropertyGroup.Identifier
    >(ShaclCorePropertyGroup, query);
  }

  async shaclCorePropertyShape(
    identifier: ShaclCorePropertyShapeStatic.Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>> {
    return this.shaclCorePropertyShapeSync(identifier);
  }

  shaclCorePropertyShapeSync(
    identifier: ShaclCorePropertyShapeStatic.Identifier,
  ): purify.Either<Error, ShaclCorePropertyShape> {
    return this.shaclCorePropertyShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShapeStatic.Identifier[]>
  > {
    return this.shaclCorePropertyShapeIdentifiersSync(query);
  }

  shaclCorePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
  ): purify.Either<Error, readonly ShaclCorePropertyShapeStatic.Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclCorePropertyShape,
        ShaclCorePropertyShapeStatic.Identifier
      >(ShaclCorePropertyShapeStatic, query),
    ]);
  }

  async shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCorePropertyShape>[]> {
    return this.shaclCorePropertyShapesSync(query);
  }

  shaclCorePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
  ): readonly purify.Either<Error, ShaclCorePropertyShape>[] {
    return [
      ...this.$objectsSync<
        ShaclCorePropertyShape,
        ShaclCorePropertyShapeStatic.Identifier
      >(ShaclCorePropertyShapeStatic, query),
    ];
  }

  async shaclCorePropertyShapesCount(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
      "where"
    >,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCorePropertyShapesCountSync(query);
  }

  shaclCorePropertyShapesCountSync(
    query?: Pick<
      $ObjectSet.Query<ShaclCorePropertyShapeStatic.Identifier>,
      "where"
    >,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShapeStatic.Identifier
    >(ShaclCorePropertyShapeStatic, query);
  }

  async shaclmateNodeShape(
    identifier: ShaclmateNodeShape.Identifier,
  ): Promise<purify.Either<Error, ShaclmateNodeShape>> {
    return this.shaclmateNodeShapeSync(identifier);
  }

  shaclmateNodeShapeSync(
    identifier: ShaclmateNodeShape.Identifier,
  ): purify.Either<Error, ShaclmateNodeShape> {
    return this.shaclmateNodeShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclmateNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateNodeShape.Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateNodeShape.Identifier[]>> {
    return this.shaclmateNodeShapeIdentifiersSync(query);
  }

  shaclmateNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateNodeShape.Identifier>,
  ): purify.Either<Error, readonly ShaclmateNodeShape.Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclmateNodeShape,
        ShaclmateNodeShape.Identifier
      >(ShaclmateNodeShape, query),
    ]);
  }

  async shaclmateNodeShapes(
    query?: $ObjectSet.Query<ShaclmateNodeShape.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclmateNodeShape>[]> {
    return this.shaclmateNodeShapesSync(query);
  }

  shaclmateNodeShapesSync(
    query?: $ObjectSet.Query<ShaclmateNodeShape.Identifier>,
  ): readonly purify.Either<Error, ShaclmateNodeShape>[] {
    return [
      ...this.$objectsSync<ShaclmateNodeShape, ShaclmateNodeShape.Identifier>(
        ShaclmateNodeShape,
        query,
      ),
    ];
  }

  async shaclmateNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclmateNodeShapesCountSync(query);
  }

  shaclmateNodeShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateNodeShape.Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclmateNodeShape,
      ShaclmateNodeShape.Identifier
    >(ShaclmateNodeShape, query);
  }

  async shaclmateOntology(
    identifier: ShaclmateOntology.Identifier,
  ): Promise<purify.Either<Error, ShaclmateOntology>> {
    return this.shaclmateOntologySync(identifier);
  }

  shaclmateOntologySync(
    identifier: ShaclmateOntology.Identifier,
  ): purify.Either<Error, ShaclmateOntology> {
    return this.shaclmateOntologiesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclmateOntologyIdentifiers(
    query?: $ObjectSet.Query<ShaclmateOntology.Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateOntology.Identifier[]>> {
    return this.shaclmateOntologyIdentifiersSync(query);
  }

  shaclmateOntologyIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateOntology.Identifier>,
  ): purify.Either<Error, readonly ShaclmateOntology.Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclmateOntology,
        ShaclmateOntology.Identifier
      >(ShaclmateOntology, query),
    ]);
  }

  async shaclmateOntologies(
    query?: $ObjectSet.Query<ShaclmateOntology.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclmateOntology>[]> {
    return this.shaclmateOntologiesSync(query);
  }

  shaclmateOntologiesSync(
    query?: $ObjectSet.Query<ShaclmateOntology.Identifier>,
  ): readonly purify.Either<Error, ShaclmateOntology>[] {
    return [
      ...this.$objectsSync<ShaclmateOntology, ShaclmateOntology.Identifier>(
        ShaclmateOntology,
        query,
      ),
    ];
  }

  async shaclmateOntologiesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclmateOntologiesCountSync(query);
  }

  shaclmateOntologiesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateOntology.Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclmateOntology,
      ShaclmateOntology.Identifier
    >(ShaclmateOntology, query);
  }

  async shaclmatePropertyShape(
    identifier: ShaclmatePropertyShape.Identifier,
  ): Promise<purify.Either<Error, ShaclmatePropertyShape>> {
    return this.shaclmatePropertyShapeSync(identifier);
  }

  shaclmatePropertyShapeSync(
    identifier: ShaclmatePropertyShape.Identifier,
  ): purify.Either<Error, ShaclmatePropertyShape> {
    return this.shaclmatePropertyShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclmatePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclmatePropertyShape.Identifier[]>
  > {
    return this.shaclmatePropertyShapeIdentifiersSync(query);
  }

  shaclmatePropertyShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.Identifier>,
  ): purify.Either<Error, readonly ShaclmatePropertyShape.Identifier[]> {
    return purify.Either.of([
      ...this.$objectIdentifiersSync<
        ShaclmatePropertyShape,
        ShaclmatePropertyShape.Identifier
      >(ShaclmatePropertyShape, query),
    ]);
  }

  async shaclmatePropertyShapes(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclmatePropertyShape>[]> {
    return this.shaclmatePropertyShapesSync(query);
  }

  shaclmatePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclmatePropertyShape.Identifier>,
  ): readonly purify.Either<Error, ShaclmatePropertyShape>[] {
    return [
      ...this.$objectsSync<
        ShaclmatePropertyShape,
        ShaclmatePropertyShape.Identifier
      >(ShaclmatePropertyShape, query),
    ];
  }

  async shaclmatePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclmatePropertyShapesCountSync(query);
  }

  shaclmatePropertyShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmatePropertyShape.Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectsCountSync<
      ShaclmatePropertyShape,
      ShaclmatePropertyShape.Identifier
    >(ShaclmatePropertyShape, query);
  }

  async shaclCoreShape(
    identifier: ShaclCoreShape.Identifier,
  ): Promise<purify.Either<Error, ShaclCoreShape>> {
    return this.shaclCoreShapeSync(identifier);
  }

  shaclCoreShapeSync(
    identifier: ShaclCoreShape.Identifier,
  ): purify.Either<Error, ShaclCoreShape> {
    return this.shaclCoreShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.Identifier[]>> {
    return this.shaclCoreShapeIdentifiersSync(query);
  }

  shaclCoreShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreShape.Identifier>,
  ): purify.Either<Error, readonly ShaclCoreShape.Identifier[]> {
    return purify.Either.of([
      ...this.$objectUnionIdentifiersSync<
        ShaclCoreShape,
        ShaclCoreShape.Identifier
      >([ShaclCoreNodeShapeStatic, ShaclCorePropertyShapeStatic], query),
    ]);
  }

  async shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclCoreShape>[]> {
    return this.shaclCoreShapesSync(query);
  }

  shaclCoreShapesSync(
    query?: $ObjectSet.Query<ShaclCoreShape.Identifier>,
  ): readonly purify.Either<Error, ShaclCoreShape>[] {
    return [
      ...this.$objectUnionsSync<ShaclCoreShape, ShaclCoreShape.Identifier>(
        [ShaclCoreNodeShapeStatic, ShaclCorePropertyShapeStatic],
        query,
      ),
    ];
  }

  async shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclCoreShapesCountSync(query);
  }

  shaclCoreShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectUnionsCountSync<
      ShaclCoreShape,
      ShaclCoreShape.Identifier
    >([ShaclCoreNodeShapeStatic, ShaclCorePropertyShapeStatic], query);
  }

  async shaclmateShape(
    identifier: ShaclmateShape.Identifier,
  ): Promise<purify.Either<Error, ShaclmateShape>> {
    return this.shaclmateShapeSync(identifier);
  }

  shaclmateShapeSync(
    identifier: ShaclmateShape.Identifier,
  ): purify.Either<Error, ShaclmateShape> {
    return this.shaclmateShapesSync({
      where: { identifiers: [identifier], type: "identifiers" },
    })[0];
  }

  async shaclmateShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclmateShape.Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclmateShape.Identifier[]>> {
    return this.shaclmateShapeIdentifiersSync(query);
  }

  shaclmateShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclmateShape.Identifier>,
  ): purify.Either<Error, readonly ShaclmateShape.Identifier[]> {
    return purify.Either.of([
      ...this.$objectUnionIdentifiersSync<
        ShaclmateShape,
        ShaclmateShape.Identifier
      >([ShaclmateNodeShape, ShaclCorePropertyShapeStatic], query),
    ]);
  }

  async shaclmateShapes(
    query?: $ObjectSet.Query<ShaclmateShape.Identifier>,
  ): Promise<readonly purify.Either<Error, ShaclmateShape>[]> {
    return this.shaclmateShapesSync(query);
  }

  shaclmateShapesSync(
    query?: $ObjectSet.Query<ShaclmateShape.Identifier>,
  ): readonly purify.Either<Error, ShaclmateShape>[] {
    return [
      ...this.$objectUnionsSync<ShaclmateShape, ShaclmateShape.Identifier>(
        [ShaclmateNodeShape, ShaclCorePropertyShapeStatic],
        query,
      ),
    ];
  }

  async shaclmateShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.shaclmateShapesCountSync(query);
  }

  shaclmateShapesCountSync(
    query?: Pick<$ObjectSet.Query<ShaclmateShape.Identifier>, "where">,
  ): purify.Either<Error, number> {
    return this.$objectUnionsCountSync<
      ShaclmateShape,
      ShaclmateShape.Identifier
    >([ShaclmateNodeShape, ShaclCorePropertyShapeStatic], query);
  }

  protected *$objectIdentifiersSync<
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
    },
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<ObjectIdentifierT> {
    for (const object of this.$objectsSync<ObjectT, ObjectIdentifierT>(
      objectType,
      query,
    )) {
      if (object.isRight()) {
        yield object.unsafeCoerce().identifier;
      }
    }
  }

  protected *$objectsSync<
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
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
        yield objectType.fromRdf({
          resource: this.resourceSet.resource(identifier),
        });
      }
      return;
    }

    if (!objectType.fromRdfType) {
      return;
    }

    const resources = [...this.resourceSet.instancesOf(objectType.fromRdfType)];
    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.identifier.value.localeCompare(right.identifier.value),
    );

    let objectCount = 0;
    let objectI = 0;
    for (const resource of resources) {
      const object = objectType.fromRdf({ resource });
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
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
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
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): Generator<ObjectIdentifierT> {
    for (const object of this.$objectUnionsSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    )) {
      if (object.isRight()) {
        yield object.unsafeCoerce().identifier;
      }
    }
  }

  protected *$objectUnionsSync<
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
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
          const object = objectType.fromRdf({ resource });
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
        fromRdf: (parameters: {
          resource: rdfjsResource.Resource;
        }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
        fromRdfType?: rdfjs.NamedNode;
      };
      resource: rdfjsResource.Resource;
    }[] = [];
    for (const objectType of objectTypes) {
      if (!objectType.fromRdfType) {
        continue;
      }

      for (const resource of this.resourceSet.instancesOf(
        objectType.fromRdfType,
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
      const object = objectType.fromRdf({ resource });
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
    ObjectT extends { readonly identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectTypes: readonly {
      fromRdf: (parameters: {
        resource: rdfjsResource.Resource;
      }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
      fromRdfType?: rdfjs.NamedNode;
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

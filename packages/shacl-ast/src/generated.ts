import type * as rdfjs from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
import { PropertyPath } from "./PropertyPath.js";
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
export interface BaseShaclCoreShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "ShaclCoreNodeShape" | "ShaclCorePropertyShape";
  readonly and: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[];
  readonly classes: readonly rdfjs.NamedNode[];
  readonly comments: readonly rdfjs.Literal[];
  readonly datatype: purify.Maybe<rdfjs.NamedNode>;
  readonly deactivated: purify.Maybe<boolean>;
  readonly flags: readonly string[];
  readonly hasValues: readonly (
    | rdfjs.BlankNode
    | rdfjs.NamedNode
    | rdfjs.Literal
  )[];
  readonly in_: purify.Maybe<
    readonly (rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal)[]
  >;
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
      hasValues: readonly (rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal)[];
      in_: purify.Maybe<
        readonly (rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal)[]
      >;
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
    const identifier = _resource.identifier;
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
      readonly (rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal)[]
    > = purify.Either.of([
      ..._resource
        .values(dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue"), {
          unique: true,
        })
        .flatMap((_item) =>
          _item
            .toValues()
            .head()
            .chain((_value) => purify.Either.of(_value.toTerm()))
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
      purify.Maybe<
        readonly (rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal)[]
      >
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
              .chain((_value) => purify.Either.of(_value.toTerm()))
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
      ShaclCoreNodeShape.fromRdf(otherParameters) as purify.Either<
        rdfjsResource.Resource.ValueError,
        BaseShaclCoreShape
      >
    ).altLazy(
      () =>
        ShaclCorePropertyShape.fromRdf(otherParameters) as purify.Either<
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

  export const rdfProperties = [
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#and") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#class") },
    {
      path: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#comment",
      ),
    },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#datatype") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#deactivated") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#flags") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#hasValue") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#in") },
    {
      path: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
      ),
    },
    {
      path: dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
    },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#languageIn") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxCount") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxExclusive") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxInclusive") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#maxLength") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minCount") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minExclusive") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minInclusive") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#minLength") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#nodeKind") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#node") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#not") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#or") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#pattern") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#xone") },
  ];
}
export interface ShaclCorePropertyShape extends BaseShaclCoreShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "ShaclCorePropertyShape";
  readonly defaultValue: purify.Maybe<
    rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal
  >;
  readonly descriptions: readonly rdfjs.Literal[];
  readonly groups: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly names: readonly rdfjs.Literal[];
  readonly order: purify.Maybe<number>;
  readonly path: PropertyPath;
  readonly uniqueLang: purify.Maybe<boolean>;
}

export namespace ShaclCorePropertyShape {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyShape",
  );

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
      type: "ShaclCorePropertyShape";
      defaultValue: purify.Maybe<
        rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal
      >;
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
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://www.w3.org/ns/shacl#PropertyShape)`,
          predicate: dataFactory.namedNode(
            "http://www.w3.org/ns/shacl#PropertyShape",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
    const type = "ShaclCorePropertyShape" as const;
    const _defaultValueEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode | rdfjs.Literal>
    > = purify.Either.of(
      _resource
        .values(
          dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue"),
          { unique: true },
        )
        .head()
        .chain((_value) => purify.Either.of(_value.toTerm()))
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
    parameters: Parameters<typeof ShaclCorePropertyShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ShaclCorePropertyShape> {
    return ShaclCorePropertyShape.propertiesFromRdf(parameters);
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

  export const rdfProperties = [
    ...BaseShaclCoreShapeStatic.rdfProperties,
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#defaultValue") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#description") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#group") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#name") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#order") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#path") },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#uniqueLang") },
  ];
}
export interface ShaclCorePropertyGroup {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "ShaclCorePropertyGroup";
  readonly comments: readonly rdfjs.Literal[];
  readonly labels: readonly rdfjs.Literal[];
}

export namespace ShaclCorePropertyGroup {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#PropertyGroup",
  );

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
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://www.w3.org/ns/shacl#PropertyGroup)`,
          predicate: dataFactory.namedNode(
            "http://www.w3.org/ns/shacl#PropertyGroup",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
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

  export const rdfProperties = [
    {
      path: dataFactory.namedNode(
        "http://www.w3.org/2000/01/rdf-schema#comment",
      ),
    },
    {
      path: dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
    },
  ];
}
export interface ShaclCoreNodeShape extends BaseShaclCoreShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "ShaclCoreNodeShape";
  readonly closed: purify.Maybe<boolean>;
  readonly ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
  readonly properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
}

export namespace ShaclCoreNodeShape {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/ns/shacl#NodeShape",
  );

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
      type: "ShaclCoreNodeShape";
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
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://www.w3.org/ns/shacl#NodeShape)`,
          predicate: dataFactory.namedNode(
            "http://www.w3.org/ns/shacl#NodeShape",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
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
    parameters: Parameters<typeof ShaclCoreNodeShape.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, ShaclCoreNodeShape> {
    return ShaclCoreNodeShape.propertiesFromRdf(parameters);
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

  export const rdfProperties = [
    ...BaseShaclCoreShapeStatic.rdfProperties,
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#closed") },
    {
      path: dataFactory.namedNode(
        "http://www.w3.org/ns/shacl#ignoredProperties",
      ),
    },
    { path: dataFactory.namedNode("http://www.w3.org/ns/shacl#property") },
  ];
}
export interface OwlOntology {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "OwlOntology";
  readonly labels: readonly rdfjs.Literal[];
}

export namespace OwlOntology {
  export const fromRdfType: rdfjs.NamedNode<string> = dataFactory.namedNode(
    "http://www.w3.org/2002/07/owl#Ontology",
  );

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
      type: "OwlOntology";
      labels: readonly rdfjs.Literal[];
    }
  > {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/2002/07/owl#Ontology"),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type (expected http://www.w3.org/2002/07/owl#Ontology)`,
          predicate: dataFactory.namedNode(
            "http://www.w3.org/2002/07/owl#Ontology",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
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
    parameters: Parameters<typeof OwlOntology.propertiesFromRdf>[0],
  ): purify.Either<rdfjsResource.Resource.ValueError, OwlOntology> {
    return OwlOntology.propertiesFromRdf(parameters);
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

  export const rdfProperties = [
    {
      path: dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
    },
  ];
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
      ShaclCoreNodeShape.fromRdf({ ...context, resource }) as purify.Either<
        rdfjsResource.Resource.ValueError,
        ShaclCoreShape
      >
    ).altLazy(
      () =>
        ShaclCorePropertyShape.fromRdf({
          ...context,
          resource,
        }) as purify.Either<rdfjsResource.Resource.ValueError, ShaclCoreShape>,
    );
  }

  export function toRdf(
    _shaclCoreShape: ShaclCoreShape,
    _parameters: {
      mutateGraph: rdfjsResource.MutableResource.MutateGraph;
      resourceSet: rdfjsResource.MutableResourceSet;
    },
  ): rdfjsResource.MutableResource {
    switch (_shaclCoreShape.type) {
      case "ShaclCoreNodeShape":
        return ShaclCoreNodeShape.toRdf(_shaclCoreShape, _parameters);
      case "ShaclCorePropertyShape":
        return ShaclCorePropertyShape.toRdf(_shaclCoreShape, _parameters);
      default:
        _shaclCoreShape satisfies never;
        throw new Error("unrecognized type");
    }
  }
}

export const $ObjectTypes = {
    BaseShaclCoreShape: BaseShaclCoreShapeStatic,
    OwlOntology,
    PropertyPath,
    ShaclCoreNodeShape,
    ShaclCorePropertyGroup,
    ShaclCorePropertyShape,
  },
  $ObjectUnionTypes = { ShaclCoreShape },
  $Types = { ...$ObjectTypes, ...$ObjectUnionTypes };

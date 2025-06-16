import type * as rdfjs from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
import { PropertyPath } from "./PropertyPath.js";
type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never;
export interface BaseShaclCoreShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
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
  readonly type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
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

export namespace ShaclCorePropertyShapeStatic {
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
      type: "ShaclCorePropertyShape" | "ShaclmatePropertyShape";
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
export interface ShaclmatePropertyShape extends ShaclCorePropertyShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
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
}

export namespace ShaclmatePropertyShape {
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
    return purify.Either.of({
      ..._super0,
      identifier,
      type,
      extern,
      mutable,
      name,
      visibility,
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
    return _resource;
  }

  export const rdfProperties = [
    ...ShaclCorePropertyShapeStatic.rdfProperties,
    {
      path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
    },
    {
      path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
    },
    { path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name") },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#visibility",
      ),
    },
  ];
}
export interface OwlOntology {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "OwlOntology" | "ShaclmateOntology";
  readonly labels: readonly rdfjs.Literal[];
}

export namespace OwlOntologyStatic {
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
export interface ShaclmateOntology extends OwlOntology {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "ShaclmateOntology";
  readonly tsDataFactoryVariable: purify.Maybe<string>;
  readonly tsFeatureExcludes: readonly rdfjs.NamedNode<
    | "http://purl.org/shaclmate/ontology#_TsFeature_All"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
    | "http://purl.org/shaclmate/ontology#_TsFeature_None"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
  >[];
  readonly tsFeatureIncludes: readonly rdfjs.NamedNode<
    | "http://purl.org/shaclmate/ontology#_TsFeature_All"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
    | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
      >[];
      tsFeatureIncludes: readonly rdfjs.NamedNode<
        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                  case "http://purl.org/shaclmate/ontology#_TsFeature_All":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_All">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_None":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_None">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeature_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
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
        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                  case "http://purl.org/shaclmate/ontology#_TsFeature_All":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_All">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_None":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_None">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeature_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
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

  export const rdfProperties = [
    ...OwlOntologyStatic.rdfProperties,
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsDataFactoryVariable",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsImport",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPrefixPropertyName",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPropertyName",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectTypeDiscriminatorPropertyName",
      ),
    },
  ];
}
export interface ShaclCoreNodeShape extends BaseShaclCoreShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
  readonly type: "ShaclCoreNodeShape" | "ShaclmateNodeShape";
  readonly closed: purify.Maybe<boolean>;
  readonly ignoredProperties: purify.Maybe<readonly rdfjs.NamedNode[]>;
  readonly properties: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
}

export namespace ShaclCoreNodeShapeStatic {
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
export interface ShaclmateNodeShape extends ShaclCoreNodeShape {
  readonly identifier: rdfjs.BlankNode | rdfjs.NamedNode;
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
    | "http://purl.org/shaclmate/ontology#_TsFeature_All"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
    | "http://purl.org/shaclmate/ontology#_TsFeature_None"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
  >[];
  readonly tsFeatureIncludes: readonly rdfjs.NamedNode<
    | "http://purl.org/shaclmate/ontology#_TsFeature_All"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
    | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
    | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
      >[];
      tsFeatureIncludes: readonly rdfjs.NamedNode<
        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                  case "http://purl.org/shaclmate/ontology#_TsFeature_All":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_All">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_None":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_None">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeature_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
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
        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                  case "http://purl.org/shaclmate/ontology#_TsFeature_All":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_All">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Create">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Equals">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_Json">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_None":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
                      >
                    >(
                      iri as rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_None">,
                    );
                  case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
                    return purify.Either.of<
                      rdfjsResource.Resource.ValueError,
                      rdfjs.NamedNode<
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                        | "http://purl.org/shaclmate/ontology#_TsFeature_All"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
                        | "http://purl.org/shaclmate/ontology#_TsFeature_None"
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
                          'rdfjs.NamedNode<"http://purl.org/shaclmate/ontology#_TsFeature_All" | "http://purl.org/shaclmate/ontology#_TsFeature_Create" | "http://purl.org/shaclmate/ontology#_TsFeature_Equals" | "http://purl.org/shaclmate/ontology#_TsFeature_Hash" | "http://purl.org/shaclmate/ontology#_TsFeature_Json" | "http://purl.org/shaclmate/ontology#_TsFeature_None" | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf" | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql">',
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

  export const rdfProperties = [
    ...ShaclCoreNodeShapeStatic.rdfProperties,
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#abstract",
      ),
    },
    {
      path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#export"),
    },
    {
      path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#extern"),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#fromRdfType",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#identifierMintingStrategy",
      ),
    },
    {
      path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#mutable"),
    },
    { path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#name") },
    {
      path: dataFactory.namedNode("http://purl.org/shaclmate/ontology#rdfType"),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#toRdfType",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureExclude",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsFeatureInclude",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsImport",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectDeclarationType",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPrefixPropertyName",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectIdentifierPropertyName",
      ),
    },
    {
      path: dataFactory.namedNode(
        "http://purl.org/shaclmate/ontology#tsObjectTypeDiscriminatorPropertyName",
      ),
    },
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
    }
  }
}

export const $ObjectTypes = {
    BaseShaclCoreShape: BaseShaclCoreShapeStatic,
    OwlOntology: OwlOntologyStatic,
    PropertyPath,
    ShaclCoreNodeShape: ShaclCoreNodeShapeStatic,
    ShaclCorePropertyGroup,
    ShaclCorePropertyShape: ShaclCorePropertyShapeStatic,
    ShaclmateNodeShape,
    ShaclmateOntology,
    ShaclmatePropertyShape,
  },
  $ObjectUnionTypes = { ShaclCoreShape, ShaclmateShape },
  $Types = { ...$ObjectTypes, ...$ObjectUnionTypes };

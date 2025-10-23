import { StoreFactory as _DatasetFactory } from "n3";
const datasetFactory = new _DatasetFactory();
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
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, BaseShaclCoreShape> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return (
      ShaclCoreNodeShape.$fromRdf(resource, {
        ...context,
        ignoreRdfType: false,
        objectSet,
      }) as purify.Either<Error, BaseShaclCoreShape>
    ).altLazy(
      () =>
        ShaclCorePropertyShape.$fromRdf(resource, {
          ...context,
          ignoreRdfType: false,
          objectSet,
        }) as purify.Either<Error, BaseShaclCoreShape>,
    );
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
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
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.and["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toList()))
      .chain((valueLists) =>
        valueLists.chainMap((valueList) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            rdfjsResource.Resource.Values.fromArray({
              objects: valueList,
              predicate: BaseShaclCoreShapeStatic.$properties.and["identifier"],
              subject: $resource,
            }),
          ).chain((values) => values.chainMap((value) => value.toIdentifier())),
        ),
      )
      .map((valueLists) => valueLists.map((valueList) => valueList.toArray()))
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate: BaseShaclCoreShapeStatic.$properties.and["identifier"],
          subject: $resource,
        }),
      )
      .chain((values) => values.head());
    if (_andEither.isLeft()) {
      return _andEither;
    }

    const and = _andEither.unsafeCoerce();
    const _classesEither: purify.Either<Error, readonly rdfjs.NamedNode[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.classes["identifier"], { unique: true }))
        .chain((values) => values.chainMap((value) => value.toIri()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate:
              BaseShaclCoreShapeStatic.$properties.classes["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_classesEither.isLeft()) {
      return _classesEither;
    }

    const classes = _classesEither.unsafeCoerce();
    const _commentsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.comments["identifier"], { unique: true }))
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    BaseShaclCoreShapeStatic.$properties.comments["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toLiteral()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate:
              BaseShaclCoreShapeStatic.$properties.comments["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_commentsEither.isLeft()) {
      return _commentsEither;
    }

    const comments = _commentsEither.unsafeCoerce();
    const _datatypeEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.NamedNode>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.datatype["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toIri()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<rdfjs.NamedNode>
            >({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.datatype["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_datatypeEither.isLeft()) {
      return _datatypeEither;
    }

    const datatype = _datatypeEither.unsafeCoerce();
    const _deactivatedEither: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.deactivated["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toBoolean()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<boolean>>({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.deactivated["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_deactivatedEither.isLeft()) {
      return _deactivatedEither;
    }

    const deactivated = _deactivatedEither.unsafeCoerce();
    const _flagsEither: purify.Either<Error, readonly string[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.flags["identifier"], { unique: true }))
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    BaseShaclCoreShapeStatic.$properties.flags["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toString()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate: BaseShaclCoreShapeStatic.$properties.flags["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_flagsEither.isLeft()) {
      return _flagsEither;
    }

    const flags = _flagsEither.unsafeCoerce();
    const _hasValuesEither: purify.Either<
      Error,
      readonly (rdfjs.Literal | rdfjs.NamedNode)[]
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.hasValues["identifier"], { unique: true }))
      .chain((values) =>
        values.chainMap((value) =>
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
                      BaseShaclCoreShapeStatic.$properties.hasValues[
                        "identifier"
                      ],
                  }),
                );
            }
          }),
        ),
      )
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate:
            BaseShaclCoreShapeStatic.$properties.hasValues["identifier"],
          subject: $resource,
        }),
      )
      .chain((values) => values.head());
    if (_hasValuesEither.isLeft()) {
      return _hasValuesEither;
    }

    const hasValues = _hasValuesEither.unsafeCoerce();
    const _in_Either: purify.Either<
      Error,
      purify.Maybe<readonly (rdfjs.Literal | rdfjs.NamedNode)[]>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.in_["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toList()))
      .chain((valueLists) =>
        valueLists.chainMap((valueList) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            rdfjsResource.Resource.Values.fromArray({
              objects: valueList,
              predicate: BaseShaclCoreShapeStatic.$properties.in_["identifier"],
              subject: $resource,
            }),
          ).chain((values) =>
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
                    return purify.Left<Error, rdfjs.Literal | rdfjs.NamedNode>(
                      new rdfjsResource.Resource.MistypedValueError({
                        actualValue: term,
                        expectedValueType: "(rdfjs.Literal | rdfjs.NamedNode)",
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
      .map((valueLists) => valueLists.map((valueList) => valueList.toArray()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<readonly (rdfjs.Literal | rdfjs.NamedNode)[]>
            >({
              object: purify.Maybe.empty(),
              predicate: BaseShaclCoreShapeStatic.$properties.in_["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_in_Either.isLeft()) {
      return _in_Either;
    }

    const in_ = _in_Either.unsafeCoerce();
    const _isDefinedByEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.isDefinedBy["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toIdentifier()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<rdfjs.BlankNode | rdfjs.NamedNode>
            >({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.isDefinedBy["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_isDefinedByEither.isLeft()) {
      return _isDefinedByEither;
    }

    const isDefinedBy = _isDefinedByEither.unsafeCoerce();
    const _labelsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.labels["identifier"], { unique: true }))
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    BaseShaclCoreShapeStatic.$properties.labels["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toLiteral()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate:
              BaseShaclCoreShapeStatic.$properties.labels["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    const _languageInEither: purify.Either<
      Error,
      purify.Maybe<readonly string[]>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.languageIn["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toList()))
      .chain((valueLists) =>
        valueLists.chainMap((valueList) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            rdfjsResource.Resource.Values.fromArray({
              objects: valueList,
              predicate:
                BaseShaclCoreShapeStatic.$properties.languageIn["identifier"],
              subject: $resource,
            }),
          )
            .chain((values) => {
              if (!$preferredLanguages || $preferredLanguages.length === 0) {
                return purify.Either.of<
                  Error,
                  rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
                >(values);
              }

              const literalValuesEither = values.chainMap((value) =>
                value.toLiteral(),
              );
              if (literalValuesEither.isLeft()) {
                return literalValuesEither;
              }
              const literalValues = literalValuesEither.unsafeCoerce();

              // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
              // Within a preferredLanguage the literals may be in any order.
              let filteredLiteralValues:
                | rdfjsResource.Resource.Values<rdfjs.Literal>
                | undefined;
              for (const preferredLanguage of $preferredLanguages) {
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

              return purify.Either.of<
                Error,
                rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
              >(
                filteredLiteralValues!.map(
                  (literalValue) =>
                    new rdfjsResource.Resource.Value({
                      object: literalValue,
                      predicate:
                        BaseShaclCoreShapeStatic.$properties.languageIn[
                          "identifier"
                        ],
                      subject: $resource,
                    }),
                ),
              );
            })
            .chain((values) => values.chainMap((value) => value.toString())),
        ),
      )
      .map((valueLists) => valueLists.map((valueList) => valueList.toArray()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<readonly string[]>
            >({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.languageIn["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_languageInEither.isLeft()) {
      return _languageInEither;
    }

    const languageIn = _languageInEither.unsafeCoerce();
    const _maxCountEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.maxCount["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toNumber()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<number>>({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.maxCount["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_maxCountEither.isLeft()) {
      return _maxCountEither;
    }

    const maxCount = _maxCountEither.unsafeCoerce();
    const _maxExclusiveEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.maxExclusive["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
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

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate:
                  BaseShaclCoreShapeStatic.$properties.maxExclusive[
                    "identifier"
                  ],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toLiteral()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<rdfjs.Literal>
            >({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.maxExclusive["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_maxExclusiveEither.isLeft()) {
      return _maxExclusiveEither;
    }

    const maxExclusive = _maxExclusiveEither.unsafeCoerce();
    const _maxInclusiveEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.maxInclusive["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
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

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate:
                  BaseShaclCoreShapeStatic.$properties.maxInclusive[
                    "identifier"
                  ],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toLiteral()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<rdfjs.Literal>
            >({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.maxInclusive["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_maxInclusiveEither.isLeft()) {
      return _maxInclusiveEither;
    }

    const maxInclusive = _maxInclusiveEither.unsafeCoerce();
    const _maxLengthEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.maxLength["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toNumber()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<number>>({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.maxLength["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_maxLengthEither.isLeft()) {
      return _maxLengthEither;
    }

    const maxLength = _maxLengthEither.unsafeCoerce();
    const _minCountEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.minCount["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toNumber()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<number>>({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.minCount["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_minCountEither.isLeft()) {
      return _minCountEither;
    }

    const minCount = _minCountEither.unsafeCoerce();
    const _minExclusiveEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.minExclusive["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
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

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate:
                  BaseShaclCoreShapeStatic.$properties.minExclusive[
                    "identifier"
                  ],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toLiteral()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<rdfjs.Literal>
            >({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.minExclusive["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_minExclusiveEither.isLeft()) {
      return _minExclusiveEither;
    }

    const minExclusive = _minExclusiveEither.unsafeCoerce();
    const _minInclusiveEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.minInclusive["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => {
        if (!$preferredLanguages || $preferredLanguages.length === 0) {
          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(values);
        }

        const literalValuesEither = values.chainMap((value) =>
          value.toLiteral(),
        );
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues:
          | rdfjsResource.Resource.Values<rdfjs.Literal>
          | undefined;
        for (const preferredLanguage of $preferredLanguages) {
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

        return purify.Either.of<
          Error,
          rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
        >(
          filteredLiteralValues!.map(
            (literalValue) =>
              new rdfjsResource.Resource.Value({
                object: literalValue,
                predicate:
                  BaseShaclCoreShapeStatic.$properties.minInclusive[
                    "identifier"
                  ],
                subject: $resource,
              }),
          ),
        );
      })
      .chain((values) => values.chainMap((value) => value.toLiteral()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<rdfjs.Literal>
            >({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.minInclusive["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_minInclusiveEither.isLeft()) {
      return _minInclusiveEither;
    }

    const minInclusive = _minInclusiveEither.unsafeCoerce();
    const _minLengthEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.minLength["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toNumber()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<number>>({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.minLength["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
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
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.nodeKind["identifier"], { unique: true }))
      .chain((values) =>
        values.chainMap((value) =>
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
                      BaseShaclCoreShapeStatic.$properties.nodeKind[
                        "identifier"
                      ],
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
            >({
              object: purify.Maybe.empty(),
              predicate:
                BaseShaclCoreShapeStatic.$properties.nodeKind["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_nodeKindEither.isLeft()) {
      return _nodeKindEither;
    }

    const nodeKind = _nodeKindEither.unsafeCoerce();
    const _nodesEither: purify.Either<
      Error,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.nodes["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toIdentifier()))
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate: BaseShaclCoreShapeStatic.$properties.nodes["identifier"],
          subject: $resource,
        }),
      )
      .chain((values) => values.head());
    if (_nodesEither.isLeft()) {
      return _nodesEither;
    }

    const nodes = _nodesEither.unsafeCoerce();
    const _notEither: purify.Either<
      Error,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.not["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toIdentifier()))
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate: BaseShaclCoreShapeStatic.$properties.not["identifier"],
          subject: $resource,
        }),
      )
      .chain((values) => values.head());
    if (_notEither.isLeft()) {
      return _notEither;
    }

    const not = _notEither.unsafeCoerce();
    const _orEither: purify.Either<
      Error,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.or["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toList()))
      .chain((valueLists) =>
        valueLists.chainMap((valueList) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            rdfjsResource.Resource.Values.fromArray({
              objects: valueList,
              predicate: BaseShaclCoreShapeStatic.$properties.or["identifier"],
              subject: $resource,
            }),
          ).chain((values) => values.chainMap((value) => value.toIdentifier())),
        ),
      )
      .map((valueLists) => valueLists.map((valueList) => valueList.toArray()))
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate: BaseShaclCoreShapeStatic.$properties.or["identifier"],
          subject: $resource,
        }),
      )
      .chain((values) => values.head());
    if (_orEither.isLeft()) {
      return _orEither;
    }

    const or = _orEither.unsafeCoerce();
    const _patternsEither: purify.Either<Error, readonly string[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.patterns["identifier"], { unique: true }))
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    BaseShaclCoreShapeStatic.$properties.patterns["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toString()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate:
              BaseShaclCoreShapeStatic.$properties.patterns["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_patternsEither.isLeft()) {
      return _patternsEither;
    }

    const patterns = _patternsEither.unsafeCoerce();
    const _xoneEither: purify.Either<
      Error,
      readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[]
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.xone["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toList()))
      .chain((valueLists) =>
        valueLists.chainMap((valueList) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            rdfjsResource.Resource.Values.fromArray({
              objects: valueList,
              predicate:
                BaseShaclCoreShapeStatic.$properties.xone["identifier"],
              subject: $resource,
            }),
          ).chain((values) => values.chainMap((value) => value.toIdentifier())),
        ),
      )
      .map((valueLists) => valueLists.map((valueList) => valueList.toArray()))
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate: BaseShaclCoreShapeStatic.$properties.xone["identifier"],
          subject: $resource,
        }),
      )
      .chain((values) => values.head());
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
      BaseShaclCoreShapeStatic.$properties.and["identifier"],
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
      BaseShaclCoreShapeStatic.$properties.classes["identifier"],
      ..._baseShaclCoreShape.classes.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.comments["identifier"],
      ..._baseShaclCoreShape.comments.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.datatype["identifier"],
      ..._baseShaclCoreShape.datatype.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.deactivated["identifier"],
      ..._baseShaclCoreShape.deactivated.toList().flat(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.flags["identifier"],
      ..._baseShaclCoreShape.flags.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.hasValues["identifier"],
      ..._baseShaclCoreShape.hasValues.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.in_["identifier"],
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
      BaseShaclCoreShapeStatic.$properties.isDefinedBy["identifier"],
      ..._baseShaclCoreShape.isDefinedBy.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.labels["identifier"],
      ..._baseShaclCoreShape.labels.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.languageIn["identifier"],
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
      BaseShaclCoreShapeStatic.$properties.maxCount["identifier"],
      ..._baseShaclCoreShape.maxCount.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.maxExclusive["identifier"],
      ..._baseShaclCoreShape.maxExclusive.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.maxInclusive["identifier"],
      ..._baseShaclCoreShape.maxInclusive.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.maxLength["identifier"],
      ..._baseShaclCoreShape.maxLength.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.minCount["identifier"],
      ..._baseShaclCoreShape.minCount.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.minExclusive["identifier"],
      ..._baseShaclCoreShape.minExclusive.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.minInclusive["identifier"],
      ..._baseShaclCoreShape.minInclusive.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.minLength["identifier"],
      ..._baseShaclCoreShape.minLength.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.nodeKind["identifier"],
      ..._baseShaclCoreShape.nodeKind.toList(),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.nodes["identifier"],
      ..._baseShaclCoreShape.nodes.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.not["identifier"],
      ..._baseShaclCoreShape.not.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.or["identifier"],
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
      BaseShaclCoreShapeStatic.$properties.patterns["identifier"],
      ..._baseShaclCoreShape.patterns.flatMap((item) => [item]),
    );
    resource.add(
      BaseShaclCoreShapeStatic.$properties.xone["identifier"],
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

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, ShaclCorePropertyShape> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return ShaclCorePropertyShape.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
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
      objectSet: $objectSet,
      preferredLanguages: $preferredLanguages,
      resource: $resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://www.w3.org/ns/shacl#PropertyShape":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(ShaclCorePropertyShape.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyShape)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    const $identifier: ShaclCorePropertyShape.$Identifier =
      $resource.identifier;
    const $type = "ShaclCorePropertyShape" as const;
    const _defaultValueEither: purify.Either<
      Error,
      purify.Maybe<rdfjs.Literal | rdfjs.NamedNode>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.defaultValue["identifier"], {
        unique: true,
      }),
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
                      ShaclCorePropertyShape.$properties.defaultValue[
                        "identifier"
                      ],
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
              object: purify.Maybe.empty(),
              predicate:
                ShaclCorePropertyShape.$properties.defaultValue["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_defaultValueEither.isLeft()) {
      return _defaultValueEither;
    }

    const defaultValue = _defaultValueEither.unsafeCoerce();
    const _descriptionsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >(
        $resource.values($properties.descriptions["identifier"], {
          unique: true,
        }),
      )
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    ShaclCorePropertyShape.$properties.descriptions[
                      "identifier"
                    ],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toLiteral()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate:
              ShaclCorePropertyShape.$properties.descriptions["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_descriptionsEither.isLeft()) {
      return _descriptionsEither;
    }

    const descriptions = _descriptionsEither.unsafeCoerce();
    const _groupsEither: purify.Either<
      Error,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.groups["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toIdentifier()))
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate: ShaclCorePropertyShape.$properties.groups["identifier"],
          subject: $resource,
        }),
      )
      .chain((values) => values.head());
    if (_groupsEither.isLeft()) {
      return _groupsEither;
    }

    const groups = _groupsEither.unsafeCoerce();
    const _namesEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.names["identifier"], { unique: true }))
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    ShaclCorePropertyShape.$properties.names["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toLiteral()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate: ShaclCorePropertyShape.$properties.names["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_namesEither.isLeft()) {
      return _namesEither;
    }

    const names = _namesEither.unsafeCoerce();
    const _orderEither: purify.Either<
      Error,
      purify.Maybe<number>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.order["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toNumber()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<number>>({
              object: purify.Maybe.empty(),
              predicate: ShaclCorePropertyShape.$properties.order["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_orderEither.isLeft()) {
      return _orderEither;
    }

    const order = _orderEither.unsafeCoerce();
    const _pathEither: purify.Either<Error, PropertyPath> = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.path["identifier"], { unique: true }))
      .chain((values) =>
        values.chainMap((value) =>
          value.toResource().chain((resource) =>
            PropertyPath.$fromRdf(resource, {
              ...$context,
              ignoreRdfType: true,
              objectSet: $objectSet,
              preferredLanguages: $preferredLanguages,
            }),
          ),
        ),
      )
      .chain((values) => values.head());
    if (_pathEither.isLeft()) {
      return _pathEither;
    }

    const path = _pathEither.unsafeCoerce();
    const _uniqueLangEither: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.uniqueLang["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toBoolean()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<boolean>>({
              object: purify.Maybe.empty(),
              predicate:
                ShaclCorePropertyShape.$properties.uniqueLang["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
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
          "http://purl.org/shaclmate/ontology#ShaclCorePropertyShape",
        ),
      );
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode(
          "http://www.w3.org/ns/shacl#PropertyShape",
        ),
      );
    }

    resource.add(
      ShaclCorePropertyShape.$properties.defaultValue["identifier"],
      ..._shaclCorePropertyShape.defaultValue.toList(),
    );
    resource.add(
      ShaclCorePropertyShape.$properties.descriptions["identifier"],
      ..._shaclCorePropertyShape.descriptions.flatMap((item) => [item]),
    );
    resource.add(
      ShaclCorePropertyShape.$properties.groups["identifier"],
      ..._shaclCorePropertyShape.groups.flatMap((item) => [item]),
    );
    resource.add(
      ShaclCorePropertyShape.$properties.names["identifier"],
      ..._shaclCorePropertyShape.names.flatMap((item) => [item]),
    );
    resource.add(
      ShaclCorePropertyShape.$properties.order["identifier"],
      ..._shaclCorePropertyShape.order.toList(),
    );
    resource.add(
      ShaclCorePropertyShape.$properties.path["identifier"],
      ...[
        PropertyPath.$toRdf(_shaclCorePropertyShape.path, {
          mutateGraph: mutateGraph,
          resourceSet: resourceSet,
        }).identifier,
      ],
    );
    resource.add(
      ShaclCorePropertyShape.$properties.uniqueLang["identifier"],
      ..._shaclCorePropertyShape.uniqueLang.toList().flat(),
    );
    return resource;
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
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, ShaclCorePropertyGroup> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return ShaclCorePropertyGroup.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
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
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://www.w3.org/ns/shacl#PropertyGroup":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(ShaclCorePropertyGroup.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#PropertyGroup)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    const $identifier: ShaclCorePropertyGroup.$Identifier =
      $resource.identifier;
    const $type = "ShaclCorePropertyGroup" as const;
    const _commentsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.comments["identifier"], { unique: true }))
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    ShaclCorePropertyGroup.$properties.comments["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toLiteral()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate:
              ShaclCorePropertyGroup.$properties.comments["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_commentsEither.isLeft()) {
      return _commentsEither;
    }

    const comments = _commentsEither.unsafeCoerce();
    const _labelsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.labels["identifier"], { unique: true }))
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate:
                    ShaclCorePropertyGroup.$properties.labels["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toLiteral()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate: ShaclCorePropertyGroup.$properties.labels["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    return purify.Either.of({ $identifier, $type, comments, labels });
  }

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
      ShaclCorePropertyGroup.$properties.comments["identifier"],
      ..._shaclCorePropertyGroup.comments.flatMap((item) => [item]),
    );
    resource.add(
      ShaclCorePropertyGroup.$properties.labels["identifier"],
      ..._shaclCorePropertyGroup.labels.flatMap((item) => [item]),
    );
    return resource;
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

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, ShaclCoreNodeShape> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return ShaclCoreNodeShape.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
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
    const $super0Either = BaseShaclCoreShapeStatic.$propertiesFromRdf({
      ...$context,
      ignoreRdfType: true,
      objectSet: $objectSet,
      preferredLanguages: $preferredLanguages,
      resource: $resource,
    });
    if ($super0Either.isLeft()) {
      return $super0Either;
    }

    const $super0 = $super0Either.unsafeCoerce();
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://www.w3.org/ns/shacl#NodeShape":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(ShaclCoreNodeShape.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/ns/shacl#NodeShape)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    const $identifier: ShaclCoreNodeShape.$Identifier = $resource.identifier;
    const $type = "ShaclCoreNodeShape" as const;
    const _closedEither: purify.Either<
      Error,
      purify.Maybe<boolean>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.closed["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toBoolean()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<purify.Maybe<boolean>>({
              object: purify.Maybe.empty(),
              predicate: ShaclCoreNodeShape.$properties.closed["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_closedEither.isLeft()) {
      return _closedEither;
    }

    const closed = _closedEither.unsafeCoerce();
    const _ignoredPropertiesEither: purify.Either<
      Error,
      purify.Maybe<readonly rdfjs.NamedNode[]>
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >(
      $resource.values($properties.ignoredProperties["identifier"], {
        unique: true,
      }),
    )
      .chain((values) => values.chainMap((value) => value.toList()))
      .chain((valueLists) =>
        valueLists.chainMap((valueList) =>
          purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            rdfjsResource.Resource.Values.fromArray({
              objects: valueList,
              predicate:
                ShaclCoreNodeShape.$properties.ignoredProperties["identifier"],
              subject: $resource,
            }),
          ).chain((values) => values.chainMap((value) => value.toIri())),
        ),
      )
      .map((valueLists) => valueLists.map((valueList) => valueList.toArray()))
      .map((values) =>
        values.length > 0
          ? values.map((value) => purify.Maybe.of(value))
          : rdfjsResource.Resource.Values.fromValue<
              purify.Maybe<readonly rdfjs.NamedNode[]>
            >({
              object: purify.Maybe.empty(),
              predicate:
                ShaclCoreNodeShape.$properties.ignoredProperties["identifier"],
              subject: $resource,
            }),
      )
      .chain((values) => values.head());
    if (_ignoredPropertiesEither.isLeft()) {
      return _ignoredPropertiesEither;
    }

    const ignoredProperties = _ignoredPropertiesEither.unsafeCoerce();
    const _propertiesEither: purify.Either<
      Error,
      readonly (rdfjs.BlankNode | rdfjs.NamedNode)[]
    > = purify.Either.of<
      Error,
      rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
    >($resource.values($properties.properties["identifier"], { unique: true }))
      .chain((values) => values.chainMap((value) => value.toIdentifier()))
      .map((values) => values.toArray())
      .map((valuesArray) =>
        rdfjsResource.Resource.Values.fromValue({
          object: valuesArray,
          predicate: ShaclCoreNodeShape.$properties.properties["identifier"],
          subject: $resource,
        }),
      )
      .chain((values) => values.head());
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
        resource.dataFactory.namedNode(
          "http://purl.org/shaclmate/ontology#ShaclCoreNodeShape",
        ),
      );
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode("http://www.w3.org/ns/shacl#NodeShape"),
      );
    }

    resource.add(
      ShaclCoreNodeShape.$properties.closed["identifier"],
      ..._shaclCoreNodeShape.closed.toList().flat(),
    );
    resource.add(
      ShaclCoreNodeShape.$properties.ignoredProperties["identifier"],
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
      ShaclCoreNodeShape.$properties.properties["identifier"],
      ..._shaclCoreNodeShape.properties.flatMap((item) => [item]),
    );
    return resource;
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
          dataFactory,
          identifier,
        }),
      );
    }

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      objectSet?: $ObjectSet;
      preferredLanguages?: readonly string[];
    },
  ): purify.Either<Error, OwlOntology> {
    let {
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
      ...context
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet({ dataset: resource.dataset });
    }

    return OwlOntology.$propertiesFromRdf({
      ...context,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
      resource,
    });
  }

  export function $propertiesFromRdf({
    ignoreRdfType: $ignoreRdfType,
    objectSet: $objectSet,
    preferredLanguages: $preferredLanguages,
    resource: $resource,
    // @ts-ignore
    ...$context
  }: {
    [_index: string]: any;
    ignoreRdfType: boolean;
    objectSet: $ObjectSet;
    preferredLanguages?: readonly string[];
    resource: rdfjsResource.Resource;
  }): purify.Either<
    Error,
    {
      $identifier: rdfjs.BlankNode | rdfjs.NamedNode;
      $type: "OwlOntology";
      labels: readonly rdfjs.Literal[];
    }
  > {
    if (!$ignoreRdfType) {
      const $rdfTypeCheck: purify.Either<Error, true> = $resource
        .value($RdfVocabularies.rdf.type)
        .chain((actualRdfType) => actualRdfType.toIri())
        .chain((actualRdfType) => {
          // Check the expected type and its known subtypes
          switch (actualRdfType.value) {
            case "http://www.w3.org/2002/07/owl#Ontology":
              return purify.Either.of(true);
          }

          // Check arbitrary rdfs:subClassOf's of the expected type
          if ($resource.isInstanceOf(OwlOntology.$fromRdfType)) {
            return purify.Either.of(true);
          }

          return purify.Left(
            new Error(
              `${rdfjsResource.Resource.Identifier.toString($resource.identifier)} has unexpected RDF type (actual: ${actualRdfType.value}, expected: http://www.w3.org/2002/07/owl#Ontology)`,
            ),
          );
        });
      if ($rdfTypeCheck.isLeft()) {
        return $rdfTypeCheck;
      }
    }

    const $identifier: OwlOntology.$Identifier = $resource.identifier;
    const $type = "OwlOntology" as const;
    const _labelsEither: purify.Either<Error, readonly rdfjs.Literal[]> =
      purify.Either.of<
        Error,
        rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
      >($resource.values($properties.labels["identifier"], { unique: true }))
        .chain((values) => {
          if (!$preferredLanguages || $preferredLanguages.length === 0) {
            return purify.Either.of<
              Error,
              rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
            >(values);
          }

          const literalValuesEither = values.chainMap((value) =>
            value.toLiteral(),
          );
          if (literalValuesEither.isLeft()) {
            return literalValuesEither;
          }
          const literalValues = literalValuesEither.unsafeCoerce();

          // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
          // Within a preferredLanguage the literals may be in any order.
          let filteredLiteralValues:
            | rdfjsResource.Resource.Values<rdfjs.Literal>
            | undefined;
          for (const preferredLanguage of $preferredLanguages) {
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

          return purify.Either.of<
            Error,
            rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>
          >(
            filteredLiteralValues!.map(
              (literalValue) =>
                new rdfjsResource.Resource.Value({
                  object: literalValue,
                  predicate: OwlOntology.$properties.labels["identifier"],
                  subject: $resource,
                }),
            ),
          );
        })
        .chain((values) => values.chainMap((value) => value.toLiteral()))
        .map((values) => values.toArray())
        .map((valuesArray) =>
          rdfjsResource.Resource.Values.fromValue({
            object: valuesArray,
            predicate: OwlOntology.$properties.labels["identifier"],
            subject: $resource,
          }),
        )
        .chain((values) => values.head());
    if (_labelsEither.isLeft()) {
      return _labelsEither;
    }

    const labels = _labelsEither.unsafeCoerce();
    return purify.Either.of({ $identifier, $type, labels });
  }

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
          "http://purl.org/shaclmate/ontology#OwlOntology",
        ),
      );
      resource.add(
        $RdfVocabularies.rdf.type,
        resource.dataFactory.namedNode(
          "http://www.w3.org/2002/07/owl#Ontology",
        ),
      );
    }

    resource.add(
      OwlOntology.$properties.labels["identifier"],
      ..._owlOntology.labels.flatMap((item) => [item]),
    );
    return resource;
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

    export const // biome-ignore lint/suspicious/noShadowRestrictedNames:
      toString = rdfjsResource.Resource.Identifier.toString;
  }

  export function $toRdf(
    _shaclCoreShape: ShaclCoreShape,
    _parameters?: {
      mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
      resourceSet?: rdfjsResource.MutableResourceSet;
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
  ): Promise<purify.Either<Error, readonly OwlOntology[]>>;
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
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape[]>>;
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
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyGroup[]>>;
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
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyShape[]>>;
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
  ): Promise<purify.Either<Error, readonly ShaclCoreShape[]>>;
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

export abstract class $ForwardingObjectSet implements $ObjectSet {
  protected abstract get $delegate(): $ObjectSet;

  owlOntology(
    identifier: OwlOntology.$Identifier,
  ): Promise<purify.Either<Error, OwlOntology>> {
    return this.$delegate.owlOntology(identifier);
  }

  owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntology.$Identifier[]>> {
    return this.$delegate.owlOntologyIdentifiers(query);
  }

  owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntology[]>> {
    return this.$delegate.owlOntologies(query);
  }

  owlOntologiesCount(
    query?: Pick<$ObjectSet.Query<OwlOntology.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.owlOntologiesCount(query);
  }

  shaclCoreNodeShape(
    identifier: ShaclCoreNodeShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreNodeShape>> {
    return this.$delegate.shaclCoreNodeShape(identifier);
  }

  shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>> {
    return this.$delegate.shaclCoreNodeShapeIdentifiers(query);
  }

  shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape[]>> {
    return this.$delegate.shaclCoreNodeShapes(query);
  }

  shaclCoreNodeShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreNodeShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.shaclCoreNodeShapesCount(query);
  }

  shaclCorePropertyGroup(
    identifier: ShaclCorePropertyGroup.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyGroup>> {
    return this.$delegate.shaclCorePropertyGroup(identifier);
  }

  shaclCorePropertyGroupIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyGroup.$Identifier[]>
  > {
    return this.$delegate.shaclCorePropertyGroupIdentifiers(query);
  }

  shaclCorePropertyGroups(
    query?: $ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyGroup[]>> {
    return this.$delegate.shaclCorePropertyGroups(query);
  }

  shaclCorePropertyGroupsCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyGroup.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.shaclCorePropertyGroupsCount(query);
  }

  shaclCorePropertyShape(
    identifier: ShaclCorePropertyShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCorePropertyShape>> {
    return this.$delegate.shaclCorePropertyShape(identifier);
  }

  shaclCorePropertyShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): Promise<
    purify.Either<Error, readonly ShaclCorePropertyShape.$Identifier[]>
  > {
    return this.$delegate.shaclCorePropertyShapeIdentifiers(query);
  }

  shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyShape[]>> {
    return this.$delegate.shaclCorePropertyShapes(query);
  }

  shaclCorePropertyShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCorePropertyShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.shaclCorePropertyShapesCount(query);
  }

  shaclCoreShape(
    identifier: ShaclCoreShape.$Identifier,
  ): Promise<purify.Either<Error, ShaclCoreShape>> {
    return this.$delegate.shaclCoreShape(identifier);
  }

  shaclCoreShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape.$Identifier[]>> {
    return this.$delegate.shaclCoreShapeIdentifiers(query);
  }

  shaclCoreShapes(
    query?: $ObjectSet.Query<ShaclCoreShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreShape[]>> {
    return this.$delegate.shaclCoreShapes(query);
  }

  shaclCoreShapesCount(
    query?: Pick<$ObjectSet.Query<ShaclCoreShape.$Identifier>, "where">,
  ): Promise<purify.Either<Error, number>> {
    return this.$delegate.shaclCoreShapesCount(query);
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
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async owlOntologyIdentifiers(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntology.$Identifier[]>> {
    return this.owlOntologyIdentifiersSync(query);
  }

  owlOntologyIdentifiersSync(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): purify.Either<Error, readonly OwlOntology.$Identifier[]> {
    return this.$objectIdentifiersSync<OwlOntology, OwlOntology.$Identifier>(
      {
        $fromRdf: OwlOntology.$fromRdf,
        $fromRdfTypes: [OwlOntology.$fromRdfType],
      },
      query,
    );
  }

  async owlOntologies(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): Promise<purify.Either<Error, readonly OwlOntology[]>> {
    return this.owlOntologiesSync(query);
  }

  owlOntologiesSync(
    query?: $ObjectSet.Query<OwlOntology.$Identifier>,
  ): purify.Either<Error, readonly OwlOntology[]> {
    return this.$objectsSync<OwlOntology, OwlOntology.$Identifier>(
      {
        $fromRdf: OwlOntology.$fromRdf,
        $fromRdfTypes: [OwlOntology.$fromRdfType],
      },
      query,
    );
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
      {
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
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
  }

  async shaclCoreNodeShapeIdentifiers(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]>> {
    return this.shaclCoreNodeShapeIdentifiersSync(query);
  }

  shaclCoreNodeShapeIdentifiersSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclCoreNodeShape.$Identifier[]> {
    return this.$objectIdentifiersSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShape.$Identifier
    >(
      {
        $fromRdf: ShaclCoreNodeShape.$fromRdf,
        $fromRdfTypes: [ShaclCoreNodeShape.$fromRdfType],
      },
      query,
    );
  }

  async shaclCoreNodeShapes(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCoreNodeShape[]>> {
    return this.shaclCoreNodeShapesSync(query);
  }

  shaclCoreNodeShapesSync(
    query?: $ObjectSet.Query<ShaclCoreNodeShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclCoreNodeShape[]> {
    return this.$objectsSync<
      ShaclCoreNodeShape,
      ShaclCoreNodeShape.$Identifier
    >(
      {
        $fromRdf: ShaclCoreNodeShape.$fromRdf,
        $fromRdfTypes: [ShaclCoreNodeShape.$fromRdfType],
      },
      query,
    );
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
    >(
      {
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
    >(
      {
        $fromRdf: ShaclCorePropertyGroup.$fromRdf,
        $fromRdfTypes: [ShaclCorePropertyGroup.$fromRdfType],
      },
      query,
    );
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
    >(
      {
        $fromRdf: ShaclCorePropertyGroup.$fromRdf,
        $fromRdfTypes: [ShaclCorePropertyGroup.$fromRdfType],
      },
      query,
    );
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
    >(
      {
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
      where: { identifiers: [identifier], type: "identifiers" },
    }).map((objects) => objects[0]);
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
    return this.$objectIdentifiersSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShape.$Identifier
    >(
      {
        $fromRdf: ShaclCorePropertyShape.$fromRdf,
        $fromRdfTypes: [ShaclCorePropertyShape.$fromRdfType],
      },
      query,
    );
  }

  async shaclCorePropertyShapes(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): Promise<purify.Either<Error, readonly ShaclCorePropertyShape[]>> {
    return this.shaclCorePropertyShapesSync(query);
  }

  shaclCorePropertyShapesSync(
    query?: $ObjectSet.Query<ShaclCorePropertyShape.$Identifier>,
  ): purify.Either<Error, readonly ShaclCorePropertyShape[]> {
    return this.$objectsSync<
      ShaclCorePropertyShape,
      ShaclCorePropertyShape.$Identifier
    >(
      {
        $fromRdf: ShaclCorePropertyShape.$fromRdf,
        $fromRdfTypes: [ShaclCorePropertyShape.$fromRdfType],
      },
      query,
    );
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
    >(
      {
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
    >(
      [
        {
          $fromRdf: ShaclCoreNodeShape.$fromRdf,
          $fromRdfTypes: [ShaclCoreNodeShape.$fromRdfType],
        },
        {
          $fromRdf: ShaclCorePropertyShape.$fromRdf,
          $fromRdfTypes: [ShaclCorePropertyShape.$fromRdfType],
        },
      ],
      query,
    );
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
      [
        {
          $fromRdf: ShaclCoreNodeShape.$fromRdf,
          $fromRdfTypes: [ShaclCoreNodeShape.$fromRdfType],
        },
        {
          $fromRdf: ShaclCorePropertyShape.$fromRdf,
          $fromRdfTypes: [ShaclCorePropertyShape.$fromRdfType],
        },
      ],
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
    >(
      [
        {
          $fromRdf: ShaclCoreNodeShape.$fromRdf,
          $fromRdfTypes: [ShaclCoreNodeShape.$fromRdfType],
        },
        {
          $fromRdf: ShaclCorePropertyShape.$fromRdf,
          $fromRdfTypes: [ShaclCorePropertyShape.$fromRdfType],
        },
      ],
      query,
    );
  }

  protected $objectIdentifiersSync<
    ObjectT extends { readonly $identifier: ObjectIdentifierT },
    ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode,
  >(
    objectType: {
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
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
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
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
        const either = objectType.$fromRdf(
          this.resourceSet.resource(identifier),
          { objectSet: this },
        );
        if (either.isLeft()) {
          return either;
        }
        objects.push(either.unsafeCoerce());
      }
      return purify.Either.of(objects);
    }

    if (objectType.$fromRdfTypes.length === 0) {
      return purify.Either.of([]);
    }

    const resources: rdfjsResource.Resource[] = [];
    for (const fromRdfType of objectType.$fromRdfTypes) {
      for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
        if (
          !resources.some((existingResource) =>
            existingResource.identifier.equals(resource.identifier),
          )
        ) {
          resources.push(resource);
        }
      }
    }
    // Sort resources by identifier so limit and offset are deterministic
    resources.sort((left, right) =>
      left.identifier.value.localeCompare(right.identifier.value),
    );

    const objects: ObjectT[] = [];
    let objectI = 0;
    for (const resource of resources) {
      const either = objectType.$fromRdf(resource, { objectSet: this });
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
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
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
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
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
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
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
          const either = objectType.$fromRdf(resource, { objectSet: this });
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
        $fromRdf: (
          resource: rdfjsResource.Resource,
          options: { objectSet: $ObjectSet },
        ) => purify.Either<Error, ObjectT>;
        $fromRdfTypes: readonly rdfjs.NamedNode[];
      };
      resource: rdfjsResource.Resource;
    }[] = [];
    for (const objectType of objectTypes) {
      if (objectType.$fromRdfTypes.length === 0) {
        continue;
      }

      for (const fromRdfType of objectType.$fromRdfTypes) {
        for (const resource of this.resourceSet.instancesOf(fromRdfType)) {
          if (
            !resources.some(({ resource: existingResource }) =>
              existingResource.identifier.equals(resource.identifier),
            )
          ) {
            resources.push({ objectType, resource });
          }
        }
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
      const either = objectType.$fromRdf(resource, { objectSet: this });
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
      $fromRdf: (
        resource: rdfjsResource.Resource,
        options: { objectSet: $ObjectSet },
      ) => purify.Either<Error, ObjectT>;
      $fromRdfTypes: readonly rdfjs.NamedNode[];
    }[],
    query?: $ObjectSet.Query<ObjectIdentifierT>,
  ): purify.Either<Error, number> {
    return this.$objectUnionIdentifiersSync<ObjectT, ObjectIdentifierT>(
      objectTypes,
      query,
    ).map((objects) => objects.length);
  }
}

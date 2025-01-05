import * as sparqlBuilder from "@kos-kit/sparql-builder";
import type * as rdfjs from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
import * as purify from "purify-ts";
import * as purifyHelpers from "purify-ts-helpers";
import * as rdfjsResource from "rdfjs-resource";
abstract class Resource {
  readonly altLabel: readonly rdfjs.Literal[];
  readonly altLabelXl: readonly Label[];
  readonly changeNote: readonly rdfjs.Literal[];
  readonly definition: readonly rdfjs.Literal[];
  readonly editorialNote: readonly rdfjs.Literal[];
  readonly example: readonly rdfjs.Literal[];
  readonly hiddenLabel: readonly rdfjs.Literal[];
  readonly hiddenLabelXl: readonly Label[];
  readonly historyNote: readonly rdfjs.Literal[];
  abstract readonly identifier: rdfjs.NamedNode;
  readonly notation: readonly rdfjs.Literal[];
  readonly note: readonly rdfjs.Literal[];
  readonly prefLabel: readonly rdfjs.Literal[];
  readonly prefLabelXl: readonly Label[];
  readonly scopeNote: readonly rdfjs.Literal[];
  abstract readonly type:
    | "Collection"
    | "Concept"
    | "ConceptScheme"
    | "OrderedCollection";

  constructor(parameters: {
    readonly altLabel?: readonly rdfjs.Literal[];
    readonly altLabelXl?: readonly Label[];
    readonly changeNote?: readonly rdfjs.Literal[];
    readonly definition?: readonly rdfjs.Literal[];
    readonly editorialNote?: readonly rdfjs.Literal[];
    readonly example?: readonly rdfjs.Literal[];
    readonly hiddenLabel?: readonly rdfjs.Literal[];
    readonly hiddenLabelXl?: readonly Label[];
    readonly historyNote?: readonly rdfjs.Literal[];
    readonly notation?: readonly rdfjs.Literal[];
    readonly note?: readonly rdfjs.Literal[];
    readonly prefLabel?: readonly rdfjs.Literal[];
    readonly prefLabelXl?: readonly Label[];
    readonly scopeNote?: readonly rdfjs.Literal[];
  }) {
    if (Array.isArray(parameters.altLabel)) {
      this.altLabel = parameters.altLabel;
    } else if (typeof parameters.altLabel === "undefined") {
      this.altLabel = [];
    } else {
      this.altLabel = parameters.altLabel; // never
    }

    if (Array.isArray(parameters.altLabelXl)) {
      this.altLabelXl = parameters.altLabelXl;
    } else if (typeof parameters.altLabelXl === "undefined") {
      this.altLabelXl = [];
    } else {
      this.altLabelXl = parameters.altLabelXl; // never
    }

    if (Array.isArray(parameters.changeNote)) {
      this.changeNote = parameters.changeNote;
    } else if (typeof parameters.changeNote === "undefined") {
      this.changeNote = [];
    } else {
      this.changeNote = parameters.changeNote; // never
    }

    if (Array.isArray(parameters.definition)) {
      this.definition = parameters.definition;
    } else if (typeof parameters.definition === "undefined") {
      this.definition = [];
    } else {
      this.definition = parameters.definition; // never
    }

    if (Array.isArray(parameters.editorialNote)) {
      this.editorialNote = parameters.editorialNote;
    } else if (typeof parameters.editorialNote === "undefined") {
      this.editorialNote = [];
    } else {
      this.editorialNote = parameters.editorialNote; // never
    }

    if (Array.isArray(parameters.example)) {
      this.example = parameters.example;
    } else if (typeof parameters.example === "undefined") {
      this.example = [];
    } else {
      this.example = parameters.example; // never
    }

    if (Array.isArray(parameters.hiddenLabel)) {
      this.hiddenLabel = parameters.hiddenLabel;
    } else if (typeof parameters.hiddenLabel === "undefined") {
      this.hiddenLabel = [];
    } else {
      this.hiddenLabel = parameters.hiddenLabel; // never
    }

    if (Array.isArray(parameters.hiddenLabelXl)) {
      this.hiddenLabelXl = parameters.hiddenLabelXl;
    } else if (typeof parameters.hiddenLabelXl === "undefined") {
      this.hiddenLabelXl = [];
    } else {
      this.hiddenLabelXl = parameters.hiddenLabelXl; // never
    }

    if (Array.isArray(parameters.historyNote)) {
      this.historyNote = parameters.historyNote;
    } else if (typeof parameters.historyNote === "undefined") {
      this.historyNote = [];
    } else {
      this.historyNote = parameters.historyNote; // never
    }

    if (Array.isArray(parameters.notation)) {
      this.notation = parameters.notation;
    } else if (typeof parameters.notation === "undefined") {
      this.notation = [];
    } else {
      this.notation = parameters.notation; // never
    }

    if (Array.isArray(parameters.note)) {
      this.note = parameters.note;
    } else if (typeof parameters.note === "undefined") {
      this.note = [];
    } else {
      this.note = parameters.note; // never
    }

    if (Array.isArray(parameters.prefLabel)) {
      this.prefLabel = parameters.prefLabel;
    } else if (typeof parameters.prefLabel === "undefined") {
      this.prefLabel = [];
    } else {
      this.prefLabel = parameters.prefLabel; // never
    }

    if (Array.isArray(parameters.prefLabelXl)) {
      this.prefLabelXl = parameters.prefLabelXl;
    } else if (typeof parameters.prefLabelXl === "undefined") {
      this.prefLabelXl = [];
    } else {
      this.prefLabelXl = parameters.prefLabelXl; // never
    }

    if (Array.isArray(parameters.scopeNote)) {
      this.scopeNote = parameters.scopeNote;
    } else if (typeof parameters.scopeNote === "undefined") {
      this.scopeNote = [];
    } else {
      this.scopeNote = parameters.scopeNote; // never
    }
  }

  equals(other: Resource): purifyHelpers.Equatable.EqualsResult {
    return ((left, right) =>
      purifyHelpers.Arrays.equals(
        left,
        right,
        purifyHelpers.Equatable.booleanEquals,
      ))(this.altLabel, other.altLabel)
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "altLabel",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.altLabelXl,
          other.altLabelXl,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "altLabelXl",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.changeNote, other.changeNote).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "changeNote",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.definition, other.definition).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "definition",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.editorialNote, other.editorialNote).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "editorialNote",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.example, other.example).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "example",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.hiddenLabel, other.hiddenLabel).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "hiddenLabel",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.hiddenLabelXl,
          other.hiddenLabelXl,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "hiddenLabelXl",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.historyNote, other.historyNote).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "historyNote",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        purifyHelpers.Equatable.booleanEquals(
          this.identifier,
          other.identifier,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "identifier",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.notation, other.notation).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "notation",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.note, other.note).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "note",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.prefLabel, other.prefLabel).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "prefLabel",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.prefLabelXl,
          other.prefLabelXl,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "prefLabelXl",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.scopeNote, other.scopeNote).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "scopeNote",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        purifyHelpers.Equatable.strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    for (const _element0 of this.altLabel) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.altLabelXl) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.changeNote) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.definition) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.editorialNote) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.example) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.hiddenLabel) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.hiddenLabelXl) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.historyNote) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.notation) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.note) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.prefLabel) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    for (const _element0 of this.prefLabelXl) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.scopeNote) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    return _hasher;
  }

  toJson(): {
    readonly altLabel: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly altLabelXl: readonly ReturnType<Label["toJson"]>[];
    readonly changeNote: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly definition: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly editorialNote: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly example: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly hiddenLabel: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly hiddenLabelXl: readonly ReturnType<Label["toJson"]>[];
    readonly historyNote: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly "@id": string;
    readonly notation: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly note: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly prefLabel: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly prefLabelXl: readonly ReturnType<Label["toJson"]>[];
    readonly scopeNote: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly type: string;
  } {
    return JSON.parse(
      JSON.stringify({
        altLabel: this.altLabel.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        altLabelXl: this.altLabelXl.map((_item) => _item.toJson()),
        changeNote: this.changeNote.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        definition: this.definition.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        editorialNote: this.editorialNote.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        example: this.example.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        hiddenLabel: this.hiddenLabel.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        hiddenLabelXl: this.hiddenLabelXl.map((_item) => _item.toJson()),
        historyNote: this.historyNote.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        "@id": this.identifier.value,
        notation: this.notation.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        note: this.note.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        prefLabel: this.prefLabel.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        prefLabelXl: this.prefLabelXl.map((_item) => _item.toJson()),
        scopeNote: this.scopeNote.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        type: this.type,
      } satisfies ReturnType<Resource["toJson"]>),
    );
  }

  toRdf({
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = resourceSet.mutableNamedResource({
      identifier: this.identifier,
      mutateGraph,
    });
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#altLabel"),
      this.altLabel,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2008/05/skos-xl#altLabel"),
      this.altLabelXl.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#changeNote"),
      this.changeNote,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#definition"),
      this.definition,
    );
    _resource.add(
      dataFactory.namedNode(
        "http://www.w3.org/2004/02/skos/core#editorialNote",
      ),
      this.editorialNote,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#example"),
      this.example,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#hiddenLabel"),
      this.hiddenLabel,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2008/05/skos-xl#hiddenLabel"),
      this.hiddenLabelXl.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#historyNote"),
      this.historyNote,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#notation"),
      this.notation,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#notation"),
      this.note,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#prefLabel"),
      this.prefLabel,
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2008/05/skos-xl#prefLabel"),
      this.prefLabelXl.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#scopeNote"),
      this.scopeNote,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

namespace Resource {
  export function interfaceFromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<
    rdfjsResource.Resource.ValueError,
    {
      altLabel: readonly rdfjs.Literal[];
      altLabelXl: readonly Label[];
      changeNote: readonly rdfjs.Literal[];
      definition: readonly rdfjs.Literal[];
      editorialNote: readonly rdfjs.Literal[];
      example: readonly rdfjs.Literal[];
      hiddenLabel: readonly rdfjs.Literal[];
      hiddenLabelXl: readonly Label[];
      historyNote: readonly rdfjs.Literal[];
      identifier: rdfjs.NamedNode;
      notation: readonly rdfjs.Literal[];
      note: readonly rdfjs.Literal[];
      prefLabel: readonly rdfjs.Literal[];
      prefLabelXl: readonly Label[];
      scopeNote: readonly rdfjs.Literal[];
    }
  > {
    const _altLabelEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#altLabel"),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_altLabelEither.isLeft()) {
      return _altLabelEither;
    }

    const altLabel = _altLabelEither.unsafeCoerce();
    const _altLabelXlEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly Label[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2008/05/skos-xl#altLabel"),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
            .toValues()
            .head()
            .chain((value) => value.toResource())
            .chain((_resource) =>
              Label.fromRdf({
                ..._context,
                ignoreRdfType: true,
                languageIn: _languageIn,
                resource: _resource,
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_altLabelXlEither.isLeft()) {
      return _altLabelXlEither;
    }

    const altLabelXl = _altLabelXlEither.unsafeCoerce();
    const _changeNoteEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#changeNote",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_changeNoteEither.isLeft()) {
      return _changeNoteEither;
    }

    const changeNote = _changeNoteEither.unsafeCoerce();
    const _definitionEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#definition",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_definitionEither.isLeft()) {
      return _definitionEither;
    }

    const definition = _definitionEither.unsafeCoerce();
    const _editorialNoteEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#editorialNote",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_editorialNoteEither.isLeft()) {
      return _editorialNoteEither;
    }

    const editorialNote = _editorialNoteEither.unsafeCoerce();
    const _exampleEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#example"),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_exampleEither.isLeft()) {
      return _exampleEither;
    }

    const example = _exampleEither.unsafeCoerce();
    const _hiddenLabelEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#hiddenLabel",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_hiddenLabelEither.isLeft()) {
      return _hiddenLabelEither;
    }

    const hiddenLabel = _hiddenLabelEither.unsafeCoerce();
    const _hiddenLabelXlEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly Label[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2008/05/skos-xl#hiddenLabel",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
            .toValues()
            .head()
            .chain((value) => value.toResource())
            .chain((_resource) =>
              Label.fromRdf({
                ..._context,
                ignoreRdfType: true,
                languageIn: _languageIn,
                resource: _resource,
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_hiddenLabelXlEither.isLeft()) {
      return _hiddenLabelXlEither;
    }

    const hiddenLabelXl = _hiddenLabelXlEither.unsafeCoerce();
    const _historyNoteEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#historyNote",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_historyNoteEither.isLeft()) {
      return _historyNoteEither;
    }

    const historyNote = _historyNoteEither.unsafeCoerce();
    const identifier = _resource.identifier;
    const _notationEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#notation"),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_notationEither.isLeft()) {
      return _notationEither;
    }

    const notation = _notationEither.unsafeCoerce();
    const _noteEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#notation"),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_noteEither.isLeft()) {
      return _noteEither;
    }

    const note = _noteEither.unsafeCoerce();
    const _prefLabelEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#prefLabel",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_prefLabelEither.isLeft()) {
      return _prefLabelEither;
    }

    const prefLabel = _prefLabelEither.unsafeCoerce();
    const _prefLabelXlEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly Label[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode("http://www.w3.org/2008/05/skos-xl#prefLabel"),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
            .toValues()
            .head()
            .chain((value) => value.toResource())
            .chain((_resource) =>
              Label.fromRdf({
                ..._context,
                ignoreRdfType: true,
                languageIn: _languageIn,
                resource: _resource,
              }),
            )
            .toMaybe()
            .toList(),
        ),
    ]);
    if (_prefLabelXlEither.isLeft()) {
      return _prefLabelXlEither;
    }

    const prefLabelXl = _prefLabelXlEither.unsafeCoerce();
    const _scopeNoteEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#scopeNote",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_scopeNoteEither.isLeft()) {
      return _scopeNoteEither;
    }

    const scopeNote = _scopeNoteEither.unsafeCoerce();
    return purify.Either.of(
      new Resource({
        altLabel,
        altLabelXl,
        changeNote,
        definition,
        editorialNote,
        example,
        hiddenLabel,
        hiddenLabelXl,
        historyNote,
        identifier,
        notation,
        note,
        prefLabel,
        prefLabelXl,
        scopeNote,
      }),
    );
  }

  export class SparqlGraphPatterns extends sparqlBuilder.ResourceGraphPatterns {
    constructor(
      subject: sparqlBuilder.ResourceGraphPatterns.SubjectParameter,
      _options?: { ignoreRdfType?: boolean },
    ) {
      super(subject);
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#altLabel",
            ),
            this.variable("AltLabel"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2008/05/skos-xl#altLabel",
              ),
              this.variable("AltLabelXl"),
            ).chainObject(
              (_object) =>
                new Label.SparqlGraphPatterns(_object, { ignoreRdfType: true }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#changeNote",
            ),
            this.variable("ChangeNote"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#definition",
            ),
            this.variable("Definition"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#editorialNote",
            ),
            this.variable("EditorialNote"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#example",
            ),
            this.variable("Example"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#hiddenLabel",
            ),
            this.variable("HiddenLabel"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2008/05/skos-xl#hiddenLabel",
              ),
              this.variable("HiddenLabelXl"),
            ).chainObject(
              (_object) =>
                new Label.SparqlGraphPatterns(_object, { ignoreRdfType: true }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#historyNote",
            ),
            this.variable("HistoryNote"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#notation",
            ),
            this.variable("Notation"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#notation",
            ),
            this.variable("Note"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#prefLabel",
            ),
            this.variable("PrefLabel"),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2008/05/skos-xl#prefLabel",
              ),
              this.variable("PrefLabelXl"),
            ).chainObject(
              (_object) =>
                new Label.SparqlGraphPatterns(_object, { ignoreRdfType: true }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#scopeNote",
            ),
            this.variable("ScopeNote"),
          ),
        ),
      );
    }
  }
}
export class Collection extends Resource {
  identifier: rdfjs.NamedNode;
  readonly member: readonly (Collection | Concept)[];
  override readonly type: "Collection" | "OrderedCollection" = "Collection";

  constructor(
    parameters: {
      readonly identifier: rdfjs.NamedNode;
      readonly member?: readonly (Collection | Concept)[];
    } & ConstructorParameters<typeof Resource>[0],
  ) {
    super(parameters);
    this.identifier = parameters.identifier;
    if (Array.isArray(parameters.member)) {
      this.member = parameters.member;
    } else if (typeof parameters.member === "undefined") {
      this.member = [];
    } else {
      this.member = parameters.member; // never
    }
  }

  override equals(other: Collection): purifyHelpers.Equatable.EqualsResult {
    return super.equals(other).chain(() =>
      ((left, right) =>
        purifyHelpers.Arrays.equals(
          left,
          right,
          (left: Collection | Concept, right: Collection | Concept) => {
            if (left.type === "Collection" && right.type === "Collection") {
              return purifyHelpers.Equatable.equals(left, right);
            }
            if (left.type === "Concept" && right.type === "Concept") {
              return purifyHelpers.Equatable.equals(left, right);
            }

            return purify.Left({
              left,
              right,
              propertyName: "type",
              propertyValuesUnequal: {
                left: typeof left,
                right: typeof right,
                type: "BooleanEquals" as const,
              },
              type: "Property" as const,
            });
          },
        ))(this.member, other.member).mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "member",
        propertyValuesUnequal,
        type: "Property" as const,
      })),
    );
  }

  override hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    super.hash(_hasher);
    for (const _element0 of this.member) {
      switch (_element0.type) {
        case "Collection": {
          _element0.hash(_hasher);
          break;
        }
        case "Concept": {
          _element0.hash(_hasher);
          break;
        }
      }
    }

    return _hasher;
  }

  override toJson(): {
    readonly member: readonly (
      | ReturnType<Collection["toJson"]>
      | ReturnType<Concept["toJson"]>
    )[];
  } & ReturnType<Resource["toJson"]> {
    return JSON.parse(
      JSON.stringify({
        ...super.toJson(),
        member: this.member.map((_item) =>
          _item.type === "Concept" ? _item.toJson() : _item.toJson(),
        ),
      } satisfies ReturnType<Collection["toJson"]>),
    );
  }

  override toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = super.toRdf({
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
          "http://www.w3.org/2004/02/skos/core#Collection",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#member"),
      this.member.map((_value) =>
        _value.type === "Concept"
          ? _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet })
          : _value.toRdf({
              mutateGraph: mutateGraph,
              resourceSet: resourceSet,
            }),
      ),
    );
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace Collection {
  export function fromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<rdfjsResource.Resource.ValueError, Collection> {
    return Resource.interfaceFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    }).chain((_super) => {
      if (
        !_ignoreRdfType &&
        !_resource.isInstanceOf(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#Collection",
          ),
        )
      ) {
        return purify.Left(
          new rdfjsResource.Resource.ValueError({
            focusResource: _resource,
            message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type`,
            predicate: dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#Collection",
            ),
          }),
        );
      }
      const identifier = _resource.identifier;
      const _memberEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly (Collection | Concept)[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#member"),
            { unique: true },
          )
          .flatMap((_value) =>
            (
              _value
                .toValues()
                .head()
                .chain((value) => value.toNamedResource())
                .chain((_resource) =>
                  Collection.fromRdf({
                    ..._context,
                    ignoreRdfType: true,
                    languageIn: _languageIn,
                    resource: _resource,
                  }),
                ) as purify.Either<
                rdfjsResource.Resource.ValueError,
                Collection | Concept
              >
            )
              .altLazy(
                () =>
                  _value
                    .toValues()
                    .head()
                    .chain((value) => value.toNamedResource())
                    .chain((_resource) =>
                      Concept.fromRdf({
                        ..._context,
                        ignoreRdfType: true,
                        languageIn: _languageIn,
                        resource: _resource,
                      }),
                    ) as purify.Either<
                    rdfjsResource.Resource.ValueError,
                    Collection | Concept
                  >,
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_memberEither.isLeft()) {
        return _memberEither;
      }
      const member = _memberEither.unsafeCoerce();
      return purify.Either.of(
        new Collection({
          altLabel: _super.altLabel,
          altLabelXl: _super.altLabelXl,
          changeNote: _super.changeNote,
          definition: _super.definition,
          editorialNote: _super.editorialNote,
          example: _super.example,
          hiddenLabel: _super.hiddenLabel,
          hiddenLabelXl: _super.hiddenLabelXl,
          historyNote: _super.historyNote,
          identifier,
          notation: _super.notation,
          note: _super.note,
          prefLabel: _super.prefLabel,
          prefLabelXl: _super.prefLabelXl,
          scopeNote: _super.scopeNote,
          member,
        }),
      );
    });
  }

  export class SparqlGraphPatterns extends Resource.SparqlGraphPatterns {
    constructor(
      subject: sparqlBuilder.ResourceGraphPatterns.SubjectParameter,
      _options?: { ignoreRdfType?: boolean },
    ) {
      super(subject, { ignoreRdfType: true });
      if (!_options?.ignoreRdfType) {
        this.add(
          ...new sparqlBuilder.RdfTypeGraphPatterns(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#Collection",
            ),
          ),
        );
      }

      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.union(
            sparqlBuilder.GraphPattern.group(
              sparqlBuilder.GraphPattern.basic(
                this.subject,
                dataFactory.namedNode(
                  "http://www.w3.org/2004/02/skos/core#member",
                ),
                this.variable("Member"),
              ).chainObject(
                (_object) =>
                  new Collection.SparqlGraphPatterns(_object, {
                    ignoreRdfType: true,
                  }),
              ),
            ),
            sparqlBuilder.GraphPattern.group(
              sparqlBuilder.GraphPattern.basic(
                this.subject,
                dataFactory.namedNode(
                  "http://www.w3.org/2004/02/skos/core#member",
                ),
                this.variable("Member"),
              ).chainObject(
                (_object) =>
                  new Concept.SparqlGraphPatterns(_object, {
                    ignoreRdfType: true,
                  }),
              ),
            ),
          ),
        ),
      );
    }
  }
}
export class OrderedCollection extends Collection {
  readonly memberList: readonly (Collection | Concept)[];
  override readonly type = "OrderedCollection";

  constructor(
    parameters: {
      readonly identifier: rdfjs.NamedNode;
      readonly memberList: readonly (Collection | Concept)[];
    } & ConstructorParameters<typeof Collection>[0],
  ) {
    super(parameters);
    this.memberList = parameters.memberList;
  }

  override equals(
    other: OrderedCollection,
  ): purifyHelpers.Equatable.EqualsResult {
    return super.equals(other).chain(() =>
      ((left, right) =>
        purifyHelpers.Arrays.equals(
          left,
          right,
          (left: Collection | Concept, right: Collection | Concept) => {
            if (left.type === "Collection" && right.type === "Collection") {
              return purifyHelpers.Equatable.equals(left, right);
            }
            if (left.type === "Concept" && right.type === "Concept") {
              return purifyHelpers.Equatable.equals(left, right);
            }

            return purify.Left({
              left,
              right,
              propertyName: "type",
              propertyValuesUnequal: {
                left: typeof left,
                right: typeof right,
                type: "BooleanEquals" as const,
              },
              type: "Property" as const,
            });
          },
        ))(this.memberList, other.memberList).mapLeft(
        (propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "memberList",
          propertyValuesUnequal,
          type: "Property" as const,
        }),
      ),
    );
  }

  override hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    super.hash(_hasher);
    for (const _element0 of this.memberList) {
      switch (_element0.type) {
        case "Collection": {
          _element0.hash(_hasher);
          break;
        }
        case "Concept": {
          _element0.hash(_hasher);
          break;
        }
      }
    }

    return _hasher;
  }

  override toJson(): {
    readonly memberList: readonly (
      | ReturnType<Collection["toJson"]>
      | ReturnType<Concept["toJson"]>
    )[];
  } & ReturnType<Collection["toJson"]> {
    return JSON.parse(
      JSON.stringify({
        ...super.toJson(),
        memberList: this.memberList.map((_item) =>
          _item.type === "Concept" ? _item.toJson() : _item.toJson(),
        ),
      } satisfies ReturnType<OrderedCollection["toJson"]>),
    );
  }

  override toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = super.toRdf({
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
          "http://www.w3.org/2004/02/skos/core#OrderedCollection",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#memberList"),
      this.memberList.reduce(
        ({ currentSubListResource, listResource }, item, itemIndex, list) => {
          if (itemIndex === 0) {
            currentSubListResource = listResource;
          } else {
            const newSubListResource = resourceSet.mutableResource({
              identifier: dataFactory.blankNode(),
              mutateGraph: mutateGraph,
            });
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
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            ),
            dataFactory.namedNode(
              "http://kos-kit.github.io/skos-shacl/ns#OrderedCollectionMemberList",
            ),
          );

          currentSubListResource.add(
            dataFactory.namedNode(
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            ),
            item.type === "Concept"
              ? item.toRdf({
                  mutateGraph: mutateGraph,
                  resourceSet: resourceSet,
                })
              : item.toRdf({
                  mutateGraph: mutateGraph,
                  resourceSet: resourceSet,
                }),
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
          listResource: resourceSet.mutableResource({
            identifier: dataFactory.blankNode(),
            mutateGraph: mutateGraph,
          }),
        } as {
          currentSubListResource: rdfjsResource.MutableResource | null;
          listResource: rdfjsResource.MutableResource;
        },
      ).listResource.identifier,
    );
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace OrderedCollection {
  export function fromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<rdfjsResource.Resource.ValueError, OrderedCollection> {
    return Collection.fromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    }).chain((_super) => {
      if (
        !_ignoreRdfType &&
        !_resource.isInstanceOf(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#OrderedCollection",
          ),
        )
      ) {
        return purify.Left(
          new rdfjsResource.Resource.ValueError({
            focusResource: _resource,
            message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type`,
            predicate: dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#OrderedCollection",
            ),
          }),
        );
      }
      const identifier = _resource.identifier;
      const _memberListEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly (Collection | Concept)[]
      > = _resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#memberList",
          ),
          { unique: true },
        )
        .head()
        .chain((value) =>
          value
            .toResource()
            .map((resource) =>
              resource.isInstanceOf(
                dataFactory.namedNode(
                  "http://kos-kit.github.io/skos-shacl/ns#OrderedCollectionMemberList",
                ),
              ),
            )
            .orDefault(false)
            ? purify.Right<
                rdfjsResource.Resource.Value,
                rdfjsResource.Resource.ValueError
              >(value)
            : purify.Left<
                rdfjsResource.Resource.ValueError,
                rdfjsResource.Resource.Value
              >(
                new rdfjsResource.Resource.ValueError({
                  focusResource: _resource,
                  message: "unexpected RDF type",
                  predicate: dataFactory.namedNode(
                    "http://kos-kit.github.io/skos-shacl/ns#OrderedCollectionMemberList",
                  ),
                }),
              ),
        )
        .chain((value) => value.toList())
        .map((values) =>
          values.flatMap((_value) =>
            (
              _value
                .toValues()
                .head()
                .chain((value) => value.toNamedResource())
                .chain((_resource) =>
                  Collection.fromRdf({
                    ..._context,
                    ignoreRdfType: true,
                    languageIn: _languageIn,
                    resource: _resource,
                  }),
                ) as purify.Either<
                rdfjsResource.Resource.ValueError,
                Collection | Concept
              >
            )
              .altLazy(
                () =>
                  _value
                    .toValues()
                    .head()
                    .chain((value) => value.toNamedResource())
                    .chain((_resource) =>
                      Concept.fromRdf({
                        ..._context,
                        ignoreRdfType: true,
                        languageIn: _languageIn,
                        resource: _resource,
                      }),
                    ) as purify.Either<
                    rdfjsResource.Resource.ValueError,
                    Collection | Concept
                  >,
              )
              .toMaybe()
              .toList(),
          ),
        );
      if (_memberListEither.isLeft()) {
        return _memberListEither;
      }
      const memberList = _memberListEither.unsafeCoerce();
      return purify.Either.of(
        new OrderedCollection({
          identifier,
          member: _super.member,
          altLabel: _super.altLabel,
          altLabelXl: _super.altLabelXl,
          changeNote: _super.changeNote,
          definition: _super.definition,
          editorialNote: _super.editorialNote,
          example: _super.example,
          hiddenLabel: _super.hiddenLabel,
          hiddenLabelXl: _super.hiddenLabelXl,
          historyNote: _super.historyNote,
          notation: _super.notation,
          note: _super.note,
          prefLabel: _super.prefLabel,
          prefLabelXl: _super.prefLabelXl,
          scopeNote: _super.scopeNote,
          memberList,
        }),
      );
    });
  }

  export class SparqlGraphPatterns extends Collection.SparqlGraphPatterns {
    constructor(
      subject: sparqlBuilder.ResourceGraphPatterns.SubjectParameter,
      _options?: { ignoreRdfType?: boolean },
    ) {
      super(subject, { ignoreRdfType: true });
      if (!_options?.ignoreRdfType) {
        this.add(
          ...new sparqlBuilder.RdfTypeGraphPatterns(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#OrderedCollection",
            ),
          ),
        );
      }

      this.add(
        sparqlBuilder.GraphPattern.group(
          sparqlBuilder.GraphPattern.basic(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#memberList",
            ),
            this.variable("MemberList"),
          ).chainObject(
            (_object) =>
              new sparqlBuilder.RdfListGraphPatterns({
                rdfListType: dataFactory.namedNode(
                  "http://kos-kit.github.io/skos-shacl/ns#OrderedCollectionMemberList",
                ),
                rdfList: _object,
              }),
          ),
        ),
      );
    }
  }
}
export class ConceptScheme extends Resource {
  readonly hasTopConcept: readonly Concept[];
  identifier: rdfjs.NamedNode;
  override readonly type = "ConceptScheme";

  constructor(
    parameters: {
      readonly hasTopConcept?: readonly Concept[];
      readonly identifier: rdfjs.NamedNode;
    } & ConstructorParameters<typeof Resource>[0],
  ) {
    super(parameters);
    if (Array.isArray(parameters.hasTopConcept)) {
      this.hasTopConcept = parameters.hasTopConcept;
    } else if (typeof parameters.hasTopConcept === "undefined") {
      this.hasTopConcept = [];
    } else {
      this.hasTopConcept = parameters.hasTopConcept; // never
    }

    this.identifier = parameters.identifier;
  }

  override equals(other: ConceptScheme): purifyHelpers.Equatable.EqualsResult {
    return super.equals(other).chain(() =>
      purifyHelpers.Equatable.arrayEquals(
        this.hasTopConcept,
        other.hasTopConcept,
      ).mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "hasTopConcept",
        propertyValuesUnequal,
        type: "Property" as const,
      })),
    );
  }

  override hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    super.hash(_hasher);
    for (const _element0 of this.hasTopConcept) {
      _element0.hash(_hasher);
    }

    return _hasher;
  }

  override toJson(): {
    readonly hasTopConcept: readonly ReturnType<Concept["toJson"]>[];
  } & ReturnType<Resource["toJson"]> {
    return JSON.parse(
      JSON.stringify({
        ...super.toJson(),
        hasTopConcept: this.hasTopConcept.map((_item) => _item.toJson()),
      } satisfies ReturnType<ConceptScheme["toJson"]>),
    );
  }

  override toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = super.toRdf({
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
          "http://www.w3.org/2004/02/skos/core#ConceptScheme",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode(
        "http://www.w3.org/2004/02/skos/core#hasTopConcept",
      ),
      this.hasTopConcept.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace ConceptScheme {
  export function fromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<rdfjsResource.Resource.ValueError, ConceptScheme> {
    return Resource.interfaceFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    }).chain((_super) => {
      if (
        !_ignoreRdfType &&
        !_resource.isInstanceOf(
          dataFactory.namedNode(
            "http://www.w3.org/2004/02/skos/core#ConceptScheme",
          ),
        )
      ) {
        return purify.Left(
          new rdfjsResource.Resource.ValueError({
            focusResource: _resource,
            message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type`,
            predicate: dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#ConceptScheme",
            ),
          }),
        );
      }
      const _hasTopConceptEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#hasTopConcept",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_hasTopConceptEither.isLeft()) {
        return _hasTopConceptEither;
      }
      const hasTopConcept = _hasTopConceptEither.unsafeCoerce();
      const identifier = _resource.identifier;
      return purify.Either.of(
        new ConceptScheme({
          altLabel: _super.altLabel,
          altLabelXl: _super.altLabelXl,
          changeNote: _super.changeNote,
          definition: _super.definition,
          editorialNote: _super.editorialNote,
          example: _super.example,
          hiddenLabel: _super.hiddenLabel,
          hiddenLabelXl: _super.hiddenLabelXl,
          historyNote: _super.historyNote,
          identifier,
          notation: _super.notation,
          note: _super.note,
          prefLabel: _super.prefLabel,
          prefLabelXl: _super.prefLabelXl,
          scopeNote: _super.scopeNote,
          hasTopConcept,
        }),
      );
    });
  }

  export class SparqlGraphPatterns extends Resource.SparqlGraphPatterns {
    constructor(
      subject: sparqlBuilder.ResourceGraphPatterns.SubjectParameter,
      _options?: { ignoreRdfType?: boolean },
    ) {
      super(subject, { ignoreRdfType: true });
      if (!_options?.ignoreRdfType) {
        this.add(
          ...new sparqlBuilder.RdfTypeGraphPatterns(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#ConceptScheme",
            ),
          ),
        );
      }

      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#hasTopConcept",
              ),
              this.variable("HasTopConcept"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
    }
  }
}
export class Label {
  private _identifier: rdfjs.BlankNode | rdfjs.NamedNode | undefined;
  readonly literalForm: readonly rdfjs.Literal[];
  readonly type = "Label";

  constructor(parameters: {
    readonly identifier?: rdfjs.BlankNode | rdfjs.NamedNode;
    readonly literalForm: readonly rdfjs.Literal[];
  }) {
    this._identifier = parameters.identifier;
    this.literalForm = parameters.literalForm;
  }

  get identifier(): rdfjs.BlankNode | rdfjs.NamedNode {
    if (typeof this._identifier === "undefined") {
      this._identifier = dataFactory.blankNode();
    }
    return this._identifier;
  }

  equals(other: Label): purifyHelpers.Equatable.EqualsResult {
    return purifyHelpers.Equatable.booleanEquals(
      this.identifier,
      other.identifier,
    )
      .mapLeft((propertyValuesUnequal) => ({
        left: this,
        right: other,
        propertyName: "identifier",
        propertyValuesUnequal,
        type: "Property" as const,
      }))
      .chain(() =>
        ((left, right) =>
          purifyHelpers.Arrays.equals(
            left,
            right,
            purifyHelpers.Equatable.booleanEquals,
          ))(this.literalForm, other.literalForm).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "literalForm",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      )
      .chain(() =>
        purifyHelpers.Equatable.strictEquals(this.type, other.type).mapLeft(
          (propertyValuesUnequal) => ({
            left: this,
            right: other,
            propertyName: "type",
            propertyValuesUnequal,
            type: "Property" as const,
          }),
        ),
      );
  }

  hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    for (const _element0 of this.literalForm) {
      _hasher.update(_element0.termType);
      _hasher.update(_element0.value);
    }

    return _hasher;
  }

  toJson(): {
    readonly "@id": string;
    readonly literalForm: readonly {
      "@language": string | undefined;
      "@type": string | undefined;
      "@value": string;
    }[];
    readonly type: string;
  } {
    return JSON.parse(
      JSON.stringify({
        "@id": this.identifier.value,
        literalForm: this.literalForm.map((_item) => ({
          "@language": _item.language.length > 0 ? _item.language : undefined,
          "@type":
            _item.datatype.value !== "http://www.w3.org/2001/XMLSchema#string"
              ? _item.datatype.value
              : undefined,
          "@value": _item.value,
        })),
        type: this.type,
      } satisfies ReturnType<Label["toJson"]>),
    );
  }

  toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource {
    const _resource = resourceSet.mutableResource({
      identifier: this.identifier,
      mutateGraph,
    });
    if (!ignoreRdfType) {
      _resource.add(
        _resource.dataFactory.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        ),
        _resource.dataFactory.namedNode(
          "http://www.w3.org/2008/05/skos-xl#Label",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2008/05/skos-xl#literalForm"),
      this.literalForm,
    );
    return _resource;
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace Label {
  export function fromRdf({
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
  }): purify.Either<rdfjsResource.Resource.ValueError, Label> {
    if (
      !_ignoreRdfType &&
      !_resource.isInstanceOf(
        dataFactory.namedNode("http://www.w3.org/2008/05/skos-xl#Label"),
      )
    ) {
      return purify.Left(
        new rdfjsResource.Resource.ValueError({
          focusResource: _resource,
          message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type`,
          predicate: dataFactory.namedNode(
            "http://www.w3.org/2008/05/skos-xl#Label",
          ),
        }),
      );
    }

    const identifier = _resource.identifier;
    const _literalFormEither: purify.Either<
      rdfjsResource.Resource.ValueError,
      readonly rdfjs.Literal[]
    > = purify.Either.of([
      ..._resource
        .values(
          dataFactory.namedNode(
            "http://www.w3.org/2008/05/skos-xl#literalForm",
          ),
          { unique: true },
        )
        .flatMap((_value) =>
          _value
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
    if (_literalFormEither.isLeft()) {
      return _literalFormEither;
    }

    const literalForm = _literalFormEither.unsafeCoerce();
    return purify.Either.of(new Label({ identifier, literalForm }));
  }

  export class SparqlGraphPatterns extends sparqlBuilder.ResourceGraphPatterns {
    constructor(
      subject: sparqlBuilder.ResourceGraphPatterns.SubjectParameter,
      _options?: { ignoreRdfType?: boolean },
    ) {
      super(subject);
      if (!_options?.ignoreRdfType) {
        this.add(
          ...new sparqlBuilder.RdfTypeGraphPatterns(
            this.subject,
            dataFactory.namedNode("http://www.w3.org/2008/05/skos-xl#Label"),
          ),
        );
      }

      this.add(
        sparqlBuilder.GraphPattern.basic(
          this.subject,
          dataFactory.namedNode(
            "http://www.w3.org/2008/05/skos-xl#literalForm",
          ),
          this.variable("LiteralForm"),
        ),
      );
    }
  }
}
export class Concept extends Resource {
  readonly broader: readonly Concept[];
  readonly broaderTransitive: readonly Concept[];
  readonly broadMatch: readonly Concept[];
  readonly closeMatch: readonly Concept[];
  readonly exactMatch: readonly Concept[];
  identifier: rdfjs.NamedNode;
  readonly inScheme: readonly ConceptScheme[];
  readonly mappingRelation: readonly Concept[];
  readonly narrower: readonly Concept[];
  readonly narrowerTransitive: readonly Concept[];
  readonly narrowMatch: readonly Concept[];
  readonly related: readonly Concept[];
  readonly relatedMatch: readonly Concept[];
  readonly semanticRelation: readonly Concept[];
  readonly topConceptOf: readonly ConceptScheme[];
  override readonly type = "Concept";

  constructor(
    parameters: {
      readonly broader?: readonly Concept[];
      readonly broaderTransitive?: readonly Concept[];
      readonly broadMatch?: readonly Concept[];
      readonly closeMatch?: readonly Concept[];
      readonly exactMatch?: readonly Concept[];
      readonly identifier: rdfjs.NamedNode;
      readonly inScheme?: readonly ConceptScheme[];
      readonly mappingRelation?: readonly Concept[];
      readonly narrower?: readonly Concept[];
      readonly narrowerTransitive?: readonly Concept[];
      readonly narrowMatch?: readonly Concept[];
      readonly related?: readonly Concept[];
      readonly relatedMatch?: readonly Concept[];
      readonly semanticRelation?: readonly Concept[];
      readonly topConceptOf?: readonly ConceptScheme[];
    } & ConstructorParameters<typeof Resource>[0],
  ) {
    super(parameters);
    if (Array.isArray(parameters.broader)) {
      this.broader = parameters.broader;
    } else if (typeof parameters.broader === "undefined") {
      this.broader = [];
    } else {
      this.broader = parameters.broader; // never
    }

    if (Array.isArray(parameters.broaderTransitive)) {
      this.broaderTransitive = parameters.broaderTransitive;
    } else if (typeof parameters.broaderTransitive === "undefined") {
      this.broaderTransitive = [];
    } else {
      this.broaderTransitive = parameters.broaderTransitive; // never
    }

    if (Array.isArray(parameters.broadMatch)) {
      this.broadMatch = parameters.broadMatch;
    } else if (typeof parameters.broadMatch === "undefined") {
      this.broadMatch = [];
    } else {
      this.broadMatch = parameters.broadMatch; // never
    }

    if (Array.isArray(parameters.closeMatch)) {
      this.closeMatch = parameters.closeMatch;
    } else if (typeof parameters.closeMatch === "undefined") {
      this.closeMatch = [];
    } else {
      this.closeMatch = parameters.closeMatch; // never
    }

    if (Array.isArray(parameters.exactMatch)) {
      this.exactMatch = parameters.exactMatch;
    } else if (typeof parameters.exactMatch === "undefined") {
      this.exactMatch = [];
    } else {
      this.exactMatch = parameters.exactMatch; // never
    }

    this.identifier = parameters.identifier;
    if (Array.isArray(parameters.inScheme)) {
      this.inScheme = parameters.inScheme;
    } else if (typeof parameters.inScheme === "undefined") {
      this.inScheme = [];
    } else {
      this.inScheme = parameters.inScheme; // never
    }

    if (Array.isArray(parameters.mappingRelation)) {
      this.mappingRelation = parameters.mappingRelation;
    } else if (typeof parameters.mappingRelation === "undefined") {
      this.mappingRelation = [];
    } else {
      this.mappingRelation = parameters.mappingRelation; // never
    }

    if (Array.isArray(parameters.narrower)) {
      this.narrower = parameters.narrower;
    } else if (typeof parameters.narrower === "undefined") {
      this.narrower = [];
    } else {
      this.narrower = parameters.narrower; // never
    }

    if (Array.isArray(parameters.narrowerTransitive)) {
      this.narrowerTransitive = parameters.narrowerTransitive;
    } else if (typeof parameters.narrowerTransitive === "undefined") {
      this.narrowerTransitive = [];
    } else {
      this.narrowerTransitive = parameters.narrowerTransitive; // never
    }

    if (Array.isArray(parameters.narrowMatch)) {
      this.narrowMatch = parameters.narrowMatch;
    } else if (typeof parameters.narrowMatch === "undefined") {
      this.narrowMatch = [];
    } else {
      this.narrowMatch = parameters.narrowMatch; // never
    }

    if (Array.isArray(parameters.related)) {
      this.related = parameters.related;
    } else if (typeof parameters.related === "undefined") {
      this.related = [];
    } else {
      this.related = parameters.related; // never
    }

    if (Array.isArray(parameters.relatedMatch)) {
      this.relatedMatch = parameters.relatedMatch;
    } else if (typeof parameters.relatedMatch === "undefined") {
      this.relatedMatch = [];
    } else {
      this.relatedMatch = parameters.relatedMatch; // never
    }

    if (Array.isArray(parameters.semanticRelation)) {
      this.semanticRelation = parameters.semanticRelation;
    } else if (typeof parameters.semanticRelation === "undefined") {
      this.semanticRelation = [];
    } else {
      this.semanticRelation = parameters.semanticRelation; // never
    }

    if (Array.isArray(parameters.topConceptOf)) {
      this.topConceptOf = parameters.topConceptOf;
    } else if (typeof parameters.topConceptOf === "undefined") {
      this.topConceptOf = [];
    } else {
      this.topConceptOf = parameters.topConceptOf; // never
    }
  }

  override equals(other: Concept): purifyHelpers.Equatable.EqualsResult {
    return super
      .equals(other)
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.broader,
          other.broader,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "broader",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.broaderTransitive,
          other.broaderTransitive,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "broaderTransitive",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.broadMatch,
          other.broadMatch,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "broadMatch",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.closeMatch,
          other.closeMatch,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "closeMatch",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.exactMatch,
          other.exactMatch,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "exactMatch",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.inScheme,
          other.inScheme,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "inScheme",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.mappingRelation,
          other.mappingRelation,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "mappingRelation",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.narrower,
          other.narrower,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "narrower",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.narrowerTransitive,
          other.narrowerTransitive,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "narrowerTransitive",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.narrowMatch,
          other.narrowMatch,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "narrowMatch",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.related,
          other.related,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "related",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.relatedMatch,
          other.relatedMatch,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "relatedMatch",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.semanticRelation,
          other.semanticRelation,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "semanticRelation",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      )
      .chain(() =>
        purifyHelpers.Equatable.arrayEquals(
          this.topConceptOf,
          other.topConceptOf,
        ).mapLeft((propertyValuesUnequal) => ({
          left: this,
          right: other,
          propertyName: "topConceptOf",
          propertyValuesUnequal,
          type: "Property" as const,
        })),
      );
  }

  override hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    super.hash(_hasher);
    for (const _element0 of this.broader) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.broaderTransitive) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.broadMatch) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.closeMatch) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.exactMatch) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.inScheme) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.mappingRelation) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.narrower) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.narrowerTransitive) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.narrowMatch) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.related) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.relatedMatch) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.semanticRelation) {
      _element0.hash(_hasher);
    }

    for (const _element0 of this.topConceptOf) {
      _element0.hash(_hasher);
    }

    return _hasher;
  }

  override toJson(): {
    readonly broader: readonly ReturnType<Concept["toJson"]>[];
    readonly broaderTransitive: readonly ReturnType<Concept["toJson"]>[];
    readonly broadMatch: readonly ReturnType<Concept["toJson"]>[];
    readonly closeMatch: readonly ReturnType<Concept["toJson"]>[];
    readonly exactMatch: readonly ReturnType<Concept["toJson"]>[];
    readonly inScheme: readonly ReturnType<ConceptScheme["toJson"]>[];
    readonly mappingRelation: readonly ReturnType<Concept["toJson"]>[];
    readonly narrower: readonly ReturnType<Concept["toJson"]>[];
    readonly narrowerTransitive: readonly ReturnType<Concept["toJson"]>[];
    readonly narrowMatch: readonly ReturnType<Concept["toJson"]>[];
    readonly related: readonly ReturnType<Concept["toJson"]>[];
    readonly relatedMatch: readonly ReturnType<Concept["toJson"]>[];
    readonly semanticRelation: readonly ReturnType<Concept["toJson"]>[];
    readonly topConceptOf: readonly ReturnType<ConceptScheme["toJson"]>[];
  } & ReturnType<Resource["toJson"]> {
    return JSON.parse(
      JSON.stringify({
        ...super.toJson(),
        broader: this.broader.map((_item) => _item.toJson()),
        broaderTransitive: this.broaderTransitive.map((_item) =>
          _item.toJson(),
        ),
        broadMatch: this.broadMatch.map((_item) => _item.toJson()),
        closeMatch: this.closeMatch.map((_item) => _item.toJson()),
        exactMatch: this.exactMatch.map((_item) => _item.toJson()),
        inScheme: this.inScheme.map((_item) => _item.toJson()),
        mappingRelation: this.mappingRelation.map((_item) => _item.toJson()),
        narrower: this.narrower.map((_item) => _item.toJson()),
        narrowerTransitive: this.narrowerTransitive.map((_item) =>
          _item.toJson(),
        ),
        narrowMatch: this.narrowMatch.map((_item) => _item.toJson()),
        related: this.related.map((_item) => _item.toJson()),
        relatedMatch: this.relatedMatch.map((_item) => _item.toJson()),
        semanticRelation: this.semanticRelation.map((_item) => _item.toJson()),
        topConceptOf: this.topConceptOf.map((_item) => _item.toJson()),
      } satisfies ReturnType<Concept["toJson"]>),
    );
  }

  override toRdf({
    ignoreRdfType,
    mutateGraph,
    resourceSet,
  }: {
    ignoreRdfType?: boolean;
    mutateGraph: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }): rdfjsResource.MutableResource<rdfjs.NamedNode> {
    const _resource = super.toRdf({
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
          "http://www.w3.org/2004/02/skos/core#Concept",
        ),
      );
    }

    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#broader"),
      this.broader.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://www.w3.org/2004/02/skos/core#broaderTransitive",
      ),
      this.broaderTransitive.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#broadMatch"),
      this.broadMatch.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#closeMatch"),
      this.closeMatch.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#exactMatch"),
      this.exactMatch.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#inScheme"),
      this.inScheme.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://www.w3.org/2004/02/skos/core#mappingRelation",
      ),
      this.mappingRelation.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#narrower"),
      this.narrower.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://www.w3.org/2004/02/skos/core#narrowerTransitive",
      ),
      this.narrowerTransitive.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#narrowMatch"),
      this.narrowMatch.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#related"),
      this.related.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#relatedMatch"),
      this.relatedMatch.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode(
        "http://www.w3.org/2004/02/skos/core#semanticRelation",
      ),
      this.semanticRelation.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    _resource.add(
      dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#topConceptOf"),
      this.topConceptOf.map((_value) =>
        _value.toRdf({ mutateGraph: mutateGraph, resourceSet: resourceSet }),
      ),
    );
    return _resource;
  }

  override toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export namespace Concept {
  export function fromRdf({
    ignoreRdfType: _ignoreRdfType,
    languageIn: _languageIn,
    resource: _resource,
    // @ts-ignore
    ..._context
  }: {
    [_index: string]: any;
    ignoreRdfType?: boolean;
    languageIn?: readonly string[];
    resource: rdfjsResource.Resource<rdfjs.NamedNode>;
  }): purify.Either<rdfjsResource.Resource.ValueError, Concept> {
    return Resource.interfaceFromRdf({
      ..._context,
      ignoreRdfType: true,
      languageIn: _languageIn,
      resource: _resource,
    }).chain((_super) => {
      if (
        !_ignoreRdfType &&
        !_resource.isInstanceOf(
          dataFactory.namedNode("http://www.w3.org/2004/02/skos/core#Concept"),
        )
      ) {
        return purify.Left(
          new rdfjsResource.Resource.ValueError({
            focusResource: _resource,
            message: `${rdfjsResource.Resource.Identifier.toString(_resource.identifier)} has unexpected RDF type`,
            predicate: dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#Concept",
            ),
          }),
        );
      }
      const _broaderEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#broader",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_broaderEither.isLeft()) {
        return _broaderEither;
      }
      const broader = _broaderEither.unsafeCoerce();
      const _broaderTransitiveEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#broaderTransitive",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_broaderTransitiveEither.isLeft()) {
        return _broaderTransitiveEither;
      }
      const broaderTransitive = _broaderTransitiveEither.unsafeCoerce();
      const _broadMatchEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#broadMatch",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_broadMatchEither.isLeft()) {
        return _broadMatchEither;
      }
      const broadMatch = _broadMatchEither.unsafeCoerce();
      const _closeMatchEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#closeMatch",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_closeMatchEither.isLeft()) {
        return _closeMatchEither;
      }
      const closeMatch = _closeMatchEither.unsafeCoerce();
      const _exactMatchEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#exactMatch",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_exactMatchEither.isLeft()) {
        return _exactMatchEither;
      }
      const exactMatch = _exactMatchEither.unsafeCoerce();
      const identifier = _resource.identifier;
      const _inSchemeEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly ConceptScheme[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#inScheme",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                ConceptScheme.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_inSchemeEither.isLeft()) {
        return _inSchemeEither;
      }
      const inScheme = _inSchemeEither.unsafeCoerce();
      const _mappingRelationEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#mappingRelation",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_mappingRelationEither.isLeft()) {
        return _mappingRelationEither;
      }
      const mappingRelation = _mappingRelationEither.unsafeCoerce();
      const _narrowerEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#narrower",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_narrowerEither.isLeft()) {
        return _narrowerEither;
      }
      const narrower = _narrowerEither.unsafeCoerce();
      const _narrowerTransitiveEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#narrowerTransitive",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_narrowerTransitiveEither.isLeft()) {
        return _narrowerTransitiveEither;
      }
      const narrowerTransitive = _narrowerTransitiveEither.unsafeCoerce();
      const _narrowMatchEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#narrowMatch",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_narrowMatchEither.isLeft()) {
        return _narrowMatchEither;
      }
      const narrowMatch = _narrowMatchEither.unsafeCoerce();
      const _relatedEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#related",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_relatedEither.isLeft()) {
        return _relatedEither;
      }
      const related = _relatedEither.unsafeCoerce();
      const _relatedMatchEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#relatedMatch",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_relatedMatchEither.isLeft()) {
        return _relatedMatchEither;
      }
      const relatedMatch = _relatedMatchEither.unsafeCoerce();
      const _semanticRelationEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly Concept[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#semanticRelation",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                Concept.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_semanticRelationEither.isLeft()) {
        return _semanticRelationEither;
      }
      const semanticRelation = _semanticRelationEither.unsafeCoerce();
      const _topConceptOfEither: purify.Either<
        rdfjsResource.Resource.ValueError,
        readonly ConceptScheme[]
      > = purify.Either.of([
        ..._resource
          .values(
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#topConceptOf",
            ),
            { unique: true },
          )
          .flatMap((_value) =>
            _value
              .toValues()
              .head()
              .chain((value) => value.toNamedResource())
              .chain((_resource) =>
                ConceptScheme.fromRdf({
                  ..._context,
                  ignoreRdfType: true,
                  languageIn: _languageIn,
                  resource: _resource,
                }),
              )
              .toMaybe()
              .toList(),
          ),
      ]);
      if (_topConceptOfEither.isLeft()) {
        return _topConceptOfEither;
      }
      const topConceptOf = _topConceptOfEither.unsafeCoerce();
      return purify.Either.of(
        new Concept({
          altLabel: _super.altLabel,
          altLabelXl: _super.altLabelXl,
          changeNote: _super.changeNote,
          definition: _super.definition,
          editorialNote: _super.editorialNote,
          example: _super.example,
          hiddenLabel: _super.hiddenLabel,
          hiddenLabelXl: _super.hiddenLabelXl,
          historyNote: _super.historyNote,
          identifier,
          notation: _super.notation,
          note: _super.note,
          prefLabel: _super.prefLabel,
          prefLabelXl: _super.prefLabelXl,
          scopeNote: _super.scopeNote,
          broader,
          broaderTransitive,
          broadMatch,
          closeMatch,
          exactMatch,
          inScheme,
          mappingRelation,
          narrower,
          narrowerTransitive,
          narrowMatch,
          related,
          relatedMatch,
          semanticRelation,
          topConceptOf,
        }),
      );
    });
  }

  export class SparqlGraphPatterns extends Resource.SparqlGraphPatterns {
    constructor(
      subject: sparqlBuilder.ResourceGraphPatterns.SubjectParameter,
      _options?: { ignoreRdfType?: boolean },
    ) {
      super(subject, { ignoreRdfType: true });
      if (!_options?.ignoreRdfType) {
        this.add(
          ...new sparqlBuilder.RdfTypeGraphPatterns(
            this.subject,
            dataFactory.namedNode(
              "http://www.w3.org/2004/02/skos/core#Concept",
            ),
          ),
        );
      }

      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#broader",
              ),
              this.variable("Broader"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#broaderTransitive",
              ),
              this.variable("BroaderTransitive"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#broadMatch",
              ),
              this.variable("BroadMatch"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#closeMatch",
              ),
              this.variable("CloseMatch"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#exactMatch",
              ),
              this.variable("ExactMatch"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#inScheme",
              ),
              this.variable("InScheme"),
            ).chainObject(
              (_object) =>
                new ConceptScheme.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#mappingRelation",
              ),
              this.variable("MappingRelation"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#narrower",
              ),
              this.variable("Narrower"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#narrowerTransitive",
              ),
              this.variable("NarrowerTransitive"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#narrowMatch",
              ),
              this.variable("NarrowMatch"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#related",
              ),
              this.variable("Related"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#relatedMatch",
              ),
              this.variable("RelatedMatch"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#semanticRelation",
              ),
              this.variable("SemanticRelation"),
            ).chainObject(
              (_object) =>
                new Concept.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
      this.add(
        sparqlBuilder.GraphPattern.optional(
          sparqlBuilder.GraphPattern.group(
            sparqlBuilder.GraphPattern.basic(
              this.subject,
              dataFactory.namedNode(
                "http://www.w3.org/2004/02/skos/core#topConceptOf",
              ),
              this.variable("TopConceptOf"),
            ).chainObject(
              (_object) =>
                new ConceptScheme.SparqlGraphPatterns(_object, {
                  ignoreRdfType: true,
                }),
            ),
          ),
        ),
      );
    }
  }
}

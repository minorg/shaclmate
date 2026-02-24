import type { NamedNode } from "@rdfjs/types";
import { sh } from "@tpluscode/rdf-ns-builders";

import { Either, Left } from "purify-ts";
import { Resource } from "rdfjs-resource";

export interface AlternativePath {
  readonly $type: "AlternativePath";
  readonly members: readonly PropertyPath[];
}

export interface InversePath {
  readonly $type: "InversePath";
  readonly path: PropertyPath;
}

export interface OneOrMorePath {
  readonly $type: "OneOrMorePath";
  readonly path: PropertyPath;
}

export interface PredicatePath {
  readonly iri: NamedNode;
  readonly $type: "PredicatePath";
}

export interface SequencePath {
  readonly $type: "SequencePath";
  readonly members: readonly PropertyPath[];
}

export interface ZeroOrMorePath {
  readonly $type: "ZeroOrMorePath";
  readonly path: PropertyPath;
}

export interface ZeroOrOnePath {
  readonly $type: "ZeroOrOnePath";
  readonly path: PropertyPath;
}

// 2.3.1 SHACL Property Paths
export type PropertyPath =
  | AlternativePath
  | InversePath
  | OneOrMorePath
  | PredicatePath
  | SequencePath
  | ZeroOrMorePath
  | ZeroOrOnePath;

export namespace PropertyPath {
  export function $fromRdf(
    resource: Resource,
    _?: {
      [_index: string]: any;
      ignoreRdfType?: boolean;
      preferredLanguages?: readonly string[];
    },
  ): Either<Error, PropertyPath> {
    // Predicate path
    // sh:path ex:parent
    if (resource.identifier.termType === "NamedNode") {
      return Either.of({ iri: resource.identifier, $type: "PredicatePath" });
    }

    // The other property path types are BlankNodes

    const getPropertyPathList = (
      list: Either<Error, readonly Resource.TermValue[]>,
    ): Either<Error, readonly PropertyPath[]> => {
      return list.chain((values) => {
        const members: PropertyPath[] = [];
        for (const value of values) {
          const memberResource = value.toResource().toMaybe();
          if (memberResource.isNothing()) {
            return Left(new Error("non-identifier in property path list"));
          }
          const member = PropertyPath.$fromRdf(memberResource.unsafeCoerce());
          if (member.isLeft()) {
            return member;
          }
          members.push(member.unsafeCoerce());
        }
        return Either.of(members);
      });
    };

    // Sequence path
    // sh:path ( ex:parent ex:firstName )
    {
      const list = resource.toList();
      if (list.isRight()) {
        return getPropertyPathList(list).map((members) => ({
          $type: "SequencePath",
          members,
        }));
      }
    }

    for (const quad of resource.dataset.match(
      resource.identifier,
      null,
      null,
      null,
    )) {
      switch (quad.object.termType) {
        case "BlankNode":
        case "NamedNode":
          break;
        default:
          return Left(
            new Error(
              `non-BlankNode/NamedNode property path object on path ${Resource.Identifier.toString(resource.identifier)}: ${quad.object.termType} ${quad.object.value}`,
            ),
          );
      }
      const objectResource = new Resource(resource.dataset, quad.object);

      // Alternative path
      // sh:path: [ sh:alternativePath ( ex:father ex:mother  ) ]
      if (quad.predicate.equals(sh.alternativePath)) {
        return getPropertyPathList(objectResource.toList()).map((members) => ({
          $type: "AlternativePath",
          members,
        }));
      }

      // Inverse path
      // sh:path: [ sh:inversePath ex:parent ]
      if (quad.predicate.equals(sh.inversePath)) {
        return PropertyPath.$fromRdf(objectResource).map((path) => ({
          $type: "InversePath",
          path,
        }));
      }

      // One or more path
      if (quad.predicate.equals(sh.oneOrMorePath)) {
        return PropertyPath.$fromRdf(objectResource).map((path) => ({
          $type: "OneOrMorePath",
          path,
        }));
      }

      // Zero or more path
      if (quad.predicate.equals(sh.zeroOrMorePath)) {
        return PropertyPath.$fromRdf(objectResource).map((path) => ({
          $type: "ZeroOrMorePath",
          path,
        }));
      }

      if (quad.predicate.equals(sh.zeroOrOnePath)) {
        return PropertyPath.$fromRdf(objectResource).map((path) => ({
          $type: "ZeroOrOnePath",
          path,
        }));
      }
    }

    return Left(
      new Error(
        `unrecognized or ill-formed SHACL property path ${Resource.Identifier.toString(resource.identifier)}`,
      ),
    );
  }

  export type $Filter = object;

  export function $filter(_filter: $Filter, _value: PropertyPath): boolean {
    return true;
  }

  export function isPropertyPath(): boolean {
    return false;
  }

  export function $toRdf(
    _propertyPath: PropertyPath,
    _options?: any,
  ): Resource {
    throw new Error("not implemented");
  }

  export const $schema = {};
}

import type { NamedNode } from "@rdfjs/types";
import { rdf, sh } from "@tpluscode/rdf-ns-builders";

import { Either, Left } from "purify-ts";
import { Resource } from "rdfjs-resource";

export interface AlternativePath {
  readonly kind: "AlternativePath";
  readonly members: readonly PropertyPath[];
}

export interface InversePath {
  readonly kind: "InversePath";
  readonly path: PropertyPath;
}

export interface OneOrMorePath {
  readonly kind: "OneOrMorePath";
  readonly path: PropertyPath;
}

export interface PredicatePath {
  readonly iri: NamedNode;
  readonly kind: "PredicatePath";
}

export interface SequencePath {
  readonly kind: "SequencePath";
  readonly members: readonly PropertyPath[];
}

export interface ZeroOrMorePath {
  readonly kind: "ZeroOrMorePath";
  readonly path: PropertyPath;
}

export interface ZeroOrOnePath {
  readonly kind: "ZeroOrOnePath";
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
      return Either.of({ iri: resource.identifier, kind: "PredicatePath" });
    }

    // The other property path types are BlankNodes

    const getPropertyPathList = (
      listResource: Resource,
    ): Either<Error, readonly PropertyPath[]> => {
      return listResource.toList().chain((values) => {
        const members: PropertyPath[] = [];
        for (const value of values) {
          const memberResource = value.toResource().toMaybe();
          if (memberResource.isNothing()) {
            return Left(
              new Error(
                `non-identifier in property path list ${Resource.Identifier.toString(listResource.identifier)}`,
              ),
            );
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
      const objectResource = new Resource({
        dataset: resource.dataset,
        identifier: quad.object,
      });

      // Alternative path
      // sh:path: [ sh:alternativePath ( ex:father ex:mother  ) ]
      if (quad.predicate.equals(sh.alternativePath)) {
        return getPropertyPathList(objectResource).map((members) => ({
          kind: "AlternativePath",
          members,
        }));
      }

      // Inverse path
      // sh:path: [ sh:inversePath ex:parent ]
      if (quad.predicate.equals(sh.inversePath)) {
        return PropertyPath.$fromRdf(objectResource).map((path) => ({
          kind: "InversePath",
          path,
        }));
      }

      // One or more path
      if (quad.predicate.equals(sh.oneOrMorePath)) {
        return PropertyPath.$fromRdf(objectResource).map((path) => ({
          kind: "OneOrMorePath",
          path,
        }));
      }

      // Sequence path
      // sh:path ( ex:parent ex:firstName )
      if (quad.predicate.equals(rdf.first)) {
        return getPropertyPathList(objectResource).map((members) => ({
          kind: "SequencePath",
          members,
        }));
      }

      // Zero or more path
      if (quad.predicate.equals(sh.zeroOrMorePath)) {
        return PropertyPath.$fromRdf(objectResource).map((path) => ({
          kind: "ZeroOrMorePath",
          path,
        }));
      }

      if (quad.predicate.equals(sh.zeroOrOnePath)) {
        return PropertyPath.$fromRdf(objectResource).map((path) => ({
          kind: "ZeroOrOnePath",
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

  export function $toRdf(
    _propertyPath: PropertyPath,
    _options?: any,
  ): Resource {
    throw new Error("not implemented");
  }
}

import type * as rdfjsResource from "rdfjs-resource";

import type { BlankNode, NamedNode } from "@rdfjs/types";

import { Either } from "purify-ts";

import {
  type $ObjectSet,
  AbstractBaseClassForExternClass,
  AbstractBaseClassForExternClassStatic,
} from "./generated.js";

/**
 * Example of an imported object type that fulfills the same contract as a generated object type.
 *
 * It has both static methods (equals, hash, toRdf) and bound methods (equals, hash, toRdf) for use by
 * generated interface code (which has freestanding functions) and generated class code (which calls methods).
 *
 * Normally you would only need one or the other.
 */
export class ExternClass extends AbstractBaseClassForExternClass {
  readonly $type = "ExternClass";

  constructor(readonly $identifier: BlankNode | NamedNode<string>) {
    super({ abstractBaseClassForExternClassProperty: "test" });
  }

  // Called by class methods
  override $equals(
    _other: ExternClass,
  ): ReturnType<AbstractBaseClassForExternClass["$equals"]> {
    return Either.of(true);
  }

  // Called by class methods
  override $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    return super.$hash(_hasher);
  }

  // Called by class methods
  override $toRdf({
    mutateGraph,
    resourceSet,
  }: {
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }) {
    const resource = super.$toRdf({ mutateGraph, resourceSet });
    resource.add(
      resourceSet.dataFactory.namedNode("http://example.com/extraproperty"),
      resourceSet.dataFactory.literal("example"),
    );
    return resource;
  }
}

export namespace ExternClass {
  // Called by interface functions
  export function $equals(left: ExternClass, right: ExternClass) {
    return left.$equals(right);
  }

  export function $fromJson(json: unknown) {
    return AbstractBaseClassForExternClassStatic.$propertiesFromJson(json).map(
      (properties) => new ExternClass(properties.$identifier),
    );
  }

  export function $fromRdf({
    extra,
    resource,
  }: {
    extra?: number;
    languageIn?: readonly string[];
    ignoreRdfType?: boolean;
    objectSet?: $ObjectSet;
    resource: rdfjsResource.Resource;
  }): Either<Error, ExternClass> {
    if (extra !== 1) {
      throw new Error("extra didn't come through");
    }
    return Either.of(new ExternClass(resource.identifier));
  }

  // Called by interface functions
  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(instance: ExternClass, hasher: HasherT): HasherT {
    instance.$hash(hasher);
    return hasher;
  }

  export type $Identifier = AbstractBaseClassForExternClassStatic.$Identifier;
  export type $Json = AbstractBaseClassForExternClassStatic.$Json;
  export const $jsonZodSchema =
    AbstractBaseClassForExternClassStatic.$jsonZodSchema;
  export const $jsonUiSchema =
    AbstractBaseClassForExternClassStatic.$jsonUiSchema;

  export const $sparqlConstructTemplateTriples =
    AbstractBaseClassForExternClassStatic.$sparqlConstructTemplateTriples;
  export const $sparqlWherePatterns =
    AbstractBaseClassForExternClassStatic.$sparqlWherePatterns;
}

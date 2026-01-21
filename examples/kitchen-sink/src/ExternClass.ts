import type { BlankNode, NamedNode } from "@rdfjs/types";
import * as N3 from "n3";

import { Either } from "purify-ts";
import * as rdfjsResource from "rdfjs-resource";
import {
  type $Object,
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

  constructor($identifier: BlankNode | NamedNode<string>) {
    super({ abstractBaseClassForExternClassProperty: "test", $identifier });
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
  override $toRdf(options?: {
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet?: rdfjsResource.MutableResourceSet;
  }) {
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.MutableResourceSet({
        dataFactory: N3.DataFactory,
        dataset: new N3.Store(),
      });
    const resource = super.$toRdf({
      mutateGraph: options?.mutateGraph,
      resourceSet,
    });
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

  export function $fromRdf(
    resource: rdfjsResource.Resource,
    options?: {
      context?: {
        extra: number;
      };
      ignoreRdfType?: boolean;
      preferredLanguages?: readonly string[];
      objectSet?: $ObjectSet;
    },
  ): Either<Error, ExternClass> {
    if (options?.context?.extra !== 1) {
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

  export function isExternClass(object: $Object): object is ExternClass {
    return object.$type === "ExternClass";
  }

  export const $filter = AbstractBaseClassForExternClassStatic.$filter;
  export type $Filter = AbstractBaseClassForExternClassStatic.$Filter;
  export type $Identifier = AbstractBaseClassForExternClassStatic.$Identifier;
  export type $Json = AbstractBaseClassForExternClassStatic.$Json;
  export const $jsonZodSchema =
    AbstractBaseClassForExternClassStatic.$jsonZodSchema;
  export const $jsonUiSchema =
    AbstractBaseClassForExternClassStatic.$jsonUiSchema;

  export const $sparqlConstructTriples =
    AbstractBaseClassForExternClassStatic.$sparqlConstructTriples;
  export const $sparqlWherePatterns =
    AbstractBaseClassForExternClassStatic.$sparqlWherePatterns;
}

import type * as rdfjsResource from "rdfjs-resource";

import type { BlankNode, NamedNode } from "@rdfjs/types";

import { Either } from "purify-ts";

import {
  AbstractBaseClassForExternObjectType,
  AbstractBaseClassForExternObjectTypeStatic,
} from "./generated.js";

/**
 * Example of an imported object type that fulfills the same contract as a generated object type.
 *
 * It has both static methods (equals, hash, toRdf) and bound methods (equals, hash, toRdf) for use by
 * generated interface code (which has freestanding functions) and generated class code (which calls methods).
 *
 * Normally you would only need one or the other.
 */
export class ExternObjectType extends AbstractBaseClassForExternObjectType {
  readonly type = "ExternObjectType";

  constructor(readonly identifier: BlankNode | NamedNode<string>) {
    super({ abcStringProperty: "test" });
  }

  // Called by class methods
  override equals(
    _other: ExternObjectType,
  ): ReturnType<AbstractBaseClassForExternObjectType["equals"]> {
    return Either.of(true);
  }

  // Called by class methods
  override hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(_hasher: HasherT): HasherT {
    return super.hash(_hasher);
  }

  // Called by class methods
  override toRdf({
    mutateGraph,
    resourceSet,
  }: {
    mutateGraph?: rdfjsResource.MutableResource.MutateGraph;
    resourceSet: rdfjsResource.MutableResourceSet;
  }) {
    const resource = super.toRdf({ mutateGraph, resourceSet });
    resource.add(
      resourceSet.dataFactory.namedNode("http://example.com/extraproperty"),
      resourceSet.dataFactory.literal("example"),
    );
    return resource;
  }
}

export namespace ExternObjectType {
  // Called by interface functions
  export function equals(left: ExternObjectType, right: ExternObjectType) {
    return left.equals(right);
  }

  export function fromRdf({
    extra,
    resource,
  }: {
    extra?: number;
    languageIn?: readonly string[];
    ignoreRdfType?: boolean;
    resource: rdfjsResource.Resource;
  }): Either<rdfjsResource.Resource.ValueError, ExternObjectType> {
    if (extra !== 1) {
      throw new Error("extra didn't come through");
    }
    return Either.of(new ExternObjectType(resource.identifier));
  }

  // Called by interface functions
  export function hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(instance: ExternObjectType, hasher: HasherT): HasherT {
    instance.hash(hasher);
    return hasher;
  }

  export type Json = AbstractBaseClassForExternObjectTypeStatic.Json;
  export const Json = {
    ...AbstractBaseClassForExternObjectTypeStatic.Json,
    deserialize: (json: unknown) =>
      AbstractBaseClassForExternObjectTypeStatic.Json.deserializeProperties(
        json,
      ).map((properties) => new ExternObjectType(properties.identifier)),
  };

  export const Rdf = {
    ...AbstractBaseClassForExternObjectTypeStatic.Rdf,
    deserialize: (
      parameters: Parameters<
        typeof AbstractBaseClassForExternObjectTypeStatic.Rdf.deserializeProperties
      >[0],
    ) =>
      AbstractBaseClassForExternObjectTypeStatic.Rdf.deserializeProperties(
        parameters,
      ).map((properties) => new ExternObjectType(properties.identifier)),
  };

  export const Sparql = AbstractBaseClassForExternObjectTypeStatic.Sparql;
}

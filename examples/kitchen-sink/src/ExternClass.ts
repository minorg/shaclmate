import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import type { BlankNode, NamedNode, Quad_Graph, Variable } from "@rdfjs/types";
import * as rdfjsResource from "@rdfx/resource";
import { Either } from "purify-ts";

import {
  type $FromRdfResourceFunction,
  type $FromRdfResourceValuesFunction,
  type $Object,
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
  override $toRdfResource(options?: {
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: rdfjsResource.ResourceSet;
  }) {
    const resourceSet =
      options?.resourceSet ??
      new rdfjsResource.ResourceSet(datasetFactory.dataset(), {
        dataFactory,
      });
    const resource = super.$toRdfResource({
      graph: options?.graph,
      resourceSet,
    });
    resource.add(
      dataFactory.namedNode("http://example.com/extraproperty"),
      dataFactory.literal("example"),
    );
    return resource;
  }
}

export namespace ExternClass {
  export type $Filter = AbstractBaseClassForExternClassStatic.$Filter;
  export type $Identifier = AbstractBaseClassForExternClassStatic.$Identifier;
  export type $Json = AbstractBaseClassForExternClassStatic.$Json;
  export const $Json = AbstractBaseClassForExternClassStatic.$Json;

  // Called by interface functions
  export function $equals(left: ExternClass, right: ExternClass) {
    return left.$equals(right);
  }

  export function $fromJson(json: $Json) {
    return new ExternClass(
      AbstractBaseClassForExternClassStatic.$propertiesFromJson(json)
        .$identifier,
    );
  }

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    ExternClass
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => ExternClass.$fromRdfResource(resource, options)),
      ),
    );

  export const $fromRdfResource: $FromRdfResourceFunction<ExternClass> = (
    resource,
    options,
  ) => {
    const context = options?.context as
      | {
          extra: number;
        }
      | undefined;
    if (context?.extra !== 1) {
      throw new Error("extra didn't come through");
    }
    return Either.of(new ExternClass(resource.identifier));
  };

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

  export const $focusSparqlConstructTriples =
    AbstractBaseClassForExternClassStatic.$focusSparqlConstructTriples;
  export const $focusSparqlWherePatterns =
    AbstractBaseClassForExternClassStatic.$focusSparqlWherePatterns;

  export const $fromRdfType = dataFactory.namedNode(
    "http://example.com/ExternClass",
  );

  export const $schema = AbstractBaseClassForExternClassStatic.$schema;

  export const $valueSparqlConstructTriples =
    AbstractBaseClassForExternClassStatic.$valueSparqlConstructTriples;
  export const $valueSparqlWherePatterns =
    AbstractBaseClassForExternClassStatic.$valueSparqlWherePatterns;
}

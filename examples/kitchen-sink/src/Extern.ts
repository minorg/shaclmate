import dataFactory from "@rdfx/data-factory";

import {
  type $FromRdfResourceFunction,
  type $FromRdfResourceValuesFunction,
  type $Object,
  $RdfjsDatasetObjectSet,
  type BaseForExtern,
  BaseForExternStatic,
} from "./generated.js";

/**
 * Example of an imported object type that fulfills the same contract as a generated object type.
 */
export interface Extern extends BaseForExtern {
  readonly $type: "Extern";
}

export namespace Extern {
  export type $Filter = BaseForExternStatic.$Filter;
  export type $Identifier = BaseForExternStatic.$Identifier;
  export type $Json = BaseForExternStatic.$Json;
  export const $Json = BaseForExternStatic.$Json;

  // Called by interface functions
  export function $equals(left: Extern, right: Extern) {
    return BaseForExternStatic.$equals(left, right);
  }

  export function $fromJson(json: $Json): Extern {
    const { $identifier, ...otherProperties } =
      BaseForExternStatic.$propertiesFromJson(json);
    return {
      $identifier: () => $identifier,
      $type: "Extern",
      ...otherProperties,
    };
  }

  export const $fromRdfResourceValues: $FromRdfResourceValuesFunction<
    Extern
  > = (values, options) =>
    values.chain((values) =>
      values.chainMap((value) =>
        value
          .toResource()
          .chain((resource) => Extern.$fromRdfResource(resource, options)),
      ),
    );

  export const $fromRdfResource: $FromRdfResourceFunction<Extern> = (
    resource,
    options,
  ) => {
    let {
      graph,
      ignoreRdfType = false,
      objectSet,
      preferredLanguages,
    } = options ?? {};
    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }

    const context = options?.context as
      | {
          extra: number;
        }
      | undefined;
    if (context?.extra !== 1) {
      throw new Error("extra didn't come through");
    }

    if (!objectSet) {
      objectSet = new $RdfjsDatasetObjectSet(resource.dataset);
    }
    return BaseForExternStatic.$propertiesFromRdfResource(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
    }).map((properties) => ({
      ...properties,
      $identifier: () => properties.$identifier,
      $type: "Extern",
    }));
  };

  // Called by interface functions
  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(instance: Extern, hasher: HasherT): HasherT {
    BaseForExternStatic.$hash(instance, hasher);
    return hasher;
  }

  export function isExtern(object: $Object): object is Extern {
    return object.$type === "Extern";
  }

  export const $filter = BaseForExternStatic.$filter;

  export const $focusSparqlConstructTriples =
    BaseForExternStatic.$focusSparqlConstructTriples;
  export const $focusSparqlWherePatterns =
    BaseForExternStatic.$focusSparqlWherePatterns;

  export const $fromRdfType = dataFactory.namedNode(
    "http://example.com/Extern",
  );

  export const $schema = BaseForExternStatic.$schema;

  export const $toJson = BaseForExternStatic.$toJson;
  export const $toRdfResource = BaseForExternStatic.$toRdfResource;

  export const $valueSparqlConstructTriples =
    BaseForExternStatic.$valueSparqlConstructTriples;
  export const $valueSparqlWherePatterns =
    BaseForExternStatic.$valueSparqlWherePatterns;
}

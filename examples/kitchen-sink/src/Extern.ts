import dataFactory from "@rdfx/data-factory";

import {
  type $FromRdfResourceFunction,
  type $FromRdfResourceValuesFunction,
  type $Object,
  $RdfjsDatasetObjectSet,
  BaseForExtern,
} from "./generated.js";

/**
 * Example of an imported object type that fulfills the same contract as a generated object type.
 */
export interface Extern extends BaseForExtern {
  readonly $type: "Extern";
}

export namespace Extern {
  export type $Filter = BaseForExtern.$Filter;
  export type $Identifier = BaseForExtern.$Identifier;
  export type $Json = BaseForExtern.$Json;
  export const $Json = BaseForExtern.$Json;

  export function $create(
    parameters: Parameters<typeof BaseForExtern.$create>[0],
  ): Extern {
    return {
      ...BaseForExtern.$create(parameters),
      $type: "Extern",
    };
  }

  export function $equals(left: Extern, right: Extern) {
    return BaseForExtern.$equals(left, right);
  }

  export function $fromJson(json: $Json): Extern {
    return $create(BaseForExtern.$propertiesFromJson(json));
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
    return BaseForExtern.$propertiesFromRdfResource(resource, {
      context,
      graph,
      ignoreRdfType,
      objectSet,
      preferredLanguages,
    }).map($create);
  };

  // Called by interface functions
  export function $hash<
    HasherT extends {
      update: (message: string | number[] | ArrayBuffer | Uint8Array) => void;
    },
  >(instance: Extern, hasher: HasherT): HasherT {
    BaseForExtern.$hash(instance, hasher);
    return hasher;
  }

  export function isExtern(object: $Object): object is Extern {
    return object.$type === "Extern";
  }

  export const $filter = BaseForExtern.$filter;

  export const $focusSparqlConstructTriples =
    BaseForExtern.$focusSparqlConstructTriples;
  export const $focusSparqlWherePatterns =
    BaseForExtern.$focusSparqlWherePatterns;

  export const $fromRdfType = dataFactory.namedNode(
    "http://example.com/Extern",
  );

  export const $schema = BaseForExtern.$schema;

  export const $toJson = BaseForExtern.$toJson;
  export const $toRdfResource = BaseForExtern.$toRdfResource;

  export const $valueSparqlConstructTriples =
    BaseForExtern.$valueSparqlConstructTriples;
  export const $valueSparqlWherePatterns =
    BaseForExtern.$valueSparqlWherePatterns;
}

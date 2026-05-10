import type { NamedNode, Quad_Graph, Variable } from "@rdfjs/types";
import type { Resource, ResourceSet } from "@rdfx/resource";
import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import type { Either } from "purify-ts";

export class Harness<
  T extends {
    readonly $identifier: () => Resource.Identifier;
    readonly $type: string;
  },
> {
  readonly shapeName: string;

  constructor(
    readonly instance: T,
    readonly staticSide: Readonly<{
      $equals: (left: T, right: T) => $EqualsResult;
      $fromJson: (json: any) => T;
      $fromRdfResource: (
        resource: Resource,
        parameters: {
          [_index: string]: any;
        },
      ) => Either<Error, T>;
      $hash: <
        HasherT extends {
          update: (
            message: string | number[] | ArrayBuffer | Uint8Array,
          ) => void;
        },
      >(
        value: T,
        hasher: HasherT,
      ) => HasherT;
      $sparqlConstructQueryString: (parameters: {
        subject: NamedNode | Variable;
      }) => string;
      $toJson: (instance: T) => any;
      $toRdfResource: (
        instance: T,
        options?: {
          graph?: Exclude<Quad_Graph, Variable>;
          resourceSet?: ResourceSet;
        },
      ) => Resource;
      $toString: (instance: T) => string;
    }>,
    shapeName?: string,
  ) {
    this.shapeName = shapeName ?? instance.$type;
  }
}

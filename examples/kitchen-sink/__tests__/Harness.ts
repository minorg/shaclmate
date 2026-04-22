import type { NamedNode, Quad_Graph, Variable } from "@rdfjs/types";
import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import type { Either } from "purify-ts";
import type { Resource, ResourceSet } from "rdfjs-resource";

export abstract class Harness<
  T extends { readonly $identifier: Resource.Identifier },
> {
  readonly fromJson: (json: any) => T;
  readonly fromRdfResource: (
    resource: Resource,
    parameters: {
      [_index: string]: any;
    },
  ) => Either<Error, T>;
  readonly sparqlConstructQueryString: (parameters: {
    subject: NamedNode | Variable;
  }) => string;

  constructor(
    readonly instance: T,
    {
      $fromJson,
      $fromRdfResource,
      $sparqlConstructQueryString,
    }: {
      $fromJson: Harness<T>["fromJson"];
      $fromRdfResource: Harness<T>["fromRdfResource"];
      $sparqlConstructQueryString: Harness<T>["sparqlConstructQueryString"];
    },
    readonly shapeName: string,
  ) {
    this.fromJson = $fromJson;
    this.fromRdfResource = $fromRdfResource;
    this.sparqlConstructQueryString = $sparqlConstructQueryString;
  }

  abstract equals(other: T): $EqualsResult;

  abstract toJson(): any;

  abstract toRdfResource(kwds: {
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource;
}

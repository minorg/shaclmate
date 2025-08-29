import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import type { Either } from "purify-ts";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import type { z as zod } from "zod";

export abstract class Harness<
  T extends { readonly $identifier: IdentifierT },
  IdentifierT extends BlankNode | NamedNode,
> {
  readonly fromJson: (json: unknown) => Either<zod.ZodError, T>;
  readonly fromRdf: (parameters: {
    [_index: string]: any;
    resource: Resource<IdentifierT>;
  }) => Either<Error, T>;
  readonly sparqlConstructQueryString: () => string;

  constructor(
    readonly instance: T,
    {
      $fromJson,
      $fromRdf,
      $sparqlConstructQueryString,
    }: {
      $fromJson: Harness<T, IdentifierT>["fromJson"];
      $fromRdf: Harness<T, IdentifierT>["fromRdf"];
      $sparqlConstructQueryString: Harness<
        T,
        IdentifierT
      >["sparqlConstructQueryString"];
    },
  ) {
    this.fromJson = $fromJson;
    this.fromRdf = $fromRdf;
    this.sparqlConstructQueryString = $sparqlConstructQueryString;
  }

  abstract equals(other: T): $EqualsResult;

  abstract toJson(): any;

  abstract toRdf(kwds: {
    mutateGraph: MutableResource.MutateGraph;
    resourceSet: MutableResourceSet;
  }): Resource<IdentifierT>;
}

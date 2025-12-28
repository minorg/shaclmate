import type {} from "@rdfjs/types";
import type { Either } from "purify-ts";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import type { z as zod } from "zod";
import type { $EqualsResult } from "../src/index.js";

export abstract class Harness<
  T extends { readonly $identifier: Resource.Identifier },
> {
  readonly fromJson: (json: unknown) => Either<zod.ZodError, T>;
  readonly fromRdf: (
    resource: Resource,
    parameters: {
      [_index: string]: any;
    },
  ) => Either<Error, T>;
  abstract readonly shapeName: string;
  readonly sparqlConstructQueryString: () => string;

  constructor(
    readonly instance: T,
    {
      $fromJson,
      $fromRdf,
      $sparqlConstructQueryString,
    }: {
      $fromJson: Harness<T>["fromJson"];
      $fromRdf: Harness<T>["fromRdf"];
      $sparqlConstructQueryString: Harness<T>["sparqlConstructQueryString"];
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
  }): Resource;
}

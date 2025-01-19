import type * as sparqlBuilder from "@kos-kit/sparql-builder";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Either } from "purify-ts";
import type { Equatable } from "purify-ts-helpers";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import type { z as zod } from "zod";

export abstract class Harness<
  T extends { readonly identifier: IdentifierT },
  IdentifierT extends BlankNode | NamedNode,
> {
  readonly fromJson: (json: unknown) => Either<zod.ZodError, T>;
  readonly fromRdf: (parameters: {
    [_index: string]: any;
    resource: Resource<IdentifierT>;
  }) => Either<Resource.ValueError, T>;
  readonly instance: T;
  readonly sparqlConstructQueryString: () => string;
  readonly sparqlGraphPatternsClass: new (
    subject: sparqlBuilder.ResourceGraphPatterns.Subject,
  ) => sparqlBuilder.ResourceGraphPatterns;

  constructor({
    fromJson,
    fromRdf,
    instance,
    sparqlConstructQueryString,
    sparqlGraphPatternsClass,
  }: {
    fromJson: Harness<T, IdentifierT>["fromJson"];
    fromRdf: Harness<T, IdentifierT>["fromRdf"];
    instance: T;
    sparqlConstructQueryString: Harness<
      T,
      IdentifierT
    >["sparqlConstructQueryString"];
    sparqlGraphPatternsClass: Harness<
      T,
      IdentifierT
    >["sparqlGraphPatternsClass"];
  }) {
    this.fromJson = fromJson;
    this.fromRdf = fromRdf;
    this.instance = instance;
    this.sparqlConstructQueryString = sparqlConstructQueryString;
    this.sparqlGraphPatternsClass = sparqlGraphPatternsClass;
  }

  abstract equals(other: T): Equatable.EqualsResult;

  abstract toJson(): any;

  abstract toRdf(kwds: {
    mutateGraph: MutableResource.MutateGraph;
    resourceSet: MutableResourceSet;
  }): Resource<IdentifierT>;
}

import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import { Harness } from "./Harness.js";

export class InterfaceHarness<
  T extends { readonly $identifier: IdentifierT },
  IdentifierT extends BlankNode | NamedNode,
> extends Harness<T, IdentifierT> {
  readonly equals: (other: T) => $EqualsResult;
  readonly toJson: () => any;
  readonly toRdf: (options?: {
    mutateGraph?: MutableResource.MutateGraph;
    resourceSet?: MutableResourceSet;
  }) => Resource<IdentifierT>;

  constructor(
    instance: T,
    {
      $equals,
      $toJson,
      $toRdf,
      ...superParameters
    }: {
      $equals: (left: T, right: T) => $EqualsResult;
      $toJson: (instance: T) => any;
      $toRdf: (
        instance: T,
        options?: {
          mutateGraph?: MutableResource.MutateGraph;
          resourceSet?: MutableResourceSet;
        },
      ) => Resource<IdentifierT>;
    } & ConstructorParameters<typeof Harness<T, IdentifierT>>[1],
  ) {
    super(instance, superParameters);
    this.equals = (other) => $equals(this.instance, other);
    this.toJson = () => $toJson(this.instance);
    this.toRdf = (kwds) => $toRdf(this.instance, kwds);
  }
}

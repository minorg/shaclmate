import type {} from "@rdfjs/types";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import type { $EqualsResult } from "../src/index.js";
import { Harness } from "./Harness.js";

export class InterfaceHarness<
  T extends { readonly $identifier: Resource.Identifier },
> extends Harness<T> {
  readonly equals: (other: T) => $EqualsResult;
  readonly toJson: () => any;
  readonly toRdf: (options?: {
    mutateGraph?: MutableResource.MutateGraph;
    resourceSet?: MutableResourceSet;
  }) => Resource;

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
      ) => Resource;
    } & ConstructorParameters<typeof Harness<T>>[1],
  ) {
    super(instance, superParameters);
    this.equals = (other) => $equals(this.instance, other);
    this.toJson = () => $toJson(this.instance);
    this.toRdf = (kwds) => $toRdf(this.instance, kwds);
  }
}

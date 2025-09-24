import type {} from "@rdfjs/types";
import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import { Harness } from "./Harness.js";

export class ClassUnionHarness<
  T extends {
    $identifier: Resource.Identifier;
    $toJson: () => any;
    $toRdf: (options?: {
      mutateGraph?: MutableResource.MutateGraph;
      resourceSet?: MutableResourceSet;
    }) => Resource;
  },
> extends Harness<T> {
  readonly equals: (other: T) => $EqualsResult;

  constructor(
    instance: T,
    {
      $equals,
      ...superParameters
    }: {
      $equals: (left: T, right: T) => $EqualsResult;
    } & ConstructorParameters<typeof Harness<T>>[1],
  ) {
    super(instance, superParameters);
    this.equals = (other) => $equals(this.instance, other);
  }

  override toJson(): any {
    return this.instance.$toJson();
  }

  override toRdf(options?: {
    mutateGraph?: MutableResource.MutateGraph;
    resourceSet?: MutableResourceSet;
  }): Resource {
    return this.instance.$toRdf(options);
  }
}

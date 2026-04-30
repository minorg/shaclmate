import type { Quad_Graph, Variable } from "@rdfjs/types";
import type { Resource, ResourceSet } from "@rdfx/resource";
import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import { Harness } from "./Harness.js";

export class ClassUnionHarness<
  T extends {
    $identifier: Resource.Identifier;
    $toJson: () => any;
    $toRdfResource: (options?: {
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
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
    shapeName: string,
  ) {
    super(instance, superParameters, shapeName);
    this.equals = (other) => $equals(this.instance, other);
  }

  override toJson(): any {
    return this.instance.$toJson();
  }

  override toRdfResource(options?: {
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource {
    return this.instance.$toRdfResource(options);
  }
}

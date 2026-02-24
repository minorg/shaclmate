import type { Quad_Graph, Variable } from "@rdfjs/types";
import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import type { Resource, ResourceSet } from "rdfjs-resource";
import { Harness } from "./Harness.js";

export class InterfaceHarness<
  T extends {
    readonly $identifier: Resource.Identifier;
    readonly $type: string;
  },
> extends Harness<T> {
  readonly equals: (other: T) => $EqualsResult;
  readonly shapeName: string;
  readonly toJson: () => any;
  readonly toRdf: (options?: {
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
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
          graph?: Exclude<Quad_Graph, Variable>;
          resourceSet?: ResourceSet;
        },
      ) => Resource;
    } & ConstructorParameters<typeof Harness<T>>[1],
    shapeName?: string,
  ) {
    super(instance, superParameters);
    this.equals = (other) => $equals(this.instance, other);
    this.shapeName = shapeName ?? this.instance.$type;
    this.toJson = () => $toJson(this.instance);
    this.toRdf = (kwds) => $toRdf(this.instance, kwds);
  }
}

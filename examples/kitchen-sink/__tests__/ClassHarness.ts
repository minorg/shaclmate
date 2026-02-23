import type { Quad_Graph, Variable } from "@rdfjs/types";
import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import type { Resource, ResourceSet } from "rdfjs-resource";
import { Harness } from "./Harness.js";

export class ClassHarness<
  T extends {
    $equals: (other: T) => $EqualsResult;
    readonly $identifier: Resource.Identifier;
    $toJson: () => any;
    $toRdf: (options?: {
      graph?: Exclude<Quad_Graph, Variable>;
      resourceSet?: ResourceSet;
    }) => Resource;
    readonly $type: string;
  },
> extends Harness<T> {
  get shapeName(): string {
    return this.instance.$type;
  }

  override equals(other: T): $EqualsResult {
    return this.instance.$equals(other);
  }

  override toJson(): any {
    return this.instance.$toJson();
  }

  override toRdf(options?: {
    graph?: Exclude<Quad_Graph, Variable>;
    resourceSet?: ResourceSet;
  }): Resource {
    return this.instance.$toRdf(options);
  }
}

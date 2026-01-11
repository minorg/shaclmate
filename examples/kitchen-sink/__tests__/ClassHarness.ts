import type { $EqualsResult } from "@shaclmate/kitchen-sink-example";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import { Harness } from "./Harness.js";

export class ClassHarness<
  T extends {
    $equals: (other: T) => $EqualsResult;
    readonly $identifier: Resource.Identifier;
    $toJson: () => any;
    $toRdf: (options?: {
      mutateGraph: MutableResource.MutateGraph;
      resourceSet: MutableResourceSet;
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
    mutateGraph: MutableResource.MutateGraph;
    resourceSet: MutableResourceSet;
  }): Resource {
    return this.instance.$toRdf(options);
  }
}

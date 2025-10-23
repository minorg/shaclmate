import type {} from "@rdfjs/types";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import type { $EqualsResult } from "../src/index.js";
import { Harness } from "./Harness.js";

export class ClassHarness<
  T extends {
    $equals: (other: T) => $EqualsResult;
    $identifier: Resource.Identifier;
    $toJson: () => any;
    $toRdf: (options?: {
      mutateGraph: MutableResource.MutateGraph;
      resourceSet: MutableResourceSet;
    }) => Resource;
  },
> extends Harness<T> {
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

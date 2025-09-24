import type { BlankNode, NamedNode } from "@rdfjs/types";
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
    $identifier: IdentifierT;
    $toJson: () => any;
    $toRdf: (options?: {
      mutateGraph: MutableResource.MutateGraph;
      resourceSet: MutableResourceSet;
    }) => Resource<IdentifierT>;
  },
  IdentifierT extends BlankNode | NamedNode,
> extends Harness<T, IdentifierT> {
  override equals(other: T): $EqualsResult {
    return this.instance.$equals(other);
  }

  override toJson(): any {
    return this.instance.$toJson();
  }

  override toRdf(options?: {
    mutateGraph: MutableResource.MutateGraph;
    resourceSet: MutableResourceSet;
  }): Resource<IdentifierT> {
    return this.instance.$toRdf(options);
  }
}

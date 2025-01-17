import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Equatable } from "purify-ts-helpers";
import type {
  MutableResource,
  MutableResourceSet,
  Resource,
} from "rdfjs-resource";
import { Harness } from "./Harness.js";

export class ClassUnionHarness<
  T extends {
    identifier: IdentifierT;
    toJson: () => any;
    toRdf: (options: {
      mutateGraph: MutableResource.MutateGraph;
      resourceSet: MutableResourceSet;
    }) => Resource<IdentifierT>;
  },
  IdentifierT extends BlankNode | NamedNode,
> extends Harness<T, IdentifierT> {
  readonly equals: (other: T) => Equatable.EqualsResult;

  constructor({
    equals,
    ...superParameters
  }: {
    equals: (left: T, right: T) => Equatable.EqualsResult;
  } & ConstructorParameters<typeof Harness<T, IdentifierT>>[0]) {
    super(superParameters);
    this.equals = (other) => equals(this.instance, other);
  }

  override toJson(): any {
    return this.instance.toJson();
  }

  override toRdf(options: {
    mutateGraph: MutableResource.MutateGraph;
    resourceSet: MutableResourceSet;
  }): Resource<IdentifierT> {
    return this.instance.toRdf(options);
  }
}

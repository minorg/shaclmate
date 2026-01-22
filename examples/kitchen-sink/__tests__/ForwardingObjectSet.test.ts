import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { describe } from "vitest";
import { behavesLikeObjectSet } from "./behavesLikeObjectSet.js";

class TestForwardingObjectSet extends kitchenSink.$ForwardingObjectSet {
  readonly dataset = new N3.Store();

  protected readonly $delegate = new kitchenSink.$RdfjsDatasetObjectSet({
    dataset: this.dataset,
  });
}

describe("ForwardingObjectSet", () => {
  behavesLikeObjectSet((...instances: readonly kitchenSink.$Object[]) => {
    const objectSet = new TestForwardingObjectSet();
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset: objectSet.dataset,
    });
    for (const instance of instances) {
      kitchenSink.$Object.$toRdf(instance, { resourceSet });
    }
    return objectSet;
  });
});

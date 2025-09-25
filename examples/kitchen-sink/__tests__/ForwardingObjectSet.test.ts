import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { describe } from "vitest";
import { behavesLikeObjectSet } from "./behavesLikeObjectSet.js";

class TestForwardingObjectSet extends kitchenSink.$ForwardingObjectSet {
  readonly dataset = new N3.Store();

  protected readonly $delegate = new kitchenSink.$RdfjsDatasetObjectSet({
    dataset: this.dataset,
  });
}

describe("ForwardingObjectSet", () => {
  const objectSet = new TestForwardingObjectSet();

  behavesLikeObjectSet({
    addQuad: (quad) => objectSet.dataset.add(quad),
    objectSet,
  });
});

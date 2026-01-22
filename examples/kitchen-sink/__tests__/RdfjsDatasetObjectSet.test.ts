import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { describe } from "vitest";
import { behavesLikeObjectSet } from "./behavesLikeObjectSet.js";

describe("RdfjsDatasetObjectSet", () => {
  behavesLikeObjectSet((...instances: readonly kitchenSink.$Object[]) => {
    const dataset = new N3.Store();
    const objectSet = new kitchenSink.$RdfjsDatasetObjectSet({
      dataset,
    });
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset,
    });
    for (const instance of instances) {
      kitchenSink.$Object.$toRdf(instance, { resourceSet });
    }
    return objectSet;
  });
});

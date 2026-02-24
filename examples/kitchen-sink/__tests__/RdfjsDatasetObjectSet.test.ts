import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { ResourceSet } from "rdfjs-resource";
import { describe } from "vitest";
import { testObjectSet } from "./testObjectSet.js";

describe("RdfjsDatasetObjectSet", () => {
  testObjectSet((...instances: readonly kitchenSink.$Object[]) => {
    const dataset = new N3.Store();
    const objectSet = new kitchenSink.$RdfjsDatasetObjectSet(dataset);
    const resourceSet = new ResourceSet(dataset, {
      dataFactory: N3.DataFactory,
    });
    for (const instance of instances) {
      kitchenSink.$Object.$toRdf(instance, { resourceSet });
    }
    return objectSet;
  });
});

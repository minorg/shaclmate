import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { ResourceSet } from "rdfjs-resource";
import { describe } from "vitest";
import { testObjectSet } from "./testObjectSet.js";

describe("RdfjsDatasetObjectSet", () => {
  testObjectSet((...instances: readonly kitchenSink.$Object[]) => {
    const dataset = datasetFactory.dataset();
    const objectSet = new kitchenSink.$RdfjsDatasetObjectSet(dataset);
    const resourceSet = new ResourceSet(dataset, {
      dataFactory,
    });
    for (const instance of instances) {
      kitchenSink.$Object.$toRdf(instance, { resourceSet });
    }
    return objectSet;
  });
});

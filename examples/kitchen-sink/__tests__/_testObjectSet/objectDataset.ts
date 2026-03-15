import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { ResourceSet } from "rdfjs-resource";

export function objectDataset(
  instances: readonly kitchenSink.$Object[],
): DatasetCore {
  const dataset = datasetFactory.dataset();
  const resourceSet = new ResourceSet(dataset, {
    dataFactory,
  });
  for (const instance of instances) {
    kitchenSink.$Object.$toRdf(instance, { resourceSet });
  }
  return dataset;
}

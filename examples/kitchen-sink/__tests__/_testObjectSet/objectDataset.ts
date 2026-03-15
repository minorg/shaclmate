import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { ResourceSet } from "rdfjs-resource";

export function objectDataset(
  instances:
    | readonly kitchenSink.$Object[]
    | Record<string, readonly kitchenSink.$Object[]>,
): DatasetCore {
  const dataset = datasetFactory.dataset();
  const resourceSet = new ResourceSet(dataset, {
    dataFactory,
  });
  if (Array.isArray(instances)) {
    for (const instance of instances) {
      kitchenSink.$Object.$toRdf(instance, {
        resourceSet,
      });
    }
  } else {
    for (const [graphIri, graphInstances] of Object.entries(instances)) {
      const graph =
        graphIri.length === 0
          ? dataFactory.defaultGraph()
          : dataFactory.namedNode(graphIri);
      for (const graphInstance of graphInstances) {
        kitchenSink.$Object.$toRdf(graphInstance, { graph, resourceSet });
      }
    }
  }
  return dataset;
}

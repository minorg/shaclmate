import datasetFactory from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { ResourceSet } from "@rdfx/resource";
import * as kitchenSink from "../../src/index.js";

export function objectDataset(
  instances:
    | readonly kitchenSink.$Object[]
    | Record<string, readonly kitchenSink.$Object[]>,
): DatasetCore {
  const dataset = datasetFactory.dataset();
  const resourceSet = new ResourceSet({ dataFactory, dataset });
  if (Array.isArray(instances)) {
    for (const instance of instances) {
      kitchenSink.$Object.toRdfResource(instance, {
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
        kitchenSink.$Object.toRdfResource(graphInstance, {
          graph,
          resourceSet,
        });
      }
    }
  }
  return dataset;
}

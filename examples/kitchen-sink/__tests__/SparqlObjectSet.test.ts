import { OxigraphSparqlClient } from "@kos-kit/sparql-client";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import * as oxigraph from "oxigraph";
import { describe } from "vitest";
import { behavesLikeObjectSet } from "./behavesLikeObjectSet.js";

describe("SparqlObjectSet", () => {
  behavesLikeObjectSet((...instances: readonly kitchenSink.$Object[]) => {
    const oxigraphStore = new oxigraph.Store();
    const objectSet = new kitchenSink.$SparqlObjectSet({
      sparqlClient: new OxigraphSparqlClient({
        dataFactory: N3.DataFactory,
        store: oxigraphStore,
      }),
    });
    for (const instance of instances) {
      for (const quad of kitchenSink.$Object.$toRdf(instance).dataset) {
        oxigraphStore.add(quad);
      }
    }
    return objectSet;
  });
});

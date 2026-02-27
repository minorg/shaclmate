import { OxigraphSparqlClient } from "@kos-kit/sparql-client";
import dataFactory from "@rdfjs/data-model";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import * as oxigraph from "oxigraph";
import { describe } from "vitest";
import { testObjectSet } from "./testObjectSet.js";

describe("SparqlObjectSet", () => {
  testObjectSet((...instances: readonly kitchenSink.$Object[]) => {
    const oxigraphStore = new oxigraph.Store();
    const objectSet = new kitchenSink.$SparqlObjectSet(
      new OxigraphSparqlClient({
        dataFactory,
        store: oxigraphStore,
      }),
    );
    for (const instance of instances) {
      for (const quad of kitchenSink.$Object.$toRdf(instance).dataset) {
        oxigraphStore.add(quad);
      }
    }
    // const ttl = quadsToTurtle(oxigraphStore.match());
    // console.log(ttl);
    return objectSet;
  });
});

import dataFactory from "@rdfjs/data-model";
import type { DatasetCore, Quad_Graph, Variable } from "@rdfjs/types";
import { OxigraphSparqlClient } from "@rdfx/sparql-client";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import * as oxigraph from "oxigraph";
import { describe } from "vitest";
import { testObjectSet } from "./testObjectSet.js";

describe("SparqlObjectSet", () => {
  testObjectSet(
    (
      dataset: DatasetCore,
      options?: { graph?: Exclude<Quad_Graph, Variable> },
    ) => {
      const oxigraphStore = new oxigraph.Store();
      const objectSet = new kitchenSink.$SparqlObjectSet(
        new OxigraphSparqlClient({
          dataFactory,
          store: oxigraphStore,
        }),
        options,
      );
      for (const quad of dataset) {
        oxigraphStore.add(quad);
      }
      // const ttl = quadsToTurtle(oxigraphStore.match());
      // console.log(ttl);
      return objectSet;
    },
  );
});

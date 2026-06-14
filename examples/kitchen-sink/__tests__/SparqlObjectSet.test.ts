import type { DatasetCore, Quad_Graph, Variable } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { OxigraphSparqlClient } from "@rdfx/sparql-client";
import * as oxigraph from "oxigraph";
import { describe } from "vitest";
import * as kitchenSink from "../src/index.js";
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
        oxigraphStore.add(quad as oxigraph.Quad);
      }
      // const ttl = quadsToTurtle(oxigraphStore.match());
      // console.log(ttl);
      return objectSet;
    },
  );
});

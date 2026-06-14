import type { DatasetCore, Quad_Graph, Variable } from "@rdfjs/types";
import type * as kitchenSink from "../../src/index.js";

export type ObjectSetFactory = (
  dataset: DatasetCore,
  options?: {
    graph?: Exclude<Quad_Graph, Variable>;
  },
) => kitchenSink.$ObjectSet;

import type { DatasetCore, Quad_Graph, Variable } from "@rdfjs/types";
import { describe } from "vitest";
import * as kitchenSink from "../src/index.js";
import { testObjectSet } from "./testObjectSet.js";

describe("RdfjsDatasetObjectSet", () => {
  testObjectSet(
    (
      dataset: DatasetCore,
      options?: { graph?: Exclude<Quad_Graph, Variable> },
    ) => new kitchenSink.$RdfjsDatasetObjectSet(dataset, options),
  );
});

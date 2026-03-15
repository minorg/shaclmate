import type { DatasetCore, Quad_Graph, Variable } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe } from "vitest";
import { testObjectSet } from "./testObjectSet.js";

describe("RdfjsDatasetObjectSet", () => {
  testObjectSet(
    (
      dataset: DatasetCore,
      options?: { graph?: Exclude<Quad_Graph, Variable> },
    ) => new kitchenSink.$RdfjsDatasetObjectSet(dataset, options),
  );
});

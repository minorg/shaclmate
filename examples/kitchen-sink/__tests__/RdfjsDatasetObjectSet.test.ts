import N3 from "n3";
import { describe } from "vitest";
import * as kitchenSink from "../src/index.js";
import { behavesLikeObjectSet } from "./behavesLikeObjectSet.js";

describe("RdfjsDatasetObjectSet", () => {
  const objectSet = new kitchenSink.$RdfjsDatasetObjectSet({
    dataset: new N3.Store(),
  });

  behavesLikeObjectSet({
    addQuad: (quad) => objectSet.resourceSet.dataset.add(quad),
    objectSet,
  });
});

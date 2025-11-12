import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import N3 from "n3";
import { describe, it } from "vitest";
import { ShapesGraphToAstTransformer } from "../src/ShapesGraphToAstTransformer.js";
import { TsGenerator } from "../src/generators/ts/TsGenerator.js";
import { testData } from "./testData.js";

describe("TsGenerator", () => {
  it("should generate from the kitchen sink shapes graph", ({ expect }) => {
    const ts = new TsGenerator().generate(
      new ShapesGraphToAstTransformer({
        iriPrefixMap: new PrefixMap(undefined, { factory: N3.DataFactory }),
        shapesGraph: testData.kitchenSink.shapesGraph,
      })
        .transform()
        .unsafeCoerce(),
    );
    expect(ts).not.toHaveLength(0);
  }, 60000);
});

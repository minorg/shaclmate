import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import N3 from "n3";
import { describe, it } from "vitest";
import { ShapesGraphToAstTransformer } from "../src/ShapesGraphToAstTransformer.js";
import { TsGenerator } from "../src/generators/ts/TsGenerator.js";
import type { ShapesGraph } from "../src/input/ShapesGraph.js";
import { testData } from "./testData.js";

function generate(shapesGraph: ShapesGraph): string {
  return new TsGenerator().generate(
    new ShapesGraphToAstTransformer({
      iriPrefixMap: new PrefixMap(undefined, { factory: N3.DataFactory }),
      shapesGraph,
    })
      .transform()
      .unsafeCoerce(),
  );
}

describe("TsGenerator", () => {
  it("should generate from the kitchen sink shapes graph", ({ expect }) => {
    const ts = generate(testData.kitchenSink.shapesGraph);
    expect(ts).not.toHaveLength(0);
  }, 60000);

  it("should generate from an external project shapes graph", ({ expect }) => {
    testData.externalProject.ifJust(({ shapesGraph }) => {
      const ts = generate(shapesGraph);
      expect(ts).not.toHaveLength(0);
    });
  });
});

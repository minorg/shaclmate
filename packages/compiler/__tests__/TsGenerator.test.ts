import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  TsGenerator,
} from "@shaclmate/compiler";
import N3 from "n3";
import { describe, it } from "vitest";
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

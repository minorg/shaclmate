import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  TsGenerator,
} from "@shaclmate/compiler";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

function generate(parameters: {
  iriPrefixMap: PrefixMap;
  shapesGraph: ShapesGraph;
}): string {
  return new TsGenerator().generate(
    new ShapesGraphToAstTransformer(parameters).transform().unsafeCoerce(),
  );
}

describe("TsGenerator", () => {
  it("should generate from the kitchen sink shapes graph", ({ expect }) => {
    const ts = generate(testData.kitchenSink);
    expect(ts).not.toHaveLength(0);
  }, 60000);

  it("should generate from an external project shapes graph", ({ expect }) => {
    testData.externalProject.ifJust((parameters) => {
      const ts = generate(parameters);
      expect(ts).not.toHaveLength(0);
    });
  });
});

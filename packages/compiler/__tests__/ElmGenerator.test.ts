import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import type { ShapesGraph } from "@shaclmate/compiler";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

function generate(_parameters: {
  iriPrefixMap: PrefixMap;
  shapesGraph: ShapesGraph;
}): string {
  throw new Error();
  // return new ElmGenerator().generate(
  //   new ShapesGraphToAstTransformer(parameters).transform().unsafeCoerce(),
  // );
}

describe.skip("ElmGenerator", () => {
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

import { dash } from "@tpluscode/rdf-ns-builders";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

describe("PropertyGroup", () => {
  const shapesGraph = testData.schema.shapesGraph;

  it("should have a label", ({ expect }) => {
    const propertyGroup = shapesGraph
      .propertyGroup(dash.ScriptAPIGenerationRules)
      .unsafeCoerce();
    expect(propertyGroup.label.unsafeCoerce()).toStrictEqual(
      "Script API Generation Rules",
    );
  });
});

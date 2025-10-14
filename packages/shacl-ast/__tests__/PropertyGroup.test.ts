import { dash } from "@tpluscode/rdf-ns-builders";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

describe("PropertyGroup", () => {
  const shapesGraph = testData.schema.shapesGraph;

  it("should have a label", ({ expect }) => {
    const propertyGroup = shapesGraph
      .propertyGroupByIdentifier(dash.ScriptAPIGenerationRules)
      .unsafeCoerce();
    const labels = propertyGroup.labels;
    expect(labels).toHaveLength(1);
    expect(labels[0].value).toStrictEqual("Script API Generation Rules");
  });
});

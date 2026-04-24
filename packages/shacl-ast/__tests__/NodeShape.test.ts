import { schema } from "@tpluscode/rdf-ns-builders";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

describe("NodeShape", () => {
  const shapesGraph = testData.schema.shapesGraph;

  it("constraints: should get closed true", ({ expect }) => {
    expect(
      shapesGraph
        .nodeShape(schema.DatedMoneySpecification)
        .unsafeCoerce()
        .closed.unsafeCoerce(),
    ).toStrictEqual(true);
  });

  it("constraints: should have properties", ({ expect }) => {
    expect(
      shapesGraph.nodeShape(schema.Person).unsafeCoerce().properties,
    ).toHaveLength(9);
  });

  // it("should convert to a string", ({ expect }) => {
  //   expect(
  //     shapesGraph.nodeShape(schema.Person).unsafeCoerce().toString(),
  //   ).not.toHaveLength(0);
  // });
});

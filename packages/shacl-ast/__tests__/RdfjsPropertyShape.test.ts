import { describe } from "vitest";
import { RdfjsShapesGraph } from "../RdfjsShapesGraph.js";
import {
  type DefaultRdfjsShapesGraph,
  defaultRdfjsFactory,
} from "../defaultRdfjsFactory.js";
import { behavesLikePropertyShape } from "./behavesLikePropertyShape.js";
import { testData } from "./testData.js";

describe("RdfjsPropertyShape", () => {
  const shapesGraph: DefaultRdfjsShapesGraph = new RdfjsShapesGraph({
    dataset: testData.shapesGraph,
    factory: defaultRdfjsFactory,
  });

  // it("should convert to a string", ({ expect }) => {
  //   expect(
  //     findPropertyShape(schema.Person, schema.givenName).toString(),
  //   ).not.toHaveLength(0);
  // });

  behavesLikePropertyShape(shapesGraph);
});

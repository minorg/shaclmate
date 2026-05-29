import dataFactory from "@rdfx/data-factory";
import { beforeAll, describe, it } from "vitest";
import type { Shape } from "../src/generated.js";
import { testData } from "./testData.js";
import "@rdfx/testing";
import type { ShapesGraph } from "../src/ShapesGraph.js";
import { ex } from "./namespaces.js";

describe("Shape", () => {
  const shapesGraphEither = testData.shapesGraphs.wellFormed.syntax;

  for (const [id, shapeEither] of Object.entries({
    "node shape": shapesGraphEither.chain((shapesGraph) =>
      shapesGraph.nodeShape(ex("NodeShape")),
    ),
    "property shape": shapesGraphEither.chain((shapesGraph) =>
      shapesGraph.propertyShape(
        dataFactory.namedNode("http://example.com/PropertyShape"),
      ),
    ),
  })) {
    describe(id, () => {
      let shape: Shape;
      let shapesGraph: ShapesGraph;

      beforeAll(() => {
        shape = shapeEither.unsafeCoerce();
        shapesGraph = shapesGraphEither.unsafeCoerce();
      });

      it("and", ({ expect }) => {
        const and = shape.and.extract()!;
        expect(and).toBeDefined();
        expect(and).toHaveLength(2);
        and.forEach((memberIdentifier, memberI) => {
          expect(memberIdentifier.termType).toStrictEqual("BlankNode");
          const memberShape = shapesGraph
            .shape(memberIdentifier)
            .unsafeCoerce();
          expect(
            memberShape.datatype
              .extract()
              ?.equals(ex(`andDatatype${memberI + 1}`)),
          );
        });
      });

      it("class", ({ expect }) => {
        expect(shape.classes).toHaveLength(1);
        expect(shape.classes[0].equals(ex("Class"))).toStrictEqual(true);
      });

      it("comment", ({ expect }) => {
        expect(shape.comment.extract()).toStrictEqual("comment");
      });

      it("datatype", ({ expect }) => {
        expect(shape.datatype.extract()?.equals(ex("datatype"))).toStrictEqual(
          true,
        );
      });

      it("deactivated", ({ expect }) => {
        expect(shape.deactivated.extract()).toStrictEqual(true);
      });

      it("disjoint", ({ expect }) => {
        expect(shape.disjoint).toHaveLength(1);
        expect(shape.disjoint[0].equals(ex("disjoint"))).toStrictEqual(true);
      });

      it("equals", ({ expect }) => {
        expect(shape.equals).toHaveLength(1);
        expect(shape.equals[0].equals(ex("equals"))).toStrictEqual(true);
      });

      it("flags", ({ expect }) => {
        expect(shape.flags.extract()).toStrictEqual("flags");
      });

      it("label", ({ expect }) => {
        expect(shape.label.extract()).toStrictEqual("label");
      });
    });
  }
});

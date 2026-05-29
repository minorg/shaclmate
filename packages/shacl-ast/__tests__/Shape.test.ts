import dataFactory from "@rdfx/data-factory";
import { beforeAll, describe, it } from "vitest";
import type { Shape } from "../src/generated.js";
import { testData } from "./testData.js";
import "@rdfx/testing";
import { LiteralFactory } from "@rdfx/literal";
import type { ShapesGraph } from "../src/ShapesGraph.js";
import { ex } from "./namespaces.js";

const literalFactory = new LiteralFactory({ dataFactory });

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

      it("in", ({ expect }) => {
        const in_ = shape.in_.extract()!;
        expect(in_).toHaveLength(2);
        expect(in_[0].equals(ex("in1")));
        expect(in_[1].equals(ex("in2")));
      });

      it("label", ({ expect }) => {
        expect(shape.label.extract()).toStrictEqual("label");
      });

      it("languageIn", ({ expect }) => {
        expect(shape.languageIn.extract()).toEqual(["en", "fr"]);
      });

      it("maxExclusive", ({ expect }) => {
        expect(shape.maxExclusive.extract()?.equals(literalFactory.number(1)));
      });

      it("maxInclusive", ({ expect }) => {
        expect(shape.maxInclusive.extract()?.equals(literalFactory.number(1)));
      });

      it("maxLength", ({ expect }) => {
        expect(shape.maxLength.extract()).toStrictEqual(1n);
      });

      it("minExclusive", ({ expect }) => {
        expect(shape.minExclusive.extract()?.equals(literalFactory.number(0)));
      });

      it("minInclusive", ({ expect }) => {
        expect(shape.minInclusive.extract()?.equals(literalFactory.number(0)));
      });

      it("minLength", ({ expect }) => {
        expect(shape.minLength.extract()).toStrictEqual(0n);
      });
    });
  }
});

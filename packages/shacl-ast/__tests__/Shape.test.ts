import dataFactory from "@rdfx/data-factory";
import { beforeAll, describe, it } from "vitest";
import type { Shape } from "../src/shacl-ast.shaclmate.js";
import { testData } from "./testData.js";
import "@rdfx/testing";
import { LiteralFactory } from "@rdfx/literal";
import { sh } from "@tpluscode/rdf-ns-builders";
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

      it("flags", ({ expect }) => {
        expect(shape.flags.extract()).toStrictEqual("flags");
      });

      it("hasValue", ({ expect }) => {
        expect(shape.hasValues).toHaveLength(1);
        expect(shape.hasValues[0].equals(ex("hasValue"))).toStrictEqual(true);
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

      it("message", ({ expect }) => {
        expect(shape.message.extract()).toStrictEqual("message");
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

      it("node", ({ expect }) => {
        const node = shape.node.extract()!;
        expect(node).toBeDefined();
        const nodeShape = shapesGraph.nodeShape(node).unsafeCoerce();
        expect(nodeShape.datatype.extract()?.equals(ex("nodeDatatype")));
      });

      it("nodeKind", ({ expect }) => {
        expect(
          shape.nodeKind.extract()?.equals(sh.BlankNodeOrIRI),
        ).toStrictEqual(true);
      });

      it("not", ({ expect }) => {
        const not = shape.not;
        expect(not).toHaveLength(1);
        for (const notShapeIdentifier of not) {
          const notShape = shapesGraph.shape(notShapeIdentifier).unsafeCoerce();
          expect(notShape.datatype.extract()?.equals(ex("notDatatype")));
        }
      });

      it("or", ({ expect }) => {
        const or = shape.or.extract()!;
        expect(or).toBeDefined();
        expect(or).toHaveLength(2);
        or.forEach((memberIdentifier, memberI) => {
          expect(memberIdentifier.termType).toStrictEqual("BlankNode");
          const memberShape = shapesGraph
            .shape(memberIdentifier)
            .unsafeCoerce();
          expect(
            memberShape.datatype
              .extract()
              ?.equals(ex(`orDatatype${memberI + 1}`)),
          );
        });
      });

      it("pattern", ({ expect }) => {
        expect(shape.pattern.extract()).toStrictEqual("pattern");
      });

      it("severity", ({ expect }) => {
        expect(shape.severity.extract()?.equals(sh.Info)).toStrictEqual(true);
      });

      it("targetClass", ({ expect }) => {
        expect(shape.targetClasses).toHaveLength(1);
        expect(shape.targetClasses[0].equals(ex("TargetClass"))).toStrictEqual(
          true,
        );
      });

      it("targetNode", ({ expect }) => {
        expect(shape.targetNodes).toHaveLength(1);
        expect(shape.targetNodes[0].equals(ex("targetNode"))).toStrictEqual(
          true,
        );
      });

      it("targetObjectsOf", ({ expect }) => {
        expect(shape.targetObjectsOf).toHaveLength(1);
        expect(
          shape.targetObjectsOf[0].equals(ex("targetObjectOf")),
        ).toStrictEqual(true);
      });

      it("targetSubjectsOf", ({ expect }) => {
        expect(shape.targetSubjectsOf).toHaveLength(1);
        expect(
          shape.targetSubjectsOf[0].equals(ex("targetSubjectOf")),
        ).toStrictEqual(true);
      });

      it("xone", ({ expect }) => {
        const xone = shape.xone.extract()!;
        expect(xone).toBeDefined();
        expect(xone).toHaveLength(2);
        xone.forEach((memberIdentifier, memberI) => {
          expect(memberIdentifier.termType).toStrictEqual("BlankNode");
          const memberShape = shapesGraph
            .shape(memberIdentifier)
            .unsafeCoerce();
          expect(
            memberShape.datatype
              .extract()
              ?.equals(ex(`xoneDatatype${memberI + 1}`)),
          );
        });
      });
    });
  }
});

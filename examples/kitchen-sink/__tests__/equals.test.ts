import dataFactory from "@rdfx/data-factory";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { harnesses } from "./harnesses.js";

describe("equals", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(`should return true when the two ${id} objects are equal`, ({
      expect,
    }) => {
      expect(
        harness.staticSide
          .$equals(harness.instance as any, harness.instance as any)
          .extract(),
      ).toStrictEqual(true);
    });
  }

  it("should return Unequals when the two objects are unequal", ({
    expect,
  }) => {
    expect(
      kitchenSink.NonClass.$equals(
        kitchenSink.NonClass.$create({
          $identifier: dataFactory.blankNode(),
          nonClassProperty: "Test",
        }),
        kitchenSink.NonClass.$create({
          $identifier: dataFactory.blankNode(),
          nonClassProperty: "Test2",
        }),
      ).extract(),
    ).not.toStrictEqual(true);
  });

  it("terms union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      kitchenSink.UnionDiscriminants.$equals(
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
      ).extract(),
    ).toStrictEqual(true);

    expect(
      kitchenSink.UnionDiscriminants.$equals(
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrStringProperty: "test",
        }),
      ).extract(),
    ).not.toStrictEqual(true);
  });

  it("synthetic union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      kitchenSink.UnionDiscriminants.$equals(
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
      ).extract(),
    ).toStrictEqual(true);

    expect(
      kitchenSink.UnionDiscriminants.$equals(
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "UnionMember1",
            value: kitchenSink.UnionMember1.$create({
              $identifier: dataFactory.namedNode(
                "http://example.com/unionMember1",
              ),
              unionMember1Property: "test",
              unionMemberCommonParentProperty: "test",
            }),
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
      ).extract(),
    ).not.toStrictEqual(true);
  });

  it("typeof union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      kitchenSink.UnionDiscriminants.$equals(
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "test",
        }),
      ).extract(),
    ).toStrictEqual(true);

    expect(
      kitchenSink.UnionDiscriminants.$equals(
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty:
            dataFactory.namedNode("http://example.com"),
        }),
        kitchenSink.UnionDiscriminants.$create({
          $identifier,
          requiredNodeOrNodeOrStringProperty: {
            type: "UnionMember1",
            value: kitchenSink.UnionMember1.$create({
              $identifier: dataFactory.namedNode(
                "http://example.com/unionMember1",
              ),
              unionMember1Property: "test",
              unionMemberCommonParentProperty: "test",
            }),
          },
          requiredNodeOrLiteralProperty: dataFactory.literal("test"),
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrStringProperty: "http://example.com",
        }),
      ).extract(),
    ).not.toStrictEqual(true);
  });
});

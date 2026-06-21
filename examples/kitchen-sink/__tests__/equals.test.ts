import dataFactory from "@rdfx/data-factory";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

describe("equals", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(`should return true when the two ${id} objects are equal`, ({
      expect,
    }) => {
      expect(
        harness.staticSide
          .equals(harness.instance as any, harness.instance as any)
          .extract(),
      ).toStrictEqual(true);
    });
  }

  it("should return Unequals when the two objects are unequal", ({
    expect,
  }) => {
    expect(
      kitchenSink.NonClassStruct.equals(
        kitchenSink.NonClassStruct.createUnsafe({
          $identifier: dataFactory.blankNode(),
          nonClassString: "Test",
        }),
        kitchenSink.NonClassStruct.createUnsafe({
          $identifier: dataFactory.blankNode(),
          nonClassString: "Test2",
        }),
      ).extract(),
    ).not.toStrictEqual(true);
  });

  it("terms union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      kitchenSink.UnionDiscriminantsStruct.equals(
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
      ).extract(),
    ).toStrictEqual(true);

    expect(
      kitchenSink.UnionDiscriminantsStruct.equals(
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.literal("test"),
          requiredIriOrString: "test",
        }),
      ).extract(),
    ).not.toStrictEqual(true);
  });

  it("synthetic union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      kitchenSink.UnionDiscriminantsStruct.equals(
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
      ).extract(),
    ).toStrictEqual(true);

    expect(
      kitchenSink.UnionDiscriminantsStruct.equals(
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "DiscriminatedUnionMember1",
            value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
              $identifier: dataFactory.namedNode(
                "http://example.com/discriminatedUnionMember1",
              ),
              discriminatedUnionMember1Distinct: "test",
              discriminatedUnionMemberCommon: "test",
            }),
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
      ).extract(),
    ).not.toStrictEqual(true);
  });

  it("typeof union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      kitchenSink.UnionDiscriminantsStruct.equals(
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "test",
        }),
      ).extract(),
    ).toStrictEqual(true);

    expect(
      kitchenSink.UnionDiscriminantsStruct.equals(
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "string",
            value: "test",
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: dataFactory.namedNode("http://example.com"),
        }),
        kitchenSink.UnionDiscriminantsStruct.createUnsafe({
          $identifier,
          requiredNodeOrNodeOrString: {
            type: "DiscriminatedUnionMember1",
            value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
              $identifier: dataFactory.namedNode(
                "http://example.com/discriminatedUnionMember1",
              ),
              discriminatedUnionMember1Distinct: "test",
              discriminatedUnionMemberCommon: "test",
            }),
          },
          requiredNodeOrLiteral: dataFactory.literal("test"),
          requiredIriOrLiteral: dataFactory.namedNode(
            "http://example.com/term",
          ),
          requiredIriOrString: "http://example.com",
        }),
      ).extract(),
    ).not.toStrictEqual(true);
  });
});

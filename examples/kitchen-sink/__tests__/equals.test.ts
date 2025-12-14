import { DataFactory as dataFactory } from "n3";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "../src/index.js";
import type { Harness } from "./Harness.js";
import { harnesses } from "./harnesses.js";

describe("equals", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(`should return true when the two ${id} objects are equal`, ({
      expect,
    }) => {
      expect(
        harness.equals((harness as Harness<any>).instance).extract(),
      ).toStrictEqual(true);
    });
  }

  it("should return Unequals when the two objects are unequal", ({
    expect,
  }) => {
    expect(
      new kitchenSink.NonClass({
        $identifier: dataFactory.blankNode(),
        nonClassProperty: "Test",
      })
        .$equals(
          new kitchenSink.NonClass({
            $identifier: dataFactory.blankNode(),
            nonClassProperty: "Test2",
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });

  it("terms union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      new kitchenSink.UnionDiscriminantsClass({
        $identifier,
        requiredClassOrIriOrStringProperty: { type: "2-string", value: "test" },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrIriOrStringProperty: {
              type: "2-string",
              value: "test",
            },
            requiredIriOrLiteralProperty: dataFactory.namedNode(
              "http://example.com/term",
            ),
            requiredIriOrStringProperty: "test",
          }),
        )
        .extract(),
    ).toStrictEqual(true);

    expect(
      new kitchenSink.UnionDiscriminantsClass({
        $identifier,
        requiredClassOrIriOrStringProperty: { type: "2-string", value: "test" },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrIriOrStringProperty: {
              type: "2-string",
              value: "test",
            },
            requiredIriOrLiteralProperty: dataFactory.literal("test"),
            requiredIriOrStringProperty: "test",
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });

  it("synthetic union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      new kitchenSink.UnionDiscriminantsClass({
        $identifier,
        requiredClassOrIriOrStringProperty: { type: "2-string", value: "test" },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrIriOrStringProperty: {
              type: "2-string",
              value: "test",
            },
            requiredIriOrLiteralProperty: dataFactory.namedNode(
              "http://example.com/term",
            ),
            requiredIriOrStringProperty: "test",
          }),
        )
        .extract(),
    ).toStrictEqual(true);

    expect(
      new kitchenSink.UnionDiscriminantsClass({
        $identifier,
        requiredClassOrIriOrStringProperty: { type: "2-string", value: "test" },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrIriOrStringProperty: {
              type: "1-(rdfjs.NamedNode)",
              value: dataFactory.namedNode("http://example.com"),
            },
            requiredIriOrLiteralProperty: dataFactory.namedNode(
              "http://example.com/term",
            ),
            requiredIriOrStringProperty: "test",
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });

  it("typeof union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      new kitchenSink.UnionDiscriminantsClass({
        $identifier,
        requiredClassOrIriOrStringProperty: { type: "2-string", value: "test" },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrIriOrStringProperty: {
              type: "2-string",
              value: "test",
            },
            requiredIriOrLiteralProperty: dataFactory.namedNode(
              "http://example.com/term",
            ),
            requiredIriOrStringProperty: "test",
          }),
        )
        .extract(),
    ).toStrictEqual(true);

    expect(
      new kitchenSink.UnionDiscriminantsClass({
        $identifier,
        requiredClassOrIriOrStringProperty: { type: "2-string", value: "test" },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty:
          dataFactory.namedNode("http://example.com"),
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrIriOrStringProperty: {
              type: "1-(rdfjs.NamedNode)",
              value: dataFactory.namedNode("http://example.com"),
            },
            requiredIriOrLiteralProperty: dataFactory.namedNode(
              "http://example.com/term",
            ),
            requiredIriOrStringProperty: "http://example.com",
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });
});

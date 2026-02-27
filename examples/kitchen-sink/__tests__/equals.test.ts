import dataFactory from "@rdfjs/data-model";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
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
        requiredClassOrClassOrStringProperty: {
          type: "2-string",
          value: "test",
        },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrClassOrStringProperty: {
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
        requiredClassOrClassOrStringProperty: {
          type: "2-string",
          value: "test",
        },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrClassOrStringProperty: {
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
        requiredClassOrClassOrStringProperty: {
          type: "2-string",
          value: "test",
        },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrClassOrStringProperty: {
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
        requiredClassOrClassOrStringProperty: {
          type: "2-string",
          value: "test",
        },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrClassOrStringProperty: {
              type: "0-ClassUnionMember1",
              value: new kitchenSink.ClassUnionMember1({
                $identifier: dataFactory.namedNode(
                  "http://example.com/classUnionMember1",
                ),
                classUnionMember1Property: "test",
                classUnionMemberCommonParentProperty: "test",
              }),
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
        requiredClassOrClassOrStringProperty: {
          type: "2-string",
          value: "test",
        },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty: "test",
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrClassOrStringProperty: {
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
        requiredClassOrClassOrStringProperty: {
          type: "2-string",
          value: "test",
        },
        requiredIriOrLiteralProperty: dataFactory.namedNode(
          "http://example.com/term",
        ),
        requiredIriOrStringProperty:
          dataFactory.namedNode("http://example.com"),
      })
        .$equals(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier,
            requiredClassOrClassOrStringProperty: {
              type: "0-ClassUnionMember1",
              value: new kitchenSink.ClassUnionMember1({
                $identifier: dataFactory.namedNode(
                  "http://example.com/classUnionMember1",
                ),
                classUnionMember1Property: "test",
                classUnionMemberCommonParentProperty: "test",
              }),
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

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
        harness.equals((harness as Harness<any, any>).instance).extract(),
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
      new kitchenSink.UnionPropertiesClass({
        $identifier,
        widenedTermsProperty: dataFactory.namedNode("http://example.com/term"),
      })
        .$equals(
          new kitchenSink.UnionPropertiesClass({
            $identifier,
            widenedTermsProperty: dataFactory.namedNode(
              "http://example.com/term",
            ),
          }),
        )
        .extract(),
    ).toStrictEqual(true);

    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier,
        widenedTermsProperty: dataFactory.namedNode("http://example.com/term"),
      })
        .$equals(
          new kitchenSink.UnionPropertiesClass({
            $identifier,
            widenedTermsProperty: dataFactory.literal("test"),
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });

  it("unrelated union type", ({ expect }) => {
    const $identifier = dataFactory.blankNode();
    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier,
        unrelatedTypesProperty: 1,
      })
        .$equals(
          new kitchenSink.UnionPropertiesClass({
            $identifier,
            unrelatedTypesProperty: 1,
          }),
        )
        .extract(),
    ).toStrictEqual(true);

    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier,
        unrelatedTypesProperty: 1,
      })
        .$equals(
          new kitchenSink.UnionPropertiesClass({
            $identifier,
            unrelatedTypesProperty: new kitchenSink.NonClass({
              $identifier: dataFactory.blankNode(),
              nonClassProperty: "test",
            }),
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });
});

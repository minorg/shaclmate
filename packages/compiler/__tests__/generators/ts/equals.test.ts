import { DataFactory as dataFactory } from "n3";
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
        harness.equals((harness as Harness<any, any>).instance).extract(),
      ).toStrictEqual(true);
    });
  }

  it("should return Unequals when the two objects are unequal", ({
    expect,
  }) => {
    expect(
      new kitchenSink.NonClassNodeShape({
        identifier: dataFactory.blankNode(),
        stringProperty: "Test",
      })
        .equals(
          new kitchenSink.NonClassNodeShape({
            identifier: dataFactory.blankNode(),
            stringProperty: "Test2",
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });

  it("terms union type", ({ expect }) => {
    const identifier = dataFactory.blankNode();
    expect(
      new kitchenSink.UnionPropertiesNodeShape({
        identifier,
        orTermsProperty: dataFactory.namedNode("http://example.com/term"),
      })
        .equals(
          new kitchenSink.UnionPropertiesNodeShape({
            identifier,
            orTermsProperty: dataFactory.namedNode("http://example.com/term"),
          }),
        )
        .extract(),
    ).toStrictEqual(true);

    expect(
      new kitchenSink.UnionPropertiesNodeShape({
        identifier,
        orTermsProperty: dataFactory.namedNode("http://example.com/term"),
      })
        .equals(
          new kitchenSink.UnionPropertiesNodeShape({
            identifier,
            orTermsProperty: dataFactory.literal("test"),
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });

  it("unrelated union type", ({ expect }) => {
    const identifier = dataFactory.blankNode();
    expect(
      new kitchenSink.UnionPropertiesNodeShape({
        identifier,
        orUnrelatedProperty: 1,
      })
        .equals(
          new kitchenSink.UnionPropertiesNodeShape({
            identifier,
            orUnrelatedProperty: 1,
          }),
        )
        .extract(),
    ).toStrictEqual(true);

    expect(
      new kitchenSink.UnionPropertiesNodeShape({
        identifier,
        orUnrelatedProperty: 1,
      })
        .equals(
          new kitchenSink.UnionPropertiesNodeShape({
            identifier,
            orUnrelatedProperty: new kitchenSink.NonClassNodeShape({
              identifier: dataFactory.blankNode(),
              stringProperty: "test",
            }),
          }),
        )
        .extract(),
    ).not.toStrictEqual(true);
  });
});

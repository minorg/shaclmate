import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import dataFactory from "@rdfx/data-factory";
import {
  $DefaultPartial,
  $NamedDefaultPartial,
} from "../src/kitchen-sink.shaclmate.js";
import { harnesses } from "./harnesses.js";

describe("fromJson", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(`${id} round trip`, ({ expect }) => {
      const jsonObject = harness.staticSide.toJson(harness.instance as any);
      const fromJsonInstance: any = harness.staticSide
        .fromJson(jsonObject)
        .unsafeCoerce();
      const equalsResult = harness.staticSide
        .equals(harness.instance as any, fromJsonInstance as any)
        .extract();
      if (equalsResult !== true) {
        console.log("not equal");
      }
      expect(equalsResult).toStrictEqual(true);
    });
  }

  it("shorthand", ({ expect }) => {
    expect(
      $DefaultPartial
        .fromJson($DefaultPartial.Json.parse("_:foo").unsafeCoerce())
        .unsafeCoerce()
        .$identifier().termType,
    ).toStrictEqual("BlankNode");

    expect(
      $DefaultPartial
        .fromJson(
          $DefaultPartial.Json.parse("http://example.com").unsafeCoerce(),
        )
        .unsafeCoerce()
        .$identifier(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://example.com"));

    expect(
      $NamedDefaultPartial
        .fromJson(
          $NamedDefaultPartial.Json.parse("http://example.com").unsafeCoerce(),
        )
        .unsafeCoerce()
        .$identifier(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://example.com"));
  });
});

import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "../src/kitchen-sink.shaclmate.js";
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

  describe("input transformations", () => {
    describe("bigdecimal", () => {
      for (const inputFormat of ["number", "string"] as const) {
        it(inputFormat, ({ expect }) => {
          expect(
            kitchenSink.NumericsStruct.fromJson(
              kitchenSink.NumericsStruct.Json.parse({
                "@id": "http://example.com/test",
                "@type":
                  kitchenSink.NumericsStruct.schema.properties.$rdfType
                    .fromRdfType.value,
                decimalNumeric: inputFormat === "number" ? 42.3 : "42.3",
              }).unsafeCoerce(),
            )
              .unsafeCoerce()
              .decimalNumeric.extract()
              ?.toFixed(),
          ).toEqual("42.3");
        });
      }
    });

    describe("bigint", () => {
      for (const inputFormat of ["number", "string"] as const) {
        it(inputFormat, ({ expect }) => {
          expect(
            kitchenSink.NumericsStruct.fromJson(
              kitchenSink.NumericsStruct.Json.parse({
                "@id": "http://example.com/test",
                "@type":
                  kitchenSink.NumericsStruct.schema.properties.$rdfType
                    .fromRdfType.value,
                integerNumeric: inputFormat === "number" ? 42 : "42",
              }).unsafeCoerce(),
            )
              .unsafeCoerce()
              .integerNumeric.extract(),
          ).toStrictEqual(42n);
        });
      }
    });

    describe("date", () => {
      const date = new Date();
      for (const inputFormat of ["iso", "number"] as const) {
        it(inputFormat, ({ expect }) => {
          let input: unknown;
          switch (inputFormat) {
            case "iso":
              input = date.toISOString().slice(0, 10);
              break;
            case "number":
              input = date.getTime();
              break;
          }
          expect(
            kitchenSink.DatesStruct.fromJson(
              kitchenSink.DatesStruct.Json.parse({
                "@id": "http://example.com/test",
                "@type":
                  kitchenSink.DatesStruct.schema.properties.$rdfType.fromRdfType
                    .value,
                date: input,
              }).unsafeCoerce(),
            )
              .unsafeCoerce()
              .date.extract()
              ?.toISOString()
              .slice(0, 10),
          ).toStrictEqual(date.toISOString().slice(0, 10));
        });
      }
    });

    describe("datetime", () => {
      const date = new Date();
      for (const inputFormat of ["iso", "number"] as const) {
        it(inputFormat, ({ expect }) => {
          let input: unknown;
          switch (inputFormat) {
            case "iso":
              input = date.toISOString();
              break;
            case "number":
              input = date.getTime();
              break;
          }
          expect(
            kitchenSink.DatesStruct.fromJson(
              kitchenSink.DatesStruct.Json.parse({
                "@id": "http://example.com/test",
                "@type":
                  kitchenSink.DatesStruct.schema.properties.$rdfType.fromRdfType
                    .value,
                dateTime: input,
              }).unsafeCoerce(),
            )
              .unsafeCoerce()
              .dateTime.extract()
              ?.toISOString(),
          ).toStrictEqual(date.toISOString());
        });
      }
    });
  });

  it("object shorthand", ({ expect }) => {
    expect(
      kitchenSink.$DefaultPartial
        .fromJson(
          kitchenSink.$DefaultPartial.Json.parse("_:foo").unsafeCoerce(),
        )
        .unsafeCoerce()
        .$identifier().termType,
    ).toStrictEqual("BlankNode");

    expect(
      kitchenSink.$DefaultPartial
        .fromJson(
          kitchenSink.$DefaultPartial.Json.parse(
            "http://example.com",
          ).unsafeCoerce(),
        )
        .unsafeCoerce()
        .$identifier(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://example.com"));

    expect(
      kitchenSink.$NamedDefaultPartial
        .fromJson(
          kitchenSink.$NamedDefaultPartial.Json.parse(
            "http://example.com",
          ).unsafeCoerce(),
        )
        .unsafeCoerce()
        .$identifier(),
    ).toEqualRdfTerm(dataFactory.namedNode("http://example.com"));
  });
});

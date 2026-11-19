import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import { xsd } from "@tpluscode/rdf-ns-builders";
import * as kitchenSink from "../src/kitchen-sink.shaclmate.js";
import { harnesses } from "./harnesses.js";

const literalFactory = new LiteralFactory({ dataFactory });

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

  it("implicit blank node @id", ({ expect }) => {
    const json = kitchenSink.NonClassStruct.Json.parse({
      nonClassString: "test",
    }).unsafeCoerce();
    expect(json["@id"].startsWith("_:")).toStrictEqual(true);
    const struct = kitchenSink.NonClassStruct.fromJson(json).unsafeCoerce();
    expect(struct.$identifier().termType).toStrictEqual("BlankNode");
    expect(struct.$identifier().value).toStrictEqual(json["@id"].slice(2));
    expect(struct.nonClassString).toStrictEqual("test");
  });

  it("default @type", ({ expect }) => {
    const explicitRdfTypeStructJson =
      kitchenSink.ExplicitRdfTypeStruct.Json.parse({
        "@id": "http://example.com/instance",
        explicitRdfTypeString: "test",
      }).unsafeCoerce();
    expect(explicitRdfTypeStructJson["@type"]).toStrictEqual(
      "http://example.com/RdfType",
    );
    const explicitRdfTypeStruct = kitchenSink.ExplicitRdfTypeStruct.fromJson(
      explicitRdfTypeStructJson,
    ).unsafeCoerce();
    expect(explicitRdfTypeStruct.explicitRdfTypeString).toStrictEqual("test");
  });

  describe("input transformations", () => {
    describe("array", () => {
      it("array value", ({ expect }) => {
        expect(
          kitchenSink.PropertyCardinalitiesStruct.fromJson(
            kitchenSink.PropertyCardinalitiesStruct.Json.parse({
              required: "test",
              nonEmptySet: ["test1"],
            }).unsafeCoerce(),
          ).unsafeCoerce().nonEmptySet,
        ).toEqual(["test1"]);
      });

      it("singleton value", ({ expect }) => {
        expect(
          kitchenSink.PropertyCardinalitiesStruct.fromJson(
            kitchenSink.PropertyCardinalitiesStruct.Json.parse({
              required: "test",
              nonEmptySet: "test1",
            }).unsafeCoerce(),
          ).unsafeCoerce().nonEmptySet,
        ).toEqual(["test1"]);
      });
    });

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

    describe("literal", () => {
      for (const [input, expectedOutput] of [
        [true, literalFactory.boolean(true)],
        [42.3, literalFactory.number(42.3, xsd.double)],
        ["test", dataFactory.literal("test")],
        [
          "http://example.com/test",
          dataFactory.literal("http://example.com/test"),
        ],
      ] as readonly [boolean | number | object | string, Literal][]) {
        it(`${typeof input} ${input}`, ({ expect }) => {
          const actualOutput = kitchenSink.TermsStruct.fromJson(
            kitchenSink.TermsStruct.Json.parse({
              literalTerm: input,
            }).unsafeCoerce(),
          )
            .unsafeCoerce()
            .literalTerm.extract();
          expect(actualOutput).toEqualRdfTerm(expectedOutput);
        });
      }
    });

    describe("term", () => {
      for (const [input, expectedOutput] of [
        [true, literalFactory.boolean(true)],
        [42.3, literalFactory.number(42.3, xsd.double)],
        ["test", dataFactory.literal("test")],
        [
          "http://example.com/test",
          dataFactory.namedNode("http://example.com/test"),
        ],
      ] as readonly [
        boolean | number | object | string,
        BlankNode | Literal | NamedNode,
      ][]) {
        it(`${typeof input} ${input}`, ({ expect }) => {
          const actualOutput = kitchenSink.TermsStruct.fromJson(
            kitchenSink.TermsStruct.Json.parse({
              term: input,
            }).unsafeCoerce(),
          )
            .unsafeCoerce()
            .term.extract();
          expect(actualOutput).toEqualRdfTerm(expectedOutput);
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

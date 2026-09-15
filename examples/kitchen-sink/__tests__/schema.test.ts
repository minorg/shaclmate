import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";

describe("schema", () => {
  describe("properties", () => {
    it("union properties should have a common parent property", ({
      expect,
    }) => {
      expect(
        kitchenSink.DiscriminatedUnion.schema.properties
          .discriminatedUnionMemberCommon.path.value,
      ).toStrictEqual("http://example.com/discriminatedUnionMemberCommon");
    });

    it("object union common properties", ({ expect }) => {
      expect(kitchenSink.DiscriminatedUnion.schema.properties).toHaveProperty(
        "discriminatedUnionMemberCommon",
      );
    });

    describe("$rdfType", () => {
      describe("fromRdfType", () => {
        it("explicit fromRdfType", ({ expect }) => {
          expect(
            kitchenSink.ExplicitFromToRdfTypesStruct.schema.properties.$rdfType
              .fromRdfType.value,
          ).toStrictEqual("http://example.com/FromRdfType");
        });

        it("explicit rdfType", ({ expect }) => {
          expect(
            kitchenSink.ExplicitRdfTypeStruct.schema.properties.$rdfType
              .fromRdfType.value,
          ).toStrictEqual("http://example.com/RdfType");
        });

        it("implicit class target", ({ expect }) => {
          expect(
            kitchenSink.NumericsStruct.schema.properties.$rdfType.fromRdfType
              .value,
          ).toStrictEqual("http://example.com/NumericsStruct");
        });

        it("targetClass", ({ expect }) => {
          expect(
            kitchenSink.TargetClassStruct.schema.properties.$rdfType.fromRdfType
              .value,
          ).toStrictEqual("http://example.com/RdfType");
        });
      });

      describe("toRdfTypes", () => {
        it("explicit toRdfType", ({ expect }) => {
          expect(
            kitchenSink.ExplicitFromToRdfTypesStruct.schema.properties.$rdfType.toRdfTypes
              .map((_) => _.value)
              .sort(),
          ).toEqual([
            "http://example.com/FromRdfType",
            "http://example.com/ToRdfType",
          ]);
        });

        it("explicit rdfType", ({ expect }) => {
          expect(
            kitchenSink.ExplicitRdfTypeStruct.schema.properties.$rdfType.toRdfTypes.map(
              (_) => _.value,
            ),
          ).toEqual(["http://example.com/RdfType"]);
        });

        it("implicit class target", ({ expect }) => {
          expect(
            kitchenSink.NumericsStruct.schema.properties.$rdfType.toRdfTypes.map(
              (_) => _.value,
            ),
          ).toEqual(["http://example.com/NumericsStruct"]);
        });

        it("targetClass", ({ expect }) => {
          expect(
            kitchenSink.TargetClassStruct.schema.properties.$rdfType.toRdfTypes.map(
              (_) => _.value,
            ),
          ).toStrictEqual(["http://example.com/RdfType"]);
        });
      });
    });
  });
});

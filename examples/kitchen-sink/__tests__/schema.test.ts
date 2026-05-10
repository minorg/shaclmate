import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";

describe("schema", () => {
  describe("properties", () => {
    it("should have an own property", ({ expect }) => {
      expect(
        kitchenSink.ConcreteChild.$schema.properties.concreteChildProperty.path
          .value,
      ).toStrictEqual("http://example.com/concreteChildProperty");
    });

    it("should have a parent property", ({ expect }) => {
      expect(
        kitchenSink.ConcreteChild.$schema.properties.concreteParentProperty.path
          .value,
      ).toStrictEqual("http://example.com/concreteParentProperty");
    });

    it("should have an ancestor property", ({ expect }) => {
      expect(
        kitchenSink.ConcreteChild.$schema.properties.baseWithPropertiesProperty
          .path.value,
      ).toStrictEqual("http://example.com/baseWithPropertiesProperty");
    });

    it("union properties should have a common parent property", ({
      expect,
    }) => {
      expect(
        kitchenSink.Union.$schema.properties.unionMemberCommonParentProperty
          .path.value,
      ).toStrictEqual("http://example.com/unionMemberCommonParentProperty");
    });

    it("object union common properties", ({ expect }) => {
      expect(kitchenSink.Union.$schema.properties).toHaveProperty(
        "unionMemberCommonParentProperty",
      );
    });
  });
});

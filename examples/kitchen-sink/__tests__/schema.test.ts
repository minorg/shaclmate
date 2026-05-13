import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";

describe("schema", () => {
  describe("properties", () => {
    it("should have an own property", ({ expect }) => {
      expect(
        kitchenSink.ClassHierarchy3.schema.properties.classHierarchy3Property
          .path.value,
      ).toStrictEqual("http://example.com/classHierarchy3Property");
    });

    it("should have a parent property", ({ expect }) => {
      expect(
        kitchenSink.ClassHierarchy3.schema.properties.classHierarchy2Property
          .path.value,
      ).toStrictEqual("http://example.com/classHierarchy2Property");
    });

    it("should have an ancestor property", ({ expect }) => {
      expect(
        kitchenSink.ClassHierarchy3.schema.properties.classHierarchy0Property
          .path.value,
      ).toStrictEqual("http://example.com/classHierarchy0Property");
    });

    it("union properties should have a common parent property", ({
      expect,
    }) => {
      expect(
        kitchenSink.Union.schema.properties.unionMemberCommonParentProperty.path
          .value,
      ).toStrictEqual("http://example.com/unionMemberCommonParentProperty");
    });

    it("object union common properties", ({ expect }) => {
      expect(kitchenSink.Union.schema.properties).toHaveProperty(
        "unionMemberCommonParentProperty",
      );
    });
  });
});

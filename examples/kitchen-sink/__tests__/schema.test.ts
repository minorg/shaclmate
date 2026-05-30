import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";

describe("schema", () => {
  describe("properties", () => {
    it("union properties should have a common parent property", ({
      expect,
    }) => {
      expect(
        kitchenSink.Union.schema.properties.unionMemberCommonProperty.path
          .value,
      ).toStrictEqual("http://example.com/unionMemberCommonProperty");
    });

    it("object union common properties", ({ expect }) => {
      expect(kitchenSink.Union.schema.properties).toHaveProperty(
        "unionMemberCommonProperty",
      );
    });
  });
});

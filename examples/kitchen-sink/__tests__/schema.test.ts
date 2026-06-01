import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";

describe("schema", () => {
  describe("properties", () => {
    it("union properties should have a common parent property", ({
      expect,
    }) => {
      expect(
        kitchenSink.Union.schema.properties.unionMemberCommon.path.value,
      ).toStrictEqual("http://example.com/unionMemberCommon");
    });

    it("object union common properties", ({ expect }) => {
      expect(kitchenSink.Union.schema.properties).toHaveProperty(
        "unionMemberCommon",
      );
    });
  });
});

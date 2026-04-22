import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";

describe("schema", () => {
  it("object union common properties", ({ expect }) => {
    expect(kitchenSink.ClassUnion.$schema.properties).toHaveProperty(
      "classUnionMemberCommonParentProperty",
    );
  });
});

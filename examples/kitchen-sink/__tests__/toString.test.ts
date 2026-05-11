import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("toString", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(id, ({ expect }) => {
      const string = harness.staticSide.$toString(harness.instance as any);
      expect(string).not.toHaveLength(0);
      expect(string).not.toEqual("[object Object]");
    });
  }

  it("explicitly and implicitly exclude and include properties in toString()", ({
    expect,
  }) => {
    expect(
      kitchenSink.DisplayProperties.$toString(
        harnesses.displayProperties.instance,
      ),
    ).toStrictEqual(
      `DisplayProperties({"$identifier":"<http://example.com/instance>","explicitTrueDisplayProperty":"explicitTrueDisplayValue"})`,
    );
  });
});

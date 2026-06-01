import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("toString", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(id, ({ expect }) => {
      const string = harness.instance.toString();
      expect(string).not.toHaveLength(0);
      expect(string).not.toEqual("[object Object]");
    });
  }

  it("explicitly and implicitly exclude and include properties in toString()", ({
    expect,
  }) => {
    expect(harnesses.displayPropertiesStruct.instance.toString()).toStrictEqual(
      `DisplayProperties({"$identifier":"<http://example.com/instance>","explicitTrueDisplayProperty":"explicitTrueDisplayValue"})`,
    );
  });
});

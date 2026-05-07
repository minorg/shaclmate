import { describe, it } from "vitest";
import type { Harness } from "./Harness.js";
import { harnesses } from "./harnesses.js";

describe("toString", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(id, ({ expect }) => {
      const string = (harness as Harness<any>).toString();
      expect(string).not.toHaveLength(0);
      expect(string).not.toEqual("[object Object]");
    });
  }

  it("explicitly and implicitly exclude and include properties in toString()", ({
    expect,
  }) => {
    expect(harnesses.displayPropertiesClass.toString()).toStrictEqual(
      `DisplayPropertiesClass({"$identifier":"<http://example.com/instance>","explicitTrueDisplayProperty":"explicitTrueDisplayValue"})`,
    );
  });
});

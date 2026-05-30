import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import { harnesses } from "./harnesses.js";

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
});

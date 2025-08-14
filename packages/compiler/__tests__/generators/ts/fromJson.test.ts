import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { harnesses } from "./harnesses.js";

describe("fromJson", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(`${id} round trip`, ({ expect }) => {
      const jsonObject = harness.toJson();
      const fromJsonInstance: any = harness.fromJson(jsonObject).unsafeCoerce();
      const equalsResult = harness.equals(fromJsonInstance).extract();
      if (equalsResult !== true) {
        console.log("not equal");
      }
      expect(equalsResult).toStrictEqual(true);
    });
  }

  it("abstract base class fromJson", ({ expect }) => {
    const fromJsonInstance =
      kitchenSink.AbstractBaseClassWithPropertiesStatic.fromJson(
        harnesses.concreteChildClass.toJson(),
      ).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClass.equals(fromJsonInstance).extract(),
    ).toStrictEqual(true);
  });

  it("concrete base class fromJson", ({ expect }) => {
    const fromJsonInstance = kitchenSink.ConcreteParentClassStatic.fromJson(
      harnesses.concreteChildClass.toJson(),
    ).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClass.equals(fromJsonInstance).extract(),
    ).toStrictEqual(true);
  });
});

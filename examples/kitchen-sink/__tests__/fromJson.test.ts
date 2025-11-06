import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "../src/index.js";
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

  it("concrete base class fromJson", ({ expect }) => {
    const fromJsonInstance = kitchenSink.ConcreteParentClassStatic.$fromJson(
      harnesses.concreteChildClass.toJson(),
    ).unsafeCoerce();
    expect(fromJsonInstance).not.toBeInstanceOf(kitchenSink.ConcreteChildClass);
    expect(
      fromJsonInstance.$identifier.equals(
        harnesses.concreteChildClass.instance.$identifier,
      ),
    );
    expect(fromJsonInstance.concreteParentClassProperty).toStrictEqual(
      harnesses.concreteChildClass.instance.concreteParentClassProperty,
    );
  });
});

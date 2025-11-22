import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

describe("isType", () => {
  it("should work on a class hierarchy", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildClass.isConcreteChildClass(
        harnesses.concreteChildClass.instance,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.ConcreteParentClassStatic.isConcreteParentClass(
        harnesses.concreteChildClass.instance,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.AbstractBaseClassWithoutPropertiesStatic.isAbstractBaseClassWithoutProperties(
        harnesses.concreteChildClass.instance,
      ),
    ).toStrictEqual(true);

    // There's no isType function for the root class since it'd be redundant.
    // expect(
    //   kitchenSink.AbstractBaseClassWithPropertiesStatic.isAbstractBaseClassWithProperties(
    //     harnesses.concreteChildClass.instance,
    //   ),
    // ).toStrictEqual(true);
  });

  it("should work on an interface hierarchy", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildInterface.isConcreteChildInterface(
        harnesses.concreteChildInterface.instance,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.ConcreteParentInterfaceStatic.isConcreteParentInterface(
        harnesses.concreteChildInterface.instance,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.BaseInterfaceWithoutPropertiesStatic.isBaseInterfaceWithoutProperties(
        harnesses.concreteChildInterface.instance,
      ),
    ).toStrictEqual(true);

    // There's no isType function for the root interface since it'd be redundant.
    // expect(
    //   kitchenSink.BaseInterfaceWithPropertiesStatic.isBaseInterfaceWithProperties(
    //     harnesses.concreteChildInterface.instance,
    //   ),
    // ).toStrictEqual(true);
  });
});

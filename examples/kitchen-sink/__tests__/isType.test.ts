import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

describe("isType", () => {
  it("should work on a class hierarchy", ({ expect }) => {
    // Cast the concrete child class to the root class to ensure the isType function accepts the root of the hierarchy.

    expect(
      kitchenSink.ConcreteChildClass.isConcreteChildClass(
        harnesses.concreteChildClass
          .instance as kitchenSink.AbstractBaseClassWithProperties,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.ConcreteParentClassStatic.isConcreteParentClass(
        harnesses.concreteChildClass
          .instance as kitchenSink.AbstractBaseClassWithProperties,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.AbstractBaseClassWithoutPropertiesStatic.isAbstractBaseClassWithoutProperties(
        harnesses.concreteChildClass
          .instance as kitchenSink.AbstractBaseClassWithProperties,
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
    // Cast the concrete child interface to the root interface to ensure the isType function accepts the root of the hierarchy.

    expect(
      kitchenSink.ConcreteChildInterface.isConcreteChildInterface(
        harnesses.concreteChildInterface
          .instance as kitchenSink.BaseInterfaceWithProperties,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.ConcreteParentInterfaceStatic.isConcreteParentInterface(
        harnesses.concreteChildInterface
          .instance as kitchenSink.BaseInterfaceWithProperties,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.BaseInterfaceWithoutPropertiesStatic.isBaseInterfaceWithoutProperties(
        harnesses.concreteChildInterface
          .instance as kitchenSink.BaseInterfaceWithProperties,
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

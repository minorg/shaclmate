import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("isType", () => {
  it("should work on a hierarchy", ({ expect }) => {
    // Cast the concrete child class to the root class to ensure the isType function accepts the root of the hierarchy.

    expect(
      kitchenSink.ConcreteChild.isConcreteChild(
        harnesses.concreteChild.instance as kitchenSink.BaseWithProperties,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.ConcreteParentStatic.isConcreteParent(
        harnesses.concreteChild.instance as kitchenSink.BaseWithProperties,
      ),
    ).toStrictEqual(true);

    expect(
      kitchenSink.BaseWithoutPropertiesStatic.isBaseWithoutProperties(
        harnesses.concreteChild.instance as kitchenSink.BaseWithProperties,
      ),
    ).toStrictEqual(true);

    // There's no isType function for the root class since it'd be redundant.
    // expect(
    //   kitchenSink.BaseWithPropertiesStatic.isBaseWithProperties(
    //     harnesses.concreteChild.instance,
    //   ),
    // ).toStrictEqual(true);
  });

  it("should work on a union", ({ expect }) => {
    expect(
      kitchenSink.Union.isUnion(
        harnesses.unionMember1.instance as kitchenSink.UnionMemberCommonParent,
      ),
    ).toStrictEqual(true);
    expect(
      kitchenSink.Union.isUnion(
        harnesses.unionMember2.instance as kitchenSink.UnionMemberCommonParent,
      ),
    ).toStrictEqual(true);
  });
});

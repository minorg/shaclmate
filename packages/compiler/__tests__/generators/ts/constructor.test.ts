import { DataFactory as dataFactory } from "n3";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { harnesses } from "./harnesses.js";

describe("constructor", () => {
  it("construct a class instance from convertible parameters", ({ expect }) => {
    const instance = harnesses.propertyCardinalities.instance;
    expect(instance.emptyStringSetProperty).toHaveLength(0);
    expect(instance.optionalStringProperty.isNothing()).toStrictEqual(true);
    expect(instance.nonEmptyStringSetProperty).toStrictEqual(["test1"]);
    expect(instance.requiredStringProperty).toStrictEqual("test");
  });

  it("default values", ({ expect }) => {
    const model = harnesses.defaultValuePropertiesNodeShape.instance;
    expect(model.falseBooleanProperty).toStrictEqual(false);
    expect(model.dateTimeProperty.getTime()).toStrictEqual(1523268000000);
    expect(model.numberProperty).toStrictEqual(0);
    expect(model.stringProperty).toStrictEqual("");
    expect(model.trueBooleanProperty).toStrictEqual(true);
  });

  it("union of literals property", ({ expect }) => {
    expect(
      new kitchenSink.UnionPropertiesNodeShape({
        identifier: dataFactory.blankNode(),
        widenedLiteralsProperty: dataFactory.literal("test"),
      }).widenedLiteralsProperty.unsafeCoerce().value,
    ).toStrictEqual("test");
  });
});

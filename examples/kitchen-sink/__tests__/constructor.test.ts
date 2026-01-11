import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("constructor", () => {
  it("construct a class instance from convertible parameters", ({ expect }) => {
    const instance = harnesses.propertyCardinalitiesClass.instance;
    expect(instance.emptyStringSetProperty).toHaveLength(0);
    expect(instance.optionalStringProperty.isNothing()).toStrictEqual(true);
    expect(instance.nonEmptyStringSetProperty).toStrictEqual(["test1"]);
    expect(instance.requiredStringProperty).toStrictEqual("test");
  });

  it("default values", ({ expect }) => {
    const model = harnesses.defaultValuePropertiesClass.instance;
    expect(model.falseBooleanDefaultValueProperty).toStrictEqual(false);
    expect(model.dateTimeDefaultValueProperty.getTime()).toStrictEqual(
      1523268000000,
    );
    expect(model.numberDefaultValueProperty).toStrictEqual(0);
    expect(model.stringDefaultValueProperty).toStrictEqual("");
    expect(model.trueBooleanDefaultValueProperty).toStrictEqual(true);
  });
});

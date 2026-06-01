import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("constructor", () => {
  it("construct a class instance from convertible parameters", ({ expect }) => {
    const instance = harnesses.propertyCardinalitiesStruct1.instance;
    expect(instance.emptySet).toHaveLength(0);
    expect(instance.nonEmptySet).toStrictEqual(["test"]);
    expect(instance.optional.isNothing()).toStrictEqual(true);
    expect(instance.required).toStrictEqual("test");
  });

  it("default values", ({ expect }) => {
    const model = harnesses.defaultValuesStruct.instance;
    expect(model.falseBooleanDefaultValue).toStrictEqual(false);
    expect(model.dateTimeDefaultValue.getTime()).toStrictEqual(1523268000000);
    expect(model.numberDefaultValue).toStrictEqual(0);
    expect(model.stringDefaultValue).toStrictEqual("");
    expect(model.trueBooleanDefaultValue).toStrictEqual(true);
  });
});

import { DataFactory as dataFactory } from "n3";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
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

  it("union of literals property", ({ expect }) => {
    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier: dataFactory.blankNode(),
        widenedLiteralsProperty: dataFactory.literal("test"),
      }).widenedLiteralsProperty.unsafeCoerce().value,
    ).toStrictEqual("test");
  });
});

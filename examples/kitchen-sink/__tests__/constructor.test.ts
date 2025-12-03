import { DataFactory as dataFactory } from "n3";
import { describe, it } from "vitest";
import "./harnesses.js"; // Must be imported before kitchenSink
import * as kitchenSink from "../src/index.js";
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

  it("union properties", ({ expect }) => {
    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier: dataFactory.blankNode(),
        integerOrClassProperty: 5,
      }).integerOrClassProperty.unsafeCoerce(),
    ).toStrictEqual(5);

    expect(
      (
        new kitchenSink.UnionPropertiesClass({
          $identifier: dataFactory.blankNode(),
          integerOrClassProperty: new kitchenSink.NonClass({
            nonClassProperty: "test",
          }),
        }).integerOrClassProperty.unsafeCoerce() as kitchenSink.NonClass
      ).nonClassProperty,
    ).toStrictEqual("test");

    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier: dataFactory.blankNode(),
        integerOrStringProperty: "test",
      }).integerOrStringProperty.unsafeCoerce(),
    ).toStrictEqual("test");

    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier: dataFactory.blankNode(),
        integerOrStringProperty: 5,
      }).integerOrStringProperty.unsafeCoerce(),
    ).toStrictEqual(5);

    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier: dataFactory.blankNode(),
        iriOrLiteralProperty: dataFactory.namedNode("http://example.com"),
      }).iriOrLiteralProperty
        .unsafeCoerce()
        .equals(dataFactory.namedNode("http://example.com")),
    ).toStrictEqual(true);

    expect(
      new kitchenSink.UnionPropertiesClass({
        $identifier: dataFactory.blankNode(),
        iriOrLiteralProperty: dataFactory.literal("test"),
      }).iriOrLiteralProperty
        .unsafeCoerce()
        .equals(dataFactory.literal("test")),
    ).toStrictEqual(true);
  });
});

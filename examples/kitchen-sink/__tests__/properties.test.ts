import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";

describe("properties", () => {
  it("class properties should have an own property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildClass.$properties.concreteChildClassProperty
        .identifier.value,
    ).toStrictEqual("http://example.com/concreteChildClassProperty");
  });

  it("class properties should have a parent property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildClass.$properties.concreteParentClassProperty
        .identifier.value,
    ).toStrictEqual("http://example.com/concreteParentClassProperty");
  });

  it("class properties should have an ancestor property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildClass.$properties
        .abstractBaseClassWithPropertiesProperty.identifier.value,
    ).toStrictEqual(
      "http://example.com/abstractBaseClassWithPropertiesProperty",
    );
  });

  it("interface properties should have an own property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildInterface.$properties
        .concreteChildInterfaceProperty.identifier.value,
    ).toStrictEqual("http://example.com/concreteChildInterfaceProperty");
  });

  it("interface properties should have a parent property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildInterface.$properties
        .concreteParentInterfaceProperty.identifier.value,
    ).toStrictEqual("http://example.com/concreteParentInterfaceProperty");
  });

  it("interface properties should have an ancestor property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildInterface.$properties
        .baseInterfaceWithPropertiesProperty.identifier.value,
    ).toStrictEqual("http://example.com/baseInterfaceWithPropertiesProperty");
  });

  it("class union properties should have a common parent property", ({
    expect,
  }) => {
    expect(
      kitchenSink.ClassUnion.$properties.classUnionMemberCommonParentProperty
        .identifier.value,
    ).toStrictEqual("http://example.com/classUnionMemberCommonParentProperty");
  });
});

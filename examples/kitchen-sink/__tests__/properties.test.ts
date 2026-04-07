import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";

describe("properties", () => {
  it("class properties should have an own property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildClass.$schema.properties
        .concreteChildClassProperty.path.value,
    ).toStrictEqual("http://example.com/concreteChildClassProperty");
  });

  it("class properties should have a parent property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildClass.$schema.properties
        .concreteParentClassProperty.path.value,
    ).toStrictEqual("http://example.com/concreteParentClassProperty");
  });

  it("class properties should have an ancestor property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildClass.$schema.properties
        .abstractBaseClassWithPropertiesProperty.path.value,
    ).toStrictEqual(
      "http://example.com/abstractBaseClassWithPropertiesProperty",
    );
  });

  it("interface properties should have an own property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildInterface.$schema.properties
        .concreteChildInterfaceProperty.path.value,
    ).toStrictEqual("http://example.com/concreteChildInterfaceProperty");
  });

  it("interface properties should have a parent property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildInterface.$schema.properties
        .concreteParentInterfaceProperty.path.value,
    ).toStrictEqual("http://example.com/concreteParentInterfaceProperty");
  });

  it("interface properties should have an ancestor property", ({ expect }) => {
    expect(
      kitchenSink.ConcreteChildInterface.$schema.properties
        .baseInterfaceWithPropertiesProperty.path.value,
    ).toStrictEqual("http://example.com/baseInterfaceWithPropertiesProperty");
  });

  it("class union properties should have a common parent property", ({
    expect,
  }) => {
    expect(
      kitchenSink.ClassUnion.$schema.properties
        .classUnionMemberCommonParentProperty.path.value,
    ).toStrictEqual("http://example.com/classUnionMemberCommonParentProperty");
  });

  it("interface union properties should have a common parent property", ({
    expect,
  }) => {
    expect(
      kitchenSink.InterfaceUnion.$schema.properties
        .interfaceUnionMemberCommonParentProperty.path.value,
    ).toStrictEqual(
      "http://example.com/interfaceUnionMemberCommonParentProperty",
    );
  });
});

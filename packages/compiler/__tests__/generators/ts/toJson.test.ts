import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("toJson", () => {
  it("union properties", ({ expect }) => {
    const jsonObject = harnesses.unionProperties1.instance.$toJson();
    expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
    expect(jsonObject.$type).toStrictEqual("UnionPropertiesClass");
    expect(jsonObject.widenedLiteralsProperty).toStrictEqual({
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
      "@value": "1",
    });
    expect(jsonObject.widenedTermsProperty).toStrictEqual({
      termType: "Literal",
      "@value": "test",
    });
  });

  it("child-parent", ({ expect }) => {
    const jsonObject = harnesses.concreteChildClass.instance.$toJson();
    expect(jsonObject.abstractBaseClassWithPropertiesProperty).toStrictEqual(
      "abc",
    );
    expect(jsonObject.concreteChildClassProperty).toStrictEqual("child");
    expect(jsonObject.concreteParentClassProperty).toStrictEqual("parent");
    expect(jsonObject.$type).toStrictEqual("ConcreteChildClass");
  });

  // it("property order", ({ expect }) => {
  //   const jsonObject =
  //     harnesses.nodeShapeWithOrderedProperties.instance.toJson();
  //   expect([...Object.keys(jsonObject)]).toEqual([
  //     "@id",
  //     "type",
  //     "propertyC",
  //     "propertyB",
  //     "propertyA",
  //   ]);
  // });
});

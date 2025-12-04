import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("toJson", () => {
  it("union properties", ({ expect }) => {
    {
      const jsonObject = harnesses.unionProperties1.instance.$toJson();
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.$type).toStrictEqual("UnionPropertiesClass");
      expect(jsonObject.optionalIntegerOrClassProperty).toStrictEqual(5);
      expect(jsonObject.optionalIntegerOrStringProperty).toStrictEqual(5);
      expect(jsonObject.optionalIriOrLiteralProperty).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.requiredIntegerOrClassProperty).toStrictEqual(5);
      expect(jsonObject.requiredIntegerOrStringProperty).toStrictEqual(5);
      expect(jsonObject.requiredIriOrLiteralProperty).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.setIntegerOrClassProperty).toHaveLength(0);
      expect(jsonObject.setIntegerOrStringProperty).toHaveLength(0);
      expect(jsonObject.setIriOrLiteralProperty).toHaveLength(0);
    }

    {
      const jsonObject = harnesses.unionProperties2Class.instance.$toJson();
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.optionalIntegerOrStringProperty).toStrictEqual("test");
      expect(jsonObject.optionalIriOrLiteralProperty).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.requiredIntegerOrStringProperty).toStrictEqual("test");
      expect(jsonObject.requiredIriOrLiteralProperty).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.setIntegerOrStringProperty).toStrictEqual([5, "test"]);
      expect(jsonObject.setIriOrLiteralProperty).toStrictEqual([
        {
          "@id": "http://example.com",
          termType: "NamedNode",
        },
        {
          "@value": "test",
          termType: "Literal",
        },
      ]);
    }
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

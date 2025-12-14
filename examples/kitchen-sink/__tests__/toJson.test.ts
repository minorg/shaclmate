import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("toJson", () => {
  it("union properties", ({ expect }) => {
    {
      const jsonObject = harnesses.unionDiscriminants1.instance.$toJson();
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.$type).toStrictEqual("UnionDiscriminantsClass");
      expect(jsonObject.optionalClassOrIriOrStringProperty).toStrictEqual({
        type: "0-NonClass",
        value: {
          $type: "NonClass",
          "@id": "http://example.com/nonClass",
          nonClassProperty: "test",
        },
      });
      expect(jsonObject.optionalIriOrLiteralProperty).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.optionalIriOrStringProperty).toStrictEqual({
        "@id": "http://example.com",
      });
      expect(jsonObject.requiredClassOrIriOrStringProperty).toStrictEqual({
        type: "0-NonClass",
        value: {
          $type: "NonClass",
          "@id": "http://example.com/nonClass",
          nonClassProperty: "test",
        },
      });
      expect(jsonObject.requiredIriOrLiteralProperty).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.requiredIriOrStringProperty).toStrictEqual({
        "@id": "http://example.com",
      });
      expect(jsonObject.setClassOrIriOrStringProperty).toHaveLength(0);
      expect(jsonObject.setIriOrLiteralProperty).toHaveLength(0);
      expect(jsonObject.setIriOrStringProperty).toHaveLength(0);
    }

    {
      const jsonObject = harnesses.unionDiscriminants2Class.instance.$toJson();
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.optionalClassOrIriOrStringProperty).toStrictEqual({
        type: "1-(rdfjs.NamedNode)",
        value: {
          "@id": "http://example.com",
        },
      });
      expect(jsonObject.optionalIriOrLiteralProperty).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.optionalIriOrStringProperty).toStrictEqual("test");
      expect(jsonObject.requiredClassOrIriOrStringProperty).toStrictEqual({
        type: "2-string",
        value: "test",
      });
      expect(jsonObject.requiredIriOrLiteralProperty).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.requiredIriOrStringProperty).toStrictEqual("test");
      expect(jsonObject.setClassOrIriOrStringProperty).toStrictEqual([
        {
          type: "2-string",
          value: "test",
        },
        {
          type: "1-(rdfjs.NamedNode)",
          value: {
            "@id": "http://example.com",
          },
        },
        {
          type: "0-NonClass",
          value: {
            $type: "NonClass",
            "@id": "http://example.com/nonClass",
            nonClassProperty: "test",
          },
        },
      ]);
      expect(jsonObject.setIriOrLiteralProperty).toStrictEqual([
        {
          "@value": "test",
          termType: "Literal",
        },
        {
          "@id": "http://example.com",
          termType: "NamedNode",
        },
      ]);
      expect(jsonObject.setIriOrStringProperty).toStrictEqual([
        "test",
        {
          "@id": "http://example.com",
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

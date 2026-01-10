import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("toJson", () => {
  it("union properties", ({ expect }) => {
    {
      const jsonObject = harnesses.unionDiscriminantsClass1.instance.$toJson();
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.$type).toStrictEqual("UnionDiscriminantsClass");
      expect(jsonObject.optionalClassOrClassOrStringProperty).toStrictEqual({
        type: "0-ClassUnionMember1",
        value: {
          $type: "ClassUnionMember1",
          "@id": "http://example.com/classUnionMember1",
          classUnionMember1Property: "test",
          classUnionMemberCommonParentProperty: "test",
        },
      });
      expect(jsonObject.optionalIriOrLiteralProperty).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.optionalIriOrStringProperty).toStrictEqual({
        "@id": "http://example.com",
      });
      expect(jsonObject.requiredClassOrClassOrStringProperty).toStrictEqual({
        type: "0-ClassUnionMember1",
        value: {
          $type: "ClassUnionMember1",
          "@id": "http://example.com/classUnionMember1",
          classUnionMember1Property: "test",
          classUnionMemberCommonParentProperty: "test",
        },
      });
      expect(jsonObject.requiredIriOrLiteralProperty).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.requiredIriOrStringProperty).toStrictEqual({
        "@id": "http://example.com",
      });
      expect(jsonObject.setClassOrClassOrStringProperty).toHaveLength(0);
      expect(jsonObject.setIriOrLiteralProperty).toHaveLength(0);
      expect(jsonObject.setIriOrStringProperty).toHaveLength(0);
    }

    {
      const jsonObject = harnesses.unionDiscriminantsClass2.instance.$toJson();
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.optionalClassOrClassOrStringProperty).toStrictEqual({
        type: "1-ClassUnionMember2",
        value: {
          $type: "ClassUnionMember2",
          "@id": "http://example.com/classUnionMember2",
          classUnionMember2Property: "test",
          classUnionMemberCommonParentProperty: "test",
        },
      });
      expect(jsonObject.optionalIriOrLiteralProperty).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.optionalIriOrStringProperty).toStrictEqual("test");
      expect(jsonObject.requiredClassOrClassOrStringProperty).toStrictEqual({
        type: "2-string",
        value: "test",
      });
      expect(jsonObject.requiredIriOrLiteralProperty).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.requiredIriOrStringProperty).toStrictEqual("test");
      expect(jsonObject.setClassOrClassOrStringProperty).toStrictEqual([
        {
          type: "2-string",
          value: "test",
        },
        {
          type: "1-ClassUnionMember2",
          value: {
            $type: "ClassUnionMember2",
            "@id": "http://example.com/classUnionMember2",
            classUnionMember2Property: "test",
            classUnionMemberCommonParentProperty: "test",
          },
        },
        {
          type: "0-ClassUnionMember1",
          value: {
            $type: "ClassUnionMember1",
            "@id": "http://example.com/classUnionMember1",
            classUnionMember1Property: "test",
            classUnionMemberCommonParentProperty: "test",
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

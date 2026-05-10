import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("toJson", () => {
  it("union properties", ({ expect }) => {
    {
      const jsonObject = kitchenSink.UnionDiscriminants.$toJson(
        harnesses.unionDiscriminants1.instance,
      );
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.$type).toStrictEqual("UnionDiscriminants");
      expect(jsonObject.optionalNodeOrNodeOrStringProperty).toStrictEqual({
        type: "UnionMember1",
        value: {
          $type: "UnionMember1",
          "@id": "http://example.com/unionMember1a",
          unionMember1Property: "test",
          unionMemberCommonParentProperty: "test",
        },
      });
      expect(jsonObject.optionalIriOrLiteralProperty).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.optionalIriOrStringProperty).toStrictEqual({
        "@id": "http://example.com",
      });
      expect(jsonObject.requiredNodeOrNodeOrStringProperty).toStrictEqual({
        type: "UnionMember1",
        value: {
          $type: "UnionMember1",
          "@id": "http://example.com/unionMember1b",
          unionMember1Property: "test",
          unionMemberCommonParentProperty: "test",
        },
      });
      expect(jsonObject.requiredIriOrLiteralProperty).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.requiredIriOrStringProperty).toStrictEqual({
        "@id": "http://example.com",
      });
      expect(jsonObject.setNodeOrNodeOrStringProperty).toHaveLength(0);
      expect(jsonObject.setIriOrLiteralProperty).toHaveLength(0);
      expect(jsonObject.setIriOrStringProperty).toHaveLength(0);
    }

    {
      const jsonObject = kitchenSink.UnionDiscriminants.$toJson(
        harnesses.unionDiscriminants2.instance,
      );
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.optionalNodeOrNodeOrStringProperty).toStrictEqual({
        type: "UnionMember2",
        value: {
          $type: "UnionMember2",
          "@id": "http://example.com/unionMember2a",
          unionMember2Property: "test",
          unionMemberCommonParentProperty: "test",
        },
      });
      expect(jsonObject.optionalIriOrLiteralProperty).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.optionalIriOrStringProperty).toStrictEqual("test");
      expect(jsonObject.requiredNodeOrNodeOrStringProperty).toStrictEqual({
        type: "string",
        value: "test",
      });
      expect(jsonObject.requiredIriOrLiteralProperty).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.requiredIriOrStringProperty).toStrictEqual("test");
      expect(jsonObject.setNodeOrNodeOrStringProperty).toStrictEqual([
        {
          type: "string",
          value: "test",
        },
        {
          type: "UnionMember2",
          value: {
            $type: "UnionMember2",
            "@id": "http://example.com/unionMember2b",
            unionMember2Property: "test",
            unionMemberCommonParentProperty: "test",
          },
        },
        {
          type: "UnionMember1",
          value: {
            $type: "UnionMember1",
            "@id": "http://example.com/unionMember1b",
            unionMember1Property: "test",
            unionMemberCommonParentProperty: "test",
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
    const jsonObject = kitchenSink.ConcreteChild.$toJson(
      harnesses.concreteChild.instance,
    );
    expect(jsonObject.baseWithPropertiesProperty).toStrictEqual("abc");
    expect(jsonObject.concreteChildProperty).toStrictEqual("child");
    expect(jsonObject.concreteParentProperty).toStrictEqual("parent");
    expect(jsonObject.$type).toStrictEqual("ConcreteChild");
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

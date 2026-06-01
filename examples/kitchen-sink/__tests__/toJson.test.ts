import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("toJson", () => {
  it("union properties", ({ expect }) => {
    {
      const jsonObject = kitchenSink.UnionDiscriminantsStruct.toJson(
        harnesses.unionDiscriminantsStruct1.instance,
      );
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject["@type"]).toStrictEqual("UnionDiscriminantsStruct");
      expect(jsonObject.optionalNodeOrNodeOrStringProperty).toStrictEqual({
        type: "UnionMember1",
        value: {
          "@type": "UnionMember1",
          "@id": "http://example.com/unionMember1a",
          unionMember1Property: "test",
          unionMemberCommonProperty: "test",
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
          "@type": "UnionMember1",
          "@id": "http://example.com/unionMember1b",
          unionMember1Property: "test",
          unionMemberCommonProperty: "test",
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
      const jsonObject = kitchenSink.UnionDiscriminantsStruct.toJson(
        harnesses.unionDiscriminantsStruct2.instance,
      );
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.optionalNodeOrNodeOrStringProperty).toStrictEqual({
        type: "UnionMember2",
        value: {
          "@type": "UnionMember2",
          "@id": "http://example.com/unionMember2a",
          unionMember2Property: "test",
          unionMemberCommonProperty: "test",
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
            "@type": "UnionMember2",
            "@id": "http://example.com/unionMember2b",
            unionMember2Property: "test",
            unionMemberCommonProperty: "test",
          },
        },
        {
          type: "UnionMember1",
          value: {
            "@type": "UnionMember1",
            "@id": "http://example.com/unionMember1b",
            unionMember1Property: "test",
            unionMemberCommonProperty: "test",
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

  it("toJSON", ({ expect }) => {
    expect(
      JSON.stringify(harnesses.termPropertiesStruct.instance),
    ).toStrictEqual(
      `{"@id":"http://example.com/instance","@type":"TermPropertiesStruct","blankNodeTermProperty":{"@id":"_:df_0_16"},"booleanTermProperty":true,"dateTermProperty":"2025-03-06","dateTimeTermProperty":"2018-04-09T10:00:00.000Z","iriTermProperty":{"@id":"http://example.com"},"literalTermProperty":{"@value":"test"},"numberTermProperty":1,"stringTermProperty":"test","termProperty":{"@type":"http://www.w3.org/2001/XMLSchema#decimal","@value":"1","termType":"Literal"}}`,
    );
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

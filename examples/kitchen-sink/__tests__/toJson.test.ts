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
      expect(jsonObject.optionalNodeOrNodeOrString).toStrictEqual({
        type: "UnionMember1",
        value: {
          "@type": "UnionMember1",
          "@id": "http://example.com/unionMember1a",
          unionMember1Distinct: "test",
          unionMemberCommon: "test",
        },
      });
      expect(jsonObject.optionalIriOrLiteral).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.optionalIriOrString).toStrictEqual({
        "@id": "http://example.com",
      });
      expect(jsonObject.requiredNodeOrNodeOrString).toStrictEqual({
        type: "UnionMember1",
        value: {
          "@type": "UnionMember1",
          "@id": "http://example.com/unionMember1b",
          unionMember1Distinct: "test",
          unionMemberCommon: "test",
        },
      });
      expect(jsonObject.requiredIriOrLiteral).toStrictEqual({
        "@id": "http://example.com",
        termType: "NamedNode",
      });
      expect(jsonObject.requiredIriOrString).toStrictEqual({
        "@id": "http://example.com",
      });
      expect(jsonObject.setNodeOrNodeOrString).toHaveLength(0);
      expect(jsonObject.setIriOrLiteral).toHaveLength(0);
      expect(jsonObject.setIriOrString).toHaveLength(0);
    }

    {
      const jsonObject = kitchenSink.UnionDiscriminantsStruct.toJson(
        harnesses.unionDiscriminantsStruct2.instance,
      );
      expect(jsonObject["@id"]).toStrictEqual("http://example.com/instance");
      expect(jsonObject.optionalNodeOrNodeOrString).toStrictEqual({
        type: "UnionMember2",
        value: {
          "@type": "UnionMember2",
          "@id": "http://example.com/unionMember2a",
          unionMember2Distinct: "test",
          unionMemberCommon: "test",
        },
      });
      expect(jsonObject.optionalIriOrLiteral).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.optionalIriOrString).toStrictEqual("test");
      expect(jsonObject.requiredNodeOrNodeOrString).toStrictEqual({
        type: "string",
        value: "test",
      });
      expect(jsonObject.requiredIriOrLiteral).toStrictEqual({
        termType: "Literal",
        "@value": "test",
      });
      expect(jsonObject.requiredIriOrString).toStrictEqual("test");
      expect(jsonObject.setNodeOrNodeOrString).toStrictEqual([
        {
          type: "string",
          value: "test",
        },
        {
          type: "UnionMember2",
          value: {
            "@type": "UnionMember2",
            "@id": "http://example.com/unionMember2b",
            unionMember2Distinct: "test",
            unionMemberCommon: "test",
          },
        },
        {
          type: "UnionMember1",
          value: {
            "@type": "UnionMember1",
            "@id": "http://example.com/unionMember1b",
            unionMember1Distinct: "test",
            unionMemberCommon: "test",
          },
        },
      ]);
      expect(jsonObject.setIriOrLiteral).toStrictEqual([
        {
          "@value": "test",
          termType: "Literal",
        },
        {
          "@id": "http://example.com",
          termType: "NamedNode",
        },
      ]);
      expect(jsonObject.setIriOrString).toStrictEqual([
        "test",
        {
          "@id": "http://example.com",
        },
      ]);
    }
  });

  it("toJSON", ({ expect }) => {
    expect(JSON.stringify(harnesses.termsStruct.instance)).toStrictEqual(
      `{"@id":"http://example.com/instance","@type":"TermsStruct","blankNodeTerm":{"@id":"_:df_0_16"},"booleanTerm":true,"dateTerm":"2025-03-06","dateTimeTerm":"2018-04-09T10:00:00.000Z","iriTerm":{"@id":"http://example.com"},"literalTerm":{"@value":"test"},"numberTerm":1,"stringTerm":"test","term":{"@type":"http://www.w3.org/2001/XMLSchema#decimal","@value":"1","termType":"Literal"}}`,
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

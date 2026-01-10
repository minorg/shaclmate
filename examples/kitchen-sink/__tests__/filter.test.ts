import {
  PropertyCardinalitiesClass,
  TermPropertiesClass,
} from "@shaclmate/kitchen-sink-example";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { DataFactory } from "n3";
import { NonEmptyList } from "purify-ts";
import { describe, it } from "vitest";

describe("filter", () => {
  describe("boolean", () => {
    const instance = new TermPropertiesClass({ booleanTermProperty: true });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { booleanTermProperty: { item: { value: true } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { booleanTermProperty: { item: { value: false } } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("blank node", () => {
    const instance = new TermPropertiesClass({
      blankNodeTermProperty: DataFactory.blankNode(),
    });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { blankNodeTermProperty: { item: {} } },
          instance,
        ),
      ).toStrictEqual(true);
    });
  });

  describe("date", () => {
    const value = new Date(1523268000000);
    const instance = new TermPropertiesClass({ dateTermProperty: value });

    it("maxExclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              item: { maxExclusive: new Date(value.getTime() + 1) },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { item: { maxExclusive: value } } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("maxInclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { item: { maxInclusive: value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              item: { maxInclusive: new Date(value.getTime() - 1) },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minExclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              item: { minExclusive: new Date(value.getTime() - 1) },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { item: { minExclusive: value } } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minInclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { item: { minInclusive: value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              item: { minInclusive: new Date(value.getTime() + 1) },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { item: { value: value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              item: { value: new Date(value.getTime() + 1) },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("identifier", () => {
    const blankNodeInstance = new TermPropertiesClass({
      $identifier: DataFactory.blankNode(),
    });
    const iriInstance = new TermPropertiesClass({
      $identifier: DataFactory.namedNode("http://example.com"),
    });

    it("type", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { $identifier: { type: iriInstance.$identifier.termType } },
          iriInstance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { $identifier: { value: iriInstance.$identifier.termType } },
          blankNodeInstance,
        ),
      ).toStrictEqual(false);
    });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { $identifier: { value: iriInstance.$identifier.value } },
          iriInstance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { $identifier: { value: iriInstance.$identifier.value.concat("x") } },
          iriInstance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("literal (with datatype)", () => {
    const value = DataFactory.literal("test", xsd.string);
    const instance = new TermPropertiesClass({ literalTermProperty: value });

    it("datatype", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              item: { datatype: value.datatype.value },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              item: { datatype: value.datatype.value.concat("x") },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              item: { value: value.value },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { literalTermProperty: { item: { value: value.value.concat("x") } } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("literal (with language)", () => {
    const value = DataFactory.literal("test", "en");
    const instance = new TermPropertiesClass({ literalTermProperty: value });

    it("language", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              item: { language: value.language },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              item: { language: value.language.concat("x") },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              item: { value: value.value },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { literalTermProperty: { item: { value: value.value.concat("x") } } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("named node", () => {
    const value = "http://example.com";
    const instance = new TermPropertiesClass({
      iriTermProperty: DataFactory.namedNode(value),
    });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { iriTermProperty: { item: { value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { iriTermProperty: { item: { value: value.concat("x") } } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("number", () => {
    const value = 1;
    const instance = new TermPropertiesClass({ numberTermProperty: value });

    it("maxExclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { maxExclusive: value + 1 } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { maxExclusive: value } } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("maxInclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { maxInclusive: value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { maxInclusive: value - 1 } } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minExclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { minExclusive: value - 1 } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { minExclusive: value } } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minInclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { minInclusive: value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { minInclusive: value + 1 } } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: { value: value - 1 } } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("option", () => {
    const instance = new TermPropertiesClass({ booleanTermProperty: true });

    it("item", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { booleanTermProperty: { item: {} } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { item: {} } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("null", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { booleanTermProperty: { null: false } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { null: true } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { booleanTermProperty: { null: true } },
          instance,
        ),
      ).toStrictEqual(false);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { null: false } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("set", () => {
    const value = "test";
    const instance = new PropertyCardinalitiesClass({
      emptyStringSetProperty: [value],
      nonEmptyStringSetProperty: NonEmptyList([value]),
      requiredStringProperty: value,
    });

    it("maxCount", ({ expect }) => {
      expect(
        PropertyCardinalitiesClass.$filter(
          { emptyStringSetProperty: { maxCount: 1 } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        PropertyCardinalitiesClass.$filter(
          { emptyStringSetProperty: { maxCount: 0 } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minCount", ({ expect }) => {
      expect(
        PropertyCardinalitiesClass.$filter(
          { emptyStringSetProperty: { minCount: 0 } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        PropertyCardinalitiesClass.$filter(
          { emptyStringSetProperty: { minCount: 2 } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("items", ({ expect }) => {
      expect(
        PropertyCardinalitiesClass.$filter(
          { emptyStringSetProperty: { items: { value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        PropertyCardinalitiesClass.$filter(
          { emptyStringSetProperty: { items: { value: value.concat("x") } } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("string", () => {
    const value = "test";
    const instance = new TermPropertiesClass({ stringTermProperty: value });

    it("maxLength", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { item: { maxLength: value.length } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { item: { maxLength: value.length - 1 } } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minLength", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { item: { minLength: value.length } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { item: { minLength: value.length + 1 } } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { item: { value } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { item: { value: value.concat("x") } } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });
});

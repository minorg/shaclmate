import { TermPropertiesClass } from "@shaclmate/kitchen-sink-example";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { DataFactory } from "n3";
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

  describe("Date", () => {
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

  describe("Literal (with datatype)", () => {
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

  describe("Literal (with language)", () => {
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

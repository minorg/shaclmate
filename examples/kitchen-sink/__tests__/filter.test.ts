import {
  ClassUnion,
  type ClassUnionMember1,
  ConcreteChildClass,
  LazyPropertiesClass,
  PropertyCardinalitiesClass,
  TermPropertiesClass,
  UnionDiscriminantsClass,
} from "@shaclmate/kitchen-sink-example";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { DataFactory } from "n3";
import { NonEmptyList } from "purify-ts";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("filter", () => {
  describe("boolean", () => {
    const instance = new TermPropertiesClass({ booleanTermProperty: true });

    it("value", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { booleanTermProperty: { value: true } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { booleanTermProperty: { value: false } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("blank node", () => {
    const instance = new TermPropertiesClass({
      blankNodeTermProperty: DataFactory.blankNode(),
    });

    it("{}", ({ expect }) => {
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

    it("in", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              in: [value, new Date(value.getTime() + 1)],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              in: [new Date(value.getTime() + 1)],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("maxExclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              maxExclusive: new Date(value.getTime() + 1),
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { maxExclusive: value } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("maxInclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { maxInclusive: value } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              maxInclusive: new Date(value.getTime() - 1),
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
              minExclusive: new Date(value.getTime() - 1),
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { minExclusive: value } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minInclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { dateTermProperty: { minInclusive: value } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            dateTermProperty: {
              minInclusive: new Date(value.getTime() + 1),
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

    it("in", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          {
            $identifier: {
              in: [
                iriInstance.$identifier.value,
                blankNodeInstance.$identifier.value,
              ],
            },
          },
          iriInstance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { $identifier: { in: [iriInstance.$identifier.value.concat("x")] } },
          iriInstance,
        ),
      ).toStrictEqual(false);
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
          { $identifier: { type: iriInstance.$identifier.termType } },
          blankNodeInstance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("lazy", () => {
    const instance = harnesses.lazyPropertiesClassNonEmpty.instance;

    it("optional", ({ expect }) => {
      expect(
        LazyPropertiesClass.$filter(
          {
            optionalLazyToResolvedClassProperty: {},
          },
          instance,
        ),
      ).toStrictEqual(true);
    });

    it("required", ({ expect }) => {
      expect(
        LazyPropertiesClass.$filter(
          {
            requiredLazyToResolvedClassProperty: {
              $identifier: {
                in: [
                  instance.requiredLazyToResolvedClassProperty.partial
                    .$identifier.value,
                ],
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);
    });

    it("set", ({ expect }) => {
      expect(
        LazyPropertiesClass.$filter(
          {
            setLazyToResolvedClassProperty: {
              minCount: 1,
            },
          },
          instance,
        ),
      ).toStrictEqual(true);
    });
  });

  describe("literal", () => {
    it("datatypeIn", ({ expect }) => {
      const value = DataFactory.literal("test", xsd.string);
      const instance = new TermPropertiesClass({ literalTermProperty: value });
      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              datatypeIn: [
                value.datatype.value.concat("x"),
                value.datatype.value,
              ],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              datatypeIn: [value.datatype.value.concat("x")],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("in", ({ expect }) => {
      const value = DataFactory.literal("test", xsd.string);
      const instance = new TermPropertiesClass({ literalTermProperty: value });
      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              in: [
                {
                  datatype: xsd.string.value,
                  value: value.value,
                },
              ],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              in: [
                {
                  datatype: xsd.integer.value,
                  value: value.value,
                },
              ],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("languageIn", ({ expect }) => {
      const value = DataFactory.literal("test", "en");
      const instance = new TermPropertiesClass({ literalTermProperty: value });
      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              languageIn: [value.language.concat("x"), value.language],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            literalTermProperty: {
              languageIn: [value.language.concat("x")],
            },
          },
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

    it("in", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { iriTermProperty: { in: [value.concat("x"), value] } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { iriTermProperty: { in: [value.concat("x")] } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("number", () => {
    const value = 1;
    const instance = new TermPropertiesClass({ numberTermProperty: value });

    it("in", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { in: [value - 1, value] } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { in: [value - 1] } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("maxExclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { maxExclusive: value + 1 } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { maxExclusive: value } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("maxInclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { maxInclusive: value } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { maxInclusive: value - 1 } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minExclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { minExclusive: value - 1 } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { minExclusive: value } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minInclusive", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { minInclusive: value } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { numberTermProperty: { minInclusive: value + 1 } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("object", () => {
    const instance = harnesses.concreteChildClass.instance;

    it("identifier", ({ expect }) => {
      expect(
        ConcreteChildClass.$filter(
          {
            $identifier: {
              in: [instance.$identifier.value],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        ConcreteChildClass.$filter(
          {
            $identifier: {
              in: [instance.$identifier.value.concat("x")],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("property", ({ expect }) => {
      expect(
        ConcreteChildClass.$filter(
          {
            concreteChildClassProperty: {
              in: [instance.concreteChildClassProperty],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        ConcreteChildClass.$filter(
          {
            concreteChildClassProperty: {
              in: [instance.concreteChildClassProperty.concat("x")],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("parent class property", ({ expect }) => {
      expect(
        ConcreteChildClass.$filter(
          {
            concreteParentClassProperty: {
              in: [instance.concreteParentClassProperty],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        ConcreteChildClass.$filter(
          {
            concreteParentClassProperty: {
              in: [instance.concreteParentClassProperty.concat("x")],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("object union", () => {
    const instance = harnesses.classUnionMember1.instance as ClassUnionMember1;

    it("no member filters", ({ expect }) => {
      expect(ClassUnion.$filter({}, instance)).toStrictEqual(true);
    });

    it("member 1 filter", ({ expect }) => {
      expect(
        ClassUnion.$filter(
          {
            on: {
              ClassUnionMember1: {
                classUnionMember1Property: {
                  in: [instance.classUnionMember1Property],
                },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        ClassUnion.$filter(
          {
            on: {
              ClassUnionMember1: {
                classUnionMember1Property: {
                  in: [instance.classUnionMember1Property.concat("x")],
                },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("member 2 filter", ({ expect }) => {
      expect(
        ClassUnion.$filter(
          {
            on: {
              ClassUnionMember2: {
                classUnionMember2Property: {
                  in: ["could be anything"],
                },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);
    });

    it("both member filters", ({ expect }) => {
      expect(
        ClassUnion.$filter(
          {
            on: {
              // Only the member 1 filter will be tested
              ClassUnionMember1: {
                classUnionMember1Property: {
                  in: [instance.classUnionMember1Property],
                },
              },
              ClassUnionMember2: {
                classUnionMember2Property: {
                  in: ["could be anything"],
                },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);
    });
  });

  describe("option", () => {
    const instance = new TermPropertiesClass({ booleanTermProperty: true });

    it("item", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter({ booleanTermProperty: {} }, instance),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter({ numberTermProperty: {} }, instance),
      ).toStrictEqual(false);
    });

    it("null", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter({ booleanTermProperty: {} }, instance),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter({ numberTermProperty: null }, instance),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter({ booleanTermProperty: null }, instance),
      ).toStrictEqual(false);

      expect(
        TermPropertiesClass.$filter({ numberTermProperty: {} }, instance),
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
          { emptyStringSetProperty: { items: { in: [value] } } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        PropertyCardinalitiesClass.$filter(
          { emptyStringSetProperty: { items: { in: [value.concat("x")] } } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("string", () => {
    const value = "test";
    const instance = new TermPropertiesClass({ stringTermProperty: value });

    it("in", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { in: [value.concat("x"), value] } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { in: [value.concat("x")] } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("maxLength", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { maxLength: value.length } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { maxLength: value.length - 1 } },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("minLength", ({ expect }) => {
      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { minLength: value.length } },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          { stringTermProperty: { minLength: value.length + 1 } },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("term", () => {
    it("datatypeIn", ({ expect }) => {
      const value = DataFactory.literal("test", xsd.string);
      const instance = new TermPropertiesClass({ termProperty: value });

      expect(
        TermPropertiesClass.$filter(
          {
            termProperty: {
              datatypeIn: [
                value.datatype.value.concat("x"),
                value.datatype.value,
              ],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            termProperty: {
              datatypeIn: [value.datatype.value.concat("x")],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("in", ({ expect }) => {
      const value = DataFactory.literal("test", xsd.string);
      const instance = new TermPropertiesClass({ termProperty: value });
      expect(
        TermPropertiesClass.$filter(
          {
            termProperty: {
              in: [
                {
                  datatype: xsd.string.value,
                  type: "Literal",
                  value: value.value,
                },
              ],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            termProperty: {
              in: [
                {
                  datatype: xsd.integer.value,
                  type: "Literal",
                  value: value.value,
                },
              ],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("languageIn", ({ expect }) => {
      const value = DataFactory.literal("test", "en");
      const instance = new TermPropertiesClass({ termProperty: value });
      expect(
        TermPropertiesClass.$filter(
          {
            termProperty: {
              languageIn: [value.language.concat("x"), value.language],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            termProperty: {
              languageIn: [value.language.concat("x")],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("typeIn", ({ expect }) => {
      const value = DataFactory.literal("test");
      const instance = new TermPropertiesClass({ termProperty: value });
      expect(
        TermPropertiesClass.$filter(
          {
            termProperty: {
              typeIn: ["BlankNode", value.termType],
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        TermPropertiesClass.$filter(
          {
            termProperty: {
              typeIn: ["BlankNode"],
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });

  describe("union", () => {
    const instance = new UnionDiscriminantsClass({
      requiredClassOrClassOrStringProperty: {
        type: "2-string",
        value: "test",
      },
      requiredIriOrLiteralProperty: DataFactory.namedNode("http://example.com"),
      requiredIriOrStringProperty: "test",
    });

    it("no filters", ({ expect }) => {
      expect(UnionDiscriminantsClass.$filter({}, instance)).toStrictEqual(true);
    });

    it("envelope discriminant", ({ expect }) => {
      expect(
        UnionDiscriminantsClass.$filter(
          {
            requiredClassOrClassOrStringProperty: {
              on: {
                "0-ClassUnionMember1": {
                  classUnionMember1Property: { in: ["test"] },
                },
                "1-ClassUnionMember2": {
                  classUnionMember2Property: { in: ["test"] },
                },
                "2-string": { in: ["test"] },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        UnionDiscriminantsClass.$filter(
          {
            requiredClassOrClassOrStringProperty: {
              on: {
                "0-ClassUnionMember1": {
                  classUnionMember1Property: { in: ["test"] },
                },
                "1-ClassUnionMember2": {
                  classUnionMember2Property: { in: ["test"] },
                },
                "2-string": { in: ["testx"] },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("inline discriminant", ({ expect }) => {
      expect(
        UnionDiscriminantsClass.$filter(
          {
            requiredIriOrLiteralProperty: {
              on: {
                Literal: { in: [{ value: "test" }] },
                NamedNode: { in: ["http://example.com"] },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        UnionDiscriminantsClass.$filter(
          {
            requiredIriOrLiteralProperty: {
              on: {
                Literal: { in: [{ value: "test" }] },
                NamedNode: { in: ["http://example.comXXX"] },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });

    it("typeof discriminant", ({ expect }) => {
      expect(
        UnionDiscriminantsClass.$filter(
          {
            requiredIriOrStringProperty: {
              on: {
                object: { in: ["test"] },
                string: { in: ["test"] },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(true);

      expect(
        UnionDiscriminantsClass.$filter(
          {
            requiredIriOrStringProperty: {
              on: {
                object: { in: ["test"] },
                string: { in: ["testx"] },
              },
            },
          },
          instance,
        ),
      ).toStrictEqual(false);
    });
  });
});

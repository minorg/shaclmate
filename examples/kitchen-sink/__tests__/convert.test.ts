import dataFactory from "@rdfx/data-factory";
import { schema, xsd } from "@tpluscode/rdf-ns-builders";
import { Decimal } from "decimal.js";
import { Maybe } from "purify-ts";
import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";

describe("convert", () => {
  describe("to array", () => {
    it("from array", ({ expect }) => {
      const instance = kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
        emptySet: ["test"],
        nonEmptySet: ["test"],
        required: "test",
      });
      expect(instance.emptySet).toEqual(["test"]);
      expect(instance.nonEmptySet).toEqual(["test"]);
    });

    it("from undefined", ({ expect }) => {
      const instance = kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
        nonEmptySet: ["test"],
        required: "test",
      });
      expect(instance.emptySet).toHaveLength(0);
    });

    it("from scalar", ({ expect }) => {
      const instance = kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
        emptySet: "test",
        nonEmptySet: "test",
        required: "test",
      });
      expect(instance.emptySet).toEqual(["test"]);
      expect(instance.nonEmptySet).toEqual(["test"]);
    });
  });

  describe("to Decimal", () => {
    const expectedValue = new Decimal("23.1");
    for (const value of [23.1, "23.1", expectedValue]) {
      it(`from ${typeof value}`, ({ expect }) => {
        expect(
          kitchenSink.NumericsStruct.createUnsafe({
            decimalNumeric: value,
          })
            .decimalNumeric.extract()
            ?.equals(expectedValue),
        ).toStrictEqual(true);
      });
    }
  });

  describe("to bigint", () => {
    for (const value of [23, "23", 23n]) {
      it(`from ${typeof value}`, ({ expect }) => {
        expect(
          kitchenSink.NumericsStruct.createUnsafe({
            integerNumeric: value,
          }).integerNumeric.extract(),
        ).toStrictEqual(23n);
      });
    }
  });

  describe("to BlankNode", () => {
    it("from BlankNode", ({ expect }) => {
      expect(
        kitchenSink.TermsStruct.createUnsafe({
          blankNodeTerm: dataFactory.blankNode(),
        }).blankNodeTerm.extract()?.termType,
      ).toStrictEqual("BlankNode");
    });

    it("from undefined", ({ expect }) => {
      expect(
        kitchenSink.NodeKindsStruct.createUnsafe({
          blankNodeKind: undefined,
          blankNodeOrLiteralNodeKind: dataFactory.blankNode(),
          iriNodeKind: dataFactory.namedNode(
            "http://example.com/iriNodeKindPropertyValue",
          ),
          iriOrLiteralNodeKind: dataFactory.namedNode(
            "http://example.com/iriOrLiteralNodeKindPropertyValue",
          ),
          literalNodeKind: dataFactory.literal("literalNodeKindValue"),
        }).blankNodeKind.termType,
      ).toStrictEqual("BlankNode");
    });
  });

  describe("to IRI", () => {
    const expected = dataFactory.namedNode("http://example.com");

    for (const value of [expected.value, expected]) {
      it(`from ${typeof value}`, ({ expect }) => {
        expect(
          kitchenSink.TermsStruct.createUnsafe({
            iriTerm: value,
          }).iriTerm.extract(),
        ).toEqualRdfTerm(expected);
      });
    }
  });

  describe("to Literal", () => {
    const expected = dataFactory.literal("test");
    for (const value of [expected.value, expected]) {
      it(`from ${typeof value === "object" ? "Literal" : typeof value}`, ({
        expect,
      }) => {
        expect(
          kitchenSink.TermsStruct.createUnsafe({
            literalTerm: value,
          }).literalTerm.extract(),
        ).toEqualRdfTerm(expected);
      });
    }

    it("from bigint", ({ expect }) => {
      expect(
        kitchenSink.TermsStruct.createUnsafe({
          literalTerm: 2n,
        }).literalTerm.extract(),
      ).toEqualRdfTerm(dataFactory.literal("2", xsd.integer));
    });

    it("from boolean", ({ expect }) => {
      expect(
        kitchenSink.TermsStruct.createUnsafe({
          literalTerm: true,
        }).literalTerm.extract(),
      ).toEqualRdfTerm(dataFactory.literal("true", xsd.boolean));
    });

    it("from Date", ({ expect }) => {
      const expected = new Date();
      expect(
        kitchenSink.TermsStruct.createUnsafe({
          literalTerm: expected,
        }).literalTerm.extract(),
      ).toEqualRdfTerm(
        dataFactory.literal(expected.toISOString(), xsd.dateTime),
      );
    });

    it("from number", ({ expect }) => {
      expect(
        kitchenSink.TermsStruct.createUnsafe({
          literalTerm: 1.1,
        }).literalTerm.extract(),
      ).toEqualRdfTerm(dataFactory.literal("1.1e0", xsd.double));
    });
  });

  describe("to Maybe", () => {
    it("from Maybe", ({ expect }) => {
      const instance = kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
        nonEmptySet: ["test"],
        optional: Maybe.of("test"),
        required: "test",
      });
      expect(instance.optional.extract()).toStrictEqual("test");
    });

    it("from scalar", ({ expect }) => {
      const instance = kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
        nonEmptySet: ["test"],
        optional: "test",
        required: "test",
      });
      expect(instance.optional.extract()).toStrictEqual("test");
    });

    it("from undefined", ({ expect }) => {
      const instance = kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
        nonEmptySet: ["test"],
        required: "test",
      });
      expect(instance.optional.isNothing()).toStrictEqual(true);
    });
  });

  describe("default namespace", () => {
    describe("BlankNodeOrIRI $identifier property", () => {
      it("default namespace unspecified", ({ expect }) => {
        const instance = kitchenSink.TermsStruct.createUnsafe({
          $identifier: "http://example.com/preserve",
        });
        expect(instance.$identifier()).toEqualRdfTerm(
          dataFactory.namedNode("http://example.com/preserve"),
        );
      });

      it("default namespace specified", ({ expect }) => {
        const instance = kitchenSink.TermsStruct.createUnsafe({
          $defaultNamespace: schema,
          $identifier: "Person",
        });
        expect(instance.$identifier()).toEqualRdfTerm(schema.Person);
      });
    });

    describe("IRI $identifier property", () => {
      describe("with sh:in", () => {
        it("default namespace unspecified", ({ expect }) => {
          const instance = kitchenSink.InIdentifierStruct.createUnsafe({
            $identifier: "http://example.com/InIdentifierStructInstance1",
          });
          expect(instance.$identifier()).toEqualRdfTerm(
            dataFactory.namedNode(
              "http://example.com/InIdentifierStructInstance1",
            ),
          );
        });

        it("default namespace specified", ({ expect }) => {
          const instance = kitchenSink.InIdentifierStruct.createUnsafe({
            $defaultNamespace: schema,
            $identifier: "http://example.com/InIdentifierStructInstance1",
          });
          expect(instance.$identifier()).toEqualRdfTerm(
            dataFactory.namedNode(
              "http://example.com/InIdentifierStructInstance1",
            ),
          );
        });
      });

      describe("without sh:in", () => {
        it("default namespace unspecified", ({ expect }) => {
          const instance = kitchenSink.IriIdentifierStruct.createUnsafe({
            $identifier: "http://example.com/preserved",
          });
          expect(instance.$identifier()).toEqualRdfTerm(
            dataFactory.namedNode("http://example.com/preserved"),
          );
        });

        it("default namespace specified", ({ expect }) => {
          const instance = kitchenSink.IriIdentifierStruct.createUnsafe({
            $defaultNamespace: schema,
            $identifier: "Person",
          });
          expect(instance.$identifier()).toEqualRdfTerm(schema.Person);
        });
      });
    });

    describe("BlankNodeOrIRI property", () => {
      it("default namespace unspecified", ({ expect }) => {
        const instance = kitchenSink.TermsStruct.createUnsafe({
          identifierTerm: "http://example.com/preserve",
        });
        expect(instance.identifierTerm.extract()).toEqualRdfTerm(
          dataFactory.namedNode("http://example.com/preserve"),
        );
      });

      it("default namespace specified", ({ expect }) => {
        const instance = kitchenSink.TermsStruct.createUnsafe({
          $defaultNamespace: schema,
          identifierTerm: "about",
        });
        expect(instance.identifierTerm.extract()).toEqualRdfTerm(schema.about);
      });
    });

    describe("IRI property", () => {
      describe("with sh:in", () => {
        it("default namespace unspecified", ({ expect }) => {
          const instance = kitchenSink.InPropertiesStruct.createUnsafe({
            inIris: "http://example.com/InIri1",
          });
          expect(instance.inIris.extract()).toEqualRdfTerm(
            dataFactory.namedNode("http://example.com/InIri1"),
          );
        });

        it("default namespace specified", ({ expect }) => {
          const instance = kitchenSink.InPropertiesStruct.createUnsafe({
            $defaultNamespace: schema,
            inIris: "http://example.com/InIri1",
          });
          expect(instance.inIris.extract()).toEqualRdfTerm(
            dataFactory.namedNode("http://example.com/InIri1"),
          );
        });
      });

      describe("without sh:in", () => {
        it("default namespace unspecified", ({ expect }) => {
          const instance = kitchenSink.TermsStruct.createUnsafe({
            iriTerm: "http://example.com/preserved",
          });
          expect(instance.iriTerm.extract()).toEqualRdfTerm(
            dataFactory.namedNode("http://example.com/preserved"),
          );
        });

        it("default namespace specified", ({ expect }) => {
          const instance = kitchenSink.TermsStruct.createUnsafe({
            $defaultNamespace: schema,
            iriTerm: "about",
          });
          expect(instance.iriTerm.extract()).toEqualRdfTerm(schema.about);
        });
      });
    });
  });

  describe("lazy properties", () => {
    const expectedLazilyResolvedBlankNodeOrIriIdentifierInstance =
      kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
        $identifier: dataFactory.namedNode(
          "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInstance",
        ),
        lazilyResolved: "test",
      });

    const expectedLazilyResolvedDiscriminatedUnionInstance =
      kitchenSink.LazilyResolvedDiscriminatedUnionMember2.createUnsafe({
        $identifier: dataFactory.namedNode(
          "http://example.com/lazilyResolvedDiscriminatedUnionInstance",
        ),
        lazilyResolved: "test",
      });

    it("from undefined", async ({ expect }) => {
      const instance = kitchenSink.LazyPropertiesStruct.createUnsafe({
        requiredLazyToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        requiredPartialToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
      });

      expect(
        instance.optionalLazyToResolvedBlankNodeOrIriIdentifier.partial.isNothing(),
      ).toStrictEqual(true);
      expect(
        (
          await instance.optionalLazyToResolvedBlankNodeOrIriIdentifier.resolve()
        )
          .unsafeCoerce()
          .isNothing(),
      ).toStrictEqual(true);

      expect(
        instance.setLazyToResolvedBlankNodeOrIriIdentifier.partials,
      ).toHaveLength(0);
      expect(
        (
          await instance.setLazyToResolvedBlankNodeOrIriIdentifier.resolve()
        ).unsafeCoerce(),
      ).toHaveLength(0);
    });

    it("from Maybe", async ({ expect }) => {
      const instance = kitchenSink.LazyPropertiesStruct.createUnsafe({
        optionalLazyToResolvedBlankNodeOrIriIdentifier: Maybe.empty(),
        requiredLazyToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        requiredPartialToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
      });

      expect(
        instance.optionalLazyToResolvedBlankNodeOrIriIdentifier.partial.isNothing(),
      ).toStrictEqual(true);
      expect(
        (
          await instance.optionalLazyToResolvedBlankNodeOrIriIdentifier.resolve()
        )
          .unsafeCoerce()
          .isNothing(),
      ).toStrictEqual(true);
    });

    it("from []", async ({ expect }) => {
      const instance = kitchenSink.LazyPropertiesStruct.createUnsafe({
        setLazyToResolvedBlankNodeOrIriIdentifier: [],
        requiredLazyToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        requiredPartialToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
      });

      expect(
        instance.setLazyToResolvedBlankNodeOrIriIdentifier.partials,
      ).toHaveLength(0);
      expect(
        (
          await instance.setLazyToResolvedBlankNodeOrIriIdentifier.resolve()
        ).unsafeCoerce(),
      ).toHaveLength(0);
    });

    it("from partial type instance", async ({ expect }) => {
      const instance = kitchenSink.LazyPropertiesStruct.createUnsafe({
        optionalLazyToResolvedBlankNodeOrIriIdentifier:
          kitchenSink.$DefaultPartial.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        optionalPartialToResolvedBlankNodeOrIriIdentifier:
          kitchenSink.PartialStruct.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        requiredLazyToResolvedBlankNodeOrIriIdentifier:
          kitchenSink.$DefaultPartial.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        requiredPartialToResolvedBlankNodeOrIriIdentifier:
          kitchenSink.PartialStruct.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        setLazyToResolvedBlankNodeOrIriIdentifier:
          kitchenSink.$DefaultPartial.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        setPartialToResolvedBlankNodeOrIriIdentifier:
          kitchenSink.PartialStruct.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
      });

      expect(
        kitchenSink.$DefaultPartial
          .equals(
            instance.optionalLazyToResolvedBlankNodeOrIriIdentifier.partial.unsafeCoerce(),
            kitchenSink.$DefaultPartial.createUnsafe(
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            ),
          )
          .extract(),
      ).toStrictEqual(true);
      expect(
        (
          await instance.optionalLazyToResolvedBlankNodeOrIriIdentifier.resolve()
        ).extract(),
      ).toBeInstanceOf(Error);

      expect(
        kitchenSink.PartialStruct.equals(
          instance.optionalPartialToResolvedBlankNodeOrIriIdentifier.partial.unsafeCoerce(),
          kitchenSink.PartialStruct.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        ).extract(),
      ).toStrictEqual(true);
      expect(
        (
          await instance.optionalPartialToResolvedBlankNodeOrIriIdentifier.resolve()
        ).extract(),
      ).toBeInstanceOf(Error);

      expect(
        kitchenSink.$DefaultPartial
          .equals(
            instance.requiredLazyToResolvedBlankNodeOrIriIdentifier.partial,
            kitchenSink.$DefaultPartial.createUnsafe(
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            ),
          )
          .extract(),
      ).toStrictEqual(true);
      expect(
        (
          await instance.requiredLazyToResolvedBlankNodeOrIriIdentifier.resolve()
        ).extract(),
      ).toBeInstanceOf(Error);

      expect(
        kitchenSink.PartialStruct.equals(
          instance.requiredPartialToResolvedBlankNodeOrIriIdentifier.partial,
          kitchenSink.PartialStruct.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        ).extract(),
      ).toStrictEqual(true);
      expect(
        (
          await instance.requiredPartialToResolvedBlankNodeOrIriIdentifier.resolve()
        ).extract(),
      ).toBeInstanceOf(Error);

      expect(
        instance.setLazyToResolvedBlankNodeOrIriIdentifier.partials,
      ).toHaveLength(1);
      expect(
        kitchenSink.$DefaultPartial
          .equals(
            instance.setLazyToResolvedBlankNodeOrIriIdentifier.partials[0],
            kitchenSink.$DefaultPartial.createUnsafe(
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            ),
          )
          .extract(),
      ).toStrictEqual(true);
      expect(
        (
          await instance.setLazyToResolvedBlankNodeOrIriIdentifier.resolve()
        ).extract(),
      ).toBeInstanceOf(Error);

      expect(
        instance.setPartialToResolvedBlankNodeOrIriIdentifier.partials,
      ).toHaveLength(1);
      expect(
        kitchenSink.PartialStruct.equals(
          instance.setPartialToResolvedBlankNodeOrIriIdentifier.partials[0],
          kitchenSink.PartialStruct.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        ).extract(),
      ).toStrictEqual(true);
      expect(
        (
          await instance.setPartialToResolvedBlankNodeOrIriIdentifier.resolve()
        ).extract(),
      ).toBeInstanceOf(Error);
    });

    it("from resolved type instance", async ({ expect }) => {
      const instance = kitchenSink.LazyPropertiesStruct.createUnsafe({
        optionalLazyToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        optionalPartialToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        optionalLazyToResolvedDiscriminatedUnion:
          expectedLazilyResolvedDiscriminatedUnionInstance,
        optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnion:
          expectedLazilyResolvedDiscriminatedUnionInstance,
        requiredLazyToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        requiredPartialToResolvedBlankNodeOrIriIdentifier:
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
      });

      expect(
        kitchenSink.$DefaultPartial
          .equals(
            instance.optionalLazyToResolvedBlankNodeOrIriIdentifier.partial.unsafeCoerce(),
            kitchenSink.$DefaultPartial.createUnsafe(
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            ),
          )
          .extract(),
      ).toStrictEqual(true);
      expect(
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.equals(
          (
            await instance.optionalLazyToResolvedBlankNodeOrIriIdentifier.resolve()
          )
            .unsafeCoerce()
            .unsafeCoerce(),
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        ).extract(),
      ).toStrictEqual(true);

      expect(
        kitchenSink.PartialStruct.equals(
          instance.optionalPartialToResolvedBlankNodeOrIriIdentifier.partial.unsafeCoerce(),
          kitchenSink.PartialStruct.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        ).extract(),
      ).toStrictEqual(true);
      expect(
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.equals(
          (
            await instance.optionalPartialToResolvedBlankNodeOrIriIdentifier.resolve()
          )
            .unsafeCoerce()
            .unsafeCoerce(),
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        ).extract(),
      ).toStrictEqual(true);

      expect(
        kitchenSink.$DefaultPartial
          .equals(
            instance.optionalLazyToResolvedDiscriminatedUnion.partial.unsafeCoerce(),
            kitchenSink.$DefaultPartial.createUnsafe(
              expectedLazilyResolvedDiscriminatedUnionInstance,
            ),
          )
          .extract(),
      ).toStrictEqual(true);
      expect(
        kitchenSink.LazilyResolvedDiscriminatedUnion.equals(
          (await instance.optionalLazyToResolvedDiscriminatedUnion.resolve())
            .unsafeCoerce()
            .unsafeCoerce(),
          expectedLazilyResolvedDiscriminatedUnionInstance,
        ).extract(),
      ).toStrictEqual(true);

      expect(
        kitchenSink.PartialDiscriminatedUnion.equals(
          instance.optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnion.partial.unsafeCoerce(),
          kitchenSink.PartialDiscriminatedUnionMember2.createUnsafe(
            expectedLazilyResolvedDiscriminatedUnionInstance,
          ),
        ).extract(),
      ).toStrictEqual(true);
      expect(
        kitchenSink.LazilyResolvedDiscriminatedUnion.equals(
          (
            await instance.optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnion.resolve()
          )
            .unsafeCoerce()
            .unsafeCoerce(),
          expectedLazilyResolvedDiscriminatedUnionInstance,
        ).extract(),
      ).toStrictEqual(true);

      expect(
        kitchenSink.$DefaultPartial
          .equals(
            instance.requiredLazyToResolvedBlankNodeOrIriIdentifier.partial,
            kitchenSink.$DefaultPartial.createUnsafe(
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            ),
          )
          .extract(),
      ).toStrictEqual(true);
      expect(
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.equals(
          (
            await instance.requiredLazyToResolvedBlankNodeOrIriIdentifier.resolve()
          ).unsafeCoerce(),
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        ).extract(),
      ).toStrictEqual(true);

      expect(
        kitchenSink.PartialStruct.equals(
          instance.requiredPartialToResolvedBlankNodeOrIriIdentifier.partial,
          kitchenSink.PartialStruct.createUnsafe(
            expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          ),
        ).extract(),
      ).toStrictEqual(true);
      expect(
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.equals(
          (
            await instance.requiredPartialToResolvedBlankNodeOrIriIdentifier.resolve()
          ).unsafeCoerce(),
          expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
        ).extract(),
      ).toStrictEqual(true);
    });
  });
});

import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";
import "@rdfx/testing";
import dataFactory from "@rdfx/data-factory";
import { schema } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";

describe("constructor", () => {
  describe("conversions", () => {
    it("undefined to []/Nothing", ({ expect }) => {
      const instance = harnesses.propertyCardinalitiesStruct1.instance;
      expect(instance.emptySet).toHaveLength(0);
      expect(instance.nonEmptySet).toStrictEqual(["test"]);
      expect(instance.optional.isNothing()).toStrictEqual(true);
      expect(instance.required).toStrictEqual("test");
    });

    it("Arrays and Maybes", ({ expect }) => {
      const instance = harnesses.propertyCardinalitiesStruct2.instance;
      expect(instance.emptySet).toEqual([]);
      expect(instance.nonEmptySet).toEqual(["test"]);
      expect(instance.optional.extract()).toStrictEqual("test");
      expect(instance.required).toStrictEqual("test");
    });

    it("scalar to container", ({ expect }) => {
      const instance = harnesses.propertyCardinalitiesStruct3.instance;
      expect(instance.emptySet).toEqual(["test"]);
      expect(instance.nonEmptySet).toEqual(["test"]);
      expect(instance.optional.extract()).toStrictEqual("test");
      expect(instance.required).toStrictEqual("test");
    });

    describe.only("default namespace", () => {
      describe("identifier property", () => {
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
          expect(instance.identifierTerm.extract()).toEqualRdfTerm(
            schema.about,
          );
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

  it("default values", ({ expect }) => {
    const model = harnesses.defaultValuesStruct.instance;
    expect(model.falseBooleanDefaultValue).toStrictEqual(false);
    expect(model.dateTimeDefaultValue.getTime()).toStrictEqual(1523268000000);
    expect(model.numberDefaultValue).toStrictEqual(0);
    expect(model.stringDefaultValue).toStrictEqual("");
    expect(model.trueBooleanDefaultValue).toStrictEqual(true);
  });
});

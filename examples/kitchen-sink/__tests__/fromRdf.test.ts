import type { Literal } from "@rdfjs/types";
import { datasetFactory } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { Resource, ResourceSet } from "@rdfx/resource";
import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { beforeAll, describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";
import "@rdfx/testing";
import type { Maybe } from "purify-ts";

describe("fromRdf", () => {
  for (const [idString, harness] of Object.entries(harnesses)) {
    const id = idString as keyof typeof harnesses;
    if (id === "listSetsStruct") {
      // fromRdf won't preserve order on listDiscriminatedUnionSet, so the equals fails.
      continue;
    }

    it(`${id} round trip`, ({ expect }) => {
      const fromRdfInstance = harness.staticSide
        .fromRdfResource(
          harness.staticSide.toRdfResource(harness.instance as any),
          {
            context: {
              extra: 1,
            },
          },
        )
        .unsafeCoerce() as any;
      const equalsResult = harness.staticSide.equals(
        harness.instance as any,
        fromRdfInstance,
      );
      // if (!equalsResult.isRight()) {
      //   console.log("test");
      // }
      expect(equalsResult.extract()).toStrictEqual(true);
    });
  }

  describe("rdf:List", () => {
    it("reject malformed list", ({ expect }) => {
      const resourceSet = new ResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
      const instanceResource = resourceSet.resource(dataFactory.blankNode());
      instanceResource.add(
        kitchenSink.ListsStruct.schema.properties.stringList.path,
        dataFactory.blankNode(),
      );
      const result = kitchenSink.ListsStruct.fromRdfResource(instanceResource);
      expect(result).toBeLeft();
      // expect(result.extract()).toBeInstanceOf(Resource.ListStructureError);
    });

    it("reject mistyped list", ({ expect }) => {
      const resourceSet = new ResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      });
      const instanceResource = resourceSet.resource(dataFactory.blankNode());
      const listResource = resourceSet.resource(dataFactory.blankNode());
      instanceResource.add(
        kitchenSink.ListsStruct.schema.properties.stringList.path,
        listResource.identifier,
      );
      listResource.add(rdf.first, dataFactory.blankNode());
      listResource.add(rdf.rest, rdf.nil);
      const result = kitchenSink.ListsStruct.fromRdfResource(instanceResource);
      expect(result).toBeLeft();
    });
  });

  describe("rdf:type", () => {
    it("explicit fromRdfType ignore default rdf:type", ({ expect }) => {
      const resource = new ResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      }).resource(dataFactory.blankNode());
      resource.add(
        rdf.type,
        dataFactory.namedNode("http://example.com/ExplicitFromToRdfTypes"),
      );
      resource.add(
        kitchenSink.ExplicitFromToRdfTypesStruct.schema.properties
          .explicitFromToRdfTypesString.path,
        dataFactory.literal("test"),
      );

      const fromRdfInstance =
        kitchenSink.ExplicitFromToRdfTypesStruct.fromRdfResource(resource);
      expect(fromRdfInstance).toBeLeft();
    });

    it("explicit fromRdfType accept non-default rdf:type", ({ expect }) => {
      const resource = new ResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      }).resource(dataFactory.blankNode());
      resource.add(
        rdf.type,
        dataFactory.namedNode("http://example.com/FromRdfType"),
      );
      resource.add(
        kitchenSink.ExplicitFromToRdfTypesStruct.schema.properties
          .explicitFromToRdfTypesString.path,
        dataFactory.literal("test"),
      );

      const fromRdfInstance =
        kitchenSink.ExplicitFromToRdfTypesStruct.fromRdfResource(resource);
      expect(fromRdfInstance.isRight()).toBe(true);
    });

    it("ignore extraneous RDF type", ({ expect }) => {
      const expectedInstance = harnesses.explicitRdfTypeStruct.instance;
      const actualResource =
        harnesses.explicitRdfTypeStruct.staticSide.toRdfResource(
          expectedInstance,
        );
      expect(
        kitchenSink.ExplicitFromToRdfTypesStruct.schema.properties.$rdfType
          .fromRdfType.value,
      ).not.toStrictEqual("http://example.com/ExtraneousRdfType");
      const actualRdfTypeQuads = [
        ...actualResource.dataset.match(actualResource.identifier, rdf.type),
      ];
      expect(actualRdfTypeQuads).toHaveLength(1);
      const extraneousRdfType = dataFactory.namedNode(
        "http://example.com/ExtraneousRdfType",
      );
      expect(
        actualRdfTypeQuads[0].object.equals(extraneousRdfType),
      ).toStrictEqual(false);
      expect(
        kitchenSink.ExplicitRdfTypeStruct.equals(
          expectedInstance,
          kitchenSink.ExplicitRdfTypeStruct.fromRdfResource(
            actualResource,
          ).unsafeCoerce(),
        ).isRight(),
      ).toStrictEqual(true);
      actualResource.dataset.add(
        dataFactory.quad(
          actualResource.identifier,
          rdf.type,
          extraneousRdfType,
        ),
      );
      expect([
        ...actualResource.dataset.match(actualResource.identifier, rdf.type),
      ]).toHaveLength(2);
      expect(
        kitchenSink.ExplicitRdfTypeStruct.equals(
          expectedInstance,
          kitchenSink.ExplicitRdfTypeStruct.fromRdfResource(
            actualResource,
          ).unsafeCoerce(),
        ).isRight(),
      ).toStrictEqual(true);
    });

    it("accept unknown sub-class type", ({ expect }) => {
      const instance = kitchenSink.ExplicitRdfTypeStruct.createUnsafe({
        explicitRdfTypeString: "test",
      });
      const dataset = datasetFactory.dataset();
      for (const quad of kitchenSink.ExplicitRdfTypeStruct.toRdfResource(
        instance,
      ).dataset) {
        if (!quad.predicate.equals(rdf.type)) {
          dataset.add(quad);
        }
      }
      const instanceResource = new ResourceSet({
        dataFactory,
        dataset,
      }).resource(instance.$identifier());
      // Deserialization shouldn't work since there's no rdf:type statement
      expect(
        kitchenSink.ExplicitRdfTypeStruct.fromRdfResource(instanceResource),
      ).toBeLeft();
      // Add rdf:type <subclass> statement
      dataset.add(
        dataFactory.quad(
          instance.$identifier(),
          rdf.type,
          dataFactory.namedNode("http://example.com/newSubType"),
        ),
      );
      // And a corresponding rdfs:subClassOf statement so the instance-of check works
      dataset.add(
        dataFactory.quad(
          dataFactory.namedNode("http://example.com/newSubType"),
          rdfs.subClassOf,
          kitchenSink.ExplicitRdfTypeStruct.schema.properties.$rdfType
            .fromRdfType,
        ),
      );

      expect(
        kitchenSink.ExplicitRdfTypeStruct.equals(
          instance,
          kitchenSink.ExplicitRdfTypeStruct.fromRdfResource(
            instanceResource,
          ).unsafeCoerce(),
        ).unsafeCoerce(),
      ).toStrictEqual(true);
    });
  });

  describe("sh:hasValue", () => {
    it("reject invalid values", ({ expect }) => {
      const dataset = datasetFactory.dataset();
      const identifier = dataFactory.blankNode();
      dataset.add(
        dataFactory.quad(
          identifier,
          kitchenSink.HasValuesStruct.schema.properties.hasIriValue.path,
          dataFactory.namedNode(
            "http://example.com/HasValuePropertiesClassIri1",
          ),
        ),
      );
      dataset.add(
        dataFactory.quad(
          identifier,
          kitchenSink.HasValuesStruct.schema.properties.hasLiteralValue.path,
          dataFactory.literal("nottest"),
        ),
      );
      expect(
        kitchenSink.HasValuesStruct.fromRdfResource(
          new ResourceSet({ dataFactory, dataset }).resource(identifier),
        ),
      ).toBeLeft();
      // expect(instance.hasLiteralValueProperty.isNothing()).toStrictEqual(true);
    });
  });

  describe("sh:in", () => {
    it("reject invalid identifier values", ({ expect }) => {
      const dataset = datasetFactory.dataset();
      const identifier = dataFactory.namedNode(
        "http://example.com/InvalidIdentifier",
      );
      dataset.add(
        dataFactory.quad(
          identifier,
          kitchenSink.InIdentifierStruct.schema.properties.inIdentifierString
            .path,
          dataFactory.literal("whatever"),
        ),
      );
      const instance = kitchenSink.InIdentifierStruct.fromRdfResource(
        new ResourceSet({ dataFactory, dataset }).resource(identifier),
      ).extract();
      expect(instance).toBeInstanceOf(Error);
    });

    it("reject invalid IRI property values", ({ expect }) => {
      const dataset = datasetFactory.dataset();
      const identifier = dataFactory.blankNode();
      dataset.add(
        dataFactory.quad(
          identifier,
          kitchenSink.InPropertiesStruct.schema.properties.inIris.path,
          dataFactory.namedNode(
            "http://example.com/WithInPropertiesIriInvalid",
          ),
        ),
      );
      const result = kitchenSink.InPropertiesStruct.fromRdfResource(
        new ResourceSet({ dataFactory, dataset }).resource(identifier),
      );
      expect(result).toBeLeft();
      // expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
    });

    it("reject invalid literal property values", ({ expect }) => {
      const dataset = datasetFactory.dataset();
      const identifier = dataFactory.blankNode();
      const object = dataFactory.literal("somethingelse");
      dataset.add(
        dataFactory.quad(
          identifier,
          rdf.type,
          kitchenSink.InPropertiesStruct.schema.properties.$rdfType.fromRdfType,
        ),
      );
      dataset.add(
        dataFactory.quad(
          identifier,
          kitchenSink.InPropertiesStruct.schema.properties.inStrings.path,
          object,
        ),
      );
      const result = kitchenSink.InPropertiesStruct.fromRdfResource(
        new ResourceSet({ dataFactory, dataset }).resource(identifier),
      );
      expect(result).toBeLeft();
      expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
    });

    it("accept right identifier type (sh:in identifier)", ({ expect }) => {
      expect(
        kitchenSink.InIdentifierStruct.fromRdfResource(
          new ResourceSet({ dataFactory, dataset: datasetFactory.dataset() })
            .resource(
              dataFactory.namedNode(
                "http://example.com/InIdentifierStructInstance1",
              ),
            )
            .add(
              rdf.type,
              kitchenSink.InIdentifierStruct.schema.properties.$rdfType
                .fromRdfType,
            ),
        ).isRight(),
      ).toBe(true);
    });

    it("reject wrong identifier type (BlankNode)", ({ expect }) => {
      expect(
        kitchenSink.IriIdentifierStruct.fromRdfResource(
          new ResourceSet({ dataFactory, dataset: datasetFactory.dataset() })
            .resource(dataFactory.blankNode())
            .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
        ),
      ).toBeLeft();
    });

    it("reject wrong identifier type (wrong IRI)", ({ expect }) => {
      expect(
        kitchenSink.InIdentifierStruct.fromRdfResource(
          new ResourceSet({ dataFactory, dataset: datasetFactory.dataset() })
            .resource(
              dataFactory.namedNode("http://example.com/InIdentifierInstance3"),
            )
            .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
        ),
      ).toBeLeft();
    });

    it("accept right identifier type (NamedNode)", ({ expect }) => {
      expect(
        kitchenSink.IriIdentifierStruct.fromRdfResource(
          new ResourceSet({ dataFactory, dataset: datasetFactory.dataset() })
            .resource(dataFactory.namedNode("http://example.com/identifier"))
            .add(
              rdf.type,
              kitchenSink.IriIdentifierStruct.schema.properties.$rdfType
                .fromRdfType,
            ),
        ).isRight(),
      ).toBe(true);
    });
  });

  describe("languageIn", () => {
    let invalidLanguageInResource: Resource;
    let validLanguageInResource: Resource;
    const validLanguageInLanguage = ["en", "fr"];

    beforeAll(() => {
      const languageInDataset = datasetFactory.dataset();
      const languageInResourceSet = new ResourceSet({
        dataFactory,
        dataset: languageInDataset,
      });
      invalidLanguageInResource = languageInResourceSet.resource(
        dataFactory.blankNode(),
      );
      validLanguageInResource = languageInResourceSet.resource(
        dataFactory.blankNode(),
      );
      for (const language of ["", "ar", "en", "fr"]) {
        const literal =
          language.length > 0
            ? dataFactory.literal(`${language}value`, language)
            : dataFactory.literal("value");

        for (const property of Object.values(
          kitchenSink.LanguageInStruct.schema.properties,
        )) {
          if (property.kind !== "Shacl") {
            continue;
          }

          languageInDataset.add(
            dataFactory.quad(
              invalidLanguageInResource.identifier,
              property.path,
              literal,
            ),
          );

          switch (property.path.value) {
            case "http://example.com/languageIn":
              if (!validLanguageInLanguage.includes(language)) {
                continue;
              }
              break;
          }

          languageInDataset.add(
            dataFactory.quad(
              validLanguageInResource.identifier,
              property.path,
              literal,
            ),
          );
        }
      }
    });

    it("valid", ({ expect }) => {
      const instance = kitchenSink.LanguageInStruct.fromRdfResource(
        validLanguageInResource,
      ).unsafeCoerce();
      expect(instance.languageIn).toHaveLength(validLanguageInLanguage.length);
      for (const language of validLanguageInLanguage) {
        expect(
          instance.languageIn.some((literal) => literal.language === language),
        );
      }
    });

    it("invalid", ({ expect }) => {
      expect(
        kitchenSink.LanguageInStruct.fromRdfResource(invalidLanguageInResource),
      ).toBeLeft();
    });
  });

  describe("preferredLanguages", () => {
    const availableLanguages = ["", "ar", "en", "fr"];
    let resource: Resource;

    beforeAll(() => {
      if (availableLanguages.length === 0) {
        resource = kitchenSink.LangStringStruct.toRdfResource(
          kitchenSink.LangStringStruct.createUnsafe(),
        );
        return;
      }

      resource = new ResourceSet({
        dataFactory,
        dataset: datasetFactory.dataset(),
      }).resource(dataFactory.blankNode());
      for (const [propertyNameString, propertySchema] of Object.entries(
        kitchenSink.LangStringStruct.schema.properties,
      )) {
        const propertyName =
          propertyNameString as keyof typeof kitchenSink.LangStringStruct.schema.properties;
        switch (propertyName) {
          case "$identifier":
          case "$type":
            break;
          case "$rdfType":
            resource.add(
              rdf.type,
              kitchenSink.LangStringStruct.schema.properties.$rdfType
                .fromRdfType,
            );
            break;
          case "langString":
          case "langStringOrString":
          case "stringOrLangString":
            if (propertySchema.kind !== "Shacl") {
              throw new RangeError(propertySchema.kind);
            }
            for (const availableLanguage of availableLanguages) {
              if (availableLanguage.length === 0) {
                if (propertyName !== "langString") {
                  resource.add(
                    propertySchema.path,
                    dataFactory.literal("value"),
                  );
                }
              } else {
                resource.add(
                  propertySchema.path,
                  dataFactory.literal(
                    `${availableLanguage}value`,
                    availableLanguage,
                  ),
                );
              }
            }
            break;
          default:
            propertyName satisfies never;
            break;
        }
      }
    });

    function literalLanguage(literalMaybe: Maybe<Literal | string>): string {
      const literal = literalMaybe.extract();
      if (!literal) {
        return "undefined";
      }
      if (typeof literal === "string") {
        return "string";
      }
      if (!literal.datatype.equals(rdf.langString)) {
        return "string";
      }
      return literal.language;
    }

    it("[]/undefined", ({ expect }) => {
      // [] should act the same as undefined -- no filtering
      const instance = kitchenSink.LangStringStruct.fromRdfResource(resource, {
        preferredLanguages: [],
      }).unsafeCoerce();

      expect(availableLanguages).toContain(
        literalLanguage(instance.langString),
      );
      expect(availableLanguages).toContain(
        literalLanguage(instance.langStringOrString),
      );
      expect(literalLanguage(instance.stringOrLangString)).toStrictEqual(
        "string",
      );
    });

    it("['en']", ({ expect }) => {
      const instance = kitchenSink.LangStringStruct.fromRdfResource(resource, {
        preferredLanguages: ["en"],
      }).unsafeCoerce();
      expect(literalLanguage(instance.langString)).toStrictEqual("en");
      expect(literalLanguage(instance.langStringOrString)).toStrictEqual("en");
      expect(literalLanguage(instance.stringOrLangString)).toStrictEqual("en");
    });

    it("preferredLanguages: ['', 'en']", ({ expect }) => {
      const instance = kitchenSink.LangStringStruct.fromRdfResource(resource, {
        preferredLanguages: ["", "en"],
      }).unsafeCoerce();
      expect(literalLanguage(instance.langString)).toStrictEqual("en");
      expect(literalLanguage(instance.langStringOrString)).toStrictEqual("en");
      expect(literalLanguage(instance.stringOrLangString)).toStrictEqual(
        "string",
      );
    });

    it("preferredLanguages: ['en', '']", ({ expect }) => {
      const instance = kitchenSink.LangStringStruct.fromRdfResource(resource, {
        preferredLanguages: ["en", ""],
      }).unsafeCoerce();
      expect(literalLanguage(instance.langString)).toStrictEqual("en");
      expect(literalLanguage(instance.langStringOrString)).toStrictEqual("en");
      expect(literalLanguage(instance.stringOrLangString)).toStrictEqual(
        "string",
      );
    });

    it("preferredLanguages: ['fr', 'en']", ({ expect }) => {
      const instance = kitchenSink.LangStringStruct.fromRdfResource(resource, {
        preferredLanguages: ["fr", "en"],
      }).unsafeCoerce();
      expect(literalLanguage(instance.langString)).toStrictEqual("fr");
      expect(literalLanguage(instance.langStringOrString)).toStrictEqual("fr");
      expect(literalLanguage(instance.stringOrLangString)).toStrictEqual("fr");
    });
  });
});

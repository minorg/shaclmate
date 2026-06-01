import datasetFactory from "@rdfjs/dataset";
import dataFactory from "@rdfx/data-factory";
import { Resource, ResourceSet } from "@rdfx/resource";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { beforeAll, describe, it } from "vitest";
import { harnesses } from "./harnesses.js";
import "@rdfx/testing";

describe("fromRdf", () => {
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
      const languageLiteral =
        language.length > 0
          ? dataFactory.literal(`${language}value`, language)
          : dataFactory.literal("value");

      for (const property of Object.values(
        kitchenSink.LanguageInPropertiesStruct.schema.properties,
      )) {
        if (property.kind !== "Shacl") {
          continue;
        }

        languageInDataset.add(
          dataFactory.quad(
            invalidLanguageInResource.identifier,
            property.path,
            languageLiteral,
          ),
        );

        switch (property.path.value) {
          case "http://example.com/languageInLiteralProperty":
            if (!validLanguageInLanguage.includes(language)) {
              continue;
            }
            break;
        }

        languageInDataset.add(
          dataFactory.quad(
            validLanguageInResource.identifier,
            property.path,
            languageLiteral,
          ),
        );
      }
    }
  });

  for (const [id, harness] of Object.entries(harnesses)) {
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
      expect(
        harness.staticSide
          .equals(harness.instance as any, fromRdfInstance)
          .extract(),
      ).toStrictEqual(true);
    });
  }

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
        .explicitFromToRdfTypesProperty.path,
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
        .explicitFromToRdfTypesProperty.path,
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
      kitchenSink.ExplicitFromToRdfTypesStruct.fromRdfType.value,
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
      dataFactory.quad(actualResource.identifier, rdf.type, extraneousRdfType),
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

  it("reject invalid values (sh:hasValue)", ({ expect }) => {
    const dataset = datasetFactory.dataset();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.HasValuePropertiesStruct.schema.properties
          .hasIriValueProperty.path,
        dataFactory.namedNode("http://example.com/HasValuePropertiesClassIri1"),
      ),
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.HasValuePropertiesStruct.schema.properties
          .hasLiteralValueProperty.path,
        dataFactory.literal("nottest"),
      ),
    );
    expect(
      kitchenSink.HasValuePropertiesStruct.fromRdfResource(
        new ResourceSet({ dataFactory, dataset }).resource(identifier),
      ),
    ).toBeLeft();
    // expect(instance.hasLiteralValueProperty.isNothing()).toStrictEqual(true);
  });

  it("reject invalid identifier values (sh:in)", ({ expect }) => {
    const dataset = datasetFactory.dataset();
    const identifier = dataFactory.namedNode(
      "http://example.com/InvalidIdentifier",
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.InIdentifierStruct.schema.properties.inIdentifierProperty
          .path,
        dataFactory.literal("whatever"),
      ),
    );
    const instance = kitchenSink.InIdentifierStruct.fromRdfResource(
      new ResourceSet({ dataFactory, dataset }).resource(identifier),
    ).extract();
    expect(instance).toBeInstanceOf(Error);
  });

  it("reject invalid IRI property values (sh:in)", ({ expect }) => {
    const dataset = datasetFactory.dataset();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.InPropertiesStruct.schema.properties.inIrisProperty.path,
        dataFactory.namedNode("http://example.com/WithInPropertiesIriInvalid"),
      ),
    );
    const result = kitchenSink.InPropertiesStruct.fromRdfResource(
      new ResourceSet({ dataFactory, dataset }).resource(identifier),
    );
    expect(result).toBeLeft();
    // expect(result.extract()).toBeInstanceOf(Resource.MistypedTermValueError);
  });

  it("reject invalid literal property values (sh:in)", ({ expect }) => {
    const dataset = datasetFactory.dataset();
    const identifier = dataFactory.blankNode();
    const object = dataFactory.literal("somethingelse");
    dataset.add(
      dataFactory.quad(
        identifier,
        rdf.type,
        kitchenSink.InPropertiesStruct.fromRdfType,
      ),
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.InPropertiesStruct.schema.properties.inStringsProperty.path,
        object,
      ),
    );
    const result = kitchenSink.InPropertiesStruct.fromRdfResource(
      new ResourceSet({ dataFactory, dataset }).resource(identifier),
    );
    expect(result).toBeLeft();
    expect(result.extract()).toBeInstanceOf(Resource.MistypedTermValueError);
  });

  it("languageIn: valid", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesStruct.fromRdfResource(
      validLanguageInResource,
    ).unsafeCoerce();
    expect(instance.languageInLiteralProperty).toHaveLength(
      validLanguageInLanguage.length,
    );
    for (const language of validLanguageInLanguage) {
      expect(
        instance.languageInLiteralProperty.some(
          (literal) => literal.language === language,
        ),
      );
    }
  });

  it("languageIn: invalid", ({ expect }) => {
    expect(
      kitchenSink.LanguageInPropertiesStruct.fromRdfResource(
        invalidLanguageInResource,
      ),
    ).toBeLeft();
  });

  it("preferredLanguages: []", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesStruct.fromRdfResource(
      validLanguageInResource,
      {
        preferredLanguages: [],
      },
    ).unsafeCoerce();
    expect(instance.languageInLiteralProperty).toHaveLength(
      validLanguageInLanguage.length,
    );
  });

  it("preferredLanguages: ['en']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesStruct.fromRdfResource(
      validLanguageInResource,
      {
        preferredLanguages: ["en"],
      },
    ).unsafeCoerce();
    expect(instance.languageInLiteralProperty).toHaveLength(1);
    expect(instance.languageInLiteralProperty[0].language).toStrictEqual("en");
    expect(instance.languageInLiteralProperty[0].value).toStrictEqual(
      "envalue",
    );
  });

  it("preferredLanguages: ['']", ({ expect }) => {
    expect(
      kitchenSink.LanguageInPropertiesStruct.fromRdfResource(
        validLanguageInResource,
        {
          preferredLanguages: [""],
        },
      ),
    ).toBeLeft();
  });

  it("preferredLanguages: ['', 'en']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesStruct.fromRdfResource(
      validLanguageInResource,
      {
        preferredLanguages: ["", "en"],
      },
    ).unsafeCoerce();
    expect(instance.languageInLiteralProperty).toHaveLength(1);
    expect(instance.languageInLiteralProperty[0].language).toStrictEqual("en");
    expect(instance.languageInLiteralProperty[0].value).toStrictEqual(
      "envalue",
    );
  });

  it("preferredLanguages: ['en', '']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesStruct.fromRdfResource(
      validLanguageInResource,
      {
        preferredLanguages: ["en", ""],
      },
    ).unsafeCoerce();
    expect(instance.languageInLiteralProperty).toHaveLength(1);
    expect(instance.languageInLiteralProperty[0].language).toStrictEqual("en");
    expect(instance.languageInLiteralProperty[0].value).toStrictEqual(
      "envalue",
    );
  });

  it("preferredLanguages: ['fr', 'en']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesStruct.fromRdfResource(
      validLanguageInResource,
      {
        preferredLanguages: ["fr", "en"],
      },
    ).unsafeCoerce();
    expect(instance.languageInLiteralProperty).toHaveLength(2);
    expect(instance.languageInLiteralProperty[0].language).toStrictEqual("fr");
    expect(instance.languageInLiteralProperty[0].value).toStrictEqual(
      "frvalue",
    );
    expect(instance.languageInLiteralProperty[1].language).toStrictEqual("en");
    expect(instance.languageInLiteralProperty[1].value).toStrictEqual(
      "envalue",
    );
  });

  it("accept right identifier type (NamedNode)", ({ expect }) => {
    expect(
      kitchenSink.IriIdentifierStruct.fromRdfResource(
        new ResourceSet({ dataFactory, dataset: datasetFactory.dataset() })
          .resource(dataFactory.namedNode("http://example.com/identifier"))
          .add(rdf.type, kitchenSink.IriIdentifierStruct.fromRdfType),
      ).isRight(),
    ).toBe(true);
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
          .add(rdf.type, kitchenSink.InIdentifierStruct.fromRdfType),
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

  it("reject wrong identifier type (sh:in identifier)", ({ expect }) => {
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

  it("reject malformed list", ({ expect }) => {
    const resourceSet = new ResourceSet({
      dataFactory,
      dataset: datasetFactory.dataset(),
    });
    const instanceResource = resourceSet.resource(dataFactory.blankNode());
    instanceResource.add(
      kitchenSink.ListPropertiesStruct.schema.properties.stringListProperty
        .path,
      dataFactory.blankNode(),
    );
    const result =
      kitchenSink.ListPropertiesStruct.fromRdfResource(instanceResource);
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
      kitchenSink.ListPropertiesStruct.schema.properties.stringListProperty
        .path,
      listResource.identifier,
    );
    listResource.add(rdf.first, dataFactory.blankNode());
    listResource.add(rdf.rest, rdf.nil);
    const result =
      kitchenSink.ListPropertiesStruct.fromRdfResource(instanceResource);
    expect(result).toBeLeft();
  });

  it("reject mistyped set", ({ expect }) => {
    const resourceSet = new ResourceSet({
      dataFactory,
      dataset: datasetFactory.dataset(),
    });
    const instanceResource = resourceSet.resource(dataFactory.blankNode());
    instanceResource.add(
      kitchenSink.PropertyCardinalitiesStruct.schema.properties.emptySetProperty
        .path,
      dataFactory.blankNode(),
    );
    const result =
      kitchenSink.PropertyCardinalitiesStruct.fromRdfResource(instanceResource);
    expect(result).toBeLeft();
    // expect(result.extract()).toBeInstanceOf(Resource.MistypedTermValueError);
  });

  it("accept unknown sub-class type", ({ expect }) => {
    const instance = kitchenSink.ExplicitRdfTypeStruct.createUnsafe({
      explicitRdfTypeProperty: "test",
    });
    const dataset = datasetFactory.dataset();
    for (const quad of kitchenSink.ExplicitRdfTypeStruct.toRdfResource(instance)
      .dataset) {
      if (!quad.predicate.equals(rdf.type)) {
        dataset.add(quad);
      }
    }
    const instanceResource = new ResourceSet({ dataFactory, dataset }).resource(
      instance.$identifier(),
    );
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
        kitchenSink.ExplicitRdfTypeStruct.fromRdfType,
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

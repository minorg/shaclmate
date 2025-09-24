import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { harnesses } from "./harnesses.js";

import { rdf } from "@tpluscode/rdf-ns-builders";

import N3, { DataFactory as dataFactory } from "n3";
import { MutableResourceSet, Resource, ResourceSet } from "rdfjs-resource";
import { beforeAll, describe, it } from "vitest";

describe("fromRdf", () => {
  let languageInResource: Resource;

  beforeAll(() => {
    const languageInDataset = new N3.Store();
    const languageInSubject = dataFactory.blankNode();
    languageInResource = new ResourceSet({
      dataset: languageInDataset,
    }).resource(languageInSubject);
    for (const language of ["", "ar", "en", "fr"]) {
      for (const property of Object.values(
        kitchenSink.LanguageInPropertiesClass.$properties,
      )) {
        languageInDataset.add(
          dataFactory.quad(
            languageInSubject,
            dataFactory.namedNode(property.identifier.value),
            language.length > 0
              ? dataFactory.literal(`${language}value`, language)
              : dataFactory.literal("value"),
          ),
        );
      }
    }
  });

  for (const [id, harness] of Object.entries(harnesses)) {
    it(`${id} round trip`, ({ expect }) => {
      const fromRdfInstance = harness
        .fromRdf(harness.toRdf(), {
          extra: 1,
        })
        .unsafeCoerce() as any;
      expect(harness.equals(fromRdfInstance).extract()).toStrictEqual(true);
    });
  }

  it("abstract base class fromRdf", ({ expect }) => {
    const fromRdfInstance =
      kitchenSink.AbstractBaseClassWithPropertiesStatic.$fromRdf(
        harnesses.concreteChildClass.toRdf(),
      ).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClass.equals(fromRdfInstance).extract(),
    ).toStrictEqual(true);
  });

  it("concrete base class fromRdf", ({ expect }) => {
    const fromRdfInstance = kitchenSink.ConcreteParentClassStatic.$fromRdf(
      harnesses.concreteChildClass.toRdf(),
    ).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClass.equals(fromRdfInstance).extract(),
    ).toStrictEqual(true);
  });

  it("explicit fromRdfType ignore default rdf:type", ({ expect }) => {
    const resource = new MutableResourceSet({
      dataFactory,
      dataset: new N3.Store(),
    }).mutableResource(dataFactory.blankNode());
    resource.add(
      rdf.type,
      dataFactory.namedNode("http://example.com/ExplicitFromToRdfTypes"),
    );
    resource.add(
      kitchenSink.ExplicitFromToRdfTypesClass.$properties
        .explicitFromToRdfTypesProperty.identifier,
      dataFactory.literal("test"),
    );

    const fromRdfInstance =
      kitchenSink.ExplicitFromToRdfTypesClass.$fromRdf(resource);
    expect(fromRdfInstance.isLeft()).toBe(true);
  });

  it("explicit fromRdfType accept non-default rdf:type", ({ expect }) => {
    const resource = new MutableResourceSet({
      dataFactory,
      dataset: new N3.Store(),
    }).mutableResource(dataFactory.blankNode());
    resource.add(
      rdf.type,
      dataFactory.namedNode("http://example.com/FromRdfType"),
    );
    resource.add(
      kitchenSink.ExplicitFromToRdfTypesClass.$properties
        .explicitFromToRdfTypesProperty.identifier,
      dataFactory.literal("test"),
    );

    const fromRdfInstance =
      kitchenSink.ExplicitFromToRdfTypesClass.$fromRdf(resource);
    expect(fromRdfInstance.isRight()).toBe(true);
  });

  it("ensure hasValue (sh:hasValue)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    const object = dataFactory.namedNode(
      "http://example.com/HasValuePropertiesClassIri1",
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.HasValuePropertiesClass.$properties.hasIriValueProperty
          .identifier,
        object,
      ),
    );
    // Add an extra object of the same predicate, which should be ignored
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.HasValuePropertiesClass.$properties.hasIriValueProperty
          .identifier,
        dataFactory.namedNode("http://example.com/HasValuePropertiesClassIri2"),
      ),
    );
    const instance = kitchenSink.HasValuePropertiesClass.$fromRdf(
      new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    ).unsafeCoerce();
    expect(instance.hasIriValueProperty.unsafeCoerce().equals(object));
  });

  it("reject invalid values (sh:hasValue)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.HasValuePropertiesClass.$properties.hasLiteralValueProperty
          .identifier,
        dataFactory.literal("nottest"),
      ),
    );
    expect(
      kitchenSink.HasValuePropertiesClass.$fromRdf(
        new MutableResourceSet({
          dataFactory,
          dataset: dataset,
        }).resource(identifier),
      ).isLeft(),
    );
    // expect(instance.hasLiteralValueProperty.isNothing()).toStrictEqual(true);
  });

  it("reject invalid identifier values (sh:in)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.namedNode(
      "http://example.com/InvalidIdentifier",
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.InIdentifierClass.$properties.inIdentifierProperty
          .identifier,
        dataFactory.literal("whatever"),
      ),
    );
    const instance = kitchenSink.InIdentifierClass.$fromRdf(
      new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).namedResource(identifier),
    ).extract();
    expect(instance).toBeInstanceOf(Error);
  });

  it("reject invalid IRI property values (sh:in)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.InPropertiesClass.$properties.inIrisProperty.identifier,
        dataFactory.namedNode("http://example.com/WithInPropertiesIriInvalid"),
      ),
    );
    const result = kitchenSink.InPropertiesClass.$fromRdf(
      new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    );
    expect(result.isLeft()).toBe(true);
    // expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
  });

  it("reject invalid literal property values (sh:in)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    const object = dataFactory.literal("somethingelse");
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.InPropertiesClass.$properties.inStringsProperty.identifier,
        object,
      ),
    );
    const result = kitchenSink.InPropertiesClass.$fromRdf(
      new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    );
    expect(result.isLeft()).toBe(true);
    expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
  });

  it("languageIn unspecified", () => {
    kitchenSink.LanguageInPropertiesClass.$fromRdf(
      languageInResource,
    ).unsafeCoerce();
  });

  it("languageIn: []", () => {
    kitchenSink.LanguageInPropertiesClass.$fromRdf(languageInResource, {
      languageIn: [],
    }).unsafeCoerce();
  });

  it("languageIn: ['en']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
      languageInResource,
      {
        languageIn: ["en"],
      },
    ).unsafeCoerce();
    expect(instance.languageInPropertiesLanguageInProperty.value).toStrictEqual(
      "envalue",
    );
    expect(instance.languageInPropertiesLiteralProperty.value).toStrictEqual(
      "envalue",
    );
  });

  it("languageIn: ['']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
      languageInResource,
      {
        languageIn: [""],
      },
    ).unsafeCoerce();
    expect(instance.languageInPropertiesLanguageInProperty.value).toStrictEqual(
      "value",
    );
    expect(instance.languageInPropertiesLiteralProperty.value).toStrictEqual(
      "value",
    );
  });

  it("languageIn: ['', 'en']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
      languageInResource,
      {
        languageIn: ["", "en"],
      },
    ).unsafeCoerce();
    expect(instance.languageInPropertiesLanguageInProperty.value).toStrictEqual(
      "value",
    );
    expect(instance.languageInPropertiesLiteralProperty.value).toStrictEqual(
      "value",
    );
  });

  it("languageIn: ['en', '']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
      languageInResource,
      {
        languageIn: ["en", ""],
      },
    ).unsafeCoerce();
    expect(instance.languageInPropertiesLanguageInProperty.value).toStrictEqual(
      "envalue",
    );
    expect(instance.languageInPropertiesLiteralProperty.value).toStrictEqual(
      "envalue",
    );
  });

  it("accept right identifier type (NamedNode)", ({ expect }) => {
    expect(
      kitchenSink.IriClass.$fromRdf(
        new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(
            dataFactory.namedNode("http://example.com/identifier"),
          )
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      ).isRight(),
    ).toBe(true);
  });

  it("accept right identifier type (sh:in identifier)", ({ expect }) => {
    expect(
      kitchenSink.InIdentifierClass.$fromRdf(
        new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(
            dataFactory.namedNode("http://example.com/InIdentifierInstance1"),
          )
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      ).isRight(),
    ).toBe(true);
  });

  it("reject wrong identifier type (BlankNode)", ({ expect }) => {
    expect(
      kitchenSink.IriClass.$fromRdf(
        new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(dataFactory.blankNode())
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      ).isLeft(),
    ).toBe(true);
  });

  it("reject wrong identifier type (sh:in identifier)", ({ expect }) => {
    expect(
      kitchenSink.InIdentifierClass.$fromRdf(
        new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(
            dataFactory.namedNode("http://example.com/InIdentifierInstance3"),
          )
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      ).isLeft(),
    ).toBe(true);
  });

  it("reject malformed list", ({ expect }) => {
    const resourceSet = new MutableResourceSet({
      dataFactory,
      dataset: new N3.Store(),
    });
    const instanceResource = resourceSet.mutableResource(
      dataFactory.blankNode(),
    );
    instanceResource.add(
      kitchenSink.ListPropertiesClass.$properties.stringListProperty.identifier,
      resourceSet.mutableResource(dataFactory.blankNode()),
    );
    const result = kitchenSink.ListPropertiesClass.$fromRdf(instanceResource);
    expect(result.isLeft()).toBe(true);
    // expect(result.extract()).toBeInstanceOf(Resource.ListStructureError);
  });

  it("reject mistyped list", ({ expect }) => {
    const resourceSet = new MutableResourceSet({
      dataFactory,
      dataset: new N3.Store(),
    });
    const instanceResource = resourceSet.mutableResource(
      dataFactory.blankNode(),
    );
    const listResource = resourceSet.mutableResource(dataFactory.blankNode());
    instanceResource.add(
      kitchenSink.ListPropertiesClass.$properties.stringListProperty.identifier,
      listResource,
    );
    listResource.add(rdf.first, dataFactory.blankNode());
    listResource.add(rdf.rest, rdf.nil);
    const result = kitchenSink.ListPropertiesClass.$fromRdf(instanceResource);
    expect(result.isLeft()).toBe(true);
    // expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
  });

  it("reject mistyped set", ({ expect }) => {
    const resourceSet = new MutableResourceSet({
      dataFactory,
      dataset: new N3.Store(),
    });
    const instanceResource = resourceSet.mutableResource(
      dataFactory.blankNode(),
    );
    instanceResource.add(
      kitchenSink.PropertyCardinalitiesClass.$properties.emptyStringSetProperty
        .identifier,
      resourceSet.mutableResource(dataFactory.blankNode()),
    );
    const result =
      kitchenSink.PropertyCardinalitiesClass.$fromRdf(instanceResource);
    expect(result.isLeft()).toBe(true);
    // expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
  });
});

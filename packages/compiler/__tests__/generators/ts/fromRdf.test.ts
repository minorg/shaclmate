import * as kitchenSink from "@shaclmate/kitchen-sink-example";

import { rdf } from "@tpluscode/rdf-ns-builders";

import N3, { DataFactory as dataFactory } from "n3";
import { MutableResourceSet, Resource } from "rdfjs-resource";
import { describe, it } from "vitest";

import { harnesses } from "./harnesses.js"; // Must be imported before kitchenSink

describe("fromRdf", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(`${id} round trip`, ({ expect }) => {
      const fromRdfInstance = harness
        .fromRdf(
          harness.toRdf({
            mutateGraph: dataFactory.defaultGraph(),
            resourceSet: new MutableResourceSet({
              dataFactory,
              dataset: new N3.Store(),
            }),
          }),
          {
            extra: 1,
          },
        )
        .unsafeCoerce() as any;
      expect(harness.equals(fromRdfInstance).extract()).toStrictEqual(true);
    });
  }

  it("abstract base class fromRdf", ({ expect }) => {
    const fromRdfInstance =
      kitchenSink.AbstractBaseClassWithPropertiesStatic.$fromRdf(
        harnesses.concreteChildClass.toRdf({
          mutateGraph: dataFactory.defaultGraph(),
          resourceSet: new MutableResourceSet({
            dataFactory,
            dataset: new N3.Store(),
          }),
        }),
      ).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClass.equals(fromRdfInstance).extract(),
    ).toStrictEqual(true);
  });

  it("concrete base class fromRdf", ({ expect }) => {
    const fromRdfInstance = kitchenSink.ConcreteParentClassStatic.$fromRdf(
      harnesses.concreteChildClass.toRdf({
        mutateGraph: dataFactory.defaultGraph(),
        resourceSet: new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        }),
      }),
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

  it("ignore invalid values (sh:hasValue)", ({ expect }) => {
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
    const instance = kitchenSink.HasValuePropertiesClass.$fromRdf(
      new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    ).unsafeCoerce();
    expect(instance.hasLiteralValueProperty.isNothing()).toStrictEqual(true);
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
    expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
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

  it("runtime languageIn", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    const resource = new MutableResourceSet({
      dataFactory,
      dataset: dataset,
    }).resource(identifier);
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLiteralProperty.identifier,
        dataFactory.literal("arvalue", "ar"),
      ),
    );

    {
      const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
        resource,
        {
          languageIn: ["en"],
        },
      ).unsafeCoerce();
      expect(
        instance.languageInPropertiesLiteralProperty.isNothing(),
      ).toStrictEqual(true);
    }

    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLiteralProperty.identifier,
        dataFactory.literal("envalue", "en"),
      ),
    );

    {
      const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
        resource,
        {
          languageIn: ["en"],
        },
      ).unsafeCoerce();
      expect(
        instance.languageInPropertiesLiteralProperty.unsafeCoerce().value,
      ).toStrictEqual("envalue");
    }
  });

  it("sh:languageIn", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    const resource = new MutableResourceSet({
      dataFactory,
      dataset: dataset,
    }).resource(identifier);
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLanguageInProperty.identifier,
        dataFactory.literal("arvalue", "ar"),
      ),
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.LanguageInPropertiesClass.$properties
          .languageInPropertiesLanguageInProperty.identifier,
        dataFactory.literal("envalue", "en"),
      ),
    );
    const instance =
      kitchenSink.LanguageInPropertiesClass.$fromRdf(resource).unsafeCoerce();
    expect(
      instance.languageInPropertiesLanguageInProperty.unsafeCoerce().value,
    ).toStrictEqual("envalue");
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
    expect(result.extract()).toBeInstanceOf(Resource.ListStructureError);
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
    expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
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
    expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
  });
});

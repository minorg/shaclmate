import * as kitchenSink from "@shaclmate/kitchen-sink-example";

import { rdf } from "@tpluscode/rdf-ns-builders";

import N3, { DataFactory as dataFactory } from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { describe, it } from "vitest";

import { harnesses } from "./harnesses.js"; // Must be imported before kitchenSink

describe("fromRdf", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    it(`${id} round trip`, ({ expect }) => {
      const fromRdfInstance = harness
        .fromRdf({
          extra: 1,
          resource: harness.toRdf({
            mutateGraph: dataFactory.defaultGraph(),
            resourceSet: new MutableResourceSet({
              dataFactory,
              dataset: new N3.Store(),
            }),
          }) as any,
        })
        .unsafeCoerce() as any;
      expect(harness.equals(fromRdfInstance).extract()).toStrictEqual(true);
    });
  }

  it("abstract base class fromRdf", ({ expect }) => {
    const fromRdfInstance =
      kitchenSink.AbstractBaseClassWithPropertiesStatic.fromRdf({
        resource: harnesses.concreteChildClass.toRdf({
          mutateGraph: dataFactory.defaultGraph(),
          resourceSet: new MutableResourceSet({
            dataFactory,
            dataset: new N3.Store(),
          }),
        }) as any,
      }).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClass.equals(fromRdfInstance).extract(),
    ).toStrictEqual(true);
  });

  it("concrete base class fromRdf", ({ expect }) => {
    const fromRdfInstance = kitchenSink.ConcreteParentClassStatic.fromRdf({
      resource: harnesses.concreteChildClass.toRdf({
        mutateGraph: dataFactory.defaultGraph(),
        resourceSet: new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        }),
      }) as any,
    }).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClass.equals(fromRdfInstance).extract(),
    ).toStrictEqual(true);
  });

  it("explicit fromRdfType ignore default rdf:type", ({ expect }) => {
    const resourceSet = new MutableResourceSet({
      dataFactory,
      dataset: new N3.Store(),
    });
    const resource = resourceSet.mutableResource(dataFactory.blankNode());
    resource.add(
      rdf.type,
      dataFactory.namedNode("http://example.com/ExplicitFromToRdfTypes"),
    );
    resource.add(
      kitchenSink.ExplicitFromToRdfTypesClass.$properties
        .explicitFromToRdfTypesProperty.identifier,
      dataFactory.literal("test"),
    );

    const fromRdfInstance = kitchenSink.ExplicitFromToRdfTypesClass.fromRdf({
      resource,
    });
    expect(fromRdfInstance.isLeft()).toBe(true);
  });

  it("explicit fromRdfType accept non-default rdf:type", ({ expect }) => {
    const resourceSet = new MutableResourceSet({
      dataFactory,
      dataset: new N3.Store(),
    });
    const resource = resourceSet.mutableResource(dataFactory.blankNode());
    resource.add(
      rdf.type,
      dataFactory.namedNode("http://example.com/FromRdfType"),
    );
    resource.add(
      kitchenSink.ExplicitFromToRdfTypesClass.$properties
        .explicitFromToRdfTypesProperty.identifier,
      dataFactory.literal("test"),
    );

    const fromRdfInstance = kitchenSink.ExplicitFromToRdfTypesClass.fromRdf({
      resource,
    });
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
    const instance = kitchenSink.HasValuePropertiesClass.fromRdf({
      resource: new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    }).unsafeCoerce();
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
    const instance = kitchenSink.HasValuePropertiesClass.fromRdf({
      resource: new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    }).unsafeCoerce();
    expect(instance.hasLiteralValueProperty.isNothing()).toStrictEqual(true);
  });

  it("ignore invalid identifier values (sh:in)", ({ expect }) => {
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
    const instance = kitchenSink.InIdentifierClass.fromRdf({
      resource: new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).namedResource(identifier),
    }).extract();
    expect(instance).toBeInstanceOf(Error);
  });

  it("ignore invalid IRI property values (sh:in)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.InPropertiesClass.$properties.inIrisProperty.identifier,
        dataFactory.namedNode("http://example.com/WithInPropertiesIriInvalid"),
      ),
    );
    const instance = kitchenSink.InPropertiesClass.fromRdf({
      resource: new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    }).unsafeCoerce();
    expect(instance.inIrisProperty.isNothing()).toStrictEqual(true);
  });

  it("ignore invalid literal property values (sh:in)", ({ expect }) => {
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
    const instance = kitchenSink.InPropertiesClass.fromRdf({
      resource: new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    }).unsafeCoerce();
    expect(instance.inStringsProperty.isNothing()).toStrictEqual(true);
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
      const instance = kitchenSink.LanguageInPropertiesClass.fromRdf({
        languageIn: ["en"],
        resource,
      }).unsafeCoerce();
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
      const instance = kitchenSink.LanguageInPropertiesClass.fromRdf({
        languageIn: ["en"],
        resource,
      }).unsafeCoerce();
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
    const instance = kitchenSink.LanguageInPropertiesClass.fromRdf({
      resource,
    }).unsafeCoerce();
    expect(
      instance.languageInPropertiesLanguageInProperty.unsafeCoerce().value,
    ).toStrictEqual("envalue");
  });

  it("accept right identifier type (NamedNode)", ({ expect }) => {
    expect(
      kitchenSink.IriClass.fromRdf({
        resource: new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(
            dataFactory.namedNode("http://example.com/identifier"),
          )
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      }).isRight(),
    ).toBe(true);
  });

  it("accept right identifier type (sh:in identifier)", ({ expect }) => {
    expect(
      kitchenSink.InIdentifierClass.fromRdf({
        resource: new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(
            dataFactory.namedNode("http://example.com/InIdentifierInstance1"),
          )
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      }).isRight(),
    ).toBe(true);
  });

  it("reject wrong identifier type (BlankNode)", ({ expect }) => {
    expect(
      kitchenSink.IriClass.fromRdf({
        resource: new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(dataFactory.blankNode())
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      }).isLeft(),
    ).toBe(true);
  });

  it("reject wrong identifier type (sh:in identifier)", ({ expect }) => {
    expect(
      kitchenSink.InIdentifierClass.fromRdf({
        resource: new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(
            dataFactory.namedNode("http://example.com/InIdentifierInstance3"),
          )
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      }).isLeft(),
    ).toBe(true);
  });
});

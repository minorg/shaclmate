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
      kitchenSink.AbstractBaseClassWithPropertiesNodeShapeStatic.fromRdf({
        resource: harnesses.concreteChildClassNodeShape.toRdf({
          mutateGraph: dataFactory.defaultGraph(),
          resourceSet: new MutableResourceSet({
            dataFactory,
            dataset: new N3.Store(),
          }),
        }) as any,
      }).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClassNodeShape.equals(fromRdfInstance).extract(),
    ).toStrictEqual(true);
  });

  it("concrete base class fromRdf", ({ expect }) => {
    const fromRdfInstance =
      kitchenSink.ConcreteParentClassNodeShapeStatic.fromRdf({
        resource: harnesses.concreteChildClassNodeShape.toRdf({
          mutateGraph: dataFactory.defaultGraph(),
          resourceSet: new MutableResourceSet({
            dataFactory,
            dataset: new N3.Store(),
          }),
        }) as any,
      }).unsafeCoerce() as any;
    expect(
      harnesses.concreteChildClassNodeShape.equals(fromRdfInstance).extract(),
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
      dataFactory.namedNode(
        "http://example.com/ExplicitFromToRdfTypesNodeShape",
      ),
    );
    resource.add(
      dataFactory.namedNode("http://example.com/stringProperty"),
      dataFactory.literal("test"),
    );

    const fromRdfInstance = kitchenSink.ExplicitFromToRdfTypesNodeShape.fromRdf(
      {
        resource,
      },
    );
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
      dataFactory.namedNode("http://example.com/stringProperty"),
      dataFactory.literal("test"),
    );

    const fromRdfInstance = kitchenSink.ExplicitFromToRdfTypesNodeShape.fromRdf(
      {
        resource,
      },
    );
    expect(fromRdfInstance.isRight()).toBe(true);
  });

  it("ensure hasValue (sh:hasValue)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    const predicate = dataFactory.namedNode(
      "http://example.com/hasIriProperty",
    );
    const object = dataFactory.namedNode(
      "http://example.com/HasValuePropertiesNodeShapeIri1",
    );
    dataset.add(dataFactory.quad(identifier, predicate, object));
    // Add an extra object of the same predicate, which should be ignored
    dataset.add(
      dataFactory.quad(
        identifier,
        predicate,
        dataFactory.namedNode(
          "http://example.com/HasValuePropertiesNodeShapeIri2",
        ),
      ),
    );
    const instance = kitchenSink.HasValuePropertiesNodeShape.fromRdf({
      resource: new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    }).unsafeCoerce();
    expect(instance.hasIriProperty.unsafeCoerce().equals(object));
  });

  it("ignore invalid values (sh:hasValue)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        dataFactory.namedNode("http://example.com/hasLiteralProperty"),
        dataFactory.literal("nottest"),
      ),
    );
    const instance = kitchenSink.HasValuePropertiesNodeShape.fromRdf({
      resource: new MutableResourceSet({
        dataFactory,
        dataset: dataset,
      }).resource(identifier),
    }).unsafeCoerce();
    expect(instance.hasLiteralProperty.isNothing()).toStrictEqual(true);
  });

  it("ignore invalid identifier values (sh:in)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.namedNode(
      "http://example.com/InvalidIdentifier",
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        dataFactory.namedNode("http://example.com/stringProperty"),
        dataFactory.literal("whatever"),
      ),
    );
    const instance = kitchenSink.InIdentifierNodeShape.fromRdf({
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
        dataFactory.namedNode("http://example.com/inIrisProperty"),
        dataFactory.namedNode(
          "http://example.com/NodeShapeWithInPropertiesIriInvalid",
        ),
      ),
    );
    const instance = kitchenSink.InPropertiesNodeShape.fromRdf({
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
    const predicate = dataFactory.namedNode(
      "http://example.com/inStringsProperty",
    );
    const object = dataFactory.literal("somethingelse");
    dataset.add(dataFactory.quad(identifier, predicate, object));
    const instance = kitchenSink.InPropertiesNodeShape.fromRdf({
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
    const predicate = dataFactory.namedNode(
      "http://example.com/literalProperty",
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        predicate,
        dataFactory.literal("arvalue", "ar"),
      ),
    );

    {
      const instance = kitchenSink.LanguageInPropertiesNodeShape.fromRdf({
        languageIn: ["en"],
        resource,
      }).unsafeCoerce();
      expect(instance.literalProperty.isNothing()).toStrictEqual(true);
    }

    dataset.add(
      dataFactory.quad(
        identifier,
        predicate,
        dataFactory.literal("envalue", "en"),
      ),
    );

    {
      const instance = kitchenSink.LanguageInPropertiesNodeShape.fromRdf({
        languageIn: ["en"],
        resource,
      }).unsafeCoerce();
      expect(instance.literalProperty.unsafeCoerce().value).toStrictEqual(
        "envalue",
      );
    }
  });

  it("sh:languageIn", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    const resource = new MutableResourceSet({
      dataFactory,
      dataset: dataset,
    }).resource(identifier);
    const predicate = dataFactory.namedNode(
      "http://example.com/languageInProperty",
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        predicate,
        dataFactory.literal("arvalue", "ar"),
      ),
    );
    dataset.add(
      dataFactory.quad(
        identifier,
        predicate,
        dataFactory.literal("envalue", "en"),
      ),
    );
    const instance = kitchenSink.LanguageInPropertiesNodeShape.fromRdf({
      resource,
    }).unsafeCoerce();
    expect(instance.languageInProperty.unsafeCoerce().value).toStrictEqual(
      "envalue",
    );
  });

  it("accept right identifier type (NamedNode)", ({ expect }) => {
    expect(
      kitchenSink.IriNodeShape.fromRdf({
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
      kitchenSink.InIdentifierNodeShape.fromRdf({
        resource: new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(
            dataFactory.namedNode(
              "http://example.com/InIdentifierNodeShapeInstance1",
            ),
          )
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      }).isRight(),
    ).toBe(true);
  });

  it("reject wrong identifier type (BlankNode)", ({ expect }) => {
    expect(
      kitchenSink.IriNodeShape.fromRdf({
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
      kitchenSink.InIdentifierNodeShape.fromRdf({
        resource: new MutableResourceSet({
          dataFactory,
          dataset: new N3.Store(),
        })
          .mutableResource(
            dataFactory.namedNode(
              "http://example.com/InIdentifierNodeShapeInstance3",
            ),
          )
          .add(rdf.type, dataFactory.namedNode("http://example.com/type")),
      }).isLeft(),
    ).toBe(true);
  });
});

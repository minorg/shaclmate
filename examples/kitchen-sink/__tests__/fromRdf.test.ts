import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";

import N3, { DataFactory as dataFactory } from "n3";
import { MutableResourceSet, Resource, ResourceSet } from "rdfjs-resource";
import { beforeAll, describe, it } from "vitest";

describe("fromRdf", () => {
  let invalidLanguageInResource: Resource;
  let validLanguageInResource: Resource;
  const validLanguageInLiteralLanguage = ["en", "fr"];
  const validLanguageInStringLanguage = ["", "en", "fr"];

  beforeAll(() => {
    const languageInDataset = new N3.Store();
    invalidLanguageInResource = new ResourceSet({
      dataset: languageInDataset,
    }).resource(dataFactory.blankNode());
    validLanguageInResource = new ResourceSet({
      dataset: languageInDataset,
    }).resource(dataFactory.blankNode());
    for (const language of ["", "ar", "en", "fr"]) {
      const languageLiteral =
        language.length > 0
          ? dataFactory.literal(`${language}value`, language)
          : dataFactory.literal("value");

      for (const property of Object.values(
        kitchenSink.LanguageInPropertiesClass.$properties,
      )) {
        const predicate = dataFactory.namedNode(property.identifier.value);

        languageInDataset.add(
          dataFactory.quad(
            invalidLanguageInResource.identifier,
            predicate,
            languageLiteral,
          ),
        );

        switch (property.identifier.value) {
          case "http://example.com/languageInLiteralProperty":
            if (!validLanguageInLiteralLanguage.includes(language)) {
              continue;
            }
            break;
          case "http://example.com/languageInStringProperty":
            if (!validLanguageInStringLanguage.includes(language)) {
              continue;
            }
            break;
        }

        languageInDataset.add(
          dataFactory.quad(
            validLanguageInResource.identifier,
            predicate,
            languageLiteral,
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

  it("concrete parent class fromRdf", ({ expect }) => {
    const fromRdfInstance = kitchenSink.ConcreteParentClassStatic.$fromRdf(
      harnesses.concreteChildClass.toRdf(),
    ).unsafeCoerce();
    expect(fromRdfInstance).toBeInstanceOf(kitchenSink.ConcreteParentClass);
    expect(fromRdfInstance.concreteParentClassProperty).toStrictEqual(
      harnesses.concreteChildClass.instance.concreteParentClassProperty,
    );
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

  it("reject invalid values (sh:hasValue)", ({ expect }) => {
    const dataset = new N3.Store();
    const identifier = dataFactory.blankNode();
    dataset.add(
      dataFactory.quad(
        identifier,
        kitchenSink.HasValuePropertiesClass.$properties.hasIriValueProperty
          .identifier,
        dataFactory.namedNode("http://example.com/HasValuePropertiesClassIri1"),
      ),
    );
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

  it("languageIn: valid", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
      validLanguageInResource,
    ).unsafeCoerce();
    expect(instance.languageInLiteralProperty).toHaveLength(
      validLanguageInLiteralLanguage.length,
    );
    expect(instance.languageInStringProperty).toHaveLength(
      validLanguageInStringLanguage.length,
    );
    for (const language of validLanguageInLiteralLanguage) {
      expect(
        instance.languageInLiteralProperty.some(
          (literal) => literal.language === language,
        ),
      );
    }
  });

  it("languageIn: invalid", ({ expect }) => {
    expect(
      kitchenSink.LanguageInPropertiesClass.$fromRdf(
        invalidLanguageInResource,
      ).isLeft(),
    );
  });

  it("preferredLanguages: []", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
      validLanguageInResource,
      {
        preferredLanguages: [],
      },
    ).unsafeCoerce();
    expect(instance.languageInLiteralProperty).toHaveLength(
      validLanguageInLiteralLanguage.length,
    );
    expect(instance.languageInStringProperty).toHaveLength(
      validLanguageInStringLanguage.length,
    );
  });

  it("preferredLanguages: ['en']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
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
    expect(instance.languageInStringProperty).toHaveLength(1);
    expect(instance.languageInStringProperty[0]).toStrictEqual("envalue");
  });

  it("preferredLanguages: ['']", ({ expect }) => {
    expect(
      kitchenSink.LanguageInPropertiesClass.$fromRdf(validLanguageInResource, {
        preferredLanguages: [""],
      }).isLeft(),
    ).toStrictEqual(true);
  });

  it("preferredLanguages: ['', 'en']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
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
    expect(instance.languageInStringProperty).toHaveLength(2);
    expect(instance.languageInStringProperty[0]).toStrictEqual("value");
    expect(instance.languageInStringProperty[1]).toStrictEqual("envalue");
  });

  it("preferredLanguages: ['en', '']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
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
    expect(instance.languageInStringProperty).toHaveLength(2);
    expect(instance.languageInStringProperty[0]).toStrictEqual("envalue");
    expect(instance.languageInStringProperty[1]).toStrictEqual("value");
  });

  it("preferredLanguages: ['fr', 'en']", ({ expect }) => {
    const instance = kitchenSink.LanguageInPropertiesClass.$fromRdf(
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
    expect(instance.languageInStringProperty).toHaveLength(2);
    expect(instance.languageInStringProperty[0]).toStrictEqual("frvalue");
    expect(instance.languageInStringProperty[1]).toStrictEqual("envalue");
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
      dataFactory.blankNode(),
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
      listResource.identifier,
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
      dataFactory.blankNode(),
    );
    const result =
      kitchenSink.PropertyCardinalitiesClass.$fromRdf(instanceResource);
    expect(result.isLeft()).toBe(true);
    // expect(result.extract()).toBeInstanceOf(Resource.MistypedValueError);
  });

  it("accept known child type", ({ expect }) => {
    const concreteChild = new kitchenSink.ConcreteChildClass({
      abstractBaseClassWithPropertiesProperty: "abcWith",
      concreteChildClassProperty: "child",
      concreteParentClassProperty: "parent",
    });
    const childResource = concreteChild.$toRdf();

    // Deserialize all of the superclasses of the child class

    const concreteParent =
      kitchenSink.ConcreteParentClassStatic.$fromRdf(
        childResource,
      ).unsafeCoerce();

    expect(
      concreteParent.abstractBaseClassWithPropertiesProperty,
    ).toStrictEqual(concreteChild.abstractBaseClassWithPropertiesProperty);
    expect(concreteParent.concreteParentClassProperty).toStrictEqual(
      concreteChild.concreteParentClassProperty,
    );
  });

  it("accept unknown child type", ({ expect }) => {
    const child = new kitchenSink.ConcreteChildClass({
      abstractBaseClassWithPropertiesProperty: "abcWith",
      concreteChildClassProperty: "child",
      concreteParentClassProperty: "parent",
    });
    const dataset = new N3.Store();
    for (const quad of child.$toRdf().dataset) {
      if (!quad.predicate.equals(rdf.type)) {
        dataset.add(quad);
      }
    }
    const childResource = new ResourceSet({ dataset }).resource(
      child.$identifier,
    );
    // Deserialization shouldn't work since there's no rdf:type statement
    expect(
      kitchenSink.ConcreteChildClass.$fromRdf(childResource).isLeft(),
    ).toStrictEqual(true);
    // Add rdf:type <subclass> statement
    dataset.add(
      dataFactory.quad(
        child.$identifier,
        rdf.type,
        dataFactory.namedNode("http://example.com/newSubType"),
      ),
    );
    // And a corresponding rdfs:subClassOf statement so the instance-of check works
    dataset.add(
      dataFactory.quad(
        dataFactory.namedNode("http://example.com/newSubType"),
        rdfs.subClassOf,
        kitchenSink.ConcreteChildClass.$fromRdfType,
      ),
    );

    expect(
      kitchenSink.ConcreteChildClass.$fromRdf(childResource)
        .unsafeCoerce()
        .$equals(child)
        .unsafeCoerce(),
    ).toStrictEqual(true);
  });
});

import { rdf } from "@tpluscode/rdf-ns-builders";

import N3, { DataFactory as dataFactory } from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { describe, it } from "vitest";

import { harnesses } from "./harnesses.js";

describe("toRdf", () => {
  it("should populate a dataset", ({ expect }) => {
    const dataset = new N3.Store();
    const resourceSet = new MutableResourceSet({ dataFactory, dataset });
    const resource = harnesses.concreteChildClassNodeShape.instance.toRdf({
      resourceSet,
      mutateGraph: dataFactory.defaultGraph(),
    });
    expect(dataset.size).toStrictEqual(4);
    expect(
      resource.identifier.equals(
        harnesses.concreteChildClassNodeShape.instance.identifier,
      ),
    ).toStrictEqual(true);
    expect(
      resource
        .value(rdf.type)
        .chain((value) => value.toIri())
        .unsafeCoerce()
        .equals(
          dataFactory.namedNode(
            "http://example.com/ConcreteChildClassNodeShape",
          ),
        ),
    ).toStrictEqual(true);
    expect(
      resource
        .value(dataFactory.namedNode("http://example.com/childStringProperty"))
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("child");
  });

  it("should produce serializable RDF", ({ expect }) => {
    const dataset = new N3.Store();
    harnesses.nonClassNodeShape.toRdf({
      mutateGraph: dataFactory.defaultGraph(),
      resourceSet: new MutableResourceSet({ dataFactory, dataset }),
    });
    const ttl = new N3.Writer({ format: "text/turtle" }).quadsToString([
      ...dataset,
    ]);
    expect(ttl).not.toHaveLength(0);
  });

  it("explicit rdfType", ({ expect }) => {
    const dataset = new N3.Store();
    const resource = harnesses.explicitRdfType.toRdf({
      mutateGraph: dataFactory.defaultGraph(),
      resourceSet: new MutableResourceSet({
        dataFactory,
        dataset,
      }),
    });
    expect(dataset.size).toStrictEqual(2); // One rdf:type and the property
    expect(
      resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/RdfType"),
      ),
    ).toBe(true);
    expect(
      resource
        .value(dataFactory.namedNode("http://example.com/stringProperty"))
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("explicit toRdfType", ({ expect }) => {
    const dataset = new N3.Store();
    const resource = harnesses.explicitFromToRdfTypes.toRdf({
      mutateGraph: dataFactory.defaultGraph(),
      resourceSet: new MutableResourceSet({
        dataFactory,
        dataset,
      }),
    });
    expect(dataset.size).toStrictEqual(3); // Two RDF types and the property
    expect(
      resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/FromRdfType"),
      ),
    ).toBe(true);
    expect(
      resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/ToRdfType"),
      ),
    ).toBe(true);
    expect(
      resource
        .value(dataFactory.namedNode("http://example.com/stringProperty"))
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("should not serialize default values", ({ expect }) => {
    const dataset = new N3.Store();
    harnesses.defaultValuePropertiesNodeShape.toRdf({
      mutateGraph: dataFactory.defaultGraph(),
      resourceSet: new MutableResourceSet({ dataFactory, dataset }),
    });
    expect(dataset.size).toStrictEqual(0);
  });

  it("should serialize non-default values", ({ expect }) => {
    const dataset = new N3.Store();
    const resource = harnesses.defaultValuePropertiesOverriddenDifferent.toRdf({
      mutateGraph: dataFactory.defaultGraph(),
      resourceSet: new MutableResourceSet({ dataFactory, dataset }),
    });
    expect(dataset.size).toStrictEqual(4);
    expect(
      resource
        .value(dataFactory.namedNode("http://example.com/falseBooleanProperty"))
        .chain((value) => value.toBoolean())
        .unsafeCoerce(),
    ).toStrictEqual(true);
  });
});

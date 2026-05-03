import { fail } from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Parser, Writer } from "n3";
import SHACLValidator from "rdf-validate-shacl";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";
import { quadsToTurtle } from "./quadsToTurtle.js";

describe("toRdf", async () => {
  const shapesGraph = datasetFactory.dataset(
    new Parser({ format: "Turtle" }).parse(
      (
        await fs.readFile(
          path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            "..",
            "src",
            "kitchen-sink.shaclmate.ttl",
          ),
        )
      ).toString(),
    ),
  );

  it("should populate a dataset", ({ expect }) => {
    const resource = harnesses.concreteChildClass.toRdfResource();
    expect(resource.dataset.size).toStrictEqual(4);
    expect(
      resource.identifier.equals(
        harnesses.concreteChildClass.instance.$identifier,
      ),
    ).toStrictEqual(true);
    expect(
      resource
        .value(rdf.type)
        .chain((value) => value.toIri())
        .unsafeCoerce()
        .equals(kitchenSink.ConcreteChildClass.$fromRdfType),
    ).toStrictEqual(true);
    expect(
      resource
        .value(
          kitchenSink.ConcreteChildClass.$schema.properties
            .concreteChildClassProperty.path,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("child");
  });

  it("should produce serializable RDF", ({ expect }) => {
    const resource = harnesses.nonClass.toRdfResource();
    const ttl = new Writer({ format: "text/turtle" }).quadsToString([
      ...resource.dataset,
    ]);
    expect(ttl).not.toHaveLength(0);
  });

  it("explicit rdfType", ({ expect }) => {
    const resource = harnesses.explicitRdfTypeClass.toRdfResource();
    expect(resource.dataset.size).toStrictEqual(2); // One rdf:type and the property
    expect(
      resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/RdfType"),
      ),
    ).toBe(true);
    expect(
      resource
        .value(
          kitchenSink.ExplicitRdfTypeClass.$schema.properties
            .explicitRdfTypeProperty.path,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("explicit toRdfType", ({ expect }) => {
    const resource = harnesses.explicitFromToRdfTypesClass.toRdfResource();
    expect(resource.dataset.size).toStrictEqual(3); // Two RDF types and the property
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
        .value(
          kitchenSink.ExplicitFromToRdfTypesClass.$schema.properties
            .explicitFromToRdfTypesProperty.path,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("should not serialize default values", ({ expect }) => {
    const resource = harnesses.defaultValuePropertiesClass.toRdfResource();
    expect(resource.dataset.size).toStrictEqual(1); // Only the rdf:type
  });

  it("should serialize non-default values", ({ expect }) => {
    const resource =
      harnesses.defaultValuePropertiesOverriddenDifferent.toRdfResource();
    expect(resource.dataset.size).toStrictEqual(5); // Properties + the rdf:type
    expect(
      resource
        .value(
          kitchenSink.DefaultValuePropertiesClass.$schema.properties
            .falseBooleanDefaultValueProperty.path,
        )
        .chain((value) => value.toBoolean())
        .unsafeCoerce(),
    ).toStrictEqual(true);
  });

  it("should not serialize empty lists", ({ expect }) => {
    const instance = new kitchenSink.ListPropertiesClass();
    expect(instance.iriListProperty.extract()).toBeUndefined();
    expect(instance.objectListProperty.extract()).toBeUndefined();
    expect(instance.stringListProperty.extract()).toBeUndefined();

    const resource = instance.$toRdfResource();
    expect(resource.dataset.size).toStrictEqual(1); // The rdf:type statement
  });

  for (const [id, harness] of Object.entries(harnesses)) {
    if (id.startsWith("lazy")) {
      continue;
    }
    it(`${id}: $toRdf produces RDF that conforms to the SHACL shape`, async ({
      expect,
    }) => {
      const dataResource = harness.toRdfResource();
      const dataGraph = dataResource.dataset;

      const shapeNode = dataFactory.namedNode(
        `http://example.com/${harness.shapeName}`,
      );
      expect(shapesGraph.match(shapeNode).size).toBeGreaterThan(0);

      const validationReport = await new SHACLValidator(
        shapesGraph,
        {},
      ).validateNode(dataGraph, dataResource.identifier, shapeNode);
      if (validationReport.conforms) {
        return;
      }

      fail(`\
${id}: data graph:
${quadsToTurtle(dataGraph)}

${id}: validation report:
${quadsToTurtle(validationReport.dataset)}
`);
    });
  }
});

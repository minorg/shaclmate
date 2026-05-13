import { fail } from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import datasetFactory from "@rdfjs/dataset";
import dataFactory from "@rdfx/data-factory";
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
    const resource = kitchenSink.ClassHierarchy3.toRdfResource(
      harnesses.classHierarchy3.instance,
    );
    expect(resource.dataset.size).toStrictEqual(4);
    expect(
      resource.identifier.equals(
        harnesses.classHierarchy3.instance.$identifier(),
      ),
    ).toStrictEqual(true);
    expect(
      resource
        .value(rdf.type)
        .chain((value) => value.toIri())
        .unsafeCoerce()
        .equals(kitchenSink.ClassHierarchy3.fromRdfType),
    ).toStrictEqual(true);
    expect(
      resource
        .value(
          kitchenSink.ClassHierarchy3.schema.properties.classHierarchy3Property
            .path,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("3");
  });

  it("should produce serializable RDF", ({ expect }) => {
    const resource = kitchenSink.NonClass.toRdfResource(
      harnesses.nonClass.instance,
    );
    const ttl = new Writer({ format: "text/turtle" }).quadsToString([
      ...resource.dataset,
    ]);
    expect(ttl).not.toHaveLength(0);
  });

  it("explicit rdfType", ({ expect }) => {
    const resource = kitchenSink.ExplicitRdfType.toRdfResource(
      harnesses.explicitRdfType.instance,
    );
    expect(resource.dataset.size).toStrictEqual(2); // One rdf:type and the property
    expect(
      resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/RdfType"),
      ),
    ).toBe(true);
    expect(
      resource
        .value(
          kitchenSink.ExplicitRdfType.schema.properties.explicitRdfTypeProperty
            .path,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("explicit toRdfType", ({ expect }) => {
    const resource = kitchenSink.ExplicitFromToRdfTypes.toRdfResource(
      harnesses.explicitFromToRdfTypes.instance,
    );
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
          kitchenSink.ExplicitFromToRdfTypes.schema.properties
            .explicitFromToRdfTypesProperty.path,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("should not serialize default values", ({ expect }) => {
    const resource = kitchenSink.DefaultValueProperties.toRdfResource(
      harnesses.defaultValueProperties.instance,
    );
    expect(resource.dataset.size).toStrictEqual(1); // Only the rdf:type
  });

  it("should serialize non-default values", ({ expect }) => {
    const resource = kitchenSink.DefaultValueProperties.toRdfResource(
      harnesses.defaultValuePropertiesOverriddenDifferent.instance,
    );
    expect(resource.dataset.size).toStrictEqual(5); // Properties + the rdf:type
    expect(
      resource
        .value(
          kitchenSink.DefaultValueProperties.schema.properties
            .falseBooleanDefaultValueProperty.path,
        )
        .chain((value) => value.toBoolean())
        .unsafeCoerce(),
    ).toStrictEqual(true);
  });

  it("should not serialize empty lists", ({ expect }) => {
    const instance = kitchenSink.ListProperties.create();
    expect(instance.iriListProperty.extract()).toBeUndefined();
    expect(instance.objectListProperty.extract()).toBeUndefined();
    expect(instance.stringListProperty.extract()).toBeUndefined();

    const resource = kitchenSink.ListProperties.toRdfResource(instance);
    expect(resource.dataset.size).toStrictEqual(1); // The rdf:type statement
  });

  it("class multiple inheritance", ({ expect }) => {
    const resource =
      harnesses.classMultipleInheritanceChild.staticSide.toRdfResource(
        harnesses.classMultipleInheritanceChild.instance,
      );
    expect(resource.dataset.size).toStrictEqual(4); // Child property + parent 1 property + parent 2 property + rdf:type
    resource
      .value(
        kitchenSink.ClassMultipleInheritanceChild.schema.properties
          .classMultipleInheritanceChildProperty.path,
      )
      .unsafeCoerce();
    resource
      .value(
        kitchenSink.ClassMultipleInheritanceChild.schema.properties
          .classMultipleInheritanceParent1Property.path,
      )
      .unsafeCoerce();
    resource
      .value(
        kitchenSink.ClassMultipleInheritanceChild.schema.properties
          .classMultipleInheritanceParent2Property.path,
      )
      .unsafeCoerce();
  });

  for (const [id, harness] of Object.entries(harnesses)) {
    if (id.startsWith("lazy")) {
      continue;
    }
    it(`${id}: $toRdf produces RDF that conforms to the SHACL shape`, async ({
      expect,
    }) => {
      const dataResource = harness.staticSide.toRdfResource(
        harness.instance as any,
      );
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

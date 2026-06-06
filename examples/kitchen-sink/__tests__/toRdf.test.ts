import { fail } from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import datasetFactory from "@rdfjs/dataset";
import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
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

  it("should produce serializable RDF", ({ expect }) => {
    const resource = kitchenSink.NonClassStruct.toRdfResource(
      harnesses.nonClassStruct.instance,
    );
    const ttl = new Writer({ format: "text/turtle" }).quadsToString([
      ...resource.dataset,
    ]);
    expect(ttl).not.toHaveLength(0);
  });

  it("explicit rdfType", ({ expect }) => {
    const resource = kitchenSink.ExplicitRdfTypeStruct.toRdfResource(
      harnesses.explicitRdfTypeStruct.instance,
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
          kitchenSink.ExplicitRdfTypeStruct.schema.properties
            .explicitRdfTypeString.path,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("explicit toRdfType", ({ expect }) => {
    const resource = kitchenSink.ExplicitFromToRdfTypesStruct.toRdfResource(
      harnesses.explicitFromToRdfTypesStruct.instance,
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
          kitchenSink.ExplicitFromToRdfTypesStruct.schema.properties
            .explicitFromToRdfTypesString.path,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("should not serialize default values", ({ expect }) => {
    const resource = kitchenSink.DefaultValuesStruct.toRdfResource(
      harnesses.defaultValuesStruct.instance,
    );
    expect(resource.dataset.size).toStrictEqual(1); // Only the rdf:type
  });

  it("should serialize non-default values", ({ expect }) => {
    const resource = kitchenSink.DefaultValuesStruct.toRdfResource(
      harnesses.defaultValuesStructOverriddenDifferent.instance,
    );
    expect(resource.dataset.size).toStrictEqual(5); // Properties + the rdf:type
    expect(
      resource
        .value(
          kitchenSink.DefaultValuesStruct.schema.properties
            .falseBooleanDefaultValue.path,
        )
        .chain((value) => value.toBoolean())
        .unsafeCoerce(),
    ).toStrictEqual(true);
  });

  it("should not serialize empty lists", ({ expect }) => {
    const instance = kitchenSink.ListsStruct.createUnsafe();
    expect(instance.iriList.extract()).toBeUndefined();
    expect(instance.stringList.extract()).toBeUndefined();
    expect(instance.structList.extract()).toBeUndefined();

    const resource = kitchenSink.ListsStruct.toRdfResource(instance);
    expect(resource.dataset.size).toStrictEqual(1); // The rdf:type statement
  });

  for (const [idString, harness] of Object.entries(harnesses)) {
    const id = idString as keyof typeof harnesses;

    switch (id) {
      case "lazyPropertiesStructEmpty":
      case "lazyPropertiesStructNonEmpty":
      case "ignoredPropertiesStruct":
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

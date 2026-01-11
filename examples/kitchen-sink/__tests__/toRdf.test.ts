import { fail } from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { rdf } from "@tpluscode/rdf-ns-builders";
import N3, { DataFactory as dataFactory, Parser, Store } from "n3";
import SHACLValidator from "rdf-validate-shacl";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";
import { quadsToTurtle } from "./quadsToTurtle.js";

describe("toRdf", async () => {
  const shapesGraph = new Store();
  shapesGraph.addQuads(
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
    const resource = harnesses.concreteChildClass.toRdf();
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
          kitchenSink.ConcreteChildClass.$properties.concreteChildClassProperty
            .identifier,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("child");
  });

  it("should produce serializable RDF", ({ expect }) => {
    const resource = harnesses.nonClass.toRdf();
    const ttl = new N3.Writer({ format: "text/turtle" }).quadsToString([
      ...resource.dataset,
    ]);
    expect(ttl).not.toHaveLength(0);
  });

  it("explicit rdfType", ({ expect }) => {
    const resource = harnesses.explicitRdfTypeClass.toRdf();
    expect(resource.dataset.size).toStrictEqual(2); // One rdf:type and the property
    expect(
      resource.isInstanceOf(
        dataFactory.namedNode("http://example.com/RdfType"),
      ),
    ).toBe(true);
    expect(
      resource
        .value(
          kitchenSink.ExplicitRdfTypeClass.$properties.explicitRdfTypeProperty
            .identifier,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("explicit toRdfType", ({ expect }) => {
    const resource = harnesses.explicitFromToRdfTypesClass.toRdf();
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
          kitchenSink.ExplicitFromToRdfTypesClass.$properties
            .explicitFromToRdfTypesProperty.identifier,
        )
        .chain((value) => value.toString())
        .unsafeCoerce(),
    ).toStrictEqual("test");
  });

  it("should not serialize default values", ({ expect }) => {
    const resource = harnesses.defaultValuePropertiesClass.toRdf();
    expect(resource.dataset.size).toStrictEqual(0);
  });

  it("should serialize non-default values", ({ expect }) => {
    const resource =
      harnesses.defaultValuePropertiesOverriddenDifferent.toRdf();
    expect(resource.dataset.size).toStrictEqual(4);
    expect(
      resource
        .value(
          kitchenSink.DefaultValuePropertiesClass.$properties
            .falseBooleanDefaultValueProperty.identifier,
        )
        .chain((value) => value.toBoolean())
        .unsafeCoerce(),
    ).toStrictEqual(true);
  });

  for (const [id, harness] of Object.entries(harnesses)) {
    if (id.startsWith("lazy")) {
      continue;
    }
    it(`${id}: $toRdf produces RDF that conforms to the SHACL shape`, async ({
      expect,
    }) => {
      const dataResource = harness.toRdf();
      const dataGraph = dataResource.dataset;

      const shapeNode = dataFactory.namedNode(
        `http://example.com/${harness.shapeName}`,
      );
      expect(shapesGraph.match(shapeNode).size).toBeGreaterThan(0);

      const validationReport = new SHACLValidator(shapesGraph, {}).validateNode(
        dataGraph,
        dataResource.identifier,
        shapeNode,
      );
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

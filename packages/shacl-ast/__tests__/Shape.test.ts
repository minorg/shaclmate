import dataFactory from "@rdfjs/data-model";
import type { NamedNode } from "@rdfjs/types";
import { dash, schema, xsd } from "@tpluscode/rdf-ns-builders";
import { describe, expect, it } from "vitest";
import { testData } from "./testData.js";

describe("Shape", () => {
  const shapesGraph = testData.schema.shapesGraph;

  const findPropertyShape = (
    nodeShapeIdentifier: NamedNode,
    path: NamedNode,
  ) => {
    const nodeShape = shapesGraph
      .nodeShapeByIdentifier(nodeShapeIdentifier)
      .unsafeCoerce();
    const propertyShape = nodeShape.constraints.properties
      .unsafeCoerce()
      .find((propertyShape) => {
        const propertyShapePath = propertyShape.path;
        return (
          propertyShapePath.$type === "PredicatePath" &&
          propertyShapePath.iri.equals(path)
        );
      });
    expect(propertyShape).toBeDefined();
    return propertyShape!;
  };

  it("should have a description", ({ expect }) => {
    const descriptions = findPropertyShape(
      dash.ScriptAPIShape,
      dash.generateClass,
    ).descriptions;
    expect(descriptions).toHaveLength(1);
    expect(descriptions[0]).toMatch(/^The API generator/);
  });

  it("should be defined by an ontology", ({ expect }) => {
    const schemaShaclNodeShape = shapesGraph
      .nodeShapeByIdentifier(
        dataFactory.namedNode(
          "http://topbraid.org/examples/schemashacl#AustralianAddressShape",
        ),
      )
      .unsafeCoerce();
    const schemaShaclOntology = schemaShaclNodeShape.isDefinedBy
      .unsafeCoerce()
      .unsafeCoerce();
    expect(schemaShaclOntology.identifier.value).toStrictEqual(
      "http://topbraid.org/examples/schemashacl",
    );

    const dashNodeShape = shapesGraph
      .nodeShapeByIdentifier(dash.ScriptAPIShape)
      .unsafeCoerce();
    const dashOntology = dashNodeShape.isDefinedBy
      .unsafeCoerce()
      .unsafeCoerce();
    expect(dashOntology.identifier.value).toStrictEqual(
      "http://datashapes.org/dash",
    );
  });

  it("should have a name", ({ expect }) => {
    const names = findPropertyShape(schema.Person, schema.givenName).names;
    expect(names).toHaveLength(1);
    expect(names[0]).toStrictEqual("given name");
  });

  // No shape in the test data with a clean sh:and

  it("constraints: should have an sh:class", ({ expect }) => {
    const classes = findPropertyShape(schema.Person, schema.parent).constraints
      .classes;
    expect(classes).toHaveLength(1);
    expect(classes[0].equals(schema.Person)).toStrictEqual(true);
  });

  it("constraints: should have an sh:datatype", ({ expect }) => {
    expect(
      findPropertyShape(
        schema.Person,
        schema.givenName,
      ).constraints.datatype.extractNullable()?.value,
    ).toStrictEqual(xsd.string.value);

    expect(
      findPropertyShape(
        schema.Person,
        schema.parent,
      ).constraints.datatype.extractNullable(),
    ).toBeNull();
  });

  it("constraints: should have an sh:hasValue", ({ expect }) => {
    const hasValues = findPropertyShape(
      dataFactory.namedNode(
        "http://topbraid.org/examples/schemashacl#FemalePerson",
      ),
      schema.gender,
    ).constraints.hasValues;
    expect(hasValues).toHaveLength(1);
    expect(hasValues[0].value).toStrictEqual("female");
  });

  it("constraints: should have an sh:in", ({ expect }) => {
    const propertyShape = findPropertyShape(schema.Person, schema.gender);
    const in_ = propertyShape.constraints.in_;
    expect(in_).toHaveLength(2);
    expect(
      in_.find(
        (member) => member.termType === "Literal" && member.value === "female",
      ),
    );
    expect(
      in_.find(
        (member) => member.termType === "Literal" && member.value === "male",
      ),
    );
  });

  it("constraints: should have an sh:maxCount", ({ expect }) => {
    expect(
      findPropertyShape(
        schema.Person,
        schema.birthDate,
      ).constraints.maxCount.extractNullable(),
    ).toStrictEqual(1);
  });

  it("constraints: should have an sh:maxExclusive", ({ expect }) => {
    expect(
      findPropertyShape(
        schema.PriceSpecification,
        schema.baseSalary,
      ).constraints.maxExclusive.extractNullable()?.value,
    ).toStrictEqual("1000000000");
  });

  it("constraints: should have an sh:maxInclusive", ({ expect }) => {
    expect(
      findPropertyShape(
        schema.GeoCoordinates,
        schema.latitude,
      ).constraints.maxInclusive.extractNullable()?.value,
    ).toStrictEqual("90");
  });

  it("constraints: should have an sh:minCount", ({ expect }) => {
    expect(
      findPropertyShape(
        schema.DatedMoneySpecification,
        schema.amount,
      ).constraints.minCount.extractNullable(),
    ).toStrictEqual(1);
  });

  it("constraints: should have an sh:minExclusive", ({ expect }) => {
    expect(
      findPropertyShape(
        schema.PriceSpecification,
        schema.baseSalary,
      ).constraints.minExclusive.extractNullable()?.value,
    ).toStrictEqual("0");
  });

  it("constraints: should have an sh:minInclusive", ({ expect }) => {
    expect(
      findPropertyShape(
        schema.GeoCoordinates,
        schema.latitude,
      ).constraints.minInclusive.extractNullable()?.value,
    ).toStrictEqual("-90");
  });

  it("constraints: should have an sh:node", ({ expect }) => {
    const nodeShapes = findPropertyShape(
      schema.Vehicle,
      schema.fuelConsumption,
    ).constraints.nodes.unsafeCoerce();
    expect(nodeShapes).toHaveLength(1);
  });

  it("constraints: should have an sh:nodeKind", ({ expect }) => {
    const nodeKinds = findPropertyShape(schema.Person, schema.parent)
      .constraints.nodeKinds;
    expect(nodeKinds.size).toStrictEqual(1);
    expect(nodeKinds.has("IRI")).toStrictEqual(true);
  });

  // No shape in the test data with a clean sh:not

  it("constraints: should have sh:or", ({ expect }) => {
    const propertyShape = findPropertyShape(
      schema.DatedMoneySpecification,
      schema.endDate,
    );
    const or = propertyShape.constraints.or.unsafeCoerce();
    expect(or).toHaveLength(2);
    expect(
      or.some((propertyShape) =>
        propertyShape.constraints.datatype.extractNullable()?.equals(xsd.date),
      ),
    ).toStrictEqual(true);
    expect(
      or.some((propertyShape) =>
        propertyShape.constraints.datatype
          .extractNullable()
          ?.equals(xsd.dateTime),
      ),
    ).toStrictEqual(true);
  });

  // No sh:xone in the test data
});

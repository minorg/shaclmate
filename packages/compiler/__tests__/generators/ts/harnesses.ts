import type { BlankNode, NamedNode } from "@rdfjs/types";
import { DataFactory as dataFactory } from "n3";
import { ExternObjectType } from "../../../../../examples/kitchen-sink/ExternObjectType.js";
import * as kitchenSink from "../../../../../examples/kitchen-sink/generated.js";
import { ClassHarness } from "./ClassHarness.js";
import { InterfaceHarness } from "./InterfaceHarness.js";

const identifier = dataFactory.namedNode("http://example.com/instance");

export const harnesses = {
  concreteChildClassNodeShape: new ClassHarness({
    fromRdf: kitchenSink.ConcreteChildClassNodeShape.fromRdf,
    instance: new kitchenSink.ConcreteChildClassNodeShape({
      abcStringProperty: "abc",
      childStringProperty: "child",
      identifier,
      parentStringProperty: "parent",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.ConcreteChildClassNodeShape.SparqlGraphPatterns,
  }),
  concreteParentClassNodeShape: new ClassHarness({
    fromRdf: kitchenSink.ConcreteParentClassNodeShape.fromRdf,
    instance: new kitchenSink.ConcreteParentClassNodeShape({
      abcStringProperty: "abc",
      identifier,
      parentStringProperty: "parent",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.ConcreteParentClassNodeShape.SparqlGraphPatterns,
  }),
  interfaceNodeShape: new InterfaceHarness<
    kitchenSink.InterfaceNodeShape,
    BlankNode | NamedNode
  >({
    equals: kitchenSink.InterfaceNodeShape.equals,
    fromRdf: kitchenSink.InterfaceNodeShape.fromRdf,
    instance: {
      identifier,
      stringProperty: "Test",
      type: "InterfaceNodeShape",
    },
    sparqlGraphPatternsClass:
      kitchenSink.InterfaceNodeShape.SparqlGraphPatterns,
    toRdf: kitchenSink.InterfaceNodeShape.toRdf,
  }),
  iriNodeShape: new ClassHarness({
    fromRdf: kitchenSink.IriNodeShape.fromRdf,
    instance: new kitchenSink.IriNodeShape({
      identifier,
      stringProperty: "test",
    }),
    sparqlGraphPatternsClass: kitchenSink.IriNodeShape.SparqlGraphPatterns,
  }),
  nodeShapeWithDefaultValueProperties: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithDefaultValueProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithDefaultValueProperties({
      identifier,
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithDefaultValueProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithDefaultValuePropertiesOverriddenDifferent: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithDefaultValueProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithDefaultValueProperties({
      falseBooleanProperty: true,
      identifier,
      numberProperty: 1,
      stringProperty: "test",
      trueBooleanProperty: false,
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithDefaultValueProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithDefaultValuePropertiesOverriddenSame: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithDefaultValueProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithDefaultValueProperties({
      falseBooleanProperty: false,
      dateTimeProperty: new Date(1523268000000),
      identifier,
      numberProperty: 0,
      stringProperty: "",
      trueBooleanProperty: true,
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithDefaultValueProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithExplicitRdfTypes: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithExplicitRdfTypes.fromRdf,
    instance: new kitchenSink.NodeShapeWithExplicitRdfTypes({
      identifier,
      stringProperty: "test",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithExplicitRdfTypes.SparqlGraphPatterns,
  }),
  nodeShapeWithExternProperties: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithExternProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithExternProperties({
      externObjectTypeProperty: new ExternObjectType(
        dataFactory.namedNode("http://example.com/externObjectType"),
      ),
      externProperty: dataFactory.namedNode(
        "http://example.com/externProperty",
      ),
      identifier,
      inlineProperty: new kitchenSink.InlineNodeShape({
        stringProperty: "Test",
      }),
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithExternProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithHasValueProperties: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithHasValueProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithHasValueProperties({
      hasIriProperty: dataFactory.namedNode(
        "http://example.com/NodeShapeWithHasValuePropertiesIri1",
      ),
      identifier,
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithHasValueProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithInIrisProperty: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithInProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithInProperties({
      identifier,
      inIrisProperty: dataFactory.namedNode(
        "http://example.com/NodeShapeWithInPropertiesIri1",
      ),
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithInProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithInLiteralsProperty: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithInProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithInProperties({
      identifier,
      inStringsProperty: "text",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithInProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithLanguageInProperties: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithLanguageInProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithLanguageInProperties({
      identifier,
      literalProperty: dataFactory.literal("envalue", "en"),
      languageInProperty: dataFactory.literal("frvalue", "fr"),
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithLanguageInProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithListProperty: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithListProperty.fromRdf,
    instance: new kitchenSink.NodeShapeWithListProperty({
      identifier,
      listProperty: ["Test1", "Test2"],
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithListProperty.SparqlGraphPatterns,
  }),
  nodeShapeWithMutableProperties: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithMutableProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithMutableProperties({
      identifier,
      mutableListProperty: ["test1", "test2"],
      mutableStringProperty: "test",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithMutableProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithPropertyCardinalities: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithPropertyCardinalities.fromRdf,
    instance: new kitchenSink.NodeShapeWithPropertyCardinalities({
      identifier,
      optionalStringProperty: undefined,
      requiredStringProperty: "test",
      setStringProperty: ["test1"], // Has minCount 1
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithPropertyCardinalities.SparqlGraphPatterns,
  }),
  nodeShapeWithPropertyVisibilities: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithPropertyVisibilities.fromRdf,
    instance: new kitchenSink.NodeShapeWithPropertyVisibilities({
      identifier,
      privateProperty: "private",
      protectedProperty: "protected",
      publicProperty: "public",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithPropertyVisibilities.SparqlGraphPatterns,
  }),
  nodeShapeWithTermProperties: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithTermProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithTermProperties({
      booleanProperty: true,
      dateTimeProperty: new Date(),
      identifier,
      iriProperty: dataFactory.namedNode("http://example.com"),
      literalProperty: dataFactory.literal("test"),
      numberProperty: 1,
      stringProperty: "test",
      termProperty: 1,
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithTermProperties.SparqlGraphPatterns,
  }),
  nodeShapeWithUnionProperties: new ClassHarness({
    fromRdf: kitchenSink.NodeShapeWithUnionProperties.fromRdf,
    instance: new kitchenSink.NodeShapeWithUnionProperties({
      identifier,
      orLiteralsProperty: 1,
      orUnrelatedProperty: { type: "0-number", value: 1 },
      orTermsProperty: dataFactory.literal("test"),
    }),
    sparqlGraphPatternsClass:
      kitchenSink.NodeShapeWithUnionProperties.SparqlGraphPatterns,
  }),
  nonClassNodeShape: new ClassHarness({
    fromRdf: kitchenSink.NonClassNodeShape.fromRdf,
    instance: new kitchenSink.NonClassNodeShape({
      identifier,
      stringProperty: "Test",
    }),
    sparqlGraphPatternsClass: kitchenSink.NonClassNodeShape.SparqlGraphPatterns,
  }),
  sha256IriNodeShapeWithExplicitIdentifier: new ClassHarness({
    fromRdf: kitchenSink.Sha256IriNodeShape.fromRdf,
    instance: new kitchenSink.Sha256IriNodeShape({
      identifier,
      stringProperty: "test",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.Sha256IriNodeShape.SparqlGraphPatterns,
  }),
  sha256IriNodeShapeWithoutExplicitIdentifier: new ClassHarness({
    fromRdf: kitchenSink.Sha256IriNodeShape.fromRdf,
    instance: new kitchenSink.Sha256IriNodeShape({
      stringProperty: "test",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.Sha256IriNodeShape.SparqlGraphPatterns,
  }),
  unionNodeShapeMember1: new ClassHarness({
    fromRdf: kitchenSink.UnionNodeShapeMember1.fromRdf,
    instance: new kitchenSink.UnionNodeShapeMember1({
      identifier,
      stringProperty1: "test",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.UnionNodeShapeMember1.SparqlGraphPatterns,
  }),
  unionNodeShapeMember2: new ClassHarness({
    fromRdf: kitchenSink.UnionNodeShapeMember2.fromRdf,
    instance: new kitchenSink.UnionNodeShapeMember2({
      identifier,
      stringProperty2: "test",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.UnionNodeShapeMember2.SparqlGraphPatterns,
  }),
  uuidv4IriNodeShapeWithExplicitIdentifier: new ClassHarness({
    fromRdf: kitchenSink.UuidV4IriNodeShape.fromRdf,
    instance: new kitchenSink.UuidV4IriNodeShape({
      identifier,
      stringProperty: "test",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.UuidV4IriNodeShape.SparqlGraphPatterns,
  }),
  uuidv4IriNodeShapeWithoutExplicitIdentifier: new ClassHarness({
    fromRdf: kitchenSink.UuidV4IriNodeShape.fromRdf,
    instance: new kitchenSink.UuidV4IriNodeShape({
      stringProperty: "test",
    }),
    sparqlGraphPatternsClass:
      kitchenSink.UuidV4IriNodeShape.SparqlGraphPatterns,
  }),
};

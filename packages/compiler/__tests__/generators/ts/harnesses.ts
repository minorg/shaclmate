import type { BlankNode, NamedNode } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { DataFactory as dataFactory } from "n3";
import { NonEmptyList } from "purify-ts";
import { ClassHarness } from "./ClassHarness.js";
import { ClassUnionHarness } from "./ClassUnionHarness.js";
import { InterfaceHarness } from "./InterfaceHarness.js";

const identifier = dataFactory.namedNode("http://example.com/instance");

export const harnesses = {
  blankNodeShape: new ClassHarness({
    fromJson: kitchenSink.BlankNodeShape.fromJson,
    fromRdf: kitchenSink.BlankNodeShape.fromRdf,
    instance: new kitchenSink.BlankNodeShape({}),
    sparqlConstructQueryString:
      kitchenSink.BlankNodeShape.sparqlConstructQueryString,
  }),
  concreteChildClassNodeShape: new ClassHarness({
    fromJson: kitchenSink.ConcreteChildClassNodeShape.fromJson,
    fromRdf: kitchenSink.ConcreteChildClassNodeShape.fromRdf,
    instance: new kitchenSink.ConcreteChildClassNodeShape({
      abcStringProperty: "abc",
      childStringProperty: "child",
      identifier,
      parentStringProperty: "parent",
    }),
    sparqlConstructQueryString:
      kitchenSink.ConcreteChildClassNodeShape.sparqlConstructQueryString,
  }),
  concreteChildInterfaceNodeShape: new InterfaceHarness({
    equals: kitchenSink.ConcreteChildInterfaceNodeShape.equals,
    fromJson: kitchenSink.ConcreteChildInterfaceNodeShape.fromJson,
    fromRdf: kitchenSink.ConcreteChildInterfaceNodeShape.fromRdf,
    instance: {
      baseStringProperty: "abc",
      childStringProperty: "child",
      identifier,
      parentStringProperty: "parent",
      type: "ConcreteChildInterfaceNodeShape",
    },
    sparqlConstructQueryString:
      kitchenSink.ConcreteChildInterfaceNodeShape.sparqlConstructQueryString,
    toJson: kitchenSink.ConcreteChildInterfaceNodeShape.toJson,
    toRdf: kitchenSink.ConcreteChildInterfaceNodeShape.toRdf,
  }),
  concreteParentClassNodeShape: new ClassHarness({
    fromJson: kitchenSink.ConcreteParentClassNodeShape.fromJson,
    fromRdf: kitchenSink.ConcreteParentClassNodeShape.fromRdf,
    instance: new kitchenSink.ConcreteParentClassNodeShape({
      abcStringProperty: "abc",
      identifier,
      parentStringProperty: "parent",
    }),
    sparqlConstructQueryString:
      kitchenSink.ConcreteParentClassNodeShape.sparqlConstructQueryString,
  }),
  concreteParentInterfaceNodeShape: new InterfaceHarness({
    equals: kitchenSink.ConcreteParentInterfaceNodeShape.equals,
    fromJson: kitchenSink.ConcreteParentInterfaceNodeShape.fromJson,
    fromRdf: kitchenSink.ConcreteParentInterfaceNodeShape.fromRdf,
    instance: {
      baseStringProperty: "abc",
      identifier,
      parentStringProperty: "parent",
      type: "ConcreteParentInterfaceNodeShape",
    },
    sparqlConstructQueryString:
      kitchenSink.ConcreteParentInterfaceNodeShape.sparqlConstructQueryString,
    toJson: kitchenSink.ConcreteParentInterfaceNodeShape.toJson,
    toRdf: kitchenSink.ConcreteParentInterfaceNodeShape.toRdf,
  }),
  defaultValuePropertiesNodeShape: new ClassHarness({
    fromJson: kitchenSink.DefaultValuePropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.DefaultValuePropertiesNodeShape.fromRdf,
    instance: new kitchenSink.DefaultValuePropertiesNodeShape({
      identifier,
    }),
    sparqlConstructQueryString:
      kitchenSink.DefaultValuePropertiesNodeShape.sparqlConstructQueryString,
  }),
  defaultValuePropertiesOverriddenDifferent: new ClassHarness({
    fromJson: kitchenSink.DefaultValuePropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.DefaultValuePropertiesNodeShape.fromRdf,
    instance: new kitchenSink.DefaultValuePropertiesNodeShape({
      falseBooleanProperty: true,
      identifier,
      numberProperty: 1,
      stringProperty: "test",
      trueBooleanProperty: false,
    }),
    sparqlConstructQueryString:
      kitchenSink.DefaultValuePropertiesNodeShape.sparqlConstructQueryString,
  }),
  defaultValuePropertiesOverriddenSame: new ClassHarness({
    fromJson: kitchenSink.DefaultValuePropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.DefaultValuePropertiesNodeShape.fromRdf,
    instance: new kitchenSink.DefaultValuePropertiesNodeShape({
      falseBooleanProperty: false,
      dateProperty: new Date("2025-03-06"),
      dateTimeProperty: new Date(1523268000000),
      identifier,
      numberProperty: 0,
      stringProperty: "",
      trueBooleanProperty: true,
    }),
    sparqlConstructQueryString:
      kitchenSink.DefaultValuePropertiesNodeShape.sparqlConstructQueryString,
  }),
  emptyListProperty: new ClassHarness({
    fromJson: kitchenSink.ListPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.ListPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.ListPropertiesNodeShape({
      identifier,
      stringListProperty: [],
    }),
    sparqlConstructQueryString:
      kitchenSink.ListPropertiesNodeShape.sparqlConstructQueryString,
  }),
  explicitRdfTypes: new ClassHarness({
    fromJson: kitchenSink.ExplicitRdfTypesNodeShape.fromJson,
    fromRdf: kitchenSink.ExplicitRdfTypesNodeShape.fromRdf,
    instance: new kitchenSink.ExplicitRdfTypesNodeShape({
      identifier,
      stringProperty: "test",
    }),
    sparqlConstructQueryString:
      kitchenSink.ExplicitRdfTypesNodeShape.sparqlConstructQueryString,
  }),
  externProperties: new ClassHarness({
    fromJson: kitchenSink.ExternPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.ExternPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.ExternPropertiesNodeShape({
      externObjectTypeProperty: new kitchenSink.ExternObjectType(
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
    sparqlConstructQueryString:
      kitchenSink.ExternPropertiesNodeShape.sparqlConstructQueryString,
  }),
  hasValueProperties: new ClassHarness({
    fromJson: kitchenSink.HasValuePropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.HasValuePropertiesNodeShape.fromRdf,
    instance: new kitchenSink.HasValuePropertiesNodeShape({
      hasIriProperty: dataFactory.namedNode(
        "http://example.com/HasValuePropertiesNodeShapeIri1",
      ),
      identifier,
    }),
    sparqlConstructQueryString:
      kitchenSink.HasValuePropertiesNodeShape.sparqlConstructQueryString,
  }),
  inIdentifierNodeShape: new ClassHarness({
    fromJson: kitchenSink.InIdentifierNodeShape.fromJson,
    fromRdf: kitchenSink.InIdentifierNodeShape.fromRdf,
    instance: new kitchenSink.InIdentifierNodeShape({
      identifier: dataFactory.namedNode(
        "http://example.com/InIdentifierNodeShapeInstance1",
      ),
      stringProperty: "doesn't matter",
    }),
    sparqlConstructQueryString:
      kitchenSink.InIdentifierNodeShape.sparqlConstructQueryString,
  }),
  inIrisProperty: new ClassHarness({
    fromJson: kitchenSink.InPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.InPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.InPropertiesNodeShape({
      identifier,
      inIrisProperty: dataFactory.namedNode(
        "http://example.com/InPropertiesNodeShapeIri1",
      ),
    }),
    sparqlConstructQueryString:
      kitchenSink.InPropertiesNodeShape.sparqlConstructQueryString,
  }),
  inLiteralsProperty: new ClassHarness({
    fromJson: kitchenSink.InPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.InPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.InPropertiesNodeShape({
      identifier,
      inStringsProperty: "text",
    }),
    sparqlConstructQueryString:
      kitchenSink.InPropertiesNodeShape.sparqlConstructQueryString,
  }),
  interfaceNodeShape: new InterfaceHarness<
    kitchenSink.InterfaceNodeShape,
    BlankNode | NamedNode
  >({
    fromJson: kitchenSink.InterfaceNodeShape.fromJson,
    equals: kitchenSink.InterfaceNodeShape.equals,
    fromRdf: kitchenSink.InterfaceNodeShape.fromRdf,
    instance: {
      identifier,
      stringProperty: "Test",
      type: "InterfaceNodeShape",
    },
    sparqlConstructQueryString:
      kitchenSink.InterfaceNodeShape.sparqlConstructQueryString,
    toJson: kitchenSink.InterfaceNodeShape.toJson,
    toRdf: kitchenSink.InterfaceNodeShape.toRdf,
  }),
  interfaceUnionNodeShapeMember1: new InterfaceHarness<
    kitchenSink.InterfaceUnionNodeShape,
    BlankNode | NamedNode
  >({
    fromJson: kitchenSink.InterfaceUnionNodeShape.fromJson,
    equals: kitchenSink.InterfaceUnionNodeShape.equals,
    fromRdf: kitchenSink.InterfaceUnionNodeShape.fromRdf,
    instance: {
      identifier,
      stringProperty1: "Test1",
      type: "InterfaceUnionNodeShapeMember1",
    },
    sparqlConstructQueryString:
      kitchenSink.InterfaceUnionNodeShape.sparqlConstructQueryString,
    toJson: kitchenSink.InterfaceUnionNodeShape.toJson,
    toRdf: kitchenSink.InterfaceUnionNodeShape.toRdf,
  }),
  interfaceUnionNodeShapeMember2: new InterfaceHarness<
    kitchenSink.InterfaceUnionNodeShape,
    BlankNode | NamedNode
  >({
    fromJson: kitchenSink.InterfaceUnionNodeShape.fromJson,
    equals: kitchenSink.InterfaceUnionNodeShape.equals,
    fromRdf: kitchenSink.InterfaceUnionNodeShape.fromRdf,
    instance: {
      identifier,
      stringProperty2a: "Test2",
      type: "InterfaceUnionNodeShapeMember2a",
    },
    sparqlConstructQueryString:
      kitchenSink.InterfaceUnionNodeShape.sparqlConstructQueryString,
    toJson: kitchenSink.InterfaceUnionNodeShape.toJson,
    toRdf: kitchenSink.InterfaceUnionNodeShape.toRdf,
  }),
  iriNodeShape: new ClassHarness({
    fromJson: kitchenSink.IriNodeShape.fromJson,
    fromRdf: kitchenSink.IriNodeShape.fromRdf,
    instance: new kitchenSink.IriNodeShape({
      identifier,
    }),
    sparqlConstructQueryString:
      kitchenSink.IriNodeShape.sparqlConstructQueryString,
  }),
  languageInProperties: new ClassHarness({
    fromJson: kitchenSink.LanguageInPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.LanguageInPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.LanguageInPropertiesNodeShape({
      identifier,
      literalProperty: dataFactory.literal("envalue", "en"),
      languageInProperty: dataFactory.literal("frvalue", "fr"),
    }),
    sparqlConstructQueryString:
      kitchenSink.LanguageInPropertiesNodeShape.sparqlConstructQueryString,
  }),
  mutableProperties: new ClassHarness({
    fromJson: kitchenSink.MutablePropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.MutablePropertiesNodeShape.fromRdf,
    instance: new kitchenSink.MutablePropertiesNodeShape({
      identifier,
      mutableListProperty: ["test1", "test2"],
      mutableStringProperty: "test",
      mutableSetProperty: ["test1", "test2"],
    }),
    sparqlConstructQueryString:
      kitchenSink.MutablePropertiesNodeShape.sparqlConstructQueryString,
  }),
  objectListProperty: new ClassHarness({
    fromJson: kitchenSink.ListPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.ListPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.ListPropertiesNodeShape({
      identifier,
      objectListProperty: [
        new kitchenSink.NonClassNodeShape({ stringProperty: "Test1" }),
        new kitchenSink.NonClassNodeShape({ stringProperty: "Test2" }),
      ],
    }),
    sparqlConstructQueryString:
      kitchenSink.ListPropertiesNodeShape.sparqlConstructQueryString,
  }),
  orderedProperties: new ClassHarness({
    fromJson: kitchenSink.OrderedPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.OrderedPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.OrderedPropertiesNodeShape({
      identifier,
      propertyA: "testA",
      propertyB: "testB",
      propertyC: "testC",
    }),
    sparqlConstructQueryString:
      kitchenSink.OrderedPropertiesNodeShape.sparqlConstructQueryString,
  }),
  propertyCardinalities: new ClassHarness({
    fromJson: kitchenSink.PropertyCardinalitiesNodeShape.fromJson,
    fromRdf: kitchenSink.PropertyCardinalitiesNodeShape.fromRdf,
    instance: new kitchenSink.PropertyCardinalitiesNodeShape({
      identifier,
      emptyStringSetProperty: undefined,
      nonEmptyStringSetProperty: NonEmptyList(["test1"]),
      optionalStringProperty: undefined,
      requiredStringProperty: "test",
    }),
    sparqlConstructQueryString:
      kitchenSink.PropertyCardinalitiesNodeShape.sparqlConstructQueryString,
  }),
  propertyVisibilities: new ClassHarness({
    fromJson: kitchenSink.PropertyVisibilitiesNodeShape.fromJson,
    fromRdf: kitchenSink.PropertyVisibilitiesNodeShape.fromRdf,
    instance: new kitchenSink.PropertyVisibilitiesNodeShape({
      identifier,
      privateProperty: "private",
      protectedProperty: "protected",
      publicProperty: "public",
    }),
    sparqlConstructQueryString:
      kitchenSink.PropertyVisibilitiesNodeShape.sparqlConstructQueryString,
  }),
  nonClassNodeShape: new ClassHarness({
    fromJson: kitchenSink.NonClassNodeShape.fromJson,
    fromRdf: kitchenSink.NonClassNodeShape.fromRdf,
    instance: new kitchenSink.NonClassNodeShape({
      identifier,
      stringProperty: "Test",
    }),
    sparqlConstructQueryString:
      kitchenSink.NonClassNodeShape.sparqlConstructQueryString,
  }),
  sha256IriNodeShapeWithExplicitIdentifier: new ClassHarness({
    fromJson: kitchenSink.Sha256IriNodeShape.fromJson,
    fromRdf: kitchenSink.Sha256IriNodeShape.fromRdf,
    instance: new kitchenSink.Sha256IriNodeShape({
      identifier,
      stringProperty: "test",
    }),
    sparqlConstructQueryString:
      kitchenSink.Sha256IriNodeShape.sparqlConstructQueryString,
  }),
  sha256IriNodeShapeWithoutExplicitIdentifier: new ClassHarness({
    fromJson: kitchenSink.Sha256IriNodeShape.fromJson,
    fromRdf: kitchenSink.Sha256IriNodeShape.fromRdf,
    instance: new kitchenSink.Sha256IriNodeShape({
      stringProperty: "test",
    }),
    sparqlConstructQueryString:
      kitchenSink.Sha256IriNodeShape.sparqlConstructQueryString,
  }),
  stringListProperty: new ClassHarness({
    fromJson: kitchenSink.ListPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.ListPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.ListPropertiesNodeShape({
      identifier,
      stringListProperty: ["Test1", "Test2"],
    }),
    sparqlConstructQueryString:
      kitchenSink.ListPropertiesNodeShape.sparqlConstructQueryString,
  }),
  termProperties: new ClassHarness({
    fromJson: kitchenSink.TermPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.TermPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.TermPropertiesNodeShape({
      booleanProperty: true,
      dateProperty: new Date("2025-03-06"),
      dateTimeProperty: new Date(1523268000000),
      identifier,
      iriProperty: dataFactory.namedNode("http://example.com"),
      literalProperty: dataFactory.literal("test"),
      numberProperty: 1,
      stringProperty: "test",
      termProperty: 1,
    }),
    sparqlConstructQueryString:
      kitchenSink.TermPropertiesNodeShape.sparqlConstructQueryString,
  }),
  unionNodeShapeMember1: new ClassUnionHarness({
    equals: kitchenSink.UnionNodeShape.equals,
    fromJson: kitchenSink.UnionNodeShape.fromJson,
    fromRdf: kitchenSink.UnionNodeShape.fromRdf,
    instance: new kitchenSink.UnionNodeShapeMember1({
      identifier,
      stringProperty1: "test",
    }),
    sparqlConstructQueryString:
      kitchenSink.UnionNodeShape.sparqlConstructQueryString,
  }),
  unionNodeShapeMember2: new ClassUnionHarness({
    equals: kitchenSink.UnionNodeShape.equals,
    fromJson: kitchenSink.UnionNodeShape.fromJson,
    fromRdf: kitchenSink.UnionNodeShape.fromRdf,
    instance: new kitchenSink.UnionNodeShapeMember2({
      identifier,
      stringProperty2: "test",
    }),
    sparqlConstructQueryString:
      kitchenSink.UnionNodeShape.sparqlConstructQueryString,
  }),
  unionProperties: new ClassHarness({
    fromJson: kitchenSink.UnionPropertiesNodeShape.fromJson,
    fromRdf: kitchenSink.UnionPropertiesNodeShape.fromRdf,
    instance: new kitchenSink.UnionPropertiesNodeShape({
      identifier,
      orLiteralsProperty: 1,
      orUnrelatedProperty: { type: "0-number", value: 1 },
      orTermsProperty: dataFactory.literal("test"),
    }),
    sparqlConstructQueryString:
      kitchenSink.UnionPropertiesNodeShape.sparqlConstructQueryString,
  }),
  uuidv4IriNodeShapeWithExplicitIdentifier: new ClassHarness({
    fromJson: kitchenSink.UuidV4IriNodeShape.fromJson,
    fromRdf: kitchenSink.UuidV4IriNodeShape.fromRdf,
    instance: new kitchenSink.UuidV4IriNodeShape({
      identifier,
      stringProperty: "test",
    }),
    sparqlConstructQueryString:
      kitchenSink.UuidV4IriNodeShape.sparqlConstructQueryString,
  }),
  uuidv4IriNodeShapeWithoutExplicitIdentifier: new ClassHarness({
    fromJson: kitchenSink.UuidV4IriNodeShape.fromJson,
    fromRdf: kitchenSink.UuidV4IriNodeShape.fromRdf,
    instance: new kitchenSink.UuidV4IriNodeShape({
      stringProperty: "test",
    }),
    sparqlConstructQueryString:
      kitchenSink.UuidV4IriNodeShape.sparqlConstructQueryString,
  }),
};

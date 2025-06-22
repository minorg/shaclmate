import * as kitchenSink from "@shaclmate/kitchen-sink-example";

import type { BlankNode, NamedNode } from "@rdfjs/types";

import { DataFactory as dataFactory } from "n3";
import { NonEmptyList } from "purify-ts";

import { ClassHarness } from "./ClassHarness.js";
import { ClassUnionHarness } from "./ClassUnionHarness.js";
import { InterfaceHarness } from "./InterfaceHarness.js";

const identifier = dataFactory.namedNode("http://example.com/instance");

export const harnesses = {
  blankNodeShape: new ClassHarness(
    new kitchenSink.BlankNodeShape({}),
    kitchenSink.BlankNodeShape,
  ),
  concreteChildClassNodeShape: new ClassHarness(
    new kitchenSink.ConcreteChildClassNodeShape({
      abcStringProperty: "abc",
      childStringProperty: "child",
      identifier,
      parentStringProperty: "parent",
    }),
    kitchenSink.ConcreteChildClassNodeShape,
  ),
  concreteChildInterfaceNodeShape: new InterfaceHarness(
    {
      baseStringProperty: "abc",
      childStringProperty: "child",
      identifier,
      parentStringProperty: "parent",
      type: "ConcreteChildInterfaceNodeShape",
    },
    kitchenSink.ConcreteChildInterfaceNodeShape,
  ),
  concreteParentClassNodeShape: new ClassHarness(
    new kitchenSink.ConcreteParentClassNodeShape({
      abcStringProperty: "abc",
      identifier,
      parentStringProperty: "parent",
    }),
    kitchenSink.ConcreteParentClassNodeShapeStatic,
  ),
  concreteParentInterfaceNodeShape: new InterfaceHarness(
    {
      baseStringProperty: "abc",
      identifier,
      parentStringProperty: "parent",
      type: "ConcreteParentInterfaceNodeShape",
    },
    kitchenSink.ConcreteParentInterfaceNodeShapeStatic,
  ),
  defaultValuePropertiesNodeShape: new ClassHarness(
    new kitchenSink.DefaultValuePropertiesNodeShape({
      identifier,
    }),
    kitchenSink.DefaultValuePropertiesNodeShape,
  ),
  defaultValuePropertiesOverriddenDifferent: new ClassHarness(
    new kitchenSink.DefaultValuePropertiesNodeShape({
      falseBooleanProperty: true,
      identifier,
      numberProperty: 1,
      stringProperty: "test",
      trueBooleanProperty: false,
    }),
    kitchenSink.DefaultValuePropertiesNodeShape,
  ),
  defaultValuePropertiesOverriddenSame: new ClassHarness(
    new kitchenSink.DefaultValuePropertiesNodeShape({
      falseBooleanProperty: false,
      dateProperty: new Date("2025-03-06"),
      dateTimeProperty: new Date(1523268000000),
      identifier,
      numberProperty: 0,
      stringProperty: "",
      trueBooleanProperty: true,
    }),
    kitchenSink.DefaultValuePropertiesNodeShape,
  ),
  emptyListProperty: new ClassHarness(
    new kitchenSink.ListPropertiesNodeShape({
      identifier,
      stringListProperty: [],
    }),
    kitchenSink.ListPropertiesNodeShape,
  ),
  explicitFromToRdfTypes: new ClassHarness(
    new kitchenSink.ExplicitFromToRdfTypesNodeShape({
      identifier,
      stringProperty: "test",
    }),
    kitchenSink.ExplicitFromToRdfTypesNodeShape,
  ),
  explicitRdfType: new ClassHarness(
    new kitchenSink.ExplicitRdfTypeNodeShape({
      identifier,
      stringProperty: "test",
    }),
    kitchenSink.ExplicitRdfTypeNodeShape,
  ),
  externProperties: new ClassHarness(
    new kitchenSink.ExternPropertiesNodeShape({
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
    kitchenSink.ExternPropertiesNodeShape,
  ),
  hasValueProperties: new ClassHarness(
    new kitchenSink.HasValuePropertiesNodeShape({
      hasIriProperty: dataFactory.namedNode(
        "http://example.com/HasValuePropertiesNodeShapeIri1",
      ),
      identifier,
    }),
    kitchenSink.HasValuePropertiesNodeShape,
  ),
  inIdentifierNodeShape: new ClassHarness(
    new kitchenSink.InIdentifierNodeShape({
      identifier: dataFactory.namedNode(
        "http://example.com/InIdentifierNodeShapeInstance1",
      ),
      stringProperty: "doesn't matter",
    }),
    kitchenSink.InIdentifierNodeShape,
  ),
  inIrisProperty: new ClassHarness(
    new kitchenSink.InPropertiesNodeShape({
      identifier,
      inIrisProperty: dataFactory.namedNode(
        "http://example.com/InPropertiesNodeShapeIri1",
      ),
    }),
    kitchenSink.InPropertiesNodeShape,
  ),
  inLiteralsProperty: new ClassHarness(
    new kitchenSink.InPropertiesNodeShape({
      identifier,
      inStringsProperty: "text",
    }),
    kitchenSink.InPropertiesNodeShape,
  ),
  interfaceNodeShape: new InterfaceHarness<
    kitchenSink.InterfaceNodeShape,
    BlankNode | NamedNode
  >(
    {
      identifier,
      stringProperty: "Test",
      type: "InterfaceNodeShape",
    },
    kitchenSink.InterfaceNodeShape,
  ),
  interfaceUnionNodeShapeMember1: new InterfaceHarness<
    kitchenSink.InterfaceUnionNodeShape,
    BlankNode | NamedNode
  >(
    {
      identifier,
      stringProperty1: "Test1",
      type: "InterfaceUnionNodeShapeMember1",
    },
    kitchenSink.InterfaceUnionNodeShape,
  ),
  interfaceUnionNodeShapeMember2: new InterfaceHarness<
    kitchenSink.InterfaceUnionNodeShape,
    BlankNode | NamedNode
  >(
    {
      identifier,
      stringProperty2a: "Test2",
      type: "InterfaceUnionNodeShapeMember2a",
    },
    kitchenSink.InterfaceUnionNodeShape,
  ),
  iriNodeShape: new ClassHarness(
    new kitchenSink.IriNodeShape({
      identifier,
    }),
    kitchenSink.IriNodeShape,
  ),
  languageInProperties: new ClassHarness(
    new kitchenSink.LanguageInPropertiesNodeShape({
      identifier,
      literalProperty: dataFactory.literal("envalue", "en"),
      languageInProperty: dataFactory.literal("frvalue", "fr"),
    }),
    kitchenSink.LanguageInPropertiesNodeShape,
  ),
  mutableProperties: new ClassHarness(
    new kitchenSink.MutablePropertiesNodeShape({
      identifier,
      mutableListProperty: ["test1", "test2"],
      mutableStringProperty: "test",
      mutableSetProperty: ["test1", "test2"],
    }),
    kitchenSink.MutablePropertiesNodeShape,
  ),
  objectListProperty: new ClassHarness(
    new kitchenSink.ListPropertiesNodeShape({
      identifier,
      objectListProperty: [
        new kitchenSink.NonClassNodeShape({ stringProperty: "Test1" }),
        new kitchenSink.NonClassNodeShape({ stringProperty: "Test2" }),
      ],
    }),
    kitchenSink.ListPropertiesNodeShape,
  ),
  orderedProperties: new ClassHarness(
    new kitchenSink.OrderedPropertiesNodeShape({
      identifier,
      propertyA: "testA",
      propertyB: "testB",
      propertyC: "testC",
    }),
    kitchenSink.OrderedPropertiesNodeShape,
  ),
  propertyCardinalities: new ClassHarness(
    new kitchenSink.PropertyCardinalitiesNodeShape({
      identifier,
      emptyStringSetProperty: undefined,
      nonEmptyStringSetProperty: NonEmptyList(["test1"]),
      optionalStringProperty: undefined,
      requiredStringProperty: "test",
    }),
    kitchenSink.PropertyCardinalitiesNodeShape,
  ),
  propertyVisibilities: new ClassHarness(
    new kitchenSink.PropertyVisibilitiesNodeShape({
      identifier,
      privateProperty: "private",
      protectedProperty: "protected",
      publicProperty: "public",
    }),
    kitchenSink.PropertyVisibilitiesNodeShape,
  ),
  nonClassNodeShape: new ClassHarness(
    new kitchenSink.NonClassNodeShape({
      identifier,
      stringProperty: "Test",
    }),
    kitchenSink.NonClassNodeShape,
  ),
  sha256IriNodeShapeWithExplicitIdentifier: new ClassHarness(
    new kitchenSink.Sha256IriNodeShape({
      identifier,
      stringProperty: "test",
    }),
    kitchenSink.Sha256IriNodeShape,
  ),
  sha256IriNodeShapeWithoutExplicitIdentifier: new ClassHarness(
    new kitchenSink.Sha256IriNodeShape({
      stringProperty: "test",
    }),
    kitchenSink.Sha256IriNodeShape,
  ),
  stringListProperty: new ClassHarness(
    new kitchenSink.ListPropertiesNodeShape({
      identifier,
      stringListProperty: ["Test1", "Test2"],
    }),
    kitchenSink.ListPropertiesNodeShape,
  ),
  termProperties: new ClassHarness(
    new kitchenSink.TermPropertiesNodeShape({
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
    kitchenSink.TermPropertiesNodeShape,
  ),
  unionNodeShapeMember1: new ClassUnionHarness(
    new kitchenSink.UnionNodeShapeMember1({
      identifier,
      stringProperty1: "test",
    }),
    kitchenSink.UnionNodeShape,
  ),
  unionNodeShapeMember2: new ClassUnionHarness(
    new kitchenSink.UnionNodeShapeMember2({
      identifier,
      stringProperty2: "test",
    }),
    kitchenSink.UnionNodeShape,
  ),
  unionProperties1: new ClassHarness(
    new kitchenSink.UnionPropertiesNodeShape({
      identifier,
      narrowLiteralsProperty: 1,
      unrelatedTypesProperty: 1,
      widenedLiteralsProperty: 1,
      widenedTermsProperty: dataFactory.literal("test"),
    }),
    kitchenSink.UnionPropertiesNodeShape,
  ),
  unionProperties2: new ClassHarness(
    new kitchenSink.UnionPropertiesNodeShape({
      identifier,
      narrowLiteralsProperty: 1,
      unrelatedTypesProperty: new kitchenSink.NonClassNodeShape({
        stringProperty: "test",
      }),
      widenedLiteralsProperty: new Date(),
      widenedTermsProperty: dataFactory.literal("test"),
    }),
    kitchenSink.UnionPropertiesNodeShape,
  ),
  uuidv4IriNodeShapeWithExplicitIdentifier: new ClassHarness(
    new kitchenSink.UuidV4IriNodeShape({
      identifier,
      stringProperty: "test",
    }),
    kitchenSink.UuidV4IriNodeShape,
  ),
  uuidv4IriNodeShapeWithoutExplicitIdentifier: new ClassHarness(
    new kitchenSink.UuidV4IriNodeShape({
      stringProperty: "test",
    }),
    kitchenSink.UuidV4IriNodeShape,
  ),
};

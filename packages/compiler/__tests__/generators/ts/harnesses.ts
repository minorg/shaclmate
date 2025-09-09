import * as kitchenSink from "@shaclmate/kitchen-sink-example";

import type { BlankNode, NamedNode } from "@rdfjs/types";

import { DataFactory as dataFactory } from "n3";
import { NonEmptyList } from "purify-ts";

import { ClassHarness } from "./ClassHarness.js";
import { ClassUnionHarness } from "./ClassUnionHarness.js";
import { InterfaceHarness } from "./InterfaceHarness.js";

const $identifier = dataFactory.namedNode("http://example.com/instance");

export const harnesses = {
  blankClass: new ClassHarness(
    new kitchenSink.BlankClass({}),
    kitchenSink.BlankClass,
  ),
  classUnionMember1: new ClassUnionHarness(
    new kitchenSink.ClassUnionMember1({
      $identifier,
      classUnionMember1Property: "test",
    }),
    kitchenSink.ClassUnion,
  ),
  classUnionMember2: new ClassUnionHarness(
    new kitchenSink.ClassUnionMember2({
      $identifier,
      classUnionMember2Property: "test",
    }),
    kitchenSink.ClassUnion,
  ),
  concreteChildClass: new ClassHarness(
    new kitchenSink.ConcreteChildClass({
      abstractBaseClassWithPropertiesProperty: "abc",
      concreteChildClassProperty: "child",
      concreteParentClassProperty: "parent",
      $identifier,
    }),
    kitchenSink.ConcreteChildClass,
  ),
  concreteChildInterface: new InterfaceHarness(
    {
      baseInterfaceWithPropertiesProperty: "abc",
      concreteChildInterfaceProperty: "child",
      concreteParentInterfaceProperty: "parent",
      $identifier,
      $type: "ConcreteChildInterface",
    },
    kitchenSink.ConcreteChildInterface,
  ),
  concreteParentClass: new ClassHarness(
    new kitchenSink.ConcreteParentClass({
      abstractBaseClassWithPropertiesProperty: "abc",
      concreteParentClassProperty: "parent",
      $identifier,
    }),
    kitchenSink.ConcreteParentClassStatic,
  ),
  concreteParentInterface: new InterfaceHarness(
    {
      baseInterfaceWithPropertiesProperty: "abc",
      concreteParentInterfaceProperty: "parent",
      $identifier,
      $type: "ConcreteParentInterface",
    },
    kitchenSink.ConcreteParentInterfaceStatic,
  ),
  defaultValuePropertiesClass: new ClassHarness(
    new kitchenSink.DefaultValuePropertiesClass({
      $identifier,
    }),
    kitchenSink.DefaultValuePropertiesClass,
  ),
  defaultValuePropertiesOverriddenDifferent: new ClassHarness(
    new kitchenSink.DefaultValuePropertiesClass({
      falseBooleanDefaultValueProperty: true,
      $identifier,
      numberDefaultValueProperty: 1,
      stringDefaultValueProperty: "test",
      trueBooleanDefaultValueProperty: false,
    }),
    kitchenSink.DefaultValuePropertiesClass,
  ),
  defaultValuePropertiesOverriddenSame: new ClassHarness(
    new kitchenSink.DefaultValuePropertiesClass({
      falseBooleanDefaultValueProperty: false,
      dateDefaultValueProperty: new Date("2025-03-06"),
      dateTimeDefaultValueProperty: new Date(1523268000000),
      $identifier,
      numberDefaultValueProperty: 0,
      stringDefaultValueProperty: "",
      trueBooleanDefaultValueProperty: true,
    }),
    kitchenSink.DefaultValuePropertiesClass,
  ),
  directRecursive: new ClassHarness(
    new kitchenSink.DirectRecursiveClass({
      directRecursiveProperty: new kitchenSink.DirectRecursiveClass({}),
    }),
    kitchenSink.DirectRecursiveClass,
  ),
  emptyListPropertiesClass: new ClassHarness(
    new kitchenSink.ListPropertiesClass({
      $identifier,
      stringListProperty: [],
    }),
    kitchenSink.ListPropertiesClass,
  ),
  explicitFromToRdfTypesClass: new ClassHarness(
    new kitchenSink.ExplicitFromToRdfTypesClass({
      explicitFromToRdfTypesProperty: "test",
      $identifier,
    }),
    kitchenSink.ExplicitFromToRdfTypesClass,
  ),
  explicitRdfTypeClass: new ClassHarness(
    new kitchenSink.ExplicitRdfTypeClass({
      explicitRdfTypeProperty: "test",
      $identifier,
    }),
    kitchenSink.ExplicitRdfTypeClass,
  ),
  indirectRecursive: new ClassHarness(
    new kitchenSink.IndirectRecursiveClass({
      indirectRecursiveHelperProperty:
        new kitchenSink.IndirectRecursiveHelperClass({
          indirectRecursiveProperty: new kitchenSink.IndirectRecursiveClass({}),
        }),
    }),
    kitchenSink.IndirectRecursiveClass,
  ),
  hasIriValuePropertiesClass: new ClassHarness(
    new kitchenSink.HasValuePropertiesClass({
      hasIriValueProperty: dataFactory.namedNode(
        "http://example.com/HasValuePropertiesClassIri1",
      ),
      $identifier,
    }),
    kitchenSink.HasValuePropertiesClass,
  ),
  hasLiteralValuePropertiesClass: new ClassHarness(
    new kitchenSink.HasValuePropertiesClass({
      hasLiteralValueProperty: "test",
      $identifier,
    }),
    kitchenSink.HasValuePropertiesClass,
  ),
  inIdentifierClass: new ClassHarness(
    new kitchenSink.InIdentifierClass({
      $identifier: dataFactory.namedNode(
        "http://example.com/InIdentifierInstance1",
      ),
      inIdentifierProperty: "doesn't matter",
    }),
    kitchenSink.InIdentifierClass,
  ),
  inIrisPropertyClass: new ClassHarness(
    new kitchenSink.InPropertiesClass({
      $identifier,
      inIrisProperty: dataFactory.namedNode(
        "http://example.com/InPropertiesIri1",
      ),
    }),
    kitchenSink.InPropertiesClass,
  ),
  inLiteralsPropertyCLass: new ClassHarness(
    new kitchenSink.InPropertiesClass({
      $identifier,
      inStringsProperty: "text",
    }),
    kitchenSink.InPropertiesClass,
  ),
  interfaceClass: new InterfaceHarness<
    kitchenSink.Interface,
    BlankNode | NamedNode
  >(
    {
      $identifier,
      interfaceProperty: "Test",
      $type: "Interface",
    },
    kitchenSink.Interface,
  ),
  interfaceUnionMember1: new InterfaceHarness<
    kitchenSink.InterfaceUnion,
    BlankNode | NamedNode
  >(
    {
      $identifier,
      interfaceUnionMember1Property: "Test1",
      $type: "InterfaceUnionMember1",
    },
    kitchenSink.InterfaceUnion,
  ),
  interfaceUnionMember2a: new InterfaceHarness<
    kitchenSink.InterfaceUnion,
    BlankNode | NamedNode
  >(
    {
      $identifier,
      interfaceUnionMember2aProperty: "Test2",
      $type: "InterfaceUnionMember2a",
    },
    kitchenSink.InterfaceUnion,
  ),
  iriClass: new ClassHarness(
    new kitchenSink.IriClass({
      $identifier,
    }),
    kitchenSink.IriClass,
  ),
  languageInPropertiesClass: new ClassHarness(
    new kitchenSink.LanguageInPropertiesClass({
      $identifier,
      languageInPropertiesLanguageInProperty: dataFactory.literal(
        "frvalue",
        "fr",
      ),
      languageInPropertiesLiteralProperty: dataFactory.literal("envalue", "en"),
    }),
    kitchenSink.LanguageInPropertiesClass,
  ),
  mutablePropertiesClass: new ClassHarness(
    new kitchenSink.MutablePropertiesClass({
      $identifier,
      mutableListProperty: ["test1", "test2"],
      mutableStringProperty: "test",
      mutableSetProperty: ["test1", "test2"],
    }),
    kitchenSink.MutablePropertiesClass,
  ),
  objectListProperty: new ClassHarness(
    new kitchenSink.ListPropertiesClass({
      $identifier,
      objectListProperty: [
        new kitchenSink.NonClass({ nonClassProperty: "Test1" }),
        new kitchenSink.NonClass({ nonClassProperty: "Test2" }),
      ],
    }),
    kitchenSink.ListPropertiesClass,
  ),
  orderedPropertiesClass: new ClassHarness(
    new kitchenSink.OrderedPropertiesClass({
      $identifier,
      orderedPropertyA: "testA",
      orderedPropertyB: "testB",
      orderedPropertyC: "testC",
    }),
    kitchenSink.OrderedPropertiesClass,
  ),
  propertyCardinalitiesClass: new ClassHarness(
    new kitchenSink.PropertyCardinalitiesClass({
      $identifier,
      emptyStringSetProperty: undefined,
      nonEmptyStringSetProperty: NonEmptyList(["test1"]),
      optionalStringProperty: undefined,
      requiredStringProperty: "test",
    }),
    kitchenSink.PropertyCardinalitiesClass,
  ),
  propertyVisibilitiesClass: new ClassHarness(
    new kitchenSink.PropertyVisibilitiesClass({
      $identifier,
      privateProperty: "private",
      protectedProperty: "protected",
      publicProperty: "public",
    }),
    kitchenSink.PropertyVisibilitiesClass,
  ),
  nonClass: new ClassHarness(
    new kitchenSink.NonClass({
      $identifier,
      nonClassProperty: "Test",
    }),
    kitchenSink.NonClass,
  ),
  sha256IriClassWithExplicitIdentifier: new ClassHarness(
    new kitchenSink.Sha256IriClass({
      $identifier,
      sha256IriProperty: "test",
    }),
    kitchenSink.Sha256IriClass,
  ),
  sha256IriClassWithoutExplicitIdentifier: new ClassHarness(
    new kitchenSink.Sha256IriClass({
      sha256IriProperty: "test",
    }),
    kitchenSink.Sha256IriClass,
  ),
  stringListProperty: new ClassHarness(
    new kitchenSink.ListPropertiesClass({
      $identifier,
      stringListProperty: ["Test1", "Test2"],
    }),
    kitchenSink.ListPropertiesClass,
  ),
  termPropertiesClass: new ClassHarness(
    new kitchenSink.TermPropertiesClass({
      booleanTermProperty: true,
      dateTermProperty: new Date("2025-03-06"),
      dateTimeTermProperty: new Date(1523268000000),
      $identifier,
      iriTermProperty: dataFactory.namedNode("http://example.com"),
      literalTermProperty: dataFactory.literal("test"),
      numberTermProperty: 1,
      stringTermProperty: "test",
      termProperty: 1,
    }),
    kitchenSink.TermPropertiesClass,
  ),
  unionProperties1: new ClassHarness(
    new kitchenSink.UnionPropertiesClass({
      $identifier,
      narrowLiteralsProperty: 1,
      unrelatedTypesProperty: 1,
      widenedLiteralsProperty: 1,
      widenedTermsProperty: dataFactory.literal("test"),
    }),
    kitchenSink.UnionPropertiesClass,
  ),
  unionProperties2Class: new ClassHarness(
    new kitchenSink.UnionPropertiesClass({
      $identifier,
      narrowLiteralsProperty: 1,
      unrelatedTypesProperty: new kitchenSink.NonClass({
        nonClassProperty: "test",
      }),
      widenedLiteralsProperty: new Date(1756428530982),
      widenedTermsProperty: dataFactory.literal("test"),
    }),
    kitchenSink.UnionPropertiesClass,
  ),
  uuidv4IriClassWithExplicitIdentifier: new ClassHarness(
    new kitchenSink.UuidV4IriClass({
      $identifier,
      uuidV4IriProperty: "test",
    }),
    kitchenSink.UuidV4IriClass,
  ),
  uuidv4IriClassWithoutExplicitIdentifier: new ClassHarness(
    new kitchenSink.UuidV4IriClass({
      uuidV4IriProperty: "test",
    }),
    kitchenSink.UuidV4IriClass,
  ),
};

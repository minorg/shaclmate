import dataFactory from "@rdfjs/data-model";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { NonEmptyList } from "purify-ts";
import { ClassHarness } from "./ClassHarness.js";
import { ClassUnionHarness } from "./ClassUnionHarness.js";
import { InterfaceHarness } from "./InterfaceHarness.js";

const $identifier = dataFactory.namedNode("http://example.com/instance");

const jsPrimitiveValues = [true, 1, "test"];

const permute = <T>(arr: T[]): T[][] =>
  arr.length === 0
    ? [[]]
    : arr.flatMap((v, i) =>
        permute([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [
          v,
          ...p,
        ]),
      );

export const harnesses = {
  blankNodeOrIriIdentifierClassWithExplicitIdentifier: new ClassHarness(
    new kitchenSink.BlankNodeOrIriIdentifierClass({
      $identifier: dataFactory.blankNode(),
    }),
    kitchenSink.BlankNodeOrIriIdentifierClass,
  ),
  blankNodeIdentifierClassWithoutExplicitIdentifier: new ClassHarness(
    new kitchenSink.BlankNodeIdentifierClass(),
    kitchenSink.BlankNodeIdentifierClass,
  ),
  blankNodeIdentifierInterfaceWithExplicitIdentifier: new InterfaceHarness(
    {
      $identifier: dataFactory.blankNode(),
      $type: "BlankNodeIdentifierInterface",
    },
    kitchenSink.BlankNodeIdentifierInterface,
  ),
  blankNodeIdentifierInterfaceWithoutExplicitIdentifier: new InterfaceHarness(
    kitchenSink.BlankNodeIdentifierInterface.$create(),
    kitchenSink.BlankNodeIdentifierInterface,
  ),
  blankNodeOrIriIdentifierClassWithoutExplicitIdentifier: new ClassHarness(
    new kitchenSink.BlankNodeOrIriIdentifierClass(),
    kitchenSink.BlankNodeOrIriIdentifierClass,
  ),
  blankNodeOrIriIdentifierInterfaceWithExplicitIdentifier: new InterfaceHarness(
    {
      $identifier: dataFactory.blankNode(),
      $type: "BlankNodeOrIriIdentifierInterface",
    },
    kitchenSink.BlankNodeOrIriIdentifierInterface,
  ),
  blankNodeOrIriIdentifierInterfaceWithoutExplicitIdentifier:
    new InterfaceHarness(
      kitchenSink.BlankNodeOrIriIdentifierInterface.$create(),
      kitchenSink.BlankNodeOrIriIdentifierInterface,
    ),
  classUnionMember1: new ClassUnionHarness(
    new kitchenSink.ClassUnionMember1({
      $identifier,
      classUnionMemberCommonParentProperty: "test common parent",
      classUnionMember1Property: "test",
    }),
    kitchenSink.ClassUnion,
    "ClassUnion",
  ),
  classUnionMember2: new ClassUnionHarness(
    new kitchenSink.ClassUnionMember2({
      $identifier,
      classUnionMemberCommonParentProperty: "test common parent",
      classUnionMember2Property: "test",
    }),
    kitchenSink.ClassUnion,
    "ClassUnion",
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
  convertibleTypePropertiesClass: new ClassHarness(
    new kitchenSink.ConvertibleTypePropertiesClass({
      convertibleIriNonEmptySetProperty: NonEmptyList([
        dataFactory.namedNode("http://example.com"),
      ]),
      convertibleIriOptionProperty: "http://example.com",
      convertibleIriProperty: "http://example.com",
      convertibleIriSetProperty: ["http://example.com"],
      convertibleLiteralNonEmptySetProperty: NonEmptyList([
        dataFactory.literal("test"),
      ]),
      convertibleLiteralProperty: 1,
      convertibleLiteralOptionProperty: true,
      convertibleLiteralSetProperty: ["test"],
      convertibleTermOptionProperty: 1,
      convertibleTermProperty: new Date(1523268000000),
      convertibleTermNonEmptySetProperty: NonEmptyList([
        dataFactory.blankNode(),
      ]),
      convertibleTermSetProperty: [true],
    }),
    kitchenSink.ConvertibleTypePropertiesClass,
  ),
  dateUnionProperties1: new ClassHarness(
    new kitchenSink.DateUnionPropertiesClass({
      $identifier,
      dateOrDateTimeProperty: { type: "date", value: new Date("2025-12-08") },
      dateTimeOrDateProperty: {
        type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
      dateOrStringProperty: { type: "date", value: new Date("2025-12-08") },
      stringOrDateProperty: { type: "string", value: "2025-12-08" }, // Shouldn't parse as a Date
    }),
    kitchenSink.DateUnionPropertiesClass,
  ),
  dateUnionProperties2: new ClassHarness(
    new kitchenSink.DateUnionPropertiesClass({
      $identifier,
      dateOrDateTimeProperty: {
        type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
      dateTimeOrDateProperty: { type: "date", value: new Date("2025-12-08") },
      dateOrStringProperty: { type: "string", value: "2025-12-08" }, // Shouldn't parse as a Date
      stringOrDateProperty: { type: "date", value: new Date("2025-12-08") },
    }),
    kitchenSink.DateUnionPropertiesClass,
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
  externClassPropertyClass: new ClassHarness(
    new kitchenSink.ExternClassPropertyClass({
      externClassProperty: new kitchenSink.ExternClass(dataFactory.blankNode()),
      $identifier,
    }),
    kitchenSink.ExternClassPropertyClass,
  ),
  flattenClassUnionMember1: new ClassUnionHarness(
    new kitchenSink.ClassUnionMember1({
      $identifier,
      classUnionMemberCommonParentProperty: "test common parent",
      classUnionMember1Property: "test member 1",
    }),
    kitchenSink.FlattenClassUnion,
    "FlattenClassUnion",
  ),
  flattenClassUnionMember2: new ClassUnionHarness(
    new kitchenSink.ClassUnionMember2({
      $identifier,
      classUnionMemberCommonParentProperty: "test common parent",
      classUnionMember2Property: "test member 2",
    }),
    kitchenSink.FlattenClassUnion,
    "FlattenClassUnion",
  ),
  flattenClassUnionMember3: new ClassUnionHarness(
    new kitchenSink.FlattenClassUnionMember3({
      $identifier,
      flattenClassUnionMember3Property: "test",
    }),
    kitchenSink.FlattenClassUnion,
    "FlattenClassUnion",
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
  hasValuePropertiesClass: new ClassHarness(
    new kitchenSink.HasValuePropertiesClass({
      hasIriValueProperty: dataFactory.namedNode(
        "http://example.com/HasValuePropertiesClassIri1",
      ),
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
  inPropertiesClass: new ClassHarness(
    new kitchenSink.InPropertiesClass({
      $identifier,
      inBooleansProperty: true,
      inDateTimesProperty: new Date("2018-04-09T10:00:00.000Z"),
      inDoublesProperty: 1,
      inIrisProperty: dataFactory.namedNode(
        "http://example.com/InPropertiesIri1",
      ),
      inStringsProperty: "text",
    }),
    kitchenSink.InPropertiesClass,
  ),
  interfaceClass: new InterfaceHarness<kitchenSink.Interface>(
    {
      $identifier,
      interfaceProperty: "Test",
      $type: "Interface",
    },
    kitchenSink.Interface,
  ),
  interfaceUnionMember1: new InterfaceHarness<kitchenSink.InterfaceUnion>(
    {
      $identifier,
      interfaceUnionMemberCommonParentProperty: "common parent",
      interfaceUnionMember1Property: "Test1",
      $type: "InterfaceUnionMember1",
    },
    kitchenSink.InterfaceUnion,
    "InterfaceUnion",
  ),
  interfaceUnionMember2: new InterfaceHarness<kitchenSink.InterfaceUnion>(
    {
      $identifier,
      interfaceUnionMemberCommonParentProperty: "common parent",
      interfaceUnionMember2Property: "Test2",
      $type: "InterfaceUnionMember2",
    },
    kitchenSink.InterfaceUnion,
    "InterfaceUnion",
  ),
  iriIdentifierClass: new ClassHarness(
    new kitchenSink.IriIdentifierClass({
      $identifier,
    }),
    kitchenSink.IriIdentifierClass,
  ),
  iriListProperty: new ClassHarness(
    new kitchenSink.ListPropertiesClass({
      $identifier,
      iriListProperty: [
        // The constructor will convert these to NamedNode's
        "http://example.com/example1",
        "http://example.com/example2",
      ],
    }),
    kitchenSink.ListPropertiesClass,
  ),
  // ...permute(jsPrimitiveValues).reduce(
  //   (harnesses, jsPrimitiveValues, i) => {
  //     harnesses[`jsPrimitiveUnionProperty${i}`] = new ClassHarness(
  //       new kitchenSink.JsPrimitiveUnionPropertyClass({
  //         $identifier,
  //         jsPrimitiveUnionProperty: jsPrimitiveValues,
  //       }),
  //       kitchenSink.JsPrimitiveUnionPropertyClass,
  //     );
  //     return harnesses;
  //   },
  //   {} as Record<
  //     string,
  //     ClassHarness<kitchenSink.JsPrimitiveUnionPropertyClass>
  //   >,
  // ),
  jsPrimitiveUnionProperty: new ClassHarness(
    new kitchenSink.JsPrimitiveUnionPropertyClass({
      $identifier,
      jsPrimitiveUnionProperty: jsPrimitiveValues,
    }),
    kitchenSink.JsPrimitiveUnionPropertyClass,
  ),
  languageInPropertiesClass: new ClassHarness(
    new kitchenSink.LanguageInPropertiesClass({
      $identifier,
      languageInLiteralProperty: NonEmptyList([
        dataFactory.literal("frvalue", "fr"),
        dataFactory.literal("envalue", "en"),
      ]),
    }),
    kitchenSink.LanguageInPropertiesClass,
  ),
  lazyPropertiesClassEmpty: new ClassHarness(
    new kitchenSink.LazyPropertiesClass({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      requiredLazyToResolvedClassProperty:
        new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
          lazilyResolvedStringProperty: "test required empty",
        }),
      requiredPartialClassToResolvedClassProperty:
        new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
          lazilyResolvedStringProperty: "test required empty",
        }),
    }),
    kitchenSink.LazyPropertiesClass,
  ),
  lazyPropertiesClassNonEmpty: new ClassHarness(
    new kitchenSink.LazyPropertiesClass({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      optionalLazyToResolvedClassProperty:
        new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
          lazilyResolvedStringProperty: "optionalLazyToResolvedClassProperty",
        }),
      optionalLazyToResolvedClassUnionProperty:
        new kitchenSink.LazilyResolvedClassUnionMember1({
          lazilyResolvedStringProperty:
            "optionalLazyToResolvedClassUnionProperty",
        }),
      optionalLazyToResolvedIriIdentifierClassProperty:
        new kitchenSink.LazilyResolvedIriIdentifierClass({
          $identifier: dataFactory.namedNode("http://example.com/resolved"),
          lazilyResolvedStringProperty:
            "optionalLazyToResolvedIriIdentifierClassProperty",
        }),
      optionalPartialClassToResolvedClassProperty:
        new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
          lazilyResolvedStringProperty:
            "optionalPartialClassToResolvedClassProperty",
        }),
      optionalPartialClassToResolvedClassUnionProperty:
        new kitchenSink.LazilyResolvedClassUnionMember1({
          lazilyResolvedStringProperty:
            "optionalPartialClassToResolvedClassUnionProperty",
        }),
      optionalPartialClassUnionToResolvedClassUnionProperty:
        new kitchenSink.LazilyResolvedClassUnionMember1({
          lazilyResolvedStringProperty:
            "optionalPartialClassUnionToResolvedClassUnionProperty",
        }),
      requiredLazyToResolvedClassProperty:
        new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
          lazilyResolvedStringProperty: "requiredLazyToResolvedClassProperty",
        }),
      requiredPartialClassToResolvedClassProperty:
        new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
          lazilyResolvedStringProperty:
            "requiredPartialClassToResolvedClassProperty",
        }),
      setLazyToResolvedClassProperty: [
        new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
          lazilyResolvedStringProperty: "setLazyToResolvedClassProperty",
        }),
      ],
      setPartialClassToResolvedClassProperty: [
        new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
          lazilyResolvedStringProperty:
            "setPartialClassToResolvedClassProperty",
        }),
      ],
    }),
    kitchenSink.LazyPropertiesClass,
  ),
  lazyPropertiesInterfaceEmpty: new InterfaceHarness(
    kitchenSink.LazyPropertiesInterface.$create({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      requiredLazyToResolvedInterfaceProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
          lazilyResolvedStringProperty: "test required empty",
        }),
      requiredPartialInterfaceToResolvedInterfaceProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
          lazilyResolvedStringProperty: "test required empty",
        }),
    }),
    kitchenSink.LazyPropertiesInterface,
  ),
  lazyPropertiesInterfaceNonEmpty: new InterfaceHarness(
    kitchenSink.LazyPropertiesInterface.$create({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      optionalLazyToResolvedInterfaceProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
          lazilyResolvedStringProperty:
            "optionalLazyToResolvedInterfaceProperty",
        }),
      optionalLazyToResolvedInterfaceUnionProperty:
        kitchenSink.LazilyResolvedInterfaceUnionMember1.$create({
          lazilyResolvedStringProperty:
            "optionalLazyToResolvedInterfaceUnionProperty",
        }),
      optionalLazyToResolvedIriIdentifierInterfaceProperty:
        kitchenSink.LazilyResolvedIriIdentifierInterface.$create({
          $identifier: dataFactory.namedNode("http://example.com/resolved"),
          lazilyResolvedStringProperty:
            "optionalLazyToResolvedIriIdentifierInterfaceProperty",
        }),
      optionalPartialInterfaceToResolvedInterfaceProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
          lazilyResolvedStringProperty:
            "optionalPartialInterfaceToResolvedInterfaceProperty",
        }),
      optionalPartialInterfaceToResolvedInterfaceUnionProperty:
        kitchenSink.LazilyResolvedInterfaceUnionMember1.$create({
          lazilyResolvedStringProperty:
            "optionalPartialInterfaceToResolvedInterfaceUnionProperty",
        }),
      optionalPartialInterfaceUnionToResolvedInterfaceUnionProperty:
        kitchenSink.LazilyResolvedInterfaceUnionMember1.$create({
          lazilyResolvedStringProperty:
            "optionalPartialInterfaceUnionToResolvedInterfaceUnionProperty",
        }),
      requiredLazyToResolvedInterfaceProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
          lazilyResolvedStringProperty:
            "requiredLazyToResolvedInterfaceProperty",
        }),
      requiredPartialInterfaceToResolvedInterfaceProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
          lazilyResolvedStringProperty:
            "requiredPartialInterfaceToResolvedInterfaceProperty",
        }),
      setLazyToResolvedInterfaceProperty: [
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
          lazilyResolvedStringProperty: "setLazyToResolvedInterfaceProperty",
        }),
      ],
      setPartialInterfaceToResolvedInterfaceProperty: [
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
          lazilyResolvedStringProperty:
            "setPartialInterfaceToResolvedInterfaceProperty",
        }),
      ],
    }),
    kitchenSink.LazyPropertiesInterface,
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
  noRdfTypeClassUnionMember1: new ClassUnionHarness(
    new kitchenSink.NoRdfTypeClassUnionMember1({
      $identifier,
      noRdfTypeClassUnionMember1Property: "test",
    }),
    kitchenSink.NoRdfTypeClassUnion,
    "NoRdfTypeClassUnion",
  ),
  noRdfTypeClassUnionMember2: new ClassUnionHarness(
    new kitchenSink.NoRdfTypeClassUnionMember2({
      $identifier,
      noRdfTypeClassUnionMember2Property: "test",
    }),
    kitchenSink.NoRdfTypeClassUnion,
    "NoRdfTypeClassUnion",
  ),
  numericPropertiesClass: new ClassHarness(
    new kitchenSink.NumericPropertiesClass({
      $identifier,
      byteNumericProperty: -1,
      doubleNumericProperty: 1.1,
      floatNumericProperty: 1.1,
      intNumericProperty: -1,
      integerNumericProperty: 1n,
      longNumericProperty: -1n,
      negativeIntegerNumericProperty: -1n,
      nonNegativeIntegerNumericProperty: 0n,
      nonPositiveIntegerNumericProperty: 0n,
      positiveIntegerNumericProperty: 1n,
      shortNumericProperty: 1,
      unsignedByteNumericProperty: 1,
      unsignedIntNumericProperty: 1,
      unsignedLongNumericProperty: 1n,
      unsignedShortNumericProperty: 1,
    }),
    kitchenSink.NumericPropertiesClass,
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
  sha256IriIdentifierClassWithExplicitIdentifier: new ClassHarness(
    new kitchenSink.Sha256IriIdentifierClass({
      $identifier,
      sha256IriProperty: "test",
    }),
    kitchenSink.Sha256IriIdentifierClass,
  ),
  sha256IriIdentifierClassWithoutExplicitIdentifier: new ClassHarness(
    new kitchenSink.Sha256IriIdentifierClass({
      sha256IriProperty: "test",
    }),
    kitchenSink.Sha256IriIdentifierClass,
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
      blankNodeTermProperty: dataFactory.blankNode(),
      booleanTermProperty: true,
      dateTermProperty: new Date("2025-03-06"),
      dateTimeTermProperty: new Date(1523268000000),
      $identifier,
      iriTermProperty: dataFactory.namedNode("http://example.com"),
      literalTermProperty: dataFactory.literal("test"),
      numberTermProperty: 1.0,
      stringTermProperty: "test",
      termProperty: dataFactory.literal("1", xsd.decimal), // Use a literal instead of a number to avoid an issue with Oxigraph literal normalization (https://github.com/oxigraph/oxigraph/issues/526)
    }),
    kitchenSink.TermPropertiesClass,
  ),
  unionDiscriminantsClass1: new ClassHarness(
    new kitchenSink.UnionDiscriminantsClass({
      $identifier,
      optionalClassOrClassOrStringProperty: {
        type: "0-ClassUnionMember1",
        value: new kitchenSink.ClassUnionMember1({
          $identifier: dataFactory.namedNode(
            "http://example.com/classUnionMember1",
          ),
          classUnionMember1Property: "test",
          classUnionMemberCommonParentProperty: "test",
        }),
      },
      optionalIriOrLiteralProperty: dataFactory.namedNode("http://example.com"),
      optionalIriOrStringProperty: dataFactory.namedNode("http://example.com"),
      requiredClassOrClassOrStringProperty: {
        type: "0-ClassUnionMember1",
        value: new kitchenSink.ClassUnionMember1({
          $identifier: dataFactory.namedNode(
            "http://example.com/classUnionMember1",
          ),
          classUnionMember1Property: "test",
          classUnionMemberCommonParentProperty: "test",
        }),
      },
      requiredIriOrLiteralProperty: dataFactory.namedNode("http://example.com"),
      requiredIriOrStringProperty: dataFactory.namedNode("http://example.com"),
      // Don't specify the set properties to test undefined
    }),
    kitchenSink.UnionDiscriminantsClass,
  ),
  unionDiscriminantsClass2: new ClassHarness(
    new kitchenSink.UnionDiscriminantsClass({
      $identifier,
      optionalClassOrClassOrStringProperty: {
        type: "1-ClassUnionMember2",
        value: new kitchenSink.ClassUnionMember2({
          $identifier: dataFactory.namedNode(
            "http://example.com/classUnionMember2",
          ),
          classUnionMember2Property: "test",
          classUnionMemberCommonParentProperty: "test",
        }),
      },
      optionalIriOrLiteralProperty: dataFactory.literal("test"),
      optionalIriOrStringProperty: "test",
      requiredClassOrClassOrStringProperty: {
        type: "2-string",
        value: "test",
      },
      requiredIriOrLiteralProperty: dataFactory.literal("test"),
      requiredIriOrStringProperty: "test",
      setClassOrClassOrStringProperty: [
        // Opposite order
        {
          type: "2-string",
          value: "test",
        },
        {
          type: "1-ClassUnionMember2",
          value: new kitchenSink.ClassUnionMember2({
            $identifier: dataFactory.namedNode(
              "http://example.com/classUnionMember2",
            ),
            classUnionMember2Property: "test",
            classUnionMemberCommonParentProperty: "test",
          }),
        },
        {
          type: "0-ClassUnionMember1",
          value: new kitchenSink.ClassUnionMember1({
            $identifier: dataFactory.namedNode(
              "http://example.com/classUnionMember1",
            ),
            classUnionMember1Property: "test",
            classUnionMemberCommonParentProperty: "test",
          }),
        },
      ],
      setIriOrLiteralProperty: [
        dataFactory.literal("test"),
        dataFactory.namedNode("http://example.com"),
      ],
      setIriOrStringProperty: [
        "test",
        dataFactory.namedNode("http://example.com"),
      ],
    }),
    kitchenSink.UnionDiscriminantsClass,
  ),
  uuidv4IriIdentifierClassWithExplicitIdentifier: new ClassHarness(
    new kitchenSink.UuidV4IriIdentifierClass({
      $identifier,
      uuidV4IriProperty: "test",
    }),
    kitchenSink.UuidV4IriIdentifierClass,
  ),
  uuidv4IriIdentifierClassWithoutExplicitIdentifier: new ClassHarness(
    new kitchenSink.UuidV4IriIdentifierClass({
      uuidV4IriProperty: "test",
    }),
    kitchenSink.UuidV4IriIdentifierClass,
  ),
  uuidv4IriIdentifierInterfaceWithExplicitIdentifier: new InterfaceHarness(
    {
      $identifier,
      $type: "UuidV4IriIdentifierInterface",
      uuidV4IriProperty: "test",
    } satisfies kitchenSink.UuidV4IriIdentifierInterface,
    kitchenSink.UuidV4IriIdentifierInterface,
  ),
  uuidv4IriIdentifierInterfaceWithoutExplicitIdentifier: new InterfaceHarness(
    kitchenSink.UuidV4IriIdentifierInterface.$create({
      $identifierPrefix: "http://example.com/",
      uuidV4IriProperty: "test",
    }),
    kitchenSink.UuidV4IriIdentifierInterface,
  ),
};

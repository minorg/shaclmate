import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Decimal } from "decimal.js";
import { Maybe } from "purify-ts";
import { Harness } from "./Harness.js";

const $identifier = dataFactory.namedNode("http://example.com/instance");
const literalFactory = new LiteralFactory({ dataFactory });

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
  blankNodeOrIriIdentifierWithExplicitBlankNodeIdentifier: new Harness(
    kitchenSink.BlankNodeOrIriIdentifier.createUnsafe({
      $identifier: dataFactory.blankNode(),
    }),
    kitchenSink.BlankNodeOrIriIdentifier,
  ),
  blankNodeOrIriIdentifierWithExplicitIriIdentifier: new Harness(
    kitchenSink.BlankNodeOrIriIdentifier.createUnsafe({
      $identifier,
    }),
    kitchenSink.BlankNodeOrIriIdentifier,
  ),
  blankNodeIdentifierWithoutExplicitIdentifier: new Harness(
    kitchenSink.BlankNodeIdentifier.createUnsafe({}),
    kitchenSink.BlankNodeIdentifier,
  ),
  blankNodeOrIriIdentifierWithoutExplicitIdentifier: new Harness(
    kitchenSink.BlankNodeOrIriIdentifier.createUnsafe(),
    kitchenSink.BlankNodeOrIriIdentifier,
  ),
  // classProperties: new Harness(
  //   kitchenSink.ClassPropertiesClass.createUnsafe({
  //     $identifier,
  //     iriClassProperty: dataFactory.namedNode(
  //       "http://example.com/iriClassPropertyInstance",
  //     ),
  //     multiClassProperty: dataFactory.namedNode(
  //       "http://example.com/multiClassPropertyInstance",
  //     ),
  //     nodeClassProperty1: kitchenSink.Non.createUnsafe({
  //       $identifier: dataFactory.namedNode(
  //         "http://example.com/nodeClassProperty1Instance",
  //       ),
  //       nonClassProperty: "test",
  //     }),
  //     nodeClassProperty2: kitchenSink.Partial.createUnsafe({
  //       $identifier: dataFactory.namedNode(
  //         "http://example.com/nodeClassProperty1Instance",
  //       ),
  //       lazilyResolvedStringProperty: "test",
  //     }),
  //     singleClassProperty: dataFactory.namedNode(
  //       "http://example.com/singleClassPropertyInstance",
  //     ),
  //   }),
  //   kitchenSink.ClassProperties,
  // ),
  convertibleTypeProperties: new Harness(
    kitchenSink.ConvertibleTypeProperties.createUnsafe({
      convertibleIriNonEmptySetProperty: [
        dataFactory.namedNode("http://example.com"),
      ],
      convertibleIriOptionProperty: "http://example.com",
      convertibleIriProperty: "http://example.com",
      convertibleIriSetProperty: ["http://example.com"],
      convertibleLiteralNonEmptySetProperty: [dataFactory.literal("test")],
      convertibleLiteralProperty: 1,
      convertibleLiteralOptionProperty: true,
      convertibleLiteralSetProperty: ["test"],
      convertibleTermOptionProperty: literalFactory.number(1),
      convertibleTermProperty: literalFactory.date(new Date(1523268000000)),
      convertibleTermNonEmptySetProperty: [dataFactory.blankNode()],
      convertibleTermSetProperty: [literalFactory.boolean(true)],
    }),
    kitchenSink.ConvertibleTypeProperties,
  ),
  dateUnionProperties1: new Harness(
    kitchenSink.DateUnionProperties.createUnsafe({
      $identifier,
      dateOrDateTimeProperty: { type: "date", value: new Date("2025-12-08") },
      dateTimeOrDateProperty: {
        type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
      dateOrStringProperty: { type: "date", value: new Date("2025-12-08") },
      stringOrDateProperty: { type: "string", value: "2025-12-08" }, // Shouldn't parse as a Date
    }),
    kitchenSink.DateUnionProperties,
  ),
  dateUnionProperties2: new Harness(
    kitchenSink.DateUnionProperties.createUnsafe({
      $identifier,
      dateOrDateTimeProperty: {
        type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
      dateTimeOrDateProperty: { type: "date", value: new Date("2025-12-08") },
      dateOrStringProperty: { type: "string", value: "2025-12-08" }, // Shouldn't parse as a Date
      stringOrDateProperty: { type: "date", value: new Date("2025-12-08") },
    }),
    kitchenSink.DateUnionProperties,
  ),
  defaultValueProperties: new Harness(
    kitchenSink.DefaultValueProperties.createUnsafe({
      $identifier,
    }),
    kitchenSink.DefaultValueProperties,
  ),
  defaultValuePropertiesOverriddenDifferent: new Harness(
    kitchenSink.DefaultValueProperties.createUnsafe({
      falseBooleanDefaultValueProperty: true,
      $identifier,
      numberDefaultValueProperty: 1,
      stringDefaultValueProperty: "test",
      trueBooleanDefaultValueProperty: false,
    }),
    kitchenSink.DefaultValueProperties,
  ),
  defaultValuePropertiesOverriddenSame: new Harness(
    kitchenSink.DefaultValueProperties.createUnsafe({
      falseBooleanDefaultValueProperty: false,
      dateDefaultValueProperty: new Date("2025-03-06"),
      dateTimeDefaultValueProperty: new Date(1523268000000),
      $identifier,
      numberDefaultValueProperty: 0,
      stringDefaultValueProperty: "",
      trueBooleanDefaultValueProperty: true,
    }),
    kitchenSink.DefaultValueProperties,
  ),
  directRecursive: new Harness(
    kitchenSink.DirectRecursive.createUnsafe({
      directRecursiveProperty: kitchenSink.DirectRecursive.createUnsafe({}),
    }),
    kitchenSink.DirectRecursive,
  ),
  displayProperties: new Harness(
    kitchenSink.DisplayProperties.createUnsafe({
      $identifier,
      explicitFalseDisplayProperty: "explicitFalseDisplayValue",
      explicitTrueDisplayProperty: "explicitTrueDisplayValue",
      implicitFalseDisplayProperty: "implicitFalseDisplayValue",
    }),
    kitchenSink.DisplayProperties,
  ),
  explicitFromToRdfTypes: new Harness(
    kitchenSink.ExplicitFromToRdfTypes.createUnsafe({
      explicitFromToRdfTypesProperty: "test",
      $identifier,
    }),
    kitchenSink.ExplicitFromToRdfTypes,
  ),
  explicitRdfType: new Harness(
    kitchenSink.ExplicitRdfType.createUnsafe({
      explicitRdfTypeProperty: "test",
      $identifier,
    }),
    kitchenSink.ExplicitRdfType,
  ),
  flattenUnionMember1: new Harness(
    kitchenSink.UnionMember1.createUnsafe({
      $identifier,
      unionMemberCommonProperty: "test common property",
      unionMember1Property: "test member 1",
    }),
    kitchenSink.FlattenUnion,
    "FlattenUnion",
  ),
  flattenUnionMember2: new Harness(
    kitchenSink.UnionMember2.createUnsafe({
      $identifier,
      unionMemberCommonProperty: "test common property",
      unionMember2Property: "test member 2",
    }),
    kitchenSink.FlattenUnion,
    "FlattenUnion",
  ),
  flattenUnionMember3: new Harness(
    kitchenSink.FlattenUnionMember3.createUnsafe({
      $identifier,
      flattenUnionMember3Property: "test",
    }),
    kitchenSink.FlattenUnion,
    "FlattenUnion",
  ),
  indirectRecursive: new Harness(
    kitchenSink.IndirectRecursive.createUnsafe({
      indirectRecursiveHelperProperty:
        kitchenSink.IndirectRecursiveHelper.createUnsafe({
          indirectRecursiveProperty: kitchenSink.IndirectRecursive.createUnsafe(
            {},
          ),
        }),
    }),
    kitchenSink.IndirectRecursive,
  ),
  hasValueProperties: new Harness(
    kitchenSink.HasValueProperties.createUnsafe({
      hasIriValueProperty: dataFactory.namedNode(
        "http://example.com/HasValuePropertiesIri1",
      ),
      hasLiteralValueProperty: "test",
      $identifier,
    }),
    kitchenSink.HasValueProperties,
  ),
  inIdentifier: new Harness(
    kitchenSink.InIdentifier.createUnsafe({
      $identifier: dataFactory.namedNode(
        "http://example.com/InIdentifierInstance1",
      ),
      inIdentifierProperty: "doesn't matter",
    }),
    kitchenSink.InIdentifier,
  ),
  inProperties: new Harness(
    kitchenSink.InProperties.createUnsafe({
      $identifier,
      inBooleansProperty: true,
      inDateTimesProperty: new Date("2018-04-09T10:00:00.000Z"),
      inDoublesProperty: 1,
      inIrisProperty: dataFactory.namedNode(
        "http://example.com/InPropertiesIri1",
      ),
      inStringsProperty: "text",
    }),
    kitchenSink.InProperties,
  ),
  iriIdentifier: new Harness(
    kitchenSink.IriIdentifier.createUnsafe({
      $identifier,
    }),
    kitchenSink.IriIdentifier,
  ),
  // ...permute(jsPrimitiveValues).reduce(
  //   (harnesses, jsPrimitiveValues, i) => {
  //     harnesses[`jsPrimitiveUnionProperty${i}`] = new Harness(
  //       kitchenSink.JsPrimitiveUnionProperty.createUnsafe({
  //         $identifier,
  //         jsPrimitiveUnionProperty: jsPrimitiveValues,
  //       }),
  //       kitchenSink.JsPrimitiveUnionProperty,
  //     );
  //     return harnesses;
  //   },
  //   {} as Record<
  //     string,
  //     Harness<kitchenSink.JsPrimitiveUnionPropertyClass>
  //   >,
  // ),
  jsPrimitiveUnionProperty: new Harness(
    kitchenSink.JsPrimitiveUnionProperty.createUnsafe({
      $identifier,
      jsPrimitiveUnionProperty: jsPrimitiveValues,
    }),
    kitchenSink.JsPrimitiveUnionProperty,
  ),
  languageInProperties: new Harness(
    kitchenSink.LanguageInProperties.createUnsafe({
      $identifier,
      languageInLiteralProperty: [
        dataFactory.literal("frvalue", "fr"),
        dataFactory.literal("envalue", "en"),
      ],
    }),
    kitchenSink.LanguageInProperties,
  ),
  lazyPropertiesEmpty: new Harness(
    kitchenSink.LazyProperties.createUnsafe({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      requiredLazyToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInstance1",
          ),
          lazilyResolvedStringProperty: "test required empty",
        }),
      requiredPartialToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInstance2",
          ),
          lazilyResolvedStringProperty: "test required empty",
        }),
    }),
    kitchenSink.LazyProperties,
  ),
  lazyPropertiesNonEmpty: new Harness(
    kitchenSink.LazyProperties.createUnsafe({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      optionalLazyToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance1"),
          lazilyResolvedStringProperty:
            "optionalLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      optionalLazyToResolvedUnionProperty:
        kitchenSink.LazilyResolvedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance2"),
          lazilyResolvedStringProperty: "optionalLazyToResolvedUnionProperty",
        }),
      optionalLazyToResolvedIriIdentifierProperty:
        kitchenSink.LazilyResolvedIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance3"),
          lazilyResolvedStringProperty:
            "optionalLazyToResolvedIriIdentifierProperty",
        }),
      optionalPartialToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance4"),
          lazilyResolvedStringProperty:
            "optionalPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      optionalPartialToResolvedUnionProperty:
        kitchenSink.LazilyResolvedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance5"),
          lazilyResolvedStringProperty:
            "optionalPartialToResolvedUnionProperty",
        }),
      optionalPartialUnionToResolvedUnionProperty:
        kitchenSink.LazilyResolvedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance6"),
          lazilyResolvedStringProperty:
            "optionalPartialUnionToResolvedUnionProperty",
        }),
      requiredLazyToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance7"),
          lazilyResolvedStringProperty:
            "requiredLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      requiredPartialToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance8"),
          lazilyResolvedStringProperty:
            "requiredPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      setLazyToResolvedBlankNodeOrIriIdentifierProperty: [
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance9"),
          lazilyResolvedStringProperty:
            "setLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      ],
      setPartialToResolvedBlankNodeOrIriIdentifierProperty: [
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifier.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance10"),
          lazilyResolvedStringProperty:
            "setPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      ],
    }),
    kitchenSink.LazyProperties,
  ),
  listPropertiesDefault: new Harness(
    kitchenSink.ListProperties.createUnsafe({
      $identifier,
    }),
    kitchenSink.ListProperties,
  ),
  listProperiesFromArrays: new Harness(
    kitchenSink.ListProperties.createUnsafe({
      $identifier,
      iriListProperty: [
        // The constructor will convert these to NamedNode's
        "http://example.com/example1",
        "http://example.com/example2",
      ],
      objectListProperty: [
        kitchenSink.NonClass.createUnsafe({ nonClassProperty: "Test1" }),
        kitchenSink.NonClass.createUnsafe({ nonClassProperty: "Test2" }),
      ],
      stringListProperty: ["test1", "test2"],
      stringListListProperty: [
        ["test1", "test2"],
        ["test3", "test4"],
      ],
    }),
    kitchenSink.ListProperties,
  ),
  listSets: new Harness(
    kitchenSink.ListSets.createUnsafe({
      $identifier,
      listUnionSetProperty: [
        "test1",
        ["test2", "test3"],
        "test4",
        ["test5", "test6"],
      ],
      listSetProperty: [
        ["test1", "test2"],
        ["test3", "test4"],
      ],
      listListSetProperty: [
        [
          ["test1", "test2"],
          ["test3", "test4"],
        ],
        [
          ["test5", "test6"],
          ["test7", "test8"],
        ],
      ],
    }),
    kitchenSink.ListSets,
  ),
  mutableProperties: new Harness(
    kitchenSink.MutableProperties.createUnsafe({
      $identifier,
      mutableListProperty: ["test1", "test2"],
      mutableStringProperty: "test",
      mutableSetProperty: ["test1", "test2"],
    }),
    kitchenSink.MutableProperties,
  ),
  namedUnionProperties1: new Harness(
    kitchenSink.NamedUnionProperties.createUnsafe({
      $identifier,
      namedUnion1Property: "test",
      namedUnion2Property: { type: "date", value: new Date("2025-12-08") },
    }),
    kitchenSink.NamedUnionProperties,
  ),
  namedUnionProperties2: new Harness(
    kitchenSink.NamedUnionProperties.createUnsafe({
      $identifier,
      namedUnion1Property: dataFactory.namedNode("http://example.com"),
      namedUnion2Property: {
        type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
    }),
    kitchenSink.NamedUnionProperties,
  ),
  // nodeKinds1 = use the first of the node kinds when there are two (e.g., sh:nodeKind sh:BlankNodeOrIRI)
  nodeKinds1: new Harness(
    kitchenSink.NodeKinds.createUnsafe({
      $identifier,
      blankNodeKindProperty: dataFactory.blankNode(),
      blankNodeOrIriNodeKindProperty: dataFactory.blankNode(),
      blankNodeOrLiteralNodeKindProperty: dataFactory.blankNode(),
      iriNodeKindProperty: dataFactory.namedNode(
        "http://example.com/iriNodeKindPropertyValue",
      ),
      iriOrLiteralNodeKindProperty: dataFactory.namedNode(
        "http://example.com/iriOrLiteralNodeKindPropertyValue",
      ),
      literalNodeKindProperty: dataFactory.literal("literalNodeKindValue"),
    }),
    kitchenSink.NodeKinds,
  ),
  nodeKinds2: new Harness(
    kitchenSink.NodeKinds.createUnsafe({
      $identifier,
      blankNodeKindProperty: dataFactory.blankNode(),
      blankNodeOrIriNodeKindProperty: dataFactory.namedNode(
        "http://example.com/blankNodeOrIriNodeKindPropertyValue",
      ),
      blankNodeOrLiteralNodeKindProperty: dataFactory.literal(
        "blankNodeOrLiteralNodeKindPropertyValue",
      ),
      iriNodeKindProperty: dataFactory.namedNode(
        "http://example.com/iriNodeKindPropertyValue",
      ),
      iriOrLiteralNodeKindProperty: dataFactory.literal(
        "iriOrLiteralNodeKindPropertyValue",
      ),
      literalNodeKindProperty: dataFactory.literal(
        "literalNodeKindPropertyValue",
      ),
    }),
    kitchenSink.NodeKinds,
  ),
  noRdfTypeUnionMember1: new Harness(
    kitchenSink.NoRdfTypeUnionMember1.createUnsafe({
      $identifier,
      noRdfTypeUnionMember1Property: "test",
    }),
    kitchenSink.NoRdfTypeUnion,
    "NoRdfTypeUnion",
  ),
  noRdfTypeUnionMember2: new Harness(
    kitchenSink.NoRdfTypeUnionMember2.createUnsafe({
      $identifier,
      noRdfTypeUnionMember2Property: "test",
    }),
    kitchenSink.NoRdfTypeUnion,
    "NoRdfTypeUnion",
  ),
  numericProperties: new Harness(
    kitchenSink.NumericProperties.createUnsafe({
      $identifier,
      byteNumericProperty: -1,
      decimalNumericProperty: new Decimal(1.0),
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
    kitchenSink.NumericProperties,
  ),
  orderedProperties: new Harness(
    kitchenSink.OrderedProperties.createUnsafe({
      $identifier,
      orderedPropertyA: "testA",
      orderedPropertyB: "testB",
      orderedPropertyC: "testC",
    }),
    kitchenSink.OrderedProperties,
  ),
  overrideName: new Harness(
    kitchenSink.NewName.createUnsafe({
      $identifier,
    }),
    kitchenSink.NewName,
    "OverrideName",
  ),
  // Undefineds
  propertyCardinalities1: new Harness(
    kitchenSink.PropertyCardinalities.createUnsafe({
      $identifier,
      emptyStringSetProperty: undefined,
      nonEmptyStringSetProperty: ["test"],
      optionalStringProperty: undefined,
      requiredStringProperty: "test",
    }),
    kitchenSink.PropertyCardinalities,
  ),
  // Arrays and Maybes
  propertyCardinalities2: new Harness(
    kitchenSink.PropertyCardinalities.createUnsafe({
      $identifier,
      emptyStringSetProperty: [],
      nonEmptyStringSetProperty: ["test"],
      optionalStringProperty: Maybe.of("test"),
      requiredStringProperty: "test",
    }),
    kitchenSink.PropertyCardinalities,
  ),
  // Convert scalar to set
  propertyCardinalities3: new Harness(
    kitchenSink.PropertyCardinalities.createUnsafe({
      $identifier,
      emptyStringSetProperty: "test",
      nonEmptyStringSetProperty: "test",
      optionalStringProperty: "test",
      requiredStringProperty: "test",
    }),
    kitchenSink.PropertyCardinalities,
  ),
  propertyNames: new Harness(
    kitchenSink.PropertyNames.createUnsafe({
      $identifier,
      // Should all be actualProperty*
      actualPropertyName1: "actualPropertyValue1",
      actualPropertyName2: "actualPropertyValue2",
      actualPropertyName3: "actualPropertyValue3",
      actualPropertyName4: "actualPropertyValue4",
      actualPropertyName5: "actualPropertyValue5",
    }),
    kitchenSink.PropertyNames,
  ),
  propertyPaths: new Harness(
    kitchenSink.PropertyPaths.createUnsafe({
      $identifier,
      inversePathProperty: "http://example.com/inversePathPropertyValue",
      predicatePathProperty: "predicatePathPropertyValue",
    }),
    kitchenSink.PropertyPaths,
  ),
  nonClass: new Harness(
    kitchenSink.NonClass.createUnsafe({
      $identifier,
      nonClassProperty: "Test",
    }),
    kitchenSink.NonClass,
  ),
  termProperties: new Harness(
    kitchenSink.TermProperties.createUnsafe({
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
    kitchenSink.TermProperties,
  ),
  unionDiscriminants1: new Harness(
    kitchenSink.UnionDiscriminants.createUnsafe({
      $identifier,
      optionalNodeOrNodeOrStringProperty: {
        type: "UnionMember1",
        value: kitchenSink.UnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/unionMember1a",
          ),
          unionMember1Property: "test",
          unionMemberCommonProperty: "test",
        }),
      },
      optionalIriOrLiteralProperty: dataFactory.namedNode("http://example.com"),
      optionalIriOrStringProperty: dataFactory.namedNode("http://example.com"),
      requiredNodeOrNodeOrStringProperty: {
        type: "UnionMember1",
        value: kitchenSink.UnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/unionMember1b",
          ),
          unionMember1Property: "test",
          unionMemberCommonProperty: "test",
        }),
      },
      requiredNodeOrLiteralProperty: {
        termType: "UnionMember1",
        value: kitchenSink.UnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/unionMember1c",
          ),
          unionMember1Property: "test",
          unionMemberCommonProperty: "test",
        }),
      },
      requiredIriOrLiteralProperty: dataFactory.namedNode("http://example.com"),
      requiredIriOrStringProperty: dataFactory.namedNode("http://example.com"),
      // Don't specify the set properties to test undefined
    }),
    kitchenSink.UnionDiscriminants,
  ),
  unionDiscriminants2: new Harness(
    kitchenSink.UnionDiscriminants.createUnsafe({
      $identifier,
      optionalNodeOrNodeOrStringProperty: {
        type: "UnionMember2",
        value: kitchenSink.UnionMember2.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/unionMember2a",
          ),
          unionMember2Property: "test",
          unionMemberCommonProperty: "test",
        }),
      },
      optionalNodeOrLiteralProperty: dataFactory.literal("test"),
      optionalIriOrLiteralProperty: dataFactory.literal("test"),
      optionalIriOrStringProperty: "test",
      requiredNodeOrNodeOrStringProperty: {
        type: "string",
        value: "test",
      },
      requiredNodeOrLiteralProperty: dataFactory.literal("test"),
      requiredIriOrLiteralProperty: dataFactory.literal("test"),
      requiredIriOrStringProperty: "test",
      setNodeOrNodeOrStringProperty: [
        // Opposite order
        {
          type: "string",
          value: "test",
        },
        {
          type: "UnionMember2",
          value: kitchenSink.UnionMember2.createUnsafe({
            $identifier: dataFactory.namedNode(
              "http://example.com/unionMember2b",
            ),
            unionMember2Property: "test",
            unionMemberCommonProperty: "test",
          }),
        },
        {
          type: "UnionMember1",
          value: kitchenSink.UnionMember1.createUnsafe({
            $identifier: dataFactory.namedNode(
              "http://example.com/unionMember1b",
            ),
            unionMember1Property: "test",
            unionMemberCommonProperty: "test",
          }),
        },
      ],
      setNodeOrLiteralProperty: [
        // Opposite order
        dataFactory.literal("test"),
        {
          termType: "UnionMember1",
          value: kitchenSink.UnionMember1.createUnsafe({
            $identifier: dataFactory.namedNode(
              "http://example.com/unionMember1c",
            ),
            unionMember1Property: "test",
            unionMemberCommonProperty: "test",
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
    kitchenSink.UnionDiscriminants,
  ),
  unionMember1: new Harness(
    kitchenSink.UnionMember1.createUnsafe({
      $identifier,
      unionMemberCommonProperty: "test common parent",
      unionMember1Property: "test",
    }),
    kitchenSink.Union,
    "Union",
  ),
  unionMember2: new Harness(
    kitchenSink.UnionMember2.createUnsafe({
      $identifier,
      unionMemberCommonProperty: "test common parent",
      unionMember2Property: "test",
    }),
    kitchenSink.Union,
    "Union",
  ),
};

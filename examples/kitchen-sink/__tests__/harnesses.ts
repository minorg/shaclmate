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
  blankNodeOrIriIdentifierStructWithExplicitBlankNodeIdentifier: new Harness(
    kitchenSink.BlankNodeOrIriIdentifierStruct.createUnsafe({
      $identifier: dataFactory.blankNode(),
    }),
    kitchenSink.BlankNodeOrIriIdentifierStruct,
  ),
  blankNodeOrIriIdentifierStructWithExplicitIriIdentifier: new Harness(
    kitchenSink.BlankNodeOrIriIdentifierStruct.createUnsafe({
      $identifier,
    }),
    kitchenSink.BlankNodeOrIriIdentifierStruct,
  ),
  blankNodeIdentifierStructWithoutExplicitIdentifier: new Harness(
    kitchenSink.BlankNodeIdentifierStruct.createUnsafe({}),
    kitchenSink.BlankNodeIdentifierStruct,
  ),
  blankNodeOrIriIdentifierStructWithoutExplicitIdentifier: new Harness(
    kitchenSink.BlankNodeOrIriIdentifierStruct.createUnsafe(),
    kitchenSink.BlankNodeOrIriIdentifierStruct,
  ),
  // classPropertiesStruct: new Harness(
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
  //       lazilyResolvedProperty: "test",
  //     }),
  //     singleClassProperty: dataFactory.namedNode(
  //       "http://example.com/singleClassPropertyInstance",
  //     ),
  //   }),
  //   kitchenSink.ClassProperties,
  // ),
  convertibleTypePropertiesStruct: new Harness(
    kitchenSink.ConvertibleTypePropertiesStruct.createUnsafe({
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
    kitchenSink.ConvertibleTypePropertiesStruct,
  ),
  dateUnionPropertiesStruct1: new Harness(
    kitchenSink.DateUnionPropertiesStruct.createUnsafe({
      $identifier,
      dateOrDateTimeProperty: { type: "date", value: new Date("2025-12-08") },
      dateTimeOrDateProperty: {
        type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
      dateOrStringProperty: { type: "date", value: new Date("2025-12-08") },
      stringOrDateProperty: { type: "string", value: "2025-12-08" }, // Shouldn't parse as a Date
    }),
    kitchenSink.DateUnionPropertiesStruct,
  ),
  dateUnionPropertiesStruct2: new Harness(
    kitchenSink.DateUnionPropertiesStruct.createUnsafe({
      $identifier,
      dateOrDateTimeProperty: {
        type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
      dateTimeOrDateProperty: { type: "date", value: new Date("2025-12-08") },
      dateOrStringProperty: { type: "string", value: "2025-12-08" }, // Shouldn't parse as a Date
      stringOrDateProperty: { type: "date", value: new Date("2025-12-08") },
    }),
    kitchenSink.DateUnionPropertiesStruct,
  ),
  defaultValuePropertiesStruct: new Harness(
    kitchenSink.DefaultValuePropertiesStruct.createUnsafe({
      $identifier,
    }),
    kitchenSink.DefaultValuePropertiesStruct,
  ),
  defaultValuePropertiesStructOverriddenDifferent: new Harness(
    kitchenSink.DefaultValuePropertiesStruct.createUnsafe({
      falseBooleanDefaultValueProperty: true,
      $identifier,
      numberDefaultValueProperty: 1,
      stringDefaultValueProperty: "test",
      trueBooleanDefaultValueProperty: false,
    }),
    kitchenSink.DefaultValuePropertiesStruct,
  ),
  defaultValuePropertiesStructOverriddenSame: new Harness(
    kitchenSink.DefaultValuePropertiesStruct.createUnsafe({
      falseBooleanDefaultValueProperty: false,
      dateDefaultValueProperty: new Date("2025-03-06"),
      dateTimeDefaultValueProperty: new Date(1523268000000),
      $identifier,
      numberDefaultValueProperty: 0,
      stringDefaultValueProperty: "",
      trueBooleanDefaultValueProperty: true,
    }),
    kitchenSink.DefaultValuePropertiesStruct,
  ),
  directRecursiveStruct: new Harness(
    kitchenSink.DirectRecursiveStruct.createUnsafe({
      directRecursiveProperty: kitchenSink.DirectRecursiveStruct.createUnsafe(
        {},
      ),
    }),
    kitchenSink.DirectRecursiveStruct,
  ),
  displayPropertiesStruct: new Harness(
    kitchenSink.DisplayPropertiesStruct.createUnsafe({
      $identifier,
      explicitFalseDisplayProperty: "explicitFalseDisplayValue",
      explicitTrueDisplayProperty: "explicitTrueDisplayValue",
      implicitFalseDisplayProperty: "implicitFalseDisplayValue",
    }),
    kitchenSink.DisplayPropertiesStruct,
  ),
  explicitFromToRdfTypesStruct: new Harness(
    kitchenSink.ExplicitFromToRdfTypesStruct.createUnsafe({
      explicitFromToRdfTypesProperty: "test",
      $identifier,
    }),
    kitchenSink.ExplicitFromToRdfTypesStruct,
  ),
  explicitRdfTypeStruct: new Harness(
    kitchenSink.ExplicitRdfTypeStruct.createUnsafe({
      explicitRdfTypeProperty: "test",
      $identifier,
    }),
    kitchenSink.ExplicitRdfTypeStruct,
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
  indirectRecursiveStruct: new Harness(
    kitchenSink.IndirectRecursiveStruct.createUnsafe({
      indirectRecursiveHelperProperty:
        kitchenSink.IndirectRecursiveStructHelper.createUnsafe({
          indirectRecursiveProperty:
            kitchenSink.IndirectRecursiveStruct.createUnsafe({}),
        }),
    }),
    kitchenSink.IndirectRecursiveStruct,
  ),
  hasValuePropertiesStruct: new Harness(
    kitchenSink.HasValuePropertiesStruct.createUnsafe({
      hasIriValueProperty: dataFactory.namedNode(
        "http://example.com/HasValuePropertiesStructIri1",
      ),
      hasLiteralValueProperty: "test",
      $identifier,
    }),
    kitchenSink.HasValuePropertiesStruct,
  ),
  inIdentifierStruct: new Harness(
    kitchenSink.InIdentifierStruct.createUnsafe({
      $identifier: dataFactory.namedNode(
        "http://example.com/InIdentifierStructInstance1",
      ),
      inIdentifierProperty: "doesn't matter",
    }),
    kitchenSink.InIdentifierStruct,
  ),
  inPropertiesStruct: new Harness(
    kitchenSink.InPropertiesStruct.createUnsafe({
      $identifier,
      inBooleansProperty: true,
      inDateTimesProperty: new Date("2018-04-09T10:00:00.000Z"),
      inDoublesProperty: 1,
      inIrisProperty: dataFactory.namedNode(
        "http://example.com/InPropertiesIri1",
      ),
      inStringsProperty: "text",
    }),
    kitchenSink.InPropertiesStruct,
  ),
  iriIdentifierStruct: new Harness(
    kitchenSink.IriIdentifierStruct.createUnsafe({
      $identifier,
    }),
    kitchenSink.IriIdentifierStruct,
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
  jsPrimitiveUnionPropertyStruct: new Harness(
    kitchenSink.JsPrimitiveUnionPropertyStruct.createUnsafe({
      $identifier,
      jsPrimitiveUnionProperty: jsPrimitiveValues,
    }),
    kitchenSink.JsPrimitiveUnionPropertyStruct,
  ),
  languageInPropertiesStruct: new Harness(
    kitchenSink.LanguageInPropertiesStruct.createUnsafe({
      $identifier,
      languageInLiteralProperty: [
        dataFactory.literal("frvalue", "fr"),
        dataFactory.literal("envalue", "en"),
      ],
    }),
    kitchenSink.LanguageInPropertiesStruct,
  ),
  lazyPropertiesStructEmpty: new Harness(
    kitchenSink.LazyPropertiesStruct.createUnsafe({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      requiredLazyToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInstance1",
          ),
          lazilyResolvedProperty: "test required empty",
        }),
      requiredPartialToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInstance2",
          ),
          lazilyResolvedProperty: "test required empty",
        }),
    }),
    kitchenSink.LazyPropertiesStruct,
  ),
  lazyPropertiesStructNonEmpty: new Harness(
    kitchenSink.LazyPropertiesStruct.createUnsafe({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      optionalLazyToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance1"),
          lazilyResolvedProperty:
            "optionalLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      optionalLazyToResolvedUnionProperty:
        kitchenSink.LazilyResolvedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance2"),
          lazilyResolvedProperty: "optionalLazyToResolvedUnionProperty",
        }),
      optionalLazyToResolvedIriIdentifierProperty:
        kitchenSink.LazilyResolvedIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance3"),
          lazilyResolvedProperty: "optionalLazyToResolvedIriIdentifierProperty",
        }),
      optionalPartialToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance4"),
          lazilyResolvedProperty:
            "optionalPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      optionalPartialToResolvedUnionProperty:
        kitchenSink.LazilyResolvedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance5"),
          lazilyResolvedProperty: "optionalPartialToResolvedUnionProperty",
        }),
      optionalPartialUnionToResolvedUnionProperty:
        kitchenSink.LazilyResolvedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance6"),
          lazilyResolvedProperty: "optionalPartialUnionToResolvedUnionProperty",
        }),
      requiredLazyToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance7"),
          lazilyResolvedProperty:
            "requiredLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      requiredPartialToResolvedBlankNodeOrIriIdentifierProperty:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance8"),
          lazilyResolvedProperty:
            "requiredPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      setLazyToResolvedBlankNodeOrIriIdentifierProperty: [
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance9"),
          lazilyResolvedProperty:
            "setLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      ],
      setPartialToResolvedBlankNodeOrIriIdentifierProperty: [
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance10"),
          lazilyResolvedProperty:
            "setPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      ],
    }),
    kitchenSink.LazyPropertiesStruct,
  ),
  listPropertiesStructDefault: new Harness(
    kitchenSink.ListPropertiesStruct.createUnsafe({
      $identifier,
    }),
    kitchenSink.ListPropertiesStruct,
  ),
  listProperiesStructFromArrays: new Harness(
    kitchenSink.ListPropertiesStruct.createUnsafe({
      $identifier,
      iriListProperty: [
        // The constructor will convert these to NamedNode's
        "http://example.com/example1",
        "http://example.com/example2",
      ],
      stringListProperty: ["test1", "test2"],
      stringListListProperty: [
        ["test1", "test2"],
        ["test3", "test4"],
      ],
      structListProperty: [
        kitchenSink.NonClassStruct.createUnsafe({ nonClassProperty: "Test1" }),
        kitchenSink.NonClassStruct.createUnsafe({ nonClassProperty: "Test2" }),
      ],
    }),
    kitchenSink.ListPropertiesStruct,
  ),
  listSetsStruct: new Harness(
    kitchenSink.ListSetsStruct.createUnsafe({
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
    kitchenSink.ListSetsStruct,
  ),
  mutablePropertiesStruct: new Harness(
    kitchenSink.MutablePropertiesStruct.createUnsafe({
      $identifier,
      mutableListProperty: ["test1", "test2"],
      mutableStringProperty: "test",
      mutableSetProperty: ["test1", "test2"],
    }),
    kitchenSink.MutablePropertiesStruct,
  ),
  namedUnionPropertiesStruct1: new Harness(
    kitchenSink.NamedUnionPropertiesStruct.createUnsafe({
      $identifier,
      namedUnion1Property: "test",
      namedUnion2Property: { type: "date", value: new Date("2025-12-08") },
    }),
    kitchenSink.NamedUnionPropertiesStruct,
  ),
  namedUnionPropertiesStruct2: new Harness(
    kitchenSink.NamedUnionPropertiesStruct.createUnsafe({
      $identifier,
      namedUnion1Property: dataFactory.namedNode("http://example.com"),
      namedUnion2Property: {
        type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
    }),
    kitchenSink.NamedUnionPropertiesStruct,
  ),
  // nodeKindsStruct1 = use the first of the node kinds when there are two (e.g., sh:nodeKind sh:BlankNodeOrIRI)
  nodeKindsStruct1: new Harness(
    kitchenSink.NodeKindsStruct.createUnsafe({
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
    kitchenSink.NodeKindsStruct,
  ),
  nodeKindsStruct2: new Harness(
    kitchenSink.NodeKindsStruct.createUnsafe({
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
    kitchenSink.NodeKindsStruct,
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
  numericPropertiesStruct: new Harness(
    kitchenSink.NumericPropertiesStruct.createUnsafe({
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
    kitchenSink.NumericPropertiesStruct,
  ),
  orderedPropertiesStruct: new Harness(
    kitchenSink.OrderedPropertiesStruct.createUnsafe({
      $identifier,
      orderedPropertyA: "testA",
      orderedPropertyB: "testB",
      orderedPropertyC: "testC",
    }),
    kitchenSink.OrderedPropertiesStruct,
  ),
  overrideName: new Harness(
    kitchenSink.NewName.createUnsafe({
      $identifier,
    }),
    kitchenSink.NewName,
    "OverrideNameStruct",
  ),
  // Undefineds
  propertyCardinalitiesStruct1: new Harness(
    kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
      $identifier,
      emptySetProperty: undefined,
      nonEmptySetProperty: ["test"],
      optionalProperty: undefined,
      requiredProperty: "test",
    }),
    kitchenSink.PropertyCardinalitiesStruct,
  ),
  // Arrays and Maybes
  propertyCardinalitiesStruct2: new Harness(
    kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
      $identifier,
      emptySetProperty: [],
      nonEmptySetProperty: ["test"],
      optionalProperty: Maybe.of("test"),
      requiredProperty: "test",
    }),
    kitchenSink.PropertyCardinalitiesStruct,
  ),
  // Convert scalar to set
  propertyCardinalitiesStruct3: new Harness(
    kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
      $identifier,
      emptySetProperty: "test",
      nonEmptySetProperty: "test",
      optionalProperty: "test",
      requiredProperty: "test",
    }),
    kitchenSink.PropertyCardinalitiesStruct,
  ),
  propertyNamesStruct: new Harness(
    kitchenSink.PropertyNamesStruct.createUnsafe({
      $identifier,
      // Should all be actualProperty*
      actualPropertyName1: "actualPropertyValue1",
      actualPropertyName2: "actualPropertyValue2",
      actualPropertyName3: "actualPropertyValue3",
      actualPropertyName4: "actualPropertyValue4",
      actualPropertyName5: "actualPropertyValue5",
    }),
    kitchenSink.PropertyNamesStruct,
  ),
  propertyPathsStruct: new Harness(
    kitchenSink.PropertyPathsStruct.createUnsafe({
      $identifier,
      inversePathProperty: "http://example.com/inversePathPropertyValue",
      predicatePathProperty: "predicatePathPropertyValue",
    }),
    kitchenSink.PropertyPathsStruct,
  ),
  nonClassStruct: new Harness(
    kitchenSink.NonClassStruct.createUnsafe({
      $identifier,
      nonClassProperty: "Test",
    }),
    kitchenSink.NonClassStruct,
  ),
  termPropertiesStruct: new Harness(
    kitchenSink.TermPropertiesStruct.createUnsafe({
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
    kitchenSink.TermPropertiesStruct,
  ),
  unionDiscriminantsStruct1: new Harness(
    kitchenSink.UnionDiscriminantsStruct.createUnsafe({
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
    kitchenSink.UnionDiscriminantsStruct,
  ),
  unionDiscriminantsStruct2: new Harness(
    kitchenSink.UnionDiscriminantsStruct.createUnsafe({
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
    kitchenSink.UnionDiscriminantsStruct,
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

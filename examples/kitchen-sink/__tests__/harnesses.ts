import dataFactory from "@rdfx/data-factory";
import { LiteralFactory } from "@rdfx/literal";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Decimal } from "decimal.js";
import { Maybe } from "purify-ts";
import * as kitchenSink from "../src/index.js";
import { Harness } from "./Harness.js";

const $identifier = dataFactory.namedNode("http://example.com/instance");
const literalFactory = new LiteralFactory({ dataFactory });

export const harnesses = {
  anonymousTypesStruct: new Harness(
    kitchenSink.AnonymousTypesStruct.createUnsafe({
      $identifier,
      anonymousStruct: {
        $identifier: "http://example.com/anonymousStructInstance",
        anonymousStructString: "test",
      },
    }),
    kitchenSink.AnonymousTypesStruct,
  ),
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
  // classsStruct: new Harness(
  //   kitchenSink.ClassPropertiesClass.createUnsafe({
  //     $identifier,
  //     iriClass: dataFactory.namedNode(
  //       "http://example.com/iriClassPropertyInstance",
  //     ),
  //     multiClass: dataFactory.namedNode(
  //       "http://example.com/multiClassPropertyInstance",
  //     ),
  //     nodeClassProperty1: kitchenSink.Non.createUnsafe({
  //       $identifier: dataFactory.namedNode(
  //         "http://example.com/nodeClassProperty1Instance",
  //       ),
  //       nonClass: "test",
  //     }),
  //     nodeClassProperty2: kitchenSink.Partial.createUnsafe({
  //       $identifier: dataFactory.namedNode(
  //         "http://example.com/nodeClassProperty1Instance",
  //       ),
  //       lazilyResolved: "test",
  //     }),
  //     singleClass: dataFactory.namedNode(
  //       "http://example.com/singleClassPropertyInstance",
  //     ),
  //   }),
  //   kitchenSink.ClassProperties,
  // ),
  convertibleTypesStruct: new Harness(
    kitchenSink.ConvertibleTypesStruct.createUnsafe({
      convertibleIriNonEmptySet: [dataFactory.namedNode("http://example.com")],
      convertibleIriOption: "http://example.com",
      convertibleIri: "http://example.com",
      convertibleIriSet: ["http://example.com"],
      convertibleLiteralNonEmptySet: [dataFactory.literal("test")],
      convertibleLiteral: 1,
      convertibleLiteralOption: true,
      convertibleLiteralSet: ["test"],
      convertibleTermOption: literalFactory.number(1),
      convertibleTerm: literalFactory.date(new Date(1523268000000)),
      convertibleTermNonEmptySet: [dataFactory.blankNode()],
      convertibleTermSet: [literalFactory.boolean(true)],
    }),
    kitchenSink.ConvertibleTypesStruct,
  ),
  datatypeUnionsStruct1: new Harness(
    kitchenSink.DatatypeDiscriminatedUnionsStruct.createUnsafe({
      $identifier,
      dateOrDateTime: { $type: "date", value: new Date("2025-12-08") },
      dateTimeOrDate: {
        $type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
      dateOrString: new Date("2025-12-08"),
      decimalOrString: new Decimal("1.0"),
      // integerOrString: 1n,
      langStringOrString: dataFactory.literal("test", "en"),
      stringOrDate: "2025-12-08", // Shouldn't parse as a Date
      stringOrDecimal: "test",
      // stringOrInteger: "test",
      stringOrLangString: "test",
    }),
    kitchenSink.DatatypeDiscriminatedUnionsStruct,
  ),
  datatypeUnionsStruct2: new Harness(
    kitchenSink.DatatypeDiscriminatedUnionsStruct.createUnsafe({
      $identifier,
      dateOrDateTime: {
        $type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
      dateTimeOrDate: { $type: "date", value: new Date("2025-12-08") },
      dateOrString: "2025-12-08", // Shouldn't parse as a Date
      decimalOrString: "test",
      // integerOrString: "test",
      langStringOrString: "test",
      stringOrDate: new Date("2025-12-08"),
      stringOrDecimal: new Decimal("1.0"),
      // stringOrInteger: 1n,
      stringOrLangString: dataFactory.literal("test", "en"),
    }),
    kitchenSink.DatatypeDiscriminatedUnionsStruct,
  ),
  defaultValuesStruct: new Harness(
    kitchenSink.DefaultValuesStruct.createUnsafe({
      $identifier,
    }),
    kitchenSink.DefaultValuesStruct,
  ),
  defaultValuesStructOverriddenDifferent: new Harness(
    kitchenSink.DefaultValuesStruct.createUnsafe({
      falseBooleanDefaultValue: true,
      $identifier,
      numberDefaultValue: 1,
      stringDefaultValue: "test",
      trueBooleanDefaultValue: false,
    }),
    kitchenSink.DefaultValuesStruct,
  ),
  defaultValuesStructOverriddenSame: new Harness(
    kitchenSink.DefaultValuesStruct.createUnsafe({
      falseBooleanDefaultValue: false,
      dateDefaultValue: new Date("2025-03-06"),
      dateTimeDefaultValue: new Date(1523268000000),
      $identifier,
      numberDefaultValue: 0,
      stringDefaultValue: "",
      trueBooleanDefaultValue: true,
    }),
    kitchenSink.DefaultValuesStruct,
  ),
  directRecursiveStruct: new Harness(
    kitchenSink.DirectRecursiveStruct.createUnsafe({
      directRecursive: kitchenSink.DirectRecursiveStruct.createUnsafe({}),
    }),
    kitchenSink.DirectRecursiveStruct,
  ),
  displaysStruct: new Harness(
    kitchenSink.DisplayStruct.createUnsafe({
      $identifier,
      explicitFalseDisplay: "explicitFalseDisplayValue",
      explicitTrueDisplay: "explicitTrueDisplayValue",
      implicitFalseDisplay: "implicitFalseDisplayValue",
    }),
    kitchenSink.DisplayStruct,
  ),
  explicitFromToRdfTypesStruct: new Harness(
    kitchenSink.ExplicitFromToRdfTypesStruct.createUnsafe({
      $identifier,
      explicitFromToRdfTypesString: "test",
    }),
    kitchenSink.ExplicitFromToRdfTypesStruct,
  ),
  explicitRdfTypeStruct: new Harness(
    kitchenSink.ExplicitRdfTypeStruct.createUnsafe({
      $identifier,
      explicitRdfTypeString: "test",
    }),
    kitchenSink.ExplicitRdfTypeStruct,
  ),
  flattenDiscriminatedUnionMember1: new Harness(
    kitchenSink.DiscriminatedUnionMember1.createUnsafe({
      $identifier,
      discriminatedUnionMemberCommon: "test common property",
      discriminatedUnionMember1Distinct: "test member 1",
    }),
    kitchenSink.FlattenDiscriminatedUnion,
    "FlattenDiscriminatedUnion",
  ),
  flattenDiscriminatedUnionMember2: new Harness(
    kitchenSink.DiscriminatedUnionMember2.createUnsafe({
      $identifier,
      discriminatedUnionMemberCommon: "test common property",
      discriminatedUnionMember2Distinct: "test member 2",
    }),
    kitchenSink.FlattenDiscriminatedUnion,
    "FlattenDiscriminatedUnion",
  ),
  flattenDiscriminatedUnionMember3: new Harness(
    kitchenSink.FlattenDiscriminatedUnionMember3.createUnsafe({
      $identifier,
      flattenDiscriminatedUnionMember3String: "test",
    }),
    kitchenSink.FlattenDiscriminatedUnion,
    "FlattenDiscriminatedUnion",
  ),
  indirectRecursiveStruct: new Harness(
    kitchenSink.IndirectRecursiveStruct.createUnsafe({
      indirectRecursiveHelper:
        kitchenSink.IndirectRecursiveStructHelper.createUnsafe({
          indirectRecursive: kitchenSink.IndirectRecursiveStruct.createUnsafe(
            {},
          ),
        }),
    }),
    kitchenSink.IndirectRecursiveStruct,
  ),
  hasValuesStruct: new Harness(
    kitchenSink.HasValuesStruct.createUnsafe({
      $identifier,
      hasIriValue: dataFactory.namedNode(
        "http://example.com/HasValuesStructIri1",
      ),
      hasLiteralValue: "test",
    }),
    kitchenSink.HasValuesStruct,
  ),
  ignoredPropertiesStruct: new Harness(
    kitchenSink.IgnoredPropertiesStruct.createUnsafe({
      $identifier,
      severityDefaultProperty: "severity default",
      severityViolationProperty: "severity violation",
      shaclmateIgnoreFalseProperty: "shaclmate:ignore false",
    }),
    kitchenSink.IgnoredPropertiesStruct,
  ),
  inIdentifierStruct: new Harness(
    kitchenSink.InIdentifierStruct.createUnsafe({
      $identifier: dataFactory.namedNode(
        "http://example.com/InIdentifierStructInstance1",
      ),
      inIdentifierString: "doesn't matter",
    }),
    kitchenSink.InIdentifierStruct,
  ),
  inPropertiesStruct: new Harness(
    kitchenSink.InPropertiesStruct.createUnsafe({
      $identifier,
      inBooleans: true,
      inDateTimes: new Date("2018-04-09T10:00:00.000Z"),
      inDoubles: 1,
      inIris: dataFactory.namedNode("http://example.com/InIri1"),
      inStrings: "text",
      reusableIn: "cat",
    }),
    kitchenSink.InPropertiesStruct,
  ),
  iriIdentifierStruct: new Harness(
    kitchenSink.IriIdentifierStruct.createUnsafe({
      $identifier,
    }),
    kitchenSink.IriIdentifierStruct,
  ),
  languageInsStruct: new Harness(
    kitchenSink.LanguageInStruct.createUnsafe({
      $identifier,
      languageInLiteral: [
        dataFactory.literal("frvalue", "fr"),
        dataFactory.literal("envalue", "en"),
      ],
    }),
    kitchenSink.LanguageInStruct,
  ),
  lazyPropertiesStructEmpty: new Harness(
    kitchenSink.LazyPropertiesStruct.createUnsafe({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      requiredLazyToResolvedBlankNodeOrIriIdentifier:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInstance1",
          ),
          lazilyResolved: "test required empty",
        }),
      requiredPartialToResolvedBlankNodeOrIriIdentifier:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInstance2",
          ),
          lazilyResolved: "test required empty",
        }),
    }),
    kitchenSink.LazyPropertiesStruct,
  ),
  lazyPropertiesStructNonEmpty: new Harness(
    kitchenSink.LazyPropertiesStruct.createUnsafe({
      $identifier,
      // These nested objects won't be resolvable since they're not serialized with $toRdf.
      // This harness is just intended to test the deserialization/deserialization of the identifiers.
      optionalLazyToResolvedBlankNodeOrIriIdentifier:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance1"),
          lazilyResolved:
            "optionalLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      optionalLazyToResolvedDiscriminatedUnion:
        kitchenSink.LazilyResolvedDiscriminatedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance2"),
          lazilyResolved: "optionalLazyToResolvedDiscriminatedUnionProperty",
        }),
      optionalLazyToResolvedIriIdentifier:
        kitchenSink.LazilyResolvedIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance3"),
          lazilyResolved: "optionalLazyToResolvedIriIdentifierProperty",
        }),
      optionalPartialToResolvedBlankNodeOrIriIdentifier:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance4"),
          lazilyResolved:
            "optionalPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      optionalPartialToResolvedDiscriminatedUnion:
        kitchenSink.LazilyResolvedDiscriminatedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance5"),
          lazilyResolved: "optionalPartialToResolvedDiscriminatedUnionProperty",
        }),
      optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnion:
        kitchenSink.LazilyResolvedDiscriminatedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance6"),
          lazilyResolved:
            "optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnionProperty",
        }),
      requiredLazyToResolvedBlankNodeOrIriIdentifier:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance7"),
          lazilyResolved:
            "requiredLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      requiredPartialToResolvedBlankNodeOrIriIdentifier:
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance8"),
          lazilyResolved:
            "requiredPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      setLazyToResolvedBlankNodeOrIriIdentifier: [
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance9"),
          lazilyResolved: "setLazyToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      ],
      setPartialToResolvedBlankNodeOrIriIdentifier: [
        kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
          $identifier: dataFactory.namedNode("http://example.com/instance10"),
          lazilyResolved:
            "setPartialToResolvedBlankNodeOrIriIdentifierProperty",
        }),
      ],
    }),
    kitchenSink.LazyPropertiesStruct,
  ),
  listsStructDefault: new Harness(
    kitchenSink.ListsStruct.createUnsafe({
      $identifier,
    }),
    kitchenSink.ListsStruct,
  ),
  listProperiesStructFromArrays: new Harness(
    kitchenSink.ListsStruct.createUnsafe({
      $identifier,
      iriList: [
        // The constructor will convert these to NamedNode's
        "http://example.com/example1",
        "http://example.com/example2",
      ],
      stringList: ["test1", "test2"],
      stringListList: [
        ["test1", "test2"],
        ["test3", "test4"],
      ],
      structList: [
        kitchenSink.NonClassStruct.createUnsafe({ nonClassString: "Test1" }),
        kitchenSink.NonClassStruct.createUnsafe({ nonClassString: "Test2" }),
      ],
    }),
    kitchenSink.ListsStruct,
  ),
  listSetsStruct: new Harness(
    kitchenSink.ListSetsStruct.createUnsafe({
      $identifier,
      listDiscriminatedUnionSet: [
        "test1",
        ["test2", "test3"],
        "test4",
        ["test5", "test6"],
      ],
      listSet: [
        ["test1", "test2"],
        ["test3", "test4"],
      ],
      listListSet: [
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
      mutableList: ["test1", "test2"],
      mutableString: "test",
      mutableSet: ["test1", "test2"],
    }),
    kitchenSink.MutablePropertiesStruct,
  ),
  namedDiscriminatedUnionsStruct1: new Harness(
    kitchenSink.NamedDiscriminatedUnionsStruct.createUnsafe({
      $identifier,
      namedDiscriminatedUnion1: "test",
      namedDiscriminatedUnion2: {
        $type: "date",
        value: new Date("2025-12-08"),
      },
    }),
    kitchenSink.NamedDiscriminatedUnionsStruct,
  ),
  namedDiscriminatedUnionsStruct2: new Harness(
    kitchenSink.NamedDiscriminatedUnionsStruct.createUnsafe({
      $identifier,
      namedDiscriminatedUnion1: dataFactory.namedNode("http://example.com"),
      namedDiscriminatedUnion2: {
        $type: "dateTime",
        value: new Date("2025-12-08T21:17:27+00:00"),
      },
    }),
    kitchenSink.NamedDiscriminatedUnionsStruct,
  ),
  // nodeKindsStruct1 = use the first of the node kinds when there are two (e.g., sh:nodeKind sh:BlankNodeOrIRI)
  nodeKindsStruct1: new Harness(
    kitchenSink.NodeKindsStruct.createUnsafe({
      $identifier,
      blankNodeKind: dataFactory.blankNode(),
      blankNodeOrIriNodeKind: dataFactory.blankNode(),
      blankNodeOrLiteralNodeKind: dataFactory.blankNode(),
      iriNodeKind: dataFactory.namedNode(
        "http://example.com/iriNodeKindPropertyValue",
      ),
      iriOrLiteralNodeKind: dataFactory.namedNode(
        "http://example.com/iriOrLiteralNodeKindPropertyValue",
      ),
      literalNodeKind: dataFactory.literal("literalNodeKindValue"),
    }),
    kitchenSink.NodeKindsStruct,
  ),
  nodeKindsStruct2: new Harness(
    kitchenSink.NodeKindsStruct.createUnsafe({
      $identifier,
      blankNodeKind: dataFactory.blankNode(),
      blankNodeOrIriNodeKind: dataFactory.namedNode(
        "http://example.com/blankNodeOrIriNodeKindPropertyValue",
      ),
      blankNodeOrLiteralNodeKind: dataFactory.literal(
        "blankNodeOrLiteralNodeKindPropertyValue",
      ),
      iriNodeKind: dataFactory.namedNode(
        "http://example.com/iriNodeKindPropertyValue",
      ),
      iriOrLiteralNodeKind: dataFactory.literal(
        "iriOrLiteralNodeKindPropertyValue",
      ),
      literalNodeKind: dataFactory.literal("literalNodeKindPropertyValue"),
    }),
    kitchenSink.NodeKindsStruct,
  ),
  noRdfTypeDiscriminatedUnionMember1: new Harness(
    kitchenSink.NoRdfTypeDiscriminatedUnionMember1.createUnsafe({
      $identifier,
      noRdfTypeDiscriminatedUnionMember1String: "test",
    }),
    kitchenSink.NoRdfTypeDiscriminatedUnion,
    "NoRdfTypeDiscriminatedUnion",
  ),
  noRdfTypeDiscriminatedUnionMember2: new Harness(
    kitchenSink.NoRdfTypeDiscriminatedUnionMember2.createUnsafe({
      $identifier,
      noRdfTypeDiscriminatedUnionMember2String: "test",
    }),
    kitchenSink.NoRdfTypeDiscriminatedUnion,
    "NoRdfTypeDiscriminatedUnion",
  ),
  numericsStruct: new Harness(
    kitchenSink.NumericsStruct.createUnsafe({
      $identifier,
      byteNumeric: -1,
      decimalNumeric: new Decimal(1.0),
      doubleNumeric: 1.1,
      floatNumeric: 1.1,
      intNumeric: -1,
      integerNumeric: 1n,
      longNumeric: -1n,
      negativeIntegerNumeric: -1n,
      nonNegativeIntegerNumeric: 0n,
      nonPositiveIntegerNumeric: 0n,
      positiveIntegerNumeric: 1n,
      shortNumeric: 1,
      unsignedByteNumeric: 1,
      unsignedIntNumeric: 1,
      unsignedLongNumeric: 1n,
      unsignedShortNumeric: 1,
    }),
    kitchenSink.NumericsStruct,
  ),
  orderedStruct: new Harness(
    kitchenSink.OrderedStruct.createUnsafe({
      $identifier,
      orderedA: "testA",
      orderedB: "testB",
      orderedC: "testC",
    }),
    kitchenSink.OrderedStruct,
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
      emptySet: undefined,
      nonEmptySet: ["test"],
      optional: undefined,
      required: "test",
    }),
    kitchenSink.PropertyCardinalitiesStruct,
  ),
  // Arrays and Maybes
  propertyCardinalitiesStruct2: new Harness(
    kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
      $identifier,
      emptySet: [],
      nonEmptySet: ["test"],
      optional: Maybe.of("test"),
      required: "test",
    }),
    kitchenSink.PropertyCardinalitiesStruct,
  ),
  // Convert scalar to set
  propertyCardinalitiesStruct3: new Harness(
    kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
      $identifier,
      emptySet: "test",
      nonEmptySet: "test",
      optional: "test",
      required: "test",
    }),
    kitchenSink.PropertyCardinalitiesStruct,
  ),
  propertyNamesStruct: new Harness(
    kitchenSink.PropertyNamesStruct.createUnsafe({
      $identifier,
      // Should all be actualName*
      actualName1: "actualValue1",
      actualName2: "actualValue2",
      actualName3: "actualValue3",
      actualName4: "actualValue4",
      actualName5: "actualValue5",
    }),
    kitchenSink.PropertyNamesStruct,
  ),
  propertyPathsStruct: new Harness(
    kitchenSink.PropertyPathsStruct.createUnsafe({
      $identifier,
      inversePath: "http://example.com/inversePathValue",
      predicatePath: "predicatePathPropertyValue",
    }),
    kitchenSink.PropertyPathsStruct,
  ),
  nonClassStruct: new Harness(
    kitchenSink.NonClassStruct.createUnsafe({
      $identifier,
      nonClassString: "Test",
    }),
    kitchenSink.NonClassStruct,
  ),
  targetClassStruct: new Harness(
    kitchenSink.TargetClassStruct.createUnsafe({
      $identifier,
      targetClassString: "test",
    }),
    kitchenSink.TargetClassStruct,
  ),
  termsStruct: new Harness(
    kitchenSink.TermsStruct.createUnsafe({
      blankNodeTerm: dataFactory.blankNode(),
      booleanTerm: true,
      dateTerm: new Date("2025-03-06"),
      dateTimeTerm: new Date(1523268000000),
      $identifier,
      iriTerm: dataFactory.namedNode("http://example.com"),
      langStringTerm: dataFactory.literal("test", "en"),
      literalTerm: dataFactory.literal("test"),
      numberTerm: 1.0,
      stringTerm: "test",
      term: dataFactory.literal("1", xsd.decimal), // Use a literal instead of a number to avoid an issue with Oxigraph literal normalization (https://github.com/oxigraph/oxigraph/issues/526)
    }),
    kitchenSink.TermsStruct,
  ),
  unionDiscriminantsStruct1: new Harness(
    kitchenSink.UnionDiscriminantsStruct.createUnsafe({
      $identifier,
      optionalNodeOrNodeOrString: {
        $type: "DiscriminatedUnionMember1",
        value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/discriminatedUnionMember1a",
          ),
          discriminatedUnionMember1Distinct: "test",
          discriminatedUnionMemberCommon: "test",
        }),
      },
      optionalIriOrLiteral: dataFactory.namedNode("http://example.com"),
      optionalIriOrString: dataFactory.namedNode("http://example.com"),
      requiredNodeOrNodeOrString: {
        $type: "DiscriminatedUnionMember1",
        value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/discriminatedUnionMember1b",
          ),
          discriminatedUnionMember1Distinct: "test",
          discriminatedUnionMemberCommon: "test",
        }),
      },
      requiredNodeOrLiteral: {
        termType: "DiscriminatedUnionMember1",
        value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/discriminatedUnionMember1c",
          ),
          discriminatedUnionMember1Distinct: "test",
          discriminatedUnionMemberCommon: "test",
        }),
      },
      requiredIriOrLiteral: dataFactory.namedNode("http://example.com"),
      requiredIriOrString: dataFactory.namedNode("http://example.com"),
      // Don't specify the set properties to test undefined
    }),
    kitchenSink.UnionDiscriminantsStruct,
  ),
  unionDiscriminantsStruct2: new Harness(
    kitchenSink.UnionDiscriminantsStruct.createUnsafe({
      $identifier,
      optionalNodeOrNodeOrString: {
        $type: "DiscriminatedUnionMember2",
        value: kitchenSink.DiscriminatedUnionMember2.createUnsafe({
          $identifier: dataFactory.namedNode(
            "http://example.com/discriminatedUnionMember2a",
          ),
          discriminatedUnionMember2Distinct: "test",
          discriminatedUnionMemberCommon: "test",
        }),
      },
      optionalNodeOrLiteral: dataFactory.literal("test"),
      optionalIriOrLiteral: dataFactory.literal("test"),
      optionalIriOrString: "test",
      requiredNodeOrNodeOrString: {
        $type: "string",
        value: "test",
      },
      requiredNodeOrLiteral: dataFactory.literal("test"),
      requiredIriOrLiteral: dataFactory.literal("test"),
      requiredIriOrString: "test",
      setNodeOrNodeOrString: [
        // Opposite order
        {
          $type: "string",
          value: "test",
        },
        {
          $type: "DiscriminatedUnionMember2",
          value: kitchenSink.DiscriminatedUnionMember2.createUnsafe({
            $identifier: dataFactory.namedNode(
              "http://example.com/discriminatedUnionMember2b",
            ),
            discriminatedUnionMember2Distinct: "test",
            discriminatedUnionMemberCommon: "test",
          }),
        },
        {
          $type: "DiscriminatedUnionMember1",
          value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
            $identifier: dataFactory.namedNode(
              "http://example.com/discriminatedUnionMember1b",
            ),
            discriminatedUnionMember1Distinct: "test",
            discriminatedUnionMemberCommon: "test",
          }),
        },
      ],
      setNodeOrLiteral: [
        // Opposite order
        dataFactory.literal("test"),
        {
          termType: "DiscriminatedUnionMember1",
          value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
            $identifier: dataFactory.namedNode(
              "http://example.com/discriminatedUnionMember1c",
            ),
            discriminatedUnionMember1Distinct: "test",
            discriminatedUnionMemberCommon: "test",
          }),
        },
      ],
      setIriOrLiteral: [
        dataFactory.literal("test"),
        dataFactory.namedNode("http://example.com"),
      ],
      setIriOrString: ["test", dataFactory.namedNode("http://example.com")],
    }),
    kitchenSink.UnionDiscriminantsStruct,
  ),
  discriminatedUnionMember1: new Harness(
    kitchenSink.DiscriminatedUnionMember1.createUnsafe({
      $identifier,
      discriminatedUnionMemberCommon: "test common parent",
      discriminatedUnionMember1Distinct: "test",
    }),
    kitchenSink.DiscriminatedUnion,
    "DiscriminatedUnion",
  ),
  discriminatedUnionMember2: new Harness(
    kitchenSink.DiscriminatedUnionMember2.createUnsafe({
      $identifier,
      discriminatedUnionMemberCommon: "test common parent",
      discriminatedUnionMember2Distinct: "test",
    }),
    kitchenSink.DiscriminatedUnion,
    "DiscriminatedUnion",
  ),
};

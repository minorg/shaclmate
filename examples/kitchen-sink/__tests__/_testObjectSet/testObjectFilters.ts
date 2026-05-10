import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Decimal } from "decimal.js";
import { NonEmptyList } from "purify-ts";
import { describe, it } from "vitest";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectFilters(createObjectSet: ObjectSetFactory) {
  describe("object filters", () => {
    const identifiers = [...new Array(10)].map((_, i) =>
      dataFactory.namedNode(`http://example.com/${i}`),
    );

    describe("blank node", () => {
      const objectSet = createObjectSet(
        objectDataset([
          kitchenSink.TermProperties.$create({
            blankNodeTermProperty: dataFactory.blankNode(),
          }),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[1],
            stringTermProperty: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        present: [{ blankNodeTermProperty: {} }, [identifiers[0]]],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          if (objectSet instanceof kitchenSink.$SparqlObjectSet) {
            return;
          }

          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("BigDecimal", () => {
      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            kitchenSink.NumericProperties.$create({
              $identifier: identifiers[i],
              decimalNumericProperty: new Decimal(i),
            }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [
          { decimalNumericProperty: { in: [new Decimal(0)] } },
          [identifiers[0]],
        ],
        maxExclusive: [
          { decimalNumericProperty: { maxExclusive: new Decimal(1) } },
          [identifiers[0]],
        ],
        maxInclusive: [
          { decimalNumericProperty: { maxInclusive: new Decimal(0) } },
          [identifiers[0]],
        ],
        minExclusive: [
          { decimalNumericProperty: { minExclusive: new Decimal(0) } },
          [identifiers[1]],
        ],
        minInclusive: [
          { decimalNumericProperty: { minInclusive: new Decimal(0) } },
          [identifiers[0], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.NumericProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.numericPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("bigint", () => {
      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            kitchenSink.NumericProperties.$create({
              $identifier: identifiers[i],
              integerNumericProperty: BigInt(i),
            }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ integerNumericProperty: { in: [0n] } }, [identifiers[0]]],
        maxExclusive: [
          { integerNumericProperty: { maxExclusive: 1n } },
          [identifiers[0]],
        ],
        maxInclusive: [
          { integerNumericProperty: { maxInclusive: 0n } },
          [identifiers[0]],
        ],
        minExclusive: [
          { integerNumericProperty: { minExclusive: 0n } },
          [identifiers[1]],
        ],
        minInclusive: [
          { integerNumericProperty: { minInclusive: 0n } },
          [identifiers[0], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.NumericProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.numericPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("boolean", () => {
      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            kitchenSink.TermProperties.$create({
              $identifier: identifiers[i],
              booleanTermProperty: i === 0,
            }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        valueFalse: [
          { booleanTermProperty: { value: false } },
          [identifiers[1]],
        ],
        valueTrue: [{ booleanTermProperty: { value: true } }, [identifiers[0]]],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("Date", () => {
      const baseValue = new Date(1523268000000);

      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            kitchenSink.TermProperties.$create({
              $identifier: identifiers[i],
              dateTimeTermProperty: new Date(baseValue.getTime() + i * 1000),
            }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ dateTimeTermProperty: { in: [baseValue] } }, [identifiers[0]]],
        maxExclusive: [
          {
            dateTimeTermProperty: {
              maxExclusive: new Date(baseValue.getTime() + 1000),
            },
          },
          [identifiers[0]],
        ],
        maxInclusive: [
          { dateTimeTermProperty: { maxInclusive: baseValue } },
          [identifiers[0]],
        ],
        minExclusive: [
          { dateTimeTermProperty: { minExclusive: baseValue } },
          [identifiers[1]],
        ],
        minInclusive: [
          { dateTimeTermProperty: { minInclusive: baseValue } },
          [identifiers[0], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("identifier", () => {
      const blankNodeIdentifier = dataFactory.blankNode();
      const namedNodeIdentifier = dataFactory.namedNode("http://example.com");

      const objectSet = createObjectSet(
        objectDataset([
          kitchenSink.TermProperties.$create({
            $identifier: blankNodeIdentifier,
            stringTermProperty: "ignored",
          }),
          kitchenSink.TermProperties.$create({
            $identifier: namedNodeIdentifier,
            stringTermProperty: "ignored",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [
          { $identifier: { in: [namedNodeIdentifier] } },
          [namedNodeIdentifier],
        ],
        typeBlankNode: [
          { $identifier: { type: "BlankNode" } },
          [blankNodeIdentifier],
        ],
        typeNamedNode: [
          { $identifier: { type: "NamedNode" } },
          [namedNodeIdentifier],
        ],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly (BlankNode | NamedNode)[]]
      >)) {
        it(id, async ({ expect }) => {
          if (
            id === "typeBlankNode" &&
            objectSet instanceof kitchenSink.$SparqlObjectSet
          ) {
            return;
          }
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            if (expected[i].termType === "NamedNode") {
              expect(expected[i].equals(actual[i]));
            }
          }
        });
      }
    });

    describe("literal", () => {
      const objectSet = createObjectSet(
        objectDataset([
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[0],
            literalTermProperty: dataFactory.literal("test"),
          }),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[1],
            literalTermProperty: dataFactory.literal("test", "en"),
          }),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            literalTermProperty: dataFactory.literal("1", xsd.integer),
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        datatypeIn: [
          { literalTermProperty: { datatypeIn: [xsd.integer] } },
          [identifiers[2]],
        ],
        in: [
          { literalTermProperty: { in: [dataFactory.literal("test")] } },
          [identifiers[0]],
        ],
        languageIn: [
          { literalTermProperty: { languageIn: ["en"] } },
          [identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("named node", () => {
      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            kitchenSink.TermProperties.$create({
              $identifier: identifiers[i],
              iriTermProperty: dataFactory.namedNode(
                `http://example.com/prop${i}`,
              ),
            }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [
          {
            iriTermProperty: {
              in: [dataFactory.namedNode("http://example.com/prop0")],
            },
          },
          [identifiers[0]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("number", () => {
      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            kitchenSink.TermProperties.$create({
              $identifier: identifiers[i],
              numberTermProperty: i,
            }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ numberTermProperty: { in: [0] } }, [identifiers[0]]],
        maxExclusive: [
          { numberTermProperty: { maxExclusive: 1 } },
          [identifiers[0]],
        ],
        maxInclusive: [
          { numberTermProperty: { maxInclusive: 0 } },
          [identifiers[0]],
        ],
        minExclusive: [
          { numberTermProperty: { minExclusive: 0 } },
          [identifiers[1]],
        ],
        minInclusive: [
          { numberTermProperty: { minInclusive: 0 } },
          [identifiers[0], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("object", () => {
      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            kitchenSink.ConcreteChild.$create({
              baseWithPropertiesProperty: `test${i}`,
              $identifier: identifiers[i],
              concreteChildProperty: `test${i}`,
              concreteParentProperty: `test${i}`,
            }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            numberTermProperty: 0,
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        childProperty: [
          { concreteChildProperty: { in: ["test1"] } },
          [identifiers[1]],
        ],
        identifier: [
          { $identifier: { in: [identifiers[1]] } },
          [identifiers[1]],
        ],
        parentProperty: [
          { concreteParentProperty: { in: ["test0"] } },
          [identifiers[0]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.ConcreteChild.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.concreteChildIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("object union", () => {
      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            i === 0
              ? kitchenSink.UnionMember1.$create({
                  $identifier: identifiers[i],
                  unionMember1Property: `test${i}`,
                  unionMemberCommonParentProperty: `test${i}`,
                })
              : kitchenSink.UnionMember2.$create({
                  $identifier: identifiers[i],
                  unionMember2Property: `test${i}`,
                  unionMemberCommonParentProperty: `test${i}`,
                }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            numberTermProperty: 0,
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        identifier: [
          { $identifier: { in: [identifiers[0]] } },
          [identifiers[0]],
        ],
        noOn: [{}, [identifiers[0], identifiers[1]]],
        onBothMembersPositive: [
          {
            on: {
              UnionMember1: {
                unionMemberCommonParentProperty: { in: ["test0"] },
              },
              UnionMember2: {
                unionMemberCommonParentProperty: { in: ["test1"] },
              },
            },
          },
          [identifiers[0], identifiers[1]],
        ],
        onMember1Negative: [
          {
            on: {
              UnionMember1: {
                unionMemberCommonParentProperty: { in: ["test1"] },
              },
            },
          },
          [identifiers[1]],
        ],
        onMember1Positive: [
          {
            on: {
              UnionMember1: {
                unionMemberCommonParentProperty: { in: ["test0"] },
              },
            },
          },
          [identifiers[0], identifiers[1]],
        ],
        onMember2Negative: [
          {
            on: {
              UnionMember2: {
                unionMemberCommonParentProperty: { in: ["test0"] },
              },
            },
          },
          [identifiers[0]],
        ],
        onMember2Positive: [
          {
            on: {
              UnionMember2: {
                unionMemberCommonParentProperty: { in: ["test1"] },
              },
            },
          },
          [identifiers[1], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.Union.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.unionIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("option", () => {
      const instance = kitchenSink.TermProperties.$create({
        booleanTermProperty: true,
        $identifier: identifiers[0],
      });
      const objectSet = createObjectSet(objectDataset([instance]));

      for (const [id, [filter, expected]] of Object.entries({
        null1: [{ booleanTermProperty: null }, []],
        null2: [{ stringTermProperty: null }, [identifiers[0]]],
        nonNull1: [{ booleanTermProperty: {} }, [identifiers[0]]],
        nonNull2: [{ stringTermProperty: {} }, []],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("set", () => {
      const value = "test";
      const objectSet = createObjectSet(
        objectDataset([
          kitchenSink.PropertyCardinalities.$create({
            $identifier: identifiers[0],
            emptyStringSetProperty: [value],
            nonEmptyStringSetProperty: NonEmptyList([value]),
            requiredStringProperty: value,
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        items: [{ emptyStringSetProperty: { in: [value] } }, [identifiers[0]]],
        ...(!(objectSet instanceof kitchenSink.$SparqlObjectSet)
          ? {
              maxCount0: [{ emptyStringSetProperty: { $maxCount: 0 } }, []],
              maxCount1: [
                { emptyStringSetProperty: { $maxCount: 1 } },
                [identifiers[0]],
              ],
              minCount1: [
                { emptyStringSetProperty: { $minCount: 1 } },
                [identifiers[0]],
              ],
              minCount2: [{ emptyStringSetProperty: { $minCount: 2 } }, []],
            }
          : {}),
      } satisfies Record<
        string,
        [kitchenSink.PropertyCardinalities.$Filter, readonly NamedNode[]]
      >))
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.propertyCardinalitiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
    });

    describe("string", () => {
      const objectSet = createObjectSet(
        objectDataset([
          ...[...new Array(2)].map((_, i) =>
            kitchenSink.TermProperties.$create({
              $identifier: identifiers[i],
              stringTermProperty: "x".repeat(i + 1),
            }),
          ),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            numberTermProperty: 0,
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ stringTermProperty: { in: ["x"] } }, [identifiers[0]]],
        maxLength: [{ stringTermProperty: { maxLength: 1 } }, [identifiers[0]]],
        minLength: [{ stringTermProperty: { maxLength: 1 } }, [identifiers[1]]],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("term", () => {
      const objectSet = createObjectSet(
        objectDataset([
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[0],
            termProperty: dataFactory.literal("test"),
          }),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[1],
            termProperty: dataFactory.literal("test", "en"),
          }),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[2],
            termProperty: dataFactory.literal("1", xsd.integer),
          }),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[3],
            termProperty: dataFactory.namedNode("http://example.com"),
          }),
          kitchenSink.TermProperties.$create({
            $identifier: identifiers[4],
            stringTermProperty: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        datatypeIn: [
          { termProperty: { datatypeIn: [xsd.integer] } },
          [identifiers[2]],
        ],
        in: [
          { termProperty: { in: [dataFactory.literal("test")] } },
          [identifiers[0]],
        ],
        languageIn: [
          { termProperty: { languageIn: ["en"] } },
          [identifiers[1]],
        ],
        typeIn: [{ termProperty: { typeIn: ["NamedNode"] } }, [identifiers[3]]],
      } satisfies Record<
        string,
        [kitchenSink.TermProperties.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termPropertiesIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });

    describe("union", () => {
      const objectSet = createObjectSet(
        objectDataset([
          kitchenSink.UnionDiscriminants.$create({
            $identifier: identifiers[0],
            requiredNodeOrNodeOrStringProperty: {
              type: "UnionMember1",
              value: kitchenSink.UnionMember1.$create({
                $identifier: dataFactory.namedNode(
                  "http://example.com/unionMember1",
                ),
                unionMember1Property: "http://example.com/test0",
                unionMemberCommonParentProperty: "http://example.com/test0",
              }),
            },
            requiredNodeOrLiteralProperty: {
              termType: "UnionMember1",
              value: kitchenSink.UnionMember1.$create({
                $identifier: dataFactory.namedNode(
                  "http://example.com/unionMember1",
                ),
                unionMember1Property: "http://example.com/test0",
                unionMemberCommonParentProperty: "http://example.com/test0",
              }),
            },
            requiredIriOrLiteralProperty: dataFactory.namedNode(
              "http://example.com/test0",
            ),
            requiredIriOrStringProperty: dataFactory.namedNode(
              "http://example.com/test0",
            ),
          }),
          kitchenSink.UnionDiscriminants.$create({
            $identifier: identifiers[1],
            requiredNodeOrNodeOrStringProperty: {
              type: "string",
              value: "http://example.com/test1",
            },
            requiredNodeOrLiteralProperty: dataFactory.literal(
              "http://example.com/test1",
            ),
            requiredIriOrLiteralProperty: dataFactory.literal(
              "http://example.com/test1",
            ),
            requiredIriOrStringProperty: "http://example.com/test1",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        extrinsicPositive: [
          {
            requiredNodeOrNodeOrStringProperty: {
              on: {
                UnionMember1: {
                  unionMember1Property: {
                    in: ["http://example.com/test0"],
                  },
                },
                UnionMember2: {
                  unionMember2Property: {
                    in: ["http://example.com/test0"],
                  },
                },
                string: { in: ["http://example.com/test0"] },
              },
            },
          },
          [identifiers[0]],
        ],
        extrinsicNegative: [
          {
            requiredNodeOrNodeOrStringProperty: {
              on: {
                UnionMember1: {
                  unionMember1Property: {
                    in: ["http://example.com/testx"],
                  },
                },
                UnionMember2: {
                  unionMember2Property: {
                    in: ["http://example.com/testx"],
                  },
                },
                string: { in: ["http://example.com/testx"] },
              },
            },
          },
          [],
        ],
        hybridPositive: [
          {
            requiredNodeOrLiteralProperty: {
              on: {
                UnionMember1: {
                  unionMember1Property: {
                    in: ["http://example.com/test0"],
                  },
                },
                Literal: {
                  in: [dataFactory.literal("http://example.com/test0")],
                },
              },
            },
          },
          [identifiers[0]],
        ],
        hybridNegative: [
          {
            requiredNodeOrLiteralProperty: {
              on: {
                UnionMember1: {
                  unionMember1Property: {
                    in: ["http://example.com/testx"],
                  },
                },
                Literal: {
                  in: [dataFactory.literal("http://example.com/testx")],
                },
              },
            },
          },
          [],
        ],
        intrinsicPositive: [
          {
            requiredIriOrLiteralProperty: {
              on: {
                Literal: {
                  in: [dataFactory.literal("http://example.com/test0")],
                },
                NamedNode: {
                  in: [dataFactory.namedNode("http://example.com/test0")],
                },
              },
            },
          },
          [identifiers[0]],
        ],
        intrinsicNegative: [
          {
            requiredIriOrLiteralProperty: {
              on: {
                Literal: {
                  in: [dataFactory.literal("http://example.com/testXXX")],
                },
                NamedNode: {
                  in: [dataFactory.namedNode("http://example.com/testXXX")],
                },
              },
            },
          },
          [],
        ],
        typeofPositive: [
          {
            requiredIriOrStringProperty: {
              on: {
                object: {
                  in: [dataFactory.namedNode("http://example.com/test0")],
                },
                string: { in: ["http://example.com/test0"] },
              },
            },
          },
          [identifiers[0]],
        ],
        typeofNegative: [
          {
            requiredIriOrStringProperty: {
              on: {
                object: {
                  in: [dataFactory.namedNode("http://example.com/testx")],
                },
                string: { in: ["http://example.com/testx"] },
              },
            },
          },
          [],
        ],
      } satisfies Record<
        string,
        [kitchenSink.UnionDiscriminants.$Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          // if (id.endsWith("Negative")) {
          //   return;
          // }

          const actual = (
            await objectSet.unionDiscriminantsIdentifiers({
              filter,
            })
          ).unsafeCoerce();
          expect(actual).toHaveLength(expected.length);
          for (let i = 0; i < expected.length; i++) {
            expect(expected[i].equals(actual[i]));
          }
        });
      }
    });
  });
}

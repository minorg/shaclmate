import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Decimal } from "decimal.js";
import { describe, it } from "vitest";
import * as kitchenSink from "../../src/index.js";
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
          kitchenSink.TermsStruct.createUnsafe({
            blankNodeTerm: dataFactory.blankNode(),
          }),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[1],
            stringTerm: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        present: [{ blankNodeTerm: {} }, [identifiers[0]]],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          if (objectSet instanceof kitchenSink.$SparqlObjectSet) {
            return;
          }

          const actual = (
            await objectSet.termsStructIdentifiers({
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
            kitchenSink.NumericsStruct.createUnsafe({
              $identifier: identifiers[i],
              decimalNumeric: new Decimal(i),
            }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            stringTerm: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ decimalNumeric: { in: [new Decimal(0)] } }, [identifiers[0]]],
        maxExclusive: [
          { decimalNumeric: { maxExclusive: new Decimal(1) } },
          [identifiers[0]],
        ],
        maxInclusive: [
          { decimalNumeric: { maxInclusive: new Decimal(0) } },
          [identifiers[0]],
        ],
        minExclusive: [
          { decimalNumeric: { minExclusive: new Decimal(0) } },
          [identifiers[1]],
        ],
        minInclusive: [
          { decimalNumeric: { minInclusive: new Decimal(0) } },
          [identifiers[0], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.NumericsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.numericsStructIdentifiers({
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
            kitchenSink.NumericsStruct.createUnsafe({
              $identifier: identifiers[i],
              integerNumeric: BigInt(i),
            }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            stringTerm: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ integerNumeric: { in: [0n] } }, [identifiers[0]]],
        maxExclusive: [
          { integerNumeric: { maxExclusive: 1n } },
          [identifiers[0]],
        ],
        maxInclusive: [
          { integerNumeric: { maxInclusive: 0n } },
          [identifiers[0]],
        ],
        minExclusive: [
          { integerNumeric: { minExclusive: 0n } },
          [identifiers[1]],
        ],
        minInclusive: [
          { integerNumeric: { minInclusive: 0n } },
          [identifiers[0], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.NumericsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.numericsStructIdentifiers({
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
            kitchenSink.TermsStruct.createUnsafe({
              $identifier: identifiers[i],
              booleanTerm: i === 0,
            }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            stringTerm: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        valueFalse: [{ booleanTerm: { value: false } }, [identifiers[1]]],
        valueTrue: [{ booleanTerm: { value: true } }, [identifiers[0]]],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
            kitchenSink.TermsStruct.createUnsafe({
              $identifier: identifiers[i],
              dateTimeTerm: new Date(baseValue.getTime() + i * 1000),
            }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            stringTerm: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ dateTimeTerm: { in: [baseValue] } }, [identifiers[0]]],
        maxExclusive: [
          {
            dateTimeTerm: {
              maxExclusive: new Date(baseValue.getTime() + 1000),
            },
          },
          [identifiers[0]],
        ],
        maxInclusive: [
          { dateTimeTerm: { maxInclusive: baseValue } },
          [identifiers[0]],
        ],
        minExclusive: [
          { dateTimeTerm: { minExclusive: baseValue } },
          [identifiers[1]],
        ],
        minInclusive: [
          { dateTimeTerm: { minInclusive: baseValue } },
          [identifiers[0], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: blankNodeIdentifier,
            stringTerm: "ignored",
          }),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: namedNodeIdentifier,
            stringTerm: "ignored",
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
        [kitchenSink.TermsStruct.Filter, readonly (BlankNode | NamedNode)[]]
      >)) {
        it(id, async ({ expect }) => {
          if (
            id === "typeBlankNode" &&
            objectSet instanceof kitchenSink.$SparqlObjectSet
          ) {
            return;
          }
          const actual = (
            await objectSet.termsStructIdentifiers({
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
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[0],
            literalTerm: dataFactory.literal("test"),
          }),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[1],
            literalTerm: dataFactory.literal("test", "en"),
          }),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            literalTerm: dataFactory.literal("1", xsd.integer),
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        datatypeIn: [
          { literalTerm: { datatypeIn: [xsd.integer] } },
          [identifiers[2]],
        ],
        in: [
          { literalTerm: { in: [dataFactory.literal("test")] } },
          [identifiers[0]],
        ],
        languageIn: [{ literalTerm: { languageIn: ["en"] } }, [identifiers[1]]],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
            kitchenSink.TermsStruct.createUnsafe({
              $identifier: identifiers[i],
              iriTerm: dataFactory.namedNode(`http://example.com/prop${i}`),
            }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            stringTerm: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [
          {
            iriTerm: {
              in: [dataFactory.namedNode("http://example.com/prop0")],
            },
          },
          [identifiers[0]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
            kitchenSink.TermsStruct.createUnsafe({
              $identifier: identifiers[i],
              numberTerm: i,
            }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            stringTerm: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ numberTerm: { in: [0] } }, [identifiers[0]]],
        maxExclusive: [{ numberTerm: { maxExclusive: 1 } }, [identifiers[0]]],
        maxInclusive: [{ numberTerm: { maxInclusive: 0 } }, [identifiers[0]]],
        minExclusive: [{ numberTerm: { minExclusive: 0 } }, [identifiers[1]]],
        minInclusive: [
          { numberTerm: { minInclusive: 0 } },
          [identifiers[0], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
            kitchenSink.TermsStruct.createUnsafe({
              $identifier: identifiers[i],
              stringTerm: `test${i}`,
            }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            numberTerm: 0,
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        identifier: [
          { $identifier: { in: [identifiers[1]] } },
          [identifiers[1]],
        ],
        string: [{ stringTerm: { in: ["test1"] } }, [identifiers[1]]],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
              ? kitchenSink.DiscriminatedUnionMember1.createUnsafe({
                  $identifier: identifiers[i],
                  discriminatedDiscriminatedUnionMember1Distinct: `test${i}`,
                  discriminatedUnionMemberCommon: `test${i}`,
                })
              : kitchenSink.DiscriminatedUnionMember2.createUnsafe({
                  $identifier: identifiers[i],
                  discriminatedDiscriminatedUnionMember2Distinct: `test${i}`,
                  discriminatedUnionMemberCommon: `test${i}`,
                }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            numberTerm: 0,
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
              DiscriminatedUnionMember1: {
                discriminatedUnionMemberCommon: { in: ["test0"] },
              },
              DiscriminatedUnionMember2: {
                discriminatedUnionMemberCommon: { in: ["test1"] },
              },
            },
          },
          [identifiers[0], identifiers[1]],
        ],
        onMember1Negative: [
          {
            on: {
              DiscriminatedUnionMember1: {
                discriminatedUnionMemberCommon: { in: ["test1"] },
              },
            },
          },
          [identifiers[1]],
        ],
        onMember1Positive: [
          {
            on: {
              DiscriminatedUnionMember1: {
                discriminatedUnionMemberCommon: { in: ["test0"] },
              },
            },
          },
          [identifiers[0], identifiers[1]],
        ],
        onMember2Negative: [
          {
            on: {
              DiscriminatedUnionMember2: {
                discriminatedUnionMemberCommon: { in: ["test0"] },
              },
            },
          },
          [identifiers[0]],
        ],
        onMember2Positive: [
          {
            on: {
              DiscriminatedUnionMember2: {
                discriminatedUnionMemberCommon: { in: ["test1"] },
              },
            },
          },
          [identifiers[1], identifiers[1]],
        ],
      } satisfies Record<
        string,
        [kitchenSink.Union.Filter, readonly NamedNode[]]
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
      const instance = kitchenSink.TermsStruct.createUnsafe({
        booleanTerm: true,
        $identifier: identifiers[0],
      });
      const objectSet = createObjectSet(objectDataset([instance]));

      for (const [id, [filter, expected]] of Object.entries({
        null1: [{ booleanTerm: null }, []],
        null2: [{ stringTerm: null }, [identifiers[0]]],
        nonNull1: [{ booleanTerm: {} }, [identifiers[0]]],
        nonNull2: [{ stringTerm: {} }, []],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
          kitchenSink.PropertyCardinalitiesStruct.createUnsafe({
            $identifier: identifiers[0],
            emptySet: [value],
            nonEmptySet: [value],
            required: value,
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        items: [{ emptySet: { in: [value] } }, [identifiers[0]]],
        ...(!(objectSet instanceof kitchenSink.$SparqlObjectSet)
          ? {
              maxCount0: [{ emptySet: { $maxCount: 0 } }, []],
              maxCount1: [{ emptySet: { $maxCount: 1 } }, [identifiers[0]]],
              minCount1: [{ emptySet: { $minCount: 1 } }, [identifiers[0]]],
              minCount2: [{ emptySet: { $minCount: 2 } }, []],
            }
          : {}),
      } satisfies Record<
        string,
        [kitchenSink.PropertyCardinalitiesStruct.Filter, readonly NamedNode[]]
      >))
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.propertyCardinalitiesStructIdentifiers({
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
            kitchenSink.TermsStruct.createUnsafe({
              $identifier: identifiers[i],
              stringTerm: "x".repeat(i + 1),
            }),
          ),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            numberTerm: 0,
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        in: [{ stringTerm: { in: ["x"] } }, [identifiers[0]]],
        maxLength: [{ stringTerm: { maxLength: 1 } }, [identifiers[0]]],
        minLength: [{ stringTerm: { maxLength: 1 } }, [identifiers[1]]],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[0],
            term: dataFactory.literal("test"),
          }),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[1],
            term: dataFactory.literal("test", "en"),
          }),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[2],
            term: dataFactory.literal("1", xsd.integer),
          }),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[3],
            term: dataFactory.namedNode("http://example.com"),
          }),
          kitchenSink.TermsStruct.createUnsafe({
            $identifier: identifiers[4],
            stringTerm: "test",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        datatypeIn: [{ term: { datatypeIn: [xsd.integer] } }, [identifiers[2]]],
        in: [{ term: { in: [dataFactory.literal("test")] } }, [identifiers[0]]],
        languageIn: [{ term: { languageIn: ["en"] } }, [identifiers[1]]],
        typeIn: [{ term: { typeIn: ["NamedNode"] } }, [identifiers[3]]],
      } satisfies Record<
        string,
        [kitchenSink.TermsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          const actual = (
            await objectSet.termsStructIdentifiers({
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
          kitchenSink.UnionDiscriminantsStruct.createUnsafe({
            $identifier: identifiers[0],
            requiredNodeOrNodeOrString: {
              type: "DiscriminatedUnionMember1",
              value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
                $identifier: dataFactory.namedNode(
                  "http://example.com/discriminatedDiscriminatedUnionMember1",
                ),
                discriminatedDiscriminatedUnionMember1Distinct:
                  "http://example.com/test0",
                discriminatedUnionMemberCommon: "http://example.com/test0",
              }),
            },
            requiredNodeOrLiteral: {
              termType: "DiscriminatedUnionMember1",
              value: kitchenSink.DiscriminatedUnionMember1.createUnsafe({
                $identifier: dataFactory.namedNode(
                  "http://example.com/discriminatedDiscriminatedUnionMember1",
                ),
                discriminatedDiscriminatedUnionMember1Distinct:
                  "http://example.com/test0",
                discriminatedUnionMemberCommon: "http://example.com/test0",
              }),
            },
            requiredIriOrLiteral: dataFactory.namedNode(
              "http://example.com/test0",
            ),
            requiredIriOrString: dataFactory.namedNode(
              "http://example.com/test0",
            ),
          }),
          kitchenSink.UnionDiscriminantsStruct.createUnsafe({
            $identifier: identifiers[1],
            requiredNodeOrNodeOrString: {
              type: "string",
              value: "http://example.com/test1",
            },
            requiredNodeOrLiteral: dataFactory.literal(
              "http://example.com/test1",
            ),
            requiredIriOrLiteral: dataFactory.literal(
              "http://example.com/test1",
            ),
            requiredIriOrString: "http://example.com/test1",
          }),
        ]),
      );

      for (const [id, [filter, expected]] of Object.entries({
        extrinsicPositive: [
          {
            requiredNodeOrNodeOrString: {
              on: {
                DiscriminatedUnionMember1: {
                  discriminatedDiscriminatedUnionMember1Distinct: {
                    in: ["http://example.com/test0"],
                  },
                },
                DiscriminatedUnionMember2: {
                  discriminatedDiscriminatedUnionMember2Distinct: {
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
            requiredNodeOrNodeOrString: {
              on: {
                DiscriminatedUnionMember1: {
                  discriminatedDiscriminatedUnionMember1Distinct: {
                    in: ["http://example.com/testx"],
                  },
                },
                DiscriminatedUnionMember2: {
                  discriminatedDiscriminatedUnionMember2Distinct: {
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
            requiredNodeOrLiteral: {
              on: {
                DiscriminatedUnionMember1: {
                  discriminatedDiscriminatedUnionMember1Distinct: {
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
            requiredNodeOrLiteral: {
              on: {
                DiscriminatedUnionMember1: {
                  discriminatedDiscriminatedUnionMember1Distinct: {
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
            requiredIriOrLiteral: {
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
            requiredIriOrLiteral: {
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
            requiredIriOrString: {
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
            requiredIriOrString: {
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
        [kitchenSink.UnionDiscriminantsStruct.Filter, readonly NamedNode[]]
      >)) {
        it(id, async ({ expect }) => {
          // if (id.endsWith("Negative")) {
          //   return;
          // }

          const actual = (
            await objectSet.unionDiscriminantsStructIdentifiers({
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
